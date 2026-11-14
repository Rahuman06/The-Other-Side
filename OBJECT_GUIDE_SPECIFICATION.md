# OBJECT GUIDE SPECIFICATION

**Project:** THE OTHER SIDE  
**Phase:** 5 — Premium Game UI/UX, Controls and Player Experience  
**Date:** 2026-11-13  
**Status:** COMPLETE & VERIFIED

---

## 1. System Overview

The **Object Guide Modal** (`src/ui/ObjectGuideModal.ts`) is an encyclopedic in-game reference system designed to eliminate visual ambiguity and educate players on the exact behavior, mechanics, dangers, and cross-world interactions of every object in **THE OTHER SIDE**.

Players can access the guide at any time during gameplay by pressing `[ G ]` or selecting `OBJECT GUIDE [ G ]` from the Pause menu.

---

## 2. Guide Architecture & Pagination

- **Modal Frame**: 820px width × 540px height centered container at `depth 200` with 80% opacity dark backdrop.
- **Header**: Features category filter tabs: `ALL (14)`, `HAZARDS (3)`, `MECHANISMS (4)`, `DIMENSIONAL (4)`, `ENVIRONMENT (3)`.
- **Card Grid**: 4 objects per page rendered in a 2x2 responsive layout.
- **Pagination Navigation**: Previous (`◀ PREV`) and Next (`NEXT ▶`) controls with live page indicator (`PAGE 1 / 4`).
- **Card Anatomy**:
  1. **Procedural Vector Icon (64x64px)**: Generated via Phaser Graphics rendering matching the exact visual style of in-game entities.
  2. **Object Title & Category Badge**: High-contrast typography with colored classification tag.
  3. **Function Definition**: Concise explanation of what the object does.
  4. **Activation Trigger**: Exact conditions required to operate or trigger the object.
  5. **Danger & Failure**: Clear consequences of entering or interacting improperly.
  6. **Two-World Note**: How the object bridges or affects both worlds simultaneously.

---

## 3. Complete 14-Object Catalog

### 3.1 Hazards

#### 1. Saw Blade
- **Category:** `HAZARDS`
- **Icon:** Rotating 8-toothed mechanical circular blade with central bronze hub.
- **Function:** Heavy industrial cutting blade that patrols back and forth along predetermined linear tracks.
- **Activation:** Active by default; advances along its patrol line each movement cycle.
- **Danger:** Lethal on contact. Disintegrates the character upon collision and forces checkpoint restore.
- **Cross-World:** Operates in its host world, but mirrors patrol timing across both worlds.

#### 2. Laser & Emitter
- **Category:** `HAZARDS`
- **Icon:** Solid steel emitter block firing a coherent cyan energy beam with electric ionization aura.
- **Function:** High-energy directional beam that projects across empty floor tiles until hitting an obstacle.
- **Activation:** Active by default or toggled on/off via linked floor switches and receivers.
- **Danger:** Lethal on contact. Traversing an active beam results in vaporization.
- **Cross-World:** Can be aimed into dimensional portals to emerge into the parallel world.

#### 3. Bomb & Countdown
- **Category:** `HAZARDS`
- **Icon:** Heavy cast-iron explosive charge with fuse spark and visible numeric countdown label.
- **Function:** Area-of-effect explosive ordnance that ticks down with each player movement step.
- **Activation:** Armed on level initialization or triggered upon first being stepped upon.
- **Danger:** Detonates when timer reaches 0, destroying cracked masonry and killing entities in blast radius.
- **Cross-World:** Detonation shockwave penetrates dimensional barriers, breaking cracked blocks in both worlds.

---

### 3.2 Dimensional Mechanisms

#### 4. Dimensional Portal
- **Category:** `DIMENSIONAL`
- **Icon:** Hypnotic swirling dimensional singularity with concentric pulsing event horizon rings.
- **Function:** Space-folding rift that instantly teleports any character stepping onto its vortex.
- **Activation:** Step directly into the portal tile.
- **Danger:** Corrupted portals possess erratic exit coordinates or thorns; observe exit terminus carefully.
- **Cross-World:** Transfers characters or redirected laser beams seamlessly between parallel worlds.

#### 5. Reflective Mirror
- **Category:** `DIMENSIONAL`
- **Icon:** 45-degree angled optical prism mounted on a steel pivot block.
- **Function:** Specular reflective barrier that turns oncoming laser beams at exact 90-degree angles.
- **Activation:** Rotate orientation by stepping onto adjacent linked switch plates.
- **Danger:** Walking into the glass face is blocked; improperly reflected beams can seal exit corridors.
- **Cross-World:** Redirects cross-dimensional laser beams to strike remote receivers in the opposite world.

