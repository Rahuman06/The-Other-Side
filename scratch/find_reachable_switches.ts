import { LEVEL_20_HARD_8X6 } from './test_hard_8x6';
import { LevelFactory } from '../src/levels/LevelFactory';
import { LevelSolver, Direction } from '../src/solver/LevelSolver';

// BFS to find all reachable switch activations
const session = LevelFactory.build(LEVEL_20_HARD_8X6);
const queue: any[] = [{ snap: LevelSolver.captureSnapshot(session), moves: [] }];
const visited = new Set<string>();

while (queue.length > 0) {
  const cur = queue.shift()!;
  if (cur.moves.length >= 20) continue;

  for (const d of ['up', 'right', 'down', 'left'] as Direction[]) {
    LevelSolver.restoreSnapshot(session, cur.snap);
    const r = session.turnEngine.handleInput(d);
    session.turnEngine.endAnimation();
    if (!r || r.hazardTriggered) continue;
    if (!r.playerMoved && !r.shadowMoved) continue;

    const moves = [...cur.moves, d];
    const key = LevelSolver.serializeState(session);
    if (!visited.has(key)) {
      visited.add(key);
      const activeSw = session.puzzleManager.getAllSwitches().filter(s => s.isActive).map(s => s.id);
      if (activeSw.length > 0) {
        console.log(`Moves ${moves.length} (${moves.join(',')}): Switches=[${activeSw.join(',')}] RealInv=${session.inversionEngine.isRealInverted()} ShadInv=${session.inversionEngine.isShadowInverted()} P=(${session.player.position.x},${session.player.position.y}) S=(${session.shadow.position.x},${session.shadow.position.y})`);
      }
      queue.push({ snap: LevelSolver.captureSnapshot(session), moves });
    }
  }
}
console.log('Total visited states:', visited.size);
