import Phaser from 'phaser';

export interface PauseModalCallbacks {
  onResume: () => void;
  onRestart: () => void;
  onMainMenu: () => void;
}

export class PauseModal {
  private container: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, width: number, height: number, callbacks: PauseModalCallbacks) {
    this.container = scene.add.container(width / 2, height / 2);
    this.container.setDepth(100);
    this.container.setVisible(false);

    const modalW = 380;
    const modalH = 250;

    // Background overlay backdrop
    const backdrop = scene.add.graphics();
    backdrop.fillStyle(0x000000, 0.6);
    backdrop.fillRect(-width / 2, -height / 2, width, height);
    this.container.add(backdrop);

    // Modal container box
    const box = scene.add.graphics();
    box.fillStyle(0x080808, 0.96);
    box.fillRoundedRect(-modalW / 2, -modalH / 2, modalW, modalH, 8);
    box.lineStyle(1.5, 0xffffff, 0.85);
    box.strokeRoundedRect(-modalW / 2, -modalH / 2, modalW, modalH, 8);
    this.container.add(box);

    // Title
    const title = scene.add
      .text(0, -65, 'PAUSED', {
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
    div.lineBetween(-modalW / 2 + 25, -35, modalW / 2 - 25, -35);
    this.container.add(div);

    // 1. Resume Button
    this.createButton(scene, 0, -5, 260, 36, 'RESUME  [ P ]', () => callbacks.onResume(), true);

    // 2. Restart Level Button
    this.createButton(scene, 0, 42, 260, 36, 'RESTART LEVEL  [ R ]', () => callbacks.onRestart(), false);

    // 3. Main Menu Button
    this.createButton(scene, 0, 89, 260, 36, 'MAIN MENU  [ M ]', () => callbacks.onMainMenu(), false);
  }

  private createButton(
    scene: Phaser.Scene,
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
      bg.fillStyle(hover ? 0x222222 : 0x111111, 0.9);
      bg.fillRoundedRect(x - w / 2, y - h / 2, w, h, 4);
      bg.lineStyle(hover ? 1.5 : 1, hover ? 0xffffff : borderCol, 0.9);
      bg.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 4);
    };

    render(false);
    this.container.add(bg);

    const txt = scene.add
      .text(x, y, text, {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '13px',
        fontStyle: 'bold',
        color: textCol,
        letterSpacing: 1.5,
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
    });

    hit.on('pointerout', () => {
      render(false);
      txt.setColor(textCol);
    });

    hit.on('pointerdown', onClick);

    this.container.add(hit);
  }

  public show(): void {
    this.container.setVisible(true);
  }

  public hide(): void {
    this.container.setVisible(false);
  }

  public isVisible(): boolean {
    return this.container.visible;
  }
}
