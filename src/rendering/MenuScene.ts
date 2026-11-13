import Phaser from 'phaser';
import { LevelManager } from '../levels/LevelManager';
import { StorageManager } from '../storage/StorageManager';
import { SoundEffects } from '../audio/SoundEffects';
import { AudioManager } from '../audio/AudioManager';
import { pokiBridge } from '../poki/PokiIntegration';
import { ALL_LEVELS } from '../levels/levelsData';
import { PALETTE } from '../core/constants';

export class MenuScene extends Phaser.Scene {
  private levelManager!: LevelManager;
  private storage!: StorageManager;
  private soundEffects!: SoundEffects;

  // View containers
  private mainMenuContainer!: Phaser.GameObjects.Container;
  private levelSelectContainer!: Phaser.GameObjects.Container;
  private settingsModal!: Phaser.GameObjects.Container;
  private creditsModal!: Phaser.GameObjects.Container;
  private confirmResetModal!: Phaser.GameObjects.Container;

  constructor() {
    super('MenuScene');
  }

  public init(data?: { levelManager?: LevelManager; soundEffects?: SoundEffects; openLevelSelect?: boolean }): void {
    this.storage = new StorageManager();
    const audio = AudioManager.getInstance();
    audio.init(this.storage);
    this.soundEffects = data?.soundEffects ?? audio.sfx;
    this.levelManager = data?.levelManager ?? new LevelManager(ALL_LEVELS, this.storage);

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.has('dev') || params.get('unlock') === 'all') {
        this.levelManager.setDevModeUnlockAll(true);
      }
    }
  }

  public create(data?: { openLevelSelect?: boolean }): void {
    pokiBridge.gameplayStop();
    AudioManager.getInstance().playMenuMusic();

    const { width, height } = this.scale;
    const halfW = width / 2;

    // 1. Split monochrome background
    const bg = this.add.graphics();
    bg.fillStyle(PALETTE.real.background, 1);
    bg.fillRect(0, 0, halfW, height);
    bg.fillStyle(PALETTE.shadow.background, 1);
    bg.fillRect(halfW, 0, halfW, height);

    // Center divider
    bg.lineStyle(1, PALETTE.divider, 0.7);
    bg.lineBetween(halfW, 0, halfW, height);

    // 2. Initialize View Containers
    this.mainMenuContainer = this.add.container(0, 0);
    this.levelSelectContainer = this.add.container(0, 0);
    this.levelSelectContainer.setVisible(false);

    // 3. Build Views
    this.createMainMenu(width, height);
    this.createLevelSelectionGrid(width, height);
    this.createSettingsModal(width, height);
    this.createCreditsModal(width, height);
    this.createConfirmResetModal(width, height);

    if (data?.openLevelSelect) {
      this.showLevelSelect();
    }

    // Keyboard shortcuts for quick start from menu
    this.input.keyboard?.on('keydown-SPACE', () => {
      const progress = this.storage.getProgress();
      this.startLevel(progress.unlockedLevel);
    });
    this.input.keyboard?.on('keydown-ENTER', () => {
      const progress = this.storage.getProgress();
      this.startLevel(progress.unlockedLevel);
    });
  }

  private createMainMenu(width: number, height: number): void {
    const halfW = width / 2;
    const progress = this.storage.getProgress();

    // Split Title: "THE OTHER" (black on white) | "SIDE" (white on black)
    const titleLeft = this.add
      .text(halfW - 20, 160, 'THE OTHER', {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '48px',
        fontStyle: 'bold',
        color: PALETTE.real.text,
        letterSpacing: 4,
      })
      .setOrigin(1, 0.5);
    this.mainMenuContainer.add(titleLeft);

    const titleRight = this.add
      .text(halfW + 20, 160, 'SIDE', {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '48px',
        fontStyle: 'bold',
        color: PALETTE.shadow.text,
        letterSpacing: 4,
      })
      .setOrigin(0, 0.5);
    this.mainMenuContainer.add(titleRight);

    // Subtitle
    const subtitle = this.add
      .text(halfW, 220, 'Two worlds. One mind.', {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '18px',
        color: '#888888',
        letterSpacing: 2,
      })
      .setOrigin(0.5);
    this.mainMenuContainer.add(subtitle);

    // Menu Buttons
    const btnW = 260;
    const btnH = 46;
    const startY = 300;
    const spacingY = 58;

    const hasProgress = progress.completedLevels.length > 0;
    const playLabel = hasProgress ? `CONTINUE  (LVL ${progress.unlockedLevel})` : 'PLAY';

    // 1. Play / Continue Button
    this.createMenuButton(
      this.mainMenuContainer,
      halfW,
      startY,
      btnW,
      btnH,
      playLabel,
      () => {
        const targetLevel = progress.unlockedLevel;
        this.startLevel(targetLevel);
      },
      true
    );

    // 2. Level Selection Button
    this.createMenuButton(
      this.mainMenuContainer,
      halfW,
      startY + spacingY,
      btnW,
      btnH,
      'LEVEL SELECTION',
      () => this.showLevelSelect(),
      false
    );

    // 3. Settings Button
    this.createMenuButton(
      this.mainMenuContainer,
      halfW,
      startY + spacingY * 2,
      btnW,
      btnH,
      'SETTINGS',
      () => this.settingsModal.setVisible(true),
      false
    );

    // 4. Credits Button
    this.createMenuButton(
      this.mainMenuContainer,
      halfW,
      startY + spacingY * 3,
      btnW,
      btnH,
      'CREDITS',
      () => this.creditsModal.setVisible(true),
      false
    );

    // Controls hint footer
    const footer = this.add
      .text(halfW, height - 35, 'ARROW KEYS / WASD TO MOVE  •  TOUCH CONTROLS SUPPORTED', {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '11px',
        color: '#666666',
        letterSpacing: 1.5,
      })
      .setOrigin(0.5);
    this.mainMenuContainer.add(footer);
  }

  private createMenuButton(
    container: Phaser.GameObjects.Container,
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

    const render = (hover: boolean) => {
      bg.clear();
      bg.fillStyle(hover ? 0x222222 : 0x0c0c0c, 0.95);
      bg.fillRoundedRect(x - w / 2, y - h / 2, w, h, 6);
      bg.lineStyle(hover ? 1.5 : 1, hover ? 0xffffff : borderCol, 0.9);
      bg.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 6);
    };

    render(false);
    container.add(bg);

    const txt = this.add
      .text(x, y, text, {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '13px',
        fontStyle: 'bold',
        color: isPrimary ? '#FFFFFF' : '#CCCCCC',
        letterSpacing: 1.5,
      })
      .setOrigin(0.5);
    container.add(txt);

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
      txt.setColor(isPrimary ? '#FFFFFF' : '#CCCCCC');
    });

    hit.on('pointerdown', () => {
      this.soundEffects.play('step');
      onClick();
    });

    container.add(hit);
  }

  private showLevelSelect(): void {
    this.mainMenuContainer.setVisible(false);
    this.levelSelectContainer.setVisible(true);
  }

  private showMainMenu(): void {
    this.levelSelectContainer.setVisible(false);
    this.mainMenuContainer.setVisible(true);
  }

  private createLevelSelectionGrid(width: number, height: number): void {
    const halfW = width / 2;

    // Header: "SELECT LEVEL" & Back Button
    const title = this.add
      .text(halfW, 40, 'LEVEL SELECTION', {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '24px',
        fontStyle: 'bold',
        color: '#FFFFFF',
        letterSpacing: 2,
      })
      .setOrigin(0.5);
    this.levelSelectContainer.add(title);

    // Back to Menu button
    this.createMenuButton(
      this.levelSelectContainer,
      80,
      40,
      100,
      32,
      '← MENU',
      () => this.showMainMenu(),
      false
    );

    // Chapter progress overview
    const levels = this.levelManager.getLevels();
    const progress = this.storage.getProgress();

    const cols = 5;
    const cellW = 86;
    const cellH = 68;
    const gapX = 14;
    const gapY = 16;
    const totalW = cols * cellW + (cols - 1) * gapX;
    const startX = width / 2 - totalW / 2;
    const startY = 100;

    levels.forEach((lvl, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const x = startX + col * (cellW + gapX) + cellW / 2;
      const y = startY + row * (cellH + gapY) + cellH / 2;

      const isUnlocked = this.levelManager.isLevelUnlocked(lvl.id);
      const isCompleted = progress.completedLevels.includes(lvl.id);
      const best = progress.bestMoves[lvl.id];

      const g = this.add.graphics();
      const fillCol = isCompleted ? 0x1b1b1b : isUnlocked ? 0x111111 : 0x080808;
      const strokeCol = isCompleted ? 0xffffff : isUnlocked ? 0x777777 : 0x222222;

      g.fillStyle(fillCol, 0.95);
      g.fillRoundedRect(x - cellW / 2, y - cellH / 2, cellW, cellH, 6);
      g.lineStyle(isCompleted ? 1.5 : 1, strokeCol, 0.9);
      g.strokeRoundedRect(x - cellW / 2, y - cellH / 2, cellW, cellH, 6);
      this.levelSelectContainer.add(g);

      // Level number
      const numTxt = this.add
        .text(x, y - 10, String(lvl.id).padStart(2, '0'), {
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize: '20px',
          fontStyle: 'bold',
          color: isUnlocked ? '#FFFFFF' : '#444444',
        })
        .setOrigin(0.5);
      this.levelSelectContainer.add(numTxt);

      // Status text (best moves or locked)
      const sub = isCompleted
        ? `★ ${best ?? 0}m`
        : isUnlocked
          ? lvl.difficulty.slice(0, 3)
          : 'LOCKED';

      const subTxt = this.add
        .text(x, y + 15, sub, {
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize: '10px',
          color: isCompleted ? '#AAAAAA' : isUnlocked ? '#777777' : '#333333',
          letterSpacing: 0.5,
        })
        .setOrigin(0.5);
      this.levelSelectContainer.add(subTxt);

      if (isUnlocked) {
        const hit = this.add
          .zone(x, y, cellW, cellH)
          .setOrigin(0.5)
          .setInteractive({ useHandCursor: true });

        hit.on('pointerover', () => {
          g.lineStyle(2, 0xffffff, 1);
          g.strokeRoundedRect(x - cellW / 2, y - cellH / 2, cellW, cellH, 6);
        });

        hit.on('pointerout', () => {
          g.lineStyle(isCompleted ? 1.5 : 1, strokeCol, 0.9);
          g.strokeRoundedRect(x - cellW / 2, y - cellH / 2, cellW, cellH, 6);
        });

        hit.on('pointerdown', () => {
          this.soundEffects.play('step');
          this.startLevel(lvl.id);
        });

        this.levelSelectContainer.add(hit);
      }
    });

    // Chapter legend at bottom
    const legend = this.add
      .text(
        halfW,
        height - 35,
        'CH.1: THE BEGINNING  •  CH.2: THE CONNECTION  •  CH.3: THE SEPARATION  •  CH.4: THE REFLECTION  •  CH.5: THE TRUTH',
        {
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize: '10px',
          color: '#666666',
          letterSpacing: 1,
        }
      )
      .setOrigin(0.5);
    this.levelSelectContainer.add(legend);
  }

  private createSettingsModal(width: number, height: number): void {
    this.settingsModal = this.add.container(width / 2, height / 2);
    this.settingsModal.setDepth(150);
    this.settingsModal.setVisible(false);

    const modalW = 460;
    const modalH = 430;

    // Backdrop
    const backdrop = this.add.graphics();
    backdrop.fillStyle(0x000000, 0.7);
    backdrop.fillRect(-width / 2, -height / 2, width, height);
    this.settingsModal.add(backdrop);

    // Box
    const box = this.add.graphics();
    box.fillStyle(0x080808, 0.98);
    box.fillRoundedRect(-modalW / 2, -modalH / 2, modalW, modalH, 8);
    box.lineStyle(1.5, 0xffffff, 0.9);
    box.strokeRoundedRect(-modalW / 2, -modalH / 2, modalW, modalH, 8);
    this.settingsModal.add(box);

    // Title
    const title = this.add
      .text(0, -180, 'SETTINGS', {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '22px',
        fontStyle: 'bold',
        color: '#FFFFFF',
        letterSpacing: 2,
      })
      .setOrigin(0.5);
    this.settingsModal.add(title);

    const audio = AudioManager.getInstance();

    // 1. Audio Mute Toggle
    let isMuted = this.storage.getProgress().muted;
    const soundText = this.add
      .text(0, -135, `AUDIO: ${isMuted ? 'MUTED' : 'ENABLED'}`, {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '14px',
        fontStyle: 'bold',
        color: '#FFFFFF',
        letterSpacing: 1.5,
      })
      .setOrigin(0.5);
    this.settingsModal.add(soundText);

    this.createMenuButton(
      this.settingsModal,
      0,
      -105,
      260,
      30,
      'TOGGLE MUTE',
      () => {
        isMuted = !isMuted;
        audio.setMuted(isMuted);
        soundText.setText(`AUDIO: ${isMuted ? 'MUTED' : 'ENABLED'}`);
      },
      false
    );

    // 2. Master Volume
    let masterVal = Math.round(audio.getMasterVolume() * 100);
    const masterText = this.add
      .text(0, -65, `MASTER VOLUME: ${masterVal}%`, {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '13px',
        color: '#CCCCCC',
        letterSpacing: 1,
      })
      .setOrigin(0.5);
    this.settingsModal.add(masterText);

    this.createMenuButton(
      this.settingsModal,
      -80,
      -35,
      70,
      26,
      '- 10%',
      () => {
        masterVal = Math.max(0, masterVal - 10);
        audio.setMasterVolume(masterVal / 100);
        masterText.setText(`MASTER VOLUME: ${masterVal}%`);
      },
      false
    );

    this.createMenuButton(
      this.settingsModal,
      80,
      -35,
      70,
      26,
      '+ 10%',
      () => {
        masterVal = Math.min(100, masterVal + 10);
        audio.setMasterVolume(masterVal / 100);
        masterText.setText(`MASTER VOLUME: ${masterVal}%`);
      },
      false
    );

    // 3. Music Volume & SFX Volume Rows
    let musicVal = Math.round(audio.getMusicVolume() * 100);
    const musicText = this.add
      .text(-100, 5, `MUSIC: ${musicVal}%`, {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '12px',
        color: '#AAAAAA',
      })
      .setOrigin(0.5);
    this.settingsModal.add(musicText);

    this.createMenuButton(
      this.settingsModal,
      -145,
      30,
      50,
      24,
      '-',
      () => {
        musicVal = Math.max(0, musicVal - 10);
        audio.setMusicVolume(musicVal / 100);
        musicText.setText(`MUSIC: ${musicVal}%`);
      },
      false
    );

    this.createMenuButton(
      this.settingsModal,
      -55,
      30,
      50,
      24,
      '+',
      () => {
        musicVal = Math.min(100, musicVal + 10);
        audio.setMusicVolume(musicVal / 100);
        musicText.setText(`MUSIC: ${musicVal}%`);
      },
      false
    );

    let sfxVal = Math.round(audio.getSfxVolume() * 100);
    const sfxText = this.add
      .text(100, 5, `SFX: ${sfxVal}%`, {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '12px',
        color: '#AAAAAA',
      })
      .setOrigin(0.5);
    this.settingsModal.add(sfxText);

    this.createMenuButton(
      this.settingsModal,
      55,
      30,
      50,
      24,
      '-',
      () => {
        sfxVal = Math.max(0, sfxVal - 10);
        audio.setSfxVolume(sfxVal / 100);
        sfxText.setText(`SFX: ${sfxVal}%`);
      },
      false
    );

    this.createMenuButton(
      this.settingsModal,
      145,
      30,
      50,
      24,
      '+',
      () => {
        sfxVal = Math.min(100, sfxVal + 10);
        audio.setSfxVolume(sfxVal / 100);
        sfxText.setText(`SFX: ${sfxVal}%`);
      },
      false
    );

    // 4. Reduced Motion Toggle
    let isReduced = this.storage.getProgress().reducedMotion;
    const motionText = this.add
      .text(0, 75, `MOTION: ${isReduced ? 'REDUCED' : 'NORMAL'}`, {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '13px',
        fontStyle: 'bold',
        color: '#FFFFFF',
        letterSpacing: 1.5,
      })
      .setOrigin(0.5);
    this.settingsModal.add(motionText);

    this.createMenuButton(
      this.settingsModal,
      0,
      105,
      260,
      30,
      'TOGGLE REDUCED MOTION',
      () => {
        isReduced = !isReduced;
        this.storage.setReducedMotion(isReduced);
        motionText.setText(`MOTION: ${isReduced ? 'REDUCED' : 'NORMAL'}`);
      },
      false
    );

    // 5. Reset Game Progress Button
    this.createMenuButton(
      this.settingsModal,
      0,
      150,
      260,
      30,
      'RESET PROGRESS',
      () => {
        this.confirmResetModal.setVisible(true);
      },
      false
    );

    // Close button
    this.createMenuButton(
      this.settingsModal,
      modalW / 2 - 35,
      -modalH / 2 + 25,
      40,
      30,
      '✕',
      () => this.settingsModal.setVisible(false),
      false
    );
  }

  private createConfirmResetModal(width: number, height: number): void {
    this.confirmResetModal = this.add.container(width / 2, height / 2);
    this.confirmResetModal.setDepth(200);
    this.confirmResetModal.setVisible(false);

    const modalW = 380;
    const modalH = 200;

    const backdrop = this.add.graphics();
    backdrop.fillStyle(0x000000, 0.8);
    backdrop.fillRect(-width / 2, -height / 2, width, height);
    this.confirmResetModal.add(backdrop);

    const box = this.add.graphics();
    box.fillStyle(0x0a0a0a, 0.98);
    box.fillRoundedRect(-modalW / 2, -modalH / 2, modalW, modalH, 8);
    box.lineStyle(1.5, 0xffffff, 0.9);
    box.strokeRoundedRect(-modalW / 2, -modalH / 2, modalW, modalH, 8);
    this.confirmResetModal.add(box);

    const msg = this.add
      .text(0, -45, 'RESET ALL PROGRESS?\nThis action cannot be undone.', {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '14px',
        fontStyle: 'bold',
        color: '#FFFFFF',
        align: 'center',
        lineSpacing: 6,
      })
      .setOrigin(0.5);
    this.confirmResetModal.add(msg);

    // Confirm button
    this.createMenuButton(
      this.confirmResetModal,
      -70,
      35,
      110,
      36,
      'CONFIRM',
      () => {
        this.storage.startNewGame(true);
        this.confirmResetModal.setVisible(false);
        this.settingsModal.setVisible(false);
        // Refresh scene
        this.scene.restart();
      },
      true
    );

    // Cancel button
    this.createMenuButton(
      this.confirmResetModal,
      70,
      35,
      110,
      36,
      'CANCEL',
      () => this.confirmResetModal.setVisible(false),
      false
    );
  }

  private createCreditsModal(width: number, height: number): void {
    this.creditsModal = this.add.container(width / 2, height / 2);
    this.creditsModal.setDepth(150);
    this.creditsModal.setVisible(false);

    const modalW = 440;
    const modalH = 280;

    const backdrop = this.add.graphics();
    backdrop.fillStyle(0x000000, 0.7);
    backdrop.fillRect(-width / 2, -height / 2, width, height);
    this.creditsModal.add(backdrop);

    const box = this.add.graphics();
    box.fillStyle(0x080808, 0.98);
    box.fillRoundedRect(-modalW / 2, -modalH / 2, modalW, modalH, 8);
    box.lineStyle(1.5, 0xffffff, 0.9);
    box.strokeRoundedRect(-modalW / 2, -modalH / 2, modalW, modalH, 8);
    this.creditsModal.add(box);

    const title = this.add
      .text(0, -95, 'CREDITS', {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '22px',
        fontStyle: 'bold',
        color: '#FFFFFF',
        letterSpacing: 2,
      })
      .setOrigin(0.5);
    this.creditsModal.add(title);

    const creditsBody = this.add
      .text(
        0,
        -10,
        'THE OTHER SIDE\n\n' +
          'Concept & Design: Google DeepMind pair programming\n' +
          'Built with Phaser 3 & TypeScript\n' +
          'Publishing Platform: Poki\n\n' +
          'Two worlds. One mind.',
        {
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize: '13px',
          color: '#CCCCCC',
          align: 'center',
          lineSpacing: 4,
        }
      )
      .setOrigin(0.5);
    this.creditsModal.add(creditsBody);

    this.createMenuButton(
      this.creditsModal,
      0,
      95,
      160,
      34,
      'CLOSE',
      () => this.creditsModal.setVisible(false),
      true
    );
  }

  private startLevel(levelId: number): void {
    AudioManager.getInstance().stopAllMusic();
    this.scene.start('GameScene', { levelId });
  }
}
