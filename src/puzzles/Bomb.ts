import { GridPoint, GridPosition } from '../grid/GridPosition';
import { BombTriggerType } from '../types/level';

export interface BombConfig {
  readonly id: string;
  readonly world: 'real' | 'shadow';
  readonly position: GridPosition;
  readonly timer: number;
  readonly radius?: number;
  readonly crossWorld?: boolean;
  readonly triggerType?: BombTriggerType;
  readonly linkedSwitchId?: string;
}

export class Bomb {
  public readonly id: string;
  public readonly world: 'real' | 'shadow';
  public readonly position: GridPoint;
  public readonly initialTimer: number;
  public readonly radius: number;
  public readonly crossWorld: boolean;
  public readonly triggerType: BombTriggerType;
  public readonly linkedSwitchId?: string;

  private active: boolean = false;
  private currentTimer: number;
  private detonated: boolean = false;
  private activatedThisTurn: boolean = false;

  constructor(config: BombConfig) {
    if (!config.id || config.id.trim().length === 0) {
      throw new Error('Bomb must have a non-empty unique id');
    }
    this.id = config.id;
    this.world = config.world;
    this.position = GridPoint.from(config.position);
    this.initialTimer = Math.max(1, config.timer);
    this.currentTimer = this.initialTimer;
    this.radius = config.radius ?? 1;
    this.crossWorld = config.crossWorld ?? true;
    this.triggerType = config.triggerType ?? 'STEP';
    this.linkedSwitchId = config.linkedSwitchId;

    if (this.triggerType === 'IMMEDIATE') {
      this.active = true;
    }
  }

  public get isActive(): boolean {
    return this.active;
  }

  public get isDetonated(): boolean {
    return this.detonated;
  }

  public get countdown(): number {
    return this.currentTimer;
  }

  public activate(): void {
    if (!this.detonated && !this.active) {
      this.active = true;
      this.activatedThisTurn = true;
    }
  }

  public setState(active: boolean, timer: number, detonated: boolean): void {
    this.active = active;
    this.currentTimer = timer;
    this.detonated = detonated;
    this.activatedThisTurn = false;
  }

  /**
   * Ticks the countdown down by 1 turn if active.
   * Returns true if detonation occurs on this tick.
   */
  public tick(): boolean {
    if (!this.active || this.detonated) {
      return false;
    }
    if (this.activatedThisTurn) {
      this.activatedThisTurn = false;
      return false;
    }
    this.currentTimer -= 1;
    if (this.currentTimer <= 0) {
      this.detonated = true;
      this.active = false;
      return true;
    }
    return false;
  }

  public forceDetonate(): void {
    this.detonated = true;
    this.active = false;
    this.currentTimer = 0;
    this.activatedThisTurn = false;
  }

  public reset(): void {
    this.active = this.triggerType === 'IMMEDIATE';
    this.detonated = false;
    this.currentTimer = this.initialTimer;
    this.activatedThisTurn = false;
  }

  /**
   * Computes the Manhattan blast zone coordinates for this bomb.
   */
  public getBlastCoordinates(): GridPoint[] {
    const coords: GridPoint[] = [];
    const cx = this.position.x;
    const cy = this.position.y;

    for (let dx = -this.radius; dx <= this.radius; dx++) {
      for (let dy = -this.radius; dy <= this.radius; dy++) {
        if (Math.abs(dx) + Math.abs(dy) <= this.radius) {
          coords.push(new GridPoint(cx + dx, cy + dy));
        }
      }
    }
    return coords;
  }
}
