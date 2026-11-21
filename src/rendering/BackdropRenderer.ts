/**
 * BackdropRenderer.ts
 *
 * Renders an ambient dual-world background covering the entire device viewport (100vw x 100vh)
 * on mobile devices, tablets, and widescreen displays.
 *
 * The gameplay canvas (1280x720) sits centered in front of this backdrop, while the outer
 * screen edges seamlessly extend the two worlds:
 *  - Left half: Real World (pure #FFFFFF, subtle architectural floor grid, soft dust particles).
 *  - Right half: Shadow World (deep noir #101010, subtle floor grid, luminous cyan/white embers).
 *  - Center line: Exact 1px divider aligned with the game's central partition.
 */

export interface DualWorldThemeState {
  leftBrightness: number; // 0.0 (black) to 1.0 (pure white #FFFFFF)
  rightBrightness: number; // 0.0 (black) to 1.0 (shadow dark #101010)
  dividerAlpha: number; // 0.0 to 1.0
}

interface Particle {
  x: number; // 0.0 to 1.0 relative to canvas width
  y: number; // 0.0 to 1.0 relative to canvas height
  vx: number;
  vy: number;
  baseRadius: number;
  alpha: number;
  phase: number;
  isRealSide: boolean;
  colorType: 'dust' | 'cyan' | 'white';
}

export class BackdropRenderer {
  private static instance: BackdropRenderer | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private isRunning: boolean = false;
  private animFrameId: number | null = null;

  private themeState: DualWorldThemeState = {
    leftBrightness: 1.0,
    rightBrightness: 1.0,
    dividerAlpha: 0.7,
  };

  private particles: Particle[] = [];
  private isReducedMotion: boolean = false;
  private lastTime: number = 0;

  private constructor() {}

  public static getInstance(): BackdropRenderer {
    if (!BackdropRenderer.instance) {
      BackdropRenderer.instance = new BackdropRenderer();
    }
    return BackdropRenderer.instance;
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

    // Check system reduced motion
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.isReducedMotion = motionQuery.matches;
    motionQuery.addEventListener('change', (e) => {
      this.isReducedMotion = e.matches;
    });

    this.initParticles();
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
    // Cap pixel ratio at 1.5 to save mobile battery while staying sharp
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    this.canvas.width = Math.floor(w * dpr);
    this.canvas.height = Math.floor(h * dpr);
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;
  }

  private initParticles(): void {
    this.particles = [];
    const count = 32;

    for (let i = 0; i < count; i++) {
      const isRealSide = i < count / 2;
      const x = isRealSide
        ? Math.random() * 0.48 // left half
        : 0.52 + Math.random() * 0.48; // right half

      const colorType: 'dust' | 'cyan' | 'white' = isRealSide
        ? 'dust'
        : Math.random() < 0.6
        ? 'cyan'
        : 'white';

      this.particles.push({
        x,
        y: Math.random(),
        vx: (Math.random() - 0.5) * 0.00015,
        vy: -0.0002 - Math.random() * 0.0003, // gently drifting upward
        baseRadius: 1.2 + Math.random() * 1.8,
        alpha: 0.15 + Math.random() * 0.25,
        phase: Math.random() * Math.PI * 2,
        isRealSide,
        colorType,
      });
    }
  }

  private loop(now: number): void {
    if (!this.isRunning) return;
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

    // 1. Draw Left World (Real World)
    const leftVal = Math.round(255 * leftBrightness);
    ctx.fillStyle = `rgb(${leftVal}, ${leftVal}, ${leftVal})`;
    ctx.fillRect(0, 0, halfW, h);

    // 2. Draw Right World (Shadow World)
    // Interpolates from black (0) to #101010 (16, 16, 16)
    const rightVal = Math.round(16 * rightBrightness);
    ctx.fillStyle = `rgb(${rightVal}, ${rightVal}, ${rightVal})`;
    ctx.fillRect(halfW, 0, w - halfW, h);

    // 3. Subtle floor grid pattern (extending in-game floor tiles to screen edges)
    const gridSize = Math.floor(64 * (w / (window.innerWidth || 1)));
    ctx.lineWidth = 1;

    // Left floor grid
    if (leftBrightness > 0.1) {
      ctx.strokeStyle = `rgba(0, 0, 0, ${0.035 * leftBrightness})`;
      ctx.beginPath();
      for (let x = halfW % gridSize; x < halfW; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(halfW, y);
      }
      ctx.stroke();
    }

    // Right floor grid
    if (rightBrightness > 0.1) {
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.035 * rightBrightness})`;
      ctx.beginPath();
      for (let x = halfW; x < w; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.moveTo(halfW, y);
        ctx.lineTo(w, y);
      }
      ctx.stroke();
    }

    // 4. Center Divider Line
    if (dividerAlpha > 0.01) {
      ctx.strokeStyle = `rgba(100, 100, 100, ${0.7 * dividerAlpha})`;
      ctx.lineWidth = Math.max(1, Math.round(1 * (w / (window.innerWidth || 1))));
      ctx.beginPath();
      ctx.moveTo(halfW, 0);
      ctx.lineTo(halfW, h);
      ctx.stroke();
    }

    // 5. Ambient Particles (Floating gently in the outer margins)
    if (!this.isReducedMotion) {
      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i];

        // Update position
        p.y += p.vy * (dt / 16.6);
        p.x += p.vx * (dt / 16.6) + Math.sin(now * 0.001 + p.phase) * 0.00008;

        // Wrap around
        if (p.y < -0.05) {
          p.y = 1.05;
          p.x = p.isRealSide
            ? Math.random() * 0.48
            : 0.52 + Math.random() * 0.48;
        }

        const px = p.x * w;
        const py = p.y * h;

        // Draw particle
        if (p.isRealSide && leftBrightness > 0.1) {
          const a = p.alpha * leftBrightness;
          ctx.fillStyle = `rgba(20, 20, 20, ${a})`;
          ctx.beginPath();
          ctx.arc(px, py, p.baseRadius, 0, Math.PI * 2);
          ctx.fill();
        } else if (!p.isRealSide && rightBrightness > 0.1) {
          const a = p.alpha * rightBrightness;
          if (p.colorType === 'cyan') {
            ctx.fillStyle = `rgba(0, 229, 255, ${a * 1.2})`;
          } else {
            ctx.fillStyle = `rgba(255, 255, 255, ${a})`;
          }
          ctx.beginPath();
          ctx.arc(px, py, p.baseRadius, 0, Math.PI * 2);
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
