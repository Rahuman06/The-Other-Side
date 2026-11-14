import { LevelDefinition, CollapsingFloorState, MirrorOrientation } from '../types/level';
import { TileType } from '../grid/TileType';
import { SurpriseEventSnapshot } from '../types/surprise';
import { MoveDirection } from '../engine/MovementEngine';
import { PortalDestination } from '../puzzles/Portal';
import { LevelFactory, BuiltLevelSession } from '../levels/LevelFactory';
import { InversionStateSnapshot } from '../engine/InversionEngine';
import { TurnGameState } from '../engine/TurnEngine';
import { GridPoint } from '../grid/GridPosition';
import { LevelValidator, SchemaValidationResult } from './LevelValidator';

export type Direction = MoveDirection;

export interface SolverOptions {
  readonly maxStates?: number;
  readonly maxDepth?: number;
}

export interface SolverResult {
  readonly levelId: number;
  readonly levelName: string;
  readonly chapter: string;
  readonly schemaValid: boolean;
  readonly schemaErrors: readonly string[];
  readonly solutionFound: boolean;
  readonly solutionLength: number;
  readonly solutionSequence: readonly Direction[];
  readonly exploredStateCount: number;
  readonly searchLimitReached: boolean;
  readonly errorDetails: string | null;
  readonly replayVerified: boolean;
}

interface SolverStateSnapshot {
  readonly playerPos: GridPoint;
  readonly shadowPos: GridPoint;
  readonly doorStates: Record<string, boolean>;
  readonly switchStates: Record<string, boolean>;
  readonly plateStates: Record<string, boolean>;
  readonly bombStates: Record<string, { active: boolean; timer: number; detonated: boolean }>;
  readonly destructibleWallStates: Record<string, boolean>;
  readonly portalStates: Record<
    string,
    {
      active: boolean;
      destIndex: number;
      destinations: readonly PortalDestination[];
    }
  >;
  readonly movingHazardStates: Record<string, number>;
  readonly collapsingFloorStates: Record<string, { state: string; occupied: boolean }>;
  readonly emitterStates?: Record<string, boolean>;
  readonly mirrorStates?: Record<string, MirrorOrientation>;
  readonly timeLockStates?: Record<string, number>;
  readonly blockStates?: Record<string, GridPoint>;
  readonly magnetStates?: Record<string, boolean>;
  readonly cpStates: Record<string, { real: boolean; shadow: boolean; activated: boolean }>;
  readonly surpriseStates?: Record<string, SurpriseEventSnapshot>;
  readonly inversionState?: InversionStateSnapshot;
  readonly realTiles?: readonly TileType[];
  readonly shadowTiles?: readonly TileType[];
  readonly gameState: TurnGameState;
}

interface QueueNode {
  readonly snapshot: SolverStateSnapshot;
  readonly actions: Direction[];
}

const ALL_DIRECTIONS: readonly Direction[] = ['up', 'right', 'down', 'left'];

