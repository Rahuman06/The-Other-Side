import Phaser from 'phaser';
import { MoveDirection } from '../engine/MovementEngine';
import { PALETTE } from '../core/constants';

export interface CharacterShard {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  vRot: number;
  size: number;
  alpha: number;
  world: 'real' | 'shadow';
}

export class CharacterAnimator {
  private scene: Phaser.Scene;
  private cellSize: number = 48;
  private isReducedMotion: boolean = false;

  // Character display containers
  public realContainer: Phaser.GameObjects.Container;
  public shadowContainer: Phaser.GameObjects.Container;

  // Graphics objects for procedural stickman rendering
  private realGraphics: Phaser.GameObjects.Graphics;
  private shadowGraphics: Phaser.GameObjects.Graphics;

  // Animation states
  private idleTime: number = 0;
  private realFacing: MoveDirection = 'right';
  private shadowFacing: MoveDirection = 'left';

  // Walk cycle phases (0 to 1 during movement)
  private realWalkPhase: number = 0;
  private shadowWalkPhase: number = 0;
  private realIsWalking: boolean = false;
  private shadowIsWalking: boolean = false;

  // Scale and offset modifiers for squash/stretch and recoil
  public realScaleX: number = 1;
  public realScaleY: number = 1;
  public shadowScaleX: number = 1;
  public shadowScaleY: number = 1;
  public realOffsetX: number = 0;
  public realOffsetY: number = 0;
  public shadowOffsetX: number = 0;
  public shadowOffsetY: number = 0;

