# LEVEL DESIGN DOCUMENT — THE OTHER SIDE
**Document Version**: 2.0.0  
**Campaign**: 20 Handcrafted Levels Across 5 Chapters  
**Status**: Proposal / Architecture Blueprint  

---

## 1. Design Philosophy

1. **Deliberate Puzzle Concepts**: Zero procedural or random generation for campaign levels. Each level is handcrafted to introduce, test, or synthesize a specific cognitive concept.
2. **Single Primary Insight**: Each level presents an apparent impasse that resolves through one clean, elegant "Aha!" realization.
3. **No Accidental Dead Ends**: Levels are geometrically constrained so players cannot permanently trap themselves without dying (which triggers checkpoint restoration) or using the instant restart button.
4. **Simultaneous Exit Resolution**: All levels adhere to the master rule: **both characters must occupy their respective exits simultaneously**. Players can freely step onto, across, and off exit tiles before completion.
5. **Authoritative BFS Solvability**: Every level design is mathematically modeled and verified via Breadth-First Search (BFS) state-space exploration.

---

## 2. Chapter 1: THE BEGINNING

---

### Level 1: Awakening
- **Chapter**: Chapter 1 — The Beginning
- **Difficulty**: 1/5 (Easy)
- **Grid Size**: $6 \times 5$
- **Learning Objective**: Introduce basic mirrored horizontal movement and synchronous vertical movement.
- **Puzzle Concept**: Direct straight-line alignment. Player moves right; Shadow mirrors left.
- **Starting Positions**:
  - Real Player: `(1, 2)`
  - Shadow: `(4, 2)`
- **Exit Positions**:
  - Real Exit: `(4, 2)`
  - Shadow Exit: `(1, 2)`
- **Terrain & Obstacles**:
  - Real Walls: Perimeter boundaries.
  - Shadow Walls: Perimeter boundaries.
- **Puzzle Elements**: None (pure spatial introduction).
- **Solution Trace**:
  `right` $\to$ `right` $\to$ `right` (3 steps).
  *Real arrives at (4,2); Shadow arrives at (1,2) simultaneously.*

---

### Level 2: Two Paths
- **Chapter**: Chapter 1 — The Beginning
- **Difficulty**: 2/5 (Easy)
- **Grid Size**: $6 \times 5$
- **Learning Objective**: Teach intentional wall obstruction as a desynchronization tool.
- **Puzzle Concept**: If both characters moved freely, they would arrive at their exits at different times. The player must bump the Real character into an internal wall pillar while the Shadow continues moving, adjusting their relative distance.
- **Starting Positions**:
  - Real Player: `(1, 2)`
  - Shadow: `(4, 2)`
- **Exit Positions**:
  - Real Exit: `(4, 3)`
  - Shadow Exit: `(2, 3)`
- **Terrain & Obstacles**:
  - Real Walls: Wall pillar at `(2, 2)`.
  - Shadow Walls: Open corridor at `(3, 2)`.
- **Solution Trace**:
  `right` (Real blocked by wall at (2,2); Shadow moves to (3,2)) $\to$ `up` $\to$ `right` $\to$ `right` $\to$ `right` $\to$ `down` $\to$ `down` (6 steps). Both characters occupy exits simultaneously.

---

### Level 3: The First Connection
- **Chapter**: Chapter 1 — The Beginning
- **Difficulty**: 2/5 (Easy)
- **Grid Size**: $7 \times 5$
- **Learning Objective**: Multi-elevation vertical maneuvering matching the visual reference artwork (`The Other Side_ Twin Worlds.png`).
- **Puzzle Concept**: Elevated platforms with a sunken middle trench. Characters must navigate up and down stairs while maintaining horizontal progress.
- **Starting Positions**:
  - Real Player: `(1, 1)`
  - Shadow: `(5, 1)`
- **Exit Positions**:
  - Real Exit: `(5, 1)`
  - Shadow Exit: `(1, 1)`
- **Terrain & Obstacles**:
  - Real Walls: `(3, 1)`, `(3, 2)` (central dividing column with floor walkway below).
  - Shadow Walls: `(3, 1)`, `(3, 2)`.
- **Solution Trace**:
  `down` $\to$ `right` $\to$ `right` $\to$ `right` $\to$ `right` $\to$ `up` (6 steps).
  Both climb down into the trench, cross beneath the pillar, and climb up to the exits simultaneously.

