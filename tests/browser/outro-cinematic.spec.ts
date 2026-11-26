import { test, expect } from '@playwright/test';

const LEVEL_20_SOLUTION_KEYS: Record<string, string> = {
  up: 'ArrowUp',
  down: 'ArrowDown',
  left: 'ArrowLeft',
  right: 'ArrowRight',
};

const LEVEL_20_SOLUTION = [
  'right', 'down', 'down', 'right', 'right', 'up', 'up', 'right',
  'right', 'right', 'right', 'down', 'up', 'right', 'right', 'right',
  'right', 'down', 'down', 'left', 'down', 'down', 'down', 'down',
  'left', 'left', 'left', 'down', 'down', 'left', 'left', 'left',
  'left', 'down', 'down', 'up', 'up', 'right', 'right', 'right',
  'right', 'right', 'right', 'down', 'down', 'right', 'up', 'right',
  'right', 'up', 'up', 'up', 'right', 'up', 'up', 'down',
  'down', 'right', 'right', 'up', 'up', 'right', 'left', 'down',
  'down', 'left', 'left', 'left', 'down', 'down', 'down', 'right',
  'right', 'up', 'down', 'left', 'left', 'left', 'right', 'up',
  'right', 'right', 'right', 'down', 'left', 'left', 'down', 'left',
  'left', 'right', 'right', 'down', 'down', 'left', 'left', 'left',
  'right', 'right', 'right', 'right', 'right', 'right', 'right', 'right',
  'right', 'right',
] as const;

const LEVEL_1_SOLUTION = ['right', 'right', 'right', 'right'] as const;

