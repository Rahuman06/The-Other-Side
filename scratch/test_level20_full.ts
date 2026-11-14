import { createMasterCandidate } from './search_hard_master';
import { LevelSolver, Direction } from '../src/solver/LevelSolver';
import { LevelFactory } from '../src/levels/LevelFactory';

const level = createMasterCandidate();

console.log('1. Testing LevelSolver.solve()...');
const result = LevelSolver.solve(level);
console.log('LevelSolver solved:', result.solutionFound);
console.log('LevelSolver length:', result.solutionLength);
console.log('LevelSolver replay verified:', result.replayVerified);
console.log('LevelSolver sequence:', result.solutionSequence.join(', '));

console.log('\n2. Replaying Solution A...');
const pathA: Direction[] = [
  'right', 'down', 'down', 'down', 'up', 'left', 'left', 'down', 'up',
  'right', 'down', 'down', 'down', 'down', 'right', 'down', 'right',
  'up', 'up', 'up', 'right', 'right'
];
const sessA = LevelFactory.build(level);
for (let i = 0; i < pathA.length; i++) {
  const d = pathA[i];
  const r = sessA.turnEngine.handleInput(d);
  sessA.turnEngine.endAnimation();
  if (!r) throw new Error(`Move ${i + 1} (${d}) returned null`);
  if (r.hazardTriggered) throw new Error(`Move ${i + 1} (${d}) triggered hazard`);
}
console.log('Solution A End: Player at exit?', sessA.player.isAtExit(), 'Shadow at exit?', sessA.shadow.isAtExit());
console.log('Solution A End: Real Inverted?', sessA.inversionEngine?.isRealInverted(), 'Shadow Inverted?', sessA.inversionEngine?.isShadowInverted());

console.log('\n3. Replaying Solution B...');
const pathB: Direction[] = [
  'right', 'up', 'up', 'up', 'down', 'left', 'left', 'up', 'down',
  'right', 'up', 'up', 'up', 'up', 'right', 'up', 'right',
  'down', 'down', 'down', 'right', 'right'
];
const sessB = LevelFactory.build(level);
for (let i = 0; i < pathB.length; i++) {
  const d = pathB[i];
  const r = sessB.turnEngine.handleInput(d);
  sessB.turnEngine.endAnimation();
  if (!r) throw new Error(`Move ${i + 1} (${d}) returned null`);
  if (r.hazardTriggered) throw new Error(`Move ${i + 1} (${d}) triggered hazard`);
}
console.log('Solution B End: Player at exit?', sessB.player.isAtExit(), 'Shadow at exit?', sessB.shadow.isAtExit());
console.log('Solution B End: Real Inverted?', sessB.inversionEngine?.isRealInverted(), 'Shadow Inverted?', sessB.inversionEngine?.isShadowInverted());
