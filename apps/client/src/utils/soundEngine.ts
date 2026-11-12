'use client';

/**
 * Harici ses dosyalarına (.mp3/.wav) ihtiyaç duymadan tarayıcının yerleşik
 * Web Audio API sentezleyicisi ile minimalist oyun ses efektleri üreten motor.
 */
export class SoundEngine {
  private ctx: AudioContext | null = null;
  private volume = 1.0;
  private gestureUnlockAttached = false;

  constructor(customCtx?: AudioContext | null) {
    if (customCtx) {
      this.ctx = customCtx;
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public setVolume(vol: number): void {
    if (!Number.isFinite(vol)) return;
    this.volume = Math.max(0, Math.min(1.5, vol));
  }

  private attachGestureUnlock(): void {
    if (this.gestureUnlockAttached || typeof window === 'undefined') return;
    this.gestureUnlockAttached = true;

    const detach = () => {
      this.gestureUnlockAttached = false;
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };

    const unlock = () => {
      if (!this.ctx) {
        detach();
        return;
      }
      if (this.ctx.state === 'suspended') {
        void this.ctx
          .resume()
          .then(() => {
            if (this.ctx?.state === 'running') {
              detach();
            }
          })
          .catch(() => {});
      } else if (this.ctx.state === 'running' || this.ctx.state === 'closed') {
        detach();
      }
    };

    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('keydown', unlock, { passive: true });
  }

  private getContext(): AudioContext | null {
    if (this.volume <= 0.01) return null;
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.attachGestureUnlock();
        void this.ctx.resume().catch(() => {});
        return null;
      }
      return this.ctx.state === 'running' ? this.ctx : null;
    }
    if (typeof window === 'undefined') return null;

    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (AudioCtx) {
      try {
        this.ctx = new AudioCtx();
      } catch {
        return null;
      }
    }
    if (!this.ctx) return null;

    if (this.ctx.state === 'suspended') {
      this.attachGestureUnlock();
      void this.ctx.resume().catch(() => {});
      return null;
    }

    return this.ctx.state === 'running' ? this.ctx : null;
  }

  /**
   * Tekrarlanan Web Audio düğüm kurulumunu merkezileştirir ve bitişte bağlantıları çözer.
   */
  private createVoice(
    ctx: AudioContext,
    type: OscillatorType,
    startFreq: number,
    peakGain: number,
    startAt: number,
    stopAt: number,
  ): { osc: OscillatorNode; gain: GainNode } {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(startFreq, startAt);
    gain.gain.setValueAtTime(peakGain * this.volume, startAt);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
    osc.start(startAt);
    osc.stop(stopAt);
    return { osc, gain };
  }

