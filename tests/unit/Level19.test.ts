import { describe, it, expect } from 'vitest';
import { ALL_LEVELS } from '../../src/levels/levelsData';
import { LevelValidator } from '../../src/solver/LevelValidator';
import { LevelFactory } from '../../src/levels/LevelFactory';
import { Direction } from '../../src/solver/LevelSolver';

export const LEVEL_19_DEF = ALL_LEVELS[18];

describe('Level 19: The Fractured Reality (The Penultimate Challenge)', () => {
  it('validates schema with zero errors', () => {
    const val = LevelValidator.validateSchema(LEVEL_19_DEF);
    expect(val.errors).toEqual([]);
    expect(val.valid).toBe(true);
  });

  it('verifies 12x12 grid dimensions and spatial coordinates', () => {
    expect(LEVEL_19_DEF.width).toBe(12);
    expect(LEVEL_19_DEF.height).toBe(12);
    expect(LEVEL_19_DEF.realStart).toEqual({ x: 1, y: 1 });
    expect(LEVEL_19_DEF.shadowStart).toEqual({ x: 10, y: 1 });
    expect(LEVEL_19_DEF.realExit).toEqual({ x: 10, y: 10 });
    expect(LEVEL_19_DEF.shadowExit).toEqual({ x: 1, y: 10 });
  });

  it('verifies mutual rescue & confinement puzzle objects', () => {
    const session = LevelFactory.build(LEVEL_19_DEF);
    const pm = session.puzzleManager;

    // Rescue gates
    const dSigma = pm.getDoor('d-19-sigma')!;
    const dOmega = pm.getDoor('d-19-omega')!;
    expect(dSigma.isOpen).toBe(false);
    expect(dOmega.isOpen).toBe(false);

    // Switches inside cells
    const swNexR = pm.getSwitch('sw-19-nex-r')!;
    const swNexS = pm.getSwitch('sw-19-nex-s')!;
    expect(swNexR.isActive).toBe(false);
    expect(swNexS.isActive).toBe(false);

    // Rescue switches
    const swRescueR = pm.getSwitch('sw-19-rescue-r')!;
    const swRescueS = pm.getSwitch('sw-19-rescue-s')!;
    expect(swRescueR.isActive).toBe(false);
    expect(swRescueS.isActive).toBe(false);

    // Simultaneous Confinement gates & switches
    const dT3R = pm.getDoor('d-19-t3-r')!;
    const dT3S = pm.getDoor('d-19-t3-s')!;
    expect(dT3R.isOpen).toBe(false);
    expect(dT3S.isOpen).toBe(false);
  });

  it('replays Winning Strategy A (71 moves) to full completion', () => {
    expect(LEVEL_19_DEF.solutionTrace.length).toBeGreaterThanOrEqual(70);
    expect(LEVEL_19_DEF.solutionTrace.length).toBeLessThanOrEqual(85);
    expect(LEVEL_19_DEF.solutionTrace.length).toBe(71);

    const replayRes = LevelValidator.replaySolution(LEVEL_19_DEF, LEVEL_19_DEF.solutionTrace);
    expect(replayRes.success).toBe(true);
    expect(replayRes.completed).toBe(true);
    expect(replayRes.died).toBe(false);
    expect(replayRes.finalPlayerPos.x).toBe(10);
    expect(replayRes.finalPlayerPos.y).toBe(10);
    expect(replayRes.finalShadowPos.x).toBe(1);
    expect(replayRes.finalShadowPos.y).toBe(10);
  });

  it('replays Winning Strategy B (75 moves) to full completion', () => {
    const traceB: Direction[] = [
      "down","down","right","right","up","up","right","right","down","down","right","right","up","up","right","right","down","down","down","down","left","left","left","left","down","left","left","left","left","right","down","down","right","right","right","right","left","left","left","left","up","up","right","up","right","right","right","right","down","right","right","right","right","left","left","left","left","left","down","right","down","down","left","right","up","up","right","right","right","down","down","right","right","right","right"
    ];
    expect(traceB.length).toBeGreaterThanOrEqual(70);
    expect(traceB.length).toBeLessThanOrEqual(85);
    expect(traceB.length).toBe(75);

    const replayRes = LevelValidator.replaySolution(LEVEL_19_DEF, traceB);
    expect(replayRes.success).toBe(true);
    expect(replayRes.completed).toBe(true);
    expect(replayRes.died).toBe(false);
    expect(replayRes.finalPlayerPos.x).toBe(10);
    expect(replayRes.finalPlayerPos.y).toBe(10);
    expect(replayRes.finalShadowPos.x).toBe(1);
    expect(replayRes.finalShadowPos.y).toBe(10);
  });
});
