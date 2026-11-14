import { LEVEL_20_HARD_8X6 } from './test_hard_8x6';
import { LevelFactory } from '../src/levels/LevelFactory';
import { LevelSolver, Direction } from '../src/solver/LevelSolver';

const session = LevelFactory.build(LEVEL_20_HARD_8X6);
const queue: any[] = [{ snap: LevelSolver.captureSnapshot(session), moves: [] }];
const visited = new Set<string>();
const realReachable = new Set<string>();
const shadowReachable = new Set<string>();

while (queue.length > 0) {
  const cur = queue.shift()!;
  if (cur.moves.length >= 10) continue;

  for (const d of ['up', 'right', 'down', 'left'] as Direction[]) {
    LevelSolver.restoreSnapshot(session, cur.snap);
    const r = session.turnEngine.handleInput(d);
    session.turnEngine.endAnimation();
    if (!r || r.hazardTriggered) continue;
    if (!r.playerMoved && !r.shadowMoved) continue;

    realReachable.add(`${session.player.position.x},${session.player.position.y}`);
    shadowReachable.add(`${session.shadow.position.x},${session.shadow.position.y}`);

    const moves = [...cur.moves, d];
    const key = LevelSolver.serializeState(session);
    if (!visited.has(key)) {
      visited.add(key);
      queue.push({ snap: LevelSolver.captureSnapshot(session), moves });
    }
  }
}

console.log('Real reachable:', Array.from(realReachable).sort());
console.log('Shadow reachable:', Array.from(shadowReachable).sort());
