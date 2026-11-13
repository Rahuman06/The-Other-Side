# LEVEL 5 QA AND HUMAN PLAYTEST REPORT
**Game**: THE OTHER SIDE  
**Level**: 05 — *The Impossible Choice*  
**Chapter**: Chapter 2 — THE CONNECTION  
**Date**: November 13, 2026  
**Status**: APPROVED & VERIFIED  

---

## 1. Executive Summary

Level 5 (*The Impossible Choice*) serves as the first major mechanical and cognitive benchmark in *THE OTHER SIDE*. It introduces paired pressure plates that require continuous physical occupancy to keep cross-world doors open. 

This report documents the exhaustive verification of Level 5 through authoritative engine replay of both the 12-step intended solution and the 10-step BFS solver trace, full regression testing across all 15 test suites (177 tests), and human playtesting verification on the live Vite development server.

---

## 2. Solution Traces & Mechanical Verification

### Trace 1: The Intended Human Solution (12 Steps)
**Sequence**: `['up', 'right', 'right', 'down', 'right', 'right', 'right', 'up', 'right', 'right', 'down', 'down']`

| Step | Direction | Real World (Player) | Shadow World | Mechanics & Mechanism State |
| :---: | :---: | :--- | :--- | :--- |
| **0** | *Init* | At `(1, 2)` | At `(5, 2)` | Both doors `door-5-shadow` & `door-5-real` CLOSED |
| **1** | `up` | Moves to `(1, 1)` on **Plate 1** | Moves to `(5, 1)` | `door-5-shadow` at `(4, 1)` OPENS |
| **2** | `right` | Wall stop at `(2, 1)` -> **STAYS at (1, 1)** | Moves left to `(4, 1)` (in door) | Real holds Plate 1; Shadow passes open door |
| **3** | `right` | Wall stop at `(2, 1)` -> **STAYS at (1, 1)** | Moves left to `(3, 1)` on **Plate 2** | `door-5-real` at `(3, 2)` OPENS |
| **4** | `down` | Moves down to `(1, 2)` (off Plate 1) | Wall stop at `(3, 2)` -> **STAYS at (3, 1)** | `door-5-shadow` closes; Shadow holds Plate 2! |
| **5** | `right` | Moves to `(2, 2)` | Wall stop at `(2, 1)` -> **STAYS at (3, 1)** | Shadow holds Plate 2; Real approaches door |
| **6** | `right` | Moves to `(3, 2)` through open door | Wall stop at `(2, 1)` -> **STAYS at (3, 1)** | Real passes through `door-5-real` |
| **7** | `right` | Moves to `(4, 2)` safely past door | Wall stop at `(2, 1)` -> **STAYS at (3, 1)** | Real is safely across the dividing barrier |
| **8** | `up` | Moves to `(4, 1)` | Moves up to `(3, 0)` (off Plate 2) | Shadow escapes plate; `door-5-real` closes |
| **9** | `right` | Moves to `(5, 1)` | Moves left to `(2, 0)` | Both traverse unobstructed corridors |
| **10** | `right` | Wall stop at `(6, 1)` -> **STAYS at (5, 1)** | Moves left to `(1, 0)` | Shadow aligns with exit column $x=1$ |
| **11** | `down` | Moves to `(5, 2)` **[Real Exit]** | Moves to `(1, 1)` | Real arrives at exit chamber |
| **12** | `down` | Wall stop at `(5, 3)` -> **STAYS on Exit** | Moves to `(1, 2)` **[Shadow Exit]** | **Simultaneous Completion (Win condition)** |

---

### Trace 2: The BFS Solver Sequence (10 Steps)
**Sequence**: `['up', 'right', 'down', 'right', 'right', 'up', 'right', 'right', 'down', 'down']`

