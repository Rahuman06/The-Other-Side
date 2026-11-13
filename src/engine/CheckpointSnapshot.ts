import { GridPoint } from '../grid/GridPosition';
import { PuzzleManager } from '../puzzles/PuzzleManager';
import { Player } from '../entities/Player';
import { Shadow } from '../entities/Shadow';
import { CollapsingFloorState, MirrorOrientation } from '../types/level';
import { SurpriseEventManager } from '../events/SurpriseEventManager';
import { SurpriseEventSnapshot } from '../types/surprise';

export interface CheckpointSnapshotData {
  readonly checkpointId: string | null;
  readonly playerPosition: GridPoint;
  readonly shadowPosition: GridPoint;
  readonly doorStates: Record<string, boolean>;
  readonly switchStates: Record<string, boolean>;
  readonly plateStates: Record<string, boolean>;
  readonly bombStates?: Record<string, { active: boolean; timer: number; detonated: boolean }>;
  readonly destructibleWallStates?: Record<string, boolean>;
  readonly portalStates?: Record<string, { active: boolean; destIndex: number } | boolean>;
  readonly movingHazardStates?: Record<string, number>;
  readonly collapsingFloorStates?: Record<string, { state: CollapsingFloorState; wasOccupied: boolean }>;
  readonly emitterStates?: Record<string, boolean>;
  readonly mirrorStates?: Record<string, MirrorOrientation>;
  readonly timeLockStates?: Record<string, number>;
  readonly blockStates?: Record<string, GridPoint>;
  readonly magnetStates?: Record<string, boolean>;
  readonly surpriseStates?: Record<string, SurpriseEventSnapshot>;
}

export class CheckpointSnapshot {
  public static capture(
    checkpointId: string | null,
    player: Player,
    shadow: Shadow,
    puzzleManager?: PuzzleManager,
    surpriseManager?: SurpriseEventManager
  ): CheckpointSnapshotData {
    const doorStates: Record<string, boolean> = {};
    const switchStates: Record<string, boolean> = {};
    const plateStates: Record<string, boolean> = {};
    const bombStates: Record<string, { active: boolean; timer: number; detonated: boolean }> = {};
    const destructibleWallStates: Record<string, boolean> = {};
    const portalStates: Record<string, { active: boolean; destIndex: number }> = {};
    const movingHazardStates: Record<string, number> = {};
    const collapsingFloorStates: Record<string, { state: CollapsingFloorState; wasOccupied: boolean }> = {};
    const emitterStates: Record<string, boolean> = {};
    const mirrorStates: Record<string, MirrorOrientation> = {};
    const timeLockStates: Record<string, number> = {};
    const blockStates: Record<string, GridPoint> = {};
    const magnetStates: Record<string, boolean> = {};

    if (puzzleManager) {
      for (const door of puzzleManager.getAllDoors()) {
        doorStates[door.id] = door.isOpen;
      }
      for (const sw of puzzleManager.getAllSwitches()) {
        switchStates[sw.id] = sw.isActive;
      }
      for (const plate of puzzleManager.getAllPressurePlates()) {
        plateStates[plate.id] = plate.isPressed;
      }
      for (const b of puzzleManager.getAllBombs()) {
        bombStates[b.id] = { active: b.isActive, timer: b.countdown, detonated: b.isDetonated };
      }
      for (const dw of puzzleManager.getAllDestructibleWalls()) {
        destructibleWallStates[dw.id] = dw.isDestroyed;
      }
      for (const p of puzzleManager.getAllPortals()) {
        portalStates[p.id] = { active: p.isActive, destIndex: p.destinationIndex };
      }
      for (const mh of puzzleManager.getAllMovingHazards()) {
        movingHazardStates[mh.id] = mh.pathIndex;
      }
      for (const cf of puzzleManager.getAllCollapsingFloors()) {
        collapsingFloorStates[cf.id] = { state: cf.floorState, wasOccupied: cf.isOccupiedMemory };
      }
      for (const le of puzzleManager.getAllLaserEmitters()) {
        emitterStates[le.id] = le.isActive;
      }
      for (const lm of puzzleManager.getAllLaserMirrors()) {
        mirrorStates[lm.id] = lm.orientation;
      }
      for (const tl of puzzleManager.getAllTimeLocks()) {
        timeLockStates[tl.id] = tl.turnsLeft;
      }
      for (const mb of puzzleManager.getAllMovableBlocks()) {
        blockStates[mb.id] = mb.position.clone();
      }
      for (const mf of puzzleManager.getAllMagneticFields()) {
        magnetStates[mf.id] = mf.isActive;
      }
    }

    return {
      checkpointId,
      playerPosition: player.position.clone(),
      shadowPosition: shadow.position.clone(),
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
      surpriseStates: surpriseManager?.captureSnapshot(),
    };
  }

