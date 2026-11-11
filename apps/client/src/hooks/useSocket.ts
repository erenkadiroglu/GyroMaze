'use client';

import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  RoomEvents,
  RoomState,
  GyroData,
  RoomErrorPayload,
  GameStatePayload,
} from '@gyromaze/shared';
import { useGameStore } from '@/store/useGameStore';

/**
 * Yerel ağdaki (LAN) mobil cihazların da sunucuya erişebilmesi için
 * dinamik olarak WebSocket sunucu adresini belirler.
 */
function resolveSocketServerUrl(): string {
  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    return process.env.NEXT_PUBLIC_SOCKET_URL;
  }
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
    const host = window.location.hostname;
    return `${protocol}//${host}:4000`;
  }
  return 'http://localhost:4000';
}

interface UseSocketOptions {
  /** İstemci rolü: 'host' (Masaüstü 3B Sahne) veya 'controller' (Mobil Jiroskop) */
  role: 'host' | 'controller';
  /** Mobil kontrolcü için bağlanılacak hedef oda kodu */
  targetRoomId?: string | null;
}

/**
 * Masaüstü ve mobil istemciler için Socket.io bağlantı ve olay yönetim hook'u.
 */
export function useSocket({ role, targetRoomId }: UseSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const lastLatencyUpdateRef = useRef<number>(0);

  const setRoomId = useGameStore((s) => s.setRoomId);
  const setLanIp = useGameStore((s) => s.setLanIp);
  const setSocketConnected = useGameStore((s) => s.setSocketConnected);
  const setControllerPaired = useGameStore((s) => s.setControllerPaired);
  const setLatencyMs = useGameStore((s) => s.setLatencyMs);
  const setErrorMessage = useGameStore((s) => s.setErrorMessage);
  const updateTransientGyro = useGameStore((s) => s.updateTransientGyro);
  const resetTransientGyro = useGameStore((s) => s.resetTransientGyro);
  const triggerBallReset = useGameStore((s) => s.triggerBallReset);
  const setGameStatus = useGameStore((s) => s.setGameStatus);

  useEffect(() => {
    const serverUrl = resolveSocketServerUrl();
    const socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setSocketConnected(true);
      setErrorMessage(null);

      if (role === 'host') {
        socket.emit(RoomEvents.ROOM_CREATE);
      } else if (role === 'controller' && targetRoomId) {
        socket.emit(RoomEvents.ROOM_JOIN, { roomId: targetRoomId });
      }
    });

    socket.on('disconnect', () => {
      setSocketConnected(false);
      if (role === 'controller') {
        setControllerPaired(false);
      }
    });

    socket.on(RoomEvents.ROOM_CREATED, (room: RoomState) => {
      setRoomId(room.roomId);
      if (room.lanIp) setLanIp(room.lanIp);
      setControllerPaired(room.isControllerConnected);
    });

    socket.on(RoomEvents.ROOM_PAIRED, (room: RoomState) => {
      setRoomId(room.roomId);
      if (room.lanIp) setLanIp(room.lanIp);
      setControllerPaired(true);
      setErrorMessage(null);
    });

    socket.on(RoomEvents.ROOM_CONTROLLER_DISCONNECTED, () => {
      setControllerPaired(false);
      resetTransientGyro();
    });

    socket.on(RoomEvents.ROOM_HOST_DISCONNECTED, () => {
      setControllerPaired(false);
      setErrorMessage('Masaüstü oturumu sonlandırıldı.');
    });

    socket.on(RoomEvents.ROOM_ERROR, (error: RoomErrorPayload) => {
      setErrorMessage(error.message);
      setControllerPaired(false);
    });

    if (role === 'host') {
      socket.on(RoomEvents.GYRO_SYNC, (data: GyroData) => {
        updateTransientGyro(data);

        // UI re-render yükünü önlemek için gecikme göstergesini saniyede en fazla 4 kez güncelle
        const now = Date.now();
        if (now - lastLatencyUpdateRef.current > 250) {
          lastLatencyUpdateRef.current = now;
          const estimatedLatency = Math.max(
            1,
            Math.min(99, Math.abs(now - data.timestamp)),
          );
          setLatencyMs(estimatedLatency);
        }
      });

      socket.on(RoomEvents.GYRO_CALIBRATE, () => {
        resetTransientGyro();
      });
    }

    socket.on(RoomEvents.GAME_RESET_BALL, () => {
      resetTransientGyro();
      triggerBallReset();
    });

    socket.on(RoomEvents.GAME_STATE_CHANGE, (payload: GameStatePayload) => {
      setGameStatus(payload.status);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [
    role,
    targetRoomId,
    setRoomId,
    setSocketConnected,
    setControllerPaired,
    setLatencyMs,
    setErrorMessage,
    updateTransientGyro,
    resetTransientGyro,
    triggerBallReset,
    setGameStatus,
  ]);

  /**
   * Mobil kontrolcüden anlık jiroskop verisini sunucuya gönderir.
   */
  const emitGyroUpdate = useCallback(
    (roomId: string, data: GyroData) => {
      if (!socketRef.current?.connected) return;
      socketRef.current.emit(RoomEvents.GYRO_UPDATE, { roomId, data });
    },
    [],
  );

  /**
   * Mobil kontrolcüden kalibrasyon sinyali gönderir.
   */
  const emitCalibrate = useCallback(() => {
    if (!socketRef.current?.connected) return;
    socketRef.current.emit(RoomEvents.GYRO_CALIBRATE);
  }, []);

  /**
   * Topu başlangıç noktasına sıfırlama sinyali gönderir.
   */
  const emitResetBall = useCallback(() => {
    if (!socketRef.current?.connected) return;
    socketRef.current.emit(RoomEvents.GAME_RESET_BALL);
  }, []);

  return {
    emitGyroUpdate,
    emitCalibrate,
    emitResetBall,
  };
}

