import type Phaser from 'phaser';
import { BootScene } from '../scenes/BootScene';
import { PreloadScene } from '../scenes/PreloadScene';
import { CinematicIntroScene } from '../scenes/CinematicIntroScene';
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

  // Use visualViewport if available for true visible screen area in mobile browsers
  const vv = window.visualViewport;
  const rawW = vv ? vv.width : (window.innerWidth || GAME_WIDTH);
  const rawH = vv ? vv.height : (window.innerHeight || baseH);

  // Since THE OTHER SIDE is designed strictly for landscape orientation:
  // If the device is in portrait (e.g. mobile startup before rotation),
  // anticipate landscape orientation by using the larger dimension as width and smaller as height.
  // This guarantees the game canvas is immediately initialized with the full landscape aspect ratio
  // rather than being clamped to an artificial 4:3 box.
  const isLandscape = rawW >= rawH;
  const screenW = isLandscape ? rawW : rawH;
  const screenH = isLandscape ? rawH : rawW;

  // Clamped between 1.33 (4:3 tablets) and 2.4 (ultra-wide 21:9 phones)
  const aspect = Math.max(1.33, Math.min(2.4, screenW / Math.max(1, screenH)));
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
      autoCenter: 0, // Phaser.Scale.NO_CENTER = 0 (Centering is cleanly handled by CSS flexbox on #game-container with margin:0)
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
    scene: [BootScene, PreloadScene, CinematicIntroScene, MenuScene, GameScene, EndingScene],
    fps: {
      target: 60,
      forceSetTimeOut: false,
    },
  };
};

