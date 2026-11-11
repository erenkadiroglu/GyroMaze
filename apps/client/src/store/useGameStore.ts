import { create } from 'zustand';
import { GameStatus, GyroData } from '@gyromaze/shared';

/**
 * React re-render tetiklemeden 60 FPS Three.js döngüsü (useFrame) tarafından
 * doğrudan okunan yüksek frekanslı jiroskop telemetri referansı.
 */
export const transientGyro: GyroData = {
  alpha: 0,
  beta: 0,
  gamma: 0,
  timestamp: 0,
};

/**
 * GyroMaze merkezi uygulama ve oyun durumu arayüzü.
 */
interface GameStoreState {
  /** Sunucu tarafından atanan 6 haneli benzersiz oda kodu */
  roomId: string | null;
  /** Socket.io sunucu bağlantı durumu */
  isSocketConnected: boolean;
  /** Mobil kontrolcünün odaya aktif olarak bağlı olup olmadığı */
  isControllerPaired: boolean;
  /** QR eşleşme modalının açık olup olmadığı */
  isPairingModalOpen: boolean;
  /** Mevcut oyun durumu */
  gameStatus: GameStatus;
  /** Aktif labirent seviyesi */
  level: number;
  /** Milisaniye cinsinden anlık ağ gecikmesi (RTT/Tek yön tahmini) */
  latencyMs: number;
  /** Bölüm başlangıcından itibaren geçen süre (saniye) */
  elapsedSeconds: number;
  /** Topu başlangıç noktasına ışınlamak için artırılan tetikleyici sayaç */
  resetCount: number;
  /** Oda veya bağlantı hatası mesajı */
  errorMessage: string | null;

  // Eylemler (Actions)
  setRoomId: (roomId: string | null) => void;
  setSocketConnected: (connected: boolean) => void;
  setControllerPaired: (paired: boolean) => void;
  setPairingModalOpen: (open: boolean) => void;
  setGameStatus: (status: GameStatus) => void;
  setLevel: (level: number) => void;
  nextLevel: () => void;
  setLatencyMs: (ms: number) => void;
  setElapsedSeconds: (seconds: number) => void;
  triggerBallReset: () => void;
  setErrorMessage: (message: string | null) => void;
  updateTransientGyro: (data: GyroData) => void;
  resetTransientGyro: () => void;
}

/**
 * GyroMaze Zustand durum deposu.
 */
export const useGameStore = create<GameStoreState>((set) => ({
  roomId: null,
  isSocketConnected: false,
  isControllerPaired: false,
  isPairingModalOpen: true,
  gameStatus: 'waiting',
  level: 1,
  latencyMs: 0,
  elapsedSeconds: 0,
  resetCount: 0,
  errorMessage: null,

  setRoomId: (roomId) => set({ roomId }),
  setSocketConnected: (isSocketConnected) => set({ isSocketConnected }),
  setControllerPaired: (isControllerPaired) =>
    set((state) => ({
      isControllerPaired,
      isPairingModalOpen: isControllerPaired ? false : state.isPairingModalOpen,
      gameStatus: isControllerPaired
        ? state.gameStatus === 'waiting' || state.gameStatus === 'paused'
          ? 'playing'
          : state.gameStatus
        : state.gameStatus === 'playing'
          ? 'paused'
          : state.gameStatus,
    })),
  setPairingModalOpen: (isPairingModalOpen) => set({ isPairingModalOpen }),
  setGameStatus: (gameStatus) => set({ gameStatus }),
  setLevel: (level) =>
    set({
      level,
      gameStatus: 'playing',
      elapsedSeconds: 0,
    }),
  nextLevel: () =>
    set((state) => ({
      level: state.level + 1,
      gameStatus: 'playing',
      elapsedSeconds: 0,
      resetCount: state.resetCount + 1,
    })),
  setLatencyMs: (latencyMs) => set({ latencyMs }),
  setElapsedSeconds: (elapsedSeconds) => set({ elapsedSeconds }),
  triggerBallReset: () =>
    set((state) => ({
      resetCount: state.resetCount + 1,
      gameStatus: 'playing',
      elapsedSeconds: 0,
    })),
  setErrorMessage: (errorMessage) => set({ errorMessage }),

  updateTransientGyro: (data) => {
    transientGyro.alpha = data.alpha;
    transientGyro.beta = data.beta;
    transientGyro.gamma = data.gamma;
    transientGyro.timestamp = data.timestamp;
  },

  resetTransientGyro: () => {
    transientGyro.alpha = 0;
    transientGyro.beta = 0;
    transientGyro.gamma = 0;
    transientGyro.timestamp = Date.now();
  },
}));

