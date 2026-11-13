# VISUAL EFFECTS & ANIMATION PLAN — THE OTHER SIDE
**Document Version**: 1.0.0  
**Scope**: Dynamic Rendering, Real-Time Animations, Particle Systems, and Screen VFX  
**Target Performance**: 60 FPS on Desktop and Mobile Browsers  

---

## 1. Architectural Strategy

To maintain high performance across mobile and desktop without external heavy texture assets, visual upgrades will utilize a **Hybrid Procedural Rendering Architecture**:
1. **Dynamic Canvas Update Loop (`update(time, delta)`)**: Continuous rotations, laser pulses, portal vortices, and idle floating will be driven in `GameScene.update()` using trigonometric phases and Phaser delta time.
2. **Procedural Particle Pools**: Low-overhead particle managers using lightweight geometric shapes (rectangles, diamonds, circles) pooled to zero-allocation lifecycles.
3. **Strict Logic-Render Decoupling**: Visual animations are presentation-only. `TurnEngine` continues to execute purely on discrete grid transactions.

---

## 2. Puzzle Object Visual Redesigns

### 2.1 Rotating Saw Blades (`MovingHazard`)
- **Current Problem**: Completely static; drawn with fixed lines that never rotate.
- **Redesign Implementation**:
  - Store a continuous `sawRotationAngle += delta * 0.008` (approx 460°/sec) in `GameScene`.
  - Draw teeth dynamically offset by `sawRotationAngle`:
    - 8 sharp shark-tooth curved blades extending from a central heavy steel hub.
    - Outer motion-blur ring drawn at 35% opacity to convey ferocious rotational velocity.
    - Central hexagonal bolt with counter-rotating lock washer.
  - When the saw moves between cells, spawn 2–3 grinding spark particles at the rear.
  - When frozen by a `TimeLock`, rotation smoothly decelerates to zero and an icy blue frost vignette envelopes the blade.

### 2.2 Energetic Laser Beams & Emitters (`Laser`)
- **Current Problem**: Static thin cyan line that looks like a blueprint ruler line.
- **Redesign Implementation**:
  - **Triple-Layered Beam Architecture**:
    1. *Diffuse Aura*: Outer translucent glow envelope (`lineStyle(8, 0x00e5ff, 0.25)`).
    2. *Ionization Sheath*: Inner colored beam (`lineStyle(3, 0x00ffff, 0.8)`).
    3. *High-Energy Core*: Central pure white laser filament (`lineStyle(1.5, 0xffffff, 1.0)`).
  - **Dynamic Micro-Jitter**: Apply high-frequency noise ($\pm 0.5\text{px}$) to beam coordinates in `update()` to create the organic hum of intense photon emission.
  - **Impact Flare & Plasma Sparks**: Continuous emission of 4–6 micro plasma particles at the termination point (wall, receiver, mirror, or character hit).
  - **Emitter Nozzle Glow**: Pulsing radial lens flare at the emitter barrel synchronized with a 1.2-second sine breathing phase.
  - **Receiver Sensor**: Rotating target reticle, optical glass iris that contracts when energized, and glowing blue circuit conduits that pulse toward the linked door.
  - **Reflector Mirrors**: 45° angled polished crystal slab with silvered backing, metallic corner brackets, and a shimmering specular glint that sweeps across the mirror face.

### 2.3 Gravitational Rift Portals (`Portal`)
- **Current Problem**: Two static concentric circles that look like radio buttons or targets.
- **Redesign Implementation**:
  - **Dual-Layer Counter-Rotating Vortex**:
    - Outer accretion ring rotating clockwise at 180°/sec with 4 curving gravitational arms.
    - Inner singularity rotating counter-clockwise at 360°/sec with a dense event-horizon core.
  - **Particle Ingestion Field**: Subtle orbiting dust motes that spiral inward toward the portal center and vanish at the event horizon.
  - **Corrupted Portal Distinction**: Sharp jagged spires radiating outwards, flickering erratic rotation, and deep crimson/violet chromatic aberration.
  - **Teleportation Warp Event**: When a character steps into a portal, trigger an instant implosion tween on the character (`scale: 0`, duration: 80ms) followed by an explosive outward bloom at the target destination (`scale: 1.4` $\to$ `1.0`, duration: 100ms) with a shockwave ring.

### 2.4 Luminescent Exit Beacons (`Exit`)
- **Current Problem**: Flat wireframe square that looks like floor trim.
- **Redesign Implementation**:
  - **Pulsing Celestial Beacon**:
    - Ground threshold: Glowing nested floor glyphs that pulse with an ethereal breathing rhythm.
    - Vertical light column: Translucent ascending light beam rising from the floor with soft edge feathering.
    - Ascending motes: Floating luminescent dust particles that drift upward from the exit pad into the void.
    - Arrival lock: When a character steps on the exit, the beacon shifts into a vibrant high-frequency resonance state. When both occupy their exits, the two beams expand into brilliant light pillars that bridge the central divide.

