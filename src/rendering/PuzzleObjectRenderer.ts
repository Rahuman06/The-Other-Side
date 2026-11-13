import Phaser from 'phaser';
import { BuiltLevelSession } from '../levels/LevelFactory';
import { GridPoint } from '../grid/GridPosition';
import { VisualEffectsManager } from './VisualEffectsManager';
import { PALETTE } from '../core/constants';

export type ScreenCoordFn = (pos: GridPoint, isReal: boolean) => { x: number; y: number };

export class PuzzleObjectRenderer {
  private vfx: VisualEffectsManager;
  private cellSize: number;

  constructor(vfx: VisualEffectsManager, cellSize: number) {
    this.vfx = vfx;
    this.cellSize = cellSize;
  }

  public setCellSize(cellSize: number): void {
    this.cellSize = cellSize;
  }

  /**
   * Renders static exits with architectural gateway styling and pulsing ground beacon rings
   */
  public renderExit(
    g: Phaser.GameObjects.Graphics,
    pos: GridPoint,
    isReal: boolean,
    getScreenCoords: ScreenCoordFn,
    isUnlocked: boolean = true
  ): void {
    const coords = getScreenCoords(pos, isReal);
    const color = isReal ? PALETTE.real.character : PALETTE.shadow.character;
    const accentCol = 0x00e5ff;
    const s = this.cellSize * 0.72;

    // 1. Monolithic architectural gateway portal frame
    g.lineStyle(2.5, color, 0.95);
    g.strokeRoundedRect(coords.x - s / 2, coords.y - s / 2, s, s, 6);

    // Inner archway bevel
    g.lineStyle(1.5, color, 0.45);
    g.strokeRoundedRect(coords.x - s / 2 + 4, coords.y - s / 2 + 4, s - 8, s - 8, 4);

    if (isUnlocked) {
      // 2. Concentric pulsating ground beacon rings
      const pulse1 = (Math.sin(this.vfx.exitPulsePhase) + 1) * 0.5;
      const pulse2 = (Math.sin(this.vfx.exitPulsePhase + Math.PI) + 1) * 0.5;

      const r1 = this.cellSize * (0.2 + pulse1 * 0.14);
      const r2 = this.cellSize * (0.15 + pulse2 * 0.12);

      g.lineStyle(1.5, color, 0.3 + pulse1 * 0.4);
      g.strokeCircle(coords.x, coords.y, r1);

      g.lineStyle(1.5, accentCol, 0.25 + pulse2 * 0.5);
      g.strokeCircle(coords.x, coords.y, r2);

      // Central radiant beacon core
      g.fillStyle(color, 0.85);
      g.fillCircle(coords.x, coords.y, this.cellSize * 0.1);

      g.fillStyle(accentCol, 0.6);
      g.fillCircle(coords.x, coords.y, this.cellSize * 0.06);
    } else {
      // Locked state: crossing seal
      g.lineStyle(2, color, 0.6);
      g.lineBetween(coords.x - s * 0.3, coords.y - s * 0.3, coords.x + s * 0.3, coords.y + s * 0.3);
      g.lineBetween(coords.x - s * 0.3, coords.y + s * 0.3, coords.x + s * 0.3, coords.y - s * 0.3);
    }
  }

  /**
   * Renders all active dynamic puzzle objects
   */
  public renderDynamicElements(
    g: Phaser.GameObjects.Graphics,
    session: BuiltLevelSession,
    getScreenCoords: ScreenCoordFn,
    bombLabels: Map<string, Phaser.GameObjects.Text>
  ): void {
    g.clear();

    // 1. Exits (animated beacon overlay)
    this.renderExit(g, GridPoint.from(session.player.position.equals(session.shadow.position) ? session.player.position : session.player.position), true, getScreenCoords);

    // 2. Checkpoints
    this.renderCheckpoints(g, session, getScreenCoords);

    // 3. Collapsing Floors (behind actors)
    this.renderCollapsingFloors(g, session, getScreenCoords);

    // 4. Pressure Plates
    this.renderPressurePlates(g, session, getScreenCoords);

    // 5. Switches
    this.renderSwitches(g, session, getScreenCoords);

    // 6. Doors
    this.renderDoors(g, session, getScreenCoords);

    // 7. Destructible Walls
    this.renderDestructibleWalls(g, session, getScreenCoords);

    // 8. Movable Blocks
    this.renderMovableBlocks(g, session, getScreenCoords);

    // 9. Magnetic Fields
    this.renderMagneticFields(g, session, getScreenCoords);

    // 10. Portals
    this.renderPortals(g, session, getScreenCoords);

    // 11. Time Locks
    this.renderTimeLocks(g, session, getScreenCoords);

    // 12. Laser Mirrors
    this.renderLaserMirrors(g, session, getScreenCoords);

    // 13. Laser Emitters
    this.renderLaserEmitters(g, session, getScreenCoords);

    // 14. Laser Receivers
    this.renderLaserReceivers(g, session, getScreenCoords);

    // 15. Active Laser Beams
    this.renderLaserBeams(g, session, getScreenCoords);

    // 16. Moving Saw Blades
    this.renderMovingHazards(g, session, getScreenCoords);

    // 17. Bombs (rendered on top with countdown labels)
    this.renderBombs(g, session, getScreenCoords, bombLabels);
  }