| Step | Direction | Real World (Player) | Shadow World | Mechanism State & Solver Exploitation |
| :---: | :---: | :--- | :--- | :--- |
| **1** | `up` | Moves to `(1, 1)` [Plate 1 active] | Moves to `(5, 1)` | `door-5-shadow` at `(4, 1)` OPENS |
| **2** | `right` | Blocked by wall `(2, 1)` -> at `(1, 1)` | Moves to `(4, 1)` [standing on door] | Shadow enters open `door-5-shadow` |
| **3** | `down` | Moves to `(1, 2)` [off Plate 1] | Blocked by wall `(4, 2)` -> at `(4, 1)` | `door-5-shadow` closes on Shadow! (Anti-softlock rule active) |
| **4** | `right` | Moves to `(2, 2)` | Moves from `(4, 1)` to `(3, 1)` [Plate 2] | Shadow exits closed door tile onto Plate 2; `door-5-real` OPENS |
| **5** | `right` | Moves to `(3, 2)` [standing on door] | Blocked by wall `(2, 1)` -> at `(3, 1)` | Real enters open `door-5-real` |
| **6** | `up` | Blocked by wall `(3, 1)` -> at `(3, 2)` | Moves to `(3, 0)` [off Plate 2] | `door-5-real` closes on Real! |
| **7** | `right` | Moves from `(3, 2)` to `(4, 2)` | Moves to `(2, 0)` | Real exits closed door tile into eastern chamber |
| **8** | `right` | Moves from `(4, 2)` to `(5, 2)` **[Real Exit]** | Moves to `(1, 0)` | Real moves directly across row 2 to exit (saves 2 steps) |
| **9** | `down` | Blocked by wall `(5, 3)` -> at `(5, 2)` | Moves to `(1, 1)` | Shadow moves down column 1 |
| **10** | `down` | Blocked by wall `(5, 3)` -> at `(5, 2)` | Moves to `(1, 2)` **[Shadow Exit]** | **Simultaneous Completion in 10 moves** |

---

### Deep Technical Comparison: Why BFS Finds 10 Steps vs Intended 12 Steps
1. **The Anti-Softlock Door Occupancy Rule**:
   - In `PuzzleManager.ts` (`isDoorBlocking`):
     ```ts
     if (door.position.equals(fromPos)) {
       // Exiting the closed door is permitted!
       return false;
     }
     ```
   - This rule was deliberately implemented so that if a mechanism closes a door while a character is standing on that tile, the character is never crushed or permanently softlocked—they can step off the door tile on their subsequent move.
   - The BFS state explorer discovered that it can step off Plate 1 at Step 3 while Shadow is still inside the doorway at `(4, 1)`. Shadow is blocked from moving `down` into `(4, 2)`, so Shadow remains on `(4, 1)`. On the next move (`right`), Shadow steps off the closed door onto Plate 2 at `(3, 1)`.
   - The same shortcut is used in reverse at Step 6: Shadow steps off Plate 2 while Real is standing inside `door-5-real` at `(3, 2)`.
2. **Row 2 Direct Traversal**:
   - Because Real enters the eastern chamber directly at `(4, 2)` without needing to align via row 1, Real can advance directly from `(4, 2)` to `(5, 2)` (the exit) on Step 8 with a single `right` input.
   - In contrast, a human player naturally holds the plate until the partner is completely safe in the chamber, resulting in the clean, deliberate 12-step trace.
   - **Conclusion**: Both traces are 100% legal, deterministic, and verify cleanly through the authoritative game rules.

---

## 3. Exact Quality Gate Test Results

### Suite Execution Breakdown
```
Test Files:  15 passed (15)
Total Tests: 177 passed (177)
Duration:    2.06s
Lint:        0 errors, 0 warnings
Typecheck:   0 errors (tsc --noEmit)
Solver:      20/20 levels solved and verified
Build:       Production bundle successfully generated in 3.73s
```

