import { LEVEL_20_HARD_8X6 } from './test_hard_8x6';
import { LevelFactory } from '../src/levels/LevelFactory';

const session = LevelFactory.build(LEVEL_20_HARD_8X6);
console.log('Real Start:', session.player.position);
console.log('Shadow Start:', session.shadow.position);

// Can Real move anywhere?
for (const d of ['up', 'right', 'down', 'left'] as any[]) {
  const s = LevelFactory.build(LEVEL_20_HARD_8X6);
  const r = s.turnEngine.handleInput(d);
  console.log(`Input ${d}: P_moved=${r?.playerMoved} S_moved=${r?.shadowMoved} P_pos=(${s.player.position.x},${s.player.position.y}) S_pos=(${s.shadow.position.x},${s.shadow.position.y})`);
}
