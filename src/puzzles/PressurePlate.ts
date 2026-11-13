import { GridPoint, GridPosition } from '../grid/GridPosition';

export interface PressurePlateConfig {
  readonly id: string;
  readonly world: 'real' | 'shadow';
  readonly position: GridPosition;
  readonly linkedDoorId: string;
}

export class PressurePlate {
  public readonly id: string;
  public readonly world: 'real' | 'shadow';
  public readonly position: GridPoint;
  public readonly linkedDoorId: string;
  private pressed: boolean = false;

  constructor(config: PressurePlateConfig) {
    if (!config.id || config.id.trim().length === 0) {
      throw new Error('Pressure plate must have a non-empty unique id');
    }
    if (!config.linkedDoorId || config.linkedDoorId.trim().length === 0) {
      throw new Error(`Pressure plate "${config.id}" must link to a valid door id`);
    }

    this.id = config.id;
    this.world = config.world;
    this.position = GridPoint.from(config.position);
    this.linkedDoorId = config.linkedDoorId;
  }

  public get isPressed(): boolean {
    return this.pressed;
  }

  public setPressed(pressed: boolean): void {
    this.pressed = pressed;
  }

  public reset(): void {
    this.pressed = false;
  }
}
