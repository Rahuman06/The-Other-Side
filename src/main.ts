import Phaser from 'phaser';
import { createGameConfig } from './core/config';
import { pokiBridge } from './poki/PokiIntegration';

export function initializeGame(): Phaser.Game {
  return new Phaser.Game(createGameConfig());
}

if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', async () => {
    await pokiBridge.init();
    initializeGame();
  });
}
