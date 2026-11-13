import Phaser from 'phaser';
import { ANIMATION, PALETTE } from '../core/constants';
import { Header } from '../ui/Header';
import { ControlsGuide } from '../ui/ControlsGuide';
import { TouchControls } from '../ui/TouchControls';
import { PauseModal } from '../ui/PauseModal';
import { WinModal } from '../ui/WinModal';
import { GridPoint } from '../grid/GridPosition';
import { LevelDefinition } from '../types/level';
import { ALL_LEVELS } from '../levels/levelsData';
import { LevelFactory, BuiltLevelSession } from '../levels/LevelFactory';
import { MoveDirection, MovementTransactionResult } from '../engine/MovementEngine';
import { InputController } from '../systems/InputController';
import { StorageManager } from '../storage/StorageManager';
import { SoundEffects } from '../audio/SoundEffects';
import { pokiBridge } from '../poki/PokiIntegration';

export class GameScene extends Phaser.Scene {
  private levelId: number = 1;
  private levelDef!: LevelDefinition;
  private session!: BuiltLevelSession;

  private storage!: StorageManager;
  private soundEffects!: SoundEffects;
  private movesCount: number = 0;

  // UI Components
  private header!: Header;
  private touchControls!: TouchControls;
  private pauseModal!: PauseModal;
  private winModal!: WinModal;
  private inputController!: InputController;

  // Grid layout metrics
  private cellSize: number = 64;
  private realOriginX: number = 0;
  private realOriginY: number = 0;
  private shadowOriginX: number = 0;
  private shadowOriginY: number = 0;

  // Visual sprites and graphics
  private realSprite!: Phaser.GameObjects.Sprite;
  private shadowSprite!: Phaser.GameObjects.Sprite;
  private dynamicPuzzleGraphics!: Phaser.GameObjects.Graphics;
  private bombLabels: Map<string, Phaser.GameObjects.Text> = new Map();

  constructor() {
    super('GameScene');
  }

  public init(data?: { levelId?: number }): void {
    this.levelId = data?.levelId ?? 1;
    this.levelDef = ALL_LEVELS.find((l) => l.id === this.levelId) ?? ALL_LEVELS[0];
    this.movesCount = 0;

    this.storage = new StorageManager();
    const progress = this.storage.getProgress();
    this.soundEffects = new SoundEffects(progress.muted);
  }

