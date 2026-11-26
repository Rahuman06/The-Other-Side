import Phaser from 'phaser';
import { StorageManager } from '../storage/StorageManager';
import { SoundEffects } from '../audio/SoundEffects';
import { AudioManager } from '../audio/AudioManager';
import { pokiBridge } from '../poki/PokiIntegration';
import { GAME_WIDTH, GAME_HEIGHT, PALETTE } from '../core/constants';
import { CharacterAnimator } from '../rendering/CharacterAnimator';
import { BackdropRenderer } from '../rendering/BackdropRenderer';
import { MoveDirection } from '../engine/MovementEngine';
import { MobileControlsOverlay } from '../ui/MobileControlsOverlay';
import { KeyboardNavManager, FocusableItem } from '../ui/KeyboardNavManager';

interface OutroParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
  phase: number;
  isRealSide: boolean;
}

interface ConnectionWave {
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

function captionEnvelope(t: number, start: number, fadeInEnd: number, fadeOutStart: number, end: number): number {
  if (t <= start || t >= end) return 0;
  if (t < fadeInEnd) return easeOutCubic((t - start) / (fadeInEnd - start));
  if (t <= fadeOutStart) return 1;
  return 1 - easeInOutCubic((t - fadeOutStart) / (end - fadeOutStart));
}

/**
 * EndingScene — Final Reunion Outro Cinematic (Scenes 1–6, ~22.8s)
 * followed by the Minimalist Final Completion Screen ("YOU MADE IT.").
 *
 * Strictly preserves existing character silhouettes, dual-world black/white/cyan aesthetic,
 * saved progress integrity, and full keyboard/mouse/touch accessibility.
 */
export class EndingScene extends Phaser.Scene {
  private storage!: StorageManager;
  private soundEffects!: SoundEffects;

  // Cinematic Layers
  private bgGraphics!: Phaser.GameObjects.Graphics;
  private lightRayGraphics!: Phaser.GameObjects.Graphics;
  private shadowAuraSprite!: Phaser.GameObjects.Image;
  private unionGlowSprite!: Phaser.GameObjects.Image;
  private particleGraphics!: Phaser.GameObjects.Graphics;
  private auraGraphics!: Phaser.GameObjects.Graphics;
  private centerLineGraphics!: Phaser.GameObjects.Graphics;

  // Original In-Game Stickman Layers + Brief Unified Silhouette
  private realCharG!: Phaser.GameObjects.Graphics;
  private shadowCharG!: Phaser.GameObjects.Graphics;
  private unifiedCharG!: Phaser.GameObjects.Graphics;

  // Timed Narrative Caption (Scenes 1-5)
  private captionContainer!: Phaser.GameObjects.Container;
  private captionBackdropG!: Phaser.GameObjects.Graphics;
  private captionText!: Phaser.GameObjects.Text;

  // Scene 6 Final Title Reveal
  private titleLeftText!: Phaser.GameObjects.Text;
  private titleRightText!: Phaser.GameObjects.Text;
  private taglineContainer!: Phaser.GameObjects.Container;
  private taglineBackdropG!: Phaser.GameObjects.Graphics;
  private taglineText!: Phaser.GameObjects.Text;
  private finalSoulContainer!: Phaser.GameObjects.Container;
  private finalSoulBackdropG!: Phaser.GameObjects.Graphics;
  private finalSoulText!: Phaser.GameObjects.Text;

  // Skip Button (Unobtrusive, active only during cinematic)
  private skipBtnContainer!: Phaser.GameObjects.Container;
  private skipBtnBg!: Phaser.GameObjects.Rectangle;
  private skipBtnLabel!: Phaser.GameObjects.Text;

  // Final Ending Screen ("YOU MADE IT.")
  private endingScreenContainer!: Phaser.GameObjects.Container;
  private endingFocusItems: FocusableItem[] = [];
  private endingKeyListener: ((e: KeyboardEvent) => void) | null = null;
  private skipKeyHandler?: () => void;

  // Particles & Pulses
  private particles: OutroParticle[] = [];
  private waves: ConnectionWave[] = [];

  // Timeline & Lifecycle Guards
  private animTimer: number = 0;
  private readonly totalDuration: number = 22800; // ~22.8 seconds cinematic
  private isCinematicFinished: boolean = false;
  private isEndingScreenShown: boolean = false;
  private isTransitioningOut: boolean = false;
  private isReducedMotion: boolean = false;

  // Synchronized Audio Milestone Flags
  private audioFired = {
    scene1Quiet: false,
    scene2Look: false,
    scene3Connection: false,
    scene4Reunion: false,
    scene5Unity: false,
    scene6Reveal: false,
  };

  constructor() {
    super('EndingScene');
  }

  public init(data?: { storage?: StorageManager; soundEffects?: SoundEffects; fromLevel20Completion?: boolean }): void {
    this.storage = data?.storage ?? new StorageManager();
    const audio = AudioManager.getInstance();
    audio.init(this.storage);
    this.soundEffects = data?.soundEffects ?? audio.sfx;

    this.animTimer = 0;
    this.isCinematicFinished = false;
    this.isEndingScreenShown = false;
    this.isTransitioningOut = false;
    this.isReducedMotion = this.storage.getProgress().reducedMotion;

    this.particles = [];
    this.waves = [];
    this.endingFocusItems = [];
    this.audioFired = {
      scene1Quiet: false,
      scene2Look: false,
      scene3Connection: false,
      scene4Reunion: false,
      scene5Unity: false,
      scene6Reveal: false,
    };

    BackdropRenderer.setMode('menu');
    BackdropRenderer.setThemeState({ leftBrightness: 1.0, rightBrightness: 1.0, dividerAlpha: 0.75 });
  }

