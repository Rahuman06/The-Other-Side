import { describe, it, expect } from 'vitest';
import { ALL_LEVELS } from '@/levels/levelsData';
import { LevelFactory } from '@/levels/LevelFactory';
import { LevelManager } from '@/levels/LevelManager';
import { StorageManager } from '@/storage/StorageManager';
import { GridPoint } from '@/grid/GridPosition';

describe('Phase 07 — Level Design and Progression (All 20 Levels)', () => {
  it('contains exactly 20 handcrafted levels across 5 distinct chapters', () => {
    expect(ALL_LEVELS.length).toBe(20);

    const chapters = new Set(ALL_LEVELS.map((l) => l.chapter));
    expect(chapters).toEqual(
      new Set([
        'THE BEGINNING',
        'THE CONNECTION',
        'THE SEPARATION',
        'THE REFLECTION',
        'THE TRUTH',
      ])
    );

    // Each chapter has exactly 4 levels
    for (const ch of chapters) {
      const count = ALL_LEVELS.filter((l) => l.chapter === ch).length;
      expect(count).toBe(4);
    }
  });

  it('validates starting positions, exits, and dimensions for all 20 levels', () => {
    for (const lvl of ALL_LEVELS) {
      expect(lvl.id).toBeGreaterThanOrEqual(1);
      expect(lvl.id).toBeLessThanOrEqual(20);
      expect(lvl.width).toBeGreaterThanOrEqual(5);
      expect(lvl.height).toBeGreaterThanOrEqual(5);
      expect(lvl.name.trim().length).toBeGreaterThan(0);
      expect(lvl.hint.trim().length).toBeGreaterThan(0);
      expect(lvl.solutionTrace.length).toBeGreaterThan(0);

      // Start and exit within bounds
      const rStart = GridPoint.from(lvl.realStart);
      const sStart = GridPoint.from(lvl.shadowStart);
      const rExit = GridPoint.from(lvl.realExit);
      const sExit = GridPoint.from(lvl.shadowExit);

      expect(rStart.isInBounds(lvl.width, lvl.height)).toBe(true);
      expect(sStart.isInBounds(lvl.width, lvl.height)).toBe(true);
      expect(rExit.isInBounds(lvl.width, lvl.height)).toBe(true);
      expect(sExit.isInBounds(lvl.width, lvl.height)).toBe(true);

      // Start positions cannot be inside walls
      const rWalls = new Set(lvl.realWalls.map((w) => GridPoint.from(w).toKey()));
      const sWalls = new Set(lvl.shadowWalls.map((w) => GridPoint.from(w).toKey()));

      expect(rWalls.has(rStart.toKey())).toBe(false);
      expect(sWalls.has(sStart.toKey())).toBe(false);
      expect(rWalls.has(rExit.toKey())).toBe(false);
      expect(sWalls.has(sExit.toKey())).toBe(false);
    }
  });

  describe('Independent Solution Verification for All 20 Levels', () => {
    for (const lvl of ALL_LEVELS) {
      it(`Level ${lvl.id} (${lvl.name}) solves completely via verified solutionTrace`, () => {
        let completed = false;
        let died = false;

        const session = LevelFactory.build(lvl, {
          onLevelComplete: () => {
            completed = true;
          },
          onDeath: () => {
            died = true;
          },
        });

        // Execute every move in the solution trace
        for (const dir of lvl.solutionTrace) {
          const res = session.turnEngine.handleInput(dir);
          expect(res).not.toBeNull();
          session.turnEngine.endAnimation();
        }

        expect(died).toBe(false);
        expect(completed).toBe(true);
        expect(session.turnEngine.state).toBe('COMPLETED');
        expect(session.player.isAtExit()).toBe(true);
        expect(session.shadow.isAtExit()).toBe(true);
      });
    }
  });

  describe('Progression and Strict Unlock Rules', () => {
    it('never unlocks a level before its predecessor is completed (strict progression)', () => {
      const storage = new StorageManager();
      storage.resetProgress();
      const manager = new LevelManager(ALL_LEVELS, storage);

      // Only Level 1 is initially unlocked
      expect(manager.isLevelUnlocked(1)).toBe(true);
      for (let i = 2; i <= 20; i++) {
        expect(manager.isLevelUnlocked(i)).toBe(false);
      }

      // Complete Level 1
      manager.completeCurrentLevel(5);
      expect(manager.isLevelUnlocked(2)).toBe(true);
      expect(manager.isLevelUnlocked(3)).toBe(false);

      // Selecting locked level 5 fails
      const selectLocked = manager.selectLevel(5);
      expect(selectLocked).toBe(false);

      // Selecting unlocked level 2 succeeds
      const selectUnlocked = manager.selectLevel(2);
      expect(selectUnlocked).toBe(true);
      expect(manager.getCurrentLevel().id).toBe(2);
    });

    it('allows unlocking all levels only when devModeUnlockAll is explicitly enabled', () => {
      const storage = new StorageManager();
      storage.resetProgress();
      const manager = new LevelManager(ALL_LEVELS, storage);

      expect(manager.isLevelUnlocked(15)).toBe(false);

      // Enable dev unlock
      manager.setDevModeUnlockAll(true);
      expect(manager.isLevelUnlocked(15)).toBe(true);
      expect(manager.isLevelUnlocked(20)).toBe(true);
      expect(manager.selectLevel(20)).toBe(true);
      expect(manager.getCurrentLevel().id).toBe(20);

      // Disable dev unlock
      manager.setDevModeUnlockAll(false);
      expect(manager.isLevelUnlocked(15)).toBe(false);
    });
  });
});
