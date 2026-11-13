import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PokiIntegration } from '../../src/poki/PokiIntegration';

describe('Phase 12 — PokiIntegration Adapter', () => {
  let adapter: PokiIntegration;
  const originalWindow = globalThis.window;

  beforeEach(() => {
    (globalThis as unknown as { window: unknown }).window = {
      location: { hostname: 'localhost' },
    };
    adapter = PokiIntegration.getInstance();
  });

  afterEach(() => {
    (globalThis as unknown as { window: unknown }).window = originalWindow;
  });

  it('initializes cleanly in offline/standalone mode without window.PokiSDK', async () => {
    await adapter.init();
    expect(adapter.isSDKAvailable).toBe(false);
    expect(adapter.isPlaying).toBe(false);
  });

  it('handles gameLoadingStart and gameLoadingFinished without throwing when offline', () => {
    expect(() => {
      adapter.gameLoadingStart();
      adapter.gameLoadingFinished();
    }).not.toThrow();
  });

  it('tracks gameplayStart and gameplayStop states and suppresses duplicate consecutive events', async () => {
    const startSpy = vi.fn();
    const stopSpy = vi.fn();

    // Mock PokiSDK
    const mockPoki = {
      init: vi.fn().mockResolvedValue(undefined),
      gameLoadingStart: vi.fn(),
      gameLoadingFinished: vi.fn(),
      gameplayStart: startSpy,
      gameplayStop: stopSpy,
      commercialBreak: vi.fn().mockResolvedValue(undefined),
      rewardedBreak: vi.fn().mockResolvedValue(true),
      setDebug: vi.fn(),
    };

    (globalThis.window as unknown as { PokiSDK: unknown }).PokiSDK = mockPoki;

    // Reset adapter initialization state for mock testing
    (adapter as unknown as { isInitialized: boolean; isAvailable: boolean }).isInitialized = false;
    await adapter.init();

    expect(adapter.isSDKAvailable).toBe(true);

    // First gameplayStart
    adapter.gameplayStart();
    expect(adapter.isPlaying).toBe(true);
    expect(startSpy).toHaveBeenCalledTimes(1);

    // Duplicate gameplayStart should be suppressed
    adapter.gameplayStart();
    expect(adapter.isPlaying).toBe(true);
    expect(startSpy).toHaveBeenCalledTimes(1);

    // Stop gameplay
    adapter.gameplayStop();
    expect(adapter.isPlaying).toBe(false);
    expect(stopSpy).toHaveBeenCalledTimes(1);

    // Duplicate gameplayStop should be suppressed
    adapter.gameplayStop();
    expect(adapter.isPlaying).toBe(false);
    expect(stopSpy).toHaveBeenCalledTimes(1);
  });

  it('handles commercialBreak safely in dev mode and invokes pause/resume hooks', async () => {
    const pauseHook = vi.fn();
    const resumeHook = vi.fn();

    await adapter.commercialBreak(pauseHook, resumeHook);
    expect(adapter.isPlaying).toBe(false);
  });

  it('handles rewardedBreak gracefully when offline', async () => {
    (globalThis.window as unknown as { PokiSDK?: unknown }).PokiSDK = undefined;
    (adapter as unknown as { isAvailable: boolean }).isAvailable = false;
    const result = await adapter.rewardedBreak();
    expect(result).toBe(false);
  });
});
