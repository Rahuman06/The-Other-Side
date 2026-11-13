export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

export const ANIMATION = {
  MOVE_DURATION: 120, // Character movement: ~120 ms
  DOOR_DURATION: 150, // Door transition: ~150 ms
  CHECKPOINT_DURATION: 200, // Checkpoint feedback: ~200 ms
  SCREEN_FADE_DURATION: 200, // Screen transition: ~200 ms
  EASE: 'Quad.easeOut',
} as const;

export const PALETTE = {
  real: {
    background: 0xffffff,
    backgroundHex: '#FFFFFF',
    character: 0x080808,
    characterHex: '#080808',
    walls: 0x171717,
    wallsHex: '#171717',
    floor: 0xf2f2f2,
    floorHex: '#F2F2F2',
    text: '#171717',
    secondary: 0x888888,
    secondaryHex: '#888888',
  },
  shadow: {
    background: 0x101010,
    backgroundHex: '#101010',
    character: 0xffffff,
    characterHex: '#FFFFFF',
    walls: 0xf2f2f2,
    wallsHex: '#F2F2F2',
    floor: 0x171717,
    floorHex: '#171717',
    text: '#FFFFFF',
    secondary: 0xaaaaaa,
    secondaryHex: '#AAAAAA',
  },
  divider: 0x333333,
  dividerHex: '#333333',
} as const;
