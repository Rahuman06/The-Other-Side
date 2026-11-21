import Phaser from 'phaser';
import { PALETTE } from '../core/constants';
import { pokiBridge } from '../poki/PokiIntegration';
import { StorageManager } from '../storage/StorageManager';

export class PreloadScene extends Phaser.Scene {
  private ambientGfx!: Phaser.GameObjects.Graphics;
  private animTimer: number = 0;

  constructor() {
    super('PreloadScene');
  }

  public preload(): void {
    pokiBridge.gameLoadingStart();
    const { width, height } = this.scale;
    const halfW = width / 2;
    const centerY = height / 2;

    // 1. Dual-World Themed Background & Dimensional Split
    const bgGfx = this.add.graphics();
    // Real World (Left subtle dark slate: #0d0d0d)
    bgGfx.fillStyle(0x0c0c0c, 1);
    bgGfx.fillRect(0, 0, halfW, height);
    // Shadow World (Right deep obsidian: #000000)
    bgGfx.fillStyle(0x000000, 1);
    bgGfx.fillRect(halfW, 0, halfW, height);
    // Subtle central dimensional threshold line
    bgGfx.lineStyle(1.5, 0x00e5ff, 0.35);
    bgGfx.lineBetween(halfW, 0, halfW, height);

    // 2. Dynamic Ambient Energy Overlay
    this.ambientGfx = this.add.graphics();

    // 3. Cinematic Themed Title Typography
    this.add
      .text(halfW - 8, centerY - 80, 'THE OTHER', {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '28px',
        fontStyle: 'bold',
        color: '#FFFFFF',
        letterSpacing: 4,
      })
      .setOrigin(1, 0.5);

    this.add
      .text(halfW + 8, centerY - 80, 'SIDE', {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '28px',
        fontStyle: 'bold',
        color: '#00E5FF',
        letterSpacing: 4,
      })
      .setOrigin(0, 0.5);

    this.add
      .text(halfW, centerY - 44, 'TWO WORLDS. ONE MIND.', {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '12px',
        color: '#888888',
        letterSpacing: 3,
      })
      .setOrigin(0.5);

    // 4. Dual-World Progress Bar Architecture
    const barW = 320;
    const barH = 6;
    const barX = halfW - barW / 2;
    const barY = centerY + 30;

    const barBg = this.add.graphics();
    barBg.fillStyle(0x181818, 0.95);
    barBg.fillRoundedRect(barX, barY, barW, barH, 3);
    barBg.lineStyle(1, 0x333333, 0.8);
    barBg.strokeRoundedRect(barX - 1, barY - 1, barW + 2, barH + 2, 4);

    const progressBar = this.add.graphics();

    // 5. Real-Time Percentage & Status Typography
    const percentText = this.add
      .text(halfW, barY + 24, '0%', {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '13px',
        fontStyle: 'bold',
        color: '#FFFFFF',
        letterSpacing: 1,
      })
      .setOrigin(0.5);

    const statusText = this.add
      .text(halfW, barY + 44, 'CALIBRATING DIMENSIONAL RESONANCE...', {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '10px',
        color: '#666666',
        letterSpacing: 2,
      })
      .setOrigin(0.5);

    this.load.on('progress', (value: number) => {
      const pct = Math.floor(value * 100);
      percentText.setText(`${pct}%`);

      if (value < 0.35) {
        statusText.setText('CALIBRATING DIMENSIONAL RESONANCE...');
      } else if (value < 0.7) {
        statusText.setText('SYNCHRONIZING DUAL MATRICES...');
      } else if (value < 0.95) {
        statusText.setText('INITIALIZING PUZZLE GEOMETRY...');
      } else {
        statusText.setText('DIMENSIONS CONNECTED');
      }

      progressBar.clear();
      // Glowing Cyan Loading Fill
      progressBar.fillStyle(0x00e5ff, 1);
      progressBar.fillRoundedRect(barX, barY, Math.max(6, barW * value), barH, 3);
      // Subtle glowing leading edge
      if (value > 0.02) {
        progressBar.fillStyle(0xffffff, 0.85);
        progressBar.fillCircle(barX + barW * value, barY + barH / 2, 4);
      }
    });

    this.load.on('loaderror', (fileObj: Phaser.Loader.File) => {
      console.warn('[PreloadScene] Non-fatal asset warning:', fileObj.key);
    });

    this.createGeometricCharacters();
  }