  // --- 1. Checkpoints ---
  private renderCheckpoints(g: Phaser.GameObjects.Graphics, session: BuiltLevelSession, getScreenCoords: ScreenCoordFn): void {
    for (const cp of session.checkpoints) {
      const rCoords = getScreenCoords(cp.realPosition, true);
      const sCoords = getScreenCoords(cp.shadowPosition, false);

      const rActive = cp.isRealVisited || cp.isActivated;
      const sActive = cp.isShadowVisited || cp.isActivated;

      this.drawCheckpointPillar(g, rCoords.x, rCoords.y, true, rActive, cp.isActivated);
      this.drawCheckpointPillar(g, sCoords.x, sCoords.y, false, sActive, cp.isActivated);
    }
  }

  private drawCheckpointPillar(
    g: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    isReal: boolean,
    visited: boolean,
    activated: boolean
  ): void {
    const col = isReal ? PALETTE.real.walls : PALETTE.shadow.walls;
    const accentCol = 0x00e5ff;
    const r = this.cellSize * 0.32;

    // Grounding runic circle
    g.lineStyle(1.5, col, visited ? 0.9 : 0.4);
    g.strokeCircle(x, y, r);

    // Four cardinal runic tick marks
    const tickLen = 4;
    g.lineStyle(2, col, visited ? 0.95 : 0.4);
    g.lineBetween(x, y - r - tickLen, x, y - r + tickLen);
    g.lineBetween(x, y + r - tickLen, x, y + r + tickLen);
    g.lineBetween(x - r - tickLen, y, x - r + tickLen, y);
    g.lineBetween(x + r - tickLen, y, x + r + tickLen, y);

    if (activated) {
      // Fully synchronized paired beacon
      const pulse = (Math.sin(this.vfx.exitPulsePhase * 1.5) + 1) * 0.5;
      g.lineStyle(2, accentCol, 0.4 + pulse * 0.5);
      g.strokeCircle(x, y, r * (0.6 + pulse * 0.3));

      g.fillStyle(accentCol, 0.9);
      g.fillCircle(x, y, r * 0.35);

      g.fillStyle(0xffffff, 0.95);
      g.fillCircle(x, y, r * 0.18);
    } else if (visited) {
      // Visited by one world
      g.fillStyle(col, 0.85);
      g.fillCircle(x, y, r * 0.35);
    } else {
      // Inactive hollow core
      g.lineStyle(1, col, 0.3);
      g.strokeCircle(x, y, r * 0.4);
    }
  }

  // --- 2. Pressure Plates ---
  private renderPressurePlates(g: Phaser.GameObjects.Graphics, session: BuiltLevelSession, getScreenCoords: ScreenCoordFn): void {
    for (const plate of session.puzzleManager.getAllPressurePlates()) {
      const isReal = plate.world === 'real';
      const coords = getScreenCoords(plate.position, isReal);
      const size = this.cellSize * 0.56;

      const strokeCol = isReal ? PALETTE.real.walls : PALETTE.shadow.walls;
      const fillCol = isReal ? 0xd0d0d0 : 0x303030;
      const pressedFill = isReal ? 0x999999 : 0x555555;
      const accentCol = 0x00e5ff;

      if (!plate.isPressed) {
        // Raised 3D beveled appearance (unpressed)
        // Recessed floor trench
        g.lineStyle(1, strokeCol, 0.4);
        g.strokeRoundedRect(coords.x - size / 2 - 2, coords.y - size / 2 - 2, size + 4, size + 4, 4);

        // Raised plate top
        g.fillStyle(fillCol, 0.95);
        g.fillRoundedRect(coords.x - size / 2, coords.y - size / 2 - 2, size, size, 3);
        g.lineStyle(1.5, strokeCol, 0.9);
        g.strokeRoundedRect(coords.x - size / 2, coords.y - size / 2 - 2, size, size, 3);

        // Center contact diamond
        g.lineStyle(1, strokeCol, 0.5);
        g.strokeRect(coords.x - size * 0.2, coords.y - size * 0.2 - 2, size * 0.4, size * 0.4);
      } else {
        // Pressed: sunken flush into floor recess
        g.fillStyle(pressedFill, 1);
        g.fillRoundedRect(coords.x - size / 2, coords.y - size / 2 + 1, size, size, 2);
        g.lineStyle(2, accentCol, 0.9);
        g.strokeRoundedRect(coords.x - size / 2, coords.y - size / 2 + 1, size, size, 2);

        // Active energized contact pads
        g.fillStyle(accentCol, 0.85);
        g.fillRect(coords.x - size * 0.15, coords.y - size * 0.15 + 1, size * 0.3, size * 0.3);
      }
    }
  }

