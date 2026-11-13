import Phaser from 'phaser';
import { PALETTE } from '../core/constants';

export interface HeaderCallbacks {
  onPause: () => void;
  onRestart: () => void;
  onMenu?: () => void;
}

export interface HeaderConfig {
  chapter: string;
  levelNumber: number;
  totalLevels: number;
  levelName: string;
  moves?: number;
  objective?: string;
}

export class Header {
  private container: Phaser.GameObjects.Container;
  private pauseBtnText!: Phaser.GameObjects.Text;
  private movesText!: Phaser.GameObjects.Text;
  private levelLabelText!: Phaser.GameObjects.Text;
  private chapterLabelText!: Phaser.GameObjects.Text;
  private objectiveText!: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene,
    width: number,
    config: HeaderConfig,
    callbacks: HeaderCallbacks
  ) {
    this.container = scene.add.container(0, 0);
    this.container.setDepth(30);

    const halfW = width / 2;
    const headerH = 68;

    // Backgrounds for Real and Shadow headers
    const g = scene.add.graphics();
    g.fillStyle(PALETTE.real.background, 1);
    g.fillRect(0, 0, halfW, headerH);

    g.fillStyle(PALETTE.shadow.background, 1);
    g.fillRect(halfW, 0, halfW, headerH);

    // Subtle bottom border
    g.lineStyle(1, PALETTE.real.floor, 1);
    g.lineBetween(0, headerH, halfW, headerH);
    g.lineStyle(1, PALETTE.shadow.floor, 1);
    g.lineBetween(halfW, headerH, width, headerH);

    this.container.add(g);

    // Left panel: "THE OTHER" & "REAL WORLD"
    const realTitle = scene.add
      .text(40, 16, 'THE OTHER', {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '20px',
        fontStyle: 'bold',
        color: PALETTE.real.text,
        letterSpacing: 2,
      })
      .setOrigin(0, 0);
    this.container.add(realTitle);

    const realLabel = scene.add
      .text(40, 42, 'REAL WORLD', {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '11px',
        color: PALETTE.real.secondaryHex,
        letterSpacing: 1.5,
      })
      .setOrigin(0, 0);
    this.container.add(realLabel);

    // Chapter & Level info on Real side
    this.chapterLabelText = scene.add
      .text(halfW - 30, 20, config.chapter.toUpperCase(), {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '11px',
        color: PALETTE.real.secondaryHex,
        letterSpacing: 1,
      })
      .setOrigin(1, 0);
    this.container.add(this.chapterLabelText);

    const lvlStr = `LEVEL ${String(config.levelNumber).padStart(2, '0')} / ${config.totalLevels}  •  ${config.levelName}`;
    this.levelLabelText = scene.add
      .text(halfW - 30, 38, lvlStr, {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '13px',
        fontStyle: 'bold',
        color: PALETTE.real.text,
        letterSpacing: 1,
      })
      .setOrigin(1, 0);
    this.container.add(this.levelLabelText);

    // Right panel: "SIDE" & "SHADOW WORLD"
    const shadowTitle = scene.add
      .text(halfW + 30, 16, 'SIDE', {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '20px',
        fontStyle: 'bold',
        color: PALETTE.shadow.text,
        letterSpacing: 2,
      })
      .setOrigin(0, 0);
    this.container.add(shadowTitle);

    const shadowLabel = scene.add
      .text(halfW + 30, 42, 'SHADOW WORLD', {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '11px',
        color: PALETTE.shadow.secondaryHex,
        letterSpacing: 1.5,
      })
      .setOrigin(0, 0);
    this.container.add(shadowLabel);

    // Live move counter
    this.movesText = scene.add
      .text(halfW + 240, 34, `MOVES: ${config.moves ?? 0}`, {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '13px',
        fontStyle: 'bold',
        color: PALETTE.shadow.text,
        letterSpacing: 1,
      })
      .setOrigin(0, 0.5);
    this.container.add(this.movesText);

    // Current Level Objective
    const objectiveStr = config.objective ?? 'REACH BOTH EXITS SIMULTANEOUSLY';
    this.objectiveText = scene.add
      .text(halfW, 52, `OBJECTIVE: ${objectiveStr}`, {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '10px',
        fontStyle: 'bold',
        color: '#777777',
        letterSpacing: 1.2,
      })
      .setOrigin(0.5, 0);
    this.container.add(this.objectiveText);

    // Right action buttons: RESTART & PAUSE
    const btnW = 86;
    const btnH = 32;
    const btnY = 18;

    // Restart button
    const restartBtnX = width - 40 - btnW * 2 - 12;
    this.createHeaderButton(
      scene,
      restartBtnX,
      btnY,
      btnW,
      btnH,
      'RESTART',
      () => callbacks.onRestart()
    );

    // Pause button
    const pauseBtnX = width - 40 - btnW;
    const { label: pText } = this.createHeaderButton(
      scene,
      pauseBtnX,
      btnY,
      btnW,
      btnH,
      'PAUSE',
      () => callbacks.onPause()
    );
    this.pauseBtnText = pText;
  }

  private createHeaderButton(
    scene: Phaser.Scene,
    x: number,
    y: number,
    w: number,
    h: number,
    text: string,
    onClick: () => void
  ): { border: Phaser.GameObjects.Graphics; label: Phaser.GameObjects.Text } {
    const g = scene.add.graphics();
    g.lineStyle(1, PALETTE.shadow.walls, 0.7);
    g.strokeRoundedRect(x, y, w, h, 4);
    this.container.add(g);

    const label = scene.add
      .text(x + w / 2, y + h / 2, text, {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '12px',
        fontStyle: 'bold',
        color: PALETTE.shadow.text,
        letterSpacing: 1,
      })
      .setOrigin(0.5);
    this.container.add(label);

    const hit = scene.add
      .zone(x + w / 2, y + h / 2, w, h)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    hit.on('pointerdown', onClick);
    hit.on('pointerover', () => {
      label.setColor('#CCCCCC');
    });
    hit.on('pointerout', () => {
      label.setColor(PALETTE.shadow.text);
    });

    this.container.add(hit);
    return { border: g, label };
  }

  public setPauseText(label: string): void {
    this.pauseBtnText.setText(label);
  }

  public updateMoves(moves: number): void {
    this.movesText.setText(`MOVES: ${moves}`);
  }

  public updateLevel(config: HeaderConfig): void {
    this.chapterLabelText.setText(config.chapter.toUpperCase());
    const lvlStr = `LEVEL ${String(config.levelNumber).padStart(2, '0')} / ${config.totalLevels}  •  ${config.levelName}`;
    this.levelLabelText.setText(lvlStr);
    this.updateMoves(config.moves ?? 0);
    if (config.objective) {
      this.objectiveText.setText(`OBJECTIVE: ${config.objective}`);
    }
  }
}
