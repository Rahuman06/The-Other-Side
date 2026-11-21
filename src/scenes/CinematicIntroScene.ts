import Phaser from 'phaser';
import { PALETTE } from '../core/constants';
import { AudioManager } from '../audio/AudioManager';
import { SoundEffects } from '../audio/SoundEffects';
import { StorageManager } from '../storage/StorageManager';
import { CharacterAnimator } from '../rendering/CharacterAnimator';
import { BackdropRenderer } from '../rendering/BackdropRenderer';

export class CinematicIntroScene extends Phaser.Scene {
  private sfx!: SoundEffects;
  private isSkipped: boolean = false;
  private isCompleted: boolean = false;
  private nextScene: string = 'MenuScene';
  private nextSceneData?: { levelId?: number };

  // Visual Display Objects
  private bgGraphics!: Phaser.GameObjects.Graphics;
  private centerLineGraphics!: Phaser.GameObjects.Graphics;
  private singleCharG!: Phaser.GameObjects.Graphics;
  private realCharG!: Phaser.GameObjects.Graphics;
  private shadowCharG!: Phaser.GameObjects.Graphics;
  private titleText!: Phaser.GameObjects.Text;
  private subtitleText!: Phaser.GameObjects.Text;
  private skipBtnContainer!: Phaser.GameObjects.Container;
  private skipBtnBg!: Phaser.GameObjects.Rectangle;
  private skipBtnLabel!: Phaser.GameObjects.Text;

