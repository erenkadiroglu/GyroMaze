import test from 'node:test';
import assert from 'node:assert/strict';
import {
  shouldShowInsecureWarning,
  resolveInsecureContextNotice,
  resolveSensorActionAriaLabels,
  INSECURE_CONTEXT_MESSAGE,
} from '../src/utils/sensorCardUtils.ts';

test('sensorCardUtils — Mobil Sensör İzni ve Güvenlik Uyarı Kuralları', async (t) => {
  await t.test('shouldShowInsecureWarning isInsecureContext durumuna göre doğru boolean döner', () => {
    assert.equal(shouldShowInsecureWarning(true), true);
    assert.equal(shouldShowInsecureWarning(false), false);
  });

  await t.test('resolveInsecureContextNotice güvensiz bağlamda doğru uyarı metnini döner', () => {
    assert.equal(resolveInsecureContextNotice(true), INSECURE_CONTEXT_MESSAGE);
    assert.equal(resolveInsecureContextNotice(false), null);
  });

  await t.test('resolveSensorActionAriaLabels erişilebilirlik metinlerini eksiksiz üretir', () => {
    const labels = resolveSensorActionAriaLabels();
    assert.equal(typeof labels.activateSensorsLabel, 'string');
    assert.equal(typeof labels.touchModeLabel, 'string');
    assert.match(labels.activateSensorsLabel, /jiroskop/i);
    assert.match(labels.touchModeLabel, /gimbal/i);
  });
});

