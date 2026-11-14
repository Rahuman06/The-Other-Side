import { LevelDefinition } from '../src/types/level';
import { LevelValidator } from '../src/solver/LevelValidator';
import { LevelSolver } from '../src/solver/LevelSolver';
import { LevelFactory } from '../src/levels/LevelFactory';
import { MoveDirection } from '../src/engine/MovementEngine';

export const level20Complete: LevelDefinition = {
  id: 20,
  chapter: 'THE TRUTH',
  name: 'The Labyrinth of Consequences',
  width: 15,
  height: 10,
  difficulty: 'MASTER',
  hint: 'Two worlds. One mind. The Labyrinth responds to the sequence of your choices—Real first or Shadow first.',
  realStart: { x: 1, y: 1 },
  shadowStart: { x: 13, y: 1 },
  realExit: { x: 13, y: 8 },
  shadowExit: { x: 1, y: 8 },
  realWalls: [
    // Outer boundary
    ...Array.from({ length: 15 }, (_, x) => ({ x, y: 0 })),
    ...Array.from({ length: 15 }, (_, x) => ({ x, y: 9 })),
    ...Array.from({ length: 10 }, (_, y) => ({ x: 0, y })),
    ...Array.from({ length: 10 }, (_, y) => ({ x: 14, y })),

    // Upper Zone Vertical Dividers (y=1..3)
    { x: 4, y: 2 }, { x: 4, y: 3 }, // Divides Z1 and Z2 (door at x=4, y=1)
    { x: 8, y: 2 }, { x: 8, y: 3 }, // Divides Z2 and Z3 (door/arch at x=8, y=1)
    { x: 11, y: 2 }, { x: 11, y: 3 }, // Divides Z3 and Z4 (door at x=11, y=1)

    // Horizontal Zone Divider (y=4) separating Upper (Z1-4) from Lower (Z5-6)
    { x: 1, y: 4 }, { x: 2, y: 4 }, { x: 4, y: 4 }, { x: 5, y: 4 },
    { x: 7, y: 4 }, { x: 8, y: 4 }, { x: 10, y: 4 }, { x: 11, y: 4 }, { x: 13, y: 4 },

    // Lower Zone Internal Walls (y=5..8)
    { x: 7, y: 5 }, { x: 7, y: 6 }, { x: 7, y: 8 }, // Divides Z5 and Z6 (door at y=7)
    { x: 11, y: 5 }, { x: 11, y: 6 }, { x: 11, y: 7 }, { x: 11, y: 8 }, // Encloses exit corridor in Z6
    { x: 3, y: 6 }, { x: 3, y: 7 }, // Buffer wall in Z5
  ],
  shadowWalls: [
    // Outer boundary
    ...Array.from({ length: 15 }, (_, x) => ({ x, y: 0 })),
    ...Array.from({ length: 15 }, (_, x) => ({ x, y: 9 })),
    ...Array.from({ length: 10 }, (_, y) => ({ x: 0, y })),
    ...Array.from({ length: 10 }, (_, y) => ({ x: 14, y })),

    // Upper Zone Vertical Dividers (y=1..3)
    { x: 10, y: 2 }, { x: 10, y: 3 }, // Divides Z1 and Z2 (door at x=10, y=1)
    { x: 6, y: 2 }, { x: 6, y: 3 }, // Divides Z2 and Z3 (arch at x=6, y=1)
    { x: 3, y: 2 }, { x: 3, y: 3 }, // Divides Z3 and Z4 (door at x=3, y=1)

    // Horizontal Zone Divider (y=4) separating Upper from Lower
    { x: 13, y: 4 }, { x: 12, y: 4 }, { x: 10, y: 4 }, { x: 9, y: 4 },
    { x: 7, y: 4 }, { x: 6, y: 4 }, { x: 4, y: 4 }, { x: 3, y: 4 }, { x: 1, y: 4 },

    // Lower Zone Internal Walls (y=5..8)
    { x: 7, y: 5 }, { x: 7, y: 6 }, { x: 7, y: 8 }, // Divides Z5 and Z6 (door at y=7)
    { x: 3, y: 5 }, { x: 3, y: 6 }, { x: 3, y: 7 }, { x: 3, y: 8 }, // Encloses exit corridor in Z6
    { x: 11, y: 6 }, { x: 11, y: 7 }, // Buffer wall in Z5
  ],
  doors: [
    // Zone 1 Gates
    { id: 'd-r1', world: 'real', position: { x: 4, y: 1 }, initialOpen: false },
    { id: 'd-s1', world: 'shadow', position: { x: 10, y: 1 }, initialOpen: false },

    // Zone 3 Optical Gates
    { id: 'd-opt-r', world: 'real', position: { x: 11, y: 1 }, initialOpen: false },
    { id: 'd-opt-s', world: 'shadow', position: { x: 3, y: 1 }, initialOpen: false },

    // Zone 4 Magnetic Bypass Gates
    { id: 'd-mag-r', world: 'real', position: { x: 12, y: 5 }, initialOpen: false },
    { id: 'd-mag-s', world: 'shadow', position: { x: 2, y: 5 }, initialOpen: false },

    // Zone 5 to Zone 6 Transition Gates
    { id: 'd-mid-r', world: 'real', position: { x: 7, y: 7 }, initialOpen: false },
    { id: 'd-mid-s', world: 'shadow', position: { x: 7, y: 7 }, initialOpen: false },

    // Final Exit Chamber Doors
    { id: 'd-final-r', world: 'real', position: { x: 12, y: 8 }, initialOpen: false },
    { id: 'd-final-s', world: 'shadow', position: { x: 2, y: 8 }, initialOpen: false },
  ],
  switches: [
    // Zone 1 Switches
    { id: 'sw-r1', world: 'real', position: { x: 2, y: 3 }, linkedDoorId: 'd-r1', initialActive: false },
    { id: 'sw-s1', world: 'shadow', position: { x: 12, y: 3 }, linkedDoorId: 'd-s1', initialActive: false },

    // Zone 2 Laser Activation Switches
    { id: 'sw-laser-r', world: 'real', position: { x: 7, y: 1 }, linkedDoorId: 'le-r1', initialActive: true },
    { id: 'sw-laser-s', world: 'shadow', position: { x: 7, y: 1 }, linkedDoorId: 'le-s1', initialActive: true },

    // Zone 4 Magnetic Field Switches
    { id: 'sw-mag-r', world: 'real', position: { x: 13, y: 1 }, linkedDoorId: 'mf-s1', initialActive: false },
    { id: 'sw-mag-s', world: 'shadow', position: { x: 1, y: 1 }, linkedDoorId: 'mf-r1', initialActive: false },

    // Zone 5 Middle Transition Switches
    { id: 'sw-mid-r', world: 'real', position: { x: 2, y: 7 }, linkedDoorId: 'd-mid-r', initialActive: false },
    { id: 'sw-mid-s', world: 'shadow', position: { x: 12, y: 7 }, linkedDoorId: 'd-mid-s', initialActive: false },

    // Zone 6 Final Sync Switches
    { id: 'sw-sync-r', world: 'real', position: { x: 12, y: 7 }, linkedDoorId: 'd-final-r', initialActive: false },
    { id: 'sw-sync-s', world: 'shadow', position: { x: 2, y: 7 }, linkedDoorId: 'd-final-s', initialActive: false },
  ],
  pressurePlates: [
    // Zone 1 Cross-World Plates
    { id: 'pl-r1', world: 'real', position: { x: 1, y: 3 }, linkedDoorId: 'd-s1' },
    { id: 'pl-s1', world: 'shadow', position: { x: 13, y: 3 }, linkedDoorId: 'd-r1' },

    // Zone 4 Magnetic Plates
    { id: 'pl-mag-r', world: 'real', position: { x: 13, y: 3 }, linkedDoorId: 'd-mag-s' },
    { id: 'pl-mag-s', world: 'shadow', position: { x: 1, y: 3 }, linkedDoorId: 'd-mag-r' },
  ],
  bombs: [
    { id: 'bomb-r1', world: 'real', position: { x: 5, y: 2 }, timer: 4, radius: 1, crossWorld: true },
    { id: 'bomb-s1', world: 'shadow', position: { x: 9, y: 2 }, timer: 4, radius: 1, crossWorld: true },
  ],
  destructibleWalls: [
    { id: 'dw-r1', world: 'real', position: { x: 6, y: 2 } },
    { id: 'dw-s1', world: 'shadow', position: { x: 8, y: 2 } },
  ],
  collapsingFloors: [
    { id: 'cf-r1', world: 'real', position: { x: 7, y: 2 }, stepsToCollapse: 2 },
    { id: 'cf-s1', world: 'shadow', position: { x: 7, y: 2 }, stepsToCollapse: 2 },
    { id: 'cf-perm-r', world: 'real', position: { x: 3, y: 4 }, stepsToCollapse: 1 },
    { id: 'cf-perm-s', world: 'shadow', position: { x: 11, y: 4 }, stepsToCollapse: 1 },
  ],
  laserEmitters: [
    { id: 'le-r1', world: 'real', position: { x: 9, y: 3 }, direction: 'right', initialActive: true },
    { id: 'le-s1', world: 'shadow', position: { x: 5, y: 3 }, direction: 'left', initialActive: true },
  ],
  laserMirrors: [
    { id: 'lm-r1', world: 'real', position: { x: 10, y: 3 }, orientation: '/' },
    { id: 'lm-s1', world: 'shadow', position: { x: 4, y: 3 }, orientation: '\\' },
  ],
  laserReceivers: [
    { id: 'lr-r1', world: 'real', position: { x: 10, y: 2 }, linkedDoorId: 'd-opt-r' },
    { id: 'lr-s1', world: 'shadow', position: { x: 4, y: 2 }, linkedDoorId: 'd-opt-s' },
  ],
  movingHazards: [
    { id: 'saw-r1', world: 'real', path: [{ x: 5, y: 6 }, { x: 6, y: 6 }, { x: 5, y: 6 }] },
    { id: 'saw-s1', world: 'shadow', path: [{ x: 9, y: 6 }, { x: 8, y: 6 }, { x: 9, y: 6 }] },
  ],
  timeLocks: [
    { id: 'tl-r1', world: 'real', position: { x: 12, y: 6 }, duration: 8, targetHazardIds: ['saw-r1', 'saw-s1'] },
    { id: 'tl-s1', world: 'shadow', position: { x: 2, y: 6 }, duration: 8, targetHazardIds: ['saw-r1', 'saw-s1'] },
  ],
  movableBlocks: [
    { id: 'mb-r1', world: 'real', position: { x: 13, y: 2 }, magneticType: 'ATTRACT' },
    { id: 'mb-s1', world: 'shadow', position: { x: 1, y: 2 }, magneticType: 'ATTRACT' },
  ],
  magneticFields: [
    { id: 'mf-r1', world: 'real', position: { x: 13, y: 5 }, direction: 'up', polarity: 'ATTRACT', initialActive: false },
    { id: 'mf-s1', world: 'shadow', position: { x: 1, y: 5 }, direction: 'up', polarity: 'ATTRACT', initialActive: false },
  ],
  portals: [
    { id: 'port-r1', world: 'real', position: { x: 12, y: 3 }, targetWorld: 'real', targetPosition: { x: 12, y: 6 } },
    { id: 'port-s1', world: 'shadow', position: { x: 2, y: 3 }, targetWorld: 'shadow', targetPosition: { x: 2, y: 6 } },
  ],
  surpriseEvents: [
    {
      id: 'se-labyrinth-collapse',
      triggerType: 'STEP_ON',
      triggerPosition: { x: 12, y: 6 },
      targetType: 'WALL',
      targetPosition: { x: 12, y: 4 },
      actionType: 'SPAWN_WALL',
      animationType: 'crumble',
      soundCue: 'wall_shift',
      warningClue: 'A tremor seals the upper conduit as the final sync begins!',
    },
  ],
  solutionTrace: [
    'right', 'down', 'down', 'up', 'up', 'right', 'right', 'right', 'right', 'right', 'right', 'right', 'right', 'right', 'right', 'down', 'down', 'right', 'down', 'down'
  ],
};

const v = LevelValidator.validateSchema(level20Complete);
console.log('Schema Valid with surpriseEvents:', v.valid, v.errors);

const solveResult = LevelSolver.solve(level20Complete, { maxStates: 30000, maxDepth: 35 });
console.log('Solver Result:', solveResult.solutionFound, 'length:', solveResult.solutionLength, 'verified:', solveResult.replayVerified);

const repA = LevelValidator.replaySolution(level20Complete, [
  'down', 'down', 'right', 'up', 'up', 'right', 'right', 'right', 'down', 'up', 'right', 'right', 'down', 'left', 'up', 'right', 'right', 'right', 'right', 'right', 'right', 'down', 'down', 'down', 'down', 'right'
]);
console.log('Solution A replay:', repA.success, repA.completed, 'pos:', repA.finalPlayerPos, repA.finalShadowPos);

const repB = LevelValidator.replaySolution(level20Complete, [
  'right', 'down', 'down', 'up', 'up', 'right', 'right', 'right', 'right', 'right', 'right', 'right', 'right', 'right', 'right', 'down', 'down', 'right', 'down', 'down'
]);
console.log('Solution B replay:', repB.success, repB.completed, 'pos:', repB.finalPlayerPos, repB.finalShadowPos);
