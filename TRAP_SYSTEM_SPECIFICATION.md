# THE OTHER SIDE — TRAP SYSTEM SPECIFICATION

**Document Version:** 1.0.0  
**Phase:** 6 — Unexpected Traps and Psychological Puzzle Gameplay  
**Levels Covered:** Levels 11 through 20 (Levels 1–10 strictly preserved)  
**Safety & Fairness:** Zero unavoidable deaths; 100% BFS solvable control.

---

## 1. System Pacing & Difficulty Progression

The unexpected traps are phased throughout Chapters 3, 4, and 5 to create escalating psychological tension:

```
+---------------------------------------------------------------------------------------------------+
|  CHAPTER 3: THE SEPARATION (Levels 11–12)                                                          |
|  Theme: Environmental instability, delayed void collapses, secondary blast consequences.          |
+---------------------------------------------------------------------------------------------------+
                                                  |
                                                  v
+---------------------------------------------------------------------------------------------------+
|  CHAPTER 4: THE REFLECTION (Levels 13–16)                                                         |
|  Theme: Cross-world sympathetic reactions, optical beam deception, magnetic & stasis overloads.   |
+---------------------------------------------------------------------------------------------------+
                                                  |
                                                  v
+---------------------------------------------------------------------------------------------------+
|  CHAPTER 5: THE TRUTH (Levels 17–20)                                                              |
|  Theme: Multi-event chain reactions, portal singularity shifts, dual reality convergence.         |
+---------------------------------------------------------------------------------------------------+
```

---

## 2. Comprehensive Event Catalog (Levels 11–20)

### LEVEL 11: No Way Back
- **Chapter:** THE SEPARATION
- **Theme:** The entry floor crumbles behind you, cutting off retreat and demanding forward commitment.
- **Event ID:** `se-11-nowayback`
- **Name:** No Way Back Collapse
- **Trigger Condition:** `STEP_ON` Real World at `(3, 2)` (stepping onto the central checkpoint).
- **Affected World:** Real World
- **Target Object:** Floor tile at `(1, 2)` (entry starting position)
- **Activation Delay:** 1 turn
- **Resulting State:** Collapses from walkable floor into impassable void (`TileType.WALL`).
- **Animation:** `crumble` (stone dust particles, screen tremor).
- **Sound Cue:** `crumble` (low resonant rumble).
- **Collision Change:** `(1, 2)` permanently non-walkable.
- **Warning Clue:** *"Faint hairline fractures vibrating across the entry platform"*
- **Reset / Checkpoint Behavior:** Checkpoint at `(3, 2)` safely records `(1, 2)` as collapsed; restarting level from beginning restores `(1, 2)` as walkable floor.

---

### LEVEL 12: The Countdown
- **Chapter:** THE SEPARATION
- **Theme:** High-stress explosive breach; bomb detonation shockwaves cause structural ceiling stress.
- **Event 1 ID:** `se-12-shockwave`
  - **Name:** Detonation Shockwave
  - **Trigger Condition:** `STEP_ON` Real World at `(3, 3)` (activating switch chamber).
  - **Affected World:** Real World
  - **Target Object:** Floor tile at `(1, 2)` (abandoned entrance).
  - **Activation Delay:** 1 turn
  - **Resulting State:** Collapses into void abyss (`TileType.WALL`).
  - **Animation:** `crumble`
  - **Sound Cue:** `crumble`
  - **Collision Change:** Non-walkable.
  - **Warning Clue:** *"Subterranean tremor destabilizing the abandoned entry zone"*
- **Event 2 ID:** `se-12-vault-breach`
  - **Name:** Vault Breach Alarm
  - **Trigger Condition:** `SWITCH_TOGGLE` for `sw-12-real`.
  - **Affected World:** Shadow World
  - **Target Object:** Wall at `(3, 0)`.
  - **Activation Delay:** 0 turns (immediate).
  - **Resulting State:** Solid architectural wall dematerializes into open corridor (`TileType.FLOOR`).
  - **Animation:** `spark`
  - **Sound Cue:** `wall_open`
  - **Collision Change:** Becomes walkable.
  - **Warning Clue:** *"Structural integrity alarm sounding in the northern perimeter"*

---

