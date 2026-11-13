import { GridPosition, GridPoint } from '../grid/GridPosition';
import { TileType } from '../grid/TileType';
import { WorldGrid } from '../grid/WorldGrid';
import { PuzzleManager } from '../puzzles/PuzzleManager';

export interface CollisionResult {
  readonly canEnter: boolean;
  readonly isBlocked: boolean;
  readonly isHazard: boolean;
  readonly isCheckpoint: boolean;
  readonly isExit: boolean;
  readonly isSwitch: boolean;
  readonly isPressurePlate: boolean;
  readonly tileType: TileType | null;
}

export type ExitBehavior = 'LOCK_ON_ARRIVAL' | 'SIMULTANEOUS';

export interface DualWorldCollisionConfig {
  readonly playerGrid: WorldGrid;
  readonly shadowGrid: WorldGrid;
  readonly puzzleManager?: PuzzleManager;
  readonly exitBehavior?: ExitBehavior;
}

export interface LegacyCollisionConfig {
  readonly width: number;
  readonly height: number;
  readonly playerWalls?: readonly GridPosition[];
  readonly shadowWalls?: readonly GridPosition[];
  readonly puzzleManager?: PuzzleManager;
  readonly exitBehavior?: ExitBehavior;
}

export type CollisionEngineConfig = DualWorldCollisionConfig | LegacyCollisionConfig;

export class CollisionEngine {
  public readonly playerGrid: WorldGrid;
  public readonly shadowGrid: WorldGrid;
  public puzzleManager?: PuzzleManager;
  public readonly exitBehavior: ExitBehavior;

  constructor(config: CollisionEngineConfig) {
    this.puzzleManager = config.puzzleManager;
    this.exitBehavior = config.exitBehavior ?? 'LOCK_ON_ARRIVAL';

    if ('playerGrid' in config && 'shadowGrid' in config) {
      this.playerGrid = config.playerGrid;
      this.shadowGrid = config.shadowGrid;
    } else {
      this.playerGrid = new WorldGrid({ width: config.width, height: config.height });
      this.shadowGrid = new WorldGrid({ width: config.width, height: config.height });

      for (const w of config.playerWalls ?? []) {
        if (this.playerGrid.isInBounds(w)) {
          this.playerGrid.setTileType(w, TileType.WALL);
        }
      }

      for (const w of config.shadowWalls ?? []) {
        if (this.shadowGrid.isInBounds(w)) {
          this.shadowGrid.setTileType(w, TileType.WALL);
        }
      }
    }
  }

  public get width(): number {
    return this.playerGrid.width;
  }

  public get height(): number {
    return this.playerGrid.height;
  }

  /**
   * Evaluates destination tile for the Player in the Real World.
   * `fromPos` is optional; when supplied, enables edge case handling where a character
   * already standing inside a door cell when it closes can leave after it closes.
   */
  public evaluatePlayerDestination(
    target: GridPosition,
    isAlreadyAtExit: boolean,
    fromPos?: GridPosition
  ): CollisionResult {
    return this.evaluateCell('real', this.playerGrid, target, isAlreadyAtExit, fromPos);
  }

  /**
   * Evaluates destination tile for the Shadow in the Shadow World.
   */
  public evaluateShadowDestination(
    target: GridPosition,
    isAlreadyAtExit: boolean,
    fromPos?: GridPosition
  ): CollisionResult {
    return this.evaluateCell('shadow', this.shadowGrid, target, isAlreadyAtExit, fromPos);
  }

  public isPlayerDestinationFree(
    target: GridPosition,
    isAlreadyAtExit: boolean,
    fromPos?: GridPosition
  ): boolean {
    return this.evaluatePlayerDestination(target, isAlreadyAtExit, fromPos).canEnter;
  }

  public isShadowDestinationFree(
    target: GridPosition,
    isAlreadyAtExit: boolean,
    fromPos?: GridPosition
  ): boolean {
    return this.evaluateShadowDestination(target, isAlreadyAtExit, fromPos).canEnter;
  }

