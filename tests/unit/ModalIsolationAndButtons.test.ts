import { describe, it, expect, vi, beforeEach } from 'vitest';

// Provide basic window stub for Phaser module loader in Node environment
if (typeof (global as any).window === 'undefined') {
  (global as any).window = {
    addEventListener: () => {},
    removeEventListener: () => {},
    location: { search: '', hostname: 'localhost' },
    navigator: { userAgent: 'node', maxTouchPoints: 0 },
    document: {
      createElement: () => ({ getContext: () => null }),
      documentElement: {},
    },
  };
}

import { KeyboardNavManager } from '../../src/ui/KeyboardNavManager';
import { MobileControlsOverlay } from '../../src/ui/MobileControlsOverlay';
import { Header } from '../../src/ui/Header';

describe('Modal Interaction Isolation & Button Accessibility Tests', () => {
  beforeEach(() => {
    // Reset KeyboardNavManager contexts
    while (KeyboardNavManager.getInstance().getActiveContext()) {
      KeyboardNavManager.getInstance().popContext();
    }
  });

  it('verifies KeyboardNavManager correctly reports isInputTrapped for modal contexts', () => {
    const nav = KeyboardNavManager.getInstance();
    expect(nav.isInputTrapped()).toBe(false);

    // Push pause modal context
    nav.pushContext({
      id: 'pause-modal',
      items: [
        { id: 'resume', getBounds: () => ({ x: 0, y: 0, width: 340, height: 48 }), onActivate: () => {} },
      ],
      selectedIndex: 0,
      trapFocus: true,
    });

    expect(nav.isInputTrapped()).toBe(true);
    expect(nav.hasActiveModal()).toBe(true);

    // Pop context
    nav.popContext('pause-modal');
    expect(nav.isInputTrapped()).toBe(false);
  });

  it('verifies MobileControlsOverlay visibility toggle for modal isolation', () => {
    const overlay = MobileControlsOverlay.getInstance();
    overlay.setVisible(true);
    expect(overlay.visible).toBe(true);

    // Modal opens -> hides controls
    overlay.setVisible(false);
    expect(overlay.visible).toBe(false);

    // Modal closes -> restores controls
    overlay.setVisible(true);
    expect(overlay.visible).toBe(true);
  });

  it('verifies Header setHeaderInteractive disables and enables buttons cleanly', () => {
    const mockContainer: any = {
      add: vi.fn(),
      destroy: vi.fn(),
      setDepth: vi.fn(),
    };
    const mockZone: any = {
      setOrigin: vi.fn().mockReturnThis(),
      setInteractive: vi.fn().mockReturnThis(),
      disableInteractive: vi.fn().mockReturnThis(),
      on: vi.fn().mockReturnThis(),
      active: true,
    };
    const mockGraphics: any = {
      fillStyle: vi.fn().mockReturnThis(),
      fillRect: vi.fn().mockReturnThis(),
      lineStyle: vi.fn().mockReturnThis(),
      lineBetween: vi.fn().mockReturnThis(),
      strokeRoundedRect: vi.fn().mockReturnThis(),
    };
    const mockText: any = {
      setOrigin: vi.fn().mockReturnThis(),
      setText: vi.fn().mockReturnThis(),
      setColor: vi.fn().mockReturnThis(),
    };

    const mockScene: any = {
      add: {
        container: vi.fn().mockReturnValue(mockContainer),
        graphics: vi.fn().mockReturnValue(mockGraphics),
        text: vi.fn().mockReturnValue(mockText),
        zone: vi.fn().mockReturnValue(mockZone),
      },
    };

    const onPause = vi.fn();
    const onRestart = vi.fn();

    const header = new Header(
      mockScene,
      1280,
      {
        chapter: 'The Beginning',
        levelNumber: 1,
        totalLevels: 20,
        levelName: 'Arrival',
      },
      { onPause, onRestart }
    );

    // Initial creation: 2 header buttons (Restart, Pause)
    expect(mockScene.add.zone).toHaveBeenCalledTimes(2);

    // Disabling header interactivity
    header.setHeaderInteractive(false);
    expect(mockZone.disableInteractive).toHaveBeenCalledTimes(2);

    // Re-enabling header interactivity
    header.setHeaderInteractive(true);
    expect(mockZone.setInteractive).toHaveBeenCalledTimes(4); // 2 on init + 2 on re-enable

    header.destroy();
    expect(mockContainer.destroy).toHaveBeenCalledWith(true);
  });
});
