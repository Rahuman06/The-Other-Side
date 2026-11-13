export enum TileType {
  FLOOR = 'FLOOR',
  WALL = 'WALL',
  SWITCH = 'SWITCH',
  PRESSURE_PLATE = 'PRESSURE_PLATE',
  DOOR = 'DOOR',
  HAZARD = 'HAZARD',
  CHECKPOINT = 'CHECKPOINT',
  EXIT = 'EXIT',
  BOMB = 'BOMB',
  DESTRUCTIBLE_WALL = 'DESTRUCTIBLE_WALL',
  PORTAL = 'PORTAL',
  COLLAPSING_FLOOR = 'COLLAPSING_FLOOR',
  LASER_EMITTER = 'LASER_EMITTER',
  LASER_RECEIVER = 'LASER_RECEIVER',
  MIRROR = 'MIRROR',
  TIME_LOCK = 'TIME_LOCK',
  MOVABLE_BLOCK = 'MOVABLE_BLOCK',
  MAGNETIC_FIELD = 'MAGNETIC_FIELD',
}

export const VALID_TILE_TYPES = new Set<string>(Object.values(TileType));

export function isTileType(value: unknown): value is TileType {
  return typeof value === 'string' && VALID_TILE_TYPES.has(value);
}
