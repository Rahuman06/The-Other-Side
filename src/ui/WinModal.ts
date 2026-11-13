import Phaser from 'phaser';

export interface WinModalCallbacks {
  onNextLevel: () => void;
  onLevelSelect: () => void;
  onRestart: () => void;
}

export class WinModal {
  private container: Phaser.GameObjects.Container;
  private movesText!: Phaser.GameObjects.Text;
  private bestMovesText!: Phaser.GameObjects.Text;
  private titleText!: Phaser.GameObjects.Text;
  private nextBtnText!: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, width: number, height: number, callbacks: WinModalCallbacks) {
    this.container = scene.add.container(width / 2, height / 2);
    this.container.setDepth(100);
    this.container.setVisible(false);

    const modalW = 420;
    const modalH = 290;

    // Dimmed background
    const backdrop = scene.add.graphics();
    backdrop.fillStyle(0x000000, 0.65);
    backdrop.fillRect(-width / 2, -height / 2, width, height);
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
      .text(0, -95, 'LEVEL COMPLETED', {
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
    div.lineBetween(-modalW / 2 + 25, -65, modalW / 2 - 25, -65);
    this.container.add(div);

    // Moves stats
    this.movesText = scene.add
      .text(0, -40, 'MOVES: 0', {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '16px',
        fontStyle: 'bold',
        color: '#FFFFFF',
        letterSpacing: 1.5,
      })
      .setOrigin(0.5);
    this.container.add(this.movesText);

    this.bestMovesText = scene.add
      .text(0, -18, 'BEST: 0', {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '13px',
        color: '#888888',
        letterSpacing: 1,
      })
      .setOrigin(0.5);
    this.container.add(this.bestMovesText);

    // 1. Next Level Button (Primary)
    const { label: nextTxt } = this.createButton(
      scene,
      0,
      25,
      280,
      38,
      'NEXT LEVEL',
      () => callbacks.onNextLevel(),
      true
    );
    this.nextBtnText = nextTxt;

    // 2. Level Selection Button
    this.createButton(
      scene,
      0,
      72,
      280,
      36,
      'LEVEL SELECTION',
      () => callbacks.onLevelSelect(),
      false
    );

    // 3. Restart Level Button
    this.createButton(
      scene,
      0,
      116,
      280,
      34,
      'PLAY AGAIN',
      () => callbacks.onRestart(),
      false
    );
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
  ): { label: Phaser.GameObjects.Text } {
    const bg = scene.add.graphics();
    const borderCol = isPrimary ? 0xffffff : 0x777777;
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
    return { label: txt };
  }

  public show(moves: number, bestMoves: number, isFinalLevel: boolean = false): void {
    this.movesText.setText(`MOVES: ${moves}`);
    this.bestMovesText.setText(`BEST RECORD: ${bestMoves} MOVES`);
    if (isFinalLevel) {
      this.titleText.setText('CONGRATULATIONS!');
      this.nextBtnText.setText('COMPLETE JOURNEY');
    } else {
      this.titleText.setText('LEVEL COMPLETED');
      this.nextBtnText.setText('NEXT LEVEL');
    }
    this.container.setVisible(true);
  }

  public hide(): void {
    this.container.setVisible(false);
  }

  public isVisible(): boolean {
    return this.container.visible;
  }
}
