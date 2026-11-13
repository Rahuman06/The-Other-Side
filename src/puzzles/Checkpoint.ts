import { GridPoint, GridPosition } from '../grid/GridPosition';

export interface CheckpointConfig {
  readonly id: string;
  readonly realPosition: GridPosition;
  readonly shadowPosition: GridPosition;
}

export class CheckpointPair {
  public readonly id: string;
  public readonly realPosition: GridPoint;
  public readonly shadowPosition: GridPoint;

  private realVisited: boolean = false;
  private shadowVisited: boolean = false;
  private activated: boolean = false;

  constructor(config: CheckpointConfig) {
    if (!config.id || config.id.trim().length === 0) {
      throw new Error('Checkpoint must have a non-empty unique id');
    }
    this.id = config.id;
    this.realPosition = GridPoint.from(config.realPosition);
    this.shadowPosition = GridPoint.from(config.shadowPosition);
  }

  public get isRealVisited(): boolean {
    return this.realVisited;
  }

  public get isShadowVisited(): boolean {
    return this.shadowVisited;
  }

  public get isActivated(): boolean {
    return this.activated;
  }

  public setVisitState(realVisited: boolean, shadowVisited: boolean, activated: boolean): void {
    this.realVisited = realVisited;
    this.shadowVisited = shadowVisited;
    this.activated = activated;
  }

  /**
   * Evaluates if Player visits the real-world checkpoint.
   * Returns true if this visit completed the pair and activated the checkpoint.
   */
  public checkPlayerVisit(playerPos: GridPosition): boolean {
    if (this.realPosition.equals(playerPos)) {
      this.realVisited = true;
      return this.tryActivate();
    }
    return false;
  }

  /**
   * Evaluates if Shadow visits the shadow-world checkpoint.
   * Returns true if this visit completed the pair and activated the checkpoint.
   */
  public checkShadowVisit(shadowPos: GridPosition): boolean {
    if (this.shadowPosition.equals(shadowPos)) {
      this.shadowVisited = true;
      return this.tryActivate();
    }
    return false;
  }

  private tryActivate(): boolean {
    if (!this.activated && this.realVisited && this.shadowVisited) {
      this.activated = true;
      return true;
    }
    return false;
  }

  public reset(): void {
    this.realVisited = false;
    this.shadowVisited = false;
    this.activated = false;
  }
}
