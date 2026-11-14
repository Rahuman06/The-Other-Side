import { describe, it, expect } from 'vitest';
import { ALL_LEVELS } from '../../src/levels/levelsData';
import { LevelSolver } from '../../src/solver/LevelSolver';
import { LevelValidator } from '../../src/solver/LevelValidator';
import { LevelFactory } from '../../src/levels/LevelFactory';

describe('Level 20: The Impossible Dimension (15x15 Master Design)', () => {
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

  it('verifies the master solution trace reaches dual exits simultaneously', () => {
    const replay = LevelValidator.replaySolution(level20, level20.solutionTrace);
    expect(replay.success).toBe(true);
    expect(replay.completed).toBe(true);
    expect(replay.died).toBe(false);
    expect(replay.finalPlayerPos.x).toBe(13);
    expect(replay.finalPlayerPos.y).toBe(13);
    expect(replay.finalShadowPos.x).toBe(1);
    expect(replay.finalShadowPos.y).toBe(13);
  });

  it('proves BFS automated solver explores over 1,000 states and solves Level 20', () => {
    const solverRes = LevelSolver.solve(level20);
    expect(solverRes.solutionFound).toBe(true);
    expect(solverRes.replayVerified).toBe(true);
    expect(solverRes.exploredStateCount).toBeGreaterThanOrEqual(1000);
    expect(solverRes.solutionLength).toBe(28);
  });

  it('proves that neither character can unlock their own exit independently', () => {
    expect(level20.doors).toBeDefined();
    const finalDoorReal = level20.doors!.find((d) => d.id === 'd-final-r');
    const finalDoorShadow = level20.doors!.find((d) => d.id === 'd-final-s');

    expect(finalDoorReal).toBeDefined();
    expect(finalDoorShadow).toBeDefined();

    // Cross-linked switch logic
    const syncSwitchShadow = level20.switches!.find((s) => s.id === 'sw-sync-s');
    const syncSwitchReal = level20.switches!.find((s) => s.id === 'sw-sync-r');

    expect(syncSwitchShadow?.linkedDoorId).toBe('d-final-r');
    expect(syncSwitchReal?.linkedDoorId).toBe('d-final-s');
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
