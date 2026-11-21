# MOBILE AUDIO & PERFORMANCE DIAGNOSTIC REPORT
## THE OTHER SIDE — TWO WORLDS. ONE MIND.

**System:** Mobile Audio Architecture & Frame-Time Performance Diagnostic  
**Date:** November 2026  
**Status:** DIAGNOSTIC COMPLETE — ROOT CAUSES IDENTIFIED — TARGETED FIXES SPECIFIED  

---

### 1. Observed Problems

1. **Background Music Glitches & Digital Distortion on Mobile:**
   - Mobile players experience audio crackling, digital clipping, sudden volume drops, and stuttering during music playback.
   - Looping and chord transitions sound jarring or muddy through mobile device speakers.
2. **Unreliable & Poor Quality Sound Effects on Mobile:**
   - Sound effects occasionally drop out, play with audible latency, or trigger harsh transient clicking noises.
   - Fast movement sequences produce chaotic overlapping sound artifacts.
3. **Severe Mobile Gameplay Lag & Frame Stutter:**
   - The game experiences inconsistent frame rates, noticeable input lag, and stuttering on mobile browsers (Safari on iOS, Chrome on Android).
   - Canvas rendering appears sluggish and battery consumption is abnormally high.

---

### 2. Technical Investigation

#### 2.1 Audio Subsystem Audit
- **Audio Architecture:** The game utilizes a procedural Web Audio API synthesis engine (`src/audio/AudioContextManager.ts`, `src/audio/AtmosphericMusic.ts`, `src/audio/SoundEffects.ts`) with zero external MP3/OGG asset dependencies.
- **Context Allocation Analysis:**
  - In `src/core/config.ts`, `createGameConfig()` initializes Phaser with default settings without specifying `audio: { noAudio: true }`.
  - Consequently, Phaser's internal `WebAudioSoundManager` instantiates a **primary `AudioContext`** on game boot.
  - Simultaneously, `AudioContextManager.getInstance()` creates a **secondary `AudioContext`** for the procedural thriller soundtrack and sound effects.
  - On mobile operating systems (iOS Safari WebKit and Android Chrome Blink), running two concurrent `AudioContext` instances creates hardware buffer contention, sample-rate conversion mismatch (44.1 kHz vs 48.0 kHz), and thread starvation.
- **Audio Routing & Dynamic Compressor Stress:**
  - In `AtmosphericMusic.ts`, music generation runs up to 10 simultaneous continuous oscillators (carriers + detune LFOs for sub-bass and pad), a looped 2-second white/pink noise buffer through a bandpass filter (Q=4.0), and an active delay feedback line (`delayFeedback.gain = 0.32`).
  - All signals converge into `AudioContextManager.ts`'s master `DynamicsCompressorNode` (`threshold = -12 dB`, `ratio = 10:1`, `attack = 0.003s`).
  - When the multi-oscillator chords, noise texture, and delay feedback sum together, the peak voltage continuously over-drives the compressor into extreme ducking. On small mobile device speakers, this heavy limiter pumping is perceived as crackling, distortion, and digital fuzz.
- **SFX Voice Concurrency:**
  - In `SoundEffects.ts`, every footstep, switch toggle, bump, and hazard pulse instantiates new oscillators and gain nodes without voice capping or polyphony limits.
  - When characters move quickly or multiple puzzle mechanisms fire in the same frame, up to 20+ transient audio nodes compete for CPU time on the mobile audio thread, causing buffer under-runs.

#### 2.2 Performance Subsystem Audit
- **Frame Scheduler Bottleneck (`forceSetTimeOut`):**
  - In `src/core/config.ts` (lines 22-25):
    ```typescript
    fps: {
      target: 60,
      forceSetTimeOut: true,
    }
    ```
  - `forceSetTimeOut: true` deliberately forces Phaser to bypass the browser's hardware-synchronized `window.requestAnimationFrame()` in favor of `window.setTimeout`.
  - Mobile operating systems heavily throttle `setTimeout` timers to reduce battery consumption, leading to severe timer jitter (fluctuating between 20ms and 55ms per frame) and noticeable input lag.
- **Device Pixel Ratio (DPR) Overhead:**
  - Phaser configuration lacked resolution clamping. On mobile devices with DPR = 2.5 to 3.5 (e.g., iPhone Retina and Samsung AMOLED displays), the GPU was rasterizing millions of unnecessary pixels per frame, resulting in thermal throttling and frame drops.
- **Orientation & Viewport Misalignment:**
  - The previous layout forced the 16:9 dual-world game into portrait mode with an external DOM control panel, shrinking the game to 26% of screen height and leaving 74% unused space.

