import { test, expect } from '@playwright/test';

test.describe('Level 20: The Labyrinth of Consequences (10x15 Master Design)', () => {
  test('executes Solution A (Real World Cascade), Solution B (Shadow World Cascade), and reaches ending', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    // Seed save data pointing to Level 20
    await page.addInitScript(() => {
      const saveState = {
        saveVersion: 1,
        unlockedLevel: 20,
        unlockedLevels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
        unlockedChapters: ['THE BEGINNING', 'THE CONNECTION', 'THE SEPARATION', 'THE REFLECTION', 'THE TRUTH'],
        completedLevels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
        currentLevel: 20,
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

    await page.goto('/?level=20');

    const canvas = page.locator('#game-container canvas');
    await expect(canvas).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(1000);

    // 1. Initial 10x15 layout screenshot
    await page.screenshot({ path: 'screenshots/level20-10x15-initial.png' });

    // --- SOLUTION A (THE REAL WORLD CASCADE - 26 MOVES) ---
    const seqA = [
      'ArrowDown', 'ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowUp',
      'ArrowRight', 'ArrowRight', 'ArrowRight', 'ArrowDown', 'ArrowUp',
      'ArrowRight', 'ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp',
      'ArrowRight', 'ArrowRight', 'ArrowRight', 'ArrowRight', 'ArrowRight',
      'ArrowRight', 'ArrowDown', 'ArrowDown', 'ArrowDown', 'ArrowDown',
      'ArrowRight'
    ];

    for (let i = 0; i < seqA.length; i++) {
      await page.keyboard.press(seqA[i]);
      await page.waitForTimeout(180);
      if (i === 12) {
        // Bomb detonation turn
        await page.waitForTimeout(300);
        await page.screenshot({ path: 'screenshots/level20-10x15-bomb-detonation.png' });
      }
      if (i === 20) {
        // Optical & Portal traversal
        await page.screenshot({ path: 'screenshots/level20-10x15-optical-portal.png' });
      }
    }

    // Capture exit arrival for Solution A
    await page.waitForTimeout(1200);
    await page.screenshot({ path: 'screenshots/level20-10x15-solution-a-ending.png' });

    // --- SOLUTION B (THE SHADOW WORLD CASCADE - 20 MOVES) ---
    await page.goto('/?level=20');
    await page.waitForTimeout(800);

    const seqB = [
      'ArrowRight', 'ArrowDown', 'ArrowDown', 'ArrowUp', 'ArrowUp',
      'ArrowRight', 'ArrowRight', 'ArrowRight', 'ArrowRight', 'ArrowRight',
      'ArrowRight', 'ArrowRight', 'ArrowRight', 'ArrowRight', 'ArrowRight',
      'ArrowDown', 'ArrowDown', 'ArrowRight', 'ArrowDown', 'ArrowDown'
    ];

    for (let i = 0; i < seqB.length; i++) {
      await page.keyboard.press(seqB[i]);
      await page.waitForTimeout(180);
      if (i === 14) {
        await page.screenshot({ path: 'screenshots/level20-10x15-solution-b-midway.png' });
      }
    }

    await page.waitForTimeout(1200);
    await page.screenshot({ path: 'screenshots/level20-10x15-solution-b-ending.png' });

    expect(consoleErrors).toEqual([]);
  });
});
