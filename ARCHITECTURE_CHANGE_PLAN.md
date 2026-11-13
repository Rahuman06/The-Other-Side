# ARCHITECTURE CHANGE PLAN — THE OTHER SIDE
**Document Version**: 1.0.0  
**Scope**: Non-Destructive Architectural Extensions for Rendering, Audio, Undo, and Event Systems  
**Core Directive**: Upgrade the existing engine professionally; do not rebuild working foundations.  

---

## 1. Architectural Philosophy & Isolation Principles

All proposed extensions strictly observe the **Separation of Presentation and Logic**:

```
+-----------------------------------------------------------------------------------+
|                            PRESENTATION LAYER                                     |
|  [GameScene.ts] <---> [VisualEffectsManager] <---> [CharacterAnimator]           |
|         |                       |                         |                       |
|         v                       v                         v                       |
|  [AtmosphericMusic]      [SoundEffects]           [HUD & Undo UI]                 |
+-----------------------------------------------------------------------------------+
                                  ^  (Subscribes to events / Reads snapshots)
                                  |
                                  v  (Dispatches events / Evaluates transactions)
+-----------------------------------------------------------------------------------+
|                              CORE ENGINE LAYER                                    |
|  [TurnEngine.ts] <---> [MovementEngine.ts] <---> [CollisionEngine.ts]             |
|         |                                                 |                       |
|         v                                                 v                       |
|  [UndoEngine.ts] <---> [CheckpointSnapshot.ts] <---> [PuzzleManager.ts]           |
+-----------------------------------------------------------------------------------+
```

- **Invariant 1**: The Core Engine Layer (`TurnEngine`, `MovementEngine`, `CollisionEngine`, `PuzzleManager`) operates with zero dependency on Phaser or DOM rendering APIs. It must remain testable in pure Node.js environments.
- **Invariant 2**: The Presentation Layer (`GameScene`, `VisualEffectsManager`, `CharacterAnimator`) is strictly downstream. It receives transactions and snapshots from the Core Engine Layer.
- **Invariant 3**: Frame updates (`update(time, delta)`) are read-only with respect to game state. They drive visual rotation angles, particle lifecycles, and audio LFOs. They **never mutate grid coordinates or trigger turns**.

---

## 2. Component Extensions Blueprint

### 2.1 The `GameScene` Update Lifecycle Hook
- **Current State**: `GameScene` lacks an `update()` method.
- **Modification**: Add `public update(time: number, delta: number): void`:
  ```typescript
  public update(time: number, delta: number): void {
    if (this.isPaused || !this.session) return;
    
    // 1. Advance continuous VFX (saw rotation, laser jitter, portal vortex, exit pulses)
    this.vfxManager.update(time, delta);
    
    // 2. Advance character idle float and eye direction
    this.characterAnimator.update(time, delta);
    
    // 3. Advance ambient particles (void dust motes)
    this.vfxManager.renderAmbientMotes(delta);
  }
  ```

### 2.2 Visual Effects Architecture (`VisualEffectsManager.ts`)
- **Location**: `src/rendering/VisualEffectsManager.ts`.
- **Responsibilities**:
  - Manages `sawRotationAngle` (advancing by `delta * 0.008`).
  - Manages `portalVortexAngle` (inner and outer counter-rotating angles).
  - Manages `exitPulsePhase` (sine wave breathing for radiant threshold).
  - Manages `laserJitter` (high-frequency electric core displacement).
  - Manages `bombFuseEmber` particles and danger grid pulse.
  - Manages camera screen shake triggers (`shake(intensity, duration)`).
- **Decoupling**: Accepts entity references from `PuzzleManager`, reading positions without mutating them.

### 2.3 Character Animation Architecture (`CharacterAnimator.ts`)
- **Location**: `src/rendering/CharacterAnimator.ts`.
- **Responsibilities**:
  - Encapsulates squash-and-stretch tweens:
    - Anticipation compression (20ms).
    - Transit elongation (70ms).
    - Settle bounce (30ms).
  - Wall-bump recoil impulse: 4px displacement with `Back.easeOut` rebound when `onMoveBlocked` fires.
  - Ambient idle float: $y \pm 1.5\text{px}$ sine wave oscillation during input idle.
  - Death fragmentation: Spawns 12 geometric shards on `onDeath` and animates re-convergence on `onRespawn`.

### 2.4 Audio Systems Architecture (`AtmosphericMusic.ts` & `SoundEffects.ts`)
- **`AtmosphericMusic.ts`**:
  - Generative Web Audio API drone using 4 polyphonic oscillator nodes and biquad resonant filters.
  - Generates sub-bass tension drones, evolving minor 9th pads, binaural heartbeat pulses, and atmospheric void noise.
  - Adapts harmonic root to current chapter (D minor, G minor, F minor, A minor, D master).
  - Implements dynamic ducking during bomb detonations and death events.
- **`SoundEffects.ts` Extension**:
  - Add synthesized recipes for:
    - `portalTeleport`: Resonant frequency-swept warp whoosh.
    - `laserHum`: Continuous plasma buzz and impact sizzle.
    - `sawWhir`: Periodic sawtooth grinding purr.
    - `bombTick`: Crisp accelerating clock transient.
    - `bombDetonation`: Sub-bass concussive explosion rumble.
    - `timeLock`: Ethereal crystalline time-freeze chime.
    - `magneticPull`: Deep electromagnetic pulse and metallic slide scrape.
    - `collapsingFloor`: Brittle fracture crackle and bottomless fall.
    - `undo`: High-speed reverse tape rewind chime.

### 2.5 Transactional Undo Engine (`UndoEngine.ts`)
- **Location**: `src/engine/UndoEngine.ts`.
- **Data Structure**:
  ```typescript
  export class UndoEngine {
    private history: CheckpointSnapshotData[] = [];
    private readonly maxDepth: number = 50;

    public push(snapshot: CheckpointSnapshotData): void {
      if (this.history.length >= this.maxDepth) {
        this.history.shift();
      }
      this.history.push(snapshot);
    }

    public pop(): CheckpointSnapshotData | null {
      return this.history.pop() ?? null;
    }

    public clear(): void {
      this.history = [];
    }

    public canUndo(): boolean {
      return this.history.length > 0;
    }

    public depth(): number {
      return this.history.length;
    }
  }
  ```
- **TurnEngine Integration Flow**:
  1. In `TurnEngine.handleInput()`: Before mutating character positions or ticking hazards, call `UndoEngine.push(CheckpointSnapshot.capture(...))`.
  2. In `TurnEngine.undo()`:
     - Pop `snapshot = UndoEngine.pop()`.
     - Call `CheckpointSnapshot.restore(snapshot, this.player, this.shadow, this.puzzleManager)`.
     - Decrement turn move count.
     - Dispatch `onUndo` event to presentation layer for reverse animation and audio rewind sound.

### 2.6 Extensible Event System (`GameEvents.ts`)
- Expands `TurnEvents` to support reactive presentation hooks:
  - `onUndo: (snapshot: CheckpointSnapshotData) => void`
  - `onHazardTriggered: (hazardId: string, world: 'real' | 'shadow') => void`
  - `onBombDetonated: (position: GridPoint, radius: number) => void`
  - `onPortalWarp: (from: GridPoint, to: GridPoint, world: 'real' | 'shadow') => void`
  - `onTimeLockActivated: (duration: number) => void`
  - `onBlockMoved: (from: GridPoint, to: GridPoint) => void`
- Allows any future mechanic to dispatch decoupled events that UI, VFX, and audio can listen to without hardcoded cross-dependencies.
