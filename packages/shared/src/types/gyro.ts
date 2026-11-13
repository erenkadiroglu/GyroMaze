/**
 * Mobil cihazın HTML5 Device Orientation API'sinden okunan
 * ve gerçek zamanlı olarak masaüstü sahnesine aktarılan jiroskop verisi.
 */
export interface GyroData {
  /** Z ekseni etrafındaki dönüş açısı (0° ile 360° arası) */
  alpha: number;
  /** X ekseni etrafındaki öne/arkaya eğim açısı (-180° ile 180° arası, Pitch) */
  beta: number;
  /** Y ekseni etrafındaki sola/sağa eğim açısı (-90° ile 90° arası, Roll) */
  gamma: number;
  /** Gecikme ölçümü için paketin üretildiği milisaniye cinsinden zaman damgası */
  timestamp: number;
  /** Çok oyunculu modda veriyi gönderen oyuncu yuvası (1 veya 2) */
  playerSlot?: 1 | 2;
}

/**
 * Kullanıcının telefonu tutuş açısını sıfır noktası (referans) kabul etmek için
 * kullanılan kalibrasyon ofset değerleri.
 */
export interface CalibrationOffset {
  betaOffset: number;
  gammaOffset: number;
}

/**
 * Mobil cihazdan gelen kalibrasyon olayının oyuncu yuvası bilgisi.
 */
export interface CalibratePayload {
  playerSlot?: 1 | 2;
}