  // --- 3. Switches ---
  private renderSwitches(g: Phaser.GameObjects.Graphics, session: BuiltLevelSession, getScreenCoords: ScreenCoordFn): void {
    for (const sw of session.puzzleManager.getAllSwitches()) {
      const isReal = sw.world === 'real';
      const coords = getScreenCoords(sw.position, isReal);
      const strokeCol = isReal ? PALETTE.real.walls : PALETTE.shadow.walls;
      const accentCol = 0x00e5ff;
      const s = this.cellSize * 0.36;

      // Industrial switch housing base
      g.fillStyle(isReal ? 0xdddddd : 0x222222, 1);
      g.fillRoundedRect(coords.x - s, coords.y - s, s * 2, s * 2, 4);
      g.lineStyle(2, strokeCol, 0.95);
      g.strokeRoundedRect(coords.x - s, coords.y - s, s * 2, s * 2, 4);

      // Status indicator LED
      const ledColor = sw.isActive ? accentCol : (isReal ? 0x777777 : 0x444444);
      g.fillStyle(ledColor, 1);
      g.fillCircle(coords.x + s * 0.5, coords.y - s * 0.5, 3.5);
      if (sw.isActive) {
        g.lineStyle(1.5, accentCol, 0.5);
        g.strokeCircle(coords.x + s * 0.5, coords.y - s * 0.5, 6);
      }

      // Mechanical toggle lever arm
      const armLen = s * 0.9;
      const angle = sw.isActive ? -Math.PI / 4 : (Math.PI * 3) / 4;
      const lx = coords.x + Math.cos(angle) * armLen;
      const ly = coords.y + Math.sin(angle) * armLen;

      g.lineStyle(3, strokeCol, 1);
      g.lineBetween(coords.x, coords.y, lx, ly);

      // Lever knob
      g.fillStyle(sw.isActive ? accentCol : strokeCol, 1);
      g.fillCircle(lx, ly, 4);

      // Center pivot bolt
      g.fillStyle(strokeCol, 1);
      g.fillCircle(coords.x, coords.y, 3);
    }
  }

  // --- 4. Doors ---
  private renderDoors(g: Phaser.GameObjects.Graphics, session: BuiltLevelSession, getScreenCoords: ScreenCoordFn): void {
    for (const door of session.puzzleManager.getAllDoors()) {
      const isReal = door.world === 'real';
      const coords = getScreenCoords(door.position, isReal);
      const size = this.cellSize * 0.84;
      const strokeCol = isReal ? PALETTE.real.walls : PALETTE.shadow.walls;
      const fillCol = isReal ? 0x222222 : 0xd8d8d8;
      const accentCol = 0x00e5ff;

      if (!door.isOpen) {
        // Closed: Heavy blast door with interlocking horizontal chevrons
        g.fillStyle(fillCol, 0.98);
        g.fillRoundedRect(coords.x - size / 2, coords.y - size / 2, size, size, 4);
        g.lineStyle(2, strokeCol, 1);
        g.strokeRoundedRect(coords.x - size / 2, coords.y - size / 2, size, size, 4);

        // Security locking bar & bolts
        const barH = 6;
        g.fillStyle(isReal ? 0x111111 : 0xffffff, 1);
        g.fillRect(coords.x - size / 2 + 4, coords.y - barH / 2, size - 8, barH);

        // Interlocking chevrons
        g.lineStyle(1.5, isReal ? 0x444444 : 0xbbbbbb, 0.8);
        g.lineBetween(coords.x - size * 0.35, coords.y - size * 0.25, coords.x, coords.y - size * 0.15);
        g.lineBetween(coords.x, coords.y - size * 0.15, coords.x + size * 0.35, coords.y - size * 0.25);
        g.lineBetween(coords.x - size * 0.35, coords.y + size * 0.25, coords.x, coords.y + size * 0.15);
        g.lineBetween(coords.x, coords.y + size * 0.15, coords.x + size * 0.35, coords.y + size * 0.25);

        // Central lock clamp
        g.fillStyle(strokeCol, 1);
        g.fillRect(coords.x - 5, coords.y - 7, 10, 14);
      } else {
        // Open: Retracted into frame jambs with clear doorway passage
        g.lineStyle(2, strokeCol, 0.4);
        g.strokeRoundedRect(coords.x - size / 2, coords.y - size / 2, size, size, 4);

        // Retracted side door leaves
        const leafW = 6;
        g.fillStyle(strokeCol, 0.7);
        g.fillRect(coords.x - size / 2, coords.y - size / 2, leafW, size);
        g.fillRect(coords.x + size / 2 - leafW, coords.y - size / 2, leafW, size);

        // Green/cyan threshold clearance indicator
        g.lineStyle(1.5, accentCol, 0.5);
        g.strokeCircle(coords.x, coords.y, 4);
      }
    }
  }

