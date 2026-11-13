import { GridPoint, GridPosition } from '../grid/GridPosition';

export interface DestructibleWallConfig {
  readonly id: string;
  readonly world: 'real' | 'shadow';
  readonly position: GridPosition;
}

export class DestructibleWall {
  public readonly id: string;
  public readonly world: 'real' | 'shadow';
  public readonly position: GridPoint;
  private destroyed: boolean = false;

  constructor(config: DestructibleWallConfig) {
    if (!config.id || config.id.trim().length === 0) {
      throw new Error('DestructibleWall must have a non-empty unique id');
    }
    this.id = config.id;
    this.world = config.world;
    this.position = GridPoint.from(config.position);
  }

  public get isDestroyed(): boolean {
    return this.destroyed;
  }

  public destroy(): void {
    this.destroyed = true;
  }

  public setDestroyed(state: boolean): void {
    this.destroyed = state;
  }

  public reset(): void {
    this.destroyed = false;
  }
}