export class LevelSolver {
  /**
   * Serializes the authoritative game state into a canonical string key.
   * Encodes player & shadow coordinates, exit status, switches, doors, plates, bombs, destructible walls, portals, and checkpoints.
   */
  public static serializeState(session: BuiltLevelSession): string {
    const p = session.player;
    const s = session.shadow;
    const doors = session.puzzleManager
      .getAllDoors()
      .map((d) => `${d.id}:${d.isOpen ? 1 : 0}`)
      .join(';');
    const switches = session.puzzleManager
      .getAllSwitches()
      .map((sw) => `${sw.id}:${sw.isActive ? 1 : 0}`)
      .join(';');
    const plates = session.puzzleManager
      .getAllPressurePlates()
      .map((pl) => `${pl.id}:${pl.isPressed ? 1 : 0}`)
      .join(';');
    const bombs = session.puzzleManager
      .getAllBombs()
      .map((b) => `${b.id}:${b.isActive ? 1 : 0}:${b.countdown}:${b.isDetonated ? 1 : 0}`)
      .join(';');
    const walls = session.puzzleManager
      .getAllDestructibleWalls()
      .map((w) => `${w.id}:${w.isDestroyed ? 1 : 0}`)
      .join(';');
    const portals = session.puzzleManager
      .getAllPortals()
      .map(
        (por) =>
          `${por.id}:${por.isActive ? 1 : 0}:${por.destinationIndex}:${por.targetWorld}:${por.targetPosition.x},${por.targetPosition.y}`
      )
      .join(';');
    const saws = session.puzzleManager
      .getAllMovingHazards()
      .map((saw) => `${saw.id}:${saw.pathIndex}`)
      .join(';');
    const floors = session.puzzleManager
      .getAllCollapsingFloors()
      .map((fl) => `${fl.id}:${fl.floorState}:${fl.isOccupiedMemory ? 1 : 0}`)
      .join(';');
    const emitters = session.puzzleManager
      .getAllLaserEmitters()
      .map((le) => `${le.id}:${le.isActive ? 1 : 0}`)
      .join(';');
    const mirrors = session.puzzleManager
      .getAllLaserMirrors()
      .map((lm) => `${lm.id}:${lm.orientation}`)
      .join(';');
    const timeLocks = session.puzzleManager
      .getAllTimeLocks()
      .map((tl) => `${tl.id}:${tl.turnsLeft}`)
      .join(';');
    const blocks = session.puzzleManager
      .getAllMovableBlocks()
      .map((mb) => `${mb.id}:${mb.position.x},${mb.position.y}`)
      .join(';');
    const magnets = session.puzzleManager
      .getAllMagneticFields()
      .map((mf) => `${mf.id}:${mf.isActive ? 1 : 0}`)
      .join(';');
    const cps = session.checkpoints
      .map(
        (cp) =>
          `${cp.id}:${cp.isRealVisited ? 1 : 0}:${cp.isShadowVisited ? 1 : 0}:${cp.isActivated ? 1 : 0}`
      )
      .join(';');

    const se = session.surpriseManager ? session.surpriseManager.serialize() : '';
    const inv = session.inversionEngine
      ? `${session.inversionEngine.isRealInverted() ? 1 : 0}:${session.inversionEngine.isShadowInverted() ? 1 : 0}`
      : '0:0';

    return `P(${p.position.x},${p.position.y},${p.isAtExit() ? 1 : 0})|S(${s.position.x},${s.position.y},${s.isAtExit() ? 1 : 0})|D[${doors}]|SW[${switches}]|PL[${plates}]|B[${bombs}]|DW[${walls}]|POR[${portals}]|SAW[${saws}]|FL[${floors}]|LE[${emitters}]|LM[${mirrors}]|TL[${timeLocks}]|MB[${blocks}]|MF[${magnets}]|CP[${cps}]|SE[${se}]|INV[${inv}]`;
  }

  public static captureSnapshot(session: BuiltLevelSession): SolverStateSnapshot {
    const doorStates: Record<string, boolean> = {};
    for (const d of session.puzzleManager.getAllDoors()) {
      doorStates[d.id] = d.isOpen;
    }
    const switchStates: Record<string, boolean> = {};
    for (const sw of session.puzzleManager.getAllSwitches()) {
      switchStates[sw.id] = sw.isActive;
    }
    const plateStates: Record<string, boolean> = {};
    for (const pl of session.puzzleManager.getAllPressurePlates()) {
      plateStates[pl.id] = pl.isPressed;
    }
    const bombStates: Record<string, { active: boolean; timer: number; detonated: boolean }> = {};
    for (const b of session.puzzleManager.getAllBombs()) {
      bombStates[b.id] = { active: b.isActive, timer: b.countdown, detonated: b.isDetonated };
    }
    const destructibleWallStates: Record<string, boolean> = {};
    for (const dw of session.puzzleManager.getAllDestructibleWalls()) {
      destructibleWallStates[dw.id] = dw.isDestroyed;
    }
    const portalStates: Record<
      string,
      {
        active: boolean;
        destIndex: number;
        destinations: readonly PortalDestination[];
      }
    > = {};
    for (const por of session.puzzleManager.getAllPortals()) {
      portalStates[por.id] = {
        active: por.isActive,
        destIndex: por.destinationIndex,
        destinations: por.destinations,
      };
    }
    const movingHazardStates: Record<string, number> = {};
    for (const saw of session.puzzleManager.getAllMovingHazards()) {
      movingHazardStates[saw.id] = saw.pathIndex;
    }
    const collapsingFloorStates: Record<string, { state: string; occupied: boolean }> = {};
    for (const fl of session.puzzleManager.getAllCollapsingFloors()) {
      collapsingFloorStates[fl.id] = { state: fl.floorState, occupied: fl.isOccupiedMemory };
    }
    const emitterStates: Record<string, boolean> = {};
    for (const le of session.puzzleManager.getAllLaserEmitters()) {
      emitterStates[le.id] = le.isActive;
    }
    const mirrorStates: Record<string, MirrorOrientation> = {};
    for (const lm of session.puzzleManager.getAllLaserMirrors()) {
      mirrorStates[lm.id] = lm.orientation;
    }
    const timeLockStates: Record<string, number> = {};
    for (const tl of session.puzzleManager.getAllTimeLocks()) {
      timeLockStates[tl.id] = tl.turnsLeft;
    }
    const blockStates: Record<string, GridPoint> = {};
    for (const mb of session.puzzleManager.getAllMovableBlocks()) {
      blockStates[mb.id] = mb.position.clone();
    }
    const magnetStates: Record<string, boolean> = {};
    for (const mf of session.puzzleManager.getAllMagneticFields()) {
      magnetStates[mf.id] = mf.isActive;
    }
    const cpStates: Record<string, { real: boolean; shadow: boolean; activated: boolean }> = {};
    for (const cp of session.checkpoints) {
      cpStates[cp.id] = {
        real: cp.isRealVisited,
        shadow: cp.isShadowVisited,
        activated: cp.isActivated,
      };
    }

    return {
      playerPos: session.player.position.clone(),
      shadowPos: session.shadow.position.clone(),
      doorStates,
      switchStates,
      plateStates,
      bombStates,
      destructibleWallStates,
      portalStates,
      movingHazardStates,
      collapsingFloorStates,
      emitterStates,
      mirrorStates,
      timeLockStates,
      blockStates,
      magnetStates,
      cpStates,
      surpriseStates: session.surpriseManager?.captureSnapshot(),
      inversionState: session.inversionEngine?.captureSnapshot(),
      realTiles: session.playerGrid.serializeTiles(),
      shadowTiles: session.shadowGrid.serializeTiles(),
      gameState: session.turnEngine.state,
    };
  }

