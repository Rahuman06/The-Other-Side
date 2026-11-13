# APPROVED VISUAL ASSETS & DESIGN PRESERVATION SPECIFICATION

**Project:** THE OTHER SIDE  
**Date:** November 13, 2026  
**Status:** APPROVED & LOCKED  
**Source Commit:** `2d74a08` (verified against Git history `873f731` and `5a45ee8`)  

---

## 1. Executive Summary

This document establishes the authoritative visual design specifications for **THE OTHER SIDE**. All assets, silhouettes, and rendering routines described herein have been verified against Git history, corrected to eliminate visual bugs, and locked against unauthorized mutation.

---

## 2. Character Visual Specification (Stickmen)

```
        Real World (Light Background)                Shadow World (Obsidian Void)
                    ( 0, headY )                                 ( 0, headY )
                      [  • ]  eyeOffset                            [ •  ]  eyeOffset
                        ||                                           ||
            shoulder --[==]-- shoulder                   shoulder --[==]-- shoulder
           /            ||            \                 /            ||            \
     armLen             ||             armLen     armLen             ||             armLen
                        ||                                           ||
                     pelvisY                                      pelvisY
                    /        \                                   /        \
              legLen          legLen                       legLen          legLen
              /                  \                         /                  \
            (lx1, ly1)         (lx2, ly2)                (lx1, ly1)         (lx2, ly2)
```

### 2.1 Color Palette & Proportions
* **Real World Stickman**: Deep architectural jet black (`#080808` / `0x080808`) with reflective white pupils (`#FFFFFF` / `0xffffff`).
* **Shadow World Stickman**: Luminous pure white (`#FFFFFF` / `0xffffff`) with deep obsidian pupils (`#000000` / `0x000000`).
* **Cell Scale Unit ($s = \text{cellSize}$)**:
  - **Head Radius**: $r_{\text{head}} = 0.16 \times s$ (centered at $y = -0.22 \times s$).
  - **Eyes**: Radius $r_{\text{eye}} = \max(1.5\text{px}, 0.2 \times r_{\text{head}})$, offset towards facing direction ($\Delta x = \pm 0.35 \times r_{\text{head}}$, $\Delta y = \pm 0.25 \times r_{\text{head}}$).
  - **Torso**: Slim vertical line of stroke width $w_{\text{stroke}} = \max(2\text{px}, \text{round}(0.07 \times s))$ spanning from $y_{\text{neck}} = y_{\text{head}} + 0.8 \times r_{\text{head}}$ to $y_{\text{pelvis}} = 0.08 \times s$.
  - **Arms**: Length $L_{\text{arm}} = 0.22 \times s$, anchored at $y_{\text{shoulder}} = y_{\text{neck}} + 0.25 \times (y_{\text{pelvis}} - y_{\text{neck}})$.
  - **Legs**: Length $L_{\text{leg}} = 0.26 \times s$, anchored at $y_{\text{pelvis}}$.
  - **Rounded Endpoints**: Clean circular terminal caps (`g.fillCircle(x, y, w_stroke / 2)`) at joints, hands, and feet.
  - **Resting Stance**: Symmetric natural parting (legs at $\pm 0.18\text{ rad}$, arms at $\pm 0.22\text{ rad}$) preventing limb overlap.

### 2.2 Root-Cause Analysis of the "Attached Object" Defect
* **The Problem**: In the Phase 2 prototype, the Real World character appeared to be carrying a box or had an object attached to its body.
* **The Discovery**: In `src/rendering/PuzzleObjectRenderer.ts` (line 85), during the rendering of dynamic elements, an exit beacon was erroneously called with the player's position:
  ```ts
  // Faulty line 85:
  this.renderExit(g, GridPoint.from(session.player.position), true, getScreenCoords);
  ```
* **The Consequence**: Because `renderExit()` draws an architectural gateway portal frame with rounded corners, concentric pulsating beacon rings, and a central glowing core, this entire 48px square structure was drawn every frame directly over the Real World stickman.
* **The Permanent Resolution**: Line 85 was corrected to pass `session.definition.realExit` and `session.definition.shadowExit`. The stickman container now renders solely the clean procedural stickman.

---

## 3. Cracked Block Specification (Destructible Wall)

```
+-----------------------------+
|              |              |
|   Quadrant   |   Quadrant   |
|      1       |      2       |
|              |              |
|--------------+--------------|
|              |              |
|   Quadrant   |   Quadrant   |
|      3       |      4       |
|              |              |
+-----------------------------+
   Clean 4-Quadrant Segmented Stone Block
```

