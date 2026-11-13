export class SoundEffects {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;

  constructor(initialMuted: boolean = false) {
    this.muted = initialMuted;
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public play(effect: 'step' | 'bump' | 'switch' | 'checkpoint' | 'death' | 'win' | 'ending'): void {
    switch (effect) {
      case 'step':
        this.playStep();
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
        this.playHazard();
        break;
      case 'win':
        this.playWin();
        break;
      case 'ending':
        this.playEndingTheme();
        break;
    }
  }

  private initContext(): void {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch((err) => {
        console.debug('Audio resume deferred:', err);
      });
    }
  }

  public playStep(): void {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch (err) {
      console.debug('Audio playStep error:', err);
    }
  }

  public playBump(): void {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(90, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch (err) {
      console.debug('Audio playBump error:', err);
    }
  }

  public playSwitch(): void {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(520, this.ctx.currentTime);
      osc.frequency.setValueAtTime(780, this.ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.1);
    } catch (err) {
      console.debug('Audio playSwitch error:', err);
    }
  }

  public playCheckpoint(): void {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const notes = [440, 554.37, 659.25];
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * 0.06);

        gain.gain.setValueAtTime(0.08, this.ctx!.currentTime + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + idx * 0.06 + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(this.ctx!.currentTime + idx * 0.06);
        osc.stop(this.ctx!.currentTime + idx * 0.06 + 0.18);
      });
    } catch (err) {
      console.debug('Audio playCheckpoint error:', err);
    }
  }

  public playHazard(): void {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + 0.22);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.22);
    } catch (err) {
      console.debug('Audio playHazard error:', err);
    }
  }

  public playWin(): void {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const melody = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      melody.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * 0.1);

        gain.gain.setValueAtTime(0.12, this.ctx!.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + idx * 0.1 + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(this.ctx!.currentTime + idx * 0.1);
        osc.stop(this.ctx!.currentTime + idx * 0.1 + 0.35);
      });
    } catch (err) {
      console.debug('Audio playWin error:', err);
    }
  }

  public playEndingTheme(): void {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      // Ethereal ambient resolution chords (Cmaj9 / Am / Em) with slow bloom
      const chords = [
        { freqs: [130.81, 196.0, 261.63, 329.63, 493.88], delay: 0.0, dur: 3.5 },
        { freqs: [110.0, 164.81, 220.0, 261.63, 392.0], delay: 3.2, dur: 4.0 },
        { freqs: [164.81, 246.94, 329.63, 392.0, 523.25], delay: 7.0, dur: 5.0 },
      ];

      chords.forEach(({ freqs, delay, dur }) => {
        freqs.forEach((freq) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + delay);

          // Slow soft bloom and long gentle fade
          gain.gain.setValueAtTime(0.001, this.ctx!.currentTime + delay);
          gain.gain.linearRampToValueAtTime(0.04, this.ctx!.currentTime + delay + 1.2);
          gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx!.currentTime + delay + dur);

          osc.connect(gain);
          gain.connect(this.ctx!.destination);

          osc.start(this.ctx!.currentTime + delay);
          osc.stop(this.ctx!.currentTime + delay + dur);
        });
      });
    } catch (err) {
      console.debug('Audio playEndingTheme error:', err);
    }
  }
}

