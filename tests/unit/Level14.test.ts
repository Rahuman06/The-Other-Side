import { describe, it, expect } from 'vitest';
import { ALL_LEVELS } from '../../src/levels/levelsData';
import { LevelSolver } from '../../src/solver/LevelSolver';
import { LevelValidator } from '../../src/solver/LevelValidator';
import { LevelFactory } from '../../src/levels/LevelFactory';

export const LEVEL_14_DEF = ALL_LEVELS[13];

describe('Phase 7 — Level 14: The Frozen Moment', () => {
  it('validates schema', () => {
    const val = LevelValidator.validateSchema(LEVEL_14_DEF);
    expect(val.errors).toEqual([]);
    expect(val.valid).toBe(true);
  });

  it('is solved by BFS solver and validates replay trace', () => {
    const res = LevelSolver.solve(LEVEL_14_DEF);
    console.log('BFS RESULT FOR LEVEL 14:', {
      found: res.solutionFound,
      explored: res.exploredStateCount,
      limit: res.searchLimitReached,
      seq: res.solutionSequence,
      err: res.errorDetails,
    });
    expect(res.solutionFound).toBe(true);
    expect(res.solutionSequence.length).toBeGreaterThan(0);

    const session = LevelFactory.build(LEVEL_14_DEF);
    for (let i = 0; i < LEVEL_14_DEF.solutionTrace.length; i++) {
      const dir = LEVEL_14_DEF.solutionTrace[i];
      const stepRes = session.turnEngine.handleInput(dir);
      expect(stepRes).not.toBeNull();
      session.turnEngine.endAnimation();
    }
    expect(session.turnEngine.state).toBe('COMPLETED');
  });
});
