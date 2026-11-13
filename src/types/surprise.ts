import { GridPosition } from '../grid/GridPosition';

export type SurpriseTriggerType =
  | 'STEP_ON'          // Player or shadow enters trigger tile
  | 'STEP_OFF'         // Player or shadow leaves trigger tile
  | 'PROXIMITY'        // Within Manhattan distance of trigger tile
  | 'SWITCH_TOGGLE'    // When a specific switch is toggled
  | 'PLATE_PRESS'      // When a pressure plate is pressed
  | 'BOMB_DETONATED'   // When a bomb explodes
  | 'TURN_COUNT'       // After a set number of committed turns
  | 'EXIT_APPROACH';   // When stepping adjacent to exit

export type SurpriseTargetType =
  | 'WALL'             // Spawns or despawns a wall
  | 'HAZARD'           // Spawns spikes or hazard tile
  | 'COLLAPSE_FLOOR'   // Causes a floor tile to become cracked or collapsed
  | 'BOMB'             // Arms or ticks a bomb
  | 'FAKE_EXIT'        // Reveals decoy exit or shifts exit position
  | 'PORTAL'           // Re-targets portal destination
  | 'DOOR';            // Forces door state

export type SurpriseActionType =
  | 'SPAWN_WALL'
  | 'REMOVE_WALL'
  | 'SPAWN_HAZARD'
  | 'REMOVE_HAZARD'
  | 'COLLAPSE_TILE'
  | 'ARM_BOMB'
  | 'REVEAL_FAKE_EXIT'
  | 'SHIFT_PORTAL'
  | 'SHIFT_WALL';

export type SurpriseAnimationType =
  | 'crumble'
  | 'shockwave'
  | 'vanish'
  | 'reveal'
  | 'shift'
  | 'glitch'
  | 'spike_thrust'
  | 'spark'
  | 'flicker';

export type SurpriseSoundCue =
  | 'crumble'
  | 'hazard_spawn'
  | 'wall_shift'
  | 'shockwave'
  | 'illusion_shatter'
  | 'bomb_fuse'
  | 'whisper'
  | 'wall_open'
  | 'distortion'
  | 'stasis_tick'
  | 'explosion'
  | 'hazard_trigger';

export type SurpriseEventState = 'PENDING' | 'ARMED' | 'TRIGGERED' | 'COMPLETED';

export interface SurpriseEventConfig {
  readonly id: string;
  readonly name?: string;
  readonly triggerType: SurpriseTriggerType;
  readonly triggerWorld?: 'real' | 'shadow' | 'both';
  readonly triggerPosition?: GridPosition;
  readonly triggerRadius?: number; // Manhattan radius (default 0)
  readonly triggerSourceId?: string; // e.g. switchId or bombId
  readonly targetWorld: 'real' | 'shadow' | 'both';
  readonly targetType: SurpriseTargetType;
  readonly targetPosition?: GridPosition;
  readonly targetId?: string;
  readonly activationDelay?: number; // 0 = immediate, 1+ = turns delay
  readonly action: SurpriseActionType;
  readonly animation?: SurpriseAnimationType;
  readonly sound?: SurpriseSoundCue;
  readonly warningClue?: string; // Visible hint or subtle glyph describing telegraph
  readonly secondaryTargetPosition?: GridPosition; // e.g. new destination or shifted wall pos
  readonly repeatable?: boolean; // Default false (one-shot per life)
}

export interface SurpriseEventSnapshot {
  readonly state: SurpriseEventState;
  readonly delayRemaining: number;
}
