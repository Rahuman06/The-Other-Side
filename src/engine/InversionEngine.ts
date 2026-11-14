import { Player } from '../entities/Player';
import { Shadow } from '../entities/Shadow';
import { WorldGrid } from '../grid/WorldGrid';
import { GridPoint, GridPosition } from '../grid/GridPosition';
import { PuzzleManager } from '../puzzles/PuzzleManager';

export interface InversionStateSnapshot {
  readonly realInverted: boolean;
  readonly shadowInverted: boolean;
}

export interface InversionEngineConfig {
  readonly player: Player;
  readonly shadow: Shadow;
  readonly playerGrid: WorldGrid;
  readonly shadowGrid: WorldGrid;
  readonly puzzleManager?: PuzzleManager;
  readonly fixedTilesReal?: readonly GridPosition[];
  readonly fixedTilesShadow?: readonly GridPosition[];
  readonly onWorldInverted?: (world: 'real' | 'shadow' | 'both', isInverted: boolean) => void;
}

export class InversionEngine {
  private readonly player: Player;
  private readonly shadow: Shadow;
  private readonly playerGrid: WorldGrid;
  private readonly shadowGrid: WorldGrid;
  private readonly puzzleManager?: PuzzleManager;
  private readonly fixedTilesReal: Set<string> = new Set();
  private readonly fixedTilesShadow: Set<string> = new Set();
  private readonly basePositions: Map<any, GridPoint> = new Map();
  private onWorldInverted?: (world: 'real' | 'shadow' | 'both', isInverted: boolean) => void;

  private realInverted: boolean = false;
  private shadowInverted: boolean = false;

  constructor(config: InversionEngineConfig) {
    this.player = config.player;
    this.shadow = config.shadow;
    this.playerGrid = config.playerGrid;
    this.shadowGrid = config.shadowGrid;
    this.puzzleManager = config.puzzleManager;
    this.onWorldInverted = config.onWorldInverted;

    for (const pos of config.fixedTilesReal ?? []) {
      this.fixedTilesReal.add(`${pos.x}:${pos.y}`);
    }
    for (const pos of config.fixedTilesShadow ?? []) {
      this.fixedTilesShadow.add(`${pos.x}:${pos.y}`);
    }

    if (this.puzzleManager) {
      for (const sw of this.puzzleManager.getAllSwitches()) {
        this.basePositions.set(sw, sw.position.clone());
      }
      for (const d of this.puzzleManager.getAllDoors()) {
        this.basePositions.set(d, d.position.clone());
      }
      for (const pp of this.puzzleManager.getAllPressurePlates()) {
        this.basePositions.set(pp, pp.position.clone());
      }
      for (const tl of this.puzzleManager.getAllTimeLocks()) {
        this.basePositions.set(tl, tl.position.clone());
      }
    }
  }

  public setCallback(cb?: (world: 'real' | 'shadow' | 'both', isInverted: boolean) => void): void {
    this.onWorldInverted = cb;
  }

  public isRealInverted(): boolean {
    return this.realInverted;
  }

  public isShadowInverted(): boolean {
    return this.shadowInverted;
  }

  public syncPuzzleObjectPositions(w: 'real' | 'shadow'): void {
    if (!this.puzzleManager) return;
    const grid = w === 'real' ? this.playerGrid : this.shadowGrid;
    const fixedSet = w === 'real' ? this.fixedTilesReal : this.fixedTilesShadow;
    const W = grid.width;
    const H = grid.height;
    const inv = w === 'real' ? this.realInverted : this.shadowInverted;

    const updateList: any[] = [
      ...this.puzzleManager.getAllSwitches().filter((s) => s.world === w),
      ...this.puzzleManager.getAllDoors().filter((d) => d.world === w),
      ...this.puzzleManager.getAllPressurePlates().filter((p) => p.world === w),
      ...this.puzzleManager.getAllTimeLocks().filter((t) => t.world === w),
    ];

    for (const obj of updateList) {
      const base = this.basePositions.get(obj);
      if (!base) continue;
      if (fixedSet.has(`${base.x}:${base.y}`)) continue;
      const targetX = inv ? W - 1 - base.x : base.x;
      const targetY = inv ? H - 1 - base.y : base.y;
      (obj as { position: GridPoint }).position = new GridPoint(targetX, targetY);
    }
  }

