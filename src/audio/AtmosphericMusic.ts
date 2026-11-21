import { AudioContextManager } from './AudioContextManager';

export type GameplayAudioState =
  | 'menu'
  | 'normal'
  | 'hazard_proximity'
  | 'bomb_countdown'
  | 'surprise'
  | 'transformation'
  | 'death'
  | 'respawn'
  | 'level_complete'
  | 'ending';

export type ChapterName =
  | 'THE BEGINNING'
  | 'THE CONNECTION'
  | 'THE SEPARATION'
  | 'THE REFLECTION'
  | 'THE TRUTH';

/**
 * AtmosphericMusic — Procedural Web Audio API Thriller Soundscape Engine.
 * Features:
 * - Minimal piano synthesis with feedback delay for the Main Menu
 * - Dynamic 4-layer thriller drone (sub-bass, dissonant pad, heartbeat pulse, void whispers)
 * - Chapter-specific harmonic root keys and filters
 * - Real-time state modulation based on gameplay events
 * - Anti-leak node tracking and zero asset footprint
 */
export class AtmosphericMusic {
  private audioMgr: AudioContextManager;
  private isRunning: boolean = false;
  private currentState: GameplayAudioState = 'menu';
  private currentChapter: ChapterName = 'THE BEGINNING';

  // Node references for live continuous modulation
  private droneGain: GainNode | null = null;
  private padGain: GainNode | null = null;
  private pulseGain: GainNode | null = null;
  private textureGain: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private delayNode: DelayNode | null = null;
  private delayFeedback: GainNode | null = null;
  private realPanner: StereoPannerNode | null = null;
  private shadowPanner: StereoPannerNode | null = null;

  // Active oscillators and timers for clean termination
  private activeNodes: Set<AudioNode> = new Set();
  private timerIds: number[] = [];

  // Musical sequencing clocks
  private pianoSequenceStep: number = 0;

  constructor() {
    this.audioMgr = AudioContextManager.getInstance();
  }

  /**
   * Starts atmospheric soundtrack in the given state
   */
  public start(state: GameplayAudioState = 'menu', chapter: ChapterName = 'THE BEGINNING'): void {
    if (this.isRunning && this.currentState === state && this.currentChapter === chapter) {
      return;
    }

    this.stop();
    this.isRunning = true;
    this.currentState = state;
    this.currentChapter = chapter;

    const ctx = this.audioMgr.getContext();
    const bus = this.audioMgr.getMusicBus();
    if (!ctx || !bus) return;

    this.setupAudioGraph(ctx, bus);

    if (state === 'menu') {
      this.startMenuMusic(ctx);
    } else {
      this.startGameplayMusic(ctx, chapter);
    }
  }

  /**
   * Modulates live gameplay music state dynamically
   */
  public setState(state: GameplayAudioState): void {
    if (!this.isRunning || this.currentState === state) return;
    this.currentState = state;

    const ctx = this.audioMgr.getContext();
    if (!ctx || !this.filterNode || !this.pulseGain) return;

    const now = ctx.currentTime;

    switch (state) {
      case 'normal':
        this.filterNode.frequency.setTargetAtTime(380, now, 1.2);
        this.pulseGain.gain.setTargetAtTime(0.0, now, 0.8);
        if (this.droneGain) this.droneGain.gain.setTargetAtTime(0.12, now, 1.0);
        break;

      case 'hazard_proximity':
        // Heightened alert: brighter filter and urgent heartbeat pulse
        this.filterNode.frequency.setTargetAtTime(650, now, 0.4);
        this.pulseGain.gain.setTargetAtTime(0.14, now, 0.3);
        if (this.droneGain) this.droneGain.gain.setTargetAtTime(0.16, now, 0.5);
        this.triggerPulseLoop(ctx);
        break;

      case 'bomb_countdown':
        // High stakes: accelerating tension, lower drone, loud pulse
        this.filterNode.frequency.setTargetAtTime(850, now, 0.2);
        this.pulseGain.gain.setTargetAtTime(0.20, now, 0.2);
        if (this.droneGain) this.droneGain.gain.setTargetAtTime(0.06, now, 0.2);
        this.triggerPulseLoop(ctx);
        break;

      case 'surprise':
        this.triggerSurpriseSting(ctx);
        break;

      case 'transformation':
        this.triggerTransformationSwell(ctx);
        break;

      case 'death':
        if (this.droneGain) this.droneGain.gain.setTargetAtTime(0.01, now, 0.1);
        if (this.padGain) this.padGain.gain.setTargetAtTime(0.01, now, 0.1);
        if (this.pulseGain) this.pulseGain.gain.setTargetAtTime(0.0, now, 0.05);
        break;

      case 'respawn':
        if (this.droneGain) this.droneGain.gain.setTargetAtTime(0.12, now, 0.8);
        if (this.padGain) this.padGain.gain.setTargetAtTime(0.08, now, 0.8);
        if (this.pulseGain) this.pulseGain.gain.setTargetAtTime(0.04, now, 0.8);
        break;

      case 'level_complete':
        this.triggerLevelCompleteBloom(ctx);
        break;

      case 'ending':
        this.triggerEndingClimax(ctx);
        break;
    }
  }

