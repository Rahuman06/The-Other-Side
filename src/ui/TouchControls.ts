import Phaser from 'phaser';
import { MoveDirection } from '../engine/MovementEngine';
import { PALETTE } from '../core/constants';

export interface TouchControlsCallbacks {
  onDirection: (dir: MoveDirection) => void;
  onPause: () => void;
  onRestart: () => void;
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
    const btnSize = 54;

    // Left D-pad cluster on the bottom left (Real World side)
    const dpadCenterX = 130;
    const dpadCenterY = height - 70;

    // D-Pad Directional Buttons
    this.createButton(
      scene,
      dpadCenterX - btnSize - 4,
      dpadCenterY,
      btnSize,
      btnSize,
      '←',
      () => this.callbacks.onDirection('left'),
      true
    );

    this.createButton(
      scene,
      dpadCenterX + btnSize + 4,
      dpadCenterY,
      btnSize,
      btnSize,
      '→',
      () => this.callbacks.onDirection('right'),
      true
    );

    this.createButton(
      scene,
      dpadCenterX,
      dpadCenterY - btnSize - 4,
      btnSize,
      btnSize,
      '↑',
      () => this.callbacks.onDirection('up'),
      true
    );

    this.createButton(
      scene,
      dpadCenterX,
      dpadCenterY + btnSize + 4,
      btnSize,
      btnSize,
      '↓',
      () => this.callbacks.onDirection('down'),
      true
    );

    // Right action cluster on the bottom right (Shadow World side)
    const actionCenterX = width - 110;
    const actionCenterY = height - 70;

    this.createButton(
      scene,
      actionCenterX - 40,
      actionCenterY,
      64,
      44,
      'RESTART',
      () => this.callbacks.onRestart(),
      false
    );

    this.createButton(
      scene,
      actionCenterX + 40,
      actionCenterY,
      64,
      44,
      'PAUSE',
      () => this.callbacks.onPause(),
      false
    );

    // Default to visible if touch is supported or screen width <= 1024
    const isTouch = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
    this.setVisible(isTouch || width <= 1024);
  }

  private createButton(
    scene: Phaser.Scene,
    x: number,
    y: number,
    w: number,
    h: number,
    symbol: string,
    action: () => void,
    isRealWorldSide: boolean
  ): void {
    const bg = scene.add.graphics();
    const borderCol = isRealWorldSide ? PALETTE.real.walls : PALETTE.shadow.walls;
    const fillCol = isRealWorldSide ? 0xeeeeee : 0x222222;
    const activeFillCol = isRealWorldSide ? 0xcccccc : 0x444444;
    const textCol = isRealWorldSide ? PALETTE.real.text : PALETTE.shadow.text;

    const renderNormal = () => {
      bg.clear();
      bg.fillStyle(fillCol, 0.85);
      bg.fillRoundedRect(x - w / 2, y - h / 2, w, h, 6);
      bg.lineStyle(1.5, borderCol, 0.9);
      bg.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 6);
    };

    const renderPressed = () => {
      bg.clear();
      bg.fillStyle(activeFillCol, 0.95);
      bg.fillRoundedRect(x - w / 2, y - h / 2, w, h, 6);
      bg.lineStyle(2, borderCol, 1);
      bg.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 6);
    };

    renderNormal();
    this.container.add(bg);

    const txt = scene.add
      .text(x, y, symbol, {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: symbol.length > 2 ? '11px' : '20px',
        fontStyle: 'bold',
        color: textCol,
      })
      .setOrigin(0.5);
    this.container.add(txt);

    const hit = scene.add
      .zone(x, y, w, h)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    let isDown = false;

    hit.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      isDown = true;
      renderPressed();
      action();
      pointer.event.preventDefault?.();
    });

    hit.on('pointerup', () => {
      if (isDown) {
        isDown = false;
        renderNormal();
      }
    });

    hit.on('pointerout', () => {
      if (isDown) {
        isDown = false;
        renderNormal();
      }
    });

    hit.on('pointercancel', () => {
      if (isDown) {
        isDown = false;
        renderNormal();
      }
    });

    this.container.add(hit);
  }

  public setVisible(visible: boolean): void {
    this.isVisible = visible;
    this.container.setVisible(visible);
  }

  public get visible(): boolean {
    return this.isVisible;
  }
}