  /**
   * Internal helper to invert grid cells across the 180-degree rotation axis
   * without mutating actor positions or triggering game events.
   */
  public invertGridOnly(w: 'real' | 'shadow'): void {
    const grid = w === 'real' ? this.playerGrid : this.shadowGrid;
    const fixedSet = w === 'real' ? this.fixedTilesReal : this.fixedTilesShadow;
    const W = grid.width;
    const H = grid.height;

    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const invX = W - 1 - x;
        const invY = H - 1 - y;

        if (y < invY || (y === invY && x < invX)) {
          const keyA = `${x}:${y}`;
          const keyB = `${invX}:${invY}`;

          if (fixedSet.has(keyA) || fixedSet.has(keyB)) {
            continue;
          }

          const cellA = grid.getCell({ x, y });
          const cellB = grid.getCell({ x: invX, y: invY });

          if (cellA && cellB) {
            const typeA = cellA.tileType;
            const typeB = cellB.tileType;
            cellA.tileType = typeB;
            cellB.tileType = typeA;
          }
        }
      }
    }

    if (w === 'real') {
      this.realInverted = !this.realInverted;
    } else {
      this.shadowInverted = !this.shadowInverted;
    }
  }

  /**
   * Performs the deterministic 180-degree World Inversion transformation.
   * Swaps grid cells (walls/floors/hazards) about the chamber center,
   * transforms character position along with their physical reference frame,
   * updates rotating puzzle objects, and updates collision maps.
   */
  public invertWorld(targetWorld: 'real' | 'shadow' | 'both'): void {
    const worlds: Array<'real' | 'shadow'> = [];
    if (targetWorld === 'real' || targetWorld === 'both') worlds.push('real');
    if (targetWorld === 'shadow' || targetWorld === 'both') worlds.push('shadow');

    for (const w of worlds) {
      const grid = w === 'real' ? this.playerGrid : this.shadowGrid;
      const W = grid.width;
      const H = grid.height;

      // 1. Swap grid cells across the 180-degree rotation axis
      this.invertGridOnly(w);

      // 2. Map actor position within their inverting reference frame
      if (w === 'real') {
        const cur = this.player.position;
        const newX = W - 1 - cur.x;
        const newY = H - 1 - cur.y;
        this.player.setPosition(new GridPoint(newX, newY));
      } else {
        const cur = this.shadow.position;
        const newX = W - 1 - cur.x;
        const newY = H - 1 - cur.y;
        this.shadow.setPosition(new GridPoint(newX, newY));
      }

      // 3. Update rotating puzzle objects in this world
      this.syncPuzzleObjectPositions(w);
    }

    const isInverted = targetWorld === 'real' ? this.realInverted : this.shadowInverted;
    this.onWorldInverted?.(targetWorld, isInverted);
  }

  public captureSnapshot(): InversionStateSnapshot {
    return {
      realInverted: this.realInverted,
      shadowInverted: this.shadowInverted,
    };
  }

  public restoreSnapshot(snap: InversionStateSnapshot): void {
    this.realInverted = snap.realInverted;
    this.shadowInverted = snap.shadowInverted;
    this.syncPuzzleObjectPositions('real');
    this.syncPuzzleObjectPositions('shadow');
  }

  public reset(): void {
    if (this.realInverted) {
      this.invertGridOnly('real');
    }
    if (this.shadowInverted) {
      this.invertGridOnly('shadow');
    }
    this.syncPuzzleObjectPositions('real');
    this.syncPuzzleObjectPositions('shadow');
  }
}