  /**
   * Küre duvara çarptığında hız şiddetine göre tok bir akustik tını üretir.
   */
  public playWallHit(intensity = 0.5): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const clamped = Math.max(0.1, Math.min(1, intensity));
    const { osc, gain } = this.createVoice(
      ctx,
      'triangle',
      110 + clamped * 90,
      clamped * 0.18,
      now,
      now + 0.09,
    );
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.085);
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
      const { osc, gain } = this.createVoice(
        ctx,
        'sine',
        freq,
        0.15,
        now,
        now + 0.21,
      );
      osc.frequency.exponentialRampToValueAtTime(freq * 1.12, now + 0.18);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    });
  }

  /**
   * Lazer bariyerine temas edildiğinde elektro-darbe sesi üretir.
   */
  public playLaserZap(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const { osc, gain } = this.createVoice(
      ctx,
      'sawtooth',
      240,
      0.18,
      now,
      now + 0.25,
    );
    osc.frequency.linearRampToValueAtTime(85, now + 0.22);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
  }

  /**
   * Küre tuzak deliğine (Void Hole) düştüğünde alçalan frekanslı ses efekti üretir.
   */
  public playHoleFall(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const { osc, gain } = this.createVoice(
      ctx,
      'sine',
      320,
      0.22,
      now,
      now + 0.38,
    );
    osc.frequency.exponentialRampToValueAtTime(55, now + 0.35);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);
  }

  /**
   * Bölüm tamamlandığında (Hedef Portalı) kazanılan yıldız sayısına göre dinamik zafer fanfarı çalar:
   * - 3 Yıldız: 6 notalı parlak zafer fanfarı (C5, E5, G5, C6, E6, G6).
   * - 2 Yıldız: 4 notalı klasik arpej (C5, E5, G5, C6).
   * - 1 Yıldız: 3 notalı mütevazı tamamlama akoru (C5, E5, G5).
   */
  public playVictory(stars = 3): void {
    const ctx = this.getContext();
    if (!ctx) return;

    let notes: number[];
    if (stars >= 3) {
      notes = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98]; // C5, E5, G5, C6, E6, G6
    } else if (stars === 2) {
      notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    } else {
      notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    }

    notes.forEach((freq, idx) => {
      const now = ctx.currentTime + idx * 0.07;
      const { gain } = this.createVoice(
        ctx,
        'sine',
        freq,
        0.16,
        now,
        now + 0.46,
      );
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    });
  }

  /**
   * Süre dolduğunda veya bölüm başarısız olduğunda inen minör tonda yenilgi sesi üretir.
   */
  public playDefeat(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const notes = [293.66, 220.0, 146.83]; // D4, A3, D3
    notes.forEach((freq, idx) => {
      const now = ctx.currentTime + idx * 0.11;
      const { osc, gain } = this.createVoice(
        ctx,
        'sawtooth',
        freq,
        0.15,
        now,
        now + 0.28,
      );
      osc.frequency.linearRampToValueAtTime(freq * 0.88, now + 0.25);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.27);
    });
  }

  /**
   * Süreye Karşı (Time Attack) modunda son saniyelerde (<= 5 sn) metronom uyarısı üretir.
   * Acil durumda (<= 3 sn) frekans yükseltilerek tansiyon artırılır.
   */
  public playTimerTick(isUrgent = false): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const freq = isUrgent ? 1046.5 : 659.25; // C6 acil, E5 normal uyarı
    const duration = isUrgent ? 0.06 : 0.045;
    const { osc, gain } = this.createVoice(
      ctx,
      'triangle',
      freq,
      isUrgent ? 0.14 : 0.09,
      now,
      now + duration,
    );
    osc.frequency.exponentialRampToValueAtTime(freq * 0.9, now + duration * 0.9);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  }

  /**
   * Menü ve buton etkileşimlerinde hafif dokunsal akustik tık sesi üretir.
   */
  public playUIClick(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const { osc, gain } = this.createVoice(
      ctx,
      'sine',
      1200,
      0.06,
      now,
      now + 0.035,
    );
    osc.frequency.exponentialRampToValueAtTime(1800, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.032);
  }

  /**
   * Kalibrasyon veya sıfırlama butonuna basıldığında hafif onay sesi üretir.
   */
  public playCalibrate(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const { osc, gain } = this.createVoice(
      ctx,
      'sine',
      587.33,
      0.12,
      now,
      now + 0.11,
    );
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.09);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
  }

  /**
   * Hızlandırma rampası (Boost Pad) üzerinden geçildiğinde yükselen kinetik sentez sesi üretir.
   */
  public playBoostPad(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const { osc, gain } = this.createVoice(
      ctx,
      'triangle',
      280,
      0.16,
      now,
      now + 0.19,
    );
    osc.frequency.exponentialRampToValueAtTime(920, now + 0.16);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
  }

  /**
   * Kuantum ışınlanma portalından (Wormhole Teleporter) geçildiğinde uzay-zaman bükülme sesi üretir.
   */
  public playTeleport(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const { osc, gain } = this.createVoice(
      ctx,
      'sine',
      340,
      0.18,
      now,
      now + 0.26,
    );
    osc.frequency.exponentialRampToValueAtTime(1180, now + 0.14);
    osc.frequency.exponentialRampToValueAtTime(620, now + 0.24);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
  }

  /**
   * Tüm kristaller toplanmadan kilitli hedef portalına dokunulduğunda uyarı sesi üretir.
   */
  public playLockedPortal(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    [220, 175].forEach((freq, idx) => {
      const now = ctx.currentTime + idx * 0.09;
      const { gain } = this.createVoice(
        ctx,
        'square',
        freq,
        0.08,
        now,
        now + 0.085,
      );
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    });
  }
}

export const soundEngine = new SoundEngine();
