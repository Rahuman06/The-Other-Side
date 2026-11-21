import { describe, it, expect } from 'vitest';
import { ALL_LEVELS } from '../../src/levels/levelsData';
import { LevelSolver } from '../../src/solver/LevelSolver';
import { LevelValidator } from '../../src/solver/LevelValidator';
import { LevelFactory } from '../../src/levels/LevelFactory';

export const LEVEL_16_DEF = ALL_LEVELS[15];

describe('Phase 8 — Level 16: The Wrong Reflection (Master Entry)', () => {
  it('validates schema', () => {
    const val = LevelValidator.validateSchema(LEVEL_16_DEF);
    expect(val.errors).toEqual([]);
    expect(val.valid).toBe(true);
  });

  it('proves optical deception: laser receiver activates magnetic field in opposite world rather than nearby door', () => {
    const session = LevelFactory.build(LEVEL_16_DEF);
    const pm = session.puzzleManager;
    const doorReal = pm.getDoor('door-16-real')!;
    const doorShadow = pm.getDoor('door-16-shadow')!;
    const magnetShadow = pm.getMagneticField('magnet-16-shadow')!;
    const blockShadow = pm.getMovableBlock('block-16-shadow')!;
    const plateShadow = pm.getPressurePlate('plate-16-shadow')!;
    const rxReal = pm.getLaserReceiver('rx-16-real')!;
    const timeLockReal = pm.getTimeLock('tl-16-real')!;

    // Initial state checks
    expect(doorReal.isOpen).toBe(false);
    expect(doorShadow.isOpen).toBe(false);
    expect(magnetShadow.isActive).toBe(false);
    expect(blockShadow.position.x).toBe(5);
    expect(blockShadow.position.y).toBe(1);
    expect(plateShadow.isPressed).toBe(false);
    expect(rxReal.isPowered).toBe(false);
    expect(timeLockReal.isActive).toBe(false);

    // Step 1: 'down' -> Real steps on tl-16-real (1,3), freezing saw-16-shadow
    session.turnEngine.handleInput('down');
    session.turnEngine.endAnimation();
    expect(session.player.position.x).toBe(1);
    expect(session.player.position.y).toBe(3);
    expect(timeLockReal.isActive).toBe(true);

    // Step 2: 'right' -> Real steps on sw-16-real (2,3), unlocking door-16-shadow
    session.turnEngine.handleInput('right');
    session.turnEngine.endAnimation();
    expect(session.player.position.x).toBe(2);
    expect(session.player.position.y).toBe(3);
    expect(doorShadow.isOpen).toBe(true);
    // doorReal is still locked! Nearby receiver has not fired
    expect(doorReal.isOpen).toBe(false);

    // Step 3: 'down' -> Shadow steps on sw-16-shadow (5,3), rotating mirror to redirect laser into rx-16-real
    session.turnEngine.handleInput('down');
    session.turnEngine.endAnimation();
    expect(session.shadow.position.x).toBe(5);
    expect(session.shadow.position.y).toBe(3);

    // The Master Surprise: receiver powers magnet in shadow world, which pulls block onto plate, opening door-16-real!
    expect(rxReal.isPowered).toBe(true);
    expect(magnetShadow.isActive).toBe(true);
    expect(blockShadow.position.x).toBe(6);
    expect(blockShadow.position.y).toBe(1);
    expect(plateShadow.isPressed).toBe(true);
    expect(doorReal.isOpen).toBe(true);
  });

  it('is solved by BFS solver and validates replay trace with simultaneous dual exit arrival', () => {
    const res = LevelSolver.solve(LEVEL_16_DEF);
    console.log('BFS RESULT FOR LEVEL 16:', {
      found: res.solutionFound,
      explored: res.exploredStateCount,
      limit: res.searchLimitReached,
      seq: res.solutionSequence,
      err: res.errorDetails,
    });
    expect(res.solutionFound).toBe(true);
    expect(res.solutionSequence.length).toBe(10);

    const session = LevelFactory.build(LEVEL_16_DEF);
    for (let i = 0; i < LEVEL_16_DEF.solutionTrace.length; i++) {
      const dir = LEVEL_16_DEF.solutionTrace[i];
      const stepRes = session.turnEngine.handleInput(dir);
      expect(stepRes).not.toBeNull();
      session.turnEngine.endAnimation();
    }

    // Turn 10 completion
    expect(session.turnEngine.state).toBe('COMPLETED');
    expect(session.player.isAtExit()).toBe(true);
    expect(session.shadow.isAtExit()).toBe(true);
    expect(session.player.position.x).toBe(6);
    expect(session.player.position.y).toBe(2);
    expect(session.shadow.position.x).toBe(1);
    expect(session.shadow.position.y).toBe(2);
  }, 45000);
});