  public static restoreSnapshot(session: BuiltLevelSession, snap: SolverStateSnapshot): void {
    session.player.setPosition(snap.playerPos);
    session.shadow.setPosition(snap.shadowPos);

    for (const [id, open] of Object.entries(snap.doorStates)) {
      session.puzzleManager.getDoor(id)?.setOpen(open);
    }
    for (const [id, active] of Object.entries(snap.switchStates)) {
      session.puzzleManager.getSwitch(id)?.setActive(active);
    }
    for (const [id, pressed] of Object.entries(snap.plateStates)) {
      session.puzzleManager.getPressurePlate(id)?.setPressed(pressed);
    }
    for (const [id, bState] of Object.entries(snap.bombStates)) {
      session.puzzleManager.getBomb(id)?.setState(bState.active, bState.timer, bState.detonated);
    }
    for (const [id, destroyed] of Object.entries(snap.destructibleWallStates)) {
      session.puzzleManager.getDestructibleWall(id)?.setDestroyed(destroyed);
    }
    for (const [id, state] of Object.entries(snap.portalStates)) {
      const por = session.puzzleManager.getPortal(id);
      if (por) {
        por.setActive(state.active);
        (por as { destinations: readonly PortalDestination[] }).destinations = state.destinations;
        por.setDestinationIndex(state.destIndex);
      }
    }
    for (const [id, pathIndex] of Object.entries(snap.movingHazardStates)) {
      session.puzzleManager.getMovingHazard(id)?.setPathIndex(pathIndex);
    }
    for (const [id, flData] of Object.entries(snap.collapsingFloorStates)) {
      session.puzzleManager.getCollapsingFloor(id)?.setState(flData.state as CollapsingFloorState, flData.occupied);
    }
    for (const [id, active] of Object.entries(snap.emitterStates ?? {})) {
      session.puzzleManager.getLaserEmitter(id)?.setActive(active);
    }
    for (const [id, orientation] of Object.entries(snap.mirrorStates ?? {})) {
      session.puzzleManager.getLaserMirror(id)?.setOrientation(orientation);
    }
    for (const [id, remaining] of Object.entries(snap.timeLockStates ?? {})) {
      session.puzzleManager.getTimeLock(id)?.setState(remaining);
    }
    for (const [id, pos] of Object.entries(snap.blockStates ?? {})) {
      session.puzzleManager.getMovableBlock(id)?.setPosition(pos);
    }
    for (const [id, active] of Object.entries(snap.magnetStates ?? {})) {
      session.puzzleManager.getMagneticField(id)?.setActive(active);
    }
    for (const [id, cpData] of Object.entries(snap.cpStates)) {
      const cp = session.checkpoints.find((c) => c.id === id);
      if (cp) {
        cp.setVisitState(cpData.real, cpData.shadow, cpData.activated);
      }
    }

    session.puzzleManager.simulateLasers(snap.playerPos, snap.shadowPos);
    session.puzzleManager.simulateMagneticFields(snap.playerPos, snap.shadowPos);
    session.puzzleManager.evaluatePressurePlates(snap.playerPos, snap.shadowPos);
    session.puzzleManager.recalculateAllDoors();

    if (snap.realTiles) {
      session.playerGrid.restoreTiles(snap.realTiles);
    }
    if (snap.shadowTiles) {
      session.shadowGrid.restoreTiles(snap.shadowTiles);
    }

    if (snap.surpriseStates && session.surpriseManager) {
      session.surpriseManager.restoreSnapshot(snap.surpriseStates);
    }

    if (snap.inversionState && session.inversionEngine) {
      session.inversionEngine.restoreSnapshot(snap.inversionState);
    }

    session.turnEngine.state = snap.gameState;
    session.turnEngine.endAnimation();
  }