### 3.1 Geometric & Material Parameters
* **Tile Dimensions**: Clean square tile boundary of size $s_{\text{tile}} = \text{cellSize} \times 0.88$, centered at grid coordinates $(x, y)$.
* **Coloration**:
  - Real World: Fill `0x222222`, border and cross-stroke `PALETTE.real.walls` (`0x171717`).
  - Shadow World: Fill `0xdddddd`, border and cross-stroke `PALETTE.shadow.walls` (`0xf2f2f2`).
* **Approved Cross-Segmented Design (Restored from Git Baselines `873f731` & `5a45ee8`)**:
  ```ts
  g.fillStyle(fillCol, 1);
  g.fillRect(coords.x - size / 2, coords.y - size / 2, size, size);

  // Clean 4-quadrant segmented texture pattern
  g.lineStyle(1.5, strokeCol, 0.7);
  g.strokeRect(coords.x - size / 2, coords.y - size / 2, size, size);
  g.lineBetween(coords.x - size / 2, coords.y, coords.x + size / 2, coords.y);
  g.lineBetween(coords.x, coords.y - size / 2, coords.x, coords.y + size / 2);
  ```
* **Why the Angular Crack Was Rejected**: The experimental zigzag line broke the architectural grid alignment, lacked visual consistency across both worlds, and looked like an unintended rendering glitch rather than a modular, bomb-destructible masonry block.

---

## 4. Architectural Exit Gateway Specification

* **Outer Frame**: Heavy monolithic gateway portal (`size = cellSize * 0.72`) with 6px rounded bevel and 4px inner archway trim.
* **Concentric Ground Beacons**: Dual harmonic pulsating rings (`0x00e5ff` cyan accent and monochrome character color) expanding and contracting smoothly via sine oscillation ($\sin(2.5t)$).
* **Radiant Threshold Core**: Central beacon orb illuminating arrival space.
* **Paired Condition**: Both real and shadow exits pulse synchronously to communicate the shared objective.

---

## 5. Puzzle Object Silhouette & State Matrix

| Object | Primary Visual Silhouette | Inactive State | Active / Energized State |
| :--- | :--- | :--- | :--- |
| **Saw Blade** | 8 curved shark-fin teeth, circular steel disk, 4-bolt hub. | Static (during pause). | Continuous 480°/sec rotation with motion blur rim halo. |
| **Laser Emitter** | Cylindrical housing with directional nozzle barrel. | Greyed-out lens core. | Bright cyan nozzle line and glowing status core. |
| **Laser Beam** | 3-layer continuous energy beam (6px ionization, 3px cyan, 1.5px white). | Non-existent when blocked. | Continuous beam with micro-jitter and terminal spark splatters. |
| **Laser Receiver** | Square receptor dish with target bullseye rings. | Dark inner target. | Luminous cyan core with high-intensity focal hotspot. |
| **Laser Mirror** | Dielectric optical prism glass plate on swivel mount. | Angled reflector at 45°. | Cyan specular sheen reflecting incoming beam at 90°. |
| **Standard Portal** | Monolithic rune frame with dual counter-rotating vortices. | Quiescent cosmic ring. | Outer clockwise spiral + inner counter-clockwise vortex + inward particles. |
| **Corrupted Portal** | Jagged thorn perimeter with unstable void singularity. | Inactive. | Fractured thorns with pulsing magenta void accent (`0xff0055`). |
| **Timed Bomb** | Heavy cast-iron sphere with rivets and burning cord fuse. | Unarmed. | Sputtering fuse sparks, pulsing red blast zone, bold countdown text. |
| **Pressure Plate** | 3D beveled platform in recessed floor trench. | Raised 4px with contact diamond. | Sunken flush with floor, illuminated cyan contact pads. |
| **Switch** | Industrial toggle console with mounting faceplate. | Lever down-left, dim LED. | Lever up-right, glowing cyan LED (`0x00e5ff`). |
| **Blast Door** | Segmented heavy door with interlocking chevron teeth. | Closed: sealed blast barrier. | Open: leaves retracted into frame jambs with clear threshold. |
| **Time Lock** | Astronomical chronometer with 8 gear teeth. | Rested clock hands. | Translucent cyan freeze dome with sweeping luminous second hand. |
| **Movable Block** | Magnetized crate with reinforced corner brackets. | Resting crate. | Glides along vector with glowing polarity glyph. |
| **Magnetic Field** | Circular dish projecting directional force corridors. | Inactive dish. | Pulsing concentric magnetic wave arcs along force vector. |
| **Collapsing Floor** | Paving stone slab with progressive distress states. | Hairline corner notches. | Cracked (fissures + falling crumbs) $\to$ Collapsed (abyss pit). |
| **Checkpoint** | Monolithic obelisk with 4 cardinal ground tick marks. | Dormant stone circle. | Visited: filled core $\to$ Synchronized: radiant beacon pillar + sparks. |
