# THE OTHER SIDE

> **Two Worlds. One Mind.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Phaser 3](https://img.shields.io/badge/Phaser-3.80+-orange.svg?logo=javascript&logoColor=white)](https://phaser.io/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF.svg?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Vitest](https://img.shields.io/badge/Tests-259%20Passed-brightgreen.svg?logo=vitest&logoColor=white)](https://vitest.dev/)
[![Levels](https://img.shields.io/badge/Levels-20%20Handcrafted-purple.svg)](#the-20-levels)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSES.md)

---

## Overview

**THE OTHER SIDE** is an atmospheric, minimalist dual-world puzzle platformer built with **Phaser 3**, **TypeScript**, and **Vite**.

The player simultaneously controls two interconnected entities across a vertically split screen:
- **The Real World** (Left side): Stark high-contrast white canvas, black architectural geometry, and a black stickman protagonist.
- **The Shadow World** (Right side): Deep obsidian black canvas, gleaming chalk-white geometry, and a spectral white stickman counterpart.

Every directional input (`W/A/S/D` or `Arrow Keys`) moves **both characters simultaneously**. A single step can bring one character closer to salvation while walking the other straight into a fatal trap. To conquer each level, you must think in two dimensions at once, coordinating cross-world switches, managing timed obstacles, manipulating lasers, and rescuing one character with the other.

---

## Key Gameplay Mechanics

- **Simultaneous Dual Movement**: Both characters respond to every input concurrently. When one is blocked by an obstacle or wall, the other can continue moving, enabling complex spatial decoupling and positioning strategies.
- **Cross-World Switches & Doors**: Switches pressed in the Real World can unlock sealed doors or shift magnetic barriers in the Shadow World, and vice versa.
- **Dynamic Portals & Rift Shifting**: Quantum portals connect distant chambers within and across dimensions, instantly transporting entities, blocks, or beams.
- **Optical Laser & Mirror Optics**: Direct laser beams across split chambers; redirect their vectors through movable mirrors and prisms to disable security forcefields.
- **Hazard Systems**:
  - **Moving Circular Saws**: Oscillating saw blades requiring precision timing.
  - **Cracked Blocks**: Fragile floor tiles that crumble into deep chasms once stepped upon.
  - **Explosive TNT Blocks**: Demolition blocks triggered by proximity or switches to carve open sealed routes.
  - **Time-Lock Vaults**: Gates that close permanently after a set countdown of moves.
- **Mutual Rescues & Simultaneous Exits**: Both characters must survive and reach their respective glowing exit portals simultaneously to clear the stage.

---

## The 20 Levels

All 20 levels are handcrafted, mathematically verified with a custom BFS algorithmic solver (`scripts/validateLevels.ts`), and frozen for production:

| Tier | Levels | Focus & Mechanics |
|---|---|---|
| **Tier 1: Foundations** | Levels 1–5 | Dual movement basics, obstacle decoupling, initial cross-world switches, and single-step synchronization. |
| **Tier 2: Intermediate Hazards** | Levels 6–10 | Cracked crumbling blocks, moving circular saws, pressure plate locks, and multi-step rescues. |
| **Tier 3: Advanced Entanglement** | Levels 11–15 | Cross-world collapses, optical laser beams, magnetic repulsion fields, and coordinated checkpoint traps. |
| **Tier 4: Master Chambers** | Levels 16–18 | Dynamic rift shifting, TNT demolition corridors, multi-portal routing, and dual-world chain reactions. |
| **Tier 5: The Penultimate Challenge** | Level 19 | 5-zone interconnected chamber, 70+ move optimal solution, optical laser timing, and mutual confinement rescue. |
| **Tier 6: The Impossible Dimension** | Level 20 | Grand 15×15 dual masterwork, 100+ move shortest path, moving saws, laser optics, time locks, and dual exit synchronization. |

---

## Procedural Audio Architecture

*THE OTHER SIDE* features a custom, zero-dependency procedural audio engine built directly on the **Web Audio API**:

- **Dynamic Dual-World Panning**: Audio generated in the Real World pans to the left stereo channel; audio generated in the Shadow World pans to the right stereo channel.
- **8 Comprehensive Sound Categories**:
  1. *Footsteps & Motion*: Organic mechanical clicks with subtle pitch modulation.
  2. *Switches & Plates*: Resonant metallic toggles and heavy pressure plate thuds.
  3. *Doors & Barriers*: Deep stone sliding and pneumatic release hums.
  4. *Portals & Rifts*: Shimmering harmonic frequency sweeps.
  5. *Hazards & Lasers*: High-frequency hums and saw buzzes.
  6. *TNT Demolition*: Low-frequency resonant impact explosions.
  7. *Error / Blocked Blips*: Subdued dissonance chimes on invalid actions or locked levels.
  8. *Victory Flourish*: Ascending harmonic chord progression upon stage completion.
- **Tab Visibility Audio Suspension**: Automatically pauses synthesizers and silences audio contexts when the browser tab loses focus (`AudioContextManager`), ensuring 0% idle CPU and battery drain.

---

## Controls

| Action | Desktop Keyboard | Touch / Mobile | Gamepad |
|---|---|---|---|
| **Move** | `W`, `A`, `S`, `D` or `Arrow Keys` | Virtual D-Pad / Swipes | D-Pad / Left Stick |
| **Restart Level** | `R` | Top HUD `[ ↺ ]` Button | `Y` / `Triangle` |
| **Pause Menu** | `Esc` or `P` | Top HUD `[ ⏸ ]` Button | `Start` / `Options` |
| **Object Guide** | Top HUD `[ ? ]` Button | Top HUD `[ ? ]` Button | `Select` / `Share` |
| **Mute / Unmute** | Settings Modal | Settings Modal | — |

---

## Tech Stack

- **Game Engine**: [Phaser 3](https://phaser.io/) (v3.88+)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
- **Bundler & Tooling**: [Vite](https://vitejs.dev/)
- **Testing**: [Vitest](https://vitest.dev/) (259 automated unit and regression tests)
- **Audio**: Web Audio API (100% procedural synth, 0 external audio files)
- **Platform Support**: Web (Chrome, Firefox, Safari, Edge, Mobile Browsers) & HTML5 Game Portals (Poki, CrazyGames)

---

## Development Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- `npm` or `pnpm`

### Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/Rahuman06/The-Other-Side.git
cd The-Other-Side
npm install
```

### Local Development Server
Start the local Vite development server:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

### Running Tests
Execute the complete test suite (259 tests across 35 test suites):
```bash
npm test
```

### Type Checking
Run strict TypeScript compiler verification:
```bash
npm run typecheck
```

### Algorithmic Level Validation
Run the BFS solver to verify that all 20 levels have valid mathematical solutions:
```bash
npx vite-node scripts/validateLevels.ts
```

### Production Build
Compile and bundle optimized production assets:
```bash
npm run build
```
The compiled output will be placed in the `dist/` directory, ready to deploy to any static host (GitHub Pages, Netlify, Vercel, itch.io, Poki, or CrazyGames).

---

## Project Structure

```
├── public/                 # Static assets, favicon, Poki SDK wrappers
├── screenshots/            # Gameplay screenshots and verification artifacts
├── scripts/                # Algorithmic solver, level validator, and generators
│   ├── validateLevels.ts   # Automated BFS solver verifying all 20 levels
│   └── design_*.ts         # Algorithmic generators for high-complexity levels
├── src/
│   ├── audio/              # Web Audio API synthesizers & sound effect engines
│   │   ├── AtmosphericMusic.ts
│   │   ├── AudioContextManager.ts
│   │   └── SoundEffects.ts
│   ├── levels/             # Handcrafted level definitions & metadata
│   │   └── levelsData.ts   # All 20 approved and frozen game levels
│   ├── logic/              # Movement, collision, triggers, and state rules
│   ├── rendering/          # Split-screen renderer, character animation, effects
│   ├── scenes/             # Phaser Scenes (BootScene, MenuScene, GameScene, EndingScene)
│   ├── solver/             # Graph search, BFS pathfinding, and validation logic
│   ├── types/              # TypeScript interfaces for tiles, objects, levels
│   ├── ui/                 # Modals (PauseModal, WinModal, ObjectGuideModal, SettingsModal)
│   └── main.ts             # Application entrypoint and Phaser config
└── tests/
    └── unit/               # 35 Vitest test suites (259 passing tests)
```

---

## License

This project is licensed under the terms described in [LICENSES.md](LICENSES.md).  
Copyright © 2026 Antigravity Studio. All rights reserved.
