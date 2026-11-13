/**
 * Bilyeyi başa alma (Reset) butonunun devre dışı olup olmadığını belirler.
 */
export function isResetBallDisabled(
  isControllerPaired: boolean,
  isSocketConnected: boolean,
): boolean {
  return !isControllerPaired || !isSocketConnected;
}

/**
 * Kalibrasyon butonunun erişilebilirlik etiketini döner.
 */
export function resolveRecalibrateAriaLabel(): string {
  return 'Jiroskop merkezini sıfırla ve kalibre et';
}

/**
 * Bilyeyi başa alma butonunun erişilebilirlik etiketini döner.
 */
export function resolveResetBallAriaLabel(disabled: boolean): string {
  return disabled
    ? 'Topu başa al (Eşleşme bekleniyor)'
    : 'Topu başlangıç noktasına al';
}
