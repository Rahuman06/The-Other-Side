import { AudioContextManager } from './AudioContextManager';

export type LegacyEffectName =
  | 'step'
  | 'bump'
  | 'switch'
  | 'checkpoint'
  | 'death'
  | 'win'
  | 'ending';

/**
 * SoundEffects — Comprehensive procedural Web Audio API SFX engine.
 * Synthesizes tactile, cinematic sound effects for all 16 puzzle objects,
 * character actions, and unexpected thriller events.
 */
export class SoundEffects {
  private audioMgr: AudioContextManager;
  private lastStepTime: number = 0;
  private activeVoices: number = 0;
  private readonly MAX_CONCURRENT_VOICES: number = 6;

  constructor(initialMuted: boolean = false) {
    this.audioMgr = AudioContextManager.getInstance();
    if (initialMuted) {
      this.audioMgr.setMuted(true);
    }
  }

  public setMuted(muted: boolean): void {
    this.audioMgr.setMuted(muted);
  }

  public isMuted(): boolean {
    return this.audioMgr.isMuted();
  }

  /**
   * Backward compatible dispatcher for existing scene calls
   */
  public play(effect: LegacyEffectName): void {
    switch (effect) {
      case 'step':
        this.playStep(true);
        break;
      case 'bump':
        this.playBump();
        break;
      case 'switch':
        this.playSwitch();
        break;
      case 'checkpoint':
        this.playCheckpoint();
        break;
      case 'death':
        this.playDeath();
        break;
      case 'win':
        this.playWin();
        break;
      case 'ending':
        this.playEndingTheme();
        break;
    }
  }

  private getContextAndBus(): { ctx: AudioContext; bus: GainNode } | null {
    if (this.activeVoices >= this.MAX_CONCURRENT_VOICES) {
      return null;
    }
    const ctx = this.audioMgr.getContext();
    const bus = this.audioMgr.getSfxBus();
    if (!ctx || !bus || this.audioMgr.isMuted()) return null;
    return { ctx, bus };
  }

  private trackVoice(osc: AudioScheduledSourceNode, durationSec: number): void {
    this.activeVoices++;
    osc.onended = () => {
      this.activeVoices = Math.max(0, this.activeVoices - 1);
    };
    if (typeof window !== 'undefined') {
      window.setTimeout(() => {
        this.activeVoices = Math.max(0, this.activeVoices - 1);
      }, (durationSec + 0.05) * 1000);
    }
  }

  // =========================================================================
  // 1. CHARACTER MOVEMENT & PHYSICAL INTERACTION
  // =========================================================================

