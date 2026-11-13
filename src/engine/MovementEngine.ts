import { GridPoint } from '../grid/GridPosition';
import { Player } from '../entities/Player';
import { Shadow } from '../entities/Shadow';
import { CollisionEngine } from './CollisionEngine';

export type MoveDirection = 'left' | 'right' | 'up' | 'down';

export interface MovementTransactionResult {
  readonly direction: MoveDirection;
  readonly playerMoved: boolean;
  readonly shadowMoved: boolean;
  readonly playerOldPosition: GridPoint;
  readonly shadowOldPosition: GridPoint;
  readonly playerNewPosition: GridPoint;
  readonly shadowNewPosition: GridPoint;
  readonly playerAtExit: boolean;
  readonly shadowAtExit: boolean;
  readonly bothAtExit: boolean;
  readonly playerEnteredHazard: boolean;
  readonly shadowEnteredHazard: boolean;
  readonly hazardTriggered: boolean;
}

export class MovementEngine {
  private readonly player: Player;
  private readonly shadow: Shadow;
  private readonly collisions: CollisionEngine;

  constructor(player: Player, shadow: Shadow, collisions: CollisionEngine) {
    this.player = player;
    this.shadow = shadow;
    this.collisions = collisions;
  }

  public getPlayer(): Player {
    return this.player;
  }

  public getShadow(): Shadow {
    return this.shadow;
  }

  public calculatePlayerTarget(direction: MoveDirection): GridPoint {
    const cur = this.player.position;
    switch (direction) {
      case 'right':
        return new GridPoint(cur.x + 1, cur.y);
      case 'left':
        return new GridPoint(cur.x - 1, cur.y);
      case 'up':
        return new GridPoint(cur.x, cur.y - 1);
      case 'down':
        return new GridPoint(cur.x, cur.y + 1);
    }
  }

  public calculateShadowTarget(direction: MoveDirection): GridPoint {
    const cur = this.shadow.position;
    switch (direction) {
      // MIRRORED HORIZONTAL RULES
      case 'right':
        return new GridPoint(cur.x - 1, cur.y);
      case 'left':
        return new GridPoint(cur.x + 1, cur.y);
      // Synchronous vertical rules
      case 'up':
        return new GridPoint(cur.x, cur.y - 1);
      case 'down':
        return new GridPoint(cur.x, cur.y + 1);
    }
  }

  /**
   * Evaluates and executes the movement transaction atomically.
   * Both movement decisions strictly use the same pre-movement state.
   */
  public executeMove(direction: MoveDirection): MovementTransactionResult {
    // Step 3: Capture both current positions (pre-movement state)
    const playerOld = this.player.position.clone();
    const shadowOld = this.shadow.position.clone();
    const playerPreExit = this.player.isAtExit();
    const shadowPreExit = this.shadow.isAtExit();

    // Step 4: Calculate both target positions
    const playerTarget = this.calculatePlayerTarget(direction);
    const shadowTarget = this.calculateShadowTarget(direction);

    // Step 5 & 6 & 7: Validate both target cells and calculate outcomes
    // Passes playerOld and shadowOld to allow exiting a closed door if already inside
    const playerEval = this.collisions.evaluatePlayerDestination(playerTarget, playerPreExit, playerOld);
    const shadowEval = this.collisions.evaluateShadowDestination(shadowTarget, shadowPreExit, shadowOld);

    const playerFree = playerEval.canEnter;
    const shadowFree = shadowEval.canEnter;

    const playerEnteredHazard = playerFree && playerEval.isHazard;
    const shadowEnteredHazard = shadowFree && shadowEval.isHazard;
    const hazardTriggered = playerEnteredHazard || shadowEnteredHazard;

    // Step 8: Commit both results together
    if (playerFree) {
      this.player.setPosition(playerTarget);
    }
    if (shadowFree) {
      this.shadow.setPosition(shadowTarget);
    }

    let playerNew = this.player.position.clone();
    let shadowNew = this.shadow.position.clone();

    // Check Portal Teleportation
    if (this.collisions.puzzleManager) {
      const pm = this.collisions.puzzleManager;

      if (playerFree && !playerOld.equals(playerNew)) {
        const portal = pm.getPortalAt('real', playerNew);
        if (portal && portal.isActive) {
          const dest = GridPoint.from(portal.targetPosition);
          const destEval = this.collisions.evaluatePlayerDestination(dest, false);
          if (destEval.canEnter && !dest.equals(shadowNew)) {
            this.player.setPosition(dest);
            playerNew = dest.clone();
            portal.onTeleport();
          }
        }
      }

      if (shadowFree && !shadowOld.equals(shadowNew)) {
        const portal = pm.getPortalAt('shadow', shadowNew);
        if (portal && portal.isActive) {
          const dest = GridPoint.from(portal.targetPosition);
          const destEval = this.collisions.evaluateShadowDestination(dest, false);
          if (destEval.canEnter && !dest.equals(playerNew)) {
            this.shadow.setPosition(dest);
            shadowNew = dest.clone();
            portal.onTeleport();
          }
        }
      }
    }

    // Notify PuzzleManager if present
    if (this.collisions.puzzleManager) {
      if (playerFree) {
        this.collisions.puzzleManager.onCharacterMove('real', playerOld, playerNew);
      }
      if (shadowFree) {
        this.collisions.puzzleManager.onCharacterMove('shadow', shadowOld, shadowNew);
      }
      // Re-evaluate pressure plates after completed movement transaction
      this.collisions.puzzleManager.evaluatePressurePlates(playerNew, shadowNew);
    }

    const playerAtExit = this.player.isAtExit();
    const shadowAtExit = this.shadow.isAtExit();
    const bothAtExit = playerAtExit && shadowAtExit;

    return {
      direction,
      playerMoved: playerFree,
      shadowMoved: shadowFree,
      playerOldPosition: playerOld,
      shadowOldPosition: shadowOld,
      playerNewPosition: playerNew,
      shadowNewPosition: shadowNew,
      playerAtExit,
      shadowAtExit,
      bothAtExit,
      playerEnteredHazard,
      shadowEnteredHazard,
      hazardTriggered,
    };
  }
}
