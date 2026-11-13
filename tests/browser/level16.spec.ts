import { test, expect } from '@playwright/test';

test.describe('Phase 8 — Level 16: The Wrong Reflection (Master Campaign)', () => {
  test('executes Level 16 optical deception, cross-world magnetic activation, and simultaneous exit arrival', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    // Seed save data pointing to Level 16
    await page.addInitScript(() => {
      const saveState = {
        saveVersion: 1,
        unlockedLevel: 16,
        unlockedLevels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
        unlockedChapters: ['THE BEGINNING', 'THE CONNECTION', 'THE SEPARATION', 'THE REFLECTION'],
        completedLevels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
        currentLevel: 16,
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

    // Capture initial state: Laser emitter, mirror, receiver, doors, time locks, moving saws
    await page.screenshot({ path: 'screenshots/phase8-level16-initial.png' });

    // Step 1: Move down onto tl-16-real (1,3); Shadow held by wall (6,3). Freezes saw-16-shadow!
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(400);

    // Step 2: Move right to (2,3) [hits sw-16-real -> unlocks door-16-shadow]; Shadow to (5,2)
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(400);

    // Step 3: Move down [Real holds at wall (2,4); Shadow steps on sw-16-shadow (5,3) -> rotates mirror to '\' -> laser hits rx-16-real -> activates magnet-16-shadow in opposite world! Magnet pulls block onto plate-16-shadow -> unlocks door-16-real!]
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'screenshots/phase8-level16-optical-surprise.png' });

    // Step 4: Move up [Real to (2,2); Shadow to (5,2)]
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(400);

    // Step 5: Move right [Real enters open door-16-real (3,2); Shadow enters open door-16-shadow (4,2)]
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(400);

    // Step 6: Move right [Real crosses to (4,2); Shadow crosses to (3,2)]
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(400);

    // Step 7: Move down [Stagger alignment around patrol paths]
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(400);

    // Step 8: Move right [Real to (5,2); Shadow to (2,2)]
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(400);

    // Step 9: Move right [Real to (6,2); Shadow to (1,2)]
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(400);

    // Step 10: Move up [Real reaches Real Exit at (6,2); Shadow reaches Shadow Exit at (1,2) -> VICTORY!]
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(700);

    // Capture completion screenshot
    await page.screenshot({ path: 'screenshots/phase8-level16-complete.png' });

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
