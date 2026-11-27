import { AudioContextManager } from './AudioContextManager';
import { AtmosphericMusic, GameplayAudioState, ChapterName } from './AtmosphericMusic';
import { SoundEffects } from './SoundEffects';
import { StorageManager } from '../storage/StorageManager';

/**
 * AudioManager — Central coordinator for sound effects, dynamic atmospheric music,
 * persistent settings synchronization, and browser autoplay lifecycle.
 */
export class AudioManager {
  private static instance: AudioManager | null = null;

  public readonly music: AtmosphericMusic;
  public readonly sfx: SoundEffects;
  private readonly ctxMgr: AudioContextManager;
  private storage: StorageManager | null = null;
  private suspendedByAd = false;
  private mutedBeforeAd = false;

  private constructor() {
    this.ctxMgr = AudioContextManager.getInstance();
    this.music = new AtmosphericMusic();
    this.sfx = new SoundEffects();
  }

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  /**
   * Initializes persistent settings from StorageManager
   */
  public init(storage: StorageManager): void {
    this.storage = storage;
    const progress = storage.getProgress();

    this.ctxMgr.setMuted(progress.muted);
    this.ctxMgr.setMasterVolume(progress.masterVolume ?? 0.85);
    this.ctxMgr.setMusicVolume(progress.musicVolume ?? 0.85);
    this.ctxMgr.setSfxVolume(progress.sfxVolume ?? 0.85);
  }

  public setMuted(muted: boolean): void {
    this.ctxMgr.setMuted(muted);
    if (this.storage) {
      this.storage.setMuted(muted);
    }
  }

  public isMuted(): boolean {
    return this.ctxMgr.isMuted();
  }

  public setMasterVolume(vol: number): void {
    this.ctxMgr.setMasterVolume(vol);
    if (this.storage) {
      this.storage.setMasterVolume(vol);
    }
  }

  public getMasterVolume(): number {
    return this.ctxMgr.getMasterVolume();
  }

  public setMusicVolume(vol: number): void {
    this.ctxMgr.setMusicVolume(vol);
    if (this.storage) {
      this.storage.setMusicVolume(vol);
    }
  }

  public getMusicVolume(): number {
    return this.ctxMgr.getMusicVolume();
  }

  public setSfxVolume(vol: number): void {
    this.ctxMgr.setSfxVolume(vol);
    if (this.storage) {
      this.storage.setSfxVolume(vol);
    }
  }

  public getSfxVolume(): number {
    return this.ctxMgr.getSfxVolume();
  }

  public playMenuMusic(): void {
    this.music.start('menu', 'THE BEGINNING');
  }

  public playGameMusic(chapter: ChapterName): void {
    this.music.start('normal', chapter);
  }

  public setGameplayState(state: GameplayAudioState): void {
    this.music.setState(state);
  }

  public stopAllMusic(): void {
    this.music.stop();
  }

  public suspendForAd(): void {
    if (this.suspendedByAd) return;
    this.suspendedByAd = true;
    this.mutedBeforeAd = this.ctxMgr.isMuted();
    this.ctxMgr.setMuted(true);
    const ctx = this.ctxMgr.getContext();
    if (ctx && ctx.state === 'running') {
      void ctx.suspend().catch(() => {});
    }
  }

  public resumeFromAd(): void {
    if (!this.suspendedByAd) return;
    this.suspendedByAd = false;
    const savedMuted = this.storage ? this.storage.getProgress().muted : this.mutedBeforeAd;
    this.ctxMgr.setMuted(savedMuted);
    const ctx = this.ctxMgr.getContext();
    if (ctx && ctx.state === 'suspended') {
      void ctx.resume().catch(() => {});
    }
  }
}
