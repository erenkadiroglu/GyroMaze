import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  isEditableElement,
  isGameOverStatus,
  executeDesktopShortcut,
  handleDesktopKeyDown,
} from '../src/utils/keyboardShortcutsListenerUtils.ts';

describe('keyboardShortcutsListenerUtils — Klavye Dinleyici ve Eylem Dağıtıcı', () => {
  test('isEditableElement: form girişlerini ve düzenlenebilir alanları tespit eder', () => {
    assert.equal(isEditableElement({ tagName: 'INPUT' }), true);
    assert.equal(isEditableElement({ tagName: 'textarea' }), true);
    assert.equal(isEditableElement({ tagName: 'SELECT' }), true);
    assert.equal(isEditableElement({ tagName: 'DIV', isContentEditable: true }), true);

    assert.equal(isEditableElement({ tagName: 'DIV' }), false);
    assert.equal(isEditableElement({ tagName: 'BUTTON' }), false);
    assert.equal(isEditableElement(null), false);
    assert.equal(isEditableElement(undefined), false);
  });

  test('isGameOverStatus: oyun sonlanma durumlarını doğrular', () => {
    assert.equal(isGameOverStatus('won'), true);
    assert.equal(isGameOverStatus('lost'), true);
    assert.equal(isGameOverStatus('playing'), false);
    assert.equal(isGameOverStatus('idle'), false);
    assert.equal(isGameOverStatus(null), false);
    assert.equal(isGameOverStatus(undefined), false);
  });

  test('executeDesktopShortcut: yardım, sıfırlama ve kamera eylemlerini doğru dağıtır', () => {
    let helpState = false;
    let resetCount = 0;
    let cameraCount = 0;

    const handlers = {
      onHelpToggle: (val) => { helpState = val; },
      onBallReset: () => { resetCount++; },
      onCycleCamera: () => { cameraCount++; },
      onToggleMute: () => {},
      onToggleTheme: () => {},
      onOpenEditor: () => {},
      onOpenLeaderboard: () => {},
      onOpenPairing: () => {},
      onCalibrate: () => {},
      onSetLevel: () => {},
    };

    const resHelp = executeDesktopShortcut('help', handlers, false);
    assert.equal(resHelp.shouldPreventDefault, true);
    assert.equal(resHelp.executed, true);
    assert.equal(helpState, true);

    const resReset = executeDesktopShortcut('reset', handlers, false);
    assert.equal(resReset.shouldPreventDefault, false);
    assert.equal(resReset.executed, true);
    assert.equal(resetCount, 1);

    const resCamera = executeDesktopShortcut('camera', handlers, false);
    assert.equal(resCamera.shouldPreventDefault, false);
    assert.equal(resCamera.executed, true);
    assert.equal(cameraCount, 1);
  });

  test('executeDesktopShortcut: modal açma ve bölüm geçiş eylemlerini yürütür', () => {
    let editorOpened = false;
    let leaderboardOpened = false;
    let pairingOpened = false;
    let selectedLevel = 0;

    const handlers = {
      onHelpToggle: () => {},
      onBallReset: () => {},
      onCycleCamera: () => {},
      onToggleMute: () => {},
      onToggleTheme: () => {},
      onOpenEditor: () => { editorOpened = true; },
      onOpenLeaderboard: () => { leaderboardOpened = true; },
      onOpenPairing: () => { pairingOpened = true; },
      onCalibrate: () => {},
      onSetLevel: (lvl) => { selectedLevel = lvl; },
    };

    assert.equal(executeDesktopShortcut('editor', handlers, false).shouldPreventDefault, true);
    assert.equal(editorOpened, true);

    assert.equal(executeDesktopShortcut('leaderboard', handlers, false).shouldPreventDefault, true);
    assert.equal(leaderboardOpened, true);

    assert.equal(executeDesktopShortcut('pairing', handlers, false).shouldPreventDefault, true);
    assert.equal(pairingOpened, true);

    const resLevel = executeDesktopShortcut({ type: 'level', level: 4 }, handlers, false);
    assert.equal(resLevel.shouldPreventDefault, true);
    assert.equal(selectedLevel, 4);
  });

  test('handleDesktopKeyDown: form girdisi odaklıyken kısayolları engeller', () => {
    let resetFired = false;
    const handlers = {
      onHelpToggle: () => {},
      onBallReset: () => { resetFired = true; },
      onCycleCamera: () => {},
      onToggleMute: () => {},
      onToggleTheme: () => {},
      onOpenEditor: () => {},
      onOpenLeaderboard: () => {},
      onOpenPairing: () => {},
      onCalibrate: () => {},
      onSetLevel: () => {},
    };

    const handled = handleDesktopKeyDown(
      { key: 'r', target: { tagName: 'INPUT' } },
      { isAnyOverlayOpen: false, isHelpOpen: false, gameStatus: 'playing' },
      handlers,
    );

    assert.equal(handled, false);
    assert.equal(resetFired, false);
  });

  test('handleDesktopKeyDown: serbest durumdayken kısayolları başarıyla tetikler', () => {
    let resetFired = false;
    let prevented = false;

    const handlers = {
      onHelpToggle: () => {},
      onBallReset: () => { resetFired = true; },
      onCycleCamera: () => {},
      onToggleMute: () => {},
      onToggleTheme: () => {},
      onOpenEditor: () => {},
      onOpenLeaderboard: () => {},
      onOpenPairing: () => {},
      onCalibrate: () => {},
      onSetLevel: () => {},
    };

    const handled = handleDesktopKeyDown(
      {
        key: 'r',
        preventDefault: () => { prevented = true; },
      },
      { isAnyOverlayOpen: false, isHelpOpen: false, gameStatus: 'playing' },
      handlers,
    );

    assert.equal(handled, true);
    assert.equal(resetFired, true);
    assert.equal(prevented, false); // reset için preventDefault gerekmez
  });

  test('handleDesktopKeyDown: yardım tuşunda preventDefault çağrılır', () => {
    let helpOpened = false;
    let prevented = false;

    const handlers = {
      onHelpToggle: (st) => { helpOpened = st; },
      onBallReset: () => {},
      onCycleCamera: () => {},
      onToggleMute: () => {},
      onToggleTheme: () => {},
      onOpenEditor: () => {},
      onOpenLeaderboard: () => {},
      onOpenPairing: () => {},
      onCalibrate: () => {},
      onSetLevel: () => {},
    };

    const handled = handleDesktopKeyDown(
      {
        key: '?',
        preventDefault: () => { prevented = true; },
      },
      { isAnyOverlayOpen: true, isHelpOpen: false, gameStatus: 'playing' },
      handlers,
    );

    assert.equal(handled, true);
    assert.equal(helpOpened, true);
    assert.equal(prevented, true);
  });
});
