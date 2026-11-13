import { GridPoint, GridPosition } from '../grid/GridPosition';
import { MoveDirection } from '../engine/MovementEngine';
import { MirrorOrientation } from '../types/level';

export interface LaserEmitterConfig {
  readonly id: string;
  readonly world: 'real' | 'shadow';
  readonly position: GridPosition;
  readonly direction: MoveDirection;
  readonly initialActive?: boolean;
  readonly linkedSwitchId?: string;
}

export class LaserEmitter {
  public readonly id: string;
  public readonly world: 'real' | 'shadow';
  public readonly position: GridPoint;
  public readonly direction: MoveDirection;
  public readonly linkedSwitchId?: string;
  private active: boolean;
  private readonly initialActive: boolean;

  constructor(config: LaserEmitterConfig) {
    if (!config.id || config.id.trim().length === 0) {
      throw new Error('LaserEmitter must have a non-empty unique id');
    }
    this.id = config.id;
    this.world = config.world;
    this.position = GridPoint.from(config.position);
    this.direction = config.direction;
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

  public reset(): void {
    this.active = this.initialActive;
  }
}

export interface LaserReceiverConfig {
  readonly id: string;
  readonly world: 'real' | 'shadow';
  readonly position: GridPosition;
  readonly linkedDoorId: string;
}

export class LaserReceiver {
  public readonly id: string;
  public readonly world: 'real' | 'shadow';
  public readonly position: GridPoint;
  public readonly linkedDoorId: string;
  private powered = false;

  constructor(config: LaserReceiverConfig) {
    if (!config.id || config.id.trim().length === 0) {
      throw new Error('LaserReceiver must have a non-empty unique id');
    }
    this.id = config.id;
    this.world = config.world;
    this.position = GridPoint.from(config.position);
    this.linkedDoorId = config.linkedDoorId;
  }

  public get isPowered(): boolean {
    return this.powered;
  }

  public setPowered(powered: boolean): void {
    this.powered = powered;
  }

  public reset(): void {
    this.powered = false;
  }
}

export interface LaserMirrorConfig {
  readonly id: string;
  readonly world: 'real' | 'shadow';
  readonly position: GridPosition;
  readonly orientation: MirrorOrientation;
  readonly rotatable?: boolean;
  readonly linkedSwitchId?: string;
}

export class LaserMirror {
  public readonly id: string;
  public readonly world: 'real' | 'shadow';
  public readonly position: GridPoint;
  public readonly rotatable: boolean;
  public readonly linkedSwitchId?: string;
  private currentOrientation: MirrorOrientation;
  private readonly initialOrientation: MirrorOrientation;

  constructor(config: LaserMirrorConfig) {
    if (!config.id || config.id.trim().length === 0) {
      throw new Error('LaserMirror must have a non-empty unique id');
    }
    this.id = config.id;
    this.world = config.world;
    this.position = GridPoint.from(config.position);
    this.initialOrientation = config.orientation;
    this.currentOrientation = this.initialOrientation;
    this.rotatable = config.rotatable ?? false;
    this.linkedSwitchId = config.linkedSwitchId;
  }

  public get orientation(): MirrorOrientation {
    return this.currentOrientation;
  }

  public setOrientation(orientation: MirrorOrientation): void {
    this.currentOrientation = orientation;
  }

  public rotate(): void {
    this.currentOrientation = this.currentOrientation === '/' ? '\\' : '/';
  }

  public reflect(incomingDir: MoveDirection): MoveDirection | null {
    if (this.currentOrientation === '/') {
      switch (incomingDir) {
        case 'right': return 'up';
        case 'down': return 'left';
        case 'left': return 'down';
        case 'up': return 'right';
      }
    } else {
      // Orientation is '\'
      switch (incomingDir) {
        case 'right': return 'down';
        case 'up': return 'left';
        case 'left': return 'up';
        case 'down': return 'right';
      }
    }
    return null;
  }

  public reset(): void {
    this.currentOrientation = this.initialOrientation;
  }
}

export interface BeamSegment {
  readonly from: GridPoint;
  readonly to: GridPoint;
  readonly world: 'real' | 'shadow';
}

export interface LaserSimulationResult {
  readonly beamSegments: readonly BeamSegment[];
  readonly lethalTiles: ReadonlySet<string>; // 'world:x:y'
  readonly poweredReceiverIds: ReadonlySet<string>;
}
