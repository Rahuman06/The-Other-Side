import { createMasterCandidate } from './search_hard_master';
import { LevelFactory } from '../src/levels/LevelFactory';

const level = createMasterCandidate();
const session = LevelFactory.build(level);

const unintendedPath = [
  'right', 'up',    'up',    'up',
  'left',  'right', 'down',  'down',
  'down',  'left',  'up',    'right',
  'up',    'right', 'right', 'right',
  'up',    'left',  'up',    'right',
  'down',  'down',  'down',  'right',
  'right'
] as const;

for (let i = 0; i < unintendedPath.length; i++) {
  const d = unintendedPath[i];
  session.turnEngine.handleInput(d);
  session.turnEngine.endAnimation();
  const exitRealOpen = session.puzzleManager.getDoor('door-20-exit-real')?.isOpen;
  const exitShadowOpen = session.puzzleManager.getDoor('door-20-exit-shadow')?.isOpen;
  const p = session.player.position;
  const s = session.shadow.position;
  console.log(`Step ${i + 1} (${d}): P=(${p.x},${p.y}), S=(${s.x},${s.y}), ExitsOpen=${exitRealOpen},${exitShadowOpen}`);
}