  /**
   * Sets the chapter harmonic profile
   */
  public setChapter(chapter: ChapterName): void {
    this.currentChapter = chapter;
    if (this.isRunning && this.currentState !== 'menu') {
      this.start(this.currentState, chapter);
    }
  }

  /**
   * Cleanly stops and frees all synthesizer nodes and timers
   */
  public stop(): void {
    this.isRunning = false;

    for (const timer of this.timerIds) {
      window.clearInterval(timer);
      window.clearTimeout(timer);
    }
    this.timerIds = [];

    const ctx = this.audioMgr.getContext();
    const now = ctx ? ctx.currentTime : 0;

    for (const node of this.activeNodes) {
      try {
        if ('stop' in node && typeof (node as AudioScheduledSourceNode).stop === 'function') {
          (node as AudioScheduledSourceNode).stop(now);
        }
        node.disconnect();
      } catch {
        // Node already stopped or disconnected
      }
    }
    this.activeNodes.clear();

    this.droneGain = null;
    this.padGain = null;
    this.pulseGain = null;
    this.textureGain = null;
    this.filterNode = null;
    this.delayNode = null;
    this.delayFeedback = null;
    this.realPanner = null;
    this.shadowPanner = null;
  }

  private setupAudioGraph(ctx: AudioContext, bus: GainNode): void {
    // Dynamic resonant filter
    this.filterNode = ctx.createBiquadFilter();
    this.filterNode.type = 'lowpass';
    this.filterNode.frequency.setValueAtTime(400, ctx.currentTime);
    this.filterNode.Q.setValueAtTime(2.5, ctx.currentTime);
    this.filterNode.connect(bus);
    this.activeNodes.add(this.filterNode);

    // Two-world stereo panning (Real World = slightly left -0.22, Shadow World = slightly right +0.22)
    if (typeof ctx.createStereoPanner === 'function') {
      try {
        this.realPanner = ctx.createStereoPanner();
        this.realPanner.pan.setValueAtTime(-0.22, ctx.currentTime);
        this.realPanner.connect(this.filterNode);
        this.activeNodes.add(this.realPanner);

        this.shadowPanner = ctx.createStereoPanner();
        this.shadowPanner.pan.setValueAtTime(0.22, ctx.currentTime);
        this.shadowPanner.connect(this.filterNode);
        this.activeNodes.add(this.shadowPanner);
      } catch {
        this.realPanner = null;
        this.shadowPanner = null;
      }
    }

    // Subtle feedback delay line for space and depth
    this.delayNode = ctx.createDelay();
    this.delayNode.delayTime.setValueAtTime(0.42, ctx.currentTime);

    this.delayFeedback = ctx.createGain();
    this.delayFeedback.gain.setValueAtTime(0.18, ctx.currentTime);

    this.delayNode.connect(this.delayFeedback);
    this.delayFeedback.connect(this.delayNode);
    this.delayNode.connect(bus);
    this.activeNodes.add(this.delayNode);
    this.activeNodes.add(this.delayFeedback);

    // Sub-bus gains: Real World harmonic pad vs Shadow World subterranean drone
    this.droneGain = ctx.createGain();
    this.droneGain.gain.setValueAtTime(0.08, ctx.currentTime);
    this.droneGain.connect(this.shadowPanner ?? this.filterNode);
    this.activeNodes.add(this.droneGain);

    this.padGain = ctx.createGain();
    this.padGain.gain.setValueAtTime(0.05, ctx.currentTime);
    this.padGain.connect(this.realPanner ?? this.filterNode);
    this.activeNodes.add(this.padGain);

    this.pulseGain = ctx.createGain();
    this.pulseGain.gain.setValueAtTime(0.03, ctx.currentTime);
    this.pulseGain.connect(this.filterNode);
    this.activeNodes.add(this.pulseGain);

    this.textureGain = ctx.createGain();
    this.textureGain.gain.setValueAtTime(0.012, ctx.currentTime);
    this.textureGain.connect(this.shadowPanner ?? bus);
    this.activeNodes.add(this.textureGain);
  }