  // --- 5. Destructible Walls ---
  private renderDestructibleWalls(g: Phaser.GameObjects.Graphics, session: BuiltLevelSession, getScreenCoords: ScreenCoordFn): void {
    for (const dw of session.puzzleManager.getAllDestructibleWalls()) {
      if (dw.isDestroyed) continue;
      const isReal = dw.world === 'real';
      const coords = getScreenCoords(dw.position, isReal);
      const s = this.cellSize * 0.88;
      const fillCol = isReal ? 0x262626 : 0xd8d8d8;
      const strokeCol = isReal ? PALETTE.real.walls : PALETTE.shadow.walls;
      const crackCol = isReal ? 0x666666 : 0x888888;

      g.fillStyle(fillCol, 1);
      g.fillRect(coords.x - s / 2, coords.y - s / 2, s, s);
      g.lineStyle(2, strokeCol, 0.95);
      g.strokeRect(coords.x - s / 2, coords.y - s / 2, s, s);

      // Deep stress fracture fissure pattern indicating explosive vulnerability
      g.lineStyle(2, crackCol, 0.9);
      g.beginPath();
      g.moveTo(coords.x - s * 0.4, coords.y - s * 0.45);
      g.lineTo(coords.x - s * 0.1, coords.y - s * 0.1);
      g.lineTo(coords.x + s * 0.2, coords.y - s * 0.25);
      g.lineTo(coords.x + s * 0.45, coords.y - s * 0.1);
      g.moveTo(coords.x - s * 0.1, coords.y - s * 0.1);
      g.lineTo(coords.x - s * 0.2, coords.y + s * 0.3);
      g.lineTo(coords.x + s * 0.1, coords.y + s * 0.45);
      g.strokePath();

      // Masonry mortar line
      g.lineStyle(1, strokeCol, 0.4);
      g.lineBetween(coords.x - s / 2, coords.y, coords.x + s / 2, coords.y);
    }
  }

  // --- 6. Bombs ---
  private renderBombs(
    g: Phaser.GameObjects.Graphics,
    session: BuiltLevelSession,
    getScreenCoords: ScreenCoordFn,
    bombLabels: Map<string, Phaser.GameObjects.Text>
  ): void {
    for (const b of session.puzzleManager.getAllBombs()) {
      const isReal = b.world === 'real';
      const coords = getScreenCoords(b.position, isReal);
      const r = this.cellSize * 0.33;

      if (!b.isDetonated) {
        // 1. Blast danger zone visualization when active
        if (b.isActive) {
          const blastPts = b.getBlastCoordinates();
          const pulse = (Math.sin(this.vfx.exitPulsePhase * 3) + 1) * 0.5;
          const dangerCol = isReal ? 0xcc2200 : 0xff4422;

          for (const pt of blastPts) {
            const bScreen = getScreenCoords(pt, isReal);
            const halfCell = this.cellSize * 0.46;
            g.lineStyle(1.5, dangerCol, 0.25 + pulse * 0.35);
            g.strokeRect(bScreen.x - halfCell, bScreen.y - halfCell, halfCell * 2, halfCell * 2);
          }
        }

        // 2. Cast-iron spherical bomb body with metallic rivet ridge
        const shellCol = isReal ? 0x1a1a1a : 0xf0f0f0;
        const rimCol = isReal ? 0x444444 : 0xcccccc;
        g.fillStyle(shellCol, 1);
        g.fillCircle(coords.x, coords.y, r);
        g.lineStyle(2.5, rimCol, 1);
        g.strokeCircle(coords.x, coords.y, r);

        // 3. Cylindrical neck & fuse cap
        const neckW = r * 0.6;
        const neckH = 5;
        g.fillStyle(rimCol, 1);
        g.fillRect(coords.x - neckW / 2, coords.y - r - neckH + 1, neckW, neckH);

        // 4. Sputtering burning fuse
        if (b.isActive) {
          const fuseStartX = coords.x;
          const fuseStartY = coords.y - r - neckH + 1;
          const fuseEndX = coords.x + 8;
          const fuseEndY = fuseStartY - 8;

          g.lineStyle(2, 0x886633, 1);
          g.beginPath();
          g.moveTo(fuseStartX, fuseStartY);
          g.lineTo(coords.x + 3, fuseStartY - 4);
          g.lineTo(fuseEndX, fuseEndY);
          g.strokePath();

          // Continuous sputtering spark particles
          this.vfx.spawnFuseSpark(fuseEndX, fuseEndY, isReal);
        }

        // 5. High-contrast countdown typography
        let label = bombLabels.get(b.id);
        if (!label) {
          label = session.player.position ? (g.scene as Phaser.Scene).add.text(coords.x, coords.y, '', {
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: '16px',
            fontStyle: 'bold',
            color: isReal ? '#FFFFFF' : '#000000',
          }).setOrigin(0.5).setDepth(20) : null!;
          if (label) bombLabels.set(b.id, label);
        }
        if (label) {
          label.setPosition(coords.x, coords.y);
          label.setText(b.isActive ? String(b.countdown) : String(b.initialTimer));
          label.setColor(b.isActive ? '#FF3333' : (isReal ? '#FFFFFF' : '#000000'));
          label.setVisible(true);
        }
      } else {
        const label = bombLabels.get(b.id);
        if (label) label.setVisible(false);
      }
    }
  }

