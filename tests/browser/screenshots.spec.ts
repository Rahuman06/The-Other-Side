import { test, expect } from '@playwright/test';

test.describe('Phase 12 — Poki Gameplay Screenshots Capture', () => {
  test('capture 3 genuine gameplay screenshots for Poki store listing', async ({ page }) => {
    // 1280x720 canvas viewport (16:9 standard for Poki store assets)
    await page.setViewportSize({ width: 1280, height: 720 });

    // 1. Level 1 - Introduction / The Beginning
    await page.goto('/');
    const canvas = page.locator('#game-container canvas');
    await expect(canvas).toBeVisible({ timeout: 10000 });

    // Press Space or Enter to start Level 1
    await page.keyboard.press('Space');
    await page.waitForTimeout(500);

    // Take Screenshot 1: Dual-World Beginning (Level 1)
    await page.screenshot({ path: 'screenshots/screenshot-1.png' });

    // 2. Navigate to Level 5 (Switches and Doors - Chapter 2: The Connection)
    await page.evaluate(() => {
      // Direct scene transition or localStorage unlocked level
      const save = {
        saveVersion: 1,
        unlockedLevel: 5,
        unlockedLevels: [1, 2, 3, 4, 5],
        unlockedChapters: ['THE BEGINNING', 'THE CONNECTION'],
        completedLevels: [1, 2, 3, 4],
        currentLevel: 5,
        bestMoves: { 1: 4, 2: 6, 3: 6, 4: 6 },
        achievements: [],
        settings: { muted: false, reducedMotion: false },
      };
      localStorage.setItem('the_other_side_save_v1', JSON.stringify(save));
    });

    await page.reload();
    await expect(canvas).toBeVisible({ timeout: 10000 });
    // Continue or Space to enter Level 5
    await page.keyboard.press('Space');
    await page.waitForTimeout(500);

    // Make 1 move right to show interaction with switch/grid
    await page.keyboard.press('KeyD');
    await page.waitForTimeout(300);

    // Take Screenshot 2: Switches and Doors (Level 5)
    await page.screenshot({ path: 'screenshots/screenshot-2.png' });

    // 3. Navigate to Level 11 (Hazards, Checkpoints - Chapter 3: The Separation)
    await page.evaluate(() => {
      const save = {
        saveVersion: 1,
        unlockedLevel: 11,
        unlockedLevels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        unlockedChapters: ['THE BEGINNING', 'THE CONNECTION', 'THE SEPARATION'],
        completedLevels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        currentLevel: 11,
        bestMoves: { 1: 4, 2: 6, 3: 6, 4: 6, 5: 5, 6: 6, 7: 6, 8: 6, 9: 6, 10: 7 },
        achievements: [],
        settings: { muted: false, reducedMotion: false },
      };
      localStorage.setItem('the_other_side_save_v1', JSON.stringify(save));
    });

    await page.reload();
    await expect(canvas).toBeVisible({ timeout: 10000 });
    await page.keyboard.press('Space');
    await page.waitForTimeout(500);

    // Take Screenshot 3: Hazards and Checkpoints (Level 11)
    await page.screenshot({ path: 'screenshots/screenshot-3.png' });
  });
});
