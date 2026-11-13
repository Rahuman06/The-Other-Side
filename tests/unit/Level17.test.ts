import { describe, it, expect } from 'vitest';
import { ALL_LEVELS } from '../../src/levels/levelsData';
import { LevelSolver } from '../../src/solver/LevelSolver';
import { LevelValidator } from '../../src/solver/LevelValidator';
import { LevelFactory } from '../../src/levels/LevelFactory';

export const LEVEL_17_DEF = ALL_LEVELS[16];

describe('Phase 8 — Level 17: Two Become One (Master Campaign)', () => {
  it('validates schema', () => {
    const val = LevelValidator.validateSchema(LEVEL_17_DEF);
    expect(val.errors).toEqual([]);
    expect(val.valid).toBe(true);
  });

  it('proves cross-world plate dependency and portal realignment surprise', () => {
    const session = LevelFactory.build(LEVEL_17_DEF);
    const pm = session.puzzleManager;
    const plateReal = pm.getPressurePlate('pp-17-real')!;
    const plateShadow = pm.getPressurePlate('pp-17-shadow')!;
    const portalShadow = pm.getPortal('p-17-shadow')!;
    const portalReal = pm.getPortal('p-17-real')!;
    const doorRealExit = pm.getDoor('door-17-real-exit')!;
    const doorShadowAccess = pm.getDoor('door-17-shadow-access')!;

    // Initial state: Portal destination points to origin loop (6, 1)
    expect(plateReal.isPressed).toBe(false);
    expect(plateShadow.isPressed).toBe(false);
    expect(portalReal.targetPosition.x).toBe(4);
    expect(portalReal.targetPosition.y).toBe(4);
    expect(portalShadow.targetPosition.x).toBe(6);
    expect(portalShadow.targetPosition.y).toBe(1);
    expect(doorRealExit.isOpen).toBe(false);
    expect(doorShadowAccess.isOpen).toBe(false);

    // Step 1: 'right' -> Real to (2, 1), Shadow to (5, 1)
    session.turnEngine.handleInput('right');
    session.turnEngine.endAnimation();

    // Step 2: 'down' -> Real steps on pp-17-real (2, 2); Shadow steps on pp-17-shadow (5, 2)
    session.turnEngine.handleInput('down');
    session.turnEngine.endAnimation();

    // Verify plate effects:
    // 1. pp-17-real pressed, door-17-shadow-access unlocked
    expect(plateReal.isPressed).toBe(true);
    expect(doorShadowAccess.isOpen).toBe(true);

    // 2. Surprise event: pp-17-real realigns portal p-17-shadow destination to (3, 4)!
    expect(portalShadow.targetPosition.x).toBe(3);
    expect(portalShadow.targetPosition.y).toBe(4);

    // 3. pp-17-shadow pressed, door-17-real-exit unlocked
    expect(plateShadow.isPressed).toBe(true);
    expect(doorRealExit.isOpen).toBe(true);

    // Continue moves to portal entry (Steps 3-7)
    session.turnEngine.handleInput('left');
    session.turnEngine.endAnimation();
    session.turnEngine.handleInput('down');
    session.turnEngine.endAnimation();
    session.turnEngine.handleInput('right');
    session.turnEngine.endAnimation();
    session.turnEngine.handleInput('left');
    session.turnEngine.endAnimation();

    // Step 7: 'down' -> Both characters enter their portals simultaneously
    session.turnEngine.handleInput('down');
    session.turnEngine.endAnimation();

    // Real teleported from (1,4) to (4,4)
    expect(session.player.position.x).toBe(4);
    expect(session.player.position.y).toBe(4);

    // Shadow teleported from (6,4) to shifted destination (3,4)!
    expect(session.shadow.position.x).toBe(3);
    expect(session.shadow.position.y).toBe(4);
  });

  it('is solved by BFS solver and validates replay trace with simultaneous dual exit arrival', () => {
    const res = LevelSolver.solve(LEVEL_17_DEF);
    console.log('BFS RESULT FOR LEVEL 17:', {
      found: res.solutionFound,
      explored: res.exploredStateCount,
      limit: res.searchLimitReached,
      seq: res.solutionSequence,
      err: res.errorDetails,
    });
    expect(res.solutionFound).toBe(true);
    expect(res.solutionSequence.length).toBe(11);

    const session = LevelFactory.build(LEVEL_17_DEF);
    for (let i = 0; i < LEVEL_17_DEF.solutionTrace.length; i++) {
      const dir = LEVEL_17_DEF.solutionTrace[i];
      const stepRes = session.turnEngine.handleInput(dir);
      expect(stepRes).not.toBeNull();
      session.turnEngine.endAnimation();
    }

    // Step 11 completion check
    expect(session.turnEngine.state).toBe('COMPLETED');
    expect(session.player.isAtExit()).toBe(true);
    expect(session.shadow.isAtExit()).toBe(true);
    expect(session.player.position.x).toBe(6);
    expect(session.player.position.y).toBe(4);
    expect(session.shadow.position.x).toBe(1);
    expect(session.shadow.position.y).toBe(4);
  });
});