  public create(): void {
    pokiBridge.gameplayStop();
    MobileControlsOverlay.getInstance().setVisible(false);
    AudioManager.getInstance().setGameplayState('ending');

    const w = this.scale.width || GAME_WIDTH;
    const h = this.scale.height || GAME_HEIGHT;
    const halfW = w / 2;

    this.cameras.main.fadeIn(400, 0, 0, 0);

    // 1. Soft Radial Textures (Zero Banding)
    this.ensureGlowTextures();

    // 2. Layered Scene Graphics
    this.bgGraphics = this.add.graphics().setDepth(0);
    this.lightRayGraphics = this.add.graphics().setDepth(1);
    this.shadowAuraSprite = this.add.image(w * 0.75, h * 0.59, 'outro_cyan_aura').setDepth(1).setAlpha(0);
    this.unionGlowSprite = this.add.image(halfW, h * 0.59, 'outro_union_glow').setDepth(5).setAlpha(0);
    this.particleGraphics = this.add.graphics().setDepth(2);
    this.auraGraphics = this.add.graphics().setDepth(4);
    this.centerLineGraphics = this.add.graphics().setDepth(6);

    this.realCharG = this.add.graphics().setDepth(8);
    this.shadowCharG = this.add.graphics().setDepth(8);
    this.unifiedCharG = this.add.graphics().setDepth(9);

    // 3. Timed Narrative Caption (Scenes 1-5)
    this.captionContainer = this.add.container(halfW, h * 0.22).setDepth(22).setAlpha(0);
    this.captionBackdropG = this.add.graphics();
    this.captionText = this.add
      .text(0, 0, '', {
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '28px',
        fontStyle: 'bold',
        color: '#FFFFFF',
        letterSpacing: 6,
      })
      .setOrigin(0.5);
    this.captionContainer.add([this.captionBackdropG, this.captionText]);

    // 4. Scene 6 Signature Title Reveal
    this.titleLeftText = this.add
      .text(halfW - 20, 152, 'THE OTHER', {
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '46px',
        fontStyle: 'bold',
        color: PALETTE.real.text,
        letterSpacing: 4,
      })
      .setOrigin(1, 0.5)
      .setDepth(24)
      .setAlpha(0);

    this.titleRightText = this.add
      .text(halfW + 20, 152, 'SIDE', {
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '46px',
        fontStyle: 'bold',
        color: PALETTE.shadow.text,
        letterSpacing: 4,
      })
      .setOrigin(0, 0.5)
      .setDepth(24)
      .setAlpha(0);

    this.taglineContainer = this.add.container(halfW, 214).setDepth(24).setAlpha(0);
    this.taglineBackdropG = this.add.graphics();
    this.taglineText = this.add
      .text(0, 0, 'TWO WORLDS. ONE MIND.', {
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '17px',
        fontStyle: 'bold',
        color: '#00E5FF',
        letterSpacing: 4,
      })
      .setOrigin(0.5);
    this.drawCapsule(this.taglineBackdropG, 340, 34, 17, 0.96, 0.38);
    this.taglineContainer.add([this.taglineBackdropG, this.taglineText]);

    this.finalSoulContainer = this.add.container(halfW, 274).setDepth(24).setAlpha(0);
    this.finalSoulBackdropG = this.add.graphics();
    this.finalSoulText = this.add
      .text(0, 0, 'DIFFERENT WORLDS. SAME SOUL.', {
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '18px',
        fontStyle: 'bold',
        color: '#FFFFFF',
        letterSpacing: 4.5,
      })
      .setOrigin(0.5);
    this.drawCapsule(this.finalSoulBackdropG, 430, 38, 10, 0.96, 0.5);
    this.finalSoulContainer.add([this.finalSoulBackdropG, this.finalSoulText]);

    // 5. Unobtrusive Skip Button
    this.createSkipButton(w);

    // Bind intentional skip after 800ms grace period to prevent accidental skip from final gameplay input
    this.skipKeyHandler = () => {
      if (!this.isCinematicFinished && this.animTimer >= 800) {
        this.skipToEndingScreen();
      }
    };
    this.input.keyboard?.on('keydown-SPACE', this.skipKeyHandler);
    this.input.keyboard?.on('keydown-ENTER', this.skipKeyHandler);
    this.input.keyboard?.on('keydown-ESC', this.skipKeyHandler);

    // 6. Initialize Atmospheric Dual-World Particles
    this.initParticles(w, h);

    // 7. Pre-build Hidden Final Completion Screen
    this.endingScreenContainer = this.add.container(0, 0).setDepth(60).setVisible(false);
    this.buildFinalEndingScreen(w, h);

    // 8. Responsive Resize & Teardown Hooks
    this.scale.on('resize', this.onResize, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);
    this.events.once(Phaser.Scenes.Events.DESTROY, this.shutdown, this);
  }

  private ensureGlowTextures(): void {
    const makeRadial = (key: string, c0: string, c1: string) => {
      if (this.textures.exists(key)) return;
      const size = 256;
      const tex = this.textures.createCanvas(key, size, size);
      if (!tex) return;
      const ctx = tex.getContext();
      const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      grad.addColorStop(0, c0);
      grad.addColorStop(0.45, c1);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);
      tex.refresh();
    };

    makeRadial('outro_cyan_aura', 'rgba(0, 229, 255, 0.16)', 'rgba(0, 229, 255, 0.05)');
    makeRadial('outro_union_glow', 'rgba(255, 255, 255, 0.42)', 'rgba(0, 229, 255, 0.18)');
  }

