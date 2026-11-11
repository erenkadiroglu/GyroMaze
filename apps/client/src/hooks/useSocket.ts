'use client';

import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  RoomEvents,
  RoomState,
  GyroData,
  RoomErrorPayload,
  GameStatePayload,
  HapticPayload,
} from '@gyromaze/shared';
import { useGameStore } from '@/store/useGameStore';

/**
 * Hem yerel geliştirme ortamında (localhost:4000) hem de tek portlu HTTPS tünellerinde
 * (ngrok / cloudflared / Next.js /socket.io proxy) kesintisiz çalışan sunucu adresi çözücü.
 */
function resolveSocketServerUrl(): string {
  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    return process.env.NEXT_PUBLIC_SOCKET_URL;
  }
  if (typeof window !== 'undefined') {
    const { protocol, hostname, origin } = window.location;
    // HTTPS tüneli (ngrok vb.) veya uzak alan adı üzerinden girildiyse
    // Next.js /socket.io rewrite kuralı üzerinden aynı origin (tek port) kullan
    if (
      protocol === 'https:' ||
      (hostname !== 'localhost' && hostname !== '127.0.0.1')
    ) {
      return origin;
    }
    return `http://${hostname}:4000`;
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
 * Masaüstü ve mobil istemciler için Socket.io bağlantı, telemetri ve titreşim (haptic) hook'u.
 */
export function useSocket({ role, targetRoomId }: UseSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const lastLatencyUpdateRef = useRef<number>(0);
  const lastEmitTimeRef = useRef<number>(0);
  const isTunnelOrProxyRef = useRef<boolean>(false);

  const roomId = useGameStore((s) => s.roomId);
  const hapticSignal = useGameStore((s) => s.hapticSignal);
  const setRoomId = useGameStore((s) => s.setRoomId);
  const setLanIp = useGameStore((s) => s.setLanIp);
  const setTunnelUrl = useGameStore((s) => s.setTunnelUrl);
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
    const isTunnelOrProxy =
      typeof window !== 'undefined' && serverUrl === window.location.origin;
    isTunnelOrProxyRef.current = isTunnelOrProxy;

    const socket = io(serverUrl, {
      path: '/socket.io/',
      // Next.js rewrite proxy üzerinden (ngrok/tünel) bağlanırken HTTP polling kullanılır
      // (Next.js dev sunucusu ws:// upgrade isteklerini HMR için ayırdığından kopmayı önler)
      transports: isTunnelOrProxy ? ['polling'] : ['websocket', 'polling'],
      reconnectionAttempts: 15,
      reconnectionDelay: 1000,
      extraHeaders: {
        'ngrok-skip-browser-warning': 'true',
      },
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
      if (room.tunnelUrl) setTunnelUrl(room.tunnelUrl);
      setControllerPaired(room.isControllerConnected);
    });

    socket.on(RoomEvents.ROOM_PAIRED, (room: RoomState) => {
      setRoomId(room.roomId);
      if (room.lanIp) setLanIp(room.lanIp);
      if (room.tunnelUrl) setTunnelUrl(room.tunnelUrl);
      setControllerPaired(true);
      setErrorMessage(null);

      if (
        role === 'controller' &&
        typeof navigator !== 'undefined' &&
        'vibrate' in navigator
      ) {
        navigator.vibrate([40, 60, 80]);
      }
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
    } else if (role === 'controller') {
      socket.on(RoomEvents.GAME_HAPTIC, (payload: HapticPayload) => {
        if (typeof navigator === 'undefined' || !('vibrate' in navigator)) {
          return;
        }
        switch (payload.type) {
          case 'wall':
            navigator.vibrate(18);
            break;
          case 'hole':
            navigator.vibrate([70, 40, 110]);
            break;
          case 'goal':
            navigator.vibrate([50, 50, 50, 50, 140]);
            break;
          case 'calibrate':
            navigator.vibrate(30);
            break;
        }
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
    setLanIp,
    setTunnelUrl,
    setSocketConnected,
    setControllerPaired,
    setLatencyMs,
    setErrorMessage,
    updateTransientGyro,
    resetTransientGyro,
    triggerBallReset,
    setGameStatus,
  ]);

  // Masaüstünde oluşan fiziksel çarpışma/zafer sinyallerini mobil kontrolcüye ilet
  useEffect(() => {
    if (role !== 'host' || !hapticSignal || !roomId) return;
    socketRef.current?.emit(RoomEvents.GAME_HAPTIC, {
      roomId,
      type: hapticSignal.type,
    });
  }, [role, hapticSignal, roomId]);

  const emitGyroUpdate = useCallback((targetRoom: string, data: GyroData) => {
    if (!socketRef.current?.connected) return;
    const now = performance.now();
    const minInterval = isTunnelOrProxyRef.current ? 35 : 14;
    if (now - lastEmitTimeRef.current < minInterval) return;
    lastEmitTimeRef.current = now;

    socketRef.current.emit(RoomEvents.GYRO_UPDATE, {
      roomId: targetRoom,
      data,
    });
  }, []);

  const emitCalibrate = useCallback(() => {
    if (!socketRef.current?.connected) return;
    socketRef.current.emit(RoomEvents.GYRO_CALIBRATE);
  }, []);

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