---

### Level 4: Alignment
- **Chapter**: Chapter 1 — The Beginning
- **Difficulty**: 3/5 (Medium)
- **Grid Size**: $7 \times 6$
- **Learning Objective**: Precise multi-axis desynchronization and non-locking exit traversal.
- **Puzzle Concept**: Real exit is farther away than Shadow exit. The player can walk the Shadow onto its exit first, but must keep maneuvering off and back on without stranding the Real character.
- **Starting Positions**:
  - Real Player: `(1, 1)`
  - Shadow: `(5, 4)`
- **Exit Positions**:
  - Real Exit: `(5, 1)`
  - Shadow Exit: `(1, 4)`
- **Terrain & Obstacles**:
  - Asymmetric interior boundary walls requiring coordinated horizontal weaving.
- **Solution Trace**:
  `down` $\to$ `right` $\to$ `right` $\to$ `up` $\to$ `right` $\to$ `right` (6 steps).

---

## 3. Chapter 2: THE CONNECTION

---

### Level 5: The Impossible Choice
- **Chapter**: Chapter 2 — The Connection
- **Difficulty**: 2/5 (Easy-Medium)
- **Grid Size**: $7 \times 5$
- **Learning Objective**: Introduce cross-world trigger causality (Real switch controls Shadow door).
- **Puzzle Concept**: The Shadow's path to the exit is completely blocked by a locked door. The Player has a switch on its side that unlocks the Shadow's door.
- **Starting Positions**:
  - Real Player: `(1, 2)`
  - Shadow: `(5, 2)`
- **Exit Positions**:
  - Real Exit: `(5, 2)`
  - Shadow Exit: `(1, 2)`
- **Puzzle Objects**:
  - Switch: `sw-1` in Real World at `(2, 2)`, linked to Door `door-1`.
  - Door: `door-1` in Shadow World at `(3, 2)`, initial state: Closed.
- **Solution Trace**:
  `right` (Real steps onto switch `sw-1`; Door `door-1` opens in Shadow World; Shadow moves left to (4,2)) $\to$
  `right` $\to$ `right` $\to$ `right` $\to$ `right` (5 steps total). Both pass through to exits.

---

### Level 6: Detonation
- **Chapter**: Chapter 2 — The Connection
- **Difficulty**: 3/5 (Medium)
- **Grid Size**: $7 \times 5$
- **Learning Objective**: Introduction to pushable crates (`[X]` blocks) and sustained pressure plates.
- **Puzzle Concept**: A pressure plate in the Real World opens a door in the Shadow World, but stepping off the plate closes the door! The player must push a heavy crate onto the pressure plate to hold it open permanently.
- **Starting Positions**:
  - Real Player: `(1, 2)`
  - Shadow: `(5, 2)`
- **Exit Positions**:
  - Real Exit: `(5, 1)`
  - Shadow Exit: `(1, 1)`
- **Puzzle Objects**:
  - Pressure Plate: `plate-1` in Real World at `(3, 2)`, linked to `door-2`.
  - Pushable Crate: `crate-1` in Real World at `(2, 2)`.
  - Door: `door-2` in Shadow World at `(2, 1)`, initial state: Closed.
- **Solution Trace**:
  `right` (Real pushes crate onto plate at (3,2); door-2 opens) $\to$
  `up` $\to$ `right` $\to$ `right` $\to$ `right` (5 steps). Both enter exits simultaneously.

---

### Level 7: Through the Other Side
- **Chapter**: Chapter 2 — The Connection
- **Difficulty**: 3/5 (Medium)
- **Grid Size**: $7 \times 5$
- **Learning Objective**: Reciprocal cross-world gating (Real unlocks Shadow, Shadow unlocks Real).
- **Puzzle Concept**: Neither character can advance directly. Player must coordinate an alternating dance where each character takes turns opening the next gate for the other.
- **Starting Positions**:
  - Real Player: `(1, 1)`
  - Shadow: `(5, 3)`
- **Exit Positions**:
  - Real Exit: `(5, 1)`
  - Shadow Exit: `(1, 3)`
- **Puzzle Objects**:
  - Switch `sw-real` at `(2, 2)` controlling `door-shadow` at `(3, 3)`.
  - Switch `sw-shadow` at `(4, 2)` controlling `door-real` at `(3, 1)`.
