import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { NestFactory } from '@nestjs/core';
import { io as createClient } from 'socket.io-client';
import { RoomEvents } from '@gyromaze/shared';
import { AppModule } from '../dist/app.module.js';

function waitForEvent(socket, eventName, predicate = () => true, timeoutMs = 4000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      socket.off(eventName, listener);
      reject(new Error(`Timeout waiting for event "${eventName}"`));
    }, timeoutMs);

    const listener = (payload) => {
      if (!predicate(payload)) return;
      clearTimeout(timer);
      socket.off(eventName, listener);
      resolve(payload);
    };

    socket.on(eventName, listener);
  });
}

function connectSocket(baseUrl) {
  return new Promise((resolve, reject) => {
    const client = createClient(baseUrl, {
      transports: ['websocket'],
      forceNew: true,
      reconnection: false,
    });
    const timer = setTimeout(() => {
      client.close();
      reject(new Error('Socket connection timeout'));
    }, 4000);

    client.once('connect', () => {
      clearTimeout(timer);
      resolve(client);
    });
    client.once('connect_error', (err) => {
      clearTimeout(timer);
      client.close();
      reject(err);
    });
  });
}

describe('GyroMaze Socket.IO E2E — Canlı NestJS WebSocket Entegrasyon Testleri', () => {
  let app;
  let baseUrl;
  const openClients = [];

  before(async () => {
    app = await NestFactory.create(AppModule, { logger: false });
    app.enableCors({ origin: '*' });
    await app.listen(0, '127.0.0.1');
    const addr = app.getHttpServer().address();
    baseUrl = `http://127.0.0.1:${addr.port}`;
  });

  after(async () => {
    for (const c of openClients) {
      try {
        c.disconnect();
      } catch {
        // Kapanış hatalarını yoksay
      }
    }
    if (app) {
      await app.close();
    }
  });

  it('canlı oda oluşturma, 1P/2P eşleşme, hedefli haptik, sekme devralma ve ev sahibi kopma akışını doğrular', async () => {
    const host = await connectSocket(baseUrl);
    const controller1 = await connectSocket(baseUrl);
    const controller2 = await connectSocket(baseUrl);
    openClients.push(host, controller1, controller2);

    // 1. Ev sahibi oda oluşturur ve başlangıç liderlik tablosunu alır
    const createdPromise = waitForEvent(host, RoomEvents.ROOM_CREATED);
    const initialLbPromise = waitForEvent(host, RoomEvents.LEADERBOARD_UPDATE);
    host.emit(RoomEvents.ROOM_CREATE);
    const createdRoom = await createdPromise;
    const initialLb = await initialLbPromise;

    assert.equal(createdRoom.roomId.length, 6);
    assert.ok(Array.isArray(initialLb) && initialLb.length >= 5);

    // 2. Küçük harfli kodla 1. ve 2. kontrolcüler odaya bağlanır
    const paired1Promise = waitForEvent(
      host,
      RoomEvents.ROOM_PAIRED,
      (r) => r.isControllerConnected && !r.isSecondControllerConnected,
    );
    controller1.emit(RoomEvents.ROOM_JOIN, {
      roomId: createdRoom.roomId.toLowerCase(),
      playerSlot: 1,
    });
    const paired1 = await paired1Promise;
    assert.equal(paired1.roomId, createdRoom.roomId);

    const paired2Promise = waitForEvent(
      host,
      RoomEvents.ROOM_PAIRED,
      (r) => r.isControllerConnected && r.isSecondControllerConnected,
    );
    controller2.emit(RoomEvents.ROOM_JOIN, {
      roomId: createdRoom.roomId,
      playerSlot: 2,
    });
    await paired2Promise;

    // 3. P1 sahte yuva göndermeye çalışsa dahi sunucu playerSlot=1 ve [-45, 45] sınırını zorlar
    const gyroSyncPromise = waitForEvent(host, RoomEvents.GYRO_SYNC);
    controller1.emit(RoomEvents.GYRO_UPDATE, {
      roomId: createdRoom.roomId,
      data: {
        alpha: 15,
        beta: 90,
        gamma: -80,
        timestamp: Date.now(),
        playerSlot: 2,
      },
    });
    const syncedGyro = await gyroSyncPromise;
    assert.equal(syncedGyro.playerSlot, 1);
    assert.equal(syncedGyro.beta, 45);
    assert.equal(syncedGyro.gamma, -45);

    // 4. Yalnız 2. oyuncuya gönderilen haptik 1. oyuncuya ulaşmamalı
    let c1GotBoost = false;
    const c1HapticSpy = (p) => {
      if (p?.type === 'boost') c1GotBoost = true;
    };
    controller1.on(RoomEvents.GAME_HAPTIC, c1HapticSpy);
    const c2BoostPromise = waitForEvent(
      controller2,
      RoomEvents.GAME_HAPTIC,
      (p) => p?.type === 'boost',
    );
    host.emit(RoomEvents.GAME_HAPTIC, {
      roomId: createdRoom.roomId,
      type: 'boost',
      playerSlot: 2,
    });
    await c2BoostPromise;
    await new Promise((r) => setTimeout(r, 80));
    controller1.off(RoomEvents.GAME_HAPTIC, c1HapticSpy);
    assert.equal(c1GotBoost, false);

    // 5. RTT gecikme ölçümü için ROOM_PING geri çağırımı çalışmalı
    const pingRes = await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('ROOM_PING timeout')), 2000);
      host.emit(RoomEvents.ROOM_PING, (ack) => {
        clearTimeout(timer);
        resolve(ack);
      });
    });
    assert.equal(typeof pingRes, 'number');
    assert.ok(pingRes > 0);

    // 5b. Kontrolcüden bölüm değiştirme ve top sıfırlama masaüstüne iletilmeli
    const changeLvlPromise = waitForEvent(host, RoomEvents.GAME_CHANGE_LEVEL);
    controller1.emit(RoomEvents.GAME_CHANGE_LEVEL, {
      roomId: createdRoom.roomId,
      direction: 'next',
    });
    const changedLvl = await changeLvlPromise;
    assert.equal(changedLvl.direction, 'next');

    const resetBallPromise = waitForEvent(host, RoomEvents.GAME_RESET_BALL);
    controller1.emit(RoomEvents.GAME_RESET_BALL);
    await resetBallPromise;

    // 6. Yeni sekme aynı odaya slot 1 olarak katıldığında eski sekme SESSION_REPLACED alır
    const takeoverTab = await connectSocket(baseUrl);
    openClients.push(takeoverTab);
    const replacedErrPromise = waitForEvent(
      controller1,
      RoomEvents.ROOM_ERROR,
      (err) => err?.code === 'SESSION_REPLACED',
    );
    const pairedTakeoverPromise = waitForEvent(takeoverTab, RoomEvents.ROOM_PAIRED);
    takeoverTab.emit(RoomEvents.ROOM_JOIN, {
      roomId: createdRoom.roomId,
      playerSlot: 1,
    });
    const [replacedErr] = await Promise.all([
      replacedErrPromise,
      pairedTakeoverPromise,
    ]);
    assert.equal(replacedErr.code, 'SESSION_REPLACED');

    // 7. Ev sahibi koptuğunda aktif kontrolcü ROOM_HOST_DISCONNECTED bildirimi alır
    const hostDiscPromise = waitForEvent(
      controller2,
      RoomEvents.ROOM_HOST_DISCONNECTED,
    );
    host.disconnect();
    const hostDiscPayload = await hostDiscPromise;
    assert.equal(hostDiscPayload.roomId, createdRoom.roomId);
  });

  it('/health ve /api/health uç noktaları canlı oda/kontrolcü sayılarını ve sistem durumunu döndürür', async () => {
    const initialRes = await fetch(`${baseUrl}/health`);
    assert.equal(initialRes.status, 200);
    const initialBody = await initialRes.json();
    assert.equal(initialBody.status, 'ok');
    assert.equal(initialBody.service, 'gyromaze-server');
    assert.equal(typeof initialBody.uptimeSeconds, 'number');
    assert.ok(initialBody.leaderboardEntries >= 1);
    const baselineRooms = initialBody.activeRooms;

    const host = await connectSocket(baseUrl);
    const controller = await connectSocket(baseUrl);
    openClients.push(host, controller);

    const createdPromise = waitForEvent(host, RoomEvents.ROOM_CREATED);
    host.emit(RoomEvents.ROOM_CREATE);
    const createdRoom = await createdPromise;

    const pairedPromise = waitForEvent(controller, RoomEvents.ROOM_PAIRED);
    controller.emit(RoomEvents.ROOM_JOIN, { roomId: createdRoom.roomId, playerSlot: 1 });
    await pairedPromise;

    const apiHealthRes = await fetch(`${baseUrl}/api/health`);
    assert.equal(apiHealthRes.status, 200);
    const apiHealthBody = await apiHealthRes.json();
    assert.equal(apiHealthBody.status, 'ok');
    assert.equal(apiHealthBody.activeRooms, baselineRooms + 1);
    assert.ok(apiHealthBody.connectedControllers >= 1);
    assert.equal('roomId' in apiHealthBody, false);
  });

  it('/api/leaderboard uç noktası küresel ve bölüm bazlı skor kayıtlarını JSON formatında döndürür', async () => {
    const allRes = await fetch(`${baseUrl}/api/leaderboard`);
    assert.equal(allRes.status, 200);
    const allBody = await allRes.json();
    assert.equal(typeof allBody.total, 'number');
    assert.equal(allBody.levelId, null);
    assert.ok(Array.isArray(allBody.entries));
    assert.ok(allBody.entries.length >= 1);

    const level1Res = await fetch(`${baseUrl}/api/leaderboard?level=1`);
    assert.equal(level1Res.status, 200);
    const level1Body = await level1Res.json();
    assert.equal(level1Body.levelId, 1);
    assert.ok(Array.isArray(level1Body.entries));
    for (const entry of level1Body.entries) {
      assert.equal(entry.levelId, 1);
    }

    const invalidRes = await fetch(`${baseUrl}/api/leaderboard?level=bad`);
    assert.equal(invalidRes.status, 200);
    const invalidBody = await invalidRes.json();
    assert.equal(invalidBody.levelId, null);
    assert.equal(invalidBody.total, allBody.total);
  });
});

