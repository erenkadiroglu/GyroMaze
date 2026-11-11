import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { RoomEvents } from '@gyromaze/shared';
import { RoomService } from '../dist/gateway/room.service.js';

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
});

