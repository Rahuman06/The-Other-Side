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
    let resizeTimer: number | null = null;
    const handleViewportChange = () => {
      if (resizeTimer) window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        const { width, height } = getResponsiveDimensions();
        if (game.scale && (game.scale.width !== width || game.scale.height !== height)) {
          game.scale.resize(width, height);
        }
      }, 80);
    };

    window.addEventListener('resize', handleViewportChange, { passive: true });
    window.addEventListener('orientationchange', handleViewportChange, { passive: true });
  });
}
