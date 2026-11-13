import { describe, it, expect } from 'vitest';
import { LevelDefinition } from '@/types/level';
import { LevelFactory } from '@/levels/LevelFactory';
import { LevelValidator } from '@/solver/LevelValidator';
import { LevelSolver } from '@/solver/LevelSolver';

describe('Phase 6 — Level 12: The Countdown', () => {
  const level12Config: LevelDefinition = {
    id: 12,
    chapter: 'THE SEPARATION',
    name: 'The Countdown',
    width: 8,
    height: 5,
    difficulty: 'EXPERT',
    hint: 'Prime the countdown bomb, cross the crumbling bridges before they collapse, and evade the dual saws.',
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
      { x: 4, y: 0 },
      { x: 4, y: 4 },
      { x: 2, y: 1 },
      { x: 2, y: 3 },
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
      { x: 3, y: 0 },
      { x: 3, y: 4 },
      { x: 5, y: 1 },
      { x: 5, y: 3 },
    ],
    collapsingFloors: [
      { id: 'cf-12-real', world: 'real', position: { x: 2, y: 2 } },
      { id: 'cf-12-shadow', world: 'shadow', position: { x: 5, y: 2 } },
    ],
    doors: [
      { id: 'door-12-real', world: 'real', position: { x: 4, y: 2 }, initialOpen: false },
      { id: 'door-12-shadow', world: 'shadow', position: { x: 3, y: 2 }, initialOpen: false },
    ],
    switches: [
      { id: 'sw-12-real', world: 'real', position: { x: 3, y: 3 }, linkedDoorId: 'door-12-shadow' },
      { id: 'sw-12-shadow', world: 'shadow', position: { x: 4, y: 3 }, linkedDoorId: 'door-12-real' },
    ],
    bombs: [
      {
        id: 'bomb-12',
        world: 'real',
        position: { x: 3, y: 1 },
        timer: 4,
        radius: 1,
        crossWorld: true,
        triggerType: 'STEP',
      },
    ],
    destructibleWalls: [
      { id: 'dw-12-real', world: 'real', position: { x: 4, y: 1 } },
      { id: 'dw-12-shadow', world: 'shadow', position: { x: 3, y: 1 } },
    ],
    movingHazards: [
      {
        id: 'saw-12-real',
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
        id: 'saw-12-shadow',
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
      'up',    // 1. Stagger step up to calibrate saw patrol cycle
      'down',  // 2. Return to start row
      'right', // 3. Real crosses cf-12-real at (2,2), Shadow crosses cf-12-shadow at (5,2)
      'right', // 4. Real reaches door-12-real at (4,2) stop, Shadow to door-12-shadow stop [Floors collapse behind!]
      'down',  // 5. Real hits sw-12-real at (3,3), Shadow hits sw-12-shadow at (4,3) -> Both doors unlock!
      'up',    // 6. Return to corridor at row 2
      'right', // 7. Real enters open door-12-real at (4,2), Shadow enters open door-12-shadow at (3,2)
      'right', // 8. Real crosses saw corridor to (5,2), Shadow crosses saw corridor to (2,2)
      'right', // 9. Real to (6,2) [Real Exit], Shadow to (1,2) [Shadow Exit] -> VICTORY!
    ],
  };

  it('validates schema of Level 12', () => {
    const res = LevelValidator.validateSchema(level12Config);
    expect(res.valid).toBe(true);
    expect(res.errors).toHaveLength(0);
  });

  it('is solved by BFS solver and validates replay trace', () => {
    const result = LevelSolver.solve(level12Config);
    console.log('BFS RESULT FOR LEVEL 12:', {
      found: result.solutionFound,
      explored: result.exploredStateCount,
      limit: result.searchLimitReached,
      seq: result.solutionSequence,
    });
    expect(result.solutionFound).toBe(true);
    expect(result.replayVerified).toBe(true);

    const session = LevelFactory.build(level12Config);
    for (let i = 0; i < result.solutionSequence.length; i++) {
      const dir = result.solutionSequence[i];
      session.turnEngine.handleInput(dir);
      session.turnEngine.endAnimation();
    }

    expect(session.turnEngine.state).toBe('COMPLETED');
    expect(session.player.isAtExit()).toBe(true);
    expect(session.shadow.isAtExit()).toBe(true);
  });
});
