import Phaser from 'phaser';
import { KeyboardNavManager, FocusableItem } from './KeyboardNavManager';
import { AudioManager } from '../audio/AudioManager';
import { StorageManager } from '../storage/StorageManager';
import { BackdropRenderer } from '../rendering/BackdropRenderer';
import { MobileControlsOverlay } from './MobileControlsOverlay';
import { createVolumeSlider, VolumeSliderControl } from './VolumeSlider';

export interface SettingsModalOptions {
  showObjectGuideButton?: boolean;
  onOpenObjectGuide?: () => void;
  showResetProgressButton?: boolean;
  onResetProgress?: () => void;
}

/**
 * Unified, responsive Settings Modal with smooth interactive Master/Music/SFX volume sliders,
 * Sound Mute toggle, Reduced Motion toggle, optional Reset Progress / Object Guide triggers,
 * non-overlapping >= 48px touch zones, and complete modal focus trapping.
 */
export class SettingsModal {
  private container: Phaser.GameObjects.Container;
  private readonly storage: StorageManager;
  private readonly onClose: () => void;
  private readonly focusItems: FocusableItem[] = [];
  private readonly hitZones: Phaser.GameObjects.Zone[] = [];

  private muteSliderSync: (() => void) | null = null;
  private motionSync: (() => void) | null = null;
  private masterSlider!: VolumeSliderControl;
  private musicSlider!: VolumeSliderControl;
  private sfxSlider!: VolumeSliderControl;

  constructor(
    scene: Phaser.Scene,
    width: number,
    height: number,
    storage: StorageManager,
    onClose: () => void,
    options: SettingsModalOptions = {}
  ) {
    this.storage = storage;
    this.onClose = onClose;
    this.container = scene.add.container(width / 2, height / 2);
    this.container.setDepth(150);
    this.container.setVisible(false);

    const hasReset = Boolean(options.showResetProgressButton && options.onResetProgress);
    const hasGuide = Boolean(options.showObjectGuideButton && options.onOpenObjectGuide);
    const extraRows = (hasReset ? 1 : 0) + (hasGuide ? 1 : 0);

    const modalW = 500;
    const modalH = 445 + extraRows * 52;

    // 1. Full-screen blocking backdrop
    const backdrop = scene.add.graphics();
    backdrop.fillStyle(0x000000, 0.78);
    backdrop.fillRect(-width / 2, -height / 2, width, height);
    this.container.add(backdrop);

    const backdropHit = scene.add
      .zone(0, 0, width, height)
      .setOrigin(0.5)
      .setInteractive();
    backdropHit.on(
      'pointerdown',
      (_p: Phaser.Input.Pointer, _lx: number, _ly: number, event: Phaser.Types.Input.EventData) => {
        if (event && event.stopPropagation) event.stopPropagation();
      }
    );
    backdropHit.on(
      'pointerup',
      (_p: Phaser.Input.Pointer, _lx: number, _ly: number, event: Phaser.Types.Input.EventData) => {
        if (event && event.stopPropagation) event.stopPropagation();
      }
    );
    this.container.add(backdropHit);

    // 2. Modal frame
    const box = scene.add.graphics();
    box.fillStyle(0x0a0a0a, 0.98);
    box.fillRoundedRect(-modalW / 2, -modalH / 2, modalW, modalH, 10);
    box.lineStyle(1.5, 0xffffff, 0.9);
    box.strokeRoundedRect(-modalW / 2, -modalH / 2, modalW, modalH, 10);
    this.container.add(box);

    // Header Title + Close ✕ (clear spacing from first control)
    const titleY = -modalH / 2 + 34;
    const title = scene.add
      .text(0, titleY, 'SETTINGS', {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '21px',
        fontStyle: 'bold',
        color: '#FFFFFF',
        letterSpacing: 3,
      })
      .setOrigin(0.5);
    this.container.add(title);

    const closeXBtn = this.createActionButton(
      scene,
      'settings-close-x',
      modalW / 2 - 30,
      titleY,
      44,
      34,
      '✕',
      () => this.closeModal(),
      false
    );
    this.focusItems.push(closeXBtn);

    const divider = scene.add.graphics();
    divider.lineStyle(1, 0x2c2c2c, 0.9);
    divider.lineBetween(-modalW / 2 + 24, titleY + 26, modalW / 2 - 24, titleY + 26);
    this.container.add(divider);

    // Uniform 54px row cadence (all hitboxes <= 46-48px -> zero vertical overlap)
    const audio = AudioManager.getInstance();
    let rowY = titleY + 62;
    const rowStep = 54;

    // Row 1: Sound Mute Toggle
    this.focusItems.push(
      this.createToggleRow(
        scene,
        'settings-mute',
        'AUDIO OUTPUT',
        rowY,
        modalW,
        () => (audio.isMuted() ? 'MUTED' : 'ON'),
        () => !audio.isMuted(),
        () => {
          audio.setMuted(!audio.isMuted());
        },
        (refresh) => {
          this.muteSliderSync = refresh;
        }
      )
    );
    rowY += rowStep;

    // Row 2: Master Volume Slider
    this.masterSlider = createVolumeSlider({
      scene,
      container: this.container,
      id: 'settings-master-vol',
      label: 'MASTER VOL',
      y: rowY,
      modalW,
      value: this.storage.getProgress().masterVolume ?? 0.85,
      onChange: (v) => audio.setMasterVolume(v),
      hitZonesOut: this.hitZones,
    });
    this.focusItems.push(this.masterSlider.focusItem);
    rowY += rowStep;

    // Row 3: Music Volume Slider
    this.musicSlider = createVolumeSlider({
      scene,
      container: this.container,
      id: 'settings-music-vol',
      label: 'MUSIC VOL',
      y: rowY,
      modalW,
      value: this.storage.getProgress().musicVolume ?? 0.85,
      onChange: (v) => audio.setMusicVolume(v),
      hitZonesOut: this.hitZones,
    });
    this.focusItems.push(this.musicSlider.focusItem);
    rowY += rowStep;

    // Row 4: SFX Volume Slider
    this.sfxSlider = createVolumeSlider({
      scene,
      container: this.container,
      id: 'settings-sfx-vol',
      label: 'SFX VOL',
      y: rowY,
      modalW,
      value: this.storage.getProgress().sfxVolume ?? 0.85,
      onChange: (v) => audio.setSfxVolume(v),
      hitZonesOut: this.hitZones,
    });
    this.focusItems.push(this.sfxSlider.focusItem);
    rowY += rowStep;

    // Row 5: Reduced Motion Toggle
    this.focusItems.push(
      this.createToggleRow(
        scene,
        'settings-motion',
        'REDUCED MOTION',
        rowY,
        modalW,
        () => (this.storage.getProgress().reducedMotion ? 'ON' : 'OFF'),
        () => this.storage.getProgress().reducedMotion,
        () => {
          this.storage.setReducedMotion(!this.storage.getProgress().reducedMotion);
        },
        (refresh) => {
          this.motionSync = refresh;
        }
      )
    );
    rowY += rowStep;

    if (hasGuide && options.onOpenObjectGuide) {
      const guideCb = options.onOpenObjectGuide;
      this.focusItems.push(
        this.createActionButton(scene, 'settings-guide-btn', 0, rowY, 260, 40, 'OBJECT GUIDE', guideCb, false)
      );
      rowY += 50;
    }

    if (hasReset && options.onResetProgress) {
      const resetCb = options.onResetProgress;
      this.focusItems.push(
        this.createActionButton(
          scene,
          'settings-reset-btn',
          0,
          rowY,
          260,
          40,
          'RESET PROGRESS',
          resetCb,
          false,
          0xff4444
        )
      );
      rowY += 50;
    }

    // Bottom primary Close button
    this.focusItems.push(
      this.createActionButton(
        scene,
        'settings-close-btn',
        0,
        modalH / 2 - 36,
        220,
        42,
        'DONE',
        () => this.closeModal(),
        true
      )
    );
  }

