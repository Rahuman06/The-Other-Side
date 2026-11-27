import { test, expect } from '@playwright/test';

const TARGET_VIEWPORTS = [
  { name: 'poki-640x360', width: 640, height: 360 },
  { name: 'poki-836x470', width: 836, height: 470 },
  { name: 'poki-1031x580', width: 1031, height: 580 },
  { name: 'mobile-portrait-360x640', width: 360, height: 640 },
  { name: 'mobile-portrait-390x844', width: 390, height: 844 },
  { name: 'mobile-portrait-412x915', width: 412, height: 915 },
  { name: 'mobile-landscape-667x375', width: 667, height: 375 },
  { name: 'mobile-landscape-844x390', width: 844, height: 390 },
  { name: 'mobile-landscape-915x412', width: 915, height: 412 },
  { name: 'tablet-portrait-768x1024', width: 768, height: 1024 },
  { name: 'tablet-landscape-1024x768', width: 1024, height: 768 },
  { name: 'desktop-1280x720', width: 1280, height: 720 },
  { name: 'desktop-1920x1080', width: 1920, height: 1080 },
];

type PhaserDebugGame = {
  scene: {
    getScene: (key: string) => Record<string, unknown> | undefined;
    isActive: (key: string) => boolean;
  };
};

test.describe('Release QA — Poki, Viewports, Modals, Sliders, Incognito & Controls', () => {
  test('validates all 13 target viewports maintain 16:9 canvas framing and zero overflow/errors', async ({ page }) => {
    const fatalErrors: string[] = [];
    page.on('pageerror', (err) => fatalErrors.push(err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') fatalErrors.push(msg.text());
    });

    await page.goto('/?level=1');
    await page.waitForSelector('#game-container canvas', { state: 'visible', timeout: 15000 });
    await page.waitForTimeout(600);

    for (const vp of TARGET_VIEWPORTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.waitForTimeout(220);

      const metrics = await page.evaluate(() => {
        const canvas = document.querySelector('#game-container canvas') as HTMLCanvasElement | null;
        const backdrop = document.getElementById('backdrop-canvas') as HTMLCanvasElement | null;
        if (!canvas || !backdrop) return null;
        const rect = canvas.getBoundingClientRect();
        return {
          docOverflowX: document.documentElement.scrollWidth > window.innerWidth,
          docOverflowY: document.documentElement.scrollHeight > window.innerHeight,
          canvasW: rect.width,
          canvasH: rect.height,
          aspect: rect.width / Math.max(1, rect.height),
          backdropW: backdrop.getBoundingClientRect().width,
          backdropH: backdrop.getBoundingClientRect().height,
        };
      });

      expect(metrics, `Missing canvas metrics on ${vp.name}`).not.toBeNull();
      expect(metrics!.docOverflowX, `Horizontal overflow on ${vp.name}`).toBe(false);
      expect(metrics!.docOverflowY, `Vertical overflow on ${vp.name}`).toBe(false);
      expect(metrics!.canvasW).toBeGreaterThan(200);
      expect(metrics!.canvasH).toBeGreaterThan(100);
      expect(Math.abs(metrics!.aspect - 16 / 9)).toBeLessThan(0.08);
      expect(metrics!.backdropW).toBeGreaterThanOrEqual(vp.width - 2);
      expect(metrics!.backdropH).toBeGreaterThanOrEqual(vp.height - 2);
    }

    const filteredErrors = fatalErrors.filter(
      (e) => !e.includes('favicon') && !e.includes('poki-sdk.js')
    );
    expect(filteredErrors).toHaveLength(0);
  });

  test('verifies incognito blocked localStorage works cleanly and shows restricted-storage notice', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', {
        configurable: true,
        get() {
          throw new DOMException('Blocked in private browsing', 'SecurityError');
        },
      });
    });

    const pageErrors: string[] = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await page.waitForSelector('#game-container canvas', { state: 'visible', timeout: 15000 });
    await page.waitForFunction(() => {
      const g = (window as unknown as { __PHASER_GAME__?: PhaserDebugGame }).__PHASER_GAME__;
      return Boolean(g?.scene.isActive('CinematicIntroScene') || g?.scene.isActive('MenuScene'));
    });

    // Skip intro cleanly to arrive at Main Menu
    await page.keyboard.press('Space');
    await page.waitForFunction(() => {
      const g = (window as unknown as { __PHASER_GAME__?: PhaserDebugGame }).__PHASER_GAME__;
      return Boolean(g?.scene.isActive('MenuScene'));
    });
    await page.waitForTimeout(350);

    const noticeFound = await page.evaluate(() => {
      const game = (window as unknown as { __PHASER_GAME__?: PhaserDebugGame }).__PHASER_GAME__;
      const menu = game?.scene.getScene('MenuScene') as
        | { storage?: { isStorageAvailable: boolean }; mainMenuContainer?: { list: Array<{ text?: string }> } }
        | undefined;
      if (!menu) return { isAvailable: true, hasNotice: false };
      const hasNotice = Boolean(
        menu.mainMenuContainer?.list.some(
          (obj) => typeof obj.text === 'string' && obj.text.includes('STORAGE RESTRICTED')
        )
      );
      return {
        isAvailable: menu.storage?.isStorageAvailable ?? true,
        hasNotice,
      };
    });

    expect(noticeFound.isAvailable).toBe(false);
    expect(noticeFound.hasNotice).toBe(true);
    expect(pageErrors).toHaveLength(0);
    await page.screenshot({ path: 'screenshots/release-incognito-menu.png' });
  });

  test('verifies unified Settings sliders, ObjectGuide zero-leak tabs, and strict modal isolation', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await page.waitForSelector('#game-container canvas', { state: 'visible', timeout: 15000 });
    await page.waitForFunction(() => {
      const g = (window as unknown as { __PHASER_GAME__?: PhaserDebugGame }).__PHASER_GAME__;
      return Boolean(g?.scene.isActive('CinematicIntroScene') || g?.scene.isActive('MenuScene'));
    });
    await page.keyboard.press('Space');
    await page.waitForFunction(() => {
      const g = (window as unknown as { __PHASER_GAME__?: PhaserDebugGame }).__PHASER_GAME__;
      return Boolean(g?.scene.isActive('MenuScene'));
    });
    await page.waitForTimeout(350);

    // 1. Open Settings via KeyboardNavManager from Main Menu
    const canvas = page.locator('#game-container canvas');
    // Menu layout: PLAY(275), LEVEL SELECTION(323), OBJECT GUIDE(371), SETTINGS(419)
    await canvas.click({ position: { x: 640, y: 419 } });
    await page.waitForTimeout(350);

    const settingsOpen = await page.evaluate(() => {
      const game = (window as unknown as { __PHASER_GAME__?: PhaserDebugGame }).__PHASER_GAME__;
      const menu = game?.scene.getScene('MenuScene') as
        | { settingsModal?: { isVisible: () => boolean }; mainMenuHitZones?: Array<{ input: unknown }> }
        | undefined;
      return {
        visible: menu?.settingsModal?.isVisible() ?? false,
        bgZonesDisabled: (menu?.mainMenuHitZones ?? []).every((z) => !z.input || !(z.input as { enabled: boolean }).enabled),
      };
    });
    expect(settingsOpen.visible).toBe(true);
    expect(settingsOpen.bgZonesDisabled).toBe(true);

    // Drag Master Volume slider horizontally to the left to adjust volume cleanly
    const sliderBounds = await page.evaluate(() => {
      const game = (window as unknown as { __PHASER_GAME__?: PhaserDebugGame }).__PHASER_GAME__;
      const menu = game?.scene.getScene('MenuScene') as
        | {
            settingsModal?: {
              masterSlider?: {
                getValue: () => number;
                focusItem?: { getBounds: () => { x: number; y: number; width: number; height: number } };
              };
            };
          }
        | undefined;
      return {
        val: menu?.settingsModal?.masterSlider?.getValue() ?? null,
        bounds: menu?.settingsModal?.masterSlider?.focusItem?.getBounds() ?? null,
      };
    });
    expect(sliderBounds.val).not.toBeNull();
    expect(sliderBounds.bounds).not.toBeNull();

    const sx = sliderBounds.bounds!.x;
    const sy = sliderBounds.bounds!.y;
    await page.mouse.move(sx, sy);
    await page.mouse.down();
    await page.mouse.move(sx - 60, sy, { steps: 6 });
    await page.mouse.up();
    await page.waitForTimeout(200);

    const sliderAfter = await page.evaluate(() => {
      const raw = window.localStorage.getItem('the_other_side_save_v1');
      return raw ? JSON.parse(raw).masterVolume : null;
    });
    expect(sliderAfter).not.toBeNull();
    expect(sliderAfter).toBeLessThan(sliderBounds.val!);
    await page.screenshot({ path: 'screenshots/release-settings-sliders.png' });

    // Background click outside Settings modal box MUST NOT close Settings or click main menu behind it
    await canvas.click({ position: { x: 80, y: 80 } });
    await page.waitForTimeout(200);
    const stillVisible = await page.evaluate(() => {
      const game = (window as unknown as { __PHASER_GAME__?: PhaserDebugGame }).__PHASER_GAME__;
      const menu = game?.scene.getScene('MenuScene') as
        | { settingsModal?: { isVisible: () => boolean }; mainMenuHitZones?: Array<{ input: unknown }> }
        | undefined;
      return {
        settingsVisible: menu?.settingsModal?.isVisible() ?? false,
        inMenu: game?.scene.isActive('MenuScene') ?? false,
      };
    });
    expect(stillVisible.settingsVisible).toBe(true);
    expect(stillVisible.inMenu).toBe(true);

    // Press Esc to close Settings cleanly
    await page.keyboard.press('Escape');
    await page.waitForTimeout(250);

    // 2. Open Object Guide & switch tabs repeatedly -> verify zero object leak
    await canvas.click({ position: { x: 640, y: 371 } });
    await page.waitForTimeout(300);

    // Tab positions: inspect live ObjectGuideModal tab hit zones dynamically
    const tabCoords = await page.evaluate(() => {
      const game = (window as unknown as { __PHASER_GAME__?: PhaserDebugGame }).__PHASER_GAME__;
      const menu = game?.scene.getScene('MenuScene') as
        | {
            objectGuideModal?: {
              container?: { x: number; y: number };
              categoryTabsContainer?: { list: Array<{ x: number; y: number; type?: string }> };
            };
          }
        | undefined;
      const cx = menu?.objectGuideModal?.container?.x ?? 640;
      const cy = menu?.objectGuideModal?.container?.y ?? 360;
      const zones = (menu?.objectGuideModal?.categoryTabsContainer?.list ?? []).filter(
        (o) => o.type === 'Zone'
      );
      return zones.map((z) => ({ x: cx + z.x, y: cy + z.y }));
    });
    expect(tabCoords.length).toBe(6);

    for (let cycle = 0; cycle < 3; cycle++) {
      for (const tc of tabCoords) {
        await canvas.click({ position: { x: tc.x, y: tc.y } });
        await page.waitForTimeout(50);
      }
    }

    const guideState = await page.evaluate(() => {
      const game = (window as unknown as { __PHASER_GAME__?: PhaserDebugGame }).__PHASER_GAME__;
      const menu = game?.scene.getScene('MenuScene') as
        | {
            objectGuideModal?: {
              isVisible: () => boolean;
              categoryTabsContainer?: { list: unknown[] };
            };
          }
        | undefined;
      return {
        visible: menu?.objectGuideModal?.isVisible() ?? false,
        tabObjCount: menu?.objectGuideModal?.categoryTabsContainer?.list.length ?? 0,
      };
    });
    expect(guideState.visible).toBe(true);
    // 6 tabs * 3 objects (graphics + text + zone) = exactly 18 regardless of click count
    expect(guideState.tabObjCount).toBe(18);
    await page.screenshot({ path: 'screenshots/release-object-guide.png' });
  });

  test('verifies Poki SDK lifecycle (Pause -> Settings -> Pause -> Resume commercialBreak -> Win Level 1) and mobile touch controls', async ({
    page,
  }) => {
    // Inject PokiSDK mock BEFORE navigation to record exact SDK lifecycle sequence
    await page.addInitScript(() => {
      const calls: string[] = [];
      (window as unknown as { __POKI_CALLS__: string[]; PokiSDK: Record<string, unknown> }).__POKI_CALLS__ = calls;
      (window as unknown as { PokiSDK: Record<string, unknown> }).PokiSDK = {
        init: async () => {
          calls.push('init');
        },
        gameLoadingStart: () => calls.push('gameLoadingStart'),
        gameLoadingFinished: () => calls.push('gameLoadingFinished'),
        gameplayStart: () => calls.push('gameplayStart'),
        gameplayStop: () => calls.push('gameplayStop'),
        commercialBreak: async (cb?: () => void) => {
          calls.push('commercialBreak:start');
          cb?.();
          await new Promise((r) => setTimeout(r, 60));
          calls.push('commercialBreak:end');
        },
        rewardedBreak: async () => {
          calls.push('rewardedBreak');
          return true;
        },
        setDebug: () => {},
      };
    });

    await page.setViewportSize({ width: 844, height: 390 });
    await page.goto('/?level=1');
    await page.waitForSelector('#game-container canvas', { state: 'visible', timeout: 15000 });
    await page.waitForTimeout(700);

    // Mobile controls must be visible on 844x390 touch viewport during active gameplay
    const mobileRoot = page.locator('#mobile-controls-root');
    await expect(mobileRoot).toBeVisible();
    for (const id of ['#btn-mobile-left', '#btn-mobile-right', '#btn-mobile-up', '#btn-mobile-down']) {
      const box = await page.locator(id).boundingBox();
      expect(box, `Missing button ${id}`).not.toBeNull();
      expect(box!.width).toBeGreaterThanOrEqual(48);
      expect(box!.height).toBeGreaterThanOrEqual(48);
    }

    await page.screenshot({ path: 'screenshots/release-mobile-gameplay.png' });

    // Pause via keyboard 'p' -> hides mobile controls & opens PauseModal
    await page.keyboard.press('p');
    await page.waitForTimeout(300);
    await expect(mobileRoot).toBeHidden();

    // Open Settings from PauseModal -> PauseModal hides cleanly so only Settings is visible
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);

    const layeredState = await page.evaluate(() => {
      const game = (window as unknown as { __PHASER_GAME__?: PhaserDebugGame }).__PHASER_GAME__;
      const gs = game?.scene.getScene('GameScene') as
        | {
            pauseModal?: { isVisible: () => boolean };
            settingsModal?: { isVisible: () => boolean };
          }
        | undefined;
      return {
        pauseVisible: gs?.pauseModal?.isVisible() ?? false,
        settingsVisible: gs?.settingsModal?.isVisible() ?? false,
      };
    });
    expect(layeredState.settingsVisible).toBe(true);
    expect(layeredState.pauseVisible).toBe(false);

    // Close Settings with Escape -> PauseModal restores automatically
    await page.keyboard.press('Escape');
    await page.waitForTimeout(250);
    const afterSettingsClose = await page.evaluate(() => {
      const game = (window as unknown as { __PHASER_GAME__?: PhaserDebugGame }).__PHASER_GAME__;
      const gs = game?.scene.getScene('GameScene') as
        | { pauseModal?: { isVisible: () => boolean }; settingsModal?: { isVisible: () => boolean } }
        | undefined;
      return {
        pauseVisible: gs?.pauseModal?.isVisible() ?? false,
        settingsVisible: gs?.settingsModal?.isVisible() ?? false,
      };
    });
    expect(afterSettingsClose.pauseVisible).toBe(true);
    expect(afterSettingsClose.settingsVisible).toBe(false);

    // Toggle enableAdsInDev on the exposed Poki bridge to verify Pause -> Resume commercialBreak flow in local preview
    await page.evaluate(() => {
      const bridge = (window as unknown as { __POKI_BRIDGE__?: { setEnableAdsInDev: (v: boolean) => void } })
        .__POKI_BRIDGE__;
      bridge?.setEnableAdsInDev(true);
    });
    await page.keyboard.press('Enter');
    await page.waitForTimeout(350);

    await expect(mobileRoot).toBeVisible();

    // Solve Level 1 via 4x Right
    for (let i = 0; i < 4; i++) {
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(180);
    }
    await page.waitForTimeout(350);

    // Mobile controls hidden when WinModal appears
    await expect(mobileRoot).toBeHidden();

    const pokiTrace = await page.evaluate(
      () => (window as unknown as { __POKI_CALLS__: string[] }).__POKI_CALLS__
    );
    expect(pokiTrace).toContain('init');
    expect(pokiTrace).toContain('gameLoadingStart');
    expect(pokiTrace).toContain('gameLoadingFinished');
    expect(pokiTrace).toContain('gameplayStart');
    expect(pokiTrace).toContain('gameplayStop');
    expect(pokiTrace).toContain('commercialBreak:start');
    expect(pokiTrace).toContain('commercialBreak:end');
  });
});
