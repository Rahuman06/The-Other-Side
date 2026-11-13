import { describe, it, expect } from 'vitest';
import { LevelDefinition } from '@/types/level';
import { LevelFactory } from '@/levels/LevelFactory';
import { LevelValidator } from '@/solver/LevelValidator';
import { LevelSolver } from '@/solver/LevelSolver';
import { GridPoint } from '@/grid/GridPosition';

describe('Phase 5 — Level 6: Detonation', () => {
  const level6Config: LevelDefinition = {
    id: 6,
    chapter: 'THE CONNECTION',
    name: 'Detonation',
    width: 7,
    height: 5,
    difficulty: 'HARD',
    hint: 'Prime the bomb, flee south to shelter from the blast, and cross the breached walls.',
    realStart: { x: 1, y: 2 },
    shadowStart: { x: 5, y: 2 },
    realExit: { x: 5, y: 2 },
    shadowExit: { x: 1, y: 2 },
    realWalls: [
      { x: 1, y: 0 },
      { x: 3, y: 0 },
      { x: 3, y: 1 },
      { x: 3, y: 3 },
      { x: 3, y: 4 },
      { x: 6, y: 0 },
      { x: 6, y: 1 },
      { x: 6, y: 2 },
      { x: 6, y: 3 },
      { x: 6, y: 4 },
      { x: 5, y: 3 },
      { x: 5, y: 4 },
      { x: 0, y: 1 },
      { x: 0, y: 2 },
      { x: 0, y: 3 },
      { x: 0, y: 4 },
    ],
    shadowWalls: [
      { x: 5, y: 0 },
      { x: 3, y: 0 },
      { x: 3, y: 2 },
      { x: 3, y: 3 },
      { x: 3, y: 4 },
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: 2 },
      { x: 0, y: 3 },
      { x: 0, y: 4 },
      { x: 1, y: 3 },
      { x: 1, y: 4 },
      { x: 4, y: 0 },
      { x: 4, y: 3 },
      { x: 4, y: 4 },
      { x: 5, y: 4 },
    ],
    destructibleWalls: [
      { id: 'dw-6-real', world: 'real', position: { x: 3, y: 2 } },
      { id: 'dw-6-shadow', world: 'shadow', position: { x: 3, y: 1 } },
    ],
    bombs: [
      {
        id: 'bomb-6-primary',
        world: 'real',
        position: { x: 2, y: 1 },
        timer: 3,
        radius: 1,
        crossWorld: true,
        triggerType: 'STEP',
      },
      {
        id: 'bomb-6-secondary',
        world: 'shadow',
        position: { x: 2, y: 2 },
        timer: 5, // Won't detonate on its own; detonates via chain reaction!
        radius: 1,
        crossWorld: true,
        triggerType: 'STEP',
      },
    ],
    // 1. up    -> Real (1,1), Shadow (5,1)
    // 2. right -> Real (2,1) [steps on Bomb 1! Timer=3], Shadow (4,1)
    // 3. down  -> Real (2,2) [Timer=2], Shadow (4,2)
    // 4. down  -> Real (2,3) [Timer=1], Shadow (4,2) [wall stop]
    // 5. down  -> Real (2,4) [Timer=0 -> DETONATION! Safe in shelter!], Shadow (4,2) [Safe!]
    // 6. up    -> Real (2,3), Shadow (4,1)
    // 7. up    -> Real (2,2), Shadow (4,1) [wall stop]
    // 8. right -> Real (3,2) [breached dw-6-real!], Shadow (3,1) [breached dw-6-shadow!]
    // 9. right -> Real (4,2), Shadow (2,1)
    // 10. right-> Real (5,2) [Real Exit!], Shadow (1,1)
    // 11. down -> Real (5,2) [Exit], Shadow (1,2) [Shadow Exit! Level Complete!]
    solutionTrace: [
      'up',
      'right',
      'down',
      'down',
      'down',
      'up',
      'up',
      'right',
      'right',
      'right',
      'down',
    ],
  };

  it('validates Level 6 schema with bombs and destructible walls', () => {
    const res = LevelValidator.validateSchema(level6Config);
    expect(res.valid).toBe(true);
    expect(res.errors).toHaveLength(0);
  });

  it('demonstrates bomb countdown, cross-world chain reaction, and wall destruction', () => {
    const session = LevelFactory.build(level6Config);
    const bomb1 = session.puzzleManager.getBomb('bomb-6-primary');
    const bomb2 = session.puzzleManager.getBomb('bomb-6-secondary');
    const dwReal = session.puzzleManager.getDestructibleWall('dw-6-real');
    const dwShadow = session.puzzleManager.getDestructibleWall('dw-6-shadow');

    expect(bomb1?.isActive).toBe(false);
    expect(bomb2?.isActive).toBe(false);
    expect(dwReal?.isDestroyed).toBe(false);
    expect(dwShadow?.isDestroyed).toBe(false);

    // Step 1: 'up'
    session.turnEngine.handleInput('up');
    session.turnEngine.endAnimation();
    expect(bomb1?.isActive).toBe(false);

    // Step 2: 'right' -> Real steps on Bomb 1 at (2,1)
    session.turnEngine.handleInput('right');
    session.turnEngine.endAnimation();
    expect(session.player.position).toEqual(new GridPoint(2, 1));
    expect(bomb1?.isActive).toBe(true);
    expect(bomb1?.countdown).toBe(3);

    // Step 3: 'left' -> Real flees to (1,1)
    session.turnEngine.handleInput('left');
    session.turnEngine.endAnimation();
    expect(bomb1?.countdown).toBe(2);

    // Step 4: 'down' -> Real flees to (1,2)
    session.turnEngine.handleInput('down');
    session.turnEngine.endAnimation();
    expect(bomb1?.countdown).toBe(1);

    // Step 5: 'down' -> Real reaches safe shelter at (1,3). Detonation triggers!
    session.turnEngine.handleInput('down');
    session.turnEngine.endAnimation();

    expect(bomb1?.isDetonated).toBe(true);
    expect(bomb2?.isDetonated).toBe(true); // Chain reaction occurred!
    expect(dwShadow?.isDestroyed).toBe(true); // Destroyed by Bomb 1!
    expect(dwReal?.isDestroyed).toBe(true); // Destroyed by Bomb 2!
    expect(session.turnEngine.state).toBe('PLAYING'); // Neither character died!
  });

  it('kills characters if they fail to escape the blast radius', () => {
    const session = LevelFactory.build(level6Config);

    // Step 1: 'up' -> Real (1,1)
    session.turnEngine.handleInput('up');
    session.turnEngine.endAnimation();

    // Step 2: 'right' -> Real steps on Bomb 1 at (2,1)
    session.turnEngine.handleInput('right');
    session.turnEngine.endAnimation();

    const bomb1 = session.puzzleManager.getBomb('bomb-6-primary')!;
    expect(bomb1.isActive).toBe(true);

    let deathOccurred = false;
    session.turnEngine['events'].onDeath = () => {
      deathOccurred = true;
    };

    // Real stays in blast zone by moving back and forth between (2,1) and (1,1)
    session.turnEngine.handleInput('left'); // Move 3: timer ticks from 3 to 2
    session.turnEngine.endAnimation();
    session.turnEngine.handleInput('right'); // Move 4: timer ticks from 2 to 1
    session.turnEngine.endAnimation();
    session.turnEngine.handleInput('left'); // Move 5: timer hits 0 and detonates! Real is at (1,1) in blast!
    session.turnEngine.endAnimation();

    expect(deathOccurred).toBe(true);
  });

  it('completes the level via the solution trace', () => {
    const session = LevelFactory.build(level6Config);
    for (let i = 0; i < level6Config.solutionTrace.length; i++) {
      const dir = level6Config.solutionTrace[i];
      const res = session.turnEngine.handleInput(dir);
      session.turnEngine.endAnimation();
      console.log(`Step ${i + 1} (${dir}): Real=(${session.player.position.x},${session.player.position.y}) moved=${res?.playerMoved}, Shadow=(${session.shadow.position.x},${session.shadow.position.y}) moved=${res?.shadowMoved}, state=${session.turnEngine.state}`);
    }

    const replay = LevelValidator.replaySolution(level6Config, level6Config.solutionTrace);
    if (!replay.success) {
      console.log('REPLAY ERROR:', replay.errorDetails);
    }
    expect(replay.success).toBe(true);
    expect(replay.completed).toBe(true);
    expect(replay.died).toBe(false);
  });

  it('is solved by BFS solver', () => {
    const result = LevelSolver.solve(level6Config);
    console.log('BFS SOLUTION FOR LEVEL 6:', result.solutionSequence);
    expect(result.solutionFound).toBe(true);
    expect(result.replayVerified).toBe(true);

    const session = LevelFactory.build(level6Config);
    for (let i = 0; i < result.solutionSequence.length; i++) {
      const dir = result.solutionSequence[i];
      const res = session.turnEngine.handleInput(dir);
      session.turnEngine.endAnimation();
      console.log(`BFS Step ${i + 1} (${dir}): Real=(${session.player.position.x},${session.player.position.y}) moved=${res?.playerMoved}, Shadow=(${session.shadow.position.x},${session.shadow.position.y}) moved=${res?.shadowMoved}, state=${session.turnEngine.state}`);
    }
  });
});
