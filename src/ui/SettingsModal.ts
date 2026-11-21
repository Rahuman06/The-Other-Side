import Phaser from 'phaser';
import { StorageManager } from '../storage/StorageManager';
import { AudioManager } from '../audio/AudioManager';
import { KeyboardNavManager, FocusableItem } from './KeyboardNavManager';
import { BackdropRenderer } from '../rendering/BackdropRenderer';

export class SettingsModal {
  private container: Phaser.GameObjects.Container;
  private storage: StorageManager;
  private onCloseCallback: () => void;
  private readonly focusItems: FocusableItem[] = [];
  private readonly centerX: number;
  private readonly centerY: number;

  constructor(
    scene: Phaser.Scene,
    width: number,
    height: number,
    storage: StorageManager,
    onClose: () => void
  ) {
    this.storage = storage;
    this.onCloseCallback = onClose;
    this.centerX = width / 2;
    this.centerY = height / 2;

    this.container = scene.add.container(this.centerX, this.centerY);
    this.container.setDepth(150);
    this.container.setVisible(false);

    const modalW = 460;
    const modalH = 430;

    // Backdrop
    const backdrop = scene.add.graphics();
    backdrop.fillStyle(0x000000, 0.75);
    backdrop.fillRect(-width / 2, -height / 2, width, height);
    backdrop.setInteractive(
      new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height),
      Phaser.Geom.Rectangle.Contains
    );
    this.container.add(backdrop);

    // Box
    const box = scene.add.graphics();
    box.fillStyle(0x080808, 0.98);
    box.fillRoundedRect(-modalW / 2, -modalH / 2, modalW, modalH, 8);
    box.lineStyle(1.5, 0xffffff, 0.9);
    box.strokeRoundedRect(-modalW / 2, -modalH / 2, modalW, modalH, 8);
    this.container.add(box);

    // Title
    const title = scene.add
      .text(0, -180, 'SETTINGS', {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '22px',
        fontStyle: 'bold',
        color: '#FFFFFF',
        letterSpacing: 2,
      })
      .setOrigin(0.5);
    this.container.add(title);

    const audio = AudioManager.getInstance();

    // 1. Audio Mute Toggle
    let isMuted = this.storage.getProgress().muted;
    const soundText = scene.add
      .text(0, -135, `AUDIO: ${isMuted ? 'MUTED' : 'ENABLED'}`, {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '14px',
        fontStyle: 'bold',
        color: '#FFFFFF',
        letterSpacing: 1.5,
      })
      .setOrigin(0.5);
    this.container.add(soundText);

    this.createButton(scene, 'settings-mute', 0, -105, 260, 30, 'TOGGLE MUTE', () => {
      isMuted = !isMuted;
      audio.setMuted(isMuted);
      soundText.setText(`AUDIO: ${isMuted ? 'MUTED' : 'ENABLED'}`);
    });

    // 2. Master Volume
    let masterVal = Math.round(audio.getMasterVolume() * 100);
    const masterText = scene.add
      .text(0, -65, `MASTER VOLUME: ${masterVal}%`, {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '13px',
        color: '#CCCCCC',
        letterSpacing: 1,
      })
      .setOrigin(0.5);
    this.container.add(masterText);

    this.createButton(scene, 'settings-master-dec', -80, -35, 70, 26, '- 10%', () => {
      masterVal = Math.max(0, masterVal - 10);
      audio.setMasterVolume(masterVal / 100);
      masterText.setText(`MASTER VOLUME: ${masterVal}%`);
    });

    this.createButton(scene, 'settings-master-inc', 80, -35, 70, 26, '+ 10%', () => {
      masterVal = Math.min(100, masterVal + 10);
      audio.setMasterVolume(masterVal / 100);
      masterText.setText(`MASTER VOLUME: ${masterVal}%`);
    });

    // 3. Music Volume & SFX Volume Rows
    let musicVal = Math.round(audio.getMusicVolume() * 100);
    const musicText = scene.add
      .text(-100, 5, `MUSIC: ${musicVal}%`, {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '12px',
        color: '#AAAAAA',
      })
      .setOrigin(0.5);
    this.container.add(musicText);

    this.createButton(scene, 'settings-music-dec', -145, 30, 50, 24, '-', () => {
      musicVal = Math.max(0, musicVal - 10);
      audio.setMusicVolume(musicVal / 100);
      musicText.setText(`MUSIC: ${musicVal}%`);
    });

    this.createButton(scene, 'settings-music-inc', -55, 30, 50, 24, '+', () => {
      musicVal = Math.min(100, musicVal + 10);
      audio.setMusicVolume(musicVal / 100);
      musicText.setText(`MUSIC: ${musicVal}%`);
    });

