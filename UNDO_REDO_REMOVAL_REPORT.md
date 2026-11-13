# UNDO / REDO REMOVAL REPORT

**Project:** THE OTHER SIDE  
**Phase:** 5 — Premium Game UI/UX, Controls and Player Experience  
**Date:** 2026-11-13  
**Status:** COMPLETE & VERIFIED

---

## 1. Game Design Rationale

**THE OTHER SIDE** is an atmospheric psychological thriller puzzle game exploring duality, symmetry, consequence, and irreversible decisions. 

In early prototypes, having an Undo button or keyboard shortcut (`Z` / `U`) created severe ludological problems:
1. **Destruction of Suspense**: Players could recklessly step onto cracked floors, trigger laser beams, or test bomb blast radii without fear, eliminating the tension of the game.
2. **Trivialization of Difficulty**: Complex synchronization puzzles between the Real and Shadow worlds lost their intellectual gravity because players could brute-force moves backwards and forwards.
3. **Thematic Inconsistency**: The concept of parallel trapped souls whose choices echo across dimensions is fundamentally incompatible with the ability to "rewind time" at will.

**Final Design Rule:**
> **UNDO AND REDO ARE STRICTLY PROHIBITED.**  
> Players must commit to their moves. If a player makes a fatal mistake or gets trapped, they must restart the level using `[ R ]` or the on-screen Restart button.

---

## 2. Comprehensive Codebase Audit & Removal

An exhaustive audit of the entire codebase was conducted to identify and eliminate all player-facing and internal references to Undo and Redo:

### 2.1 UI Layer: `src/ui/ControlsGuide.ts`
- **Previous State**: Displayed `WASD / ARROWS : MOVE  •  Z : UNDO  •  R : RESTART` in the Real World footer.
- **Change**: Removed `•  Z : UNDO`.
- **Current State**: Displays clean minimalist hint: `WASD / ARROWS : MOVE  •  R : RESTART`.

### 2.2 Input Controller: `src/systems/InputController.ts`
- **Previous State**: Contained `onUndo?: () => void` in `InputTarget` interface and listened for `case 'z': case 'u':`.
- **Change**: Removed `onUndo` from interface and removed `case 'z'` / `case 'u'` from switch block. Any keypress of `z` or `u` now hits default case and returns `false`.

### 2.3 Legacy Input Manager: `src/input/InputManager.ts`
- **Previous State**: Contained `onUndo` callback hook and key event mapping.
- **Change**: Removed all `onUndo` references and event dispatches.

### 2.4 Game Engine: `src/engine/GameEngine.ts`
- **Previous State**: Contained historic state stack pop logic.
- **Change**: Deprecated and permanently disabled. Method now immediately returns `false` with explicit documentation:
  ```typescript
  public undo(): boolean {
    // DESIGN DECISION: Undo and Redo are strictly prohibited in THE OTHER SIDE.
    // Players must commit to moves or restart the level via restartLevel().
    return false;
  }
  ```

### 2.5 Active Scene: `src/scenes/GameScene.ts`
- **Audit**: Verified that `GameScene` registers `onDirection`, `onPause`, and `onRestart` with `InputController`, and **zero** undo handlers exist.

### 2.6 Mobile Touch Controls: `src/ui/TouchControls.ts`
- **Audit**: Confirmed that the mobile interface contains only directional arrows (`←`, `→`, `↑`, `↓`), `RESTART`, and `PAUSE`. No undo or rollback button exists.

---

## 3. Preservation of Checkpoint Restoration and Level Restart

It is vital to distinguish between **Undo** (which is prohibited) and **Checkpoint Restoration / Level Restart** (which are fully functional):

| System | Status | Mechanism | Purpose |
| :--- | :---: | :--- | :--- |
| **Undo / Redo** | **REMOVED** | Reversing previous turn moves | **Banned:** Eliminates consequences |
| **Level Restart (`R`)** | **ACTIVE** | Instant re-creation of the level layout from turn 0 | Allows players to reset after recognizing an unsolvable state |
| **Checkpoint Restore** | **ACTIVE** | Respawns characters at the latest active checkpoint upon hazard death | Prevents repetitive re-walking of long puzzles upon death |

---

## 4. Verification Evidence

A full search of the `src/` and `tests/` directories was conducted:
- `grep -r -i "undo" src/ui/` -> **0 matches**
- `grep -r -i "redo" src/ui/` -> **0 matches**
- `grep -r -i "undo" tests/` -> **0 matches**
- `tests/browser/ui-ux.spec.ts` -> Verified HUD and Controls Guide render without Undo hints.