  // --- 7. Portals ---
  private renderPortals(g: Phaser.GameObjects.Graphics, session: BuiltLevelSession, getScreenCoords: ScreenCoordFn): void {
    for (const p of session.puzzleManager.getAllPortals()) {
      if (!p.isActive) continue;
      const isReal = p.world === 'real';
      const coords = getScreenCoords(p.position, isReal);
      const r = this.cellSize * 0.36;
      const col = isReal ? PALETTE.real.character : PALETTE.shadow.character;

      if (p.isCorrupted) {
        // Corrupted portal: Erratic jagged spikes, void singularity, unstable magenta pulse
        const corruptionCol = 0xff0055;
        g.lineStyle(2.5, corruptionCol, 0.95);
        g.strokeCircle(coords.x, coords.y, r);

        // Fractured spike perimeter
        const spikes = 6;
        for (let i = 0; i < spikes; i++) {
          const a = (i * Math.PI * 2) / spikes + this.vfx.portalVortexAngle * 1.5;
          const x1 = coords.x + Math.cos(a) * (r * 0.9);
          const y1 = coords.y + Math.sin(a) * (r * 0.9);
          const x2 = coords.x + Math.cos(a) * (r * 1.25);
          const y2 = coords.y + Math.sin(a) * (r * 1.25);
          g.lineStyle(2, corruptionCol, 0.8);
          g.lineBetween(x1, y1, x2, y2);
        }

        // Inner void core
        g.fillStyle(0x1a000d, 1);
        g.fillCircle(coords.x, coords.y, r * 0.65);
        g.fillStyle(corruptionCol, 0.7);
        g.fillCircle(coords.x, coords.y, r * 0.25);

        this.vfx.spawnPortalIngestionMote(coords.x, coords.y, isReal, true);
      } else {
        // Standard paired portal: Cosmic rune ring & dual counter-rotating vortex swirls
        // Outer runic rim
        g.lineStyle(2.5, col, 0.9);
        g.strokeCircle(coords.x, coords.y, r);

        // Outer clockwise vortex spiral
        const arms = 4;
        for (let i = 0; i < arms; i++) {
          const a = (i * Math.PI * 2) / arms + this.vfx.portalVortexAngle;
          const x1 = coords.x + Math.cos(a) * (r * 0.4);
          const y1 = coords.y + Math.sin(a) * (r * 0.4);
          const x2 = coords.x + Math.cos(a + 0.6) * (r * 0.9);
          const y2 = coords.y + Math.sin(a + 0.6) * (r * 0.9);
          g.lineStyle(1.5, col, 0.6);
          g.lineBetween(x1, y1, x2, y2);
        }

        // Inner counter-clockwise event horizon
        for (let i = 0; i < arms; i++) {
          const a = (i * Math.PI * 2) / arms + this.vfx.portalInnerAngle;
          const x1 = coords.x + Math.cos(a) * (r * 0.15);
          const y1 = coords.y + Math.sin(a) * (r * 0.15);
          const x2 = coords.x + Math.cos(a - 0.5) * (r * 0.45);
          const y2 = coords.y + Math.sin(a - 0.5) * (r * 0.45);
          g.lineStyle(2, 0x00e5ff, 0.75);
          g.lineBetween(x1, y1, x2, y2);
        }

        // Deep event horizon core
        g.fillStyle(isReal ? 0x050505 : 0xf8f8f8, 0.95);
        g.fillCircle(coords.x, coords.y, r * 0.28);

        this.vfx.spawnPortalIngestionMote(coords.x, coords.y, isReal, false);
      }
    }
  }

  // --- 8. Collapsing Floors ---
  private renderCollapsingFloors(g: Phaser.GameObjects.Graphics, session: BuiltLevelSession, getScreenCoords: ScreenCoordFn): void {
    for (const cf of session.puzzleManager.getAllCollapsingFloors()) {
      const isReal = cf.world === 'real';
      const coords = getScreenCoords(cf.position, isReal);
      const s = this.cellSize * 0.46;
      const col = isReal ? PALETTE.real.character : PALETTE.shadow.character;

      if (cf.floorState === 'COLLAPSED') {
        // Gaping abyss pit
        g.fillStyle(isReal ? 0x101010 : 0xe0e0e0, 0.95);
        g.fillRect(coords.x - s, coords.y - s, s * 2, s * 2);
        g.lineStyle(2, col, 0.6);
        g.strokeRect(coords.x - s, coords.y - s, s * 2, s * 2);

        // Broken ragged drop edge
        g.lineStyle(1.5, isReal ? 0x333333 : 0xcccccc, 0.8);
        g.beginPath();
        g.moveTo(coords.x - s, coords.y - s);
        g.lineTo(coords.x - s * 0.5, coords.y - s * 0.7);
        g.lineTo(coords.x + s * 0.2, coords.y - s);
        g.lineTo(coords.x + s, coords.y - s * 0.6);
        g.strokePath();
      } else if (cf.floorState === 'CRACKED') {
        // Warning: Severely fractured stone pavers
        g.lineStyle(2, col, 0.85);
        g.beginPath();
        g.moveTo(coords.x - s * 0.8, coords.y - s * 0.7);
        g.lineTo(coords.x - s * 0.1, coords.y - s * 0.1);
        g.lineTo(coords.x + s * 0.7, coords.y - s * 0.6);
        g.moveTo(coords.x - s * 0.1, coords.y - s * 0.1);
        g.lineTo(coords.x - s * 0.4, coords.y + s * 0.7);
        g.moveTo(coords.x - s * 0.1, coords.y - s * 0.1);
        g.lineTo(coords.x + s * 0.8, coords.y + s * 0.4);
        g.strokePath();

        // Occasional crumbling pebble
        if (Math.random() < 0.05) {
          this.vfx.spawnCrumblingDebris(coords.x, coords.y, isReal);
        }
      } else {
        // Intact: Subtle hairline surface alignment notches
        g.lineStyle(1, col, 0.22);
        g.strokeRect(coords.x - s * 0.75, coords.y - s * 0.75, s * 1.5, s * 1.5);
      }
    }
  }

