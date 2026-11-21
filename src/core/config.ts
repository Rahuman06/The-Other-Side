import type Phaser from 'phaser';
import { BootScene } from '../scenes/BootScene';
import { PreloadScene } from '../scenes/PreloadScene';
import { CinematicIntroScene } from '../scenes/CinematicIntroScene';
import { MenuScene } from '../rendering/MenuScene';
import { GameScene } from '../scenes/GameScene';
import { EndingScene } from '../scenes/EndingScene';
import { GAME_WIDTH, GAME_HEIGHT } from './constants';

export * from './constants';

/**
 * Returns canonical high-definition 16:9 landscape dimensions (1280 x 720).
 * Phaser's Scale.FIT automatically scales this aspect ratio cleanly to any screen/window,
 * guaranteeing zero text collisions, stable grid dimensions, and perfect look and feel.
 */
export function getResponsiveDimensions(): { width: number; height: number } {
  return { width: GAME_WIDTH, height: GAME_HEIGHT };
}

export const createGameConfig = (): Phaser.Types.Core.GameConfig => {
  return {
    type: 0, // Phaser.AUTO = 0
    parent: 'game-container',
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: '#000000',
    scale: {
      mode: 3, // Phaser.Scale.FIT = 3
      autoCenter: 0, // Centered by CSS flexbox on #game-container with margin: 0 !important
    },
    render: {
      pixelArt: false,
      antialias: true,
      powerPreference: 'high-performance',
      desynchronized: true,
      transparent: true,
    },
    // Disable Phaser's duplicate WebAudio manager to prevent hardware buffer contention on mobile
    audio: {
      noAudio: true,
    },
    scene: [BootScene, PreloadScene, CinematicIntroScene, MenuScene, GameScene, EndingScene],
    fps: {
      target: 60,
      forceSetTimeOut: false,
    },
  };
};