    let sfxVal = Math.round(audio.getSfxVolume() * 100);
    const sfxText = scene.add
      .text(100, 5, `SFX: ${sfxVal}%`, {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '12px',
        color: '#AAAAAA',
      })
      .setOrigin(0.5);
    this.container.add(sfxText);

    this.createButton(scene, 'settings-sfx-dec', 55, 30, 50, 24, '-', () => {
      sfxVal = Math.max(0, sfxVal - 10);
      audio.setSfxVolume(sfxVal / 100);
      sfxText.setText(`SFX: ${sfxVal}%`);
    });

    this.createButton(scene, 'settings-sfx-inc', 145, 30, 50, 24, '+', () => {
      sfxVal = Math.min(100, sfxVal + 10);
      audio.setSfxVolume(sfxVal / 100);
      sfxText.setText(`SFX: ${sfxVal}%`);
    });

    // 4. Reduced Motion Toggle
    let isReduced = this.storage.getProgress().reducedMotion;
    const motionText = scene.add
      .text(0, 75, `MOTION: ${isReduced ? 'REDUCED' : 'NORMAL'}`, {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '13px',
        fontStyle: 'bold',
        color: '#FFFFFF',
        letterSpacing: 1.5,
      })
      .setOrigin(0.5);
    this.container.add(motionText);

    this.createButton(scene, 'settings-motion', 0, 105, 260, 30, 'TOGGLE REDUCED MOTION', () => {
      isReduced = !isReduced;
      this.storage.setReducedMotion(isReduced);
      motionText.setText(`MOTION: ${isReduced ? 'REDUCED' : 'NORMAL'}`);
    });

    // Close button
    this.createButton(
      scene,
      'settings-close-btn',
      0,
      160,
      180,
      34,
      'CLOSE',
      () => {
        this.hide();
        this.onCloseCallback();
      },
      true
    );

    // Top-right X button
    this.createButton(
      scene,
      'settings-close-x',
      modalW / 2 - 35,
      -modalH / 2 + 25,
      40,
      30,
      '✕',
      () => {
        this.hide();
        this.onCloseCallback();
      }
    );
  }

  private createButton(
    scene: Phaser.Scene,
    id: string,
    x: number,
    y: number,
    w: number,
    h: number,
    label: string,
    onClick: () => void,
    isPrimary: boolean = false
  ): void {
    const bg = scene.add.graphics();
    const borderCol = isPrimary ? 0xffffff : 0x888888;
    const textCol = isPrimary ? '#FFFFFF' : '#CCCCCC';

    const render = (hover: boolean) => {
      bg.clear();
      bg.fillStyle(hover ? 0x222222 : 0x111111, 0.9);
      bg.fillRoundedRect(x - w / 2, y - h / 2, w, h, 4);
      bg.lineStyle(hover ? 1.5 : 1, hover ? 0xffffff : borderCol, 0.9);
      bg.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 4);
    };

    render(false);
    this.container.add(bg);

    const txt = scene.add
      .text(x, y, label, {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '12px',
        fontStyle: 'bold',
        color: textCol,
        letterSpacing: 1,
      })
      .setOrigin(0.5);
    this.container.add(txt);

    const hit = scene.add
      .zone(x, y, w, h)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    hit.on('pointerover', () => {
      render(true);
      txt.setColor('#FFFFFF');
      KeyboardNavManager.getInstance().setFocusById(id);
    });

    hit.on('pointerout', () => {
      render(false);
      txt.setColor(textCol);
    });

    const triggerClick = () => {
      AudioManager.getInstance().sfx.playUiClick();
      onClick();
    };

    hit.on('pointerdown', triggerClick);
    this.container.add(hit);

    this.focusItems.push({
      id,
      getBounds: () => ({
        x: this.centerX + x,
        y: this.centerY + y,
        width: w,
        height: h,
      }),
      onActivate: triggerClick,
    });
  }

  public show(): void {
    BackdropRenderer.setDimmed(true);
    this.container.setVisible(true);
    KeyboardNavManager.getInstance().pushContext({
      id: 'settings-modal',
      items: this.focusItems,
      selectedIndex: 0,
      onEscape: () => {
        this.hide();
        this.onCloseCallback();
      },
      trapFocus: true,
    });
  }

  public hide(): void {
    BackdropRenderer.setDimmed(false);
    this.container.setVisible(false);
    KeyboardNavManager.getInstance().popContext('settings-modal');
  }

  public isVisible(): boolean {
    return this.container.visible;
  }

  public setPosition(x: number, y: number): void {
    this.container.setPosition(x, y);
  }
}
