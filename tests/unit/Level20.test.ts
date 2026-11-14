import { describe, it, expect } from 'vitest';
import { ALL_LEVELS } from '../../src/levels/levelsData';
import { LevelSolver } from '../../src/solver/LevelSolver';
import { LevelValidator } from '../../src/solver/LevelValidator';
import { LevelFactory } from '../../src/levels/LevelFactory';

describe('Level 20: The Impossible Dimension (15x15 Master Design with 100+ Moves & Mutual Rescue)', () => {
  const level20 = ALL_LEVELS.find((l) => l.id === 20)!;

  it('exists, is authored with Master difficulty, and passes full schema validation', () => {
    expect(level20).toBeDefined();
    expect(level20.name).toBe('The Impossible Dimension');
    expect(level20.chapter).toBe('THE TRUTH');
    expect(level20.difficulty).toBe('MASTER');
    expect(level20.width).toBe(15);
    expect(level20.height).toBe(15);

    const schemaRes = LevelValidator.validateSchema(level20);
    expect(schemaRes.valid).toBe(true);
    expect(schemaRes.errors).toEqual([]);
  });

  it('verifies the master solution trace has 100+ inputs and reaches dual exits simultaneously', () => {
    expect(level20.solutionTrace.length).toBeGreaterThanOrEqual(100);
    expect(level20.solutionTrace.length).toBe(108);

    const replay = LevelValidator.replaySolution(level20, level20.solutionTrace);
    expect(replay.success).toBe(true);
    expect(replay.completed).toBe(true);
    expect(replay.died).toBe(false);
    expect(replay.finalPlayerPos.x).toBe(1);
    expect(replay.finalPlayerPos.y).toBe(13);
    expect(replay.finalShadowPos.x).toBe(13);
    expect(replay.finalShadowPos.y).toBe(13);
  });

  it('proves BFS automated solver verifies shortest path is at least 100 moves (108 moves)', () => {
    const solverRes = LevelSolver.solve(level20, { maxDepth: 160 });
    expect(solverRes.solutionFound).toBe(true);
    expect(solverRes.replayVerified).toBe(true);
    expect(solverRes.solutionLength).toBeGreaterThanOrEqual(100);
    expect(solverRes.solutionLength).toBe(108);
  });

  it('proves that neither character can unlock their own exit independently (mutual rescue requirement)', () => {
    expect(level20.doors).toBeDefined();
    const finalDoorReal = level20.doors!.find((d) => d.id === 'd-exit-r');
    const finalDoorShadow = level20.doors!.find((d) => d.id === 'd-exit-s');

    expect(finalDoorReal).toBeDefined();
    expect(finalDoorShadow).toBeDefined();

    // Cross-linked switch logic
    const finalSwitchShadow = level20.switches!.find((s) => s.id === 'sw-final-r');
    const finalSwitchReal = level20.switches!.find((s) => s.id === 'sw-final-s');

    expect(finalSwitchShadow?.linkedDoorId).toBe('d-exit-r');
    expect(finalSwitchReal?.linkedDoorId).toBe('d-exit-s');
    expect(finalSwitchShadow?.world).toBe('shadow');
    expect(finalSwitchReal?.world).toBe('real');
  });

  it('initializes Level 20 through LevelFactory and establishes 15x15 dual grids', () => {
    const session = LevelFactory.build(level20);
    expect(session.playerGrid.width).toBe(15);
    expect(session.playerGrid.height).toBe(15);
    expect(session.shadowGrid.width).toBe(15);
    expect(session.shadowGrid.height).toBe(15);
    expect(session.player.position.x).toBe(1);
    expect(session.player.position.y).toBe(1);
    expect(session.shadow.position.x).toBe(13);
    expect(session.shadow.position.y).toBe(1);
  });
});