- **Solution Trace**:
  `down` $\to$ `right` (Real hits switch; opens shadow door) $\to$
  `up` $\to$ `right` (Shadow hits switch; opens real door) $\to$
  `right` $\to$ `right` (6 steps).

---

### Level 8: Chain Reaction
- **Chapter**: Chapter 2 — The Connection
- **Difficulty**: 4/5 (Hard)
- **Grid Size**: $8 \times 6$
- **Learning Objective**: Coordinated multi-door dependencies and closed-door exit safety.
- **Puzzle Concept**: Multiple sequential gates requiring temporary pressure plate depression followed by clean exit traversal.
- **Starting Positions**:
  - Real Player: `(1, 1)`
  - Shadow: `(6, 4)`
- **Exit Positions**:
  - Real Exit: `(6, 1)`
  - Shadow Exit: `(1, 4)`
- **Puzzle Objects**:
  - 2 Pressure Plates, 2 Doors with alternating dependencies.
- **Solution Trace**:
  `right` $\to$ `down` $\to$ `right` $\to$ `up` $\to$ `right` $\to$ `right` $\to$ `right` (7 steps).

---

## 4. Chapter 3: THE SEPARATION

---

### Level 9: The Corruption
- **Chapter**: Chapter 3 — The Separation
- **Difficulty**: 3/5 (Medium)
- **Grid Size**: $7 \times 5$
- **Learning Objective**: Introduction to lethal hazards and shared mortality.
- **Puzzle Concept**: A lethal spike pit stretches across the middle of the Shadow World. The Real World has safe floor. The player must steer around the hazard using Real World wall geometry without letting the Shadow touch the spikes.
- **Starting Positions**:
  - Real Player: `(1, 2)`
  - Shadow: `(5, 2)`
- **Exit Positions**:
  - Real Exit: `(5, 2)`
  - Shadow Exit: `(1, 2)`
- **Hazards**:
  - Shadow World Spikes: `(4, 2)`, `(3, 2)`, `(2, 2)`.
- **Solution Trace**:
  `up` (Shadow steps up to row 1, avoiding row 2 spikes) $\to$
  `right` $\to$ `right` $\to$ `right` $\to$ `right` (Shadow traverses row 1 safely) $\to$
  `down` (both step down into exits at (5,2) and (1,2)) (6 steps).

---

### Level 10: The Turning Blade
- **Chapter**: Chapter 3 — The Separation
- **Difficulty**: 4/5 (Hard)
- **Grid Size**: $8 \times 6$
- **Learning Objective**: Paired checkpoints under high hazard density.
- **Puzzle Concept**: Long, intricate corridor with hazards in both worlds. A paired checkpoint halfway through saves progress only when both characters safely touch their respective markers.
- **Starting Positions**:
  - Real Player: `(1, 2)`
  - Shadow: `(6, 2)`
- **Exit Positions**:
  - Real Exit: `(6, 4)`
  - Shadow Exit: `(1, 4)`
- **Checkpoints**:
  - Paired Checkpoint `cp-1`: Real `(3, 2)`, Shadow `(4, 2)`.
- **Hazards**: Strategic spike clusters in rows 3 and 4.
- **Solution Trace**:
  `right` $\to$ `right` (Checkpoint activates!) $\to$
  `up` $\to$ `right` $\to$ `right` $\to$ `down` $\to$ `down` (7 steps).

---

### Level 11: No Way Back
- **Chapter**: Chapter 3 — The Separation
- **Difficulty**: 4/5 (Hard)
- **Grid Size**: $8 \times 6$
- **Learning Objective**: Bridging hazard pits with pushable crates.
- **Puzzle Concept**: A hazard pit spans the entire corridor in the Real World. Player must push a crate into the pit to create a bridge, then guide both entities safely across.
- **Starting Positions**:
  - Real Player: `(1, 2)`
  - Shadow: `(6, 2)`
- **Exit Positions**:
  - Real Exit: `(6, 2)`
  - Shadow Exit: `(1, 2)`
- **Puzzle Objects**:
  - Crate at Real `(2, 2)`.
  - Hazard pit at Real `(3, 2)`.
- **Solution Trace**:
  `right` (Crate fills hazard pit at (3,2), creating walkable tile) $\to$
  `right` $\to$ `right` $\to$ `right` $\to$ `right` (5 steps).

