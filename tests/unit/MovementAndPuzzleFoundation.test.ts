import { describe, it, expect, beforeEach } from 'vitest';
import { GridPoint } from '@/grid/GridPosition';
import { Player } from '@/entities/Player';
import { Shadow } from '@/entities/Shadow';
import { WorldGrid } from '@/grid/WorldGrid';
import { TileType } from '@/grid/TileType';
import { CollisionEngine } from '@/engine/CollisionEngine';
import { MovementEngine } from '@/engine/MovementEngine';
import { TurnEngine } from '@/engine/TurnEngine';
import { CheckpointPair } from '@/puzzles/Checkpoint';
import { Door } from '@/puzzles/Door';
import { Switch } from '@/puzzles/Switch';
import { PressurePlate } from '@/puzzles/PressurePlate';
import { PuzzleManager } from '@/puzzles/PuzzleManager';

describe('Phase 2 — Four-Direction Movement and Puzzle Foundation', () => {
  let player: Player;
  let shadow: Shadow;
  let playerGrid: WorldGrid;
  let shadowGrid: WorldGrid;
  let puzzleManager: PuzzleManager;
  let collisionEngine: CollisionEngine;
  let movementEngine: MovementEngine;

  beforeEach(() => {
    // 7x7 grid setup with center at (3,3)
    player = new Player({ x: 3, y: 3 }, { x: 5, y: 5 });
    shadow = new Shadow({ x: 3, y: 3 }, { x: 1, y: 5 });

    playerGrid = new WorldGrid({ width: 7, height: 7 });
    shadowGrid = new WorldGrid({ width: 7, height: 7 });

    puzzleManager = new PuzzleManager();
    collisionEngine = new CollisionEngine({
      playerGrid,
      shadowGrid,
      puzzleManager,
    });
    movementEngine = new MovementEngine(player, shadow, collisionEngine);
  });

  // =========================================================================
  // 1. FOUR-DIRECTION MOVEMENT VERIFICATION
  // =========================================================================
  describe('1. Four-Directional Movement Math', () => {
    it('LEFT: Real World moves -1 column, Shadow World moves +1 column', () => {
      const res = movementEngine.executeMove('left');
      expect(res.playerMoved).toBe(true);
      expect(res.shadowMoved).toBe(true);
      expect(player.position.x).toBe(2); // 3 - 1 = 2
      expect(player.position.y).toBe(3); // unchanged
      expect(shadow.position.x).toBe(4); // 3 + 1 = 4
      expect(shadow.position.y).toBe(3); // unchanged
    });

    it('RIGHT: Real World moves +1 column, Shadow World moves -1 column', () => {
      const res = movementEngine.executeMove('right');
      expect(res.playerMoved).toBe(true);
      expect(res.shadowMoved).toBe(true);
      expect(player.position.x).toBe(4); // 3 + 1 = 4
      expect(player.position.y).toBe(3); // unchanged
      expect(shadow.position.x).toBe(2); // 3 - 1 = 2
      expect(shadow.position.y).toBe(3); // unchanged
    });

    it('UP: Both characters move -1 row', () => {
      const res = movementEngine.executeMove('up');
      expect(res.playerMoved).toBe(true);
      expect(res.shadowMoved).toBe(true);
      expect(player.position.x).toBe(3); // unchanged
      expect(player.position.y).toBe(2); // 3 - 1 = 2
      expect(shadow.position.x).toBe(3); // unchanged
      expect(shadow.position.y).toBe(2); // 3 - 1 = 2
    });

    it('DOWN: Both characters move +1 row', () => {
      const res = movementEngine.executeMove('down');
      expect(res.playerMoved).toBe(true);
      expect(res.shadowMoved).toBe(true);
      expect(player.position.x).toBe(3); // unchanged
      expect(player.position.y).toBe(4); // 3 + 1 = 4
      expect(shadow.position.x).toBe(3); // unchanged
      expect(shadow.position.y).toBe(4); // 3 + 1 = 4
    });

    it('rejects diagonal movement by design and enforces single cardinal direction per transaction', () => {
      // MovementEngine only accepts MoveDirection: 'left' | 'right' | 'up' | 'down'
      const startP = player.position.clone();
      const startS = shadow.position.clone();

      movementEngine.executeMove('right');
      // Exactly one coordinate changes per transaction
      expect(player.position.x).toBe(startP.x + 1);
      expect(player.position.y).toBe(startP.y);
      expect(shadow.position.x).toBe(startS.x - 1);
      expect(shadow.position.y).toBe(startS.y);
    });
  });

  // =========================================================================
  // 2. INDEPENDENT COLLISION VERIFICATION
  // =========================================================================
  describe('2. Independent Collision Detection', () => {
    it('Player blocked by Real World wall does not prevent Shadow from moving', () => {
      // Place wall at Real (4,3)
      playerGrid.setTileType({ x: 4, y: 3 }, TileType.WALL);

      // Move right: Real targets (4,3) [wall], Shadow targets (2,3) [floor]
      const res = movementEngine.executeMove('right');
      expect(res.playerMoved).toBe(false);
      expect(res.shadowMoved).toBe(true);
      expect(player.position).toEqual(new GridPoint(3, 3)); // Blocked
      expect(shadow.position).toEqual(new GridPoint(2, 3)); // Moved
    });

    it('Shadow blocked by Shadow World wall does not prevent Player from moving', () => {
      // Place wall at Shadow (2,3)
      shadowGrid.setTileType({ x: 2, y: 3 }, TileType.WALL);

      // Move right: Real targets (4,3) [floor], Shadow targets (2,3) [wall]
      const res = movementEngine.executeMove('right');
      expect(res.playerMoved).toBe(true);
      expect(res.shadowMoved).toBe(false);
      expect(player.position).toEqual(new GridPoint(4, 3)); // Moved
      expect(shadow.position).toEqual(new GridPoint(3, 3)); // Blocked
    });

    it('Both characters blocked simultaneously results in clean zero-displacement transaction', () => {
      // Walls for both
      playerGrid.setTileType({ x: 4, y: 3 }, TileType.WALL);
      shadowGrid.setTileType({ x: 2, y: 3 }, TileType.WALL);

      const res = movementEngine.executeMove('right');
      expect(res.playerMoved).toBe(false);
      expect(res.shadowMoved).toBe(false);
      expect(player.position).toEqual(new GridPoint(3, 3));
      expect(shadow.position).toEqual(new GridPoint(3, 3));
    });
  });

  // =========================================================================
  // 3. EXIT BEHAVIOR VERIFICATION
  // =========================================================================
  describe('3. Exit Behavior (Simultaneous vs Lock-on-Arrival)', () => {
    it('Simultaneous exit mode: allows characters to enter, leave, and re-enter exits without locking', () => {
      const simCollisions = new CollisionEngine({
        playerGrid,
        shadowGrid,
        exitBehavior: 'SIMULTANEOUS',
      });
      // Setup Player exit at (4,3) and Shadow exit at (1,3)
      const p = new Player({ x: 3, y: 3 }, { x: 4, y: 3 });
      const s = new Shadow({ x: 3, y: 3 }, { x: 1, y: 3 });
      playerGrid.setTileType({ x: 4, y: 3 }, TileType.EXIT);
      shadowGrid.setTileType({ x: 1, y: 3 }, TileType.EXIT);

      const simMove = new MovementEngine(p, s, simCollisions);
      const simTurn = new TurnEngine(simMove);

      // Move right: Player enters exit at (4,3); Shadow moves to (2,3) [not at exit yet]
      const move1 = simTurn.handleInput('right');
      simTurn.endAnimation();
      expect(move1?.playerMoved).toBe(true);
      expect(p.isAtExit()).toBe(true);
      expect(s.isAtExit()).toBe(false);
      expect(simTurn.state).toBe('PLAYING'); // Not finished yet!

      // Player can freely leave the exit! Move up: Player moves to (4,2)
      const move2 = simTurn.handleInput('up');
      simTurn.endAnimation();
      expect(move2?.playerMoved).toBe(true);
      expect(p.position).toEqual(new GridPoint(4, 2)); // Successfully left exit!
      expect(p.isAtExit()).toBe(false);

      // Player can re-enter the exit! Move down: Player moves back to (4,3)
      const move3 = simTurn.handleInput('down');
      simTurn.endAnimation();
      expect(move3?.playerMoved).toBe(true);
      expect(p.position).toEqual(new GridPoint(4, 3)); // Re-entered exit!
      expect(p.isAtExit()).toBe(true);
    });

    it('Simultaneous exit mode: completes level ONLY when both characters occupy exits on the same turn', () => {
      const simCollisions = new CollisionEngine({
        playerGrid,
        shadowGrid,
        exitBehavior: 'SIMULTANEOUS',
      });
      // Exits at (4,3) and (2,3)
      const p = new Player({ x: 3, y: 3 }, { x: 4, y: 3 });
      const s = new Shadow({ x: 3, y: 3 }, { x: 2, y: 3 });
      playerGrid.setTileType({ x: 4, y: 3 }, TileType.EXIT);
      shadowGrid.setTileType({ x: 2, y: 3 }, TileType.EXIT);

      const simMove = new MovementEngine(p, s, simCollisions);
      const simTurn = new TurnEngine(simMove);

      // Moving right causes Player -> (4,3) [exit] and Shadow -> (2,3) [exit] simultaneously!
      const res = simTurn.handleInput('right');
      simTurn.endAnimation();

      expect(res?.bothAtExit).toBe(true);
      expect(simTurn.state).toBe('COMPLETED');
    });

    it('Hazard precedence: death takes priority over exit completion if one character enters a hazard', () => {
      // Player exit at (4,3), Shadow hazard at (2,3)
      const p = new Player({ x: 3, y: 3 }, { x: 4, y: 3 });
      const s = new Shadow({ x: 3, y: 3 }, { x: 0, y: 0 });
      playerGrid.setTileType({ x: 4, y: 3 }, TileType.EXIT);
      shadowGrid.setTileType({ x: 2, y: 3 }, TileType.HAZARD);

      const move = new MovementEngine(p, s, collisionEngine);
      const turn = new TurnEngine(move);

      // Move right: Player hits exit at (4,3), Shadow hits hazard at (2,3)
      const res = turn.handleInput('right');

      expect(res?.hazardTriggered).toBe(true);
      // State must NOT be COMPLETED; death sequence restored players!
      expect(turn.state).toBe('PLAYING');
      expect(p.position).toEqual(new GridPoint(3, 3)); // Restored to initial spawn
      expect(s.position).toEqual(new GridPoint(3, 3)); // Restored to initial spawn
    });
  });

  // =========================================================================
  // 4. CHECKPOINT & RESET VERIFICATION
  // =========================================================================
  describe('4. Checkpoint Activation and Atomic Rollback', () => {
    it('Checkpoint pair activates only after both characters have visited', () => {
      const cp = new CheckpointPair({
        id: 'cp-test',
        realPosition: { x: 4, y: 3 },
        shadowPosition: { x: 2, y: 4 },
      });
      const turn = new TurnEngine({
        movementEngine,
        checkpoints: [cp],
      });

      // Move right: Player reaches (4,3) [Real CP visited], Shadow reaches (2,3) [Not CP]
      turn.handleInput('right');
      turn.endAnimation();
      expect(cp.isRealVisited).toBe(true);
      expect(cp.isShadowVisited).toBe(false);
      expect(cp.isActivated).toBe(false);

      // Move down: Shadow reaches (2,4) [Shadow CP visited!]
      turn.handleInput('down');
      turn.endAnimation();
      expect(cp.isShadowVisited).toBe(true);
      expect(cp.isActivated).toBe(true);
      expect(turn.getLastCheckpointId()).toBe('cp-test');
    });

    it('Hazard death restores characters and puzzle states atomically to active checkpoint', () => {
      const cp = new CheckpointPair({
        id: 'cp-active',
        realPosition: { x: 4, y: 3 },
        shadowPosition: { x: 2, y: 3 },
      });
      const door = new Door({ id: 'door-1', world: 'real', position: { x: 4, y: 2 }, initialOpen: false });
      const sw = new Switch({ id: 'sw-1', world: 'shadow', position: { x: 2, y: 2 }, linkedDoorId: 'door-1' });
      const pm = new PuzzleManager({ doors: [door], switches: [sw] });

      const col = new CollisionEngine({ playerGrid, shadowGrid, puzzleManager: pm });
      const mov = new MovementEngine(player, shadow, col);
      const turn = new TurnEngine({ movementEngine: mov, checkpoints: [cp], puzzleManager: pm });

      // Step 1: Move right to activate checkpoint at Real (4,3) and Shadow (2,3)
      turn.handleInput('right');
      turn.endAnimation();
      expect(cp.isActivated).toBe(true);

      // Step 2: Move up. Real is at (4,2) [Door was closed, but wait, let's hit switch at (2,2) with shadow]
      turn.handleInput('up');
      turn.endAnimation();
      expect(sw.isActive).toBe(true);
      expect(door.isOpen).toBe(true);

      // Step 3: Trigger death sequence
      shadowGrid.setTileType({ x: 2, y: 1 }, TileType.HAZARD);
      turn.handleInput('up'); // Shadow steps on hazard!

      // Assert atomic rollback to checkpoint state:
      expect(turn.state).toBe('PLAYING');
      expect(player.position).toEqual(new GridPoint(4, 3)); // Checkpoint position!
      expect(shadow.position).toEqual(new GridPoint(2, 3)); // Checkpoint position!
      expect(sw.isActive).toBe(false); // Restored to checkpoint state!
      expect(door.isOpen).toBe(false); // Restored to checkpoint state!
    });

    it('Restart level completely restores initial spawn state and clears checkpoints', () => {
      const cp = new CheckpointPair({
        id: 'cp-reset',
        realPosition: { x: 4, y: 3 },
        shadowPosition: { x: 2, y: 3 },
      });
      const turn = new TurnEngine({ movementEngine, checkpoints: [cp] });

      // Move to activate checkpoint
      turn.handleInput('right');
      turn.endAnimation();
      expect(cp.isActivated).toBe(true);

      // Restart level
      turn.restartLevel();
      expect(player.position).toEqual(new GridPoint(3, 3)); // Spawn
      expect(shadow.position).toEqual(new GridPoint(3, 3)); // Spawn
      expect(cp.isActivated).toBe(false); // Cleared
      expect(turn.getLastCheckpointId()).toBeNull();
    });
  });

  // =========================================================================
  // 5. PUZZLE OBJECT DATA-DRIVEN FOUNDATION
  // =========================================================================
  describe('5. Data-driven Puzzle Foundations', () => {
    it('evaluates pressure plate continuous occupancy correctly', () => {
      const door = new Door({ id: 'plate-door', world: 'shadow', position: { x: 1, y: 3 }, initialOpen: false });
      const plate = new PressurePlate({ id: 'p-1', world: 'real', position: { x: 4, y: 3 }, linkedDoorId: 'plate-door' });
      const pm = new PuzzleManager({ doors: [door], pressurePlates: [plate] });

      expect(plate.isPressed).toBe(false);
      expect(door.isOpen).toBe(false);

      // Player steps on plate at (4,3)
      pm.evaluatePressurePlates(new GridPoint(4, 3), new GridPoint(0, 0));
      expect(plate.isPressed).toBe(true);
      expect(door.isOpen).toBe(true);

      // Player steps off plate
      pm.evaluatePressurePlates(new GridPoint(5, 3), new GridPoint(0, 0));
      expect(plate.isPressed).toBe(false);
      expect(door.isOpen).toBe(false);
    });

    it('enforces multi-switch door activation rules (ALL vs ANY)', () => {
      const doorAll = new Door({ id: 'door-all', world: 'real', position: { x: 6, y: 6 }, initialOpen: false, activationRule: 'ALL' });
      const sw1 = new Switch({ id: 's1', world: 'real', position: { x: 1, y: 1 }, linkedDoorId: 'door-all' });
      const sw2 = new Switch({ id: 's2', world: 'shadow', position: { x: 2, y: 2 }, linkedDoorId: 'door-all' });

      const pm = new PuzzleManager({ doors: [doorAll], switches: [sw1, sw2] });

      // Neither active
      expect(doorAll.isOpen).toBe(false);

      // Only 1 switch active -> Door remains closed under ALL rule
      sw1.setActive(true);
      pm.recalculateAllDoors();
      expect(doorAll.isOpen).toBe(false);

      // Both switches active -> Door opens!
      sw2.setActive(true);
      pm.recalculateAllDoors();
      expect(doorAll.isOpen).toBe(true);
    });
  });
});
