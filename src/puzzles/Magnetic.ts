import { GridPoint, GridPosition } from '../grid/GridPosition';
import { MoveDirection } from '../engine/MovementEngine';

export interface MovableBlockConfig {
  readonly id: string;
  readonly world: 'real' | 'shadow';
  readonly position: GridPosition;
  readonly magneticType?: 'ATTRACT' | 'REPEL' | 'NEUTRAL';
}

export class MovableBlock {
  public readonly id: string;
  public readonly world: 'real' | 'shadow';
  public readonly magneticType: 'ATTRACT' | 'REPEL' | 'NEUTRAL';
  private currentPosition: GridPoint;
  private readonly initialPosition: GridPoint;

  constructor(config: MovableBlockConfig) {
    if (!config.id || config.id.trim().length === 0) {
      throw new Error('MovableBlock must have a non-empty unique id');
    }
    this.id = config.id;
    this.world = config.world;
    this.initialPosition = GridPoint.from(config.position);
    this.currentPosition = this.initialPosition.clone();
    this.magneticType = config.magneticType ?? 'NEUTRAL';
  }

  public get position(): GridPoint {
    return this.currentPosition;
  }

  public setPosition(pos: GridPosition): void {
    this.currentPosition = GridPoint.from(pos);
  }

  public reset(): void {
    this.currentPosition = this.initialPosition.clone();
  }
}

export interface MagneticFieldConfig {
  readonly id: string;
  readonly world: 'real' | 'shadow';
  readonly position: GridPosition;
  readonly direction: MoveDirection;
  readonly polarity: 'ATTRACT' | 'REPEL';
  readonly range?: number;
  readonly initialActive?: boolean;
  readonly linkedSwitchId?: string;
}

export class MagneticField {
  public readonly id: string;
  public readonly world: 'real' | 'shadow';
  public readonly position: GridPoint;
  public readonly direction: MoveDirection;
  public readonly polarity: 'ATTRACT' | 'REPEL';
  public readonly range: number;
  public readonly linkedSwitchId?: string;
  private active: boolean;
  private readonly initialActive: boolean;

  constructor(config: MagneticFieldConfig) {
    if (!config.id || config.id.trim().length === 0) {
      throw new Error('MagneticField must have a non-empty unique id');
    }
    this.id = config.id;
    this.world = config.world;
    this.position = GridPoint.from(config.position);
    this.direction = config.direction;
    this.polarity = config.polarity;
    this.range = config.range ?? 6;
    this.linkedSwitchId = config.linkedSwitchId;
    this.initialActive = config.initialActive ?? true;
    this.active = this.initialActive;
  }

  public get isActive(): boolean {
    return this.active;
  }

  public setActive(active: boolean): void {
    this.active = active;
  }

  public toggle(): void {
    this.active = !this.active;
  }

  public reset(): void {
    this.active = this.initialActive;
  }
}
