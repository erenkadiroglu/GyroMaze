import { create } from 'zustand';
import {
  CameraMode,
  GameStatus,
  GyroData,
  HapticType,
  LeaderboardEntry,
  SubmitScorePayload,
} from '@gyromaze/shared';
import { MazeLevelDefinition } from '@/components/scene/mazeLevels';

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

const BEST_TIMES_STORAGE_KEY = 'gyromaze_best_times_v1';

function loadBestTimes(): Record<number, number> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(BEST_TIMES_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<number, number>) : {};
  } catch {
    return {};
  }
}

/**
 * GyroMaze merkezi uygulama ve oyun durumu arayüzü.
 */
interface GameStoreState {
  /** Sunucu tarafından atanan 6 haneli benzersiz oda kodu */
  roomId: string | null;
  /** Sunucunun tespit ettiği yerel ağ (LAN) IPv4 adresi */
  lanIp: string | null;
  /** Aktif bir HTTPS tüneli (ngrok vb.) varsa genel erişim adresi */
  tunnelUrl: string | null;
  /** Socket.io sunucu bağlantı durumu */
  isSocketConnected: boolean;
  /** Mobil kontrolcünün odaya aktif olarak bağlı olup olmadığı */
  isControllerPaired: boolean;
  /** QR eşleşme modalının açık olup olmadığı */
  isPairingModalOpen: boolean;
  /** Küresel skor tablosu modalının açık olup olmadığı */
  isLeaderboardOpen: boolean;
  /** Harita editörü modalının açık olup olmadığı */
  isEditorOpen: boolean;
  /** Mevcut oyun durumu */
  gameStatus: GameStatus;
  /** Aktif labirent seviyesi (1..5 standart, 99 özel harita) */
  level: number;
  /** Masaüstü 3B sahne kamera bakış açısı modu */
  cameraMode: CameraMode;
  /** Kullanıcının harita editöründe tasarladığı özel labirent tanımı */
  customLevel: MazeLevelDefinition | null;
  /** Milisaniye cinsinden anlık ağ gecikmesi */
  latencyMs: number;
  /** Bölüm başlangıcından itibaren geçen süre (saniye) */
  elapsedSeconds: number;
  /** Seviye bazlı en iyi tamamlama süreleri (Yerel Rekorlar) */
  bestTimes: Record<number, number>;
  /** Sunucudan senkronize edilen küresel skor tablosu */
  leaderboard: LeaderboardEntry[];
  /** Sunucuya gönderilecek yeni skor kaydı sinyali */
  pendingScoreSubmission: SubmitScorePayload | null;
  /** Ses efektlerinin sessize alınıp alınmadığı */
  isSoundMuted: boolean;
  /** Mevcut bölümde toplanan enerji kristallerinin indeks listesi */
  collectedCrystals: number[];
  /** Mobil kontrolcü ekranında gösterilen senkronize kristal sayısı */
  remoteCrystalsCollected: number;
  /** Mobil kontrolcü ekranında gösterilen toplam kristal hedefi */
  remoteCrystalsTotal: number;
  /** Topu başlangıç noktasına ışınlamak için artırılan tetikleyici sayaç */
  resetCount: number;
  /** Mobil cihaza titreşim göndermek için tetiklenen sinyal */
  hapticSignal: { type: HapticType; seq: number } | null;
  /** Oda veya bağlantı hatası mesajı */
  errorMessage: string | null;

  // Eylemler (Actions)
  setRoomId: (roomId: string | null) => void;
  setLanIp: (lanIp: string | null) => void;
  setTunnelUrl: (tunnelUrl: string | null) => void;
  setSocketConnected: (connected: boolean) => void;
  setControllerPaired: (paired: boolean) => void;
  setPairingModalOpen: (open: boolean) => void;
  setLeaderboardOpen: (open: boolean) => void;
  setEditorOpen: (open: boolean) => void;
  setGameStatus: (status: GameStatus) => void;
  setLevel: (level: number) => void;
  setCustomLevel: (customLevel: MazeLevelDefinition) => void;
  nextLevel: () => void;
  prevLevel: () => void;
  cycleCameraMode: () => void;
  setRemoteProgress: (payload: {
    status: GameStatus;
    level?: number;
    crystalsCollected?: number;
    crystalsTotal?: number;
  }) => void;
  setLatencyMs: (ms: number) => void;
  setElapsedSeconds: (seconds: number) => void;
  recordLevelCompletion: (level: number, seconds: number) => void;
  setLeaderboard: (entries: LeaderboardEntry[]) => void;
  submitLeaderboardScore: (payload: SubmitScorePayload) => void;
  collectCrystal: (crystalIndex: number) => void;
  toggleSoundMuted: () => void;
  triggerBallReset: () => void;
  triggerHaptic: (type: HapticType) => void;
  setErrorMessage: (message: string | null) => void;
  updateTransientGyro: (data: GyroData) => void;
  resetTransientGyro: () => void;
}

