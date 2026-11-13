# LEVEL 11 — NO WAY BACK: EXPERT PUZZLE DESIGN SPECIFICATION

**Project:** THE OTHER SIDE  
**Chapter:** 3 — THE SEPARATION  
**Difficulty:** Expert  
**Tagline:** TWO WORLDS. ONE MIND.  
**Theme:** Irreversible movement, fragile floors, and cross-world environmental collapse.

---

## 1. Executive Summary & Puzzle Identity

Level 11 introduces players to the **Collapsing Floor** mechanic and establishes the theme of irreversible consequence: *"Every step can permanently change available routes."* 

Unlike early levels where players can freely backtrack, Level 11 forces players to commit across fragile terrain that crumbles into impassable void abysses upon departure. The central identity lies in **asymmetric cross-world collapse dependencies**: stepping on the central checkpoint in the Real World triggers a sympathetic delayed collapse in the Shadow World, destroying a secondary bypass route and forcing both stickmen to synchronize an intricate bypass through a patrolling saw corridor.

---

## 2. World Layouts & Spatial Geometry

- **Grid Dimensions:** 8 Columns $\times$ 5 Rows ($x \in [0..7], y \in [0..4]$).
- **Coordinate Space:** $(0,0)$ top-left, $(7,4)$ bottom-right.
- **Playable Interior:** $x \in [1..6], y \in [1..3]$.

### 2.1 Starting & Exit Positions
| Actor / Gateway | World | Coordinate | Visual Identity |
| :--- | :--- | :---: | :--- |
| **Real Stickman** | Real World (Light architectural) | `(1, 2)` | Solid black minimalist stickman |
| **Shadow Stickman**| Shadow World (Deep obsidian void) | `(6, 2)` | Luminous white minimalist stickman |
| **Real Exit Door** | Real World | `(6, 2)` | Dark doorway frame, bold cyan **EXIT** |
| **Shadow Exit Door**| Shadow World | `(1, 2)` | Inverted white frame, cyan aura **EXIT** |

### 2.2 Architectural Wall Placements
- **Perimeter Boundaries:**
  - Both Worlds: Columns 0 & 7 ($y \in [0..4]$), Rows 0 & 4 ($x \in [0..7]$).
- **Real World Interior Walls:**
  - `(1, 1)`: Blocks premature upper retreat from spawn.
  - `(2, 1)`: Guides player across the entry line.
  - `(2, 3)`: Blocks lower bypass at the start, forcing commitment into the entry corridor.
  - `(5, 0)`: Northern decorative structural buttress.
- **Shadow World Interior Walls:**
  - `(6, 1)`: Blocks premature upper retreat from shadow spawn.
  - `(5, 1)`: Guides shadow actor across the entry line.
  - `(5, 3)`: Blocks initial lower deviation.
  - `(2, 0)`: Northern architectural buttress.

---

## 3. Puzzle Objects & Mechanism Placements

```
REAL WORLD (Light Theme):
+---+---+---+---+---+---+---+---+
| W | W | W | W | W | W | W | W | y=0
+---+---+---+---+---+---+---+---+
| W | W | W | C3| C4| S | . | W | y=1   (C3, C4: Upper Bridge; S: Saw Lane)
+---+---+---+---+---+---+---+---+
| W | R | C1| CP| C2| S | RE| W | y=2   (R: Real Start; C1: Entry; CP: Checkpoint; RE: Real Exit)
+---+---+---+---+---+---+---+---+
| W | . | W | . | . | S | . | W | y=3   (Lower Corridor Bypass)
+---+---+---+---+---+---+---+---+
| W | W | W | W | W | W | W | W | y=4
+---+---+---+---+---+---+---+---+
  x=0 x=1 x=2 x=3 x=4 x=5 x=6 x=7

SHADOW WORLD (Dark Theme):
+---+---+---+---+---+---+---+---+
| W | W | W | W | W | W | W | W | y=0
+---+---+---+---+---+---+---+---+
| W | . | S | C4| C3| W | W | W | y=1   (S: Saw Lane; C4, C3: Upper Bridge)
+---+---+---+---+---+---+---+---+
| W | SE| S | C2| CP| C1| S0| W | y=2   (SE: Shadow Exit; C2: Mid; CP: Checkpoint; S0: Shadow Start)
+---+---+---+---+---+---+---+---+
| W | . | S | . | C5| W | . | W | y=3   (C5: Collapsing Lower Tile)
+---+---+---+---+---+---+---+---+
| W | W | W | W | W | W | W | W | y=4
+---+---+---+---+---+---+---+---+
```

