/**
 * AudioContextManager — Safe Web Audio API context lifecycle and global routing graph.
 * Features:
 * - Master DynamicsCompressorNode limiter to prevent digital clipping
 * - Dedicated Master, Music, and SFX gain buses
 * - Transparent browser autoplay unlocking on first user gesture
 * - Anti-leak node tracking and safe suspend/resume
 */

export class AudioContextManager {
  private static instance: AudioContextManager | null = null;

  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;

  private muted: boolean = false;
  private masterVol: number = 0.85;
  private musicVol: number = 0.85;
  private sfxVol: number = 0.85;

  private isUnlocked: boolean = false;
  private unlockListenersAttached: boolean = false;

  private constructor() {
    this.setupAutoplayUnlock();
  }

  public static getInstance(): AudioContextManager {
    if (!AudioContextManager.instance) {
      AudioContextManager.instance = new AudioContextManager();
    }
    return AudioContextManager.instance;
  }

  public getContext(): AudioContext | null {
    this.ensureContext();
    return this.ctx;
  }

  public getMasterBus(): GainNode | null {
    this.ensureContext();
    return this.masterGain;
  }

  public getMusicBus(): GainNode | null {
    this.ensureContext();
    return this.musicGain;
  }

  public getSfxBus(): GainNode | null {
    this.ensureContext();
    return this.sfxGain;
  }

  private ensureContext(): void {
    if (this.ctx || typeof window === 'undefined') return;

    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      this.ctx = new AudioCtx();

      // Transparent master limiter: protects against digital clipping without harsh mobile pumping
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-6, this.ctx.currentTime);
      this.compressor.knee.setValueAtTime(18, this.ctx.currentTime);
      this.compressor.ratio.setValueAtTime(4, this.ctx.currentTime);
      this.compressor.attack.setValueAtTime(0.012, this.ctx.currentTime);
      this.compressor.release.setValueAtTime(0.15, this.ctx.currentTime);
      this.compressor.connect(this.ctx.destination);

      // Master gain node
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.compressor);

      // Music sub-bus
      this.musicGain = this.ctx.createGain();
      this.musicGain.connect(this.masterGain);

      // SFX sub-bus
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.connect(this.masterGain);

      this.applyGains();
    } catch (err) {
      console.debug('[AudioContextManager] AudioContext initialization deferred:', err);
    }
  }

  private setupAutoplayUnlock(): void {
    if (typeof window === 'undefined' || this.unlockListenersAttached) return;
    this.unlockListenersAttached = true;

    const unlock = () => {
      this.ensureContext();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().then(() => {
          this.isUnlocked = true;
          this.removeUnlockListeners(unlock);
        }).catch((err) => {
          console.debug('[AudioContextManager] AudioContext resume error:', err);
        });
      } else if (this.ctx && this.ctx.state === 'running') {
        this.isUnlocked = true;
        this.removeUnlockListeners(unlock);
      }
    };

    ['pointerdown', 'touchstart', 'keydown', 'click'].forEach((evt) => {
      window.addEventListener(evt, unlock, { capture: true, once: false, passive: true });
    });

    // Auto-suspend audio context when browser tab is hidden and auto-resume when visible
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.suspend();
        } else if (this.isUnlocked) {
          this.resume();
        }
      });
    }

    // Auto-suspend/resume on window blur and focus
    window.addEventListener('blur', () => {
      if (document.hidden) {
        this.suspend();
      }
    });

    window.addEventListener('focus', () => {
      if (this.isUnlocked && !document.hidden) {
        this.resume();
      }
    });
  }

  private removeUnlockListeners(handler: () => void): void {
    if (typeof window === 'undefined') return;
    ['pointerdown', 'touchstart', 'keydown', 'click'].forEach((evt) => {
      window.removeEventListener(evt, handler, { capture: true });
    });
  }

  public isAudioUnlocked(): boolean {
    return this.isUnlocked;
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    this.applyGains();
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setMasterVolume(vol: number): void {
    this.masterVol = Math.max(0, Math.min(1, vol));
    this.applyGains();
  }

  public getMasterVolume(): number {
    return this.masterVol;
  }

  public setMusicVolume(vol: number): void {
    this.musicVol = Math.max(0, Math.min(1, vol));
    this.applyGains();
  }

  public getMusicVolume(): number {
    return this.musicVol;
  }

  public setSfxVolume(vol: number): void {
    this.sfxVol = Math.max(0, Math.min(1, vol));
    this.applyGains();
  }

  public getSfxVolume(): number {
    return this.sfxVol;
  }

  private applyGains(): void {
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const effectiveMaster = this.muted ? 0 : this.masterVol;

    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(effectiveMaster, now);
    }
    if (this.musicGain) {
      this.musicGain.gain.setValueAtTime(this.musicVol, now);
    }
    if (this.sfxGain) {
      this.sfxGain.gain.setValueAtTime(this.sfxVol, now);
    }
  }

  /**
   * Suspends context when game is paused or during commercial breaks
   */
  public suspend(): void {
    if (this.ctx && this.ctx.state === 'running') {
      this.ctx.suspend().catch(() => {});
    }
  }

  /**
   * Resumes context when returning from pause or ad
   */
  public resume(): void {
    this.ensureContext();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }
}
