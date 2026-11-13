import { test, expect } from '@playwright/test';

test.describe('Visual Correction — Gameplay Screenshots', () => {
  test('capture gameplay screenshot of Level 6 showing restored stickmen and restored cracked blocks', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });

    // Navigate directly to Level 6 using query parameter
    await page.goto('/?level=6');

    const canvas = page.locator('#game-container canvas');
    await expect(canvas).toBeVisible({ timeout: 15000 });

    // Wait 1.5 seconds for all initial renders and animations to stabilize
    await page.waitForTimeout(1500);

    // Save high-resolution screenshot
    await page.screenshot({ path: 'screenshots/gameplay-level6-restored.png' });
  });

  test('capture gameplay screenshot of Level 1 showing clean pristine starting stickmen', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });

    // Navigate directly to Level 1
    await page.goto('/?level=1');

    const canvas = page.locator('#game-container canvas');
    await expect(canvas).toBeVisible({ timeout: 15000 });

    await page.waitForTimeout(1500);

    await page.screenshot({ path: 'screenshots/gameplay-level1-restored.png' });
  });
});
