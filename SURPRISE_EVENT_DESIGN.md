# THE OTHER SIDE — SURPRISE EVENT & UNEXPECTED TRAP ENGINE DESIGN

**Document Version:** 1.0.0  
**Phase:** 6 — Unexpected Traps and Psychological Puzzle Gameplay  
**Architecture Status:** Fully Implemented, Unit Tested & Verified (20/20 BFS Solved)  
**Tagline:** *TWO WORLDS. ONE MIND.* — "Nothing is as it appears. Every decision can change the world."

---

## 1. Architectural Overview

The **Surprise Event Engine** is a deterministic, event-driven reactive system designed to introduce psychological tension, deceptive spatial interactions, and dramatic environmental transformations into the second half of *THE OTHER SIDE* (Levels 11–20), while strictly preserving the handcrafted purity of Levels 1–10.

```
+-----------------------------------------------------------------------------------------+
|                                    INPUT / TURN ENGINE                                  |
|   TurnEngine.handleInput(direction) -> MovementEngine.executeMove()                      |
+-----------------------------------------------------------------------------------------+
                                             |
                                             v
+-----------------------------------------------------------------------------------------+
|                                SURPRISE EVENT MANAGER                                   |
|   src/events/SurpriseEventManager.ts                                                    |
|                                                                                         |
|   1. Advance ARMED delayed countdowns (delayRemaining--)                                |
|   2. Evaluate PENDING triggers (STEP_ON, STEP_OFF, PROXIMITY, SWITCH, BOMB, TURN)       |
|   3. Dispatch Actions:                                                                  |
|      - SPAWN_WALL / REMOVE_WALL                                                         |
|      - COLLAPSE_TILE (void creation)                                                    |
|      - SPAWN_HAZARD / REMOVE_HAZARD                                                     |
|      - ARM_BOMB / REDIRECT_PORTAL / SHIFT_WALL                                          |
|   4. Audio & Visual Event Dispatch:                                                     |
|      - SoundEffects.playSurpriseCue()                                                   |
|      - VisualEffectsManager (shockwaves, stone debris, screen tremor)                   |
|      - GameScene.rebuildWorldGrid()                                                     |
+-----------------------------------------------------------------------------------------+
       |                                      |                                    |
       v                                      v                                    v
+--------------------+              +--------------------+              +--------------------+
|  CHECKPOINT SYSTEM |              |  BFS LEVEL SOLVER  |              |  RENDERER & VFX    |
|  Atomic snapshot   |              |  Deterministic     |              |  Camera shakes,    |
|  & tile reversal   |              |  state key hash    |              |  debris particles, |
|  on death/restart  |              |  `|SE[id:state:d]` |              |  dynamic tile mesh |
+--------------------+              +--------------------+              +--------------------+
```

---

## 2. Core Design Principles

### 2.1 The Philosophy of Psychological Deception
Inspired by the surprise-based mechanics of modern psychological puzzle games without copying their art or levels, the engine adheres to:
1. **Discoverable Foreshadowing (Fairness Guarantee):** No surprise trap triggers without a discoverable sensory clue (`warningClue`) in the environment — faint hairline fractures on the floor, electromagnetic static hums, subtle dust trickles from the ceiling, or chromatic aberration at gateway thresholds.
2. **Deterministic Predictability:** Given the exact sequence of player moves, surprise events will always trigger identically. There are zero RNG or unpredictable dice rolls.
3. **Reversible Checkpoint State:** Death or checkpoint restoration cleanly restores tile baselines and event queues without state leakage or permanent soft-locks.
4. **BFS Solver Harmony:** Every level featuring surprise events is fully traversed and validated by the automated BFS solver (`scripts/validateLevels.ts`).

---

## 3. Trigger Taxonomy & Lifecycle

Surprise events operate on a strict 4-state state machine:

```
       +--------------+
       |   PENDING    |  (Waiting for trigger conditions)
       +--------------+
              |
       [Trigger Met]
              |
       +------+------+
       |             |
(delay == 0)   (delay > 0)
       |             |
       |      +--------------+
       |      |    ARMED     |  (Countdown decrements each turn)
       |      +--------------+
       |             |
       |       (delay == 0)
       v             v
       +--------------+
       |  TRIGGERED   |  (Action executed: tiles modified, VFX spawned)
       +--------------+
              |
              v
       +--------------+
       |  COMPLETED   |  (Final state; recorded in snapshot)
       +--------------+
```

