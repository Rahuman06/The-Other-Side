import Phaser from 'phaser';
import { KeyboardNavManager, FocusableItem } from './KeyboardNavManager';

export interface WinModalCallbacks {
  onNextLevel: () => void;
  onLevelSelect: () => void;
  onRestart: () => void;
  onMainMenu?: () => void;
}

export class WinModal {
  private container: Phaser.GameObjects.Container;
  private movesText!: Phaser.GameObjects.Text;
  private bestMovesText!: Phaser.GameObjects.Text;
  private titleText!: Phaser.GameObjects.Text;
  private nextBtnText!: Phaser.GameObjects.Text;
  private readonly callbacks: WinModalCallbacks;
  private readonly focusItems: FocusableItem[] = [];
  private readonly centerX: number;
  private readonly centerY: number;

  constructor(scene: Phaser.Scene, width: number, height: number, callbacks: WinModalCallbacks) {
    this.callbacks = callbacks;
    this.centerX = width / 2;
    this.centerY = height / 2;
    this.container = scene.add.container(this.centerX, this.centerY);
    this.container.setDepth(100);
    this.container.setVisible(false);

    const modalW = 420;
    const modalH = 340;

    // Dimmed background
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
    this.titleText = scene.add
      .text(0, -120, 'LEVEL COMPLETED', {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '22px',
        fontStyle: 'bold',
        color: '#FFFFFF',
        letterSpacing: 2.5,
      })
      .setOrigin(0.5);
    this.container.add(this.titleText);

    // Divider
    const div = scene.add.graphics();
    div.lineStyle(1, 0x333333, 0.8);
    div.lineBetween(-modalW / 2 + 25, -90, modalW / 2 - 25, -90);
    this.container.add(div);

    // Moves stats
    this.movesText = scene.add
      .text(0, -65, 'MOVES: 0', {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '16px',
        fontStyle: 'bold',
        color: '#FFFFFF',
        letterSpacing: 1.5,
      })
      .setOrigin(0.5);
    this.container.add(this.movesText);

    this.bestMovesText = scene.add
      .text(0, -42, 'BEST: 0', {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '13px',
        color: '#888888',
        letterSpacing: 1,
      })
      .setOrigin(0.5);
    this.container.add(this.bestMovesText);

    // Button stack
    const btnW = 280;
    const btnH = 34;
    const startY = 0;
    const gapY = 42;

    // 1. Next Level Button (Primary)
    const { label: nextTxt } = this.createButton(
      scene,
      'win-next',
      0,
      startY,
      btnW,
      btnH,
      'NEXT LEVEL',
      () => callbacks.onNextLevel(),
      true
    );
    this.nextBtnText = nextTxt;

    // 2. Play Again Button
    this.createButton(
      scene,
      'win-restart',
      0,
      startY + gapY,
      btnW,
      btnH,
      'PLAY AGAIN',
      () => callbacks.onRestart(),
      false
    );

    // 3. Level Selection Button
    this.createButton(
      scene,
      'win-select',
      0,
      startY + gapY * 2,
      btnW,
      btnH,
      'LEVEL SELECTION',
      () => callbacks.onLevelSelect(),
      false
    );

    // 4. Main Menu Button
    this.createButton(
      scene,
      'win-main-menu',
      0,
      startY + gapY * 3,
      btnW,
      btnH,
      'MAIN MENU',
      () => (callbacks.onMainMenu ? callbacks.onMainMenu() : callbacks.onLevelSelect()),
      false
    );

    // 5. Mandatory upper-right '✕' close button
    this.createButton(
      scene,
      'win-close',
      modalW / 2 - 35,
      -modalH / 2 + 25,
      40,
      30,
      '✕',
      () => callbacks.onLevelSelect(),
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
  ): { label: Phaser.GameObjects.Text } {
    const bg = scene.add.graphics();
    const borderCol = isPrimary ? 0xffffff : 0x777777;
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

    hit.on('pointerdown', onClick);

    this.container.add(hit);

    this.focusItems.push({
      id,
      getBounds: () => ({
        x: this.centerX + x,
        y: this.centerY + y,
        width: w,
        height: h,
      }),
      onActivate: onClick,
    });

    return { label: txt };
  }

  public show(moves: number, bestMoves: number, isLastLevel: boolean = false): void {
    this.movesText.setText(`MOVES: ${moves}`);
    this.bestMovesText.setText(`BEST: ${bestMoves}`);
    this.nextBtnText.setText(isLastLevel ? 'ENDING SCENE ★' : 'NEXT LEVEL');
    this.titleText.setText(isLastLevel ? 'THE TRUTH UNLOCKED' : 'LEVEL COMPLETED');
    this.container.setVisible(true);

    KeyboardNavManager.getInstance().pushContext({
      id: 'win-modal',
      items: this.focusItems,
      selectedIndex: 0,
      onEscape: () => this.callbacks.onLevelSelect(),
      trapFocus: true,
    });
  }

  public hide(): void {
    this.container.setVisible(false);
    KeyboardNavManager.getInstance().popContext('win-modal');
  }

  public isVisible(): boolean {
    return this.container.visible;
  }

  public setPosition(x: number, y: number): void {
    this.container.setPosition(x, y);
  }
}
