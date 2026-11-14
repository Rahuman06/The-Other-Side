import type Phaser from 'phaser';
import { PALETTE } from '../core/constants';

export interface GuideObjectEntry {
  readonly id: string;
  readonly name: string;
  readonly category: 'CHARACTERS' | 'HAZARDS' | 'MECHANISMS' | 'DIMENSIONAL' | 'ENVIRONMENT';
  readonly description: string;
  readonly howItWorks: string;
  readonly effect: string;
  readonly dangerOrLimitation: string;
  readonly worldAvailability: 'REAL WORLD' | 'SHADOW WORLD' | 'BOTH WORLDS';
  readonly crossWorldRelationship: string;
  readonly renderExactAsset: (
    g: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    size: number,
    isReal: boolean,
    stateVariant?: number
  ) => void;
  readonly hasMultipleStates?: boolean;
}

export const ALL_GUIDE_OBJECTS: readonly GuideObjectEntry[] = [
  {
    id: 'characters',
    name: 'ENTANGLED PROTAGONISTS',
    category: 'CHARACTERS',
    description: 'The twin souls inhabiting the dimensional divide: the Light Walker and the Shadow Walker.',
    howItWorks: 'Directly commanded via directional input. Real World character follows normal inputs; Shadow World character mirrors horizontally.',
    effect: 'Moves one grid tile per step unless blocked by solid barriers, walls, or closed doors.',
    dangerOrLimitation: 'Vulnerable to kinetic saws, laser beams, bomb blasts, and abyss pits. If either character dies, the timeline resets.',
    worldAvailability: 'BOTH WORLDS',
    crossWorldRelationship: 'Both characters move with one unified mind. Wall-buffering one character allows the other to reposition independently.',
    renderExactAsset: (g, x, y, size, isReal) => {
      // Exact Stickman character from CharacterAnimator
      const color = isReal ? PALETTE.real.character : PALETTE.shadow.character;
      const eyeColor = isReal ? 0xffffff : 0x000000;
      const s = size;

      const headRadius = s * 0.16;
      const headY = y - s * 0.22;
      const neckY = headY + headRadius * 0.8;
      const pelvisY = y + s * 0.08;
      const strokeW = Math.max(2, Math.round(s * 0.07));

      // Torso
      g.lineStyle(strokeW, color, 1);
      g.beginPath();
      g.moveTo(x, neckY);
      g.lineTo(x, pelvisY);
      g.strokePath();

      // Standing Legs
      const legLen = s * 0.26;
      g.beginPath();
      g.moveTo(x, pelvisY);
      g.lineTo(x - s * 0.08, pelvisY + legLen);
      g.moveTo(x, pelvisY);
      g.lineTo(x + s * 0.08, pelvisY + legLen);
      g.strokePath();

      // Standing Arms
      const shoulderY = neckY + (pelvisY - neckY) * 0.25;
      const armLen = s * 0.22;
      g.beginPath();
      g.moveTo(x, shoulderY);
      g.lineTo(x - s * 0.10, shoulderY + armLen);
      g.moveTo(x, shoulderY);
      g.lineTo(x + s * 0.10, shoulderY + armLen);
      g.strokePath();

      // Head
      g.fillStyle(color, 1);
      g.fillCircle(x, headY, headRadius);

      // Eye
      const eyeR = Math.max(1.2, headRadius * 0.18);
      g.fillStyle(eyeColor, 1);
      g.fillCircle(x + (isReal ? 2 : -2), headY - headRadius * 0.1, eyeR);
    },
  },
  {
    id: 'exit',
    name: 'EXIT GATEWAY',
    category: 'ENVIRONMENT',
    description: 'Architectural doorway signaling spatial egress to the subsequent dimensional sector.',
    howItWorks: 'Permanently stationed at designated exit coordinates in each world. Activates when occupied.',
    effect: 'Illuminates with vibrant cyan aura. When both exits are occupied simultaneously, triggers level victory.',
    dangerOrLimitation: 'Entering one exit is insufficient; the level will not complete until both characters reach their respective doors.',
    worldAvailability: 'BOTH WORLDS',
    crossWorldRelationship: 'Paired exit targets require precise coordinate synchronization to conclude the trial.',
    hasMultipleStates: true,
    renderExactAsset: (g, x, y, size, isReal, stateVariant) => {
      // Exact Exit from PuzzleObjectRenderer.renderExit
      const s = size * 0.82;
      const isUnlocked = stateVariant !== 1;
      const frameCol = isReal ? PALETTE.real.walls : PALETTE.shadow.walls;
      const doorPanelCol = isReal ? 0x181818 : 0xeeeeee;
      const innerBorderCol = isReal ? 0x333333 : 0xcccccc;

      if (isUnlocked) {
        g.lineStyle(2.5, 0x00e5ff, 0.6);
        g.strokeRoundedRect(x - s / 2 - 2, y - s / 2 - 2, s + 4, s + 4, 6);
      }

      g.fillStyle(doorPanelCol, 1);
      g.fillRoundedRect(x - s / 2, y - s / 2, s, s, 4);

      g.lineStyle(2, frameCol, 0.95);
      g.strokeRoundedRect(x - s / 2, y - s / 2, s, s, 4);

      g.lineStyle(1.5, innerBorderCol, 0.8);
      g.strokeRoundedRect(x - s / 2 + 3, y - s / 2 + 3, s - 6, s - 6, 3);

      g.fillStyle(frameCol, 1);
      g.fillRect(x - s / 2, y + s / 2 - 3, s, 3);
    },
  },
  {
    id: 'switch',
    name: 'INDUSTRIAL RELAY SWITCH',
    category: 'MECHANISMS',
    description: 'Mechanical heavy toggle relay lever that shifts linked doors, emitters, or obstacles.',
    howItWorks: 'Stepping onto the switch tile flips the lever and inverts or toggles its electrical state.',
    effect: 'Opens or closes linked blast gates and power conduits.',
    dangerOrLimitation: 'ACTIVATE_ONLY switches remain triggered once engaged; TOGGLE switches flip on every entry.',
    worldAvailability: 'BOTH WORLDS',
    crossWorldRelationship: 'Most switches transmit control signals across the rift to actuate mechanisms in the opposite world.',
    hasMultipleStates: true,
    renderExactAsset: (g, x, y, size, isReal, stateVariant) => {
      // Exact Switch from PuzzleObjectRenderer.renderSwitches
      const s = size * 0.36;
      const strokeCol = isReal ? PALETTE.real.walls : PALETTE.shadow.walls;
      const accentCol = 0x00e5ff;
      const isActive = stateVariant === 1;

      g.fillStyle(isReal ? 0xdddddd : 0x222222, 1);
      g.fillRoundedRect(x - s, y - s, s * 2, s * 2, 4);
      g.lineStyle(2, strokeCol, 0.95);
      g.strokeRoundedRect(x - s, y - s, s * 2, s * 2, 4);

      const ledColor = isActive ? accentCol : (isReal ? 0x777777 : 0x444444);
      g.fillStyle(ledColor, 1);
      g.fillCircle(x + s * 0.5, y - s * 0.5, 3.5);

      const armLen = s * 0.9;
      const angle = isActive ? -Math.PI / 4 : (Math.PI * 3) / 4;
      const lx = x + Math.cos(angle) * armLen;
      const ly = y + Math.sin(angle) * armLen;

      g.lineStyle(3, strokeCol, 1);
      g.lineBetween(x, y, lx, ly);

      g.fillStyle(isActive ? accentCol : strokeCol, 1);
      g.fillCircle(lx, ly, 4);

      g.fillStyle(strokeCol, 1);
      g.fillCircle(x, y, 3);
    },
  },
  {
    id: 'door',
    name: 'BLAST DOOR',
    category: 'MECHANISMS',
    description: 'Heavy reinforced security bulkhead with interlocking chevron teeth.',
    howItWorks: 'Maintains closed barrier state until electrical activation signal is received from switch or plate.',
    effect: 'Fully impassable while closed. Retracts into side frame jambs when opened.',
    dangerOrLimitation: 'Completely blocks characters, pushable blocks, and laser beams.',
    worldAvailability: 'BOTH WORLDS',
    crossWorldRelationship: 'Often shields key conduits, portals, or rescue cells from early unauthorized entry.',
    hasMultipleStates: true,
    renderExactAsset: (g, x, y, size, isReal, stateVariant) => {
      // Exact Blast Door from PuzzleObjectRenderer.renderDoors
      const s = size * 0.84;
      const strokeCol = isReal ? PALETTE.real.walls : PALETTE.shadow.walls;
      const fillCol = isReal ? 0x222222 : 0xd8d8d8;
      const isOpen = stateVariant === 1;

      if (!isOpen) {
        g.fillStyle(fillCol, 0.98);
        g.fillRoundedRect(x - s / 2, y - s / 2, s, s, 4);
        g.lineStyle(2, strokeCol, 1);
        g.strokeRoundedRect(x - s / 2, y - s / 2, s, s, 4);

        const barH = 6;
        g.fillStyle(isReal ? 0x111111 : 0xffffff, 1);
        g.fillRect(x - s / 2 + 4, y - barH / 2, s - 8, barH);

        g.lineStyle(1.5, isReal ? 0x444444 : 0xbbbbbb, 0.8);
        g.lineBetween(x - s * 0.35, y - s * 0.25, x, y - s * 0.15);
        g.lineBetween(x, y - s * 0.15, x + s * 0.35, y - s * 0.25);
        g.lineBetween(x - s * 0.35, y + s * 0.25, x, y + s * 0.15);
        g.lineBetween(x, y + s * 0.15, x + s * 0.35, y + s * 0.25);

        g.fillStyle(strokeCol, 1);
        g.fillRect(x - 5, y - 7, 10, 14);
      } else {
        g.lineStyle(2, strokeCol, 0.4);
        g.strokeRoundedRect(x - s / 2, y - s / 2, s, s, 4);
        const leafW = 6;
        g.fillStyle(strokeCol, 0.7);
        g.fillRect(x - s / 2, y - s / 2, leafW, s);
        g.fillRect(x + s / 2 - leafW, y - s / 2, leafW, s);
        g.lineStyle(1.5, 0x00e5ff, 0.6);
        g.strokeCircle(x, y, 4);
      }
    },
  },
  {
    id: 'saw',
    name: 'KINETIC SAW BLADE',
    category: 'HAZARDS',
    description: 'Motorized high-velocity circular saw blade oscillating continuously on linear patrol track.',
    howItWorks: 'Advances along predetermined coordinates every turn in lockstep with player movement.',
    effect: 'Instantly lethal upon contact with any character.',
    dangerOrLimitation: 'Cannot be stopped by conventional means unless suspended by a Cryo Time-Lock.',
    worldAvailability: 'BOTH WORLDS',
    crossWorldRelationship: 'Because horizontal movement is inverted, dodging a saw in Real World may drive Shadow directly into blade path.',
    renderExactAsset: (g, x, y, size, isReal) => {
      // Exact Saw from PuzzleObjectRenderer.renderMovingHazards
      const r = size * 0.35;
      const col = isReal ? PALETTE.real.character : PALETTE.shadow.character;
      const teeth = 8;

      g.lineStyle(1.5, col, 0.25);
      g.strokeCircle(x, y, r * 1.15);

      g.fillStyle(isReal ? 0x222222 : 0xdddddd, 0.95);
      g.fillCircle(x, y, r);
      g.lineStyle(2, col, 1);
      g.strokeCircle(x, y, r);

      for (let i = 0; i < teeth; i++) {
        const a = (i * Math.PI * 2) / teeth;
        const toothTipA = a + 0.22;
        const xRoot = x + Math.cos(a) * (r * 0.85);
        const yRoot = y + Math.sin(a) * (r * 0.85);
        const xTip = x + Math.cos(toothTipA) * (r * 1.25);
        const yTip = y + Math.sin(toothTipA) * (r * 1.25);
        const xBack = x + Math.cos(a + 0.38) * (r * 0.95);
        const yBack = y + Math.sin(a + 0.38) * (r * 0.95);

        g.fillStyle(col, 1);
        g.beginPath();
        g.moveTo(xRoot, yRoot);
        g.lineTo(xTip, yTip);
        g.lineTo(xBack, yBack);
        g.closePath();
        g.fillPath();
      }

      g.fillStyle(isReal ? 0x444444 : 0xaaaaaa, 1);
      g.fillCircle(x, y, r * 0.38);
      g.lineStyle(1.5, col, 1);
      g.strokeCircle(x, y, r * 0.38);

      g.fillStyle(col, 1);
      g.fillCircle(x, y, r * 0.12);
    },
  },
  {
    id: 'bomb',
    name: 'COUNTDOWN DEMOLITION BOMB',
    category: 'HAZARDS',
    description: 'Heavy cast-iron demolition device with mechanical turn countdown timer.',
    howItWorks: 'Armed upon step-activation or level start. Decrements timer value on every valid player turn.',
    effect: 'Detonates when countdown reaches zero, obliterating destructible walls and killing actors in blast radius.',
    dangerOrLimitation: 'Blast extends in a cross/square radius. Characters must clear the area before detonation.',
    worldAvailability: 'BOTH WORLDS',
    crossWorldRelationship: 'Cross-world explosive shockwaves breach destructible cracked walls in the opposite world.',
    hasMultipleStates: true,
    renderExactAsset: (g, x, y, size, isReal, stateVariant) => {
      // Exact Bomb from PuzzleObjectRenderer.renderBombs
      const r = size * 0.33;
      const isArmed = stateVariant === 1;

      if (isArmed) {
        g.lineStyle(1.5, 0xff3300, 0.5);
        g.strokeRect(x - size * 0.45, y - size * 0.45, size * 0.9, size * 0.9);
      }

      const shellCol = isReal ? 0x1a1a1a : 0xf0f0f0;
      const rimCol = isReal ? 0x444444 : 0xcccccc;
      g.fillStyle(shellCol, 1);
      g.fillCircle(x, y, r);
      g.lineStyle(2.5, rimCol, 1);
      g.strokeCircle(x, y, r);

      const neckW = r * 0.6;
      const neckH = 5;
      g.fillStyle(rimCol, 1);
      g.fillRect(x - neckW / 2, y - r - neckH + 1, neckW, neckH);

      if (isArmed) {
        g.lineStyle(2, 0xff4400, 1);
        g.beginPath();
        g.moveTo(x, y - r - neckH + 1);
        g.lineTo(x + 5, y - r - neckH - 4);
        g.lineTo(x + 8, y - r - neckH - 8);
        g.strokePath();

        g.fillStyle(0xffaa00, 1);
        g.fillCircle(x + 8, y - r - neckH - 8, 3);
      }
    },
  },
  {
    id: 'portal',
    name: 'SINGULARITY PORTAL',
    category: 'DIMENSIONAL',
    description: 'Quantum rift singularity that folds dimensional space and teleports entities on contact.',
    howItWorks: 'Stepping into the vortex instantaneously transports actor or beam to target destination coordinates.',
    effect: 'Transfers position seamlessly. Corrupted portals feature thorn barriers that restrict safe exit directions.',
    dangerOrLimitation: 'Observe target coordinates carefully to avoid immediate hazards or confinement lockups.',
    worldAvailability: 'BOTH WORLDS',
    crossWorldRelationship: 'Connects distant corridors or warps characters directly between Real World and Shadow World.',
    hasMultipleStates: true,
    renderExactAsset: (g, x, y, size, isReal, stateVariant) => {
      // Exact Portal from PuzzleObjectRenderer.renderPortals
      const r = size * 0.36;
      const col = isReal ? PALETTE.real.character : PALETTE.shadow.character;
      const isCorrupted = stateVariant === 1;

      if (isCorrupted) {
        const corruptionCol = 0xff0055;
        g.lineStyle(2.5, corruptionCol, 0.95);
        g.strokeCircle(x, y, r);

        for (let i = 0; i < 6; i++) {
          const a = (i * Math.PI * 2) / 6;
          g.lineStyle(2, corruptionCol, 0.8);
          g.lineBetween(x + Math.cos(a) * (r * 0.9), y + Math.sin(a) * (r * 0.9), x + Math.cos(a) * (r * 1.25), y + Math.sin(a) * (r * 1.25));
        }

        g.fillStyle(0x1a000d, 1);
        g.fillCircle(x, y, r * 0.65);
        g.fillStyle(corruptionCol, 0.7);
        g.fillCircle(x, y, r * 0.25);
      } else {
        g.lineStyle(2.5, col, 0.9);
        g.strokeCircle(x, y, r);

        const arms = 4;
        for (let i = 0; i < arms; i++) {
          const a = (i * Math.PI * 2) / arms;
          g.lineStyle(1.5, col, 0.6);
          g.lineBetween(x + Math.cos(a) * (r * 0.4), y + Math.sin(a) * (r * 0.4), x + Math.cos(a + 0.6) * (r * 0.9), y + Math.sin(a + 0.6) * (r * 0.9));
        }

        g.fillStyle(isReal ? 0x050505 : 0xf8f8f8, 0.95);
        g.fillCircle(x, y, r * 0.28);
      }
    },
  },
  {
    id: 'laser_emitter',
    name: 'LASER EMITTER & BEAM',
    category: 'HAZARDS',
    description: 'High-energy coherent ionization projector producing uninterrupted directional laser beams.',
    howItWorks: 'Emits a lethal beam continuously along a cardinal direction until occluded by walls, mirrors, or blocks.',
    effect: 'Lethal to characters. Powers optical laser receivers when aligned.',
    dangerOrLimitation: 'Cannot be passed through without shielding or rerouting.',
    worldAvailability: 'BOTH WORLDS',
    crossWorldRelationship: 'Beams can pass through inter-dimensional portals to activate receivers in the opposite world.',
    renderExactAsset: (g, x, y, size, isReal) => {
      // Exact Laser Emitter & Beam from PuzzleObjectRenderer
      const r = size * 0.34;
      const col = isReal ? PALETTE.real.character : PALETTE.shadow.character;
      const accentCol = 0x00e5ff;

      // Projector
      g.fillStyle(isReal ? 0x222222 : 0xdddddd, 1);
      g.fillCircle(x - 8, y, r);
      g.lineStyle(2, col, 0.95);
      g.strokeCircle(x - 8, y, r);

      // Nozzle
      g.lineStyle(4, col, 1);
      g.lineBetween(x - 8, y, x + 10, y);
      g.lineStyle(2, accentCol, 1);
      g.lineBetween(x - 8, y, x + 10, y);

      // Glowing core
      g.fillStyle(accentCol, 1);
      g.fillCircle(x - 8, y, r * 0.4);

      // Emitted Beam
      const beamEndX = x + size * 0.46;
      g.lineStyle(6, accentCol, 0.28);
      g.lineBetween(x + 10, y, beamEndX, y);
      g.lineStyle(3, accentCol, 0.75);
      g.lineBetween(x + 10, y, beamEndX, y);
      g.lineStyle(1.5, 0xffffff, 1);
      g.lineBetween(x + 10, y, beamEndX, y);
    },
  },
  {
    id: 'laser_mirror',
    name: 'REFLECTIVE PRISM MIRROR',
    category: 'DIMENSIONAL',
    description: 'High-precision 45-degree optical prism mirror with dielectric reflective coating.',
    howItWorks: 'Redirects incident laser beams at exact 90-degree orthogonal angles.',
    effect: 'Reroutes energy paths around walls and into receivers.',
    dangerOrLimitation: 'Stepping on a rotatable mirror swivel changes orientation, altering beam trajectories across the arena.',
    worldAvailability: 'BOTH WORLDS',
    crossWorldRelationship: 'Directs laser energy through inter-dimensional portals into remote chambers.',
    renderExactAsset: (g, x, y, size, isReal) => {
      // Exact Laser Mirror from PuzzleObjectRenderer.renderLaserMirrors
      const s = size * 0.38;
      const col = isReal ? PALETTE.real.character : PALETTE.shadow.character;
      const mirrorCol = 0x00e5ff;

      g.lineStyle(1.5, col, 0.45);
      g.strokeCircle(x, y, s * 0.85);

      const x1 = x - s;
      const y1 = y + s;
      const x2 = x + s;
      const y2 = y - s;

      g.lineStyle(5, isReal ? 0x111111 : 0xffffff, 0.95);
      g.lineBetween(x1, y1, x2, y2);
      g.lineStyle(3, mirrorCol, 0.95);
      g.lineBetween(x1, y1, x2, y2);
      g.lineStyle(1.5, 0xffffff, 0.9);
      g.lineBetween(x - s * 0.3, y + s * 0.3, x + s * 0.3, y - s * 0.3);

      g.fillStyle(col, 1);
      g.fillCircle(x, y, 4);
    },
  },
  {
    id: 'laser_receiver',
    name: 'OPTICAL LASER RECEIVER',
    category: 'MECHANISMS',
    description: 'Sensory target receptacle wired to remote blast doors or barrier fields.',
    howItWorks: 'Continuously monitors for incoming laser beam illumination.',
    effect: 'Upon laser beam contact, powers internal capacitor and unlocks linked blast gates.',
    dangerOrLimitation: 'Ceases output immediately if laser beam is blocked or redirected away.',
    worldAvailability: 'BOTH WORLDS',
    crossWorldRelationship: 'Frequently acts as the final gatekeeper for exit sanctuaries or rescue vaults.',
    hasMultipleStates: true,
    renderExactAsset: (g, x, y, size, isReal, stateVariant) => {
      // Exact Laser Receiver from PuzzleObjectRenderer.renderLaserReceivers
      const s = size * 0.38;
      const col = isReal ? PALETTE.real.character : PALETTE.shadow.character;
      const accentCol = 0x00e5ff;
      const isPowered = stateVariant === 1;

      g.fillStyle(isReal ? 0x222222 : 0xdddddd, 0.9);
      g.fillRoundedRect(x - s, y - s, s * 2, s * 2, 5);
      g.lineStyle(2, col, 0.95);
      g.strokeRoundedRect(x - s, y - s, s * 2, s * 2, 5);

      g.lineStyle(1.5, isPowered ? accentCol : col, isPowered ? 1 : 0.4);
      g.strokeCircle(x, y, s * 0.65);

      if (isPowered) {
        g.fillStyle(accentCol, 0.9);
        g.fillCircle(x, y, s * 0.4);
        g.fillStyle(0xffffff, 1);
        g.fillCircle(x, y, s * 0.2);
        g.lineStyle(2.5, accentCol, 0.4);
        g.strokeCircle(x, y, s * 0.9);
      } else {
        g.fillStyle(col, 0.35);
        g.fillCircle(x, y, s * 0.25);
      }
    },
  },
  {
    id: 'collapsing_floor',
    name: 'CRACKED COLLAPSING FLOOR',
    category: 'ENVIRONMENT',
    description: 'Fragile stone paving plate subject to cumulative mechanical stress fractures.',
    howItWorks: 'Monitors actor step visits. Rated for 2 steps of physical tolerance.',
    effect: 'Step 1: Displays deep fracture fissures. Step 2: Collapses into an infinite abyss pit.',
    dangerOrLimitation: 'Once collapsed, stepping into the void results in an instant fall death.',
    worldAvailability: 'BOTH WORLDS',
    crossWorldRelationship: 'Forces strict forward momentum without repetitive backtracking.',
    hasMultipleStates: true,
    renderExactAsset: (g, x, y, size, isReal, stateVariant) => {
      // Exact Collapsing Floor from PuzzleObjectRenderer.renderCollapsingFloors
      const s = size * 0.46;
      const col = isReal ? PALETTE.real.character : PALETTE.shadow.character;

      if (stateVariant === 2) {
        // Collapsed Abyss
        g.fillStyle(isReal ? 0x101010 : 0xe0e0e0, 0.95);
        g.fillRect(x - s, y - s, s * 2, s * 2);
        g.lineStyle(2, col, 0.6);
        g.strokeRect(x - s, y - s, s * 2, s * 2);
      } else if (stateVariant === 1) {
        // Cracked
        g.lineStyle(2, col, 0.85);
        g.beginPath();
        g.moveTo(x - s * 0.8, y - s * 0.7);
        g.lineTo(x - s * 0.1, y - s * 0.1);
        g.lineTo(x + s * 0.7, y - s * 0.6);
        g.moveTo(x - s * 0.1, y - s * 0.1);
        g.lineTo(x - s * 0.4, y + s * 0.7);
        g.moveTo(x - s * 0.1, y - s * 0.1);
        g.lineTo(x + s * 0.8, y + s * 0.4);
        g.strokePath();
      } else {
        // Intact
        g.lineStyle(1, col, 0.35);
        g.strokeRect(x - s * 0.75, y - s * 0.75, s * 1.5, s * 1.5);
      }
    },
  },
  {
    id: 'pressure_plate',
    name: '3D BEVELED PRESSURE PLATE',
    category: 'MECHANISMS',
    description: 'Heavy floor-recessed contact plate with mechanical depth sensors.',
    howItWorks: 'Actuates when weighted by a standing character or pushable stone block.',
    effect: 'Engages linked circuits as long as physical weight is sustained.',
    dangerOrLimitation: 'Releases immediately when weight is removed. Requires pushable blocks for permanent latching.',
    worldAvailability: 'BOTH WORLDS',
    crossWorldRelationship: 'Allows one character to stand on plate to hold open a conduit for the partner world.',
    hasMultipleStates: true,
    renderExactAsset: (g, x, y, size, isReal, stateVariant) => {
      // Exact Pressure Plate from PuzzleObjectRenderer.renderPressurePlates
      const s = size * 0.56;
      const strokeCol = isReal ? PALETTE.real.walls : PALETTE.shadow.walls;
      const isPressed = stateVariant === 1;

      if (!isPressed) {
        g.lineStyle(1, strokeCol, 0.4);
        g.strokeRoundedRect(x - s / 2 - 2, y - s / 2 - 2, s + 4, s + 4, 4);

        g.fillStyle(isReal ? 0xd0d0d0 : 0x303030, 0.95);
        g.fillRoundedRect(x - s / 2, y - s / 2 - 2, s, s, 3);
        g.lineStyle(1.5, strokeCol, 0.9);
        g.strokeRoundedRect(x - s / 2, y - s / 2 - 2, s, s, 3);

        g.lineStyle(1, strokeCol, 0.5);
        g.strokeRect(x - s * 0.2, y - s * 0.2 - 2, s * 0.4, s * 0.4);
      } else {
        g.fillStyle(isReal ? 0x999999 : 0x555555, 1);
        g.fillRoundedRect(x - s / 2, y - s / 2 + 1, s, s, 2);
        g.lineStyle(2, 0x00e5ff, 0.9);
        g.strokeRoundedRect(x - s / 2, y - s / 2 + 1, s, size * 0.56, 2);

        g.fillStyle(0x00e5ff, 0.85);
        g.fillRect(x - s * 0.15, y - s * 0.15 + 1, s * 0.3, s * 0.3);
      }
    },
  },
  {
    id: 'destructible_wall',
    name: 'CRACKED SEGMENTED WALL',
    category: 'ENVIRONMENT',
    description: 'Weakened masonry partition marked with structural 4-quadrant stress lines.',
    howItWorks: 'Impassable to movement until shattered by high-yield explosive ordnance.',
    effect: 'Converts into permanent open floor tile upon bomb detonation.',
    dangerOrLimitation: 'Cannot be breached by physical pushing; requires a bomb.',
    worldAvailability: 'BOTH WORLDS',
    crossWorldRelationship: 'Cross-world bomb explosions shatter cracked walls across both dimensions simultaneously.',
    renderExactAsset: (g, x, y, size, isReal) => {
      // Exact Destructible Wall from PuzzleObjectRenderer.renderDestructibleWalls
      const s = size * 0.88;
      const fillCol = isReal ? 0x222222 : 0xdddddd;
      const strokeCol = isReal ? PALETTE.real.walls : PALETTE.shadow.walls;

      g.fillStyle(fillCol, 1);
      g.fillRect(x - s / 2, y - s / 2, s, s);

      g.lineStyle(1.5, strokeCol, 0.7);
      g.strokeRect(x - s / 2, y - s / 2, s, s);
      g.lineBetween(x - s / 2, y, x + s / 2, y);
      g.lineBetween(x, y - s / 2, x, y + s / 2);
    },
  },
  {
    id: 'time_lock',
    name: 'CRYO TIME-LOCK',
    category: 'MECHANISMS',
    description: 'Astronomical stasis chronometer that temporarily suspends hazard motion.',
    howItWorks: 'Stepping onto the device activates a temporal stasis dome lasting for a set number of turns.',
    effect: 'Completely freezes moving saws and kinetic hazards in their tracks.',
    dangerOrLimitation: 'Stasis window is temporary. When turns expire, hazards resume motion immediately.',
    worldAvailability: 'BOTH WORLDS',
    crossWorldRelationship: 'Simultaneously freezes hazards across both Real World and Shadow World.',
    renderExactAsset: (g, x, y, size, isReal) => {
      // Exact Time Lock from PuzzleObjectRenderer.renderTimeLocks
      const r = size * 0.38;
      const col = isReal ? PALETTE.real.character : PALETTE.shadow.character;
      const temporalCol = 0x00e5ff;

      g.lineStyle(2, col, 0.9);
      g.strokeCircle(x, y, r);

      const teeth = 8;
      for (let i = 0; i < teeth; i++) {
        const a = (i * Math.PI * 2) / teeth;
        g.lineStyle(1.5, col, 0.5);
        g.lineBetween(x + Math.cos(a) * (r * 0.9), y + Math.sin(a) * (r * 0.9), x + Math.cos(a) * (r * 1.15), y + Math.sin(a) * (r * 1.15));
      }

      g.lineStyle(2, temporalCol, 1);
      g.lineBetween(x, y, x + r * 0.6, y - r * 0.3);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(x + r * 0.6, y - r * 0.3, 2.5);

      g.fillStyle(col, 1);
      g.fillCircle(x, y, 3);
    },
  },
  {
    id: 'movable_block',
    name: 'MAGNETIZED MOVABLE BLOCK',
    category: 'MECHANISMS',
    description: 'Heavy reinforced stone and alloy crate that can be pushed across open floor tiles.',
    howItWorks: 'Walking into the block pushes it one tile forward if destination tile is clear.',
    effect: 'Blocks lasers, depresses pressure plates, and shields actors from hazard paths.',
    dangerOrLimitation: 'Can be trapped against corners or dead-ends if pushed without forward planning.',
    worldAvailability: 'BOTH WORLDS',
    crossWorldRelationship: 'Affected by directional magnetic fields across both dimensions.',
    renderExactAsset: (g, x, y, size, isReal) => {
      // Exact Movable Block from PuzzleObjectRenderer.renderMovableBlocks
      const s = size * 0.42;
      const fillCol = isReal ? 0x2b2b2b : 0xd2d2d2;
      const strokeCol = isReal ? 0xffffff : 0x111111;

      g.fillStyle(fillCol, 0.98);
      g.fillRoundedRect(x - s, y - s, s * 2, s * 2, 5);
      g.lineStyle(2, strokeCol, 0.95);
      g.strokeRoundedRect(x - s, y - s, s * 2, s * 2, 5);

      const bSz = s * 0.35;
      g.fillStyle(isReal ? 0x444444 : 0x999999, 1);
      g.fillRect(x - s, y - s, bSz, bSz);
      g.fillRect(x + s - bSz, y - s, bSz, bSz);
      g.fillRect(x - s, y + s - bSz, bSz, bSz);
      g.fillRect(x + s - bSz, y + s - bSz, bSz, bSz);

      g.lineStyle(2, isReal ? 0x00e5ff : 0xff3366, 1);
      g.strokeRect(x - s * 0.35, y - s * 0.35, s * 0.7, s * 0.7);
    },
  },
  {
    id: 'checkpoint',
    name: 'SANCTUARY BEACON PLINTH',
    category: 'ENVIRONMENT',
    description: 'Luminous monolithic stone plinth that stores spatial checkpoint snapshots.',
    howItWorks: 'Step onto the beacon plinth to record player positions and active mechanism states.',
    effect: 'Upon actor demise, resets characters safely to the checkpoint rather than the beginning of the level.',
    dangerOrLimitation: 'Checkpoints record the global state at activation; ensure you are not cornered.',
    worldAvailability: 'BOTH WORLDS',
    crossWorldRelationship: 'Records state for both Real World and Shadow World simultaneously.',
    renderExactAsset: (g, x, y, size, isReal) => {
      // Exact Checkpoint from PuzzleObjectRenderer.drawCheckpointPillar
      const col = isReal ? PALETTE.real.walls : PALETTE.shadow.walls;
      const accentCol = 0x00e5ff;
      const r = size * 0.32;

      g.lineStyle(1.5, col, 0.9);
      g.strokeCircle(x, y, r);

      const tickLen = 4;
      g.lineStyle(2, col, 0.95);
      g.lineBetween(x, y - r - tickLen, x, y - r + tickLen);
      g.lineBetween(x, y + r - tickLen, x, y + r + tickLen);
      g.lineBetween(x - r - tickLen, y, x - r + tickLen, y);
      g.lineBetween(x + r - tickLen, y, x + r + tickLen, y);

      g.lineStyle(2, accentCol, 0.7);
      g.strokeCircle(x, y, r * 0.75);

      g.fillStyle(accentCol, 0.9);
      g.fillCircle(x, y, r * 0.35);

      g.fillStyle(0xffffff, 0.95);
      g.fillCircle(x, y, r * 0.18);
    },
  },
];

