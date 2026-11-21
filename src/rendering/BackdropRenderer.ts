/**
 * BackdropRenderer.ts
 *
 * Renders an ambient dual-world background covering the entire device viewport (100vw x 100vh)
 * on mobile devices, tablets, and widescreen displays.
 *
 * The gameplay canvas (1280x720) sits centered in front of this backdrop, while the outer
 * screen edges seamlessly extend the two worlds:
 *  - Left half: Real World (pure #FFFFFF matching PALETTE.real.background).
 *  - Right half: Shadow World (deep noir #101010 matching PALETTE.shadow.background).
 *  - Center line: Exact 1px divider aligned with the game's central partition (#333333).
 *
 * Zero artificial grids, zero foreign particles, zero visible seams — completely indistinguishable
 * from the game canvas.
 */

export interface DualWorldThemeState {
  leftBrightness: number; // 0.0 (black) to 1.0 (pure white #FFFFFF)
  rightBrightness: number; // 0.0 (black) to 1.0 (shadow dark #101010)
  dividerAlpha: number; // 0.0 to 1.0
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

  private isDimmed: boolean = false;

  private constructor() {}

  public static getInstance(): BackdropRenderer {
    if (!BackdropRenderer.instance) {
      BackdropRenderer.instance = new BackdropRenderer();
    }
    return BackdropRenderer.instance;
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

    this.handleResize();

    window.addEventListener('resize', () => this.handleResize(), { passive: true });
    window.addEventListener('orientationchange', () => this.handleResize(), { passive: true });
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', () => this.handleResize(), { passive: true });
    }

    this.isRunning = true;
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

  private loop(): void {
    if (!this.isRunning) return;
    this.render();
    this.animFrameId = requestAnimationFrame(this.loop);
  }

  private render(): void {
    const ctx = this.ctx;
    const canvas = this.canvas;
    if (!ctx || !canvas) return;

    const w = canvas.width;
    const h = canvas.height;
    const halfW = Math.floor(w / 2);

    const { leftBrightness, rightBrightness, dividerAlpha } = this.themeState;

    // Instant synchronous dimming matching Phaser modal backdrop (0.75 alpha dark tint)
    const dimFactor = this.isDimmed ? 0.25 : 1.0;

    // 1. Draw Left World (Real World) — Pure #FFFFFF (255, 255, 255)
    const leftVal = Math.round(255 * leftBrightness * dimFactor);
    ctx.fillStyle = `rgb(${leftVal}, ${leftVal}, ${leftVal})`;
    ctx.fillRect(0, 0, halfW, h);

    // 2. Draw Right World (Shadow World) — Pure #101010 (16, 16, 16)
    const rightVal = Math.round(16 * rightBrightness * dimFactor);
    ctx.fillStyle = `rgb(${rightVal}, ${rightVal}, ${rightVal})`;
    ctx.fillRect(halfW, 0, w - halfW, h);

    // 3. Center Divider Line — Exact 1px #333333 at 0.7 alpha matching in-game divider
    if (dividerAlpha > 0.01) {
      const alpha = 0.7 * dividerAlpha * dimFactor;
      ctx.strokeStyle = `rgba(51, 51, 51, ${alpha.toFixed(3)})`;
      ctx.lineWidth = Math.max(1, Math.round(1 * (window.devicePixelRatio || 1)));
      ctx.beginPath();
      ctx.moveTo(halfW, 0);
      ctx.lineTo(halfW, h);
      ctx.stroke();
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
