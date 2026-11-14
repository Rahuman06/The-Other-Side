import { LEVEL_20_MASTER_CANDIDATE } from './test_hardest_design';
import { LevelFactory } from '../src/levels/LevelFactory';

const session = LevelFactory.build(LEVEL_20_MASTER_CANDIDATE);
const seq = [
  'up',   'left', 'right',
  'down', 'down', 'down',
  'down', 'left', 'up',
  'left', 'up',   'up',
  'up',   'up',   'down',
  'down', 'down', 'down'
];

for (let i = 0; i < seq.length; i++) {
  const d = seq[i] as any;
  const res = session.turnEngine.handleInput(d);
  session.turnEngine.endAnimation();
  console.log(`Step ${i + 1} (${d}): P=(${session.player.position.x},${session.player.position.y}) S=(${session.shadow.position.x},${session.shadow.position.y}) bothAtExit=${res?.bothAtExit} realInv=${session.inversionEngine.isRealInverted()} shadInv=${session.inversionEngine.isShadowInverted()}`);
}