  public create(): void {
    pokiBridge.gameplayStart();

    const { width, height } = this.scale;
    const halfWidth = width / 2;

    // 1. World Backgrounds
    const bg = this.add.graphics();
    bg.fillStyle(PALETTE.real.background, 1);
    bg.fillRect(0, 0, halfWidth, height);

    bg.fillStyle(PALETTE.shadow.background, 1);
    bg.fillRect(halfWidth, 0, halfWidth, height);

    // Center Divider
    bg.lineStyle(1, PALETTE.divider, 0.7);
    bg.lineBetween(halfWidth, 0, halfWidth, height);

    // 2. Initialize Game Engine Session
    this.initializeSession();

    // 3. Layout Grid
    this.calculateGridLayout(width, height);

    // 4. Render Static Grids (Floors, Walls, Exits, Hazards)
    this.renderStaticGrids();

    // 5. Dynamic Puzzle Graphics (Doors, Switches, Plates, Checkpoints)
    this.dynamicPuzzleGraphics = this.add.graphics();
    this.renderDynamicPuzzleElements();

    // 6. Characters
    this.createCharacters();

    // 7. Header
    this.header = new Header(
      this,
      width,
      {
        chapter: this.levelDef.chapter,
        levelNumber: this.levelDef.id,
        totalLevels: ALL_LEVELS.length,
        levelName: this.levelDef.name,
        moves: this.movesCount,
      },
      {
        onPause: () => this.togglePause(),
        onRestart: () => this.restartLevel(),
      }
    );

    // 8. Controls Guide
    new ControlsGuide(this, width, height);

    // 9. Touch Controls
    this.touchControls = new TouchControls(this, width, height, {
      onDirection: (dir: MoveDirection) => this.handleDirectionInput(dir),
      onPause: () => this.togglePause(),
      onRestart: () => this.restartLevel(),
    });

    // 10. Modals
    this.pauseModal = new PauseModal(this, width, height, {
      onResume: () => this.togglePause(),
      onRestart: () => {
        this.pauseModal.hide();
        this.restartLevel();
      },
      onMainMenu: () => {
        pokiBridge.gameplayStop();
        this.scene.start('MenuScene', { openLevelSelect: true });
      },
    });

    this.winModal = new WinModal(this, width, height, {
      onNextLevel: () => this.goToNextLevel(),
      onLevelSelect: () => {
        pokiBridge.gameplayStop();
        this.scene.start('MenuScene', { openLevelSelect: true });
      },
      onRestart: () => {
        this.winModal.hide();
        this.restartLevel();
      },
    });

    // 11. Hardware Keyboard Controller
    this.setupInput();

    // 12. Lifecycle Cleanup Handlers to prevent memory leaks or duplicate listeners
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);
    this.events.once(Phaser.Scenes.Events.DESTROY, this.shutdown, this);
  }

  private initializeSession(): void {
    this.session = LevelFactory.build(this.levelDef, {
      onMoveCommitted: (result: MovementTransactionResult) => this.onMoveCommitted(result),
      onMoveBlocked: () => this.onMoveBlocked(),
      onLevelComplete: () => this.onLevelComplete(),
      onDeath: () => this.onDeath(),
      onRespawn: () => this.onRespawn(),
      onCheckpointActivated: () => {
        this.soundEffects.play('checkpoint');
        this.renderDynamicPuzzleElements();
      },
      onCancelAnimation: () => this.tweens.killAll(),
      onRestart: () => this.onRespawn(),
    });
  }

  private calculateGridLayout(width: number, height: number): void {
    const cols = this.levelDef.width;
    const rows = this.levelDef.height;

    const topPadding = 80;
    const bottomPadding = 90;
    const playAreaH = height - topPadding - bottomPadding;
    const maxWorldW = width / 2 - 40;

    const maxCellW = Math.floor(maxWorldW / cols);
    const maxCellH = Math.floor(playAreaH / rows);
    this.cellSize = Math.min(64, Math.max(38, Math.min(maxCellW, maxCellH)));

    const totalGridW = cols * this.cellSize;
    const totalGridH = rows * this.cellSize;

    this.realOriginX = Math.floor(width / 4 - totalGridW / 2);
    this.realOriginY = Math.floor(topPadding + (playAreaH - totalGridH) / 2);

    this.shadowOriginX = Math.floor((3 * width) / 4 - totalGridW / 2);
    this.shadowOriginY = this.realOriginY;
  }

  private getScreenCoordinates(gridPos: GridPoint, isReal: boolean): { x: number; y: number } {
    const originX = isReal ? this.realOriginX : this.shadowOriginX;
    const originY = isReal ? this.realOriginY : this.shadowOriginY;
    return {
      x: originX + gridPos.x * this.cellSize + this.cellSize / 2,
      y: originY + gridPos.y * this.cellSize + this.cellSize / 2,
    };
  }

  private renderStaticGrids(): void {
    const g = this.add.graphics();
    const cols = this.levelDef.width;
    const rows = this.levelDef.height;

    const rWalls = new Set(this.levelDef.realWalls.map((w) => GridPoint.from(w).toKey()));
    const sWalls = new Set(this.levelDef.shadowWalls.map((w) => GridPoint.from(w).toKey()));

    // 1. Real World Floor & Walls
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const x = this.realOriginX + c * this.cellSize;
        const y = this.realOriginY + r * this.cellSize;
        const key = `${c},${r}`;

        if (rWalls.has(key)) {
          g.fillStyle(PALETTE.real.walls, 1);
          g.fillRect(x, y, this.cellSize, this.cellSize);
        } else {
          g.fillStyle(PALETTE.real.floor, 1);
          g.fillRect(x + 1, y + 1, this.cellSize - 2, this.cellSize - 2);
        }
      }
    }

    // 2. Shadow World Floor & Walls
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const x = this.shadowOriginX + c * this.cellSize;
        const y = this.shadowOriginY + r * this.cellSize;
        const key = `${c},${r}`;

        if (sWalls.has(key)) {
          g.fillStyle(PALETTE.shadow.walls, 1);
          g.fillRect(x, y, this.cellSize, this.cellSize);
        } else {
          g.fillStyle(PALETTE.shadow.floor, 1);
          g.fillRect(x + 1, y + 1, this.cellSize - 2, this.cellSize - 2);
        }
      }
    }

    // 3. Exits
    this.renderExit(g, GridPoint.from(this.levelDef.realExit), true);
    this.renderExit(g, GridPoint.from(this.levelDef.shadowExit), false);

    // 4. Hazards
    for (const hz of this.levelDef.hazards ?? []) {
      const isReal = hz.world === 'real';
      const coords = this.getScreenCoordinates(GridPoint.from(hz.position), isReal);
      const color = isReal ? 0x171717 : 0xffffff;

      g.lineStyle(2, color, 0.85);
      const sz = this.cellSize * 0.45;
      // Cross / Hazard Marker
      g.lineBetween(coords.x - sz, coords.y - sz, coords.x + sz, coords.y + sz);
      g.lineBetween(coords.x - sz, coords.y + sz, coords.x + sz, coords.y - sz);
    }
  }

  private renderExit(g: Phaser.GameObjects.Graphics, pos: GridPoint, isReal: boolean): void {
    const coords = this.getScreenCoordinates(pos, isReal);
    const color = isReal ? PALETTE.real.character : PALETTE.shadow.character;

    g.lineStyle(2, color, 0.9);
    const s = this.cellSize * 0.65;
    g.strokeRect(coords.x - s / 2, coords.y - s / 2, s, s);

    const innerS = this.cellSize * 0.35;
    g.lineStyle(1.5, color, 0.5);
    g.strokeRect(coords.x - innerS / 2, coords.y - innerS / 2, innerS, innerS);
  }

  private renderDynamicPuzzleElements(): void {
    const g = this.dynamicPuzzleGraphics;
    g.clear();

    // 1. Checkpoints
    for (const cp of this.session.checkpoints) {
      const rCoords = this.getScreenCoordinates(cp.realPosition, true);
      const sCoords = this.getScreenCoordinates(cp.shadowPosition, false);

      const rActive = cp.isRealVisited || cp.isActivated;
      const sActive = cp.isShadowVisited || cp.isActivated;

      // Real checkpoint circle
      g.lineStyle(2, PALETTE.real.walls, 0.8);
      g.strokeCircle(rCoords.x, rCoords.y, this.cellSize * 0.3);
      if (rActive) {
        g.fillStyle(PALETTE.real.character, 1);
        g.fillCircle(rCoords.x, rCoords.y, this.cellSize * 0.18);
      }

      // Shadow checkpoint circle
      g.lineStyle(2, PALETTE.shadow.walls, 0.8);
      g.strokeCircle(sCoords.x, sCoords.y, this.cellSize * 0.3);
      if (sActive) {
        g.fillStyle(PALETTE.shadow.character, 1);
        g.fillCircle(sCoords.x, sCoords.y, this.cellSize * 0.18);
      }
    }

    // 2. Pressure Plates
    for (const plate of this.session.puzzleManager.getAllPressurePlates()) {
      const isReal = plate.world === 'real';
      const coords = this.getScreenCoordinates(plate.position, isReal);
      const size = this.cellSize * 0.5;

      const strokeCol = isReal ? PALETTE.real.walls : PALETTE.shadow.walls;
      const fillCol = isReal ? 0xcccccc : 0x444444;

      g.lineStyle(1.5, strokeCol, 0.9);
      g.strokeRoundedRect(coords.x - size / 2, coords.y - size / 2, size, size, 4);

      if (plate.isPressed) {
        g.fillStyle(fillCol, 1);
        g.fillRoundedRect(coords.x - size / 2 + 3, coords.y - size / 2 + 3, size - 6, size - 6, 2);
      }
    }

    // 3. Switches
    for (const sw of this.session.puzzleManager.getAllSwitches()) {
      const isReal = sw.world === 'real';
      const coords = this.getScreenCoordinates(sw.position, isReal);
      const r = this.cellSize * 0.22;

      const strokeCol = isReal ? PALETTE.real.walls : PALETTE.shadow.walls;
      const activeCol = isReal ? PALETTE.real.character : PALETTE.shadow.character;

      g.lineStyle(2, strokeCol, 0.9);
      g.strokeCircle(coords.x, coords.y, r);

      if (sw.isActive) {
        g.fillStyle(activeCol, 1);
        g.fillCircle(coords.x, coords.y, r * 0.6);
      }
    }

    // 4. Doors
    for (const door of this.session.puzzleManager.getAllDoors()) {
      const isReal = door.world === 'real';
      const coords = this.getScreenCoordinates(door.position, isReal);
      const size = this.cellSize * 0.8;

      const strokeCol = isReal ? PALETTE.real.walls : PALETTE.shadow.walls;
      const fillCol = isReal ? 0x222222 : 0xdddddd;

      if (!door.isOpen) {
        // Closed door: solid gate bar
        g.fillStyle(fillCol, 0.95);
        g.fillRoundedRect(coords.x - size / 2, coords.y - size / 2, size, size, 4);
        g.lineStyle(2, strokeCol, 1);
        g.strokeRoundedRect(coords.x - size / 2, coords.y - size / 2, size, size, 4);
      } else {
        // Open door: dashed/retracted outline
        g.lineStyle(1.5, strokeCol, 0.35);
        g.strokeRoundedRect(coords.x - size / 2, coords.y - size / 2, size, size, 4);
      }
    }

    // 5. Destructible Walls
    for (const dw of this.session.puzzleManager.getAllDestructibleWalls()) {
      if (!dw.isDestroyed) {
        const isReal = dw.world === 'real';
        const coords = this.getScreenCoordinates(dw.position, isReal);
        const size = this.cellSize * 0.88;
        const fillCol = isReal ? 0x222222 : 0xdddddd;
        const strokeCol = isReal ? PALETTE.real.walls : PALETTE.shadow.walls;

        g.fillStyle(fillCol, 1);
        g.fillRect(coords.x - size / 2, coords.y - size / 2, size, size);

        // Cracked / segmented texture pattern
        g.lineStyle(1.5, strokeCol, 0.7);
        g.strokeRect(coords.x - size / 2, coords.y - size / 2, size, size);
        g.lineBetween(coords.x - size / 2, coords.y, coords.x + size / 2, coords.y);
        g.lineBetween(coords.x, coords.y - size / 2, coords.x, coords.y + size / 2);
      }
    }

    // 6. Bombs
    for (const b of this.session.puzzleManager.getAllBombs()) {
      const isReal = b.world === 'real';
      const coords = this.getScreenCoordinates(b.position, isReal);
      const r = this.cellSize * 0.32;

      if (!b.isDetonated) {
        // Blast radius danger zone visualization if bomb is active
        if (b.isActive) {
          const blastCoords = b.getBlastCoordinates();
          for (const blastPt of blastCoords) {
            const blastScreen = this.getScreenCoordinates(blastPt, isReal);
            const halfCell = this.cellSize * 0.44;
            g.lineStyle(1.5, isReal ? 0x000000 : 0xffffff, 0.35);
            g.strokeRect(blastScreen.x - halfCell, blastScreen.y - halfCell, halfCell * 2, halfCell * 2);
          }
        }

        // Bomb body
        const bombColor = isReal ? 0x111111 : 0xffffff;
        const innerColor = isReal ? 0xffffff : 0x111111;
        g.fillStyle(bombColor, 1);
        g.fillCircle(coords.x, coords.y, r);
        g.lineStyle(2, innerColor, 0.9);
        g.strokeCircle(coords.x, coords.y, r);

        // Countdown text label
        let label = this.bombLabels.get(b.id);
        if (!label) {
          label = this.add.text(coords.x, coords.y, '', {
            fontFamily: 'system-ui, monospace',
            fontSize: '15px',
            fontStyle: 'bold',
            color: isReal ? '#FFFFFF' : '#000000',
          }).setOrigin(0.5).setDepth(15);
          this.bombLabels.set(b.id, label);
        }
        label.setPosition(coords.x, coords.y);
        label.setText(b.isActive ? String(b.countdown) : String(b.initialTimer));
        label.setVisible(true);
      } else {
        const label = this.bombLabels.get(b.id);
        if (label) {
          label.setVisible(false);
        }
      }
    }

    // 7. Portals
    for (const p of this.session.puzzleManager.getAllPortals()) {
      if (p.isActive) {
        const isReal = p.world === 'real';
        const coords = this.getScreenCoordinates(p.position, isReal);
        const r = this.cellSize * 0.3;
        const col = isReal ? PALETTE.real.character : PALETTE.shadow.character;

        if (p.isCorrupted) {
          g.lineStyle(2.5, col, 0.95);
          g.strokeCircle(coords.x, coords.y, r);
          g.lineStyle(1.5, col, 0.7);
          g.strokeRect(coords.x - r * 0.4, coords.y - r * 0.4, r * 0.8, r * 0.8);
          g.fillStyle(col, 0.8);
          g.fillCircle(coords.x, coords.y, r * 0.2);
        } else {
          g.lineStyle(2, col, 0.85);
          g.strokeCircle(coords.x, coords.y, r);
          g.lineStyle(1.5, col, 0.5);
          g.strokeCircle(coords.x, coords.y, r * 0.6);
        }
      }
    }

    // 8. Collapsing Floors
    for (const cf of this.session.puzzleManager.getAllCollapsingFloors()) {
      const isReal = cf.world === 'real';
      const coords = this.getScreenCoordinates(cf.position, isReal);
      const s = this.cellSize * 0.45;
      const col = isReal ? PALETTE.real.character : PALETTE.shadow.character;

      if (cf.floorState === 'COLLAPSED') {
        // Pit / Void
        g.fillStyle(isReal ? 0x222222 : 0xdddddd, 0.85);
        g.fillRect(coords.x - s, coords.y - s, s * 2, s * 2);
        g.lineStyle(1.5, col, 0.5);
        g.strokeRect(coords.x - s, coords.y - s, s * 2, s * 2);
      } else if (cf.floorState === 'CRACKED') {
        // Warning fractured pattern
        g.lineStyle(1.5, col, 0.7);
        g.beginPath();
        g.moveTo(coords.x - s * 0.8, coords.y - s * 0.6);
        g.lineTo(coords.x, coords.y);
        g.lineTo(coords.x + s * 0.7, coords.y - s * 0.7);
        g.moveTo(coords.x, coords.y);
        g.lineTo(coords.x - s * 0.5, coords.y + s * 0.7);
        g.moveTo(coords.x, coords.y);
        g.lineTo(coords.x + s * 0.8, coords.y + s * 0.5);
        g.strokePath();
      } else {
        // Intact subtle corner markers
        g.lineStyle(1, col, 0.25);
        g.strokeRect(coords.x - s * 0.7, coords.y - s * 0.7, s * 1.4, s * 1.4);
      }
    }

    // 9. Moving Saw Blades
    for (const saw of this.session.puzzleManager.getAllMovingHazards()) {
      const isReal = saw.world === 'real';
      const coords = this.getScreenCoordinates(saw.position, isReal);
      const r = this.cellSize * 0.32;
      const col = isReal ? PALETTE.real.character : PALETTE.shadow.character;

      // Saw outer disk
      g.lineStyle(2, col, 0.9);
      g.strokeCircle(coords.x, coords.y, r);

      // Radial saw blade teeth
      const teeth = 6;
      for (let i = 0; i < teeth; i++) {
        const angle = (i * Math.PI * 2) / teeth;
        const x1 = coords.x + Math.cos(angle) * (r * 0.7);
        const y1 = coords.y + Math.sin(angle) * (r * 0.7);
        const x2 = coords.x + Math.cos(angle) * (r * 1.15);
        const y2 = coords.y + Math.sin(angle) * (r * 1.15);
        g.lineStyle(1.5, col, 0.75);
        g.beginPath();
        g.moveTo(x1, y1);
        g.lineTo(x2, y2);
        g.strokePath();
      }

      // Center bolt
      g.fillStyle(col, 0.9);
      g.fillCircle(coords.x, coords.y, r * 0.25);
    }

    // 10. Laser Receivers
    for (const rx of this.session.puzzleManager.getAllLaserReceivers()) {
      const isReal = rx.world === 'real';
      const coords = this.getScreenCoordinates(rx.position, isReal);
      const s = this.cellSize * 0.35;
      const col = isReal ? PALETTE.real.character : PALETTE.shadow.character;

      g.lineStyle(2, col, 0.85);
      g.strokeRect(coords.x - s, coords.y - s, s * 2, s * 2);

      if (rx.isPowered) {
        // Glowing energized core
        g.fillStyle(0x00ffff, 0.9);
        g.fillCircle(coords.x, coords.y, s * 0.7);
        g.lineStyle(3, 0x00ffff, 0.5);
        g.strokeCircle(coords.x, coords.y, s * 1.1);
      } else {
        g.fillStyle(col, 0.3);
        g.fillCircle(coords.x, coords.y, s * 0.4);
      }
    }

    // 11. Laser Mirrors
    for (const lm of this.session.puzzleManager.getAllLaserMirrors()) {
      const isReal = lm.world === 'real';
      const coords = this.getScreenCoordinates(lm.position, isReal);
      const s = this.cellSize * 0.35;
      const col = isReal ? PALETTE.real.character : PALETTE.shadow.character;

      // Base mount circle
      g.lineStyle(1.5, col, 0.4);
      g.strokeCircle(coords.x, coords.y, s * 0.8);

      // Angled reflector glass plate
      g.lineStyle(3, 0x00e5ff, 0.95);
      g.beginPath();
      if (lm.orientation === '/') {
        g.moveTo(coords.x - s, coords.y + s);
        g.lineTo(coords.x + s, coords.y - s);
      } else {
        // '\'
        g.moveTo(coords.x - s, coords.y - s);
        g.lineTo(coords.x + s, coords.y + s);
      }
      g.strokePath();

      // Mirror center pivot
      g.fillStyle(col, 1);
      g.fillCircle(coords.x, coords.y, s * 0.2);
    }

    // 12. Laser Emitters
    for (const emitter of this.session.puzzleManager.getAllLaserEmitters()) {
      const isReal = emitter.world === 'real';
      const coords = this.getScreenCoordinates(emitter.position, isReal);
      const r = this.cellSize * 0.3;
      const col = isReal ? PALETTE.real.character : PALETTE.shadow.character;

      g.fillStyle(col, 1);
      g.fillCircle(coords.x, coords.y, r);

      // Emitter nozzle pointing in direction
      const nozzleLen = this.cellSize * 0.38;
      let nx = coords.x;
      let ny = coords.y;
      switch (emitter.direction) {
        case 'up': ny -= nozzleLen; break;
        case 'down': ny += nozzleLen; break;
        case 'left': nx -= nozzleLen; break;
        case 'right': nx += nozzleLen; break;
      }
      g.lineStyle(3, 0x00ffff, emitter.isActive ? 1 : 0.2);
      g.lineBetween(coords.x, coords.y, nx, ny);
    }

    // 13. Active Laser Beams
    const laserSim = this.session.puzzleManager.simulateLasers(
      this.session.player.position,
      this.session.shadow.position
    );

    for (const seg of laserSim.beamSegments) {
      const isReal = seg.world === 'real';
      const fromCoords = this.getScreenCoordinates(seg.from, isReal);
      const toCoords = this.getScreenCoordinates(seg.to, isReal);

      // Outer glow
      g.lineStyle(4, 0x00e5ff, 0.35);
      g.lineBetween(fromCoords.x, fromCoords.y, toCoords.x, toCoords.y);

      // Core energetic beam
      g.lineStyle(2, 0xffffff, 0.95);
      g.lineBetween(fromCoords.x, fromCoords.y, toCoords.x, toCoords.y);
    }

    // 14. Time Locks
    for (const tl of this.session.puzzleManager.getAllTimeLocks()) {
      const isReal = tl.world === 'real';
      const coords = this.getScreenCoordinates(tl.position, isReal);
      const s = this.cellSize * 0.38;
      const col = isReal ? PALETTE.real.character : PALETTE.shadow.character;

      // Outer chronometer frame
      g.lineStyle(2, col, 0.9);
      g.strokeCircle(coords.x, coords.y, s);

      // Hourglass / clock tick marks
      g.lineStyle(1.5, tl.isActive ? 0x00e5ff : col, tl.isActive ? 1 : 0.4);
      g.beginPath();
      g.moveTo(coords.x, coords.y - s * 0.7);
      g.lineTo(coords.x, coords.y);
      g.lineTo(coords.x + s * 0.5, coords.y);
      g.strokePath();

      if (tl.isActive) {
        g.fillStyle(0x00e5ff, 0.25);
        g.fillCircle(coords.x, coords.y, s);
      }
    }

    // 15. Movable Blocks
    for (const mb of this.session.puzzleManager.getAllMovableBlocks()) {
      const isReal = mb.world === 'real';
      const coords = this.getScreenCoordinates(mb.position, isReal);
      const s = this.cellSize * 0.4;
      const fillCol = isReal ? 0x333333 : 0xcccccc;
      const strokeCol = isReal ? 0xffffff : 0x000000;

      g.fillStyle(fillCol, 0.95);
      g.fillRoundedRect(coords.x - s, coords.y - s, s * 2, s * 2, 4);
      g.lineStyle(2, strokeCol, 0.9);
      g.strokeRoundedRect(coords.x - s, coords.y - s, s * 2, s * 2, 4);

      // Core magnetic polarity emblem
      g.lineStyle(2, isReal ? 0x00ffff : 0xff3366, 1);
      g.strokeRect(coords.x - s * 0.4, coords.y - s * 0.4, s * 0.8, s * 0.8);
    }

    // 16. Magnetic Fields
    for (const mf of this.session.puzzleManager.getAllMagneticFields()) {
      if (!mf.isActive) continue;
      const isReal = mf.world === 'real';
      const coords = this.getScreenCoordinates(mf.position, isReal);
      const s = this.cellSize * 0.35;
      const col = mf.polarity === 'ATTRACT' ? 0x00e5ff : 0xff9900;

      // Magnetic emitter dish
      g.lineStyle(2, col, 0.9);
      g.strokeCircle(coords.x, coords.y, s);
      g.fillStyle(col, 0.3);
      g.fillCircle(coords.x, coords.y, s * 0.6);
    }
  }

  private createCharacters(): void {
    const realCoords = this.getScreenCoordinates(this.session.player.position, true);
    const shadowCoords = this.getScreenCoordinates(this.session.shadow.position, false);

    this.realSprite = this.add.sprite(realCoords.x, realCoords.y, 'char_real');
    this.realSprite.setDisplaySize(this.cellSize * 0.75, this.cellSize * 0.75);
    this.realSprite.setDepth(10);

    this.shadowSprite = this.add.sprite(shadowCoords.x, shadowCoords.y, 'char_shadow');
    this.shadowSprite.setDisplaySize(this.cellSize * 0.75, this.cellSize * 0.75);
    this.shadowSprite.setDepth(10);
  }

  private setupInput(): void {
    this.inputController = new InputController({
      onDirection: (direction: MoveDirection) => this.handleDirectionInput(direction),
      onPause: () => this.togglePause(),
      onRestart: () => this.restartLevel(),
    });

    if (typeof window !== 'undefined') {
      this.inputController.attach(window);
    }

    // Pointer / Mouse click and swipe navigation
    let pointerStartX = 0;
    let pointerStartY = 0;
    let pointerDown = false;

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // Ignore clicks outside active play area (e.g. Header bar or bottom controls)
      if (pointer.y < 70 || pointer.y > this.scale.height - 40) return;
      pointerStartX = pointer.x;
      pointerStartY = pointer.y;
      pointerDown = true;
    });

    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (!pointerDown) return;
      pointerDown = false;

      const dx = pointer.x - pointerStartX;
      const dy = pointer.y - pointerStartY;
      const dragThreshold = 25;

      if (Math.abs(dx) > dragThreshold || Math.abs(dy) > dragThreshold) {
        // Drag / swipe gesture
        if (Math.abs(dx) > Math.abs(dy)) {
          this.handleDirectionInput(dx > 0 ? 'right' : 'left');
        } else {
          this.handleDirectionInput(dy > 0 ? 'down' : 'up');
        }
      } else {
        // Direct click relative to clicked character
        const isRealWorld = pointer.x < this.scale.width / 2;
        const targetEntity = isRealWorld ? this.session.player : this.session.shadow;
        const screenPos = this.getScreenCoordinates(targetEntity.position, isRealWorld);

        const relX = pointer.x - screenPos.x;
        const relY = pointer.y - screenPos.y;

        if (Math.abs(relX) > 15 || Math.abs(relY) > 15) {
          if (Math.abs(relX) > Math.abs(relY)) {
            const clickRight = relX > 0;
            if (isRealWorld) {
              this.handleDirectionInput(clickRight ? 'right' : 'left');
            } else {
              // Clicking right of shadow asks shadow to move right, which is 'left' input
              this.handleDirectionInput(clickRight ? 'left' : 'right');
            }
          } else {
            this.handleDirectionInput(relY > 0 ? 'down' : 'up');
          }
        }
      }
    });
  }

  private handleDirectionInput(direction: MoveDirection): void {
    if (this.session.turnEngine.state !== 'PLAYING') return;
    this.session.turnEngine.handleInput(direction);
  }

  private onMoveCommitted(result: MovementTransactionResult): void {
    this.movesCount++;
    this.header.updateMoves(this.movesCount);

    const isReduced = this.storage.getProgress().reducedMotion;
    const duration = isReduced ? 1 : ANIMATION.MOVE_DURATION;

    const realCoords = this.getScreenCoordinates(result.playerNewPosition, true);
    const shadowCoords = this.getScreenCoordinates(result.shadowNewPosition, false);

    // Audio step
    this.soundEffects.play('step');

    let completedTweens = 0;
    const onTweenComplete = () => {
      completedTweens++;
      if (completedTweens === 2) {
        // Step 10: Animation complete -> release turn engine lock
        this.session.turnEngine.endAnimation();
        this.renderDynamicPuzzleElements();
      }
    };

    if (result.playerMoved) {
      this.tweens.add({
        targets: this.realSprite,
        x: realCoords.x,
        y: realCoords.y,
        duration,
        ease: ANIMATION.EASE,
        onComplete: onTweenComplete,
      });
    } else {
      onTweenComplete();
    }

    if (result.shadowMoved) {
      this.tweens.add({
        targets: this.shadowSprite,
        x: shadowCoords.x,
        y: shadowCoords.y,
        duration,
        ease: ANIMATION.EASE,
        onComplete: onTweenComplete,
      });
    } else {
      onTweenComplete();
    }
  }

  private onMoveBlocked(): void {
    this.soundEffects.play('bump');
    if (!this.storage.getProgress().reducedMotion) {
      this.cameras.main.shake(40, 0.002);
    }
  }

  private onDeath(): void {
    this.soundEffects.play('death');
    if (!this.storage.getProgress().reducedMotion) {
      this.cameras.main.shake(80, 0.005);
    }
  }

  private onRespawn(): void {
    const realCoords = this.getScreenCoordinates(this.session.player.position, true);
    const shadowCoords = this.getScreenCoordinates(this.session.shadow.position, false);

    this.realSprite.setPosition(realCoords.x, realCoords.y);
    this.shadowSprite.setPosition(shadowCoords.x, shadowCoords.y);
    this.renderDynamicPuzzleElements();
  }

  private onLevelComplete(): void {
    this.soundEffects.play('win');
    pokiBridge.gameplayStop();

    // Record progress
    const updated = this.storage.recordLevelCompletion(this.levelId, this.movesCount);
    const best = updated.bestMoves[this.levelId] ?? this.movesCount;
    const isFinalLevel = this.levelId >= ALL_LEVELS.length;

    // Commercial break on chapter end (levels 4, 8, 12, 16, 20)
    if (this.levelId % 4 === 0) {
      pokiBridge.commercialBreak(
        () => this.soundEffects.setMuted(true),
        () => this.soundEffects.setMuted(this.storage.getProgress().muted)
      ).finally(() => {
        this.winModal.show(this.movesCount, best, isFinalLevel);
      });
    } else {
      this.winModal.show(this.movesCount, best, isFinalLevel);
    }
  }

  private goToNextLevel(): void {
    this.winModal.hide();
    if (this.levelId >= ALL_LEVELS.length) {
      // Completed all 20 levels! Transition to cinematic Ending Experience
      pokiBridge.gameplayStop();
      this.scene.start('EndingScene', {
        storage: this.storage,
        soundEffects: this.soundEffects,
      });
      return;
    }

    const nextId = this.levelId + 1;
    this.scene.restart({ levelId: nextId });
  }

  public restartLevel(): void {
    this.pauseModal.hide();
    this.winModal.hide();
    this.scene.restart({ levelId: this.levelId });
  }

  public togglePause(): void {
    if (this.session.turnEngine.state === 'COMPLETED') return;

    if (this.session.turnEngine.state === 'PLAYING') {
      this.session.turnEngine.pause();
      this.pauseModal.show();
      this.header.setPauseText('RESUME');
      pokiBridge.gameplayStop();
    } else {
      this.session.turnEngine.resume();
      this.pauseModal.hide();
      this.header.setPauseText('PAUSE');
      pokiBridge.gameplayStart();
    }
  }

  public getTouchControls(): TouchControls {
    return this.touchControls;
  }

  public shutdown(): void {
    pokiBridge.gameplayStop();
    if (this.inputController) {
      this.inputController.detach();
    }
    for (const label of this.bombLabels.values()) {
      label.destroy();
    }
    this.bombLabels.clear();
    this.tweens.killAll();
  }
}