  /**
   * Character Footstep: Tactile, differentiated footstep
   * Real World = crisp high-frequency click; Shadow World = deep resonant subterranean thud
   */
  public playStep(isReal: boolean = true): void {
    const timeNow = Date.now();
    if (timeNow - this.lastStepTime < 70) {
      return;
    }
    this.lastStepTime = timeNow;

    const ab = this.getContextAndBus();
    if (!ab) return;
    const { ctx, bus } = ab;
    const now = ctx.currentTime;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (isReal) {
        // Crisp stone footstep: 240 Hz -> 140 Hz triangle (subtle & non-fatiguing)
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(240, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.035);

        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
      } else {
        // Shadow subterranean thud: 110 Hz -> 55 Hz sine (subtle & non-fatiguing)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(110, now);
        osc.frequency.exponentialRampToValueAtTime(55, now + 0.05);

        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      }

      osc.connect(gain);
      gain.connect(bus);

      this.trackVoice(osc, 0.06);
      osc.start(now);
      osc.stop(now + 0.06);
    } catch (err) {
      console.debug('[SoundEffects] playStep error:', err);
    }
  }

  /**
   * Wall Bump: Heavy low-frequency elastic thud
   */
  public playBump(): void {
    const ab = this.getContextAndBus();
    if (!ab) return;
    const { ctx, bus } = ab;
    const now = ctx.currentTime;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(95, now);
      osc.frequency.exponentialRampToValueAtTime(38, now + 0.09);

      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(bus);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch (err) {
      console.debug('[SoundEffects] playBump error:', err);
    }
  }

  // =========================================================================
  // 2. MECHANICAL & PUZZLE MECHANISM SFX
  // =========================================================================

  /**
   * Switch Activation: Industrial relay with metallic latch snap
   */
  public playSwitch(): void {
    const ab = this.getContextAndBus();
    if (!ab) return;
    const { ctx, bus } = ab;
    const now = ctx.currentTime;

    try {
      // 1. High metallic click
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'square';
      osc1.frequency.setValueAtTime(620, now);
      osc1.frequency.setValueAtTime(940, now + 0.03);

      gain1.gain.setValueAtTime(0.08, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc1.connect(gain1);
      gain1.connect(bus);
      osc1.start(now);
      osc1.stop(now + 0.08);

      // 2. Low mechanical latch thunk
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(180, now + 0.02);
      osc2.frequency.exponentialRampToValueAtTime(70, now + 0.1);

      gain2.gain.setValueAtTime(0.12, now + 0.02);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc2.connect(gain2);
      gain2.connect(bus);
      osc2.start(now + 0.02);
      osc2.stop(now + 0.1);
    } catch (err) {
      console.debug('[SoundEffects] playSwitch error:', err);
    }
  }

  /**
   * Pressure Plate: Heavy floor sink hydraulic hiss & stone latch
   */
  public playPressurePlate(pressed: boolean = true): void {
    const ab = this.getContextAndBus();
    if (!ab) return;
    const { ctx, bus } = ab;
    const now = ctx.currentTime;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (pressed) {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(65, now + 0.12);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(75, now);
        osc.frequency.exponentialRampToValueAtTime(130, now + 0.09);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      }

      osc.connect(gain);
      gain.connect(bus);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch (err) {
      console.debug('[SoundEffects] playPressurePlate error:', err);
    }
  }

  /**
   * Door Opening / Closing: Pneumatic slide and interlocking chevron blast slam
   */
  public playDoor(open: boolean = true): void {
    const ab = this.getContextAndBus();
    if (!ab) return;
    const { ctx, bus } = ab;
    const now = ctx.currentTime;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (open) {
        // Pneumatic sliding hiss
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(80, now);
        osc.frequency.exponentialRampToValueAtTime(160, now + 0.22);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.1, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      } else {
        // Heavy steel slam
        osc.type = 'sine';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(35, now + 0.28);

        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      }

      osc.connect(gain);
      gain.connect(bus);
      osc.start(now);
      osc.stop(now + 0.28);
    } catch (err) {
      console.debug('[SoundEffects] playDoor error:', err);
    }
  }

  /**
   * Laser Beam Activation & Sizzle
   */
  public playLaser(type: 'active' | 'impact' = 'active'): void {
    const ab = this.getContextAndBus();
    if (!ab) return;
    const { ctx, bus } = ab;
    const now = ctx.currentTime;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (type === 'active') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(380, now + 0.14);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      } else {
        osc.type = 'square';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.08);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      }

      osc.connect(gain);
      gain.connect(bus);
      osc.start(now);
      osc.stop(now + 0.14);
    } catch (err) {
      console.debug('[SoundEffects] playLaser error:', err);
    }
  }

  /**
   * Saw Blade Rotation & Impact
   */
  public playSaw(type: 'whir' | 'impact' = 'whir'): void {
    const ab = this.getContextAndBus();
    if (!ab) return;
    const { ctx, bus } = ab;
    const now = ctx.currentTime;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (type === 'whir') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.setValueAtTime(340, now + 0.06);

        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(480, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.2);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      }

      osc.connect(gain);
      gain.connect(bus);
      osc.start(now);
      osc.stop(now + 0.2);
    } catch (err) {
      console.debug('[SoundEffects] playSaw error:', err);
    }
  }

  /**
   * Bomb Ticking: Urgent, pitch-escalating transient tick
   */
  public playBombTick(remainingTurns: number = 3): void {
    const ab = this.getContextAndBus();
    if (!ab) return;
    const { ctx, bus } = ab;
    const now = ctx.currentTime;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Pitch escalates as timer nears zero
      const baseFreq = remainingTurns <= 1 ? 980 : remainingTurns === 2 ? 740 : 520;
      osc.type = 'square';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.04);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(bus);
      osc.start(now);
      osc.stop(now + 0.04);
    } catch (err) {
      console.debug('[SoundEffects] playBombTick error:', err);
    }
  }

  /**
   * Bomb Explosion: Massive 42 Hz sub-bass drop and concussive shockwave
   */
  public playBombExplosion(): void {
    const ab = this.getContextAndBus();
    if (!ab) return;
    const { ctx, bus } = ab;
    const now = ctx.currentTime;

    try {
      // 1. Sub-bass shockwave drop (42 Hz -> 20 Hz)
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(55, now);
      subOsc.frequency.exponentialRampToValueAtTime(22, now + 0.55);

      subGain.gain.setValueAtTime(0.28, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      subOsc.connect(subGain);
      subGain.connect(bus);
      subOsc.start(now);
      subOsc.stop(now + 0.55);

      // 2. White noise shrapnel blast through low-pass sweep
      const bufSize = Math.floor(ctx.sampleRate * 0.45);
      const buffer = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.25;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, now);
      filter.frequency.exponentialRampToValueAtTime(160, now + 0.45);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.24, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(bus);

      noise.start(now);
      noise.stop(now + 0.45);
    } catch (err) {
      console.debug('[SoundEffects] playBombExplosion error:', err);
    }
  }

  /**
   * Portal Travel: Spatial frequency-folding whoosh
   */
  public playPortalTravel(): void {
    const ab = this.getContextAndBus();
    if (!ab) return;
    const { ctx, bus } = ab;
    const now = ctx.currentTime;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1800, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.28);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.15, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(bus);
      osc.start(now);
      osc.stop(now + 0.28);
    } catch (err) {
      console.debug('[SoundEffects] playPortalTravel error:', err);
    }
  }

  /**
   * Mirror Reflection: Specular glass prism glint
   */
  public playMirror(): void {
    const ab = this.getContextAndBus();
    if (!ab) return;
    const { ctx, bus } = ab;
    const now = ctx.currentTime;

    try {
      const freqs = [1480, 2220, 2960];
      freqs.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + i * 0.025);

        gain.gain.setValueAtTime(0.06, now + i * 0.025);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.025 + 0.16);

        osc.connect(gain);
        gain.connect(bus);
        osc.start(now + i * 0.025);
        osc.stop(now + i * 0.025 + 0.16);
      });
    } catch (err) {
      console.debug('[SoundEffects] playMirror error:', err);
    }
  }

  /**
   * Magnetic Activation: Resonant electromagnetic hum with rising flux
   */
  public playMagnetic(): void {
    const ab = this.getContextAndBus();
    if (!ab) return;
    const { ctx, bus } = ab;
    const now = ctx.currentTime;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(90, now);
      osc.frequency.exponentialRampToValueAtTime(260, now + 0.2);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.14, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(bus);
      osc.start(now);
      osc.stop(now + 0.2);
    } catch (err) {
      console.debug('[SoundEffects] playMagnetic error:', err);
    }
  }

  /**
   * Time Lock Freeze: High-frequency glass bell chime
   */
  public playTimeLock(active: boolean = true): void {
    const ab = this.getContextAndBus();
    if (!ab) return;
    const { ctx, bus } = ab;
    const now = ctx.currentTime;

    try {
      const freqs = active ? [1600, 2150, 3100] : [3100, 2150, 1600];
      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + idx * 0.035);

        gain.gain.setValueAtTime(0.08, now + idx * 0.035);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.035 + 0.25);

        osc.connect(gain);
        gain.connect(bus);
        osc.start(now + idx * 0.035);
        osc.stop(now + idx * 0.035 + 0.25);
      });
    } catch (err) {
      console.debug('[SoundEffects] playTimeLock error:', err);
    }
  }

  /**
   * Collapsing Floor: Brittle stone snapping and rubble rumble
   */
  public playCollapsingFloor(stage: number = 1): void {
    const ab = this.getContextAndBus();
    if (!ab) return;
    const { ctx, bus } = ab;
    const now = ctx.currentTime;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(280 + stage * 60, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.16);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      osc.connect(gain);
      gain.connect(bus);
      osc.start(now);
      osc.stop(now + 0.16);
    } catch (err) {
      console.debug('[SoundEffects] playCollapsingFloor error:', err);
    }
  }

  /**
   * Moving Wall: Deep stone friction grinding
   */
  public playMovingWall(): void {
    const ab = this.getContextAndBus();
    if (!ab) return;
    const { ctx, bus } = ab;
    const now = ctx.currentTime;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(65, now);
      osc.frequency.setValueAtTime(75, now + 0.1);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.25);

      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(bus);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch (err) {
      console.debug('[SoundEffects] playMovingWall error:', err);
    }
  }

  /**
   * Checkpoint Activation: Ascending three-tone sanctuary chime
   */
  public playCheckpoint(): void {
    const ab = this.getContextAndBus();
    if (!ab) return;
    const { ctx, bus } = ab;
    const now = ctx.currentTime;

    try {
      const notes = [440, 554.37, 659.25]; // A4, C#5, E5
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        gain.gain.setValueAtTime(0.1, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.22);

        osc.connect(gain);
        gain.connect(bus);

        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.22);
      });
    } catch (err) {
      console.debug('[SoundEffects] playCheckpoint error:', err);
    }
  }

  /**
   * Exit Arrival: Luminous doorway activation chord
   */
  public playExitArrival(): void {
    const ab = this.getContextAndBus();
    if (!ab) return;
    const { ctx, bus } = ab;
    const now = ctx.currentTime;

    try {
      const notes = [523.25, 659.25]; // C5, E5
      notes.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + idx * 0.04);

        gain.gain.setValueAtTime(0.08, now + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.24);

        osc.connect(gain);
        gain.connect(bus);

        osc.start(now + idx * 0.04);
        osc.stop(now + idx * 0.04 + 0.24);
      });
    } catch (err) {
      console.debug('[SoundEffects] playExitArrival error:', err);
    }
  }

  /**
   * Death Disintegration: Concussive snap & sub-bass drop
   */
  public playDeath(): void {
    const ab = this.getContextAndBus();
    if (!ab) return;
    const { ctx, bus } = ab;
    const now = ctx.currentTime;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(190, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.26);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);

      osc.connect(gain);
      gain.connect(bus);

      osc.start(now);
      osc.stop(now + 0.26);
    } catch (err) {
      console.debug('[SoundEffects] playDeath error:', err);
    }
  }

  /**
   * Respawn: Luminous reverse convergence swell
   */
  public playRespawn(): void {
    const ab = this.getContextAndBus();
    if (!ab) return;
    const { ctx, bus } = ab;
    const now = ctx.currentTime;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(80, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.22);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.14, now + 0.16);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

      osc.connect(gain);
      gain.connect(bus);

      osc.start(now);
      osc.stop(now + 0.24);
    } catch (err) {
      console.debug('[SoundEffects] playRespawn error:', err);
    }
  }

  /**
   * Level Complete: Grand 4-voice harmonic bloom
   */
  public playWin(): void {
    const ab = this.getContextAndBus();
    if (!ab) return;
    const { ctx, bus } = ab;
    const now = ctx.currentTime;

    try {
      const melody = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      melody.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.14, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.4);

        osc.connect(gain);
        gain.connect(bus);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.4);
      });
    } catch (err) {
      console.debug('[SoundEffects] playWin error:', err);
    }
  }

  /**
   * Ending Theme Chord Sequence
   */
  public playEndingTheme(): void {
    const ab = this.getContextAndBus();
    if (!ab) return;
    const { ctx, bus } = ab;
    const now = ctx.currentTime;

    try {
      const chords = [
        { freqs: [130.81, 196.0, 261.63, 329.63, 493.88], delay: 0.0, dur: 3.5 },
        { freqs: [110.0, 164.81, 220.0, 261.63, 392.0], delay: 3.2, dur: 4.0 },
        { freqs: [164.81, 246.94, 329.63, 392.0, 523.25], delay: 7.0, dur: 5.0 },
      ];

      chords.forEach(({ freqs, delay, dur }) => {
        freqs.forEach((freq) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + delay);

          gain.gain.setValueAtTime(0.001, now + delay);
          gain.gain.linearRampToValueAtTime(0.05, now + delay + 1.2);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + dur);

          osc.connect(gain);
          gain.connect(bus);

          osc.start(now + delay);
          osc.stop(now + delay + dur);
        });
      });
    } catch (err) {
      console.debug('[SoundEffects] playEndingTheme error:', err);
    }
  }

  // =========================================================================
  // 4. SURPRISE AUDIO TRIGGERS
  // =========================================================================

  /**
   * Short Dramatic Impact: Sudden brassy dissonance swell
   */
  public playSurpriseImpact(): void {
    const ab = this.getContextAndBus();
    if (!ab) return;
    const { ctx, bus } = ab;
    const now = ctx.currentTime;

    try {
      const freqs = [82.41, 116.54, 164.81]; // E2, Bb2 (tritone), E3
      freqs.forEach((f) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, now);
        osc.frequency.exponentialRampToValueAtTime(f * 0.7, now + 0.32);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

        osc.connect(gain);
        gain.connect(bus);
        osc.start(now);
        osc.stop(now + 0.32);
      });
    } catch (err) {
      console.debug('[SoundEffects] playSurpriseImpact error:', err);
    }
  }

  /**
   * Mechanical Warning: Staccato dual-tone alert klaxon
   */
  public playMechanicalWarning(): void {
    const ab = this.getContextAndBus();
    if (!ab) return;
    const { ctx, bus } = ab;
    const now = ctx.currentTime;

    try {
      const tones = [740, 580];
      tones.forEach((t, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(t, now + i * 0.1);

        gain.gain.setValueAtTime(0.1, now + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.08);

        osc.connect(gain);
        gain.connect(bus);
        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.08);
      });
    } catch (err) {
      console.debug('[SoundEffects] playMechanicalWarning error:', err);
    }
  }

  /**
   * Environmental Transformation: Deep tectonic rumble
   */
  public playEnvironmentalTransformation(): void {
    const ab = this.getContextAndBus();
    if (!ab) return;
    const { ctx, bus } = ab;
    const now = ctx.currentTime;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(45, now);
      osc.frequency.exponentialRampToValueAtTime(95, now + 0.3);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.7);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.22, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

      osc.connect(gain);
      gain.connect(bus);
      osc.start(now);
      osc.stop(now + 0.7);
    } catch (err) {
      console.debug('[SoundEffects] playEnvironmentalTransformation error:', err);
    }
  }

  /**
   * Dispatches surprise sound cues from SurpriseEventManager
   */
  public playSurpriseCue(cue: string): void {
    switch (cue) {
      case 'crumble':
        this.playCollapsingFloor();
        break;
      case 'hazard_spawn':
        this.playMechanicalWarning();
        break;
      case 'wall_shift':
        this.playEnvironmentalTransformation();
        break;
      case 'shockwave':
        this.playSurpriseImpact();
        break;
      case 'bomb_fuse':
        this.playBombTick(1);
        break;
      case 'wall_open':
        this.playDoor(true);
        break;
      case 'distortion':
        this.playPortalDistortion();
        break;
      case 'stasis_tick':
        this.playTimeLock(true);
        break;
      case 'explosion':
        this.playBombExplosion();
        break;
      case 'hazard_trigger':
        this.playMechanicalWarning();
        break;
      case 'illusion_shatter':
      case 'whisper':
      default:
        this.playSurpriseImpact();
        break;
    }
  }

  /**
   * Portal Distortion: Corrupted void phase-inversion warp
   */
  public playPortalDistortion(): void {
    const ab = this.getContextAndBus();
    if (!ab) return;
    const { ctx, bus } = ab;
    const now = ctx.currentTime;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.35);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(bus);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch (err) {
      console.debug('[SoundEffects] playPortalDistortion error:', err);
    }
  }

  /**
   * Hidden Mechanism: Precision ratchet clack and spring click
   */
  public playHiddenMechanism(): void {
    const ab = this.getContextAndBus();
    if (!ab) return;
    const { ctx, bus } = ab;
    const now = ctx.currentTime;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(480, now);
      osc.frequency.setValueAtTime(720, now + 0.04);

      gain.gain.setValueAtTime(0.11, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(bus);
      osc.start(now);
      osc.stop(now + 0.1);
    } catch (err) {
      console.debug('[SoundEffects] playHiddenMechanism error:', err);
    }
  }

  // =========================================================================
  // 5. UI & INTERFACE SOUND EFFECTS (CATEGORY H)
  // =========================================================================

  /**
   * Button Hover: Delicate high-frequency tactile tick
   */
  public playUiHover(): void {
    const ab = this.getContextAndBus();
    if (!ab) return;
    const { ctx, bus } = ab;
    const now = ctx.currentTime;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.015);

      gain.gain.setValueAtTime(0.025, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);

      osc.connect(gain);
      gain.connect(bus);
      osc.start(now);
      osc.stop(now + 0.015);
    } catch (err) {
      console.debug('[SoundEffects] playUiHover error:', err);
    }
  }

  /**
   * Button Click: Crisp mechanical actuation click
   */
  public playUiClick(): void {
    const ab = this.getContextAndBus();
    if (!ab) return;
    const { ctx, bus } = ab;
    const now = ctx.currentTime;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(560, now);
      osc.frequency.exponentialRampToValueAtTime(260, now + 0.025);

      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

      osc.connect(gain);
      gain.connect(bus);
      osc.start(now);
      osc.stop(now + 0.025);
    } catch (err) {
      console.debug('[SoundEffects] playUiClick error:', err);
    }
  }

  /**
   * UI Select / Toggle: Ascending confirmation tone
   */
  public playUiSelect(): void {
    const ab = this.getContextAndBus();
    if (!ab) return;
    const { ctx, bus } = ab;
    const now = ctx.currentTime;

    try {
      const notes = [440, 660];
      notes.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + idx * 0.03);

        gain.gain.setValueAtTime(0.06, now + idx * 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.03 + 0.06);

        osc.connect(gain);
        gain.connect(bus);
        osc.start(now + idx * 0.03);
        osc.stop(now + idx * 0.03 + 0.06);
      });
    } catch (err) {
      console.debug('[SoundEffects] playUiSelect error:', err);
    }
  }

  /**
   * Menu Open: Subtle atmospheric dimensional sweep open
   */
  public playMenuOpen(): void {
    const ab = this.getContextAndBus();
    if (!ab) return;
    const { ctx, bus } = ab;
    const now = ctx.currentTime;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(520, now + 0.1);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.06, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(bus);
      osc.start(now);
      osc.stop(now + 0.1);
    } catch (err) {
      console.debug('[SoundEffects] playMenuOpen error:', err);
    }
  }

  /**
   * Menu Close: Subtle atmospheric dimensional sweep close
   */
  public playMenuClose(): void {
    const ab = this.getContextAndBus();
    if (!ab) return;
    const { ctx, bus } = ab;
    const now = ctx.currentTime;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(480, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.08);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(bus);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch (err) {
      console.debug('[SoundEffects] playMenuClose error:', err);
    }
  }

  /**
   * Pause: Muted soft suspension pulse
   */
  public playPause(): void {
    const ab = this.getContextAndBus();
    if (!ab) return;
    const { ctx, bus } = ab;
    const now = ctx.currentTime;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.12);

      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(bus);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch (err) {
      console.debug('[SoundEffects] playPause error:', err);
    }
  }

  /**
   * Resume: Tactile re-engagement click/pulse
   */
  public playResume(): void {
    const ab = this.getContextAndBus();
    if (!ab) return;
    const { ctx, bus } = ab;
    const now = ctx.currentTime;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(480, now + 0.08);

      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(bus);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch (err) {
      console.debug('[SoundEffects] playResume error:', err);
    }
  }

  /**
   * Slider Tick: Volume and parameter adjustment feedback
   */
  public playSlider(): void {
    const ab = this.getContextAndBus();
    if (!ab) return;
    const { ctx, bus } = ab;
    const now = ctx.currentTime;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.018);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.018);

      osc.connect(gain);
      gain.connect(bus);
      osc.start(now);
      osc.stop(now + 0.018);
    } catch (err) {
      console.debug('[SoundEffects] playSlider error:', err);
    }
  }

  /**
   * Level Select: Crisp affirmation chime
   */
  public playLevelSelect(): void {
    const ab = this.getContextAndBus();
    if (!ab) return;
    const { ctx, bus } = ab;
    const now = ctx.currentTime;

    try {
      const notes = [523.25, 659.25]; // C5, E5
      notes.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + idx * 0.04);

        gain.gain.setValueAtTime(0.08, now + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.14);

        osc.connect(gain);
        gain.connect(bus);
        osc.start(now + idx * 0.04);
        osc.stop(now + idx * 0.04 + 0.14);
      });
    } catch (err) {
      console.debug('[SoundEffects] playLevelSelect error:', err);
    }
  }

  /**
   * Locked Level Error Denial: Dull low-frequency refusal blip
   */
  public playLockedError(): void {
    const ab = this.getContextAndBus();
    if (!ab) return;
    const { ctx, bus } = ab;
    const now = ctx.currentTime;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.setValueAtTime(82, now + 0.04);

      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(bus);
      osc.start(now);
      osc.stop(now + 0.09);
    } catch (err) {
      console.debug('[SoundEffects] playLockedError error:', err);
    }
  }

  /**
   * Rescue Trigger: Radiant cross-world harmonic release chime
   */
  public playRescueTrigger(): void {
    const ab = this.getContextAndBus();
    if (!ab) return;
    const { ctx, bus } = ab;
    const now = ctx.currentTime;

    try {
      const chord = [392.0, 587.33, 880.0]; // G4, D5, A5
      chord.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + idx * 0.035);

        gain.gain.setValueAtTime(0.09, now + idx * 0.035);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.035 + 0.32);

        osc.connect(gain);
        gain.connect(bus);
        osc.start(now + idx * 0.035);
        osc.stop(now + idx * 0.035 + 0.32);
      });
    } catch (err) {
      console.debug('[SoundEffects] playRescueTrigger error:', err);
    }
  }
}
