import Phaser from 'phaser';
import { PALETTE } from '../core/constants';

export interface ParticleEffect {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  maxLife: number;
  life: number;
  color: number;
  shape?: 'square' | 'circle' | 'spark';
  gravity?: number;
}

export interface ShockwaveEffect {
  x: number;
  y: number;
  currentRadius: number;
  maxRadius: number;
  duration: number;
  elapsed: number;
  color: number;
  lineWidth: number;
}

export interface AmbientMote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  baseAlpha: number;
  world: 'real' | 'shadow';
  boundX: [number, number];
  boundY: [number, number];
}

export class VisualEffectsManager {
  private scene: Phaser.Scene;
  private isReducedMotion: boolean = false;

  // Render layers
  private ambientGraphics: Phaser.GameObjects.Graphics;
  private particleGraphics: Phaser.GameObjects.Graphics;
  private shockwaveGraphics: Phaser.GameObjects.Graphics;

  // Continuous animation parameters
  public totalTime: number = 0;
  public sawRotationAngle: number = 0;
  public portalVortexAngle: number = 0;
  public portalInnerAngle: number = 0;
  public exitPulsePhase: number = 0;
  public timeLockPhase: number = 0;
  public laserJitterX: number = 0;
  public laserJitterY: number = 0;
  public magneticPulsePhase: number = 0;

  // Active particle lists
  private particles: ParticleEffect[] = [];
  private shockwaves: ShockwaveEffect[] = [];
  private ambientMotes: AmbientMote[] = [];

  constructor(scene: Phaser.Scene, isReducedMotion: boolean = false) {
    this.scene = scene;
    this.isReducedMotion = isReducedMotion;

    // Ambient floating dust layer (behind puzzle elements)
    this.ambientGraphics = scene.add.graphics().setDepth(4);
    // Particle layer (above puzzle elements, below UI)
    this.particleGraphics = scene.add.graphics().setDepth(26);
    // Shockwave layer (impacts, explosions)
    this.shockwaveGraphics = scene.add.graphics().setDepth(27);

    this.initAmbientMotes();
  }

  public setReducedMotion(reduced: boolean): void {
    this.isReducedMotion = reduced;
  }

  private initAmbientMotes(): void {
    const { width, height } = this.scene.scale;
    const halfWidth = width / 2;
    const countPerWorld = 24;

    // Real world motes (light world -> subtle dark dust motes)
    for (let i = 0; i < countPerWorld; i++) {
      this.ambientMotes.push({
        x: Math.random() * (halfWidth - 20) + 10,
        y: Math.random() * (height - 100) + 70,
        vx: (Math.random() - 0.5) * 8,
        vy: -4 - Math.random() * 8,
        size: 1 + Math.random() * 1.5,
        alpha: 0.15,
        baseAlpha: 0.12 + Math.random() * 0.1,
        world: 'real',
        boundX: [10, halfWidth - 10],
        boundY: [70, height - 30],
      });
    }

    // Shadow world motes (dark world -> subtle luminous dust motes)
    for (let i = 0; i < countPerWorld; i++) {
      this.ambientMotes.push({
        x: halfWidth + Math.random() * (halfWidth - 20) + 10,
        y: Math.random() * (height - 100) + 70,
        vx: (Math.random() - 0.5) * 8,
        vy: -4 - Math.random() * 8,
        size: 1 + Math.random() * 1.5,
        alpha: 0.25,
        baseAlpha: 0.2 + Math.random() * 0.15,
        world: 'shadow',
        boundX: [halfWidth + 10, width - 10],
        boundY: [70, height - 30],
      });
    }
  }

