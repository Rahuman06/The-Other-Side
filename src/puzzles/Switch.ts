import { GridPoint, GridPosition } from '../grid/GridPosition';

export type SwitchActivationBehavior = 'TOGGLE' | 'ACTIVATE_ONLY';

export interface SwitchConfig {
  readonly id: string;
  readonly world: 'real' | 'shadow';
  readonly position: GridPosition;
  readonly linkedDoorId: string;
  readonly initialActive?: boolean;
  readonly activationBehavior?: SwitchActivationBehavior;
}

export class Switch {
  public readonly id: string;
  public readonly world: 'real' | 'shadow';
  public readonly position: GridPoint;
  public readonly linkedDoorId: string;
  public readonly initialActive: boolean;
  public readonly activationBehavior: SwitchActivationBehavior;
  private active: boolean;

  constructor(config: SwitchConfig) {
    if (!config.id || config.id.trim().length === 0) {
      throw new Error('Switch must have a non-empty unique id');
    }
    if (!config.linkedDoorId || config.linkedDoorId.trim().length === 0) {
      throw new Error(`Switch "${config.id}" must link to a valid door id`);
    }

    this.id = config.id;
    this.world = config.world;
    this.position = GridPoint.from(config.position);
    this.linkedDoorId = config.linkedDoorId;
    this.initialActive = !!config.initialActive;
    this.activationBehavior = config.activationBehavior ?? 'TOGGLE';
    this.active = this.initialActive;
  }

  public get isActive(): boolean {
    return this.active;
  }

  public setActive(active: boolean): void {
    this.active = active;
  }

  public onEnter(): boolean {
    if (this.activationBehavior === 'TOGGLE') {
      this.active = !this.active;
    } else {
      this.active = true;
    }
    return this.active;
  }

  public reset(): void {
    this.active = this.initialActive;
  }
}
