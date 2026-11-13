import { GridPoint, GridPosition } from '../grid/GridPosition';

export interface TimeLockConfig {
  readonly id: string;
  readonly world: 'real' | 'shadow';
  readonly position: GridPosition;
  readonly duration: number;
  readonly linkedDoorId?: string;
  readonly targetHazardIds?: readonly string[];
}

export class TimeLock {
  public readonly id: string;
  public readonly world: 'real' | 'shadow';
  public readonly position: GridPoint;
  public readonly duration: number;
  public readonly linkedDoorId?: string;
  public readonly targetHazardIds?: readonly string[];
  private remainingTurns = 0;

  constructor(config: TimeLockConfig) {
    if (!config.id || config.id.trim().length === 0) {
      throw new Error('TimeLock must have a non-empty unique id');
    }
    if (config.duration <= 0) {
      throw new Error(`TimeLock duration must be positive: got ${config.duration}`);
    }
    this.id = config.id;
    this.world = config.world;
    this.position = GridPoint.from(config.position);
    this.duration = config.duration;
    this.linkedDoorId = config.linkedDoorId;
    this.targetHazardIds = config.targetHazardIds;
  }

  public get isActive(): boolean {
    return this.remainingTurns > 0;
  }

  public get turnsLeft(): number {
    return this.remainingTurns;
  }

  public activate(): void {
    this.remainingTurns = this.duration;
  }

  public tick(): void {
    if (this.remainingTurns > 0) {
      this.remainingTurns--;
    }
  }

  public setState(remaining: number): void {
    this.remainingTurns = Math.max(0, remaining);
  }

  public reset(): void {
    this.remainingTurns = 0;
  }
}
