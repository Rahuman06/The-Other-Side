import { LEVEL_20_V9 } from './test_hard_v9';
import { LevelSolver } from '../src/solver/LevelSolver';

console.log('Testing LEVEL_20_V9 with LevelSolver.solve()...');
const t0 = Date.now();
const result = LevelSolver.solve(LEVEL_20_V9, { maxStates: 15000, maxDepth: 40 });
console.log('Elapsed:', Date.now() - t0, 'ms');
console.log('Solution found:', result.solutionFound);
console.log('Solution length:', result.solutionLength);
console.log('Explored states:', result.exploredStateCount);
console.log('Search limit reached:', result.searchLimitReached);
if (result.solutionFound) {
  console.log('Sequence:', result.solutionSequence.join(', '));
} else {
  console.log('Error/details:', result.errorDetails);
}
