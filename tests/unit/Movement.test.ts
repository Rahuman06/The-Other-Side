import { describe, it, expect, beforeEach } from 'vitest';
import { GridPoint } from '@/grid/GridPosition';
import { Player } from '@/entities/Player';
import { Shadow } from '@/entities/Shadow';
import { CollisionEngine } from '@/engine/CollisionEngine';
import { MovementEngine } from '@/engine/MovementEngine';
import { TurnEngine } from '@/engine/TurnEngine';
import { InputController } from '@/systems/InputController';

describe('Phase 03 — Mirrored Movement Engine', () => {
  let player: Player;
  let shadow: Shadow;
  let collisions: CollisionEngine;
  let movement: MovementEngine;
  let turnEngine: TurnEngine;

  beforeEach(() => {
    // 5x5 grid setup
    player = new Player({ x: 2, y: 2 }, { x: 4, y: 4 });
    shadow = new Shadow({ x: 2, y: 2 }, { x: 0, y: 0 });
    collisions = new CollisionEngine({
      width: 5,
      height: 5,
      playerWalls: [{ x: 3, y: 2 }], // Player wall to the right of (2,2)
      shadowWalls: [{ x: 2, y: 1 }], // Shadow wall above (2,2)
    });
    movement = new MovementEngine(player, shadow, collisions);
    turnEngine = new TurnEngine(movement);
  });

  describe('Core Mirrored Movement Rules', () => {
    it('moves player right (+1) and shadow left (-1) when moving RIGHT', () => {
      // Clear walls for pure movement test
      const freeCollisions = new CollisionEngine({ width: 5, height: 5 });
      const freeMovement = new MovementEngine(player, shadow, freeCollisions);

      const res = freeMovement.executeMove('right');
      expect(res.playerMoved).toBe(true);
      expect(res.shadowMoved).toBe(true);
      expect(player.position).toEqual(new GridPoint(3, 2));
      expect(shadow.position).toEqual(new GridPoint(1, 2)); // Mirrored!
    });

    it('moves player left (-1) and shadow right (+1) when moving LEFT', () => {
      const freeCollisions = new CollisionEngine({ width: 5, height: 5 });
      const freeMovement = new MovementEngine(player, shadow, freeCollisions);

      const res = freeMovement.executeMove('left');
      expect(res.playerMoved).toBe(true);
      expect(res.shadowMoved).toBe(true);
      expect(player.position).toEqual(new GridPoint(1, 2));
      expect(shadow.position).toEqual(new GridPoint(3, 2)); // Mirrored!
    });

    it('moves both characters synchronously on vertical input', () => {
      const freeCollisions = new CollisionEngine({ width: 5, height: 5 });
      const freeMovement = new MovementEngine(player, shadow, freeCollisions);

      freeMovement.executeMove('down');
      expect(player.position).toEqual(new GridPoint(2, 3));
      expect(shadow.position).toEqual(new GridPoint(2, 3));

      freeMovement.executeMove('up');
      expect(player.position).toEqual(new GridPoint(2, 2));
      expect(shadow.position).toEqual(new GridPoint(2, 2));
    });
  });

  describe('Critical Movement Cases', () => {
    it('Case 1: Both destinations free -> Both move', () => {
      // Moving down: Player targets (2,3), Shadow targets (2,3) - neither is a wall
      const res = movement.executeMove('down');
      expect(res.playerMoved).toBe(true);
      expect(res.shadowMoved).toBe(true);
      expect(player.position).toEqual(new GridPoint(2, 3));
      expect(shadow.position).toEqual(new GridPoint(2, 3));
    });

    it('Case 2: Player destination is blocked, Shadow destination is free -> Only shadow moves', () => {
      // Player wall is at (3,2). Moving right targets Player (3,2) [blocked], Shadow (1,2) [free]
      const res = movement.executeMove('right');
      expect(res.playerMoved).toBe(false);
      expect(res.shadowMoved).toBe(true);
      expect(player.position).toEqual(new GridPoint(2, 2)); // Unmoved
      expect(shadow.position).toEqual(new GridPoint(1, 2)); // Moved left
    });

    it('Case 3: Player destination is free, Shadow destination is blocked -> Only player moves', () => {
      // Shadow wall is at (2,1). Moving up targets Player (2,1) [free], Shadow (2,1) [blocked by shadow wall]
      const res = movement.executeMove('up');
      expect(res.playerMoved).toBe(true);
      expect(res.shadowMoved).toBe(false);
      expect(player.position).toEqual(new GridPoint(2, 1)); // Moved up
      expect(shadow.position).toEqual(new GridPoint(2, 2)); // Unmoved
    });

    it('Case 4: Both destinations blocked -> Neither moves', () => {
      // Player wall at (1,2) and Shadow wall at (3,2)
      const dualBlockedCollisions = new CollisionEngine({
        width: 5,
        height: 5,
        playerWalls: [{ x: 1, y: 2 }],
        shadowWalls: [{ x: 3, y: 2 }],
      });
      const dualMovement = new MovementEngine(player, shadow, dualBlockedCollisions);

      // Moving left: Player targets (1,2) [blocked], Shadow targets (3,2) [blocked]
      const res = dualMovement.executeMove('left');
      expect(res.playerMoved).toBe(false);
      expect(res.shadowMoved).toBe(false);
      expect(player.position).toEqual(new GridPoint(2, 2));
      expect(shadow.position).toEqual(new GridPoint(2, 2));
    });

    it('Case 5: A character already at the exit cannot move further', () => {
      // Position Player directly on exit (4,4)
      player.setPosition({ x: 4, y: 4 });
      expect(player.isAtExit()).toBe(true);

      // Shadow is at (2,2) with exit at (0,0)
      expect(shadow.isAtExit()).toBe(false);

      const freeCollisions = new CollisionEngine({ width: 5, height: 5 });
      const freeMovement = new MovementEngine(player, shadow, freeCollisions);

      // Moving left: Player would attempt (3,4), but because it is at exit, it CANNOT move!
      // Shadow moves right (+1) to (3,2)
      const res = freeMovement.executeMove('left');
      expect(res.playerMoved).toBe(false);
      expect(res.shadowMoved).toBe(true);
      expect(player.position).toEqual(new GridPoint(4, 4)); // Remains locked at exit
      expect(shadow.position).toEqual(new GridPoint(3, 2)); // Moves freely
    });
  });

  describe('Boundary Movement & Invalid Positions', () => {
    it('blocks Player from moving past outer boundaries', () => {
      player.setPosition({ x: 0, y: 0 });
      const freeCollisions = new CollisionEngine({ width: 5, height: 5 });
      const freeMovement = new MovementEngine(player, shadow, freeCollisions);

      // Moving left attempts x = -1
      const resLeft = freeMovement.executeMove('left');
      expect(resLeft.playerMoved).toBe(false);
      expect(player.position).toEqual(new GridPoint(0, 0));

      // Moving up attempts y = -1
      const resUp = freeMovement.executeMove('up');
      expect(resUp.playerMoved).toBe(false);
      expect(player.position).toEqual(new GridPoint(0, 0));
    });

    it('blocks Shadow from moving past outer boundaries with inverted directions', () => {
      shadow.setPosition({ x: 0, y: 0 });
      const freeCollisions = new CollisionEngine({ width: 5, height: 5 });
      const freeMovement = new MovementEngine(player, shadow, freeCollisions);

      // Moving RIGHT causes Shadow to attempt x - 1 = -1
      const resRight = freeMovement.executeMove('right');
      expect(resRight.shadowMoved).toBe(false);
      expect(shadow.position).toEqual(new GridPoint(0, 0));
    });

    it('throws error when creating GridPoint with invalid coordinates', () => {
      expect(() => new GridPoint(1.5, 2)).toThrow(/must be integers/);
      expect(() => new GridPoint(NaN, 2)).toThrow(/must be integers/);
      expect(() => new GridPoint(2, Infinity)).toThrow(/must be integers/);
    });
  });

  describe('TurnEngine Transaction & Animation Interruptions', () => {
    it('executes 10-step transaction and locks while animation is active', () => {
      let committedResult = false;
      const turn = new TurnEngine(movement, {
        onMoveCommitted: () => {
          committedResult = true;
        },
      });

      expect(turn.isTransactionActive()).toBe(false);

      // First input is accepted
      const res = turn.handleInput('down');
      expect(res).not.toBeNull();
      expect(committedResult).toBe(true);
      expect(turn.isTransactionActive()).toBe(true); // Locked for animation!

      // Rapid subsequent input during active animation MUST be ignored
      const rapidRes = turn.handleInput('down');
      expect(rapidRes).toBeNull();

      // Completing animation unlocks the engine
      turn.endAnimation();
      expect(turn.isTransactionActive()).toBe(false);

      // Next input is now accepted
      const nextRes = turn.handleInput('up');
      expect(nextRes).not.toBeNull();
    });

    it('ignores input when game state is PAUSED', () => {
      turnEngine.pause();
      expect(turnEngine.state).toBe('PAUSED');

      const res = turnEngine.handleInput('down');
      expect(res).toBeNull();
      expect(player.position).toEqual(new GridPoint(2, 2)); // Unmoved

      turnEngine.resume();
      expect(turnEngine.state).toBe('PLAYING');
      const unpausedRes = turnEngine.handleInput('down');
      expect(unpausedRes).not.toBeNull();
    });
  });

  describe('InputController & Event Rules', () => {
    it('produces exactly one movement per key press and ignores key hold repeat', () => {
      const recordedDirections: string[] = [];
      const controller = new InputController({
        onDirection: (dir) => recordedDirections.push(dir),
      });

      // Initial key down
      const handledFirst = controller.handleKeyDown({ key: 'ArrowRight' });
      expect(handledFirst).toBe(true);
      expect(recordedDirections).toEqual(['right']);
      expect(controller.isKeyHeld('ArrowRight')).toBe(true);

      // Repeated keydown while held (e.repeat = true) -> MUST BE IGNORED
      const handledRepeat = controller.handleKeyDown({ key: 'ArrowRight', repeat: true });
      expect(handledRepeat).toBe(false);
      expect(recordedDirections).toHaveLength(1); // Still only 1 move!

      // Duplicate keydown event with repeat: false before keyup -> MUST BE IGNORED
      const handledDuplicate = controller.handleKeyDown({ key: 'ArrowRight', repeat: false });
      expect(handledDuplicate).toBe(false);
      expect(recordedDirections).toHaveLength(1);

      // Key release
      controller.handleKeyUp({ key: 'ArrowRight' });
      expect(controller.isKeyHeld('ArrowRight')).toBe(false);

      // Now next key press is accepted
      controller.handleKeyDown({ key: 'ArrowRight' });
      expect(recordedDirections).toHaveLength(2);
    });

    it('clears all held keys on window focus loss (blur)', () => {
      const controller = new InputController({ onDirection: () => {} });

      controller.handleKeyDown({ key: 'KeyD' });
      controller.handleKeyDown({ key: 'KeyW' });
      expect(controller.getHeldKeysCount()).toBe(2);

      // Window blur occurs
      controller.handleBlur();
      expect(controller.getHeldKeysCount()).toBe(0);
    });
  });
});