  // Death disintegration shards pool
  private shards: CharacterShard[] = [];
  private shardGraphics: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, cellSize: number, isReducedMotion: boolean = false) {
    this.scene = scene;
    this.cellSize = cellSize;
    this.isReducedMotion = isReducedMotion;

    this.realContainer = scene.add.container(0, 0).setDepth(25);
    this.shadowContainer = scene.add.container(0, 0).setDepth(25);

    this.realGraphics = scene.add.graphics();
    this.shadowGraphics = scene.add.graphics();

    this.realContainer.add(this.realGraphics);
    this.shadowContainer.add(this.shadowGraphics);

    this.shardGraphics = scene.add.graphics().setDepth(28);

    // Initial draw
    this.renderStickman(this.realGraphics, true, 0, this.realFacing);
    this.renderStickman(this.shadowGraphics, false, 0, this.shadowFacing);
  }

  public setCellSize(cellSize: number): void {
    this.cellSize = cellSize;
  }

  public setReducedMotion(reduced: boolean): void {
    this.isReducedMotion = reduced;
  }

  public setPosition(isReal: boolean, x: number, y: number): void {
    const container = isReal ? this.realContainer : this.shadowContainer;
    container.setPosition(x, y);
  }

  public update(_time: number, delta: number): void {
    this.idleTime += delta * 0.003;

    // 1. Idle breathing float
    const floatAmount = this.isReducedMotion ? 0 : Math.sin(this.idleTime * 2.5) * 1.5;

    this.realGraphics.y = floatAmount + this.realOffsetY;
    this.shadowGraphics.y = floatAmount + this.shadowOffsetY;
    this.realGraphics.x = this.realOffsetX;
    this.shadowGraphics.x = this.shadowOffsetX;

    // Apply squash and stretch
    this.realGraphics.setScale(this.realScaleX, this.realScaleY);
    this.shadowGraphics.setScale(this.shadowScaleX, this.shadowScaleY);

    // Redraw stickmen with current walk cycle phase
    this.renderStickman(
      this.realGraphics,
      true,
      this.realIsWalking ? this.realWalkPhase : 0,
      this.realFacing
    );

    this.renderStickman(
      this.shadowGraphics,
      false,
      this.shadowIsWalking ? this.shadowWalkPhase : 0,
      this.shadowFacing
    );

    // 2. Update disintegration shards
    this.updateShards(delta);
  }

  /**
   * Procedural Stickman Rendering:
   * - Circular slightly oversized head
   * - Small expressive eyes
   * - Slim torso
   * - Visible articulated arms & legs with natural stride
   */
  private renderStickman(
    g: Phaser.GameObjects.Graphics,
    isReal: boolean,
    walkPhase: number,
    facing: MoveDirection
  ): void {
    g.clear();

    const color = isReal ? PALETTE.real.character : PALETTE.shadow.character;
    const eyeColor = isReal ? 0xffffff : 0x000000;
    const s = this.cellSize;

    // Dimensions
    const headRadius = s * 0.16;
    const headY = -s * 0.22;
    const neckY = headY + headRadius * 0.8;
    const pelvisY = s * 0.08;
    const strokeW = Math.max(2, Math.round(s * 0.07));
    const capR = strokeW / 2;

    // Stride angle oscillation
    const stride = Math.sin(walkPhase * Math.PI * 2);
    // Natural standing stance (legs & arms clearly visible with slight separation)
    const baseLegAngle = 0.18;
    const baseArmAngle = 0.22;
    const legAngle1 = -baseLegAngle + stride * 0.45;
    const legAngle2 = baseLegAngle - stride * 0.45;
    const armAngle1 = -baseArmAngle - stride * 0.50;
    const armAngle2 = baseArmAngle + stride * 0.50;

    const legLen = s * 0.26;
    const armLen = s * 0.22;
    const shoulderY = neckY + (pelvisY - neckY) * 0.25;

    // 1. Torso
    g.lineStyle(strokeW, color, 1);
    g.beginPath();
    g.moveTo(0, neckY);
    g.lineTo(0, pelvisY);
    g.strokePath();

    // 2. Legs
    // Left Leg
    const lx1 = Math.sin(legAngle1) * legLen;
    const ly1 = pelvisY + Math.cos(legAngle1) * legLen;
    g.beginPath();
    g.moveTo(0, pelvisY);
    g.lineTo(lx1, ly1);
    g.strokePath();

    // Right Leg
    const lx2 = Math.sin(legAngle2) * legLen;
    const ly2 = pelvisY + Math.cos(legAngle2) * legLen;
    g.beginPath();
    g.moveTo(0, pelvisY);
    g.lineTo(lx2, ly2);
    g.strokePath();

    // 3. Arms
    // Left Arm
    const ax1 = Math.sin(armAngle1) * armLen;
    const ay1 = shoulderY + Math.cos(armAngle1) * armLen;
    g.beginPath();
    g.moveTo(0, shoulderY);
    g.lineTo(ax1, ay1);
    g.strokePath();

    // Right Arm
    const ax2 = Math.sin(armAngle2) * armLen;
    const ay2 = shoulderY + Math.cos(armAngle2) * armLen;
    g.beginPath();
    g.moveTo(0, shoulderY);
    g.lineTo(ax2, ay2);
    g.strokePath();

    // 4. Rounded endpoints for smooth minimalist finish
    g.fillStyle(color, 1);
    g.fillCircle(0, neckY, capR);
    g.fillCircle(0, pelvisY, capR);
    g.fillCircle(lx1, ly1, capR);
    g.fillCircle(lx2, ly2, capR);
    g.fillCircle(ax1, ay1, capR);
    g.fillCircle(ax2, ay2, capR);

    // 5. Head
    g.fillStyle(color, 1);
    g.fillCircle(0, headY, headRadius);

    // 6. Eyes (Glance in facing direction)
    const eyeOffsetX = facing === 'left' ? -headRadius * 0.35 : facing === 'right' ? headRadius * 0.35 : 0;
    const eyeOffsetY = facing === 'up' ? -headRadius * 0.25 : facing === 'down' ? headRadius * 0.25 : 0;
    const eyeR = Math.max(1.5, headRadius * 0.2);

    g.fillStyle(eyeColor, 1);
    g.fillCircle(eyeOffsetX, headY + eyeOffsetY, eyeR);
  }

  /**
   * Movement Animation with Squash, Stretch, and Stride
   */
  public animateMove(
    isReal: boolean,
    targetX: number,
    targetY: number,
    direction: MoveDirection,
    duration: number,
    onComplete?: () => void
  ): void {
    const container = isReal ? this.realContainer : this.shadowContainer;
    if (isReal) {
      this.realFacing = direction;
      this.realIsWalking = true;
      this.realWalkPhase = 0;
    } else {
      this.shadowFacing = direction;
      this.shadowIsWalking = true;
      this.shadowWalkPhase = 0;
    }

    if (this.isReducedMotion) {
      container.setPosition(targetX, targetY);
      if (isReal) this.realIsWalking = false;
      else this.shadowIsWalking = false;
      onComplete?.();
      return;
    }

    const isHorizontal = direction === 'left' || direction === 'right';

    // 1. Anticipation squash (0 to 20ms)
    const squashScaleX = isHorizontal ? 1.25 : 0.8;
    const squashScaleY = isHorizontal ? 0.8 : 1.25;

    if (isReal) {
      this.realScaleX = squashScaleX;
      this.realScaleY = squashScaleY;
    } else {
      this.shadowScaleX = squashScaleX;
      this.shadowScaleY = squashScaleY;
    }

    // 2. Position tween with transit stretch
    this.scene.tweens.add({
      targets: container,
      x: targetX,
      y: targetY,
      duration,
      ease: 'Quad.easeInOut',
      onUpdate: (tween) => {
        const p = tween.progress;
        const walkCycle = p * 1.5; // 1.5 stride oscillations per move
        if (isReal) {
          this.realWalkPhase = walkCycle;
          // Mid-transit stretch
          if (p > 0.2 && p < 0.8) {
            this.realScaleX = isHorizontal ? 0.9 : 1.15;
            this.realScaleY = isHorizontal ? 1.15 : 0.9;
          }
        } else {
          this.shadowWalkPhase = walkCycle;
          if (p > 0.2 && p < 0.8) {
            this.shadowScaleX = isHorizontal ? 0.9 : 1.15;
            this.shadowScaleY = isHorizontal ? 1.15 : 0.9;
          }
        }
      },
      onComplete: () => {
        // 3. Landing settle bounce
        if (isReal) {
          this.realIsWalking = false;
          this.realWalkPhase = 0;
          this.realScaleX = 1.1;
          this.realScaleY = 0.92;
          this.scene.tweens.add({
            targets: this,
            realScaleX: 1.0,
            realScaleY: 1.0,
            duration: 80,
            ease: 'Back.easeOut',
          });
        } else {
          this.shadowIsWalking = false;
          this.shadowWalkPhase = 0;
          this.shadowScaleX = 1.1;
          this.shadowScaleY = 0.92;
          this.scene.tweens.add({
            targets: this,
            shadowScaleX: 1.0,
            shadowScaleY: 1.0,
            duration: 80,
            ease: 'Back.easeOut',
          });
        }
        onComplete?.();
      },
    });
  }

  /**
   * Blocked Move (Elastic Wall Bump Recoil)
   */
  public triggerBump(isReal: boolean, direction: MoveDirection): void {
    if (this.isReducedMotion) return;

    let impulseX = 0;
    let impulseY = 0;
    const d = 5;

    switch (direction) {
      case 'left': impulseX = -d; break;
      case 'right': impulseX = d; break;
      case 'up': impulseY = -d; break;
      case 'down': impulseY = d; break;
    }

    if (isReal) {
      this.realOffsetX = impulseX;
      this.realOffsetY = impulseY;
      this.scene.tweens.add({
        targets: this,
        realOffsetX: 0,
        realOffsetY: 0,
        duration: 110,
        ease: 'Bounce.easeOut',
      });
    } else {
      this.shadowOffsetX = impulseX;
      this.shadowOffsetY = impulseY;
      this.scene.tweens.add({
        targets: this,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        duration: 110,
        ease: 'Bounce.easeOut',
      });
    }
  }

  /**
   * Portal Warp Compression & Bloom
   */
  public animatePortalWarp(isReal: boolean, fromX: number, fromY: number, toX: number, toY: number, onComplete?: () => void): void {
    const container = isReal ? this.realContainer : this.shadowContainer;
    container.setPosition(fromX, fromY);

    if (this.isReducedMotion) {
      container.setPosition(toX, toY);
      onComplete?.();
      return;
    }

    // Implode into event horizon
    this.scene.tweens.add({
      targets: container,
      scaleX: 0,
      scaleY: 0,
      rotation: Math.PI * 2,
      duration: 100,
      ease: 'Cubic.easeIn',
      onComplete: () => {
        container.setPosition(toX, toY);
        container.setRotation(0);
        // Explode outward with radiant bloom
        this.scene.tweens.add({
          targets: container,
          scaleX: 1,
          scaleY: 1,
          duration: 140,
          ease: 'Back.easeOut',
          onComplete: () => onComplete?.(),
        });
      },
    });
  }

  /**
   * Death Disintegration: Shatters into 12 geometric stickman shards
   */
  public triggerDeathDisintegration(realPos: { x: number; y: number }, shadowPos: { x: number; y: number }): void {
    this.realContainer.setVisible(false);
    this.shadowContainer.setVisible(false);

    // Spawn 12 shards around each character
    const shardCount = 12;
    for (let i = 0; i < shardCount; i++) {
      const angle = (i * Math.PI * 2) / shardCount + (Math.random() - 0.5) * 0.4;
      const speed = 60 + Math.random() * 80;

      // Real shards
      this.shards.push({
        x: realPos.x,
        y: realPos.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        rotation: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 8,
        size: 3 + Math.random() * 4,
        alpha: 1,
        world: 'real',
      });

      // Shadow shards
      this.shards.push({
        x: shadowPos.x,
        y: shadowPos.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        rotation: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 8,
        size: 3 + Math.random() * 4,
        alpha: 1,
        world: 'shadow',
      });
    }
  }

  /**
   * Respawn Re-materialization at Checkpoint
   */
  public triggerRespawn(realCoords: { x: number; y: number }, shadowCoords: { x: number; y: number }): void {
    this.shards = [];
    this.shardGraphics.clear();

    this.realContainer.setPosition(realCoords.x, realCoords.y);
    this.shadowContainer.setPosition(shadowCoords.x, shadowCoords.y);

    this.realContainer.setVisible(true);
    this.shadowContainer.setVisible(true);

    this.realContainer.setScale(0);
    this.shadowContainer.setScale(0);

    // Materialize with luminous scale bloom
    this.scene.tweens.add({
      targets: [this.realContainer, this.shadowContainer],
      scaleX: 1,
      scaleY: 1,
      duration: 180,
      ease: 'Back.easeOut',
    });
  }

  private updateShards(delta: number): void {
    if (this.shards.length === 0) return;

    const dt = delta * 0.001;
    this.shardGraphics.clear();

    for (let i = this.shards.length - 1; i >= 0; i--) {
      const s = this.shards[i];
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.rotation += s.vRot * dt;
      s.alpha -= dt * 1.8;

      if (s.alpha <= 0) {
        this.shards.splice(i, 1);
        continue;
      }

      const color = s.world === 'real' ? PALETTE.real.character : PALETTE.shadow.character;
      this.shardGraphics.fillStyle(color, s.alpha);
      this.shardGraphics.fillRect(s.x - s.size / 2, s.y - s.size / 2, s.size, s.size);
    }
  }

  public destroy(): void {
    this.shards = [];
    this.shardGraphics.destroy();
    this.realContainer.destroy();
    this.shadowContainer.destroy();
  }
}