### LEVEL 13: Refraction
- **Chapter:** THE REFLECTION
- **Theme:** Prismatic optical deception; rotating cross-world laser mirrors triggers sympathetic vault shifts.
- **Event 1 ID:** `se-13-cross-vault`
  - **Name:** Prismatic Vault Flare
  - **Trigger Condition:** `STEP_ON` Real World at `(1, 3)` (switch tile).
  - **Affected World:** Shadow World
  - **Target Object:** Wall at `(5, 0)`.
  - **Activation Delay:** 0 turns
  - **Resulting State:** Dematerializes wall into walkable alcove (`TileType.FLOOR`).
  - **Animation:** `spark`
  - **Sound Cue:** `distortion`
  - **Collision Change:** Walkable.
  - **Warning Clue:** *"Prismatic optical flare vibrating across the mirror chamber ceiling"*
- **Event 2 ID:** `se-13-collapse-entry`
  - **Name:** Refraction Collapse
  - **Trigger Condition:** `STEP_ON` Real World at `(2, 2)`.
  - **Affected World:** Real World
  - **Target Object:** Floor tile at `(1, 3)`.
  - **Activation Delay:** 1 turn
  - **Resulting State:** Floor collapses into void (`TileType.WALL`).
  - **Animation:** `crumble`
  - **Sound Cue:** `crumble`
  - **Collision Change:** Impassable.
  - **Warning Clue:** *"The switch platform begins groaning under structural stress"*

---

### LEVEL 14: The Frozen Moment
- **Chapter:** THE REFLECTION
- **Theme:** Stasis dilation echo; temporal fields disrupt spatial permanence.
- **Event 1 ID:** `se-14-stasis-ripple`
  - **Name:** Stasis Dilation Ripple
  - **Trigger Condition:** `STEP_ON` Shadow World at `(5, 1)` (Time Lock plate).
  - **Affected World:** Shadow World
  - **Target Object:** Wall at `(0, 0)`.
  - **Activation Delay:** 0 turns
  - **Resulting State:** Wall opens into walkable floor.
  - **Animation:** `flicker`
  - **Sound Cue:** `stasis_tick`
  - **Collision Change:** Walkable.
  - **Warning Clue:** *"Temporal resonance echoing through the stasis conduit"*
- **Event 2 ID:** `se-14-corridor-seal`
  - **Name:** Temporal Void Seal
  - **Trigger Condition:** `STEP_ON` Real World at `(3, 2)` (central crossing).
  - **Affected World:** Real World
  - **Target Object:** Floor tile at `(1, 3)`.
  - **Activation Delay:** 1 turn
  - **Resulting State:** Floor collapses into void abyss.
  - **Animation:** `crumble`
  - **Sound Cue:** `crumble`
  - **Collision Change:** Impassable.
  - **Warning Clue:** *"Temporal lock exhausts its energy, collapsing the southern junction"*

---

### LEVEL 15: Magnetic
- **Chapter:** THE REFLECTION
- **Theme:** High-energy electromagnetic feedback causes cross-world structural ruptures.
- **Event 1 ID:** `se-15-flux-breach`
  - **Name:** Flux Containment Breach
  - **Trigger Condition:** `STEP_ON` Real World at `(1, 1)` (magnet toggle switch).
  - **Affected World:** Real World
  - **Target Object:** Wall at `(0, 0)`.
  - **Activation Delay:** 0 turns
  - **Resulting State:** Wall dematerializes into walkable floor.
  - **Animation:** `spark`
  - **Sound Cue:** `distortion`
  - **Collision Change:** Walkable.
  - **Warning Clue:** *"Magnetic field surges violently against the containment barrier"*
- **Event 2 ID:** `se-15-induction-lock`
  - **Name:** Induction Circuit Lock
  - **Trigger Condition:** `STEP_ON` Real World at `(3, 2)`.
  - **Affected World:** Shadow World
  - **Target Object:** Floor at `(5, 3)`.
  - **Activation Delay:** 1 turn
  - **Resulting State:** Floor collapses into void abyss.
  - **Animation:** `crumble`
  - **Sound Cue:** `crumble`
  - **Collision Change:** Impassable.
  - **Warning Clue:** *"Residual polarity short-circuits the secondary floor grid"*

---

