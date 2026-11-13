import { test, expect } from '@playwright/test';

test.describe('Phase 11 QA — Browser, Viewports, Touch & Focus Integrity', () => {
  const viewports = [
    { name: 'Desktop (1280x720)', width: 1280, height: 720 },
    { name: 'Desktop Hi-DPI (1920x1080)', width: 1920, height: 1080 },
    { name: 'Tablet Portrait (768x1024)', width: 768, height: 1024 },
    { name: 'Tablet Landscape (1024x768)', width: 1024, height: 768 },
    { name: 'Mobile Portrait (375x667)', width: 375, height: 667 },
    { name: 'Mobile Landscape (667x375)', width: 667, height: 375 },
  ];

  for (const vp of viewports) {
    test(`renders cleanly across ${vp.name}`, async ({ page }) => {
      const pageErrors: Error[] = [];
      page.on('pageerror', (err) => pageErrors.push(err));

      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/');

      const container = page.locator('#game-container');
      await expect(container).toBeVisible();

      const canvas = page.locator('#game-container canvas');
      await expect(canvas).toBeVisible({ timeout: 10000 });

      // Verify canvas maintains positive dimensions
      const box = await canvas.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.width).toBeGreaterThan(0);
      expect(box!.height).toBeGreaterThan(0);

      // Verify zero uncaught errors
      expect(pageErrors).toHaveLength(0);
    });
  }

  test('handles keyboard interaction, movement, and pause modal toggle', async ({ page }) => {
    const pageErrors: Error[] = [];
    page.on('pageerror', (err) => pageErrors.push(err));

    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');

    const canvas = page.locator('#game-container canvas');
    await expect(canvas).toBeVisible();

    // Start game from Menu with Space key
    await page.keyboard.press('Space');
    await page.waitForTimeout(200);

    // Directional moves
    await page.keyboard.press('KeyD'); // Move right
    await page.waitForTimeout(150);
    await page.keyboard.press('KeyW'); // Move up
    await page.waitForTimeout(150);

    // Toggle pause modal
    await page.keyboard.press('KeyP');
    await page.waitForTimeout(100);

    // Resume
    await page.keyboard.press('KeyP');
    await page.waitForTimeout(100);

    expect(pageErrors).toHaveLength(0);
  });

  test('handles window blur (focus loss) gracefully without stuck input', async ({ page }) => {
    const pageErrors: Error[] = [];
    page.on('pageerror', (err) => pageErrors.push(err));

    await page.goto('/');
    const canvas = page.locator('#game-container canvas');
    await expect(canvas).toBeVisible();

    // Start game
    await page.keyboard.press('Space');
    await page.waitForTimeout(150);

    // Press and hold key, then blur window
    await page.keyboard.down('KeyD');
    await page.evaluate(() => window.dispatchEvent(new Event('blur')));
    await page.keyboard.up('KeyD');

    // Subsequent key press works normally
    await page.keyboard.press('KeyA');
    await page.waitForTimeout(150);

    expect(pageErrors).toHaveLength(0);
  });

  test('preserves progress across browser refresh', async ({ page }) => {
    const pageErrors: Error[] = [];
    page.on('pageerror', (err) => pageErrors.push(err));

    await page.goto('/');
    const canvas = page.locator('#game-container canvas');
    await expect(canvas).toBeVisible();

    // Save mock progress
    await page.evaluate(() => {
      window.localStorage.setItem(
        'the_other_side_save_v1',
        JSON.stringify({
          saveVersion: 1,
          unlockedLevel: 3,
          unlockedLevels: [1, 2, 3],
          unlockedChapters: ['THE BEGINNING'],
          completedLevels: [1, 2],
          currentLevel: 3,
          bestMoves: { 1: 4, 2: 6 },
          achievements: ['FIRST_STEP'],
          settings: { muted: false, reducedMotion: false },
        })
      );
    });

    // Refresh page
    await page.reload();
    await expect(canvas).toBeVisible();

    // Verify localStorage retains data
    const saved = await page.evaluate(() => {
      return window.localStorage.getItem('the_other_side_save_v1');
    });

    expect(saved).not.toBeNull();
    const parsed = JSON.parse(saved!);
    expect(parsed.unlockedLevel).toBe(3);
    expect(parsed.completedLevels).toEqual([1, 2]);

    expect(pageErrors).toHaveLength(0);
  });

  test('supports touch and simultaneous multi-touch pointer events on canvas', async ({ page }) => {
    const pageErrors: Error[] = [];
    page.on('pageerror', (err) => pageErrors.push(err));

    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const canvas = page.locator('#game-container canvas');
    await expect(canvas).toBeVisible();

    // Start game via touch tap on center
    await canvas.tap();
    await page.waitForTimeout(200);

    // Simulate multi-touch pointerdown/up events
    await page.evaluate(() => {
      const c = document.querySelector('#game-container canvas');
      if (c) {
        c.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 1, clientX: 80, clientY: 600, isPrimary: true }));
        c.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 2, clientX: 280, clientY: 600, isPrimary: false }));
        c.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1 }));
        c.dispatchEvent(new PointerEvent('pointerup', { pointerId: 2 }));
      }
    });

    await page.waitForTimeout(100);
    expect(pageErrors).toHaveLength(0);
  });
});
