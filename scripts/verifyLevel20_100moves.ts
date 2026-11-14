import { LevelSolver } from '../src/solver/LevelSolver';
import { LevelValidator } from '../src/solver/LevelValidator';
import { ALL_LEVELS } from '../src/levels/levelsData';

const level20 = ALL_LEVELS.find((l) => l.id === 20)!;
const validation = LevelValidator.validateSchema(level20);
console.log('Schema valid:', validation.valid, validation.errors);

const start = performance.now();
const solverRes = LevelSolver.solve(level20, { maxDepth: 160, maxStates: 100000 });
const durationMs = (performance.now() - start).toFixed(1);

console.log('Solver result in ' + durationMs + 'ms:', {
  solutionFound: solverRes.solutionFound,
  solutionLength: solverRes.solutionLength,
  exploredStates: solverRes.exploredStateCount,
  searchLimitReached: solverRes.searchLimitReached,
  replayVerified: solverRes.replayVerified,
  errorDetails: solverRes.errorDetails,
});
