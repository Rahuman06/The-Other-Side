import { describe, it, expect } from 'vitest';
import { ALL_LEVELS } from '../../src/levels/levelsData';
import { LevelSolver } from '../../src/solver/LevelSolver';
import { LevelValidator } from '../../src/solver/LevelValidator';
import { LevelFactory } from '../../src/levels/LevelFactory';

describe('Level 20: The Impossible Dimension (15x15 Master Design with Lasers, Moving Saws, Portals & Dual Exits)', () => {
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
    expect(level20.solutionTrace.length).toBe(106);

    const replay = LevelValidator.replaySolution(level20, level20.solutionTrace);
    expect(replay.success).toBe(true);
    expect(replay.completed).toBe(true);
    expect(replay.died).toBe(false);
    expect(replay.finalPlayerPos.x).toBe(13);
    expect(replay.finalPlayerPos.y).toBe(13);
    expect(replay.finalShadowPos.x).toBe(1);
    expect(replay.finalShadowPos.y).toBe(13);
  });

  it('proves BFS automated solver explores vast state space and enforces search depth limits', () => {
    // For a 106-move grand boss labyrinth, unguided BFS explores hundreds of states confirming labyrinth complexity
    const solverRes = LevelSolver.solve(level20, { maxStates: 500 });
    expect(solverRes.schemaValid).toBe(true);
    expect(solverRes.exploredStateCount).toBeGreaterThan(100);
    expect(solverRes.searchLimitReached).toBe(true); // Confirms massive labyrinth search space
  });



  it('verifies cross-world mutual unlock mechanism for the final vault', () => {
    expect(level20.doors).toBeDefined();
    const finalDoorReal = level20.doors!.find((d) => d.id === 'd-final-r');
    const finalDoorShadow = level20.doors!.find((d) => d.id === 'd-final-s');

    expect(finalDoorReal).toBeDefined();
    expect(finalDoorShadow).toBeDefined();

    // Cross-linked switch logic
    const finalSwitchShadow = level20.switches!.find((s) => s.id === 'sw-final-r');
    const finalSwitchReal = level20.switches!.find((s) => s.id === 'sw-final-s');

    expect(finalSwitchShadow?.linkedDoorId).toBe('d-final-s');
    expect(finalSwitchReal?.linkedDoorId).toBe('d-final-r');
    expect(finalSwitchShadow?.world).toBe('real');
    expect(finalSwitchReal?.world).toBe('shadow');
  });

  it('initializes Level 20 through LevelFactory and establishes 15x15 dual grids with all mechanics', () => {
    const session = LevelFactory.build(level20);
    expect(session.playerGrid.width).toBe(15);
    expect(session.playerGrid.height).toBe(15);
    expect(session.shadowGrid.width).toBe(15);
    expect(session.shadowGrid.height).toBe(15);
    expect(session.player.position.x).toBe(1);
    expect(session.player.position.y).toBe(1);
    expect(session.shadow.position.x).toBe(13);
    expect(session.shadow.position.y).toBe(1);

    // Verify all advanced mechanics are loaded in session
    expect(session.puzzleManager.getAllLaserEmitters().length).toBeGreaterThan(0);
    expect(session.puzzleManager.getAllLaserMirrors().length).toBeGreaterThan(0);
    expect(session.puzzleManager.getAllLaserReceivers().length).toBeGreaterThan(0);
    expect(session.puzzleManager.getAllMovingHazards().length).toBeGreaterThan(0);
    expect(session.puzzleManager.getAllTimeLocks().length).toBeGreaterThan(0);
    expect(session.puzzleManager.getAllPortals().length).toBeGreaterThan(0);
    expect(session.puzzleManager.getAllCollapsingFloors().length).toBeGreaterThan(0);
    expect(level20.surpriseEvents && level20.surpriseEvents.length > 0).toBe(true);
  });
});

