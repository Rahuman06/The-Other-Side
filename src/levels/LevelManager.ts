import { LevelDefinition } from '../types/level';
import { StorageManager } from '../storage/StorageManager';
import { ALL_LEVELS } from './levelsData';

export class LevelManager {
  private readonly levels: readonly LevelDefinition[];
  private readonly storage: StorageManager;
  private currentLevelIndex: number;
  private devModeUnlockAll = false;

  constructor(customLevels?: readonly LevelDefinition[], storage?: StorageManager) {
    this.storage = storage ?? new StorageManager();
    this.levels = customLevels ?? ALL_LEVELS;

    if (this.levels.length === 0) {
      throw new Error('LevelManager initialized with 0 levels');
    }

    const progress = this.storage.getProgress();
    const targetId = Math.min(progress.unlockedLevel, this.levels.length);
    const foundIdx = this.levels.findIndex((l) => l.id === targetId);
    this.currentLevelIndex = foundIdx >= 0 ? foundIdx : 0;
  }

  public setDevModeUnlockAll(enabled: boolean): void {
    this.devModeUnlockAll = enabled;
  }

  public isDevModeUnlockAll(): boolean {
    return this.devModeUnlockAll;
  }

  public getLevels(): readonly LevelDefinition[] {
    return this.levels;
  }

  public getTotalLevels(): number {
    return this.levels.length;
  }

  public getCurrentLevel(): LevelDefinition {
    return this.levels[this.currentLevelIndex];
  }

  public getCurrentLevelIndex(): number {
    return this.currentLevelIndex;
  }

  /**
   * Never unlocks a level before its predecessor is completed,
   * except through explicitly configured devModeUnlockAll.
   */
  public isLevelUnlocked(levelId: number): boolean {
    if (this.devModeUnlockAll) {
      return true;
    }
    const progress = this.storage.getProgress();
    return levelId <= progress.unlockedLevel;
  }

  public selectLevel(levelId: number): boolean {
    const idx = this.levels.findIndex((l) => l.id === levelId);
    if (idx === -1) {
      return false;
    }
    if (!this.isLevelUnlocked(levelId)) {
      return false;
    }
    this.currentLevelIndex = idx;
    return true;
  }

  public hasNextLevel(): boolean {
    return this.currentLevelIndex < this.levels.length - 1;
  }

  public advanceToNextLevel(): LevelDefinition | null {
    if (this.hasNextLevel()) {
      this.currentLevelIndex++;
      return this.getCurrentLevel();
    }
    return null;
  }

  public completeCurrentLevel(moves: number): void {
    const current = this.getCurrentLevel();
    this.storage.recordLevelCompletion(current.id, moves);
  }

  public getStorage(): StorageManager {
    return this.storage;
  }
}
