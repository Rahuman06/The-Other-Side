import Phaser from 'phaser';
import { PALETTE } from '../core/constants';
import { pokiBridge } from '../poki/PokiIntegration';
import { StorageManager } from '../storage/StorageManager';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  public preload(): void {
    pokiBridge.gameLoadingStart();
    const { width, height } = this.scale;

    // Loading indicator on minimalist monochrome background
    const barW = 240;
    const barH = 4;
    const bgBar = this.add.graphics();
    bgBar.fillStyle(PALETTE.shadow.floor, 1);
    bgBar.fillRect(width / 2 - barW / 2, height / 2 - barH / 2, barW, barH);

    const progressBar = this.add.graphics();

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(PALETTE.shadow.character, 1);
      progressBar.fillRect(width / 2 - barW / 2, height / 2 - barH / 2, barW * value, barH);
    });

    this.createGeometricCharacters();
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
          this.scene.start('GameScene', { levelId: lvlNum });
          return;
        }
      }
    }

    this.scene.start('MenuScene');
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
