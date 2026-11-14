import { describe, it, expect, beforeEach } from 'vitest';
import { KeyboardNavManager, FocusableItem } from '../../src/ui/KeyboardNavManager';
import { MobileControlsOverlay } from '../../src/ui/MobileControlsOverlay';
import { MoveDirection } from '../../src/engine/MovementEngine';

function makeKeyEvent(key: string, shiftKey = false): KeyboardEvent {
  return {
    key,
    shiftKey,
    defaultPrevented: false,
    preventDefault: () => {},
    stopPropagation: () => {},
  } as unknown as KeyboardEvent;
}

describe('Phase 13 — Windows Keyboard Navigation & Accessibility', () => {
  let nav: KeyboardNavManager;

  beforeEach(() => {
    nav = KeyboardNavManager.getInstance();
    nav.reset();
  });

  it('navigates 1D linear menu with ArrowDown and ArrowUp with wrap-around', () => {
    const activated: string[] = [];
    const items: FocusableItem[] = [
      { id: 'item-0', getBounds: () => ({ x: 0, y: 0, width: 100, height: 40 }), onActivate: () => activated.push('0') },
      { id: 'item-1', getBounds: () => ({ x: 0, y: 50, width: 100, height: 40 }), onActivate: () => activated.push('1') },
      { id: 'item-2', getBounds: () => ({ x: 0, y: 100, width: 100, height: 40 }), onActivate: () => activated.push('2') },
    ];

    nav.pushContext({
      id: 'test-menu',
      items,
      selectedIndex: 0,
    });

    expect(nav.getSelectedIndex()).toBe(0);

    // ArrowDown advances to index 1
    nav.handleKeyDown(makeKeyEvent('ArrowDown'));
    expect(nav.getSelectedIndex()).toBe(1);

    // ArrowDown advances to index 2
    nav.handleKeyDown(makeKeyEvent('ArrowDown'));
    expect(nav.getSelectedIndex()).toBe(2);

    // ArrowDown wraps to index 0
    nav.handleKeyDown(makeKeyEvent('ArrowDown'));
    expect(nav.getSelectedIndex()).toBe(0);

    // ArrowUp wraps to index 2
    nav.handleKeyDown(makeKeyEvent('ArrowUp'));
    expect(nav.getSelectedIndex()).toBe(2);
  });

  it('cycles through items with Tab and Shift+Tab', () => {
    const items: FocusableItem[] = [
      { id: 'btn-1', getBounds: () => ({ x: 0, y: 0, width: 50, height: 30 }), onActivate: () => {} },
      { id: 'btn-2', getBounds: () => ({ x: 0, y: 40, width: 50, height: 30 }), onActivate: () => {} },
    ];

    nav.pushContext({
      id: 'test-tab',
      items,
      selectedIndex: 0,
    });

    nav.handleKeyDown(makeKeyEvent('Tab', false));
    expect(nav.getSelectedIndex()).toBe(1);

    nav.handleKeyDown(makeKeyEvent('Tab', true));
    expect(nav.getSelectedIndex()).toBe(0);
  });

  it('activates focused item on Enter and Space', () => {
    const activations: string[] = [];
    const items: FocusableItem[] = [
      { id: 'play', getBounds: () => ({ x: 0, y: 0, width: 100, height: 40 }), onActivate: () => activations.push('play') },
      { id: 'settings', getBounds: () => ({ x: 0, y: 50, width: 100, height: 40 }), onActivate: () => activations.push('settings') },
    ];

    nav.pushContext({
      id: 'test-activate',
      items,
      selectedIndex: 1,
    });

    nav.handleKeyDown(makeKeyEvent('Enter'));
    expect(activations).toEqual(['settings']);

    nav.handleKeyDown(makeKeyEvent(' '));
    expect(activations).toEqual(['settings', 'settings']);
  });

  it('handles 2D grid navigation correctly with gridCols', () => {
    // 3 columns x 2 rows (6 items)
    const items: FocusableItem[] = Array.from({ length: 6 }, (_, i) => ({
      id: `grid-${i}`,
      getBounds: () => ({ x: (i % 3) * 60, y: Math.floor(i / 3) * 60, width: 50, height: 50 }),
      onActivate: () => {},
    }));

    nav.pushContext({
      id: 'test-grid',
      items,
      selectedIndex: 0,
      gridCols: 3,
    });

    // ArrowRight: 0 -> 1
    nav.handleKeyDown(makeKeyEvent('ArrowRight'));
    expect(nav.getSelectedIndex()).toBe(1);

    // ArrowDown: 1 -> 4
    nav.handleKeyDown(makeKeyEvent('ArrowDown'));
    expect(nav.getSelectedIndex()).toBe(4);

    // ArrowLeft: 4 -> 3
    nav.handleKeyDown(makeKeyEvent('ArrowLeft'));
    expect(nav.getSelectedIndex()).toBe(3);

    // ArrowUp: 3 -> 0
    nav.handleKeyDown(makeKeyEvent('ArrowUp'));
    expect(nav.getSelectedIndex()).toBe(0);
  });

  it('traps focus inside modal and executes onEscape on Escape key', () => {
    let escaped = false;
    const items: FocusableItem[] = [
      { id: 'close', getBounds: () => ({ x: 0, y: 0, width: 50, height: 30 }), onActivate: () => {} },
    ];

    nav.pushContext({
      id: 'pause-modal',
      items,
      selectedIndex: 0,
      trapFocus: true,
      onEscape: () => {
        escaped = true;
      },
    });

    expect(nav.isInputTrapped()).toBe(true);

    const handled = nav.handleKeyDown(makeKeyEvent('Escape'));
    expect(handled).toBe(true);
    expect(escaped).toBe(true);
  });

  it('restores previous context when popping context stack', () => {
    const parentItems: FocusableItem[] = [
      { id: 'p1', getBounds: () => ({ x: 0, y: 0, width: 10, height: 10 }), onActivate: () => {} },
    ];
    const childItems: FocusableItem[] = [
      { id: 'c1', getBounds: () => ({ x: 0, y: 0, width: 10, height: 10 }), onActivate: () => {} },
    ];

    nav.pushContext({ id: 'parent', items: parentItems, selectedIndex: 0 });
    expect(nav.getActiveContext()?.id).toBe('parent');

    nav.pushContext({ id: 'child', items: childItems, selectedIndex: 0 });
    expect(nav.getActiveContext()?.id).toBe('child');

    nav.popContext('child');
    expect(nav.getActiveContext()?.id).toBe('parent');
  });
});

describe('Phase 13 — Mobile Responsive Overlay Architecture', () => {
  it('instantiates singleton and registers direction callbacks cleanly', () => {
    const overlay = MobileControlsOverlay.getInstance();
    expect(overlay).toBeDefined();

    const moves: string[] = [];
    overlay.setCallbacks({
      onDirection: (dir: MoveDirection) => moves.push(dir),
      onRestart: () => moves.push('restart'),
      onPause: () => moves.push('pause'),
    });

    // Callbacks registered without throwing
    expect(typeof overlay.setVisible).toBe('function');
  });
});
