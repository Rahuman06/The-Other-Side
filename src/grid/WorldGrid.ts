import { GridPoint, GridPosition } from './GridPosition';
import { TileType } from './TileType';
import { GridCell, GridCellConfig } from './GridCell';

export interface WorldGridConfig {
  readonly width: number;
  readonly height: number;
  readonly cellSize?: number;
  readonly defaultTileType?: TileType;
}

export class WorldGrid {
  public readonly width: number;
  public readonly height: number;
  public readonly cellSize: number;
  private readonly cells: Map<string, GridCell> = new Map();

  constructor(config: WorldGridConfig) {
    if (!Number.isInteger(config.width) || config.width <= 0) {
      throw new Error(`Grid width must be a positive integer: got ${config.width}`);
    }
    if (!Number.isInteger(config.height) || config.height <= 0) {
      throw new Error(`Grid height must be a positive integer: got ${config.height}`);
    }

    this.width = config.width;
    this.height = config.height;
    this.cellSize = config.cellSize ?? 64;

    const defaultType = config.defaultTileType ?? TileType.FLOOR;

    // Initialize all cells to default type (FLOOR)
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const pt = new GridPoint(x, y);
        this.cells.set(pt.toKey(), new GridCell({ position: pt, tileType: defaultType }));
      }
    }
  }

  public isInBounds(pos: GridPosition): boolean {
    return pos.x >= 0 && pos.x < this.width && pos.y >= 0 && pos.y < this.height;
  }

  public getCell(pos: GridPosition): GridCell | null {
    if (!this.isInBounds(pos)) {
      return null;
    }
    const key = GridPoint.from(pos).toKey();
    return this.cells.get(key) ?? null;
  }

  public setCell(config: GridCellConfig): void {
    if (!this.isInBounds(config.position)) {
      throw new Error(`Cannot set cell out of bounds: (${config.position.x}, ${config.position.y})`);
    }
    const key = config.position.toKey();
    this.cells.set(key, new GridCell(config));
  }

  public setTileType(pos: GridPosition, type: TileType): void {
    const cell = this.getCell(pos);
    if (!cell) {
      throw new Error(`Cannot set tile type out of bounds: (${pos.x}, ${pos.y})`);
    }
    cell.tileType = type;
  }

  public getTileType(pos: GridPosition): TileType | null {
    const cell = this.getCell(pos);
    return cell ? cell.tileType : null;
  }

  public isWalkable(pos: GridPosition): boolean {
    const cell = this.getCell(pos);
    if (!cell) {
      // Out-of-bounds cells must always block movement
      return false;
    }
    return cell.isWalkable();
  }

  public setDoorState(doorId: string, isOpen: boolean): boolean {
    let found = false;
    for (const cell of this.cells.values()) {
      if (cell.tileType === TileType.DOOR && cell.door && cell.door.id === doorId) {
        cell.door.isOpen = isOpen;
        found = true;
      }
    }
    return found;
  }

  public getAllCells(): readonly GridCell[] {
    return Array.from(this.cells.values());
  }
}
