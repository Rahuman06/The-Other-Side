import { LevelDefinition } from '../src/types/level';
import { exploreAllSolutions } from './solve_and_verify';

export function createMasterCandidate(): LevelDefinition {
  return {
    id: 20,
    chapter: 'THE TRUTH',
    name: 'The Final Paradox',
    width: 8,
    height: 6,
    difficulty: 'MASTER',
    hint: 'Two worlds. One mind. Sometimes the way forward is on the other side of what you believe.',
    realStart: { x: 1, y: 2 },
    shadowStart: { x: 6, y: 3 },
    // Corner Exits
    realExit: { x: 7, y: 5 },
    shadowExit: { x: 0, y: 0 },
    fixedTilesReal: [{ x: 6, y: 5 }],
    fixedTilesShadow: [{ x: 1, y: 0 }],

    realWalls: [
      // Central dividing column (x=3) — solid wall completely sealing West and East wings!
      { x: 3, y: 0 },
      { x: 3, y: 1 },
      { x: 3, y: 2 },
      { x: 3, y: 3 }, // conduit wall: removed ONLY by Solution B (Shadow Inversion)!
      { x: 3, y: 4 },
      { x: 3, y: 5 },

      // Column 4 baffles
      { x: 4, y: 0 },
      { x: 4, y: 1 },
      { x: 4, y: 4 },
      { x: 4, y: 5 },

      // Alpha Chamber: Alpha at (0, 5) entered ONLY from (0, 4) via DOWN
      { x: 1, y: 5 },
      // West wing corridor baffles
      { x: 1, y: 3 },
      { x: 2, y: 1 },
      { x: 2, y: 0 },
      { x: 0, y: 0 },

      // Exit vault enclosure in East wing at (7, 5): enclosed by (6, 4), (7, 4), threshold at (6, 5)
      { x: 6, y: 4 },
      { x: 7, y: 4 },

      // Upper terrace walls in East wing (Real)
      { x: 7, y: 1 },
      { x: 7, y: 2 },
    ],

    shadowWalls: [
      // Central dividing column in Shadow (x=4) — solid wall completely sealing East and West wings!
      { x: 4, y: 5 },
      { x: 4, y: 4 },
      { x: 4, y: 3 },
      { x: 4, y: 2 }, // conduit wall: removed ONLY by Solution A (Real Inversion)!
      { x: 4, y: 1 },
      { x: 4, y: 0 },

      // Column 3 baffles (180° counterpart)
      { x: 3, y: 5 },
      { x: 3, y: 4 },
      { x: 3, y: 1 },
      { x: 3, y: 0 },

      // Beta Chamber: Beta at (7, 0) entered ONLY from (7, 1) via UP (180° counterpart)
      { x: 6, y: 0 },
      // East wing corridor baffles (180° counterpart)
      { x: 6, y: 2 },
      { x: 5, y: 4 },
      { x: 5, y: 5 },
      { x: 7, y: 5 },

      // Exit vault enclosure in West wing at (0, 0): enclosed by (1, 1), (0, 1), threshold at (1, 0)
      { x: 1, y: 1 },
      { x: 0, y: 1 },

      // Lower depths walls in West wing (Shadow) (180° counterpart)
      { x: 0, y: 4 },
      { x: 0, y: 3 },
    ],

    doors: [
      // Pre-chamber gates guarding entrance to Alpha (at 0, 4) and Beta (at 7, 1)
      { id: 'door-20-gate-alpha', world: 'real', position: { x: 0, y: 4 }, initialOpen: false },
      { id: 'door-20-gate-beta', world: 'shadow', position: { x: 7, y: 1 }, initialOpen: false },

      // Inversion indicators
      { id: 'door-20-ind-alpha', world: 'real', position: { x: 0, y: 2 }, initialOpen: false },
      { id: 'door-20-ind-beta', world: 'shadow', position: { x: 7, y: 3 }, initialOpen: false },

      // Exit threshold doors
      { id: 'door-20-exit-real', world: 'real', position: { x: 6, y: 5 }, initialOpen: false, activationRule: 'ANY' },
      { id: 'door-20-exit-shadow', world: 'shadow', position: { x: 1, y: 0 }, initialOpen: false, activationRule: 'ANY' },
    ],

    switches: [
      // Pre-chamber keys (cross-world!)
      // In Shadow: key to Alpha at (5, 3) opens door-20-gate-alpha
      { id: 'sw-20-key-alpha', world: 'shadow', position: { x: 5, y: 3 }, linkedDoorId: 'door-20-gate-alpha', activationBehavior: 'ACTIVATE_ONLY' },
      // In Real: key to Beta at (2, 2) opens door-20-gate-beta (180°: 7-5=2, 5-3=2)
      { id: 'sw-20-key-beta', world: 'real', position: { x: 2, y: 2 }, linkedDoorId: 'door-20-gate-beta', activationBehavior: 'ACTIVATE_ONLY' },

      // Inversion Switches
      // Alpha at (0, 5) in Real (entered strictly via DOWN from 0, 4)
      { id: 'sw-20-alpha', world: 'real', position: { x: 0, y: 5 }, linkedDoorId: 'door-20-ind-alpha', activationBehavior: 'ACTIVATE_ONLY' },
      // Beta at (7, 0) in Shadow (entered strictly via UP from 7, 1)
      { id: 'sw-20-beta', world: 'shadow', position: { x: 7, y: 0 }, linkedDoorId: 'door-20-ind-beta', activationBehavior: 'ACTIVATE_ONLY' },

      // Exit Gate Switches (unlocked after crossing conduit into the opposite wing):
      // In Shadow: exit gate switch at (2, 3) unlocks both exits
      { id: 'sw-20-exit-gate-a', world: 'shadow', position: { x: 2, y: 3 }, linkedDoorId: 'door-20-exit-real', activationBehavior: 'ACTIVATE_ONLY' },
      { id: 'sw-20-exit-gate-a2', world: 'shadow', position: { x: 2, y: 3 }, linkedDoorId: 'door-20-exit-shadow', activationBehavior: 'ACTIVATE_ONLY' },

      // In Real: exit gate switch at (5, 2) unlocks both exits (180°: 7-2=5, 5-3=2)
      { id: 'sw-20-exit-gate-b', world: 'real', position: { x: 5, y: 2 }, linkedDoorId: 'door-20-exit-real', activationBehavior: 'ACTIVATE_ONLY' },
      { id: 'sw-20-exit-gate-b2', world: 'real', position: { x: 5, y: 2 }, linkedDoorId: 'door-20-exit-shadow', activationBehavior: 'ACTIVATE_ONLY' },
    ],

    surpriseEvents: [
      // Solution A — Mirrored Ascent events:
      {
        id: 'se-20-inv-alpha',
        name: 'World Inversion - Mirrored Ascent',
        triggerType: 'SWITCH_TOGGLE',
        triggerSourceId: 'sw-20-alpha',
        targetWorld: 'real',
        targetType: 'WALL',
        action: 'INVERT_WORLD',
        animation: 'inversion',
        sound: 'inversion',
        repeatable: false,
        warningClue: 'Real World inverts — the ceiling terrace rotates to become the upper bridge',
      },
      {
        id: 'se-20-conduit-alpha',
        name: 'Shadow Conduit Breach',
        triggerType: 'SWITCH_TOGGLE',
        triggerSourceId: 'sw-20-alpha',
        targetWorld: 'shadow',
        targetType: 'WALL',
        targetPosition: { x: 4, y: 2 },
        action: 'REMOVE_WALL',
        animation: 'dissolve',
        sound: 'door_open',
        repeatable: false,
      },
      {
        id: 'se-20-lock-beta',
        name: 'Descent Void Collapse',
        triggerType: 'SWITCH_TOGGLE',
        triggerSourceId: 'sw-20-alpha',
        targetWorld: 'shadow',
        targetType: 'COLLAPSE_FLOOR',
        targetPosition: { x: 7, y: 0 },
        action: 'COLLAPSE_TILE',
        animation: 'crumble',
        sound: 'crumble',
        repeatable: false,
      },

      // Solution B — Shadow Descent events:
      {
        id: 'se-20-inv-beta',
        name: 'World Inversion - Shadow Descent',
        triggerType: 'SWITCH_TOGGLE',
        triggerSourceId: 'sw-20-beta',
        targetWorld: 'shadow',
        targetType: 'WALL',
        action: 'INVERT_WORLD',
        animation: 'inversion',
        sound: 'inversion',
        repeatable: false,
        warningClue: 'Shadow World inverts — the subterranean depths rotate to become accessible',
      },
      {
        id: 'se-20-conduit-beta',
        name: 'Real Conduit Breach',
        triggerType: 'SWITCH_TOGGLE',
        triggerSourceId: 'sw-20-beta',
        targetWorld: 'real',
        targetType: 'WALL',
        targetPosition: { x: 3, y: 3 },
        action: 'REMOVE_WALL',
        animation: 'dissolve',
        sound: 'door_open',
        repeatable: false,
      },
      {
        id: 'se-20-lock-alpha',
        name: 'Ascent Void Collapse',
        triggerType: 'SWITCH_TOGGLE',
        triggerSourceId: 'sw-20-beta',
        targetWorld: 'real',
        targetType: 'COLLAPSE_FLOOR',
        targetPosition: { x: 0, y: 5 },
        action: 'COLLAPSE_TILE',
        animation: 'crumble',
        sound: 'crumble',
        repeatable: false,
      },
    ],
    solutionTrace: [],
  };
}

const cand = createMasterCandidate();
console.log('Testing Master Candidate with exploreAllSolutions...');
const t0 = Date.now();
const res = exploreAllSolutions(cand, 40, 60000);
console.log('Elapsed:', Date.now() - t0, 'ms');
console.log('Total states:', res.totalStates);
console.log('Solutions A:', res.solutionsA.length);
if (res.solutionsA.length > 0) {
  console.log('Shortest A length:', res.solutionsA[0].path.length);
  console.log('Shortest A path:', res.solutionsA[0].path.join(', '));
}
console.log('Solutions B:', res.solutionsB.length);
if (res.solutionsB.length > 0) {
  console.log('Shortest B length:', res.solutionsB[0].path.length);
  console.log('Shortest B path:', res.solutionsB[0].path.join(', '));
}
console.log('Unintended solutions:', res.unintended.length);
if (res.unintended.length > 0) {
  console.log('Unintended count:', res.unintended.length);
  console.log('Sample unintended path:', res.unintended[0].path.join(', '));
  console.log('Sample unintended flags:', {
    realInv: res.unintended[0].realInverted,
    shadowInv: res.unintended[0].shadowInverted,
    alpha: res.unintended[0].alphaTriggered,
    beta: res.unintended[0].betaTriggered
  });
}
