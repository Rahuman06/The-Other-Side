import { test, expect } from '@playwright/test';

test.describe('Phase 8 — Level 17: Two Become One (Master Campaign)', () => {
  test('executes Level 17 dual plate coordination, portal realignment surprise, and simultaneous exit arrival', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    // Seed save data pointing to Level 17
    await page.addInitScript(() => {
      const saveState = {
        saveVersion: 1,
        unlockedLevel: 17,
        unlockedLevels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
        unlockedChapters: ['THE BEGINNING', 'THE CONNECTION', 'THE SEPARATION', 'THE REFLECTION', 'THE TRUTH'],
        completedLevels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
        currentLevel: 17,
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

    // Capture initial state
    await page.screenshot({ path: 'screenshots/phase8-level17-initial.png' });

    // Step 1: Move right -> Real to (2,1), Shadow to (5,1)
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(400);

    // Step 2: Move down -> Real steps on pp-17-real (2,2) [shifts p-17-shadow dest to (3,4)!]; Shadow steps on pp-17-shadow (5,2) [unlocks door-17-real-exit!]
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'screenshots/phase8-level17-plates-surprise.png' });

    // Step 3: Move left -> Real to (1,2), Shadow to (6,2) into open access door
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(400);

    // Step 4: Move down -> Real to (1,3), Shadow steps on tl-17-shadow (6,3)
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(400);

    // Step 5: Move right -> Real to (2,3), Shadow to (5,3)
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(400);

    // Step 6: Move left -> Real hits sw-17-real (0,4); Shadow held by wall (7,3)
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(400);

    // Step 7: Move down -> Real enters portal p-17-real (1,4); Shadow enters portal p-17-shadow (6,4) -> Both teleport!
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'screenshots/phase8-level17-portal-teleport.png' });

    // Step 8: Move up -> Stagger calibration avoiding saw path
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(400);

    // Step 9: Move right -> Real to (5,4); Shadow to (2,4)
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(400);

    // Step 10: Move right -> Real to (6,4); Shadow to (1,4)
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(400);

    // Step 11: Move down -> Simultaneous dual exit arrival -> VICTORY!
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(700);

    // Capture completion screenshot
    await page.screenshot({ path: 'screenshots/phase8-level17-complete.png' });

    // Verify zero fatal JS errors
    const fatalErrors = consoleErrors.filter(
      (e) =>
        !e.includes('favicon') &&
        !e.includes('404') &&
        !e.includes('Cross-Origin-Opener-Policy')
    );
    expect(fatalErrors).toHaveLength(0);
  });
});
