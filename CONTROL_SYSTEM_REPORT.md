# CONTROL SYSTEM REPORT

**Project:** THE OTHER SIDE  
**Phase:** 5 — Premium Game UI/UX, Controls and Player Experience  
**Date:** 2026-11-13  
**Status:** COMPLETE & VERIFIED

---

## 1. Core Control Philosophy

THE OTHER SIDE is a turn-based, deterministic spatial puzzle game. To preserve mathematical predictability across both parallel worlds:
1. **Four Cardinal Directions Only**: Characters move strictly along the grid axes: `UP`, `DOWN`, `LEFT`, and `RIGHT`. Diagonal movement, jumping, and momentum-based physics are strictly prohibited.
2. **One Move = One Discrete Turn**: Each input triggers exactly one synchronous turn step for both the Real World player and Shadow World shadow actor.
3. **Zero Movement History Reversal**: Undo and Redo are completely banned from both game engine logic and player interfaces.
4. **Deterministic Input Dispatch**: Input events are captured, debounced against hardware auto-repeat, verified against modal states, and dispatched atomically.

---

## 2. Input Mapping Specification

### 2.1 Hardware Keyboard (`InputController.ts`)

| Action | Primary Key | Secondary Key | Behavior |
| :--- | :--- | :--- | :--- |
| **Move Up** | `ArrowUp` | `W` / `w` | Moves character north 1 cell in both worlds (subject to walls/obstacles) |
| **Move Down** | `ArrowDown` | `S` / `s` | Moves character south 1 cell in both worlds |
| **Move Left** | `ArrowLeft` | `A` / `a` | Moves real character west; moves shadow character east (mirrored) |
| **Move Right** | `ArrowRight` | `D` / `d` | Moves real character east; moves shadow character west (mirrored) |
| **Restart Level** | `R` / `r` | — | Immediately restarts current level layout from scratch |
| **Toggle Pause** | `P` / `p` | `Escape` | Pauses turn engine and opens/closes Pause menu |
| **Object Guide** | `G` / `g` | — | Opens the 14-object reference manual |
| **Undo / Redo** | **PERMANENTLY DISABLED** | — | Any keypress of `Z`, `U`, `Ctrl+Z`, `Ctrl+Y` is ignored |

### 2.2 Mouse & Pointer Navigation (`GameScene.ts`)
- **Swipe Gesture**:
  - Dragging > 25 pixels in any cardinal direction registers a move.
  - Dominant axis determines direction (`Math.abs(dx) > Math.abs(dy)`).
- **Directional Click / Tap**:
  - Clicking outside the character’s grid cell detects the relative offset (`relX`, `relY`).
  - Clicking to the right of the Real World character moves right; clicking to the right of the Shadow World character moves right (with world-specific coordinate normalization).
  - Clicks within header ribbon (`y < 70`) or footer bar (`y > height - 40`) are reserved for UI buttons.

### 2.3 Mobile Touch D-Pad (`TouchControls.ts`)
- **Left Hand D-Pad Cluster**:
  - `←` Left Button: 54x54px target (`x: 72, y: height - 70`)
  - `→` Right Button: 54x54px target (`x: 188, y: height - 70`)
  - `↑` Up Button: 54x54px target (`x: 130, y: height - 128`)
  - `↓` Down Button: 54x54px target (`x: 130, y: height - 12`)
- **Right Hand Action Cluster**:
  - `RESTART` Button: 64x44px target (`x: width - 150, y: height - 70`)
  - `PAUSE` Button: 64x44px target (`x: width - 70, y: height - 70`)
- **Visual Feedback**: Real World buttons render in subtle grayscale slate with dark borders; Shadow World buttons render in deep charcoal with light borders. Pressed states brighten by 30%.
- **Touch-Action Isolation**: `touch-action: none` applied to canvas element prevents browser zoom, pinch, and scroll jitter.

---

## 3. Hardware Auto-Repeat Debouncing

To prevent accidental multi-cell runaway moves when a player holds down a key:
```typescript
public handleKeyDown(e: { key: string; repeat?: boolean; preventDefault?: () => void }): boolean {
  if (!this.isEnabled) return false;
  if (e.repeat) return false; // Hardware auto-repeat strictly rejected

  const key = e.key.toLowerCase();
  if (this.heldKeys.has(key)) return false; // Duplicate keypress rejected

  this.heldKeys.add(key);
  // Dispatch direction...
}
```
Only releasing the key (`handleKeyUp`) permits the player to issue another step with that key.

---

## 4. Modal Input Masking

When any modal dialog (`PauseModal`, `WinModal`, `ObjectGuideModal`, or `SettingsModal`) is visible:
- `handleDirectionInput()` aborts immediately without submitting moves to `turnEngine`.
- Pointer down/up events over the board are intercepted by the modal's fullscreen invisible barrier.
- Touch D-Pad buttons do not emit movement actions.

---

## 5. Verification Metrics

- **Unit Tests**: 15 tests in `Movement.test.ts`, 16 tests in `MovementAndPuzzleFoundation.test.ts`.
- **Hardware Simulation**: Verified via `InputController.test` with zero key-repeat bounce.
- **Browser Touch & Click**: Automated test in `ui-ux.spec.ts` confirms click and keyboard responsiveness.
