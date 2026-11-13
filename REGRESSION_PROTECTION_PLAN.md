# REGRESSION PROTECTION & QUALITY SAFEGUARDS PLAN — THE OTHER SIDE
**Document Version**: 1.0.0  
**Scope**: Inviolable Gameplay Rules, State Integrity Safeguards, and Automated Quality Gates  

---

## 1. Inviolable Gameplay Rules

The following core rules are permanent and mathematically locked against regression:

1. **Two Simultaneously Visible Worlds**: Real World (white background, black character) on left; Shadow World (black background, white character) on right.
2. **Mirrored Horizontal Movement**:
   - `LEFT`: Real moves $-1$ column; Shadow moves $+1$ column.
   - `RIGHT`: Real moves $+1$ column; Shadow moves $-1$ column.
3. **Shared Vertical Movement**:
   - `UP`: Both characters move $-1$ row.
   - `DOWN`: Both characters move $+1$ row.
4. **Independent Collision**: If one character is blocked by a wall or closed door, the other character moves unimpeded if its destination cell is free.
5. **Simultaneous Paired Exit Resolution**: A level completes if and only if **both characters occupy their respective exit tiles simultaneously**. Characters may freely enter and exit prior to completion.
6. **Shared Death & Checkpoint Restoration**: If either character touches an active hazard, beam, or bomb blast, both characters and all puzzle states revert to the active paired checkpoint.
7. **No Platforming Physics**: The game is strictly grid-based logic. No jumping, gravity, acceleration, or velocity physics.
8. **Deterministic State Resolution**: Puzzles must resolve with 100% determinism. Zero RNG or timing-reflex dependencies.

---

## 2. Level Protection Matrix

### 2.1 Locked Levels (Levels 1 to 10)
- **Status**: **STRICTLY FROZEN**.
- **Constraint**: Dimensions, wall coordinates, starting positions, exit positions, puzzle entities, and verified solution traces are locked against modification.
- **Level 5 ("The Impossible Choice")**: Explicitly approved human-playtested benchmark. Zero structural changes permitted.
- **Allowed Modifications**: Visual rendering upgrades (e.g. rotating saw teeth, particle feedback) and audio synthesis cues only.

### 2.2 Target Redesign Levels (Levels 11 to 20)
- **Status**: **ELIGIBLE FOR COGNITIVE ENRICHMENT**.
- **Constraint**: Every modified level must satisfy:
  1. Validated schema via `LevelValidator.validateSchema()`.
  2. Complete state-space search by `LevelSolver.solve()`.
  3. 100% trace replay match in `LevelFactory.build()`.
  4. Handcrafted puzzle concept with distinct learning objective.

---

## 3. Implementation Safeguards & Failure Modes

| Potential Failure Mode | Technical Cause | Safeguard Architecture |
|---|---|---|
| **State Mutation During Render** | A visual rendering function inadvertently modifies a grid coordinate or entity boolean. | Visual classes (`VisualEffectsManager`, `CharacterAnimator`) receive read-only snapshots or primitive coordinates. Never invoke `puzzleManager` mutators from `render()` or `update()`. |
| **Undo State Desynchronization** | Undo restores character positions but leaves a switch, door, or moving saw in a future state. | `UndoEngine` uses `CheckpointSnapshotData`, which atomically captures and restores every entity (doors, switches, plates, saws, bombs, mirrors, blocks, magnets, time locks) simultaneously. |
| **Audio Oscillator Leak** | Web Audio oscillators created on input commit are not stopped or garbage collected. | All transient SFX nodes specify explicit `stop(currentTime + duration)`. Continuous audio (BGM/ambient) uses persistent, managed nodes cleaned up in `scene.events.on('shutdown')`. |
| **Stuck Touch Input** | Mobile touch pointerdown triggers movement, but pointerup is missed outside canvas bounds. | `TouchControls` listens to global window `pointerup` and `pointercancel` events, resetting virtual joystick state immediately. |
| **Animation Race Condition** | Player presses directional inputs rapidly during a 120ms animation tween. | `TurnEngine` enforces strict state gating: further inputs are ignored until `endAnimation()` commits or `cancelAnimation()` halts pending tweens. |
| **Memory Leak in Undo Stack** | Player executes thousands of moves, filling memory with snapshot objects. | `UndoEngine` caps history depth at a rolling maximum of 50 snapshots (`FIFO` eviction). |

---

## 4. Automated Verification Gates

Before any phase is declared complete, the code must pass all 5 verification gates:

```
[ Phase Code Complete ]
          |
          v
[ Gate 1: Vitest Unit Tests ] ---------> Must pass 100% of unit tests (31+ files)
          |
          v
[ Gate 2: Level Solver Validation ] ---> Must solve and replay all 20 levels
          |
          v
[ Gate 3: TypeScript Typecheck ] ------> Zero compiler errors (tsc --noEmit)
          |
          v
[ Gate 4: ESLint Code Quality ] -------> Zero errors and zero warnings
          |
          v
[ Gate 5: Vite Production Build ] ------> Clean compilation in dist/
          |
          v
[ Phase Approved & Committed ]
```

---

## 5. Backup & Recovery Protocol

1. **Git Checkpoints**: Every phase will be committed as an atomic Git commit with detailed change logs.
2. **Instant Rollback**: If an unexpected regression occurs in a locked level or core engine, revert immediately to baseline commit `5a45ee8` using:
   `git reset --hard 5a45ee8`
3. **Continuous Replay Verification**: The automated solver (`npm run validate:levels`) is executed after every single file edit to guarantee that no solution trace has been broken.
