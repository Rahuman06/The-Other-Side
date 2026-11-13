# EXIT DOOR VISUAL SPECIFICATION: "EXIT" TEXT & DOORWAY IDENTITY

**Project:** THE OTHER SIDE  
**Date:** November 13, 2026  
**Status:** SPECIFIED, IMPLEMENTED & VERIFIED  

---

## 1. Executive Summary

This document specifies the mandatory visual design and implementation for exit doors across **all 20 levels** of **THE OTHER SIDE**.

Every exit door in both the Real World and Shadow World now visibly, boldly, and legibly displays the word **"EXIT"** centered directly within its architectural doorway panel, accompanied by dynamic state-dependent illumination and entry feedback.

---

## 2. Doorway Architecture & Text Placement

```
       Real World Exit Door                        Shadow World Exit Door
+--------------------------------+          +--------------------------------+
|  [===] Cyan Breathing Aura [=] |          |  [===] Cyan Breathing Aura [=] |
| +----------------------------+ |          | +----------------------------+ |
| |   Dark Door Jamb Frame     | |          | |   Light Door Jamb Frame    | |
| | +------------------------+ | |          | | +------------------------+ | |
| | |  Dark Doorway Panel    | | |          | | |  Light Doorway Panel   | | |
| | |                        | | |          | | |                        | | |
| | |         E X I T        | | |          | | |         E X I T        | | |
| | |   (Pure White Bold)    | | |          | | |   (Pure Black Bold)    | | |
| | |                        | | |          | | |                        | | |
| | +------------------------+ | |          | | +------------------------+ | |
| | [===] Threshold Bar [====] | |          | | [===] Threshold Bar [====] | |
| +----------------------------+ |          | +----------------------------+ |
+--------------------------------+          +--------------------------------+
```

### 2.1 Doorway Structure & Sizing
* **Door Dimension**: $s = \text{cellSize} \times 0.82$, centered within the grid tile.
* **Outer Door Jamb**: 2px rounded rectangle (`strokeRoundedRect(..., 4px)`).
* **Inner Door Bevel**: 1.5px architectural bevel inset by 3px.
* **Doorway Panel**:
  - Real World: High-contrast dark panel (`#181818` / `0x181818`).
  - Shadow World: High-contrast light panel (`#EEEEEE` / `0xeeeeee`).
* **Threshold Bar**: Grounding anchor bar at the bottom of the doorway.

### 2.2 "EXIT" Typography Specification
* **String**: `"EXIT"` (uppercase, centered).
* **Font Family**: `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace, sans-serif`.
* **Font Weight**: `bold` (900).
* **Font Size**: $\max(13\text{px}, \text{round}(\text{cellSize} \times 0.26))$.
* **Alignment**: Perfectly centered at $(x, y)$ (`origin: (0.5, 0.5)`).
* **Coloring**:
  - Real World: Pure white (`#FFFFFF`) against dark doorway panel.
  - Shadow World: Pure black (`#000000`) against light doorway panel.
* **Render Depth**: Depth `18`. Positioned directly above `dynamicPuzzleGraphics` (depth 15) and below the stickmen (depth 25).

---

## 3. Exit States & Dynamic Responses

### 3.1 Unlocked / Active State
* **Lettering**: High-contrast, bold, prominent (`#FFFFFF` Real / `#000000` Shadow).
* **Illumination**: Continuous harmonic cyan perimeter breathing glow (`0x00e5ff`, width 2.5px, opacity oscillating via $\sin(2.5t)$ between $0.25$ and $0.60$).
* **Visual Message**: Unambiguously communicates that this door is the level objective.

### 3.2 Locked State
* **Lettering**: Dimmed text color (`#777777` Real / `#888888` Shadow).
* **Visual Seal**: Diagonal crossing lock bars over the doorway panel (`0.8` alpha).
* **Door Identity**: Still clearly recognizable as an exit door, but clearly barred.

### 3.3 Character Arrival Response
* **Arrival Particle Burst**: When a character steps onto their exit tile, an energetic particle flare (`vfxManager.spawnSparkBurst(x, y, 14, 0x00e5ff)`) triggers immediately.
* **Depth Decoupling**: The stickman occupies depth 25 and stands naturally inside the doorway threshold. The text dims slightly to 35% alpha behind the character, preserving visual clarity without obscuring the stickman.
* **Independence Rule**: Reaching one exit tile does NOT complete the level. The character can wait or step off freely.

### 3.4 Level Completion Trigger
* **Simultaneous Arrival**: Level completion occurs **if and only if both characters simultaneously occupy their respective exit tiles** after the movement transaction commits and after all hazard checks resolve.
* **Celebration Beacon**: Upon simultaneous arrival, dual celebratory 25-particle radiant fountains burst at both exits, win audio triggers, and the level completion modal displays.

---

## 4. Verification & Testing

- [x] **Universal Presence**: Verified on Level 1, Level 6, and all 20 levels.
- [x] **Legibility**: High-contrast bold typography legible at all resolutions (Desktop, Tablet, Mobile).
- [x] **No HUD Confusion**: Centered strictly inside the door geometry; not a floating UI label.
- [x] **Character Layering**: Stickman rendered at depth 25 over doorway text at depth 18.
- [x] **Logic Preserved**: 20 / 20 BFS solutions and simultaneous paired exit rules remain intact.
