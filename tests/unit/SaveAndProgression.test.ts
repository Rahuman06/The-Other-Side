import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StorageManager, CURRENT_SAVE_VERSION, ALL_CHAPTER_NAMES } from '@/storage/StorageManager';

describe('Phase 10 — Save and Progression System', () => {
  let mockStorageStore: Record<string, string>;
  let mockStorage: Storage;

  beforeEach(() => {
    mockStorageStore = {};
    mockStorage = {
      getItem: vi.fn((key: string) => mockStorageStore[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        mockStorageStore[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete mockStorageStore[key];
      }),
      clear: vi.fn(() => {
        mockStorageStore = {};
      }),
      key: vi.fn(() => null),
      length: 0,
    };
  });

  it('provides safe default progress for first-time player', () => {
    const storage = new StorageManager(mockStorage);
    const progress = storage.getProgress();

    expect(progress.saveVersion).toBe(CURRENT_SAVE_VERSION);
    expect(progress.unlockedLevel).toBe(1);
    expect(progress.unlockedLevels).toEqual([1]);
    expect(progress.unlockedChapters).toEqual(['THE BEGINNING']);
    expect(progress.completedLevels).toEqual([]);
    expect(progress.currentLevel).toBe(1);
    expect(progress.bestMoves).toEqual({});
    expect(progress.achievements).toEqual([]);
    expect(progress.settings.muted).toBe(false);
    expect(progress.settings.reducedMotion).toBe(false);
  });

  it('loads valid existing save correctly', () => {
    mockStorageStore['the_other_side_save_v1'] = JSON.stringify({
      saveVersion: 1,
      unlockedLevel: 5,
      unlockedLevels: [1, 2, 3, 4, 5],
      unlockedChapters: ['THE BEGINNING', 'THE CONNECTION'],
      completedLevels: [1, 2, 3, 4],
      currentLevel: 5,
      bestMoves: { 1: 4, 2: 6 },
      achievements: ['FIRST_STEP', 'CHAPTER_1_COMPLETE'],
      settings: { muted: true, reducedMotion: true },
    });

    const storage = new StorageManager(mockStorage);
    const progress = storage.getProgress();

    expect(progress.unlockedLevel).toBe(5);
    expect(progress.completedLevels).toEqual([1, 2, 3, 4]);
    expect(progress.unlockedChapters).toContain('THE CONNECTION');
    expect(progress.bestMoves[1]).toBe(4);
    expect(progress.achievements).toContain('CHAPTER_1_COMPLETE');
    expect(progress.settings.muted).toBe(true);
    expect(progress.settings.reducedMotion).toBe(true);
    expect(progress.muted).toBe(true);
  });

  it('handles corrupted JSON without crashing and returns safe defaults', () => {
    mockStorageStore['the_other_side_save_v1'] = '{corrupted_json_syntax_error: true';

    const storage = new StorageManager(mockStorage);
    const progress = storage.getProgress();

    expect(progress.saveVersion).toBe(CURRENT_SAVE_VERSION);
    expect(progress.unlockedLevel).toBe(1);
    expect(progress.completedLevels).toEqual([]);
  });

  it('handles missing save data without crashing', () => {
    delete mockStorageStore['the_other_side_save_v1'];

    const storage = new StorageManager(mockStorage);
    const progress = storage.getProgress();

    expect(progress.unlockedLevel).toBe(1);
    expect(progress.completedLevels).toEqual([]);
  });

  it('operates seamlessly in Incognito mode / blocked storage fallback', () => {
    // Simulate blocked storage throwing SecurityError
    const blockedStorage = {
      getItem: () => {
        throw new Error('SecurityError: The operation is insecure.');
      },
      setItem: () => {
        throw new Error('SecurityError: The operation is insecure.');
      },
      removeItem: () => {
        throw new Error('SecurityError: The operation is insecure.');
      },
      clear: () => {},
      key: () => null,
      length: 0,
    };

    const storage = new StorageManager(blockedStorage as unknown as Storage);
    expect(storage.isStorageAvailable).toBe(false);

    // Save and retrieve in memory
    const updated = storage.saveProgress({ unlockedLevel: 3, completedLevels: [1, 2] });
    expect(updated.unlockedLevel).toBe(3);

    const reloaded = storage.getProgress();
    expect(reloaded.unlockedLevel).toBe(3);
    expect(reloaded.completedLevels).toEqual([1, 2]);
  });

  it('handles QuotaExceededError on setItem gracefully by falling back to memory', () => {
    let callCount = 0;
    const quotaStorage = {
      getItem: (k: string) => mockStorageStore[k] ?? null,
      setItem: (k: string, v: string) => {
        callCount++;
        if (callCount > 1) {
          // Probe succeeds, but later save fails with QuotaExceededError
          const err = new Error('QuotaExceededError');
          err.name = 'QuotaExceededError';
          throw err;
        }
        mockStorageStore[k] = v;
      },
      removeItem: (k: string) => delete mockStorageStore[k],
      clear: () => {},
      key: () => null,
      length: 0,
    };

    const storage = new StorageManager(quotaStorage as unknown as Storage);
    expect(storage.isStorageAvailable).toBe(true);

    // Save should NOT throw
    expect(() => {
      storage.recordLevelCompletion(1, 5);
    }).not.toThrow();

    // Verify progress is still preserved in memory
    const progress = storage.getProgress();
    expect(progress.completedLevels).toContain(1);
    expect(progress.unlockedLevel).toBe(2);
  });

  it('persists progress across browser refresh (simulated re-instantiation)', () => {
    const storage1 = new StorageManager(mockStorage);
    storage1.recordLevelCompletion(1, 4);
    storage1.recordLevelCompletion(2, 6);
    storage1.setMuted(true);

    // Simulate browser refresh by creating a new StorageManager instance reading from the same storage
    const storage2 = new StorageManager(mockStorage);
    const progress = storage2.getProgress();

    expect(progress.completedLevels).toEqual([1, 2]);
    expect(progress.unlockedLevel).toBe(3);
    expect(progress.bestMoves[1]).toBe(4);
    expect(progress.bestMoves[2]).toBe(6);
    expect(progress.settings.muted).toBe(true);
  });

  it('safely handles new game reset with user confirmation', () => {
    const storage = new StorageManager(mockStorage);
    storage.recordLevelCompletion(1, 4);
    storage.recordLevelCompletion(2, 6);

    // Without user confirmation -> rejection & no change
    const denied = storage.startNewGame(false);
    expect(denied).toBe(false);
    expect(storage.getProgress().unlockedLevel).toBe(3);

    // With user confirmation -> reset
    const confirmed = storage.startNewGame(true);
    expect(confirmed).toBe(true);
    expect(storage.getProgress().unlockedLevel).toBe(1);
    expect(storage.getProgress().completedLevels).toEqual([]);
  });

  it('unlocks chapters and awards achievements upon completing chapter milestones', () => {
    const storage = new StorageManager(mockStorage);

    // Complete chapter 1: levels 1, 2, 3, 4
    storage.recordLevelCompletion(1, 4);
    storage.recordLevelCompletion(2, 5);
    storage.recordLevelCompletion(3, 6);
    const res = storage.recordLevelCompletion(4, 6);

    expect(res.unlockedLevel).toBe(5);
    expect(res.unlockedChapters).toContain('THE CONNECTION');
    expect(res.achievements).toContain('FIRST_STEP');
    expect(res.achievements).toContain('CHAPTER_1_COMPLETE');

    // Complete all 20 levels
    for (let i = 5; i <= 20; i++) {
      storage.recordLevelCompletion(i, 8);
    }

    const finalProgress = storage.getProgress();
    expect(finalProgress.completedLevels).toHaveLength(20);
    expect(finalProgress.achievements).toContain('GAME_COMPLETE');
    expect(finalProgress.unlockedChapters).toEqual([...ALL_CHAPTER_NAMES]);
  });

  it('migrates legacy v0 save cleanly to v1', () => {
    // Legacy save with old flat structure and missing version
    const legacySave = {
      unlockedLevel: 5,
      completedLevels: [1, 2, 3, 4],
      bestMoves: { 1: 4 },
      muted: true,
    };

    const storage = new StorageManager(mockStorage);
    const migrated = storage.validateAndMigrate(legacySave);

    expect(migrated.saveVersion).toBe(CURRENT_SAVE_VERSION);
    expect(migrated.unlockedLevels).toEqual([1, 2, 3, 4, 5]);
    expect(migrated.unlockedChapters).toContain('THE CONNECTION');
    expect(migrated.settings.muted).toBe(true);
    expect(migrated.settings.reducedMotion).toBe(false);
  });

  it('avoids unnecessary duplicate storage writes', () => {
    const setItemSpy = vi.spyOn(mockStorage, 'setItem');

    const storage = new StorageManager(mockStorage);
    storage.setMuted(true);
    const writeCountAfterFirstSet = setItemSpy.mock.calls.length;

    // Setting same value again should skip writing
    storage.setMuted(true);
    expect(setItemSpy.mock.calls.length).toBe(writeCountAfterFirstSet);
  });
});
