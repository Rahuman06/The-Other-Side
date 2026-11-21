/**
 * BackdropRenderer.ts
 *
 * Premium Dual-World Cinematic Background Engine for THE OTHER SIDE.
 *
 * Implements a continuous 5-layer animated environment covering the entire device viewport
 * (100vw x 100vh) across mobile phones, tablets, and widescreen displays:
 *  - Layer 1: Base Environment — Pure #FFFFFF Real World & deep obsidian #101010 Shadow World.
 *  - Layer 2: Atmospheric Gradients & Caustic Light Rays — Flowing diagonal sunlight shafts on the left;
 *             deep nebular currents & soft cyan ribbons on the right.
 *  - Layer 3: Multi-Layer Floating Particles & Motes — Soft floating dust, silver motes & glowing orbs (left);
 *             deep embers, luminous cyan sparks with halos & micro-stars (right).
 *  - Layer 4: Light Waves & Constellation Ripples — Expanding caustic water ripples (left);
 *             subtle energy trails & pulsing constellation nodes (right).
 *  - Layer 5: Central Energy Boundary — 1px sacred threshold with harmonic cyan breathing,
 *             gliding vertical light nodes, lateral ambient aura, and cross-boundary energy motes.
 *
 * Features:
 *  - 'menu' mode: Rich, living, continuous 60 FPS cinematic environment.
 *  - 'game' mode: Clean, calm solid dual-world extension matching in-game palette for zero puzzle distraction.
 *  - Object pooling with zero per-frame garbage collection allocations.
 *  - Reduced motion accessibility support (`prefers-reduced-motion`).
 *  - Tab visibility power-saving: pauses automatically when hidden, resumes without time jumps.
 *  - Instantaneous synchronous modal dimming (matching Phaser's 0.75 alpha dark overlay).
 */

export type BackdropMode = 'menu' | 'game';

export interface DualWorldThemeState {
  leftBrightness: number; // 0.0 (black) to 1.0 (pure white #FFFFFF)
  rightBrightness: number; // 0.0 (black) to 1.0 (shadow dark #101010)
  dividerAlpha: number; // 0.0 to 1.0
}

interface LightRay {
  x: number; // relative to halfW (0..1)
  width: number; // relative to canvas width
  speed: number;
  alpha: number;
  baseAlpha: number;
  phase: number;
}

interface Particle {
  x: number; // 0.0 to 1.0 relative to canvas width
  y: number; // 0.0 to 1.0 relative to canvas height
  vx: number;
  vy: number;
  baseRadius: number;
  alpha: number;
  baseAlpha: number;
  phase: number;
  swaySpeed: number;
  isRealSide: boolean;
  colorType: 'dust' | 'orb' | 'shadow' | 'cyan' | 'white' | 'boundary';
}

interface ThresholdNode {
  y: number; // 0.0 to 1.0 relative to canvas height
  speed: number;
  size: number;
  trailLength: number;
  alpha: number;
}

interface LightWave {
  x: number; // relative to canvas width
  y: number; // relative to canvas height
  radius: number;
  maxRadius: number;
  speed: number;
  alpha: number;
}

interface ConstellationPoint {
  x: number;
  y: number;
  baseAlpha: number;
  phase: number;
  radius: number;
}

export class BackdropRenderer {
  private static instance: BackdropRenderer | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private isRunning: boolean = false;
  private animFrameId: number | null = null;

  private mode: BackdropMode = 'menu';

  private themeState: DualWorldThemeState = {
    leftBrightness: 1.0,
    rightBrightness: 1.0,
    dividerAlpha: 0.7,
  };

  private isDimmed: boolean = false;
  private isReducedMotion: boolean = false;
  private isTabVisible: boolean = true;
  private lastTime: number = 0;

  // Layer 2: Light Rays
  private lightRays: LightRay[] = [];

  // Layer 3: Particles & Motes
  private particles: Particle[] = [];

