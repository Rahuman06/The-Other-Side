# OBJECT VISUAL IDENTITY REPORT

**Project:** THE OTHER SIDE  
**Date:** November 13, 2026  
**Status:** COMPLETE & VERIFIED  

---

## 1. Overview & Problem Resolution

Prior to Phase 2, game objects were depicted as minimal placeholder rectangles, simple circles, or static line crosses. Players frequently could not distinguish between a locked door, a pressure plate, a saw blade, or an exit.

In Phase 2, every object was completely redesigned into an architecturally coherent, animated entity with distinctive silhouette, material cues, and dynamic states.

---

## 2. Exhaustive Object Redesign Matrix

| Object | Visual Identity & Silhouette | Dynamic State Animations | Functional Accents |
| :--- | :--- | :--- | :--- |
| **Saw Blades** (`MovingHazard`) | Heavy steel circular blade disk with 8 aggressive curved shark-fin cutting teeth and 4-bolt center mechanical hub. | Continuously spins at 480°/sec (8.37 rad/s) driven by `sawRotationAngle`. Outer motion blur rim halo. | High-contrast perimeter; friction sparks upon contact. |
| **Laser Emitters** (`LaserEmitter`) | Heavy cylindrical projector mount with protruding directional barrel nozzle and glowing core lens. | Directional barrel aligns with firing vector; active core glows brightly with status LED. | Electric cyan (`0x00e5ff`) nozzle beam alignment. |
| **Laser Beams** (`LaserSim`) | 3-layer continuous energy beam: outer atmospheric ionization sheath (6px, alpha 0.28), mid cyan sheath (3px, alpha 0.75), inner white filament (1.5px, alpha 1.0). | Real-time electric micro-jitter (sub-pixel rapid oscillation) and terminal spark splatter bursts. | Pure white hot core, cyan ionization aura. |
| **Laser Receivers** (`LaserReceiver`) | Heavy square receptor dish with target bullseye concentric rings. | When energized: bullseye glows intensely with radiant cyan halo and white center focal spot. | Concentric target rings; active aura (`0x00e5ff`). |
| **Laser Mirrors** (`LaserMirror`) | Angled optical prism glass plate backed by heavy frame and mounted on a precision swivel pivot. | Specular glint highlight along reflector edge; angled precisely at 45° (`/` or `\`). | Dielectric cyan reflective coat with specular core. |
| **Portals (Standard)** (`Portal`) | Monolithic cosmic rune frame with circular conduit rim. | Dual counter-rotating vortex swirls: outer clockwise spiral, inner counter-clockwise event horizon. Inward suction particles. | Deep event horizon singularity, cyan core spiral. |
| **Portals (Corrupted)** (`Portal`) | Fractured, erratic geometric ring with jagged exterior thorns and unstable singularity. | Jagged thorns pulse erratically; chaotic inward suction of dark void motes. | Unstable magenta void accent (`0xff0055`). |
| **Bombs** (`Bomb`) | Heavy spherical cast-iron shell with metallic rivets, cylindrical neck, and burning cord fuse. | Sputtering fuse spark particles; animated pulsing danger zone outline when armed; bold timer numerals. | Thermal warning glow (`#FF3333`) during countdown; fiery explosion shockwave. |
| **Destructible Walls** (`DestructibleWall`) | Reinforced masonry slab with visible mortar line and deep stress fracture fissures. | Visual fissures communicate structural weakness; shatters into concrete rubble when detonated. | High-contrast fracture lines. |
| **Exits (Sanctuary)** (`Exit`) | Architectural monolithic gateway portal with rounded bevel and inner threshold. | Dual concentric ground beacon rings pulsing outward with smooth harmonic sine waves; central beacon core. | Welcoming cyan beacon pulse (`0x00e5ff`). |
| **Pressure Plates** (`PressurePlate`) | 3D beveled mechanical platform with metallic border and center contact diamond. | **Unpressed:** Raised 4px with recessed floor trench. **Pressed:** Sunken flush into floor with lit cyan contact pads. | Cyan status indicator when depressed (`0x00e5ff`). |
| **Switches** (`Switch`) | Industrial toggle console with heavy faceplate, mounting screws, and toggle lever. | **Off:** Lever down-left with dim LED. **On:** Lever thrown up-right with glowing cyan LED and illuminated knob. | Illuminated status LED (`0x00e5ff`). |
| **Doors** (`Door`) | Heavy segmented blast doors with interlocking chevron teeth and security locking bars. | **Closed:** Solid sealed blast barrier with central lock clamp. **Open:** Retracted into frame jambs with clear doorway passage. | Retracted clearance indicator. |
| **Collapsing Floors** (`CollapsingFloor`) | Paving stone slabs with varying stress patterns. | **Intact:** Hairline corner notches. **Cracked:** Deep jagged fractures with falling pebble debris. **Collapsed:** Gaping abyss pit with ragged drop edges. | Warning fissures and crumbling debris. |
| **Time Locks** (`TimeLock`) | Astronomical chronometer with 8-tooth gear bezel and central clock pivot. | **Active:** Translucent temporal freeze dome covers radius; sweeping luminous second hand rotates continuously. | Temporal cyan freeze dome (`0x00e5ff`). |
| **Movable Blocks** (`MovableBlock`) | Heavy magnetized crate with reinforced corner brackets and central polarity glyph. | Glides across floor upon push/pull; magnetic glyph indicates attraction/repulsion compatibility. | Cyan/magenta polarity core emblem. |
| **Magnetic Fields** (`MagneticField`) | High-intensity magnetic emitter dish. | Concentric magnetic wave arcs pulsing along field axis (attract: cyan waves pulling inward; repel: amber waves pushing outward). | Directional polarity waves (`0x00e5ff` / `0xff9900`). |
| **Checkpoints** (`CheckpointPair`) | Monolithic runic obelisk pillar with 4 cardinal ground tick marks. | **Inactive:** Dormant stone circle. **Visited:** Filled energy core. **Activated:** Paired synchronized luminous beacon rings with spark burst. | Radiant cyan beacon core (`0x00e5ff`). |
