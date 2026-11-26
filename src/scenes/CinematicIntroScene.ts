import Phaser from 'phaser';
import { PALETTE } from '../core/constants';
import { AudioManager } from '../audio/AudioManager';
import { SoundEffects } from '../audio/SoundEffects';
import { StorageManager } from '../storage/StorageManager';
import { CharacterAnimator } from '../rendering/CharacterAnimator';
import { BackdropRenderer } from '../rendering/BackdropRenderer';
import { MoveDirection } from '../engine/MovementEngine';
import { MobileControlsOverlay } from '../ui/MobileControlsOverlay';

interface FloatingParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
  phase: number;
}

interface EnergyWave {
  radius: number;
  alpha: number;
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function easeInOutCubic(t: number): number {
  const x = clamp01(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

function easeOutCubic(t: number): number {
  const x = clamp01(t);
  return 1 - Math.pow(1 - x, 3);
}

/**
 * Computes smooth fade-in -> hold -> fade-out envelope for timed narrative captions.
 */
function captionEnvelope(t: number, start: number, fadeInEnd: number, fadeOutStart: number, end: number): number {
  if (t <= start || t >= end) return 0;
  if (t < fadeInEnd) {
    return easeOutCubic((t - start) / (fadeInEnd - start));
  }
  if (t <= fadeOutStart) {
    return 1;
  }
  return 1 - easeInOutCubic((t - fadeOutStart) / (end - fadeOutStart));
}

/**
 * CinematicIntroScene — 5-Scene Emotional Story Prologue (~14.2 seconds).
 *
 * Story arc:
 *  1. ONE SOUL.       (0.0s - 2.8s)  Single stickman illuminated in quiet minimal darkness
 *  2. TWO REALITIES.  (2.8s - 5.8s)  Center boundary forms; soul divides into two identical beings
 *  3. TWO LIVES.      (5.8s - 9.0s)  Entering Real (light) & Shadow (dark); shared movement origin
 *  4. ONE MIND.       (9.0s - 12.2s) Both turn toward each other; cyan pulse & synchronized step
 *  5. THE OTHER SIDE  (12.2s - 14.5s) Title & tagline reveal; smooth transition to Menu/Game
 */
export class CinematicIntroScene extends Phaser.Scene {
  private sfx!: SoundEffects;
  private isSkipped: boolean = false;
  private isCompleted: boolean = false;
  private isInitialized: boolean = false;
  private nextScene: string = 'MenuScene';
  private nextSceneData?: { levelId?: number };

  // Display Objects
  private bgGraphics!: Phaser.GameObjects.Graphics;
  private lightRayGraphics!: Phaser.GameObjects.Graphics;
  private spotlightSprite!: Phaser.GameObjects.Image;
  private shadowAuraSprite!: Phaser.GameObjects.Image;
  private particleGraphics!: Phaser.GameObjects.Graphics;
  private auraGraphics!: Phaser.GameObjects.Graphics;
  private centerLineGraphics!: Phaser.GameObjects.Graphics;
  private singleCharG!: Phaser.GameObjects.Graphics;
  private realCharG!: Phaser.GameObjects.Graphics;
  private shadowCharG!: Phaser.GameObjects.Graphics;

  // Story Narrative Caption (Single clean focal phrase at a time)
  private captionContainer!: Phaser.GameObjects.Container;
  private captionBackdropG!: Phaser.GameObjects.Graphics;
  private captionText!: Phaser.GameObjects.Text;

  // Scene 5 Iconic Split Title + Tagline (Consistent with MenuScene)
  private titleLeftText!: Phaser.GameObjects.Text;
  private titleRightText!: Phaser.GameObjects.Text;
  private subtitleContainer!: Phaser.GameObjects.Container;
  private subtitleBackdropG!: Phaser.GameObjects.Graphics;
  private subtitleText!: Phaser.GameObjects.Text;

  // Skip Button UI
  private skipBtnContainer!: Phaser.GameObjects.Container;
  private skipBtnBg!: Phaser.GameObjects.Rectangle;
  private skipBtnLabel!: Phaser.GameObjects.Text;

  // Ambient Particles & Energy Pulses
  private particles: FloatingParticle[] = [];
  private connectionWaves: EnergyWave[] = [];

  // Delta-Time Timeline State
  private animTimer: number = 0;
  private readonly totalDuration: number = 14200; // 14.2 seconds story + title hold
  private isReducedMotion: boolean = false;

  // Synchronized Audio Milestone Flags (driven directly by delta-time timeline)
  private audioFired = {
    ambience: false,
    separation: false,
    split: false,
    worldEntry: false,
    connectionPulse: false,
    titleImpact: false,
  };

  // Frame Visual State
  private spotlightAlpha: number = 0;
  private singleCharAlpha: number = 0;
  private splitProgress: number = 0;
  private leftWorldBrightness: number = 0;
  private rightWorldBrightness: number = 0;
  private dividerProgress: number = 0; // vertical draw growth 0 -> 1
  private dividerAlpha: number = 0;
  private disturbanceIntensity: number = 0;
  private pulseIntensity: number = 0;
  private charactersGlobalAlpha: number = 1;
  private titleAlpha: number = 0;
  private subtitleAlpha: number = 0;

  // Stored Listeners for Clean Teardown
  private skipKeyHandler?: () => void;

  constructor() {
    super('CinematicIntroScene');
  }

  public init(data?: { nextScene?: string; levelId?: number }): void {
    // Guard against duplicate re-initialization while already running cleanly
    this.nextScene = data?.nextScene ?? 'MenuScene';
    this.nextSceneData = data?.levelId !== undefined ? { levelId: data.levelId } : undefined;
    this.isSkipped = false;
    this.isCompleted = false;
    this.isInitialized = true;
    this.animTimer = 0;

    this.spotlightAlpha = 0;
    this.singleCharAlpha = 0;
    this.splitProgress = 0;
    this.leftWorldBrightness = 0;
    this.rightWorldBrightness = 0;
    this.dividerProgress = 0;
    this.dividerAlpha = 0;
    this.disturbanceIntensity = 0;
    this.pulseIntensity = 0;
    this.charactersGlobalAlpha = 1;
    this.titleAlpha = 0;
    this.subtitleAlpha = 0;

    this.particles = [];
    this.connectionWaves = [];
    this.audioFired = {
      ambience: false,
      separation: false,
      split: false,
      worldEntry: false,
      connectionPulse: false,
      titleImpact: false,
    };

    BackdropRenderer.setMode('menu');
    BackdropRenderer.setThemeState({ leftBrightness: 0, rightBrightness: 0, dividerAlpha: 0 });

    const storage = new StorageManager();
    this.isReducedMotion = storage.getProgress().reducedMotion;
    const audio = AudioManager.getInstance();
    audio.init(storage);
    this.sfx = audio.sfx;
  }

  public create(): void {
    if (!this.isInitialized) return;

    const { width, height } = this.scale;
    const halfW = width / 2;

    // Ensure touch gameplay controls are never active/visible during intro
    MobileControlsOverlay.getInstance().setVisible(false);

    // 1. Layered Graphics Architecture + Smooth Radial Glow Textures
    this.ensureGlowTextures();
    this.bgGraphics = this.add.graphics().setDepth(0);
    this.lightRayGraphics = this.add.graphics().setDepth(1);
    this.spotlightSprite = this.add
      .image(halfW, height * 0.59 - 8, 'intro_soft_white_glow')
      .setDepth(1)
      .setAlpha(0);
    this.shadowAuraSprite = this.add
      .image(width * 0.75, height * 0.59, 'intro_soft_cyan_glow')
      .setDepth(1)
      .setAlpha(0);
    this.particleGraphics = this.add.graphics().setDepth(2);
    this.auraGraphics = this.add.graphics().setDepth(4);
    this.centerLineGraphics = this.add.graphics().setDepth(6);
    this.singleCharG = this.add.graphics().setDepth(8);
    this.realCharG = this.add.graphics().setDepth(8);
    this.shadowCharG = this.add.graphics().setDepth(8);

    // 2. Story Narrative Caption Container (Scenes 1 - 4)
    this.captionContainer = this.add.container(halfW, height * 0.23).setDepth(22);
    this.captionBackdropG = this.add.graphics();
    this.captionText = this.add
      .text(0, 0, '', {
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '30px',
        fontStyle: 'bold',
        color: '#FFFFFF',
        letterSpacing: 7,
      })
      .setOrigin(0.5);
    this.captionContainer.add([this.captionBackdropG, this.captionText]);
    this.captionContainer.setAlpha(0);

    // 3. Scene 5 Title & Tagline (Consistent with MenuScene typography & layout)
    this.titleLeftText = this.add
      .text(halfW - 20, 160, 'THE OTHER', {
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '48px',
        fontStyle: 'bold',
        color: PALETTE.real.text,
        letterSpacing: 4,
      })
      .setOrigin(1, 0.5)
      .setAlpha(0)
      .setDepth(24);

    this.titleRightText = this.add
      .text(halfW + 20, 160, 'SIDE', {
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '48px',
        fontStyle: 'bold',
        color: PALETTE.shadow.text,
        letterSpacing: 4,
      })
      .setOrigin(0, 0.5)
      .setAlpha(0)
      .setDepth(24);

    this.subtitleContainer = this.add.container(halfW, 224).setDepth(24).setAlpha(0);
    this.subtitleBackdropG = this.add.graphics();
    this.subtitleText = this.add
      .text(0, 0, 'TWO WORLDS. ONE MIND.', {
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '18px',
        fontStyle: 'bold',
        color: '#00E5FF',
        letterSpacing: 4,
      })
      .setOrigin(0.5);
    this.drawSubtitleBackdrop(0);
    this.subtitleContainer.add([this.subtitleBackdropG, this.subtitleText]);

    // 4. Accessible Skip Intro Button (Tactile & responsive)
    this.createSkipButton(width);

    // 5. Block Accidental Gameplay Keys & Bind Only Intentional Skip Shortcuts
    this.skipKeyHandler = () => this.skipIntro();
    this.input.keyboard?.on('keydown-SPACE', this.skipKeyHandler);
    this.input.keyboard?.on('keydown-ENTER', this.skipKeyHandler);
    this.input.keyboard?.on('keydown-ESC', this.skipKeyHandler);

    // Allow tapping empty space during final title hold to proceed cleanly
    this.input.on('pointerdown', () => {
      if (this.animTimer >= 12800) {
        this.skipIntro();
      }
    });

    // 6. Responsive Resize & Lifecycle Teardown
    this.scale.on('resize', this.onResize, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);

    // 7. Ambient Atmospheric Particles
    this.initAtmosphericParticles(width, height);
  }

  private ensureGlowTextures(): void {
    const createGlowTex = (key: string, innerRgba: string, midRgba: string) => {
      if (this.textures.exists(key)) return;
      const size = 256;
      const tex = this.textures.createCanvas(key, size, size);
      if (!tex) return;
      const ctx = tex.getContext();
      const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      grad.addColorStop(0, innerRgba);
      grad.addColorStop(0.45, midRgba);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);
      tex.refresh();
    };

    createGlowTex('intro_soft_white_glow', 'rgba(235, 250, 255, 0.22)', 'rgba(0, 229, 255, 0.08)');
    createGlowTex('intro_soft_cyan_glow', 'rgba(0, 229, 255, 0.16)', 'rgba(0, 229, 255, 0.05)');
  }

  private drawCaptionBackdrop(textWidth: number, backdropStrength: number): void {
    const g = this.captionBackdropG;
    g.clear();
    if (backdropStrength <= 0.01) return;

    const padX = 36;
    const w = Math.max(220, textWidth + padX * 2);
    const h = 56;

    // Soft outer feather + nearly opaque obsidian capsule so the center threshold never cuts through letters
    g.fillStyle(0x09090d, 0.35 * backdropStrength);
    g.fillRoundedRect(-w / 2 - 12, -h / 2 - 6, w + 24, h + 12, 16);

    g.fillStyle(0x09090d, 0.97 * backdropStrength);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 10);

    // Subtle cyan hairline accent along bottom edge
    g.lineStyle(1, 0x00e5ff, 0.42 * backdropStrength);
    g.lineBetween(-w * 0.25, h / 2, w * 0.25, h / 2);
  }

  private drawSubtitleBackdrop(alphaScale: number): void {
    const g = this.subtitleBackdropG;
    g.clear();
    const w = 360;
    const h = 36;
    const a = alphaScale <= 0 ? 1 : alphaScale;

    g.fillStyle(0x0a0a0e, 0.97 * a);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 18);
    g.lineStyle(1, 0x00e5ff, 0.35 * a);
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 18);
  }

  private createSkipButton(width: number): void {
    const btnW = 148;
    const btnH = 44;
    const btnX = width - btnW / 2 - 22;
    const btnY = 36;

    this.skipBtnContainer = this.add.container(btnX, btnY).setDepth(50);

    this.skipBtnBg = this.add
      .rectangle(0, 0, btnW, btnH, 0x0a0a0e, 0.78)
      .setStrokeStyle(1.5, 0x666666, 0.85)
      .setInteractive({ useHandCursor: true });

    this.skipBtnLabel = this.add
      .text(0, 0, 'SKIP INTRO', {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '13px',
        fontStyle: 'bold',
        color: '#E0E0E0',
        letterSpacing: 2,
      })
      .setOrigin(0.5);

    this.skipBtnContainer.add([this.skipBtnBg, this.skipBtnLabel]);

    this.skipBtnBg.on('pointerover', () => {
      this.skipBtnBg.setStrokeStyle(1.5, 0x00e5ff, 1);
      this.skipBtnLabel.setColor('#00E5FF');
    });

    this.skipBtnBg.on('pointerout', () => {
      this.skipBtnBg.setStrokeStyle(1.5, 0x666666, 0.85);
      this.skipBtnLabel.setColor('#E0E0E0');
    });

    this.skipBtnBg.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      pointer.event?.stopPropagation();
      this.sfx.playUiClick();
      this.skipIntro();
    });
  }

  private initAtmosphericParticles(width: number, height: number): void {
    const count = this.isReducedMotion ? 10 : 34;
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 14,
        vy: -8 - Math.random() * 16,
        alpha: 0.16 + Math.random() * 0.42,
        size: 1.4 + Math.random() * 2.2,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  public update(_time: number, delta: number): void {
    if (this.isSkipped || this.isCompleted) return;

    // Cap delta to prevent abrupt timeline skips after tab switches
    const dtMs = Math.min(delta, 100);
    this.animTimer += dtMs;
    const t = this.animTimer;
    const { width, height } = this.scale;

    // -------------------------------------------------------------------------
    // 1. DELTA-TIME SYNCHRONIZED AUDIO MILESTONES
    // -------------------------------------------------------------------------
    if (!this.audioFired.ambience && t >= 50) {
      this.audioFired.ambience = true;
      this.sfx.playCinematicAmbience();
    }
    if (!this.audioFired.separation && t >= 2850) {
      this.audioFired.separation = true;
      this.sfx.playCinematicSeparation();
    }
    if (!this.audioFired.split && t >= 3700) {
      this.audioFired.split = true;
      this.sfx.playCinematicSplit();
    }
    if (!this.audioFired.worldEntry && t >= 6100) {
      this.audioFired.worldEntry = true;
      this.sfx.playCinematicWorldEntry();
    }
    if (!this.audioFired.connectionPulse && t >= 9500) {
      this.audioFired.connectionPulse = true;
      this.sfx.playCinematicConnectionPulse();
      // Emit two gentle harmonic cyan waves across the two worlds
      this.connectionWaves.push({ radius: 4, alpha: 0.9 });
    }
    if (this.connectionWaves.length === 1 && t >= 10150 && t < 11800) {
      this.connectionWaves.push({ radius: 4, alpha: 0.65 });
    }
    if (!this.audioFired.titleImpact && t >= 12250) {
      this.audioFired.titleImpact = true;
      this.sfx.playCinematicImpact();
    }

    // -------------------------------------------------------------------------
    // 2. 5-SCENE STORY TIMELINE ORCHESTRATION (0.0s -> 14.2s)
    // -------------------------------------------------------------------------
    let activeCaption = '';
    let captionAlpha = 0;
    let captionTracking = 7;
    let captionBackdropAlpha = 0;

    // SCENE 1: ONE SOUL. (0.0s - 2.8s)
    if (t < 2800) {
      const p = t / 2800;
      this.spotlightAlpha = easeOutCubic(clamp01(t / 1600));
      this.singleCharAlpha = easeOutCubic(clamp01((t - 200) / 1300));
      this.splitProgress = 0;
      this.leftWorldBrightness = 0;
      this.rightWorldBrightness = 0;
      this.dividerProgress = 0;
      this.dividerAlpha = 0;
      this.disturbanceIntensity = 0;
      this.pulseIntensity = 0;
      this.charactersGlobalAlpha = 1;
      this.titleAlpha = 0;
      this.subtitleAlpha = 0;

      activeCaption = 'ONE SOUL.';
      captionAlpha = captionEnvelope(t, 450, 1150, 2100, 2700);
      captionTracking = 5 + easeOutCubic(p) * 4;
      captionBackdropAlpha = 0; // Pure dark canvas; no backdrop capsule needed
    }
    // SCENE 2: TWO REALITIES. (2.8s - 5.8s)
    else if (t < 5800) {
      const p = (t - 2800) / 3000;
      this.spotlightAlpha = Math.max(0, 1 - p * 1.4);

      // Subtle central energy disturbance builds (2.8s -> 3.6s), then eases off
      const distCurve = p < 0.3 ? Math.sin((p / 0.3) * Math.PI * 0.5) : Math.max(0, 1 - (p - 0.3) / 0.55);
      this.disturbanceIntensity = distCurve;

      // Central dividing line blooms cleanly vertically from center outward
      this.dividerProgress = easeOutCubic(clamp01((t - 2950) / 1300));
      this.dividerAlpha = clamp01((t - 2850) / 700);

      // Single silhouette yields to two identical figures beginning at t = 3450ms
      if (t < 3500) {
        this.singleCharAlpha = 1;
        this.splitProgress = 0;
      } else {
        const sepP = (t - 3500) / 2300;
        this.singleCharAlpha = Math.max(0, 1 - sepP * 5);
        this.splitProgress = easeInOutCubic(sepP) * 0.52;
      }

      // Worlds begin diverging gently
      const diverge = easeInOutCubic(clamp01((t - 3600) / 2200));
      this.leftWorldBrightness = diverge * 0.55;
      this.rightWorldBrightness = diverge * 0.55;
      this.pulseIntensity = 0;
      this.charactersGlobalAlpha = 1;
      this.titleAlpha = 0;
      this.subtitleAlpha = 0;

      activeCaption = 'TWO REALITIES.';
      captionAlpha = captionEnvelope(t, 3100, 3750, 5050, 5680);
      captionTracking = 5 + easeOutCubic(p) * 3.5;
      captionBackdropAlpha = diverge * captionAlpha;
    }
    // SCENE 3: TWO LIVES. (5.8s - 9.0s)
    else if (t < 9000) {
      const p = (t - 5800) / 3200;
      this.spotlightAlpha = 0;
      this.disturbanceIntensity = 0;
      this.singleCharAlpha = 0;
      this.dividerProgress = 1;
      this.dividerAlpha = 1;

      // Characters glide smoothly into their respective world centers (0.52 -> 1.0)
      const settle = easeOutCubic(clamp01((t - 5800) / 1500));
      this.splitProgress = 0.52 + settle * 0.48;
      this.leftWorldBrightness = 0.55 + settle * 0.45;
      this.rightWorldBrightness = 0.55 + settle * 0.45;
      this.pulseIntensity = 0;
      this.charactersGlobalAlpha = 1;
      this.titleAlpha = 0;
      this.subtitleAlpha = 0;

      activeCaption = 'TWO LIVES.';
      captionAlpha = captionEnvelope(t, 6100, 6750, 8250, 8850);
      captionTracking = 6 + easeOutCubic(p) * 3;
      captionBackdropAlpha = captionAlpha;
    }
    // SCENE 4: ONE MIND. (9.0s - 12.2s)
    else if (t < 12200) {
      const p = (t - 9000) / 3200;
      this.spotlightAlpha = 0;
      this.disturbanceIntensity = 0;
      this.singleCharAlpha = 0;
      this.splitProgress = 1.0;
      this.leftWorldBrightness = 1.0;
      this.rightWorldBrightness = 1.0;
      this.dividerProgress = 1;
      this.dividerAlpha = 1;
      this.charactersGlobalAlpha = 1;
      this.titleAlpha = 0;
      this.subtitleAlpha = 0;

      // Cyan mind-connection pulse swells softly between 9.45s and 11.4s
      const pulseWindow = clamp01((t - 9450) / 2000);
      this.pulseIntensity = t >= 9450 && t <= 11450 ? Math.sin(pulseWindow * Math.PI) : 0;

      activeCaption = 'ONE MIND.';
      captionAlpha = captionEnvelope(t, 9200, 9850, 11450, 12050);
      captionTracking = 7 + easeOutCubic(p) * 4;
      captionBackdropAlpha = captionAlpha;
    }
    // SCENE 5: TITLE REVEAL — THE OTHER SIDE / TWO WORLDS. ONE MIND. (12.2s - 14.2s)
    else {
      const p = clamp01((t - 12200) / 1500);
      this.spotlightAlpha = 0;
      this.disturbanceIntensity = 0;
      this.singleCharAlpha = 0;
      this.splitProgress = 1.0;
      this.leftWorldBrightness = 1.0;
      this.rightWorldBrightness = 1.0;
      this.dividerProgress = 1;
      this.dividerAlpha = 1;
      this.pulseIntensity = 0.25 * (1 - p);

      // Keep both silhouettes crisp and distinct beneath the title tableau
      this.charactersGlobalAlpha = 1 - easeInOutCubic(clamp01((t - 12200) / 900)) * 0.1;
      this.titleAlpha = easeOutCubic(clamp01((t - 12250) / 850));
      this.subtitleAlpha = easeOutCubic(clamp01((t - 12750) / 800));

      activeCaption = '';
      captionAlpha = 0;
      captionBackdropAlpha = 0;

      if (t >= this.totalDuration && !this.isCompleted) {
        this.completeIntro();
      }
    }

    // Update Caption Visuals
    this.updateCaptionDisplay(activeCaption, captionAlpha, captionTracking, captionBackdropAlpha);

    // Update Title & Tagline Visuals
    this.titleLeftText.setAlpha(this.titleAlpha);
    this.titleRightText.setAlpha(this.titleAlpha);
    this.subtitleContainer.setAlpha(this.subtitleAlpha);

    // Render Canvas Frame
    this.renderFrame(width, height, dtMs);
  }

  private updateCaptionDisplay(text: string, alpha: number, tracking: number, backdropAlpha: number): void {
    if (alpha <= 0.005 || !text) {
      this.captionContainer.setAlpha(0);
      return;
    }

    if (this.captionText.text !== text) {
      this.captionText.setText(text);
    }
    this.captionText.setLetterSpacing(Math.round(tracking));
    this.captionContainer.setAlpha(alpha);
    this.drawCaptionBackdrop(this.captionText.width, backdropAlpha);
  }

  private renderFrame(width: number, height: number, dtMs: number): void {
    const dt = dtMs / 1000;
    const t = this.animTimer;
    const halfW = width / 2;
    const charY = height * 0.59; // Balanced lower-center focal position, clear of upper captions & Scene 5 title
    const cellSize = Math.max(52, Math.min(72, height * 0.105));

    // -------------------------------------------------------------------------
    // 1. DUAL-WORLD BACKGROUNDS & VIEWPORT BACKDROP SYNC
    // -------------------------------------------------------------------------
    this.bgGraphics.clear();

    BackdropRenderer.setThemeState({
      leftBrightness: this.leftWorldBrightness,
      rightBrightness: this.rightWorldBrightness,
      dividerAlpha: this.dividerAlpha * 0.85,
    });

    const leftVal = Math.round(this.leftWorldBrightness * 255);
    const leftColor = (leftVal << 16) | (leftVal << 8) | leftVal;
    this.bgGraphics.fillStyle(leftColor, 1);
    this.bgGraphics.fillRect(0, 0, halfW, height);

    const rightVal = Math.round(this.rightWorldBrightness * 0x10);
    const rightColor = (rightVal << 16) | (rightVal << 8) | rightVal;
    this.bgGraphics.fillStyle(rightColor, 1);
    this.bgGraphics.fillRect(halfW, 0, halfW, height);

    // -------------------------------------------------------------------------
    // 2. SOFT SPOTLIGHT (SCENE 1) & FLOWING REAL-WORLD LIGHT / SHADOW RAYS
    // -------------------------------------------------------------------------
    this.lightRayGraphics.clear();

    if (this.spotlightAlpha > 0.01) {
      const glowDiameter = cellSize * 6.2;
      this.spotlightSprite
        .setPosition(halfW, charY - 8)
        .setDisplaySize(glowDiameter, glowDiameter)
        .setAlpha(this.spotlightAlpha);
    } else {
      this.spotlightSprite.setAlpha(0);
    }

    if (this.leftWorldBrightness > 0.15 && !this.isReducedMotion) {
      const rayDrift = Math.sin(t * 0.0007) * 28;
      this.lightRayGraphics.fillStyle(0xdbe8f0, 0.16 * this.leftWorldBrightness);
      this.lightRayGraphics.fillTriangle(
        halfW * 0.18 + rayDrift, 0,
        halfW * 0.45 + rayDrift, 0,
        halfW * 0.12, height
      );
      this.lightRayGraphics.fillStyle(0xe8eef2, 0.14 * this.leftWorldBrightness);
      this.lightRayGraphics.fillTriangle(
        halfW * 0.58 - rayDrift * 0.6, 0,
        halfW * 0.78 - rayDrift * 0.6, 0,
        halfW * 0.42, height
      );
    }

    if (this.rightWorldBrightness > 0.15 && !this.isReducedMotion) {
      const shadowPulse = 0.75 + 0.25 * Math.sin(t * 0.0014);
      const auraDiameter = cellSize * 6.8;
      this.shadowAuraSprite
        .setPosition(width * 0.75, charY)
        .setDisplaySize(auraDiameter, auraDiameter)
        .setAlpha(shadowPulse * this.rightWorldBrightness);
    } else {
      this.shadowAuraSprite.setAlpha(0);
    }

    // -------------------------------------------------------------------------
    // 3. FLOATING ATMOSPHERIC PARTICLES
    // -------------------------------------------------------------------------
    this.particleGraphics.clear();
    for (const pt of this.particles) {
      if (!this.isReducedMotion) {
        pt.x += (pt.vx + Math.sin(t * 0.001 + pt.phase) * 4) * dt;
        pt.y += pt.vy * dt;
      }

      if (pt.y < -12) {
        pt.y = height + 12;
        pt.x = Math.random() * width;
      }
      if (pt.x < -12) pt.x = width + 12;
      if (pt.x > width + 12) pt.x = -12;

      const onBrightLeft = pt.x < halfW && this.leftWorldBrightness > 0.45;
      const ptColor = onBrightLeft ? 0x6a7680 : 0x00e5ff;
      const ptAlpha = onBrightLeft ? pt.alpha * 0.55 : pt.alpha;
      this.particleGraphics.fillStyle(ptColor, ptAlpha);
      this.particleGraphics.fillCircle(pt.x, pt.y, pt.size);
    }

    // -------------------------------------------------------------------------
    // 4. CENTRAL DIVIDING LINE & ENERGY PULSE / DISTURBANCE
    // -------------------------------------------------------------------------
    this.centerLineGraphics.clear();
    if (this.dividerAlpha > 0.01 && this.dividerProgress > 0.01) {
      const spanHalfH = (height / 2) * this.dividerProgress;
      const yTop = charY - (charY) * this.dividerProgress;
      const yBot = charY + (height - charY) * this.dividerProgress;
      const lineTop = Math.max(0, Math.min(yTop, height / 2 - spanHalfH));
      const lineBot = Math.min(height, Math.max(yBot, height / 2 + spanHalfH));

      // Outer subtle cyan energy glow
      const pulseBoost = this.pulseIntensity * 0.45;
      this.centerLineGraphics.lineStyle(4, 0x00e5ff, (0.28 + pulseBoost) * this.dividerAlpha);
      this.centerLineGraphics.lineBetween(halfW, lineTop, halfW, lineBot);

      // Inner crisp threshold line
      this.centerLineGraphics.lineStyle(1.5, 0xffffff, 0.85 * this.dividerAlpha);
      this.centerLineGraphics.lineBetween(halfW, lineTop, halfW, lineBot);

      // Subtle traveling energy bead along divider in Scene 3-5
      if (!this.isReducedMotion && this.dividerProgress > 0.85) {
        const beadY = height * (0.5 + 0.38 * Math.sin(t * 0.0012));
        this.centerLineGraphics.fillStyle(0x00e5ff, 0.7 * this.dividerAlpha);
        this.centerLineGraphics.fillCircle(halfW, beadY, 3);
      }
    }

    // Connection Waves (Scene 4: pulse traveling outward between the two minds)
    this.auraGraphics.clear();
    if (this.disturbanceIntensity > 0.02) {
      const ringR = cellSize * (0.7 + (1 - this.disturbanceIntensity) * 0.9);
      this.auraGraphics.lineStyle(2, 0x00e5ff, 0.45 * this.disturbanceIntensity);
      this.auraGraphics.strokeCircle(halfW, charY - cellSize * 0.08, ringR);
    }

    for (let i = this.connectionWaves.length - 1; i >= 0; i--) {
      const w = this.connectionWaves[i];
      w.radius += dt * (width * 0.36);
      w.alpha = Math.max(0, w.alpha - dt * 0.55);
      if (w.alpha <= 0.01) {
        this.connectionWaves.splice(i, 1);
        continue;
      }
      this.auraGraphics.lineStyle(2, 0x00e5ff, w.alpha * 0.6);
      this.auraGraphics.strokeCircle(halfW, charY - cellSize * 0.08, w.radius);
    }

    // -------------------------------------------------------------------------
    // 5. CHARACTER POSITIONS, SYNCHRONIZED GESTURES & IDENTICAL SILHOUETTES
    // -------------------------------------------------------------------------
    if (this.singleCharAlpha > 0.01) {
      this.singleCharG.setPosition(halfW, charY);
      this.singleCharG.setAlpha(this.singleCharAlpha);
      CharacterAnimator.renderProceduralStickman(
        this.singleCharG,
        false,
        cellSize,
        0,
        'down',
        0xffffff,
        0x000000,
        t / 1000,
        this.isReducedMotion
      );
    } else {
      this.singleCharG.clear();
    }

    if (this.splitProgress > 0.001) {
      const realAnchorX = width * 0.25;
      const shadowAnchorX = width * 0.75;

      let realX = halfW - (halfW - realAnchorX) * this.splitProgress;
      let shadowX = halfW + (shadowAnchorX - halfW) * this.splitProgress;

      let realWalkPhase = 0;
      let shadowWalkPhase = 0;
      let realFacing: MoveDirection = 'left';
      let shadowFacing: MoveDirection = 'right';

      // Scene 2 (3.5s - 5.8s): Gentle coordinated stride outward
      if (t < 5800) {
        const moveP = clamp01((t - 3500) / 2300);
        const stride = Math.sin(moveP * Math.PI * 3.5) * 0.22;
        realWalkPhase = stride;
        shadowWalkPhase = stride;
        realFacing = 'left';
        shadowFacing = 'right';
      }
      // Scene 3 (5.8s - 9.0s): Enter both worlds, then perform coordinated mirrored gesture
      else if (t < 9000) {
        if (t < 7300) {
          const entryP = clamp01((t - 5800) / 1500);
          const stride = Math.sin(entryP * Math.PI * 2.5) * 0.2;
          realWalkPhase = stride;
          shadowWalkPhase = stride;
          realFacing = 'left';
          shadowFacing = 'right';
        } else {
          // Coordinated identical pause & glance ("same person" visual cue)
          const subT = t - 7300; // 0..1700ms
          if (subT < 750) {
            realFacing = 'down';
            shadowFacing = 'down';
          } else {
            // Subtle synchronized head turn toward upper sky / horizon
            realFacing = 'up';
            shadowFacing = 'up';
          }
          // Subtle coordinated weight shift
          const sway = this.isReducedMotion ? 0 : Math.sin((subT / 1700) * Math.PI) * 0.06;
          realWalkPhase = sway;
          shadowWalkPhase = sway;
        }
      }
      // Scene 4 (9.0s - 12.2s): Turn toward each other + synchronized inward step on cyan pulse
      else {
        realFacing = 'right';
        shadowFacing = 'left';

        // Synchronized step forward toward the dividing line between 10.1s and 11.1s
        const stepOffset = 28;
        if (t >= 10050 && t < 11050) {
          const stepP = easeInOutCubic((t - 10050) / 1000);
          realX += stepOffset * stepP;
          shadowX -= stepOffset * stepP;
          const stride = Math.sin(stepP * Math.PI * 2) * 0.22;
          realWalkPhase = stride;
          shadowWalkPhase = stride;
        } else if (t >= 11050) {
          realX += stepOffset;
          shadowX -= stepOffset;
        }
      }

      // Subtle cyan connection beam between the two characters during Scene 4 pulse
      if (this.pulseIntensity > 0.02) {
        const headOffsetY = -cellSize * 0.22;
        this.auraGraphics.lineStyle(1.5, 0x00e5ff, 0.35 * this.pulseIntensity);
        this.auraGraphics.lineBetween(realX, charY + headOffsetY, shadowX, charY + headOffsetY);
        this.auraGraphics.fillStyle(0x00e5ff, 0.5 * this.pulseIntensity);
        this.auraGraphics.fillCircle(realX, charY + headOffsetY, cellSize * 0.22);
        this.auraGraphics.fillCircle(shadowX, charY + headOffsetY, cellSize * 0.22);
      }

      // Smooth color transition for Real stickman as left world brightens
      const realVal = Math.round(255 - this.leftWorldBrightness * 247); // 0xffffff -> 0x080808
      const realColor = (realVal << 16) | (realVal << 8) | realVal;
      const realEyeColor = this.leftWorldBrightness > 0.45 ? 0xffffff : 0x000000;

      const splitFade = clamp01(this.splitProgress * 4.5) * this.charactersGlobalAlpha;

      // Render Real World Stickman (exact gameplay design)
      this.realCharG.setPosition(realX, charY);
      this.realCharG.setAlpha(splitFade);
      CharacterAnimator.renderProceduralStickman(
        this.realCharG,
        true,
        cellSize,
        realWalkPhase,
        realFacing,
        realColor,
        realEyeColor,
        t / 1000,
        this.isReducedMotion
      );

      // Render Shadow World Stickman (exact identical gameplay design)
      this.shadowCharG.setPosition(shadowX, charY);
      this.shadowCharG.setAlpha(splitFade);
      CharacterAnimator.renderProceduralStickman(
        this.shadowCharG,
        false,
        cellSize,
        shadowWalkPhase,
        shadowFacing,
        PALETTE.shadow.character,
        0x000000,
        t / 1000,
        this.isReducedMotion
      );
    } else {
      this.realCharG.clear();
      this.shadowCharG.clear();
    }
  }

  private onResize(gameSize: Phaser.Structs.Size): void {
    const width = gameSize.width;
    const height = gameSize.height;
    const halfW = width / 2;

    this.captionContainer?.setPosition(halfW, height * 0.23);
    this.titleLeftText?.setPosition(halfW - 20, 160);
    this.titleRightText?.setPosition(halfW + 20, 160);
    this.subtitleContainer?.setPosition(halfW, 224);

    if (this.skipBtnContainer) {
      const btnW = 148;
      this.skipBtnContainer.setPosition(width - btnW / 2 - 22, 36);
    }
  }

  private skipIntro(): void {
    if (this.isSkipped || this.isCompleted) return;
    this.isSkipped = true;
    this.cleanupAudioAndTimers();
    BackdropRenderer.resetThemeState();

    this.cameras.main.fadeOut(250, 0, 0, 0);
    this.time.delayedCall(250, () => {
      this.scene.start(this.nextScene, this.nextSceneData);
    });
  }

  private completeIntro(): void {
    if (this.isCompleted || this.isSkipped) return;
    this.isCompleted = true;

    // Gentle hold on final title tableau, then smooth transition into Menu/Game
    this.time.delayedCall(900, () => {
      if (this.isSkipped) return;
      this.cleanupAudioAndTimers();
      BackdropRenderer.resetThemeState();
      this.cameras.main.fadeOut(350, 0, 0, 0);
      this.time.delayedCall(350, () => {
        this.scene.start(this.nextScene, this.nextSceneData);
      });
    });
  }

  private cleanupAudioAndTimers(): void {
    this.sfx?.stopCinematicCues();
    this.tweens?.killAll();
    if (this.skipKeyHandler) {
      this.input.keyboard?.off('keydown-SPACE', this.skipKeyHandler);
      this.input.keyboard?.off('keydown-ENTER', this.skipKeyHandler);
      this.input.keyboard?.off('keydown-ESC', this.skipKeyHandler);
      this.skipKeyHandler = undefined;
    }
  }

  public shutdown(): void {
    this.isInitialized = false;
    this.cleanupAudioAndTimers();
    BackdropRenderer.resetThemeState();
    this.scale.off('resize', this.onResize, this);
    this.singleCharG?.destroy();
    this.realCharG?.destroy();
    this.shadowCharG?.destroy();
    this.spotlightSprite?.destroy();
    this.shadowAuraSprite?.destroy();
    this.bgGraphics?.destroy();
    this.lightRayGraphics?.destroy();
    this.particleGraphics?.destroy();
    this.auraGraphics?.destroy();
    this.centerLineGraphics?.destroy();
    this.captionBackdropG?.destroy();
    this.subtitleBackdropG?.destroy();
  }
}
