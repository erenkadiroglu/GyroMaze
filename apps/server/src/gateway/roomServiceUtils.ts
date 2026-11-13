import type { NetworkInterfaceInfo } from 'os';
import { resolve } from 'path';
import type { LeaderboardEntry, SubmitScorePayload } from '@gyromaze/shared';

export const ROOM_CODE_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

const VIRTUAL_IFACE_PATTERN =
  /(vethernet|wsl|docker|virtualbox|vbox|vmware|hyper-v|tailscale|zerotier|hamachi|loopback|\btun\d*|\btap\d*)/i;
const PHYSICAL_IFACE_PATTERN = /(wi-fi|wifi|wlan|ethernet|\ben\d|\beth\d)/i;

function isPrivate172(address: string): boolean {
  if (!address.startsWith('172.')) return false;
  const secondOctet = Number(address.split('.')[1]);
  return Number.isInteger(secondOctet) && secondOctet >= 16 && secondOctet <= 31;
}

function isCgnat100(address: string): boolean {
  if (!address.startsWith('100.')) return false;
  const secondOctet = Number(address.split('.')[1]);
  return Number.isInteger(secondOctet) && secondOctet >= 64 && secondOctet <= 127;
}

/**
 * Belirtilen karakter kümesinden rastgele kod üretir.
 */
export function generateRandomCode(
  alphabet = ROOM_CODE_ALPHABET,
  length = 6,
): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * alphabet.length);
    result += alphabet[randomIndex];
  }
  return result;
}

/**
 * Liderlik tablosu kalıcı JSON dosya yolunu ortam değişkenlerine göre çözümler.
 */
export function resolveLeaderboardStoragePath(
  explicitPath?: string | null,
): string | null {
  if (explicitPath === null) {
    return null;
  }
  if (typeof explicitPath === 'string') {
    const trimmed = explicitPath.trim();
    return trimmed ? resolve(trimmed) : null;
  }

  const envPath = process.env.GYROMAZE_LEADERBOARD_FILE;
  if (typeof envPath === 'string') {
    const trimmed = envPath.trim();
    if (!trimmed || trimmed === 'off' || trimmed === 'memory') {
      return null;
    }
    return resolve(trimmed);
  }

  const isTestRunner =
    process.env.NODE_ENV === 'test' ||
    Boolean(process.env.NODE_TEST_CONTEXT) ||
    process.execArgv.includes('--test') ||
    process.argv.some((arg) => arg.endsWith('.test.mjs'));
  if (isTestRunner) {
    return null;
  }

  return resolve(process.cwd(), '.data', 'leaderboard.json');
}

/**
 * Ham kayıt listesini doğrulayarak bölüm bazında en iyi 10 kaydı sıralı olarak döner.
 */
export function normalizeLeaderboardEntries(rawEntries: unknown[]): LeaderboardEntry[] {
  const validEntries: LeaderboardEntry[] = [];
  for (const item of rawEntries) {
    if (!item || typeof item !== 'object') continue;
    const candidate = item as Partial<LeaderboardEntry>;
    if (
      typeof candidate.id !== 'string' ||
      !candidate.id.trim() ||
      typeof candidate.playerName !== 'string' ||
      typeof candidate.levelId !== 'number' ||
      !Number.isInteger(candidate.levelId) ||
      candidate.levelId < 1 ||
      candidate.levelId === 99 ||
      typeof candidate.timeSeconds !== 'number' ||
      !Number.isFinite(candidate.timeSeconds) ||
      candidate.timeSeconds <= 0 ||
      candidate.timeSeconds > 3600 ||
      typeof candidate.createdAt !== 'number' ||
      !Number.isFinite(candidate.createdAt)
    ) {
      continue;
    }
    validEntries.push({
      id: candidate.id,
      playerName: candidate.playerName.trim().slice(0, 24) || 'Anonim Oyuncu',
      levelId: candidate.levelId,
      timeSeconds: Number(Math.max(0.1, candidate.timeSeconds).toFixed(1)),
      createdAt: candidate.createdAt,
    });
  }

  const grouped = new Map<number, LeaderboardEntry[]>();
  for (const item of validEntries) {
    const list = grouped.get(item.levelId) ?? [];
    list.push(item);
    grouped.set(item.levelId, list);
  }

  const normalized: LeaderboardEntry[] = [];
  for (const [, list] of grouped.entries()) {
    list.sort((a, b) => a.timeSeconds - b.timeSeconds);
    normalized.push(...list.slice(0, 10));
  }
  return normalized;
}

/**
 * Ağ arayüzleri arasından sanal adaptörleri (WSL, Hyper-V, Docker, VPN) ve
 * geçersiz link-local (169.254.x.x) adresleri eleyerek gerçek LAN IPv4 adresini seçer.
 */
export function selectPreferredLanIp(
  nets: NodeJS.Dict<NetworkInterfaceInfo[]>,
): string | undefined {
  let best: { address: string; score: number } | undefined;

  for (const [ifaceName, interfaces] of Object.entries(nets)) {
    if (!interfaces) continue;
    for (const net of interfaces) {
      if (net.family !== 'IPv4' || net.internal) continue;
      if (net.address.startsWith('169.254.')) continue;

      let score = 0;
      if (VIRTUAL_IFACE_PATTERN.test(ifaceName)) score -= 50;
      else if (PHYSICAL_IFACE_PATTERN.test(ifaceName)) score += 20;

      if (net.address.startsWith('192.168.')) score += 30;
      else if (net.address.startsWith('10.')) score += 20;
      else if (isPrivate172(net.address)) score += 10;
      else if (isCgnat100(net.address)) score -= 20;

      if (!best || score > best.score) {
        best = { address: net.address, score };
      }
    }
  }

  return best?.address;
}

/**
 * Skor gönderim veri yükünün sınırlarını ve geçerliliğini denetler.
 */
export function validateScorePayload(payload: SubmitScorePayload): {
  isValid: boolean;
  normalizedTime?: number;
  normalizedPlayer?: string;
} {
  if (!payload || typeof payload !== 'object') {
    return { isValid: false };
  }

  const { levelId, timeSeconds, playerName } = payload;
  if (
    typeof levelId !== 'number' ||
    !Number.isInteger(levelId) ||
    levelId < 1 ||
    levelId === 99 ||
    typeof timeSeconds !== 'number' ||
    !Number.isFinite(timeSeconds) ||
    timeSeconds <= 0 ||
    timeSeconds > 3600
  ) {
    return { isValid: false };
  }

  const safeName = typeof playerName === 'string' ? playerName.trim().slice(0, 24) || 'Anonim' : 'Anonim';
  const roundedTime = Number(Math.max(0.1, timeSeconds).toFixed(1));

  return {
    isValid: true,
    normalizedTime: roundedTime,
    normalizedPlayer: safeName,
  };
}
