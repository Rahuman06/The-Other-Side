# PHASE 4 — SOUND EFFECT CATALOG

**Project:** THE OTHER SIDE  
**Date:** November 13, 2026  
**Module:** `src/audio/SoundEffects.ts`  
**Audio Architecture:** Real-time Web Audio API Procedural Multi-Node Synthesis  

---

## 1. Catalog Overview

The sound effects suite of **THE OTHER SIDE** is designed to provide immediate physical, tactile, and psychological feedback for every interaction. Rather than relying on static, repetitive sample playbacks, every effect is synthesized procedurally on demand, guaranteeing zero loading latency, crisp acoustic definition, and micro-variations that prevent auditory fatigue.

---

## 2. Object & Character Sound Effect Recipes

### 2.1 Character Locomotion (`playStep`)
- **Real World Footstep:**
  - *Synthesis:* Crisp triangle wave frequency drop from $240\text{ Hz} \to 140\text{ Hz}$ over $40\text{ ms}$ with high-pass filtered transient click.
  - *Perception:* Sharp, tactile leather-soled shoe striking polished architectural stone.
  - *Gain:* $0.09$, fast exponential decay.
- **Shadow World Footstep:**
  - *Synthesis:* Subterranean sine wave frequency drop from $110\text{ Hz} \to 55\text{ Hz}$ over $60\text{ ms}$.
  - *Perception:* Deep, resonant acoustic thud echoing through an obsidian cavern.
  - *Gain:* $0.12$, medium exponential decay.

### 2.2 Wall Obstruction / Blocked Move (`playBump`)
- **Synthesis:** $95\text{ Hz} \to 38\text{ Hz}$ sine drop over $90\text{ ms}$ paired with soft waveshaper saturation distortion.
- **Perception:** Solid, unyielding physical barrier. Communicates movement failure with tactile weight rather than annoying dissonance.
- **Gain:** $0.16$.

### 2.3 Switch Toggle (`playSwitch`)
- **Synthesis:** Dual-transient mechanical relay:
  - Layer 1: $620\text{ Hz} \to 940\text{ Hz}$ square wave snap over $80\text{ ms}$.
  - Layer 2: $180\text{ Hz} \to 70\text{ Hz}$ sine wave relay latch over $100\text{ ms}$ ($20\text{ ms}$ delay).
- **Perception:** Heavy industrial toggle lever snapping into a locking slot.

### 2.4 Pressure Plate Engagement (`playPressurePlate`)
- **Pressed (Downward Sink):**
  - *Synthesis:* $140\text{ Hz} \to 65\text{ Hz}$ triangle wave hydraulic hiss over $120\text{ ms}$.
  - *Perception:* Heavy stone plate sinking $4\text{ px}$ flush into the floor under character mass.
- **Released (Spring Rebound):**
  - *Synthesis:* $75\text{ Hz} \to 130\text{ Hz}$ upward sine chirp over $90\text{ ms}$.
  - *Perception:* Mechanical counterweight spring resetting.

### 2.5 Interlocking Blast Doors (`playDoor`)
- **Opening (Slide Open):**
  - *Synthesis:* $80\text{ Hz} \to 160\text{ Hz}$ sawtooth sweep through a lowpass filter over $220\text{ ms}$.
  - *Perception:* Heavy pneumatic sliding hiss as chevron blast door leaves part.
- **Closing (Barrier Slam):**
  - *Synthesis:* $120\text{ Hz} \to 35\text{ Hz}$ concussive sine drop over $280\text{ ms}$ with high gain ($0.22$).
  - *Perception:* Tremendous structural slam as steel blast doors lock shut.

### 2.6 Laser Activation & Plasma Sizzle (`playLaser`)
- **Active State:** $120\text{ Hz} \to 380\text{ Hz}$ sawtooth wave representing $60\text{ Hz}$ mains hum harmonic doubling and beam ionization over $140\text{ ms}$.
- **Impact / Receiver Strike:** $880\text{ Hz} \to 220\text{ Hz}$ square wave burst over $80\text{ ms}$ simulating high-voltage electrical crackle against target surface.

### 2.7 Saw Blade Rotation & Contact (`playSaw`)
- **Continuous Whir:** $280\text{ Hz} \to 340\text{ Hz}$ sawtooth wave with $12\text{ Hz}$ amplitude modulation mimicking spinning mechanical teeth over $150\text{ ms}$.
- **Impact Scrape:** $480\text{ Hz} \to 110\text{ Hz}$ harsh sawtooth friction transient over $200\text{ ms}$.

### 2.8 Bomb Ticking (`playBombTick`)
- **Synthesis:** High-tension square wave transient ($40\text{ ms}$).
- **Escalating Pitch:**
  - $3\text{ turns remaining}$: $520\text{ Hz}$ (Moderate alert)
  - $2\text{ turns remaining}$: $740\text{ Hz}$ (Heightened warning)
  - $1\text{ turn remaining}$: $980\text{ Hz}$ (Urgent critical warning)
- **Perception:** Relentless clockwork timer counting down to catastrophe.

### 2.9 Bomb Detonation (`playBombExplosion`)
- **Dual-Layer Concussion Recipe:**
  1. *Sub-Bass Shockwave Drop:* $55\text{ Hz} \to 22\text{ Hz}$ sine wave over $550\text{ ms}$ with peak gain $0.28$.
  2. *Shrapnel Debris Rumble:* $450\text{ ms}$ procedural white noise burst sculpted by a sweeping lowpass filter ($1400\text{ Hz} \to 160\text{ Hz}$).
