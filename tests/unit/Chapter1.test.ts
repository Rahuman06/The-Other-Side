import { describe, it, expect } from 'vitest';
import { ALL_LEVELS } from '@/levels/levelsData';
import { LevelFactory } from '@/levels/LevelFactory';
import { LevelValidator } from '@/solver/LevelValidator';
import { LevelSolver } from '@/solver/LevelSolver';
import { GridPoint } from '@/grid/GridPosition';

describe('Phase 3 — Chapter 1: The Beginning (Levels 1–4)', () => {
  const chapter1Levels = ALL_LEVELS.slice(0, 4);

  it('contains exactly four handcrafted levels with correct titles', () => {
    expect(chapter1Levels).toHaveLength(4);
    expect(chapter1Levels[0].name).toBe('Awakening');
    expect(chapter1Levels[1].name).toBe('Two Paths');
    expect(chapter1Levels[2].name).toBe('The First Connection');
    expect(chapter1Levels[3].name).toBe('Alignment');
  });

  // =========================================================================
  // LEVEL 1: AWAKENING
  // =========================================================================
  describe('Level 1: Awakening', () => {
    const level1 = chapter1Levels[0];

    it('passes schema validation', () => {
      const val = LevelValidator.validateSchema(level1);
      expect(val.valid).toBe(true);
      expect(val.errors).toHaveLength(0);
    });

    it('teaches horizontal mirrored movement and completes via replay', () => {
      const session = LevelFactory.build(level1);
      expect(session.player.position).toEqual(new GridPoint(1, 2));
      expect(session.shadow.position).toEqual(new GridPoint(5, 2));
      expect(session.turnEngine.state).toBe('PLAYING');

      // Replay solution trace step by step
      for (const dir of level1.solutionTrace) {
        const res = session.turnEngine.handleInput(dir);
        expect(res).not.toBeNull();
        session.turnEngine.endAnimation();
      }

      // Assert completion
      expect(session.turnEngine.state).toBe('COMPLETED');
      expect(session.player.isAtExit()).toBe(true);
      expect(session.shadow.isAtExit()).toBe(true);
      expect(session.player.position).toEqual(new GridPoint(5, 2));
      expect(session.shadow.position).toEqual(new GridPoint(1, 2));
    });

    it('is solved by BFS solver within bounds', () => {
      const solverResult = LevelSolver.solve(level1);
      expect(solverResult.solutionFound).toBe(true);
      expect(solverResult.replayVerified).toBe(true);
      expect(solverResult.solutionSequence).toEqual(level1.solutionTrace);
    });
  });

  // =========================================================================
  // LEVEL 2: TWO PATHS
  // =========================================================================
  describe('Level 2: Two Paths', () => {
    const level2 = chapter1Levels[1];

    it('passes schema validation', () => {
      const val = LevelValidator.validateSchema(level2);
      expect(val.valid).toBe(true);
      expect(val.errors).toHaveLength(0);
    });

    it('demonstrates independent wall collision (Real blocked while Shadow moves)', () => {
      const session = LevelFactory.build(level2);

      // Initial positions
      expect(session.player.position).toEqual(new GridPoint(1, 2));
      expect(session.shadow.position).toEqual(new GridPoint(5, 2));

      // Move 1: 'right'
      // Real is blocked by wall at (2,2)
      // Shadow moves free to (4,2)
      const res1 = session.turnEngine.handleInput('right');
      session.turnEngine.endAnimation();

      expect(res1?.playerMoved).toBe(false);
      expect(res1?.shadowMoved).toBe(true);
      expect(session.player.position).toEqual(new GridPoint(1, 2)); // Unmoved
      expect(session.shadow.position).toEqual(new GridPoint(4, 2)); // Moved left
    });

    it('completes level through the alternative upper corridor', () => {
      const replay = LevelValidator.replaySolution(level2, level2.solutionTrace);
      expect(replay.success).toBe(true);
      expect(replay.completed).toBe(true);
      expect(replay.died).toBe(false);
    });

    it('is solved by BFS solver within bounds', () => {
      const solverResult = LevelSolver.solve(level2);
      expect(solverResult.solutionFound).toBe(true);
      expect(solverResult.replayVerified).toBe(true);
    });
  });

  // =========================================================================
  // LEVEL 3: THE FIRST CONNECTION
  // =========================================================================
  describe('Level 3: The First Connection', () => {
    const level3 = chapter1Levels[2];

    it('passes schema validation with switch and door cross-world linkages', () => {
      const val = LevelValidator.validateSchema(level3);
      expect(val.valid).toBe(true);
      expect(val.errors).toHaveLength(0);
      expect(level3.doors).toHaveLength(1);
      expect(level3.switches).toHaveLength(1);
      expect(level3.doors![0].world).toBe('shadow');
      expect(level3.switches![0].world).toBe('real');
      expect(level3.switches![0].linkedDoorId).toBe(level3.doors![0].id);
    });

    it('teaches switch activation opening opposite-world door', () => {
      const session = LevelFactory.build(level3);
      const door = session.puzzleManager.getDoor('door-3')!;
      const sw = session.puzzleManager.getSwitch('sw-3')!;

      // Initially closed
      expect(door.isOpen).toBe(false);
      expect(sw.isActive).toBe(false);

      // Move 1: 'right' -> Real steps onto switch at (2,2)
      session.turnEngine.handleInput('right');
      session.turnEngine.endAnimation();

      expect(sw.isActive).toBe(true);
      expect(door.isOpen).toBe(true); // Shadow door is now OPEN!

      // Move 2: 'right' -> Shadow steps through opened door at (3,2)
      const res2 = session.turnEngine.handleInput('right');
      session.turnEngine.endAnimation();

      expect(res2?.shadowMoved).toBe(true);
      expect(session.shadow.position).toEqual(new GridPoint(3, 2));

      // Remaining moves to exits
      session.turnEngine.handleInput('right');
      session.turnEngine.endAnimation();
      session.turnEngine.handleInput('right');
      session.turnEngine.endAnimation();

      expect(session.turnEngine.state).toBe('COMPLETED');
    });

    it('is solved by BFS solver and verifies replay', () => {
      const solverResult = LevelSolver.solve(level3);
      expect(solverResult.solutionFound).toBe(true);
      expect(solverResult.replayVerified).toBe(true);
      expect(solverResult.solutionLength).toBe(4);
    });
  });

  // =========================================================================
  // LEVEL 4: ALIGNMENT
  // =========================================================================
  describe('Level 4: Alignment', () => {
    const level4 = chapter1Levels[3];

    it('passes schema validation', () => {
      const val = LevelValidator.validateSchema(level4);
      expect(val.valid).toBe(true);
      expect(val.errors).toHaveLength(0);
      expect(level4.doors).toHaveLength(1);
      expect(level4.switches).toHaveLength(1);
    });

    it('requires multi-step planning: positioning Shadow onto switch before descending together', () => {
      const session = LevelFactory.build(level4);
      const door = session.puzzleManager.getDoor('door-4')!;
      const sw = session.puzzleManager.getSwitch('sw-4')!;

      expect(door.isOpen).toBe(false);

      // Step 1 & 2: Bump Real into wall at (2,1) while Shadow walks to switch at (3,1)
      session.turnEngine.handleInput('right');
      session.turnEngine.endAnimation();
      expect(session.player.position).toEqual(new GridPoint(1, 1));
      expect(session.shadow.position).toEqual(new GridPoint(4, 1));
      expect(door.isOpen).toBe(false);

      session.turnEngine.handleInput('right');
      session.turnEngine.endAnimation();
      expect(session.player.position).toEqual(new GridPoint(1, 1));
      expect(session.shadow.position).toEqual(new GridPoint(3, 1)); // Hits switch!
      expect(sw.isActive).toBe(true);
      expect(door.isOpen).toBe(true); // Door unlocked!

      // Replay remainder of solution
      for (const dir of level4.solutionTrace.slice(2)) {
        session.turnEngine.handleInput(dir);
        session.turnEngine.endAnimation();
      }

      expect(session.turnEngine.state).toBe('COMPLETED');
      expect(session.player.position).toEqual(new GridPoint(5, 3));
      expect(session.shadow.position).toEqual(new GridPoint(1, 3));
    });

    it('is solved by BFS solver and verifies replay', () => {
      const solverResult = LevelSolver.solve(level4);
      expect(solverResult.solutionFound).toBe(true);
      expect(solverResult.replayVerified).toBe(true);
    });
  });

  // =========================================================================
  // CHAPTER 1 RESET & MOVE COUNTING
  // =========================================================================
  describe('Chapter 1 Reset & Move Counting', () => {
    it('accurately tracks moves and resets cleanly on restart across all 4 levels', () => {
      for (const lvl of chapter1Levels) {
        let moves = 0;
        const session = LevelFactory.build(lvl, {
          onMoveCommitted: () => {
            moves++;
          },
        });

        // Make 2 moves
        session.turnEngine.handleInput(lvl.solutionTrace[0]);
        session.turnEngine.endAnimation();
        session.turnEngine.handleInput(lvl.solutionTrace[1]);
        session.turnEngine.endAnimation();

        expect(moves).toBe(2);

        // Restart level
        session.turnEngine.restartLevel();
        expect(session.player.position).toEqual(GridPoint.from(lvl.realStart));
        expect(session.shadow.position).toEqual(GridPoint.from(lvl.shadowStart));
        expect(session.turnEngine.state).toBe('PLAYING');
      }
    });
  });
});
