import test from 'node:test';
import assert from 'node:assert/strict';
import {
  APP_META_TITLE,
  APP_META_DESCRIPTION,
  getAppMetadataTitle,
  getAppMetadataDescription,
  getViewportThemeColors,
  resolveHtmlAttributes,
  resolveRootBodyClasses,
  DEFAULT_ROOT_BODY_CLASSES,
} from '../src/utils/layoutMetadataUtils.ts';

test('layoutMetadataUtils — Kök Yerleşim ve Üstveri (Metadata/Viewport) Yardımcıları', async (t) => {
  await t.test('getAppMetadataTitle Türkçe ve doğru başlığı döner', () => {
    assert.equal(getAppMetadataTitle(), APP_META_TITLE);
    assert.ok(getAppMetadataTitle().includes('GyroMaze'));
    assert.ok(getAppMetadataTitle().includes('Telefonunla'));
    assert.ok(getAppMetadataTitle().includes('Labirent'));
  });

  await t.test('getAppMetadataDescription çok oyunculu ve gecikmesiz vurgusunu içerir', () => {
    assert.equal(getAppMetadataDescription(), APP_META_DESCRIPTION);
    assert.ok(getAppMetadataDescription().includes('3B labirent'));
    assert.ok(getAppMetadataDescription().includes('gecikmesiz'));
  });

  await t.test('getViewportThemeColors koyu ve açık tema renk eşleşmelerini döner', () => {
    const colors = getViewportThemeColors();
    assert.equal(colors.length, 2);
    assert.equal(colors[0].media, '(prefers-color-scheme: dark)');
    assert.equal(colors[0].color, '#0f1a2b');
    assert.equal(colors[1].media, '(prefers-color-scheme: light)');
    assert.equal(colors[1].color, '#e9eef5');
  });

  await t.test('resolveHtmlAttributes dil ve tema özniteliklerini formatlar', () => {
    const darkAttrs = resolveHtmlAttributes('dark');
    assert.equal(darkAttrs.lang, 'tr');
    assert.equal(darkAttrs['data-scheme'], 'dark');
    assert.equal(darkAttrs.suppressHydrationWarning, true);

    const lightAttrs = resolveHtmlAttributes('light');
    assert.equal(lightAttrs['data-scheme'], 'light');

    const defaultAttrs = resolveHtmlAttributes();
    assert.equal(defaultAttrs['data-scheme'], 'dark');
  });

  await t.test('resolveRootBodyClasses varsayılan ve özel sınıfları birleştirir', () => {
    assert.equal(resolveRootBodyClasses(), DEFAULT_ROOT_BODY_CLASSES);
    assert.equal(resolveRootBodyClasses(''), DEFAULT_ROOT_BODY_CLASSES);
    assert.equal(resolveRootBodyClasses('   '), DEFAULT_ROOT_BODY_CLASSES);

    const withCustom = resolveRootBodyClasses('overflow-hidden custom-layout');
    assert.equal(withCustom, `${DEFAULT_ROOT_BODY_CLASSES} overflow-hidden custom-layout`);
  });
});

