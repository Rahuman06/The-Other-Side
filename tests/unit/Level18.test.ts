import { describe, it, expect } from 'vitest';
import { ALL_LEVELS } from '../../src/levels/levelsData';
import { LevelSolver } from '../../src/solver/LevelSolver';
import { LevelValidator } from '../../src/solver/LevelValidator';
import { LevelFactory } from '../../src/levels/LevelFactory';

export const LEVEL_18_DEF = ALL_LEVELS[17];

describe('Phase 8 — Level 18: The Paradox (Master Campaign)', () => {
  it('validates schema', () => {
    const val = LevelValidator.validateSchema(LEVEL_18_DEF);
    expect(val.errors).toEqual([]);
    expect(val.valid).toBe(true);
  });

  it('proves cross-world bomb activation, time lock vault, and portal shift surprise', () => {
    const session = LevelFactory.build(LEVEL_18_DEF);
    const pm = session.puzzleManager;
    const portalReal = pm.getPortal('p-18-real')!;
    const portalShadow = pm.getPortal('p-18-shadow')!;
    const timeLockReal = pm.getTimeLock('tl-18-real')!;
    const doorShadowVault = pm.getDoor('door-18-shadow-vault')!;
    const doorRealPortal = pm.getDoor('door-18-real-portal')!;

    // Initial state: p-18-real targets start loop (1, 1), doors locked
    expect(portalReal.targetPosition.x).toBe(1);
    expect(portalReal.targetPosition.y).toBe(1);
    expect(portalShadow.targetPosition.x).toBe(3);
    expect(portalShadow.targetPosition.y).toBe(4);
    expect(timeLockReal.isActive).toBe(false);
    expect(doorShadowVault.isOpen).toBe(false);
    expect(doorRealPortal.isOpen).toBe(false);

    // Step 1: 'right' -> Real activates tl-18-real (2, 1) [opens vault door (6, 2)]
    session.turnEngine.handleInput('right');
    session.turnEngine.endAnimation();
    expect(timeLockReal.isActive).toBe(true);
    expect(doorShadowVault.isOpen).toBe(true);

    // Step 2: 'left' -> Real returns to (1, 1)
    session.turnEngine.handleInput('left');
    session.turnEngine.endAnimation();

    // Step 3: 'down' -> Shadow enters open door-18-shadow-vault at (6, 2)
    session.turnEngine.handleInput('down');
    session.turnEngine.endAnimation();
    expect(session.shadow.position.x).toBe(6);
    expect(session.shadow.position.y).toBe(2);

    // Step 4: 'down' -> Shadow hits sw-18-shadow at (6, 3) [unlocks door-18-real-portal at (1, 2)]
    session.turnEngine.handleInput('down');
    session.turnEngine.endAnimation();
    expect(doorRealPortal.isOpen).toBe(true);

    // Step 5: 'down' -> Shadow enters portal p-18-shadow (6, 4) -> teleports to (3, 4)
    session.turnEngine.handleInput('down');
    session.turnEngine.endAnimation();
    expect(session.shadow.position.x).toBe(3);
    expect(session.shadow.position.y).toBe(4);

    // Replay remaining steps through explosion and simultaneous exit arrival
    for (let i = 5; i < LEVEL_18_DEF.solutionTrace.length; i++) {
      const dir = LEVEL_18_DEF.solutionTrace[i];
      session.turnEngine.handleInput(dir);
      session.turnEngine.endAnimation();
    }

    // Portal shift verified: p-18-real shifted destination to (4, 4)
    expect(portalReal.targetPosition.x).toBe(4);
    expect(portalReal.targetPosition.y).toBe(4);

    // Turn 14 completion
    expect(session.turnEngine.state).toBe('COMPLETED');
    expect(session.player.isAtExit()).toBe(true);
    expect(session.shadow.isAtExit()).toBe(true);
    expect(session.player.position.x).toBe(6);
    expect(session.player.position.y).toBe(4);
    expect(session.shadow.position.x).toBe(1);
    expect(session.shadow.position.y).toBe(4);
  });

  it('is solved by BFS solver and validates replay trace with simultaneous dual exit arrival', () => {
    const res = LevelSolver.solve(LEVEL_18_DEF);
    console.log('BFS RESULT FOR LEVEL 18:', {
      found: res.solutionFound,
      explored: res.exploredStateCount,
      limit: res.searchLimitReached,
      seq: res.solutionSequence,
      err: res.errorDetails,
    });
    expect(res.solutionFound).toBe(true);
    expect(res.solutionSequence.length).toBe(14);

    const session = LevelFactory.build(LEVEL_18_DEF);
    for (let i = 0; i < LEVEL_18_DEF.solutionTrace.length; i++) {
      const dir = LEVEL_18_DEF.solutionTrace[i];
      const stepRes = session.turnEngine.handleInput(dir);
      expect(stepRes).not.toBeNull();
      session.turnEngine.endAnimation();
    }
    expect(session.turnEngine.state).toBe('COMPLETED');
    expect(session.player.isAtExit()).toBe(true);
    expect(session.shadow.isAtExit()).toBe(true);
  });
});
