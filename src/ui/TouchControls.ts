import Phaser from 'phaser';
import { MoveDirection } from '../engine/MovementEngine';

export interface TouchControlsCallbacks {
  onDirection: (dir: MoveDirection) => void;
  onPause?: () => void;
  onRestart?: () => void;
}

export class TouchControls {
  private container: Phaser.GameObjects.Container;
  private readonly callbacks: TouchControlsCallbacks;
  private isVisible: boolean = false;

  constructor(scene: Phaser.Scene, width: number, height: number, callbacks: TouchControlsCallbacks) {
    this.callbacks = callbacks;
    this.container = scene.add.container(0, 0);
    this.container.setDepth(50);

    this.createControls(scene, width, height);

    // Prevent default touch gestures (scrolling, zooming) on the canvas
    if (typeof window !== 'undefined' && scene.game.canvas) {
      scene.game.canvas.style.touchAction = 'none';
    }
  }

  private createControls(scene: Phaser.Scene, width: number, height: number): void {
    const btnSize = 52;
    const gap = 10;

    // -------------------------------------------------------------------------
    // 1. BOTTOM-LEFT CLUSTER: [ LEFT ] [ RIGHT ] horizontally beside each other
    // -------------------------------------------------------------------------
    const leftClusterY = height - 58;
    const leftBtnX = 75;
    const rightBtnX = leftBtnX + btnSize + gap;

    this.createButton(
      scene,
      leftBtnX,
      leftClusterY,
      btnSize,
      btnSize,
      '←',
      () => this.callbacks.onDirection('left')
    );

    this.createButton(
      scene,
      rightBtnX,
      leftClusterY,
      btnSize,
      btnSize,
      '→',
      () => this.callbacks.onDirection('right')
    );

    // -------------------------------------------------------------------------
    // 2. BOTTOM-RIGHT CLUSTER: [ UP ] placed vertically above [ DOWN ]
    // -------------------------------------------------------------------------
    const rightClusterX = width - 75;
    const downBtnY = height - 58;
    const upBtnY = downBtnY - btnSize - gap;

    this.createButton(
      scene,
      rightClusterX,
      upBtnY,
      btnSize,
      btnSize,
      '↑',
      () => this.callbacks.onDirection('up')
    );

    this.createButton(
      scene,
      rightClusterX,
      downBtnY,
      btnSize,
      btnSize,
      '↓',
      () => this.callbacks.onDirection('down')
    );

    // Default to false: MobileControlsOverlay is the primary HTML5 touch overlay.
    // In-canvas touch controls remain available as an opt-in fallback via setVisible(true).
    this.setVisible(false);
  }

  private createButton(
    scene: Phaser.Scene,
    x: number,
    y: number,
    w: number,
    h: number,
    label: string,
    callback: () => void
  ): Phaser.GameObjects.Container {
    const btn = scene.add.container(x, y);

    const bg = scene.add.graphics();
    const drawBg = (color: number, strokeColor: number, alpha: number = 0.88) => {
      bg.clear();
      bg.fillStyle(color, alpha);
      bg.fillRoundedRect(-w / 2, -h / 2, w, h, 10);
      bg.lineStyle(1.5, strokeColor, 0.85);
      bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 10);
    };

    drawBg(0x0c0c0c, 0xffffff);
    btn.add(bg);

    const txt = scene.add
      .text(0, 0, label, {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '24px',
        fontStyle: 'bold',
        color: '#FFFFFF',
      })
      .setOrigin(0.5);
    btn.add(txt);

    // Interactive hit zone
    const hit = scene.add
      .zone(0, 0, w, h)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    btn.add(hit);

    hit.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      pointer.event?.stopPropagation?.();
      drawBg(0x00e5ff, 0x00e5ff, 1.0);
      txt.setColor('#000000');
      btn.setScale(0.92);
      callback();
    });

    hit.on('pointerup', () => {
      drawBg(0x0c0c0c, 0xffffff);
      txt.setColor('#FFFFFF');
      btn.setScale(1.0);
    });

    hit.on('pointerout', () => {
      drawBg(0x0c0c0c, 0xffffff);
      txt.setColor('#FFFFFF');
      btn.setScale(1.0);
    });

    this.container.add(btn);
    return btn;
  }

  public setVisible(visible: boolean): void {
    this.isVisible = visible;
    this.container.setVisible(visible);
  }

  public getVisible(): boolean {
    return this.isVisible;
  }
}
