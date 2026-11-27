import Phaser from 'phaser';
import { LevelManager } from '../levels/LevelManager';
import { StorageManager } from '../storage/StorageManager';
import { SoundEffects } from '../audio/SoundEffects';
import { AudioManager } from '../audio/AudioManager';
import { pokiBridge } from '../poki/PokiIntegration';
import { ALL_LEVELS } from '../levels/levelsData';
import { PALETTE } from '../core/constants';
import { ObjectGuideModal } from '../ui/ObjectGuideModal';
import { SettingsModal } from '../ui/SettingsModal';
import { KeyboardNavManager, FocusableItem } from '../ui/KeyboardNavManager';
import { MobileControlsOverlay } from '../ui/MobileControlsOverlay';
import { BackdropRenderer } from './BackdropRenderer';

export class MenuScene extends Phaser.Scene {
  private levelManager!: LevelManager;
  private storage!: StorageManager;
  private soundEffects!: SoundEffects;

  // View containers
  private mainMenuContainer!: Phaser.GameObjects.Container;
  private levelSelectContainer!: Phaser.GameObjects.Container;
  private settingsModal!: SettingsModal;
  private confirmResetModal!: Phaser.GameObjects.Container;
  private objectGuideModal!: ObjectGuideModal;

  // Keyboard Navigation Items
  private mainMenuItems: FocusableItem[] = [];
  private levelSelectItems: FocusableItem[] = [];
  private confirmResetItems: FocusableItem[] = [];
  private menuKeyDownListener: ((e: KeyboardEvent) => void) | null = null;

  // Modal Hit Zone Isolation Tracking
  private mainMenuHitZones: Phaser.GameObjects.Zone[] = [];
  private levelSelectHitZones: Phaser.GameObjects.Zone[] = [];
  private confirmResetHitZones: Phaser.GameObjects.Zone[] = [];

  // Background Mirroring VFX
  private ambientGraphics!: Phaser.GameObjects.Graphics;
  private ambientParticles: Array<{
    xOffset: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    baseAlpha: number;
  }> = [];
  private isTransitioning: boolean = false;

  constructor() {
    super('MenuScene');
  }

