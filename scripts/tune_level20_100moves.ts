import { LevelDefinition } from '../src/types/level';
import { LevelSolver } from '../src/solver/LevelSolver';
import { LevelValidator } from '../src/solver/LevelValidator';

export function build108MoveLevel(): LevelDefinition {
  const realWalls = [
    // Outer boundary (15x15)
    ...Array.from({ length: 15 }, (_, x) => ({ x, y: 0 })),
    ...Array.from({ length: 15 }, (_, x) => ({ x, y: 14 })),
    ...Array.from({ length: 15 }, (_, y) => ({ x: 0, y })),
    ...Array.from({ length: 15 }, (_, y) => ({ x: 14, y })),

    // Row 2: Wall with gap at x=13
    ...Array.from({ length: 12 }, (_, i) => ({ x: i + 1, y: 2 })),

    // Row 4: Wall with gate d-r1 at x=1
    ...Array.from({ length: 12 }, (_, i) => ({ x: i + 2, y: 4 })),

    // Row 6: Wall with gap at x=13
    ...Array.from({ length: 12 }, (_, i) => ({ x: i + 1, y: 6 })),

    // Row 8: Wall with gate d-obs-out at x=1
    ...Array.from({ length: 12 }, (_, i) => ({ x: i + 2, y: 8 })),

    // Row 10: Wall with gap at x=13
    ...Array.from({ length: 12 }, (_, i) => ({ x: i + 1, y: 10 })),

    // Row 12: Wall with gate d-prism-out-r at x=7
    ...Array.from({ length: 6 }, (_, i) => ({ x: i + 1, y: 12 })), // x=1..6
    ...Array.from({ length: 6 }, (_, i) => ({ x: i + 8, y: 12 })), // x=8..13
  ];

  const shadowWalls = [
    // Outer boundary (15x15)
    ...Array.from({ length: 15 }, (_, x) => ({ x, y: 0 })),
    ...Array.from({ length: 15 }, (_, x) => ({ x, y: 14 })),
    ...Array.from({ length: 15 }, (_, y) => ({ x: 0, y })),
    ...Array.from({ length: 15 }, (_, y) => ({ x: 14, y })),

    // Row 2: Wall with gap at x=1
    ...Array.from({ length: 12 }, (_, i) => ({ x: i + 2, y: 2 })),

    // Row 4: Wall with gate d-s1 at x=13
    ...Array.from({ length: 12 }, (_, i) => ({ x: i + 1, y: 4 })),

    // Row 6: Wall with gap at x=1
    ...Array.from({ length: 12 }, (_, i) => ({ x: i + 2, y: 6 })),

    // Row 8: Wall with gate d-spec-out at x=13
    ...Array.from({ length: 12 }, (_, i) => ({ x: i + 1, y: 8 })),

    // Row 10: Wall with gap at x=1
    ...Array.from({ length: 12 }, (_, i) => ({ x: i + 2, y: 10 })),

    // Row 12: Wall with gate d-prism-out-s at x=7
    ...Array.from({ length: 6 }, (_, i) => ({ x: i + 1, y: 12 })), // x=1..6
    ...Array.from({ length: 6 }, (_, i) => ({ x: i + 8, y: 12 })), // x=8..13
  ];

  return {
    id: 20,
    chapter: 'THE TRUTH',
    name: 'The Impossible Dimension',
    width: 15,
    height: 15,
    difficulty: 'MASTER',
    hint: 'Two worlds. One mind. Neither character can escape alone. Three mutual rescues pave the only way forward.',
    realStart: { x: 1, y: 1 },
    shadowStart: { x: 13, y: 1 },
    realExit: { x: 1, y: 13 },
    shadowExit: { x: 13, y: 13 },
    realWalls,
    shadowWalls,
    doors: [
      // Row 4: Tier 1 Gates
      { id: 'd-r1', world: 'real', position: { x: 1, y: 4 }, initialOpen: false },
      { id: 'd-s1', world: 'shadow', position: { x: 13, y: 4 }, initialOpen: false },

      // Row 8: Rescue Gates
      { id: 'd-obs-out', world: 'real', position: { x: 1, y: 8 }, initialOpen: false },
      { id: 'd-spec-out', world: 'shadow', position: { x: 13, y: 8 }, initialOpen: false },

      // Row 12: Dual Prism Gates (at center x=7)
      { id: 'd-prism-out-r', world: 'real', position: { x: 7, y: 12 }, initialOpen: false },
      { id: 'd-prism-out-s', world: 'shadow', position: { x: 7, y: 12 }, initialOpen: false },

      // Row 13: Final Exit Gates (protecting the exits)
      { id: 'd-exit-r', world: 'real', position: { x: 2, y: 13 }, initialOpen: false },
      { id: 'd-exit-s', world: 'shadow', position: { x: 12, y: 13 }, initialOpen: false },
    ],
    switches: [
      // Row 3: Tier 1 Switches (at opposite ends)
      { id: 'sw-t1-r', world: 'real', position: { x: 2, y: 3 }, linkedDoorId: 'd-s1', initialActive: false },
      { id: 'sw-t1-s', world: 'shadow', position: { x: 12, y: 3 }, linkedDoorId: 'd-r1', initialActive: false },

      // Row 7: Rescue Switches
      { id: 'sw-rescue-r', world: 'shadow', position: { x: 12, y: 7 }, linkedDoorId: 'd-obs-out', initialActive: false },
      { id: 'sw-rescue-s', world: 'real', position: { x: 2, y: 7 }, linkedDoorId: 'd-spec-out', initialActive: false },

      // Row 11: Dual Prism Switches (at x=1 in Real, x=13 in Shadow)
      { id: 'sw-prism-r', world: 'real', position: { x: 1, y: 11 }, linkedDoorId: 'd-prism-out-s', initialActive: false },
      { id: 'sw-prism-s', world: 'shadow', position: { x: 13, y: 11 }, linkedDoorId: 'd-prism-out-r', initialActive: false },

      // Row 13: Final Cross-Unlocks (at x=13 in Real, x=1 in Shadow)
      { id: 'sw-final-s', world: 'real', position: { x: 13, y: 13 }, linkedDoorId: 'd-exit-s', initialActive: false },
      { id: 'sw-final-r', world: 'shadow', position: { x: 1, y: 13 }, linkedDoorId: 'd-exit-r', initialActive: false },
    ],
    collapsingFloors: [
      { id: 'cf-r1', world: 'real', position: { x: 7, y: 1 }, stepsToCollapse: 3 },
      { id: 'cf-s1', world: 'shadow', position: { x: 7, y: 1 }, stepsToCollapse: 3 },
      { id: 'cf-r2', world: 'real', position: { x: 7, y: 5 }, stepsToCollapse: 3 },
      { id: 'cf-s2', world: 'shadow', position: { x: 7, y: 5 }, stepsToCollapse: 3 },
    ],
    movingHazards: [],
    solutionTrace: [],
  };
}

const level = build108MoveLevel();
const validation = LevelValidator.validateSchema(level);
console.log('Schema valid:', validation.valid, validation.errors);

const start = performance.now();
const res = LevelSolver.solve(level, { maxDepth: 250, maxStates: 200000 });
const timeTaken = (performance.now() - start).toFixed(1);

console.log('Solver finished in ' + timeTaken + 'ms:');
console.log('Solution found:', res.solutionFound);
console.log('Solution length:', res.solutionLength);
console.log('Explored states:', res.exploredStateCount);
console.log('Search limit reached:', res.searchLimitReached);
console.log('Error details:', res.errorDetails);
if (res.solutionFound) {
  console.log('Moves (' + res.solutionLength + '):');
  console.log(JSON.stringify(res.solutionSequence));

  const replay = LevelValidator.replaySolution(level, res.solutionSequence);
  console.log('Replay verified:', replay.success, 'Completed:', replay.completed);
}