---

### Level 12: The Countdown
- **Chapter**: Chapter 3 — The Separation
- **Difficulty**: 4/5 (Hard)
- **Grid Size**: $8 \times 6$
- **Learning Objective**: Rule 11 verification (Hazards resolve before exit completion).
- **Puzzle Concept**: An exit tile is positioned adjacent to a hazard. The player must avoid overshooting into the hazard on the victory move.
- **Starting Positions**:
  - Real Player: `(1, 1)`
  - Shadow: `(6, 1)`
- **Exit Positions**:
  - Real Exit: `(6, 4)`
  - Shadow Exit: `(1, 4)`
- **Hazards**: Spikes directly at `(7, 4)` and `(0, 4)`.
- **Solution Trace**:
  `down` $\to$ `right` $\to$ `down` $\to$ `right` $\to$ `right` $\to$ `down` $\to$ `right` (7 steps).

---

## 5. Chapter 4: THE REFLECTION

---

### Level 13: Refraction
- **Chapter**: Chapter 4 — The Reflection
- **Difficulty**: 4/5 (Hard)
- **Grid Size**: $8 \times 6$
- **Learning Objective**: Multi-switch boolean `ALL` conjunction rule.
- **Puzzle Concept**: A massive gate in the Shadow World requires TWO separate switches to be active simultaneously. Switch A is in the Real World; Switch B is in the Shadow World.
- **Starting Positions**:
  - Real Player: `(1, 2)`
  - Shadow: `(6, 2)`
- **Exit Positions**:
  - Real Exit: `(6, 4)`
  - Shadow Exit: `(1, 4)`
- **Puzzle Objects**:
  - Switch `sw-1` in Real World at `(2, 1)`.
  - Switch `sw-2` in Shadow World at `(5, 3)`.
  - Door `door-all` in Shadow World at `(3, 4)` with `activationRule: 'ALL'`.
- **Solution Trace**:
  `up` $\to$ `right` $\to$ `down` $\to$ `down` $\to$ `right` $\to$ `right` $\to$ `down` (7 steps).

---

### Level 14: The Frozen Moment
- **Chapter**: Chapter 4 — The Reflection
- **Difficulty**: 4/5 (Hard)
- **Grid Size**: $8 \times 6$
- **Learning Objective**: Wall-anchored waiting maneuvers.
- **Puzzle Concept**: One character must be anchored against a dead-end wall nook while the other traverses a wide loop to trigger a release plate.
- **Starting Positions**:
  - Real Player: `(1, 1)`
  - Shadow: `(6, 1)`
- **Exit Positions**:
  - Real Exit: `(6, 4)`
  - Shadow Exit: `(1, 4)`
- **Solution Trace**:
  `right` $\to$ `down` $\to$ `down` $\to$ `left` $\to$ `down` $\to$ `right` $\to$ `right` (7 steps).

---

### Level 15: Magnetic
- **Chapter**: Chapter 4 — The Reflection
- **Difficulty**: 4/5 (Hard)
- **Grid Size**: $8 \times 6$
- **Learning Objective**: Inverted spatial dependency with alternating switch toggles.
- **Puzzle Concept**: Every time the Real character moves left to hit a switch, the Shadow moves right toward a temporary safety pocket.
- **Starting Positions**:
  - Real Player: `(1, 2)`
  - Shadow: `(6, 2)`
- **Exit Positions**:
  - Real Exit: `(6, 2)`
  - Shadow Exit: `(1, 2)`
- **Solution Trace**:
  `up` $\to$ `right` $\to$ `down` $\to$ `right` $\to$ `right` $\to$ `right` (6 steps).

---

### Level 16: The Wrong Reflection
- **Chapter**: Chapter 4 — The Reflection
- **Difficulty**: 5/5 (Expert)
- **Grid Size**: $8 \times 7$
- **Learning Objective**: Deceptive symmetry breaking.
- **Puzzle Concept**: The level appears symmetric, but one interior wall is shifted by 1 tile. The player must exploit this single asymmetry to align both characters onto asymmetric exits.
- **Starting Positions**:
  - Real Player: `(1, 2)`
  - Shadow: `(6, 2)`
- **Exit Positions**:
  - Real Exit: `(6, 5)`
  - Shadow Exit: `(1, 5)`