  // --- 9. Moving Saw Blades ---
  private renderMovingHazards(g: Phaser.GameObjects.Graphics, session: BuiltLevelSession, getScreenCoords: ScreenCoordFn): void {
    for (const saw of session.puzzleManager.getAllMovingHazards()) {
      const isReal = saw.world === 'real';
      const coords = getScreenCoords(saw.position, isReal);
      const r = this.cellSize * 0.35;
      const col = isReal ? PALETTE.real.character : PALETTE.shadow.character;
      const teeth = 8;
      const angleOffset = this.vfx.sawRotationAngle;

      // 1. Motion blur outer rim arc
      g.lineStyle(1.5, col, 0.25);
      g.strokeCircle(coords.x, coords.y, r * 1.15);

      // 2. Heavy circular steel blade disk
      g.fillStyle(isReal ? 0x222222 : 0xdddddd, 0.95);
      g.fillCircle(coords.x, coords.y, r);
      g.lineStyle(2, col, 1);
      g.strokeCircle(coords.x, coords.y, r);

      // 3. Eight aggressive curved shark-tooth cutting teeth
      for (let i = 0; i < teeth; i++) {
        const a = (i * Math.PI * 2) / teeth + angleOffset;
        const toothTipA = a + 0.22;
        const xRoot = coords.x + Math.cos(a) * (r * 0.85);
        const yRoot = coords.y + Math.sin(a) * (r * 0.85);
        const xTip = coords.x + Math.cos(toothTipA) * (r * 1.25);
        const yTip = coords.y + Math.sin(toothTipA) * (r * 1.25);
        const xBack = coords.x + Math.cos(a + 0.38) * (r * 0.95);
        const yBack = coords.y + Math.sin(a + 0.38) * (r * 0.95);

        g.fillStyle(col, 1);
        g.beginPath();
        g.moveTo(xRoot, yRoot);
        g.lineTo(xTip, yTip);
        g.lineTo(xBack, yBack);
        g.closePath();
        g.fillPath();
      }

      // 4. Heavy central mechanical hub with 4 locking bolts
      g.fillStyle(isReal ? 0x444444 : 0xaaaaaa, 1);
      g.fillCircle(coords.x, coords.y, r * 0.38);
      g.lineStyle(1.5, col, 1);
      g.strokeCircle(coords.x, coords.y, r * 0.38);

      // Center bolt
      g.fillStyle(col, 1);
      g.fillCircle(coords.x, coords.y, r * 0.12);
    }
  }

  // --- 10. Laser Receivers ---
  private renderLaserReceivers(g: Phaser.GameObjects.Graphics, session: BuiltLevelSession, getScreenCoords: ScreenCoordFn): void {
    for (const rx of session.puzzleManager.getAllLaserReceivers()) {
      const isReal = rx.world === 'real';
      const coords = getScreenCoords(rx.position, isReal);
      const s = this.cellSize * 0.38;
      const col = isReal ? PALETTE.real.character : PALETTE.shadow.character;
      const accentCol = 0x00e5ff;

      // Receptor mount dish
      g.fillStyle(isReal ? 0x222222 : 0xdddddd, 0.9);
      g.fillRoundedRect(coords.x - s, coords.y - s, s * 2, s * 2, 5);
      g.lineStyle(2, col, 0.95);
      g.strokeRoundedRect(coords.x - s, coords.y - s, s * 2, s * 2, 5);

      // Target bullseye rings
      g.lineStyle(1.5, rx.isPowered ? accentCol : col, rx.isPowered ? 1 : 0.4);
      g.strokeCircle(coords.x, coords.y, s * 0.65);

      if (rx.isPowered) {
        // High-intensity energized core
        g.fillStyle(accentCol, 0.9);
        g.fillCircle(coords.x, coords.y, s * 0.4);
        g.fillStyle(0xffffff, 1);
        g.fillCircle(coords.x, coords.y, s * 0.2);

        // Radiant aura
        g.lineStyle(2.5, accentCol, 0.4);
        g.strokeCircle(coords.x, coords.y, s * 0.9);
      } else {
        g.fillStyle(col, 0.35);
        g.fillCircle(coords.x, coords.y, s * 0.25);
      }
    }
  }

