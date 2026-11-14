import { LEVEL_20_EXTREME } from './prototype_level20_extreme';
import { LevelFactory } from '../src/levels/LevelFactory';
import { LevelSolver } from '../src/solver/LevelSolver';

const session = LevelFactory.build(LEVEL_20_EXTREME);
console.log('Real Start:', session.player.position, 'Shadow Start:', session.shadow.position);

for (const d of ['up', 'down', 'left', 'right'] as const) {
  const sess = LevelFactory.build(LEVEL_20_EXTREME);
  const r = sess.turnEngine.handleInput(d);
  console.log(`Move ${d}: Real moved? ${r?.playerMoved} to (${sess.player.position.x},${sess.player.position.y}), Shadow moved? ${r?.shadowMoved} to (${sess.shadow.position.x},${sess.shadow.position.y}), hazard? ${r?.hazardTriggered}`);
}