  // Layer 4: Waves & Constellations
  private lightWaves: LightWave[] = [];
  private constellationPoints: ConstellationPoint[] = [];

  // Layer 5: Central Threshold Light Nodes
  private thresholdNodes: ThresholdNode[] = [];

  private constructor() {}

  public static getInstance(): BackdropRenderer {
    if (!BackdropRenderer.instance) {
      BackdropRenderer.instance = new BackdropRenderer();
    }
    return BackdropRenderer.instance;
  }

  public static setMode(mode: BackdropMode): void {
    const instance = BackdropRenderer.getInstance();
    instance.mode = mode;
  }

  public static getMode(): BackdropMode {
    const instance = BackdropRenderer.getInstance();
    return instance.mode;
  }

  public static setDimmed(dimmed: boolean): void {
    const instance = BackdropRenderer.getInstance();
    instance.isDimmed = dimmed;
  }

  public static init(): BackdropRenderer {
    const instance = BackdropRenderer.getInstance();
    instance.start();
    return instance;
  }

  public static setThemeState(state: Partial<DualWorldThemeState>): void {
    const instance = BackdropRenderer.getInstance();
    if (state.leftBrightness !== undefined) instance.themeState.leftBrightness = state.leftBrightness;
    if (state.rightBrightness !== undefined) instance.themeState.rightBrightness = state.rightBrightness;
    if (state.dividerAlpha !== undefined) instance.themeState.dividerAlpha = state.dividerAlpha;
  }

  public static resetThemeState(): void {
    const instance = BackdropRenderer.getInstance();
    instance.themeState.leftBrightness = 1.0;
    instance.themeState.rightBrightness = 1.0;
    instance.themeState.dividerAlpha = 0.7;
  }

  public start(): void {
    if (typeof window === 'undefined') return;

    this.canvas = document.getElementById('backdrop-canvas') as HTMLCanvasElement;
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'backdrop-canvas';
      document.body.prepend(this.canvas);
    }

    this.ctx = this.canvas.getContext('2d', { alpha: false });
    if (!this.ctx) return;

    // Accessibility motion preference check
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.isReducedMotion = motionQuery.matches;
    motionQuery.addEventListener('change', (e) => {
      this.isReducedMotion = e.matches;
    });

    // Tab visibility handling
    document.addEventListener('visibilitychange', () => {
      this.isTabVisible = !document.hidden;
      if (this.isTabVisible) {
        this.lastTime = performance.now();
      }
    });

    this.initPools();
    this.handleResize();

