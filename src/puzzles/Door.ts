import { GridPoint, GridPosition } from '../grid/GridPosition';

export type DoorActivationRule = 'DIRECT' | 'ANY' | 'ALL';

export interface DoorConfig {
  readonly id: string;
  readonly world: 'real' | 'shadow';
  readonly position: GridPosition;
  readonly initialOpen?: boolean;
  readonly activationRule?: DoorActivationRule;
}

export class Door {
  public readonly id: string;
  public readonly world: 'real' | 'shadow';
  public readonly position: GridPoint;
  public readonly initialOpen: boolean;
  public readonly activationRule: DoorActivationRule;
  private open: boolean;

  constructor(config: DoorConfig) {
    if (!config.id || config.id.trim().length === 0) {
      throw new Error('Door must have a non-empty unique id');
    }
    this.id = config.id;
    this.world = config.world;
    this.position = GridPoint.from(config.position);
    this.initialOpen = !!config.initialOpen;
    this.activationRule = config.activationRule ?? 'DIRECT';
    this.open = this.initialOpen;
  }

  public get isOpen(): boolean {
    return this.open;
  }

  public setOpen(open: boolean): void {
    this.open = open;
  }

  public reset(): void {
    this.open = this.initialOpen;
  }
}
