import { describe, it, expect } from 'vitest';
import { LevelDefinition } from '@/types/level';
import { LevelFactory } from '@/levels/LevelFactory';
import { LevelValidator } from '@/solver/LevelValidator';
import { LevelSolver } from '@/solver/LevelSolver';
import { GridPoint } from '@/grid/GridPosition';

describe('Phase 6 — Level 10: The Turning Blade', () => {
  const level10Config: LevelDefinition = {
    id: 10,
    chapter: 'THE SEPARATION',
    name: 'The Turning Blade',
    width: 7,
    height: 5,
    difficulty: 'EXPERT',
    hint: 'Saw blades patrol predictable circuits around the exits. Time your crossing while holding open the gates.',
    realStart: { x: 1, y: 2 },
    shadowStart: { x: 5, y: 2 },
    realExit: { x: 5, y: 2 },
    shadowExit: { x: 1, y: 2 },
    realWalls: [
      { x: 3, y: 0 },
      { x: 3, y: 1 },
      { x: 3, y: 3 },
      { x: 3, y: 4 },
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: 2 },
      { x: 0, y: 3 },
      { x: 0, y: 4 },
      { x: 6, y: 0 },
      { x: 6, y: 1 },
      { x: 6, y: 2 },
      { x: 6, y: 3 },
      { x: 6, y: 4 },
    ],
    shadowWalls: [
      { x: 3, y: 0 },
      { x: 3, y: 1 },
      { x: 3, y: 3 },
      { x: 3, y: 4 },
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: 2 },
      { x: 0, y: 3 },
      { x: 0, y: 4 },
      { x: 6, y: 0 },
      { x: 6, y: 1 },
      { x: 6, y: 2 },
      { x: 6, y: 3 },
      { x: 6, y: 4 },
    ],
    doors: [
      { id: 'door-10-real', world: 'real', position: { x: 3, y: 2 }, initialOpen: false },
      { id: 'door-10-shadow', world: 'shadow', position: { x: 3, y: 2 }, initialOpen: false },
    ],
    pressurePlates: [
      { id: 'plate-10-real', world: 'real', position: { x: 2, y: 2 }, linkedDoorId: 'door-10-shadow' },
      { id: 'plate-10-shadow', world: 'shadow', position: { x: 2, y: 1 }, linkedDoorId: 'door-10-real' },
    ],
    movingHazards: [
      {
        id: 'saw-10-real',
        world: 'real',
        path: [
          { x: 4, y: 1 },
          { x: 5, y: 1 },
          { x: 5, y: 3 },
          { x: 4, y: 3 },
        ],
        initialIndex: 0,
      },
      {
        id: 'saw-10-shadow',
        world: 'shadow',
        path: [
          { x: 4, y: 3 },
          { x: 5, y: 3 },
          { x: 5, y: 1 },
          { x: 4, y: 1 },
        ],
        initialIndex: 0,
      },
    ],
    solutionTrace: [
      'right', // 1. Real to (2,2) [plate-10-real: opens door-10-shadow!], Shadow to (4,2)
      'right', // 2. Real held at (2,2) by closed door-10-real, Shadow enters open door-10-shadow to (3,2)
      'down',  // 3. Real to (2,3), Shadow to (3,3)
      'right', // 4. Real to (3,3) [wall stop], Shadow to (2,3)
      'up',    // 5. Real to (2,2), Shadow to (2,2)
      'right', // 6. Real held at (2,2), Shadow reaches Shadow Exit at (1,2) [Locked on arrival!]
      'right', // 7. Real held, Shadow held
      'right', // 8. Real enters open door-10-real to (4,2), Shadow held
      'down',  // 9. Real reaches Real Exit at (5,2) -> VICTORY!
    ],
  };

  it('validates schema of Level 10', () => {
    const res = LevelValidator.validateSchema(level10Config);
    expect(res.valid).toBe(true);
    expect(res.errors).toHaveLength(0);
  });

  it('advances saw blades along their patrol path each turn', () => {
    const session = LevelFactory.build(level10Config);
    const saw = session.puzzleManager.getMovingHazard('saw-10-real');

    expect(saw?.position).toEqual(new GridPoint(4, 1));

    session.turnEngine.handleInput('right');
    session.turnEngine.endAnimation();

    expect(saw?.position).toEqual(new GridPoint(5, 1));
  });

  it('is solved by BFS solver and validates replay trace', () => {
    const result = LevelSolver.solve(level10Config);
    console.log('BFS RESULT FOR LEVEL 10:', {
      found: result.solutionFound,
      explored: result.exploredStateCount,
      limit: result.searchLimitReached,
      seq: result.solutionSequence,
    });
    expect(result.solutionFound).toBe(true);
    expect(result.replayVerified).toBe(true);
  });
});
