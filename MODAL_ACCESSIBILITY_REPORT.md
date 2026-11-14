# MODAL ACCESSIBILITY REPORT
## THE OTHER SIDE — TWO WORLDS. ONE MIND.

**System:** Modal Accessibility, Focus Management & Escape Hierarchy  
**Status:** FULLY VERIFIED & COMPLIANT  
**Date:** November 2026  

---

### 1. Scope of Modal Systems Audited

The game features five distinct modal and overlay dialogs:
1. **Pause Modal (`PauseModal.ts`):** In-game pause dialog with Resume, Restart, Object Guide, Settings, Level Select, and Main Menu.
2. **Win Modal (`WinModal.ts`):** Post-level victory dialog with Next Level, Level Select, Replay, and Main Menu.
3. **Settings Modal (`SettingsModal.ts`):** Audio (Music, SFX), Reduced Motion toggle, and Progress Reset.
4. **Object Guide Modal (`ObjectGuideModal.ts`):** Interactive codex detailing characters, tiles, switches, doors, keys, and hazards.
5. **Confirm Reset Modal (`MenuScene.ts`):** Two-choice confirmation dialog for destructive progress erasure.

---

### 2. Focus Trapping & Context Stack Behavior

When any modal opens, it registers a `FocusContext` with `KeyboardNavManager`:
- **Initial Focus Assignment:** Immediately places the focus ring on the primary or safest action (e.g., "RESUME" in Pause, "NEXT LEVEL" in Win, "CANCEL" in Confirm Reset).
- **Tab & Arrow Key Trapping:** When cycling past the last interactive element in the modal, focus wraps immediately back to the first element without leaking into background canvas items or browser chrome.
- **Escape Key (`ESC`) Hierarchy:**
  - If a nested sub-modal is open (e.g., Settings inside Pause, or Confirm Reset inside Settings), pressing `ESC` dismisses only the topmost sub-modal and returns focus to the parent modal.
  - If the top-level Pause modal is open, pressing `ESC` resumes the game immediately.
  - If in the Level Selection screen, pressing `ESC` returns to the Main Menu.

---

### 3. Modal-Specific Focus Matrices

#### A. Pause Modal (`PauseModal.ts`)
| Index | Action | Visual Coordinates ($x, y$) | Escape Action |
|---|---|---|---|
| **0 (Default)** | RESUME | ($0, -75$) | Resumes game |
| **1** | RESTART LEVEL | ($0, -25$) | — |
| **2** | OBJECT GUIDE | ($0, 25$) | — |
| **3** | SETTINGS | ($0, 75$) | — |
| **4** | LEVEL SELECT | ($0, 125$) | — |
| **5** | MAIN MENU | ($0, 175$) | — |
| **6** | CLOSE (✕) | ($175, -205$) | Resumes game |

#### B. Win Modal (`WinModal.ts`)
| Index | Action | Visual Coordinates ($x, y$) | Escape Action |
|---|---|---|---|
| **0 (Default)** | NEXT LEVEL | ($0, 40$) | Advances to next level |
| **1** | REPLAY LEVEL | ($0, 90$) | Restarts current level |
| **2** | LEVEL SELECT | ($0, 140$) | Opens level select |
| **3** | MAIN MENU | ($0, 190$) | Returns to main menu |

#### C. Settings Modal (`SettingsModal.ts`)
| Index | Control | Type | Arrow Behavior |
|---|---|---|---|
| **0** | Music Vol - | Button | Decrements BGM volume by 10% |
| **1** | Music Vol + | Button | Increments BGM volume by 10% |
| **2** | SFX Vol - | Button | Decrements SFX volume by 10% |
| **3** | SFX Vol + | Button | Increments SFX volume by 10% |
| **4** | Reduced Motion | Toggle | Toggles camera shake & particle effects |
| **5** | Reset Progress | Action | Opens Confirm Reset modal |
| **6** | Close (✕) | Button | Closes Settings and restores parent context |

#### D. Confirm Reset Modal (`MenuScene.ts`)
| Index | Action | Safety Designation | Default Focus |
|---|---|---|---|
| **0** | CANCEL | Safe Option | **Yes (Prevents accidental reset)** |
| **1** | CONFIRM | Destructive Option | Requires explicit directional navigation |
| **2** | CLOSE (✕) | Safe Option | Closes dialog without reset |

---

### 4. Verification Results

All modal interactions have been validated through unit tests in `tests/unit/AccessibilityAndMobileControls.test.ts`:
- Context pushing and popping verified across all 5 dialogs.
- Input isolation verified (no background character moves while modal is active).
- ESC dismissal verified with zero state corruption.
