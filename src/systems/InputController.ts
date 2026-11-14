import { MoveDirection } from '../engine/MovementEngine';
import { KeyboardNavManager } from '../ui/KeyboardNavManager';

export interface InputTarget {
  onDirection: (direction: MoveDirection) => void;
  onPause?: () => void;
  onRestart?: () => void;
}

export class InputController {
  private readonly target: InputTarget;
  private readonly heldKeys: Set<string> = new Set();
  private isEnabled = true;

  private keyDownHandler: ((e: KeyboardEvent) => void) | null = null;
  private keyUpHandler: ((e: KeyboardEvent) => void) | null = null;
  private blurHandler: (() => void) | null = null;
  private windowRef: Window | null = null;

  constructor(target: InputTarget) {
    this.target = target;
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (!enabled) {
      this.heldKeys.clear();
    }
  }

  public attach(win: Window = window): void {
    if (!win) return;
    this.windowRef = win;

    this.keyDownHandler = (e: KeyboardEvent) => {
      // First allow KeyboardNavManager to handle menu/modal navigation
      const navManager = KeyboardNavManager.getInstance();
      if (navManager.handleKeyDown(e)) {
        return;
      }

      this.handleKeyDown(e);
    };

    this.keyUpHandler = (e: KeyboardEvent) => {
      this.handleKeyUp(e);
    };

    this.blurHandler = () => {
      this.handleBlur();
    };

    win.addEventListener('keydown', this.keyDownHandler);
    win.addEventListener('keyup', this.keyUpHandler);
    win.addEventListener('blur', this.blurHandler);
  }

  public detach(): void {
    if (this.windowRef) {
      if (this.keyDownHandler) {
        this.windowRef.removeEventListener('keydown', this.keyDownHandler);
        this.keyDownHandler = null;
      }
      if (this.keyUpHandler) {
        this.windowRef.removeEventListener('keyup', this.keyUpHandler);
        this.keyUpHandler = null;
      }
      if (this.blurHandler) {
        this.windowRef.removeEventListener('blur', this.blurHandler);
        this.blurHandler = null;
      }
      this.windowRef = null;
    }
    this.heldKeys.clear();
  }

  public handleKeyDown(e: { key: string; repeat?: boolean; preventDefault?: () => void }): boolean {
    if (!this.isEnabled) return false;

    // Isolate input: Do not process gameplay controls when a modal or menu has focus
    if (KeyboardNavManager.getInstance().isInputTrapped()) {
      return false;
    }

    // Ignore OS key auto-repeat when held
    if (e.repeat) {
      return false;
    }

    const key = e.key.toLowerCase();

    // Prevent duplicate triggers if key is already held
    if (this.heldKeys.has(key)) {
      return false;
    }

    this.heldKeys.add(key);

    switch (key) {
      case 'arrowleft':
      case 'a':
        e.preventDefault?.();
        this.target.onDirection('left');
        return true;
      case 'arrowright':
      case 'd':
        e.preventDefault?.();
        this.target.onDirection('right');
        return true;
      case 'arrowup':
      case 'w':
        e.preventDefault?.();
        this.target.onDirection('up');
        return true;
      case 'arrowdown':
      case 's':
        e.preventDefault?.();
        this.target.onDirection('down');
        return true;
      case 'p':
      case 'escape':
        e.preventDefault?.();
        this.target.onPause?.();
        return true;
      case 'r':
        e.preventDefault?.();
        this.target.onRestart?.();
        return true;
      default:
        return false;
    }
  }

  public handleKeyUp(e: { key: string }): void {
    const key = e.key.toLowerCase();
    this.heldKeys.delete(key);
  }

  public handleBlur(): void {
    // Reset all held keys on window focus loss
    this.heldKeys.clear();
  }

  public isKeyHeld(key: string): boolean {
    return this.heldKeys.has(key.toLowerCase());
  }

  public getHeldKeysCount(): number {
    return this.heldKeys.size;
  }
}
