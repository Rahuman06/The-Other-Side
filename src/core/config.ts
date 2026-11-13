import type Phaser from 'phaser';
import { BootScene } from '../scenes/BootScene';
import { PreloadScene } from '../scenes/PreloadScene';
import { MenuScene } from '../rendering/MenuScene';
import { GameScene } from '../scenes/GameScene';
import { EndingScene } from '../scenes/EndingScene';
import { GAME_WIDTH, GAME_HEIGHT } from './constants';

export * from './constants';

export const createGameConfig = (): Phaser.Types.Core.GameConfig => ({
  type: 0, // Phaser.AUTO = 0
  parent: 'game-container',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#000000',
  scale: {
    mode: 3, // Phaser.Scale.FIT = 3
    autoCenter: 1, // Phaser.Scale.CENTER_BOTH = 1
  },
  scene: [BootScene, PreloadScene, MenuScene, GameScene, EndingScene],
  fps: {
    target: 60,
    forceSetTimeOut: true,
  },
});