  private createToggleRow(
    scene: Phaser.Scene,
    id: string,
    label: string,
    y: number,
    modalW: number,
    getStateText: () => string,
    isAccentOn: () => boolean,
    onToggle: () => void,
    registerSync: (fn: () => void) => void
  ): FocusableItem {
    const labelTxt = scene.add
      .text(-modalW / 2 + 32, y, label, {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '12.5px',
        fontStyle: 'bold',
        color: '#D8D8D8',
        letterSpacing: 1.1,
      })
      .setOrigin(0, 0.5);
    this.container.add(labelTxt);

    const pillW = 112;
    const pillH = 34;
    const pillX = modalW / 2 - 32 - pillW / 2;

    const pillBg = scene.add.graphics();
    this.container.add(pillBg);

    const stateTxt = scene.add
      .text(pillX, y, getStateText(), {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#FFFFFF',
        letterSpacing: 1.2,
      })
      .setOrigin(0.5);
    this.container.add(stateTxt);

    let hovered = false;
    const render = () => {
      const active = isAccentOn();
      stateTxt.setText(getStateText());
      stateTxt.setColor(active ? '#00E5FF' : '#FF7777');
      pillBg.clear();
      pillBg.fillStyle(hovered ? 0x222222 : 0x131313, 0.96);
      pillBg.fillRoundedRect(pillX - pillW / 2, y - pillH / 2, pillW, pillH, 6);
      pillBg.lineStyle(
        hovered ? 1.5 : 1,
        hovered ? 0xffffff : active ? 0x00e5ff : 0x555555,
        0.9
      );
      pillBg.strokeRoundedRect(pillX - pillW / 2, y - pillH / 2, pillW, pillH, 6);
    };

    render();
    registerSync(render);

    const hit = scene.add
      .zone(pillX, y, pillW + 16, 46)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    hit.on('pointerover', () => {
      hovered = true;
      render();
      AudioManager.getInstance().sfx.playUiHover();
      KeyboardNavManager.getInstance().setFocusById(id);
    });
    hit.on('pointerout', () => {
      hovered = false;
      render();
    });

    const activate = () => {
      AudioManager.getInstance().sfx.playUiClick();
      onToggle();
      render();
    };

    hit.on(
      'pointerdown',
      (_p: Phaser.Input.Pointer, _lx: number, _ly: number, event: Phaser.Types.Input.EventData) => {
        if (event && event.stopPropagation) event.stopPropagation();
        activate();
      }
    );

    this.container.add(hit);
    this.hitZones.push(hit);

    return {
      id,
      getBounds: () => ({
        x: this.container.x + pillX,
        y: this.container.y + y,
        width: pillW,
        height: pillH,
      }),
      onActivate: activate,
    };
  }