  public update(_time: number, delta: number): void {
    const dt = Math.min(delta, 100) * 0.001; // Clamp delta to avoid huge jumps
    this.totalTime += dt;

    // 1. Advance continuous rotation & oscillation cycles
    if (!this.isReducedMotion) {
      // 480 degrees/sec = ~8.37 rad/sec for aggressive mechanical saw spin
      this.sawRotationAngle = (this.sawRotationAngle + dt * 8.37) % (Math.PI * 2);
      // Dual counter-rotating portal vortices
      this.portalVortexAngle = (this.portalVortexAngle + dt * 2.8) % (Math.PI * 2);
      this.portalInnerAngle = (this.portalInnerAngle - dt * 4.2) % (Math.PI * 2);
      // Electric laser micro-jitter (sub-pixel rapid vibration)
      this.laserJitterX = (Math.random() - 0.5) * 1.2;
      this.laserJitterY = (Math.random() - 0.5) * 1.2;
    } else {
      this.sawRotationAngle = (this.sawRotationAngle + dt * 2.0) % (Math.PI * 2);
      this.portalVortexAngle = (this.portalVortexAngle + dt * 1.0) % (Math.PI * 2);
      this.portalInnerAngle = (this.portalInnerAngle - dt * 1.5) % (Math.PI * 2);
      this.laserJitterX = 0;
      this.laserJitterY = 0;
    }

    this.exitPulsePhase = (this.exitPulsePhase + dt * 2.5) % (Math.PI * 2);
    this.timeLockPhase = (this.timeLockPhase + dt * 3.0) % (Math.PI * 2);
    this.magneticPulsePhase = (this.magneticPulsePhase + dt * 4.0) % (Math.PI * 2);

    // 2. Update and render ambient motes
    this.updateAmbientMotes(dt);

    // 3. Update and render dynamic particles
    this.updateParticles(dt);

    // 4. Update and render shockwaves
    this.updateShockwaves(dt);
  }

  private updateAmbientMotes(dt: number): void {
    if (this.isReducedMotion) {
      this.ambientGraphics.clear();
      return;
    }

    this.ambientGraphics.clear();

    for (const m of this.ambientMotes) {
      m.x += m.vx * dt;
      m.y += m.vy * dt;

      // Wrap around bounds
      if (m.y < m.boundY[0]) {
        m.y = m.boundY[1];
        m.x = m.boundX[0] + Math.random() * (m.boundX[1] - m.boundX[0]);
      }
      if (m.x < m.boundX[0]) m.x = m.boundX[1];
      if (m.x > m.boundX[1]) m.x = m.boundX[0];

      // Subtle pulse
      const pulse = Math.sin(this.totalTime * 2 + m.x * 0.1);
      const alpha = Math.max(0.05, m.baseAlpha + pulse * 0.05);

      const color = m.world === 'real' ? PALETTE.real.walls : PALETTE.shadow.walls;
      this.ambientGraphics.fillStyle(color, alpha);
      this.ambientGraphics.fillCircle(m.x, m.y, m.size);
    }

    // Subtle atmospheric fog drift bands
    const { width, height } = this.scene.scale;
    const halfWidth = width / 2;
    const fogDrift = Math.sin(this.totalTime * 0.4) * 20;

    // Real world subtle mist
    this.ambientGraphics.fillStyle(0xdddddd, 0.04);
    this.ambientGraphics.fillRect(20 + fogDrift, height - 120, halfWidth - 60, 40);

    // Shadow world subtle lunar haze
    this.ambientGraphics.fillStyle(0xffffff, 0.025);
    this.ambientGraphics.fillRect(halfWidth + 20 - fogDrift, height - 120, halfWidth - 60, 40);

    // Center divider energy shimmer pulse
    const dividerPulse = (Math.sin(this.totalTime * 3) + 1) * 0.5;
    this.ambientGraphics.lineStyle(1.5, 0x00e5ff, 0.12 + dividerPulse * 0.15);
    this.ambientGraphics.lineBetween(halfWidth, 70, halfWidth, height - 30);
  }

  private updateParticles(dt: number): void {
    this.particleGraphics.clear();
    if (this.particles.length === 0) return;

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;

      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
        continue;
      }

      const lifeRatio = p.life / p.maxLife;
      const alpha = p.alpha * (1 - lifeRatio);

