import { GridPoint } from './GridPosition';
import { TileType } from './TileType';

export interface DoorData {
  readonly id: string;
  isOpen: boolean;
}

export interface SwitchData {
  readonly id: string;
  readonly targetDoorId: string;
  isActive: boolean;
}

export interface PressurePlateData {
  readonly id: string;
  readonly targetDoorId: string;
  isPressed: boolean;
}

export interface HazardData {
  readonly id: string;
}

export interface CheckpointData {
  readonly id: string;
  isActivated: boolean;
}

export interface GridCellConfig {
  readonly position: GridPoint;
  readonly tileType: TileType;
  readonly door?: DoorData;
  readonly switch?: SwitchData;
  readonly pressurePlate?: PressurePlateData;
  readonly hazard?: HazardData;
  readonly checkpoint?: CheckpointData;
}

export class GridCell {
  public readonly position: GridPoint;
  public tileType: TileType;
  public door?: DoorData;
  public switch?: SwitchData;
  public pressurePlate?: PressurePlateData;
  public hazard?: HazardData;
  public checkpoint?: CheckpointData;

  constructor(config: GridCellConfig) {
    this.position = config.position;
    this.tileType = config.tileType;
    this.door = config.door ? { ...config.door } : undefined;
    this.switch = config.switch ? { ...config.switch } : undefined;
    this.pressurePlate = config.pressurePlate ? { ...config.pressurePlate } : undefined;
    this.hazard = config.hazard ? { ...config.hazard } : undefined;
    this.checkpoint = config.checkpoint ? { ...config.checkpoint } : undefined;
  }

  public isWalkable(): boolean {
    switch (this.tileType) {
      case TileType.WALL:
      case TileType.DESTRUCTIBLE_WALL:
        return false;
      case TileType.DOOR:
        return !!this.door?.isOpen;
      case TileType.FLOOR:
      case TileType.SWITCH:
      case TileType.PRESSURE_PLATE:
      case TileType.HAZARD:
      case TileType.CHECKPOINT:
      case TileType.EXIT:
      case TileType.BOMB:
      case TileType.PORTAL:
      case TileType.COLLAPSING_FLOOR:
      case TileType.MIRROR:
      case TileType.TIME_LOCK:
      case TileType.MAGNETIC_FIELD:
        return true;
      case TileType.LASER_EMITTER:
      case TileType.LASER_RECEIVER:
      case TileType.MOVABLE_BLOCK:
        return false;
      default:
        return false;
    }
  }
}
