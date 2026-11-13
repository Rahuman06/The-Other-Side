import { GridPosition } from '../grid/GridPosition';
import { MoveDirection } from '../engine/MovementEngine';
import { DoorActivationRule } from '../puzzles/Door';
import { SwitchActivationBehavior } from '../puzzles/Switch';
import { SurpriseEventConfig } from './surprise';

export type ChapterName =
  | 'THE BEGINNING'
  | 'THE CONNECTION'
  | 'THE SEPARATION'
  | 'THE REFLECTION'
  | 'THE TRUTH';

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT' | 'MASTER';

export type ExitBehavior = 'LOCK_ON_ARRIVAL' | 'SIMULTANEOUS';

export interface LevelSwitchConfig {
  readonly id: string;
  readonly world: 'real' | 'shadow';
  readonly position: GridPosition;
  readonly linkedDoorId: string;
  readonly initialActive?: boolean;
  readonly activationBehavior?: SwitchActivationBehavior;
}

export interface LevelDoorConfig {
  readonly id: string;
  readonly world: 'real' | 'shadow';
  readonly position: GridPosition;
  readonly initialOpen?: boolean;
  readonly activationRule?: DoorActivationRule;
}

export interface LevelPressurePlateConfig {
  readonly id: string;
  readonly world: 'real' | 'shadow';
  readonly position: GridPosition;
  readonly linkedDoorId: string;
  readonly targetDoorId?: string;
}

export interface LevelHazardConfig {
  readonly id: string;
  readonly world: 'real' | 'shadow';
  readonly position: GridPosition;
}

export interface LevelCheckpointConfig {
  readonly id: string;
  readonly realPosition: GridPosition;
  readonly shadowPosition: GridPosition;
}

export type BombTriggerType = 'STEP' | 'SWITCH' | 'IMMEDIATE';

export interface LevelBombConfig {
  readonly id: string;
  readonly world: 'real' | 'shadow';
  readonly position: GridPosition;
  readonly timer: number; // Turns after activation until detonation
  readonly radius?: number; // Manhattan radius (default 1)
  readonly crossWorld?: boolean; // Does the blast penetrate the other world? (default true)
  readonly triggerType?: BombTriggerType; // default 'STEP'
  readonly linkedSwitchId?: string;
}

export interface LevelDestructibleWallConfig {
  readonly id: string;
  readonly world: 'real' | 'shadow';
  readonly position: GridPosition;
}

export interface PortalDestination {
  readonly targetWorld: 'real' | 'shadow';
  readonly targetPosition: GridPosition;
}

export interface LevelPortalConfig {
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

export interface LevelMovingHazardConfig {
  readonly id: string;
  readonly world: 'real' | 'shadow';
  readonly path: readonly GridPosition[];
  readonly initialIndex?: number;
}

export type CollapsingFloorState = 'INTACT' | 'CRACKED' | 'COLLAPSED';

export interface LevelCollapsingFloorConfig {
  readonly id: string;
  readonly world: 'real' | 'shadow';
  readonly position: GridPosition;
  readonly stepsToCollapse?: number;
}

export type MirrorOrientation = '/' | '\\';

export interface LevelLaserEmitterConfig {
  readonly id: string;
  readonly world: 'real' | 'shadow';
  readonly position: GridPosition;
  readonly direction: MoveDirection;
  readonly initialActive?: boolean;
  readonly linkedSwitchId?: string;
}

export interface LevelLaserReceiverConfig {
  readonly id: string;
  readonly world: 'real' | 'shadow';
  readonly position: GridPosition;
  readonly linkedDoorId: string;
}

export interface LevelLaserMirrorConfig {
  readonly id: string;
  readonly world: 'real' | 'shadow';
  readonly position: GridPosition;
  readonly orientation: MirrorOrientation;
  readonly rotatable?: boolean;
  readonly linkedSwitchId?: string;
}

export interface LevelTimeLockConfig {
  readonly id: string;
  readonly world: 'real' | 'shadow';
  readonly position: GridPosition;
  readonly duration: number;
  readonly linkedDoorId?: string;
  readonly targetHazardIds?: readonly string[];
}

export interface LevelMovableBlockConfig {
  readonly id: string;
  readonly world: 'real' | 'shadow';
  readonly position: GridPosition;
  readonly magneticType?: 'ATTRACT' | 'REPEL' | 'NEUTRAL';
}

export interface LevelMagneticFieldConfig {
  readonly id: string;
  readonly world: 'real' | 'shadow';
  readonly position: GridPosition;
  readonly direction: MoveDirection;
  readonly range?: number;
  readonly polarity: 'ATTRACT' | 'REPEL';
  readonly initialActive?: boolean;
  readonly linkedSwitchId?: string;
}

export interface LevelDefinition {
  readonly id: number;
  readonly chapter: ChapterName;
  readonly name: string;
  readonly width: number;
  readonly height: number;
  readonly realStart: GridPosition;
  readonly shadowStart: GridPosition;
  readonly realExit: GridPosition;
  readonly shadowExit: GridPosition;
  readonly realWalls: readonly GridPosition[];
  readonly shadowWalls: readonly GridPosition[];
  readonly switches?: readonly LevelSwitchConfig[];
  readonly doors?: readonly LevelDoorConfig[];
  readonly pressurePlates?: readonly LevelPressurePlateConfig[];
  readonly hazards?: readonly LevelHazardConfig[];
  readonly movingHazards?: readonly LevelMovingHazardConfig[];
  readonly collapsingFloors?: readonly LevelCollapsingFloorConfig[];
  readonly checkpoints?: readonly LevelCheckpointConfig[];
  readonly bombs?: readonly LevelBombConfig[];
  readonly destructibleWalls?: readonly LevelDestructibleWallConfig[];
  readonly portals?: readonly LevelPortalConfig[];
  readonly laserEmitters?: readonly LevelLaserEmitterConfig[];
  readonly laserReceivers?: readonly LevelLaserReceiverConfig[];
  readonly laserMirrors?: readonly LevelLaserMirrorConfig[];
  readonly timeLocks?: readonly LevelTimeLockConfig[];
  readonly movableBlocks?: readonly LevelMovableBlockConfig[];
  readonly magneticFields?: readonly LevelMagneticFieldConfig[];
  readonly surpriseEvents?: readonly SurpriseEventConfig[];
  readonly difficulty: Difficulty;
  readonly exitBehavior?: ExitBehavior;
  readonly solutionTrace: readonly MoveDirection[];
  readonly hint: string;
}
