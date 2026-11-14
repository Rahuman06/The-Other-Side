import { LEVEL_20_V9 } from './test_hard_v9';
import { LevelFactory } from '../src/levels/LevelFactory';

const session = LevelFactory.build(LEVEL_20_V9);
console.log('Real Start:', session.player.position);
console.log('Shadow Start:', session.shadow.position);

session.turnEngine.handleInput('up');
session.turnEngine.endAnimation();
console.log('After UP:');
console.log('Player:', session.player.position, 'Shadow:', session.shadow.position);

session.turnEngine.handleInput('up');
session.turnEngine.endAnimation();
console.log('After UP 2:');
console.log('Player:', session.player.position, 'Shadow:', session.shadow.position);
console.log('Real Inverted?', session.inversionEngine?.isRealInverted());
console.log('Shadow Inverted?', session.inversionEngine?.isShadowInverted());
console.log('Door states:');
for (const d of session.puzzleManager.getAllDoors()) {
  console.log(`  Door ${d.id}: open=${d.isOpen}, pos=(${d.position.x},${d.position.y}), world=${d.world}`);
}
console.log('Switch states:');
for (const sw of session.puzzleManager.getAllSwitches()) {
  console.log(`  Switch ${sw.id}: active=${sw.isActive}, pos=(${sw.position.x},${sw.position.y}), world=${sw.world}`);
}
