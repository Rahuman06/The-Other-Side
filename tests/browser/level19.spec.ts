import { test, expect } from '@playwright/test';

test.describe('Phase 8 — Level 19: The Last Connection (Master Challenge)', () => {
  test('executes Level 19 5-zone progression: optical timing, time lock vault, dual portals, 3-event chain reaction, saw evasion, and simultaneous exit', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    // Seed save data pointing to Level 19
    await page.addInitScript(() => {
      const saveState = {
        saveVersion: 1,
        unlockedLevel: 19,
        unlockedLevels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
        unlockedChapters: ['THE BEGINNING', 'THE CONNECTION', 'THE SEPARATION', 'THE REFLECTION', 'THE TRUTH'],
        completedLevels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
        currentLevel: 19,
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

    // Capture initial state (Zone A)
    await page.screenshot({ path: 'screenshots/phase8-level19-initial.png' });

    // Step 1: Up -> Real to (1, 0); Shadow to (6, 0)
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(350);

    // Step 2: Left -> Real to (0, 0); Shadow to (6, 0)
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(350);

    // Step 3: Down -> Real steps on tl-19-real (0, 1) [locks open door-19-shadow-vault (6, 2)]
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(400);
    await page.screenshot({ path: 'screenshots/phase8-level19-optical-timing.png' });

    // Step 4: Down -> Real to (0, 2); Shadow enters vault door (6, 2)
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(350);

    // Step 5: Down -> Real to (0, 3); Shadow hits sw-19-shadow-1 (6, 3) [unseals door-19-real-mid (1, 2)]
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(350);

    // Step 6: Right -> Real to (1, 3); Shadow to (5, 3)
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(350);

    // Step 7: Down -> Real enters portal p-19-real (1, 4) -> teleports to (4, 4), TRIGGERING 3-EVENT CHAIN REACTION!
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'screenshots/phase8-level19-chain-reaction.png' });

    // Step 8: Left -> Shadow enters portal p-19-shadow (6, 4) -> teleports to (3, 4) onto pp-19-shadow!; hits cp-19
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(350);

    // Step 9: Up -> Real to (4, 3); Shadow to (3, 3)
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(350);

    // Step 10: Up -> Real to (4, 2) [flanks saw on row 3]; Shadow to (3, 2)
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(350);

    // Step 11: Right -> Real to (5, 2); Shadow to (2, 2)
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(350);

    // Step 12: Right -> Real activates sw-19-real-exit (6, 2) [unseals door-19-shadow-exit (2, 4)!]; Shadow to (1, 2)
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(350);

    // Step 13: Right -> Real to (7, 2); Shadow to (0, 2)
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(350);

    // Step 14: Down -> Real descends to (7, 3); Shadow descends to (0, 3)
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(350);

    // Step 15: Down -> Real descends to (7, 4); Shadow descends to (0, 4)
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(350);

    // Step 16: Left -> Real at Real Exit (6, 4); Shadow at Shadow Exit (1, 4) -> SIMULTANEOUS VICTORY!
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(700);

    // Capture completion screenshot
    await page.screenshot({ path: 'screenshots/phase8-level19-complete.png' });

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