  private drawCapsule(
    g: Phaser.GameObjects.Graphics,
    w: number,
    h: number,
    radius: number,
    bgAlpha: number,
    cyanLineAlpha: number
  ): void {
    g.clear();
    if (bgAlpha <= 0.01) return;
    g.fillStyle(0x09090d, 0.34 * bgAlpha);
    g.fillRoundedRect(-w / 2 - 10, -h / 2 - 5, w + 20, h + 10, radius + 4);
    g.fillStyle(0x09090d, bgAlpha);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, radius);
    if (cyanLineAlpha > 0) {
      g.lineStyle(1, 0x00e5ff, cyanLineAlpha);
      g.lineBetween(-w * 0.28, h / 2, w * 0.28, h / 2);
    }
  }

  private createSkipButton(width: number): void {
    const btnW = 128;
    const btnH = 42;
    const btnX = width - btnW / 2 - 22;
    const btnY = 34;

    this.skipBtnContainer = this.add.container(btnX, btnY).setDepth(50).setAlpha(0.85);
    this.skipBtnBg = this.add
      .rectangle(0, 0, btnW, btnH, 0x0a0a0e, 0.72)
      .setStrokeStyle(1.5, 0x666666, 0.8)
      .setInteractive({ useHandCursor: true });

    this.skipBtnLabel = this.add
      .text(0, 0, 'SKIP', {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '13px',
        fontStyle: 'bold',
        color: '#E0E0E0',
        letterSpacing: 2.5,
      })
      .setOrigin(0.5);

    this.skipBtnContainer.add([this.skipBtnBg, this.skipBtnLabel]);

    this.skipBtnBg.on('pointerover', () => {
      this.skipBtnBg.setStrokeStyle(1.5, 0x00e5ff, 1);
      this.skipBtnLabel.setColor('#00E5FF');
    });

    this.skipBtnBg.on('pointerout', () => {
      this.skipBtnBg.setStrokeStyle(1.5, 0x666666, 0.8);
      this.skipBtnLabel.setColor('#E0E0E0');
    });

    this.skipBtnBg.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      pointer.event?.stopPropagation();
      this.soundEffects.playUiClick();
      this.skipToEndingScreen();
    });
  }

  private initParticles(width: number, height: number): void {
    const count = this.isReducedMotion ? 12 : 40;
    const halfW = width / 2;
    for (let i = 0; i < count; i++) {
      const isRealSide = i < count / 2;
      this.particles.push({
        x: isRealSide ? Math.random() * (halfW - 20) + 10 : halfW + 10 + Math.random() * (halfW - 20),
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 14,
        vy: -8 - Math.random() * 14,
        alpha: 0.18 + Math.random() * 0.42,
        size: 1.5 + Math.random() * 2.2,
        phase: Math.random() * Math.PI * 2,
        isRealSide,
      });
    }
  }

  public update(_time: number, delta: number): void {
    if (this.isTransitioningOut) return;

    const dtMs = Math.min(delta, 100);
    const dt = dtMs / 1000;
    const w = this.scale.width || GAME_WIDTH;
    const h = this.scale.height || GAME_HEIGHT;

    if (this.isCinematicFinished) {
      // Gentle calm particle background behind Ending Screen
      this.renderStaticBackgroundFrame(w, h, dt);
      return;
    }

    this.animTimer += dtMs;
    const t = this.animTimer;

    // -------------------------------------------------------------------------
    // 1. SYNCHRONIZED AUDIO PROGRESSION
    // -------------------------------------------------------------------------
    if (!this.audioFired.scene1Quiet && t >= 80) {
      this.audioFired.scene1Quiet = true;
      this.soundEffects.playOutroScene1Quiet();
    }
    if (!this.audioFired.scene2Look && t >= 3600) {
      this.audioFired.scene2Look = true;
      this.soundEffects.playOutroScene2Look();
    }
    if (!this.audioFired.scene3Connection && t >= 6900) {
      this.audioFired.scene3Connection = true;
      this.soundEffects.playOutroScene3Connection();
      this.waves.push({ radius: 6, alpha: 0.9 });
    }
    if (this.waves.length === 1 && t >= 7900 && t < 9600) {
      this.waves.push({ radius: 6, alpha: 0.65 });
    }
    if (!this.audioFired.scene4Reunion && t >= 10300) {
      this.audioFired.scene4Reunion = true;
      this.soundEffects.playOutroScene4Reunion();
    }
    if (!this.audioFired.scene5Unity && t >= 14600) {
      this.audioFired.scene5Unity = true;
      this.soundEffects.playOutroScene5Unity();
      this.waves.push({ radius: 8, alpha: 0.95 });
    }
    if (!this.audioFired.scene6Reveal && t >= 18100) {
      this.audioFired.scene6Reveal = true;
      this.soundEffects.playOutroScene6Reveal();
    }

    // -------------------------------------------------------------------------
    // 2. 6-SCENE STORYBOARD TIMELINE (0.0s -> 22.8s)
    // -------------------------------------------------------------------------
    const halfW = w / 2;
    const charY = h * 0.59;
    const cellSize = Math.max(54, Math.min(72, h * 0.105));

    let realX = w * 0.25;
    let shadowX = w * 0.75;
    let realFacing: MoveDirection = 'down';
    let shadowFacing: MoveDirection = 'down';
    let realWalk = 0;
    let shadowWalk = 0;
    let realReach = 0;
    let shadowReach = 0;
    let realAlpha = 1;
    let shadowAlpha = 1;
    let unifiedAlpha = 0;
    let unionGlowAlpha = 0;
    let unionGlowScale = 1;

    let leftBlendToCenter = 0; // subtle boundary illumination blend in Scene 4/5
    let rightBlendToCenter = 0;
    let motionSlowdown = 1.0;
    let cyanEnergyLineGlow = 0.25;
    let connectionBeamAlpha = 0;
    let particlesDriftCenter = 0;
    let finalePulseY: number | null = null;

    let activeCaption = '';
    let captionAlpha = 0;
    let captionTracking = 6;

    let showScene6 = false;
    let titleAlpha = 0;
    let taglineAlpha = 0;
    let finalSoulAlpha = 0;

    // SCENE 1 — THE FINAL STEP (0.0s - 3.5s)
    if (t < 3500) {
      const p = t / 3500;
      motionSlowdown = Math.max(0.2, 1 - p * 0.75); // background settles into quiet stillness
      realFacing = 'down';
      shadowFacing = 'down';
      activeCaption = 'THE JOURNEY ENDS...';
      captionAlpha = captionEnvelope(t, 450, 1200, 2600, 3350);
      captionTracking = 5 + easeOutCubic(p) * 3;
    }
    // SCENE 2 — THE TWO WORLDS (3.5s - 6.8s)
    else if (t < 6800) {
      const p = (t - 3500) / 3300;
      motionSlowdown = 0.45 + easeOutCubic(p) * 0.4;
      // Both look toward central boundary at 4.0s
      if (t >= 3900) {
        realFacing = 'right';
        shadowFacing = 'left';
      }
      activeCaption = 'TWO WORLDS.';
      captionAlpha = captionEnvelope(t, 3750, 4450, 5950, 6650);
      captionTracking = 6 + easeOutCubic(p) * 3;
    }
    // SCENE 3 — THE CONNECTION (6.8s - 10.2s)
    else if (t < 10200) {
      const p = (t - 6800) / 3400;
      realFacing = 'right';
      shadowFacing = 'left';
      cyanEnergyLineGlow = 0.35 + 0.55 * Math.sin(p * Math.PI);
      connectionBeamAlpha = Math.sin(p * Math.PI) * 0.65;

      // Exact synchronized movements (coordinated small step & poised lift)
      const gestureP = clamp01((t - 7300) / 2200);
      const syncShift = Math.sin(gestureP * Math.PI) * 18;
      realX += syncShift;
      shadowX -= syncShift;
      const syncStride = Math.sin(gestureP * Math.PI * 2) * 0.16;
      realWalk = syncStride;
      shadowWalk = syncStride;

      activeCaption = 'TWO LIVES.';
      captionAlpha = captionEnvelope(t, 7050, 7750, 9350, 10050);
      captionTracking = 6 + easeOutCubic(p) * 3.5;
    }
    // SCENE 4 — THE REVELATION (10.2s - 14.5s) — Unhurried reaching & hand touch
    else if (t < 14500) {
      const walkP = easeInOutCubic(clamp01((t - 10200) / 2500));
      const reachP = easeInOutCubic(clamp01((t - 11800) / 1400));
      const arriveGap = Math.max(24, cellSize * 0.48);

      realX = w * 0.25 + (halfW - arriveGap - w * 0.25) * walkP;
      shadowX = w * 0.75 - (w * 0.75 - (halfW + arriveGap)) * walkP;
      realFacing = 'right';
      shadowFacing = 'left';

      realWalk = walkP < 0.98 ? Math.sin(walkP * Math.PI * 4) * 0.22 : 0;
      shadowWalk = walkP < 0.98 ? Math.sin(walkP * Math.PI * 4) * 0.22 : 0;
      realReach = reachP;
      shadowReach = reachP;

      // Subtle central light & particle convergence
      cyanEnergyLineGlow = 0.6 + reachP * 0.4;
      unionGlowAlpha = reachP * 0.92;
      unionGlowScale = 0.8 + reachP * 0.55;
      particlesDriftCenter = reachP * 0.65;
      leftBlendToCenter = reachP * 0.12;
      rightBlendToCenter = reachP * 0.12;

      activeCaption = 'ONE MIND.';
      captionAlpha = captionEnvelope(t, 10550, 11350, 13450, 14300);
      captionTracking = 7 + easeOutCubic(walkP) * 4;
    }
    // SCENE 5 — THE FINAL UNITY (14.5s - 18.0s) — Brief unified silhouette, then crisp return
    else if (t < 18000) {
      const p = (t - 14500) / 3500;
      const arriveGap = Math.max(24, cellSize * 0.48);
      realFacing = 'right';
      shadowFacing = 'left';

      // Step into center overlap (14.5s - 15.5s), hold unified (15.5s - 16.6s), separate cleanly to opposite sides (16.6s - 17.8s)
      if (t < 15450) {
        const mergeP = easeInOutCubic((t - 14500) / 950);
        realX = halfW - arriveGap * (1 - mergeP);
        shadowX = halfW + arriveGap * (1 - mergeP);
        realReach = 1 - mergeP;
        shadowReach = 1 - mergeP;
        realAlpha = 1 - mergeP;
        shadowAlpha = 1 - mergeP;
        unifiedAlpha = mergeP;
        unionGlowAlpha = 0.92 + mergeP * 0.25;
        unionGlowScale = 1.35 + mergeP * 0.25;
        cyanEnergyLineGlow = 1.0 - mergeP * 0.4;
      } else if (t < 16650) {
        realX = halfW;
        shadowX = halfW;
        realAlpha = 0;
        shadowAlpha = 0;
        unifiedAlpha = 1;
        unionGlowAlpha = 1.0;
        unionGlowScale = 1.6;
        cyanEnergyLineGlow = 0.6;
      } else {
        const returnP = easeOutCubic((t - 16650) / 1300);
        const finalGap = Math.max(48, w * 0.14);
        realX = halfW - finalGap * returnP;
        shadowX = halfW + finalGap * returnP;
        realAlpha = returnP;
        shadowAlpha = returnP;
        unifiedAlpha = 1 - returnP;
        unionGlowAlpha = 1 - returnP * 0.75;
        unionGlowScale = 1.6 - returnP * 0.5;
        cyanEnergyLineGlow = 0.6 + returnP * 0.25;
      }

      activeCaption = 'NEVER TWO DIFFERENT SOULS.';
      captionAlpha = captionEnvelope(t, 14800, 15450, 17150, 17850);
      captionTracking = 5 + easeOutCubic(p) * 3;
    }
    // SCENE 6 — FINAL TITLE REVEAL (18.0s - 22.8s)
    else {
      const p = clamp01((t - 18000) / 4800);
      const settleGap = Math.max(48, w * 0.14);
      const wideEase = easeInOutCubic(clamp01((t - 18000) / 1400));
      const targetHalfDist = settleGap + (w * 0.25 - settleGap) * wideEase;

      realX = halfW - targetHalfDist;
      shadowX = halfW + targetHalfDist;
      realFacing = 'right';
      shadowFacing = 'left';
      realAlpha = 0.9;
      shadowAlpha = 0.9;
      unifiedAlpha = 0;
      unionGlowAlpha = 0.2 * (1 - p);
      cyanEnergyLineGlow = 0.45 + 0.35 * Math.sin(p * Math.PI);

      // Final gentle cyan pulse rising/falling along the dividing line (20.4s - 22.6s)
      if (t >= 20300 && t <= 22700) {
        const pulseP = easeInOutCubic((t - 20300) / 2400);
        finalePulseY = h * (0.9 - pulseP * 0.8);
      }

      showScene6 = true;
      titleAlpha = easeOutCubic(clamp01((t - 18100) / 900));
      taglineAlpha = easeOutCubic(clamp01((t - 18800) / 900));
      finalSoulAlpha = easeOutCubic(clamp01((t - 19550) / 1000));

      if (t >= this.totalDuration && !this.isCinematicFinished) {
        this.transitionToFinalEndingScreen();
      }
    }

    // Apply Titles & Captions
    if (captionAlpha > 0.005 && activeCaption) {
      if (this.captionText.text !== activeCaption) {
        this.captionText.setText(activeCaption);
      }
      this.captionText.setLetterSpacing(Math.round(captionTracking));
      this.captionContainer.setAlpha(captionAlpha);
      this.drawCapsule(this.captionBackdropG, Math.max(240, this.captionText.width + 68), 54, 10, 0.97, 0.42);
    } else {
      this.captionContainer.setAlpha(0);
    }

    this.titleLeftText.setAlpha(showScene6 ? titleAlpha : 0);
    this.titleRightText.setAlpha(showScene6 ? titleAlpha : 0);
    this.taglineContainer.setAlpha(showScene6 ? taglineAlpha : 0);
    this.finalSoulContainer.setAlpha(showScene6 ? finalSoulAlpha : 0);

    // Render Dual-World Frame
    this.renderCinematicFrame(
      w,
      h,
      dt,
      t,
      {
        realX,
        shadowX,
        charY,
        cellSize,
        realFacing,
        shadowFacing,
        realWalk,
        shadowWalk,
        realReach,
        shadowReach,
        realAlpha,
        shadowAlpha,
        unifiedAlpha,
        unionGlowAlpha,
        unionGlowScale,
        leftBlendToCenter,
        rightBlendToCenter,
        motionSlowdown,
        cyanEnergyLineGlow,
        connectionBeamAlpha,
        particlesDriftCenter,
        finalePulseY,
      }
    );
  }

  private renderStaticBackgroundFrame(w: number, h: number, dt: number): void {
    const halfW = w / 2;
    this.bgGraphics.clear();
    this.bgGraphics.fillStyle(PALETTE.real.background, 1);
    this.bgGraphics.fillRect(0, 0, halfW, h);
    this.bgGraphics.fillStyle(PALETTE.shadow.background, 1);
    this.bgGraphics.fillRect(halfW, 0, halfW, h);

    this.centerLineGraphics.clear();
    this.centerLineGraphics.lineStyle(2, 0x00e5ff, 0.25);
    this.centerLineGraphics.lineBetween(halfW, 0, halfW, h);
    this.centerLineGraphics.lineStyle(1, 0xffffff, 0.55);
    this.centerLineGraphics.lineBetween(halfW, 0, halfW, h);

    this.particleGraphics.clear();
    for (const pt of this.particles) {
      if (!this.isReducedMotion) {
        pt.y += pt.vy * 0.45 * dt;
        if (pt.y < -10) pt.y = h + 10;
      }
      const col = pt.isRealSide ? 0x6a7680 : 0x00e5ff;
      this.particleGraphics.fillStyle(col, pt.alpha * 0.5);
      this.particleGraphics.fillCircle(pt.x, pt.y, pt.size);
    }

    this.lightRayGraphics.clear();
    this.auraGraphics.clear();
    this.realCharG.clear();
    this.shadowCharG.clear();
    this.unifiedCharG.clear();
    this.shadowAuraSprite.setAlpha(0);
    this.unionGlowSprite.setAlpha(0);
  }

  private renderCinematicFrame(
    w: number,
    h: number,
    dt: number,
    t: number,
    state: {
      realX: number;
      shadowX: number;
      charY: number;
      cellSize: number;
      realFacing: MoveDirection;
      shadowFacing: MoveDirection;
      realWalk: number;
      shadowWalk: number;
      realReach: number;
      shadowReach: number;
      realAlpha: number;
      shadowAlpha: number;
      unifiedAlpha: number;
      unionGlowAlpha: number;
      unionGlowScale: number;
      leftBlendToCenter: number;
      rightBlendToCenter: number;
      motionSlowdown: number;
      cyanEnergyLineGlow: number;
      connectionBeamAlpha: number;
      particlesDriftCenter: number;
      finalePulseY: number | null;
    }
  ): void {
    const halfW = w / 2;

    // 1. Crisp Two-World Backgrounds
    this.bgGraphics.clear();
    const lVal = Math.round(255 - state.leftBlendToCenter * 20);
    const leftColor = (lVal << 16) | (lVal << 8) | lVal;
    this.bgGraphics.fillStyle(leftColor, 1);
    this.bgGraphics.fillRect(0, 0, halfW, h);

    const rVal = Math.round(0x10 + state.rightBlendToCenter * 18);
    const rightColor = (rVal << 16) | (rVal << 8) | rVal;
    this.bgGraphics.fillStyle(rightColor, 1);
    this.bgGraphics.fillRect(halfW, 0, halfW, h);

    // 2. Soft Flowing Light Rays (Real) & Cyan Mist (Shadow)
    this.lightRayGraphics.clear();
    if (!this.isReducedMotion) {
      const drift = Math.sin(t * 0.0005 * state.motionSlowdown) * 24;
      this.lightRayGraphics.fillStyle(0xdde8ef, 0.16);
      this.lightRayGraphics.fillTriangle(halfW * 0.18 + drift, 0, halfW * 0.44 + drift, 0, halfW * 0.12, h);
      this.lightRayGraphics.fillTriangle(halfW * 0.56 - drift * 0.5, 0, halfW * 0.76 - drift * 0.5, 0, halfW * 0.42, h);
    }

    const auraSize = state.cellSize * 6.5;
    this.shadowAuraSprite
      .setPosition(Math.max(halfW + 40, state.shadowX), state.charY)
      .setDisplaySize(auraSize, auraSize)
      .setAlpha(state.shadowAlpha * 0.85);

    const unionDiam = state.cellSize * 5.2 * state.unionGlowScale;
    this.unionGlowSprite
      .setPosition(halfW, state.charY - state.cellSize * 0.08)
      .setDisplaySize(unionDiam, unionDiam)
      .setAlpha(state.unionGlowAlpha);

    // 3. Atmospheric Particles (drifting gently inward during Scene 4 Revelation)
    this.particleGraphics.clear();
    for (const pt of this.particles) {
      if (!this.isReducedMotion) {
        const pull = state.particlesDriftCenter > 0 ? (halfW - pt.x) * state.particlesDriftCenter * 0.55 * dt : 0;
        pt.x += (pt.vx * state.motionSlowdown + Math.sin(t * 0.001 + pt.phase) * 3) * dt + pull;
        pt.y += pt.vy * state.motionSlowdown * dt;

        if (pt.y < -12) {
          pt.y = h + 12;
          pt.x = pt.isRealSide ? Math.random() * (halfW - 20) + 10 : halfW + 10 + Math.random() * (halfW - 20);
        }
        if (pt.x < -12) pt.x = halfW - 10;
        if (pt.x > w + 12) pt.x = halfW + 10;
      }

      const ptCol = pt.x < halfW ? 0x66747e : 0x00e5ff;
      const ptAlpha = pt.x < halfW ? pt.alpha * 0.52 : pt.alpha;
      this.particleGraphics.fillStyle(ptCol, ptAlpha);
      this.particleGraphics.fillCircle(pt.x, pt.y, pt.size);
    }

    // 4. Connection Waves & Central Boundary Line
    this.auraGraphics.clear();
    for (let i = this.waves.length - 1; i >= 0; i--) {
      const wave = this.waves[i];
      wave.radius += dt * (w * 0.32);
      wave.alpha = Math.max(0, wave.alpha - dt * 0.45);
      if (wave.alpha <= 0.01) {
        this.waves.splice(i, 1);
        continue;
      }
      this.auraGraphics.lineStyle(2, 0x00e5ff, wave.alpha * 0.55);
      this.auraGraphics.strokeCircle(halfW, state.charY - state.cellSize * 0.12, wave.radius);
    }

    if (state.connectionBeamAlpha > 0.01) {
      const headY = state.charY - state.cellSize * 0.22;
      this.auraGraphics.lineStyle(1.5, 0x00e5ff, state.connectionBeamAlpha * 0.48);
      this.auraGraphics.lineBetween(state.realX, headY, state.shadowX, headY);
      this.auraGraphics.fillStyle(0x00e5ff, state.connectionBeamAlpha * 0.6);
      const pulseTravel = ((t % 1600) / 1600);
      const bx1 = state.realX + (halfW - state.realX) * pulseTravel;
      const bx2 = state.shadowX - (state.shadowX - halfW) * pulseTravel;
      this.auraGraphics.fillCircle(bx1, headY, 3);
      this.auraGraphics.fillCircle(bx2, headY, 3);
    }

    this.centerLineGraphics.clear();
    this.centerLineGraphics.lineStyle(4, 0x00e5ff, state.cyanEnergyLineGlow * 0.55);
    this.centerLineGraphics.lineBetween(halfW, 0, halfW, h);
    this.centerLineGraphics.lineStyle(1.5, 0xffffff, 0.85);
    this.centerLineGraphics.lineBetween(halfW, 0, halfW, h);

    if (state.finalePulseY !== null) {
      this.centerLineGraphics.fillStyle(0x00e5ff, 0.9);
      this.centerLineGraphics.fillCircle(halfW, state.finalePulseY, 5);
      this.centerLineGraphics.fillStyle(0xffffff, 0.95);
      this.centerLineGraphics.fillCircle(halfW, state.finalePulseY, 2.5);
    }

    // 5. Render Identical In-Game Stickmen
    if (state.realAlpha > 0.01) {
      this.realCharG.setPosition(state.realX, state.charY);
      this.realCharG.setAlpha(state.realAlpha);
      CharacterAnimator.renderProceduralStickman(
        this.realCharG,
        true,
        state.cellSize,
        state.realWalk,
        state.realFacing,
        PALETTE.real.character,
        0xffffff,
        t / 1000,
        this.isReducedMotion,
        'right',
        state.realReach
      );
    } else {
      this.realCharG.clear();
    }

    if (state.shadowAlpha > 0.01) {
      this.shadowCharG.setPosition(state.shadowX, state.charY);
      this.shadowCharG.setAlpha(state.shadowAlpha);
      CharacterAnimator.renderProceduralStickman(
        this.shadowCharG,
        false,
        state.cellSize,
        state.shadowWalk,
        state.shadowFacing,
        PALETTE.shadow.character,
        0x000000,
        t / 1000,
        this.isReducedMotion,
        'left',
        state.shadowReach
      );
    } else {
      this.shadowCharG.clear();
    }

    // Scene 5 Brief Unified Center Silhouette
    if (state.unifiedAlpha > 0.01) {
      this.unifiedCharG.setPosition(halfW, state.charY);
      this.unifiedCharG.setAlpha(state.unifiedAlpha);
      CharacterAnimator.renderProceduralStickman(
        this.unifiedCharG,
        false,
        state.cellSize * 1.04,
        0,
        'down',
        0x00e5ff,
        0x08080c,
        t / 1000,
        this.isReducedMotion
      );
    } else {
      this.unifiedCharG.clear();
    }
  }

  private transitionToFinalEndingScreen(): void {
    if (this.isCinematicFinished) return;
    this.isCinematicFinished = true;
    this.showFinalEndingScreen();
  }

  private skipToEndingScreen(): void {
    if (this.isCinematicFinished || this.isEndingScreenShown) return;
    this.isCinematicFinished = true;
    this.soundEffects.stopCinematicCues();
    this.tweens?.killAll();
    this.showFinalEndingScreen();
  }

  private buildFinalEndingScreen(w: number, h: number): void {
    const halfW = w / 2;
    const centerY = h / 2;
    const cardW = Math.min(540, w - 48);
    const cardH = Math.min(410, h - 48);

    // Full-screen interaction-blocking backdrop preventing stray clicks behind modal
    const blocker = this.add.graphics();
    blocker.fillStyle(0x000000, 0.72);
    blocker.fillRect(0, 0, w, h);
    blocker.setInteractive(new Phaser.Geom.Rectangle(0, 0, w, h), Phaser.Geom.Rectangle.Contains);
    blocker.on('pointerdown', (_p: Phaser.Input.Pointer, _x: number, _y: number, ev: Phaser.Types.Input.EventData) => {
      ev?.stopPropagation?.();
    });
    blocker.on('pointerup', (_p: Phaser.Input.Pointer, _x: number, _y: number, ev: Phaser.Types.Input.EventData) => {
      ev?.stopPropagation?.();
    });
    this.endingScreenContainer.add(blocker);

    const card = this.add.container(halfW, centerY);
    this.endingScreenContainer.add(card);

    // Minimal High-Contrast Black & White Card with Subtle Cyan Accent
    const box = this.add.graphics();
    box.fillStyle(0x0a0a0d, 0.96);
    box.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 10);
    box.lineStyle(1.5, 0xffffff, 0.85);
    box.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 10);
    box.lineStyle(1, 0x00e5ff, 0.45);
    box.lineBetween(-cardW * 0.34, -cardH / 2 + 86, cardW * 0.34, -cardH / 2 + 86);
    card.add(box);

    // Main Title: YOU MADE IT.
    const title = this.add
      .text(0, -cardH / 2 + 52, 'YOU MADE IT.', {
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '34px',
        fontStyle: 'bold',
        color: '#FFFFFF',
        letterSpacing: 5,
      })
      .setOrigin(0.5);
    card.add(title);

    // Supporting Narrative Copy
    const support = this.add
      .text(0, -48, 'Every step separated two worlds.\nEvery move revealed one connection.', {
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '16px',
        color: '#D2D2D8',
        align: 'center',
        lineSpacing: 10,
        letterSpacing: 1,
      })
      .setOrigin(0.5);
    card.add(support);

    // Final Message: TWO WORLDS. ONE MIND.
    const finalMsg = this.add
      .text(0, 18, 'TWO WORLDS. ONE MIND.', {
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '17px',
        fontStyle: 'bold',
        color: '#00E5FF',
        letterSpacing: 4,
      })
      .setOrigin(0.5);
    card.add(finalMsg);

    // Only Two Navigation Buttons: PLAY AGAIN & MAIN MENU
    const btnW = 300;
    const btnH = 48;
    this.endingFocusItems = [];

    this.createEndingButton(
      card,
      halfW,
      centerY,
      'ending-play-again',
      0,
      82,
      btnW,
      btnH,
      'PLAY AGAIN',
      () => this.handlePlayAgain(),
      true
    );

    this.createEndingButton(
      card,
      halfW,
      centerY,
      'ending-main-menu',
      0,
      142,
      btnW,
      btnH,
      'MAIN MENU',
      () => this.handleMainMenu(),
      false
    );
  }

  private createEndingButton(
    parent: Phaser.GameObjects.Container,
    cardCenterX: number,
    cardCenterY: number,
    id: string,
    x: number,
    y: number,
    w: number,
    h: number,
    label: string,
    onActivate: () => void,
    isPrimary: boolean
  ): void {
    const bg = this.add.graphics();
    const borderCol = isPrimary ? 0xffffff : 0x777777;
    const textCol = isPrimary ? '#FFFFFF' : '#C8C8CE';

    const drawBtn = (hover: boolean) => {
      bg.clear();
      bg.fillStyle(hover ? 0x1e2228 : 0x131317, 0.96);
      bg.fillRoundedRect(x - w / 2, y - h / 2, w, h, 5);
      bg.lineStyle(hover ? 2 : 1.5, hover ? 0x00e5ff : borderCol, 0.92);
      bg.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 5);
    };

    drawBtn(false);
    parent.add(bg);

    const txt = this.add
      .text(x, y, label, {
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '14px',
        fontStyle: 'bold',
        color: textCol,
        letterSpacing: 2.5,
      })
      .setOrigin(0.5);
    parent.add(txt);

    const hit = this.add
      .zone(x, y, Math.max(48, w), Math.max(48, h))
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    const invoke = () => {
      if (this.isTransitioningOut || !this.isEndingScreenShown) return;
      this.soundEffects.playUiClick();
      onActivate();
    };

    hit.on('pointerover', () => {
      drawBtn(true);
      txt.setColor('#FFFFFF');
      KeyboardNavManager.getInstance().setFocusById(id);
    });

    hit.on('pointerout', () => {
      drawBtn(false);
      txt.setColor(textCol);
    });

    hit.on('pointerdown', (_p: Phaser.Input.Pointer, _lx: number, _ly: number, ev: Phaser.Types.Input.EventData) => {
      ev?.stopPropagation?.();
      invoke();
    });

    parent.add(hit);

    this.endingFocusItems.push({
      id,
      getBounds: () => ({
        x: cardCenterX + x,
        y: cardCenterY + y,
        width: w,
        height: h,
      }),
      onActivate: invoke,
    });
  }

  private showFinalEndingScreen(): void {
    if (this.isEndingScreenShown) return;
    this.isEndingScreenShown = true;

    // Hide cinematic captions, Scene 6 title, and skip button cleanly
    this.captionContainer.setAlpha(0).setVisible(false);
    this.titleLeftText.setVisible(false);
    this.titleRightText.setVisible(false);
    this.taglineContainer.setVisible(false);
    this.finalSoulContainer.setVisible(false);
    this.skipBtnContainer.setVisible(false);
    this.skipBtnBg.disableInteractive();

    // Dim full device viewport backdrop seamlessly alongside Ending Screen overlay
    BackdropRenderer.setDimmed(true);

    // Show Final Ending Screen with gentle fade-in
    this.endingScreenContainer.setVisible(true).setAlpha(0);
    this.tweens.add({
      targets: this.endingScreenContainer,
      alpha: 1,
      duration: 550,
      ease: 'Sine.easeOut',
    });

    // Wire keyboard navigation cleanly (and ignore lingering SPACE/ENTER skip handler)
    KeyboardNavManager.getInstance().setScene(this);
    KeyboardNavManager.getInstance().pushContext({
      id: 'ending-screen',
      items: this.endingFocusItems,
      selectedIndex: 0,
      onEscape: () => this.handleMainMenu(),
      trapFocus: true,
    });

    if (typeof window !== 'undefined') {
      this.endingKeyListener = (e: KeyboardEvent) => {
        if (!this.isEndingScreenShown || this.isTransitioningOut) return;
        KeyboardNavManager.getInstance().handleKeyDown(e);
      };
      window.addEventListener('keydown', this.endingKeyListener);
    }
  }

  /**
   * PLAY AGAIN: Starts Level 1 fresh using existing New Game preservation rules
   * (preserves existing completed levels & best scores without silently deleting progress).
   */
  private handlePlayAgain(): void {
    if (this.isTransitioningOut) return;
    this.isTransitioningOut = true;
    this.cleanupAudioAndInput();
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.time.delayedCall(300, () => {
      this.scene.start('GameScene', { levelId: 1 });
    });
  }

  /**
   * MAIN MENU: Returns straight to MenuScene without replaying the intro.
   */
  private handleMainMenu(): void {
    if (this.isTransitioningOut) return;
    this.isTransitioningOut = true;
    this.cleanupAudioAndInput();
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.time.delayedCall(300, () => {
      this.scene.start('MenuScene');
    });
  }

  private onResize(gameSize: Phaser.Structs.Size): void {
    const w = gameSize.width || GAME_WIDTH;
    const h = gameSize.height || GAME_HEIGHT;
    const halfW = w / 2;

    this.captionContainer?.setPosition(halfW, h * 0.22);
    this.titleLeftText?.setPosition(halfW - 20, 152);
    this.titleRightText?.setPosition(halfW + 20, 152);
    this.taglineContainer?.setPosition(halfW, 214);
    this.finalSoulContainer?.setPosition(halfW, 274);

    if (this.skipBtnContainer) {
      this.skipBtnContainer.setPosition(w - 128 / 2 - 22, 34);
    }
  }

  private cleanupAudioAndInput(): void {
    this.soundEffects?.stopCinematicCues();
    this.tweens?.killAll();
    BackdropRenderer.setDimmed(false);
    BackdropRenderer.resetThemeState();

    if (this.skipKeyHandler) {
      this.input.keyboard?.off('keydown-SPACE', this.skipKeyHandler);
      this.input.keyboard?.off('keydown-ENTER', this.skipKeyHandler);
      this.input.keyboard?.off('keydown-ESC', this.skipKeyHandler);
      this.skipKeyHandler = undefined;
    }

    if (this.endingKeyListener && typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.endingKeyListener);
      this.endingKeyListener = null;
    }

    KeyboardNavManager.getInstance().popContext('ending-screen');
    KeyboardNavManager.getInstance().reset();
  }

  public shutdown(): void {
    this.cleanupAudioAndInput();
    this.scale.off('resize', this.onResize, this);
    this.bgGraphics?.destroy();
    this.lightRayGraphics?.destroy();
    this.shadowAuraSprite?.destroy();
    this.unionGlowSprite?.destroy();
    this.particleGraphics?.destroy();
    this.auraGraphics?.destroy();
    this.centerLineGraphics?.destroy();
    this.realCharG?.destroy();
    this.shadowCharG?.destroy();
    this.unifiedCharG?.destroy();
    this.captionBackdropG?.destroy();
    this.taglineBackdropG?.destroy();
    this.finalSoulBackdropG?.destroy();
  }
}
