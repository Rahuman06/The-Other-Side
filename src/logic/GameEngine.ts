import {
  Direction,
  GameSnapshot,
  GameStatus,
  LevelData,
  MoveResult,
  Position,
  WorldType,
} from '../types/game.js';
import { GridUtils } from './Grid.js';
import { LevelValidator } from './LevelValidator.js';

interface DoorState {
  id: string;
  position: Position;
  world: WorldType;
  isOpen: boolean;
  baseOpen: boolean;
}

interface SwitchState {
  id: string;
  position: Position;
  world: WorldType;
  targetDoorId: string;
  isActive: boolean;
}

interface PressurePlateState {
  id: string;
  position: Position;
  world: WorldType;
  targetDoorId: string;
  isPressed: boolean;
}

interface CheckpointState {
  id: string;
  realPosition: Position;
  shadowPosition: Position;
  isActivated: boolean;
}

interface HazardState {
  id: string;
  position: Position;
  world: WorldType;
}

interface HistoryEntry {
  realPos: Position;
  shadowPos: Position;
  doors: Map<string, boolean>;
  switches: Map<string, boolean>;
  pressurePlates: Map<string, boolean>;
  lastCheckpoint: { real: Position; shadow: Position; id: string | null };
  moveCount: number;
}

export class GameEngine {
  private level: LevelData;
  private realPos: Position;
  private shadowPos: Position;
  private realWallKeys: Set<string>;
  private shadowWallKeys: Set<string>;

  private doors: Map<string, DoorState>;
  private switches: Map<string, SwitchState>;
  private pressurePlates: Map<string, PressurePlateState>;
  private hazards: Map<string, HazardState>;
  private checkpoints: Map<string, CheckpointState>;

  private lastCheckpoint: { real: Position; shadow: Position; id: string | null };
  private status: GameStatus;
  private moveCount: number;
  private history: HistoryEntry[];

  constructor(rawLevel: unknown) {
    this.level = LevelValidator.validate(rawLevel);
    this.realPos = { ...this.level.realStart };
    this.shadowPos = { ...this.level.shadowStart };
    this.status = 'playing';
    this.moveCount = 0;
    this.history = [];

    this.realWallKeys = new Set(this.level.realWalls.map((w) => GridUtils.toKey(w)));
    this.shadowWallKeys = new Set(this.level.shadowWalls.map((w) => GridUtils.toKey(w)));

    this.doors = new Map();
    if (this.level.doors) {
      for (const d of this.level.doors) {
        const initialOpen = !!d.initialOpen;
        this.doors.set(d.id, {
          id: d.id,
          position: { ...d.position },
          world: d.world,
          isOpen: initialOpen,
          baseOpen: initialOpen,
        });
      }
    }

    this.switches = new Map();
    if (this.level.switches) {
      for (const s of this.level.switches) {
        this.switches.set(s.id, {
          id: s.id,
          position: { ...s.position },
          world: s.world,
          targetDoorId: s.targetDoorId,
          isActive: !!s.initialActive,
        });
      }
    }

    this.pressurePlates = new Map();
    if (this.level.pressurePlates) {
      for (const p of this.level.pressurePlates) {
        this.pressurePlates.set(p.id, {
          id: p.id,
          position: { ...p.position },
          world: p.world,
          targetDoorId: p.targetDoorId,
          isPressed: false,
        });
      }
    }

    this.hazards = new Map();
    if (this.level.hazards) {
      for (const h of this.level.hazards) {
        this.hazards.set(h.id, {
          id: h.id,
          position: { ...h.position },
          world: h.world,
        });
      }
    }

    this.checkpoints = new Map();
    if (this.level.checkpoints) {
      for (const c of this.level.checkpoints) {
        this.checkpoints.set(c.id, {
          id: c.id,
          realPosition: { ...c.realPosition },
          shadowPosition: { ...c.shadowPosition },
          isActivated: false,
        });
      }
    }

    this.lastCheckpoint = {
      real: { ...this.level.realStart },
      shadow: { ...this.level.shadowStart },
      id: null,
    };

    // Initial evaluation of pressure plates in case character starts on one
    this.updatePressurePlates();
  }

  public getLevel(): LevelData {
    return this.level;
  }

  public getRealPosition(): Position {
    return { ...this.realPos };
  }

  public getShadowPosition(): Position {
    return { ...this.shadowPos };
  }

  public getStatus(): GameStatus {
    return this.status;
  }

  public getMoveCount(): number {
    return this.moveCount;
  }

  public getLastCheckpointId(): string | null {
    return this.lastCheckpoint.id;
  }

  public getDoors(): readonly DoorState[] {
    return Array.from(this.doors.values());
  }

  public getSwitches(): readonly SwitchState[] {
    return Array.from(this.switches.values());
  }

  public getPressurePlates(): readonly PressurePlateState[] {
    return Array.from(this.pressurePlates.values());
  }

  public getHazards(): readonly HazardState[] {
    return Array.from(this.hazards.values());
  }

  public getCheckpoints(): readonly CheckpointState[] {
    return Array.from(this.checkpoints.values());
  }