### LEVEL 16: The Wrong Reflection
- **Chapter:** THE REFLECTION
- **Theme:** Psychological distortion; reflection shatters behind the player, leaving no safety margin.
- **Event 1 ID:** `se-16-illusion-rift`
  - **Name:** Mirrored Dimension Rift
  - **Trigger Condition:** `STEP_ON` Real World at `(1, 3)` (Time Lock plate).
  - **Affected World:** Shadow World
  - **Target Object:** Wall at `(7, 0)`.
  - **Activation Delay:** 0 turns
  - **Resulting State:** Dematerializes wall into walkable space.
  - **Animation:** `flicker`
  - **Sound Cue:** `distortion`
  - **Collision Change:** Walkable.
  - **Warning Clue:** *"Mirrored dimensions warp, revealing the unstitched void"*
- **Event 2 ID:** `se-16-mirror-trap`
  - **Name:** Shattered Origin Trap
  - **Trigger Condition:** `STEP_ON` Real World at `(3, 2)` (central passage).
  - **Affected World:** Real World
  - **Target Object:** Floor at `(1, 3)`.
  - **Activation Delay:** 1 turn
  - **Resulting State:** Floor tile crumbles into non-walkable void.
  - **Animation:** `crumble`
  - **Sound Cue:** `crumble`
  - **Collision Change:** Impassable.
  - **Warning Clue:** *"The reflection shatters where you stood moments ago"*

---

### LEVEL 17: Two Become One
- **Chapter:** THE TRUTH
- **Theme:** Harmonic structural resonance across the central divide.
- **Event 1 ID:** `se-17-harmonic-shift`
  - **Name:** Harmonic Wall Shift
  - **Trigger Condition:** `STEP_ON` Real World at `(2, 2)` (pressure plate).
  - **Affected World:** Real World
  - **Target Object:** Wall at `(3, 0)`.
  - **Activation Delay:** 0 turns
  - **Resulting State:** Solid partition dematerializes into floor.
  - **Animation:** `spark`
  - **Sound Cue:** `wall_open`
  - **Collision Change:** Walkable.
  - **Warning Clue:** *"Resonant harmonic hum echoing from the central partition"*
- **Event 2 ID:** `se-17-portal-instability`
  - **Name:** Portal Surge Instability
  - **Trigger Condition:** `STEP_ON` Real World at `(0, 4)` (exit door switch).
  - **Affected World:** Shadow World
  - **Target Object:** Floor tile at `(6, 1)` (origin spawn platform).
  - **Activation Delay:** 1 turn
  - **Resulting State:** Collapses into void abyss.
  - **Animation:** `crumble`
  - **Sound Cue:** `crumble`
  - **Collision Change:** Impassable.
  - **Warning Clue:** *"High-energy portal surge obliterates the origin platform"*

---

### LEVEL 18: The Paradox
- **Chapter:** THE TRUTH
- **Theme:** Quantum displacement tremor and secondary explosive singularity collapses.
- **Event 1 ID:** `se-18-quantum-tremor`
  - **Name:** Quantum Displacement Tremor
  - **Trigger Condition:** `STEP_ON` Real World at `(2, 1)` (Time Lock plate).
  - **Affected World:** Real World
  - **Target Object:** Wall at `(0, 2)`.
  - **Activation Delay:** 0 turns
  - **Resulting State:** Solid wall dematerializes into open floor.
  - **Animation:** `shockwave`
  - **Sound Cue:** `distortion`
  - **Collision Change:** Walkable.
  - **Warning Clue:** *"Quantum displacement wave fracturing the dimensional anchor"*
- **Event 2 ID:** `se-18-singularity-echo`
  - **Name:** Singularity Echo Collapse
  - **Trigger Condition:** `BOMB_DETONATED` with ID `bomb-18-shadow`.
  - **Affected World:** Shadow World
  - **Target Object:** Ceiling/floor tile at `(4, 0)`.
  - **Activation Delay:** 0 turns
  - **Resulting State:** Collapses into void abyss.
  - **Animation:** `crumble`
  - **Sound Cue:** `explosion`
  - **Collision Change:** Impassable.
  - **Warning Clue:** *"Bomb shockwave reverberating into the void ceiling"*

---

