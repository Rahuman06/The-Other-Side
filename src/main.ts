import Phaser from 'phaser';
import { createGameConfig, getResponsiveDimensions } from './core/config';
import { pokiBridge } from './poki/PokiIntegration';

export function initializeGame(): Phaser.Game {
  return new Phaser.Game(createGameConfig());
}

if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', async () => {
    await pokiBridge.init();
    const game = initializeGame();
    (window as any).__PHASER_GAME__ = game;
    (window as any).game = game;

    // Dynamically adjust internal canvas aspect ratio on browser resize or device rotation
    const checkResize = () => {
      if (!game || !game.scale) return;
      const { width, height } = getResponsiveDimensions();
      if (game.scale.width !== width || game.scale.height !== height) {
        game.scale.setGameSize(width, height);
      }
      game.scale.refresh();
    };

    let resizeTimer: number | null = null;
    const triggerResponsiveUpdate = () => {
      checkResize();
      if (resizeTimer) window.clearTimeout(resizeTimer);
      // Schedule follow-ups to catch delayed mobile layout reflows (e.g. Android Chrome address bar and orientation animation)
      resizeTimer = window.setTimeout(checkResize, 150);
      window.setTimeout(checkResize, 400);
    };

    window.addEventListener('resize', triggerResponsiveUpdate, { passive: true });
    window.addEventListener('orientationchange', triggerResponsiveUpdate, { passive: true });
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', triggerResponsiveUpdate, { passive: true });
    }

    // Modern layout observer for container bounds
    const container = document.getElementById('game-container');
    if (container && typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(() => checkResize());
      ro.observe(container);
    }
  });
}
