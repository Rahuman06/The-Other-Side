import { describe, it, expect } from 'vitest';
import { LevelDefinition } from '@/types/level';
import { LevelFactory } from '@/levels/LevelFactory';
import { LevelValidator } from '@/solver/LevelValidator';
import { LevelSolver } from '@/solver/LevelSolver';
import { GridPoint } from '@/grid/GridPosition';

describe('Phase 6 — Level 11: No Way Back', () => {
  const level11Config: LevelDefinition = {
    id: 11,
    chapter: 'THE SEPARATION',
    name: 'No Way Back',
    width: 8,
    height: 5,
    difficulty: 'EXPERT',
    hint: 'Collapsing tiles crumble into impassable voids once stepped off. Anchor at the checkpoint before crossing the saw corridor.',
    realStart: { x: 1, y: 2 },
    shadowStart: { x: 6, y: 2 },
    realExit: { x: 6, y: 2 },
    shadowExit: { x: 1, y: 2 },
    realWalls: [
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: 2 },
      { x: 0, y: 3 },
      { x: 0, y: 4 },
      { x: 7, y: 0 },
      { x: 7, y: 1 },
      { x: 7, y: 2 },
      { x: 7, y: 3 },
      { x: 7, y: 4 },
      { x: 2, y: 1 },
      { x: 2, y: 3 },
      { x: 5, y: 0 },
      { x: 5, y: 4 },
    ],
    shadowWalls: [
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: 2 },
      { x: 0, y: 3 },
      { x: 0, y: 4 },
      { x: 7, y: 0 },
      { x: 7, y: 1 },
      { x: 7, y: 2 },
      { x: 7, y: 3 },
      { x: 7, y: 4 },
      { x: 5, y: 1 },
      { x: 5, y: 3 },
      { x: 2, y: 0 },
      { x: 2, y: 4 },
    ],
    collapsingFloors: [
      { id: 'cf-11-real-1', world: 'real', position: { x: 2, y: 2 } },
      { id: 'cf-11-real-2', world: 'real', position: { x: 4, y: 2 } },
      { id: 'cf-11-shadow-1', world: 'shadow', position: { x: 5, y: 2 } },
      { id: 'cf-11-shadow-2', world: 'shadow', position: { x: 3, y: 2 } },
    ],
    checkpoints: [
      { id: 'cp-11', realPosition: { x: 3, y: 2 }, shadowPosition: { x: 4, y: 2 } },
    ],
    movingHazards: [
      {
        id: 'saw-11-real',
        world: 'real',
        path: [
          { x: 5, y: 0 },
          { x: 5, y: 1 },
          { x: 5, y: 2 },
          { x: 5, y: 3 },
          { x: 5, y: 4 },
          { x: 5, y: 3 },
          { x: 5, y: 2 },
          { x: 5, y: 1 },
        ],
        initialIndex: 0,
      },
      {
        id: 'saw-11-shadow',
        world: 'shadow',
        path: [
          { x: 2, y: 4 },
          { x: 2, y: 3 },
          { x: 2, y: 2 },
          { x: 2, y: 1 },
          { x: 2, y: 0 },
          { x: 2, y: 1 },
          { x: 2, y: 2 },
          { x: 2, y: 3 },
        ],
        initialIndex: 0,
      },
    ],
    solutionTrace: [
      'right', // 1. Real onto cf-11-real-1 at (2,2), Shadow onto cf-11-shadow-1 at (5,2)
      'right', // 2. Real to (3,2) [cp-11 activated!], Shadow to (4,2) [Floors collapse behind!]
      'right', // 3. Real to (4,2) [cf-11-real-2], Shadow to (3,2) [cf-11-shadow-2]
      'right', // 4. Real crosses saw corridor to (5,2), Shadow to (2,2)
      'right', // 5. Real to (6,2) [Real Exit], Shadow to (1,2) [Shadow Exit] -> VICTORY!
    ],
  };

  it('validates schema of Level 11', () => {
    const res = LevelValidator.validateSchema(level11Config);
    expect(res.valid).toBe(true);
    expect(res.errors).toHaveLength(0);
  });

  it('collapses floor permanently when character steps off', () => {
    const session = LevelFactory.build(level11Config);
    const cf = session.puzzleManager.getCollapsingFloor('cf-11-real-1');

    expect(cf?.floorState).toBe('INTACT');

    // Move right onto (2, 2)
    session.turnEngine.handleInput('right');
    session.turnEngine.endAnimation();

    expect(session.player.position).toEqual(new GridPoint(2, 2));
    expect(cf?.floorState).toBe('CRACKED');

    // Move right onto checkpoint at (3, 2)
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
  });
});