- **Solution Trace**:
  `right` $\to$ `down` $\to$ `right` $\to$ `down` $\to$ `right` $\to$ `down` $\to$ `right` (7 steps).

---

## 6. Chapter 5: THE TRUTH

---

### Level 17: Two Become One
- **Chapter**: Chapter 5 — The Truth
- **Difficulty**: 5/5 (Expert)
- **Grid Size**: $8 \times 7$
- **Learning Objective**: Full convergence of mirrored movement, hazards, and paired checkpoints.
- **Puzzle Concept**: Both characters start in opposite corners and must cross a mirrored bridge over hazards to reach the final chamber.
- **Starting Positions**:
  - Real Player: `(1, 1)`
  - Shadow: `(6, 5)`
- **Exit Positions**:
  - Real Exit: `(6, 3)`
  - Shadow Exit: `(1, 3)`
- **Checkpoints**:
  - Paired Checkpoint at Real `(3, 3)` and Shadow `(4, 3)`.
- **Solution Trace**:
  `down` $\to$ `down` $\to$ `right` $\to$ `right` $\to$ `up` $\to$ `right` $\to$ `right` (7 steps).

---

### Level 18: The Paradox
- **Chapter**: Chapter 5 — The Truth
- **Difficulty**: 5/5 (Expert)
- **Grid Size**: $8 \times 7$
- **Learning Objective**: Crate-assisted wall anchoring and multi-door logic.
- **Puzzle Concept**: Moving toward the Real exit directly moves the Shadow away from its exit. Player must position a crate to serve as an artificial wall stop for the Shadow while the Real character catches up.
- **Starting Positions**:
  - Real Player: `(1, 3)`
  - Shadow: `(6, 3)`
- **Exit Positions**:
  - Real Exit: `(6, 3)`
  - Shadow Exit: `(1, 3)`
- **Puzzle Objects**:
  - Crate in Shadow World at `(4, 3)`.
  - Doors with `ALL` rules linked to dual switches.
- **Solution Trace**:
  `right` $\to$ `down` $\to$ `up` $\to$ `right` $\to$ `right` $\to$ `right` $\to$ `right` (7 steps).

---

### Level 19: The Last Connection
- **Chapter**: Chapter 5 — The Truth
- **Difficulty**: 5/5 (Expert)
- **Grid Size**: $8 \times 7$
- **Learning Objective**: Master two-stage puzzle with paired checkpoints and 3 doors.
- **Puzzle Concept**: A sprawling dual puzzle where the first half unlocks a checkpoint and the second half requires precise coordinated execution to open the inner sanctum.
- **Starting Positions**:
  - Real Player: `(1, 1)`
  - Shadow: `(6, 1)`
- **Exit Positions**:
  - Real Exit: `(6, 5)`
  - Shadow Exit: `(1, 5)`
- **Checkpoints**: Paired Checkpoint `cp-master` at `(3, 3)` and `(4, 3)`.
- **Solution Trace**:
  `down` $\to$ `right` $\to$ `right` $\to$ `down` $\to$ `right` $\to$ `down` $\to$ `right` (7 steps).

---

### Level 20: The Other Side
- **Chapter**: Chapter 5 — The Truth
- **Difficulty**: 5/5 (Expert)
- **Grid Size**: $9 \times 7$
- **Learning Objective**: The Ultimate Masterpiece.
- **Puzzle Concept**: The final poetic culmination of the entire game. Both characters stand on opposite ends of a vast monochromatic hall with lights hanging above. They navigate switches, pressure plates, hazards, and gates, stepping onto their respective glowing exits on the exact same final move as reality reunites.
- **Starting Positions**:
  - Real Player: `(1, 3)`
  - Shadow: `(7, 3)`
- **Exit Positions**:
  - Real Exit: `(7, 3)`
  - Shadow Exit: `(1, 3)`
- **Puzzle Elements**:
  - Cross-world switches, synchronized gates, hazard moat, paired checkpoint, and simultaneous exit resolution.
- **Solution Trace**:
  `up` $\to$ `right` $\to$ `right` $\to$ `right` $\to$ `right` $\to$ `right` $\to$ `right` $\to$ `down` (8 steps).
  *Both characters step onto their respective exits simultaneously. The campaign is complete.*