/**
 * GyroMaze Zustand durum deposu.
 */
export const useGameStore = create<GameStoreState>((set) => ({
  roomId: null,
  lanIp: null,
  tunnelUrl: null,
  isSocketConnected: false,
  isControllerPaired: false,
  isPairingModalOpen: true,
  isLeaderboardOpen: false,
  isEditorOpen: false,
  gameStatus: 'waiting',
  level: 1,
  cameraMode: 'isometric',
  customLevel: null,
  latencyMs: 0,
  elapsedSeconds: 0,
  bestTimes: loadBestTimes(),
  leaderboard: [],
  pendingScoreSubmission: null,
  isSoundMuted: false,
  collectedCrystals: [],
  remoteCrystalsCollected: 0,
  remoteCrystalsTotal: 3,
  resetCount: 0,
  hapticSignal: null,
  errorMessage: null,

  setRoomId: (roomId) => set({ roomId }),
  setLanIp: (lanIp) => set({ lanIp }),
  setTunnelUrl: (tunnelUrl) => set({ tunnelUrl }),
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
  setLeaderboardOpen: (isLeaderboardOpen) => set({ isLeaderboardOpen }),
  setEditorOpen: (isEditorOpen) => set({ isEditorOpen }),
  setGameStatus: (gameStatus) => set({ gameStatus }),
  setLevel: (level) =>
    set((state) => ({
      level,
      gameStatus: 'playing',
      elapsedSeconds: 0,
      collectedCrystals: [],
      resetCount: state.resetCount + 1,
    })),
  setCustomLevel: (customLevel) =>
    set((state) => ({
      customLevel,
      level: 99,
      isEditorOpen: false,
      gameStatus: 'playing',
      elapsedSeconds: 0,
      collectedCrystals: [],
      resetCount: state.resetCount + 1,
    })),
  nextLevel: () =>
    set((state) => ({
      level: state.level === 99 ? 1 : (state.level % 5) + 1,
      gameStatus: 'playing',
      elapsedSeconds: 0,
      collectedCrystals: [],
      resetCount: state.resetCount + 1,
    })),
  prevLevel: () =>
    set((state) => ({
      level: state.level === 99 || state.level <= 1 ? 5 : state.level - 1,
      gameStatus: 'playing',
      elapsedSeconds: 0,
      collectedCrystals: [],
      resetCount: state.resetCount + 1,
    })),
  cycleCameraMode: () =>
    set((state) => {
      const order: CameraMode[] = ['isometric', 'topdown', 'follow'];
      const nextIdx = (order.indexOf(state.cameraMode) + 1) % order.length;
      return { cameraMode: order[nextIdx] };
    }),
  setRemoteProgress: (payload) =>
    set((state) => ({
      gameStatus: payload.status,
      level: payload.level ?? state.level,
      remoteCrystalsCollected:
        payload.crystalsCollected ?? state.remoteCrystalsCollected,
      remoteCrystalsTotal: payload.crystalsTotal ?? state.remoteCrystalsTotal,
    })),
  setLatencyMs: (latencyMs) => set({ latencyMs }),
  setElapsedSeconds: (elapsedSeconds) => set({ elapsedSeconds }),
  recordLevelCompletion: (level, seconds) =>
    set((state) => {
      const currentBest = state.bestTimes[level];
      const nextBestTimes = { ...state.bestTimes };
      if (currentBest === undefined || seconds < currentBest) {
        nextBestTimes[level] = Number(seconds.toFixed(1));
        if (typeof window !== 'undefined') {
          try {
            window.localStorage.setItem(
              BEST_TIMES_STORAGE_KEY,
              JSON.stringify(nextBestTimes),
            );
          } catch {
            // LocalStorage erişim hatası varsa yoksay
          }
        }
      }
      return {
        gameStatus: 'won',
        bestTimes: nextBestTimes,
      };
    }),
  setLeaderboard: (leaderboard) => set({ leaderboard }),
  submitLeaderboardScore: (pendingScoreSubmission) =>
    set({ pendingScoreSubmission }),
  collectCrystal: (crystalIndex) =>
    set((state) => {
      if (state.collectedCrystals.includes(crystalIndex)) {
        return state;
      }
      return {
        collectedCrystals: [...state.collectedCrystals, crystalIndex],
      };
    }),
  toggleSoundMuted: () =>
    set((state) => ({ isSoundMuted: !state.isSoundMuted })),
  triggerBallReset: () =>
    set((state) => ({
      resetCount: state.resetCount + 1,
      gameStatus: 'playing',
      elapsedSeconds: 0,
      collectedCrystals: [],
    })),
  triggerHaptic: (type) =>
    set((state) => ({
      hapticSignal: { type, seq: (state.hapticSignal?.seq ?? 0) + 1 },
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