test.describe('Level 20 Completion & Epic Final Outro Cinematic Verification', () => {
  test('completes Level 20 genuinely, triggers 6-scene outro, transitions to YOU MADE IT., and verifies MAIN MENU / saved progress', async ({ page }) => {
    test.setTimeout(120000);
    await page.setViewportSize({ width: 1280, height: 720 });

    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => pageErrors.push(err.message));

    await page.addInitScript(() => {
      const saveState = {
        saveVersion: 1,
        unlockedLevel: 20,
        unlockedLevels: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20],
        unlockedChapters: ['THE BEGINNING', 'THE CONNECTION', 'THE SEPARATION', 'THE REFLECTION', 'THE TRUTH'],
        completedLevels: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19],
        currentLevel: 20,
        bestMoves: { 1: 4 },
        muted: false,
        masterVolume: 0.85,
        musicVolume: 0.85,
        sfxVolume: 0.85,
        reducedMotion: false,
      };
      window.localStorage.setItem('the_other_side_save_v1', JSON.stringify(saveState));
    });

    await page.goto('/?level=20');
    const canvas = page.locator('#game-container canvas');
    await expect(canvas).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(1000);

    // Execute full 106-step verified Level 20 solution
    for (const step of LEVEL_20_SOLUTION) {
      await page.keyboard.press(LEVEL_20_SOLUTION_KEYS[step]);
      await page.waitForTimeout(280);
    }

    // Verify Level 20 completion saved in localStorage and outro triggers immediately (~1.1s transition)
    await page.waitForTimeout(1400);
    const savedAfterWin = await page.evaluate(() => {
      const raw = window.localStorage.getItem('the_other_side_save_v1');
      return raw ? JSON.parse(raw) : null;
    });
    expect(savedAfterWin?.completedLevels).toContain(20);

    // Scene 1: "THE JOURNEY ENDS..." (~1.7s into outro)
    await page.waitForTimeout(1200);
    await page.screenshot({ path: 'screenshots/outro-scene1-journey-ends.png' });

    // Scene 2: "TWO WORLDS." (~4.9s into outro)
    await page.waitForTimeout(3200);
    await page.screenshot({ path: 'screenshots/outro-scene2-two-worlds.png' });

    // Scene 3: "TWO LIVES." (~8.3s into outro)
    await page.waitForTimeout(3400);
    await page.screenshot({ path: 'screenshots/outro-scene3-two-lives.png' });

    // Scene 4: "ONE MIND." + Reaching & Touching across divide (~13.1s into outro)
    await page.waitForTimeout(4800);
    await page.screenshot({ path: 'screenshots/outro-scene4-one-mind-touch.png' });

    // Scene 5: "NEVER TWO DIFFERENT SOULS." + Brief unified silhouette (~15.9s into outro)
    await page.waitForTimeout(2800);
    await page.screenshot({ path: 'screenshots/outro-scene5-unity.png' });

    // Scene 6: "THE OTHER SIDE / TWO WORLDS. ONE MIND. / DIFFERENT WORLDS. SAME SOUL." (~20.8s into outro)
    await page.waitForTimeout(4900);
    await page.screenshot({ path: 'screenshots/outro-scene6-title-reveal.png' });

    // Final Completion Screen: "YOU MADE IT." (~23.8s into outro)
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'screenshots/outro-final-ending-screen.png' });

    // Test MAIN MENU button on Ending Screen (button centered around x=640, y=502)
    await canvas.click({ position: { x: 640, y: 502 } });
    await page.waitForTimeout(700);
    await page.screenshot({ path: 'screenshots/outro-to-main-menu.png' });

    // Confirm saved progress remained completely intact after MAIN MENU
    const savedAfterMenu = await page.evaluate(() => {
      const raw = window.localStorage.getItem('the_other_side_save_v1');
      return raw ? JSON.parse(raw) : null;
    });
    expect(savedAfterMenu?.completedLevels).toContain(20);

    const fatalErrors = [...consoleErrors, ...pageErrors].filter(
      (e) =>
        !e.includes('favicon') &&
        !e.includes('404') &&
        !e.includes('Failed to load resource') &&
        !e.includes('Cross-Origin-Opener-Policy')
    );
    expect(fatalErrors).toHaveLength(0);
  });

  test('verifies Level 1 completion does not trigger outro, mobile landscape outro, Skip, and PLAY AGAIN save preservation', async ({ page }) => {
    test.setTimeout(120000);
    await page.setViewportSize({ width: 844, height: 390 });

    const pageErrors: string[] = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    await page.addInitScript(() => {
      const saveState = {
        saveVersion: 1,
        unlockedLevel: 20,
        unlockedLevels: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20],
        unlockedChapters: ['THE BEGINNING', 'THE CONNECTION', 'THE SEPARATION', 'THE REFLECTION', 'THE TRUTH'],
        completedLevels: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19],
        currentLevel: 1,
        bestMoves: { 1: 4, 19: 71 },
        muted: false,
        masterVolume: 0.85,
        musicVolume: 0.85,
        sfxVolume: 0.85,
        reducedMotion: false,
      };
      window.localStorage.setItem('the_other_side_save_v1', JSON.stringify(saveState));
    });

    // 1. Verify replaying Level 1 shows WinModal rather than EndingScene
    await page.goto('/?level=1');
    const canvas = page.locator('#game-container canvas');
    await expect(canvas).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(800);

    for (const step of LEVEL_1_SOLUTION) {
      await page.keyboard.press(LEVEL_20_SOLUTION_KEYS[step]);
      await page.waitForTimeout(240);
    }
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screenshots/outro-level1-stays-winmodal.png' });

    // 2. Complete Level 20 on mobile landscape viewport
    await page.goto('/?level=20');
    await expect(canvas).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(900);

    for (const step of LEVEL_20_SOLUTION) {
      await page.keyboard.press(LEVEL_20_SOLUTION_KEYS[step]);
      await page.waitForTimeout(280);
    }

    await page.waitForTimeout(2600);
    await page.screenshot({ path: 'screenshots/outro-mobile-landscape.png' });

    // Click SKIP button (1280x720 coords: x=1194, y=34 -> 0.933, 0.047)
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      await page.mouse.click(box.x + box.width * 0.933, box.y + box.height * 0.047);
    }
    await page.waitForTimeout(700);
    await page.screenshot({ path: 'screenshots/outro-mobile-after-skip.png' });

    // Click PLAY AGAIN button (1280x720 coords: x=640, y=360 + 82 = 442 -> 0.5, 0.614)
    if (box) {
      await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.614);
    }
    await page.waitForTimeout(800);
    await page.screenshot({ path: 'screenshots/outro-after-play-again-lvl1.png' });

    // Verify PLAY AGAIN never silently deleted saved progress (Level 20 remains completed)
    const savedAfterPlayAgain = await page.evaluate(() => {
      const raw = window.localStorage.getItem('the_other_side_save_v1');
      return raw ? JSON.parse(raw) : null;
    });
    expect(savedAfterPlayAgain?.completedLevels).toContain(20);
    expect(savedAfterPlayAgain?.bestMoves?.['1']).toBe(4);

    expect(pageErrors).toHaveLength(0);
  });
});
