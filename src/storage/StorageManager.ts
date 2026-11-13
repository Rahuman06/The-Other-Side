export interface GameSettings {
  muted: boolean;
  reducedMotion: boolean;
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
}

export interface GameProgress {
  saveVersion: number;
  unlockedLevel: number; // Current latest level unlocked (1..20)
  unlockedLevels: number[]; // List of all unlocked level IDs
  unlockedChapters: string[]; // List of unlocked chapter names
  completedLevels: number[]; // List of completed level IDs
  currentLevel: number; // Active level pointer (1..20)
  bestMoves: Record<number, number>; // levelId -> fewest moves
  achievements: string[]; // List of awarded achievement keys
  settings: GameSettings;
  muted: boolean; // Flat accessor for backward compatibility
  reducedMotion: boolean; // Flat accessor for backward compatibility
  masterVolume: number; // Flat accessor for backward compatibility
  musicVolume: number; // Flat accessor for backward compatibility
  sfxVolume: number; // Flat accessor for backward compatibility
}

export const CURRENT_SAVE_VERSION = 1;
const STORAGE_KEY = 'the_other_side_save_v1';

export const ALL_CHAPTER_NAMES = [
  'THE BEGINNING',
  'THE CONNECTION',
  'THE SEPARATION',
  'THE REFLECTION',
  'THE TRUTH',
] as const;

export class StorageManager {
  private memoryStore: Map<string, string> = new Map();
  private storageInstance: Storage | null = null;
  private hasLocalStorage: boolean;
  private lastWrittenPayload: string | null = null;

  constructor(customStorage?: Storage) {
    if (customStorage) {
      this.storageInstance = customStorage;
      this.hasLocalStorage = this.checkLocalStorageSupport(customStorage);
    } else if (typeof window !== 'undefined' && window.localStorage) {
      this.storageInstance = window.localStorage;
      this.hasLocalStorage = this.checkLocalStorageSupport(this.storageInstance);
    } else {
      this.storageInstance = null;
      this.hasLocalStorage = false;
    }
  }