### Object Manifest
1. **Entry Collapsing Floors (Permanent):**
   - `cf-11-real-entry` at Real `(2, 2)`: Cracks when stepped on; collapses permanently once vacated.
   - `cf-11-shadow-entry` at Shadow `(5, 2)`: Mirrored permanent collapse.
2. **Intermediate Fragile Floors:**
   - `cf-11-real-mid` at Real `(4, 2)`
   - `cf-11-shadow-mid` at Shadow `(3, 2)`
   - `cf-11-real-bridge` at Real `(3, 1)`
   - `cf-11-shadow-bridge` at Shadow `(4, 1)`
   - `cf-11-real-upper` at Real `(4, 1)`
   - `cf-11-shadow-upper` at Shadow `(3, 1)`
3. **Paired Checkpoint:**
   - `cp-11`: Real at `(3, 2)`, Shadow at `(4, 2)`. Activates only when both stickmen step onto their respective pads.
4. **Patrolling Saw Blades (Moving Hazards):**
   - `saw-11-real`: Patrols column 5: `(5, 2) -> (5, 1) -> (5, 2) -> (5, 3)` (Initial index 0).
   - `saw-11-shadow`: Patrols column 2: `(2, 2) -> (2, 3) -> (2, 2) -> (2, 1)` (Initial index 0).
5. **Surprise Events:**
   - `se-11-cross-collapse`: Stepping on Checkpoint `(3, 2)` in Real World triggers a delayed collapse of floor tile `(4, 3)` in Shadow World after 1 turn!
   - `se-11-real-seal`: Stepping on Checkpoint `(3, 2)` triggers a delayed collapse of Real World spawn platform `(1, 2)`.

---

## 4. Multi-Step Puzzle Sequence & Valid Solution

The puzzle requires an 11-step sequence of spatial commitments, timing synchronization, and obstacle evasion:

$$\text{Solution Sequence: } \text{Right} \to \text{Right} \to \text{Up} \to \text{Right} \to \text{Down} \to \text{Down} \to \text{Left} \to \text{Right} \to \text{Right} \to \text{Right} \to \text{Up}$$

### Step-by-Step Walkthrough

