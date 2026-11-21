import type Phaser from 'phaser';
import { BootScene } from '../scenes/BootScene';
import { PreloadScene } from '../scenes/PreloadScene';
import { MenuScene } from '../rendering/MenuScene';
import { GameScene } from '../scenes/GameScene';
import { EndingScene } from '../scenes/EndingScene';
import { GAME_WIDTH, GAME_HEIGHT } from './constants';

export * from './constants';

export function getResponsiveDimensions(): { width: number; height: number } {
  const baseH = GAME_HEIGHT; // 720
  if (typeof window === 'undefined') {
    return { width: GAME_WIDTH, height: baseH };
  }
  const screenW = window.innerWidth || GAME_WIDTH;
  const screenH = window.innerHeight || baseH;
  // Compute aspect ratio clamped between 1.33 (4:3 tablets) and 2.4 (ultra-wide 21:9 phones)
  const aspect = Math.max(1.33, Math.min(2.4, screenW / screenH));
  const width = Math.round(baseH * aspect);
  return { width, height: baseH };
}

export const createGameConfig = (): Phaser.Types.Core.GameConfig => {
  const { width, height } = getResponsiveDimensions();
  return {
    type: 0, // Phaser.AUTO = 0
    parent: 'game-container',
    width,
    height,
    backgroundColor: '#000000',
    scale: {
      mode: 3, // Phaser.Scale.FIT = 3
      autoCenter: 1, // Phaser.Scale.CENTER_BOTH = 1
    },
    render: {
      pixelArt: false,
      antialias: true,
      powerPreference: 'high-performance',
      desynchronized: true,
      transparent: false,
    },
    // Disable Phaser's duplicate WebAudio manager to prevent hardware buffer contention on mobile
    audio: {
      noAudio: true,
    },
    scene: [BootScene, PreloadScene, MenuScene, GameScene, EndingScene],
    fps: {
      target: 60,
      forceSetTimeOut: false,
    },
  };
};

