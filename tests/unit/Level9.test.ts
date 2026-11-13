import { describe, it, expect } from 'vitest';
import { LevelDefinition } from '@/types/level';
import { LevelFactory } from '@/levels/LevelFactory';
import { LevelValidator } from '@/solver/LevelValidator';
import { LevelSolver } from '@/solver/LevelSolver';
import { GridPoint } from '@/grid/GridPosition';

describe('Phase 6 — Level 9: The Corruption', () => {
  const level9Config: LevelDefinition = {
    id: 9,
    chapter: 'THE SEPARATION',
    name: 'The Corruption',
    width: 8,
    height: 5,
    difficulty: 'EXPERT',
    hint: 'The corrupted portal shifts destinations each entry. Align both worlds to clear hazardous paths.',
    realStart: { x: 1, y: 2 },
    shadowStart: { x: 6, y: 2 },
    realExit: { x: 6, y: 2 },
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
      { x: 7, y: 0 },
      { x: 7, y: 1 },
      { x: 7, y: 2 },
      { x: 7, y: 3 },
      { x: 7, y: 4 },
      { x: 5, y: 0 },
      { x: 5, y: 1 },
      { x: 5, y: 2 },
      { x: 5, y: 3 },
      { x: 5, y: 4 },
    ],
    shadowWalls: [
      { x: 4, y: 0 },
      { x: 4, y: 4 },
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
      { x: 2, y: 0 },
      { x: 2, y: 4 },
    ],
    hazards: [
      { id: 'hz-9-shadow-1', world: 'shadow', position: { x: 5, y: 1 } },
      { id: 'hz-9-shadow-2', world: 'shadow', position: { x: 3, y: 3 } },
      { id: 'hz-9-real-trap', world: 'real', position: { x: 4, y: 3 } },
    ],
    doors: [
      { id: 'door-9-real', world: 'real', position: { x: 3, y: 2 }, initialOpen: false },
      { id: 'door-9-shadow', world: 'shadow', position: { x: 4, y: 2 }, initialOpen: false },
    ],
    switches: [
      { id: 'sw-9-real', world: 'real', position: { x: 4, y: 0 }, linkedDoorId: 'door-9-shadow' },
      { id: 'sw-9-shadow', world: 'shadow', position: { x: 3, y: 1 }, linkedDoorId: 'door-9-real' },
    ],
    portals: [
      {
        id: 'portal-9-corrupt',
        world: 'real',
        position: { x: 1, y: 1 },
        corrupted: true,
        destinations: [
          { targetWorld: 'real', targetPosition: { x: 4, y: 1 } }, // Destination 0: Chamber Alpha to hit sw-9-real
          { targetWorld: 'real', targetPosition: { x: 6, y: 1 } }, // Destination 1: Chamber Omega to reach exit!
        ],
        initialActive: true,
      },
      {
        id: 'portal-9-return',
        world: 'real',
        position: { x: 4, y: 2 },
        targetWorld: 'real',
        targetPosition: { x: 1, y: 2 },
        initialActive: true,
      },
    ],
    solutionTrace: [
      'up',    // 1. Real enters portal-9-corrupt -> teleports to Dest 0: (4,1), Shadow to (6,1)
      'up',    // 2. Real to (4,0) [hits sw-9-real, opening door-9-shadow!], Shadow to (6,0)
      'down',  // 3. Real to (4,1), Shadow to (6,1)
      'down',  // 4. Real to (4,2) [enters portal-9-return -> lands on (1,2)], Shadow to (6,2)
      'right', // 5. Real to (2,2), Shadow to (5,2)
      'right', // 6. Real held at (2,2) by door-9-real, Shadow enters open door-9-shadow at (4,2)
      'right', // 7. Real held, Shadow to (3,2)
      'right', // 8. Real held, Shadow to (2,2)
      'right', // 9. Real held, Shadow reaches Shadow Exit at (1,2) [Locked on arrival!]
      'up',    // 10. Real to (2,1), Shadow remains locked
      'left',  // 11. Real enters portal-9-corrupt -> teleports to Dest 1: (6,1)!
      'down',  // 12. Real reaches Real Exit at (6,2) -> Simultaneous Exit & VICTORY!
    ],
  };

  it('validates schema of Level 9', () => {
    const res = LevelValidator.validateSchema(level9Config);
    expect(res.valid).toBe(true);
    expect(res.errors).toHaveLength(0);
  });

  it('verifies corrupted portal shifts destinations on consecutive entries', () => {
    const session = LevelFactory.build(level9Config);
    const portal = session.puzzleManager.getPortal('portal-9-corrupt');

    expect(portal?.isCorrupted).toBe(true);
    expect(portal?.destinationIndex).toBe(0);
    expect(portal?.targetPosition).toEqual(new GridPoint(4, 1));

    // Entry 1: Real moves up into portal at (1,1)
    session.turnEngine.handleInput('up');
    session.turnEngine.endAnimation();

    expect(session.player.position).toEqual(new GridPoint(4, 1));
    expect(portal?.destinationIndex).toBe(1);
    expect(portal?.targetPosition).toEqual(new GridPoint(6, 1));
  });

  it('is solved by BFS solver and validates replay trace', () => {
    const result = LevelSolver.solve(level9Config);
    console.log('BFS SOLUTION FOR LEVEL 9:', result.solutionSequence);
    expect(result.solutionFound).toBe(true);
    expect(result.replayVerified).toBe(true);

    const session = LevelFactory.build(level9Config);
    for (let i = 0; i < result.solutionSequence.length; i++) {
      const dir = result.solutionSequence[i];
      session.turnEngine.handleInput(dir);
      session.turnEngine.endAnimation();
      console.log(`Step ${i + 1} (${dir}): Real=${session.player.position} Shadow=${session.shadow.position} state=${session.turnEngine.state}`);
    }

    expect(session.turnEngine.state).toBe('COMPLETED');
    expect(session.player.isAtExit()).toBe(true);
    expect(session.shadow.isAtExit()).toBe(true);
  });
});
