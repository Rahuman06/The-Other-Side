import { MoveDirection, MovementEngine, MovementTransactionResult } from './MovementEngine';
import { CheckpointPair } from '../puzzles/Checkpoint';
import { CheckpointSnapshot, CheckpointSnapshotData } from './CheckpointSnapshot';
import { PuzzleManager } from '../puzzles/PuzzleManager';
import { SurpriseEventManager } from '../events/SurpriseEventManager';

export type TurnGameState = 'PLAYING' | 'PAUSED' | 'DYING' | 'COMPLETED';

export interface TurnEvents {
  onMoveCommitted?: (result: MovementTransactionResult) => void;
  onMoveBlocked?: (direction: MoveDirection) => void;
  onLevelComplete?: () => void;
  onDeath?: () => void;
  onRespawn?: (snapshot: CheckpointSnapshotData) => void;
  onCheckpointActivated?: (checkpointId: string) => void;
  onCancelAnimation?: () => void;
  onRestart?: () => void;
}

export interface TurnEngineConfig {
  readonly movementEngine: MovementEngine;
  readonly checkpoints?: readonly CheckpointPair[];
  readonly puzzleManager?: PuzzleManager;
  readonly surpriseManager?: SurpriseEventManager;
  readonly events?: TurnEvents;
}

export class TurnEngine {
  private readonly movementEngine: MovementEngine;
  private readonly checkpoints: readonly CheckpointPair[];
  private readonly puzzleManager?: PuzzleManager;
  private readonly surpriseManager?: SurpriseEventManager;
  private readonly events: TurnEvents;

  private gameState: TurnGameState = 'PLAYING';
  private transactionActive = false;
  private isHandlingDeath = false;
  private turnCounter = 0;

  private readonly initialSnapshot: CheckpointSnapshotData;
  private lastCheckpointSnapshot: CheckpointSnapshotData;

  constructor(config: TurnEngineConfig | MovementEngine, events: TurnEvents = {}) {
    if ('movementEngine' in config) {
      this.movementEngine = config.movementEngine;
      this.checkpoints = config.checkpoints ?? [];
      this.puzzleManager = config.puzzleManager;
      this.surpriseManager = config.surpriseManager;
      this.events = config.events ?? {};
    } else {
      this.movementEngine = config;
      this.checkpoints = [];
      this.events = events;
    }

    // Capture initial level snapshot
    const player = this.movementEngine.getPlayer();
    const shadow = this.movementEngine.getShadow();
    this.initialSnapshot = CheckpointSnapshot.capture(null, player, shadow, this.puzzleManager, this.surpriseManager);
    this.lastCheckpointSnapshot = this.initialSnapshot;
  }

  public get state(): TurnGameState {
    return this.gameState;
  }

  public set state(s: TurnGameState) {
    this.gameState = s;
  }

  public isTransactionActive(): boolean {
    return this.transactionActive;
  }

  public get isAnimationActive(): boolean {
    return this.transactionActive;
  }

  public beginAnimation(): void {
    this.transactionActive = true;
  }

  public endAnimation(): void {
    this.transactionActive = false;
  }

  public getLastCheckpointId(): string | null {
    return this.lastCheckpointSnapshot.checkpointId;
  }

  public getCheckpoints(): readonly CheckpointPair[] {
    return this.checkpoints;
  }

