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
  LeaderboardEntry,
} from '@gyromaze/shared';
import { useGameStore } from '@/store/useGameStore';

/**
 * Hem yerel geliştirme ortamında (localhost:4000) hem de tek portlu HTTPS tünellerinde
 * (server.mjs TCP_NODELAY WebSocket Proxy) kesintisiz çalışan sunucu adresi çözücü.
 */
function resolveSocketServerUrl(): string {
  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    return process.env.NEXT_PUBLIC_SOCKET_URL;
  }
  if (typeof window !== 'undefined') {
    const { protocol, hostname, origin } = window.location;
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
 * Masaüstü ve mobil istemciler için sıfır gecikmeli (<10ms) saf WebSocket bağlantı hook'u.
 */
export function useSocket({ role, targetRoomId }: UseSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const targetRoomIdRef = useRef<string | null>(targetRoomId ?? null);
  targetRoomIdRef.current = targetRoomId ?? null;

  const lastLatencyUpdateRef = useRef<number>(0);
  const lastEmitTimeRef = useRef<number>(0);
  const lastSentBetaRef = useRef<number>(999);
  const lastSentGammaRef = useRef<number>(999);

  const roomId = useGameStore((s) => s.roomId);
  const hapticSignal = useGameStore((s) => s.hapticSignal);
  const pendingScoreSubmission = useGameStore((s) => s.pendingScoreSubmission);
  const setRoomId = useGameStore((s) => s.setRoomId);
  const setLanIp = useGameStore((s) => s.setLanIp);
  const setTunnelUrl = useGameStore((s) => s.setTunnelUrl);
  const setSocketConnected = useGameStore((s) => s.setSocketConnected);
  const setControllerPaired = useGameStore((s) => s.setControllerPaired);
  const setLatencyMs = useGameStore((s) => s.setLatencyMs);
  const setErrorMessage = useGameStore((s) => s.setErrorMessage);
  const setLeaderboard = useGameStore((s) => s.setLeaderboard);
  const updateTransientGyro = useGameStore((s) => s.updateTransientGyro);
  const resetTransientGyro = useGameStore((s) => s.resetTransientGyro);
  const triggerBallReset = useGameStore((s) => s.triggerBallReset);
  const setGameStatus = useGameStore((s) => s.setGameStatus);

  useEffect(() => {
    const serverUrl = resolveSocketServerUrl();

    const socket = io(serverUrl, {
      path: '/socket.io/',
      // HTTP Long-Polling gecikmesini tamamen ortadan kaldırmak için doğrudan WebSocket ile bağlan
      transports: ['websocket', 'polling'],
      upgrade: true,
      rememberUpgrade: true,
      reconnectionAttempts: 20,
      reconnectionDelay: 500,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setSocketConnected(true);
      setErrorMessage(null);

      if (role === 'host') {
        socket.emit(RoomEvents.ROOM_CREATE);
      } else if (role === 'controller' && targetRoomIdRef.current) {
        socket.emit(RoomEvents.ROOM_JOIN, {
          roomId: targetRoomIdRef.current,
        });
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
        navigator.vibrate([35, 50, 65]);
      }
    });

    socket.on(RoomEvents.ROOM_CONTROLLER_DISCONNECTED, () => {
      setControllerPaired(false);
      resetTransientGyro();
    });

    socket.on(RoomEvents.ROOM_HOST_DISCONNECTED, () => {
      setControllerPaired(false);
      setErrorMessage(
        'Masaüstü oturumu yenilendi veya kapandı. Lütfen yeni 6 haneli oda kodunu girin.',
      );
    });

    socket.on(RoomEvents.ROOM_ERROR, (error: RoomErrorPayload) => {
      setErrorMessage(error.message);
      setControllerPaired(false);
    });

    if (role === 'host') {
      socket.on(RoomEvents.GYRO_SYNC, (data: GyroData) => {
        updateTransientGyro(data);

        const now = Date.now();
        if (now - lastLatencyUpdateRef.current > 300) {
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
          case 'crystal':
            navigator.vibrate([25, 30, 45]);
            break;
          case 'laser':
            navigator.vibrate([90, 30, 90]);
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

    socket.on(
      RoomEvents.LEADERBOARD_UPDATE,
      (entries: LeaderboardEntry[]) => {
        setLeaderboard(entries);
      },
    );

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [
    role,
    setRoomId,
    setLanIp,
    setTunnelUrl,
    setSocketConnected,
    setControllerPaired,
    setLatencyMs,
    setErrorMessage,
    setLeaderboard,
    updateTransientGyro,
    resetTransientGyro,
    triggerBallReset,
    setGameStatus,
  ]);

  // Mobil kontrolcüde hedef oda kodu değiştiğinde mevcut soketi koparmadan anında yeni odaya katıl
  useEffect(() => {
    if (role !== 'controller' || !targetRoomId) return;
    if (socketRef.current?.connected) {
      setErrorMessage(null);
      socketRef.current.emit(RoomEvents.ROOM_JOIN, { roomId: targetRoomId });
    }
  }, [role, targetRoomId, setErrorMessage]);

  useEffect(() => {
    if (role !== 'host' || !hapticSignal || !roomId) return;
    socketRef.current?.volatile.emit(RoomEvents.GAME_HAPTIC, {
      roomId,
      type: hapticSignal.type,
    });
  }, [role, hapticSignal, roomId]);

  useEffect(() => {
    if (role !== 'host' || !pendingScoreSubmission) return;
    socketRef.current?.emit(
      RoomEvents.LEADERBOARD_SUBMIT,
      pendingScoreSubmission,
    );
  }, [role, pendingScoreSubmission]);

  /**
   * 60Hz frekansında ve delta filtreli volatile WebSocket çerçevesi gönderir.
   * Açı değişmediyse gereksiz ağ paketi üretmez, mobil işlemci ve soket yükünü sıfırlar.
   */
  const emitGyroUpdate = useCallback((targetRoom: string, data: GyroData) => {
    if (!socketRef.current?.connected) return;
    const now = performance.now();
    const isZeroReset = data.beta === 0 && data.gamma === 0;

    if (!isZeroReset && now - lastEmitTimeRef.current < 15) return;

    const deltaBeta = Math.abs(data.beta - lastSentBetaRef.current);
    const deltaGamma = Math.abs(data.gamma - lastSentGammaRef.current);

    if (!isZeroReset && deltaBeta < 0.1 && deltaGamma < 0.1) {
      return;
    }

    lastEmitTimeRef.current = now;
    lastSentBetaRef.current = data.beta;
    lastSentGammaRef.current = data.gamma;

    socketRef.current.volatile.emit(RoomEvents.GYRO_UPDATE, {
      roomId: targetRoom,
      data,
    });
  }, []);

  /**
   * Mobil kontrolcünün soket bağlantısını koparmadan yeni bir 6 haneli oda koduna katılmasını sağlar.
   */
  const joinRoomByCode = useCallback(
    (code: string) => {
      const normalized = code.trim().toUpperCase();
      if (!normalized || !socketRef.current?.connected) return;
      setErrorMessage(null);
      socketRef.current.emit(RoomEvents.ROOM_JOIN, { roomId: normalized });
    },
    [setErrorMessage],
  );

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
    joinRoomByCode,
    emitCalibrate,
    emitResetBall,
  };
}
