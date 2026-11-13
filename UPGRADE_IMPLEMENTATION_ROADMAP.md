# UPGRADE IMPLEMENTATION ROADMAP — THE OTHER SIDE
**Document Version**: 1.0.0  
**Status**: Planning Complete & Baseline Established  
**Execution Strategy**: Phased, Non-Destructive, Test-Driven Iteration  

---

## 1. Master Phase Sequence

```
+-----------------------------------------------------------------------------------+
| PHASE 1: TECHNICAL FOUNDATION & AUDIT VERIFICATION                                |
|   - Baseline established (Git commit 5a45ee8, 219 tests passing).                |
|   - Verification deliverables authored. Awaiting user approval.                   |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
| PHASE 2: AUDIO ATMOSPHERE & PROCEDURAL SOUND DESIGN                               |
|   - Implement AtmosphericMusic.ts (4-layer generative ambient thriller drone).     |
|   - Expand SoundEffects.ts with 16 bespoke procedural mechanic recipes.           |
|   - Unit test audio synthesis and dynamic tension modulation.                     |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
| PHASE 3: VISUAL EFFECTS & DYNAMIC ANIMATION ENGINE                                |
|   - Implement GameScene.update(time, delta) 60 FPS lifecycle hook.                |
|   - Implement VisualEffectsManager.ts (rotating saws, laser VFX, portal vortex).  |
|   - Implement CharacterAnimator.ts (squash-and-stretch, bump recoil, idle float). |
|   - Unit & visual test dynamic rendering without mutating game state.             |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
| PHASE 4: UI / UX OVERHAUL & TRANSACTIONAL UNDO ENGINE                             |
|   - Implement UndoEngine.ts (using CheckpointSnapshotData stack).                 |
|   - Connect 'Z' key and on-screen Undo button with reverse animation & audio.     |
|   - Redesign split-world Header HUD, chapter carousel in MenuScene, and Touch.    |
|   - Unit test Undo with hazards, bombs, time locks, and pressure plates.          |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
| PHASE 5: TARGETED DIFFICULTY REBALANCING (LEVELS 11–20)                           |
|   - Preserve Levels 1–10 (Level 5 strictly locked).                               |
|   - Re-architect trivial paths in Levels 11, 13, 15, and enrich Levels 17–20.     |
|   - Re-run LevelSolver.solve() to establish new optimal traces and par ratings.   |
|   - Run npm run validate:levels across all 20 levels.                             |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
| PHASE 6: FINAL PRODUCTION VERIFICATION & PLAYTEST GATE                            |
|   - Full test suite: 100% pass on Vitest, 0 TypeScript errors, 0 ESLint warnings.|
|   - Production build compilation in dist/.                                        |
|   - Local daemon server launch for human playtesting and sign-off.                |
+-----------------------------------------------------------------------------------+
```

---

## 2. Detailed Phase Specifications

### Phase 2: Audio Atmosphere & Soundscape Engine
- **Objectives**: Eliminate complete in-game silence; create psychological thriller dread; communicate every mechanic state acoustically.
- **Files to Create**:
  - `src/audio/AtmosphericMusic.ts`
  - `tests/unit/AtmosphericMusic.test.ts`
- **Files to Modify**:
  - `src/audio/SoundEffects.ts` (Add 10 new procedural synthesis recipes).
  - `src/scenes/GameScene.ts` (Instantiate and modulate BGM based on hazard proximity).
- **Exit Criteria**:
  - Generative BGM runs cleanly across chapters with zero external audio assets.
  - All 16 mechanics emit distinct auditory signatures.
  - Poki commercial break mute/resume functions without audio glitching.
  - `npm test` passes.

### Phase 3: Visual Effects & Dynamic Animation Engine
- **Objectives**: Transform flat wireframes into vibrant, readable, living puzzle entities; give characters weight and responsiveness.
- **Files to Create**:
  - `src/rendering/VisualEffectsManager.ts`
  - `src/rendering/CharacterAnimator.ts`
  - `tests/unit/VisualEffects.test.ts`
- **Files to Modify**:
  - `src/scenes/GameScene.ts` (Add `update(time, delta)` and delegate rendering).
