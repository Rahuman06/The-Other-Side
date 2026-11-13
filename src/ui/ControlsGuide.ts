import Phaser from 'phaser';
import { PALETTE } from '../core/constants';

export class ControlsGuide {
  private container: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, width: number, height: number) {
    this.container = scene.add.container(0, 0);
    this.container.setDepth(20);

    const footerY = height - 32;

    // Real world footer controls
    const realControls = scene.add
      .text(40, footerY, 'WASD / ARROWS : MOVE  •  R : RESTART  •  Z : UNDO', {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '11px',
        color: PALETTE.real.secondaryHex,
        letterSpacing: 1.2,
      })
      .setOrigin(0, 0.5);
    this.container.add(realControls);

    // Shadow world footer controls
    const shadowControls = scene.add
      .text(width - 40, footerY, 'TWO WORLDS  •  ONE MIND  •  P : PAUSE', {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '11px',
        color: PALETTE.shadow.secondaryHex,
        letterSpacing: 1.2,
      })
      .setOrigin(1, 0.5);
    this.container.add(shadowControls);
  }
}
