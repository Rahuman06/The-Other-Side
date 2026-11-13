import { describe, it, expect } from 'vitest';
import { StorageManager } from '@/storage/StorageManager';
import { ANIMATION, PALETTE } from '@/core/constants';

describe('Phase 09 — UI, UX and Settings Management', () => {
  it('manages sound muted toggle and persistence', () => {
    const storage = new StorageManager();
    storage.resetProgress();

    expect(storage.getProgress().muted).toBe(false);
    storage.setMuted(true);
    expect(storage.getProgress().muted).toBe(true);
    storage.setMuted(false);
    expect(storage.getProgress().muted).toBe(false);
  });

  it('manages reduced motion toggle and persistence', () => {
    const storage = new StorageManager();
    storage.resetProgress();

    expect(storage.getProgress().reducedMotion).toBe(false);
    storage.setReducedMotion(true);
    expect(storage.getProgress().reducedMotion).toBe(true);
    storage.setReducedMotion(false);
    expect(storage.getProgress().reducedMotion).toBe(false);
  });

  it('safely handles user-confirmed new game reset while preserving data on cancellation', () => {
    const storage = new StorageManager();
    storage.saveProgress({ unlockedLevel: 10, completedLevels: [1, 2, 3] });

    // Cancelled reset -> no changes
    const cancelled = storage.startNewGame(false);
    expect(cancelled).toBe(false);
    expect(storage.getProgress().unlockedLevel).toBe(10);
    expect(storage.getProgress().completedLevels).toEqual([1, 2, 3]);

    // Confirmed reset -> resets
    const confirmed = storage.startNewGame(true);
    expect(confirmed).toBe(true);
    expect(storage.getProgress().unlockedLevel).toBe(1);
    expect(storage.getProgress().completedLevels).toEqual([]);
  });

  it('records best moves per level accurately', () => {
    const storage = new StorageManager();
    storage.resetProgress();

    storage.recordLevelCompletion(1, 10);
    expect(storage.getProgress().bestMoves[1]).toBe(10);

    // Worse score doesn't overwrite best
    storage.recordLevelCompletion(1, 15);
    expect(storage.getProgress().bestMoves[1]).toBe(10);

    // Better score updates best
    storage.recordLevelCompletion(1, 8);
    expect(storage.getProgress().bestMoves[1]).toBe(8);
  });

  it('provides all configurable animation durations', () => {
    expect(ANIMATION.MOVE_DURATION).toBe(120);
    expect(ANIMATION.DOOR_DURATION).toBe(150);
    expect(ANIMATION.CHECKPOINT_DURATION).toBe(200);
    expect(ANIMATION.SCREEN_FADE_DURATION).toBe(200);
    expect(ANIMATION.EASE).toBe('Quad.easeOut');
  });

  it('maintains strict monochromatic palette tokens without color contamination', () => {
    expect(PALETTE.real.backgroundHex).toBe('#FFFFFF');
    expect(PALETTE.real.characterHex).toBe('#080808');
    expect(PALETTE.real.wallsHex).toBe('#171717');
    expect(PALETTE.real.floorHex).toBe('#F2F2F2');

    expect(PALETTE.shadow.backgroundHex).toBe('#101010');
    expect(PALETTE.shadow.characterHex).toBe('#FFFFFF');
    expect(PALETTE.shadow.wallsHex).toBe('#F2F2F2');
    expect(PALETTE.shadow.floorHex).toBe('#171717');
  });
});