  /**
   * Solves a level using Breadth-First Search (BFS) over the authoritative game rules.
   */
  public static solve(level: LevelDefinition, options: SolverOptions = {}): SolverResult {
    const maxStates = options.maxStates ?? 25000;
    const maxDepth = options.maxDepth ?? 50;

    // 1. Schema Validation
    const schemaResult: SchemaValidationResult = LevelValidator.validateSchema(level);
    if (!schemaResult.valid) {
      return {
        levelId: level.id,
        levelName: level.name,
        chapter: level.chapter,
        schemaValid: false,
        schemaErrors: schemaResult.errors,
        solutionFound: false,
        solutionLength: 0,
        solutionSequence: [],
        exploredStateCount: 0,
        searchLimitReached: false,
        errorDetails: `Schema validation failed: ${schemaResult.errors.join('; ')}`,
        replayVerified: false,
      };
    }

    // 2. Initialize Game Session
    let session: BuiltLevelSession;
    try {
      session = LevelFactory.build(level);
    } catch (err) {
      return {
        levelId: level.id,
        levelName: level.name,
        chapter: level.chapter,
        schemaValid: false,
        schemaErrors: [err instanceof Error ? err.message : String(err)],
        solutionFound: false,
        solutionLength: 0,
        solutionSequence: [],
        exploredStateCount: 0,
        searchLimitReached: false,
        errorDetails: `Failed to build level: ${err instanceof Error ? err.message : String(err)}`,
        replayVerified: false,
      };
    }

    // Trivial initial state check
    if (session.player.isAtExit() && session.shadow.isAtExit()) {
      return {
        levelId: level.id,
        levelName: level.name,
        chapter: level.chapter,
        schemaValid: true,
        schemaErrors: [],
        solutionFound: true,
        solutionLength: 0,
        solutionSequence: [],
        exploredStateCount: 1,
        searchLimitReached: false,
        errorDetails: null,
        replayVerified: true,
      };
    }

    // 3. Setup BFS
    const initialSnapshot = LevelSolver.captureSnapshot(session);
    const initialKey = LevelSolver.serializeState(session);

    const visited = new Set<string>();
    visited.add(initialKey);

    const queue: QueueNode[] = [{ snapshot: initialSnapshot, actions: [] }];
    let head = 0;
    let exploredStates = 0;
    let searchLimitReached = false;

    while (head < queue.length) {
      if (exploredStates >= maxStates) {
        searchLimitReached = true;
        break;
      }

      const current = queue[head++];
      exploredStates++;

      if (current.actions.length >= maxDepth) {
        searchLimitReached = true;
        continue;
      }

      for (const dir of ALL_DIRECTIONS) {
        // Restore parent state
        LevelSolver.restoreSnapshot(session, current.snapshot);

        // Authoritatively simulate action
        const res = session.turnEngine.handleInput(dir);
        session.turnEngine.endAnimation();

        if (!res) continue;

        // Prune hazard deaths
        if (res.hazardTriggered) continue;

        // Prune no-op moves (both characters blocked)
        if (!res.playerMoved && !res.shadowMoved) continue;

        // Check completion!
        if (session.turnEngine.state === 'COMPLETED' || res.bothAtExit) {
          const solutionSequence = [...current.actions, dir];

          // Authoritatively verify replay through fresh engine session
          const replay = LevelValidator.replaySolution(level, solutionSequence);

          return {
            levelId: level.id,
            levelName: level.name,
            chapter: level.chapter,
            schemaValid: true,
            schemaErrors: [],
            solutionFound: true,
            solutionLength: solutionSequence.length,
            solutionSequence,
            exploredStateCount: exploredStates,
            searchLimitReached: false,
            errorDetails: null,
            replayVerified: replay.success,
          };
        }

        // Check if next state is new
        const nextKey = LevelSolver.serializeState(session);
        if (!visited.has(nextKey)) {
          visited.add(nextKey);
          const nextSnap = LevelSolver.captureSnapshot(session);
          queue.push({
            snapshot: nextSnap,
            actions: [...current.actions, dir],
          });
        }
      }
    }

    // If search limit was reached vs exhausted
    return {
      levelId: level.id,
      levelName: level.name,
      chapter: level.chapter,
      schemaValid: true,
      schemaErrors: [],
      solutionFound: false,
      solutionLength: 0,
      solutionSequence: [],
      exploredStateCount: exploredStates,
      searchLimitReached,
      errorDetails: searchLimitReached
        ? `Search computational limit reached (${maxStates} states or max depth ${maxDepth})`
        : 'State space fully exhausted: level is provably unsolvable',
      replayVerified: false,
    };


  }
}
