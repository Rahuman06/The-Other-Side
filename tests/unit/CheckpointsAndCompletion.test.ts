import { describe, it, expect, beforeEach } from 'vitest';
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
import { PuzzleManager } from '@/puzzles/PuzzleManager';
import { GridPoint } from '@/grid/GridPosition';
import { StorageManager } from '@/storage/StorageManager';

describe('Phase 06 — Checkpoint and Completion System', () => {
  let player: Player;
  let shadow: Shadow;
  let playerGrid: WorldGrid;
  let shadowGrid: WorldGrid;
  let puzzleManager: PuzzleManager;
  let collisions: CollisionEngine;
  let movement: MovementEngine;
  let turnEngine: TurnEngine;
  let checkpoint: CheckpointPair;

  beforeEach(() => {
    // Player starts at (1,2), exit at (4,2)
    player = new Player({ x: 1, y: 2 }, { x: 4, y: 2 });
    // Shadow starts at (3,2), exit at (0,2)
    shadow = new Shadow({ x: 3, y: 2 }, { x: 0, y: 2 });

    playerGrid = new WorldGrid({ width: 5, height: 5 });
    shadowGrid = new WorldGrid({ width: 5, height: 5 });

    // Real world hazard at (2,1)
    playerGrid.setCell({
      position: new GridPoint(2, 1),
      tileType: TileType.HAZARD,
      hazard: { id: 'hz-real' },
    });

    // Shadow world hazard at (2,3)
    shadowGrid.setCell({
      position: new GridPoint(2, 3),
      tileType: TileType.HAZARD,
      hazard: { id: 'hz-shadow' },
    });

    // Paired Checkpoint at real (2,2) and shadow (2,2)
    checkpoint = new CheckpointPair({
      id: 'cp-pair-1',
      realPosition: { x: 2, y: 2 },
      shadowPosition: { x: 2, y: 2 },
    });

    const door = new Door({
      id: 'door-puzzle',
      world: 'real',
      position: { x: 3, y: 1 },
      initialOpen: false,
    });

    const sw = new Switch({
      id: 'sw-puzzle',
      world: 'shadow',
      position: { x: 3, y: 3 },
      linkedDoorId: 'door-puzzle',
    });

    puzzleManager = new PuzzleManager({
      doors: [door],
      switches: [sw],
    });

    collisions = new CollisionEngine({
      playerGrid,
      shadowGrid,
      puzzleManager,
    });

    movement = new MovementEngine(player, shadow, collisions);

    turnEngine = new TurnEngine({
      movementEngine: movement,
      checkpoints: [checkpoint],
      puzzleManager,
    });
  });

  it('One character dies: restores both characters to initial start if no checkpoint active', () => {
    let deathTriggered = false;
    let respawnTriggered = false;

    const testTurn = new TurnEngine({
      movementEngine: movement,
      // No checkpoint registered for this test
      checkpoints: [],
      puzzleManager,
      events: {
        onDeath: () => {
          deathTriggered = true;
        },
        onRespawn: () => {
          respawnTriggered = true;
        },
      },
    });

    expect(testTurn.getLastCheckpointId()).toBeNull();

    // Player moves to (2,2), Shadow moves to (2,2)
    testTurn.handleInput('right');
    testTurn.endAnimation();
    expect(player.position).toEqual(new GridPoint(2, 2));
    expect(shadow.position).toEqual(new GridPoint(2, 2));

    // Player steps up into (2,1) which is a hazard! Shadow steps up to (2,1) [free]
    testTurn.handleInput('up');

    expect(deathTriggered).toBe(true);
    expect(respawnTriggered).toBe(true);
    // Both characters restored to initial level snapshot
    expect(player.position).toEqual(new GridPoint(1, 2));
    expect(shadow.position).toEqual(new GridPoint(3, 2));
    expect(testTurn.state).toBe('PLAYING');
  });

  it('Both characters enter hazards simultaneously: triggers death and restores both', () => {
    // Place hazards at player (2,2) and shadow (2,2)
    playerGrid.setCell({ position: new GridPoint(2, 2), tileType: TileType.HAZARD, hazard: { id: 'hz-p' } });
    shadowGrid.setCell({ position: new GridPoint(2, 2), tileType: TileType.HAZARD, hazard: { id: 'hz-s' } });

    let deathCount = 0;
    const testTurn = new TurnEngine({
      movementEngine: movement,
      events: {
        onDeath: () => {
          deathCount++;
        },
      },
    });

    // Move right: both step into their respective hazards at (2,2)
    testTurn.handleInput('right');

    expect(deathCount).toBe(1); // Executed exactly once!
    expect(player.position).toEqual(new GridPoint(1, 2));
    expect(shadow.position).toEqual(new GridPoint(3, 2));
  });

  it('Death cancels visual animation immediately and resets transaction lock', () => {
    let animationCancelled = false;
    const testTurn = new TurnEngine({
      movementEngine: movement,
      events: {
        onCancelAnimation: () => {
          animationCancelled = true;
        },
      },
    });

    // Step right (player to 2,2, shadow to 2,2)
    testTurn.handleInput('right');
    testTurn.endAnimation();

    // Step up (player into hazard 2,1)
    testTurn.handleInput('up');

    expect(animationCancelled).toBe(true);
    expect(testTurn.isTransactionActive()).toBe(false); // Unlocked!
  });

  it('Checkpoint visited by one character only: does NOT activate yet', () => {
    // Player moves to (2,2) [visits real checkpoint], Shadow moves to (4,2) (not checkpoint)
    // Setup shadow at (4,2)
    shadow.setPosition({ x: 4, y: 2 });

    // Move right: Player 1 -> 2 (hits checkpoint), Shadow 4 -> 3 (mirrored, misses checkpoint)
    turnEngine.handleInput('right');
    turnEngine.endAnimation();

    expect(checkpoint.isRealVisited).toBe(true);
    expect(checkpoint.isShadowVisited).toBe(false);
    expect(checkpoint.isActivated).toBe(false);
    expect(turnEngine.getLastCheckpointId()).toBeNull();
  });

  it('Both characters activate checkpoint pair: stores snapshot and activates checkpoint', () => {
    let activatedId: string | null = null;
    const testTurn = new TurnEngine({
      movementEngine: movement,
      checkpoints: [checkpoint],
      puzzleManager,
      events: {
        onCheckpointActivated: (id) => {
          activatedId = id;
        },
      },
    });

    // Player at (1,2), Shadow at (3,2).
    // Moving right: Player goes to (2,2) [checkpoint], Shadow goes to (2,2) [checkpoint]!
    testTurn.handleInput('right');
    testTurn.endAnimation();

    expect(checkpoint.isRealVisited).toBe(true);
    expect(checkpoint.isShadowVisited).toBe(true);
    expect(checkpoint.isActivated).toBe(true);
    expect(activatedId).toBe('cp-pair-1');
    expect(testTurn.getLastCheckpointId()).toBe('cp-pair-1');
  });

  it('Checkpoint restoration: restores characters and puzzle states to saved snapshot', () => {
    // 1. Activate checkpoint at (2,2)
    turnEngine.handleInput('right');
    turnEngine.endAnimation();
    expect(checkpoint.isActivated).toBe(true);

    // 2. Shadow steps onto switch at (3,3) which opens door at (3,1)
    // Shadow is at (2,2), Player is at (2,2).
    // Move left: Player goes to (1,2), Shadow goes to (3,2).
    turnEngine.handleInput('left');
    turnEngine.endAnimation();

    // Move down: Player goes to (1,3), Shadow goes to (3,3) [switch!]
    turnEngine.handleInput('down');
    turnEngine.endAnimation();

    const door = puzzleManager.getDoor('door-puzzle');
    expect(door?.isOpen).toBe(true);

    // 3. Shadow steps up into hazard or player enters hazard
    // Player is at (1,3). Move right: Player goes to (2,3) [free], Shadow goes to (2,3) [hazard!]
    turnEngine.handleInput('right');

    // Both must be restored to checkpoint at (2,2)!
    expect(player.position).toEqual(new GridPoint(2, 2));
    expect(shadow.position).toEqual(new GridPoint(2, 2));
    // Puzzle state is restored to checkpoint snapshot (door was closed when checkpoint was activated)
    expect(door?.isOpen).toBe(false);
  });

  it('One character exits: locks that character and allows the other to continue moving', () => {
    // Player exit is at (4,2). Shadow exit is at (0,2).
    // Place Player directly at exit (4,2)
    player.setPosition({ x: 4, y: 2 });
    expect(player.isAtExit()).toBe(true);
    expect(shadow.isAtExit()).toBe(false);

    // Move right: Player cannot move further (locked at exit).
    // Shadow at (3,2) moves left (-1) to (2,2).
    const res1 = turnEngine.handleInput('right');
    expect(res1?.playerMoved).toBe(false);
    expect(res1?.shadowMoved).toBe(true);
    expect(player.position).toEqual(new GridPoint(4, 2));
    expect(shadow.position).toEqual(new GridPoint(2, 2));
    expect(turnEngine.state).toBe('PLAYING');
  });

  it('Both characters exit: completes level and fires onLevelComplete', () => {
    let levelCompleted = false;
    const testTurn = new TurnEngine({
      movementEngine: movement,
      events: {
        onLevelComplete: () => {
          levelCompleted = true;
        },
      },
    });

    // Place Player at (3,2) and Shadow at (1,2)
    player.setPosition({ x: 3, y: 2 });
    shadow.setPosition({ x: 1, y: 2 });

    // Moving right: Player reaches exit at (4,2), Shadow reaches exit at (0,2)!
    const res = testTurn.handleInput('right');
    expect(res?.bothAtExit).toBe(true);
    expect(levelCompleted).toBe(true);
    expect(testTurn.state).toBe('COMPLETED');
  });

  it('Duplicate death events: resets only once and remains idempotent', () => {
    let deathCount = 0;
    const testTurn = new TurnEngine({
      movementEngine: movement,
      events: {
        onDeath: () => {
          deathCount++;
          // Attempt nested re-entrant death sequence call during active death handling
          testTurn.executeDeathSequence();
        },
      },
    });

    testTurn.executeDeathSequence();

    expect(deathCount).toBe(1);
    expect(testTurn.state).toBe('PLAYING');
  });

  it('Restart during gameplay: restores initial level state', () => {
    // Advance characters and activate checkpoint
    turnEngine.handleInput('right');
    turnEngine.endAnimation();
    expect(checkpoint.isActivated).toBe(true);

    // Restart level
    turnEngine.restartLevel();

    expect(turnEngine.getLastCheckpointId()).toBeNull();
    expect(checkpoint.isActivated).toBe(false);
    expect(player.position).toEqual(new GridPoint(1, 2));
    expect(shadow.position).toEqual(new GridPoint(3, 2));
    expect(turnEngine.state).toBe('PLAYING');
  });

  it('New game: resets saved progression only after user confirmation', () => {
    const storage = new StorageManager();
    storage.recordLevelCompletion(1, 10);
    expect(storage.getProgress().unlockedLevel).toBe(2);

    // Unconfirmed request does NOT reset
    const unconfirmed = storage.startNewGame(false);
    expect(unconfirmed).toBe(false);
    expect(storage.getProgress().unlockedLevel).toBe(2); // Preserved!

    // Confirmed request resets progress
    const confirmed = storage.startNewGame(true);
    expect(confirmed).toBe(true);
    expect(storage.getProgress().unlockedLevel).toBe(1); // Reset!
  });

  it('restores ACTIVATE_ONLY switch correctly during checkpoint rollback', () => {
    // Setup switch with ACTIVATE_ONLY behavior linked to a door
    const doorAO = new Door({ id: 'door-ao', world: 'real', position: { x: 3, y: 0 }, initialOpen: false });
    const swAO = new Switch({
      id: 'sw-ao',
      world: 'real',
      position: { x: 3, y: 2 },
      linkedDoorId: 'door-ao',
      initialActive: false,
      activationBehavior: 'ACTIVATE_ONLY',
    });
    const pmAO = new PuzzleManager({ doors: [doorAO], switches: [swAO] });
    const colAO = new CollisionEngine({ playerGrid, shadowGrid, puzzleManager: pmAO });
    const movAO = new MovementEngine(player, shadow, colAO);
    const turnAO = new TurnEngine({ movementEngine: movAO, checkpoints: [checkpoint], puzzleManager: pmAO });

    // Step 1: Reach checkpoint at (2,2) when switch is FALSE
    turnAO.handleInput('right');
    turnAO.endAnimation();
    expect(checkpoint.isActivated).toBe(true);
    expect(swAO.isActive).toBe(false);

    // Step 2: Manually activate switch (as if reached)
    swAO.onEnter();
    expect(swAO.isActive).toBe(true);

    // Step 3: Trigger death sequence to rollback to checkpoint
    turnAO.executeDeathSequence();

    // Verify switch is restored to false, despite being ACTIVATE_ONLY
    expect(swAO.isActive).toBe(false);
  });
});