    window.addEventListener('resize', () => this.handleResize(), { passive: true });
    window.addEventListener('orientationchange', () => this.handleResize(), { passive: true });
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', () => this.handleResize(), { passive: true });
    }

    this.isRunning = true;
    this.lastTime = performance.now();
    this.loop = this.loop.bind(this);
    this.animFrameId = requestAnimationFrame(this.loop);
  }

  private handleResize(): void {
    if (!this.canvas || !this.ctx) return;
    const w = window.innerWidth || document.documentElement.clientWidth || 1280;
    const h = window.innerHeight || document.documentElement.clientHeight || 720;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    this.canvas.width = Math.floor(w * dpr);
    this.canvas.height = Math.floor(h * dpr);
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;
  }

  /**
   * Initializes all pre-allocated object pools once (zero per-frame allocations)
   */
  private initPools(): void {
    // 1. Layer 2: Light Rays (Real World)
    this.lightRays = [
      { x: 0.12, width: 0.16, speed: 0.00004, alpha: 0.045, baseAlpha: 0.045, phase: 0 },
      { x: 0.28, width: 0.22, speed: 0.00003, alpha: 0.038, baseAlpha: 0.038, phase: 2.1 },
      { x: 0.40, width: 0.14, speed: 0.00005, alpha: 0.05, baseAlpha: 0.05, phase: 4.3 },
    ];

    // 2. Layer 3: Particles & Motes
    this.particles = [];

    // Real World: 34 particles (dust + soft glowing orbs)
    for (let i = 0; i < 34; i++) {
      const isOrb = i < 6;
      this.particles.push({
        x: Math.random() * 0.47, // strictly in left half
        y: Math.random(),
        vx: (Math.random() - 0.5) * 0.0001,
        vy: -0.00012 - Math.random() * 0.00018, // gentle upward drift
        baseRadius: isOrb ? 4.5 + Math.random() * 4.0 : 1.2 + Math.random() * 2.0,
        alpha: isOrb ? 0.06 + Math.random() * 0.08 : 0.15 + Math.random() * 0.2,
        baseAlpha: isOrb ? 0.08 : 0.2,
        phase: Math.random() * Math.PI * 2,
        swaySpeed: 0.0008 + Math.random() * 0.0006,
        isRealSide: true,
        colorType: isOrb ? 'orb' : 'dust',
      });
    }

    // Shadow World: 42 particles (embers, cyan sparks, star motes)
    for (let i = 0; i < 42; i++) {
      const typeRand = Math.random();
      const colorType: 'shadow' | 'cyan' | 'white' =
        typeRand < 0.45 ? 'cyan' : typeRand < 0.75 ? 'shadow' : 'white';

      const isCyan = colorType === 'cyan';
      this.particles.push({
        x: 0.53 + Math.random() * 0.46, // strictly in right half
        y: Math.random(),
        vx: (Math.random() - 0.5) * 0.00012,
        vy: -0.00014 - Math.random() * 0.00022,
        baseRadius: isCyan ? 1.6 + Math.random() * 1.8 : 1.2 + Math.random() * 1.6,
        alpha: isCyan ? 0.4 + Math.random() * 0.35 : 0.2 + Math.random() * 0.3,
        baseAlpha: isCyan ? 0.55 : 0.35,
        phase: Math.random() * Math.PI * 2,
        swaySpeed: 0.001 + Math.random() * 0.0008,
        isRealSide: false,
        colorType,
      });
    }

    // Boundary Cross-World Energy Motes: 12 particles orbiting the center divider
    for (let i = 0; i < 12; i++) {
      this.particles.push({
        x: 0.5,
        y: Math.random(),
        vx: 0,
        vy: -0.00016 - Math.random() * 0.00018,
        baseRadius: 1.8 + Math.random() * 1.4,
        alpha: 0.5,
        baseAlpha: 0.55,
        phase: (i / 12) * Math.PI * 2,
        swaySpeed: 0.0014 + (i % 3) * 0.0004,
        isRealSide: false,
        colorType: 'boundary',
      });
    }

    // 3. Layer 4: Waves (Real) & Constellations (Shadow)
    this.lightWaves = [
      { x: 0.22, y: 0.55, radius: 40, maxRadius: 380, speed: 0.00012, alpha: 0.035 },
      { x: 0.35, y: 0.72, radius: 180, maxRadius: 420, speed: 0.0001, alpha: 0.03 },
    ];

    this.constellationPoints = [
      { x: 0.62, y: 0.25, baseAlpha: 0.4, phase: 0.2, radius: 2.0 },
      { x: 0.74, y: 0.38, baseAlpha: 0.5, phase: 1.8, radius: 2.2 },
      { x: 0.68, y: 0.62, baseAlpha: 0.45, phase: 3.4, radius: 1.8 },
      { x: 0.85, y: 0.52, baseAlpha: 0.55, phase: 4.9, radius: 2.4 },
      { x: 0.82, y: 0.78, baseAlpha: 0.4, phase: 2.6, radius: 2.0 },
      { x: 0.92, y: 0.32, baseAlpha: 0.48, phase: 5.7, radius: 1.9 },
    ];

    // 4. Layer 5: Threshold Traveling Light Nodes (Center Line)
    this.thresholdNodes = [
      { y: 0.15, speed: 0.00018, size: 3.2, trailLength: 85, alpha: 0.9 },
      { y: 0.65, speed: -0.00014, size: 2.8, trailLength: 70, alpha: 0.85 },
      { y: 0.9, speed: 0.00012, size: 2.4, trailLength: 60, alpha: 0.75 },
    ];
  }

  private loop(now: number): void {
    if (!this.isRunning) return;

    if (!this.isTabVisible) {
      this.animFrameId = requestAnimationFrame(this.loop);
      return;
    }

    const dt = Math.min(now - this.lastTime, 100);
    this.lastTime = now;

    this.render(now, dt);
    this.animFrameId = requestAnimationFrame(this.loop);
  }

  private render(now: number, dt: number): void {
    const ctx = this.ctx;
    const canvas = this.canvas;
    if (!ctx || !canvas) return;

    const w = canvas.width;
    const h = canvas.height;
    const halfW = Math.floor(w / 2);

    const { leftBrightness, rightBrightness, dividerAlpha } = this.themeState;

    // Instantaneous modal dimming (matching Phaser's 0.75 alpha dark overlay)
    const dimFactor = this.isDimmed ? 0.25 : 1.0;
    const isMenu = this.mode === 'menu' && !this.isReducedMotion;

    // =========================================================================
    // LAYER 1: BASE ENVIRONMENT & AMBIENT ILLUMINATION
    // =========================================================================

    // 1. Real World (Left) — Pure #FFFFFF with subtle atmospheric light drift
    const leftVal = Math.round(255 * leftBrightness * dimFactor);
    ctx.fillStyle = `rgb(${leftVal}, ${leftVal}, ${leftVal})`;
    ctx.fillRect(0, 0, halfW, h);

    if (isMenu && leftBrightness > 0.1 && dimFactor > 0.5) {
      // Soft flowing light pool shifting gently across the Real World
      const gx = halfW * 0.42 + Math.cos(now * 0.0004) * (halfW * 0.1);
      const gy = h * 0.45 + Math.sin(now * 0.0003) * (h * 0.08);
      const gradR = Math.max(halfW, h) * 0.68;

      const realGrad = ctx.createRadialGradient(gx, gy, 10, gx, gy, gradR);
      realGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
      realGrad.addColorStop(0.55, 'rgba(248, 250, 252, 0.25)');
      realGrad.addColorStop(1, 'rgba(241, 245, 249, 0)');

      ctx.fillStyle = realGrad;
      ctx.fillRect(0, 0, halfW, h);
    }

    // 2. Shadow World (Right) — Deep noir #101010 with subtle dark nebula drift
    const rightVal = Math.round(16 * rightBrightness * dimFactor);
    ctx.fillStyle = `rgb(${rightVal}, ${rightVal}, ${rightVal})`;
    ctx.fillRect(halfW, 0, w - halfW, h);

    if (isMenu && rightBrightness > 0.1 && dimFactor > 0.5) {
      // Deep nebular shadow current shifting slowly in the void
      const sx = halfW + (w - halfW) * 0.55 + Math.sin(now * 0.00035) * (halfW * 0.12);
      const sy = h * 0.5 + Math.cos(now * 0.00045) * (h * 0.1);
      const sGradR = Math.max(w - halfW, h) * 0.72;

      const shadowGrad = ctx.createRadialGradient(sx, sy, 20, sx, sy, sGradR);
      shadowGrad.addColorStop(0, 'rgba(18, 24, 38, 0.35)');
      shadowGrad.addColorStop(0.65, 'rgba(10, 14, 22, 0.15)');
      shadowGrad.addColorStop(1, 'rgba(8, 8, 8, 0)');

      ctx.fillStyle = shadowGrad;
      ctx.fillRect(halfW, 0, w - halfW, h);
    }

    // =========================================================================
    // LAYER 2: ATMOSPHERIC FLOWING LIGHT RAYS & SHADOW ENERGY WAVES
    // =========================================================================

    if (isMenu && dimFactor > 0.5) {
      // Real World: Flowing diagonal sunlight shafts
      if (leftBrightness > 0.15) {
        for (let i = 0; i < this.lightRays.length; i++) {
          const ray = this.lightRays[i];
          ray.x += ray.speed * dt;
          if (ray.x > 0.52) ray.x = -0.15;

          const rayAlpha =
            (ray.baseAlpha + Math.sin(now * 0.0012 + ray.phase) * 0.015) * leftBrightness;
          const rayX = ray.x * halfW;
          const rayW = ray.width * halfW;

          const rayGrad = ctx.createLinearGradient(rayX, 0, rayX + rayW * 1.4, h);
          rayGrad.addColorStop(0, `rgba(255, 255, 255, ${rayAlpha * 1.2})`);
          rayGrad.addColorStop(0.5, `rgba(248, 250, 252, ${rayAlpha * 0.8})`);
          rayGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

          ctx.fillStyle = rayGrad;
          ctx.beginPath();
          ctx.moveTo(rayX, 0);
          ctx.lineTo(rayX + rayW, 0);
          ctx.lineTo(rayX + rayW * 0.6 + h * 0.25, h);
          ctx.lineTo(rayX - rayW * 0.4 + h * 0.25, h);
          ctx.closePath();
          ctx.fill();
        }
      }

      // Shadow World: Undulating cyan energy waves
      if (rightBrightness > 0.15) {
        ctx.strokeStyle = `rgba(0, 229, 255, ${0.035 * rightBrightness})`;
        ctx.lineWidth = Math.max(24, Math.round(36 * (w / 1280)));

        const waveY1 = h * 0.35 + Math.sin(now * 0.0009) * 45;
        const waveY2 = h * 0.68 + Math.cos(now * 0.0008) * 55;

        ctx.beginPath();
        ctx.moveTo(halfW, waveY1);
        ctx.bezierCurveTo(
          halfW + (w - halfW) * 0.35,
          waveY1 - 50,
          halfW + (w - halfW) * 0.7,
          waveY1 + 50,
          w,
          waveY1 - 20
        );
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(halfW, waveY2);
        ctx.bezierCurveTo(
          halfW + (w - halfW) * 0.4,
          waveY2 + 60,
          halfW + (w - halfW) * 0.75,
          waveY2 - 40,
          w,
          waveY2 + 30
        );
        ctx.stroke();
      }
    }

    // =========================================================================
    // LAYER 3: MULTI-LAYER FLOATING PARTICLES, LUMINOUS MOTES & EMBERS
    // =========================================================================

    if (isMenu && dimFactor > 0.2) {
      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i];

        // Update positions with organic delta-time sway
        p.y += p.vy * (dt / 16.6);
        p.x += p.vx * (dt / 16.6);

        // Wrap around vertically
        if (p.y < -0.05) {
          p.y = 1.05;
          if (p.colorType === 'boundary') {
            p.x = 0.5;
          } else {
            p.x = p.isRealSide ? Math.random() * 0.47 : 0.53 + Math.random() * 0.46;
          }
        } else if (p.y > 1.05) {
          p.y = -0.05;
        }

        // Render Boundary Cross-World Energy Motes (Orbiting the central threshold)
        if (p.colorType === 'boundary') {
          const orbitOffset = Math.sin(p.phase + now * p.swaySpeed) * 0.035; // lateral drift across threshold
          const px = (0.5 + orbitOffset) * w;
          const py = p.y * h;
          const isLeft = px < halfW;

          const baseA = p.alpha * dimFactor;
          if (isLeft && leftBrightness > 0.1) {
            // Turning to slate shadow on Real side
            ctx.fillStyle = `rgba(30, 41, 59, ${baseA * leftBrightness * 0.6})`;
          } else if (!isLeft && rightBrightness > 0.1) {
            // Turning to luminous cyan on Shadow side
            ctx.fillStyle = `rgba(0, 229, 255, ${baseA * rightBrightness * 0.85})`;
          }

          ctx.beginPath();
          ctx.arc(px, py, p.baseRadius, 0, Math.PI * 2);
          ctx.fill();
          continue;
        }

        // Render Real World Particles
        if (p.isRealSide && leftBrightness > 0.1) {
          const px = (p.x + Math.sin(now * p.swaySpeed + p.phase) * 0.012) * w;
          const py = p.y * h;

          if (px >= halfW - 2) continue; // enforce split boundary

          const a = p.alpha * leftBrightness * dimFactor;

          if (p.colorType === 'orb') {
            // Soft atmospheric glowing circle (expands and breathes)
            const r = p.baseRadius * (1.0 + 0.25 * Math.sin(now * 0.002 + p.phase));
            const orbGrad = ctx.createRadialGradient(px, py, 1, px, py, r);
            orbGrad.addColorStop(0, `rgba(203, 213, 225, ${a * 0.8})`);
            orbGrad.addColorStop(0.6, `rgba(226, 232, 240, ${a * 0.4})`);
            orbGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

            ctx.fillStyle = orbGrad;
            ctx.beginPath();
            ctx.arc(px, py, r, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // Pale silver dust mote
            ctx.fillStyle = `rgba(148, 163, 184, ${a})`;
            ctx.beginPath();
            ctx.arc(px, py, p.baseRadius, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Render Shadow World Particles
        if (!p.isRealSide && rightBrightness > 0.1) {
          const px = (p.x + Math.sin(now * p.swaySpeed + p.phase) * 0.015) * w;
          const py = p.y * h;

          if (px <= halfW + 2) continue; // enforce split boundary

          const a = p.alpha * rightBrightness * dimFactor;

          if (p.colorType === 'cyan') {
            // Glowing cyan spark with soft halo
            ctx.fillStyle = `rgba(0, 229, 255, ${a})`;
            ctx.beginPath();
            ctx.arc(px, py, p.baseRadius, 0, Math.PI * 2);
            ctx.fill();

            // Subtle outer cyan halo
            ctx.fillStyle = `rgba(0, 229, 255, ${a * 0.2})`;
            ctx.beginPath();
            ctx.arc(px, py, p.baseRadius * 2.2, 0, Math.PI * 2);
            ctx.fill();
          } else if (p.colorType === 'white') {
            // Micro star mote
            ctx.fillStyle = `rgba(255, 255, 255, ${a * 0.9})`;
            ctx.beginPath();
            ctx.arc(px, py, p.baseRadius, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // Charcoal shadow ember
            ctx.fillStyle = `rgba(71, 85, 105, ${a * 0.6})`;
            ctx.beginPath();
            ctx.arc(px, py, p.baseRadius, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }

    // =========================================================================
    // LAYER 4: LIGHT WAVES (REAL) & CONSTELLATION POINTS (SHADOW)
    // =========================================================================

    if (isMenu && dimFactor > 0.4) {
      // Real World: Expanding circular light caustics
      if (leftBrightness > 0.2) {
        for (let i = 0; i < this.lightWaves.length; i++) {
          const wave = this.lightWaves[i];
          wave.radius += wave.speed * w * (dt / 16.6);
          if (wave.radius > wave.maxRadius) {
            wave.radius = 20;
          }

          const progress = wave.radius / wave.maxRadius;
          const waveA = wave.alpha * Math.sin(progress * Math.PI) * leftBrightness;

          ctx.strokeStyle = `rgba(203, 213, 225, ${waveA.toFixed(3)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(wave.x * halfW, wave.y * h, wave.radius, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // Shadow World: Pulsing constellation nodes with faint connecting lines
      if (rightBrightness > 0.2) {
        const points = this.constellationPoints;
        for (let i = 0; i < points.length; i++) {
          const pt = points[i];
          const px = pt.x * w;
          const py = pt.y * h;
          const ptA =
            (pt.baseAlpha + Math.sin(now * 0.0016 + pt.phase) * 0.2) * rightBrightness;

          ctx.fillStyle = `rgba(0, 229, 255, ${ptA.toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(px, py, pt.radius, 0, Math.PI * 2);
          ctx.fill();

          // Connect to adjacent node
          if (i < points.length - 1) {
            const next = points[i + 1];
            ctx.strokeStyle = `rgba(0, 229, 255, ${(ptA * 0.12).toFixed(3)})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(next.x * w, next.y * h);
            ctx.stroke();
          }
        }
      }
    }

    // =========================================================================
    // LAYER 5: CENTRAL ENERGY BOUNDARY — TWO REALITIES CONNECTED
    // =========================================================================

    if (dividerAlpha > 0.01) {
      const alpha = 0.7 * dividerAlpha * dimFactor;

      // 1. Base 1px dividing partition (#333333)
      ctx.strokeStyle = `rgba(51, 51, 51, ${alpha.toFixed(3)})`;
      ctx.lineWidth = Math.max(1, Math.round(1 * (window.devicePixelRatio || 1)));
      ctx.beginPath();
      ctx.moveTo(halfW, 0);
      ctx.lineTo(halfW, h);
      ctx.stroke();

      if (isMenu && dimFactor > 0.4) {
        // 2. Harmonic cyan energy breathing along the line
        const breathA = (0.35 + 0.25 * Math.sin(now * 0.0018)) * dividerAlpha;
        ctx.strokeStyle = `rgba(0, 229, 255, ${breathA.toFixed(3)})`;
        ctx.lineWidth = Math.max(1.5, Math.round(2 * (window.devicePixelRatio || 1)));
        ctx.beginPath();
        ctx.moveTo(halfW, 0);
        ctx.lineTo(halfW, h);
        ctx.stroke();

        // 3. Subtle lateral energy aura around the boundary (24px wide)
        const auraGrad = ctx.createLinearGradient(halfW - 14, 0, halfW + 14, 0);
        auraGrad.addColorStop(0, 'rgba(0, 229, 255, 0)');
        auraGrad.addColorStop(0.5, 'rgba(0, 229, 255, 0.07)');
        auraGrad.addColorStop(1, 'rgba(0, 229, 255, 0)');

        ctx.fillStyle = auraGrad;
        ctx.fillRect(halfW - 14, 0, 28, h);

        // 4. Vertical traveling light nodes along the threshold
        for (let i = 0; i < this.thresholdNodes.length; i++) {
          const node = this.thresholdNodes[i];
          node.y += node.speed * (dt / 16.6);
          if (node.y > 1.1) node.y = -0.1;
          else if (node.y < -0.1) node.y = 1.1;

          const ny = node.y * h;
          const nodeAlpha = node.alpha * dividerAlpha;

          // Luminous gradient trail
          const trailH = node.trailLength * (h / 720);
          const trailGrad = ctx.createLinearGradient(
            halfW,
            ny - trailH / 2,
            halfW,
            ny + trailH / 2
          );
          trailGrad.addColorStop(0, 'rgba(0, 229, 255, 0)');
          trailGrad.addColorStop(0.5, `rgba(0, 229, 255, ${nodeAlpha * 0.85})`);
          trailGrad.addColorStop(1, 'rgba(0, 229, 255, 0)');

          ctx.strokeStyle = trailGrad;
          ctx.lineWidth = Math.max(2, Math.round(2.5 * (window.devicePixelRatio || 1)));
          ctx.beginPath();
          ctx.moveTo(halfW, ny - trailH / 2);
          ctx.lineTo(halfW, ny + trailH / 2);
          ctx.stroke();

          // Glowing energy bead core
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(halfW, ny, node.size * 0.65, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = `rgba(0, 229, 255, ${nodeAlpha * 0.5})`;
          ctx.beginPath();
          ctx.arc(halfW, ny, node.size * 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }

  public stop(): void {
    this.isRunning = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }
}
