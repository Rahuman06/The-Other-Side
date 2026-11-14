import { LevelDefinition } from '../src/types/level';
import { LevelSolver, Direction } from '../src/solver/LevelSolver';
import { LevelFactory, BuiltLevelSession } from '../src/levels/LevelFactory';

export function createCandidateLevel20(): LevelDefinition {
  return {
    id: 20,
    chapter: 'THE TRUTH',
    name: 'The Final Paradox',
    width: 8,
    height: 6,
    difficulty: 'MASTER',
    hint: 'Two worlds. One mind. Sometimes the way forward is on the other side of what you believe.',
    realStart: { x: 1, y: 3 },
    shadowStart: { x: 6, y: 2 },
    // Corner Sequestered Exits
    realExit: { x: 7, y: 5 },
    shadowExit: { x: 0, y: 0 },
    fixedTilesReal: [{ x: 6, y: 5 }],
    fixedTilesShadow: [{ x: 1, y: 0 }],

    realWalls: [
      // Central dividing column at x=3
      { x: 3, y: 0 },
      { x: 3, y: 1 },
      { x: 3, y: 2 },
      // (3, 3) is real-conduit-door
      { x: 3, y: 4 },
      { x: 3, y: 5 },

      // Column 4 baffles
      { x: 4, y: 0 },
      { x: 4, y: 1 },
      { x: 4, y: 4 },
      { x: 4, y: 5 },

      // Pre-chamber gate wall to Alpha: Alpha at (1, 0), door at (1, 1)
      { x: 0, y: 1 },
      { x: 2, y: 1 },
      { x: 0, y: 0 },
      { x: 2, y: 0 },

      // Exit vault enclosure at (7, 5): enclosed by (6, 4), (7, 4), threshold door at (6, 5)
      { x: 7, y: 4 },
      { x: 6, y: 4 },

      // Real side buffer walls for alignment
      { x: 0, y: 4 },
      { x: 0, y: 5 },
      { x: 7, y: 0 },
      { x: 7, y: 1 },
    ],

    shadowWalls: [
      // Central dividing column at x=4 (180° counterpart: 7-3=4, 5-y)
      { x: 4, y: 5 },
      { x: 4, y: 4 },
      { x: 4, y: 3 },
      // (4, 2) is shadow-conduit-door (7-3=4, 5-3=2)
      { x: 4, y: 1 },
      { x: 4, y: 0 },

      // Column 3 baffles (180° counterpart)
      { x: 3, y: 5 },
      { x: 3, y: 4 },
      { x: 3, y: 1 },
      { x: 3, y: 0 },

      // Pre-chamber gate wall to Beta: Beta at (6, 5), door at (6, 4)
      // 180° counterpart: 7-1=6, 5-0=5; door at 7-1=6, 5-1=4
      { x: 7, y: 4 },
      { x: 5, y: 4 },
      { x: 7, y: 5 },
      { x: 5, y: 5 },

      // Exit vault enclosure at (0, 0): enclosed by (1, 1), (0, 1), threshold door at (1, 0)
      { x: 0, y: 1 },
      { x: 1, y: 1 },

      // Shadow side buffer walls for alignment (180° counterpart)
      { x: 7, y: 1 },
      { x: 7, y: 0 },
      { x: 0, y: 5 },
      { x: 0, y: 4 },
    ],

    doors: [
      // Pre-chamber access doors guarding Alpha and Beta
      { id: 'door-20-gate-alpha', world: 'real', position: { x: 1, y: 1 }, initialOpen: false },
      { id: 'door-20-gate-beta', world: 'shadow', position: { x: 6, y: 4 }, initialOpen: false },

      // Inversion indicators
      { id: 'door-20-ind-alpha', world: 'real', position: { x: 0, y: 2 }, initialOpen: false },
      { id: 'door-20-ind-beta', world: 'shadow', position: { x: 7, y: 3 }, initialOpen: false },

      // Conduit doors
      { id: 'door-20-real-conduit', world: 'real', position: { x: 3, y: 3 }, initialOpen: false },
      { id: 'door-20-shadow-conduit', world: 'shadow', position: { x: 4, y: 2 }, initialOpen: false },

      // Fixed Exit threshold doors guarding corner exits
      { id: 'door-20-exit-real', world: 'real', position: { x: 6, y: 5 }, initialOpen: false, activationRule: 'ANY' },
      { id: 'door-20-exit-shadow', world: 'shadow', position: { x: 1, y: 0 }, initialOpen: false, activationRule: 'ANY' },
    ],

    switches: [
      // Pre-chamber keys:
      // In Shadow: key to Alpha at (5, 1)
      { id: 'sw-20-key-alpha', world: 'shadow', position: { x: 5, y: 1 }, linkedDoorId: 'door-20-gate-alpha', activationBehavior: 'ACTIVATE_ONLY' },
      // In Real: key to Beta at (2, 4) (180° counterpart: 7-5=2, 5-1=4)
      { id: 'sw-20-key-beta', world: 'real', position: { x: 2, y: 4 }, linkedDoorId: 'door-20-gate-beta', activationBehavior: 'ACTIVATE_ONLY' },

      // Inversion Switches
      // Alpha at (1, 0) in Real
      { id: 'sw-20-alpha', world: 'real', position: { x: 1, y: 0 }, linkedDoorId: 'door-20-ind-alpha', activationBehavior: 'ACTIVATE_ONLY' },
      // Beta at (6, 5) in Shadow
      { id: 'sw-20-beta', world: 'shadow', position: { x: 6, y: 5 }, linkedDoorId: 'door-20-ind-beta', activationBehavior: 'ACTIVATE_ONLY' },

      // Post-inversion Conduit Switches:
      // When Real inverts, Real at (1, 0) maps to (6, 5).
      // Upper terrace conduit switch at (5, 2) in Real opens door-20-shadow-conduit!
      { id: 'sw-20-conduit-a', world: 'real', position: { x: 5, y: 2 }, linkedDoorId: 'door-20-shadow-conduit', activationBehavior: 'ACTIVATE_ONLY' },
      // Subterranean conduit switch at (2, 3) in Shadow opens door-20-real-conduit! (180° counterpart: 7-5=2, 5-2=3)
      { id: 'sw-20-conduit-b', world: 'shadow', position: { x: 2, y: 3 }, linkedDoorId: 'door-20-real-conduit', activationBehavior: 'ACTIVATE_ONLY' },

      // Exit Gate Switches (unlocked after crossing conduit):
      // In Shadow: exit gate switch at (1, 3) unlocks both exits
      { id: 'sw-20-exit-gate-a', world: 'shadow', position: { x: 1, y: 3 }, linkedDoorId: 'door-20-exit-real', activationBehavior: 'ACTIVATE_ONLY' },
      { id: 'sw-20-exit-gate-a2', world: 'shadow', position: { x: 1, y: 3 }, linkedDoorId: 'door-20-exit-shadow', activationBehavior: 'ACTIVATE_ONLY' },

      // In Real: exit gate switch at (6, 2) unlocks both exits (180° counterpart: 7-1=6, 5-3=2)
      { id: 'sw-20-exit-gate-b', world: 'real', position: { x: 6, y: 2 }, linkedDoorId: 'door-20-exit-real', activationBehavior: 'ACTIVATE_ONLY' },
      { id: 'sw-20-exit-gate-b2', world: 'real', position: { x: 6, y: 2 }, linkedDoorId: 'door-20-exit-shadow', activationBehavior: 'ACTIVATE_ONLY' },
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
        targetPosition: { x: 6, y: 5 },
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
        targetPosition: { x: 1, y: 0 },
        action: 'COLLAPSE_TILE',
        animation: 'crumble',
        sound: 'crumble',
        repeatable: false,
      },
    ],
    solutionTrace: [],
  };
}

const level = createCandidateLevel20();
console.log('Validating Candidate Level 20 with LevelSolver...');
const t0 = Date.now();
const res = LevelSolver.solve(level, { maxStates: 30000, maxDepth: 45 });
console.log('Elapsed:', Date.now() - t0, 'ms');
console.log('Solution found:', res.solutionFound);
console.log('Length:', res.solutionLength);
console.log('Explored states:', res.exploredStateCount);
console.log('Limit reached:', res.searchLimitReached);
if (res.solutionFound) {
  console.log('Sequence:', res.solutionSequence.join(', '));
} else {
  console.log('Details:', res.errorDetails);
}
