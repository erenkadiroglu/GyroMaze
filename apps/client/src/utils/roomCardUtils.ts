import { cleanRoomCode } from './controllerUtils.ts';

export interface RoomCodeValidationResult {
  isValid: boolean;
  error: string | null;
}

/**
 * 6 haneli oda kodunu doğrular ve kullanıcı dostu Türkçe hata mesajı üretir.
 */
export function validateRoomCodeInput(input: string): RoomCodeValidationResult {
  const cleaned = cleanRoomCode(input);
  if (!cleaned) {
    return {
      isValid: false,
      error: 'Lütfen 6 haneli oda kodunu girin.',
    };
  }
  if (cleaned.length < 6) {
    return {
      isValid: false,
      error: `Oda kodu 6 haneli olmalıdır (${cleaned.length}/6).`,
    };
  }
  return {
    isValid: true,
    error: null,
  };
}

/**
 * Kapatma düğmesinin gösterilme şartını belirler.
 */
export function shouldShowCloseButton(
  activeRoomCode: string,
  hasCloseHandler: boolean,
): boolean {
  return Boolean(activeRoomCode && activeRoomCode.trim().length > 0 && hasCloseHandler);
}

/**
 * Son bağlandığın odalar butonu için erişilebilir ARIA etiketini üretir.
 */
export function formatRecentRoomAriaLabel(roomCode: string): string {
  return `Son kullanılan oda kodunu seç: ${roomCode}`;
}

/**
 * Gönder butonunun devre dışı bırakılma durumunu kontrol eder.
 */
export function isSubmitDisabled(manualRoomInput: string): boolean {
  const cleaned = cleanRoomCode(manualRoomInput);
  return cleaned.length !== 6;
}

