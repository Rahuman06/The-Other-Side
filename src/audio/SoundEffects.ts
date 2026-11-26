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
  private cinematicNodes: Array<{ osc: OscillatorNode; gain: GainNode }> = [];

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
   * Character Footstep: Classic tactile footstep amplified for mobile speakers without headphones
   * Real World = crisp stone footstep (260 Hz -> 150 Hz triangle); Shadow World = subterranean thud (160 Hz -> 75 Hz triangle)
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
        // Classic stone footstep (260 Hz -> 150 Hz triangle), amplified for mobile speakers
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.048);

        gain.gain.setValueAtTime(0.58, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.048);
      } else {
        // Classic shadow subterranean thud (160 Hz -> 75 Hz triangle), amplified for mobile speakers
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(75, now + 0.06);

        gain.gain.setValueAtTime(0.62, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      }

      osc.connect(gain);
      gain.connect(bus);

      this.trackVoice(osc, 0.07);
      osc.start(now);
      osc.stop(now + 0.07);
    } catch (err) {
      console.debug('[SoundEffects] playStep error:', err);
    }
  }

  /**
   * Wall Bump: Punchy, tactile barrier collision with rich harmonics audible on mobile speakers
   */
  public playBump(): void {
    const ab = this.getContextAndBus();
    if (!ab) return;
    const { ctx, bus } = ab;
    const now = ctx.currentTime;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const snap = ctx.createOscillator();
      const snapGain = ctx.createGain();

      // Punchy tactile thud with harmonic body (360 Hz -> 150 Hz triangle + 680 Hz transient)
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(360, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.08);

      gain.gain.setValueAtTime(0.44, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      snap.type = 'sine';
      snap.frequency.setValueAtTime(680, now);
      snap.frequency.exponentialRampToValueAtTime(280, now + 0.025);

      snapGain.gain.setValueAtTime(0.28, now);
      snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

      osc.connect(gain);
      gain.connect(bus);

      snap.connect(snapGain);
      snapGain.connect(bus);

      this.trackVoice(osc, 0.09);
      this.trackVoice(snap, 0.03);

      osc.start(now);
      osc.stop(now + 0.09);

      snap.start(now);
      snap.stop(now + 0.03);
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
      // 1. High metallic click (920 Hz -> 1400 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(920, now);
      osc1.frequency.setValueAtTime(1400, now + 0.025);

      gain1.gain.setValueAtTime(0.35, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc1.connect(gain1);
      gain1.connect(bus);
      osc1.start(now);
      osc1.stop(now + 0.06);

      // 2. Audible mechanical latch thunk (320 Hz -> 160 Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(320, now + 0.015);
      osc2.frequency.exponentialRampToValueAtTime(160, now + 0.08);

      gain2.gain.setValueAtTime(0.38, now + 0.015);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc2.connect(gain2);
      gain2.connect(bus);
      osc2.start(now + 0.015);
      osc2.stop(now + 0.08);
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
        osc.frequency.setValueAtTime(420, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.09);

        gain.gain.setValueAtTime(0.38, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      } else {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(380, now + 0.07);

        gain.gain.setValueAtTime(0.30, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
      }

      osc.connect(gain);
      gain.connect(bus);
      osc.start(now);
      osc.stop(now + 0.09);
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
        // Pneumatic sliding resonant whoosh
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.exponentialRampToValueAtTime(560, now + 0.18);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.34, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      } else {
        // Heavy steel slam with punchy body
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.22);

        gain.gain.setValueAtTime(0.42, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      }

      osc.connect(gain);
      gain.connect(bus);
      osc.start(now);
      osc.stop(now + 0.22);
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
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(420, now + 0.14);

        gain.gain.setValueAtTime(0.16, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      } else {
        osc.type = 'square';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.08);

        gain.gain.setValueAtTime(0.20, now);
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
        osc.frequency.setValueAtTime(360, now + 0.06);

        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(480, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.2);

        gain.gain.setValueAtTime(0.26, now);
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

      gain.gain.setValueAtTime(0.18, now);
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
   * Bomb Explosion: Concussive shockwave drop and shrapnel blast
   */
  public playBombExplosion(): void {
    const ab = this.getContextAndBus();
    if (!ab) return;
    const { ctx, bus } = ab;
    const now = ctx.currentTime;

    try {
      // 1. Sub-bass shockwave drop (65 Hz -> 26 Hz)
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(65, now);
      subOsc.frequency.exponentialRampToValueAtTime(26, now + 0.55);

      subGain.gain.setValueAtTime(0.35, now);
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
      noiseGain.gain.setValueAtTime(0.30, now);
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
      gain.gain.linearRampToValueAtTime(0.22, now + 0.04);
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

        gain.gain.setValueAtTime(0.10, now + i * 0.025);
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
      gain.gain.linearRampToValueAtTime(0.20, now + 0.05);
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

        gain.gain.setValueAtTime(0.14, now + idx * 0.035);
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

      gain.gain.setValueAtTime(0.22, now);
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
      osc.frequency.setValueAtTime(75, now);
      osc.frequency.setValueAtTime(95, now + 0.1);
      osc.frequency.exponentialRampToValueAtTime(55, now + 0.25);

      gain.gain.setValueAtTime(0.22, now);
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

        gain.gain.setValueAtTime(0.18, now + idx * 0.06);
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

        gain.gain.setValueAtTime(0.16, now + idx * 0.04);
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
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(55, now + 0.26);

      gain.gain.setValueAtTime(0.26, now);
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
      osc.frequency.setValueAtTime(95, now);
      osc.frequency.exponentialRampToValueAtTime(360, now + 0.22);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.22, now + 0.16);
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

        gain.gain.setValueAtTime(0.20, now + idx * 0.08);
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

      gain.gain.setValueAtTime(0.045, now);
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
   * Button Click: Crisp mechanical actuation click engineered for mobile speakers without headphones
   */
  public playUiClick(): void {
    const ab = this.getContextAndBus();
    if (!ab) return;
    const { ctx, bus } = ab;
    const now = ctx.currentTime;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const snap = ctx.createOscillator();
      const snapGain = ctx.createGain();

      // Primary crisp mechanical actuation (1400 Hz -> 680 Hz triangle)
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(680, now + 0.035);

      gain.gain.setValueAtTime(0.38, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      // High-frequency tactile ping (2400 Hz -> 1200 Hz sine)
      snap.type = 'sine';
      snap.frequency.setValueAtTime(2400, now);
      snap.frequency.exponentialRampToValueAtTime(1200, now + 0.018);

      snapGain.gain.setValueAtTime(0.22, now);
      snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.018);

      osc.connect(gain);
      gain.connect(bus);

      snap.connect(snapGain);
      snapGain.connect(bus);

      this.trackVoice(osc, 0.04);
      this.trackVoice(snap, 0.02);

      osc.start(now);
      osc.stop(now + 0.04);

      snap.start(now);
      snap.stop(now + 0.02);
    } catch (err) {
      console.debug('[SoundEffects] playUiClick error:', err);
    }
  }

  /**
   * UI Select / Toggle: Ascending confirmation tone with high mobile presence
   */
  public playUiSelect(): void {
    const ab = this.getContextAndBus();
    if (!ab) return;
    const { ctx, bus } = ab;
    const now = ctx.currentTime;

    try {
      const notes = [523.25, 783.99]; // C5 -> G5
      notes.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + idx * 0.04);

        gain.gain.setValueAtTime(0.30, now + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.07);

        osc.connect(gain);
        gain.connect(bus);
        osc.start(now + idx * 0.04);
        osc.stop(now + idx * 0.04 + 0.07);
      });
    } catch (err) {
      console.debug('[SoundEffects] playUiSelect error:', err);
    }
  }

  /**
   * Menu Open: Clean atmospheric dimensional sweep open
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
      osc.frequency.setValueAtTime(330, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.28, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(bus);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch (err) {
      console.debug('[SoundEffects] playMenuOpen error:', err);
    }
  }

  /**
   * Menu Close: Clean atmospheric dimensional sweep close
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
      osc.frequency.setValueAtTime(780, now);
      osc.frequency.exponentialRampToValueAtTime(290, now + 0.1);

      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(bus);
      osc.start(now);
      osc.stop(now + 0.1);
    } catch (err) {
      console.debug('[SoundEffects] playMenuClose error:', err);
    }
  }

  /**
   * Pause: Tactile soft suspension pulse
   */
  public playPause(): void {
    const ab = this.getContextAndBus();
    if (!ab) return;
    const { ctx, bus } = ab;
    const now = ctx.currentTime;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(540, now);
      osc.frequency.exponentialRampToValueAtTime(270, now + 0.12);

      gain.gain.setValueAtTime(0.32, now);
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
   * Resume: Tactile re-engagement click
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
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(640, now + 0.08);

      gain.gain.setValueAtTime(0.32, now);
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

      gain.gain.setValueAtTime(0.07, now);
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

        gain.gain.setValueAtTime(0.14, now + idx * 0.04);
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

      gain.gain.setValueAtTime(0.12, now);
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

        gain.gain.setValueAtTime(0.16, now + idx * 0.035);
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

  /**
   * Registers an oscillator+gain pair belonging to the intro cinematic so it can be
   * cleanly faded out if the player skips the intro or switches scenes.
   */
  private registerCinematicNode(osc: OscillatorNode, gain: GainNode): void {
    const entry = { osc, gain };
    this.cinematicNodes.push(entry);
    osc.onended = () => {
      const idx = this.cinematicNodes.indexOf(entry);
      if (idx !== -1) this.cinematicNodes.splice(idx, 1);
    };
  }

  /**
   * Smoothly stops and disconnects all currently active cinematic intro oscillators.
   */
  public stopCinematicCues(): void {
    const ctx = this.audioMgr.getContext();
    const nodes = this.cinematicNodes.splice(0, this.cinematicNodes.length);
    if (!ctx || nodes.length === 0) return;

    const now = ctx.currentTime;
    for (const { osc, gain } of nodes) {
      try {
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(Math.max(0.0001, gain.gain.value), now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
        osc.stop(now + 0.14);
      } catch {
        // Ignore already-stopped nodes
      }
    }
  }

  /**
   * Cinematic Scene 1: Subtle atmospheric opening ambience ("ONE SOUL.")
   */
  public playCinematicAmbience(): void {
    const ab = this.getContextAndBus();
    if (!ab) return;
    const { ctx, bus } = ab;
    const now = ctx.currentTime;

    try {
      const droneFreqs = [55.0, 110.0, 220.0];
      droneFreqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.11 / (idx + 1), now + 1.1);
        gain.gain.exponentialRampToValueAtTime(0.0008, now + 3.2);

        osc.connect(gain);
        gain.connect(bus);
        this.registerCinematicNode(osc, gain);
        osc.start(now);
        osc.stop(now + 3.25);
      });
    } catch (err) {
      console.debug('[SoundEffects] playCinematicAmbience error:', err);
    }
  }

  /**
   * Cinematic Scene 2: Subtle disturbance & rising separation swell ("TWO REALITIES.")
   */
  public playCinematicSeparation(): void {
    const ab = this.getContextAndBus();
    if (!ab) return;
    const { ctx, bus } = ab;
    const now = ctx.currentTime;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.exponentialRampToValueAtTime(293.66, now + 1.5);

      gain.gain.setValueAtTime(0.0005, now);
      gain.gain.linearRampToValueAtTime(0.14, now + 0.85);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + 1.7);

      osc.connect(gain);
      gain.connect(bus);
      this.registerCinematicNode(osc, gain);
      osc.start(now);
      osc.stop(now + 1.75);
    } catch (err) {
      console.debug('[SoundEffects] playCinematicSeparation error:', err);
    }
  }

  /**
   * Cinematic Scene 2/3: Clean split transition sound
   */
  public playCinematicSplit(): void {
    const ab = this.getContextAndBus();
    if (!ab) return;
    const { ctx, bus } = ab;
    const now = ctx.currentTime;

    try {
      [180, 440].forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = idx === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(f, now);
        osc.frequency.exponentialRampToValueAtTime(f * 0.5, now + 0.35);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.42);

        osc.connect(gain);
        gain.connect(bus);
        this.registerCinematicNode(osc, gain);
        osc.start(now);
        osc.stop(now + 0.45);
      });
    } catch (err) {
      console.debug('[SoundEffects] playCinematicSplit error:', err);
    }
  }

  /**
   * Cinematic Scene 3: Entering both realities ("TWO LIVES.")
   */
  public playCinematicWorldEntry(): void {
    const ab = this.getContextAndBus();
    if (!ab) return;
    const { ctx, bus } = ab;
    const now = ctx.currentTime;

    try {
      // Warm deep shadow root + airy high real fifth
      [146.83, 440.0].forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + idx * 0.08);

        gain.gain.setValueAtTime(0.0001, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(idx === 0 ? 0.12 : 0.08, now + idx * 0.08 + 0.5);
        gain.gain.exponentialRampToValueAtTime(0.0008, now + idx * 0.08 + 2.1);

        osc.connect(gain);
        gain.connect(bus);
        this.registerCinematicNode(osc, gain);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 2.15);
      });
    } catch (err) {
      console.debug('[SoundEffects] playCinematicWorldEntry error:', err);
    }
  }

  /**
   * Cinematic Scene 4: Cyan connection pulse across the boundary ("ONE MIND.")
   */
  public playCinematicConnectionPulse(): void {
    const ab = this.getContextAndBus();
    if (!ab) return;
    const { ctx, bus } = ab;
    const now = ctx.currentTime;

    try {
      // Pure harmonic unison-to-fifth resonance symbolizing shared consciousness
      [220.0, 329.63, 659.25].forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + idx * 0.06);

        gain.gain.setValueAtTime(0.0001, now + idx * 0.06);
        gain.gain.linearRampToValueAtTime(0.11 / (idx + 1), now + idx * 0.06 + 0.25);
        gain.gain.exponentialRampToValueAtTime(0.0008, now + idx * 0.06 + 2.2);

        osc.connect(gain);
        gain.connect(bus);
        this.registerCinematicNode(osc, gain);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 2.25);
      });
    } catch (err) {
      console.debug('[SoundEffects] playCinematicConnectionPulse error:', err);
    }
  }

  /**
   * Cinematic Scene 5: Restrained harmonic bloom & title reveal ("THE OTHER SIDE")
   */
  public playCinematicImpact(): void {
    const ab = this.getContextAndBus();
    if (!ab) return;
    const { ctx, bus } = ab;
    const now = ctx.currentTime;

    try {
      // Harmonic chord bloom: A3, E4, A4, C#5
      const bloom = [220.0, 329.63, 440.0, 554.37];
      bloom.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + idx * 0.045);

        gain.gain.setValueAtTime(0.0001, now + idx * 0.045);
        gain.gain.linearRampToValueAtTime(0.14 / (idx + 1), now + idx * 0.045 + 0.12);
        gain.gain.exponentialRampToValueAtTime(0.0008, now + idx * 0.045 + 2.0);

        osc.connect(gain);
        gain.connect(bus);
        this.registerCinematicNode(osc, gain);
        osc.start(now + idx * 0.045);
        osc.stop(now + idx * 0.045 + 2.05);
      });
    } catch (err) {
      console.debug('[SoundEffects] playCinematicImpact error:', err);
    }
  }
}
