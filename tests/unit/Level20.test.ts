import { describe, it, expect } from 'vitest';
import { ALL_LEVELS } from '../../src/levels/levelsData';
import { LevelSolver } from '../../src/solver/LevelSolver';
import { LevelValidator } from '../../src/solver/LevelValidator';
import { LevelFactory } from '../../src/levels/LevelFactory';

export const LEVEL_20_DEF = ALL_LEVELS[19];

describe('Phase 8 — Level 20: The Other Side', () => {
  it('validates schema', () => {
    const val = LevelValidator.validateSchema(LEVEL_20_DEF);
    expect(val.errors).toEqual([]);
    expect(val.valid).toBe(true);
  });

  it('is solved by BFS solver and validates replay trace', () => {
    const res = LevelSolver.solve(LEVEL_20_DEF);
    console.log('BFS RESULT FOR LEVEL 20:', {
      found: res.solutionFound,
      explored: res.exploredStateCount,
      limit: res.searchLimitReached,
      seq: res.solutionSequence,
      err: res.errorDetails,
    });
    expect(res.solutionFound).toBe(true);
    expect(res.solutionSequence.length).toBeGreaterThan(0);

    const session = LevelFactory.build(LEVEL_20_DEF);
    for (let i = 0; i < LEVEL_20_DEF.solutionTrace.length; i++) {
      const dir = LEVEL_20_DEF.solutionTrace[i];
      const stepRes = session.turnEngine.handleInput(dir);
      expect(stepRes).not.toBeNull();
      session.turnEngine.endAnimation();
    }
    expect(session.turnEngine.state).toBe('COMPLETED');
  });
});
