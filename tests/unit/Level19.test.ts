import { describe, it, expect } from 'vitest';
import { ALL_LEVELS } from '../../src/levels/levelsData';
import { LevelSolver } from '../../src/solver/LevelSolver';
import { LevelValidator } from '../../src/solver/LevelValidator';
import { LevelFactory } from '../../src/levels/LevelFactory';

export const LEVEL_19_DEF = ALL_LEVELS[18];

describe('Phase 8 — Level 19: The Last Connection (Master Challenge)', () => {
  it('validates schema', () => {
    const val = LevelValidator.validateSchema(LEVEL_19_DEF);
    expect(val.errors).toEqual([]);
    expect(val.valid).toBe(true);
  });

  it('proves 5-zone progression: optical laser receiver, time lock vault, chain reaction surprise, and simultaneous exit', () => {
    const session = LevelFactory.build(LEVEL_19_DEF);
    const pm = session.puzzleManager;

    const portalReal = pm.getPortal('p-19-real')!;
    const portalShadow = pm.getPortal('p-19-shadow')!;
    const timeLockReal = pm.getTimeLock('tl-19-real')!;
    const doorShadowVault = pm.getDoor('door-19-shadow-vault')!;
    const doorRealMid = pm.getDoor('door-19-real-mid')!;
    const doorRealExit = pm.getDoor('door-19-real-exit')!;
    const doorShadowExit = pm.getDoor('door-19-shadow-exit')!;

    expect(portalReal.targetPosition.x).toBe(4);
    expect(portalReal.targetPosition.y).toBe(4);
    expect(portalShadow.targetPosition.x).toBe(3);
    expect(portalShadow.targetPosition.y).toBe(4);
    expect(doorRealExit.world).toBe('real');
    expect(doorShadowVault.isOpen).toBe(false);
    expect(doorRealMid.isOpen).toBe(false);
    expect(doorShadowExit.isOpen).toBe(false);
    expect(timeLockReal.isActive).toBe(false);

    // Step 1: 'up' -> Real to (1, 0), Shadow to (6, 0)
    session.turnEngine.handleInput('up');
    session.turnEngine.endAnimation();

    // Step 2: 'left' -> Real to (0, 0), Shadow to (6, 0)
    session.turnEngine.handleInput('left');
    session.turnEngine.endAnimation();

    // Step 3: 'down' -> Real steps on tl-19-real (0, 1) [locks open door-19-shadow-vault (6, 2)]
    session.turnEngine.handleInput('down');
    session.turnEngine.endAnimation();
    expect(timeLockReal.isActive).toBe(true);
    expect(doorShadowVault.isOpen).toBe(true);

    // Step 4: 'down' -> Real to (0, 2); Shadow enters vault door (6, 2)
    session.turnEngine.handleInput('down');
    session.turnEngine.endAnimation();
    expect(session.shadow.position.x).toBe(6);
    expect(session.shadow.position.y).toBe(2);

    // Step 5: 'down' -> Real to (0, 3); Shadow hits sw-19-shadow-1 (6, 3) [unseals door-19-real-mid (1, 2)]
    session.turnEngine.handleInput('down');
    session.turnEngine.endAnimation();
    expect(doorRealMid.isOpen).toBe(true);

    // Step 6: 'right' -> Real to (1, 3); Shadow to (5, 3)
    session.turnEngine.handleInput('right');
    session.turnEngine.endAnimation();

    // Step 7: 'down' -> Real enters portal p-19-real (1, 4) -> teleports to (4, 4), TRIGGERING MULTI-EVENT CHAIN REACTION!
    session.turnEngine.handleInput('down');
    session.turnEngine.endAnimation();
    expect(session.player.position.x).toBe(4);
    expect(session.player.position.y).toBe(4);

    // Step 8: 'left' -> Shadow enters portal p-19-shadow (6, 4) -> teleports to (3, 4) onto pp-19-shadow!
    session.turnEngine.handleInput('left');
    session.turnEngine.endAnimation();
    expect(session.shadow.position.x).toBe(3);
    expect(session.shadow.position.y).toBe(4);

    // Replay remaining steps to completion
    for (let i = 8; i < LEVEL_19_DEF.solutionTrace.length; i++) {
      const dir = LEVEL_19_DEF.solutionTrace[i];
      session.turnEngine.handleInput(dir);
      session.turnEngine.endAnimation();
    }

    // Step 16 completion
    expect(session.turnEngine.state).toBe('COMPLETED');
    expect(session.player.isAtExit()).toBe(true);
    expect(session.shadow.isAtExit()).toBe(true);
    expect(session.player.position.x).toBe(6);
    expect(session.player.position.y).toBe(4);
    expect(session.shadow.position.x).toBe(1);
    expect(session.shadow.position.y).toBe(4);
  });

  it('is solved by BFS solver and validates replay trace with simultaneous dual exit arrival', () => {
    const res = LevelSolver.solve(LEVEL_19_DEF);
    console.log('BFS RESULT FOR LEVEL 19:', {
      found: res.solutionFound,
      explored: res.exploredStateCount,
      limit: res.searchLimitReached,
      seq: res.solutionSequence,
      err: res.errorDetails,
    });
    expect(res.solutionFound).toBe(true);
    expect(res.solutionSequence.length).toBe(16);

    const session = LevelFactory.build(LEVEL_19_DEF);
    for (let i = 0; i < LEVEL_19_DEF.solutionTrace.length; i++) {
      const dir = LEVEL_19_DEF.solutionTrace[i];
      const stepRes = session.turnEngine.handleInput(dir);
      expect(stepRes).not.toBeNull();
      session.turnEngine.endAnimation();
    }
    expect(session.turnEngine.state).toBe('COMPLETED');
  });
});
