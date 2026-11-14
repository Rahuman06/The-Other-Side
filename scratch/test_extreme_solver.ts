import { LevelDefinition } from '../src/types/level';
import { LevelSolver, Direction } from '../src/solver/LevelSolver';
import { LevelFactory, BuiltLevelSession } from '../src/levels/LevelFactory';
import { LevelValidator } from '../src/solver/LevelValidator';

export function createExtremeCandidate(): LevelDefinition {
  return {
    id: 20,
    chapter: 'THE TRUTH',
    name: 'The Impossible Connection',
    width: 9,
    height: 7,
    difficulty: 'MASTER',
    hint: 'Two worlds. One mind. Every action shifts the balance of both realities. Choose your cascade.',
    realStart: { x: 1, y: 3 },
    shadowStart: { x: 7, y: 3 },
    realExit: { x: 8, y: 5 },
    shadowExit: { x: 0, y: 5 },

    realWalls: [
      // Outer perimeter corners
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: 0, y: 6 },
      { x: 2, y: 6 },

      // Central divider column x=3, x=4, x=5
      { x: 3, y: 0 },
      { x: 3, y: 1 },
      // (3, 2) is door-20-real-gate1
      { x: 3, y: 3 },
      { x: 3, y: 5 },
      { x: 3, y: 6 },

      { x: 5, y: 0 },
      // (5, 1) is portal-20-real
      // (5, 2) is door-20-real-gate2
      { x: 5, y: 4 },
      { x: 5, y: 5 },
      { x: 5, y: 6 },

      // East Wing baffles & Exit vault enclosure at (8, 5)
      { x: 6, y: 0 },
      { x: 8, y: 0 },
      { x: 8, y: 4 },
      { x: 7, y: 4 },
      { x: 7, y: 6 },
      { x: 8, y: 6 },
    ],

    shadowWalls: [
      // Outer perimeter corners
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: 0, y: 4 },
      { x: 1, y: 4 },
      { x: 0, y: 6 },
      { x: 1, y: 6 },
      { x: 2, y: 6 },

      // Central divider column x=3, x=4, x=5
      { x: 3, y: 0 },
      // (3, 1) is portal-20-shadow
      // (3, 2) is door-20-shadow-gate1
      { x: 3, y: 3 },
      { x: 3, y: 5 },
      { x: 3, y: 6 },

      { x: 5, y: 0 },
      { x: 5, y: 1 },
      // (5, 2) is door-20-shadow-gate2
      { x: 5, y: 3 },
      { x: 5, y: 5 },
      { x: 5, y: 6 },

      // East Wing baffles
      { x: 6, y: 0 },
      { x: 8, y: 0 },
      { x: 6, y: 6 },
      { x: 8, y: 6 },
    ],

    doors: [
      // Real World Doors
      { id: 'door-20-real-gate1', world: 'real', position: { x: 3, y: 2 }, initialOpen: false },
      { id: 'door-20-real-gate2', world: 'real', position: { x: 5, y: 2 }, initialOpen: false },
      { id: 'door-20-real-laser', world: 'real', position: { x: 6, y: 2 }, initialOpen: false },
      { id: 'door-20-real-exit', world: 'real', position: { x: 7, y: 5 }, initialOpen: false, activationRule: 'ANY' },

      // Shadow World Doors
      { id: 'door-20-shadow-gate1', world: 'shadow', position: { x: 3, y: 2 }, initialOpen: false },
      { id: 'door-20-shadow-gate2', world: 'shadow', position: { x: 5, y: 2 }, initialOpen: false },
      { id: 'door-20-shadow-tl', world: 'shadow', position: { x: 2, y: 2 }, initialOpen: false },
      { id: 'door-20-shadow-exit', world: 'shadow', position: { x: 1, y: 5 }, initialOpen: false, activationRule: 'ANY' },
    ],

    pressurePlates: [
      // Real Plate A: Activates Shadow Gate 1
      { id: 'pp-20-real-a', world: 'real', position: { x: 0, y: 2 }, linkedDoorId: 'door-20-shadow-gate1' },
      // Real Plate B: Activates Shadow Gate 2
      { id: 'pp-20-real-b', world: 'real', position: { x: 2, y: 4 }, linkedDoorId: 'door-20-shadow-gate2' },

      // Shadow Plate A: Activates Real Gate 1
      { id: 'pp-20-shadow-a', world: 'shadow', position: { x: 8, y: 2 }, linkedDoorId: 'door-20-real-gate1' },
      // Shadow Plate B: Activates Real Gate 2
      { id: 'pp-20-shadow-b', world: 'shadow', position: { x: 6, y: 4 }, linkedDoorId: 'door-20-real-gate2' },
    ],

    switches: [
      // Real Switches
      { id: 'sw-20-real-mag', world: 'real', position: { x: 1, y: 1 }, linkedDoorId: 'door-20-real-gate1', activationBehavior: 'TOGGLE' },
      { id: 'sw-20-real-sync-a', world: 'real', position: { x: 7, y: 2 }, linkedDoorId: 'door-20-real-exit', activationBehavior: 'ACTIVATE_ONLY' },
      { id: 'sw-20-real-sync-a2', world: 'real', position: { x: 7, y: 2 }, linkedDoorId: 'door-20-shadow-exit', activationBehavior: 'ACTIVATE_ONLY' },

      // Shadow Switches
      { id: 'sw-20-shadow-mag', world: 'shadow', position: { x: 7, y: 1 }, linkedDoorId: 'door-20-shadow-gate1', activationBehavior: 'TOGGLE' },
      { id: 'sw-20-shadow-sync-b', world: 'shadow', position: { x: 1, y: 2 }, linkedDoorId: 'door-20-real-exit', activationBehavior: 'ACTIVATE_ONLY' },
      { id: 'sw-20-shadow-sync-b2', world: 'shadow', position: { x: 1, y: 2 }, linkedDoorId: 'door-20-shadow-exit', activationBehavior: 'ACTIVATE_ONLY' },
    ],

    laserEmitters: [
      { id: 'le-20-real', world: 'real', position: { x: 0, y: 4 }, direction: 'right', initialActive: false },
      { id: 'le-20-shadow', world: 'shadow', position: { x: 8, y: 4 }, direction: 'left', initialActive: false },
    ],

    laserMirrors: [
      { id: 'lm-20-real', world: 'real', position: { x: 6, y: 4 }, orientation: '\\' },
      { id: 'lm-20-shadow', world: 'shadow', position: { x: 2, y: 4 }, orientation: '/' },
    ],

    laserReceivers: [
      { id: 'lr-20-real', world: 'real', position: { x: 6, y: 3 }, linkedDoorId: 'door-20-real-laser' },
      { id: 'lr-20-shadow', world: 'shadow', position: { x: 2, y: 3 }, linkedDoorId: 'door-20-shadow-tl' },
    ],

    magneticFields: [
      { id: 'mag-20-real', world: 'real', position: { x: 1, y: 0 }, direction: 'down', range: 4, polarity: 'ATTRACT', initialActive: false },
      { id: 'mag-20-shadow', world: 'shadow', position: { x: 7, y: 0 }, direction: 'down', range: 4, polarity: 'ATTRACT', initialActive: false },
    ],

    movableBlocks: [
      { id: 'block-20-real', world: 'real', position: { x: 2, y: 1 }, magneticType: 'ATTRACT' },
      { id: 'block-20-shadow', world: 'shadow', position: { x: 6, y: 1 }, magneticType: 'ATTRACT' },
    ],

    portals: [
      { id: 'portal-20-real', world: 'real', position: { x: 4, y: 1 }, targetWorld: 'shadow', targetPosition: { x: 4, y: 3 } },
      { id: 'portal-20-shadow', world: 'shadow', position: { x: 4, y: 5 }, targetWorld: 'real', targetPosition: { x: 4, y: 3 } },
    ],

    bombs: [
      { id: 'bomb-20-real', world: 'real', position: { x: 3, y: 4 }, timer: 2, radius: 1, crossWorld: true },
    ],

    destructibleWalls: [
      { id: 'dw-20-real', world: 'real', position: { x: 4, y: 4 } },
      { id: 'dw-20-shadow', world: 'shadow', position: { x: 4, y: 4 } },
    ],

    movingHazards: [
      {
        id: 'saw-20-shadow',
        world: 'shadow',
        path: [
          { x: 1, y: 1 },
          { x: 1, y: 2 },
        ],
      },
    ],

    timeLocks: [
      { id: 'tl-20-shadow', world: 'shadow', position: { x: 0, y: 1 }, duration: 4, targetHazardIds: ['saw-20-shadow'] },
    ],

    collapsingFloors: [
      { id: 'cf-20-real', world: 'real', position: { x: 6, y: 3 }, stepsToCollapse: 1 },
      { id: 'cf-20-shadow', world: 'shadow', position: { x: 2, y: 1 }, stepsToCollapse: 1 },
    ],

    surpriseEvents: [
      {
        id: 'se-20-bomb-cross',
        name: 'Cross-World Detonation Breach',
        triggerType: 'BOMB_DETONATED',
        triggerSourceId: 'bomb-20-real',
        targetWorld: 'shadow',
        targetType: 'WALL',
        targetPosition: { x: 3, y: 3 },
        action: 'REMOVE_WALL',
        animation: 'shockwave',
        sound: 'explosion',
        repeatable: false,
        warningClue: 'The blast resonates across realities — a passage shatters in the Shadow World',
      },
    ],

    solutionTrace: [],
  };
}

const level = createExtremeCandidate();
console.log('Validating with LevelSolver...');
const t0 = Date.now();
const res = LevelSolver.solve(level, { maxStates: 35000, maxDepth: 40 });
console.log('Elapsed:', Date.now() - t0, 'ms');
console.log('Solution found:', res.solutionFound);
console.log('Length:', res.solutionLength);
console.log('Explored states:', res.exploredStateCount);
console.log('Replay verified:', res.replayVerified);
if (res.solutionFound) {
  console.log('Sequence:', res.solutionSequence.join(', '));
} else {
  console.log('Details:', res.errorDetails);
}
