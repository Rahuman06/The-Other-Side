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
import { CharacterAnimator } from '../rendering/CharacterAnimator';
import { VisualEffectsManager } from '../rendering/VisualEffectsManager';
import { PuzzleObjectRenderer } from '../rendering/PuzzleObjectRenderer';

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

  // Visual Animation & Effects Systems
  private characterAnimator!: CharacterAnimator;
  private vfxManager!: VisualEffectsManager;
  private puzzleRenderer!: PuzzleObjectRenderer;
  private dynamicPuzzleGraphics!: Phaser.GameObjects.Graphics;
  private bombLabels: Map<string, Phaser.GameObjects.Text> = new Map();

  // State tracking
  private lastAttemptedDirection: MoveDirection = 'right';
  private knownDetonatedBombs: Set<string> = new Set();

  constructor() {
    super('GameScene');
  }

  public init(data?: { levelId?: number }): void {
    this.levelId = data?.levelId ?? 1;
    this.levelDef = ALL_LEVELS.find((l) => l.id === this.levelId) ?? ALL_LEVELS[0];
    this.movesCount = 0;
    this.knownDetonatedBombs.clear();

    this.storage = new StorageManager();
    const progress = this.storage.getProgress();
    this.soundEffects = new SoundEffects(progress.muted);
  }

  public create(): void {
    pokiBridge.gameplayStart();

    const { width, height } = this.scale;
    const halfWidth = width / 2;
    const isReduced = this.storage.getProgress().reducedMotion;

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

    // 4. Initialize Visual Effects & Procedural Animators
    this.vfxManager = new VisualEffectsManager(this, isReduced);
    this.puzzleRenderer = new PuzzleObjectRenderer(this.vfxManager, this.cellSize);
    this.characterAnimator = new CharacterAnimator(this, this.cellSize, isReduced);

    // 5. Render Static Grids (Floors, Walls, Exits, Static Hazards)
    this.renderStaticGrids();

    // 6. Dynamic Puzzle Graphics Layer
    this.dynamicPuzzleGraphics = this.add.graphics().setDepth(15);

    // 7. Initialize Characters Procedural Stickmen
    this.createCharacters();

    // 8. Header
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

    // 9. Controls Guide
    new ControlsGuide(this, width, height);

    // 10. Touch Controls
    this.touchControls = new TouchControls(this, width, height, {
      onDirection: (dir: MoveDirection) => this.handleDirectionInput(dir),
      onPause: () => this.togglePause(),
      onRestart: () => this.restartLevel(),
    });

    // 11. Modals
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

    // 12. Hardware Keyboard Controller
    this.setupInput();

    // 13. Lifecycle Cleanup Handlers
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);
    this.events.once(Phaser.Scenes.Events.DESTROY, this.shutdown, this);
  }

  public update(time: number, delta: number): void {
    if (this.vfxManager) {
      this.vfxManager.update(time, delta);
    }
    if (this.characterAnimator) {
      this.characterAnimator.update(time, delta);
    }
    if (this.puzzleRenderer && this.dynamicPuzzleGraphics && this.session) {
      this.puzzleRenderer.renderDynamicElements(
        this.dynamicPuzzleGraphics,
        this.session,
        (pos, isReal) => this.getScreenCoordinates(pos, isReal),
        this.bombLabels
      );
    }
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
        const rCoords = this.getScreenCoordinates(this.session.player.position, true);
        const sCoords = this.getScreenCoordinates(this.session.shadow.position, false);
        this.vfxManager.spawnSparkBurst(rCoords.x, rCoords.y, 10, 0x00e5ff);
        this.vfxManager.spawnSparkBurst(sCoords.x, sCoords.y, 10, 0x00e5ff);
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
    const g = this.add.graphics().setDepth(2);
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
          // Architectural masonry inner bevel
          g.lineStyle(1, 0x333333, 0.4);
          g.strokeRect(x + 1, y + 1, this.cellSize - 2, this.cellSize - 2);
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
          g.lineStyle(1, 0xdddddd, 0.4);
          g.strokeRect(x + 1, y + 1, this.cellSize - 2, this.cellSize - 2);
        } else {
          g.fillStyle(PALETTE.shadow.floor, 1);
          g.fillRect(x + 1, y + 1, this.cellSize - 2, this.cellSize - 2);
        }
      }
    }

    // 3. Exits (Rendered with architectural gateway styling)
    this.puzzleRenderer.renderExit(g, GridPoint.from(this.levelDef.realExit), true, (p, isR) => this.getScreenCoordinates(p, isR));
    this.puzzleRenderer.renderExit(g, GridPoint.from(this.levelDef.shadowExit), false, (p, isR) => this.getScreenCoordinates(p, isR));

    // 4. Static Hazards
    for (const hz of this.levelDef.hazards ?? []) {
      const isReal = hz.world === 'real';
      const coords = this.getScreenCoordinates(GridPoint.from(hz.position), isReal);
      const color = isReal ? 0x171717 : 0xffffff;

      g.lineStyle(2.5, color, 0.9);
      const sz = this.cellSize * 0.42;
      g.lineBetween(coords.x - sz, coords.y - sz, coords.x + sz, coords.y + sz);
      g.lineBetween(coords.x - sz, coords.y + sz, coords.x + sz, coords.y - sz);
      g.strokeRect(coords.x - sz * 0.8, coords.y - sz * 0.8, sz * 1.6, sz * 1.6);
    }
  }

  private createCharacters(): void {
    const realCoords = this.getScreenCoordinates(this.session.player.position, true);
    const shadowCoords = this.getScreenCoordinates(this.session.shadow.position, false);

    this.characterAnimator.setPosition(true, realCoords.x, realCoords.y);
    this.characterAnimator.setPosition(false, shadowCoords.x, shadowCoords.y);
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
        if (Math.abs(dx) > Math.abs(dy)) {
          this.handleDirectionInput(dx > 0 ? 'right' : 'left');
        } else {
          this.handleDirectionInput(dy > 0 ? 'down' : 'up');
        }
      } else {
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
    this.lastAttemptedDirection = direction;
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

    // 1. Detect any newly detonated bombs and trigger explosion shockwaves
    for (const b of this.session.puzzleManager.getAllBombs()) {
      if (b.isDetonated && !this.knownDetonatedBombs.has(b.id)) {
        this.knownDetonatedBombs.add(b.id);
        const bCoords = this.getScreenCoordinates(b.position, b.world === 'real');
        this.vfxManager.triggerExplosion(bCoords.x, bCoords.y, b.world === 'real', this.cellSize * (b.radius + 0.6));
        if (!isReduced) {
          this.cameras.main.shake(120, 0.008);
        }
      }
    }

    // 2. Animate Characters
    let completedTweens = 0;
    const onAnimationDone = () => {
      completedTweens++;
      if (completedTweens === 2) {
        this.session.turnEngine.endAnimation();
      }
    };

    // Check if player teleported via portal (> 1 tile delta)
    const pDist = Math.abs(result.playerNewPosition.x - result.playerOldPosition.x) +
      Math.abs(result.playerNewPosition.y - result.playerOldPosition.y);
    const sDist = Math.abs(result.shadowNewPosition.x - result.shadowOldPosition.x) +
      Math.abs(result.shadowNewPosition.y - result.shadowOldPosition.y);

    if (result.playerMoved) {
      if (pDist > 1) {
        // Portal warp
        const oldCoords = this.getScreenCoordinates(result.playerOldPosition, true);
        this.characterAnimator.animatePortalWarp(true, oldCoords.x, oldCoords.y, realCoords.x, realCoords.y, onAnimationDone);
      } else {
        const pDir: MoveDirection = result.playerNewPosition.x > result.playerOldPosition.x ? 'right'
          : result.playerNewPosition.x < result.playerOldPosition.x ? 'left'
          : result.playerNewPosition.y > result.playerOldPosition.y ? 'down' : 'up';
        this.characterAnimator.animateMove(true, realCoords.x, realCoords.y, pDir, duration, onAnimationDone);
      }
    } else {
      onAnimationDone();
    }

    if (result.shadowMoved) {
      if (sDist > 1) {
        // Portal warp
        const oldCoords = this.getScreenCoordinates(result.shadowOldPosition, false);
        this.characterAnimator.animatePortalWarp(false, oldCoords.x, oldCoords.y, shadowCoords.x, shadowCoords.y, onAnimationDone);
      } else {
        const sDir: MoveDirection = result.shadowNewPosition.x > result.shadowOldPosition.x ? 'right'
          : result.shadowNewPosition.x < result.shadowOldPosition.x ? 'left'
          : result.shadowNewPosition.y > result.shadowOldPosition.y ? 'down' : 'up';
        this.characterAnimator.animateMove(false, shadowCoords.x, shadowCoords.y, sDir, duration, onAnimationDone);
      }
    } else {
      onAnimationDone();
    }
  }

  private onMoveBlocked(): void {
    this.soundEffects.play('bump');
    this.characterAnimator.triggerBump(true, this.lastAttemptedDirection);
    this.characterAnimator.triggerBump(false, this.lastAttemptedDirection);

    if (!this.storage.getProgress().reducedMotion) {
      this.cameras.main.shake(40, 0.002);
    }
  }

  private onDeath(): void {
    this.soundEffects.play('death');
    const rCoords = this.getScreenCoordinates(this.session.player.position, true);
    const sCoords = this.getScreenCoordinates(this.session.shadow.position, false);
    this.characterAnimator.triggerDeathDisintegration(rCoords, sCoords);

    if (!this.storage.getProgress().reducedMotion) {
      this.cameras.main.shake(80, 0.005);
    }
  }

  private onRespawn(): void {
    this.knownDetonatedBombs.clear();
    const realCoords = this.getScreenCoordinates(this.session.player.position, true);
    const shadowCoords = this.getScreenCoordinates(this.session.shadow.position, false);

    this.characterAnimator.triggerRespawn(realCoords, shadowCoords);
  }

  private onLevelComplete(): void {
    this.soundEffects.play('win');
    pokiBridge.gameplayStop();

    // Spawn victory celebration radiant beacons
    const rCoords = this.getScreenCoordinates(this.session.player.position, true);
    const sCoords = this.getScreenCoordinates(this.session.shadow.position, false);
    this.vfxManager.spawnSparkBurst(rCoords.x, rCoords.y, 25, 0x00e5ff);
    this.vfxManager.spawnSparkBurst(sCoords.x, sCoords.y, 25, 0x00e5ff);

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
    this.vfxManager?.destroy();
    this.characterAnimator?.destroy();
    this.tweens.killAll();
  }
}
