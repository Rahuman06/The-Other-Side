import { test, expect } from '@playwright/test';

test.describe('Phase 8 — Level 18: The Paradox (Master Campaign - Hard Mode)', () => {
  test('executes Level 18 22-step puzzle: time-lock vault, dual switches, bomb evacuation, portal shift surprise, saw evasion, and simultaneous exit arrival', async ({ page }) => {
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

    // Step 1: Right -> Real to (2, 1) starts tl-18-real
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(300);

    // Step 2: Left -> Real to (1, 1)
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(300);

    // Step 3: Down -> Shadow enters open vault door (6, 2)
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(300);

    // Step 4: Down -> Shadow activates sw-18-shadow-1 (6, 3), unsealing door-18-real-mid (1, 2)
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(300);

    // Step 5: Down -> Real to (1, 2); Shadow enters portal p-18-shadow (6, 4) -> teleports to (3, 5)
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(300);

    // Step 6: Down -> Real activates sw-18-real-2 (1, 3), unsealing door-18-shadow-bomb (3, 4)
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(300);

    // Step 7: Up -> Shadow enters bomb chamber (3, 4)
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(300);

    // Step 8: Up -> Shadow steps on bomb-18-shadow (3, 3) [ignites 3-turn fuse!]
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(300);

    // Step 9: Down -> Shadow retreats from blast to (3, 4)
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(300);

    // Step 10: Down -> Shadow reaches shelter at (3, 5); Real at (1, 3) hits checkpoint cp-18
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(300);

    // Step 11: Up -> BOMB DETONATES! Pulverizes dw-18-real (5, 4), collapses (1, 1), shifts p-18-real to (4, 4)!
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshots/phase8-level18-bomb-explode.png' });

    // Step 12: Down -> Real approaches portal entry at (1, 3)
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(300);

    // Step 13: Down -> Real enters portal p-18-real (1, 4) -> TELEPORTS TO (4, 4)!
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshots/phase8-level18-portal-shift.png' });

    // Step 14: Up -> Real to (4, 3); Shadow to (3, 4)
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(300);

    // Step 15: Up -> Real to (4, 2); Shadow to (3, 3)
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(300);

    // Step 16: Right -> Real to (5, 2); Shadow to (2, 3)
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(300);

    // Step 17: Right -> Real activates sw-18-real-exit (6, 2) [unlocks door-18-shadow-exit (2, 4)!]; Shadow to (1, 3)
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(300);

    // Step 18: Right -> Real traverses (7, 2) avoiding saw-18-real patrol line; Shadow to (0, 3)
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(300);

    // Step 19: Down -> Real descends to (7, 3); Shadow to (0, 4)
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(300);

    // Step 20: Down -> Real descends to (7, 4); Shadow to (0, 5)
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(300);

    // Step 21: Left -> Real to (6, 4); Shadow to (1, 5)
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(300);

    // Step 22: Up -> Simultaneous dual exit arrival!
    await page.keyboard.press('ArrowUp');
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
