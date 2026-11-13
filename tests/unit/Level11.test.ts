import { describe, it, expect } from 'vitest';
import { LevelDefinition } from '@/types/level';
import { LevelFactory } from '@/levels/LevelFactory';
import { LevelValidator } from '@/solver/LevelValidator';
import { LevelSolver } from '@/solver/LevelSolver';
import { GridPoint } from '@/grid/GridPosition';
import { ALL_LEVELS } from '@/levels/levelsData';

describe('Phase 7 — Level 11: No Way Back', () => {
  const level11Config: LevelDefinition = ALL_LEVELS.find((l) => l.id === 11)!;

  it('validates schema of Level 11', () => {
    const res = LevelValidator.validateSchema(level11Config);
    expect(res.valid).toBe(true);
    expect(res.errors).toHaveLength(0);
  });

  it('collapses entry floor permanently when character steps off', () => {
    const session = LevelFactory.build(level11Config);
    const cf = session.puzzleManager.getCollapsingFloor('cf-11-real-entry');

    expect(cf?.floorState).toBe('INTACT');

    // Move right onto (2, 2)
    session.turnEngine.handleInput('right');
    session.turnEngine.endAnimation();

    expect(session.player.position).toEqual(new GridPoint(2, 2));
    expect(cf?.floorState).toBe('CRACKED');

    // Move right onto checkpoint at (3, 2) - entry floor (2,2) permanently collapses
    session.turnEngine.handleInput('right');
    session.turnEngine.endAnimation();

    expect(session.player.position).toEqual(new GridPoint(3, 2));
    expect(cf?.floorState).toBe('COLLAPSED');
    expect(cf?.isCollapsed).toBe(true);

    // Try moving left back onto (2, 2) - should be blocked by collapsed void!
    session.turnEngine.handleInput('left');
    session.turnEngine.endAnimation();
    expect(session.player.position).toEqual(new GridPoint(3, 2)); // Blocked!
  });

  it('triggers cross-world delayed collapse when Real steps onto checkpoint', () => {
    const session = LevelFactory.build(level11Config);
    expect(session.surpriseManager).toBeDefined();

    // 1. right -> (2,2)
    session.turnEngine.handleInput('right');
    session.turnEngine.endAnimation();

    // 2. right -> Real enters (3,2) [checkpoint], Shadow enters (4,2) [checkpoint]
    session.turnEngine.handleInput('right');
    session.turnEngine.endAnimation();

    // Cross-collapse event armed with delay 1
    expect(session.surpriseManager.getEventState('se-11-cross-collapse')).toBe('ARMED');
    expect(session.shadowGrid.isWalkable({ x: 4, y: 3 })).toBe(true);

    // 3. up -> Real enters (3,1), Shadow enters (4,1)
    session.turnEngine.handleInput('up');
    session.turnEngine.endAnimation();

    // Delayed cross-world collapse triggered! Shadow's lower corridor (4,3) is now an impassable abyss
    expect(session.surpriseManager.getEventState('se-11-cross-collapse')).toBe('COMPLETED');
    expect(session.shadowGrid.isWalkable({ x: 4, y: 3 })).toBe(false);
  });

  it('is solved by BFS solver and validates replay trace', () => {
    const result = LevelSolver.solve(level11Config);
    console.log('BFS RESULT FOR LEVEL 11:', {
      found: result.solutionFound,
      explored: result.exploredStateCount,
      limit: result.searchLimitReached,
      seq: result.solutionSequence,
    });
    expect(result.solutionFound).toBe(true);
    expect(result.replayVerified).toBe(true);
    expect(result.solutionSequence).toEqual([
      'right',
      'right',
      'up',
      'right',
      'down',
      'down',
      'left',
      'right',
      'right',
      'right',
      'up',
    ]);
  });
});
