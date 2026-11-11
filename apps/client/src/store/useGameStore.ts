import { create } from 'zustand';
import {
  BoardTheme,
  CameraMode,
  ColorScheme,
  GameStatus,
  GyroData,
  HapticType,
  LeaderboardEntry,
  SubmitScorePayload,
} from '@gyromaze/shared';
import { MazeLevelDefinition } from '@/components/scene/mazeLevels';

/**
 * React re-render tetiklemeden 60 FPS Three.js döngüsü (useFrame) ve HUD telemetrisi
 * tarafından doğrudan okunan yüksek frekanslı jiroskop ve bilye durum referansı.
 */
export const transientGyro: GyroData & {
  ballX: number;
  ballZ: number;
  ballSpeed: number;
} = {
  alpha: 0,
  beta: 0,
  gamma: 0,
  timestamp: 0,
  ballX: -4.2,
  ballZ: -4.2,
  ballSpeed: 0,
};

/**
 * Çok oyunculu (2 Oyuncu - 1v1 / Co-op) modda 2. oyuncunun (2. telefon veya yön tuşları)
 * yüksek frekanslı jiroskop ve bilye durum referansı.
 */
export const transientGyroP2: GyroData & {
  ballX: number;
  ballZ: number;
  ballSpeed: number;
} = {
  alpha: 0,
  beta: 0,
  gamma: 0,
  timestamp: 0,
  ballX: -3.6,
  ballZ: -4.2,
  ballSpeed: 0,
};

const BEST_TIMES_STORAGE_KEY = 'gyromaze_best_times_v1';
const GHOST_PATHS_STORAGE_KEY = 'gyromaze_ghost_paths_v1';

function loadBestTimes(): Record<number, number> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(BEST_TIMES_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<number, number>) : {};
  } catch {
    return {};
  }
}

