import { GridPoint, GridPosition } from '../grid/GridPosition';

export interface PortalDestination {
  readonly targetWorld: 'real' | 'shadow';
  readonly targetPosition: GridPosition;
}

export interface PortalConfig {
  readonly id: string;
  readonly world: 'real' | 'shadow';
  readonly position: GridPosition;
  readonly targetWorld?: 'real' | 'shadow';
  readonly targetPosition?: GridPosition;
  readonly destinations?: readonly PortalDestination[];
  readonly corrupted?: boolean;
  readonly initialActive?: boolean;
  readonly linkedSwitchId?: string;
}

export class Portal {
  public readonly id: string;
  public readonly world: 'real' | 'shadow';
  public readonly position: GridPoint;
  public readonly destinations: readonly PortalDestination[];
  public readonly isCorrupted: boolean;
  public readonly linkedSwitchId?: string;
  private readonly initialActive: boolean;
  private active: boolean;
  private currentDestIndex = 0;

  constructor(config: PortalConfig) {
    if (!config.id || config.id.trim().length === 0) {
      throw new Error('Portal must have a non-empty unique id');
    }
    this.id = config.id;
    this.world = config.world;
    this.position = GridPoint.from(config.position);
    this.isCorrupted = config.corrupted ?? false;
    this.linkedSwitchId = config.linkedSwitchId;
    this.initialActive = config.initialActive ?? true;
    this.active = this.initialActive;

    if (config.destinations && config.destinations.length > 0) {
      this.destinations = config.destinations;
    } else {
      this.destinations = [
        {
          targetWorld: config.targetWorld ?? 'real',
          targetPosition: config.targetPosition ?? config.position,
        },
      ];
    }
  }

  public get isActive(): boolean {
    return this.active;
  }

  public setActive(active: boolean): void {
    this.active = active;
  }

  public get destinationIndex(): number {
    return this.currentDestIndex;
  }

  public setDestinationIndex(index: number): void {
    this.currentDestIndex = index % this.destinations.length;
  }

  public setDestination(dest: PortalDestination): void {
    (this as { destinations: readonly PortalDestination[] }).destinations = [dest];
    this.currentDestIndex = 0;
  }

  public get currentDestination(): PortalDestination {
    return this.destinations[this.currentDestIndex];
  }

  public get targetWorld(): 'real' | 'shadow' {
    return this.currentDestination.targetWorld;
  }

  public get targetPosition(): GridPoint {
    return GridPoint.from(this.currentDestination.targetPosition);
  }

  public onTeleport(): void {
    if (this.destinations.length > 1) {
      this.currentDestIndex = (this.currentDestIndex + 1) % this.destinations.length;
    }
  }

  public reset(): void {
    this.active = this.initialActive;
    this.currentDestIndex = 0;
  }
}