  /**
   * Executes the movement transaction and processes hazard death, checkpoints, and exit completion.
   */
  public handleInput(direction: MoveDirection): MovementTransactionResult | null {
    // Step 1: Confirm game state is PLAYING (ignore further inputs when DYING or PAUSED or COMPLETED)
    if (this.gameState !== 'PLAYING') {
      return null;
    }

    // Step 2: Confirm no movement transaction is active
    if (this.transactionActive) {
      return null;
    }

    // Steps 3 - 8: Execute movement transaction
    this.turnCounter++;
    const result = this.movementEngine.executeMove(direction);

    // If neither moved and no hazard triggered, report blocked
    if (!result.playerMoved && !result.shadowMoved && !result.hazardTriggered) {
      this.events.onMoveBlocked?.(direction);
      return result;
    }

    // Checkpoint visit tracking
    const player = this.movementEngine.getPlayer();
    const shadow = this.movementEngine.getShadow();

    for (const cp of this.checkpoints) {
      const playerJustActivated = cp.checkPlayerVisit(result.playerNewPosition);
      const shadowJustActivated = cp.checkShadowVisit(result.shadowNewPosition);

      if (playerJustActivated || shadowJustActivated) {
        // Paired checkpoint activated! Capture checkpoint snapshot
        this.lastCheckpointSnapshot = CheckpointSnapshot.capture(
          cp.id,
          player,
          shadow,
          this.puzzleManager,
          this.surpriseManager
        );
        this.events.onCheckpointActivated?.(cp.id);
      }
    }

    // Step 9: Check for Hazard Death
    if (result.hazardTriggered) {
      this.executeDeathSequence();
      return result;
    }

    // Step 9a: Check for Bomb Ticking & Lethal Detonations
    if (this.puzzleManager) {
      const explosion = this.puzzleManager.tickBombs(result.playerNewPosition, result.shadowNewPosition);
      if (explosion.detonated && this.surpriseManager) {
        for (const bombId of explosion.detonatedBombIds) {
          this.surpriseManager.notifyBombDetonated(bombId);
        }
      }
      if (explosion.lethal) {
        (result as { hazardTriggered: boolean }).hazardTriggered = true;
        this.executeDeathSequence();
        return result;
      }

      // Step 9c: Advance Moving Hazards (Saws)
      const sawHit = this.puzzleManager.advanceMovingHazards(
        result.playerOldPosition,
        result.playerNewPosition,
        result.shadowOldPosition,
        result.shadowNewPosition
      );
      if (sawHit) {
        (result as { hazardTriggered: boolean }).hazardTriggered = true;
        this.executeDeathSequence();
        return result;
      }

      // Step 9d: Update Collapsing Floors
      this.puzzleManager.updateCollapsingFloors(result.playerNewPosition, result.shadowNewPosition);

      // Step 9d-2: Tick Time Locks
      this.puzzleManager.tickTimeLocks();

      // Step 9e: Check Laser Lethality
      const laserSim = this.puzzleManager.simulateLasers(
        result.playerNewPosition,
        result.shadowNewPosition
      );
      const playerHit = laserSim.lethalTiles.has(
        `real:${result.playerNewPosition.x}:${result.playerNewPosition.y}`
      );
      const shadowHit = laserSim.lethalTiles.has(
        `shadow:${result.shadowNewPosition.x}:${result.shadowNewPosition.y}`
      );
      if (playerHit || shadowHit) {
        (result as { hazardTriggered: boolean }).hazardTriggered = true;
        this.executeDeathSequence();
        return result;
      }

      // Step 9f: Simulate Magnetic Fields & Re-evaluate Pressure Plates
      this.puzzleManager.simulateMagneticFields(
        result.playerNewPosition,
        result.shadowNewPosition
      );
      this.puzzleManager.evaluatePressurePlates(
        result.playerNewPosition,
        result.shadowNewPosition
      );
      if (this.surpriseManager) {
        for (const plate of this.puzzleManager.getAllPressurePlates()) {
          if (plate.isPressed) {
            this.surpriseManager.notifyPlatePress(plate.id, true);
          }
        }
      }
    }

    // Step 9g: Evaluate Surprise Events
    if (this.surpriseManager) {
      this.surpriseManager.evaluateTurn({
        playerPos: result.playerNewPosition,
        shadowPos: result.shadowNewPosition,
        playerOldPos: result.playerOldPosition,
        shadowOldPos: result.shadowOldPosition,
        turnCount: this.turnCounter,
        realExitPos: this.movementEngine.getPlayer().exit ?? result.playerNewPosition,
        shadowExitPos: this.movementEngine.getShadow().exit ?? result.shadowNewPosition,
      });

      if (this.surpriseManager.checkLethalCollision(result.playerNewPosition, result.shadowNewPosition)) {
        (result as { hazardTriggered: boolean }).hazardTriggered = true;
        this.executeDeathSequence();
        return result;
      }
    }

    // Step 9b: Check Exit Completion
    if (result.bothAtExit) {
      this.gameState = 'COMPLETED';
      this.events.onLevelComplete?.();
    }

    // Step 10: Commit and start visual animation
    this.events.onMoveCommitted?.(result);
    this.beginAnimation();

    return result;
  }

  /**
   * Idempotent death sequence:
   * 1. Set game state to DYING.
   * 2. Ignore further movement inputs.
   * 3. Cancel pending input.
   * 4. Cancel unfinished visual animations.
   * 5. Restore both characters.
   * 6. Restore puzzle states.
   * 7. Return to PLAYING.
   */
  public executeDeathSequence(): void {
    if (this.isHandlingDeath || this.gameState === 'DYING') {
      return; // Do not execute the reset more than once
    }
    this.isHandlingDeath = true;

    // 1. Set game state to DYING
    this.gameState = 'DYING';

    try {
      // 3 & 4. Cancel pending inputs and animations
      this.endAnimation();
      this.events.onCancelAnimation?.();
      this.events.onDeath?.();

      // 5 & 6. Restore characters and puzzle state to last activated checkpoint atomically
      const player = this.movementEngine.getPlayer();
      const shadow = this.movementEngine.getShadow();
      CheckpointSnapshot.restore(this.lastCheckpointSnapshot, player, shadow, this.puzzleManager, this.surpriseManager);

      // 7. Return to PLAYING
      this.gameState = 'PLAYING';
      this.events.onRespawn?.(this.lastCheckpointSnapshot);
    } finally {
      this.isHandlingDeath = false;
    }
  }

  /**
   * Restores initial level state (0 checkpoints active, original positions, initial doors).
   */
  public restartLevel(): void {
    this.gameState = 'PLAYING';
    this.isHandlingDeath = false;
    this.turnCounter = 0;
    this.endAnimation();
    this.events.onCancelAnimation?.();

    for (const cp of this.checkpoints) {
      cp.reset();
    }

    this.surpriseManager?.reset();
    this.lastCheckpointSnapshot = this.initialSnapshot;
    const player = this.movementEngine.getPlayer();
    const shadow = this.movementEngine.getShadow();
    CheckpointSnapshot.restore(this.initialSnapshot, player, shadow, this.puzzleManager, this.surpriseManager);

    this.events.onRestart?.();
  }

  public pause(): void {
    if (this.gameState === 'PLAYING') {
      this.gameState = 'PAUSED';
    }
  }

  public resume(): void {
    if (this.gameState === 'PAUSED') {
      this.gameState = 'PLAYING';
    }
  }
}
