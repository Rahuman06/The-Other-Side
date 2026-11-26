import { describe, it, expect } from 'vitest';
import { StorageManager } from '../../src/storage/StorageManager';
import { SoundEffects } from '../../src/audio/SoundEffects';
import { ALL_LEVELS } from '../../src/levels/levelsData';

describe('Phase 8 — Final Story Experience & Ending Scene Logic', () => {
  it('aggregates campaign completion statistics for all 20 levels accurately', () => {
    const storage = new StorageManager();
    storage.resetProgress();

    // Mark all 20 levels as completed with mock best moves
    for (const lvl of ALL_LEVELS) {
      storage.recordLevelCompletion(lvl.id, lvl.solutionTrace.length);
    }

    const progress = storage.getProgress();
    expect(progress.completedLevels.length).toBe(20);

    let totalMoves = 0;
    for (const id in progress.bestMoves) {
      totalMoves += progress.bestMoves[id];
    }

    expect(totalMoves).toBeGreaterThan(0);
    expect(progress.completedLevels).toHaveLength(20);
  });

  it('supports sound effects ending theme and outro scene cues without throwing', () => {
    const sound = new SoundEffects(true); // muted for test
    expect(() => sound.play('ending')).not.toThrow();
    expect(() => sound.playEndingTheme()).not.toThrow();
    expect(() => sound.playOutroScene1Quiet()).not.toThrow();
    expect(() => sound.playOutroScene2Look()).not.toThrow();
    expect(() => sound.playOutroScene3Connection()).not.toThrow();
    expect(() => sound.playOutroScene4Reunion()).not.toThrow();
    expect(() => sound.playOutroScene5Unity()).not.toThrow();
    expect(() => sound.playOutroScene6Reveal()).not.toThrow();
    expect(() => sound.stopCinematicCues()).not.toThrow();
  });

  it('supports campaign reset and replay starting from level 1', () => {
    const storage = new StorageManager();
    storage.resetProgress();

    // Initial state
    const p1 = storage.getProgress();
    expect(p1.currentLevel).toBe(1);
    expect(p1.completedLevels).toHaveLength(0);

    // Complete some levels
    storage.recordLevelCompletion(1, 4);
    storage.recordLevelCompletion(2, 6);
    expect(storage.getProgress().completedLevels).toContain(1);
    expect(storage.getProgress().completedLevels).toContain(2);

    // Replay / Reset
    storage.resetProgress();
    const pReset = storage.getProgress();
    expect(pReset.currentLevel).toBe(1);
    expect(pReset.completedLevels).toHaveLength(0);
  });
});