  // --- 11. Laser Mirrors ---
  private renderLaserMirrors(g: Phaser.GameObjects.Graphics, session: BuiltLevelSession, getScreenCoords: ScreenCoordFn): void {
    for (const lm of session.puzzleManager.getAllLaserMirrors()) {
      const isReal = lm.world === 'real';
      const coords = getScreenCoords(lm.position, isReal);
      const s = this.cellSize * 0.38;
      const col = isReal ? PALETTE.real.character : PALETTE.shadow.character;
      const mirrorCol = 0x00e5ff;

      // Precision swivel mount ring
      g.lineStyle(1.5, col, 0.45);
      g.strokeCircle(coords.x, coords.y, s * 0.85);

      // Angled optical prism glass plate
      let x1 = coords.x - s;
      let y1 = coords.y + s;
      let x2 = coords.x + s;
      let y2 = coords.y - s;
      if (lm.orientation === '\\') {
        x1 = coords.x - s;
        y1 = coords.y - s;
        x2 = coords.x + s;
        y2 = coords.y + s;
      }

      // Glass plate backing
      g.lineStyle(5, isReal ? 0x111111 : 0xffffff, 0.95);
      g.lineBetween(x1, y1, x2, y2);

      // Reflective optical dielectric coat
      g.lineStyle(3, mirrorCol, 0.95);
      g.lineBetween(x1, y1, x2, y2);

      // Specular glint core
      g.lineStyle(1.5, 0xffffff, 0.9);
      g.lineBetween(coords.x - s * 0.3, coords.y - (lm.orientation === '/' ? -s * 0.3 : s * 0.3), coords.x + s * 0.3, coords.y - (lm.orientation === '/' ? s * 0.3 : -s * 0.3));

      // Center pivot bolt
      g.fillStyle(col, 1);
      g.fillCircle(coords.x, coords.y, 4);
    }
  }

  // --- 12. Laser Emitters ---
  private renderLaserEmitters(g: Phaser.GameObjects.Graphics, session: BuiltLevelSession, getScreenCoords: ScreenCoordFn): void {
    for (const emitter of session.puzzleManager.getAllLaserEmitters()) {
      const isReal = emitter.world === 'real';
      const coords = getScreenCoords(emitter.position, isReal);
      const r = this.cellSize * 0.34;
      const col = isReal ? PALETTE.real.character : PALETTE.shadow.character;
      const accentCol = 0x00e5ff;

      // Heavy projector housing
      g.fillStyle(isReal ? 0x222222 : 0xdddddd, 1);
      g.fillCircle(coords.x, coords.y, r);
      g.lineStyle(2, col, 0.95);
      g.strokeCircle(coords.x, coords.y, r);

      // Directional barrel nozzle
      const nozzleLen = this.cellSize * 0.42;
      let nx = coords.x;
      let ny = coords.y;
      switch (emitter.direction) {
        case 'up': ny -= nozzleLen; break;
        case 'down': ny += nozzleLen; break;
        case 'left': nx -= nozzleLen; break;
        case 'right': nx += nozzleLen; break;
      }

      g.lineStyle(4, col, 1);
      g.lineBetween(coords.x, coords.y, nx, ny);

      // Energized nozzle core
      g.lineStyle(2, emitter.isActive ? accentCol : 0x666666, 1);
      g.lineBetween(coords.x, coords.y, nx, ny);

      // Glowing emitter core
      g.fillStyle(emitter.isActive ? accentCol : col, 1);
      g.fillCircle(coords.x, coords.y, r * 0.4);
    }
  }

  // --- 13. Active Laser Beams ---
  private renderLaserBeams(g: Phaser.GameObjects.Graphics, session: BuiltLevelSession, getScreenCoords: ScreenCoordFn): void {
    const laserSim = session.puzzleManager.simulateLasers(
      session.player.position,
      session.shadow.position
    );

    const jx = this.vfx.laserJitterX;
    const jy = this.vfx.laserJitterY;

    for (const seg of laserSim.beamSegments) {
      const isReal = seg.world === 'real';
      const fromCoords = getScreenCoords(seg.from, isReal);
      const toCoords = getScreenCoords(seg.to, isReal);

      const fX = fromCoords.x + jx;
      const fY = fromCoords.y + jy;
      const tX = toCoords.x + jx;
      const tY = toCoords.y + jy;

      // Layer 1: Atmospheric ionization sheath (broad soft glow)
      g.lineStyle(6, 0x00e5ff, 0.28);
      g.lineBetween(fX, fY, tX, tY);

      // Layer 2: Energetic core sheath (vivid cyan)
      g.lineStyle(3, 0x00e5ff, 0.75);
      g.lineBetween(fX, fY, tX, tY);

      // Layer 3: Pure high-voltage white filament core
      g.lineStyle(1.5, 0xffffff, 1);
      g.lineBetween(fX, fY, tX, tY);

      // Terminal impact focal hotspot & spark splatters
      g.fillStyle(0x00e5ff, 0.85);
      g.fillCircle(tX, tY, 4);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(tX, tY, 2);

      // Spark bursts on impact
      if (Math.random() < 0.2) {
        this.vfx.spawnSparkBurst(tX, tY, 3, 0x00e5ff);
      }
    }
  }

