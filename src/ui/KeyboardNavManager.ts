import type Phaser from 'phaser';

export interface FocusableItem {
  id: string;
  getBounds: () => { x: number; y: number; width: number; height: number };
  onActivate: () => void;
  onLeft?: () => void;
  onRight?: () => void;
  row?: number;
  col?: number;
}

export interface FocusContext {
  id: string;
  items: FocusableItem[];
  selectedIndex: number;
  gridCols?: number;
  onEscape?: () => void;
  trapFocus?: boolean;
}

export class KeyboardNavManager {
  private static instance: KeyboardNavManager | null = null;

  private contextStack: FocusContext[] = [];
  private focusGraphics: Phaser.GameObjects.Graphics | null = null;
  private currentScene: Phaser.Scene | null = null;
  private isEnabled = true;

  private constructor() {}

  public static getInstance(): KeyboardNavManager {
    if (!KeyboardNavManager.instance) {
      KeyboardNavManager.instance = new KeyboardNavManager();
    }
    return KeyboardNavManager.instance;
  }

  public setScene(scene: Phaser.Scene): void {
    this.currentScene = scene;
    if (this.focusGraphics) {
      try {
        this.focusGraphics.destroy();
      } catch {
        // Ignored in test environment
      }
    }
    if (scene && scene.add) {
      this.focusGraphics = scene.add.graphics();
      this.focusGraphics.setDepth(9999);
    } else {
      this.focusGraphics = null;
    }
    this.renderFocus();
  }

  public getCurrentScene(): Phaser.Scene | null {
    return this.currentScene;
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (!enabled) {
      this.clearFocusGraphic();
    } else {
      this.renderFocus();
    }
  }

  public pushContext(context: FocusContext): void {
    // If context already exists, remove it first
    this.contextStack = this.contextStack.filter((c) => c.id !== context.id);
    if (context.selectedIndex < 0 || context.selectedIndex >= context.items.length) {
      context.selectedIndex = 0;
    }
    this.contextStack.push(context);
    this.renderFocus();
  }

  public popContext(contextId?: string): FocusContext | undefined {
    let popped: FocusContext | undefined;
    if (contextId) {
      const idx = this.contextStack.findIndex((c) => c.id === contextId);
      if (idx !== -1) {
        popped = this.contextStack.splice(idx, 1)[0];
      }
    } else {
      popped = this.contextStack.pop();
    }
    this.renderFocus();
    return popped;
  }

  public updateContextItems(contextId: string, items: FocusableItem[], retainIndex = true): void {
    const ctx = this.contextStack.find((c) => c.id === contextId);
    if (!ctx) return;
    ctx.items = items;
    if (!retainIndex || ctx.selectedIndex >= items.length) {
      ctx.selectedIndex = Math.max(0, Math.min(ctx.selectedIndex, items.length - 1));
    }
    this.renderFocus();
  }

  public getActiveContext(): FocusContext | undefined {
    if (this.contextStack.length === 0) return undefined;
    return this.contextStack[this.contextStack.length - 1];
  }

  public getSelectedIndex(): number {
    const active = this.getActiveContext();
    return active ? active.selectedIndex : -1;
  }

  public setSelectedIndex(index: number): void {
    const active = this.getActiveContext();
    if (active && index >= 0 && index < active.items.length) {
      active.selectedIndex = index;
      this.renderFocus();
    }
  }

  public isInputTrapped(): boolean {
    const active = this.getActiveContext();
    if (!active) return false;
    return active.trapFocus !== false;
  }

  public hasActiveModal(): boolean {
    const active = this.getActiveContext();
    if (!active) return false;
    return active.id.toLowerCase().includes('modal') || active.id.toLowerCase().includes('dialog');
  }

  public setFocusById(itemId: string): boolean {
    const active = this.getActiveContext();
    if (!active) return false;
    const idx = active.items.findIndex((item) => item.id === itemId);
    if (idx !== -1) {
      active.selectedIndex = idx;
      this.renderFocus();
      return true;
    }
    return false;
  }

  public setFocusByIndex(index: number): boolean {
    const active = this.getActiveContext();
    if (!active || active.items.length === 0) return false;
    if (index >= 0 && index < active.items.length) {
      active.selectedIndex = index;
      this.renderFocus();
      return true;
    }
    return false;
  }

