/**
 * Özel harita (99) dışındaki standart bölümler için skor gönderim formunun gösterilip gösterilmeyeceğini denetler.
 */
export function shouldShowScoreSubmitForm(levelId: number): boolean {
  return levelId !== 99;
}

/**
 * Çok oyunculu modda geçerli bir kazanan olup olmadığını denetler.
 */
export function shouldShowMultiplayerWinner(
  isMultiplayer: boolean,
  winnerPlayer: 1 | 2 | null,
): boolean {
  return Boolean(isMultiplayer && winnerPlayer);
}

/**
 * Yıldız indeksine ve kazanılan yıldız sayısına göre doldurma durumunu çözer.
 */
export function isStarFilled(starIdx: number, earnedStars: number): boolean {
  return starIdx <= earnedStars;
}

/**
 * Skor kaydedilme durumuna göre buton etiketini döner.
 */
export function formatSubmitButtonText(scoreSubmitted: boolean): string {
  return scoreSubmitted ? 'Kaydedildi' : 'Skoru kaydet';
}
