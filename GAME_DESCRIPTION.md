# THE OTHER SIDE
> *"Two worlds. One mind."*

---

## 1. Overview & Pitch
**THE OTHER SIDE** is a minimalist, monochromatic dual-world logic puzzle game built for modern web browsers and desktop/mobile platforms. Players control two synchronized entities across parallel realities simultaneously: the **Player** in the radiant white *Real World* (left screen) and their **Shadow** in the deep black *Shadow World* (right screen).

Every horizontal step taken in the Real World causes the Shadow to mirror the movement in reverse, while vertical steps remain synchronized. To guide both characters to their respective exits, players must exploit asymmetric wall obstacles, activate coordinated switches, solve door dependencies, and navigate deadly void hazards.

Designed with crisp geometric aesthetics, instantaneous 120ms input feedback, and zero cognitive clutter, *THE OTHER SIDE* offers an elegant, cerebral puzzle experience.

---

## 2. Metadata & Classification
- **Title**: THE OTHER SIDE
- **Tagline**: Two worlds. One mind.
- **Developer**: Antigravity Studio
- **Platform**: Web (HTML5 Canvas / WebGL via Phaser 3), Target: Poki
- **Genre**: Puzzle / Logic / Grid-Based / Brain Teaser / Minimalist
- **Aspect Ratio**: 16:9 responsive (1280 × 720 base resolution, scale-fit to any screen)
- **Target Audience**: Fans of spatial logic puzzles, minimal design (*Limbo*, *Baba Is You*, *Thomas Was Alone*), and puzzle platformers. Suitable for ages 7+.

---

## 3. Key Features
- **Mirrored Dual-World Mechanics**: Control both characters simultaneously with one unified set of inputs. Master horizontal inversion to desynchronize positions and navigate disjoint layouts.
- **20 Handcrafted Levels Across 5 Chapters**:
  - **Chapter 1: The Beginning** (Levels 1–4) — Introduction to mirrored movement, wall desynchronization, and coordinated exits.
  - **Chapter 2: The Connection** (Levels 5–8) — Interactive switches, pressure plates, and multi-switch door rules (`ALL`, `ANY`, `DIRECT`).
  - **Chapter 3: The Separation** (Levels 9–12) — Lethal void hazards, shared death, and atomic paired checkpoints.
  - **Chapter 4: The Reflection** (Levels 13–16) — Complex multi-door dependencies, chained switches, and spatial planning.
  - **Chapter 5: The Truth** (Levels 17–20) — Advanced master puzzles combining all mechanics into tight, satisfying logic challenges.
- **Monochromatic Contrast Aesthetic**: High-contrast, pure black-and-white visual identity with zero color contamination. The Real World is pure white with black silhouettes; the Shadow World is pure black with white silhouettes.
- **Procedural Sound Engine**: Zero audio file downloads. All sound effects (steps, switch clicks, door slides, checkpoint chimes, hazards, completions) are synthesized dynamically via the Web Audio API.
- **Universal Multi-Platform Controls**: Full support for desktop keyboard (WASD / Arrow Keys), hardware gamepads, and ergonomic on-screen mobile/tablet touch D-Pads with multi-touch cancellation prevention.
- **Robust Persistence & Storage**: Versioned localStorage progress tracking with automatic corruption recovery, incognito mode fallback, and offline playability.
- **Official Poki SDK v2 Integration**: Native lifecycle integration (`gameLoadingFinished`, `gameplayStart`, `gameplayStop`, `commercialBreak`) with graceful offline fallback and zero gameplay disruption.

---

## 4. Visual Concept
The screen is vertically partitioned into two equal halves by a high-contrast dividing seam:
- **Left World (Real)**: Background `#FFFFFF`, Character & Solid Obstacles `#000000`.
- **Right World (Shadow)**: Background `#000000`, Character & Solid Obstacles `#FFFFFF`.

Interactive components (switches, pressure plates, doors, exits) invert their geometry and outline tokens to preserve instant readability across both worlds.