  public pause(): void {
    if (this.status === 'playing') {
      this.status = 'paused';
    }
  }

  public resume(): void {
    if (this.status === 'paused') {
      this.status = 'playing';
    }
  }

  public canMoveRealTo(target: Position): boolean {
    if (!GridUtils.isInBounds(target, this.level.width, this.level.height)) {
      return false;
    }
    const key = GridUtils.toKey(target);
    if (this.realWallKeys.has(key)) {
      return false;
    }
    // Check closed doors in real world
    for (const door of this.doors.values()) {
      if (door.world === 'real' && !door.isOpen && GridUtils.isSamePosition(door.position, target)) {
        return false;
      }
    }
    return true;
  }

  public canMoveShadowTo(target: Position): boolean {
    if (!GridUtils.isInBounds(target, this.level.width, this.level.height)) {
      return false;
    }
    const key = GridUtils.toKey(target);
    if (this.shadowWallKeys.has(key)) {
      return false;
    }
    // Check closed doors in shadow world
    for (const door of this.doors.values()) {
      if (door.world === 'shadow' && !door.isOpen && GridUtils.isSamePosition(door.position, target)) {
        return false;
      }
    }
    return true;
  }

  public move(direction: Direction): MoveResult {
    if (this.status === 'level_complete' || this.status === 'paused') {
      return {
        realMoved: false,
        shadowMoved: false,
        realNewPos: this.getRealPosition(),
        shadowNewPos: this.getShadowPosition(),
        triggeredHazard: false,
        activatedCheckpointId: null,
        levelCompleted: this.status === 'level_complete',
      };
    }

    const targetReal = GridUtils.getRealTargetPosition(this.realPos, direction);
    const targetShadow = GridUtils.getShadowTargetPosition(this.shadowPos, direction);

    const realCanMove = this.canMoveRealTo(targetReal);
    const shadowCanMove = this.canMoveShadowTo(targetShadow);

    if (!realCanMove && !shadowCanMove) {
      return {
        realMoved: false,
        shadowMoved: false,
        realNewPos: this.getRealPosition(),
        shadowNewPos: this.getShadowPosition(),
        triggeredHazard: false,
        activatedCheckpointId: null,
        levelCompleted: false,
      };
    }

    // Save history before moving for undo
    this.saveSnapshot();

    const oldRealPos = { ...this.realPos };
    const oldShadowPos = { ...this.shadowPos };

    if (realCanMove) {
      this.realPos = targetReal;
    }
    if (shadowCanMove) {
      this.shadowPos = targetShadow;
    }

    this.moveCount++;

    // 1. Process Switches: stepping onto a switch toggles it
    for (const sw of this.switches.values()) {
      const steppedOnReal = sw.world === 'real' && realCanMove && GridUtils.isSamePosition(this.realPos, sw.position) && !GridUtils.isSamePosition(oldRealPos, sw.position);
      const steppedOnShadow = sw.world === 'shadow' && shadowCanMove && GridUtils.isSamePosition(this.shadowPos, sw.position) && !GridUtils.isSamePosition(oldShadowPos, sw.position);

      if (steppedOnReal || steppedOnShadow) {
        sw.isActive = !sw.isActive;
        const targetDoor = this.doors.get(sw.targetDoorId);
        if (targetDoor) {
          targetDoor.isOpen = !targetDoor.isOpen;
        }
      }
    }

    // 2. Process Pressure Plates
    this.updatePressurePlates();

    // 3. Process Checkpoints
    let activatedCheckpointId: string | null = null;
    for (const cp of this.checkpoints.values()) {
      const realMatches = GridUtils.isSamePosition(this.realPos, cp.realPosition);
      const shadowMatches = GridUtils.isSamePosition(this.shadowPos, cp.shadowPosition);

      // Checkpoint activates if characters reach their paired positions or touch checkpoint
      if ((realMatches && shadowMatches) || (realMatches && !cp.isActivated) || (shadowMatches && !cp.isActivated)) {
        if (!cp.isActivated) {
          cp.isActivated = true;
          this.lastCheckpoint = {
            real: { ...cp.realPosition },
            shadow: { ...cp.shadowPosition },
            id: cp.id,
          };
          activatedCheckpointId = cp.id;
        }
      }
    }

    // 4. Process Hazards
    const realInHazard = this.isPositionInHazard(this.realPos, 'real');
    const shadowInHazard = this.isPositionInHazard(this.shadowPos, 'shadow');

    if (realInHazard || shadowInHazard) {
      // Both return to the last activated checkpoint!
      this.resetToLastCheckpoint();
      return {
        realMoved: true,
        shadowMoved: true,
        realNewPos: this.getRealPosition(),
        shadowNewPos: this.getShadowPosition(),
        triggeredHazard: true,
        activatedCheckpointId,
        levelCompleted: false,
      };
    }

    // 5. Check Level Completion
    const realAtExit = GridUtils.isSamePosition(this.realPos, this.level.realExit);
    const shadowAtExit = GridUtils.isSamePosition(this.shadowPos, this.level.shadowExit);

    let levelCompleted = false;
    if (realAtExit && shadowAtExit) {
      this.status = 'level_complete';
      levelCompleted = true;
    }

    return {
      realMoved: realCanMove,
      shadowMoved: shadowCanMove,
      realNewPos: this.getRealPosition(),
      shadowNewPos: this.getShadowPosition(),
      triggeredHazard: false,
      activatedCheckpointId,
      levelCompleted,
    };
  }

