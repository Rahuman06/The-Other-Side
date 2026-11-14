import { LevelDefinition } from '../src/types/level';
import { LevelSolver } from '../src/solver/LevelSolver';
import { LevelValidator } from '../src/solver/LevelValidator';

export function createCalibratedLevel(): LevelDefinition {
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
    realExit: { x: 13, y: 13 },
    shadowExit: { x: 1, y: 13 },
    realWalls: [
      // Outer boundary (15x15)
      ...Array.from({ length: 15 }, (_, x) => ({ x, y: 0 })),
      ...Array.from({ length: 15 }, (_, x) => ({ x, y: 14 })),
      ...Array.from({ length: 15 }, (_, y) => ({ x: 0, y })),
      ...Array.from({ length: 15 }, (_, y) => ({ x: 14, y })),

      // ================= Tier 1 Partitions (y=1..3) =================
      // Real Upper Corridor serpentine: (1,1) -> (1,2) -> (2,2) -> (3,2) -> (3,1) -> (5,1) -> (5,3) -> (3,3) -> (2,3) -> (1,3)
      { x: 2, y: 1 },
      { x: 4, y: 1 }, { x: 4, y: 2 },
      { x: 6, y: 2 }, { x: 6, y: 3 },
      { x: 2, y: 3 },
      // Tier 1 -> Tier 2 Wall at y=4: SOLID except gate at (4,4)
      { x: 1, y: 4 }, { x: 2, y: 4 }, { x: 3, y: 4 }, /* gate at (4,4) */
      { x: 5, y: 4 }, { x: 6, y: 4 }, { x: 7, y: 4 }, { x: 8, y: 4 },
      { x: 9, y: 4 }, { x: 10, y: 4 }, { x: 11, y: 4 }, { x: 12, y: 4 }, { x: 13, y: 4 },

      // ================= Tier 2 Partitions (y=5..7) =================
      // Obsidian Cell & West Wing corridors
      { x: 1, y: 6 },
      { x: 3, y: 5 }, { x: 3, y: 6 },
      { x: 5, y: 6 }, { x: 5, y: 7 },
      { x: 7, y: 5 }, { x: 7, y: 6 }, { x: 7, y: 7 },
      { x: 9, y: 5 }, { x: 9, y: 6 },
      { x: 11, y: 6 }, { x: 11, y: 7 },
      // Tier 2 -> Tier 3 Wall at y=8: SOLID except Obsidian Cell Exit at (4,8)
      { x: 1, y: 8 }, { x: 2, y: 8 }, { x: 3, y: 8 }, /* exit gate at (4,8) */
      { x: 5, y: 8 }, { x: 6, y: 8 }, { x: 7, y: 8 }, { x: 8, y: 8 },
      { x: 9, y: 8 }, { x: 10, y: 8 }, { x: 11, y: 8 }, { x: 12, y: 8 }, { x: 13, y: 8 },

      // ================= Tier 3 Partitions (y=9..11) =================
      // Dual Prism Real Cell enclosure (x=4..7, y=9..11)
      { x: 3, y: 9 }, { x: 5, y: 9 }, { x: 7, y: 9 }, /* path through (4,9) -> (4,10) -> (6,10) */
      { x: 3, y: 10 }, { x: 3, y: 11 },
      { x: 7, y: 10 }, { x: 7, y: 11 },
      // Corridors leading to cell
      { x: 1, y: 9 }, { x: 1, y: 10 }, { x: 1, y: 11 },
      { x: 9, y: 10 }, { x: 9, y: 11 },
      // Tier 3 -> Tier 4 Wall at y=12: SOLID except gate at (6,12)
      { x: 1, y: 12 }, { x: 2, y: 12 }, { x: 3, y: 12 }, { x: 4, y: 12 }, { x: 5, y: 12 }, /* gate at (6,12) */
      { x: 7, y: 12 }, { x: 8, y: 12 }, { x: 9, y: 12 }, { x: 10, y: 12 }, { x: 11, y: 12 }, { x: 12, y: 12 }, { x: 13, y: 12 },

      // ================= Tier 4 Partitions (y=13) =================
      { x: 12, y: 12 }, { x: 12, y: 14 },
    ],
    shadowWalls: [
      // Outer boundary (15x15)
      ...Array.from({ length: 15 }, (_, x) => ({ x, y: 0 })),
      ...Array.from({ length: 15 }, (_, x) => ({ x, y: 14 })),
      ...Array.from({ length: 15 }, (_, y) => ({ x: 0, y })),
      ...Array.from({ length: 15 }, (_, y) => ({ x: 14, y })),

      // ================= Tier 1 Partitions (y=1..3) =================
      // Shadow Upper Corridor serpentine: (13,1) -> (13,2) -> (12,2) -> (11,2) -> (11,1) -> (9,1) -> (9,3) -> (11,3) -> (12,3) -> (13,3)
      { x: 12, y: 1 },
      { x: 10, y: 1 }, { x: 10, y: 2 },
      { x: 8, y: 2 }, { x: 8, y: 3 },
      { x: 12, y: 3 },
      // Tier 1 -> Tier 2 Wall at y=4: SOLID except gate at (10,4)
      { x: 1, y: 4 }, { x: 2, y: 4 }, { x: 3, y: 4 }, { x: 4, y: 4 },
      { x: 5, y: 4 }, { x: 6, y: 4 }, { x: 7, y: 4 }, { x: 8, y: 4 },
      { x: 9, y: 4 }, /* gate at (10,4) */ { x: 11, y: 4 }, { x: 12, y: 4 }, { x: 13, y: 4 },

      // ================= Tier 2 Partitions (y=5..7) =================
      // Spectral Vault & East Wing corridors
      { x: 13, y: 6 },
      { x: 11, y: 5 }, { x: 11, y: 6 },
      { x: 9, y: 6 }, { x: 9, y: 7 },
      { x: 7, y: 5 }, { x: 7, y: 6 }, { x: 7, y: 7 },
      { x: 5, y: 5 }, { x: 5, y: 6 },
      { x: 3, y: 6 }, { x: 3, y: 7 },
      // Tier 2 -> Tier 3 Wall at y=8: SOLID except Spectral Vault Exit at (10,8)
      { x: 1, y: 8 }, { x: 2, y: 8 }, { x: 3, y: 8 }, { x: 4, y: 8 },
      { x: 5, y: 8 }, { x: 6, y: 8 }, { x: 7, y: 8 }, { x: 8, y: 8 },
      { x: 9, y: 8 }, /* exit gate at (10,8) */ { x: 11, y: 8 }, { x: 12, y: 8 }, { x: 13, y: 8 },

      // ================= Tier 3 Partitions (y=9..11) =================
      // Dual Prism Shadow Cell enclosure (x=7..10, y=9..11)
      { x: 7, y: 9 }, { x: 9, y: 9 }, { x: 11, y: 9 }, /* path through (10,9) -> (10,10) -> (8,10) */
      { x: 7, y: 10 }, { x: 7, y: 11 },
      { x: 11, y: 10 }, { x: 11, y: 11 },
      // Corridors leading to cell
      { x: 13, y: 9 }, { x: 13, y: 10 }, { x: 13, y: 11 },
      { x: 5, y: 10 }, { x: 5, y: 11 },
      // Tier 3 -> Tier 4 Wall at y=12: SOLID except gate at (8,12)
      { x: 1, y: 12 }, { x: 2, y: 12 }, { x: 3, y: 12 }, { x: 4, y: 12 }, { x: 5, y: 12 },
      { x: 6, y: 12 }, { x: 7, y: 12 }, /* gate at (8,12) */ { x: 9, y: 12 }, { x: 10, y: 12 }, { x: 11, y: 12 }, { x: 12, y: 12 }, { x: 13, y: 12 },

      // ================= Tier 4 Partitions (y=13) =================
      { x: 2, y: 12 }, { x: 2, y: 14 },
    ],
    doors: [
      // Milestone 1: Tier 1 Security Gates
      { id: 'd-r1', world: 'real', position: { x: 4, y: 4 }, initialOpen: false },
      { id: 'd-s1', world: 'shadow', position: { x: 10, y: 4 }, initialOpen: false },

      // Milestone 2: Obsidian Cell Exit Bulkhead (Opened by Shadow at 12,7)
      { id: 'd-obs-out', world: 'real', position: { x: 4, y: 8 }, initialOpen: false },

      // Milestone 3: Spectral Vault Exit Bulkhead (Opened by Real at 2,7)
      { id: 'd-spec-out', world: 'shadow', position: { x: 10, y: 8 }, initialOpen: false },

      // Milestone 4: Dual Prism Exit Gates
      { id: 'd-prism-out-r', world: 'real', position: { x: 6, y: 12 }, initialOpen: false },
      { id: 'd-prism-out-s', world: 'shadow', position: { x: 8, y: 12 }, initialOpen: false },

      // Milestone 5: Final Exit Gates
      { id: 'd-exit-r', world: 'real', position: { x: 12, y: 13 }, initialOpen: false },
      { id: 'd-exit-s', world: 'shadow', position: { x: 2, y: 13 }, initialOpen: false },
    ],
    switches: [
      // Tier 1 Switches
      { id: 'sw-t1-r', world: 'real', position: { x: 1, y: 3 }, linkedDoorId: 'd-s1', initialActive: false },
      { id: 'sw-t1-s', world: 'shadow', position: { x: 13, y: 3 }, linkedDoorId: 'd-r1', initialActive: false },

      // Rescue 1: Shadow in East Wing (12,7) opens Obsidian Cell Exit (4,8) for Real
      { id: 'sw-rescue-r', world: 'shadow', position: { x: 12, y: 7 }, linkedDoorId: 'd-obs-out', initialActive: false },

      // Rescue 2: Real in West Wing (2,7) opens Spectral Vault Exit (10,8) for Shadow
      { id: 'sw-rescue-s', world: 'real', position: { x: 2, y: 7 }, linkedDoorId: 'd-spec-out', initialActive: false },

      // Dual Prism Mutual Release:
      // Real steps on (6,11) inside prism cell -> opens Shadow's exit (8,12)
      { id: 'sw-prism-r', world: 'real', position: { x: 6, y: 11 }, linkedDoorId: 'd-prism-out-s', initialActive: false },
      // Shadow steps on (8,11) inside prism cell -> opens Real's exit (6,12)
      { id: 'sw-prism-s', world: 'shadow', position: { x: 8, y: 11 }, linkedDoorId: 'd-prism-out-r', initialActive: false },

      // Milestone 5: Final Exit Cross-Unlocks
      // Real hits switch at (9,13) to unlock Shadow's Exit Gate (2,13)
      { id: 'sw-final-s', world: 'real', position: { x: 9, y: 13 }, linkedDoorId: 'd-exit-s', initialActive: false },
      // Shadow hits switch at (5,13) to unlock Real's Exit Gate (12,13)
      { id: 'sw-final-r', world: 'shadow', position: { x: 5, y: 13 }, linkedDoorId: 'd-exit-r', initialActive: false },
    ],
    collapsingFloors: [
      { id: 'cf-r1', world: 'real', position: { x: 5, y: 1 }, stepsToCollapse: 2 },
      { id: 'cf-s1', world: 'shadow', position: { x: 9, y: 1 }, stepsToCollapse: 2 },
      { id: 'cf-r2', world: 'real', position: { x: 11, y: 13 }, stepsToCollapse: 1 },
      { id: 'cf-s2', world: 'shadow', position: { x: 3, y: 13 }, stepsToCollapse: 1 },
    ],
    movingHazards: [
      { id: 'saw-r1', world: 'real', path: [{ x: 8, y: 6 }, { x: 8, y: 7 }, { x: 8, y: 6 }] },
      { id: 'saw-s1', world: 'shadow', path: [{ x: 6, y: 6 }, { x: 6, y: 7 }, { x: 6, y: 6 }] },
    ],
    solutionTrace: [],
  };
}

const level = createCalibratedLevel();
const validation = LevelValidator.validateSchema(level);
console.log('Schema valid:', validation.valid, validation.errors);

const start = performance.now();
const res = LevelSolver.solve(level, { maxDepth: 160, maxStates: 100000 });
const timeTaken = (performance.now() - start).toFixed(1);

console.log('Solver finished in ' + timeTaken + 'ms:');
console.log('Solution found:', res.solutionFound);
console.log('Solution length:', res.solutionLength);
console.log('Explored states:', res.exploredStateCount);
console.log('Search limit reached:', res.searchLimitReached);
console.log('Error details:', res.errorDetails);
if (res.solutionFound) {
  console.log('Moves (' + res.solutionLength + '):', res.solutionSequence.join(', '));
}


