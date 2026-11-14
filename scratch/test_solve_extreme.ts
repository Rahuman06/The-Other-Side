import { LEVEL_20_EXTREME } from './prototype_level20_extreme';
import { LevelSolver } from '../src/solver/LevelSolver';
import { LevelFactory } from '../src/levels/LevelFactory';

console.log('Testing LEVEL_20_EXTREME with LevelSolver.solve()...');
const t0 = Date.now();
const res = LevelSolver.solve(LEVEL_20_EXTREME, { maxStates: 35000, maxDepth: 45 });
console.log('Elapsed:', Date.now() - t0, 'ms');
console.log('Solution found:', res.solutionFound);
console.log('Solution length:', res.solutionLength);
console.log('Explored states:', res.exploredStateCount);
console.log('Replay verified:', res.replayVerified);
if (res.solutionFound) {
  console.log('Solution sequence:', res.solutionSequence.join(', '));
} else {
  console.log('Details/Error:', res.errorDetails);
}
