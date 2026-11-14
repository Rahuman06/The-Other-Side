import { createTestLevel } from './test_layout';
import { LevelFactory } from '../src/levels/LevelFactory';
import { LevelSolver } from '../src/solver/LevelSolver';

const level = createTestLevel();
const session = LevelFactory.build(level);

const visited = new Set<string>();
const q = [{ snap: LevelSolver.captureSnapshot(session), path: [] as string[] }];
visited.add(LevelSolver.serializeState(session));

let pAtExitCount = 0;
let sAtExitCount = 0;
let bothAtExitCount = 0;

while (q.length > 0) {
  const cur = q.shift()!;
  LevelSolver.restoreSnapshot(session, cur.snap);

  const pAt = session.player.isAtExit();
  const sAt = session.shadow.isAtExit();

  if (pAt) pAtExitCount++;
  if (sAt) sAtExitCount++;
  if (pAt && sAt) {
    bothAtExitCount++;
    console.log('BOTH AT EXIT FOUND! Path length:', cur.path.length, 'Path:', cur.path.join(', '));
    break;
  }

  for (const d of ['up', 'down', 'left', 'right'] as const) {
    LevelSolver.restoreSnapshot(session, cur.snap);
    const res = session.turnEngine.handleInput(d);
    session.turnEngine.endAnimation();
    if (!res || res.hazardTriggered) continue;

    const key = LevelSolver.serializeState(session);
    if (!visited.has(key)) {
      visited.add(key);
      q.push({ snap: LevelSolver.captureSnapshot(session), path: [...cur.path, d] });
    }
  }
}

console.log('Player at exit count:', pAtExitCount);
console.log('Shadow at exit count:', sAtExitCount);
console.log('Both at exit count:', bothAtExitCount);
