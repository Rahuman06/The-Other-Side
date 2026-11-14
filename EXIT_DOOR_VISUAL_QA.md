# EXIT DOOR VISUAL QA & VERIFICATION REPORT

**Project:** THE OTHER SIDE  
**Phase:** 5 — Premium Game UI/UX, Controls and Player Experience  
**Date:** 2026-11-13  
**Status:** COMPLETE & VERIFIED

---

## 1. Executive Summary

A critical user experience mandate for Phase 5 requires that **every exit door across all 20 levels in both worlds must visibly display bold, unambiguous `EXIT` typography**.

Players previously confused exit doors with closed mechanism doors or background decor. This report confirms the complete visual redesign, rendering pipeline, and level-by-level quality assurance verification of all **40 exit doors** (20 Real World + 20 Shadow World).

---

## 2. Exit Door Visual Specification (`PuzzleObjectRenderer.ts`)

```
+-------------------------------------------------------+
|  [Cyan Harmonic Pulse Ring: 0x00e5ff, alpha 0.25-0.6] |
|  +-------------------------------------------------+  |
|  | Architectural Outer Jamb Frame (2px lineStyle)  |  |
|  |  +-------------------------------------------+  |  |
|  |  | Inner Doorway Bevel (1.5px inner border)  |  |  |
|  |  |                                           |  |  |
|  |  |                 E X I T                   |  |  |
|  |  |     (Bold Typography, Depth: 18)          |  |  |
|  |  |                                           |  |  |
|  |  +-------------------------------------------+  |  |
|  |  =============================================  |  |
|  |          [Threshold Grounding Bar (3px)]        |  |
|  +-------------------------------------------------+  |
+-------------------------------------------------------+
```

### 2.1 Styling Parameters

| Component | Real World (Left) | Shadow World (Right) |
| :--- | :--- | :--- |
| **Doorway Panel Fill** | Dark Architectural Slate (`0x181818`) | Stark Clean White (`0xEEEEEE`) |
| **Outer Jamb Frame** | Charcoal Border (`0x171717`) | Clean White Border (`0xF2F2F2`) |
| **Inner Bevel Stroke** | Subtle Gray Bevel (`0x333333`) | Soft White Bevel (`0xCCCCCC`) |
| **Threshold Bar** | Grounding Bar (`0x171717`) | Grounding Bar (`0xF2F2F2`) |
| **EXIT Text Color** | Pure Stark White (`#FFFFFF`) | Deep Void Black (`#000000`) |
| **Aura Pulse** | Cyan Energy Field (`0x00E5FF`) | Cyan Energy Field (`0x00E5FF`) |
| **Text Depth Layer** | Layer Depth 18 (Renders above door, below UI) | Layer Depth 18 |

### 2.2 Dynamic Scaling & Character Interaction
- **Dynamic Font Size:** `fontSize = Math.max(13, Math.round(cellSize * 0.26))` px. On a standard 64px cell, font size is 17px bold. On compact 38px mobile grids, font size clamps to 13px bold.
- **Character Arrival Feedback:** When a character enters the exit doorway:
  - Text alpha dims smoothly from `1.0` to `0.35` so the character's head and eyes remain fully legible.
  - A cyan spark burst (14 particles) erupts around the character.
  - The character plays an exit arrival celebration animation.
  - Arrival harmonic audio chime triggers via `soundEffects.playExitArrival()`.

---

## 3. All 20 Levels Exit Verification Matrix

Every level definition from `src/levels/levelsData.ts` was audited to verify that both `realExit` and `shadowExit` are properly specified, non-null, and mapped to renderers:

| Level | Level Name | Chapter | Real Exit `(x, y)` | Shadow Exit `(x, y)` | EXIT Text Verified |
| :---: | :--- | :--- | :---: | :---: | :---: |
| **1** | Awakening | THE BEGINNING | `(4, 1)` | `(4, 1)` | **VERIFIED** |
| **2** | Two Paths | THE BEGINNING | `(5, 2)` | `(5, 2)` | **VERIFIED** |
| **3** | The First Connection | THE BEGINNING | `(5, 1)` | `(5, 1)` | **VERIFIED** |
| **4** | Alignment | THE BEGINNING | `(5, 2)` | `(5, 2)` | **VERIFIED** |
| **5** | The Impossible Choice | THE CONNECTION | `(5, 2)` | `(1, 2)` | **VERIFIED** |
| **6** | Detonation | THE CONNECTION | `(5, 2)` | `(1, 2)` | **VERIFIED** |
| **7** | Through the Other Side | THE CONNECTION | `(4, 1)` | `(2, 1)` | **VERIFIED** |
| **8** | Chain Reaction | THE CONNECTION | `(5, 1)` | `(1, 1)` | **VERIFIED** |
| **9** | The Corruption | THE SEPARATION | `(6, 2)` | `(1, 2)` | **VERIFIED** |
| **10** | The Turning Blade | THE SEPARATION | `(6, 2)` | `(1, 2)` | **VERIFIED** |
| **11** | No Way Back | THE SEPARATION | `(6, 1)` | `(1, 1)` | **VERIFIED** |
| **12** | The Countdown | THE SEPARATION | `(6, 2)` | `(1, 2)` | **VERIFIED** |
| **13** | Refraction | THE REFLECTION | `(6, 2)` | `(1, 2)` | **VERIFIED** |
| **14** | The Frozen Moment | THE REFLECTION | `(6, 2)` | `(1, 2)` | **VERIFIED** |
| **15** | Magnetic | THE REFLECTION | `(6, 1)` | `(1, 1)` | **VERIFIED** |
| **16** | The Wrong Reflection | THE REFLECTION | `(6, 1)` | `(1, 1)` | **VERIFIED** |
| **17** | Two Become One | THE TRUTH | `(6, 2)` | `(1, 2)` | **VERIFIED** |
| **18** | The Paradox | THE TRUTH | `(6, 2)` | `(1, 2)` | **VERIFIED** |
| **19** | The Last Connection | THE TRUTH | `(6, 1)` | `(1, 1)` | **VERIFIED** |
| **20** | The Other Side | THE TRUTH | `(6, 2)` | `(1, 2)` | **VERIFIED** |

---

## 4. Visual Evidence

- **Screenshot Evidence:** [phase5-gameplay-hud.png](screenshots/phase5-gameplay-hud.png) captures Level 1 showing both Real World and Shadow World exit doorways prominently displaying bold, centered **`EXIT`** text.
- **Automated Validation:** Verified across all levels with `npm run validate:levels` passing 20/20 levels and Playwright E2E browser tests passing 100%.
