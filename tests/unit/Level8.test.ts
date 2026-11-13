import { describe, it, expect } from 'vitest';
import { LevelDefinition } from '@/types/level';
import { LevelFactory } from '@/levels/LevelFactory';
import { LevelValidator } from '@/solver/LevelValidator';
import { LevelSolver } from '@/solver/LevelSolver';
import { GridPoint } from '@/grid/GridPosition';

describe('Phase 5 — Level 8: Chain Reaction', () => {
  const level8Config: LevelDefinition = {
    id: 8,
    chapter: 'THE CONNECTION',
    name: 'Chain Reaction',
    width: 7,
    height: 5,
    difficulty: 'EXPERT',
    hint: 'Teleport to prime the bomb, shelter from the double blast, then cross the cleared rifts.',
    realStart: { x: 1, y: 2 },
    shadowStart: { x: 5, y: 2 },
    realExit: { x: 5, y: 2 },
    shadowExit: { x: 1, y: 2 },
    realWalls: [
      { x: 3, y: 0 },
      { x: 3, y: 1 },
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
      { x: 5, y: 0 },
      { x: 5, y: 4 },
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
      { x: 1, y: 0 },
      { x: 1, y: 4 },
    ],
    destructibleWalls: [
      { id: 'dw-8-real', world: 'real', position: { x: 3, y: 2 } },
      { id: 'dw-8-shadow', world: 'shadow', position: { x: 3, y: 2 } },
    ],
    bombs: [
      {
        id: 'bomb-8-primary',
        world: 'real',
        position: { x: 4, y: 1 },
        timer: 3,
        radius: 1,
        crossWorld: true,
        triggerType: 'STEP',
      },
      {
        id: 'bomb-8-secondary',
        world: 'shadow',
        position: { x: 4, y: 2 },
        timer: 5, // Chain ignited by Bomb 1
        radius: 1,
        crossWorld: true,
        triggerType: 'STEP',
      },
    ],
    portals: [
      {
        id: 'portal-8-real-in',
        world: 'real',
        position: { x: 1, y: 1 },
        targetWorld: 'real',
        targetPosition: { x: 4, y: 1 }, // Teleports directly onto Bomb 1 to prime it!
        initialActive: true,
      },
    ],
    solutionTrace: [
      'up',    // 1. Real teleports to (4,1) via portal, primes Bomb 1
      'down',  // 2. Real to (4,2), Shadow to (5,2)
      'down',  // 3. Real to (4,3), Shadow to (5,3)
      'down',  // 4. Real to (4,4), Shadow to (5,4) -> Detonates Bomb 1 & chain detonates Bomb 2! Destroys walls!
      'up',    // 5. Real to (4,3), Shadow to (5,3)
      'up',    // 6. Real to (4,2), Shadow to (5,2)
      'right', // 7. Real to (5,2) [Real Exit], Shadow to (4,2)
      'right', // 8. Real anchored at (5,2), Shadow breaches (3,2)
      'right', // 9. Real anchored, Shadow to (2,2)
      'right', // 10. Real anchored, Shadow to (1,2) [Shadow Exit] -> VICTORY!
    ],
  };

  it('validates Level 8 schema with bombs, portals, and destructible walls', () => {
    const res = LevelValidator.validateSchema(level8Config);
    expect(res.valid).toBe(true);
    expect(res.errors).toHaveLength(0);
  });

  it('demonstrates portal entry triggering bomb priming and cross-world chain detonation', () => {
    const session = LevelFactory.build(level8Config);
    const bomb1 = session.puzzleManager.getBomb('bomb-8-primary');
    const bomb2 = session.puzzleManager.getBomb('bomb-8-secondary');
    const dwReal = session.puzzleManager.getDestructibleWall('dw-8-real');
    const dwShadow = session.puzzleManager.getDestructibleWall('dw-8-shadow');

    expect(bomb1?.isActive).toBe(false);
    expect(bomb2?.isActive).toBe(false);

    // Step 1: Real enters portal at (1,1) -> lands on (4,1) -> primes Bomb 1!
    session.turnEngine.handleInput('up');
    session.turnEngine.endAnimation();

    expect(session.player.position).toEqual(new GridPoint(4, 1));
    expect(bomb1?.isActive).toBe(true);
    expect(bomb1?.countdown).toBe(3);

    // Step 2 & 3: Flee south
    session.turnEngine.handleInput('down');
    session.turnEngine.endAnimation();
    expect(bomb1?.countdown).toBe(2);

    session.turnEngine.handleInput('down');
    session.turnEngine.endAnimation();
    expect(bomb1?.countdown).toBe(1);

    // Step 4: Detonation
    session.turnEngine.handleInput('down');
    session.turnEngine.endAnimation();

    expect(bomb1?.isDetonated).toBe(true);
    expect(bomb2?.isDetonated).toBe(true); // Chain reaction!
    expect(dwReal?.isDestroyed).toBe(true);
    expect(dwShadow?.isDestroyed).toBe(true);
  });

  it('is solved by BFS solver', () => {
    const result = LevelSolver.solve(level8Config);
    console.log('BFS SOLUTION FOR LEVEL 8:', result.solutionSequence);
    expect(result.solutionFound).toBe(true);
    expect(result.replayVerified).toBe(true);
  });
});
