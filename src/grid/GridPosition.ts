export interface GridPosition {
  readonly x: number; // column
  readonly y: number; // row
}

export class GridPoint implements GridPosition {
  public readonly x: number;
  public readonly y: number;

  constructor(x: number, y: number) {
    if (!Number.isInteger(x) || !Number.isInteger(y)) {
      throw new Error(`GridPosition coordinates must be integers: got (${x}, ${y})`);
    }
    this.x = x;
    this.y = y;
  }

  public equals(other: GridPosition): boolean {
    return this.x === other.x && this.y === other.y;
  }

  public isInBounds(width: number, height: number): boolean {
    return this.x >= 0 && this.x < width && this.y >= 0 && this.y < height;
  }

  public clone(): GridPoint {
    return new GridPoint(this.x, this.y);
  }

  public toString(): string {
    return `(${this.x}, ${this.y})`;
  }

  public toKey(): string {
    return `${this.x},${this.y}`;
  }

  public static from(pos: GridPosition): GridPoint {
    return new GridPoint(pos.x, pos.y);
  }

  public static isSame(a: GridPosition, b: GridPosition): boolean {
    return a.x === b.x && a.y === b.y;
  }
}
