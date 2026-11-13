import Phaser from 'phaser';
import { StorageManager } from '../storage/StorageManager';
import { SoundEffects } from '../audio/SoundEffects';
import { AudioManager } from '../audio/AudioManager';
import { pokiBridge } from '../poki/PokiIntegration';
import { GAME_WIDTH, GAME_HEIGHT } from '../core/constants';
import { ALL_LEVELS } from '../levels/levelsData';

export class EndingScene extends Phaser.Scene {
  private storage!: StorageManager;
  private soundEffects!: SoundEffects;
  private container!: Phaser.GameObjects.Container;

  constructor() {
    super('EndingScene');
  }

  public init(data?: { storage?: StorageManager; soundEffects?: SoundEffects }): void {
    this.storage = data?.storage ?? new StorageManager();
    const audio = AudioManager.getInstance();
    audio.init(this.storage);
    this.soundEffects = data?.soundEffects ?? audio.sfx;
  }

  public create(): void {
    pokiBridge.gameplayStop();
    AudioManager.getInstance().setGameplayState('ending');
    const w = this.scale.width || GAME_WIDTH;
    const h = this.scale.height || GAME_HEIGHT;
    const halfW = w / 2;

    this.container = this.add.container(0, 0);

    // Phase 1: Dual-world split background
    const bgReal = this.add.rectangle(0, 0, halfW, h, 0xffffff).setOrigin(0, 0);
    const bgShadow = this.add.rectangle(halfW, 0, halfW, h, 0x0a0a0a).setOrigin(0, 0);
    this.container.add([bgReal, bgShadow]);

    // Central dividing line
    const dividingLine = this.add.line(halfW, 0, 0, 0, 0, h, 0x888888).setOrigin(0, 0);
    dividingLine.setLineWidth(2, 2);
    this.container.add(dividingLine);

    // Characters in initial positions
    const charY = h * 0.42;
    const realChar = this.add.rectangle(halfW - 140, charY, 26, 26, 0x000000);
    realChar.setStrokeStyle(1.5, 0x333333);
    const shadowChar = this.add.rectangle(halfW + 140, charY, 26, 26, 0xffffff);
    shadowChar.setStrokeStyle(1.5, 0xcccccc);
    this.container.add([realChar, shadowChar]);

    // Play atmospheric ending music
    this.soundEffects.playEndingTheme();

    // Cinematic step 1: Characters walk toward the center divide
    this.tweens.add({
      targets: realChar,
      x: halfW - 14,
      duration: 3200,
      ease: 'Sine.easeInOut',
    });

    this.tweens.add({
      targets: shadowChar,
      x: halfW + 14,
      duration: 3200,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        // Step 2: The touch and unity burst
        this.soundEffects.play('checkpoint');

        // Contact glow
        const flash = this.add.circle(halfW, charY, 8, 0xffffff, 1);
        this.container.add(flash);

        this.tweens.add({
          targets: flash,
          scale: 40,
          alpha: 0,
          duration: 1800,
          ease: 'Cubic.easeOut',
          onComplete: () => flash.destroy(),
        });

        // Dissolve dividing line
        this.tweens.add({
          targets: dividingLine,
          alpha: 0,
          duration: 1200,
        });

        // Blend backgrounds into unified twilight atmosphere
        this.tweens.add({
          targets: bgReal,
          fillColor: 0x141416,
          duration: 2000,
        });
        this.tweens.add({
          targets: bgShadow,
          fillColor: 0x141416,
          duration: 2000,
        });

        // Merge characters into unified radiant beacon
        this.tweens.add({
          targets: [realChar, shadowChar],
          x: halfW,
          alpha: 0,
          duration: 1200,
          onComplete: () => {
            const unifiedChar = this.add.rectangle(halfW, charY, 30, 30, 0xffffff);
            unifiedChar.setStrokeStyle(2, 0x888888);
            this.container.add(unifiedChar);

            // Breathing aura for unified character
            this.tweens.add({
              targets: unifiedChar,
              scale: 1.15,
              alpha: 0.85,
              yoyo: true,
              repeat: -1,
              duration: 2000,
              ease: 'Sine.easeInOut',
            });

            // Step 3: Story Resolution text reveals
            this.showNarrativeAndStats(w, h, halfW);
          },
        });
      },
    });
  }

  private showNarrativeAndStats(w: number, h: number, halfW: number): void {
    const textGroup = this.add.container(0, 0);
    this.container.add(textGroup);

    // Poetic narrative lines
    const line1 = this.add
      .text(halfW, h * 0.12, 'YOU WERE NEVER TRULY SEPARATE.', {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '18px',
        fontStyle: 'bold',
        color: '#FFFFFF',
        letterSpacing: 3,
      })
      .setOrigin(0.5)
      .setAlpha(0);

    const line2 = this.add
      .text(halfW, h * 0.17, 'The light cast the shadow. The shadow defined the light.', {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '13px',
        color: '#AAAAAA',
        letterSpacing: 1.5,
      })
      .setOrigin(0.5)
      .setAlpha(0);

    const line3 = this.add
      .text(halfW, h * 0.22, 'Across twenty chambers of separation and reflection, the divide is closed.', {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '12px',
        fontStyle: 'italic',
        color: '#777777',
        letterSpacing: 1,
      })
      .setOrigin(0.5)
      .setAlpha(0);

    textGroup.add([line1, line2, line3]);

    this.tweens.add({ targets: line1, alpha: 1, duration: 1500, delay: 400 });
    this.tweens.add({ targets: line2, alpha: 1, duration: 1500, delay: 1800 });
    this.tweens.add({ targets: line3, alpha: 1, duration: 1500, delay: 3200 });

    // Campaign Stats Card
    this.time.delayedCall(4600, () => {
      this.renderStatsAndCredits(w, h, halfW);
    });
  }

  private renderStatsAndCredits(w: number, h: number, halfW: number): void {
    const progress = this.storage.getProgress();
    const completedCount = progress.completedLevels.length;
    let totalMoves = 0;
    for (const lvlId in progress.bestMoves) {
      totalMoves += progress.bestMoves[lvlId] ?? 0;
    }

    const cardW = Math.min(460, w - 40);
    const cardH = 220;
    const cardY = h * 0.68;

    const statsCard = this.add.container(halfW, cardY);
    this.container.add(statsCard);

    // Box
    const box = this.add.graphics();
    box.fillStyle(0x0c0c0e, 0.95);
    box.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 6);
    box.lineStyle(1.5, 0xffffff, 0.6);
    box.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 6);
    statsCard.add(box);

    // Card Header
    const cardTitle = this.add
      .text(0, -cardH / 2 + 22, 'CAMPAIGN COMPLETION RECORD', {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '14px',
        fontStyle: 'bold',
        color: '#FFFFFF',
        letterSpacing: 2,
      })
      .setOrigin(0.5);
    statsCard.add(cardTitle);

    // Stats Grid
    const stat1 = this.add
      .text(-cardW / 2 + 30, -35, `CHAMBERS CLEARED:  ${completedCount} / ${ALL_LEVELS.length} (100%)`, {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '12px',
        color: '#CCCCCC',
        letterSpacing: 1,
      });

    const stat2 = this.add
      .text(-cardW / 2 + 30, -12, `TOTAL OPTIMAL MOVES:  ${totalMoves > 0 ? totalMoves : '182'}`, {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '12px',
        color: '#CCCCCC',
        letterSpacing: 1,
      });

    const stat3 = this.add
      .text(-cardW / 2 + 30, 11, `CHAPTER MASTERY:  ALL 5 CHAPTERS UNIFIED`, {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '12px',
        color: '#CCCCCC',
        letterSpacing: 1,
      });

    const stat4 = this.add
      .text(-cardW / 2 + 30, 34, `FINAL RANK:  UNIFIER OF REALITIES`, {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#FFFFFF',
        letterSpacing: 1.5,
      });

    statsCard.add([stat1, stat2, stat3, stat4]);

    // Action Buttons: REPLAY CAMPAIGN & RETURN TO MENU
    const btnW = 190;
    const btnH = 34;

    this.createButton(
      statsCard,
      -cardW / 4,
      cardH / 2 - 28,
      btnW,
      btnH,
      'REPLAY CAMPAIGN',
      () => {
        this.soundEffects.play('switch');
        this.scene.start('GameScene', { levelId: 1 });
      },
      true
    );

    this.createButton(
      statsCard,
      cardW / 4,
      cardH / 2 - 28,
      btnW,
      btnH,
      'RETURN TO MENU',
      () => {
        this.soundEffects.play('switch');
        this.scene.start('MenuScene');
      },
      false
    );

    // Credits Footer
    const credits = this.add
      .text(halfW, h - 18, 'THE OTHER SIDE  •  ANTIGRAVITY GAME STUDIOS  •  2026', {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '10px',
        color: '#555555',
        letterSpacing: 1.5,
      })
      .setOrigin(0.5);
    this.container.add(credits);

    // Card fade in
    statsCard.setAlpha(0);
    this.tweens.add({
      targets: statsCard,
      alpha: 1,
      duration: 1000,
    });
  }

  private createButton(
    parent: Phaser.GameObjects.Container,
    x: number,
    y: number,
    w: number,
    h: number,
    text: string,
    onClick: () => void,
    isPrimary: boolean
  ): void {
    const bg = this.add.graphics();
    const borderCol = isPrimary ? 0xffffff : 0x777777;
    const textCol = isPrimary ? '#FFFFFF' : '#AAAAAA';

    const render = (hover: boolean) => {
      bg.clear();
      bg.fillStyle(hover ? 0x26262a : 0x141416, 0.95);
      bg.fillRoundedRect(x - w / 2, y - h / 2, w, h, 4);
      bg.lineStyle(hover ? 1.5 : 1, hover ? 0xffffff : borderCol, 0.9);
      bg.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 4);
    };

    render(false);
    parent.add(bg);

    const txt = this.add
      .text(x, y, text, {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '11px',
        fontStyle: 'bold',
        color: textCol,
        letterSpacing: 1.5,
      })
      .setOrigin(0.5);
    parent.add(txt);

    const hit = this.add
      .zone(x, y, w, h)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    hit.on('pointerover', () => {
      render(true);
      txt.setColor('#FFFFFF');
    });

    hit.on('pointerout', () => {
      render(false);
      txt.setColor(textCol);
    });

    hit.on('pointerdown', onClick);
    parent.add(hit);
  }
}
