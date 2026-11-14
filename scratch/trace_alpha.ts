import { createTestLevel } from './test_layout';
import { LevelFactory } from '../src/levels/LevelFactory';

const level = createTestLevel();
const session = LevelFactory.build(level);

console.log('Start - Real:', session.player.position, 'Shadow:', session.shadow.position);

// Real is at (1, 2). Moving down to (0, 5):
// Real wants to move: DOWN -> (1, 3), LEFT -> (0, 3), DOWN -> (0, 4), DOWN -> (0, 5)
const moves = ['down', 'left', 'down', 'down'] as const;

for (const m of moves) {
  const res = session.turnEngine.handleInput(m);
  session.turnEngine.endAnimation();
  console.log(`Move ${m}: Real: (${session.player.position.x}, ${session.player.position.y}), Shadow: (${session.shadow.position.x}, ${session.shadow.position.y}), moved? ${res?.playerMoved}, ${res?.shadowMoved}`);
}
