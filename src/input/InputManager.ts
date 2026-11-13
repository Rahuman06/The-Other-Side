import { Direction } from '../types/game.js';

export interface InputHandlers {
  onMove: (dir: Direction) => void;
  onRestart: () => void;
  onUndo: () => void;
  onPause: () => void;
  onMuteToggle: () => void;
}

export class InputManager {
  private handlers: InputHandlers;
  private keydownListener: ((e: KeyboardEvent) => void) | null = null;
  private touchStartX = 0;
  private touchStartY = 0;
  private touchStartTime = 0;
  private touchStartListener: ((e: TouchEvent) => void) | null = null;
  private touchEndListener: ((e: TouchEvent) => void) | null = null;
  private isEnabled = true;

  constructor(handlers: InputHandlers) {
    this.handlers = handlers;
    this.attach();
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  public attach(): void {
    if (typeof window === 'undefined') return;

    this.keydownListener = (e: KeyboardEvent) => {
      if (!this.isEnabled) return;

      const key = e.key.toLowerCase();

      switch (key) {
        case 'arrowup':
        case 'w':
          e.preventDefault();
          this.handlers.onMove('up');
          break;
        case 'arrowdown':
        case 's':
          e.preventDefault();
          this.handlers.onMove('down');
          break;
        case 'arrowleft':
        case 'a':
          e.preventDefault();
          this.handlers.onMove('left');
          break;
        case 'arrowright':
        case 'd':
          e.preventDefault();
          this.handlers.onMove('right');
          break;
        case 'r':
          e.preventDefault();
          this.handlers.onRestart();
          break;
        case 'z':
        case 'u':
          e.preventDefault();
          this.handlers.onUndo();
          break;
        case 'p':
        case 'escape':
          e.preventDefault();
          this.handlers.onPause();
          break;
        case 'm':
          e.preventDefault();
          this.handlers.onMuteToggle();
          break;
      }
    };

    window.addEventListener('keydown', this.keydownListener);

    this.touchStartListener = (e: TouchEvent) => {
      if (!this.isEnabled || e.touches.length === 0) return;
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
      this.touchStartTime = Date.now();
    };

    this.touchEndListener = (e: TouchEvent) => {
      if (!this.isEnabled || e.changedTouches.length === 0) return;
      const dx = e.changedTouches[0].clientX - this.touchStartX;
      const dy = e.changedTouches[0].clientY - this.touchStartY;
      const elapsed = Date.now() - this.touchStartTime;

      // Minimum swipe distance of 25px within 600ms
      const minDistance = 25;
      if (elapsed > 600) return;

      if (Math.abs(dx) > Math.abs(dy)) {
        if (Math.abs(dx) >= minDistance) {
          if (dx > 0) {
            this.handlers.onMove('right');
          } else {
            this.handlers.onMove('left');
          }
        }
      } else {
        if (Math.abs(dy) >= minDistance) {
          if (dy > 0) {
            this.handlers.onMove('down');
          } else {
            this.handlers.onMove('up');
          }
        }
      }
    };

    window.addEventListener('touchstart', this.touchStartListener, { passive: true });
    window.addEventListener('touchend', this.touchEndListener, { passive: true });
  }

  public detach(): void {
    if (typeof window === 'undefined') return;

    if (this.keydownListener) {
      window.removeEventListener('keydown', this.keydownListener);
      this.keydownListener = null;
    }
    if (this.touchStartListener) {
      window.removeEventListener('touchstart', this.touchStartListener);
      this.touchStartListener = null;
    }
    if (this.touchEndListener) {
      window.removeEventListener('touchend', this.touchEndListener);
      this.touchEndListener = null;
    }
  }
}
