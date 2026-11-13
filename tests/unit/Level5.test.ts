import { describe, it, expect } from 'vitest';
import { ALL_LEVELS } from '@/levels/levelsData';
import { LevelFactory } from '@/levels/LevelFactory';
import { LevelValidator } from '@/solver/LevelValidator';
import { LevelSolver } from '@/solver/LevelSolver';
import { GridPoint } from '@/grid/GridPosition';
import { MoveDirection } from '@/engine/MovementEngine';

describe('Phase 4 — Level 5: The Impossible Choice', () => {
  const level5 = ALL_LEVELS[4]; // Level 5 (0-indexed: 4)

  it('has correct metadata and schema configuration', () => {
    expect(level5.id).toBe(5);
    expect(level5.name).toBe('The Impossible Choice');
    expect(level5.chapter).toBe('THE CONNECTION');
    expect(level5.difficulty).toBe('MEDIUM');
    expect(level5.width).toBe(7);
    expect(level5.height).toBe(5);

    const val = LevelValidator.validateSchema(level5);
    expect(val.valid).toBe(true);
    expect(val.errors).toHaveLength(0);
  });

  it('configures paired pressure plates and linked doors across worlds', () => {
    expect(level5.pressurePlates).toBeDefined();
    expect(level5.pressurePlates).toHaveLength(2);
    expect(level5.doors).toBeDefined();
    expect(level5.doors).toHaveLength(2);

    const plateReal = level5.pressurePlates?.find((p) => p.world === 'real');
    const plateShadow = level5.pressurePlates?.find((p) => p.world === 'shadow');
    const doorReal = level5.doors?.find((d) => d.world === 'real');
    const doorShadow = level5.doors?.find((d) => d.world === 'shadow');

    expect(plateReal).toBeDefined();
    expect(plateShadow).toBeDefined();
    expect(doorReal).toBeDefined();
    expect(doorShadow).toBeDefined();

    // Cross-world linking: Real plate controls Shadow door, Shadow plate controls Real door
    expect(plateReal?.linkedDoorId).toBe(doorShadow?.id);
    expect(plateShadow?.linkedDoorId).toBe(doorReal?.id);
  });

  describe('Mechanics & Puzzle Flow', () => {
    it('initializes with both doors closed and characters at start positions', () => {
      const session = LevelFactory.build(level5);
      expect(session.player.position).toEqual(new GridPoint(1, 2));
      expect(session.shadow.position).toEqual(new GridPoint(5, 2));

      const doorShadow = session.puzzleManager.getDoor('door-5-shadow');
      const doorReal = session.puzzleManager.getDoor('door-5-real');
      expect(doorShadow?.isOpen).toBe(false);
      expect(doorReal?.isOpen).toBe(false);
    });

    it('blocks Shadow from entering Door 1 if Real has not activated Plate 1', () => {
      const session = LevelFactory.build(level5);

      // Input 'up': Real moves to (1,1) [Plate 1], Shadow to (5,1)
      // Input 'down': Real moves back to (1,2) [off Plate 1 -> Door 1 closes]
      session.turnEngine.handleInput('up');
      session.turnEngine.endAnimation();
      session.turnEngine.handleInput('down');
      session.turnEngine.endAnimation();

      const doorShadow = session.puzzleManager.getDoor('door-5-shadow');
      expect(doorShadow?.isOpen).toBe(false);

      // Now Shadow is at (5,2) or (5,1) -> from (5,1), 'right' tries to enter (4,1)
      // If Real is at (1,2) and inputs 'up' followed by 'left'...
      // Let's test direct attempt by Shadow to enter closed door-5-shadow at (4,1):
      // From (5,1), 'right' moves Shadow towards (4,1)
      const res = session.turnEngine.handleInput('right');
      session.turnEngine.endAnimation();

      // Shadow tried to enter (4,1) while door-5-shadow is closed
      expect(res?.shadowMoved).toBe(false);
      expect(session.shadow.position).not.toEqual(new GridPoint(4, 1));
    });

    it('demonstrates wall-anchored plate holding: Real holds Plate 1 while Shadow advances', () => {
      const session = LevelFactory.build(level5);

      // Step 1: 'up' -> Real moves to (1,1) onto Plate 1; Shadow to (5,1)
      session.turnEngine.handleInput('up');
      session.turnEngine.endAnimation();

      expect(session.player.position).toEqual(new GridPoint(1, 1));
      expect(session.shadow.position).toEqual(new GridPoint(5, 1));

      const doorShadow = session.puzzleManager.getDoor('door-5-shadow');
      const plateReal = session.puzzleManager.getPressurePlate('plate-5-real');
      expect(plateReal?.isPressed).toBe(true);
      expect(doorShadow?.isOpen).toBe(true);

      // Step 2: 'right' -> Real is blocked by wall at (2,1) and STAYS on Plate 1!
      // Shadow moves through open door-5-shadow to (4,1)
      const res2 = session.turnEngine.handleInput('right');
      session.turnEngine.endAnimation();

      expect(res2?.playerMoved).toBe(false); // Held by wall stop!
      expect(res2?.shadowMoved).toBe(true);
      expect(session.player.position).toEqual(new GridPoint(1, 1));
      expect(plateReal?.isPressed).toBe(true);
      expect(doorShadow?.isOpen).toBe(true);
      expect(session.shadow.position).toEqual(new GridPoint(4, 1));

      // Step 3: 'right' -> Real blocked again by (2,1), Shadow reaches Plate 2 at (3,1)
      const res3 = session.turnEngine.handleInput('right');
      session.turnEngine.endAnimation();

      expect(res3?.playerMoved).toBe(false);
      expect(res3?.shadowMoved).toBe(true);
      expect(session.player.position).toEqual(new GridPoint(1, 1));
      expect(session.shadow.position).toEqual(new GridPoint(3, 1));

      const plateShadow = session.puzzleManager.getPressurePlate('plate-5-shadow');
      const doorReal = session.puzzleManager.getDoor('door-5-real');
      expect(plateShadow?.isPressed).toBe(true);
      expect(doorReal?.isOpen).toBe(true);
    });

    it('demonstrates role reversal: Shadow holds Plate 2 against wall stops while Real crosses', () => {
      const session = LevelFactory.build(level5);

      // Reach state where Shadow is on Plate 2 (3,1) and Real is on Plate 1 (1,1)
      session.turnEngine.handleInput('up');
      session.turnEngine.endAnimation();
      session.turnEngine.handleInput('right');
      session.turnEngine.endAnimation();
      session.turnEngine.handleInput('right');
      session.turnEngine.endAnimation();

      const doorReal = session.puzzleManager.getDoor('door-5-real');
      const plateShadow = session.puzzleManager.getPressurePlate('plate-5-shadow');
      expect(plateShadow?.isPressed).toBe(true);
      expect(doorReal?.isOpen).toBe(true);

      // Step 4: 'down' -> Real steps off Plate 1 to (1,2).
      // Shadow tries to move down to (3,2) [wall stop], so Shadow remains on Plate 2!
      const res4 = session.turnEngine.handleInput('down');
      session.turnEngine.endAnimation();

      expect(res4?.playerMoved).toBe(true);
      expect(res4?.shadowMoved).toBe(false); // Held by wall at (3,2)!
      expect(session.player.position).toEqual(new GridPoint(1, 2));
      expect(session.shadow.position).toEqual(new GridPoint(3, 1));
      expect(plateShadow?.isPressed).toBe(true); // Plate 2 remains held!
      expect(doorReal?.isOpen).toBe(true); // Door 2 remains open!

      // Step 5: 'right' -> Real moves to (2,2). Shadow tries to move left to (2,1) [wall stop]!
      const res5 = session.turnEngine.handleInput('right');
      session.turnEngine.endAnimation();
      expect(res5?.shadowMoved).toBe(false);
      expect(session.player.position).toEqual(new GridPoint(2, 2));
      expect(session.shadow.position).toEqual(new GridPoint(3, 1));
      expect(doorReal?.isOpen).toBe(true);

      // Step 6: 'right' -> Real moves through open Door 2 to (3,2)!
      const res6 = session.turnEngine.handleInput('right');
      session.turnEngine.endAnimation();
      expect(res6?.playerMoved).toBe(true);
      expect(res6?.shadowMoved).toBe(false);
      expect(session.player.position).toEqual(new GridPoint(3, 2));

      // Step 7: 'right' -> Real advances past Door 2 to (4,2)!
      const res7 = session.turnEngine.handleInput('right');
      session.turnEngine.endAnimation();
      expect(res7?.playerMoved).toBe(true);
      expect(session.player.position).toEqual(new GridPoint(4, 2));
      expect(session.shadow.position).toEqual(new GridPoint(3, 1));
    });

    it('completes the level via the intended 12-step trace', () => {
      const replay = LevelValidator.replaySolution(level5, level5.solutionTrace);
      expect(replay.success).toBe(true);
      expect(replay.completed).toBe(true);
      expect(replay.died).toBe(false);
      expect(level5.solutionTrace).toHaveLength(12);
    });

    it('is solved by BFS solver and verifies replay', () => {
      const solverResult = LevelSolver.solve(level5);
      expect(solverResult.solutionFound).toBe(true);
      expect(solverResult.replayVerified).toBe(true);
      expect(solverResult.searchLimitReached).toBe(false);
      expect(solverResult.exploredStateCount).toBeLessThan(500);

      // Verify the exact 10-step sequence found by BFS
      const bfsSequence = [
        'up',
        'right',
        'down',
        'right',
        'right',
        'up',
        'right',
        'right',
        'down',
        'down',
      ];
      expect(solverResult.solutionSequence).toEqual(bfsSequence);

      // Replay the BFS solution step-by-step through the authoritative engine
      const session = LevelFactory.build(level5);
      for (const dir of bfsSequence) {
        const res = session.turnEngine.handleInput(dir as MoveDirection);
        expect(res).not.toBeNull();
        expect(res?.hazardTriggered).toBe(false);
        session.turnEngine.endAnimation();
      }

      expect(session.turnEngine.state).toBe('COMPLETED');
      expect(session.player.isAtExit()).toBe(true);
      expect(session.shadow.isAtExit()).toBe(true);
      expect(session.player.position).toEqual(new GridPoint(5, 2));
      expect(session.shadow.position).toEqual(new GridPoint(1, 2));

      // Replay via LevelValidator
      const replay = LevelValidator.replaySolution(level5, solverResult.solutionSequence);
      expect(replay.success).toBe(true);
      expect(replay.completed).toBe(true);
      expect(replay.died).toBe(false);
    });

    it('restores all entities correctly upon level reset', () => {
      const session = LevelFactory.build(level5);

      // Make several moves
      session.turnEngine.handleInput('up');
      session.turnEngine.endAnimation();
      session.turnEngine.handleInput('right');
      session.turnEngine.endAnimation();

      // Reset
      session.turnEngine.restartLevel();

      expect(session.player.position).toEqual(new GridPoint(1, 2));
      expect(session.shadow.position).toEqual(new GridPoint(5, 2));
      expect(session.turnEngine.state).toBe('PLAYING');

      const doorShadow = session.puzzleManager.getDoor('door-5-shadow');
      const doorReal = session.puzzleManager.getDoor('door-5-real');
      expect(doorShadow?.isOpen).toBe(false);
      expect(doorReal?.isOpen).toBe(false);
    });
  });
});