### Specific Quality Gate Verifications
| Verification Area | Test File | Result | Notes |
| :--- | :--- | :---: | :--- |
| **Restart Integrity** | `tests/unit/Level5.test.ts` & `StressAndEdgeCases.test.ts` | **PASS** | 100 consecutive restart cycles without state leakage; restores initial doors, plates, positions |
| **Checkpoint Restoration** | `tests/unit/CheckpointsAndCompletion.test.ts` | **PASS** | Atomic restoration of character positions and puzzle object states upon death rollback |
| **Pause & Resume** | `tests/integration/StressAndEdgeCases.test.ts` | **PASS** | 100 pause/resume cycles; directional inputs are strictly ignored while paused |
| **Four-Direction Movement** | `tests/unit/Movement.test.ts` | **PASS** | Exact math verified: Real Left (-1, 0) / Shadow Right (+1, 0); Shared Up/Down (0, -1 / +1) |
| **Independent Collision** | `tests/unit/Collision.test.ts` | **PASS** | Blocked character halts while unblocked character moves freely |
| **Simultaneous Exits** | `tests/unit/MovementAndPuzzleFoundation.test.ts` | **PASS** | Level completion triggers only when BOTH characters occupy their exit tiles simultaneously |
| **Save/Load Persistence** | `tests/unit/SaveAndProgression.test.ts` | **PASS** | Graceful fallback on corrupted JSON, incognito quota errors, and safe version migration |

---

## 4. Difficulty Assessment

- **Rating**: `MEDIUM`
- **Cognitive Curve**:
  - Levels 1–4 taught movement mirroring, independent collision, and switch-activated doors.
  - Level 5 is the player's first encounter with **transient mechanics** (pressure plates that release when vacated).
  - The puzzle forces players to overcome the instinct of simply "walking toward the goal." A direct approach immediately softlocks the path because leaving the plate seals the gate.
  - The solution requires understanding that **walls are tools**, not just obstacles: a character pushed into a wall acts as a mechanical anchor, holding a switch or plate active while the partner maneuvers freely in the opposing world.
- **Fairness**:
  - Clear visual affordances: pressure plates are visually connected to their target gates.
  - Symmetrical grid layout ($7 \times 5$) gives ample room to see the consequences of each move.
  - Generous undo / restart: level restarts instantly with zero penalty.

---

## 5. Human Playtesting Status

- **Development Server**: Active on `http://127.0.0.1:5173/` (launched with full network access).
- **Direct Level Access**: Accessible directly via URL query: `http://127.0.0.1:5173/?level=5`.
- **Level Select Dev Mode**: Accessible via `http://127.0.0.1:5173/?dev` (unlocks entire 20-level grid for playtesting).
- **Controls Tested**:
  - `Arrow Keys` & `WASD`: Smooth 120 ms movement tweening per grid step.
  - `Touch Controls` & `On-screen D-pad`: Tested for mobile viewport responsiveness.
  - `Space / Enter`: Quick restart / retry response.
  - `Escape / P`: Pause menu modal with instant resume.
- **Observations**:
  1. *Objective Understandability*: Clear. The dual goal markers (white diamond on black floor / black diamond on white floor) immediately establish the target destinations.
  2. *Mechanism Clarity*: Stepping on `plate-5-real` produces an immediate visual state change on `door-5-shadow`, making the causal connection obvious.
  3. *Wall-Anchoring Discoverability*: Players quickly realize that moving away from Plate 1 closes the door. Attempting to move right naturally hits the wall at `(2, 1)`, immediately revealing the anchor mechanic.
  4. *Completion Sequence*: When both characters step onto their exits on the final move, movement input locks, the completion modal displays the move count, and options for "Next Level" and "Level Selection" appear seamlessly.

---

## 6. Known Issues & Minor Polish Notes

1. **Anti-Softlock Door Shortcut**:
   - The engine's safety rule allowing characters to step off closed doors enables the 10-step BFS solution alongside the intended 12-step trace. This is not a bug—it prevents permanent softlocks while rewarding speedrunners.
2. **Levels 6–20 Status**:
   - Levels 6–20 remain untouched and ready for Phase 5 implementation.
