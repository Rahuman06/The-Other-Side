import { MoveDirection } from '../engine/MovementEngine';

export interface MobileControlsCallbacks {
  onDirection: (dir: MoveDirection) => void;
  onRestart?: () => void;
  onPause?: () => void;
}

export class MobileControlsOverlay {
  private static instance: MobileControlsOverlay | null = null;
  private rootEl: HTMLElement | null = null;
  private callbacks: MobileControlsCallbacks | null = null;
  private isVisible = false;

  private constructor() {
    this.createDomOverlay();
    this.setupOrientationHandler();
  }

  public static getInstance(): MobileControlsOverlay {
    if (!MobileControlsOverlay.instance) {
      MobileControlsOverlay.instance = new MobileControlsOverlay();
    }
    return MobileControlsOverlay.instance;
  }

  public setCallbacks(callbacks: MobileControlsCallbacks): void {
    this.callbacks = callbacks;
  }

  public setVisible(visible: boolean): void {
    this.isVisible = visible;
    if (this.rootEl) {
      if (visible) {
        this.rootEl.classList.add('visible');
        this.rootEl.classList.remove('hidden');
      } else {
        this.rootEl.classList.remove('visible');
        this.rootEl.classList.add('hidden');
      }
    }
  }

  public get visible(): boolean {
    return this.isVisible;
  }

  /**
   * Requests landscape orientation via Screen Orientation API where supported
   */
  public requestLandscape(): void {
    if (typeof screen !== 'undefined' && 'orientation' in screen) {
      const orientation = screen.orientation as ScreenOrientation & {
        lock?: (o: string) => Promise<void>;
      };
      if (typeof orientation.lock === 'function') {
        orientation.lock('landscape').catch(() => {
          // Gracefully ignored on platforms where programmatic lock is restricted
        });
      }
    }
  }

  private setupOrientationHandler(): void {
    if (typeof window === 'undefined') return;

    // Attempt orientation lock on first touch interaction
    const unlockOrientation = () => {
      this.requestLandscape();
      window.removeEventListener('pointerdown', unlockOrientation);
      window.removeEventListener('touchstart', unlockOrientation);
    };

    window.addEventListener('pointerdown', unlockOrientation, { once: true, passive: true });
    window.addEventListener('touchstart', unlockOrientation, { once: true, passive: true });
  }

  private createDomOverlay(): void {
    if (typeof document === 'undefined') return;

    let root = document.getElementById('mobile-controls-root');
    if (!root) {
      root = document.createElement('div');
      root.id = 'mobile-controls-root';
      root.className = 'mobile-controls hidden';
      root.setAttribute('aria-label', 'Integrated Mobile Touch Controls');
      document.body.appendChild(root);
    }
    this.rootEl = root;

    // Integrated Game Layout per Design Specification:
    // BOTTOM-LEFT:  [ LEFT ] [ RIGHT ] (Horizontal)
    // BOTTOM-RIGHT: [ UP ] / [ DOWN ]  (Vertical Stack)
    this.rootEl.innerHTML = `
      <div class="mobile-cluster-left" id="mobile-cluster-left" role="group" aria-label="Horizontal Directional Controls">
        <button class="mobile-btn dpad-btn btn-left dpad-left" id="btn-mobile-left" data-dir="left" aria-label="Move Left">
          <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
        <button class="mobile-btn dpad-btn btn-right dpad-right" id="btn-mobile-right" data-dir="right" aria-label="Move Right">
          <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
      </div>

      <div class="mobile-cluster-right" id="mobile-cluster-right" role="group" aria-label="Vertical Directional Controls">
        <button class="mobile-btn dpad-btn btn-up dpad-up" id="btn-mobile-up" data-dir="up" aria-label="Move Up">
          <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="19" x2="12" y2="5"></line>
            <polyline points="5 12 12 5 19 12"></polyline>
          </svg>
        </button>
        <button class="mobile-btn dpad-btn btn-down dpad-down" id="btn-mobile-down" data-dir="down" aria-label="Move Down">
          <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <polyline points="19 12 12 19 5 12"></polyline>
          </svg>
        </button>
      </div>
    `;

    this.attachButtonEvents();
  }

  private attachButtonEvents(): void {
    if (!this.rootEl) return;

    const dirs: Array<{ id: string; dir: MoveDirection }> = [
      { id: 'btn-mobile-left', dir: 'left' },
      { id: 'btn-mobile-right', dir: 'right' },
      { id: 'btn-mobile-up', dir: 'up' },
      { id: 'btn-mobile-down', dir: 'down' },
    ];

    dirs.forEach(({ id, dir }) => {
      const btn = this.rootEl!.querySelector(`#${id}`) as HTMLButtonElement | null;
      if (!btn) return;

      const trigger = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        btn.classList.add('pressed');
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          try {
            navigator.vibrate(10);
          } catch {
            // Ignored if vibration not permitted
          }
        }
        this.callbacks?.onDirection(dir);
      };

      const release = (e: Event) => {
        e.preventDefault();
        btn.classList.remove('pressed');
      };

      btn.addEventListener('pointerdown', trigger);
      btn.addEventListener('pointerup', release);
      btn.addEventListener('pointercancel', release);
      btn.addEventListener('pointerleave', release);
    });
  }

  public destroy(): void {
    if (this.rootEl && this.rootEl.parentElement) {
      this.rootEl.parentElement.removeChild(this.rootEl);
    }
    this.rootEl = null;
    MobileControlsOverlay.instance = null;
  }
}
