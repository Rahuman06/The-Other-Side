import { describe, it, expect } from 'vitest';
import { LevelDefinition } from '@/types/level';
import { LevelFactory } from '@/levels/LevelFactory';
import { LevelValidator } from '@/solver/LevelValidator';
import { LevelSolver } from '@/solver/LevelSolver';
import { GridPoint } from '@/grid/GridPosition';

describe('Phase 5 — Level 7: Through the Other Side', () => {
  const level7Config: LevelDefinition = {
    id: 7,
    chapter: 'THE CONNECTION',
    name: 'Through the Other Side',
    width: 7,
    height: 5,
    difficulty: 'HARD',
    hint: 'Use the rift portals to cross the impenetrable barrier and unlock the counterpart gates.',
    realStart: { x: 1, y: 2 },
    shadowStart: { x: 5, y: 2 },
    realExit: { x: 5, y: 2 },
    shadowExit: { x: 1, y: 2 },
    realWalls: [
      { x: 3, y: 0 },
      { x: 3, y: 1 },
      { x: 3, y: 2 },
      { x: 3, y: 3 },
      { x: 3, y: 4 },
      { x: 6, y: 0 },
      { x: 6, y: 1 },
      { x: 6, y: 2 },
      { x: 6, y: 3 },
      { x: 6, y: 4 },
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: 2 },
      { x: 0, y: 3 },
      { x: 0, y: 4 },
      { x: 1, y: 4 },
      { x: 5, y: 4 },
    ],
    shadowWalls: [
      { x: 3, y: 0 },
      { x: 3, y: 1 },
      { x: 3, y: 2 },
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
      { x: 5, y: 0 },
      { x: 1, y: 0 },
    ],
    doors: [
      { id: 'door-7-real', world: 'real', position: { x: 4, y: 2 }, initialOpen: false },
      { id: 'door-7-shadow', world: 'shadow', position: { x: 2, y: 2 }, initialOpen: false },
    ],
    switches: [
      { id: 'sw-7-real', world: 'real', position: { x: 4, y: 3 }, linkedDoorId: 'door-7-shadow' },
      { id: 'sw-7-shadow', world: 'shadow', position: { x: 2, y: 3 }, linkedDoorId: 'door-7-real' },
    ],
    portals: [
      {
        id: 'portal-7-real-in',
        world: 'real',
        position: { x: 1, y: 1 },
        targetWorld: 'real',
        targetPosition: { x: 4, y: 1 },
        initialActive: true,
      },
      {
        id: 'portal-7-shadow-in',
        world: 'shadow',
        position: { x: 5, y: 3 },
        targetWorld: 'shadow',
        targetPosition: { x: 2, y: 3 },
        initialActive: true,
      },
      {
        id: 'portal-7-shadow-return',
        world: 'shadow',
        position: { x: 2, y: 1 },
        targetWorld: 'shadow',
        targetPosition: { x: 5, y: 1 },
        initialActive: true,
      },
    ],
    solutionTrace: [
      'up',     // 1. Real steps into (1,1) -> teleports to (4,1)! Shadow (5,1)
      'right',  // 2. Real to (5,1), Shadow to (4,1)
      'down',   // 3. Real to (5,2) [Exit], Shadow to (4,2)
      'down',   // 4. Real held at (5,2), Shadow to (4,3)
      'left',   // 5. Real to (4,2) [door opened], Shadow to (5,3) -> teleports to (2,3) [hits sw-7-shadow!]
      'right',  // 6. Real to (5,2) [Real Exit], Shadow to (1,3)
      'up',     // 7. Real held at (5,2), Shadow to (1,2) [Shadow Exit! Level Complete!]
    ],
  };

  it('validates Level 7 schema with portals and cross-world switches', () => {
    const res = LevelValidator.validateSchema(level7Config);
    expect(res.valid).toBe(true);
    expect(res.errors).toHaveLength(0);
  });

  it('teleports characters across chambers and handles destination occupancy', () => {
    const session = LevelFactory.build(level7Config);

    expect(session.player.position).toEqual(new GridPoint(1, 2));
    expect(session.shadow.position).toEqual(new GridPoint(5, 2));

    // Move 1: 'up' -> Real enters portal at (1,1) -> teleports to (4,1)
    session.turnEngine.handleInput('up');
    session.turnEngine.endAnimation();

    expect(session.player.position).toEqual(new GridPoint(4, 1));
    expect(session.shadow.position).toEqual(new GridPoint(5, 1));
  });

  it('completes the level via the solution trace', () => {
    const replay = LevelValidator.replaySolution(level7Config, level7Config.solutionTrace);
    expect(replay.success).toBe(true);
    expect(replay.completed).toBe(true);
    expect(replay.died).toBe(false);
  });

  it('is solved by BFS solver', () => {
    const result = LevelSolver.solve(level7Config);
    console.log('BFS SOLUTION FOR LEVEL 7:', result.solutionSequence);
    expect(result.solutionFound).toBe(true);
    expect(result.replayVerified).toBe(true);
  });
});