### 3.1 Trigger Types
| Trigger Type | Description | Evaluation Timing |
| :--- | :--- | :--- |
| `STEP_ON` | Triggered when either Real or Shadow player steps onto `triggerPosition`. | End of movement transaction |
| `STEP_OFF` | Triggered when player vacates `triggerPosition` to another tile. | Movement step exit |
| `PROXIMITY` | Triggered when Manhattan distance $\le$ `triggerRadius` from target. | Turn evaluation |
| `SWITCH_TOGGLE`| Triggered when a designated puzzle switch is activated. | Switch toggle callback |
| `PLATE_PRESS` | Triggered when a pressure plate is depressed by player or block. | Plate press callback |
| `BOMB_DETONATED`| Triggered when an explosive charge detonates. | Bomb detonation event |
| `TURN_COUNT` | Triggered when global turn counter reaches threshold. | Turn counter increment |
| `EXIT_APPROACH`| Triggered when stepping adjacent to the exit gateway. | Exit proximity check |

---

## 4. Action Execution & Dynamic Grid Architecture

When an event triggers, `executeAction()` modifies the underlying logical grid and updates collision data:

1. **`SPAWN_WALL`:** Mutates walkable floor into solid `TileType.WALL`. Prevents player and entity traversal.
2. **`REMOVE_WALL`:** Converts solid architectural wall into walkable `TileType.FLOOR`. Unlocks secret corridors and shortcuts.
3. **`COLLAPSE_TILE`:** Transforms floor into an impassable abyss (`TileType.WALL` with void styling).
4. **`SPAWN_HAZARD` / `REMOVE_HAZARD`:** Dynamically injects or cleans up lethal spike tiles registered in `dynamicHazardTiles`.
5. **`SHIFT_WALL`:** Atomically dematerializes an obstacle at `targetPosition` and reconstructs it at `secondaryTargetPosition`.
6. **`ARM_BOMB`:** Remotely ignites a bomb fuse from across the dimensional rift.
7. **`SHIFT_PORTAL`:** Alters a portal's destination coordinates, subverting player spatial expectations.

---

## 5. Tile Reversion & Checkpoint Snapshot Restoration

To ensure deterministic retries without level reload delays:
- **Baseline Tile Caching:** On level initialization, `SurpriseEventManager` captures the initial `TileType` of every target position into an internal `originalTileTypes` map (`world:x:y`).
- **Atomic Snapshot Capture:** `captureSnapshot()` serializes event state (`PENDING`, `ARMED`, `TRIGGERED`, `COMPLETED`) and `delayRemaining`.
- **Snapshot Restoration:** `restoreSnapshot()` immediately reverts all affected tiles to their initial baseline, clears dynamic hazards, and replays only those events marked `TRIGGERED` or `COMPLETED` in the snapshot.

---

## 6. Solver Integration & State Hashing

The BFS level solver must identify identical world states while considering dynamic surprise events. In `LevelSolver.ts`:

$$\text{StateKey} = \text{PlayerPos} \parallel \text{ShadowPos} \parallel \text{Switches} \parallel \text{Plates} \parallel \text{Doors} \parallel \text{Floors} \parallel \text{SurpriseState}$$

The surprise state is serialized compactly:
```ts
public serialize(): string {
  return Array.from(this.eventStates.entries())
    .map(([id, st]) => `${id}:${st.state}:${st.delayRemaining}`)
    .join('|');
}
```

This compact string guarantees that BFS search correctly distinguishes between a tile before and after a surprise collapse without combinatorial state explosion.

---

## 7. Audio-Visual Synthesis

Every surprise event is accompanied by atmospheric audio and visual cues:
- **Audio:** `SoundEffects.playSurpriseCue()` maps cues (`crumble`, `wall_shift`, `shockwave`, `distortion`, `wall_open`, `stasis_tick`, `explosion`, `hazard_trigger`) to Web Audio API synthesized procedural soundscapes.
- **Visuals:** `VisualEffectsManager` spawns stone debris chunks (`spawnStoneDebris`), camera screen shakes, and circular shockwave rings (`addShockwave`).
- **Tile Re-rendering:** Dynamic wall changes signal `GameScene.rebuildWorldGrid()`, immediately updating Phaser static graphics.