### 2.5 Volatile Bombs & Blast Zones (`Bomb`)
- **Current Problem**: Plain circle with a monospace number and static box.
- **Redesign Implementation**:
  - **Ticking Fuse & Core Vibration**:
    - When active, the bomb shell pulses radially, contracting and expanding with increasing tempo as the countdown drops (`timer = 3`: 1.0Hz, `timer = 1`: 3.0Hz).
    - Glowing sputtering fuse spark emitting smoke/ember micro-particles at the bomb top.
  - **Dynamic Danger Grid**:
    - Blast zone tiles pulse with a rhythmic danger strobe (amber/red edge borders and diagonal hazard stripes).
  - **Detonation Sequence**:
    - Violent expanding shockwave ring expanding to blast radius in 180ms.
    - Destructible wall tiles fracture into 8 flying geometric rubble pieces that fade into the void.
    - Camera shake ($6\text{px}$ magnitude, $200\text{ms}$ duration).

### 2.6 Mechanical Pressure Plates (`PressurePlate`)
- **Current Problem**: Flat square that fills grey with zero tactile sense of depth.
- **Redesign Implementation**:
  - Beveled 3D perspective floor housing with recessed cavity.
  - Spring-loaded plate that visibly depresses downward by 4 pixels when occupied by a character or movable block.
  - Illuminated perimeter conduits that illuminate with a running current when pressed, visually connecting the plate to its target gate.

### 2.7 Magnetic Fields & Movable Blocks (`Magnetic`)
- **Current Problem**: Static plus-sign block and static arrow dish.
- **Redesign Implementation**:
  - **Magnetic Emitter**: Rhythmic curved field wave arcs (`)))`) propagating along the line of sight toward the range limit.
  - **Movable Block**: Heavy beveled steel chassis, glowing magnetic polarity runes ('+' in cyan for attract, '-' in magenta for repel), and metallic corner feet that cast soft directional drop shadows.
  - **Sliding Physics**: When pulled or pushed by a magnetic field, the block slides with high-speed motion blur and emits ground friction sparks.

### 2.8 Time Locks (`TimeLock`)
- **Current Problem**: Static clock icon with flat 25% tint.
- **Redesign Implementation**:
  - Ornate astronomical chronometer face with rotating outer gear ring.
  - Continuous sweeping second hand that smoothly ticks around the dial.
  - When triggered: Releases an expanding radial freeze wave that coats affected hazards and doors in sparkling crystalline frost particles.

---

## 3. Character Dynamics & Kinematics

### 3.1 Squash and Stretch Animation Controller
During the 120ms movement transaction:
- **Frame 0ms – 20ms (Anticipation)**: Character compresses along movement axis (`scaleX: 1.15, scaleY: 0.85` for vertical, inverse for horizontal).
- **Frame 20ms – 90ms (Transit)**: Character elongates along travel vector (`scaleX: 0.85, scaleY: 1.25`) with a 2-pixel trail shadow.
- **Frame 90ms – 120ms (Landing / Settle)**: Over-travel bounce (`scaleX: 1.08, scaleY: 0.92`) followed by elastic return to `1.0, 1.0`.

### 3.2 Wall Collision (Bump / Rejection)
- When input is blocked by a wall, character executes a sharp 4px impulse toward the wall and springs back with an elastic recoil (`duration: 90ms`, `ease: 'Back.easeOut'`).
- Micro spark flash at the contact point on the obstacle edge.

### 3.3 Idle Breathing & Character Life
- Continuous ambient vertical float ($y \pm 1.5\text{px}$, period: 1.8s, ease: 'Sine.easeInOut').
- The central geometric eye (diamond aperture) subtly glances in the direction of the latest movement input.

### 3.4 Death & Respawn Sequence
- **Death**: Character instantly shatters into 12 geometric shards that disperse outward with rotational momentum. Screen undergoes a 120ms monochrome inversion flash and camera micro-shake ($8\text{px}$).
- **Respawn**: Shards re-converge from the void back into the active checkpoint in reverse motion, solidifying with a crisp white bloom.

---

## 4. Atmospheric Environmental Effects

1. **Ambient Void Dust (Drifting Motes)**:
   - 25 subtle floating particles drifting lazily across the screen (Real World has dark specks drifting across white; Shadow World has faint starlight motes drifting across black).
2. **Dividing Rift Atmosphere**:
   - The central line dividing Real and Shadow emits faint undulating energy wisps that ripple vertically, reinforcing that reality itself is fractured between the two worlds.
3. **Screen Vignette**:
   - Soft radial vignette around the screen perimeter that draws visual focus into the playable puzzle chambers.

---

## 5. Technical Implementation Blueprint

- **New Class**: `src/rendering/VisualEffectsManager.ts`
  - Encapsulates saw blade rotation updates, laser jitter, portal vortex angles, particle pools, and screen shake triggers.
- **New Class**: `src/rendering/CharacterAnimator.ts`
  - Manages squash-and-stretch tweens, idle float, eye glance direction, bump recoils, and shatter death effects.
- **Modifications to `GameScene.ts`**:
  - Replace static graphics loops with delegated calls to `VisualEffectsManager` and `CharacterAnimator`.
  - Add `update(time, delta)` hook to drive 60 FPS continuous rotations and particle lifecycles.
