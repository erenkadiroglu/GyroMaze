import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCelebrationOrigins,
  createDualCelebrationBurst,
  stepCelebrationParticles,
  renderParticle,
} from '../src/utils/celebrationCanvasUtils.ts';

test('celebrationCanvasUtils — Zafer Konfeti Canvas Yardımcıları', async (t) => {
  await t.test('calculateCelebrationOrigins sol ve sağ merkezleri hesaplar', () => {
    const origins = calculateCelebrationOrigins(1000, 800);
    assert.equal(origins.length, 2);
    assert.equal(origins[0].x, 250);
    assert.equal(origins[0].y, 560);
    assert.equal(origins[1].x, 750);
    assert.equal(origins[1].y, 560);
  });

  await t.test('createDualCelebrationBurst her iki kaynaktan parçacıklar üretir', () => {
    const particles = createDualCelebrationBurst(1000, 800, 16);
    assert.equal(particles.length, 32);
    assert.ok(particles[0].x > 0);
    assert.ok(particles[0].y > 0);
  });

  await t.test('stepCelebrationParticles ömrü tükenen parçacıkları eler', () => {
    const p1 = {
      x: 10,
      y: 10,
      vx: 1,
      vy: 1,
      size: 5,
      color: '#fff',
      rotation: 0,
      vRotation: 1,
      opacity: 1,
      decay: 0.1,
    };
    const p2 = {
      x: 20,
      y: 20,
      vx: 1,
      vy: 1,
      size: 5,
      color: '#fff',
      rotation: 0,
      vRotation: 1,
      opacity: 0.05,
      decay: 0.1,
    };

    const next = stepCelebrationParticles([p1, p2], 1);
    assert.equal(next.length, 1);
    assert.equal(next[0], p1);
  });

  await t.test('renderParticle canvas 2b context çağrılarını doğru parametrelerle yapar', () => {
    const calls = [];
    const mockCtx = {
      save: () => calls.push('save'),
      translate: (x, y) => calls.push(`translate:${x},${y}`),
      rotate: (rad) => calls.push(`rotate:${rad}`),
      restore: () => calls.push('restore'),
      fillRect: (x, y, w, h) => calls.push(`fillRect:${x},${y},${w},${h}`),
      globalAlpha: 1,
      fillStyle: '',
    };

    const p = {
      x: 50,
      y: 100,
      vx: 0,
      vy: 0,
      size: 10,
      color: '#ffcc00',
      rotation: 90,
      vRotation: 0,
      opacity: 0.8,
      decay: 0.01,
    };

    renderParticle(mockCtx, p);

    assert.equal(mockCtx.globalAlpha, 0.8);
    assert.equal(mockCtx.fillStyle, '#ffcc00');
    assert.ok(calls.includes('save'));
    assert.ok(calls.includes('translate:50,100'));
    assert.ok(calls.includes('restore'));
  });
});

