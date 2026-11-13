# UI / UX & INTERACTION REDESIGN PLAN — THE OTHER SIDE
**Document Version**: 1.0.0  
**Scope**: HUD Redesign, Full Undo System, Level Selection Overhaul, Mobile Ergonomics, and Design System  
**Design Philosophy**: "Monochrome Precision" — High-contrast, tactile, atmospheric, and razor-sharp  

---

## 1. Visual Identity & Design System

The current UI relies on generic system fonts, unstyled rectangles, and standard buttons that look like developer placeholders.

### 1.1 The "Monochrome Precision" Design Language
- **Color Discipline**:
  - Pure Deep Black: `#08080A` (98% black with a cool 2% blue tint for cinematic depth).
  - Pure Brilliant White: `#FFFFFF`.
  - Mid-Tone Steel: `#888890` (for secondary labels, borders, and subtle dividers).
  - Accent Pulse (Optical Cyan): `#00E5FF` (reserved exclusively for active laser/magnetic energy).
  - Danger Strobe (Volatile Crimson): `#FF3344` (reserved exclusively for bomb blast and saw contact).
- **Typography**:
  - Primary Display Font: `Cinzel, 'Cinzel Decorative', 'SF Pro Display', system-ui, sans-serif` for majestic, mysterious chapter titles and level names.
  - Monospace Data Font: `'JetBrains Mono', 'Fira Code', 'Courier New', monospace` for moves, par ratings, timers, and coordinates.
- **Glassmorphic Card Architecture**:
  - Modal backdrops: `rgba(8, 8, 10, 0.94)` with subtle 1px border stroke (`rgba(255, 255, 255, 0.2)`).
  - Soft corner radii ($4\text{px}$–$6\text{px}$) that maintain clean architectural precision without bubbly curves.

---

## 2. Gameplay HUD Overhaul (`Header.ts`)

```
+----------------------------------------------------------------------------------------------------+
| [II PAUSE]    CH. 4 • THE REFLECTION                THE OTHER SIDE               MOVES: 08 • PAR: 10  [R] |
|               Level 16: The Wrong Reflection        [DUAL BEACON]                BEST: 10    [UNDO Z]      |
+----------------------------------------------------------------------------------------------------+
```

### 2.1 Component Breakdown
1. **Left Wing (Real World Aligned)**:
   - Modern minimalist Pause icon button `[II]`.
   - Chapter tracker with glowing Roman numerals (`CH. IV • THE REFLECTION`).
   - Current Level Name in high-contrast crisp lettering.
2. **Center Crest (The Divide)**:
   - Iconic "THE OTHER SIDE" monogram badge centered on the world dividing line.
   - Pulsing dual diamond icon that lights up as each character reaches their exit.
3. **Right Wing (Shadow World Aligned)**:
   - Real-time Moves counter with dynamic Par indicator (`MOVES: 08 / PAR: 10`).
   - Best personal record badge.
   - Dedicated tactile **UNDO [Z]** and **RESTART [R]** buttons.

---

## 3. Transactional Undo Engine (`UndoEngine.ts`)

### 3.1 The Problem
The current footer displays `Z : UNDO`, creating player frustration because pressing `Z` does nothing and no undo system exists. In a high-difficulty puzzle game, punishing accidental keystrokes with a full level restart degrades user engagement.

### 3.2 Undo Architecture Blueprint
- **Stack-Based Snapshot Engine**:
  ```typescript
  export class UndoEngine {
    private historyStack: CheckpointSnapshotData[] = [];
    private maxDepth: number = 60;

    public pushState(snapshot: CheckpointSnapshotData): void;
    public popState(): CheckpointSnapshotData | null;
    public clear(): void;
    public canUndo(): boolean;
  }
  ```
- **Execution Flow on `Z` / Undo Button**:
  1. Guard check: Game state must be `PLAYING` and not currently animating.
  2. Pop most recent snapshot from `historyStack`.
  3. Restore `MovementEngine` (character positions), `PuzzleManager` (switches, doors, plates, bombs, mirrors, blocks), and checkpoint states.
  4. Decrement move counter by 1.
  5. Play soft reverse-rewind audio chime (`play('undo')`).
  6. Trigger a rapid 80ms reverse translation tween on both character sprites.

---

## 4. Level Select & Chapter Menu Overhaul (`MenuScene.ts`)

### 4.1 Chapter Carousel & Progression Gate
- Replace the raw 20-box grid with a stylized **5-Chapter Carousel**:
  - **Chapter 1: The Beginning** (White/Light theme)
  - **Chapter 2: The Connection** (Industrial Rift theme)
  - **Chapter 3: The Separation** (Hazard/Spike theme)
  - **Chapter 4: The Reflection** (Laser/Optical theme)
  - **Chapter 5: The Truth** (Grand Master theme)
- Each Chapter displays:
  - Completion progress (e.g. `4 / 4 Complete`).
  - Mastery medal count (Gold, Silver, Bronze stars).

### 4.2 Interactive Level Cards
Each level card features:
- Level Number & Title.
- Difficulty indicator (1 to 5 glowing geometric pips).
- Best Move score vs. Optimal Par.
- Thumbnail preview: A stylized miniature 2D wireframe showing the chamber layout.

---

## 5. In-Game Modals Redesign

### 5.1 Win Modal (`WinModal.ts`)
- **Stage 1 (Triumph Banner)**: "CHAMBER SYNCHRONIZED".
- **Stage 2 (Performance Breakdown)**:
  - Moves Taken: `10`
  - Chapter Par: `10` (Rating: ★★★ FLAWLESS GOLD)
  - Personal Best: `10 Moves`
- **Stage 3 (Action Stack)**:
  - `[ NEXT CHAMBER ]` (Primary high-contrast button).
  - `[ REPLAY FOR MASTERY ]`.
  - `[ SELECT LEVEL ]`.

### 5.2 Pause Modal (`PauseModal.ts`)
- Dims the game screen with a subtle blurred monochrome veil.
- Displays Level Objective & Contextual Hint.
- Controls overview (Keyboard & Touch).
- Options: `RESUME`, `RESTART LEVEL`, `SETTINGS`, `MAIN MENU`.

### 5.3 Settings Modal (`SettingsModal.ts`)
- Master Volume slider (0% to 100%).
- Sound Effects toggle (On / Off).
- Atmospheric Music toggle (On / Off).
- Reduced Motion toggle (Disables screen shakes and heavy camera zooms for accessibility).
- Reset Campaign Data (with double-confirmation modal).

---

## 6. Mobile & Touch Ergonomics (`TouchControls.ts`)

1. **Dual Thumb Optimization**:
   - Left Thumb: Floating or fixed minimalist D-pad with directional arrow glyphs.
   - Right Thumb: Quick-action cluster with dedicated `[UNDO]` and `[RESTART]` buttons.
2. **Direct Swipe Gestures**:
   - Support intuitive flick/swipe inputs anywhere on screen with configurable sensitivity deadzone ($24\text{px}$).
3. **Tactile Touch Feedback**:
   - Circular ripple wave emanating from the touch point on input commit.
   - Haptic vibration pulse (`navigator.vibrate(15)`) on supported mobile devices.
4. **Responsive Layout Engine**:
   - Desktop 16:9 ($1280 \times 720$) Hi-DPI scaling.
   - Mobile Landscape: Compact UI, maximizing grid cell dimensions.
   - Tablet Portrait: Stacked vertical layout with Real World on top, Shadow World on bottom, and controls docked at bottom.
