import { test, expect } from '@playwright/test';

test.describe('Phase 8 — Level 18: The Paradox (Master Campaign)', () => {
  test('executes Level 18 time-lock vault, cross-world bomb detonation, portal shift surprise, and simultaneous exit arrival', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    // Seed save data pointing to Level 18
    await page.addInitScript(() => {
      const saveState = {
        saveVersion: 1,
        unlockedLevel: 18,
        unlockedLevels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
        unlockedChapters: ['THE BEGINNING', 'THE CONNECTION', 'THE SEPARATION', 'THE REFLECTION', 'THE TRUTH'],
        completedLevels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
        currentLevel: 18,
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
    await page.screenshot({ path: 'screenshots/phase8-level18-initial.png' });

    // Step 1: Move right -> Real activates tl-18-real (2, 1), opening vault door (6, 2)
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(400);

    // Step 2: Move left -> Real returns to (1, 1)
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(400);

    // Step 3: Move down -> Shadow enters vault door (6, 2)
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(400);

    // Step 4: Move down -> Shadow hits switch sw-18-shadow (6, 3), unlocking real portal door (1, 2)
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(400);

    // Step 5: Move down -> Shadow enters portal p-18-shadow (6, 4) -> teleports to (3, 4)
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(400);

    // Step 6: Move up -> Shadow steps onto bomb-18-shadow (3, 3), igniting fuse!
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(400);

    // Step 7: Move down -> Shadow retreats to (3, 4) away from blast radius
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(400);

    // Step 8: Move right
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(400);

    // Step 9: Move down -> Bomb detonates! Destroys dw-18-real (5, 4) and triggers se-18-bomb-portal-shift!
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'screenshots/phase8-level18-bomb-explode.png' });

    // Step 10: Move down
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(400);

    // Step 11: Move up
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(400);

    // Step 12: Move right -> Real enters p-18-real (1, 4), which now teleports to (4, 4)!
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'screenshots/phase8-level18-portal-shift.png' });

    // Step 13: Move right -> Real to (5, 4), Shadow to (2, 4)
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(400);

    // Step 14: Move down -> Simultaneous dual exit arrival at (6, 4) and (1, 4)!
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(700);

    // Capture completion screenshot
    await page.screenshot({ path: 'screenshots/phase8-level18-complete.png' });

    // Verify zero fatal JS errors
    const fatalErrors = consoleErrors.filter(
      (e) =>
        !e.includes('favicon') &&
        !e.includes('AudioContext') &&
        !e.includes('play() failed') &&
        !e.includes('NotAllowedError') &&
        !e.includes('404') &&
        !e.includes('Cross-Origin-Opener-Policy'),
    );
    expect(fatalErrors).toEqual([]);
  });
});