  private checkLocalStorageSupport(storage: Storage | null): boolean {
    if (!storage) return false;
    try {
      const testKey = '__the_other_side_probe__';
      storage.setItem(testKey, testKey);
      storage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  public get isStorageAvailable(): boolean {
    return this.hasLocalStorage;
  }

  private getItem(key: string): string | null {
    if (this.hasLocalStorage && this.storageInstance) {
      try {
        return this.storageInstance.getItem(key);
      } catch {
        return this.memoryStore.get(key) ?? null;
      }
    }
    return this.memoryStore.get(key) ?? null;
  }

  private setItem(key: string, value: string): void {
    // Avoid redundant storage writes
    if (value === this.lastWrittenPayload) {
      return;
    }

    if (this.hasLocalStorage && this.storageInstance) {
      try {
        this.storageInstance.setItem(key, value);
        this.lastWrittenPayload = value;
        return;
      } catch (err) {
        // Handle QuotaExceededError or security restrictions gracefully by switching to memory
        console.debug('StorageManager setItem fallback to memory:', err);
        this.hasLocalStorage = false;
      }
    }

    this.memoryStore.set(key, value);
    this.lastWrittenPayload = value;
  }

  public getDefaultProgress(): GameProgress {
    const isSystemReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

    const settings: GameSettings = {
      muted: false,
      reducedMotion: !!isSystemReducedMotion,
      masterVolume: 1.0,
      musicVolume: 0.75,
      sfxVolume: 0.85,
    };

    return {
      saveVersion: CURRENT_SAVE_VERSION,
      unlockedLevel: 1,
      unlockedLevels: [1],
      unlockedChapters: [ALL_CHAPTER_NAMES[0]],
      completedLevels: [],
      currentLevel: 1,
      bestMoves: {},
      achievements: [],
      settings,
      muted: settings.muted,
      reducedMotion: settings.reducedMotion,
      masterVolume: settings.masterVolume,
      musicVolume: settings.musicVolume,
      sfxVolume: settings.sfxVolume,
    };
  }

  /**
   * Validates and cleans any untrusted object, migrating legacy versions if necessary.
   */
  public validateAndMigrate(raw: unknown): GameProgress {
    const defaults = this.getDefaultProgress();

    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      return defaults;
    }

    const obj = raw as Record<string, unknown>;

    // 1. Version Check & Migration
    const version = typeof obj.saveVersion === 'number' ? obj.saveVersion : 0;

    // 2. Unlocked and Completed Levels
    let unlockedLevels: number[] = [];
    if (Array.isArray(obj.unlockedLevels)) {
      unlockedLevels = obj.unlockedLevels
        .filter((id): id is number => typeof id === 'number' && Number.isInteger(id) && id >= 1 && id <= 20);
    }

    let completedLevels: number[] = [];
    if (Array.isArray(obj.completedLevels)) {
      completedLevels = obj.completedLevels
        .filter((id): id is number => typeof id === 'number' && Number.isInteger(id) && id >= 1 && id <= 20);
    }

    // Single unlockedLevel (legacy fallback or primary tracker)
    let unlockedLevel = typeof obj.unlockedLevel === 'number' && obj.unlockedLevel >= 1 && obj.unlockedLevel <= 20
      ? Math.floor(obj.unlockedLevel)
      : 1;

    // Ensure unlockedLevels contains at least 1 and matches unlockedLevel
    if (unlockedLevels.length === 0) {
      unlockedLevels = Array.from({ length: unlockedLevel }, (_, i) => i + 1);
    } else {
      unlockedLevel = Math.max(unlockedLevel, ...unlockedLevels);
      unlockedLevels = Array.from(new Set([1, ...unlockedLevels])).sort((a, b) => a - b);
    }

    // 3. Current Level
    let currentLevel = typeof obj.currentLevel === 'number' && obj.currentLevel >= 1 && obj.currentLevel <= 20
      ? Math.floor(obj.currentLevel)
      : unlockedLevel;
    if (!unlockedLevels.includes(currentLevel)) {
      currentLevel = unlockedLevel;
    }

    // 4. Unlocked Chapters Calculation
    const unlockedChapters: string[] = [ALL_CHAPTER_NAMES[0]];
    for (let chIdx = 1; chIdx < ALL_CHAPTER_NAMES.length; chIdx++) {
      const chapterStartLevel = chIdx * 4 + 1;
      if (unlockedLevel >= chapterStartLevel) {
        unlockedChapters.push(ALL_CHAPTER_NAMES[chIdx]);
      }
    }

    // 5. Best Moves
    const bestMoves: Record<number, number> = {};
    if (obj.bestMoves && typeof obj.bestMoves === 'object' && !Array.isArray(obj.bestMoves)) {
      for (const [k, v] of Object.entries(obj.bestMoves)) {
        const lvl = Number(k);
        if (Number.isInteger(lvl) && lvl >= 1 && lvl <= 20 && typeof v === 'number' && v > 0) {
          bestMoves[lvl] = Math.floor(v);
        }
      }
    }

    // 6. Achievements
    let achievements: string[] = [];
    if (Array.isArray(obj.achievements)) {
      achievements = obj.achievements.filter((a): a is string => typeof a === 'string' && a.trim().length > 0);
    }

    // 7. Settings
    let muted = defaults.settings.muted;
    let reducedMotion = defaults.settings.reducedMotion;
    let masterVolume = defaults.settings.masterVolume;
    let musicVolume = defaults.settings.musicVolume;
    let sfxVolume = defaults.settings.sfxVolume;

    if (obj.settings && typeof obj.settings === 'object') {
      const s = obj.settings as Record<string, unknown>;
      if (typeof s.muted === 'boolean') muted = s.muted;
      if (typeof s.reducedMotion === 'boolean') reducedMotion = s.reducedMotion;
      if (typeof s.masterVolume === 'number' && !isNaN(s.masterVolume)) {
        masterVolume = Math.max(0, Math.min(1, s.masterVolume));
      }
      if (typeof s.musicVolume === 'number' && !isNaN(s.musicVolume)) {
        musicVolume = Math.max(0, Math.min(1, s.musicVolume));
      }
      if (typeof s.sfxVolume === 'number' && !isNaN(s.sfxVolume)) {
        sfxVolume = Math.max(0, Math.min(1, s.sfxVolume));
      }
    } else {
      // Legacy flat properties
      if (typeof obj.muted === 'boolean') muted = obj.muted;
      if (typeof obj.reducedMotion === 'boolean') reducedMotion = obj.reducedMotion;
      if (typeof obj.masterVolume === 'number' && !isNaN(obj.masterVolume)) {
        masterVolume = Math.max(0, Math.min(1, obj.masterVolume));
      }
      if (typeof obj.musicVolume === 'number' && !isNaN(obj.musicVolume)) {
        musicVolume = Math.max(0, Math.min(1, obj.musicVolume));
      }
      if (typeof obj.sfxVolume === 'number' && !isNaN(obj.sfxVolume)) {
        sfxVolume = Math.max(0, Math.min(1, obj.sfxVolume));
      }
    }

    const settings: GameSettings = {
      muted,
      reducedMotion,
      masterVolume,
      musicVolume,
      sfxVolume,
    };

    return {
      saveVersion: Math.max(CURRENT_SAVE_VERSION, version),
      unlockedLevel,
      unlockedLevels,
      unlockedChapters,
      completedLevels: Array.from(new Set(completedLevels)).sort((a, b) => a - b),
      currentLevel,
      bestMoves,
      achievements: Array.from(new Set(achievements)),
      settings,
      muted: settings.muted,
      reducedMotion: settings.reducedMotion,
      masterVolume: settings.masterVolume,
      musicVolume: settings.musicVolume,
      sfxVolume: settings.sfxVolume,
    };
  }

  public getProgress(): GameProgress {
    const raw = this.getItem(STORAGE_KEY);
    if (!raw) {
      return this.getDefaultProgress();
    }

    try {
      const parsed = JSON.parse(raw);
      return this.validateAndMigrate(parsed);
    } catch (err) {
      console.debug('StorageManager failed to parse JSON, using safe defaults:', err);
      return this.getDefaultProgress();
    }
  }

  public saveProgress(partial: Partial<GameProgress>): GameProgress {
    const current = this.getProgress();

    const mergedSettings: GameSettings = {
      muted: partial.settings?.muted ?? partial.muted ?? current.settings.muted,
      reducedMotion: partial.settings?.reducedMotion ?? partial.reducedMotion ?? current.settings.reducedMotion,
      masterVolume: partial.settings?.masterVolume ?? partial.masterVolume ?? current.settings.masterVolume,
      musicVolume: partial.settings?.musicVolume ?? partial.musicVolume ?? current.settings.musicVolume,
      sfxVolume: partial.settings?.sfxVolume ?? partial.sfxVolume ?? current.settings.sfxVolume,
    };

    const newUnlockedLevel = partial.unlockedLevel !== undefined
      ? Math.max(current.unlockedLevel, partial.unlockedLevel)
      : current.unlockedLevel;

    const newUnlockedLevels = Array.from(
      new Set([...current.unlockedLevels, ...(partial.unlockedLevels ?? []), newUnlockedLevel])
    ).sort((a, b) => a - b);

    const newCompleted = Array.from(
      new Set([...current.completedLevels, ...(partial.completedLevels ?? [])])
    ).sort((a, b) => a - b);

    // Compute unlocked chapters
    const unlockedChapters: string[] = [ALL_CHAPTER_NAMES[0]];
    for (let chIdx = 1; chIdx < ALL_CHAPTER_NAMES.length; chIdx++) {
      const chapterStartLevel = chIdx * 4 + 1;
      if (newUnlockedLevel >= chapterStartLevel) {
        unlockedChapters.push(ALL_CHAPTER_NAMES[chIdx]);
      }
    }

    const updated: GameProgress = {
      saveVersion: CURRENT_SAVE_VERSION,
      unlockedLevel: newUnlockedLevel,
      unlockedLevels: newUnlockedLevels,
      unlockedChapters,
      completedLevels: newCompleted,
      currentLevel: partial.currentLevel ?? (partial.unlockedLevel ?? current.currentLevel),
      bestMoves: { ...current.bestMoves, ...(partial.bestMoves ?? {}) },
      achievements: Array.from(new Set([...current.achievements, ...(partial.achievements ?? [])])),
      settings: mergedSettings,
      muted: mergedSettings.muted,
      reducedMotion: mergedSettings.reducedMotion,
      masterVolume: mergedSettings.masterVolume,
      musicVolume: mergedSettings.musicVolume,
      sfxVolume: mergedSettings.sfxVolume,
    };

    const payload = JSON.stringify(updated);
    this.setItem(STORAGE_KEY, payload);
    return updated;
  }

  /**
   * Records atomic completion of a level and calculates unlocked achievements.
   */
  public recordLevelCompletion(levelId: number, moves: number): GameProgress {
    const current = this.getProgress();
    const currentBest = current.bestMoves[levelId];
    const newBestMoves = { ...current.bestMoves };

    if (currentBest === undefined || moves < currentBest) {
      newBestMoves[levelId] = moves;
    }

    const nextLevel = Math.min(20, levelId + 1);
    const newUnlocked = Math.max(current.unlockedLevel, nextLevel);
    const completedSet = new Set(current.completedLevels);
    completedSet.add(levelId);

    // Achievement evaluation
    const newAchievements = new Set(current.achievements);
    newAchievements.add('FIRST_STEP');

    if ([1, 2, 3, 4].every((id) => completedSet.has(id))) {
      newAchievements.add('CHAPTER_1_COMPLETE');
    }
    if ([5, 6, 7, 8].every((id) => completedSet.has(id))) {
      newAchievements.add('CHAPTER_2_COMPLETE');
    }
    if ([9, 10, 11, 12].every((id) => completedSet.has(id))) {
      newAchievements.add('CHAPTER_3_COMPLETE');
    }
    if ([13, 14, 15, 16].every((id) => completedSet.has(id))) {
      newAchievements.add('CHAPTER_4_COMPLETE');
    }
    if (completedSet.size === 20) {
      newAchievements.add('GAME_COMPLETE');
    }

    return this.saveProgress({
      unlockedLevel: newUnlocked,
      currentLevel: nextLevel,
      completedLevels: Array.from(completedSet),
      bestMoves: newBestMoves,
      achievements: Array.from(newAchievements),
    });
  }

  public setMuted(muted: boolean): void {
    this.saveProgress({ muted });
  }

  public setMasterVolume(masterVolume: number): void {
    const clamped = Math.max(0, Math.min(1, masterVolume));
    this.saveProgress({ masterVolume: clamped });
  }

  public setMusicVolume(musicVolume: number): void {
    const clamped = Math.max(0, Math.min(1, musicVolume));
    this.saveProgress({ musicVolume: clamped });
  }

  public setSfxVolume(sfxVolume: number): void {
    const clamped = Math.max(0, Math.min(1, sfxVolume));
    this.saveProgress({ sfxVolume: clamped });
  }

  public setReducedMotion(reducedMotion: boolean): void {
    this.saveProgress({ reducedMotion });
  }

  public setCurrentLevel(currentLevel: number): void {
    if (currentLevel >= 1 && currentLevel <= 20) {
      this.saveProgress({ currentLevel });
    }
  }

  public startNewGame(userConfirmed: boolean): boolean {
    if (!userConfirmed) {
      return false; // Progression preserved without confirmation
    }
    this.resetProgress();
    return true;
  }

  public resetProgress(): GameProgress {
    const blank = this.getDefaultProgress();
    const payload = JSON.stringify(blank);
    this.setItem(STORAGE_KEY, payload);
    return blank;
  }
}