      if (p.gravity) {
        p.vy += p.gravity * dt;
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;

      this.particleGraphics.fillStyle(p.color, alpha);
      if (p.shape === 'spark') {
        // Elongated spark
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy) || 1;
        const nx = (p.vx / speed) * p.size * 2;
        const ny = (p.vy / speed) * p.size * 2;
        this.particleGraphics.lineStyle(1.5, p.color, alpha);
        this.particleGraphics.lineBetween(p.x, p.y, p.x - nx, p.y - ny);
      } else if (p.shape === 'circle') {
        this.particleGraphics.fillCircle(p.x, p.y, p.size * (1 - lifeRatio * 0.5));
      } else {
        const sz = p.size;
        this.particleGraphics.fillRect(p.x - sz / 2, p.y - sz / 2, sz, sz);
      }
    }
  }

  private updateShockwaves(dt: number): void {
    this.shockwaveGraphics.clear();
    if (this.shockwaves.length === 0) return;

    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.elapsed += dt;

      if (sw.elapsed >= sw.duration) {
        this.shockwaves.splice(i, 1);
        continue;
      }

      const progress = sw.elapsed / sw.duration;
      sw.currentRadius = sw.maxRadius * Math.sin((progress * Math.PI) / 2);
      const alpha = (1 - progress) * 0.85;

      this.shockwaveGraphics.lineStyle(sw.lineWidth * (1 - progress * 0.5), sw.color, alpha);
      this.shockwaveGraphics.strokeCircle(sw.x, sw.y, sw.currentRadius);
    }
  }

  // --- Particle Spawning Helpers ---

  /**
   * Spawns an energetic spark burst (laser impact, mirror reflection, saw friction)
   */
  public spawnSparkBurst(x: number, y: number, count: number = 8, color: number = 0x00e5ff): void {
    if (this.isReducedMotion) return;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 80;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 2,
        alpha: 0.9,
        maxLife: 0.2 + Math.random() * 0.2,
        life: 0,
        color,
        shape: 'spark',
        gravity: 40,
      });
    }
  }

  /**
   * Spawns subtle mechanical friction sparks for spinning saw blades
   */
  public spawnSawSparks(x: number, y: number, isReal: boolean): void {
    if (this.isReducedMotion || Math.random() > 0.15) return;
    const angle = Math.random() * Math.PI * 2;
    const speed = 25 + Math.random() * 45;
    const color = isReal ? 0x555555 : 0xcccccc;
    this.particles.push({
      x: x + Math.cos(angle) * 16,
      y: y + Math.sin(angle) * 16,
      vx: Math.cos(angle + Math.PI / 2) * speed,
      vy: Math.sin(angle + Math.PI / 2) * speed,
      size: 1.5,
      alpha: 0.75,
      maxLife: 0.12 + Math.random() * 0.1,
      life: 0,
      color,
      shape: 'spark',
      gravity: 30,
    });
  }

  /**
   * Spawns a sputtering bomb fuse spark
   */
  public spawnFuseSpark(x: number, y: number, isReal: boolean): void {
    if (this.isReducedMotion) return;
    const color = isReal ? 0xff4400 : 0xffaa00;
    for (let i = 0; i < 2; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.5;
      const speed = 25 + Math.random() * 35;
      this.particles.push({
        x: x + (Math.random() - 0.5) * 4,
        y: y + (Math.random() - 0.5) * 4,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 1.5 + Math.random() * 1.5,
        alpha: 1,
        maxLife: 0.15 + Math.random() * 0.15,
        life: 0,
        color,
        shape: 'spark',
        gravity: 60,
      });
    }
  }

  /**
   * Spawns an explosion effect: shockwave + flying fiery/monochrome debris
   */
  public triggerExplosion(x: number, y: number, isReal: boolean, blastRadiusPx: number): void {
    // 1. Shockwave expansion
    this.shockwaves.push({
      x,
      y,
      currentRadius: 4,
      maxRadius: blastRadiusPx,
      duration: 0.35,
      elapsed: 0,
      color: isReal ? 0x111111 : 0xffffff,
      lineWidth: 4,
    });

    // 2. Fiery shockwave accent
    this.shockwaves.push({
      x,
      y,
      currentRadius: 2,
      maxRadius: blastRadiusPx * 0.75,
      duration: 0.25,
      elapsed: 0,
      color: 0xff4400,
      lineWidth: 3,
    });

    if (this.isReducedMotion) return;

    // 3. Dense flying debris fragments
    const debrisCount = 20;
    for (let i = 0; i < debrisCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 70 + Math.random() * 140;
      const col = Math.random() > 0.4 ? (isReal ? 0x222222 : 0xeeeeee) : 0xff6600;

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2.5 + Math.random() * 3.5,
        alpha: 1,
        maxLife: 0.3 + Math.random() * 0.3,
        life: 0,
        color: col,
        shape: 'square',
        gravity: 80,
      });
    }
  }

  /**
   * Spawns crumbling stone debris for collapsing floors
   */
  public spawnCrumblingDebris(x: number, y: number, isReal: boolean): void {
    if (this.isReducedMotion) return;
    const count = 6;
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 30,
        vy: 20 + Math.random() * 40,
        size: 2 + Math.random() * 2,
        alpha: 0.8,
        maxLife: 0.4,
        life: 0,
        color: isReal ? 0x444444 : 0xaaaaaa,
        shape: 'square',
        gravity: 120,
      });
    }
  }

  public spawnStoneDebris(x: number, y: number, count: number = 12, isReal: boolean = true): void {
    if (this.isReducedMotion) return;
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 24,
        y: y + (Math.random() - 0.5) * 24,
        vx: (Math.random() - 0.5) * 45,
        vy: -15 + Math.random() * 50,
        size: 2 + Math.random() * 3,
        alpha: 0.85,
        maxLife: 0.35 + Math.random() * 0.2,
        life: 0,
        color: isReal ? 0x333333 : 0xcccccc,
        shape: 'square',
        gravity: 100,
      });
    }
  }

  public addShockwave(x: number, y: number, color: number, radiusPx: number): void {
    this.shockwaves.push({
      x,
      y,
      currentRadius: 4,
      maxRadius: radiusPx,
      duration: 0.3,
      elapsed: 0,
      color,
      lineWidth: 3,
    });
  }

  /**
   * Spawns portal ingestion motes (drawn inward toward event horizon)
   */
  public spawnPortalIngestionMote(x: number, y: number, isReal: boolean, isCorrupted: boolean): void {
    if (this.isReducedMotion || Math.random() > 0.4) return;
    const angle = Math.random() * Math.PI * 2;
    const distance = 22 + Math.random() * 10;
    const startX = x + Math.cos(angle) * distance;
    const startY = y + Math.sin(angle) * distance;

    const color = isCorrupted
      ? 0xff0055
      : isReal
        ? PALETTE.real.character
        : PALETTE.shadow.character;

    // Velocity vectors point toward center (x, y) with slight swirl
    const tangentAngle = angle + Math.PI / 2;
    const inwardSpeed = 45;
    const swirlSpeed = 25;

    this.particles.push({
      x: startX,
      y: startY,
      vx: -Math.cos(angle) * inwardSpeed + Math.cos(tangentAngle) * swirlSpeed,
      vy: -Math.sin(angle) * inwardSpeed + Math.sin(tangentAngle) * swirlSpeed,
      size: 1.5,
      alpha: 0.8,
      maxLife: 0.35,
      life: 0,
      color,
      shape: 'circle',
    });
  }

  public destroy(): void {
    this.particles = [];
    this.shockwaves = [];
    this.ambientMotes = [];
    this.ambientGraphics.destroy();
    this.particleGraphics.destroy();
    this.shockwaveGraphics.destroy();
  }
}