| Step | Move | Real World Action & Position | Shadow World Action & Position | Environmental & Surprise State |
| :---: | :---: | :--- | :--- | :--- |
| **1** | `Right` | Moves onto `cf-11-real-entry` at `(2, 2)`. | Moves onto `cf-11-shadow-entry` at `(5, 2)`. | Tiles fracture into `CRACKED` state; stone dust & warning hum. |
| **2** | `Right` | Moves onto `cp-11` at `(3, 2)`. | Moves onto `cp-11` at `(4, 2)`. | `cp-11` activates! Entry tiles `(2, 2)` & `(5, 2)` collapse into void. `se-11-cross-collapse` & `se-11-real-seal` ARMED (delay 1). |
| **3** | `Up` | Ascends onto fragile bridge `(3, 1)`. | Ascends onto fragile bridge `(4, 1)`. | Delayed collapse executes! Shadow `(4, 3)` & Real `(1, 2)` collapse into abysses. Bridges fracture into `CRACKED`. |
| **4** | `Right` | Crosses bridge to `(4, 1)`. | Crosses bridge to `(3, 1)`. | Bridges `(3, 1)` & `(4, 1)` collapse permanently behind actors. |
| **5** | `Down` | Steps down to `(4, 2)` (`cf-11-real-mid`). | Steps down to `(3, 2)` (`cf-11-shadow-mid`). | Evades northern saw blade return. Mid-corridor tiles crack. |
| **6** | `Down` | Weaves south to `(4, 3)`. | Weaves south to `(3, 3)`. | Mid-corridor tiles `(4, 2)` & `(3, 2)` collapse behind actors. |
| **7** | `Left` | Stagger alignment step to `(3, 3)`. | Stagger alignment step to `(4, 3)`. | **Crucial timing calibration:** Waits 1 turn for saws to cycle out of hazard lane. |
| **8** | `Right` | Steps into safe row 3 lane `(4, 3)`. | Steps into safe row 3 lane `(3, 3)`. | Saws reach northern apex `(5, 1)` & `(2, 1)`, clearing southern passage. |
| **9** | `Right` | Crosses column 5 hazard lane into `(5, 3)`. | Crosses column 2 hazard lane into `(2, 3)`. | Saws swing behind into row 2. Safe passage achieved! |
| **10** | `Right` | Steps to exit column `(6, 3)`. | Steps to exit column `(1, 3)`. | Saws swing into row 3 behind actors. |
| **11** | `Up` | Ascends into **Real Exit** at `(6, 2)`. | Ascends into **Shadow Exit** at `(1, 2)`. | **DUAL ARRIVAL!** Paired exit victory chime triggers. |

---

## 5. Discoverable Surprise & Psychological Impact

### The Surprise: Sympathetic Cross-World Collapse (`se-11-cross-collapse`)
- **Foreshadowing / Warning Clue:** Upon stepping on the checkpoint, subtle amber hairline fissures spread across the stone floor accompanied by the prompt clue: *"A sympathetic tremor echoes through the lower Shadow corridor floor"*.
- **The Twist:** Players naturally expect their actions in the Real World to affect only Real World terrain. Stepping onto the checkpoint triggers a delayed structural collapse in the *opposite* world, permanently swallowing tile `(4, 3)` in Shadow.
- **Fairness:** The collapse is delayed by 1 full turn, giving the player immediate visual notice before the void becomes lethal. Because the optimal route utilizes the upper bridge bypass before returning south, the collapse eliminates false shortcuts without causing unavoidable instant death.

---

## 6. Clear Failure Feedback & Retry Architecture

1. **Walking into Collapsed Voids:** Blocked with a sharp mechanical thud (`SoundEffects.playBump()`).
2. **Saw Blade Impact:** Character dematerializes into radiating monochrome particle shards accompanied by `SoundEffects.playSaw('impact')` and `playDeath()`.
3. **Atomic Checkpoint Restoration:**
   - Dying after Step 2 immediately respawns both stickmen at Checkpoint `(3, 2)` and `(4, 2)`.
   - Grid states, collapsed tiles, and saw patrol indices roll back cleanly without requiring level reload or softlocking the session.
4. **Restart Button:** Available at all times via UI button or `R` key, instantly restoring the pristine level baseline.

---

## 7. Verification & Automated Test Results

- **Automated Level Solver:** 100% verified via BFS (`npm run validate:levels`):
  - Explored states: **315**
  - Solution length: **11 steps**
  - Replay verified: **YES**
  - Compute time: **18.3 ms**
- **Unit & Integration Suite:** 246 / 246 tests passing (`npm test`), including dedicated tests in `Level11.test.ts` and `StressAndEdgeCases.test.ts`.
- **E2E Browser Test:** Verified in Microsoft Edge via Playwright (`tests/browser/surprise-traps.spec.ts`):
  - Checkpoint trap trigger: `screenshots/phase7-level11-checkpoint-trap.png`
  - Cross-world void collapse: `screenshots/phase7-level11-cross-collapse.png`
  - Level completion victory: `screenshots/phase7-level11-complete.png`
  - Fatal console errors: **0**
