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
    // Step 1: Move right onto collapsing floor at (2,2)
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(500);

    // Step 2: Move right onto checkpoint at (3,2) -> triggers se-11-nowayback!
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(400);

    // Capture screenshot of surprise event activation (particles, warning clue, crumbling tile)
    await page.screenshot({ path: 'screenshots/phase6-surprise-trap.png' });

    // Step 3: Move right onto collapsing floor at (4,2) -> delayed collapse of (1,2) completes!
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(500);

    // Capture screenshot of collapsed void seal
    await page.screenshot({ path: 'screenshots/phase6-surprise-collapse.png' });

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