- **Perception:** Room-shaking, physically visceral detonation.

### 2.10 Dimensional Portal Travel (`playPortalTravel`)
- **Synthesis:** $1800\text{ Hz} \to 140\text{ Hz}$ logarithmic sine frequency drop over $280\text{ ms}$ through a resonant bandpass filter.
- **Perception:** Gravitational singularity folding space and projecting the character into the destination coordinate.

### 2.11 Specular Mirror Reflection (`playMirror`)
- **Synthesis:** Ascending crystalline triad ($1480\text{ Hz}, 2220\text{ Hz}, 2960\text{ Hz}$) staggered by $25\text{ ms}$.
- **Perception:** Specular glass prism glint with prismatic overtone sheen.

### 2.12 Magnetic Field Activation (`playMagnetic`)
- **Synthesis:** $90\text{ Hz} \to 260\text{ Hz}$ triangle wave over $200\text{ ms}$ with slow pulse-width modulation.
- **Perception:** Unseen electromagnetic force pulling or repelling heavy metallic objects across masonry.

### 2.13 Time Lock Freeze (`playTimeLock`)
- **Engage:** High-frequency crystalline glass chime descending triad ($1600\text{ Hz}, 2150\text{ Hz}, 3100\text{ Hz}$) with reverse envelope swell over $250\text{ ms}$.
- **Release:** Ascending reverse chime ($3100\text{ Hz} \to 1600\text{ Hz}$) signaling resumption of time flow.

### 2.14 Collapsing Floor Cracking (`playCollapsingFloor`)
- **Synthesis:** Sawtooth wave fracture snap ($280\text{ Hz} + \text{stage} \times 60\text{ Hz} \to 60\text{ Hz}$) over $160\text{ ms}$.
- **Perception:** Brittle stone tiles fracturing underfoot and crumbling into the abyss.

### 2.15 Moving Wall Grinding (`playMovingWall`)
- **Synthesis:** $65\text{ Hz} \to 75\text{ Hz} \to 45\text{ Hz}$ low-frequency triangle wave over $250\text{ ms}$.
- **Perception:** Massive monolithic stone blocks grinding along ancient subterranean tracks.

### 2.16 Checkpoint Activation (`playCheckpoint`)
- **Synthesis:** Three-tone harmonic sanctuary chime ($440\text{ Hz}, 554.37\text{ Hz}, 659.25\text{ Hz}$ — A major triad) over $220\text{ ms}$.
- **Perception:** Spiritual relief and reassuring progress permanence.

### 2.17 Exit Threshold Activation (`playExitArrival`)
- **Synthesis:** Pure two-tone harmonic resonance ($523.25\text{ Hz}, 659.25\text{ Hz}$ — C5, E5) over $240\text{ ms}$.
- **Perception:** Dimensional gateway illuminating in response to character presence.

### 2.18 Death Disintegration & Respawn
- **Death (`playDeath`):** $190\text{ Hz} \to 45\text{ Hz}$ concussive sawtooth drop over $260\text{ ms}$ paired with high-frequency shard crackle.
- **Respawn (`playRespawn`):** $80\text{ Hz} \to 320\text{ Hz}$ reverse-envelope harmonic swell over $240\text{ ms}$ signaling bodily re-materialization.

### 2.19 Level Completion (`playWin`)
- **Synthesis:** Four-voice ascending major arpeggio ($523.25\text{ Hz}, 659.25\text{ Hz}, 783.99\text{ Hz}, 1046.5\text{ Hz}$ — C5, E5, G5, C6) with soft bell decay over $400\text{ ms}$.
- **Perception:** Exhilarating cognitive victory and dual-world harmony.

---

## 3. Surprise Thriller Audio Suite

| Surprise Sound Event | Technical Synthesis Recipe | Cinematic Gameplay Context |
| :--- | :--- | :--- |
| **Dramatic Impact Sting** (`playSurpriseImpact`) | Tritone brassy sawtooth cluster ($82.41\text{ Hz}, 116.54\text{ Hz}, 164.81\text{ Hz}$) dropping over $320\text{ ms}$ | Sudden ambush, hidden trap trigger, unpredicted hazard |
| **Mechanical Warning** (`playMechanicalWarning`) | Staccato dual-tone alert klaxon ($740\text{ Hz} \to 580\text{ Hz}$, $80\text{ ms}$ pulses) | Blast door locking, bomb entering final second |
| **Environmental Transformation** (`playEnvironmentalTransformation`) | Low-frequency seismic triangle wave ($45\text{ Hz} \to 95\text{ Hz} \to 30\text{ Hz}$) over $700\text{ ms}$ | Major room layout shifts, massive wall repositioning |
| **Portal Distortion** (`playPortalDistortion`) | $800\text{ Hz} \to 90\text{ Hz}$ inverted phase sawtooth warp over $350\text{ ms}$ | Corrupted portal interaction, void rift instability |
| **Hidden Mechanism** (`playHiddenMechanism`) | Dual-frequency triangle ratchet click ($480\text{ Hz} \to 720\text{ Hz}$) over $100\text{ ms}$ | Hidden passage unlatched, secret switch engaged |
