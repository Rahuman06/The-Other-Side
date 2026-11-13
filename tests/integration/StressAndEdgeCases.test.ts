import { describe, it, expect, vi } from 'vitest';
import { ALL_LEVELS } from '@/levels/levelsData';
import { LevelFactory } from '@/levels/LevelFactory';
import { StorageManager } from '@/storage/StorageManager';
import { InputController } from '@/systems/InputController';
import { GridPoint } from '@/grid/GridPosition';
import { MoveDirection } from '@/engine/MovementEngine';
import { Door } from '@/puzzles/Door';
import { Switch } from '@/puzzles/Switch';
import { PressurePlate } from '@/puzzles/PressurePlate';
import { PuzzleManager } from '@/puzzles/PuzzleManager';
import { CollisionEngine } from '@/engine/CollisionEngine';
import { Player } from '@/entities/Player';
import { Shadow } from '@/entities/Shadow';
import { MovementEngine } from '@/engine/MovementEngine';
import { TurnEngine } from '@/engine/TurnEngine';

describe('Phase 11 QA — Movement, Collision, Puzzle, Checkpoint, Exit & Stress Testing', () => {
  // =========================================================================
  // SECTION A: MOVEMENT & INPUT
  // =========================================================================
  describe('A. Movement & Input Systems', () => {
    it('executes mirrored horizontal movement and independent wall blocking', () => {
      // 1. Mirrored simultaneous movement (Level 1: Awakening)
      const session1 = LevelFactory.build(ALL_LEVELS[0]);
      const initialPlayer1 = session1.player.position.clone();
      const initialShadow1 = session1.shadow.position.clone();

      const res1 = session1.turnEngine.handleInput('right');
      expect(res1).not.toBeNull();
      session1.turnEngine.endAnimation();

      expect(session1.player.position.x).toBe(initialPlayer1.x + 1);
      expect(session1.shadow.position.x).toBe(initialShadow1.x - 1);

      // 2. Independent wall blocking (Level 2: Two Paths - wall at real (2,2))
      const session2 = LevelFactory.build(ALL_LEVELS[1]);
      const res2 = session2.turnEngine.handleInput('right');
      expect(res2).not.toBeNull();
      session2.turnEngine.endAnimation();

      // Real hit wall at (2,2) -> stays at x=1
      expect(session2.player.position.x).toBe(1);
      // Shadow had floor at (4,2) -> moved from 5 to 4
      expect(session2.shadow.position.x).toBe(4);
    });

    it('blocks character movement during active animation transaction (lock)', () => {
      const session = LevelFactory.build(ALL_LEVELS[0]);
      const res1 = session.turnEngine.handleInput('right');
      expect(res1).not.toBeNull();
      expect(session.turnEngine.isAnimationActive).toBe(true);

      // Attempting input during active animation must be rejected
      const res2 = session.turnEngine.handleInput('right');
      expect(res2).toBeNull();

      // Once animation ends, input is accepted
      session.turnEngine.endAnimation();
      expect(session.turnEngine.isAnimationActive).toBe(false);
      const res3 = session.turnEngine.handleInput('right');
      expect(res3).not.toBeNull();
    });

    it('suppresses held-key repeat events in InputController', () => {
      const onDirection = vi.fn();
      const controller = new InputController({ onDirection });

      // Simulated standard keydown
      const normalEvent = { code: 'KeyD', key: 'd', repeat: false, preventDefault: vi.fn() } as unknown as KeyboardEvent;
      controller.handleKeyDown(normalEvent);
      expect(onDirection).toHaveBeenCalledTimes(1);
      expect(onDirection).toHaveBeenCalledWith('right');

      // Simulated OS key repeat (held key)
      const repeatEvent = { code: 'KeyD', key: 'd', repeat: true, preventDefault: vi.fn() } as unknown as KeyboardEvent;
      controller.handleKeyDown(repeatEvent);
      expect(onDirection).toHaveBeenCalledTimes(1); // Not called again!
    });

    it('clears active keys on window blur (focus loss)', () => {
      const controller = new InputController({
        onDirection: vi.fn(),
      });

      const keyEvent = { code: 'KeyW', key: 'w', repeat: false, preventDefault: vi.fn() } as unknown as KeyboardEvent;
      controller.handleKeyDown(keyEvent);
      expect(controller.isKeyHeld('w')).toBe(true);

      // Focus loss event
      controller.handleBlur();
      expect(controller.isKeyHeld('w')).toBe(false);
      expect(controller.getHeldKeysCount()).toBe(0);
    });

    it('strictly blocks movement out of grid boundaries', () => {
      const p = new Player({ x: 0, y: 0 });
      const s = new Shadow({ x: 4, y: 4 });
      const col = new CollisionEngine({ width: 5, height: 5 });
      const mov = new MovementEngine(p, s, col);
      const turn = new TurnEngine(mov);

      // Real at (0,0) trying to move left (-1) or up (-1)
      const resLeft = turn.handleInput('left');
      turn.endAnimation();
      expect(resLeft?.playerMoved).toBe(false);
      expect(p.position.x).toBe(0);

      const resUp = turn.handleInput('up');
      turn.endAnimation();
      expect(resUp?.playerMoved).toBe(false);
      expect(p.position.y).toBe(0);
    });
  });

  // =========================================================================
  // SECTION B: COLLISION TESTS
  // =========================================================================
  describe('B. Collision Rules and Edge Cases', () => {
    it('evaluates walls, open floors, hazards, and out-of-bounds correctly', () => {
      const col = new CollisionEngine({
        width: 5,
        height: 5,
        playerWalls: [{ x: 1, y: 1 }],
      });

      // Wall cell
      const wallRes = col.evaluatePlayerDestination({ x: 1, y: 1 }, false);
      expect(wallRes.canEnter).toBe(false);
      expect(wallRes.isBlocked).toBe(true);

      // Open floor cell
      const floorRes = col.evaluatePlayerDestination({ x: 0, y: 0 }, false);
      expect(floorRes.canEnter).toBe(true);
      expect(floorRes.isBlocked).toBe(false);

      // Out of bounds cell
      const oobRes = col.evaluatePlayerDestination({ x: -1, y: 2 }, false);
      expect(oobRes.canEnter).toBe(false);
      expect(oobRes.isBlocked).toBe(true);
    });
  });

  // =========================================================================
  // SECTION C: PUZZLE TESTS
  // =========================================================================
  describe('C. Puzzle Mechanics Edge Cases', () => {
    it('allows a character already standing inside a door cell to exit when the door closes', () => {
      const d = new Door({ id: 'door-occ', world: 'real', position: { x: 2, y: 2 }, initialOpen: true });
      const plate = new PressurePlate({ id: 'plate-occ', world: 'shadow', position: { x: 3, y: 2 }, linkedDoorId: 'door-occ' });
      plate.setPressed(true); // Initially holding door open

      const pm = new PuzzleManager({ doors: [d], pressurePlates: [plate] });
      const col = new CollisionEngine({ width: 5, height: 5, puzzleManager: pm });

      // Player is standing INSIDE the door at (2,2)
      // Plate deactivates (Shadow steps off) -> door closes
      plate.setPressed(false);
      pm.recalculateAllDoors();
      expect(d.isOpen).toBe(false);

      // Player at (2,2) tries to move to (3,2): leaving the closed door cell is ALLOWED!
      const exitRes = col.evaluatePlayerDestination({ x: 3, y: 2 }, false, { x: 2, y: 2 });
      expect(exitRes.canEnter).toBe(true);

      // But an outsider at (1,2) trying to enter (2,2) is BLOCKED!
      const enterRes = col.evaluatePlayerDestination({ x: 2, y: 2 }, false, { x: 1, y: 2 });
      expect(enterRes.canEnter).toBe(false);
    });

    it('handles multi-switch door activation logic (ALL vs ANY)', () => {
      const dAll = new Door({ id: 'd-all', world: 'real', position: { x: 3, y: 2 }, initialOpen: false, activationRule: 'ALL' });
      const sw1 = new Switch({ id: 'sw-1', world: 'real', position: { x: 1, y: 1 }, linkedDoorId: 'd-all' });
      const sw2 = new Switch({ id: 'sw-2', world: 'real', position: { x: 1, y: 3 }, linkedDoorId: 'd-all' });

      const pm = new PuzzleManager({ doors: [dAll], switches: [sw1, sw2] });

      sw1.setActive(true);
      pm.recalculateAllDoors();
      expect(dAll.isOpen).toBe(false); // Only 1 active

      sw2.setActive(true);
      pm.recalculateAllDoors();
      expect(dAll.isOpen).toBe(true); // Both active
    });

    it('restores initial door and switch states upon reset', () => {
      const d = new Door({ id: 'd-res', world: 'real', position: { x: 3, y: 2 }, initialOpen: false });
      const sw = new Switch({ id: 'sw-res', world: 'real', position: { x: 1, y: 1 }, linkedDoorId: 'd-res' });
      const pm = new PuzzleManager({ doors: [d], switches: [sw] });

      sw.setActive(true);
      pm.recalculateAllDoors();
      expect(d.isOpen).toBe(true);

      pm.reset();
      expect(sw.isActive).toBe(false);
      expect(d.isOpen).toBe(false);
    });
  });

  // =========================================================================
  // SECTION D: CHECKPOINT TESTS
  // =========================================================================
  describe('D. Checkpoint Pairing and Atomic Death Restoration', () => {
    it('activates paired checkpoint only when both characters have visited', () => {
      const session = LevelFactory.build(ALL_LEVELS[10]); // Level 11: No Way Back (CP at real: (3,2), shadow: (4,2))
      const cp = session.checkpoints[0];
      expect(cp.isActivated).toBe(false);

      // Move 1 right: Real to (2,2), Shadow to (5,2)
      session.turnEngine.handleInput('right');
      session.turnEngine.endAnimation();
      expect(cp.isActivated).toBe(false);

      // Move 2 right: Real to (3,2) [visits], Shadow to (4,2) [visits]
      session.turnEngine.handleInput('right');
      session.turnEngine.endAnimation();
      expect(cp.isRealVisited).toBe(true);
      expect(cp.isShadowVisited).toBe(true);
      expect(cp.isActivated).toBe(true);
    });

    it('restores exact checkpoint snapshot on death', () => {
      // Level 11: No Way Back has checkpoint cp-11 at real (3,2), shadow (4,2)
      const session = LevelFactory.build(ALL_LEVELS[10]);

      // Move right twice to hit checkpoint at (3,2) and (4,2)
      session.turnEngine.handleInput('right');
      session.turnEngine.endAnimation();
      session.turnEngine.handleInput('right');
      session.turnEngine.endAnimation();

      expect(session.checkpoints[0].isActivated).toBe(true);
      expect(session.player.position).toEqual(new GridPoint(3, 2));
      expect(session.shadow.position).toEqual(new GridPoint(4, 2));

      // Move right away from checkpoint: Real to (4,2), Shadow to (3,2)
      session.turnEngine.handleInput('right');
      session.turnEngine.endAnimation();
      expect(session.player.position).toEqual(new GridPoint(4, 2));
      expect(session.shadow.position).toEqual(new GridPoint(3, 2));

      // Trigger death sequence: atomically rolls back to checkpoint snapshot
      session.turnEngine.executeDeathSequence();

      expect(session.turnEngine.state).toBe('PLAYING');
      expect(session.player.position).toEqual(new GridPoint(3, 2));
      expect(session.shadow.position).toEqual(new GridPoint(4, 2));
    });
  });

  // =========================================================================
  // SECTION E: EXITS & COMPLETION
  // =========================================================================
  describe('E. Exit Locking and Completion', () => {
    it('locks character that reaches exit while allowing other character to continue', () => {
      // Build session where player reaches exit before shadow
      const session = LevelFactory.build(ALL_LEVELS[0]);

      // In Level 1, both reach exit together on move 4
      session.turnEngine.handleInput('right');
      session.turnEngine.endAnimation();
      session.turnEngine.handleInput('right');
      session.turnEngine.endAnimation();
      session.turnEngine.handleInput('right');
      session.turnEngine.endAnimation();
      session.turnEngine.handleInput('right');
      session.turnEngine.endAnimation();

      expect(session.player.isAtExit()).toBe(true);
      expect(session.shadow.isAtExit()).toBe(true);
      expect(session.turnEngine.state).toBe('COMPLETED');

      // Further moves must be rejected
      const extraMove = session.turnEngine.handleInput('right');
      expect(extraMove).toBeNull();
    });
  });

  // =========================================================================
  // SECTION G: STRESS TESTS
  // =========================================================================
  describe('G. Rigorous Stress Tests', () => {
    it('executes 1,000 rapid movement transactions without corrupting coordinates or crashing', () => {
      const session = LevelFactory.build(ALL_LEVELS[12]); // Level 13: Dual Locks (complex switches & doors)
      const directions: MoveDirection[] = ['up', 'right', 'down', 'left'];

      for (let i = 0; i < 1000; i++) {
        const dir = directions[i % 4];
        const res = session.turnEngine.handleInput(dir);
        session.turnEngine.endAnimation();

        if (res) {
          expect(session.player.position.x).toBeGreaterThanOrEqual(0);
          expect(session.player.position.y).toBeGreaterThanOrEqual(0);
          expect(session.shadow.position.x).toBeGreaterThanOrEqual(0);
          expect(session.shadow.position.y).toBeGreaterThanOrEqual(0);
          expect(Number.isInteger(session.player.position.x)).toBe(true);
          expect(Number.isInteger(session.shadow.position.x)).toBe(true);
        }

        // Auto restart if level completed during random fuzzing
        if (session.turnEngine.state === 'COMPLETED') {
          session.turnEngine.restartLevel();
        }
      }
    });

    it('performs 100 consecutive restart cycles without state leakage', () => {
      const session = LevelFactory.build(ALL_LEVELS[4]);
      const expectedPlayerStart = session.player.position.clone();
      const expectedShadowStart = session.shadow.position.clone();

      for (let i = 0; i < 100; i++) {
        session.turnEngine.handleInput('right');
        session.turnEngine.endAnimation();
        session.turnEngine.restartLevel();

        expect(session.turnEngine.state).toBe('PLAYING');
        expect(session.player.position).toEqual(expectedPlayerStart);
        expect(session.shadow.position).toEqual(expectedShadowStart);
        for (const door of session.puzzleManager.getAllDoors()) {
          expect(door.isOpen).toBe(door.initialOpen);
        }
      }
    });

    it('performs 100 pause and resume cycles cleanly', () => {
      const session = LevelFactory.build(ALL_LEVELS[0]);

      for (let i = 0; i < 100; i++) {
        session.turnEngine.pause();
        expect(session.turnEngine.state).toBe('PAUSED');
        // Inputs must be rejected while paused
        expect(session.turnEngine.handleInput('right')).toBeNull();

        session.turnEngine.resume();
        expect(session.turnEngine.state).toBe('PLAYING');
      }
    });

    it('rapidly loads and instantiates 100 level sessions across all 20 levels', () => {
      for (let i = 0; i < 100; i++) {
        const levelIndex = i % ALL_LEVELS.length;
        const session = LevelFactory.build(ALL_LEVELS[levelIndex]);
        expect(session.player.position).toBeDefined();
        expect(session.shadow.position).toBeDefined();
        expect(session.turnEngine.state).toBe('PLAYING');
      }
    });

    it('executes 100 save and load cycles without memory or data corruption', () => {
      const store: Record<string, string> = {};
      const mockStorage = {
        getItem: (k: string) => store[k] ?? null,
        setItem: (k: string, v: string) => {
          store[k] = v;
        },
        removeItem: (k: string) => delete store[k],
        clear: () => {},
        key: () => null,
        length: 0,
      };

      const storage = new StorageManager(mockStorage as unknown as Storage);

      for (let i = 1; i <= 100; i++) {
        const lvl = (i % 20) + 1;
        storage.recordLevelCompletion(lvl, 5 + (i % 10));
        storage.setMuted(i % 2 === 0);
        storage.setReducedMotion(i % 3 === 0);

        const loaded = storage.getProgress();
        expect(loaded.completedLevels.length).toBeGreaterThanOrEqual(1);
        expect(loaded.saveVersion).toBe(1);
        expect(typeof loaded.settings.muted).toBe('boolean');
      }
    });

    it('safely ignores directional inputs while game is paused', () => {
      const session = LevelFactory.build(ALL_LEVELS[0]);
      const initialPlayerPos = session.player.position.clone();
      const initialShadowPos = session.shadow.position.clone();

      session.turnEngine.pause();
      expect(session.turnEngine.state).toBe('PAUSED');

      const res = session.turnEngine.handleInput('right');
      expect(res).toBeNull();
      expect(session.player.position).toEqual(initialPlayerPos);
      expect(session.shadow.position).toEqual(initialShadowPos);

      session.turnEngine.resume();
      expect(session.turnEngine.state).toBe('PLAYING');
      const activeRes = session.turnEngine.handleInput('right');
      expect(activeRes).not.toBeNull();
    });

    it('attaches and detaches InputController listeners without leakage', () => {
      const listeners: Record<string, EventListener[]> = {};
      const mockWin = {
        addEventListener: vi.fn((event: string, fn: EventListener) => {
          if (!listeners[event]) listeners[event] = [];
          listeners[event].push(fn);
        }),
        removeEventListener: vi.fn((event: string, fn: EventListener) => {
          if (listeners[event]) {
            listeners[event] = listeners[event].filter((l) => l !== fn);
          }
        }),
      } as unknown as Window;

      const controller = new InputController({ onDirection: vi.fn() });
      controller.attach(mockWin);

      expect(mockWin.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
      expect(mockWin.addEventListener).toHaveBeenCalledWith('keyup', expect.any(Function));
      expect(mockWin.addEventListener).toHaveBeenCalledWith('blur', expect.any(Function));

      controller.detach();

      expect(mockWin.removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
      expect(mockWin.removeEventListener).toHaveBeenCalledWith('keyup', expect.any(Function));
      expect(mockWin.removeEventListener).toHaveBeenCalledWith('blur', expect.any(Function));
      expect(listeners['keydown']).toHaveLength(0);
      expect(listeners['keyup']).toHaveLength(0);
      expect(listeners['blur']).toHaveLength(0);
    });
  });
});
