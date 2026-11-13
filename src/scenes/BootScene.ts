import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  public init(): void {
    // Configure system-level settings, disable context menu on canvas
    this.input.mouse?.disableContextMenu();
  }

  public create(): void {
    this.scene.start('PreloadScene');
  }
}
