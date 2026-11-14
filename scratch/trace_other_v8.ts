import { LEVEL_20_V8 } from './test_hardest_level20_v3';
import { LevelFactory } from '../src/levels/LevelFactory';

const session = LevelFactory.build(LEVEL_20_V8);
const seq = [
  'right', 'up',    'up',
  'up',    'left',  'left',
  'right', 'down',  'down',
  'down',  'down',  'right',
  'left',  'left',  'left',
  'up',    'right', 'down',
  'right'
];

for (let i = 0; i < seq.length; i++) {
  const d = seq[i] as any;
  const res = session.turnEngine.handleInput(d);
  session.turnEngine.endAnimation();
  const betaTile = session.shadowGrid.getCell({ x: 7, y: 4 })?.tileType;
  console.log(`Step ${i + 1} (${d}): P=(${session.player.position.x},${session.player.position.y}) S=(${session.shadow.position.x},${session.shadow.position.y}) betaTile=${betaTile} realInv=${session.inversionEngine.isRealInverted()} shadInv=${session.inversionEngine.isShadowInverted()}`);
}
