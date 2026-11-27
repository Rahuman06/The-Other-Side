export interface PokiSDKInterface {
  init: () => Promise<void>;
  gameLoadingStart: () => void;
  gameLoadingFinished: () => void;
  gameplayStart: () => void;
  gameplayStop: () => void;
  commercialBreak: (fn?: () => void) => Promise<void>;
  rewardedBreak: (fn?: () => void) => Promise<boolean>;
  setDebug: (debug: boolean) => void;
}

declare global {
  interface Window {
    PokiSDK?: PokiSDKInterface;
  }
}

export interface PokiIntegrationOptions {
  debug?: boolean;
  enableAdsInDev?: boolean;
}

export class PokiIntegration {
  private static instance: PokiIntegration | null = null;

  private isInitialized = false;
  private isAvailable = false;
  private isGameplayActive = false;
  private isAdPlaying = false;
  private isDevEnvironment = false;
  private enableAdsInDev = false;

  private loadingStarted = false;
  private loadingFinished = false;

  private constructor() {
    this.isDevEnvironment =
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname.endsWith('.local'));
  }

  public static getInstance(): PokiIntegration {
    if (!PokiIntegration.instance) {
      PokiIntegration.instance = new PokiIntegration();
    }
    return PokiIntegration.instance;
  }

  /**
   * Initializes the Poki SDK v2.
   * Resolves cleanly even if the SDK fails to load or is adblocked, ensuring gameplay is never blocked.
   */
  public async init(options: PokiIntegrationOptions = {}): Promise<void> {
    if (this.isInitialized) return;

    this.enableAdsInDev = !!options.enableAdsInDev;

    if (typeof window === 'undefined' || !window.PokiSDK) {
      console.debug('[PokiIntegration] Running in standalone/fallback mode (PokiSDK script not loaded)');
      this.isInitialized = true;
      this.isAvailable = false;
      return;
    }

    try {
      if (options.debug !== undefined) {
        window.PokiSDK.setDebug(options.debug);
      }

      await window.PokiSDK.init();
      this.isInitialized = true;
      this.isAvailable = true;
      console.debug('[PokiIntegration] Poki SDK v2 successfully initialized');
    } catch (err) {
      // Something went wrong (ad blocker, network issue), but game must load anyway!
      console.debug('[PokiIntegration] PokiSDK init failed or adblocked; continuing in offline mode:', err);
      this.isInitialized = true;
      this.isAvailable = false;
    }
  }

  public gameLoadingStart(): void {
    if (this.loadingStarted) return;
    this.loadingStarted = true;

    if (this.isAvailable && window.PokiSDK) {
      try {
        window.PokiSDK.gameLoadingStart();
      } catch (err) {
        console.debug('[PokiIntegration] gameLoadingStart error:', err);
      }
    }
  }

  public gameLoadingFinished(): void {
    if (this.loadingFinished) return;
    this.loadingFinished = true;

    if (this.isAvailable && window.PokiSDK) {
      try {
        window.PokiSDK.gameLoadingFinished();
      } catch (err) {
        console.debug('[PokiIntegration] gameLoadingFinished error:', err);
      }
    }
  }

  /**
   * Fires when active gameplay resumes or starts on user input.
   * Prevents consecutive duplicate gameplayStart calls.
   */
  public gameplayStart(): void {
    if (this.isGameplayActive) return; // Prevent duplicate consecutive calls
    this.isGameplayActive = true;

    if (this.isAvailable && window.PokiSDK) {
      try {
        window.PokiSDK.gameplayStart();
      } catch (err) {
        console.debug('[PokiIntegration] gameplayStart error:', err);
      }
    }
  }

  /**
   * Fires when active gameplay stops (pause modal, level complete, death, menu return).
   * Prevents consecutive duplicate gameplayStop calls.
   */
  public gameplayStop(): void {
    if (!this.isGameplayActive) return; // Prevent duplicate consecutive calls
    this.isGameplayActive = false;

    if (this.isAvailable && window.PokiSDK) {
      try {
        window.PokiSDK.gameplayStop();
      } catch (err) {
        console.debug('[PokiIntegration] gameplayStop error:', err);
      }
    }
  }

  /**
   * Midroll commercial break at natural level transitions.
   * Pauses audio and gameplay during the ad, then resumes cleanly.
   */
  public setEnableAdsInDev(enabled: boolean): void {
    this.enableAdsInDev = enabled;
  }

  public isAdActive(): boolean {
    return this.isAdPlaying;
  }

  public async commercialBreak(
    onPause?: () => void,
    onResume?: () => void
  ): Promise<void> {
    if (this.isAdPlaying) return;

    // Disabled in local dev unless explicitly enabled
    if (this.isDevEnvironment && !this.enableAdsInDev) {
      console.debug('[PokiIntegration] Commercial break skipped in local development');
      return;
    }

    if (!this.isAvailable || !window.PokiSDK) {
      return;
    }

    this.isAdPlaying = true;
    this.gameplayStop();

    let pausedByAdStart = false;
    const ensurePaused = () => {
      if (!pausedByAdStart) {
        pausedByAdStart = true;
        onPause?.();
      }
    };

    try {
      await window.PokiSDK.commercialBreak(() => {
        ensurePaused();
      });
    } catch (err) {
      console.debug('[PokiIntegration] commercialBreak error or dismissed:', err);
    } finally {
      this.isAdPlaying = false;
      if (pausedByAdStart) {
        onResume?.();
      }
    }
  }

  /**
   * Rewarded video ad for optional in-game hints or skips.
   */
  public async rewardedBreak(
    onPause?: () => void,
    onResume?: () => void
  ): Promise<boolean> {
    if (this.isAdPlaying) return false;

    if (!this.isAvailable || !window.PokiSDK) {
      return false;
    }

    this.isAdPlaying = true;
    this.gameplayStop();

    let success: boolean;
    try {
      success = await window.PokiSDK.rewardedBreak(() => {
        onPause?.();
      });
    } catch (err) {
      console.debug('[PokiIntegration] rewardedBreak error:', err);
      success = false;
    } finally {
      this.isAdPlaying = false;
      onResume?.();
    }

    return success;
  }

  public get isSDKAvailable(): boolean {
    return this.isAvailable;
  }

  public get isPlaying(): boolean {
    return this.isGameplayActive;
  }
}

// Global exported singleton
export const pokiBridge = PokiIntegration.getInstance();
if (typeof window !== 'undefined') {
  (window as unknown as { __POKI_BRIDGE__?: PokiIntegration }).__POKI_BRIDGE__ = pokiBridge;
}