export class ObjectGuideModal {
  private container: Phaser.GameObjects.Container;
  private contentContainer: Phaser.GameObjects.Container;
  private pageIndicatorText: Phaser.GameObjects.Text;
  private currentPage: number = 0;
  private readonly itemsPerPage: number = 2;
  private activeCategory: string = 'ALL';
  private onCloseCallback: () => void;

  constructor(scene: Phaser.Scene, width: number, height: number, onClose: () => void) {
    this.onCloseCallback = onClose;

    this.container = scene.add.container(width / 2, height / 2);
    this.container.setDepth(150);
    this.container.setVisible(false);

    const modalW = 680;
    const modalH = 510;

    // Dark backdrop overlay
    const backdrop = scene.add.graphics();
    backdrop.fillStyle(0x000000, 0.85);
    backdrop.fillRect(-width / 2, -height / 2, width, height);
    this.container.add(backdrop);

    const backdropHit = scene.add
      .zone(0, 0, width, height)
      .setOrigin(0.5)
      .setInteractive();
    this.container.add(backdropHit);

    // Modal background box
    const box = scene.add.graphics();
    box.fillStyle(0x090909, 0.98);
    box.fillRoundedRect(-modalW / 2, -modalH / 2, modalW, modalH, 8);
    box.lineStyle(1.5, 0xffffff, 0.9);
    box.strokeRoundedRect(-modalW / 2, -modalH / 2, modalW, modalH, 8);
    this.container.add(box);

    // Title
    const title = scene.add
      .text(0, -modalH / 2 + 28, 'OBJECT & MECHANISM GUIDE', {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '20px',
        fontStyle: 'bold',
        color: '#FFFFFF',
        letterSpacing: 2,
      })
      .setOrigin(0.5);
    this.container.add(title);

    const subtitle = scene.add
      .text(0, -modalH / 2 + 50, 'VERIFIED GAMEPLAY ARTIFACTS  •  EXACT IN-ENGINE ASSET VISUALIZATIONS', {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '10px',
        color: '#888888',
        letterSpacing: 1.5,
      })
      .setOrigin(0.5);
    this.container.add(subtitle);

    // Category Tabs
    this.createCategoryTabs(scene, modalW, -modalH / 2 + 75);

    // Divider
    const div = scene.add.graphics();
    div.lineStyle(1, 0x333333, 0.8);
    div.lineBetween(-modalW / 2 + 25, -modalH / 2 + 96, modalW / 2 - 25, -modalH / 2 + 96);
    this.container.add(div);

    // Dynamic content container for cards
    this.contentContainer = scene.add.container(0, 0);
    this.container.add(this.contentContainer);

    // Bottom Navigation Bar
    const navY = modalH / 2 - 32;

    this.createNavButton(scene, -140, navY, 80, 28, '← PREV', () => {
      if (this.currentPage > 0) {
        this.currentPage--;
        this.renderPage(scene, modalW);
      }
    });

    this.pageIndicatorText = scene.add
      .text(0, navY, 'PAGE 1 / 8', {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#CCCCCC',
        letterSpacing: 1,
      })
      .setOrigin(0.5);
    this.container.add(this.pageIndicatorText);

    this.createNavButton(scene, 140, navY, 80, 28, 'NEXT →', () => {
      const filtered = this.getFilteredObjects();
      const maxPages = Math.ceil(filtered.length / this.itemsPerPage);
      if (this.currentPage < maxPages - 1) {
        this.currentPage++;
        this.renderPage(scene, modalW);
      }
    });

    // Mandatory upper-right '✕' close button
    const closeBtn = scene.add
      .text(modalW / 2 - 32, -modalH / 2 + 25, '✕', {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '20px',
        color: '#AAAAAA',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    closeBtn.on('pointerover', () => closeBtn.setColor('#FFFFFF'));
    closeBtn.on('pointerout', () => closeBtn.setColor('#AAAAAA'));
    closeBtn.on('pointerdown', () => {
      this.hide();
      this.onCloseCallback();
    });
    this.container.add(closeBtn);

    // Render initial page
    this.renderPage(scene, modalW);
  }

  private createCategoryTabs(scene: Phaser.Scene, modalW: number, y: number): void {
    const categories = ['ALL', 'CHARACTERS', 'HAZARDS', 'MECHANISMS', 'DIMENSIONAL', 'ENVIRONMENT'];
    const tabW = 95;
    const startX = -((categories.length * tabW) / 2) + tabW / 2;

    categories.forEach((cat, idx) => {
      const x = startX + idx * tabW;
      const g = scene.add.graphics();

      const txt = scene.add
        .text(x, y, cat, {
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize: '9.5px',
          fontStyle: 'bold',
          color: this.activeCategory === cat ? '#00E5FF' : '#777777',
          letterSpacing: 0.8,
        })
        .setOrigin(0.5);

      const hit = scene.add
        .zone(x, y, tabW - 6, 22)
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      hit.on('pointerdown', () => {
        this.activeCategory = cat;
        this.currentPage = 0;
        this.createCategoryTabs(scene, modalW, y);
        this.renderPage(scene, modalW);
      });

      this.container.add(g);
      this.container.add(txt);
      this.container.add(hit);
    });
  }

  private getFilteredObjects(): readonly GuideObjectEntry[] {
    if (this.activeCategory === 'ALL') {
      return ALL_GUIDE_OBJECTS;
    }
    return ALL_GUIDE_OBJECTS.filter((obj) => obj.category === this.activeCategory);
  }

  private renderPage(scene: Phaser.Scene, modalW: number): void {
    this.contentContainer.removeAll(true);

    const filtered = this.getFilteredObjects();
    const maxPages = Math.max(1, Math.ceil(filtered.length / this.itemsPerPage));
    this.pageIndicatorText.setText(`PAGE ${this.currentPage + 1} / ${maxPages}`);

    const startIndex = this.currentPage * this.itemsPerPage;
    const pageItems = filtered.slice(startIndex, startIndex + this.itemsPerPage);

    const cardW = modalW - 50;
    const cardH = 168;
    const topY = -80;
    const gapY = 180;

    pageItems.forEach((item, index) => {
      const cardY = topY + index * gapY;
      const card = scene.add.container(0, cardY);

      // Card background
      const cardBg = scene.add.graphics();
      cardBg.fillStyle(0x131313, 0.98);
      cardBg.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 6);
      cardBg.lineStyle(1, 0x2b2b2b, 0.9);
      cardBg.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 6);
      card.add(cardBg);

      // --- EXACT GAME ASSET PREVIEW BOXES ---
      // We render BOTH Real World variant (light) and Shadow World variant (dark)
      const previewBoxW = 86;
      const previewBoxH = 68;
      const previewX1 = -cardW / 2 + 52;
      const previewX2 = -cardW / 2 + 144;
      const previewY = -cardH / 2 + 54;

      // 1. Real World Box (Light)
      const rBox = scene.add.graphics();
      rBox.fillStyle(PALETTE.real.background, 1);
      rBox.fillRoundedRect(previewX1 - previewBoxW / 2, previewY - previewBoxH / 2, previewBoxW, previewBoxH, 4);
      rBox.lineStyle(1, 0xaaaaaa, 0.8);
      rBox.strokeRoundedRect(previewX1 - previewBoxW / 2, previewY - previewBoxH / 2, previewBoxW, previewBoxH, 4);
      card.add(rBox);

      const rLabel = scene.add
        .text(previewX1, previewY - previewBoxH / 2 - 10, 'REAL WORLD', {
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize: '8.5px',
          fontStyle: 'bold',
          color: '#888888',
        })
        .setOrigin(0.5);
      card.add(rLabel);

      const rG = scene.add.graphics();
      item.renderExactAsset(rG, previewX1, previewY, 44, true, 0);
      card.add(rG);

      // 2. Shadow World Box (Dark)
      const sBox = scene.add.graphics();
      sBox.fillStyle(PALETTE.shadow.background, 1);
      sBox.fillRoundedRect(previewX2 - previewBoxW / 2, previewY - previewBoxH / 2, previewBoxW, previewBoxH, 4);
      sBox.lineStyle(1, 0x444444, 0.8);
      sBox.strokeRoundedRect(previewX2 - previewBoxW / 2, previewY - previewBoxH / 2, previewBoxW, previewBoxH, 4);
      card.add(sBox);

      const sLabel = scene.add
        .text(previewX2, previewY - previewBoxH / 2 - 10, 'SHADOW WORLD', {
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize: '8.5px',
          fontStyle: 'bold',
          color: '#888888',
        })
        .setOrigin(0.5);
      card.add(sLabel);

      const sG = scene.add.graphics();
      item.renderExactAsset(sG, previewX2, previewY, 44, false, item.hasMultipleStates ? 1 : 0);
      card.add(sG);

      // State label if multi-state
      if (item.hasMultipleStates) {
        const stateNote = scene.add
          .text(-cardW / 2 + 98, previewY + previewBoxH / 2 + 10, '[ MULTI-STATE REVERSIBLE ]', {
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: '8px',
            color: '#00E5FF',
          })
          .setOrigin(0.5);
        card.add(stateNote);
      }

      // --- TEXT CONTENT ---
      const textX = -cardW / 2 + 200;
      const textMaxW = cardW - 220;

      // Title & Category badge
      const headerText = scene.add
        .text(textX, -cardH / 2 + 12, `${item.name}`, {
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize: '13.5px',
          fontStyle: 'bold',
          color: '#FFFFFF',
          letterSpacing: 1.2,
        })
        .setOrigin(0, 0);
      card.add(headerText);

      const badge = scene.add
        .text(cardW / 2 - 16, -cardH / 2 + 14, `[ ${item.category} • ${item.worldAvailability} ]`, {
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize: '9.5px',
          fontStyle: 'bold',
          color: '#00E5FF',
          letterSpacing: 1,
        })
        .setOrigin(1, 0);
      card.add(badge);

      // Description
      const desc = scene.add
        .text(textX, -cardH / 2 + 34, `WHAT IT IS: ${item.description}`, {
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize: '10.5px',
          color: '#E0E0E0',
          wordWrap: { width: textMaxW },
          lineSpacing: 1.5,
        })
        .setOrigin(0, 0);
      card.add(desc);

      // How it works
      const how = scene.add
        .text(textX, -cardH / 2 + 64, `HOW IT WORKS: ${item.howItWorks}`, {
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize: '10.5px',
          color: '#CCCCCC',
          wordWrap: { width: textMaxW },
          lineSpacing: 1.5,
        })
        .setOrigin(0, 0);
      card.add(how);

      // Danger / Limitation
      const danger = scene.add
        .text(textX, -cardH / 2 + 96, `DANGER / LIMITATION: ${item.dangerOrLimitation}`, {
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize: '10px',
          color: '#FFAA00',
          wordWrap: { width: textMaxW },
          lineSpacing: 1.5,
        })
        .setOrigin(0, 0);
      card.add(danger);

      // Cross-World Relationship
      const cross = scene.add
        .text(textX, -cardH / 2 + 128, `CROSS-WORLD DYNAMICS: ${item.crossWorldRelationship}`, {
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize: '10px',
          color: '#00E5FF',
          wordWrap: { width: textMaxW },
          lineSpacing: 1.5,
        })
        .setOrigin(0, 0);
      card.add(cross);

      this.contentContainer.add(card);
    });
  }

