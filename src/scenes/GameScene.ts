import Phaser from 'phaser';
import { ANIMATION, PALETTE } from '../core/constants';
import { Header } from '../ui/Header';
import { ControlsGuide } from '../ui/ControlsGuide';
import { TouchControls } from '../ui/TouchControls';
import { PauseModal } from '../ui/PauseModal';
import { WinModal } from '../ui/WinModal';
import { ObjectGuideModal } from '../ui/ObjectGuideModal';
import { SettingsModal } from '../ui/SettingsModal';
import { GridPoint } from '../grid/GridPosition';
import { LevelDefinition } from '../types/level';
import { ALL_LEVELS } from '../levels/levelsData';
import { LevelFactory, BuiltLevelSession } from '../levels/LevelFactory';
import { MoveDirection, MovementTransactionResult } from '../engine/MovementEngine';
import { InputController } from '../systems/InputController';
import { StorageManager } from '../storage/StorageManager';
import { SoundEffects } from '../audio/SoundEffects';
import { AudioManager } from '../audio/AudioManager';
import { ChapterName } from '../audio/AtmosphericMusic';
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
  private objectGuideModal!: ObjectGuideModal;
  private settingsModal!: SettingsModal;
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
  private exitLabels: Map<string, Phaser.GameObjects.Text> = new Map();

  // State tracking
  private lastAttemptedDirection: MoveDirection = 'right';
  private knownDetonatedBombs: Set<string> = new Set();
  private previousPlayerAtExit: boolean = false;
  private previousShadowAtExit: boolean = false;

  // Previous puzzle mechanism states for audio event synthesis
  private prevSwitchStates: Map<string, boolean> = new Map();
  private prevPlateStates: Map<string, boolean> = new Map();
  private prevDoorStates: Map<string, boolean> = new Map();
  private prevFloorStates: Map<string, string> = new Map();
  private prevLaserEmitterStates: Map<string, boolean> = new Map();
  private prevMirrorOrientations: Map<string, string> = new Map();

  constructor() {
    super('GameScene');
  }

  public init(data?: { levelId?: number }): void {
    this.levelId = data?.levelId ?? 1;
    this.levelDef = ALL_LEVELS.find((l) => l.id === this.levelId) ?? ALL_LEVELS[0];
    this.movesCount = 0;
    this.knownDetonatedBombs.clear();
    this.previousPlayerAtExit = false;
    this.previousShadowAtExit = false;

    this.storage = new StorageManager();
    const audio = AudioManager.getInstance();
    audio.init(this.storage);
    this.soundEffects = audio.sfx;
  }

  public create(): void {
    pokiBridge.gameplayStart();

    const chapter = this.getChapterName(this.levelId);
    AudioManager.getInstance().playGameMusic(chapter);

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
    this.initializePuzzleAudioBaseline();

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
    this.objectGuideModal = new ObjectGuideModal(this, width, height, () => {
      // Guide closed
    });

    this.settingsModal = new SettingsModal(this, width, height, this.storage, () => {
      // Settings closed
    });

    this.pauseModal = new PauseModal(this, width, height, {
      onResume: () => this.togglePause(),
      onRestart: () => {
        this.pauseModal.hide();
        this.restartLevel();
      },
      onObjectGuide: () => {
        this.objectGuideModal.show();
      },
      onSettings: () => {
        this.settingsModal.show();
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
        this.bombLabels,
        this.exitLabels
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

    // 3. Static Hazards
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

    // Keyboard shortcut for Object Guide [ G ]
    this.input.keyboard?.on('keydown-G', () => {
      if (this.objectGuideModal.isVisible()) {
        this.objectGuideModal.hide();
        if (this.session.turnEngine.state === 'PAUSED' && !this.pauseModal.isVisible()) {
          this.session.turnEngine.resume();
        }
      } else {
        if (this.session.turnEngine.state === 'PLAYING') {
          this.session.turnEngine.pause();
        }
        this.objectGuideModal.show();
      }
    });

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (
        this.pauseModal.isVisible() ||
        this.winModal.isVisible() ||
        this.objectGuideModal?.isVisible() ||
        this.settingsModal?.isVisible()
      ) {
        return;
      }
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
    if (
      this.pauseModal?.isVisible() ||
      this.winModal?.isVisible() ||
      this.objectGuideModal?.isVisible() ||
      this.settingsModal?.isVisible()
    ) {
      return;
    }
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

    // Audio step differentiated by world
    if (result.playerMoved) {
      this.soundEffects.playStep(true);
    } else if (result.shadowMoved) {
      this.soundEffects.playStep(false);
    }

    // 1. Detect any newly detonated bombs and trigger explosion shockwaves
    for (const b of this.session.puzzleManager.getAllBombs()) {
      if (b.isDetonated && !this.knownDetonatedBombs.has(b.id)) {
        this.knownDetonatedBombs.add(b.id);
        const bCoords = this.getScreenCoordinates(b.position, b.world === 'real');
        this.soundEffects.playBombExplosion();
        this.vfxManager.triggerExplosion(bCoords.x, bCoords.y, b.world === 'real', this.cellSize * (b.radius + 0.6));
        if (!isReduced) {
          this.cameras.main.shake(120, 0.008);
        }
      }
    }

    // 1b. Character Arrival energy response at exits
    if (result.playerAtExit && !this.previousPlayerAtExit) {
      this.vfxManager.spawnSparkBurst(realCoords.x, realCoords.y, 14, 0x00e5ff);
      this.soundEffects.playExitArrival();
      this.characterAnimator.playExitArrival(true);
    }
    if (result.shadowAtExit && !this.previousShadowAtExit) {
      this.vfxManager.spawnSparkBurst(shadowCoords.x, shadowCoords.y, 14, 0x00e5ff);
      this.soundEffects.playExitArrival();
      this.characterAnimator.playExitArrival(false);
    }
    this.previousPlayerAtExit = result.playerAtExit;
    this.previousShadowAtExit = result.shadowAtExit;

    // 1c. Track all mechanical puzzle state transitions and modulate dynamic thriller soundtrack
    this.updatePuzzleAudioEvents(result);

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

    if (pDist > 1 || sDist > 1) {
      this.soundEffects.playPortalTravel();
    }

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
    this.soundEffects.playDeath();
    AudioManager.getInstance().setGameplayState('death');
    const rCoords = this.getScreenCoordinates(this.session.player.position, true);
    const sCoords = this.getScreenCoordinates(this.session.shadow.position, false);
    this.characterAnimator.triggerDeathDisintegration(rCoords, sCoords);

    if (!this.storage.getProgress().reducedMotion) {
      this.cameras.main.shake(80, 0.005);
    }
  }

  private onRespawn(): void {
    this.knownDetonatedBombs.clear();
    this.previousPlayerAtExit = false;
    this.previousShadowAtExit = false;
    this.soundEffects.playRespawn();
    AudioManager.getInstance().setGameplayState('respawn');
    this.initializePuzzleAudioBaseline();

    const realCoords = this.getScreenCoordinates(this.session.player.position, true);
    const shadowCoords = this.getScreenCoordinates(this.session.shadow.position, false);

    this.characterAnimator.triggerRespawn(realCoords, shadowCoords);
  }

  private onLevelComplete(): void {
    this.soundEffects.playWin();
    AudioManager.getInstance().setGameplayState('level_complete');
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

  private getChapterName(levelId: number): ChapterName {
    if (levelId <= 4) return 'THE BEGINNING';
    if (levelId <= 8) return 'THE CONNECTION';
    if (levelId <= 12) return 'THE SEPARATION';
    if (levelId <= 16) return 'THE REFLECTION';
    return 'THE TRUTH';
  }

  private initializePuzzleAudioBaseline(): void {
    if (!this.session?.puzzleManager) return;
    const pm = this.session.puzzleManager;

    this.prevSwitchStates.clear();
    for (const sw of pm.getAllSwitches()) this.prevSwitchStates.set(sw.id, sw.isActive);

    this.prevPlateStates.clear();
    for (const pp of pm.getAllPressurePlates()) this.prevPlateStates.set(pp.id, pp.isPressed);

    this.prevDoorStates.clear();
    for (const d of pm.getAllDoors()) this.prevDoorStates.set(d.id, d.isOpen);

    this.prevFloorStates.clear();
    for (const cf of pm.getAllCollapsingFloors()) this.prevFloorStates.set(cf.id, cf.floorState);

    this.prevLaserEmitterStates.clear();
    for (const le of pm.getAllLaserEmitters()) this.prevLaserEmitterStates.set(le.id, le.isActive);

    this.prevMirrorOrientations.clear();
    for (const m of pm.getAllLaserMirrors()) this.prevMirrorOrientations.set(m.id, m.orientation);
  }

  private updatePuzzleAudioEvents(result: MovementTransactionResult): void {
    if (!this.session?.puzzleManager) return;
    const pm = this.session.puzzleManager;

    // 1. Switches
    for (const sw of pm.getAllSwitches()) {
      const prev = this.prevSwitchStates.get(sw.id);
      if (prev !== undefined && prev !== sw.isActive) {
        this.soundEffects.playSwitch();
      }
      this.prevSwitchStates.set(sw.id, sw.isActive);
    }

    // 2. Pressure Plates
    for (const pp of pm.getAllPressurePlates()) {
      const prev = this.prevPlateStates.get(pp.id);
      if (prev !== undefined && prev !== pp.isPressed) {
        this.soundEffects.playPressurePlate(pp.isPressed);
      }
      this.prevPlateStates.set(pp.id, pp.isPressed);
    }

    // 3. Doors
    for (const d of pm.getAllDoors()) {
      const prev = this.prevDoorStates.get(d.id);
      if (prev !== undefined && prev !== d.isOpen) {
        this.soundEffects.playDoor(d.isOpen);
        if (!d.isOpen) {
          this.soundEffects.playMechanicalWarning();
        }
      }
      this.prevDoorStates.set(d.id, d.isOpen);
    }

    // 4. Collapsing Floors
    for (const cf of pm.getAllCollapsingFloors()) {
      const prev = this.prevFloorStates.get(cf.id);
      if (prev !== undefined && prev !== cf.floorState) {
        const stageNum = cf.floorState === 'CRACKED' ? 1 : cf.floorState === 'COLLAPSED' ? 2 : 0;
        this.soundEffects.playCollapsingFloor(stageNum);
      }
      this.prevFloorStates.set(cf.id, cf.floorState);
    }

    // 5. Lasers
    for (const le of pm.getAllLaserEmitters()) {
      const prev = this.prevLaserEmitterStates.get(le.id);
      if (prev !== undefined && prev !== le.isActive) {
        this.soundEffects.playLaser('active');
      }
      this.prevLaserEmitterStates.set(le.id, le.isActive);
    }

    // 6. Laser Mirrors
    for (const m of pm.getAllLaserMirrors()) {
      const prev = this.prevMirrorOrientations.get(m.id);
      if (prev !== undefined && prev !== m.orientation) {
        this.soundEffects.playMirror();
      }
      this.prevMirrorOrientations.set(m.id, m.orientation);
    }

    // 7. Bombs
    let hasCriticalBomb = false;
    for (const b of pm.getAllBombs()) {
      if (b.isActive && !b.isDetonated) {
        this.soundEffects.playBombTick(b.countdown);
        if (b.countdown <= 1) {
          hasCriticalBomb = true;
        }
      }
    }

    // 8. Hazard Proximity & Dynamic Soundtrack Tension
    const pPos = result.playerNewPosition;
    const sPos = result.shadowNewPosition;
    let isNearHazard = false;

    for (const mh of pm.getAllMovingHazards()) {
      const dist = mh.world === 'real'
        ? Math.abs(mh.position.x - pPos.x) + Math.abs(mh.position.y - pPos.y)
        : Math.abs(mh.position.x - sPos.x) + Math.abs(mh.position.y - sPos.y);
      if (dist <= 1) {
        isNearHazard = true;
        this.soundEffects.playSaw('whir');
        break;
      }
    }

    if (hasCriticalBomb) {
      AudioManager.getInstance().setGameplayState('bomb_countdown');
      this.soundEffects.playMechanicalWarning();
    } else if (isNearHazard) {
      AudioManager.getInstance().setGameplayState('hazard_proximity');
    } else {
      AudioManager.getInstance().setGameplayState('normal');
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
    AudioManager.getInstance().stopAllMusic();
    if (this.inputController) {
      this.inputController.detach();
    }
    for (const label of this.bombLabels.values()) {
      label.destroy();
    }
    this.bombLabels.clear();
    for (const label of this.exitLabels.values()) {
      label.destroy();
    }
    this.exitLabels.clear();
    this.vfxManager?.destroy();
    this.characterAnimator?.destroy();
    this.tweens.killAll();
  }
}
