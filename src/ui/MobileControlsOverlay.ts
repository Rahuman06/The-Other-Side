import { MoveDirection } from '../engine/MovementEngine';

export interface MobileControlsCallbacks {
  onDirection: (dir: MoveDirection) => void;
  onRestart: () => void;
  onPause: () => void;
}

export class MobileControlsOverlay {
  private static instance: MobileControlsOverlay | null = null;
  private rootEl: HTMLElement | null = null;
  private callbacks: MobileControlsCallbacks | null = null;
  private isVisible = false;

  private constructor() {
    this.createDomOverlay();
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

  private createDomOverlay(): void {
    if (typeof document === 'undefined') return;

    let root = document.getElementById('mobile-controls-root');
    if (!root) {
      root = document.createElement('div');
      root.id = 'mobile-controls-root';
      root.className = 'mobile-controls hidden';
      root.setAttribute('aria-label', 'Mobile Touch Controls');
      document.body.appendChild(root);
    }
    this.rootEl = root;

    // Cross-shaped D-pad container (Row 1: Up, Row 2: Left/Right, Row 3: Down)
    this.rootEl.innerHTML = `
      <div class="dpad-container" id="dpad-container" role="group" aria-label="Directional Controls">
        <button class="dpad-btn dpad-up" id="btn-dpad-up" data-dir="up" aria-label="Move Up">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
            <path d="M12 4l-8 8h5v8h6v-8h5z"/>
          </svg>
        </button>
        <button class="dpad-btn dpad-left" id="btn-dpad-left" data-dir="left" aria-label="Move Left">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
            <path d="M4 12l8-8v5h8v6h-8v5z"/>
          </svg>
        </button>
        <button class="dpad-btn dpad-right" id="btn-dpad-right" data-dir="right" aria-label="Move Right">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
            <path d="M20 12l-8-8v5H4v6h8v5z"/>
          </svg>
        </button>
        <button class="dpad-btn dpad-down" id="btn-dpad-down" data-dir="down" aria-label="Move Down">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
            <path d="M12 20l8-8h-5V4H9v8H4z"/>
          </svg>
        </button>
      </div>

      <div class="action-container" id="action-container" role="group" aria-label="Game Action Buttons">
        <button class="action-btn action-restart" id="btn-action-restart" aria-label="Restart Level (R)">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
            <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6 0 2.97-2.16 5.44-5 5.92v2.02c3.95-.49 7-3.85 7-7.94 0-4.42-3.58-8-8-8zm-6 8c0-1.65.67-3.15 1.76-4.24L6.34 7.34C4.9 8.79 4 10.79 4 13c0 4.08 3.05 7.44 7 7.93v-2.02c-2.84-.48-5-2.95-5-5.91z"/>
          </svg>
        </button>
        <button class="action-btn action-pause" id="btn-action-pause" aria-label="Pause Game (ESC)">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
          </svg>
        </button>
      </div>
    `;

    this.attachButtonEvents();
  }

  private attachButtonEvents(): void {
    if (!this.rootEl) return;

    const dirs: Array<{ id: string; dir: MoveDirection }> = [
      { id: 'btn-dpad-up', dir: 'up' },
      { id: 'btn-dpad-down', dir: 'down' },
      { id: 'btn-dpad-left', dir: 'left' },
      { id: 'btn-dpad-right', dir: 'right' },
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
            navigator.vibrate(8);
          } catch {
            // Ignored if not permitted
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

    // Action buttons
    const restartBtn = this.rootEl.querySelector('#btn-action-restart') as HTMLButtonElement | null;
    if (restartBtn) {
      restartBtn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        restartBtn.classList.add('pressed');
        this.callbacks?.onRestart();
      });
      restartBtn.addEventListener('pointerup', () => restartBtn.classList.remove('pressed'));
      restartBtn.addEventListener('pointercancel', () => restartBtn.classList.remove('pressed'));
      restartBtn.addEventListener('pointerleave', () => restartBtn.classList.remove('pressed'));
    }

    const pauseBtn = this.rootEl.querySelector('#btn-action-pause') as HTMLButtonElement | null;
    if (pauseBtn) {
      pauseBtn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        pauseBtn.classList.add('pressed');
        this.callbacks?.onPause();
      });
      pauseBtn.addEventListener('pointerup', () => pauseBtn.classList.remove('pressed'));
      pauseBtn.addEventListener('pointercancel', () => pauseBtn.classList.remove('pressed'));
      pauseBtn.addEventListener('pointerleave', () => pauseBtn.classList.remove('pressed'));
    }
  }

  public destroy(): void {
    if (this.rootEl && this.rootEl.parentElement) {
      this.rootEl.parentElement.removeChild(this.rootEl);
    }
    this.rootEl = null;
    MobileControlsOverlay.instance = null;
  }
}