  public handleKeyDown(e: KeyboardEvent): boolean {
    if (!this.isEnabled) return false;
    const active = this.getActiveContext();
    if (!active || active.items.length === 0) {
      return false;
    }

    const key = e.key;
    const lowerKey = key.toLowerCase();
    const count = active.items.length;
    const current = active.items[active.selectedIndex];

    // 1. ESCAPE: Context-aware dismiss / return
    if (lowerKey === 'escape') {
      if (active.onEscape) {
        e.preventDefault();
        active.onEscape();
        return true;
      }
      return false;
    }

    // 2. TAB / SHIFT+TAB: Sequential cyclical navigation
    if (lowerKey === 'tab') {
      e.preventDefault();
      if (e.shiftKey) {
        active.selectedIndex = (active.selectedIndex - 1 + count) % count;
      } else {
        active.selectedIndex = (active.selectedIndex + 1) % count;
      }
      this.renderFocus();
      return true;
    }

    // 3. ENTER / SPACE: Activate focused item
    if (lowerKey === 'enter' || key === ' ') {
      e.preventDefault();
      if (current && current.onActivate) {
        current.onActivate();
        return true;
      }
      return false;
    }

    // 4. ARROW KEYS
    if (active.gridCols && active.gridCols > 1) {
      // 2D Grid navigation
      const cols = active.gridCols;
      const idx = active.selectedIndex;

      switch (lowerKey) {
        case 'arrowright':
          e.preventDefault();
          if (current?.onRight) {
            current.onRight();
          } else if (idx + 1 < count) {
            active.selectedIndex = idx + 1;
          }
          this.renderFocus();
          return true;

        case 'arrowleft':
          e.preventDefault();
          if (current?.onLeft) {
            current.onLeft();
          } else if (idx - 1 >= 0) {
            active.selectedIndex = idx - 1;
          }
          this.renderFocus();
          return true;

        case 'arrowdown':
          e.preventDefault();
          if (idx + cols < count) {
            active.selectedIndex = idx + cols;
          } else {
            // Cycle or move to last item in row
            active.selectedIndex = (idx + cols) % count;
          }
          this.renderFocus();
          return true;

        case 'arrowup':
          e.preventDefault();
          if (idx - cols >= 0) {
            active.selectedIndex = idx - cols;
          } else {
            // Cycle to bottom row
            const target = idx - cols + Math.ceil(count / cols) * cols;
            active.selectedIndex = target < count ? target : count - 1;
          }
          this.renderFocus();
          return true;
      }
    } else {
      // 1D Linear list navigation
      switch (lowerKey) {
        case 'arrowdown':
          e.preventDefault();
          active.selectedIndex = (active.selectedIndex + 1) % count;
          this.renderFocus();
          return true;

        case 'arrowup':
          e.preventDefault();
          active.selectedIndex = (active.selectedIndex - 1 + count) % count;
          this.renderFocus();
          return true;

        case 'arrowright':
          if (current?.onRight) {
            e.preventDefault();
            current.onRight();
            this.renderFocus();
            return true;
          }
          break;

        case 'arrowleft':
          if (current?.onLeft) {
            e.preventDefault();
            current.onLeft();
            this.renderFocus();
            return true;
          }
          break;
      }
    }

    return false;
  }

  public renderFocus(): void {
    if (!this.focusGraphics || !this.isEnabled) {
      return;
    }

    this.focusGraphics.clear();

    const active = this.getActiveContext();
    if (!active || active.items.length === 0) {
      return;
    }

    const item = active.items[active.selectedIndex];
    if (!item) return;

    const bounds = item.getBounds();
    const pad = 4;
    const x = bounds.x - bounds.width / 2 - pad;
    const y = bounds.y - bounds.height / 2 - pad;
    const w = bounds.width + pad * 2;
    const h = bounds.height + pad * 2;
    const radius = 8;

    // Outer subtle cyan glow
    this.focusGraphics.lineStyle(1.5, 0xffffff, 0.45);
    this.focusGraphics.strokeRoundedRect(x - 2, y - 2, w + 4, h + 4, radius + 2);

    // Primary bright high-contrast cyan focus outline (does not obscure inner content)
    this.focusGraphics.lineStyle(2.5, 0x00e5ff, 1);
    this.focusGraphics.strokeRoundedRect(x, y, w, h, radius);
  }

  public clearFocusGraphic(): void {
    if (this.focusGraphics) {
      this.focusGraphics.clear();
    }
  }

  public reset(): void {
    this.contextStack = [];
    this.clearFocusGraphic();
  }
}