  private evaluateCell(
    world: 'real' | 'shadow',
    grid: WorldGrid,
    target: GridPosition,
    isAlreadyAtExit: boolean,
    fromPos?: GridPosition
  ): CollisionResult {
    // In LOCK_ON_ARRIVAL mode: character already at exit cannot move further
    if (this.exitBehavior === 'LOCK_ON_ARRIVAL' && isAlreadyAtExit) {
      return {
        canEnter: false,
        isBlocked: true,
        isHazard: false,
        isCheckpoint: false,
        isExit: true,
        isSwitch: false,
        isPressurePlate: false,
        tileType: TileType.EXIT,
      };
    }

    const pt = GridPoint.from(target);

    // Out-of-bounds cells must always block movement
    if (!grid.isInBounds(pt)) {
      return {
        canEnter: false,
        isBlocked: true,
        isHazard: false,
        isCheckpoint: false,
        isExit: false,
        isSwitch: false,
        isPressurePlate: false,
        tileType: null,
      };
    }

    const cell = grid.getCell(pt);
    if (!cell) {
      return {
        canEnter: false,
        isBlocked: true,
        isHazard: false,
        isCheckpoint: false,
        isExit: false,
        isSwitch: false,
        isPressurePlate: false,
        tileType: null,
      };
    }

    const door = this.puzzleManager?.getDoorAt(world, pt);
    const sw = this.puzzleManager?.getSwitchAt(world, pt);
    const plate = this.puzzleManager?.getPressurePlateAt(world, pt);
    const destructibleWall = this.puzzleManager?.getDestructibleWallAt(world, pt);
    const collapsingFloor = this.puzzleManager?.getCollapsingFloorAt(world, pt);
    const movingHazard = this.puzzleManager?.getMovingHazardAt(world, pt);
    const movableBlock = this.puzzleManager?.getMovableBlockAt(world, pt);

    if (movableBlock) {
      return {
        canEnter: false,
        isBlocked: true,
        isHazard: false,
        isCheckpoint: false,
        isExit: false,
        isSwitch: false,
        isPressurePlate: false,
        tileType: TileType.MOVABLE_BLOCK,
      };
    }

    if (destructibleWall) {
      if (!destructibleWall.isDestroyed) {
        return {
          canEnter: false,
          isBlocked: true,
          isHazard: false,
          isCheckpoint: false,
          isExit: false,
          isSwitch: false,
          isPressurePlate: false,
          tileType: TileType.DESTRUCTIBLE_WALL,
        };
      }
    }

    if (collapsingFloor && collapsingFloor.isCollapsed) {
      return {
        canEnter: false,
        isBlocked: true,
        isHazard: false,
        isCheckpoint: false,
        isExit: false,
        isSwitch: false,
        isPressurePlate: false,
        tileType: TileType.COLLAPSING_FLOOR,
      };
    }

    const isExit = cell.tileType === TileType.EXIT;
    const isHazard = cell.tileType === TileType.HAZARD || !!movingHazard;
    const isCheckpoint = cell.tileType === TileType.CHECKPOINT;
    const isSwitch = cell.tileType === TileType.SWITCH || !!sw;
    const isPressurePlate = cell.tileType === TileType.PRESSURE_PLATE || !!plate;
    const isDoor = cell.tileType === TileType.DOOR || !!door;

    let canEnter = destructibleWall?.isDestroyed ? true : cell.isWalkable();

    // Check PuzzleManager door blocking rules (with exit allowance for occupying characters)
    if (isDoor && this.puzzleManager) {
      const from = fromPos ?? target;
      const isBlockedByDoor = this.puzzleManager.isDoorBlocking(world, from, target);
      canEnter = !isBlockedByDoor;
    }

    const effectiveTileType = isDoor
      ? TileType.DOOR
      : isSwitch
        ? TileType.SWITCH
        : isPressurePlate
          ? TileType.PRESSURE_PLATE
          : cell.tileType;

    if (!canEnter) {
      return {
        canEnter: false,
        isBlocked: true,
        isHazard,
        isCheckpoint,
        isExit,
        isSwitch,
        isPressurePlate,
        tileType: effectiveTileType,
      };
    }

    return {
      canEnter: true,
      isBlocked: false,
      isHazard,
      isCheckpoint,
      isExit,
      isSwitch,
      isPressurePlate,
      tileType: effectiveTileType,
    };
  }
}
