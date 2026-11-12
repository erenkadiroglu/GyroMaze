'use client';

import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  RoomEvents,
  RoomState,
  GyroData,
  RoomErrorPayload,
  GameStatePayload,
  ChangeLevelPayload,
  HapticPayload,
  CalibratePayload,
  LeaderboardEntry,
} from '@gyromaze/shared';
import { useGameStore } from '@/store/useGameStore';
import { getMazeLevel } from '@/components/scene/mazeLevels';

const HAPTIC_PATTERNS: Record<HapticPayload['type'], VibratePattern> = {
  wall: 18,
  hole: [70, 40, 110],
  goal: [50, 50, 50, 50, 140],
  calibrate: 30,
  crystal: [25, 30, 45],
  laser: [90, 30, 90],
  boost: [30, 20, 40],
  teleport: [20, 40, 20, 40, 60],
};

function triggerDeviceVibrate(pattern: VibratePattern): void {
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') {
    return;
  }
  try {
    navigator.vibrate(pattern);
  } catch {
    // WebView veya tarayıcı titreşim kısıtını sessizce yoksay
  }
}

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
    const isLoopback =
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '::1' ||
      hostname === '[::1]';
    if (protocol === 'https:' || !isLoopback) {
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
  /** Çok oyunculu modda mobil kontrolcünün oyuncu yuvası (1 veya 2) */
  playerSlot?: 1 | 2;
}

/**
 * Masaüstü ve mobil istemciler için sıfır gecikmeli (<10ms) saf WebSocket bağlantı hook'u.
 */