  // =========================================================================
  // 1. MAIN MENU MUSIC ENGINE (Minimal Piano + Deep Drone + Textures)
  // =========================================================================

  private startMenuMusic(ctx: AudioContext): void {
    // 1. Deep Sub-Bass Foundation (43.65 Hz / F0 & 55 Hz / A0)
    this.spawnContinuousDrone(ctx, [43.65, 65.41], 'sine', this.droneGain!);

    // 2. Dissonant Atmospheric Pad (D minor 9th / F tritone: 146.83, 174.61, 207.65)
    this.spawnContinuousDrone(ctx, [146.83, 174.61, 207.65], 'triangle', this.padGain!);

    // 3. Ethereal Void Texture (Filtered White Noise Whisper)
    this.spawnVoidTexture(ctx, this.textureGain!);

    // 4. Procedural Minimal Piano Note Sequencer
    // Melancholic sparse notes in D minor pentatonic: D3, F3, A3, C4, E4, D4
    const pianoNotes = [146.83, 174.61, 220.0, 261.63, 329.63, 293.66, 174.61, 220.0];
    this.pianoSequenceStep = 0;

    const playNextPianoNote = () => {
      if (!this.isRunning || this.currentState !== 'menu') return;
      const noteFreq = pianoNotes[this.pianoSequenceStep % pianoNotes.length];
      this.pianoSequenceStep++;

      // Semi-randomized sparse timing (2.4s to 4.2s interval)
      this.synthesizePianoNote(ctx, noteFreq);

      const nextInterval = 2400 + Math.random() * 1800;
      const t = window.setTimeout(playNextPianoNote, nextInterval);
      this.timerIds.push(t);
    };

    const firstTimer = window.setTimeout(playNextPianoNote, 800);
    this.timerIds.push(firstTimer);
  }

  /**
   * Synthesizes an intimate, resonant minimal piano tone with physical hammer attack and long decay
   */
  private synthesizePianoNote(ctx: AudioContext, freq: number): void {
    const now = ctx.currentTime;
    const bus = this.realPanner ?? this.filterNode;
    if (!bus) return;

    // Filter node to roll off harsh frequencies above 750 Hz for a warm, felted acoustic piano
    const pianoFilter = ctx.createBiquadFilter();
    pianoFilter.type = 'lowpass';
    pianoFilter.frequency.setValueAtTime(750, now);
    pianoFilter.Q.setValueAtTime(0.8, now);
    pianoFilter.connect(bus);
    if (this.delayNode) {
      pianoFilter.connect(this.delayNode);
    }
    this.activeNodes.add(pianoFilter);

    // Warm harmonic partials: fundamental + soft octave
    const partials = [
      { mult: 1.0, type: 'sine' as OscillatorType, gain: 0.16, decay: 3.2 },
      { mult: 2.0, type: 'triangle' as OscillatorType, gain: 0.05, decay: 2.4 },
      { mult: 3.01, type: 'sine' as OscillatorType, gain: 0.018, decay: 1.4 },
    ];

    partials.forEach(({ mult, type, gain: peakGain, decay }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq * mult, now);

      // Warm acoustic felt hammer attack (25ms soft ramp, no harsh click/beep)
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(peakGain, now + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + decay);

      osc.connect(gain);
      gain.connect(pianoFilter);

      osc.start(now);
      osc.stop(now + decay);

      this.activeNodes.add(osc);
      this.activeNodes.add(gain);

      osc.onended = () => {
        this.activeNodes.delete(osc);
        this.activeNodes.delete(gain);
      };
    });

