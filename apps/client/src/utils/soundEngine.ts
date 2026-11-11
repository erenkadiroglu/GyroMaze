'use client';

/**
 * Harici ses dosyalarına (.mp3/.wav) ihtiyaç duymadan tarayıcının yerleşik
 * Web Audio API sentezleyicisi ile minimalist oyun ses efektleri üreten motor.
 */
class SoundEngine {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  /**
   * Küre duvara çarptığında hız şiddetine göre tok bir akustik tını üretir.
   */
  public playWallHit(intensity = 0.5): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const clamped = Math.max(0.1, Math.min(1, intensity));
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(110 + clamped * 90, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.08);

    gain.gain.setValueAtTime(clamped * 0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.085);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  /**
   * Enerji kristali toplandığında kristalize armonik çan sesi üretir.
   */
  public playCrystalPickup(collectedIndex = 1): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const baseFreq = 660 + collectedIndex * 110;
    [baseFreq, baseFreq * 1.5].forEach((freq, idx) => {
      const now = ctx.currentTime + idx * 0.045;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.12, now + 0.18);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.21);
    });
  }

  /**
   * Lazer bariyerine temas edildiğinde elektro-darbe sesi üretir.
   */
  public playLaserZap(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.linearRampToValueAtTime(85, now + 0.22);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  /**
   * Küre tuzak deliğine (Void Hole) düştüğünde alçalan frekanslı ses efekti üretir.
   */
  public playHoleFall(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(55, now + 0.35);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.38);
  }

  /**
   * Bölüm tamamlandığında (Hedef Portalı) armonik zafer akoru çalar.
   */
  public playVictory(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const now = ctx.currentTime + idx * 0.07;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.46);
    });
  }

  /**
   * Kalibrasyon veya sıfırlama butonuna basıldığında hafif onay sesi üretir.
   */
  public playCalibrate(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.09);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.11);
  }

  /**
   * Hızlandırma rampası (Boost Pad) üzerinden geçildiğinde yükselen kinetik sentez sesi üretir.
   */
  public playBoostPad(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(920, now + 0.16);

    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.19);
  }

  /**
   * Kuantum ışınlanma portalından (Wormhole Teleporter) geçildiğinde uzay-zaman bükülme sesi üretir.
   */
  public playTeleport(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(340, now);
    osc.frequency.exponentialRampToValueAtTime(1180, now + 0.14);
    osc.frequency.exponentialRampToValueAtTime(620, now + 0.24);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.26);
  }
}

export const soundEngine = new SoundEngine();
