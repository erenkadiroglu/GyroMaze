import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isCelebrationWorthy,
  createParticle,
  createCelebrationBurst,
  stepParticle,
  CELEBRATION_PALETTE,
} from '../src/utils/celebrationParticles.ts';

test('celebrationParticles — Zafer Konfetisi ve Parçacık Fiziği Motoru', async (t) => {
  await t.test('isCelebrationWorthy 3 yıldız veya kişisel rekor durumlarında true döner', () => {
    assert.equal(isCelebrationWorthy(3, false), true);
    assert.equal(isCelebrationWorthy(2, true), true);
    assert.equal(isCelebrationWorthy(1, true), true);
    assert.equal(isCelebrationWorthy(3, true), true);

    // 1 veya 2 yıldız ve rekor yoksa false
    assert.equal(isCelebrationWorthy(2, false), false);
    assert.equal(isCelebrationWorthy(1, false), false);
    assert.equal(isCelebrationWorthy(0, false), false);
  });

  await t.test('createParticle geçerli fizik parametrelerine ve başlangıç değerlerine sahip parçacık üretir', () => {
    const p = createParticle(100, 200, '#e5a93c', 0, 5);
    assert.equal(p.x, 100);
    assert.equal(p.y, 200);
    assert.equal(p.color, '#e5a93c');
    assert.equal(p.opacity, 1);
    assert.ok(p.size >= 4 && p.size <= 9);
    assert.ok(p.gravity > 0);
    assert.ok(p.decay > 0);
  });

  await t.test('createCelebrationBurst istenen adette ve palet renklerinde parçacık dizisi üretir', () => {
    const burst = createCelebrationBurst(250, 400, 30);
    assert.equal(burst.length, 30);

    for (const p of burst) {
      assert.equal(p.x, 250);
      assert.equal(p.y, 400);
      assert.ok(CELEBRATION_PALETTE.includes(p.color));
      assert.equal(p.opacity, 1);
    }

    // Sınır koruması: min 1, max 100
    const clampedMin = createCelebrationBurst(0, 0, 0);
    assert.equal(clampedMin.length, 1);

    const clampedMax = createCelebrationBurst(0, 0, 250);
    assert.equal(clampedMax.length, 100);
  });

  await t.test('stepParticle parçacığın koordinatlarını günceller ve opaklık bitince false döner', () => {
    const p = createParticle(100, 100, '#34d399', 0, 5);
    const initialVy = p.vy;

    const alive = stepParticle(p, 1);
    assert.equal(alive, true);
    assert.ok(p.x > 100); // vx > 0
    assert.ok(p.vy > initialVy); // yerçekimi vy'yi artırır
    assert.ok(p.opacity < 1); // sönümlenir

    // Çok sayıda adım sonrasında tamamen yok olmalı
    let isAlive = true;
    for (let i = 0; i < 200; i++) {
      isAlive = stepParticle(p, 1);
      if (!isAlive) break;
    }
    assert.equal(isAlive, false);
    assert.ok(p.opacity <= 0);
  });
});
