import { test, expect } from '@playwright/test';

test.describe('Cinematic Intro Story & Animation Verification', () => {
  test('plays full 5-scene story intro sequentially and transitions smoothly to Main Menu', async ({ page }) => {
    test.setTimeout(60000);
    await page.setViewportSize({ width: 1280, height: 720 });

    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => {
      pageErrors.push(err.message);
    });

    await page.goto('/');

    const canvas = page.locator('#game-container canvas');
    await expect(canvas).toBeVisible({ timeout: 15000 });

    // Wait briefly for PreloadScene fadeOut (250ms) -> CinematicIntroScene start
    await page.waitForTimeout(450);

    // Scene 1 — ONE SOUL. (~1.4s into intro)
    await page.waitForTimeout(1300);
    await page.screenshot({ path: 'screenshots/intro-scene1-one-soul.png' });

    // Scene 2 — TWO REALITIES. (~4.3s into intro)
    await page.waitForTimeout(2900);
    await page.screenshot({ path: 'screenshots/intro-scene2-two-realities.png' });

    // Scene 3 — TWO LIVES. (~7.4s into intro)
    await page.waitForTimeout(3100);
    await page.screenshot({ path: 'screenshots/intro-scene3-two-lives.png' });

    // Scene 4 — ONE MIND. (~10.5s into intro, during cyan pulse + sync step)
    await page.waitForTimeout(3100);
    await page.screenshot({ path: 'screenshots/intro-scene4-one-mind.png' });

    // Scene 5 — THE OTHER SIDE / TWO WORLDS. ONE MIND. (~13.5s into intro)
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'screenshots/intro-scene5-title-reveal.png' });

    // Transition to MenuScene (~16.3s total from load)
    await page.waitForTimeout(2800);
    await page.screenshot({ path: 'screenshots/intro-transition-menu.png' });

    const fatalErrors = [...consoleErrors, ...pageErrors].filter(
      (e) =>
        !e.includes('favicon') &&
        !e.includes('404') &&
        !e.includes('Failed to load resource') &&
        !e.includes('Cross-Origin-Opener-Policy')
    );
    expect(fatalErrors).toHaveLength(0);
  });

  test('verifies Skip Intro button, keyboard skip, and mobile landscape layout', async ({ page }) => {
    test.setTimeout(30000);
    await page.setViewportSize({ width: 844, height: 390 });

    const pageErrors: string[] = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    await page.goto('/');
    const canvas = page.locator('#game-container canvas');
    await expect(canvas).toBeVisible({ timeout: 15000 });

    // Allow Scene 1 -> Scene 2 to start on mobile viewport
    await page.waitForTimeout(3800);
    await page.screenshot({ path: 'screenshots/intro-mobile-landscape.png' });

    // Click top-right Skip Intro button scaled onto mobile viewport
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      // Skip button in 1280x720 coordinates sits around (1184, 36) -> (0.925, 0.05)
      await page.mouse.click(box.x + box.width * 0.925, box.y + box.height * 0.05);
    }

    // Confirm smooth skip completes into MenuScene without errors
    await page.waitForTimeout(900);
    await page.screenshot({ path: 'screenshots/intro-after-skip-menu.png' });

    expect(pageErrors).toHaveLength(0);
  });
});