### LEVEL 19: The Last Connection
- **Chapter:** THE TRUTH
- **Theme:** Reality de-coherence; the world disintegrates as the player approaches the truth.
- **Event 1 ID:** `se-19-dimensional-breach`
  - **Name:** Dimensional Breach Wall
  - **Trigger Condition:** `STEP_ON` Real World at `(1, 2)` (switch).
  - **Affected World:** Real World
  - **Target Object:** Wall at `(3, 0)`.
  - **Activation Delay:** 0 turns
  - **Resulting State:** Wall opens into walkable corridor.
  - **Animation:** `spark`
  - **Sound Cue:** `wall_open`
  - **Collision Change:** Walkable.
  - **Warning Clue:** *"Sympathetic resonance dissolving the central boundary wall"*
- **Event 2 ID:** `se-19-void-cascade`
  - **Name:** Void Cascade Collapse
  - **Trigger Condition:** `STEP_ON` Real World at `(3, 4)` (central gate passage).
  - **Affected World:** Real World
  - **Target Object:** Origin start floor at `(1, 1)`.
  - **Activation Delay:** 1 turn
  - **Resulting State:** Floor collapses into infinite blackness.
  - **Animation:** `crumble`
  - **Sound Cue:** `crumble`
  - **Collision Change:** Impassable.
  - **Warning Clue:** *"The reality behind you collapses into infinite blackness"*

---

### LEVEL 20: The Other Side
- **Chapter:** THE TRUTH
- **Theme:** Campaign climax — Dual Reality Convergence. The boundary between Real and Shadow shatters completely.
- **Event 1 ID:** `se-20-final-nexus`
  - **Name:** Dual Reality Convergence
  - **Trigger Condition:** `STEP_ON` Real World at `(1, 5)` (final sequence switch).
  - **Affected World:** Shadow World
  - **Target Object:** Central partition at `(4, 0)`.
  - **Activation Delay:** 0 turns
  - **Resulting State:** Solid barrier dematerializes; real and shadow unite.
  - **Animation:** `shockwave`
  - **Sound Cue:** `hazard_trigger`
  - **Collision Change:** Walkable.
  - **Warning Clue:** *"The illusion of duality shatters — two worlds begin fusing into one"*
- **Event 2 ID:** `se-20-convergence-echo`
  - **Name:** Singularity Convergence Trap
  - **Trigger Condition:** `STEP_ON` Real World at `(4, 3)` (crossing the central portal threshold!).
  - **Affected World:** Both Worlds (`both`)
  - **Target Object:** `(1, 5)` in Real World, and `(7, 5)` in Shadow World.
  - **Activation Delay:** 1 turn
  - **Resulting State:** Both switch alcoves implode into non-walkable voids simultaneously.
  - **Animation:** `crumble`
  - **Sound Cue:** `crumble`
  - **Collision Change:** Both tiles become impassable voids.
  - **Warning Clue:** *"The past cannot be reached — forward is the only path"*

---

## 3. Summary Matrix

| Level | Name | Event Count | Trigger Mechanism | Action Types | Delay |
| :---: | :--- | :---: | :--- | :--- | :---: |
| **11** | No Way Back | 1 | `STEP_ON` Checkpoint | `COLLAPSE_TILE` | 1 |
| **12** | The Countdown | 2 | `STEP_ON`, `SWITCH_TOGGLE` | `COLLAPSE_TILE`, `REMOVE_WALL` | 1, 0 |
| **13** | Refraction | 2 | `STEP_ON` | `REMOVE_WALL`, `COLLAPSE_TILE` | 0, 1 |
| **14** | The Frozen Moment | 2 | `STEP_ON` | `REMOVE_WALL`, `COLLAPSE_TILE` | 0, 1 |
| **15** | Magnetic | 2 | `STEP_ON` | `REMOVE_WALL`, `COLLAPSE_TILE` | 0, 1 |
| **16** | The Wrong Reflection | 2 | `STEP_ON` | `REMOVE_WALL`, `COLLAPSE_TILE` | 0, 1 |
| **17** | Two Become One | 2 | `STEP_ON` | `REMOVE_WALL`, `COLLAPSE_TILE` | 0, 1 |
| **18** | The Paradox | 2 | `STEP_ON`, `BOMB_DETONATED` | `REMOVE_WALL`, `COLLAPSE_TILE` | 0, 0 |
| **19** | The Last Connection | 2 | `STEP_ON` | `REMOVE_WALL`, `COLLAPSE_TILE` | 0, 1 |
| **20** | The Other Side | 2 | `STEP_ON` | `REMOVE_WALL`, `COLLAPSE_TILE` (Dual) | 0, 1 |
