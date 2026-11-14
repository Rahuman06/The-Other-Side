import { LevelDefinition } from '../src/types/level';
import { exploreAllSolutions } from './solve_and_verify';

export function createTestLevel(): LevelDefinition {
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
      // Central dividing wall (x=3)
      { x: 3, y: 0 },
      { x: 3, y: 1 },
      { x: 3, y: 2 },
      // (3,3) is door-20-real-conduit
      { x: 3, y: 4 },
      { x: 3, y: 5 },

      // Baffles separating West wing corridors
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 1, y: 4 },
      { x: 2, y: 4 },

      // Exit vault enclosure at (7, 5): enclosed by (6, 4), (7, 4), threshold door at (6, 5)
      { x: 6, y: 4 },
      { x: 7, y: 4 },

      // Alignment buffer walls in Real
      { x: 0, y: 0 },
      { x: 4, y: 0 },
      { x: 4, y: 5 },
      { x: 7, y: 1 },
      { x: 7, y: 2 },
    ],

    shadowWalls: [
      // Central dividing wall in Shadow (180° counterpart: 7-3=4, 5-y)
      { x: 4, y: 5 },
      { x: 4, y: 4 },
      { x: 4, y: 3 },
      // (4,2) is door-20-shadow-conduit
      { x: 4, y: 1 },
      { x: 4, y: 0 },

      // Baffles separating East wing corridors (180° counterpart)
      { x: 6, y: 5 },
      { x: 5, y: 5 },
      { x: 6, y: 1 },
      { x: 5, y: 1 },

      // Exit vault enclosure at (0, 0): enclosed by (1, 1), (0, 1), threshold door at (1, 0)
      { x: 1, y: 1 },
      { x: 0, y: 1 },

      // Alignment buffer walls in Shadow (180° counterpart)
      { x: 7, y: 5 },
      { x: 3, y: 5 },
      { x: 3, y: 0 },
      { x: 0, y: 4 },
      { x: 0, y: 3 },
    ],

    doors: [
      // Indicator doors for inversion triggers
      { id: 'door-20-ind-alpha', world: 'real', position: { x: 0, y: 1 }, initialOpen: false },
      { id: 'door-20-ind-beta', world: 'shadow', position: { x: 7, y: 4 }, initialOpen: false },

      // Conduit doors
      { id: 'door-20-real-conduit', world: 'real', position: { x: 3, y: 3 }, initialOpen: false },
      { id: 'door-20-shadow-conduit', world: 'shadow', position: { x: 4, y: 2 }, initialOpen: false },

      // Exit threshold doors guarding corner exits
      { id: 'door-20-exit-real', world: 'real', position: { x: 6, y: 5 }, initialOpen: false, activationRule: 'ANY' },
      { id: 'door-20-exit-shadow', world: 'shadow', position: { x: 1, y: 0 }, initialOpen: false, activationRule: 'ANY' },
    ],

    switches: [
      // Inversion Switches
      // Alpha at (0, 5) in Real
      { id: 'sw-20-alpha', world: 'real', position: { x: 0, y: 5 }, linkedDoorId: 'door-20-ind-alpha', activationBehavior: 'ACTIVATE_ONLY' },
      // Beta at (7, 0) in Shadow (180°: 7-0=7, 5-5=0)
      { id: 'sw-20-beta', world: 'shadow', position: { x: 7, y: 0 }, linkedDoorId: 'door-20-ind-beta', activationBehavior: 'ACTIVATE_ONLY' },

      // Post-inversion Conduit Switches:
      // When Real inverts, (0, 5) flips to (7, 0).
      // Upper terrace conduit switch at (6, 0) in Real opens door-20-shadow-conduit!
      { id: 'sw-20-conduit-a', world: 'real', position: { x: 6, y: 0 }, linkedDoorId: 'door-20-shadow-conduit', activationBehavior: 'ACTIVATE_ONLY' },
      // Subterranean conduit switch at (1, 5) in Shadow opens door-20-real-conduit! (180°: 7-6=1, 5-0=5)
      { id: 'sw-20-conduit-b', world: 'shadow', position: { x: 1, y: 5 }, linkedDoorId: 'door-20-real-conduit', activationBehavior: 'ACTIVATE_ONLY' },

      // Exit Gate Switches (unlocked after crossing conduit):
      // In Shadow: exit gate switch at (2, 2) unlocks both exits
      { id: 'sw-20-exit-gate-a', world: 'shadow', position: { x: 2, y: 2 }, linkedDoorId: 'door-20-exit-real', activationBehavior: 'ACTIVATE_ONLY' },
      { id: 'sw-20-exit-gate-a2', world: 'shadow', position: { x: 2, y: 2 }, linkedDoorId: 'door-20-exit-shadow', activationBehavior: 'ACTIVATE_ONLY' },

      // In Real: exit gate switch at (5, 3) unlocks both exits (180°: 7-2=5, 5-2=3)
      { id: 'sw-20-exit-gate-b', world: 'real', position: { x: 5, y: 3 }, linkedDoorId: 'door-20-exit-real', activationBehavior: 'ACTIVATE_ONLY' },
      { id: 'sw-20-exit-gate-b2', world: 'real', position: { x: 5, y: 3 }, linkedDoorId: 'door-20-exit-shadow', activationBehavior: 'ACTIVATE_ONLY' },
    ],

    surpriseEvents: [
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

const level = createTestLevel();
console.log('Testing layout with exploreAllSolutions...');
const t0 = Date.now();
const res = exploreAllSolutions(level, 35, 50000);
console.log('Elapsed:', Date.now() - t0, 'ms');
console.log('Total states explored:', res.totalStates);
console.log('Solution A count:', res.solutionsA.length);
if (res.solutionsA.length > 0) {
  console.log('Shortest A length:', res.solutionsA[0].path.length);
  console.log('Shortest A path:', res.solutionsA[0].path.join(', '));
}
console.log('Solution B count:', res.solutionsB.length);
if (res.solutionsB.length > 0) {
  console.log('Shortest B length:', res.solutionsB[0].path.length);
  console.log('Shortest B path:', res.solutionsB[0].path.join(', '));
}
console.log('Unintended count:', res.unintended.length);
if (res.unintended.length > 0) {
  console.log('Unintended sample:', res.unintended[0]);
}
