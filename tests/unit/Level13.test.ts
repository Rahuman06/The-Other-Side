import { describe, it, expect } from 'vitest';
import { ALL_LEVELS } from '../../src/levels/levelsData';
import { LevelSolver } from '../../src/solver/LevelSolver';
import { LevelValidator } from '../../src/solver/LevelValidator';
import { LevelFactory } from '../../src/levels/LevelFactory';

export const LEVEL_13_DEF = ALL_LEVELS[12];

describe('Phase 7 — Level 13: Refraction', () => {
  it('validates schema', () => {
    const val = LevelValidator.validateSchema(LEVEL_13_DEF);
    expect(val.errors).toEqual([]);
    expect(val.valid).toBe(true);
  });

  it('is solved by BFS solver and validates replay trace', () => {
    const res = LevelSolver.solve(LEVEL_13_DEF);
    console.log('BFS RESULT FOR LEVEL 13:', {
      found: res.solutionFound,
      explored: res.exploredStateCount,
      limit: res.searchLimitReached,
      seq: res.solutionSequence,
      err: res.errorDetails,
    });
    expect(res.solutionFound).toBe(true);
    expect(res.solutionSequence.length).toBeGreaterThan(0);

    // Verify replay trace step-by-step
    const session = LevelFactory.build(LEVEL_13_DEF);
    for (let i = 0; i < LEVEL_13_DEF.solutionTrace.length; i++) {
      const dir = LEVEL_13_DEF.solutionTrace[i];
      const stepRes = session.turnEngine.handleInput(dir);
      expect(stepRes).not.toBeNull();
      session.turnEngine.endAnimation();
    }
    expect(session.turnEngine.state).toBe('COMPLETED');
  });
});
