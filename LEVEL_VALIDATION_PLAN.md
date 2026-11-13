# LEVEL VALIDATION PLAN — THE OTHER SIDE
**Document Version**: 2.0.0  
**Status**: Proposal / Architecture Blueprint  

---

## 1. Overview & Validation Philosophy

To guarantee that *THE OTHER SIDE* is a reliable, high-quality, and enjoyable puzzle game, every handcrafted level must be validated through rigorous multi-layer automated verification:

```
[Level Definition (.ts)]
          │
          ▼
1. Schema & Static Geometry Validation (Bounds, Walls, Object IDs, Rule Integrity)
          │
          ▼
2. Headless BFS State-Space Solver (Authoritative Game Rules Simulation)
          │
          ▼
3. Deterministic Solution Trace Replay (Verifying Step-by-Step Movement & Exits)
          │
          ▼
4. Edge Case & Invariance Checks (Exit Re-entry, Hazard Resolution, Checkpoint Rollback)
          │
          ▼
5. Vitest Unit Suite + Playwright E2E Visual Verification
```

---

## 2. Layer 1: Schema & Static Geometry Validation

Before running any state simulation, each level definition must pass strict static invariant checks:
1. **Dimensions**: $3 \le \text{width} \le 12$, $3 \le \text{height} \le 10$.
2. **Bounds**: All entity spawns, exits, walls, switches, doors, plates, and hazards must lie strictly inside $[0, \text{width}-1] \times [0, \text{height}-1]$.
3. **No Spatial Overlap on Solid Tiles**: A wall cannot occupy the same coordinate as a spawn point or an exit.
4. **Unique Object IDs**: Every switch, door, pressure plate, and checkpoint must have a unique identifier across the level session.
5. **Referential Integrity**:
   - Every switch `linkedDoorId` must reference an existing door.
   - Every pressure plate `linkedDoorId` must reference an existing door.
   - Multi-switch doors must specify an explicit `activationRule` (`'ALL'` or `'ANY'`).
6. **Valid Checkpoints**: Checkpoint pairs must define valid Real and Shadow coordinates.

---

## 3. Layer 2: Headless BFS Automated Solver Engine

The project already contains an authoritative Breadth-First Search solver (`src/solver/LevelSolver.ts`). The solver operates directly against the real game logic classes (`LevelFactory`, `MovementEngine`, `PuzzleManager`, `WorldGrid`).

### 3.1 State Representation
Each node in the search graph represents a complete, immutable snapshot of the game state:
```ts
interface SolverStateKey {
  readonly playerX: number;
  readonly playerY: number;
  readonly shadowX: number;
  readonly shadowY: number;
  readonly doors: Record<string, boolean>;    // doorId -> isOpen
  readonly switches: Record<string, boolean>; // switchId -> isActive
  readonly plates: Record<string, boolean>;   // plateId -> isPressed
  readonly checkpoints: Record<string, boolean>; // checkpointId -> isActivated
}
```

### 3.2 Authoritative Simulation Loop
For each level:
1. Initialize the session using `LevelFactory.build(levelDef)`.
2. Push the initial state into the BFS FIFO queue and mark it in the `visitedStates` hash set.
3. While the queue is not empty:
   - Dequeue the current state node.
   - For each legal direction $d \in \{\text{'left'}, \text{'right'}, \text{'up'}, \text{'down'}\}$:
     - Simulate move using `turnEngine.handleInput(d)`.
     - **Hazard Rule**: If `hazardTriggered`, discard this branch (lethal paths are pruned unless checkpoint rollback leads to a new state).
     - **Simultaneous Exit Goal**: If $P_{\text{pos}} = \text{RealExit} \land S_{\text{pos}} = \text{ShadowExit}$:
       - **Success!** Reconstruct the solution path from root to current node.
       - Terminate search and return the optimal solution trace.
     - If the new state has not been visited, serialize its key, add to `visitedStates`, and enqueue.
4. **Failure Condition**: If the queue exhausts or the search limit exceeds 10,000 states without reaching the goal, report the level as **UNSOLVABLE**.

---

## 4. Layer 3: Deterministic Solution Trace Replay

For each level, the candidate solution trace recorded in `level.solutionTrace` is replayed sequentially through a fresh `TurnEngine` instance:
1. Execute each move in the sequence.
2. Verify that at the final move:
   - Real character position equals `realExit`.
   - Shadow character position equals `shadowExit`.
   - `turnEngine.state === 'COMPLETED'`.
   - Zero hazard deaths occurred during the trace.
3. Fail the test if the trace does not solve the level or diverges from expected positions.

---

## 5. Layer 4: Specific Invariant & Edge Case Testing

The validation plan includes targeted tests for the core gameplay rules:

### 5.1 Simultaneous Exit Occupancy (Rule 9 & 10)
- **Test Case A (Partial Exit Arrival)**: Player steps on `realExit`, Shadow is not on `shadowExit`. Assert `turnEngine.state === 'PLAYING'`.
- **Test Case B (Exit Departure & Return)**: Player steps on `realExit`, then steps off `realExit` onto an adjacent floor tile, then returns. Assert player is never locked and movement is unhindered.
- **Test Case C (Simultaneous Arrival)**: Both step on their respective exits on the same turn. Assert `turnEngine.state === 'COMPLETED'`.

### 5.2 Hazard Precedence (Rule 11)
- **Test Case**: Setup a scenario where Player moves onto `realExit` while Shadow simultaneously steps onto a hazard spike.
  - Assert `turnEngine.state` transitions to `DYING` (not `COMPLETED`).
  - Assert death rollback restores both characters to checkpoint.
  - Assert level completion is not awarded.

### 5.3 Door Occupancy Safety Clause
- **Test Case**: Character occupies a door cell. The door's controlling switch or plate deactivates, closing the door on the character.
  - Assert character can freely step out of the closed door into an adjacent floor tile.
  - Assert external characters cannot enter the closed door.

---

## 6. Layer 5: Automated Test Execution & Benchmark Targets

1. **CLI Level Validation Command**:
   ```bash
   npm run validate:levels
   ```
   - Target: All 20 levels must validate in $< 100\text{ ms}$ total execution time.
2. **Vitest Unit Test Suite**:
   ```bash
   npm test
   ```
   - Target: 100% pass rate across all engine, movement, collision, puzzle, checkpoint, and save tests.
3. **Playwright Visual E2E Suite**:
   ```bash
   npx playwright test tests/browser/visual.spec.ts
   ```
   - Target: Verify 16:9 canvas layout, desktop controls, mobile touch D-Pad, and zero uncaught browser errors across Chrome / Edge.

---

## 7. Implementation Roadmap & Milestones

Following user approval of this master architecture:
- **Phase 1 (Complete)**: Master Game Design & Architecture Documentation.
- **Phase 2**: Update core engine exit rules (simultaneous occupancy & non-locking traversability).
- **Phase 3**: Implement Chapter 1 (Levels 1–4: The Beginning) + Automated Solver Validation.
- **Phase 4**: Implement Chapter 2 (Levels 5–8: The Connection) + Switch, Plate & Crate Validation.
- **Phase 5**: Implement Chapter 3 (Levels 9–12: The Separation) + Hazard & Checkpoint Validation.
- **Phase 6**: Implement Chapter 4 (Levels 13–16: The Reflection) + Multi-Switch Boolean Logic Validation.
- **Phase 7**: Implement Chapter 5 (Levels 17–20: The Truth) + Master Synthesis Validation.
- **Phase 8**: Full Campaign QA, E2E Browser Testing, and Production Polish.
