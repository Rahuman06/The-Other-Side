import Phaser from 'phaser';
import { KeyboardNavManager, FocusableItem } from './KeyboardNavManager';
import { AudioManager } from '../audio/AudioManager';

export interface PauseModalCallbacks {
  onResume: () => void;
  onRestart: () => void;
  onObjectGuide?: () => void;
  onSettings?: () => void;
  onMainMenu: () => void;
}

export class PauseModal {
  private container: Phaser.GameObjects.Container;
  private readonly callbacks: PauseModalCallbacks;
  private readonly focusItems: FocusableItem[] = [];
  private readonly centerX: number;
  private readonly centerY: number;

  constructor(scene: Phaser.Scene, width: number, height: number, callbacks: PauseModalCallbacks) {
    this.callbacks = callbacks;
    this.centerX = width / 2;
    this.centerY = height / 2;
    this.container = scene.add.container(this.centerX, this.centerY);
    this.container.setDepth(100);
    this.container.setVisible(false);

    const modalW = 420;
    const modalH = 340;

    // Background overlay backdrop
    const backdrop = scene.add.graphics();
    backdrop.fillStyle(0x000000, 0.75);
    backdrop.fillRect(-width / 2, -height / 2, width, height);
    backdrop.setInteractive(
      new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height),
      Phaser.Geom.Rectangle.Contains
    );
    this.container.add(backdrop);

    // Modal container box
    const box = scene.add.graphics();
    box.fillStyle(0x080808, 0.98);
    box.fillRoundedRect(-modalW / 2, -modalH / 2, modalW, modalH, 8);
    box.lineStyle(1.5, 0xffffff, 0.85);
    box.strokeRoundedRect(-modalW / 2, -modalH / 2, modalW, modalH, 8);
    this.container.add(box);

    // Title
    const title = scene.add
      .text(0, -125, 'PAUSED', {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '24px',
        fontStyle: 'bold',
        color: '#FFFFFF',
        letterSpacing: 3,
      })
      .setOrigin(0.5);
    this.container.add(title);

    // Divider line
    const div = scene.add.graphics();
    div.lineStyle(1, 0x333333, 0.8);
    div.lineBetween(-modalW / 2 + 25, -95, modalW / 2 - 25, -95);
    this.container.add(div);

    // Menu Buttons
    const btnW = 280;
    const btnH = 34;
    const startY = -60;
    const gapY = 44;

    // 1. Resume Button (Primary)
    this.createButton(scene, 'pause-resume', 0, startY, btnW, btnH, 'RESUME  [ P / ESC ]', () => callbacks.onResume(), true);

    // 2. Restart Level Button
    this.createButton(scene, 'pause-restart', 0, startY + gapY, btnW, btnH, 'RESTART LEVEL  [ R ]', () => callbacks.onRestart(), false);

    // 3. Object Guide Button
    this.createButton(scene, 'pause-guide', 0, startY + gapY * 2, btnW, btnH, 'OBJECT GUIDE', () => callbacks.onObjectGuide?.(), false);

    // 4. Settings Button
    this.createButton(scene, 'pause-settings', 0, startY + gapY * 3, btnW, btnH, 'SETTINGS  [ S ]', () => callbacks.onSettings?.(), false);

    // 5. Main Menu Button
    this.createButton(scene, 'pause-main-menu', 0, startY + gapY * 4, btnW, btnH, 'MAIN MENU  [ M ]', () => callbacks.onMainMenu(), false);

    // 6. Mandatory upper-right '✕' close button
    this.createButton(
      scene,
      'pause-close',
      modalW / 2 - 35,
      -modalH / 2 + 25,
      40,
      30,
      '✕',
      () => callbacks.onResume(),
      false
    );
  }

  private createButton(
    scene: Phaser.Scene,
    id: string,
    x: number,
    y: number,
    w: number,
    h: number,
    text: string,
    onClick: () => void,
    isPrimary: boolean
  ): void {
    const bg = scene.add.graphics();
    const borderCol = isPrimary ? 0xffffff : 0x888888;
    const textCol = isPrimary ? '#FFFFFF' : '#AAAAAA';

    const render = (hover: boolean) => {
      bg.clear();
      bg.fillStyle(hover ? 0x222222 : 0x111111, 0.95);
      bg.fillRoundedRect(x - w / 2, y - h / 2, w, h, 4);
      bg.lineStyle(hover ? 1.5 : 1, hover ? 0xffffff : borderCol, 0.9);
      bg.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 4);
    };

    render(false);
    this.container.add(bg);

    const txt = scene.add
      .text(x, y, text, {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '12.5px',
        fontStyle: 'bold',
        color: textCol,
        letterSpacing: 1.2,
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
    this.container.setVisible(true);
    KeyboardNavManager.getInstance().pushContext({
      id: 'pause-modal',
      items: this.focusItems,
      selectedIndex: 0,
      onEscape: () => this.callbacks.onResume(),
      trapFocus: true,
    });
  }

  public hide(): void {
    this.container.setVisible(false);
    KeyboardNavManager.getInstance().popContext('pause-modal');
  }

  public isVisible(): boolean {
    return this.container.visible;
  }

  public setPosition(x: number, y: number): void {
    this.container.setPosition(x, y);
  }
}
