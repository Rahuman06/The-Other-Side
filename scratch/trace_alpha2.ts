import { createTestLevel } from './test_layout';
import { LevelFactory } from '../src/levels/LevelFactory';

const level = createTestLevel();
const session = LevelFactory.build(level);

console.log('Switches initial:');
for (const sw of session.puzzleManager.getAllSwitches()) {
  console.log(`  ${sw.id}: (${sw.position.x}, ${sw.position.y}) in ${sw.world}`);
}

const moves = ['down', 'left', 'down', 'down'] as const;
for (const m of moves) {
  session.turnEngine.handleInput(m);
  session.turnEngine.endAnimation();
}

console.log('\nAfter Alpha Inversion:');
console.log('Real Inverted?', session.inversionEngine?.isRealInverted());
console.log('Real Player pos:', session.player.position);
console.log('Shadow pos:', session.shadow.position);
console.log('Switches after inversion:');
for (const sw of session.puzzleManager.getAllSwitches()) {
  console.log(`  ${sw.id}: (${sw.position.x}, ${sw.position.y}) in ${sw.world}`);
}
console.log('Doors after inversion:');
for (const d of session.puzzleManager.getAllDoors()) {
  console.log(`  ${d.id}: (${d.position.x}, ${d.position.y}) in ${d.world}, open=${d.isOpen}`);
}