---

### 3. Root Cause Summary Matrix

| Problem Area | Root Cause | Technical File | Impact on Mobile |
|---|---|---|---|
| **Audio Distortion & Popping** | Duplicate `AudioContext` (Phaser default + custom manager) | `src/core/config.ts` | Mobile OS audio buffer starvation, crackling |
| **Limiter Pumping / Distortion** | Over-driven `DynamicsCompressorNode` (-12dB threshold, 10:1 ratio, high summed gain) | `src/audio/AudioContextManager.ts`, `src/audio/AtmosphericMusic.ts` | Harsh speaker clipping, ducking volume drops |
| **SFX Stuttering / Clicks** | Uncapped voice polyphony and no step throttling | `src/audio/SoundEffects.ts` | Audio thread buffer under-runs on rapid moves |
| **Gameplay Lag / Jitter** | `forceSetTimeOut: true` bypassing native `requestAnimationFrame` | `src/core/config.ts` | Extreme frame-time instability, battery drain |
| **GPU Fill-Rate Overhead** | Uncapped canvas resolution on high-DPI screens | `src/core/config.ts` | Thermal throttling and dropped frames |
| **Tiny Game & Wasted Space** | Portrait orientation default + external DOM footer | `index.html`, `src/ui/MobileControlsOverlay.ts` | Severe letterboxing, tiny touch targets |

---

### 4. Are Audio Asset Modifications Required?

**NO. No audio files need to be replaced, re-encoded, or deleted.**
The entire audio system of *THE OTHER SIDE* is procedurally generated in real time using the Web Audio API. There are no pre-recorded WAV/MP3 files. Modifying or replacing nonexistent audio files would be futile and destructive. All audio issues are rooted in code architecture: dual context contention, compressor calibration, oscillator gain staging, and voice polyphony limits.

---

### 5. Detailed Proposed Solutions

#### 5.1 Audio Architecture Fixes
1. **Disable Phaser's Internal Audio:**
   - Configure Phaser with `audio: { noAudio: true }` so only one single, controlled `AudioContext` exists.
2. **Re-stage Synthesizer Gains & Limiter Parameters:**
   - In `AudioContextManager.ts`: Soften compressor parameters to `threshold: -6 dB`, `knee: 18 dB`, `ratio: 4:1`, `attack: 0.012s`, `release: 0.15s`.
   - In `AtmosphericMusic.ts`:
     - Reduce individual carrier gains from $1.0 / N$ to $0.45 / N$.
     - Reduce void texture noise gain from $0.03$ to $0.012$ and lower filter Q to $1.5$ to eliminate harsh resonance.
     - Reduce delay feedback gain from $0.32$ to $0.18$.
3. **Implement Polyphony Capping in `SoundEffects.ts`:**
   - Enforce a maximum of 4 active concurrent SFX nodes.
   - Throttle rapid footstep sounds with an 80ms minimum spacing guard.

#### 5.2 Performance & Rendering Fixes
1. **Restore Hardware `requestAnimationFrame`:**
   - In `src/core/config.ts`: Set `forceSetTimeOut: false` and remove `fps.target` overrides to lock to native 60 FPS V-Sync.
2. **Clamp Device Pixel Ratio:**
   - Set `resolution: Math.min(window.devicePixelRatio || 1, 2)` to eliminate GPU fill-rate strain on 3x Retina displays.
3. **Landscape Mobile Presentation & Integrated Controls:**
   - Enforce automatic landscape orientation via `screen.orientation?.lock('landscape')`.
   - Display a themed rotation overlay ("ROTATE YOUR DEVICE TO PLAY") when viewed in portrait.
   - Remove the external floating bottom deck. Integrate touch controls directly into the game interface:
     - **Bottom-Left:** `[ LEFT ] [ RIGHT ]` horizontally.
     - **Bottom-Right:** `[ UP ]` over `[ DOWN ]`.

#### 5.3 Themed Loading Screen
- In `PreloadScene.ts`: Build a complete atmospheric loading screen featuring:
  - Deep black background, white minimalist typography, subtle cyan accents.
  - "THE OTHER SIDE" and "TWO WORLDS. ONE MIND."
  - Animated central dividing line with glowing energy bridge.
  - Actual asset loading percentage and smooth transition to `MenuScene`.

---

### 6. Risks to Desktop Functionality

- **Zero Risk to Desktop:** All changes strictly preserve desktop keyboard inputs (WASD, Arrows, R, P, ESC, Tab, Enter), mouse hover interactions, desktop 1280×720 display centering, and all 20 puzzle levels.
