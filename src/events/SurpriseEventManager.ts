import { WorldGrid } from '../grid/WorldGrid';
import { TileType } from '../grid/TileType';
import { GridPoint, GridPosition } from '../grid/GridPosition';
import { PuzzleManager } from '../puzzles/PuzzleManager';
import {
  SurpriseEventConfig,
  SurpriseEventSnapshot,
  SurpriseEventState,
} from '../types/surprise';

export interface SurpriseManagerCallbacks {
  onSurpriseTriggered?: (event: SurpriseEventConfig) => void;
  onHazardSpawned?: (world: 'real' | 'shadow', pos: GridPosition) => void;
}

export interface SurpriseManagerConfig {
  readonly events?: readonly SurpriseEventConfig[];
  readonly playerGrid: WorldGrid;
  readonly shadowGrid: WorldGrid;
  readonly puzzleManager?: PuzzleManager;
  readonly callbacks?: SurpriseManagerCallbacks;
}

export interface TurnEvaluationContext {
  readonly playerPos: GridPoint;
  readonly shadowPos: GridPoint;
  readonly playerOldPos: GridPoint;
  readonly shadowOldPos: GridPoint;
  readonly turnCount: number;
  readonly realExitPos: GridPoint;
  readonly shadowExitPos: GridPoint;
}

interface RuntimeEventState {
  config: SurpriseEventConfig;
  state: SurpriseEventState;
  delayRemaining: number;
}

