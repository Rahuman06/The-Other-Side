import { GridPoint, GridPosition } from '../grid/GridPosition';
import { CollapsingFloorState } from '../types/level';

export interface CollapsingFloorConfig {
  readonly id: string;
  readonly world: 'real' | 'shadow';
  readonly position: GridPosition;
  readonly stepsToCollapse?: number;
}

export class CollapsingFloor {
  public readonly id: string;
  public readonly world: 'real' | 'shadow';
  public readonly position: GridPoint;
  private state: CollapsingFloorState = 'INTACT';
  private wasOccupied = false;

  constructor(config: CollapsingFloorConfig) {
    if (!config.id || config.id.trim().length === 0) {
      throw new Error('CollapsingFloor must have a non-empty unique id');
    }
    this.id = config.id;
    this.world = config.world;
    this.position = GridPoint.from(config.position);
  }

  public get floorState(): CollapsingFloorState {
    return this.state;
  }

  public get isCollapsed(): boolean {
    return this.state === 'COLLAPSED';
  }

  public setState(state: CollapsingFloorState, wasOccupied: boolean): void {
    this.state = state;
    this.wasOccupied = wasOccupied;
  }

  public get isOccupiedMemory(): boolean {
    return this.wasOccupied;
  }

  public updateOccupancy(isCurrentlyOccupied: boolean): void {
    if (this.state === 'COLLAPSED') return;

    if (this.wasOccupied && !isCurrentlyOccupied) {
      this.state = 'COLLAPSED';
      this.wasOccupied = false;
    } else if (isCurrentlyOccupied) {
      this.state = 'CRACKED';
      this.wasOccupied = true;
    }
  }

  public reset(): void {
    this.state = 'INTACT';
    this.wasOccupied = false;
  }
}
