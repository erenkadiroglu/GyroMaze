import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { SoundEngine } from '../src/utils/soundEngine.ts';

/**
 * Web Audio API için hafif ve deterministik test taklidi (mock).
 */
function createMockAudioContext(initialState = 'running') {
  const createdOscillators = [];
  const createdGains = [];

  class MockAudioParam {
    constructor(defaultValue = 0) {
      this.value = defaultValue;
      this.events = [];
    }

    setValueAtTime(val, time) {
      this.value = val;
      this.events.push({ type: 'set', val, time });
      return this;
    }

    exponentialRampToValueAtTime(val, time) {
      this.value = val;
      this.events.push({ type: 'exponential', val, time });
      return this;
    }

    linearRampToValueAtTime(val, time) {
      this.value = val;
      this.events.push({ type: 'linear', val, time });
      return this;
    }
  }

  const mockCtx = {
    state: initialState,
    currentTime: 10.0,
    destination: { tag: 'audio-destination' },
    resumedCount: 0,
    resume: async () => {
      mockCtx.resumedCount += 1;
      mockCtx.state = 'running';
    },
    createOscillator: () => {
      const osc = {
        type: 'sine',
        frequency: new MockAudioParam(440),
        startedAt: null,
        stoppedAt: null,
        connections: [],
        start: (t) => {
          osc.startedAt = t;
        },
        stop: (t) => {
          osc.stoppedAt = t;
        },
        connect: (target) => {
          osc.connections.push(target);
        },
        disconnect: () => {
          osc.connections = [];
        },
        onended: null,
      };
      createdOscillators.push(osc);
      return osc;
    },
    createGain: () => {
      const gain = {
        gain: new MockAudioParam(1),
        connections: [],
        connect: (target) => {
          gain.connections.push(target);
        },
        disconnect: () => {
          gain.connections = [];
        },
      };
      createdGains.push(gain);
      return gain;
    },
    _getCreatedOscillators: () => createdOscillators,
    _getCreatedGains: () => createdGains,
  };

  return mockCtx;
}

describe('SoundEngine — Web Audio API Prosedürel Ses Motoru Testleri', () => {
  it('ses seviyesini (volume) [0, 1.5] aralığına güvenle sınırlar ve geçersiz değerleri yoksayar', () => {
    const engine = new SoundEngine();
    assert.equal(engine.getVolume(), 1.0);

    engine.setVolume(0.5);
    assert.equal(engine.getVolume(), 0.5);

    engine.setVolume(2.0);
    assert.equal(engine.getVolume(), 1.5);

    engine.setVolume(-0.4);
    assert.equal(engine.getVolume(), 0.0);

    engine.setVolume(Number.NaN);
    assert.equal(engine.getVolume(), 0.0);

    engine.setVolume(Number.POSITIVE_INFINITY);
    assert.equal(engine.getVolume(), 0.0);
  });

  it('AudioContext bulunmayan headless veya SSR ortamında tüm ses fonksiyonları hatasız çalışır', () => {
    const headlessEngine = new SoundEngine(null);

    assert.doesNotThrow(() => {
      headlessEngine.playWallHit(0.8);
      headlessEngine.playCrystalPickup(2);
      headlessEngine.playLaserZap();
      headlessEngine.playHoleFall();
      headlessEngine.playVictory(3);
      headlessEngine.playVictory(2);
      headlessEngine.playVictory(1);
      headlessEngine.playDefeat();
      headlessEngine.playTimerTick(false);
      headlessEngine.playTimerTick(true);
      headlessEngine.playUIClick();
      headlessEngine.playCalibrate();
      headlessEngine.playBoostPad();
      headlessEngine.playTeleport();
      headlessEngine.playLockedPortal();
    });
  });

  it('ses seviyesi sessize (0) alındığında hiçbir Web Audio düğümü üretmez', () => {
    const mockCtx = createMockAudioContext('running');
    const engine = new SoundEngine(mockCtx);
    engine.setVolume(0);

    engine.playWallHit();
    engine.playVictory(3);
    engine.playDefeat();
    engine.playTimerTick(true);

    assert.equal(mockCtx._getCreatedOscillators().length, 0);
    assert.equal(mockCtx._getCreatedGains().length, 0);
  });

  it('playVictory kazanılan yıldız sayısına (1, 2, 3) göre dinamik sayıda nota akoru çalar', () => {
    // 3 Yıldız: 6 nota
    const mockCtx3 = createMockAudioContext('running');
    const engine3 = new SoundEngine(mockCtx3);
    engine3.playVictory(3);
    const oscs3 = mockCtx3._getCreatedOscillators();
    assert.equal(oscs3.length, 6);
    assert.equal(oscs3[0].frequency.value, 523.25);
    assert.equal(oscs3[5].frequency.value, 1567.98);

    // 2 Yıldız: 4 nota
    const mockCtx2 = createMockAudioContext('running');
    const engine2 = new SoundEngine(mockCtx2);
    engine2.playVictory(2);
    assert.equal(mockCtx2._getCreatedOscillators().length, 4);

    // 1 Yıldız: 3 nota
    const mockCtx1 = createMockAudioContext('running');
    const engine1 = new SoundEngine(mockCtx1);
    engine1.playVictory(1);
    assert.equal(mockCtx1._getCreatedOscillators().length, 3);
  });

  it('playDefeat inen minör tonda 3 sawtooth osilatörü üretir', () => {
    const mockCtx = createMockAudioContext('running');
    const engine = new SoundEngine(mockCtx);
    engine.playDefeat();

    const oscs = mockCtx._getCreatedOscillators();
    assert.equal(oscs.length, 3);
    assert.equal(oscs[0].type, 'sawtooth');
    assert.equal(oscs[0].frequency.events[0].val, 293.66);
    assert.equal(oscs[1].frequency.events[0].val, 220.0);
    assert.equal(oscs[2].frequency.events[0].val, 146.83);
  });

  it('playTimerTick normal (659Hz) ve acil (1046Hz) durumlarda doğru metronom uyarısı üretir', () => {
    const mockCtx = createMockAudioContext('running');
    const engine = new SoundEngine(mockCtx);

    // Normal tick (4-5 sn kala)
    engine.playTimerTick(false);
    let oscs = mockCtx._getCreatedOscillators();
    assert.equal(oscs.length, 1);
    assert.equal(oscs[0].type, 'triangle');
    assert.equal(oscs[0].frequency.events[0].val, 659.25);

    // Acil tick (<= 3 sn kala)
    engine.playTimerTick(true);
    oscs = mockCtx._getCreatedOscillators();
    assert.equal(oscs.length, 2);
    assert.equal(oscs[1].frequency.events[0].val, 1046.5);
  });

  it('playUIClick hafif ve kısa dokunsal arayüz tıkı üretir', () => {
    const mockCtx = createMockAudioContext('running');
    const engine = new SoundEngine(mockCtx);
    engine.playUIClick();

    const oscs = mockCtx._getCreatedOscillators();
    assert.equal(oscs.length, 1);
    assert.equal(oscs[0].type, 'sine');
    assert.equal(oscs[0].frequency.events[0].val, 1200);
    assert.equal(oscs[0].frequency.events[1].val, 1800);
  });
});

