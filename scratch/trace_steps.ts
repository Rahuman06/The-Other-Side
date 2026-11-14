import { createMasterCandidate } from './search_hard_master';
import { LevelFactory } from '../src/levels/LevelFactory';

const level = createMasterCandidate();
const session = LevelFactory.build(level);

const unintendedPath = [
  'right', 'up', 'up', 'up', 'left', 'down', 'right', 'right',
  'left', 'down', 'down', 'right', 'left', 'left'
] as const;

for (let i = 0; i < unintendedPath.length; i++) {
  const d = unintendedPath[i];
  session.turnEngine.handleInput(d);
  session.turnEngine.endAnimation();
  console.log(`Step ${i + 1} (${d}): P=(${session.player.position.x},${session.player.position.y}), S=(${session.shadow.position.x},${session.shadow.position.y})`);
}