  private isPositionInHazard(pos: Position, world: WorldType): boolean {
    for (const hazard of this.hazards.values()) {
      if (hazard.world === world && GridUtils.isSamePosition(hazard.position, pos)) {
        return true;
      }
    }
    return false;
  }

  private updatePressurePlates(): void {
    const doorHeldOpen = new Map<string, boolean>();

    for (const plate of this.pressurePlates.values()) {
      const isRealPressed = plate.world === 'real' && GridUtils.isSamePosition(this.realPos, plate.position);
      const isShadowPressed = plate.world === 'shadow' && GridUtils.isSamePosition(this.shadowPos, plate.position);
      plate.isPressed = isRealPressed || isShadowPressed;

      if (plate.isPressed) {
        doorHeldOpen.set(plate.targetDoorId, true);
      }
    }

    // Update target doors controlled by pressure plates
    for (const plate of this.pressurePlates.values()) {
      const door = this.doors.get(plate.targetDoorId);
      if (door) {
        if (doorHeldOpen.get(door.id)) {
          door.isOpen = true;
        } else {
          // If no plate is pressing it, revert to switch-controlled or base open state
          door.isOpen = door.baseOpen;
        }
      }
    }
  }

  public resetToLastCheckpoint(): void {
    this.realPos = { ...this.lastCheckpoint.real };
    this.shadowPos = { ...this.lastCheckpoint.shadow };
    this.updatePressurePlates();
  }

  public restart(): void {
    this.realPos = { ...this.level.realStart };
    this.shadowPos = { ...this.level.shadowStart };
    this.status = 'playing';
    this.moveCount = 0;
    this.history = [];

    for (const door of this.doors.values()) {
      door.isOpen = door.baseOpen;
    }

    for (const sw of this.switches.values()) {
      const rawSw = this.level.switches?.find((s) => s.id === sw.id);
      sw.isActive = !!rawSw?.initialActive;
    }

    for (const plate of this.pressurePlates.values()) {
      plate.isPressed = false;
    }

    for (const cp of this.checkpoints.values()) {
      cp.isActivated = false;
    }

    this.lastCheckpoint = {
      real: { ...this.level.realStart },
      shadow: { ...this.level.shadowStart },
      id: null,
    };

    this.updatePressurePlates();
  }

  public undo(): boolean {
    if (this.history.length === 0 || this.status === 'level_complete') {
      return false;
    }

    const prev = this.history.pop()!;
    this.realPos = { ...prev.realPos };
    this.shadowPos = { ...prev.shadowPos };
    this.moveCount = prev.moveCount;
    this.lastCheckpoint = {
      real: { ...prev.lastCheckpoint.real },
      shadow: { ...prev.lastCheckpoint.shadow },
      id: prev.lastCheckpoint.id,
    };

    for (const [id, isOpen] of prev.doors.entries()) {
      const door = this.doors.get(id);
      if (door) door.isOpen = isOpen;
    }

    for (const [id, isActive] of prev.switches.entries()) {
      const sw = this.switches.get(id);
      if (sw) sw.isActive = isActive;
    }

    for (const [id, isPressed] of prev.pressurePlates.entries()) {
      const plate = this.pressurePlates.get(id);
      if (plate) plate.isPressed = isPressed;
    }

    this.status = 'playing';
    return true;
  }

  private saveSnapshot(): void {
    const doorMap = new Map<string, boolean>();
    for (const [id, d] of this.doors.entries()) {
      doorMap.set(id, d.isOpen);
    }

    const switchMap = new Map<string, boolean>();
    for (const [id, s] of this.switches.entries()) {
      switchMap.set(id, s.isActive);
    }

    const plateMap = new Map<string, boolean>();
    for (const [id, p] of this.pressurePlates.entries()) {
      plateMap.set(id, p.isPressed);
    }

    this.history.push({
      realPos: { ...this.realPos },
      shadowPos: { ...this.shadowPos },
      doors: doorMap,
      switches: switchMap,
      pressurePlates: plateMap,
      lastCheckpoint: {
        real: { ...this.lastCheckpoint.real },
        shadow: { ...this.lastCheckpoint.shadow },
        id: this.lastCheckpoint.id,
      },
      moveCount: this.moveCount,
    });

    if (this.history.length > 100) {
      this.history.shift();
    }
  }

  public getSnapshot(): GameSnapshot {
    return {
      levelId: this.level.id,
      realPos: this.getRealPosition(),
      shadowPos: this.getShadowPosition(),
      status: this.status,
      moveCount: this.moveCount,
      lastCheckpointId: this.lastCheckpoint.id,
    };
  }
}