#### 6. Time Lock Field
- **Category:** `DIMENSIONAL`
- **Icon:** Diamond chronograph node surrounded by an amber stasis containment lattice.
- **Function:** Chrono-dilation barrier that freezes one character in place for a set number of turns.
- **Activation:** Stepping inside the field activates temporal paralysis.
- **Danger:** Inability to dodge oncoming hazards while trapped in stasis.
- **Cross-World:** Allows one character to remain stationary while the parallel character navigates hazards.

#### 7. Magnetic Polarizer
- **Category:** `DIMENSIONAL`
- **Icon:** Bipolar electromagnetic coil with visible field lines and polarity indicators.
- **Function:** Dynamic attractor/repulsor that pulls or pushes metallic puzzle blocks along track lines.
- **Activation:** Energized via wall switches or stepping within adjacent induction rings.
- **Danger:** Can pin character against walls or crush them between moving blocks.
- **Cross-World:** Changing polarity in one world inverts magnetic flux lines in the counterpart world.

---

### 3.3 Mechanisms

#### 8. Switch & Lever
- **Category:** `MECHANISMS`
- **Icon:** Heavy industrial toggle lever with illuminated cyan state conduit.
- **Function:** Binary state controller that toggles linked puzzle entities (doors, lasers, walls).
- **Activation:** Step directly onto the switch tile to toggle between ON and OFF states.
- **Danger:** None directly, but may inadvertently open hazard emitters or close escape routes.
- **Cross-World:** Switches frequently link to mechanisms located in the parallel world.

#### 9. Pressure Plate
- **Category:** `MECHANISMS`
- **Icon:** Low-profile hydraulic weight sensor plate with perimeter bevel.
- **Function:** Continuous contact sensor that maintains activation only while weight rests upon it.
- **Activation:** Stand on the plate with character or slide a heavy crate/block over it.
- **Danger:** Stepping off immediately deactivates the mechanism (e.g., closes linked blast doors).
- **Cross-World:** Stepping on a plate in the Real World often holds open a passage in the Shadow World.

#### 10. Locking Door
- **Category:** `MECHANISMS`
- **Icon:** Thick segmented steel blast door with motorized locking bolt bars.
- **Function:** Heavy physical barrier that blocks traversal until its linked triggers are satisfied.
- **Activation:** Fully open when all connected switches or plates are in active states.
- **Danger:** Traversal blocked while closed; closing doors push or trap characters.
- **Cross-World:** Often paired: opening the door in one world requires actions in the other.

#### 11. Moving Wall
- **Category:** `MECHANISMS`
- **Icon:** Heavy reinforced masonry pylon set into recessed floor track grooves.
- **Function:** Motorized architectural barrier that shifts position in response to puzzle events.
- **Activation:** Moves along linear tracks when activated by remote switches or timer pulses.
- **Danger:** Can crush characters against static boundaries if standing in its path.
- **Cross-World:** Movement can be synchronized or inverted relative to its counterpart.

---

### 3.4 Environment & Objectives

#### 12. Cracked Floor
- **Category:** `ENVIRONMENT`
- **Icon:** Weathered flagstone tile with branching fissures and crumbling perimeter.
- **Function:** Fragile structural floor section that degrades under impact or weight.
- **Activation:** Stepped upon by an actor, or damaged by an adjacent bomb detonation.
- **Danger:** Collapses permanently into a lethal void pit after being stepped upon, preventing return.
- **Cross-World:** Requires precise planning to ensure both characters can reach their exits without stranding.

#### 13. Checkpoint Node
- **Category:** `ENVIRONMENT`
- **Icon:** Circular floor glyph with glowing cyan energy emitter and harmonic pulse rings.
- **Function:** Dimensional resonance anchor that saves player state for safe respawn upon death.
- **Activation:** Step onto the node. Emits an instantaneous spark burst and harmonic audio chime.
- **Danger:** None. Protects player from restarting the entire level from scratch.
- **Cross-World:** Both characters restore to their respective checkpoint coordinates upon hazard death.

#### 14. Simultaneous Exit Door
- **Category:** `ENVIRONMENT`
- **Icon:** High-contrast architectural portal with bold centered **`EXIT`** typography and cyan aura.
- **Function:** Dimensional egress portal required to complete the level.
- **Activation:** **BOTH** the Real World player and Shadow World shadow must occupy their respective exits on the exact same turn.
- **Danger:** Arriving at an exit alone does not complete the level; leaving the exit de-energizes it.
- **Cross-World:** The ultimate test of synchronization across both realities.

---

## 4. Verification Evidence

- Modal verified via automated Playwright test:
  - Page 1: [phase5-object-guide.png](screenshots/phase5-object-guide.png)
  - Page 2: [phase5-object-guide-page2.png](screenshots/phase5-object-guide-page2.png)
