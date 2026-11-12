import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { RoomEvents } from '@gyromaze/shared';
import { RoomService, selectPreferredLanIp } from '../dist/gateway/room.service.js';
import { GyroGateway } from '../dist/gateway/gyro.gateway.js';

describe('RoomService — Oda Yönetimi, 6 Haneli Kod Eşleşmesi ve Skor Tablosu Testleri', () => {
  it('6 haneli, karışıklık yaratmayan karakterlerden oluşan benzersiz oda kodu üretmelidir', async () => {
    const service = new RoomService();
    const room = await service.createRoom('host-socket-1');

    assert.equal(typeof room.roomId, 'string');
    assert.equal(room.roomId.length, 6);
    assert.match(room.roomId, /^[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$/);
    assert.equal(room.hostSocketId, 'host-socket-1');
    assert.equal(room.isControllerConnected, false);
  });

  it('mobil kontrolcü 6 haneli oda kodu ile (küçük/büyük harf duyarsız) odaya katılabilmelidir', async () => {
    const service = new RoomService();
    const room = await service.createRoom('host-socket-2');

    const joinRes = service.joinRoom(
      `  ${room.roomId.toLowerCase()} `,
      'controller-socket-1',
    );

    assert.equal(joinRes.ok, true);
    if (joinRes.ok) {
      assert.equal(joinRes.room.roomId, room.roomId);
      assert.equal(joinRes.room.isControllerConnected, true);
      assert.equal(joinRes.room.controllerSocketId, 'controller-socket-1');
    }
  });

  it('aynı oda koduna yeni bir sekmeden girildiğinde eski kontrolcü soketini sorunsuz devralmalıdır', async () => {
    const service = new RoomService();
    const room = await service.createRoom('host-socket-3');

    service.joinRoom(room.roomId, 'controller-old');
    const takeoverRes = service.joinRoom(room.roomId, 'controller-new');

    assert.equal(takeoverRes.ok, true);
    if (takeoverRes.ok) {
      assert.equal(takeoverRes.room.controllerSocketId, 'controller-new');
      assert.equal(takeoverRes.replacedControllerSocketId, 'controller-old');
      assert.equal(service.getMembership('controller-old'), undefined);
      assert.deepEqual(service.getMembership('controller-new'), {
        roomId: room.roomId,
        role: 'controller',
      });
    }
  });

  it('kontrolcü başka bir oda koduna geçiş yaptığında önceki oda bilgisini döndürmelidir', async () => {
    const service = new RoomService();
    const roomA = await service.createRoom('host-A');
    const roomB = await service.createRoom('host-B');

    service.joinRoom(roomA.roomId, 'controller-mobile');
    const switchRes = service.joinRoom(roomB.roomId, 'controller-mobile');

    assert.equal(switchRes.ok, true);
    if (switchRes.ok) {
      assert.equal(switchRes.previousRoomId, roomA.roomId);
      assert.equal(switchRes.room.roomId, roomB.roomId);
      assert.equal(service.getRoom(roomA.roomId)?.isControllerConnected, false);
      assert.equal(service.getRoom(roomB.roomId)?.isControllerConnected, true);
    }
  });

  it('geçersiz oda kodu girildiğinde ROOM_NOT_FOUND hatası döndürmelidir', () => {
    const service = new RoomService();
    const res = service.joinRoom('ZZZZZZ', 'controller-x');

    assert.equal(res.ok, false);
    if (!res.ok) {
      assert.equal(res.error.code, 'ROOM_NOT_FOUND');
    }
  });

  it('küresel skor tablosuna yeni rekor eklendiğinde süreye göre küçükten büyüğe sıralamalıdır', () => {
    const service = new RoomService();
    const updated = service.submitScore({
      playerName: 'Eren Kadiroğlu',
      levelId: 1,
      timeSeconds: 7.3,
    });

    const level1Scores = updated.filter((item) => item.levelId === 1);
    assert.ok(level1Scores.length >= 2);
    assert.equal(level1Scores[0].timeSeconds, 7.3);
    assert.equal(level1Scores[0].playerName, 'Eren Kadiroğlu');
  });

  it('aynı odaya 1. Oyuncu ve 2. Oyuncu (Çok Oyunculu Mod) aynı anda bağlanabilmelidir', async () => {
    const service = new RoomService();
    const room = await service.createRoom('host-multi');

    const p1Res = service.joinRoom(room.roomId, 'phone-p1', 1);
    const p2Res = service.joinRoom(room.roomId, 'phone-p2', 2);

    assert.equal(p1Res.ok, true);
    assert.equal(p2Res.ok, true);
    if (p2Res.ok) {
      assert.equal(p2Res.room.isControllerConnected, true);
      assert.equal(p2Res.room.controllerSocketId, 'phone-p1');
      assert.equal(p2Res.room.isSecondControllerConnected, true);
      assert.equal(p2Res.room.secondControllerSocketId, 'phone-p2');
    }
  });

  it('çok oyunculu odadan 2. kontrolcü ayrıldığında 1. oyuncunun bağlantısı korunmalıdır', async () => {
    const service = new RoomService();
    const room = await service.createRoom('host-coop');

    service.joinRoom(room.roomId, 'phone-p1', 1);
    service.joinRoom(room.roomId, 'phone-p2', 2);

    const p2Leave = service.removeSocket('phone-p2');
    assert.ok(p2Leave);
    assert.equal(p2Leave.disconnectedRole, 'controller');
    assert.equal(p2Leave.remainingRoom?.isControllerConnected, true);
    assert.equal(p2Leave.remainingRoom?.isSecondControllerConnected, false);

    const p1Leave = service.removeSocket('phone-p1');
    assert.ok(p1Leave);
    assert.equal(p1Leave.remainingRoom?.isControllerConnected, false);
    assert.equal(p1Leave.remainingRoom?.isSecondControllerConnected, false);
  });

  it('RTT gecikme ölçümü için ROOM_PING olayı tanımlı olmalıdır', () => {
    assert.equal(RoomEvents.ROOM_PING, 'room:ping');
  });

  it('GyroGateway hedefli haptik yönlendirmesi yalnız ilgili yuva cihazına ve ortak olayları tümüne iletmelidir', async () => {
    const service = new RoomService();
    const room = await service.createRoom('host-haptic');
    service.joinRoom(room.roomId, 'ctrl-1', 1);
    service.joinRoom(room.roomId, 'ctrl-2', 2);

    const emitted = [];
    const gateway = new GyroGateway(service);
    gateway.server = {
      to(target) {
        return {
          volatile: {
            emit(event, payload) {
              emitted.push({ target, event, payload });
            },
          },
        };
      },
    };

    const hostClient = { id: 'host-haptic' };

    gateway.handleGameHaptic(hostClient, {
      roomId: room.roomId,
      type: 'wall',
      playerSlot: 2,
    });
    assert.equal(emitted.length, 1);
    assert.equal(emitted[0].target, 'ctrl-2');
    assert.equal(emitted[0].event, RoomEvents.GAME_HAPTIC);

    gateway.handleGameHaptic(hostClient, {
      roomId: room.roomId,
      type: 'goal',
    });
    assert.equal(emitted.length, 3);
    assert.deepEqual(
      emitted.slice(1).map((item) => item.target),
      ['ctrl-1', 'ctrl-2'],
    );
    assert.equal(typeof gateway.handlePing(), 'number');
  });

  it('GyroGateway yeni sekme devralmada eski sokete SESSION_REPLACED hatası göndermeli, yetkisiz gyro paketlerini yok saymalı ve kalibrasyonu yuva bazlı iletmelidir', async () => {
    const service = new RoomService();
    const room = await service.createRoom('host-takeover');

    const sentEvents = [];
    const leftRooms = [];
    const oldSocket = {
      id: 'ctrl-old',
      async join() {},
      async leave(id) {
        leftRooms.push({ socketId: 'ctrl-old', roomId: id });
      },
      emit(event, payload) {
        sentEvents.push({ target: 'ctrl-old', event, payload });
      },
    };
    const newSocket = {
      id: 'ctrl-new',
      async join() {},
      async leave() {},
      emit(event, payload) {
        sentEvents.push({ target: 'ctrl-new', event, payload });
      },
    };
    const p2Socket = {
      id: 'ctrl-p2',
      async join() {},
      async leave() {},
      emit(event, payload) {
        sentEvents.push({ target: 'ctrl-p2', event, payload });
      },
    };

    const gateway = new GyroGateway(service);
    gateway.server = {
      sockets: {
        sockets: new Map([
          ['ctrl-old', oldSocket],
          ['ctrl-new', newSocket],
          ['ctrl-p2', p2Socket],
        ]),
      },
      to(target) {
        return {
          emit(event, payload) {
            sentEvents.push({ target, event, payload });
          },
          volatile: {
            emit(event, payload) {
              sentEvents.push({ target, event, payload });
            },
          },
        };
      },
    };

    await gateway.handleJoinRoom(oldSocket, { roomId: room.roomId, playerSlot: 1 });
    await gateway.handleJoinRoom(newSocket, { roomId: room.roomId, playerSlot: 1 });
    await gateway.handleJoinRoom(p2Socket, { roomId: room.roomId, playerSlot: 2 });

    assert.deepEqual(leftRooms, [{ socketId: 'ctrl-old', roomId: room.roomId }]);
    const replacedErr = sentEvents.find(
      (e) => e.target === 'ctrl-old' && e.event === RoomEvents.ROOM_ERROR,
    );
    assert.equal(replacedErr?.payload?.code, 'SESSION_REPLACED');

    const beforeGyroCount = sentEvents.length;
    gateway.handleGyroUpdate(oldSocket, {
      roomId: room.roomId,
      data: { alpha: 0, beta: 10, gamma: 5, timestamp: 123 },
    });
    assert.equal(sentEvents.length, beforeGyroCount);

    gateway.handleGyroCalibrate(p2Socket);
    const calEvent = sentEvents.find(
      (e) => e.target === 'host-takeover' && e.event === RoomEvents.GYRO_CALIBRATE,
    );
    assert.deepEqual(calEvent?.payload, { playerSlot: 2 });
  });

  it('submitScore geçersiz süre veya özel harita kimliklerini (NaN, <=0, 99) reddetmelidir', () => {
    const service = new RoomService();
    const initialCount = service.getLeaderboard().length;

    service.submitScore({ playerName: 'Test', levelId: 1, timeSeconds: Number.NaN });
    service.submitScore({ playerName: 'Test', levelId: 1, timeSeconds: -3 });
    service.submitScore({ playerName: 'Test', levelId: 99, timeSeconds: 5.5 });
    service.submitScore({ playerName: 'Test', levelId: 0, timeSeconds: 5.5 });

    assert.equal(service.getLeaderboard().length, initialCount);
  });

  it('GyroGateway oda dışı sahte haptik, durum ve bölüm değiştirme isteklerini reddetmelidir', async () => {
    const service = new RoomService();
    const room = await service.createRoom('host-auth');
    service.joinRoom(room.roomId, 'ctrl-auth', 1);

    const emitted = [];
    const gateway = new GyroGateway(service);
    gateway.server = {
      to(target) {
        return {
          emit(event, payload) {
            emitted.push({ target, event, payload });
          },
          volatile: {
            emit(event, payload) {
              emitted.push({ target, event, payload });
            },
          },
        };
      },
    };

    const intruder = { id: 'rogue-socket' };
    const host = { id: 'host-auth' };
    const controller = { id: 'ctrl-auth' };

    gateway.handleGameHaptic(intruder, { roomId: room.roomId, type: 'goal' });
    gateway.handleGameHaptic(controller, { roomId: room.roomId, type: 'goal' });
    gateway.handleGameStateChange(intruder, { roomId: room.roomId, status: 'won' });
    gateway.handleChangeLevel(intruder, { roomId: room.roomId, direction: 'next' });
    gateway.handleChangeLevel(host, { roomId: room.roomId, direction: 'next' });
    assert.equal(emitted.length, 0);

    gateway.handleGameStateChange(host, { roomId: room.roomId, status: 'playing', level: 2 });
    assert.equal(emitted.length, 1);
    assert.equal(emitted[0].target, 'ctrl-auth');
    assert.equal(emitted[0].event, RoomEvents.GAME_STATE_CHANGE);

    gateway.handleChangeLevel(controller, { roomId: room.roomId, direction: 'next' });
    assert.equal(emitted.length, 2);
    assert.equal(emitted[1].target, 'host-auth');
    assert.equal(emitted[1].event, RoomEvents.GAME_CHANGE_LEVEL);
  });

  it('selectPreferredLanIp sanal WSL/Hyper-V adaptörleri ve link-local adresler yerine fiziksel LAN IP seçmelidir', () => {
    const makeNet = (address, internal = false) => ({
      address,
      netmask: '255.255.255.0',
      family: 'IPv4',
      mac: '00:00:00:00:00:00',
      internal,
      cidr: `${address}/24`,
    });

    const chosen = selectPreferredLanIp({
      Loopback: [makeNet('127.0.0.1', true)],
      'vEthernet (WSL)': [makeNet('172.24.80.1')],
      docker0: [makeNet('172.17.0.1')],
      'Ethernet LinkLocal': [makeNet('169.254.44.10')],
      'Wi-Fi': [makeNet('192.168.1.42')],
    });
    assert.equal(chosen, '192.168.1.42');

    const onlyLinkLocal = selectPreferredLanIp({
      Ethernet: [makeNet('169.254.10.20')],
      Loopback: [makeNet('127.0.0.1', true)],
    });
    assert.equal(onlyLinkLocal, undefined);
  });

  it('submitScore 1 saniye altındaki geçerli rekor sürelerini (0.8 sn) yuvarlayarak korumalıdır', () => {
    const service = new RoomService();
    const updated = service.submitScore({
      playerName: 'Hızlı Tur',
      levelId: 2,
      timeSeconds: 0.84,
    });
    const record = updated.find((r) => r.playerName === 'Hızlı Tur');
    assert.ok(record);
    assert.equal(record.timeSeconds, 0.8);

    const beforeInvalid = service.getLeaderboard().length;
    service.submitScore({
      playerName: 'Süre Aşımı',
      levelId: 2,
      timeSeconds: 9999,
    });
    assert.equal(service.getLeaderboard().length, beforeInvalid);
  });

  it('GyroGateway skor gönderimini yalnız doğrulanmış masaüstü (host) soketleri için kabul etmelidir', async () => {
    const service = new RoomService();
    const room = await service.createRoom('host-score');
    service.joinRoom(room.roomId, 'ctrl-score', 1);

    const broadcasts = [];
    const gateway = new GyroGateway(service);
    gateway.server = {
      emit(event, payload) {
        broadcasts.push({ event, payload });
      },
    };

    gateway.handleSubmitScore(
      { id: 'rogue-client' },
      { playerName: 'Sahte Bot', levelId: 1, timeSeconds: 0.2 },
    );
    gateway.handleSubmitScore(
      { id: 'ctrl-score' },
      { playerName: 'Sahte Kontrolcü', levelId: 1, timeSeconds: 0.3 },
    );
    assert.equal(broadcasts.length, 0);

    gateway.handleSubmitScore(
      { id: 'host-score' },
      { playerName: 'Doğrulanmış Ev Sahibi', levelId: 3, timeSeconds: 11.2 },
    );
    assert.equal(broadcasts.length, 1);
    assert.equal(broadcasts[0].event, RoomEvents.LEADERBOARD_UPDATE);
    assert.ok(
      broadcasts[0].payload.some(
        (entry) =>
          entry.playerName === 'Doğrulanmış Ev Sahibi' &&
          entry.levelId === 3 &&
          entry.timeSeconds === 11.2,
      ),
    );
  });

  it('pruneExpiredRooms süresi dolan odaları ve bağlı soket üyeliklerini temizlemelidir', async () => {
    const service = new RoomService();
    const staleRoom = await service.createRoom('stale-host');
    service.joinRoom(staleRoom.roomId, 'stale-ctrl', 1);
    const freshRoom = await service.createRoom('fresh-host');

    staleRoom.createdAt = Date.now() - 13 * 60 * 60 * 1000;
    const prunedCount = service.pruneExpiredRooms();

    assert.equal(prunedCount, 1);
    assert.equal(service.getRoom(staleRoom.roomId), undefined);
    assert.equal(service.getMembership('stale-host'), undefined);
    assert.equal(service.getMembership('stale-ctrl'), undefined);
    assert.ok(service.getRoom(freshRoom.roomId));
  });

  it('GyroGateway handleGyroUpdate NaN/Infinity açılarını elemeli ve aşırı eğimleri [-45, 45] içine sınırlamalıdır', async () => {
    const service = new RoomService();
    const room = await service.createRoom('host-gyro');
    service.joinRoom(room.roomId, 'ctrl-gyro', 2);

    const relayed = [];
    const gateway = new GyroGateway(service);
    gateway.server = {
      to(targetId) {
        return {
          volatile: {
            emit(event, payload) {
              relayed.push({ targetId, event, payload });
            },
          },
        };
      },
    };

    gateway.handleGyroUpdate(
      { id: 'ctrl-gyro' },
      { roomId: room.roomId, data: { alpha: 0, beta: Number.NaN, gamma: 10, timestamp: 1 } },
    );
    gateway.handleGyroUpdate(
      { id: 'ctrl-gyro' },
      { roomId: room.roomId, data: { alpha: 0, beta: 5, gamma: Number.POSITIVE_INFINITY, timestamp: 1 } },
    );
    assert.equal(relayed.length, 0);

    gateway.handleGyroUpdate(
      { id: 'ctrl-gyro' },
      { roomId: room.roomId, data: { alpha: Number.NaN, beta: 90, gamma: -120, timestamp: 1234 } },
    );
    assert.equal(relayed.length, 1);
    assert.equal(relayed[0].targetId, 'host-gyro');
    assert.equal(relayed[0].event, RoomEvents.GYRO_SYNC);
    assert.deepEqual(relayed[0].payload, {
      alpha: 0,
      beta: 45,
      gamma: -45,
      timestamp: 1234,
      playerSlot: 2,
    });
  });
});

