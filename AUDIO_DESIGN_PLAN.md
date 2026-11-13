# AUDIO & ATMOSPHERIC SOUND DESIGN PLAN — THE OTHER SIDE
**Document Version**: 1.0.0  
**Scope**: Procedural Synthesis Engine, Thriller Ambient BGM, Cinematic SFX, and Dynamic Audio Mixing  
**Target Engine**: Web Audio API (Zero external audio asset dependencies, instantaneous streaming, zero latency)  

---

## 1. Aesthetic Vision & Acoustic Philosophy

The sonic identity of **THE OTHER SIDE** is that of an **intimate, high-tension psychological sci-fi thriller**. 
The auditory landscape must reinforce the central premise:
- **Real World**: Clean, tactile, high-frequency, mechanical, and crisp.
- **Shadow World**: Subterranean, low-frequency, resonant, reverberant, and haunting.
- **The Union**: When both characters interact or arrive at exits, their distinct audio frequencies harmonize into pure, rich chords.

By utilizing procedural Web Audio API synthesis (oscillators, biquad filters, gain ramps, waveshapers, and delay networks), the entire game audio footprint is **0 kilobytes of external audio downloads**, completely immune to CORS issues, loading delays, or Poki SDK asset blockers.

---

## 2. Generative Ambient Thriller BGM Engine (`AtmosphericMusic.ts`)

### 2.1 Layered Drone Architecture
The music engine maintains a continuous, procedural 4-layer ambient drone:

```
+-------------------------------------------------------------------------+
| Layer 1: Sub-Bass Dread (38Hz – 55Hz Sine + Soft Saturation)            |
|   Continuous ominous foundation creating somatic psychological tension. |
+-------------------------------------------------------------------------+
| Layer 2: Evolving Thriller Pad (Tri-tone & Minor 9th Intervals)         |
|   Slow, breathing chord clusters modulated by LFO low-pass filters.    |
+-------------------------------------------------------------------------+
| Layer 3: Binaural Tension Pulse (Heartbeat / Clockwork Ticks)           |
|   Rhythmic pulse (60 BPM baseline) that escalates when danger nears.    |
+-------------------------------------------------------------------------+
| Layer 4: High-Frequency Void Whispers (Bandpassed White Noise)           |
|   Drifting, ethereal wind textures representing the dimensional chasm.  |
+-------------------------------------------------------------------------+
```

### 2.2 Chapter-Specific Harmonic Themes
The ambient generator adjusts its root notes, filter frequencies, and dissonance based on the current chapter:

1. **Chapter 1 — THE BEGINNING (Root: D minor)**:
   - Mysterious, spacious, sparse. Filter cutoff at 350Hz.
   - Evokes awakening in an unknown, silent labyrinth.
2. **Chapter 2 — THE CONNECTION (Root: G minor / C diminished)**:
   - Industrial tension, ticking metallic pulses, resonant subterranean rumbles.
   - Reflects the explosive instability of bombs and portal rifts.
3. **Chapter 3 — THE SEPARATION (Root: F minor with sharp 4ths)**:
   - Dissonant, razor-sharp, anxious. Higher harmonic presence.
   - Matches the relentless threat of rotating saw blades and collapsing floors.
4. **Chapter 4 — THE REFLECTION (Root: A minor 9th / Cmaj7)**:
   - Crystalline, optical, glass-like resonance. Shimmering high-frequency overtones.
   - Resonates with laser light beams and magnetic fields.
5. **Chapter 5 — THE TRUTH (Root: D minor $\to$ D major resolution)**:
   - Monumental, deep, climactic master drone that slowly resolves from dark minor dissonance to profound major harmony upon level completion.

### 2.3 Interactive Tension Modulation
The BGM responds dynamically to live gameplay events:
- **Ticking Bomb Near Player**: Sub-bass drops out; heartbeat pulse accelerates from 60 BPM to 140 BPM with rising pitch.
- **Time Lock Active**: Pad pitch shifts up a fifth with a sparkling high-frequency chorus effect, simulating frozen time.
- **Level Complete**: The drone smoothly cross-fades into a warm, radiant ambient chord that envelops both channels.

---

## 3. Cinematic Procedural SFX Suite (`SoundEffects.ts`)

Every in-game action receives a dedicated, multi-layered synthesis recipe:

