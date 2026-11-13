import { test, expect } from '@playwright/test';

test.describe('Phase 5 — Premium Game UI/UX, Controls and Player Experience', () => {
  test('verifies Main Menu, Gameplay HUD, Pause Modal, Object Guide, and Settings Modal', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto('/');

    const canvas = page.locator('#game-container canvas');
    await expect(canvas).toBeVisible({ timeout: 15000 });

    // Wait for main menu to stabilize
    await page.waitForTimeout(600);

    // 1. Capture Main Menu Screenshot
    await page.screenshot({ path: 'screenshots/phase5-main-menu.png' });

    // Click PLAY button (center at x=640, y=295)
    await canvas.click({ position: { x: 640, y: 295 } });
    await page.waitForTimeout(800);

    // 2. Capture Gameplay HUD & Exit Doors Screenshot
    await page.screenshot({ path: 'screenshots/phase5-gameplay-hud.png' });

    // 3. Open Pause Modal via 'p' key
    await page.keyboard.press('p');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshots/phase5-pause-menu.png' });

    // 4. Open Object Guide via 'g' key
    await page.keyboard.press('g');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshots/phase5-object-guide.png' });

    // Click Next Page button on Object Guide (modal center 640, 360, next button around x=760, y=555)
    await canvas.click({ position: { x: 760, y: 555 } });
    await page.waitForTimeout(400);
    await page.screenshot({ path: 'screenshots/phase5-object-guide-page2.png' });

    // Close Object Guide via 'g' key
    await page.keyboard.press('g');
    await page.waitForTimeout(400);

    // 5. Open Settings Modal from Pause Menu (Settings button at x=640, y=454)
    await canvas.click({ position: { x: 640, y: 454 } });
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshots/phase5-settings-modal.png' });

    // Close Settings Modal (click Close button at x=640, y=520)
    await canvas.click({ position: { x: 640, y: 520 } });
    await page.waitForTimeout(400);

    // Resume Gameplay (press 'p')
    await page.keyboard.press('p');
    await page.waitForTimeout(400);

    // Verify zero fatal JS errors
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