- **Exit Criteria**:
  - Saw blades visibly rotate at 460°/sec.
  - Lasers feature white core filament, electric aura, micro-jitter, and impact sparks.
  - Portals swirl with dual-layer counter-rotating vortices.
  - Exits display ascending light pillars and pulsing beacons.
  - Characters squash on move anticipation, stretch in transit, and recoil on wall collisions.
  - Performance sustains 60 FPS. Zero state mutation during rendering.

### Phase 4: UI / UX Overhaul & Transactional Undo Engine
- **Objectives**: Replace prototype-style grey boxes with sleek "Monochrome Precision" UI; implement full non-destructive multi-step Undo.
- **Files to Create**:
  - `src/engine/UndoEngine.ts`
  - `tests/unit/UndoEngine.test.ts`
- **Files to Modify**:
  - `src/engine/TurnEngine.ts` (Push snapshot on move, implement `undo()`).
  - `src/scenes/GameScene.ts` (Wire `Z` key and UI Undo button).
  - `src/ui/Header.ts` (Split-world HUD with moves, par, undo, and pause).
  - `src/rendering/MenuScene.ts` (5-chapter carousel with star ratings and thumbnail wireframes).
  - `src/ui/TouchControls.ts` (Ergonomic layout with dedicated undo and restart buttons).
- **Exit Criteria**:
  - Pressing `Z` or clicking Undo steps back exactly one turn, restoring all puzzle entities and player positions.
  - Undo works across moving saws, bombs, collapsing floors, time locks, and magnets.
  - Header displays accurate Par rating alongside current move count.
  - All unit tests pass.

### Phase 5: Targeted Difficulty Rebalancing (Levels 11–20)
- **Objectives**: Elevate mid-to-late campaign challenge; eliminate straight-line trivial solutions; preserve Levels 1–10.
- **Files to Modify**:
  - `src/levels/levelsData.ts` (Refine corridor layouts for Levels 11, 13, 15, 17, 18, 19, 20).
  - Corresponding unit test files `tests/unit/Level11.test.ts`, `Level13.test.ts`, etc.
- **Exit Criteria**:
  - Levels 1–10 remain completely unchanged (verified against baseline).
  - Levels 11–20 require meaningful multi-step planning and cognitive lookahead.
  - `npm run validate:levels` validates all 20 levels via BFS and trace replay.

### Phase 6: Final Production Verification & Playtest Gate
- **Objectives**: Comprehensive verification and delivery.
- **Exit Criteria**:
  - 100% unit test pass rate.
  - 0 TypeScript errors (`npm run typecheck`).
  - 0 ESLint warnings (`npm run lint`).
  - Clean production build (`npm run build`).
  - Live local daemon server available for user human playtesting.

---

## 3. Comprehensive File Modification Matrix

| File Path | Action | Phase | Primary Purpose |
|---|:---:|:---:|---|
| `src/audio/AtmosphericMusic.ts` | **Create** | Phase 2 | Generative Web Audio ambient thriller BGM drone |
| `src/audio/SoundEffects.ts` | **Modify** | Phase 2 | 10 new procedural mechanic SFX recipes |
| `src/rendering/VisualEffectsManager.ts` | **Create** | Phase 3 | 60 FPS rotating saws, laser VFX, portal vortices, exit beacons |
| `src/rendering/CharacterAnimator.ts` | **Create** | Phase 3 | Squash & stretch, wall bump recoil, idle float, death shards |
| `src/scenes/GameScene.ts` | **Modify** | Phases 2–4 | Add `update()` loop, wire audio, wire VFX, wire Undo |
| `src/engine/UndoEngine.ts` | **Create** | Phase 4 | Stack-based state restoration using `CheckpointSnapshotData` |
| `src/engine/TurnEngine.ts` | **Modify** | Phase 4 | Hook Undo snapshots before movement commits |
| `src/ui/Header.ts` | **Modify** | Phase 4 | Split-world HUD with Par indicator and Undo button |
| `src/rendering/MenuScene.ts` | **Modify** | Phase 4 | 5-chapter atmospheric carousel with level card thumbnails |
| `src/ui/TouchControls.ts` | **Modify** | Phase 4 | Ergonomic touch layout with dedicated undo and restart |
| `src/levels/levelsData.ts` | **Modify** | Phase 5 | Deepen Level 11–20 puzzle corridors (Levels 1–10 locked) |
