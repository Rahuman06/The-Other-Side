import { Position, Direction } from '../types/game.js';

export class GridUtils {
  public static isSamePosition(a: Position, b: Position): boolean {
    return a.x === b.x && a.y === b.y;
  }

  public static toKey(pos: Position): string {
    return `${pos.x},${pos.y}`;
  }

  public static fromKey(key: string): Position {
    const parts = key.split(',');
    if (parts.length !== 2) {
      throw new Error(`Invalid coordinate key: "${key}"`);
    }
    const x = Number(parts[0]);
    const y = Number(parts[1]);
    if (Number.isNaN(x) || Number.isNaN(y)) {
      throw new Error(`Invalid coordinate numbers in key: "${key}"`);
    }
    return { x, y };
  }

  public static isInBounds(pos: Position, width: number, height: number): boolean {
    return pos.x >= 0 && pos.x < width && pos.y >= 0 && pos.y < height;
  }

  public static getRealTargetPosition(current: Position, direction: Direction): Position {
    switch (direction) {
      case 'up':
        return { x: current.x, y: current.y - 1 };
      case 'down':
        return { x: current.x, y: current.y + 1 };
      case 'left':
        return { x: current.x - 1, y: current.y };
      case 'right':
        return { x: current.x + 1, y: current.y };
    }
  }

  public static getShadowTargetPosition(current: Position, direction: Direction): Position {
    // When the player moves right: Shadow moves one cell left.
    // When the player moves left: Shadow moves one cell right.
    // Vertical movement is parallel (up is up, down is down).
    switch (direction) {
      case 'up':
        return { x: current.x, y: current.y - 1 };
      case 'down':
        return { x: current.x, y: current.y + 1 };
      case 'left':
        return { x: current.x + 1, y: current.y };
      case 'right':
        return { x: current.x - 1, y: current.y };
    }
  }
}
