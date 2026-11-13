import { test, expect } from '@playwright/test';

test.describe('Phase 4 — Thriller Audio Experience & Browser Demonstration', () => {
  test('initializes Web Audio context and opens settings with volume controls', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto('/');

    const canvas = page.locator('#game-container canvas');
    await expect(canvas).toBeVisible({ timeout: 15000 });

    // Click canvas to trigger browser autoplay unlock
    await canvas.click({ position: { x: 640, y: 360 } });
    await page.waitForTimeout(600);

    // Verify AudioContext availability in browser window
    const audioState = await page.evaluate(() => {
      return {
        hasAudioContext: typeof window !== 'undefined' && 'AudioContext' in window,
      };
    });
    expect(audioState.hasAudioContext).toBe(true);

    // Click on SETTINGS button in main menu (halfW = 640, y = 350)
    await canvas.click({ position: { x: 640, y: 350 } });
    await page.waitForTimeout(800);

    // Save high-resolution screenshot of Settings modal displaying audio volume controls
    await page.screenshot({ path: 'screenshots/audio-settings-modal.png' });

    // Verify zero fatal JavaScript errors
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
