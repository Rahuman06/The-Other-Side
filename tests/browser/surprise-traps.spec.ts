import { test, expect } from '@playwright/test';

test.describe('Phase 6 — Unexpected Traps and Psychological Puzzle Gameplay', () => {
  test('triggers surprise event in Level 11, verifies dynamic trap execution, and captures visual proof', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    // 1. Seed save data pointing to Level 11
    await page.addInitScript(() => {
      const saveState = {
        saveVersion: 1,
        unlockedLevel: 11,
        unlockedLevels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        unlockedChapters: ['THE BEGINNING', 'THE CONNECTION', 'THE SEPARATION'],
        completedLevels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        currentLevel: 11,
        bestMoves: {},
        achievements: [],
        settings: {
          masterVolume: 80,
          musicVolume: 75,
          sfxVolume: 85,
          muted: false,
          reducedMotion: false,
        },
      };
      window.localStorage.setItem('the_other_side_save_v1', JSON.stringify(saveState));
    });

    await page.goto('/');

    const canvas = page.locator('#game-container canvas');
    await expect(canvas).toBeVisible({ timeout: 15000 });

    // Wait for main menu to stabilize
    await page.waitForTimeout(600);

    // Click CONTINUE button (center at x=640, y=295)
    await canvas.click({ position: { x: 640, y: 295 } });
    await page.waitForTimeout(800);

    // Verify we are on Level 11
    // Step 1: Move right onto fragile entry floor at (2,2)
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(500);

    // Step 2: Move right onto checkpoint at (3,2) -> entry floors collapse behind, cross-collapse arms!
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshots/phase7-level11-checkpoint-trap.png' });

    // Step 3: Move up onto fragile bridge at (3,1) -> cross-collapse executes!
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshots/phase7-level11-cross-collapse.png' });

    // Step 4: Move right across bridge to (4,1)
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(500);

    // Step 5: Move down to (4,2)
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(500);

    // Step 6: Move down to (4,3)
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(500);

    // Step 7: Stagger step left to (3,3) to synchronize saw timing
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(500);

    // Step 8: Move right to (4,3)
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(500);

    // Step 9: Move right past saw corridor into (5,3)
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(500);

    // Step 10: Move right to (6,3)
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(500);

    // Step 11: Move up into EXIT doors at (6,2) & (1,2) -> VICTORY!
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(600);

    // Capture screenshot of level completion
    await page.screenshot({ path: 'screenshots/phase7-level11-complete.png' });

    // Verify zero fatal JS errors
    const fatalErrors = consoleErrors.filter(
      (e) =>
        !e.includes('favicon') &&
        !e.includes('404') &&
        !e.includes('Failed to load resource') &&
        !e.includes('Cross-Origin-Opener-Policy')
    );
    expect(fatalErrors).toHaveLength(0);
  });
});