| Sound Effect | Synthesis Recipe & Layering | Auditory Sensation |
|---|---|---|
| **Step (`step`)** | Real: Crisp 240Hz $\to$ 140Hz triangle click with high-pass filtered noise tap. Shadow: 110Hz $\to$ 60Hz resonant sub-thud. | Tactile, satisfying floor grip. Real feels crisp; Shadow feels heavy. |
| **Wall Bump (`bump`)** | 80Hz sine drop with rapid saturation distortion and 40Hz sub-concussion pulse. | Heavy, unyielding physical obstruction. Communicates clear rejection without annoyance. |
| **Switch Toggle (`switch`)** | Heavy mechanical relay: 620Hz square transient + 1.2kHz metallic snap + 180Hz low-end relay lock. | Industrial toggle lever clicking into solid place. |
| **Pressure Plate (`pressurePlate`)** | 120Hz hydraulic sink hiss + 85Hz spring latch engagement click. | Heavy floor plate sinking into stone under physical weight. |
| **Portal Warp (`portalTeleport`)** | Downward frequency sweep (1.8kHz $\to$ 220Hz) through a resonant bandpass filter with feedback delay tail. | Space-folding gravitational displacement whoosh. |
| **Laser Hum & Sizzle (`laserHum`)** | Continuous dual oscillator: 60Hz mains hum + 2.4kHz white noise sizzle with slight chorusing. | Dangerous, crackling electrical plasma beam. |
| **Saw Blade Whir (`sawWhir`)** | Periodic 380Hz sawtooth sweep with amplitude modulation at 12Hz (spinning teeth). | Visceral, threatening circular saw motor. |
| **Bomb Ticking (`bombTick`)** | Crisp woodblock/metal transient click with pitch ramping up on each countdown step ($440\text{Hz} \to 660\text{Hz} \to 880\text{Hz}$). | Urgent, high-stakes countdown tension. |
| **Bomb Detonation (`bombDetonation`)** | 45Hz sub-bass shockwave drop (0.4s) + white noise explosion burst through low-pass sweep + long decaying reverb rumble. | Massive, room-shaking explosion with genuine concussive weight. |
| **Time Lock Freeze (`timeLock`)** | High-frequency glass bell chime (1.6kHz, 2.2kHz, 3.1kHz) with reverse envelope swell and crystalline decay. | Freezing time; ethereal stasis field. |
| **Magnetic Pull (`magneticPull`)** | Resonant 130Hz sine with slowly rising pulse-width modulation + scrape noise of stone/metal against floor. | Powerful unseen electromagnetic force dragging a heavy core. |
| **Collapsing Floor (`collapsingFloor`)** | Multi-transient brittle fracture crackle (stone snapping) + downward-pitch rumble falling into silence. | Fragile floor giving way into an infinite abyss. |
| **Checkpoint Active (`checkpoint`)** | Three-tone ascending chime (440Hz, 660Hz, 880Hz) with gentle delay and warm sine resonance. | Relief, sacred sanctuary, secured progress. |
| **Death Disintegration (`death`)** | Sudden concussive snap + high-frequency glass shatter + rapid descending sub-bass drop (150Hz $\to$ 30Hz). | Shocking, decisive failure without piercing harshness. |
| **Level Complete (`win`)** | Grand 4-voice harmonic bloom (C5, G5, E6, C7) with soft attack, long sustain, and sparkling overtone bell. | Exhilarating cognitive triumph and harmony between worlds. |

---

## 4. Audio Architecture & System Integration

### 4.1 Class Structure & File Updates
1. **`src/audio/AtmosphericMusic.ts`**:
   - Manages the generative drone synthesizer, LFO filter modulations, tension tempo, and cross-chapter theme adjustments.
   - Provides `play()`, `stop()`, `setTension(level)`, and `setChapter(name)`.
2. **`src/audio/SoundEffects.ts`**:
   - Expanded to support all 16 new puzzle object SFX methods with multi-node synthesis chains.
   - Global volume balancing and soft clipping (`DynamicsCompressorNode`) to prevent digital clipping when multiple sounds trigger simultaneously.
3. **`src/scenes/GameScene.ts`**:
   - Initializes `AtmosphericMusic` on level start and feeds puzzle proximity and hazard events into the audio tension system.
   - Integrates ducking: Dips music volume by 30% during explosions or death sequences.

### 4.2 Poki SDK & Lifecycle Compliance
- When Poki triggers `commercialBreak`:
  - `AtmosphericMusic.pause()` and `SoundEffects.setMuted(true)`.
  - AudioContext is cleanly suspended or muted without losing synthesizer phase.
- Upon ad completion:
  - AudioContext resumes and music smoothly fades back in over 800ms.
- Respects player's persistent `muted` preference saved in `StorageManager`.
