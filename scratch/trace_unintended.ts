import { createMasterCandidate } from './search_hard_master';
import { LevelFactory } from '../src/levels/LevelFactory';

const level = createMasterCandidate();
const session = LevelFactory.build(level);

const unintendedPath = [
  'right', 'up', 'up', 'up', 'left', 'down', 'right', 'right',
  'left', 'down', 'down', 'right', 'left', 'left', 'up', 'up',
  'up', 'up', 'up', 'down', 'down', 'down', 'down', 'down'
] as const;

for (let i = 0; i < unintendedPath.length; i++) {
  const d = unintendedPath[i];
  const res = session.turnEngine.handleInput(d);
  session.turnEngine.endAnimation();
  const a = session.puzzleManager.getSwitch('sw-20-alpha')?.isActive;
  const b = session.puzzleManager.getSwitch('sw-20-beta')?.isActive;
  const rInv = session.inversionEngine?.isRealInverted();
  const sInv = session.inversionEngine?.isShadowInverted();
  if (a || b || rInv || sInv) {
    console.log(`Step ${i + 1} (${d}): Alpha=${a}, Beta=${b}, RealInv=${rInv}, ShadowInv=${sInv}, P=(${session.player.position.x},${session.player.position.y}), S=(${session.shadow.position.x},${session.shadow.position.y})`);
  }
}
