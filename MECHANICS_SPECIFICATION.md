# MECHANICS SPECIFICATION — THE OTHER SIDE
**Document Version**: 2.0.0  
**Phase**: Phase 1 — Master Game Design and Architecture  
**Status**: Proposal / Architecture Blueprint  

---

## 1. Core Principles & Coordinate Space

*THE OTHER SIDE* is a deterministic, turn-based, grid logic puzzle game set across two parallel realities displayed side-by-side.

```
+-----------------------------------+-----------------------------------+
|            REAL WORLD             |           SHADOW WORLD            |
|       (White Environment)         |        (Black Environment)        |
|      (Black Character #080808)    |     (White Character #FFFFFF)     |
|             (x, y)                |              (x, y)               |
+-----------------------------------+-----------------------------------+
```

### 1.1 Grid System
- Coordinate Space: 2D integer coordinates `(x, y)` where:
  - `x`: Column index, $0 \le x < \text{width}$ (Left to Right: $0 \to \text{width}-1$).
  - `y`: Row index, $0 \le y < \text{height}$ (Top to Bottom: $0 \to \text{height}-1$).
- **No Floating-Point Physics**: Movement is strictly discrete and grid-aligned. There is no continuous momentum, jumping, gravity, acceleration, or diagonal traversal.
- **Simultaneous Visual Rendering**: The screen is vertically partitioned into two distinct visual windows with aesthetic lamp lighting and minimalist environmental silhouettes matching the reference artwork (`The Other Side_ Twin Worlds.png`).

---

## 2. Movement & Dual-World Inversion Engine

A single directional input command $d \in \{\text{'left'}, \text{'right'}, \text{'up'}, \text{'down'}\}$ drives both characters simultaneously.

### 2.1 Movement Direction Vectors
| Direction | Real World Delta $(\Delta x_r, \Delta y_r)$ | Shadow World Delta $(\Delta x_s, \Delta y_s)$ | Rule Description |
| :--- | :---: | :---: | :--- |
| **`'left'`** | $(-1, 0)$ | $(+1, 0)$ | Mirrored horizontal: Real moves West, Shadow moves East |
| **`'right'`** | $(+1, 0)$ | $(-1, 0)$ | Mirrored horizontal: Real moves East, Shadow moves West |
| **`'up'`** | $(0, -1)$ | $(0, -1)$ | Synchronous vertical: Both move North |
| **`'down'`** | $(0, +1)$ | $(0, +1)$ | Synchronous vertical: Both move South |

### 2.2 Atomic Movement Resolution Pipeline
Every movement transaction follows a strict 8-step atomic pipeline:
1. **Pre-Movement Snapshot**: Capture current positions $(P_{\text{old}}, S_{\text{old}})$.
2. **Target Computation**: Calculate candidate target cells $P_{\text{target}} = P_{\text{old}} + \Delta_r(d)$ and $S_{\text{target}} = S_{\text{old}} + \Delta_s(d)$.
3. **Independent Collision Evaluation**:
   - Evaluate $P_{\text{target}}$ against the Real World grid and puzzle objects.
   - Evaluate $S_{\text{target}}$ against the Shadow World grid and puzzle objects.
   - Evaluated properties: `canEnter`, `isBlocked`, `isHazard`, `isDoor`, `isSwitch`, `isPlate`, `isExit`.
4. **Collision Decoupling**: If Real is blocked but Shadow is free, Shadow moves and Real remains at $P_{\text{old}}$. If Shadow is blocked but Real is free, Real moves and Shadow remains at $S_{\text{old}}$. Neither character restricts the other from valid moves.
5. **Simultaneous Position Commit**: Update internal entity coordinates to $P_{\text{new}}$ and $S_{\text{new}}$.
6. **Puzzle State Recalculation**:
   - Process switch triggers (`wasNotOnSwitch && isOnSwitch`).
   - Recalculate pressure plate occupancy from $(P_{\text{new}}, S_{\text{new}})$.
   - Recalculate door openness from linked switches and plates.
7. **Hazard Resolution**: If *either* $P_{\text{new}}$ or $S_{\text{new}}$ occupies a hazard cell, trigger the **Death & Checkpoint Restoration** sequence immediately.
8. **Exit Evaluation**: Check if *both* characters simultaneously occupy their respective exit cells.

---

## 3. Exit Conditions & Traversability Rules

### 3.1 Simultaneous Exit Requirement (Rule 9)
- Unlike traditional puzzle games where reaching an exit permanently removes or locks an entity, **both characters must occupy their respective exits simultaneously** to trigger level completion:
  $$\text{Level Complete} \iff P_{\text{new}} = \text{RealExit} \land S_{\text{new}} = \text{ShadowExit}$$