function loadGhostPaths(): Record<number, Array<[number, number]>> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(GHOST_PATHS_STORAGE_KEY);
    return raw
      ? (JSON.parse(raw) as Record<number, Array<[number, number]>>)
      : {};
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
  /** Oyun ve fizik ayarları modalının açık olup olmadığı */
  isSettingsOpen: boolean;
  /** Çok oyunculu (2 Oyuncu - 1v1 / Co-op) modun aktif olup olmadığı */
  isMultiplayer: boolean;
  /** 2. mobil kontrolcünün odaya bağlı olup olmadığı */
  isSecondControllerPaired: boolean;
  /** Çok oyunculu modda bölümü ilk tamamlayan oyuncu (1 veya 2) */
  winnerPlayer: 1 | 2 | null;
  /** Fizik yerçekimi / ivme ölçeği (28: Yavaş, 36: Standart, 46: Turbo) */
  gravityScale: number;
  /** Eğim tepki katsayısı (18: Yumuşak, 32: Standart, 48: Anında) */
  tiltResponsiveness: number;
  /** Ses motoru ses şiddeti (0.25 .. 1.0) */
  soundVolume: number;
  /** Bilye neon hareket izi görünürlüğü */
  showTrail: boolean;
  /** 3B Hayalet yarışçı (Ghost Replay) görünürlüğü */
  showGhost: boolean;
  /** Alt 2B mini-harita radarı görünürlüğü */
  showMiniMap: boolean;
  /** Mevcut oyun durumu */
  gameStatus: GameStatus;
  /** Aktif labirent seviyesi (1..5 standart, 99 özel harita) */
  level: number;
  /** Masaüstü 3B sahne kamera bakış açısı modu */
  cameraMode: CameraMode;
  /** 3B Labirent sahnesi görsel atmosfer teması */
  boardTheme: BoardTheme;
  /** Aydınlık / Karanlık arayüz ve sahne görünüm modu */
  colorScheme: ColorScheme;
  /** Sahne üstü anlık durum bildirimi (kilitli portal, kristal, yeni sektör vb.) */
  hudNotification: {
    id: number;
    message: string;
    tone: 'info' | 'success' | 'warn';
    seq: number;
  } | null;
  /** Kullanıcının harita editöründe tasarladığı özel labirent tanımı */
  customLevel: MazeLevelDefinition | null;
  /** Milisaniye cinsinden anlık ağ gecikmesi */
  latencyMs: number;
  /** Bölüm başlangıcından itibaren geçen süre (saniye) */
  elapsedSeconds: number;
  /** Seviye bazlı en iyi tamamlama süreleri (Yerel Rekorlar) */
  bestTimes: Record<number, number>;
  /** Seviye bazlı en iyi turun 10Hz [x, z] hayalet yarışçı (Ghost Replay) izi */
  ghostPaths: Record<number, Array<[number, number]>>;
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
  setSettingsOpen: (open: boolean) => void;
  setSecondControllerPaired: (paired: boolean) => void;
  toggleMultiplayer: () => void;
  updateSettings: (
    partial: Partial<{
      gravityScale: number;
      tiltResponsiveness: number;
      soundVolume: number;
      showTrail: boolean;
      showGhost: boolean;
      showMiniMap: boolean;
    }>,
  ) => void;
  setGameStatus: (status: GameStatus) => void;
  setLevel: (level: number) => void;
  setCustomLevel: (customLevel: MazeLevelDefinition) => void;
  nextLevel: () => void;
  prevLevel: () => void;
  cycleCameraMode: () => void;
  cycleBoardTheme: () => void;
  toggleColorScheme: () => void;
  showHudNotification: (
    message: string,
    tone?: 'info' | 'success' | 'warn',
  ) => void;
  setRemoteProgress: (payload: {
    status: GameStatus;
    level?: number;
    crystalsCollected?: number;
    crystalsTotal?: number;
  }) => void;
  setLatencyMs: (ms: number) => void;
  setElapsedSeconds: (seconds: number) => void;
  recordLevelCompletion: (
    level: number,
    seconds: number,
    runPath?: Array<[number, number]>,
    winnerPlayer?: 1 | 2,
  ) => void;
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
  isSettingsOpen: false,
  isMultiplayer: false,
  isSecondControllerPaired: false,
  winnerPlayer: null,
  gravityScale: 36,
  tiltResponsiveness: 32,
  soundVolume: 1,
  showTrail: true,
  showGhost: true,
  showMiniMap: true,
  gameStatus: 'waiting',
  level: 1,
  cameraMode: 'isometric',
  boardTheme: 'emerald',
  colorScheme: 'dark',
  hudNotification: null,
  customLevel: null,
  latencyMs: 0,
  elapsedSeconds: 0,
  bestTimes: loadBestTimes(),
  ghostPaths: loadGhostPaths(),
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
  setSettingsOpen: (isSettingsOpen) => set({ isSettingsOpen }),
  setSecondControllerPaired: (isSecondControllerPaired) =>
    set((state) => ({
      isSecondControllerPaired,
      isMultiplayer: isSecondControllerPaired ? true : state.isMultiplayer,
    })),
  toggleMultiplayer: () =>
    set((state) => ({
      isMultiplayer: !state.isMultiplayer,
      winnerPlayer: null,
      resetCount: state.resetCount + 1,
      elapsedSeconds: 0,
      collectedCrystals: [],
      gameStatus: 'playing',
    })),
  updateSettings: (partial) => set((state) => ({ ...state, ...partial })),
  setGameStatus: (gameStatus) => set({ gameStatus }),
  setLevel: (level) =>
    set((state) => ({
      level,
      winnerPlayer: null,
      gameStatus: 'playing',
      elapsedSeconds: 0,
      collectedCrystals: [],
      resetCount: state.resetCount + 1,
    })),
  setCustomLevel: (customLevel) =>
    set((state) => ({
      customLevel,
      level: 99,
      winnerPlayer: null,
      isEditorOpen: false,
      gameStatus: 'playing',
      elapsedSeconds: 0,
      collectedCrystals: [],
      resetCount: state.resetCount + 1,
    })),
  nextLevel: () =>
    set((state) => ({
      level: state.level === 99 ? 1 : state.level + 1,
      winnerPlayer: null,
      gameStatus: 'playing',
      elapsedSeconds: 0,
      collectedCrystals: [],
      resetCount: state.resetCount + 1,
    })),
  prevLevel: () =>
    set((state) => ({
      level: state.level === 99 || state.level <= 1 ? 1 : state.level - 1,
      winnerPlayer: null,
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
  cycleBoardTheme: () =>
    set((state) => {
      const order: BoardTheme[] = [
        'emerald',
        'cyberpunk',
        'crimson',
        'daylight',
      ];
      const nextIdx = (order.indexOf(state.boardTheme) + 1) % order.length;
      return {
        boardTheme: order[nextIdx],
        colorScheme: order[nextIdx] === 'daylight' ? 'light' : state.colorScheme,
      };
    }),
  toggleColorScheme: () =>
    set((state) => {
      const nextScheme: ColorScheme =
        state.colorScheme === 'dark' ? 'light' : 'dark';
      return {
        colorScheme: nextScheme,
        boardTheme:
          nextScheme === 'light'
            ? 'daylight'
            : state.boardTheme === 'daylight'
              ? 'emerald'
              : state.boardTheme,
      };
    }),
  showHudNotification: (message, tone = 'info') => {
    const nextSeq = Date.now();
    set((state) => ({
      hudNotification: {
        id: nextSeq,
        message,
        tone,
        seq: (state.hudNotification?.seq ?? 0) + 1,
      },
    }));
    if (typeof window !== 'undefined') {
      window.setTimeout(() => {
        set((state) =>
          state.hudNotification?.id === nextSeq
            ? { hudNotification: null }
            : state,
        );
      }, 2800);
    }
  },
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
  recordLevelCompletion: (level, seconds, runPath, winnerPlayer = 1) =>
    set((state) => {
      const currentBest = state.bestTimes[level];
      const nextBestTimes = { ...state.bestTimes };
      const nextGhostPaths = { ...state.ghostPaths };
      if (currentBest === undefined || seconds < currentBest) {
        nextBestTimes[level] = Number(seconds.toFixed(1));
        if (runPath && runPath.length > 1) {
          nextGhostPaths[level] = runPath;
        }
        if (typeof window !== 'undefined') {
          try {
            window.localStorage.setItem(
              BEST_TIMES_STORAGE_KEY,
              JSON.stringify(nextBestTimes),
            );
            if (runPath && runPath.length > 1) {
              window.localStorage.setItem(
                GHOST_PATHS_STORAGE_KEY,
                JSON.stringify(nextGhostPaths),
              );
            }
          } catch {
            // LocalStorage erişim hatası varsa yoksay
          }
        }
      }
      return {
        gameStatus: 'won',
        winnerPlayer: state.isMultiplayer ? winnerPlayer : null,
        bestTimes: nextBestTimes,
        ghostPaths: nextGhostPaths,
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
      winnerPlayer: null,
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
    if (data.playerSlot === 2) {
      transientGyroP2.alpha = data.alpha;
      transientGyroP2.beta = data.beta;
      transientGyroP2.gamma = data.gamma;
      transientGyroP2.timestamp = data.timestamp;
    } else {
      transientGyro.alpha = data.alpha;
      transientGyro.beta = data.beta;
      transientGyro.gamma = data.gamma;
      transientGyro.timestamp = data.timestamp;
    }
  },

  resetTransientGyro: () => {
    transientGyro.alpha = 0;
    transientGyro.beta = 0;
    transientGyro.gamma = 0;
    transientGyro.timestamp = Date.now();
    transientGyroP2.alpha = 0;
    transientGyroP2.beta = 0;
    transientGyroP2.gamma = 0;
    transientGyroP2.timestamp = Date.now();
  },
}));