  public update(_time: number, delta: number): void {
    if (!this.ambientGfx) return;
    this.animTimer += delta * 0.002;
    const { width, height } = this.scale;
    const halfW = width / 2;

    this.ambientGfx.clear();
    // Subtle breathing pulse along the central threshold
    const alpha = 0.25 + 0.25 * Math.sin(this.animTimer * 2.5);
    this.ambientGfx.lineStyle(2, 0x00e5ff, alpha);
    this.ambientGfx.lineBetween(halfW, 0, halfW, height);

    // Small glowing energy node traversing the threshold
    const nodeY = (Math.sin(this.animTimer) * 0.5 + 0.5) * height;
    this.ambientGfx.fillStyle(0x00e5ff, 0.6);
    this.ambientGfx.fillCircle(halfW, nodeY, 3);
  }

  public create(): void {
    pokiBridge.gameLoadingFinished();

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      let directLevel = params.get('level');
      if (!directLevel && window.location.hash) {
        const hash = window.location.hash.replace('#', '');
        const hashMatch = hash.match(/(?:level=)?(\d+)/i);
        if (hashMatch) {
          directLevel = hashMatch[1];
        }
      }
      if (directLevel) {
        const lvlNum = parseInt(directLevel, 10);
        if (!isNaN(lvlNum) && lvlNum >= 1 && lvlNum <= 20) {
          try {
            const storage = new StorageManager();
            const cur = storage.getProgress();
            const newUnlocked = Math.max(cur.unlockedLevel, lvlNum);
            const levelsSet = new Set(cur.unlockedLevels);
            for (let i = 1; i <= lvlNum; i++) levelsSet.add(i);
            storage.saveProgress({
              unlockedLevel: newUnlocked,
              unlockedLevels: Array.from(levelsSet).sort((a, b) => a - b),
              currentLevel: lvlNum,
            });
          } catch {
            // Non-blocking storage fallback
          }
          this.cameras.main.fadeOut(250, 0, 0, 0);
          this.time.delayedCall(250, () => {
            this.scene.start('GameScene', { levelId: lvlNum });
          });
          return;
        }
      }
    }

    this.cameras.main.fadeOut(250, 0, 0, 0);
    this.time.delayedCall(250, () => {
      this.scene.start('MenuScene');
    });
  }

  private createGeometricCharacters(): void {
    // 1. Real Character: Black geometric silhouette (#080808) with high-contrast inner aperture
    const g = this.make.graphics({ x: 0, y: 0 });
    const size = 64;

    g.fillStyle(PALETTE.real.character, 1);
    g.fillRoundedRect(4, 4, size - 8, size - 8, 8);

    // Minimalist geometric inner mark (white diamond aperture)
    g.fillStyle(PALETTE.real.background, 1);
    const cx = size / 2;
    const cy = size / 2;
    const r = 7;
    g.beginPath();
    g.moveTo(cx, cy - r);
    g.lineTo(cx + r, cy);
    g.lineTo(cx, cy + r);
    g.lineTo(cx - r, cy);
    g.closePath();
    g.fillPath();

    g.generateTexture('char_real', size, size);
    g.clear();

    // 2. Shadow Character: White geometric silhouette (#FFFFFF) with inverted inner aperture
    g.fillStyle(PALETTE.shadow.character, 1);
    g.fillRoundedRect(4, 4, size - 8, size - 8, 8);

    // Inverted geometric inner mark
    g.fillStyle(PALETTE.shadow.background, 1);
    g.beginPath();
    g.moveTo(cx, cy - r);
    g.lineTo(cx + r, cy);
    g.lineTo(cx, cy + r);
    g.lineTo(cx - r, cy);
    g.closePath();
    g.fillPath();

    g.generateTexture('char_shadow', size, size);
    g.destroy();
  }
}