### 3.2 Non-Locking Exit Traversal (Rule 10)
- Exit cells are completely walkable tiles (`canEnter = true`).
- A character occupying an exit tile:
  - Can freely step off the exit tile in any valid direction.
  - Can traverse across the exit tile as part of a path toward a switch or button.
  - Can wait on the exit while the other character maneuvers, as long as subsequent inputs don't walk them off into a wall or hazard.

### 3.3 Hazard Precedence (Rule 11)
- If one character steps onto their exit tile, but the other character steps into a lethal hazard on the exact same turn:
  - The hazard takes absolute precedence.
  - The game state transitions to `DYING`.
  - The level completion is **not** triggered.
  - Both characters and puzzle objects rollback atomically to the last active checkpoint.

---

## 4. Puzzle Objects & Interactive Elements

### 4.1 Switches (`SWITCH`)
- **Visuals**: Circular toggle pad on floor with glowing core.
- **Activation Trigger**: Triggers strictly on **entry** (`oldPos \ne switchPos \land newPos = switchPos`).
- **Behaviors**:
  - `TOGGLE`: Inverts active state (`active = !active`) every time a character enters the cell.
  - `ACTIVATE_ONLY`: Permanently activates (`active = true`) upon first entry.
- **Idempotency**: Standing on a switch without leaving, turning into a blocked wall, or frame rendering updates does not re-trigger the switch.

### 4.2 Pressure Plates (`PRESSURE_PLATE`)
- **Visuals**: Beveled rectangular plate recessed into the floor.
- **Activation Trigger**: Continuous occupancy.
- **Rule**: Active if and only if a character currently stands on the plate:
  $$\text{PlateActive}(plate) \iff P_{\text{pos}} = plate.\text{pos} \lor S_{\text{pos}} = plate.\text{pos}$$
- **Release**: When the occupying character departs, the plate deactivates immediately.

### 4.3 Doors & Gates (`DOOR`)
- **Visuals**: Framed barrier with cross-hatch/gate pattern when closed; retracted outline when open.
- **Walkability**:
  - `Open`: Walkable (`canEnter = true`).
  - `Closed`: Solid barrier (`canEnter = false`).
- **Activation Rules for Multi-Trigger Doors**:
  - `DIRECT`: Controlled by 1 switch or 1 plate. Open if trigger is active.
  - `ALL`: Controlled by multiple triggers. Open if and only if **all** triggers are active.
  - `ANY`: Controlled by multiple triggers. Open if **at least one** trigger is active.
- **Occupancy Safety Clause**: If a door closes while a character is standing within its cell (e.g. stepping off a pressure plate that controls the door they just entered), the character is **not crushed or soft-locked**; they are permitted to leave the cell (`fromPos = doorPos \implies canEnter = true`).

### 4.4 Hazards & Spikes (`HAZARD`)
- **Visuals**: Triangular sharp spike teeth protruding from the terrain floor.
- **Effect**: Stepping onto a hazard cell immediately triggers character destruction and the death sequence.

### 4.5 Paired Checkpoints (`CHECKPOINT`)
- **Visuals**: Circular twin glyphs on the floor in matching Real and Shadow locations.
- **Activation Rule**: Checkpoint activates if and only if **both** characters have visited their corresponding checkpoint coordinates:
  $$\text{Activated} \iff \text{realVisited} \land \text{shadowVisited}$$
- **Atomic Snapshot**: Captures:
  - Player position $(x, y)$.
  - Shadow position $(x, y)$.
  - All door states (open/closed).
  - All switch states (active/inactive).
  - All pressure plate states.
- **Death Rollback**: When either character enters a hazard:
  1. Set state to `DYING`.
  2. Kill active movement animations.
  3. Atomically restore both characters and puzzle states to the last activated paired checkpoint (or initial level spawn if no checkpoint was activated).
  4. Return to `PLAYING`.

---

## 5. Advanced Mechanics for Chapters 2–5

### 5.1 Pushable Crates / Blocks (`CRATE`) (Introduced in Chapter 2)
- As depicted in UI reference image `The Other Side_ Twin Worlds.png`:
  - Pushable cubic crate marked with an `[X]` cross-brace.
  - When a character moves toward a crate:
    - If the cell behind the crate in that movement direction is empty floor (`canEnter = true`), the crate is pushed forward 1 tile and the character occupies the crate's former cell.
    - If the cell behind the crate is a wall, door, or another crate, the push is blocked.
  - Crates can be pushed onto pressure plates to hold them down continuously!
  - Crates pushed into hazard pits fill the pit, transforming the hazard tile into a safe walkable platform!

### 5.2 Dynamic Corruption / Timed Hazards (Chapter 3)
- Tiles that become hazardous or crumble upon leaving, requiring non-retracing movement paths.

### 5.3 Optical & Magnetic Diverters (Chapters 4 & 5)
- Directional deflection tiles and synchronized cross-world links where moving in one world alters the orientation of barriers in the other.
