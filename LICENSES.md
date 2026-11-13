# LICENSES & ASSET DECLARATIONS — THE OTHER SIDE

This document details the licensing, ownership, and provenance of all assets, code, audio, and third-party dependencies used in **THE OTHER SIDE**.

---

## 1. Proprietary & Custom Assets (100% Original)

### Visual Assets & Artwork
- **Art Direction**: Monochromatic geometric vector design.
- **Rendering Mechanism**: 100% procedurally generated via Phaser 3 Vector Graphics (`Phaser.GameObjects.Graphics`).
- **External Image Dependencies**: **ZERO**. No external PNG, JPG, SVG, WebP, or raster/vector sprite sheet files are imported or required by the game bundle.
- **Copyright**: © 2026 Antigravity Studio. All custom gameplay logic, level designs, and procedural visual shaders/graphics are original works created specifically for *THE OTHER SIDE*.

### Audio & Sound Effects
- **Audio Engine**: 100% procedurally synthesized in real time via the HTML5 Web Audio API (`AudioContext`).
- **External Audio Dependencies**: **ZERO**. No external MP3, WAV, OGG, or FLAC audio files are downloaded or distributed with the game.
- **Procedural Synthesizers**: Custom square wave, sine wave, and frequency ramp generators (`src/audio/SoundEffects.ts`) for footsteps, switch triggers, door sliding, checkpoint chimes, hazards, and victory fanfare.

### Level Designs & Puzzles
- **Design Provenance**: All 20 levels across Chapters 1 through 5 are handcrafted, mathematically verified, and validated via an automated Breadth-First Search (BFS) solver (`src/solver/LevelSolver.ts`).
- **Copyright**: © 2026 Antigravity Studio.

---

## 2. Open-Source Third-Party Libraries

The following third-party open-source libraries are used as production dependencies:

### Phaser 3
- **Purpose**: HTML5 2D WebGL/Canvas game engine.
- **License**: MIT License
- **Copyright**: © 2024 Richard Davey, Photon Storm Ltd.
- **Website**: https://phaser.io
```text
MIT License

Copyright (c) 2011-2024 Richard Davey, Photon Storm Ltd.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 3. Platform SDK Compliance

### Poki SDK v2
- **Integration Layer**: `src/poki/PokiIntegration.ts`
- **Script Location**: Officially hosted CDN (`https://game-cdn.poki.com/scripts/v2/poki-sdk.js`)
- **Distribution Note**: Poki SDK script is loaded asynchronously per official Poki developer documentation. The core game contains complete offline and adblocker fallback handling, ensuring that gameplay remains fully functional even when the Poki SDK is unreachable or running outside the Poki platform.