  // Particle System
  private particles: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    alpha: number;
    size: number;
    isRealSide: boolean;
  }> = [];
  private particleGraphics!: Phaser.GameObjects.Graphics;

  // Timeline Progress & Animation State
  private timelineProgress: number = 0; // 0.0 to 1.0
  private animTimer: number = 0;
  private readonly totalDuration: number = 10000; // 10.0 seconds total

  // Animated Properties
  private singleCharAlpha: number = 0;
  private splitProgress: number = 0; // 0 = together at center, 1 = separated
  private leftWorldBrightness: number = 0; // 0 = black, 1 = pure white
  private rightWorldBrightness: number = 0; // 0 = black, 1 = shadow world dark (#101010)
  private dividerAlpha: number = 0;
  private titleAlpha: number = 0;
  private subtitleAlpha: number = 0;
  private isReducedMotion: boolean = false;

  constructor() {
    super('CinematicIntroScene');
  }

  public init(data?: { nextScene?: string; levelId?: number }): void {
    this.nextScene = data?.nextScene ?? 'MenuScene';
    this.nextSceneData = data?.levelId !== undefined ? { levelId: data.levelId } : undefined;
    this.isSkipped = false;
    this.isCompleted = false;
    this.timelineProgress = 0;
    this.animTimer = 0;
    this.singleCharAlpha = 0;
    this.splitProgress = 0;
    this.leftWorldBrightness = 0;
    this.rightWorldBrightness = 0;
    this.dividerAlpha = 0;
    this.titleAlpha = 0;
    this.subtitleAlpha = 0;
    this.particles = [];
    BackdropRenderer.setThemeState({ leftBrightness: 0, rightBrightness: 0, dividerAlpha: 0 });

    const storage = new StorageManager();
    this.isReducedMotion = storage.getProgress().reducedMotion;
    const audio = AudioManager.getInstance();
    audio.init(storage);
    this.sfx = audio.sfx;
  }

  public create(): void {
    const { width, height } = this.scale;

    // 1. Graphics Containers
    this.bgGraphics = this.add.graphics();
    this.particleGraphics = this.add.graphics();
    this.singleCharG = this.add.graphics();
    this.realCharG = this.add.graphics();
    this.shadowCharG = this.add.graphics();
    this.centerLineGraphics = this.add.graphics();

    // 2. Title & Tagline Displays
    this.titleText = this.add.text(width / 2, height / 2 - 80, 'THE OTHER SIDE', {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '42px',
      fontStyle: 'bold',
      color: '#FFFFFF',
      letterSpacing: 8,
    }).setOrigin(0.5).setAlpha(0).setDepth(20);

    this.subtitleText = this.add.text(width / 2, height / 2 - 25, 'TWO WORLDS. ONE MIND.', {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#00E5FF',
      letterSpacing: 4,
    }).setOrigin(0.5).setAlpha(0).setDepth(20);

    // 3. Skip Button (Responsive, tactile touch-friendly)
    this.createSkipButton(width, height);

    // 4. Input Listeners for Skip
    this.input.keyboard?.on('keydown-SPACE', () => this.skipIntro());
    this.input.keyboard?.on('keydown-ENTER', () => this.skipIntro());
    this.input.keyboard?.on('keydown-ESC', () => this.skipIntro());

    // Allow clicking or tapping empty space during title scene to proceed
    this.input.on('pointerdown', (_pointer: Phaser.Input.Pointer) => {
      if (this.timelineProgress > 0.75) {
        this.skipIntro();
      }
    });

    // 5. Responsive Resize Listener
    this.scale.on('resize', this.onResize, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);

    // 6. Spawn Initial Atmospheric Particles
    this.initAtmosphericParticles(width, height);

    // 7. Initial Audio Cue: Subtle Ambient Drone
    this.sfx.playCinematicAmbience();

    // 8. Timed Audio Cues along Animation Sequence
    this.time.delayedCall(2200, () => {
      if (!this.isSkipped) this.sfx.playCinematicSeparation();
    });
    this.time.delayedCall(4500, () => {
      if (!this.isSkipped) this.sfx.playCinematicSplit();
    });
    this.time.delayedCall(7000, () => {
      if (!this.isSkipped) this.sfx.playCinematicImpact();
    });
  }

  private createSkipButton(width: number, _height: number): void {
    const btnW = 130;
    const btnH = 38;
    const btnX = width - btnW / 2 - 24;
    const btnY = 32;

    this.skipBtnContainer = this.add.container(btnX, btnY).setDepth(50);

    this.skipBtnBg = this.add.rectangle(0, 0, btnW, btnH, 0x000000, 0.6)
      .setStrokeStyle(1.5, 0x666666, 0.8)
      .setInteractive({ useHandCursor: true });

    this.skipBtnLabel = this.add.text(0, 0, 'SKIP INTRO', {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#CCCCCC',
      letterSpacing: 2,
    }).setOrigin(0.5);

    this.skipBtnContainer.add([this.skipBtnBg, this.skipBtnLabel]);

    this.skipBtnBg.on('pointerover', () => {
      this.skipBtnBg.setStrokeStyle(1.5, 0x00e5ff, 1);
      this.skipBtnLabel.setColor('#00E5FF');
    });

    this.skipBtnBg.on('pointerout', () => {
      this.skipBtnBg.setStrokeStyle(1.5, 0x666666, 0.8);
      this.skipBtnLabel.setColor('#CCCCCC');
    });

    this.skipBtnBg.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      pointer.event?.stopPropagation();
      this.sfx.playUiClick();
      this.skipIntro();
    });
  }

  private initAtmosphericParticles(width: number, height: number): void {
    const count = this.isReducedMotion ? 12 : 36;
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 18,
        vy: -10 - Math.random() * 20,
        alpha: 0.15 + Math.random() * 0.45,
        size: 1.5 + Math.random() * 2.5,
        isRealSide: Math.random() < 0.5,
      });
    }
  }

  public update(_time: number, delta: number): void {
    if (this.isSkipped || this.isCompleted) return;

    this.animTimer += delta;
    this.timelineProgress = Math.min(1, this.animTimer / this.totalDuration);

    const { width, height } = this.scale;
    const t = this.animTimer;

    // =========================================================================
    // SCENE TIMELINE ORCHESTRATION
    // =========================================================================

    // Scene 1: The Beginning (0.0s - 2.2s)
    // Single character gradually fades in at center
    if (t < 2200) {
      this.singleCharAlpha = Math.min(1, t / 1400);
      this.splitProgress = 0;
      this.leftWorldBrightness = 0;
      this.rightWorldBrightness = 0;
      this.dividerAlpha = 0;
      this.titleAlpha = 0;
      this.subtitleAlpha = 0;
    }
    // Scene 2: The Separation (2.2s - 4.6s)
    // Glowing line appears, worlds begin dividing, splitting effect begins
    else if (t < 4600) {
      const p = (t - 2200) / 2400;
      this.singleCharAlpha = Math.max(0, 1 - p * 1.5);
      this.splitProgress = p * 0.35;
      this.leftWorldBrightness = p * 0.65;
      this.rightWorldBrightness = p * 0.4;
      this.dividerAlpha = Math.min(1, p * 2);
      this.titleAlpha = 0;
      this.subtitleAlpha = 0;
    }
    // Scene 3: Trapped in Two Worlds (4.6s - 7.0s)
    // Characters pulled apart into their respective worlds
    else if (t < 7000) {
      const p = (t - 4600) / 2400;
      // Smooth easeOutQuad
      const eased = 1 - (1 - p) * (1 - p);
      this.singleCharAlpha = 0;
      this.splitProgress = 0.35 + eased * 0.65; // goes to 1.0
      this.leftWorldBrightness = 0.65 + eased * 0.35; // goes to 1.0 (pure white)
      this.rightWorldBrightness = 0.4 + eased * 0.6; // goes to 1.0 (dark #101010)
      this.dividerAlpha = 1;
      this.titleAlpha = 0;
      this.subtitleAlpha = 0;
    }
    // Scene 4: Two Worlds. One Mind. (7.0s - 10.0s)
    // Both settled, title & tagline reveal, smooth finale
    else {
      const p = Math.min(1, (t - 7000) / 1800);
      this.singleCharAlpha = 0;
      this.splitProgress = 1.0;
      this.leftWorldBrightness = 1.0;
      this.rightWorldBrightness = 1.0;
      this.dividerAlpha = 1.0;

      // Title & Subtitle fade in with slight stagger
      this.titleAlpha = Math.min(1, p * 1.8);
      this.subtitleAlpha = Math.min(1, Math.max(0, (p - 0.25) * 1.6));

      if (t >= this.totalDuration && !this.isCompleted) {
        this.completeIntro();
      }
    }

    // Render Canvas Visuals for this frame
    this.renderFrame(width, height, delta);
  }

  private renderFrame(width: number, height: number, delta: number): void {
    const dt = delta / 1000;
    const centerX = width / 2;
    const centerY = height / 2 + 35; // slightly lower than center to leave room for title
    const cellSize = Math.max(48, Math.min(68, height * 0.1));

    // 1. World Backgrounds
    this.bgGraphics.clear();
    const halfW = width / 2;

    // Sync ambient backdrop with cinematic illumination
    BackdropRenderer.setThemeState({
      leftBrightness: this.leftWorldBrightness,
      rightBrightness: this.rightWorldBrightness,
      dividerAlpha: this.dividerAlpha,
    });

    // Left World: Lerp from black (0x000000) to pure white (0xFFFFFF)
    const leftVal = Math.round(this.leftWorldBrightness * 255);
    const leftColor = (leftVal << 16) | (leftVal << 8) | leftVal;
    this.bgGraphics.fillStyle(leftColor, 1);
    this.bgGraphics.fillRect(0, 0, halfW, height);

    // Right World: Lerp from black (0x000000) to Shadow background (0x101010)
    const rightVal = Math.round(this.rightWorldBrightness * 0x10);
    const rightColor = (rightVal << 16) | (rightVal << 8) | rightVal;
    this.bgGraphics.fillStyle(rightColor, 1);
    this.bgGraphics.fillRect(halfW, 0, halfW, height);

    // 2. Glowing Center Dividing Line
    this.centerLineGraphics.clear();
    if (this.dividerAlpha > 0) {
      // Outer subtle cyan glow
      this.centerLineGraphics.lineStyle(3, 0x00e5ff, this.dividerAlpha * 0.35);
      this.centerLineGraphics.lineBetween(halfW, 0, halfW, height);
      // Inner crisp divider line
      this.centerLineGraphics.lineStyle(1.5, 0xffffff, this.dividerAlpha * 0.85);
      this.centerLineGraphics.lineBetween(halfW, 0, halfW, height);
    }

    // 3. Atmospheric Floating Particles
    this.particleGraphics.clear();
    for (const pt of this.particles) {
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;

      // Wrap around bounds
      if (pt.y < -10) {
        pt.y = height + 10;
        pt.x = Math.random() * width;
      }
      if (pt.x < -10) pt.x = width + 10;
      if (pt.x > width + 10) pt.x = -10;

      // On bright left side, particles darken slightly; on dark right side, particles are cyan/white
      const ptColor = pt.x < halfW && this.leftWorldBrightness > 0.5 ? 0x222222 : 0x00e5ff;
      this.particleGraphics.fillStyle(ptColor, pt.alpha);
      this.particleGraphics.fillCircle(pt.x, pt.y, pt.size);
    }

    // 4. Single Original Character (Scene 1)
    if (this.singleCharAlpha > 0) {
      this.singleCharG.setPosition(centerX, centerY);
      this.singleCharG.setAlpha(this.singleCharAlpha);
      CharacterAnimator.renderProceduralStickman(
        this.singleCharG,
        false, // white silhouette on dark background
        cellSize,
        0,
        'down',
        0xffffff,
        0x000000,
        this.animTimer / 1000,
        this.isReducedMotion
      );
    } else {
      this.singleCharG.clear();
    }

    // 5. Split Characters (Scene 2, 3, 4)
    if (this.splitProgress > 0) {
      // Left Character destination: width / 4 (Real World)
      const realTargetX = width / 4;
      const realX = centerX - (centerX - realTargetX) * this.splitProgress;

      // Right Character destination: 3 * width / 4 (Shadow World)
      const shadowTargetX = (3 * width) / 4;
      const shadowX = centerX + (shadowTargetX - centerX) * this.splitProgress;

      // Left Character Color: transitions from 0xffffff to 0x080808 as left world brightens
      const realVal = Math.round(255 - this.leftWorldBrightness * 247);
      const realColor = (realVal << 16) | (realVal << 8) | realVal;
      const realEyeColor = this.leftWorldBrightness > 0.5 ? 0xffffff : 0x000000;

      // Left Character (Real World Stickman)
      this.realCharG.setPosition(realX, centerY);
      this.realCharG.setAlpha(Math.min(1, this.splitProgress * 2));
      CharacterAnimator.renderProceduralStickman(
        this.realCharG,
        true,
        cellSize,
        Math.sin(this.animTimer * 0.003) * 0.15, // subtle stride while being pulled
        this.splitProgress >= 0.95 ? 'right' : 'left', // turn to look at each other at finale
        realColor,
        realEyeColor,
        this.animTimer / 1000,
        this.isReducedMotion
      );

      // Right Character (Shadow World Stickman)
      this.shadowCharG.setPosition(shadowX, centerY);
      this.shadowCharG.setAlpha(Math.min(1, this.splitProgress * 2));
      CharacterAnimator.renderProceduralStickman(
        this.shadowCharG,
        false,
        cellSize,
        Math.sin(this.animTimer * 0.003) * 0.15,
        this.splitProgress >= 0.95 ? 'left' : 'right', // turn to look at each other at finale
        PALETTE.shadow.character,
        0x000000,
        this.animTimer / 1000,
        this.isReducedMotion
      );
    } else {
      this.realCharG.clear();
      this.shadowCharG.clear();
    }

    // 6. Title and Subtitle
    this.titleText.setAlpha(this.titleAlpha);
    this.subtitleText.setAlpha(this.subtitleAlpha);
  }

  private onResize(gameSize: Phaser.Structs.Size): void {
    const width = gameSize.width;
    const height = gameSize.height;

    this.titleText.setPosition(width / 2, height / 2 - 80);
    this.subtitleText.setPosition(width / 2, height / 2 - 25);

    if (this.skipBtnContainer) {
      const btnW = 130;
      this.skipBtnContainer.setPosition(width - btnW / 2 - 24, 32);
    }
  }

  private skipIntro(): void {
    if (this.isSkipped || this.isCompleted) return;
    this.isSkipped = true;
    BackdropRenderer.resetThemeState();

    this.cameras.main.fadeOut(250, 0, 0, 0);
    this.time.delayedCall(250, () => {
      this.scene.start(this.nextScene, this.nextSceneData);
    });
  }

  private completeIntro(): void {
    if (this.isCompleted) return;
    this.isCompleted = true;
    BackdropRenderer.resetThemeState();

    // Gentle hold on final scene, then smooth fade into target scene
    this.time.delayedCall(1200, () => {
      this.cameras.main.fadeOut(350, 0, 0, 0);
      this.time.delayedCall(350, () => {
        this.scene.start(this.nextScene, this.nextSceneData);
      });
    });
  }

  public shutdown(): void {
    BackdropRenderer.resetThemeState();
    this.scale.off('resize', this.onResize, this);
    this.singleCharG?.destroy();
    this.realCharG?.destroy();
    this.shadowCharG?.destroy();
    this.bgGraphics?.destroy();
    this.particleGraphics?.destroy();
    this.centerLineGraphics?.destroy();
  }
}