    window.setTimeout(() => {
      try {
        pianoFilter.disconnect();
        this.activeNodes.delete(pianoFilter);
      } catch {
        // Disconnected
      }
    }, 3500);
  }

  // =========================================================================
  // 2. DYNAMIC GAMEPLAY THRILLER SOUNDTRACK
  // =========================================================================

  private startGameplayMusic(ctx: AudioContext, chapter: ChapterName): void {
    const chapterRoots: Record<ChapterName, { base: number[]; pad: number[]; filterFreq: number }> = {
      'THE BEGINNING': {
        base: [36.71, 73.42], // D1 / D2
        pad: [146.83, 174.61, 220.0], // D minor
        filterFreq: 350,
      },
      'THE CONNECTION': {
        base: [49.0, 65.41], // G1 / C2 (diminished tension)
        pad: [196.0, 233.08, 293.66], // G minor
        filterFreq: 420,
      },
      'THE SEPARATION': {
        base: [43.65, 87.31], // F1 / F2 (dissonant razor-sharp)
        pad: [174.61, 220.0, 246.94], // F minor + sharp 4th (B)
        filterFreq: 520,
      },
      'THE REFLECTION': {
        base: [55.0, 110.0], // A1 / A2 (optical crystalline)
        pad: [220.0, 261.63, 329.63, 493.88], // A minor 9th
        filterFreq: 600,
      },
      'THE TRUTH': {
        base: [36.71, 55.0, 73.42], // D1 / A1 / D2 monumental
        pad: [146.83, 185.0, 220.0, 293.66], // Suspended tension
        filterFreq: 480,
      },
    };

    const config = chapterRoots[chapter] ?? chapterRoots['THE BEGINNING'];

    if (this.filterNode) {
      this.filterNode.frequency.setValueAtTime(config.filterFreq, ctx.currentTime);
    }

    // 1. Continuous Foundation Drone
    this.spawnContinuousDrone(ctx, config.base, 'sine', this.droneGain!);

    // 2. Evolving Dissonant Pad
    this.spawnContinuousDrone(ctx, config.pad, 'triangle', this.padGain!);

    // 3. Dimensional Whispering Texture
    this.spawnVoidTexture(ctx, this.textureGain!);

    // If initial state is an alert state, start the pulse loop
    if (this.currentState === 'hazard_proximity' || this.currentState === 'bomb_countdown') {
      this.triggerPulseLoop(ctx);
    }
  }

  private triggerPulseLoop(ctx: AudioContext): void {
    if (!this.isRunning || this.currentState === 'menu') return;
    if (this.currentState !== 'hazard_proximity' && this.currentState !== 'bomb_countdown') return;

    this.synthesizePulseBeat(ctx);

    const tempo = this.currentState === 'bomb_countdown' ? 450 : 700;
    const t = window.setTimeout(() => {
      this.triggerPulseLoop(ctx);
    }, tempo);
    this.timerIds.push(t);
  }

  private synthesizePulseBeat(ctx: AudioContext): void {
    const now = ctx.currentTime;
    const bus = this.pulseGain;
    if (!bus) return;

    // Organic subterranean heartbeat thud (only active during tension/hazard)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const isUrgent = this.currentState === 'bomb_countdown';
    const freq = isUrgent ? 90 : 65;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(36, now + 0.18);

    // Soft rounded attack (40ms) and natural decay, preventing sharp electronic clicks on phone speakers
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(isUrgent ? 0.20 : 0.07, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

    osc.connect(gain);
    gain.connect(bus);

    osc.start(now);
    osc.stop(now + 0.22);

    this.activeNodes.add(osc);
    this.activeNodes.add(gain);

    osc.onended = () => {
      this.activeNodes.delete(osc);
      this.activeNodes.delete(gain);
    };
  }

  private spawnContinuousDrone(ctx: AudioContext, freqs: number[], type: OscillatorType, target: GainNode): void {
    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      // Slight fixed micro-detune for lush chorus drift without CPU-intensive/clicking LFO nodes
      const detuneOffset = (idx % 2 === 0 ? 1 : -1) * (2.5 + idx * 0.8);
      osc.frequency.setValueAtTime(f, ctx.currentTime);
      osc.detune.setValueAtTime(detuneOffset, ctx.currentTime);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.45 / freqs.length, ctx.currentTime + 1.5);

      osc.connect(gain);
      gain.connect(target);

      osc.start();

      this.activeNodes.add(osc);
      this.activeNodes.add(gain);
    });
  }

  private spawnVoidTexture(ctx: AudioContext, target: GainNode): void {
    // Pure, crystal-clear harmonic shimmer pad (Zero random noise/hiss for pristine mobile speaker playback)
    const freqs = [440.0, 554.37, 659.25]; // A4, C#5, E5 ethereal triad
    freqs.forEach((f) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, ctx.currentTime);

      // Ultra-soft ambient bed: silky smooth fade-in without any hiss or digital noise
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.015 / freqs.length, ctx.currentTime + 2.0);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(500, ctx.currentTime);
      filter.Q.setValueAtTime(0.7, ctx.currentTime);

      osc.connect(gain);
      gain.connect(filter);
      filter.connect(target);

      osc.start();

      this.activeNodes.add(osc);
      this.activeNodes.add(gain);
      this.activeNodes.add(filter);
    });
  }

  // =========================================================================
  // 3. CINEMATIC SURPRISE & EVENT TRANSITIONS
  // =========================================================================

  /**
   * Dramatic sudden thriller sting
   */
  private triggerSurpriseSting(ctx: AudioContext): void {
    const now = ctx.currentTime;
    const bus = this.audioMgr.getMasterBus();
    if (!bus) return;

    // Sudden dissonant brassy cluster with sub-bass drop
    const freqs = [65.41, 138.59, 196.0, 277.18]; // C2, C#3, G3, C#4 (harsh tritone tension)
    freqs.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.85, now + 0.35);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

      osc.connect(gain);
      gain.connect(bus);

      osc.start(now);
      osc.stop(now + 0.45);

      this.activeNodes.add(osc);
      this.activeNodes.add(gain);
    });
  }

  /**
   * Tectonic environmental transformation swell
   */
  private triggerTransformationSwell(ctx: AudioContext): void {
    if (!this.filterNode) return;
    const now = ctx.currentTime;
    // Sweeps resonant lowpass from 200 Hz up to 1800 Hz and back
    this.filterNode.frequency.setValueAtTime(200, now);
    this.filterNode.frequency.exponentialRampToValueAtTime(1800, now + 0.6);
    this.filterNode.frequency.exponentialRampToValueAtTime(450, now + 1.8);
  }

  /**
   * Radiant 4-voice harmonic bloom upon level victory
   */
  private triggerLevelCompleteBloom(ctx: AudioContext): void {
    const now = ctx.currentTime;
    const bus = this.audioMgr.getMusicBus();
    if (!bus) return;

    // C5, G5, E6, C7 pure harmonious sine bloom
    const victoryChords = [523.25, 783.99, 1318.51, 2093.0];
    victoryChords.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.0001, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.08 + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 1.8);

      osc.connect(gain);
      gain.connect(bus);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 1.8);

      this.activeNodes.add(osc);
      this.activeNodes.add(gain);
    });
  }

  /**
   * Grand climactic resolution for Level 20 ending
   */
  private triggerEndingClimax(ctx: AudioContext): void {
    const now = ctx.currentTime;
    const bus = this.audioMgr.getMusicBus();
    if (!bus) return;

    // D minor slowly resolving to glorious D major (D - F# - A - D)
    const chords = [
      { freqs: [146.83, 220.0, 261.63, 349.23], delay: 0.0, dur: 4.0 }, // Dm7
      { freqs: [146.83, 220.0, 277.18, 369.99], delay: 3.5, dur: 5.5 }, // Dmaj7
      { freqs: [73.42, 146.83, 220.0, 293.66, 369.99, 440.0, 587.33], delay: 8.0, dur: 7.0 }, // Grand D Major
    ];

    chords.forEach(({ freqs, delay, dur }) => {
      freqs.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + delay);

        gain.gain.setValueAtTime(0.0001, now + delay);
        gain.gain.linearRampToValueAtTime(0.08, now + delay + 1.2);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + dur);

        osc.connect(gain);
        gain.connect(bus);

        osc.start(now + delay);
        osc.stop(now + delay + dur);

        this.activeNodes.add(osc);
        this.activeNodes.add(gain);
      });
    });
  }
}