  public init(data?: { levelManager?: LevelManager; soundEffects?: SoundEffects; openLevelSelect?: boolean }): void {
    this.isTransitioning = false;
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
    BackdropRenderer.setMode('menu');
    this.cameras.main.fadeIn(280, 0, 0, 0);

    const { width, height } = this.scale;
    const halfW = width / 2;

    // 1. Clean ambient background layer
    // When BackdropRenderer is active in index.html, it seamlessly drives the full-viewport
    // 5-layer living animated atmosphere across the entire screen.
    // In standalone/headless environments without #backdrop-canvas, we provide a clean fallback.
    const hasBackdrop = typeof document !== 'undefined' && !!document.getElementById('backdrop-canvas');
    if (!hasBackdrop) {
      const bg = this.add.graphics();
      bg.fillStyle(PALETTE.real.background, 1);
      bg.fillRect(0, 0, halfW, height);
      bg.fillStyle(PALETTE.shadow.background, 1);
      bg.fillRect(halfW, 0, halfW, height);

      bg.lineStyle(1, PALETTE.divider, 0.7);
      bg.lineBetween(halfW, 0, halfW, height);
    }

    // Dynamic Ambient Mirroring Graphics (depth 1)
    this.ambientGraphics = this.add.graphics().setDepth(1);
    this.ambientParticles = [];
    const isReduced = this.storage.getProgress().reducedMotion;
    const particleCount = isReduced ? 0 : 28;
    for (let i = 0; i < particleCount; i++) {
      this.ambientParticles.push({
        xOffset: Math.random() * (halfW - 50) + 25,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 18,
        vy: (Math.random() - 0.5) * 22,
        radius: Math.random() * 2.5 + 1.2,
        baseAlpha: Math.random() * 0.35 + 0.15,
      });
    }

    // 2. Initialize View Containers & Hit Zone Registries
    this.mainMenuHitZones = [];
    this.levelSelectHitZones = [];
    this.confirmResetHitZones = [];

    this.mainMenuContainer = this.add.container(0, 0);
    this.levelSelectContainer = this.add.container(0, 0);
    this.levelSelectContainer.setVisible(false);

    // 3. Build Views
    this.createMainMenu(width, height);
    this.createLevelSelectionGrid(width, height);
    this.settingsModal = new SettingsModal(
      this,
      width,
      height,
      this.storage,
      () => this.closeSettingsModal(),
      {
        showObjectGuideButton: true,
        onOpenObjectGuide: () => {
          this.settingsModal.hide();
          this.setZoneListInteractive(this.mainMenuHitZones, false);
          this.setZoneListInteractive(this.levelSelectHitZones, false);
          this.soundEffects.playMenuOpen();
          this.objectGuideModal.show();
        },
        showResetProgressButton: true,
        onResetProgress: () => this.openConfirmResetModal(),
      }
    );
    this.createConfirmResetModal(width, height);

    this.objectGuideModal = new ObjectGuideModal(this, width, height, () => {
      this.soundEffects.playMenuClose();
      if (this.levelSelectContainer.visible) {
        this.setZoneListInteractive(this.levelSelectHitZones, true);
      } else {
        this.setZoneListInteractive(this.mainMenuHitZones, true);
      }
    });

    // Ensure mobile overlay is hidden on menus
    MobileControlsOverlay.getInstance().setVisible(false);

    // Keyboard navigation & focus system
    KeyboardNavManager.getInstance().setScene(this);

    if (data?.openLevelSelect) {
      this.showLevelSelect();
    } else {
      this.showMainMenu();
    }

    this.menuKeyDownListener = (e: KeyboardEvent) => {
      KeyboardNavManager.getInstance().handleKeyDown(e);
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this.menuKeyDownListener);
    }

