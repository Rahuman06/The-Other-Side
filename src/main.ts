import Phaser from 'phaser';
import { createGameConfig } from './core/config';
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
  });
}
