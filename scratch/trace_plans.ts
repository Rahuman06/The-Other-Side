import { createExtremeCandidate } from './test_extreme_solver';
import { LevelFactory } from '../src/levels/LevelFactory';
import { Direction } from '../src/solver/LevelSolver';

const level = createExtremeCandidate();
console.log('Testing planned step traces on Extreme Candidate...');

const planA: Direction[] = [
  'up', 'left', 'up', 'down', 'down', 'right', 'right', 'right',
  'up', 'right', 'right', 'down', 'down', 'right', 'up', 'right',
  'up', 'right', 'down', 'down', 'down', 'right', 'right'
];

const sessA = LevelFactory.build(level);
console.log('--- Tracing Plan A ---');
for (let i = 0; i < planA.length; i++) {
  const d = planA[i];
  const r = sessA.turnEngine.handleInput(d);
  sessA.turnEngine.endAnimation();
  console.log(`Step ${i + 1} (${d}): Real=(${sessA.player.position.x},${sessA.player.position.y}), Shadow=(${sessA.shadow.position.x},${sessA.shadow.position.y}), hazard=${r?.hazardTriggered}`);
  if (!r || r.hazardTriggered) {
    console.log(`Plan A halted at step ${i + 1}`);
    break;
  }
}
console.log('Plan A final: Player at exit?', sessA.player.isAtExit(), 'Shadow at exit?', sessA.shadow.isAtExit());