    const onResize = () => {
      this.scene.restart({ openLevelSelect: this.levelSelectContainer?.visible });
    };
    this.scale.on('resize', onResize, this);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off('resize', onResize, this);
      if (this.menuKeyDownListener && typeof window !== 'undefined') {
        window.removeEventListener('keydown', this.menuKeyDownListener);
        this.menuKeyDownListener = null;
      }
      KeyboardNavManager.getInstance().reset();
    });
  }

  /**
   * Guards against duplicate intro initialization when double-clicking Play / Prologue.
   */
  private launchIntro(nextScene?: string, levelId?: number): void {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    this.soundEffects.playUiClick();
    this.cameras.main.fadeOut(250, 0, 0, 0);
    this.time.delayedCall(250, () => {
      const payload = nextScene !== undefined ? { nextScene, levelId } : undefined;
      this.scene.start('CinematicIntroScene', payload);
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

    // Tagline in all-caps
    const subtitle = this.add
      .text(halfW, 220, 'TWO WORLDS. ONE MIND.', {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '17px',
        fontStyle: 'bold',
        color: '#888888',
        letterSpacing: 3,
      })
      .setOrigin(0.5);
    this.mainMenuContainer.add(subtitle);

    // Menu Buttons (Large, comfortable mobile accessible touch targets)
    const btnW = 320;
    const hasProgress = progress.completedLevels.length > 0;
    this.mainMenuItems = [];

    if (hasProgress) {
      const btnH = 42;
      const startY = 250;
      const spacingY = 48;

      // 1. Continue Button (primary)
      this.mainMenuItems.push(
        this.createMenuButton(
          this.mainMenuContainer,
          'menu-continue',
          halfW,
          startY,
          btnW,
          46,
          `CONTINUE  (LVL ${progress.unlockedLevel})`,
          () => this.startLevel(progress.unlockedLevel),
          true
        )
      );

      // 2. Play / New Game Button (opens with cinematic intro)
      this.mainMenuItems.push(
        this.createMenuButton(
          this.mainMenuContainer,
          'menu-play',
          halfW,
          startY + spacingY,
          btnW,
          btnH,
          'PLAY  (NEW GAME)',
          () => this.launchIntro('GameScene', 1),
          false
        )
      );

      // 3. Level Selection Button
      this.mainMenuItems.push(
        this.createMenuButton(
          this.mainMenuContainer,
          'menu-level-select',
          halfW,
          startY + spacingY * 2,
          btnW,
          btnH,
          'LEVEL SELECTION',
          () => this.showLevelSelect(),
          false
        )
      );

      // 4. Object Guide Button
      this.mainMenuItems.push(
        this.createMenuButton(
          this.mainMenuContainer,
          'menu-guide',
          halfW,
          startY + spacingY * 3,
          btnW,
          btnH,
          'OBJECT GUIDE',
          () => {
            this.setZoneListInteractive(this.mainMenuHitZones, false);
            this.setZoneListInteractive(this.levelSelectHitZones, false);
            this.soundEffects.playMenuOpen();
            this.objectGuideModal.show();
          },
          false
        )
      );

      // 5. Settings Button
      this.mainMenuItems.push(
        this.createMenuButton(
          this.mainMenuContainer,
          'menu-settings',
          halfW,
          startY + spacingY * 4,
          btnW,
          btnH,
          'SETTINGS',
          () => this.openSettingsModal(),
          false
        )
      );

      // 6. Prologue Cinematic Intro Replay Button
      this.mainMenuItems.push(
        this.createMenuButton(
          this.mainMenuContainer,
          'menu-intro',
          halfW,
          startY + spacingY * 5,
          btnW,
          btnH,
          'PROLOGUE  (INTRO)',
          () => this.launchIntro(),
          false
        )
      );
    } else {
      const btnH = 40;
      const startY = 275;
      const spacingY = 48;

      // 1. Play Button (primary - opens with cinematic intro)
      this.mainMenuItems.push(
        this.createMenuButton(
          this.mainMenuContainer,
          'menu-play',
          halfW,
          startY,
          btnW,
          44,
          'PLAY',
          () => this.launchIntro('GameScene', 1),
          true
        )
      );

      // 2. Level Selection Button
      this.mainMenuItems.push(
        this.createMenuButton(
          this.mainMenuContainer,
          'menu-level-select',
          halfW,
          startY + spacingY,
          btnW,
          btnH,
          'LEVEL SELECTION',
          () => this.showLevelSelect(),
          false
        )
      );

      // 3. Object Guide Button
      this.mainMenuItems.push(
        this.createMenuButton(
          this.mainMenuContainer,
          'menu-guide',
          halfW,
          startY + spacingY * 2,
          btnW,
          btnH,
          'OBJECT GUIDE',
          () => {
            this.setZoneListInteractive(this.mainMenuHitZones, false);
            this.setZoneListInteractive(this.levelSelectHitZones, false);
            this.soundEffects.playMenuOpen();
            this.objectGuideModal.show();
          },
          false
        )
      );

      // 4. Settings Button
      this.mainMenuItems.push(
        this.createMenuButton(
          this.mainMenuContainer,
          'menu-settings',
          halfW,
          startY + spacingY * 3,
          btnW,
          btnH,
          'SETTINGS',
          () => this.openSettingsModal(),
          false
        )
      );

      // 5. Prologue Cinematic Intro Replay Button
      this.mainMenuItems.push(
        this.createMenuButton(
          this.mainMenuContainer,
          'menu-intro',
          halfW,
          startY + spacingY * 4,
          btnW,
          btnH,
          'PROLOGUE  (INTRO)',
          () => this.launchIntro(),
          false
        )
      );
    }

    // Subtle incognito / restricted storage notice (non-blocking, crisp pill across dual-world split)
    if (!this.storage.isStorageAvailable) {
      const noticeText = 'TEMPORARY SESSION: BROWSER STORAGE RESTRICTED (PROGRESS NOT SAVED)';
      const badgeW = 472;
      const badgeH = 22;
      const badgeY = height - 60;
      const badgeBg = this.add.graphics();
      badgeBg.fillStyle(0x0c141c, 0.88);
      badgeBg.fillRoundedRect(halfW - badgeW / 2, badgeY - badgeH / 2, badgeW, badgeH, 11);
      badgeBg.lineStyle(1, 0x3b6878, 0.75);
      badgeBg.strokeRoundedRect(halfW - badgeW / 2, badgeY - badgeH / 2, badgeW, badgeH, 11);
      this.mainMenuContainer.add(badgeBg);

      const storageNotice = this.add
        .text(halfW, badgeY, noticeText, {
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize: '9.5px',
          fontStyle: 'bold',
          color: '#A5D8E8',
          letterSpacing: 0.9,
        })
        .setOrigin(0.5);
      this.mainMenuContainer.add(storageNotice);
    }

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

  private setZoneListInteractive(zones: Phaser.GameObjects.Zone[], interactive: boolean): void {
    for (const zone of zones) {
      if (zone && zone.active) {
        if (interactive) {
          zone.setInteractive({ useHandCursor: true });
        } else {
          zone.disableInteractive();
        }
      }
    }
  }

  private createMenuButton(
    container: Phaser.GameObjects.Container,
    id: string,
    x: number,
    y: number,
    w: number,
    h: number,
    text: string,
    onClick: () => void,
    isPrimary: boolean
  ): FocusableItem {
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
        fontSize: '14px',
        fontStyle: 'bold',
        color: isPrimary ? '#FFFFFF' : '#CCCCCC',
        letterSpacing: 1.5,
      })
      .setOrigin(0.5);
    container.add(txt);

    const hit = this.add
      .zone(x, y, Math.max(48, w), Math.max(48, h))
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    hit.on('pointerover', () => {
      render(true);
      txt.setColor('#FFFFFF');
      this.soundEffects.playUiHover();
      KeyboardNavManager.getInstance().setFocusById(id);
    });

    hit.on('pointerout', () => {
      render(false);
      txt.setColor(isPrimary ? '#FFFFFF' : '#CCCCCC');
    });

    let isProcessing = false;
    const trigger = () => {
      if (isProcessing) return;
      isProcessing = true;
      this.soundEffects.playUiClick();
      onClick();
      setTimeout(() => {
        isProcessing = false;
      }, 300);
    };

    hit.on('pointerdown', (_pointer: Phaser.Input.Pointer, _lx: number, _ly: number, event: Phaser.Types.Input.EventData) => {
      if (event && event.stopPropagation) event.stopPropagation();
      trigger();
    });

    container.add(hit);

    if (container === this.mainMenuContainer) {
      this.mainMenuHitZones.push(hit);
    } else if (container === this.levelSelectContainer) {
      this.levelSelectHitZones.push(hit);
    } else if (container === this.confirmResetModal) {
      this.confirmResetHitZones.push(hit);
    }

    return {
      id,
      getBounds: () => ({
        x: container.x + x,
        y: container.y + y,
        width: w,
        height: h,
      }),
      onActivate: trigger,
    };
  }

  private showLevelSelect(): void {
    this.soundEffects.playMenuOpen();
    this.setZoneListInteractive(this.mainMenuHitZones, false);
    this.mainMenuContainer.setVisible(false);
    this.setZoneListInteractive(this.levelSelectHitZones, true);
    this.levelSelectContainer.setVisible(true);
    KeyboardNavManager.getInstance().pushContext({
      id: 'level-select',
      items: this.levelSelectItems,
      selectedIndex: 2,
      gridCols: 5,
      onEscape: () => this.showMainMenu(),
      trapFocus: true,
    });
  }

  private showMainMenu(): void {
    this.soundEffects.playMenuClose();
    this.setZoneListInteractive(this.levelSelectHitZones, false);
    this.levelSelectContainer.setVisible(false);
    this.setZoneListInteractive(this.mainMenuHitZones, true);
    this.mainMenuContainer.setVisible(true);
    const nav = KeyboardNavManager.getInstance();
    nav.popContext('level-select');
    nav.popContext('main-menu');
    nav.pushContext({
      id: 'main-menu',
      items: this.mainMenuItems,
      selectedIndex: 0,
      onEscape: () => {},
      trapFocus: true,
    });
  }

  private createLevelSelectionGrid(width: number, height: number): void {
    const halfW = width / 2;

    // Full-screen interactive blocking backdrop for level selection
    const levelBackdrop = this.add.graphics();
    levelBackdrop.fillStyle(0x000000, 0.5);
    levelBackdrop.fillRect(0, 0, width, height);
    levelBackdrop.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, width, height),
      Phaser.Geom.Rectangle.Contains
    );
    levelBackdrop.on('pointerdown', (_pointer: Phaser.Input.Pointer, _lx: number, _ly: number, event: Phaser.Types.Input.EventData) => {
      if (event && event.stopPropagation) event.stopPropagation();
    });
    levelBackdrop.on('pointerup', (_pointer: Phaser.Input.Pointer, _lx: number, _ly: number, event: Phaser.Types.Input.EventData) => {
      if (event && event.stopPropagation) event.stopPropagation();
    });
    this.levelSelectContainer.add(levelBackdrop);

    // Header: Split Title "LEVEL" (black on white) | "SELECTION" (white on black)
    const titleLeft = this.add
      .text(halfW - 8, 40, 'LEVEL', {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '24px',
        fontStyle: 'bold',
        color: PALETTE.real.text,
        letterSpacing: 2,
      })
      .setOrigin(1, 0.5);
    this.levelSelectContainer.add(titleLeft);

    const titleRight = this.add
      .text(halfW + 8, 40, 'SELECTION', {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '24px',
        fontStyle: 'bold',
        color: PALETTE.shadow.text,
        letterSpacing: 2,
      })
      .setOrigin(0, 0.5);
    this.levelSelectContainer.add(titleRight);

    this.levelSelectItems = [];

    // Back to Menu button
    this.levelSelectItems.push(
      this.createMenuButton(
        this.levelSelectContainer,
        'level-select-back',
        80,
        40,
        100,
        32,
        '← MENU',
        () => this.showMainMenu(),
        false
      )
    );

    // Upper-right close button
    this.levelSelectItems.push(
      this.createMenuButton(
        this.levelSelectContainer,
        'level-select-close',
        width - 40,
        40,
        40,
        32,
        '✕',
        () => this.showMainMenu(),
        false
      )
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

      const hit = this.add
        .zone(x, y, Math.max(48, cellW), Math.max(48, cellH))
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: isUnlocked });

      if (isUnlocked) {
        hit.on('pointerover', () => {
          this.soundEffects.playUiHover();
          g.lineStyle(2, 0xffffff, 1);
          g.strokeRoundedRect(x - cellW / 2, y - cellH / 2, cellW, cellH, 6);
          KeyboardNavManager.getInstance().setFocusById(`level-card-${lvl.id}`);
        });

        hit.on('pointerout', () => {
          g.lineStyle(isCompleted ? 1.5 : 1, strokeCol, 0.9);
          g.strokeRoundedRect(x - cellW / 2, y - cellH / 2, cellW, cellH, 6);
        });

        let isCardProcessing = false;
        hit.on('pointerdown', (_pointer: Phaser.Input.Pointer, _lx: number, _ly: number, event: Phaser.Types.Input.EventData) => {
          if (event && event.stopPropagation) event.stopPropagation();
          if (isCardProcessing) return;
          isCardProcessing = true;
          this.soundEffects.playLevelSelect();
          this.startLevel(lvl.id);
          setTimeout(() => {
            isCardProcessing = false;
          }, 350);
        });
      } else {
        hit.on('pointerover', () => {
          KeyboardNavManager.getInstance().setFocusById(`level-card-${lvl.id}`);
        });

        hit.on('pointerdown', (_pointer: Phaser.Input.Pointer, _lx: number, _ly: number, event: Phaser.Types.Input.EventData) => {
          if (event && event.stopPropagation) event.stopPropagation();
          this.soundEffects.playLockedError();
          // Visual denial pulse: flash red outline
          g.lineStyle(2, 0xff3333, 1);
          g.strokeRoundedRect(x - cellW / 2, y - cellH / 2, cellW, cellH, 6);
          this.time.delayedCall(250, () => {
            g.lineStyle(1, strokeCol, 0.9);
            g.strokeRoundedRect(x - cellW / 2, y - cellH / 2, cellW, cellH, 6);
          });
        });
      }

      this.levelSelectContainer.add(hit);
      this.levelSelectHitZones.push(hit);

      this.levelSelectItems.push({
        id: `level-card-${lvl.id}`,
        getBounds: () => ({ x, y, width: cellW, height: cellH }),
        onActivate: () => {
          if (isUnlocked) {
            this.soundEffects.playLevelSelect();
            this.startLevel(lvl.id);
          } else {
            this.soundEffects.playLockedError();
            g.lineStyle(2, 0xff3333, 1);
            g.strokeRoundedRect(x - cellW / 2, y - cellH / 2, cellW, cellH, 6);
            this.time.delayedCall(250, () => {
              g.lineStyle(1, strokeCol, 0.9);
              g.strokeRoundedRect(x - cellW / 2, y - cellH / 2, cellW, cellH, 6);
            });
          }
        },
      });
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

  private openSettingsModal(): void {
    this.soundEffects.playMenuOpen();
    this.setZoneListInteractive(this.mainMenuHitZones, false);
    this.setZoneListInteractive(this.levelSelectHitZones, false);
    this.settingsModal.show();
  }

  private closeSettingsModal(): void {
    this.soundEffects.playMenuClose();
    if (this.settingsModal.isVisible()) {
      this.settingsModal.hide();
    }
    if (this.levelSelectContainer.visible) {
      this.setZoneListInteractive(this.levelSelectHitZones, true);
    } else {
      this.setZoneListInteractive(this.mainMenuHitZones, true);
    }
  }

  private openConfirmResetModal(): void {
    this.soundEffects.playMenuOpen();
    this.settingsModal.hide();
    BackdropRenderer.setDimmed(true);
    this.setZoneListInteractive(this.confirmResetHitZones, true);
    this.confirmResetModal.setVisible(true);
    KeyboardNavManager.getInstance().pushContext({
      id: 'menu-confirm-reset',
      items: this.confirmResetItems,
      selectedIndex: 1,
      onEscape: () => this.closeConfirmResetModal(),
      trapFocus: true,
    });
  }

  private closeConfirmResetModal(reopenSettings: boolean = true): void {
    this.soundEffects.playMenuClose();
    this.setZoneListInteractive(this.confirmResetHitZones, false);
    this.confirmResetModal.setVisible(false);
    KeyboardNavManager.getInstance().popContext('menu-confirm-reset');
    BackdropRenderer.setDimmed(false);
    if (reopenSettings) {
      this.settingsModal.show();
    }
  }

  private createConfirmResetModal(width: number, height: number): void {
    this.confirmResetModal = this.add.container(width / 2, height / 2);
    this.confirmResetModal.setDepth(200);
    this.confirmResetModal.setVisible(false);

    const modalW = 380;
    const modalH = 200;
    this.confirmResetItems = [];

    const backdrop = this.add.graphics();
    backdrop.fillStyle(0x000000, 0.85);
    backdrop.fillRect(-width / 2, -height / 2, width, height);
    backdrop.setInteractive(
      new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height),
      Phaser.Geom.Rectangle.Contains
    );
    backdrop.on('pointerdown', (_pointer: Phaser.Input.Pointer, _lx: number, _ly: number, event: Phaser.Types.Input.EventData) => {
      if (event && event.stopPropagation) event.stopPropagation();
    });
    backdrop.on('pointerup', (_pointer: Phaser.Input.Pointer, _lx: number, _ly: number, event: Phaser.Types.Input.EventData) => {
      if (event && event.stopPropagation) event.stopPropagation();
    });
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

    // Cancel button
    this.confirmResetItems.push(
      this.createMenuButton(
        this.confirmResetModal,
        'confirm-cancel',
        -70,
        35,
        110,
        36,
        'CANCEL',
        () => this.closeConfirmResetModal(),
        false
      )
    );

    // Confirm button
    this.confirmResetItems.push(
      this.createMenuButton(
        this.confirmResetModal,
        'confirm-reset',
        70,
        35,
        110,
        36,
        'CONFIRM',
        () => {
          this.storage.startNewGame(true);
          this.closeConfirmResetModal(false);
          this.closeSettingsModal();
          // Refresh scene
          this.scene.restart();
        },
        true
      )
    );

    // Upper-right close button
    this.confirmResetItems.push(
      this.createMenuButton(
        this.confirmResetModal,
        'confirm-close',
        modalW / 2 - 30,
        -modalH / 2 + 25,
        36,
        28,
        '✕',
        () => this.closeConfirmResetModal(),
        false
      )
    );
  }

  private startLevel(levelId: number): void {
    BackdropRenderer.setMode('game');
    AudioManager.getInstance().stopAllMusic();
    this.scene.start('GameScene', { levelId });
  }

  public update(time: number, delta: number): void {
    if (!this.ambientGraphics) return;

    const dt = Math.min(delta / 1000, 0.1);
    const { width, height } = this.scale;
    const halfW = width / 2;

    this.ambientGraphics.clear();

    // 1. Central energy boundary breathing glow
    const pulseAlpha = 0.35 + 0.25 * Math.sin(time * 0.0018);
    this.ambientGraphics.lineStyle(2, 0x00e5ff, pulseAlpha);
    this.ambientGraphics.lineBetween(halfW, 0, halfW, height);

    this.ambientGraphics.lineStyle(1, 0x333333, 0.7);
    this.ambientGraphics.lineBetween(halfW, 0, halfW, height);

    // 2. Gliding energy bead on center threshold
    const pulseY = ((time * 0.15) % (height + 120)) - 60;
    this.ambientGraphics.fillStyle(0x00e5ff, 0.85);
    this.ambientGraphics.fillCircle(halfW, pulseY, 3);
    this.ambientGraphics.fillStyle(0xffffff, 1.0);
    this.ambientGraphics.fillCircle(halfW, pulseY, 1.5);

    // 3. Ambient atmospheric particles
    for (const p of this.ambientParticles) {
      p.xOffset += p.vx * dt;
      p.y += p.vy * dt;

      // Wrap around bounds
      if (p.xOffset < 15) {
        p.xOffset = 15;
        p.vx = -p.vx;
      } else if (p.xOffset > halfW - 15) {
        p.xOffset = halfW - 15;
        p.vx = -p.vx;
      }

      if (p.y < 0) {
        p.y = height;
      } else if (p.y > height) {
        p.y = 0;
      }

      // Left particle: Soft pale slate particle on light background
      this.ambientGraphics.fillStyle(0x94a3b8, p.baseAlpha * 0.35);
      this.ambientGraphics.fillCircle(halfW - p.xOffset, p.y, p.radius);

      // Right particle: Luminous cyan spark on dark background
      this.ambientGraphics.fillStyle(0x00e5ff, p.baseAlpha * 0.75);
      this.ambientGraphics.fillCircle(halfW + p.xOffset, p.y, p.radius);
    }
  }
}