function manhattanDistance(a: GridPosition, b: GridPosition): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export class SurpriseEventManager {
  private readonly playerGrid: WorldGrid;
  private readonly shadowGrid: WorldGrid;
  private readonly puzzleManager?: PuzzleManager;
  private callbacks?: SurpriseManagerCallbacks;

  private readonly eventStates: Map<string, RuntimeEventState> = new Map();
  private readonly originalTileTypes: Map<string, TileType> = new Map();
  private readonly dynamicHazardTiles: Set<string> = new Set(); // key: "world:x:y"

  constructor(config: SurpriseManagerConfig) {
    this.playerGrid = config.playerGrid;
    this.shadowGrid = config.shadowGrid;
    this.puzzleManager = config.puzzleManager;
    this.callbacks = config.callbacks;

    for (const ev of config.events ?? []) {
      this.eventStates.set(ev.id, {
        config: ev,
        state: 'PENDING',
        delayRemaining: ev.activationDelay ?? 0,
      });

      // Record pristine original tile types for any modified locations
      if (ev.targetPosition) {
        if (ev.targetWorld === 'real' || ev.targetWorld === 'both') {
          this.recordOriginalTile('real', ev.targetPosition);
        }
        if (ev.targetWorld === 'shadow' || ev.targetWorld === 'both') {
          this.recordOriginalTile('shadow', ev.targetPosition);
        }
      }
      if (ev.secondaryTargetPosition) {
        if (ev.targetWorld === 'real' || ev.targetWorld === 'both') {
          this.recordOriginalTile('real', ev.secondaryTargetPosition);
        }
        if (ev.targetWorld === 'shadow' || ev.targetWorld === 'both') {
          this.recordOriginalTile('shadow', ev.secondaryTargetPosition);
        }
      }
    }
  }

  public setCallbacks(callbacks: SurpriseManagerCallbacks): void {
    this.callbacks = callbacks;
  }

  private recordOriginalTile(world: 'real' | 'shadow', pos: GridPosition): void {
    const key = `${world}:${pos.x}:${pos.y}`;
    if (this.originalTileTypes.has(key)) return;

    const grid = world === 'real' ? this.playerGrid : this.shadowGrid;
    const cell = grid.getCell(pos);
    if (cell) {
      this.originalTileTypes.set(key, cell.tileType);
    }
  }

  public getEvents(): readonly SurpriseEventConfig[] {
    return Array.from(this.eventStates.values()).map((e) => e.config);
  }

  public getEventState(id: string): SurpriseEventState | undefined {
    return this.eventStates.get(id)?.state;
  }

  public isDynamicHazard(world: 'real' | 'shadow', pos: GridPosition): boolean {
    return this.dynamicHazardTiles.has(`${world}:${pos.x}:${pos.y}`);
  }

  /**
   * Main turn evaluation loop. Checks triggers and advances delayed countdowns.
   */
  public evaluateTurn(ctx: TurnEvaluationContext): boolean {
    let triggeredAny = false;

    // 1. Advance delayed ARMED events
    for (const evState of this.eventStates.values()) {
      if (evState.state === 'ARMED') {
        evState.delayRemaining--;
        if (evState.delayRemaining <= 0) {
          this.executeAction(evState);
          triggeredAny = true;
        }
      }
    }

    // 2. Evaluate PENDING events
    for (const evState of this.eventStates.values()) {
      if (evState.state !== 'PENDING') continue;

      const ev = evState.config;
      let matches = false;

      switch (ev.triggerType) {
        case 'STEP_ON': {
          if (!ev.triggerPosition) break;
          const trgPt = GridPoint.from(ev.triggerPosition);
          const checkReal = ev.triggerWorld === 'real' || ev.triggerWorld === 'both' || !ev.triggerWorld;
          const checkShadow = ev.triggerWorld === 'shadow' || ev.triggerWorld === 'both' || !ev.triggerWorld;

          if (checkReal && ctx.playerPos.equals(trgPt)) matches = true;
          if (checkShadow && ctx.shadowPos.equals(trgPt)) matches = true;
          break;
        }

        case 'STEP_OFF': {
          if (!ev.triggerPosition) break;
          const trgPt = GridPoint.from(ev.triggerPosition);
          const checkReal = ev.triggerWorld === 'real' || ev.triggerWorld === 'both' || !ev.triggerWorld;
          const checkShadow = ev.triggerWorld === 'shadow' || ev.triggerWorld === 'both' || !ev.triggerWorld;

          if (checkReal && ctx.playerOldPos.equals(trgPt) && !ctx.playerPos.equals(trgPt)) matches = true;
          if (checkShadow && ctx.shadowOldPos.equals(trgPt) && !ctx.shadowPos.equals(trgPt)) matches = true;
          break;
        }

        case 'PROXIMITY': {
          if (!ev.triggerPosition) break;
          const trgPt = GridPoint.from(ev.triggerPosition);
          const radius = ev.triggerRadius ?? 1;
          const checkReal = ev.triggerWorld === 'real' || ev.triggerWorld === 'both' || !ev.triggerWorld;
          const checkShadow = ev.triggerWorld === 'shadow' || ev.triggerWorld === 'both' || !ev.triggerWorld;

          if (checkReal && manhattanDistance(ctx.playerPos, trgPt) <= radius) matches = true;
          if (checkShadow && manhattanDistance(ctx.shadowPos, trgPt) <= radius) matches = true;
          break;
        }

        case 'EXIT_APPROACH': {
          const checkReal = ev.triggerWorld === 'real' || ev.triggerWorld === 'both' || !ev.triggerWorld;
          const checkShadow = ev.triggerWorld === 'shadow' || ev.triggerWorld === 'both' || !ev.triggerWorld;

          if (checkReal && manhattanDistance(ctx.playerPos, ctx.realExitPos) <= (ev.triggerRadius ?? 1)) matches = true;
          if (checkShadow && manhattanDistance(ctx.shadowPos, ctx.shadowExitPos) <= (ev.triggerRadius ?? 1)) matches = true;
          break;
        }

        case 'TURN_COUNT': {
          if (ctx.turnCount >= (ev.triggerRadius ?? 1)) {
            matches = true;
          }
          break;
        }
      }

      if (matches) {
        const delay = ev.activationDelay ?? 0;
        if (delay > 0) {
          evState.state = 'ARMED';
          evState.delayRemaining = delay;
        } else {
          this.executeAction(evState);
          triggeredAny = true;
        }
      }
    }

    return triggeredAny;
  }

  public notifySwitchToggle(switchId: string, _isActive: boolean): void {
    for (const evState of this.eventStates.values()) {
      if (evState.state !== 'PENDING') continue;
      const ev = evState.config;
      if (ev.triggerType === 'SWITCH_TOGGLE' && ev.triggerSourceId === switchId) {
        const delay = ev.activationDelay ?? 0;
        if (delay > 0) {
          evState.state = 'ARMED';
          evState.delayRemaining = delay;
        } else {
          this.executeAction(evState);
        }
      }
    }
  }

  public notifyPlatePress(plateId: string, isPressed: boolean): void {
    for (const evState of this.eventStates.values()) {
      if (evState.state !== 'PENDING') continue;
      const ev = evState.config;
      if (ev.triggerType === 'PLATE_PRESS' && ev.triggerSourceId === plateId && isPressed) {
        const delay = ev.activationDelay ?? 0;
        if (delay > 0) {
          evState.state = 'ARMED';
          evState.delayRemaining = delay;
        } else {
          this.executeAction(evState);
        }
      }
    }
  }

  public notifyBombDetonated(bombId: string): void {
    for (const evState of this.eventStates.values()) {
      if (evState.state !== 'PENDING') continue;
      const ev = evState.config;
      if (ev.triggerType === 'BOMB_DETONATED' && (!ev.triggerSourceId || ev.triggerSourceId === bombId)) {
        const delay = ev.activationDelay ?? 0;
        if (delay > 0) {
          evState.state = 'ARMED';
          evState.delayRemaining = delay;
        } else {
          this.executeAction(evState);
        }
      }
    }
  }

  private executeAction(evState: RuntimeEventState): void {
    evState.state = 'TRIGGERED';
    const ev = evState.config;

    const worlds: Array<'real' | 'shadow'> = [];
    if (ev.targetWorld === 'real' || ev.targetWorld === 'both') worlds.push('real');
    if (ev.targetWorld === 'shadow' || ev.targetWorld === 'both') worlds.push('shadow');

    for (const w of worlds) {
      const grid = w === 'real' ? this.playerGrid : this.shadowGrid;

      switch (ev.action) {
        case 'SPAWN_WALL': {
          if (ev.targetPosition && grid.isInBounds(ev.targetPosition)) {
            grid.setTileType(ev.targetPosition, TileType.WALL);
          }
          break;
        }

        case 'REMOVE_WALL': {
          if (ev.targetPosition && grid.isInBounds(ev.targetPosition)) {
            grid.setTileType(ev.targetPosition, TileType.FLOOR);
          }
          break;
        }

        case 'SPAWN_HAZARD': {
          if (ev.targetPosition && grid.isInBounds(ev.targetPosition)) {
            grid.setTileType(ev.targetPosition, TileType.HAZARD);
            this.dynamicHazardTiles.add(`${w}:${ev.targetPosition.x}:${ev.targetPosition.y}`);
            this.callbacks?.onHazardSpawned?.(w, ev.targetPosition);
          }
          break;
        }

        case 'REMOVE_HAZARD': {
          if (ev.targetPosition && grid.isInBounds(ev.targetPosition)) {
            grid.setTileType(ev.targetPosition, TileType.FLOOR);
            this.dynamicHazardTiles.delete(`${w}:${ev.targetPosition.x}:${ev.targetPosition.y}`);
          }
          break;
        }

        case 'COLLAPSE_TILE': {
          if (ev.targetPosition && grid.isInBounds(ev.targetPosition)) {
            grid.setTileType(ev.targetPosition, TileType.WALL); // void blocks traversal
          }
          break;
        }

        case 'SHIFT_WALL': {
          if (ev.targetPosition && grid.isInBounds(ev.targetPosition)) {
            grid.setTileType(ev.targetPosition, TileType.FLOOR);
          }
          if (ev.secondaryTargetPosition && grid.isInBounds(ev.secondaryTargetPosition)) {
            grid.setTileType(ev.secondaryTargetPosition, TileType.WALL);
          }
          break;
        }

        case 'ARM_BOMB': {
          if (ev.targetId && this.puzzleManager) {
            const bomb = this.puzzleManager.getBomb(ev.targetId);
            if (bomb) {
              bomb.setState(true, bomb.countdown, false);
            }
          }
          break;
        }

        case 'SHIFT_PORTAL': {
          if (ev.targetId && ev.secondaryTargetPosition && this.puzzleManager) {
            const portal = this.puzzleManager.getPortal(ev.targetId);
            if (portal) {
              portal.setDestination({
                targetWorld: ev.targetWorld === 'both' ? 'real' : (ev.targetWorld as 'real' | 'shadow'),
                targetPosition: ev.secondaryTargetPosition,
              });
            }
          }
          break;
        }

        case 'REVEAL_FAKE_EXIT': {
          if (ev.targetPosition && grid.isInBounds(ev.targetPosition)) {
            grid.setTileType(ev.targetPosition, TileType.FLOOR);
          }
          if (ev.secondaryTargetPosition && grid.isInBounds(ev.secondaryTargetPosition)) {
            grid.setTileType(ev.secondaryTargetPosition, TileType.EXIT);
          }
          break;
        }
      }
    }

    evState.state = 'COMPLETED';
    this.callbacks?.onSurpriseTriggered?.(ev);
  }

  /**
   * Checks if an actor currently stands on a lethal trap spawned by a surprise event.
   */
  public checkLethalCollision(playerPos: GridPoint, shadowPos: GridPoint): boolean {
    if (this.dynamicHazardTiles.has(`real:${playerPos.x}:${playerPos.y}`)) {
      return true;
    }
    if (this.dynamicHazardTiles.has(`shadow:${shadowPos.x}:${shadowPos.y}`)) {
      return true;
    }
    return false;
  }

  /**
   * Captures snapshot for Checkpoint or Solver state restoration.
   */
  public captureSnapshot(): Record<string, SurpriseEventSnapshot> {
    const snap: Record<string, SurpriseEventSnapshot> = {};
    for (const [id, evState] of this.eventStates) {
      snap[id] = {
        state: evState.state,
        delayRemaining: evState.delayRemaining,
      };
    }
    return snap;
  }

  /**
   * Restores event states and applies corresponding tile modifications.
   */
  public restoreSnapshot(snap: Record<string, SurpriseEventSnapshot>): void {
    // 1. Reset all tiles to pristine initial baseline first
    this.revertAllTiles();

    // 2. Re-apply states
    for (const [id, s] of Object.entries(snap)) {
      const evState = this.eventStates.get(id);
      if (!evState) continue;

      evState.state = s.state;
      evState.delayRemaining = s.delayRemaining;

      // If it was already triggered/completed in this snapshot, apply the action
      if (s.state === 'TRIGGERED' || s.state === 'COMPLETED') {
        this.executeAction(evState);
      }
    }
  }

  public serialize(): string {
    return Array.from(this.eventStates.entries())
      .map(([id, st]) => `${id}:${st.state}:${st.delayRemaining}`)
      .join('|');
  }

  public reset(): void {
    this.revertAllTiles();
    for (const evState of this.eventStates.values()) {
      evState.state = 'PENDING';
      evState.delayRemaining = evState.config.activationDelay ?? 0;
    }
  }

  private revertAllTiles(): void {
    this.dynamicHazardTiles.clear();
    for (const [key, origType] of this.originalTileTypes) {
      const [w, xStr, yStr] = key.split(':');
      const pos = { x: parseInt(xStr, 10), y: parseInt(yStr, 10) };
      const grid = w === 'real' ? this.playerGrid : this.shadowGrid;
      if (grid.isInBounds(pos)) {
        grid.setTileType(pos, origType);
      }
    }
  }
}
