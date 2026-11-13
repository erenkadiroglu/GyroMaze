import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  resolveActiveLevelDescriptor,
  formatDesktopStageAriaLabel,
  formatHomeTelemetrySummary,
  resolveDesktopHomeContainerProps,
  resolveDesktopHomeViewState,
} from '../src/utils/desktopHomeOrchestrationUtils.ts';

describe('desktopHomeOrchestrationUtils — Masaüstü Ana Ekran Orkestrasyon Motoru', () => {
  it('resolveActiveLevelDescriptor özel harita varlığında özel başlık ve isCustom: true döner', () => {
    const desc = resolveActiveLevelDescriptor(2, { title: 'Labirent Ustası' });
    assert.deepEqual(desc, {
      label: 'Labirent Ustası',
      isCustom: true,
    });
  });

  it('resolveActiveLevelDescriptor standart seviye numaralarında doğru etiket ve isCustom: false döner', () => {
    assert.deepEqual(resolveActiveLevelDescriptor(4), {
      label: 'Seviye 4',
      isCustom: false,
    });
  });

  it('resolveActiveLevelDescriptor geçersiz veya eksik girdilerde Seviye 1 varsayılanına döner', () => {
    assert.deepEqual(resolveActiveLevelDescriptor(null), {
      label: 'Seviye 1',
      isCustom: false,
    });
    assert.deepEqual(resolveActiveLevelDescriptor(undefined), {
      label: 'Seviye 1',
      isCustom: false,
    });
    assert.deepEqual(resolveActiveLevelDescriptor(0), {
      label: 'Seviye 1',
      isCustom: false,
    });
    assert.deepEqual(resolveActiveLevelDescriptor(-3), {
      label: 'Seviye 1',
      isCustom: false,
    });
    assert.deepEqual(resolveActiveLevelDescriptor(Number.NaN), {
      label: 'Seviye 1',
      isCustom: false,
    });
  });

  it('formatDesktopStageAriaLabel standart ve özel harita durumlarında doğru erişilebilir etiket üretir', () => {
    assert.equal(
      formatDesktopStageAriaLabel(3),
      'GyroMaze Masaüstü 3B Labirent Sahnesi — Seviye 3',
    );
    assert.equal(
      formatDesktopStageAriaLabel(1, { title: 'Neon Gece' }),
      'GyroMaze Masaüstü 3B Labirent Sahnesi — Özel: Neon Gece',
    );
    assert.equal(
      formatDesktopStageAriaLabel(null),
      'GyroMaze Masaüstü 3B Labirent Sahnesi — Seviye 1',
    );
  });

  it('formatHomeTelemetrySummary tek oyunculu modda doğru özet üretir', () => {
    const summary = formatHomeTelemetrySummary({
      level: 2,
      gameMode: 'classic',
      isMultiplayer: false,
    });
    assert.equal(summary, 'Seviye 2 | Tek Oyunculu | Mod: classic');
  });

  it('formatHomeTelemetrySummary çok oyunculu ve oda kodu varlığında doğru özet üretir', () => {
    const summary = formatHomeTelemetrySummary({
      level: 1,
      gameMode: 'timeAttack',
      isMultiplayer: true,
      roomCode: 'WM3ACZ',
    });
    assert.equal(summary, 'Seviye 1 | Çok Oyunculu (Oda: WM3ACZ) | Mod: timeAttack');
  });

  it('formatHomeTelemetrySummary çok oyunculu ancak oda kodu yokken Oda Yok olarak belirtir', () => {
    const summary = formatHomeTelemetrySummary({
      level: 5,
      isMultiplayer: true,
      roomCode: null,
    });
    assert.equal(summary, 'Seviye 5 | Çok Oyunculu (Oda Yok) | Mod: classic');
  });

  it('resolveDesktopHomeContainerProps tüm semantik ve denetim özniteliklerini döner', () => {
    const props = resolveDesktopHomeContainerProps({
      level: 3,
      gameMode: 'classic',
      isMultiplayer: true,
      roomCode: 'ABC123',
    });

    assert.equal(props.role, 'main');
    assert.match(props.className, /relative h-screen w-screen/);
    assert.equal(
      props['aria-label'],
      'GyroMaze Masaüstü 3B Labirent Sahnesi — Seviye 3',
    );
    assert.equal(props['data-level'], 3);
    assert.equal(props['data-mode'], 'classic');
    assert.equal(props['data-multiplayer'], true);
    assert.equal(props['data-room'], 'ABC123');
    assert.equal(props['data-custom'], false);
  });

  it('resolveDesktopHomeViewState entegre orkestrasyon durumunu eksiksiz birleştirir', () => {
    const state = resolveDesktopHomeViewState({
      level: 2,
      customLevel: { title: 'Hızlı Parkur' },
      gameMode: 'timeAttack',
      isMultiplayer: false,
    });

    assert.equal(state.descriptor.isCustom, true);
    assert.equal(state.descriptor.label, 'Hızlı Parkur');
    assert.equal(
      state.stageAriaLabel,
      'GyroMaze Masaüstü 3B Labirent Sahnesi — Özel: Hızlı Parkur',
    );
    assert.equal(
      state.telemetrySummary,
      'Hızlı Parkur | Tek Oyunculu | Mod: timeAttack',
    );
    assert.deepEqual(state.socketConfig, { role: 'host' });
    assert.equal(state.containerProps['data-custom'], true);
    assert.equal(state.containerProps['data-level'], 'Hızlı Parkur');
  });
});