  private createNavButton(
    scene: Phaser.Scene,
    x: number,
    y: number,
    w: number,
    h: number,
    text: string,
    onClick: () => void
  ): void {
    const bg = scene.add.graphics();
    const render = (hover: boolean) => {
      bg.clear();
      bg.fillStyle(hover ? 0x222222 : 0x111111, 0.95);
      bg.fillRoundedRect(x - w / 2, y - h / 2, w, h, 4);
      bg.lineStyle(hover ? 1.5 : 1, hover ? 0xffffff : 0x666666, 0.9);
      bg.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 4);
    };

    render(false);
    this.container.add(bg);

    const txt = scene.add
      .text(x, y, text, {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#CCCCCC',
        letterSpacing: 1,
      })
      .setOrigin(0.5);
    this.container.add(txt);

    const hit = scene.add
      .zone(x, y, w, h)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    hit.on('pointerover', () => {
      render(true);
      txt.setColor('#FFFFFF');
    });

    hit.on('pointerout', () => {
      render(false);
      txt.setColor('#CCCCCC');
    });

    hit.on('pointerdown', onClick);
    this.container.add(hit);
  }

  public show(): void {
    this.container.setVisible(true);
  }

  public hide(): void {
    this.container.setVisible(false);
  }

  public isVisible(): boolean {
    return this.container.visible;
  }
}