  private createActionButton(
    scene: Phaser.Scene,
    id: string,
    x: number,
    y: number,
    w: number,
    h: number,
    text: string,
    onClick: () => void,
    isPrimary: boolean,
    customColor?: number
  ): FocusableItem {
    const bg = scene.add.graphics();
    const borderCol = customColor ?? (isPrimary ? 0xffffff : 0x666666);
    const textColor = customColor
      ? `#${customColor.toString(16).padStart(6, '0')}`
      : isPrimary
        ? '#FFFFFF'
        : '#D4D4D4';

    const render = (hover: boolean) => {
      bg.clear();
      bg.fillStyle(hover ? 0x222222 : 0x121212, 0.96);
      bg.fillRoundedRect(x - w / 2, y - h / 2, w, h, 6);
      bg.lineStyle(hover ? 1.5 : 1, hover ? (customColor ?? 0xffffff) : borderCol, 0.9);
      bg.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 6);
    };

    render(false);
    this.container.add(bg);

    const txt = scene.add
      .text(x, y, text, {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '12.5px',
        fontStyle: 'bold',
        color: textColor,
        letterSpacing: 1.5,
      })
      .setOrigin(0.5);
    this.container.add(txt);

    const hit = scene.add
      .zone(x, y, Math.max(46, w), Math.max(46, h))
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    hit.on('pointerover', () => {
      render(true);
      txt.setColor(customColor ? textColor : '#FFFFFF');
      AudioManager.getInstance().sfx.playUiHover();
      KeyboardNavManager.getInstance().setFocusById(id);
    });
    hit.on('pointerout', () => {
      render(false);
      txt.setColor(textColor);
    });

    let locked = false;
    const activate = () => {
      if (locked) return;
      locked = true;
      AudioManager.getInstance().sfx.playUiClick();
      onClick();
      setTimeout(() => {
        locked = false;
      }, 250);
    };

    hit.on(
      'pointerdown',
      (_p: Phaser.Input.Pointer, _lx: number, _ly: number, event: Phaser.Types.Input.EventData) => {
        if (event && event.stopPropagation) event.stopPropagation();
        activate();
      }
    );

    this.container.add(hit);
    this.hitZones.push(hit);

    return {
      id,
      getBounds: () => ({
        x: this.container.x + x,
        y: this.container.y + y,
        width: w,
        height: h,
      }),
      onActivate: activate,
    };
  }

  private syncControlsFromStorage(): void {
    const progress = this.storage.getProgress();
    this.muteSliderSync?.();
    this.motionSync?.();
    this.masterSlider.setValue(progress.masterVolume ?? 0.85, true);
    this.musicSlider.setValue(progress.musicVolume ?? 0.85, true);
    this.sfxSlider.setValue(progress.sfxVolume ?? 0.85, true);
  }

  private closeModal(): void {
    this.hide();
    this.onClose();
  }

  public show(): void {
    this.syncControlsFromStorage();
    MobileControlsOverlay.getInstance().setVisible(false);
    BackdropRenderer.setDimmed(true);
    for (const z of this.hitZones) {
      if (z.active) z.setInteractive({ useHandCursor: true });
    }
    this.container.setVisible(true);

    KeyboardNavManager.getInstance().pushContext({
      id: 'settings-modal',
      items: this.focusItems,
      selectedIndex: 0,
      onEscape: () => this.closeModal(),
      trapFocus: true,
    });
  }

  public hide(): void {
    BackdropRenderer.setDimmed(false);
    for (const z of this.hitZones) {
      if (z.active) z.disableInteractive();
    }
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
