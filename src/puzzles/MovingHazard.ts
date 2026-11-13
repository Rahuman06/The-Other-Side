import { GridPoint, GridPosition } from '../grid/GridPosition';

export interface MovingHazardConfig {
  readonly id: string;
  readonly world: 'real' | 'shadow';
  readonly path: readonly GridPosition[];
  readonly initialIndex?: number;
}

export class MovingHazard {
  public readonly id: string;
  public readonly world: 'real' | 'shadow';
  public readonly path: readonly GridPoint[];
  private currentIndex = 0;
  private readonly initialIndex: number;

  constructor(config: MovingHazardConfig) {
    if (!config.id || config.id.trim().length === 0) {
      throw new Error('MovingHazard must have a non-empty unique id');
    }
    if (!config.path || config.path.length < 2) {
      throw new Error(`MovingHazard "${config.id}" path must have at least 2 waypoints`);
    }
    this.id = config.id;
    this.world = config.world;
    this.path = config.path.map((p) => GridPoint.from(p));
    this.initialIndex = (config.initialIndex ?? 0) % this.path.length;
    this.currentIndex = this.initialIndex;
  }

  public get position(): GridPoint {
    return this.path[this.currentIndex];
  }

  public get pathIndex(): number {
    return this.currentIndex;
  }

  public advance(): GridPoint {
    this.currentIndex = (this.currentIndex + 1) % this.path.length;
    return this.position;
  }

  public setPathIndex(index: number): void {
    this.currentIndex = index % this.path.length;
  }

  public reset(): void {
    this.currentIndex = this.initialIndex;
  }
}
