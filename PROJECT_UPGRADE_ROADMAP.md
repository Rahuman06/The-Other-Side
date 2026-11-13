# PROJECT UPGRADE ROADMAP — THE OTHER SIDE

**Project:** THE OTHER SIDE  
**Date:** November 13, 2026  
**Status:** PROPOSED & AWAITING APPROVAL  

---

## 1. Roadmap Overview & Strategic Principles

This roadmap outlines the remaining phases required to elevate **THE OTHER SIDE** into a polished, atmospheric, commercial puzzle release.

### Fundamental Non-Negotiable Constraints:
1. **Levels 1–10 Are Strictly Locked**: No layout, tile placement, wall structure, or solution traces may be altered in Chapters 1 & 2. Level 5 ("The Impossible Choice") is permanently approved and locked.
2. **Core Mechanics Are Invariant**: Mirrored horizontal input, shared vertical input, independent world collision, simultaneous paired exit completion, and zero gravity/jumping.
3. **Zero External Audio Assets**: All music and sound effects must be synthesized procedurally in real-time via the Web Audio API (0 kB external download, zero loading latency, immune to CORS or ad-blocker issues).
4. **Deterministic Solvability**: Any proposed level change in Levels 11–20 must be proven solvable by the automated BFS solver (`scripts/validateLevels.ts`) with zero softlocks.

---

## 2. Multi-Phase Implementation Plan

```
+-----------------------------------------------------------------------------------------+
| [COMPLETED] PHASE 1: Technical Foundation, Baseline Audit & Design Preservation         |
|   - Baseline commit 2d74a08 verified with 223/223 tests passing.                        |
|   - Root cause of Real World stickman attached object identified and permanently fixed. |
|   - Approved 4-quadrant segmented cracked block restored from Git baseline.             |
+-----------------------------------------------------------------------------------------+
                                             |
                                             v
+-----------------------------------------------------------------------------------------+
| [COMPLETED] PHASE 2: Visual Effects, Object Identity & Animation Engine                 |
|   - CharacterAnimator.ts: procedural stickmen, walk stride, squash/stretch, recoil.     |
|   - PuzzleObjectRenderer.ts: distinct high-detail vector silhouettes for all 16 objects.|
|   - VisualEffectsManager.ts: 60 FPS continuous update loop for saws, portals, lasers.   |
+-----------------------------------------------------------------------------------------+
                                             |
                                             v
+-----------------------------------------------------------------------------------------+
| [UPCOMING] PHASE 3: Thriller Soundscape & Procedural Audio Engine                       |
|   - AtmosphericMusic.ts: continuous 4-layer procedural dark ambient drone synthesizer   |
|     (Sub-Bass Dread, Evolving Thriller Pad, Heartbeat Tension Pulse, Void Whispers).    |
|   - SoundEffects.ts Expansion: tactile resonant SFX for lasers, saws, portals, bombs,   |
|     collapsing floors, switches, and dual-world harmonic exit unification chords.        |
+-----------------------------------------------------------------------------------------+
                                             |
                                             v
+-----------------------------------------------------------------------------------------+
| [UPCOMING] PHASE 4: UI/UX Overhaul & Instant Undo Stack                                  |
|   - Instant Undo Engine: Push CheckpointSnapshot data on each move; pop on 'Z' key.     |
|   - Atmospheric HUD: Chapter titlecards, minimalist move counter, fluid modal menus.    |
|   - Responsive Controls: Refined touch D-pad & swipe gestures with visual feedback.     |
+-----------------------------------------------------------------------------------------+
                                             |
                                             v
+-----------------------------------------------------------------------------------------+
| [UPCOMING] PHASE 5: Difficulty & Puzzle Progression Redesign (Levels 11–20 ONLY)        |
|   - Levels 1–10: Strictly UNTOUCHED.                                                    |
|   - Level 11 ("No Way Back"): Redesign branching collapsing floor maze (target: 12-14). |
|   - Level 13 ("Refraction"): Multi-mirror laser routing with cross-world dependencies.  |
|   - Level 15 ("Magnetic"): Deepen magnetic crate routing and polarity manipulation.     |
|   - Automated BFS verification of all modified levels.                                  |
+-----------------------------------------------------------------------------------------+
                                             |
                                             v
+-----------------------------------------------------------------------------------------+
| [UPCOMING] PHASE 6: Final QA, Automated Regression Gate & Poki Release Packaging        |
|   - Full Playwright E2E matrix across Desktop, Tablet, and Mobile viewports.            |
|   - Commercial break hooks and Poki SDK lifecycle compliance verification.              |
|   - Final production bundle optimization.                                               |
+-----------------------------------------------------------------------------------------+
```

---

## 3. Detailed Scope for Upcoming Phase 3: Thriller Soundscape

### 3.1 Procedural Ambient Drone Engine (`AtmosphericMusic.ts`)
* **Layer 1: Sub-Bass Dread**: Low sine oscillator (38 Hz – 55 Hz) with gentle wave saturation to build psychological weight.
* **Layer 2: Dissonant Thriller Pad**: Slow, breathing minor-second and tritone clusters modulated by an LFO biquad lowpass filter.
* **Layer 3: Tension Heartbeat**: Rhythmic low-end impulse pulse that dynamically accelerates when standing near active bombs or saw hazards.
* **Layer 4: Dimensional Void Wind**: Filtered pink/white noise simulating cold atmospheric airflow across the central divider.
* **Interactive Modulation**: Automatically shifts harmonic pitch and dissonance between chapters (Chapter 1 D minor $\to$ Chapter 5 climactic resolution).

### 3.2 Enhanced Procedural Sound Effects (`SoundEffects.ts`)
* **Mechanical Saw**: Continuous low metallic buzz modulated by distance.
* **Laser Energy**: High-voltage electrical hum and crackling beam surge.
* **Portal Warp**: Gravitational pitch drop ($\text{500 Hz} \to \text{80 Hz}$) followed by spatial resonance bloom.
* **Bomb Detonation**: Heavy sub-bass thud paired with high-frequency noise burst and decaying reverberation tail.
* **Tactile Floor/Wall Bump**: Low-resonance wood/stone tap replacing primitive synthetic clicks.
* **Exit Harmonization**: Real World and Shadow World frequencies merge into an uplifting harmonic major chord upon simultaneous arrival.

---

## 4. Conflict & Risk Analysis

| Upgrade Item | Potential Conflict | Mitigation Strategy |
| :--- | :--- | :--- |
| **Difficulty Redesign** | Risk of altering Levels 1–10 or breaking Level 5. | **Hard Constraint:** Automated CI tests will enforce that `ALL_LEVELS.slice(0, 10)` match baseline definitions byte-for-byte. |
| **Undo System** | Desync between visual position and logical grid state. | Use existing `CheckpointSnapshot.capture()` to record immutable full-game states on every move; instant pop restores all 16 object states. |
| **Audio Playback** | Browser autoplay policy blocking Web Audio before user interaction. | Defer `AudioContext.resume()` until the first user click, keypress, or touch event on `BootScene` / `MenuScene`. |
| **60 FPS Performance** | Frame drops on low-end mobile devices during audio synthesis and particle rendering. | Zero-allocation per-frame loops; shared Web Audio graph nodes; particles culled when beyond viewport. |