export function useSocket({
  role,
  targetRoomId,
  playerSlot = 1,
}: UseSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const targetRoomIdRef = useRef<string | null>(targetRoomId ?? null);
  targetRoomIdRef.current = targetRoomId ?? null;
  const playerSlotRef = useRef<1 | 2>(playerSlot);
  playerSlotRef.current = playerSlot;

  const lastEmitTimeRef = useRef<number>(0);
  const lastSentBetaRef = useRef<number>(999);
  const lastSentGammaRef = useRef<number>(999);

  const roomId = useGameStore((s) => s.roomId);
  const gameStatus = useGameStore((s) => s.gameStatus);
  const level = useGameStore((s) => s.level);
  const customLevel = useGameStore((s) => s.customLevel);
  const collectedCrystals = useGameStore((s) => s.collectedCrystals);
  const isSocketConnected = useGameStore((s) => s.isSocketConnected);
  const isControllerPaired = useGameStore((s) => s.isControllerPaired);
  const isSecondControllerPaired = useGameStore(
    (s) => s.isSecondControllerPaired,
  );
  const hapticSignal = useGameStore((s) => s.hapticSignal);
  const pendingScoreSubmission = useGameStore((s) => s.pendingScoreSubmission);
  const setRoomId = useGameStore((s) => s.setRoomId);
  const setLanIp = useGameStore((s) => s.setLanIp);
  const setTunnelUrl = useGameStore((s) => s.setTunnelUrl);
  const setSocketConnected = useGameStore((s) => s.setSocketConnected);
  const setControllerPaired = useGameStore((s) => s.setControllerPaired);
  const setSecondControllerPaired = useGameStore(
    (s) => s.setSecondControllerPaired,
  );
  const setLatencyMs = useGameStore((s) => s.setLatencyMs);
  const setErrorMessage = useGameStore((s) => s.setErrorMessage);
  const setLeaderboard = useGameStore((s) => s.setLeaderboard);
  const submitLeaderboardScore = useGameStore((s) => s.submitLeaderboardScore);
  const updateTransientGyro = useGameStore((s) => s.updateTransientGyro);
  const resetTransientGyro = useGameStore((s) => s.resetTransientGyro);
  const triggerBallReset = useGameStore((s) => s.triggerBallReset);
  const setGameStatus = useGameStore((s) => s.setGameStatus);
  const setLevel = useGameStore((s) => s.setLevel);
  const nextLevel = useGameStore((s) => s.nextLevel);
  const prevLevel = useGameStore((s) => s.prevLevel);
  const setRemoteProgress = useGameStore((s) => s.setRemoteProgress);

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
          playerSlot: playerSlotRef.current,
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
      setLanIp(room.lanIp ?? null);
      setTunnelUrl(room.tunnelUrl ?? null);
      setControllerPaired(room.isControllerConnected);
      setSecondControllerPaired(Boolean(room.isSecondControllerConnected));
    });

    socket.on(RoomEvents.ROOM_PAIRED, (room: RoomState) => {
      setRoomId(room.roomId);
      setLanIp(room.lanIp ?? null);
      setTunnelUrl(room.tunnelUrl ?? null);
      if (role === 'host') {
        setControllerPaired(Boolean(room.isControllerConnected));
        setSecondControllerPaired(Boolean(room.isSecondControllerConnected));
        if (!room.isControllerConnected) {
          resetTransientGyro(1);
        }
        if (!room.isSecondControllerConnected) {
          resetTransientGyro(2);
        }
        // Yeni veya yeniden bağlanan her kontrolcüye mevcut masaüstü durumunu anında gönder
        const snap = useGameStore.getState();
        const currentLvl = getMazeLevel(snap.level, snap.customLevel);
        socket.emit(RoomEvents.GAME_STATE_CHANGE, {
          roomId: room.roomId,
          status: snap.gameStatus,
          level: currentLvl.id,
          crystalsCollected: snap.collectedCrystals.length,
          crystalsTotal: currentLvl.crystals.length,
        });
      } else {
        setControllerPaired(true);
        lastEmitTimeRef.current = 0;
        lastSentBetaRef.current = 999;
        lastSentGammaRef.current = 999;
      }
      setErrorMessage(null);

      if (role === 'controller') {
        triggerDeviceVibrate([35, 50, 65]);
      }
    });

    socket.on(
      RoomEvents.ROOM_CONTROLLER_DISCONNECTED,
      (remainingRoom?: RoomState) => {
        if (role === 'host' && remainingRoom) {
          setControllerPaired(Boolean(remainingRoom.isControllerConnected));
          setSecondControllerPaired(
            Boolean(remainingRoom.isSecondControllerConnected),
          );
          // Yalnızca ayrılan oyuncunun geçici jiroskop tamponunu sıfırla
          if (
            !remainingRoom.isControllerConnected &&
            !remainingRoom.isSecondControllerConnected
          ) {
            resetTransientGyro();
          } else if (!remainingRoom.isControllerConnected) {
            resetTransientGyro(1);
          } else if (!remainingRoom.isSecondControllerConnected) {
            resetTransientGyro(2);
          }
        } else {
          setControllerPaired(false);
          setSecondControllerPaired(false);
          resetTransientGyro();
        }
      },
    );

    socket.on(RoomEvents.ROOM_HOST_DISCONNECTED, () => {
      setControllerPaired(false);
      setErrorMessage(
        'Masaüstü oturumu yenilendi veya kapandı. Lütfen yeni 6 haneli oda kodunu girin.',
      );
    });

    socket.on(RoomEvents.ROOM_ERROR, (error: RoomErrorPayload) => {
      setErrorMessage(error.message);
      if (role === 'controller') {
        setControllerPaired(false);
      }
    });

    if (role === 'host') {
      socket.on(RoomEvents.GYRO_SYNC, (data: GyroData) => {
        updateTransientGyro(data);
      });

      socket.on(
        RoomEvents.GYRO_CALIBRATE,
        (payload?: CalibratePayload) => {
          resetTransientGyro(payload?.playerSlot);
        },
      );

      socket.on(
        RoomEvents.GAME_CHANGE_LEVEL,
        (payload: ChangeLevelPayload) => {
          resetTransientGyro();
          if (payload.direction === 'next') {
            nextLevel();
          } else if (payload.direction === 'prev') {
            prevLevel();
          } else if (typeof payload.level === 'number') {
            setLevel(payload.level);
          }
        },
      );
    } else if (role === 'controller') {
      socket.on(RoomEvents.GAME_HAPTIC, (payload: HapticPayload) => {
        if (!payload?.type) {
          return;
        }
        const pattern = HAPTIC_PATTERNS[payload.type];
        if (pattern !== undefined) {
          triggerDeviceVibrate(pattern);
        }
      });
    }

    socket.on(RoomEvents.GAME_RESET_BALL, () => {
      resetTransientGyro();
      triggerBallReset();
    });

    socket.on(RoomEvents.GAME_STATE_CHANGE, (payload: GameStatePayload) => {
      if (role === 'controller') {
        setRemoteProgress(payload);
      } else {
        setGameStatus(payload.status);
      }
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
    setSecondControllerPaired,
    setErrorMessage,
    setLeaderboard,
    updateTransientGyro,
    resetTransientGyro,
    triggerBallReset,
    setGameStatus,
    setLevel,
    nextLevel,
    prevLevel,
    setRemoteProgress,
  ]);

  // Masaüstündeki bölüm, oyun durumu ve kristal ilerlemesini mobil kontrolcüye senkronize et
  useEffect(() => {
    if (
      role !== 'host' ||
      !roomId ||
      (!isControllerPaired && !isSecondControllerPaired)
    ) {
      return;
    }
    const currentLvl = getMazeLevel(level, customLevel);

    socketRef.current?.emit(RoomEvents.GAME_STATE_CHANGE, {
      roomId,
      status: gameStatus,
      level: currentLvl.id,
      crystalsCollected: collectedCrystals.length,
      crystalsTotal: currentLvl.crystals.length,
    });
  }, [
    role,
    roomId,
    isControllerPaired,
    isSecondControllerPaired,
    gameStatus,
    level,
    customLevel,
    collectedCrystals.length,
  ]);

  // Cihaz saati farkından bağımsız gerçek gidiş-dönüş (RTT) gecikme ölçümü
  useEffect(() => {
    if (role !== 'host' || !isSocketConnected) return;

    const measurePing = () => {
      const sock = socketRef.current;
      if (!sock?.connected) return;
      const sentAt = performance.now();
      sock.emit(RoomEvents.ROOM_PING, () => {
        const rtt = Math.max(1, Math.min(999, Math.round(performance.now() - sentAt)));
        setLatencyMs(rtt);
      });
    };

    measurePing();
    const timer = window.setInterval(measurePing, 2000);
    return () => window.clearInterval(timer);
  }, [role, isSocketConnected, setLatencyMs]);

  // Mobil kontrolcüde hedef oda kodu veya oyuncu yuvası değiştiğinde mevcut soketi koparmadan anında katıl
  useEffect(() => {
    if (role !== 'controller' || !targetRoomId) return;
    if (socketRef.current?.connected) {
      lastEmitTimeRef.current = 0;
      lastSentBetaRef.current = 999;
      lastSentGammaRef.current = 999;
      setErrorMessage(null);
      socketRef.current.emit(RoomEvents.ROOM_JOIN, {
        roomId: targetRoomId,
        playerSlot,
      });
    }
  }, [role, targetRoomId, playerSlot, setErrorMessage]);

  useEffect(() => {
    if (role !== 'host' || !hapticSignal || !roomId) return;
    socketRef.current?.volatile.emit(RoomEvents.GAME_HAPTIC, {
      roomId,
      type: hapticSignal.type,
      playerSlot: hapticSignal.playerSlot,
    });
  }, [role, hapticSignal, roomId]);

  useEffect(() => {
    if (
      role !== 'host' ||
      !roomId ||
      !pendingScoreSubmission ||
      !isSocketConnected ||
      !socketRef.current?.connected
    ) {
      return;
    }
    socketRef.current.emit(
      RoomEvents.LEADERBOARD_SUBMIT,
      pendingScoreSubmission,
    );
    submitLeaderboardScore(null);
  }, [
    role,
    roomId,
    pendingScoreSubmission,
    isSocketConnected,
    submitLeaderboardScore,
  ]);

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
    (code: string, slot: 1 | 2 = playerSlotRef.current) => {
      const normalized = code.trim().toUpperCase();
      if (!normalized || !socketRef.current?.connected) return;
      setErrorMessage(null);
      socketRef.current.emit(RoomEvents.ROOM_JOIN, {
        roomId: normalized,
        playerSlot: slot,
      });
    },
    [setErrorMessage],
  );

  const emitCalibrate = useCallback(() => {
    if (!socketRef.current?.connected) return;
    socketRef.current.emit(RoomEvents.GYRO_CALIBRATE, {
      playerSlot: playerSlotRef.current,
    });
  }, []);

  const emitResetBall = useCallback(() => {
    if (!socketRef.current?.connected) return;
    socketRef.current.emit(RoomEvents.GAME_RESET_BALL);
  }, []);

  const emitChangeLevel = useCallback(
    (direction: 'next' | 'prev') => {
      if (!socketRef.current?.connected || !targetRoomIdRef.current) return;
      socketRef.current.emit(RoomEvents.GAME_CHANGE_LEVEL, {
        roomId: targetRoomIdRef.current,
        direction,
      });
    },
    [],
  );

  return {
    emitGyroUpdate,
    joinRoomByCode,
    emitCalibrate,
    emitResetBall,
    emitChangeLevel,
  };
}
