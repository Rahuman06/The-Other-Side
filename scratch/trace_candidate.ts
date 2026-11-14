import { createCandidateLevel20 } from './design_hard_level20';
import { LevelFactory } from '../src/levels/LevelFactory';
import { LevelSolver } from '../src/solver/LevelSolver';

const level = createCandidateLevel20();
const session = LevelFactory.build(level);

// Let's see what happens if we step towards sw-20-key-alpha in Shadow at (5, 1)
// Shadow starts at (6, 2). To reach (5, 1):
// LEFT moves Player (1, 3) -> (0, 3) [or wait, Real moves right when Shadow moves left! Real goes to (2, 3)]
// Shadow goes (6, 2) -> (5, 2)
// UP moves Shadow to (5, 1)! Real goes to (2, 2).
console.log('Start - Real:', session.player.position, 'Shadow:', session.shadow.position);

session.turnEngine.handleInput('left');
session.turnEngine.endAnimation();
console.log('After LEFT - Real:', session.player.position, 'Shadow:', session.shadow.position);

session.turnEngine.handleInput('up');
session.turnEngine.endAnimation();
console.log('After UP - Real:', session.player.position, 'Shadow:', session.shadow.position);
console.log('sw-20-key-alpha active?', session.puzzleManager.getSwitch('sw-20-key-alpha')?.isActive);
console.log('door-20-gate-alpha open?', session.puzzleManager.getDoor('door-20-gate-alpha')?.isOpen);

// Now door-20-gate-alpha at (1, 1) is open!
// Real at (2, 2) wants to reach Alpha at (1, 0) through (1, 1).
// Move LEFT: Real (2, 2) -> (1, 2). Shadow (5, 1) -> (6, 1).
session.turnEngine.handleInput('left');
session.turnEngine.endAnimation();
console.log('After LEFT 2 - Real:', session.player.position, 'Shadow:', session.shadow.position);

// Move UP: Real (1, 2) -> (1, 1) [through gate]. Shadow (6, 1) -> (6, 0).
session.turnEngine.handleInput('up');
session.turnEngine.endAnimation();
console.log('After UP 2 - Real:', session.player.position, 'Shadow:', session.shadow.position);

// Move UP: Real (1, 1) -> (1, 0) [Alpha!]. Shadow (6, 0) -> bumps into ceiling at (6, 0).
session.turnEngine.handleInput('up');
session.turnEngine.endAnimation();
console.log('After UP 3 (Alpha) - Real:', session.player.position, 'Shadow:', session.shadow.position);
console.log('Real Inverted?', session.inversionEngine?.isRealInverted());
console.log('Player post-inversion:', session.player.position);
console.log('Shadow pos:', session.shadow.position);