  public static restore(
    snapshot: CheckpointSnapshotData,
    player: Player,
    shadow: Shadow,
    puzzleManager?: PuzzleManager,
    surpriseManager?: SurpriseEventManager
  ): void {
    player.setPosition(snapshot.playerPosition);
    shadow.setPosition(snapshot.shadowPosition);

    if (puzzleManager) {
      for (const [doorId, isOpen] of Object.entries(snapshot.doorStates)) {
        const door = puzzleManager.getDoor(doorId);
        if (door) door.setOpen(isOpen);
      }
      for (const [switchId, isActive] of Object.entries(snapshot.switchStates)) {
        const sw = puzzleManager.getSwitch(switchId);
        if (sw) {
          sw.setActive(isActive);
        }
      }
      for (const [plateId, isPressed] of Object.entries(snapshot.plateStates)) {
        const plate = puzzleManager.getPressurePlate(plateId);
        if (plate) plate.setPressed(isPressed);
      }
      if (snapshot.bombStates) {
        for (const [bombId, state] of Object.entries(snapshot.bombStates)) {
          const b = puzzleManager.getBomb(bombId);
          if (b) b.setState(state.active, state.timer, state.detonated);
        }
      }
      if (snapshot.destructibleWallStates) {
        for (const [wallId, destroyed] of Object.entries(snapshot.destructibleWallStates)) {
          const dw = puzzleManager.getDestructibleWall(wallId);
          if (dw) dw.setDestroyed(destroyed);
        }
      }
      if (snapshot.portalStates) {
        for (const [portalId, state] of Object.entries(snapshot.portalStates)) {
          const p = puzzleManager.getPortal(portalId);
          if (p) {
            if (typeof state === 'boolean') {
              p.setActive(state);
            } else {
              p.setActive(state.active);
              p.setDestinationIndex(state.destIndex);
            }
          }
        }
      }
      if (snapshot.movingHazardStates) {
        for (const [mhId, pathIndex] of Object.entries(snapshot.movingHazardStates)) {
          const mh = puzzleManager.getMovingHazard(mhId);
          if (mh) mh.setPathIndex(pathIndex);
        }
      }
      if (snapshot.collapsingFloorStates) {
        for (const [cfId, cfData] of Object.entries(snapshot.collapsingFloorStates)) {
          const cf = puzzleManager.getCollapsingFloor(cfId);
          if (cf) cf.setState(cfData.state, cfData.wasOccupied);
        }
      }
      if (snapshot.emitterStates) {
        for (const [leId, active] of Object.entries(snapshot.emitterStates)) {
          const le = puzzleManager.getLaserEmitter(leId);
          if (le) le.setActive(active);
        }
      }
      if (snapshot.mirrorStates) {
        for (const [lmId, orientation] of Object.entries(snapshot.mirrorStates)) {
          const lm = puzzleManager.getLaserMirror(lmId);
          if (lm) lm.setOrientation(orientation);
        }
      }
      if (snapshot.timeLockStates) {
        for (const [tlId, remaining] of Object.entries(snapshot.timeLockStates)) {
          const tl = puzzleManager.getTimeLock(tlId);
          if (tl) tl.setState(remaining);
        }
      }
      if (snapshot.blockStates) {
        for (const [mbId, pos] of Object.entries(snapshot.blockStates)) {
          const mb = puzzleManager.getMovableBlock(mbId);
          if (mb) mb.setPosition(pos);
        }
      }
      if (snapshot.magnetStates) {
        for (const [mfId, active] of Object.entries(snapshot.magnetStates)) {
          const mf = puzzleManager.getMagneticField(mfId);
          if (mf) mf.setActive(active);
        }
      }
      puzzleManager.simulateLasers(player.position, shadow.position);
      puzzleManager.simulateMagneticFields(player.position, shadow.position);
      puzzleManager.evaluatePressurePlates(player.position, shadow.position);
      puzzleManager.recalculateAllDoors();
    }

    if (snapshot.surpriseStates && surpriseManager) {
      surpriseManager.restoreSnapshot(snapshot.surpriseStates);
    }
  }
}
