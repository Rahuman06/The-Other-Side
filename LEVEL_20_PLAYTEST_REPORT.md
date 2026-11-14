# LEVEL 20: PLAYTEST & PLAYER EXPERIENCE REPORT

**Chamber:** Chamber 20 (The Final Paradox)  
**Playtest Version:** 1.0.0 (Master Campaign Finale)  
**Methodology:** Automated E2E Browser Testing (Playwright / Chromium / WebKit) + Manual Visual Inspection  

---

## 1. Cognitive Load & Puzzle Comprehension

### Discovery Phase
When first entering Chamber 20, players observe the familiar dual-world symmetry: Real World on the left, Shadow World on the right. Both exit threshold doors are immediately visible in the center-outer boundary, clearly locked by dimensional gates.
- North of Real Start lies the glowing glyph Alpha at `(1, 1)`.
- South of Shadow Start lies the glowing glyph Beta at `(6, 4)`.

The central dividing partition immediately communicates that normal horizontal passage is impossible. This prompts players to investigate the two distinct colored switches.

### The Inversion Epiphany
Upon stepping on Alpha or Beta:
- A deep resonant acoustic pulse sounds (`sfx.play('inversion')`).
- A radial light wave expands from the world center, accompanied by an intentional 250ms camera shake.
- The environment smoothly transforms: the ceiling flips to become a lower traverse platform.
- The player immediately realizes: *"The ceiling terrace is actually the bridge to the other side!"*

---

## 2. Failure Feedback & Deterministic Safety

1. **Walking into Closed Gates:**
   - Attempting to step into closed threshold doors or locked conduits causes a standard, gentle bounce with an audible thud (`sfx.play('wall_hit')`).
   - Characters are never unfairly destroyed; the movement is simply blocked cleanly.

2. **Void Abyss Collapse:**
   - When Alpha is activated, Beta's tile in the opposite world visibly crumbles with stone debris particles and audio cue (`sfx.play('crumble')`).
   - If a player later tries to walk onto the collapsed tile, the VOID collision rule prevents movement onto empty space.

3. **No Undo / No Redo Integrity:**
   - In accordance with project core mandates, there is strictly **no Undo or Redo**. Every move is a committed logical decision.
   - Players can instantly restart the chamber via the [R] key or Pause Menu, resetting the chamber to pristine initial state in under 16ms.

---

## 3. Visual & Audio Assets

| State / Event | Visual Signifier | Sound FX Cue |
|:---|:---|:---|
| **Normal State** | Dual monochromatic grids, pristine stone tiles | Ambient low drone |
| **Alpha Trigger** | Glowing white glyph with pulsing inner square | Resonant chime |
| **Beta Trigger** | Inverted black glyph with white border | Resonant chime |
| **World Inversion** | 180° rotation, radial shockwave, spark burst | `inversion` low-frequency sweep |
| **Tile Collapse** | Cracking floor, falling stone debris | `crumble` gravel impact |
| **Exit Unsealed** | Threshold door lines dissolve, exit glyph flares | `door_open` harmonic release |
| **Dual Exit Victory** | Synchronous character entry, radiant convergence flash | `checkpoint` + Ending cinematic transition |
