import { describe, it, expect } from 'vitest';
import { ALL_LEVELS } from '../../src/levels/levelsData';
import { LevelSolver } from '../../src/solver/LevelSolver';
import { LevelValidator } from '../../src/solver/LevelValidator';
import { LevelFactory } from '../../src/levels/LevelFactory';

export const LEVEL_17_DEF = ALL_LEVELS[16];

describe('Phase 8 — Level 17: Two Become One', () => {
  it('validates schema', () => {
    const val = LevelValidator.validateSchema(LEVEL_17_DEF);
    expect(val.errors).toEqual([]);
    expect(val.valid).toBe(true);
  });

  it('is solved by BFS solver and validates replay trace', () => {
    const res = LevelSolver.solve(LEVEL_17_DEF);
    console.log('BFS RESULT FOR LEVEL 17:', {
      found: res.solutionFound,
      explored: res.exploredStateCount,
      limit: res.searchLimitReached,
      seq: res.solutionSequence,
      err: res.errorDetails,
    });
    expect(res.solutionFound).toBe(true);
    expect(res.solutionSequence.length).toBeGreaterThan(0);

    const session = LevelFactory.build(LEVEL_17_DEF);
    for (let i = 0; i < LEVEL_17_DEF.solutionTrace.length; i++) {
      const dir = LEVEL_17_DEF.solutionTrace[i];
      const stepRes = session.turnEngine.handleInput(dir);
      expect(stepRes).not.toBeNull();
      session.turnEngine.endAnimation();
    }
    expect(session.turnEngine.state).toBe('COMPLETED');
  });
});
