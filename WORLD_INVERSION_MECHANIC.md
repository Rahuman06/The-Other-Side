# WORLD INVERSION MECHANIC: TECHNICAL SPECIFICATION

**System:** Core Spatial Engine / Inversion Subsystem  
**Component:** `InversionEngine.ts`  
**Applied Chamber:** Chamber 20 (The Final Paradox)  

---

## 1. Mechanics Overview & Guiding Philosophy

The **World Inversion** mechanic challenges the player's core assumption that world architecture is static. In Chamber 20, activating an Inversion Trigger causes the target environment to undergo an instantaneous 180-degree spatial inversion.

> [!IMPORTANT]
> **Strict Movement Invariance:**
> - Directional movement controls remain identical (up moves up, down moves down, right moves right for Real and left for Shadow).
> - There is NO automated falling, gravitational acceleration, or platformer physics.
> - The characters maintain continuous, grid-aligned four-directional stepping.

---

## 2. Mathematical Coordinate Transformation

For a grid of width $W$ and height $H$, the 180-degree spatial rotation mapping $T(x, y)$ is defined as:

$$T(x, y) = (W - 1 - x,\; H - 1 - y)$$

In the $8 \times 6$ layout of Chamber 20 ($W=8, H=6$):
- $x' = 7 - x$
- $y' = 5 - y$

### Architecture Inversion Mapping Table:
| Normal Grid Cell | Inverted Grid Cell | Architectural Meaning |
|:---|:---|:---|
| Row 0 (Ceiling) | Row 5 (Subterranean Depth) | Ceiling terrace becomes bottom floor |
| Row 1 (Upper Terrace) | Row 4 (Lower Platform) | Upper switch terrace descends to bridge height |
| Row 2 (Mid-North) | Row 3 (Mid-South) | Mid-corridor aligns with opposite chamber |
| Row 3 (Mid-South) | Row 2 (Mid-North) | Mid-corridor aligns with opposite chamber |
| Row 4 (Lower Platform) | Row 1 (Upper Terrace) | Lower pit ascends to overhead structure |
| Row 5 (Floor) | Row 0 (Ceiling) | Deep floor rotates to become overhead ceiling |

---

## 3. Fixed Dimensional Anchors

Certain structures must remain invariant under inversion so that the dimensional threshold between realities remains anchored:

```ts
fixedTilesReal = [{ x: 6, y: 3 }];    // Exit Door Threshold
fixedTilesShadow = [{ x: 1, y: 2 }];  // Exit Door Threshold
```

Any cell registered in `fixedTiles` is excluded from cell swapping during `invertGridOnly()`, ensuring:
1. The exit door `(6, 3)` in Real World always guards `(7, 3)`.
2. The exit door `(1, 2)` in Shadow World always guards `(0, 2)`.

---

## 4. Reference-Frame Actor Positioning

When an actor steps on an inversion trigger at $(x_t, y_t)$, they are part of the physical reference frame of that world. Their coordinate transforms along with the room:

$$\text{pos}_{\text{new}} = (W - 1 - x_t,\; H - 1 - y_t)$$

- **Alpha Activation (Real):** Real steps onto Alpha at `(1, 1)`. Real inverts:
  $$\text{pos}_{\text{player}} = (7 - 1,\; 5 - 1) = (6, 4)$$
- **Beta Activation (Shadow):** Shadow steps onto Beta at `(6, 4)`. Shadow inverts:
  $$\text{pos}_{\text{shadow}} = (7 - 6,\; 5 - 4) = (1, 1)$$

---

## 5. Puzzle Object Dynamic Synchronization

Rotating puzzle objects (switches, movable conduit gates) store their pristine base coordinates upon level instantiation. Whenever inversion state changes, their position is authoritatively synced:

$$\text{pos}_{\text{current}} = \begin{cases} (W - 1 - \text{base}.x,\; H - 1 - \text{base}.y) & \text{if World is Inverted} \\ \text{base} & \text{if Normal} \end{cases}$$

This guarantees zero coordinate drift across repeated snapshot restorations in the BFS solver or checkpoint restarts.