  // --- 14. Time Locks ---
  private renderTimeLocks(g: Phaser.GameObjects.Graphics, session: BuiltLevelSession, getScreenCoords: ScreenCoordFn): void {
    for (const tl of session.puzzleManager.getAllTimeLocks()) {
      const isReal = tl.world === 'real';
      const coords = getScreenCoords(tl.position, isReal);
      const r = this.cellSize * 0.38;
      const col = isReal ? PALETTE.real.character : PALETTE.shadow.character;
      const temporalCol = 0x00e5ff;

      // Outer astronomical gear bezel
      g.lineStyle(2, col, 0.9);
      g.strokeCircle(coords.x, coords.y, r);

      // Gear teeth
      const teeth = 8;
      for (let i = 0; i < teeth; i++) {
        const a = (i * Math.PI * 2) / teeth;
        const x1 = coords.x + Math.cos(a) * (r * 0.9);
        const y1 = coords.y + Math.sin(a) * (r * 0.9);
        const x2 = coords.x + Math.cos(a) * (r * 1.15);
        const y2 = coords.y + Math.sin(a) * (r * 1.15);
        g.lineStyle(1.5, col, 0.5);
        g.lineBetween(x1, y1, x2, y2);
      }

      if (tl.isActive) {
        // Temporal freeze field dome
        g.fillStyle(temporalCol, 0.2);
        g.fillCircle(coords.x, coords.y, r * 1.3);
        g.lineStyle(1.5, temporalCol, 0.6);
        g.strokeCircle(coords.x, coords.y, r * 1.3);

        // Sweeping luminous second hand
        const handAngle = this.vfx.timeLockPhase;
        const hx = coords.x + Math.cos(handAngle) * (r * 0.75);
        const hy = coords.y + Math.sin(handAngle) * (r * 0.75);

        g.lineStyle(2, temporalCol, 1);
        g.lineBetween(coords.x, coords.y, hx, hy);
        g.fillStyle(0xffffff, 1);
        g.fillCircle(hx, hy, 2.5);
      } else {
        // Inactive static clock hands
        g.lineStyle(1.5, col, 0.4);
        g.lineBetween(coords.x, coords.y, coords.x, coords.y - r * 0.65);
        g.lineBetween(coords.x, coords.y, coords.x + r * 0.45, coords.y);
      }

      // Center pivot
      g.fillStyle(col, 1);
      g.fillCircle(coords.x, coords.y, 3);
    }
  }

  // --- 15. Movable Blocks ---
  private renderMovableBlocks(g: Phaser.GameObjects.Graphics, session: BuiltLevelSession, getScreenCoords: ScreenCoordFn): void {
    for (const mb of session.puzzleManager.getAllMovableBlocks()) {
      const isReal = mb.world === 'real';
      const coords = getScreenCoords(mb.position, isReal);
      const s = this.cellSize * 0.42;
      const fillCol = isReal ? 0x2b2b2b : 0xd2d2d2;
      const strokeCol = isReal ? 0xffffff : 0x111111;

      // Heavy magnetized crate body
      g.fillStyle(fillCol, 0.98);
      g.fillRoundedRect(coords.x - s, coords.y - s, s * 2, s * 2, 5);
      g.lineStyle(2, strokeCol, 0.95);
      g.strokeRoundedRect(coords.x - s, coords.y - s, s * 2, s * 2, 5);

      // Reinforced steel corner brackets
      const bSz = s * 0.35;
      g.fillStyle(isReal ? 0x444444 : 0x999999, 1);
      g.fillRect(coords.x - s, coords.y - s, bSz, bSz);
      g.fillRect(coords.x + s - bSz, coords.y - s, bSz, bSz);
      g.fillRect(coords.x - s, coords.y + s - bSz, bSz, bSz);
      g.fillRect(coords.x + s - bSz, coords.y + s - bSz, bSz, bSz);

      // Central magnetic polarity core emblem
      g.lineStyle(2, isReal ? 0x00e5ff : 0xff3366, 1);
      g.strokeRect(coords.x - s * 0.35, coords.y - s * 0.35, s * 0.7, s * 0.7);
    }
  }

  // --- 16. Magnetic Fields ---
  private renderMagneticFields(g: Phaser.GameObjects.Graphics, session: BuiltLevelSession, getScreenCoords: ScreenCoordFn): void {
    for (const mf of session.puzzleManager.getAllMagneticFields()) {
      if (!mf.isActive) continue;
      const isReal = mf.world === 'real';
      const coords = getScreenCoords(mf.position, isReal);
      const s = this.cellSize * 0.38;
      const isAttract = mf.polarity === 'ATTRACT';
      const col = isAttract ? 0x00e5ff : 0xff9900;

      // Emitter dish base
      g.lineStyle(2, col, 0.95);
      g.strokeCircle(coords.x, coords.y, s);

      // Pulsing concentric magnetic wave arcs
      const pulse = (Math.sin(this.vfx.magneticPulsePhase) + 1) * 0.5;
      const r1 = s * (0.5 + pulse * 0.5);
      const r2 = s * (0.8 + (1 - pulse) * 0.5);

      g.lineStyle(1.5, col, 0.3 + pulse * 0.5);
      g.strokeCircle(coords.x, coords.y, r1);

      g.lineStyle(1, col, 0.2 + (1 - pulse) * 0.4);
      g.strokeCircle(coords.x, coords.y, r2);

      // Core emitter node
      g.fillStyle(col, 0.8);
      g.fillCircle(coords.x, coords.y, s * 0.25);
    }
  }
}
