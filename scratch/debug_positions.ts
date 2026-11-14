import { createTestLevel } from './test_layout';
import { LevelFactory } from '../src/levels/LevelFactory';
import { LevelSolver } from '../src/solver/LevelSolver';

const level = createTestLevel();
const session = LevelFactory.build(level);

const visited = new Set<string>();
const q = [{ snap: LevelSolver.captureSnapshot(session), path: [] as string[] }];
visited.add(LevelSolver.serializeState(session));

while (q.length > 0) {
  const cur = q.shift()!;
  LevelSolver.restoreSnapshot(session, cur.snap);

  const pAt = session.player.isAtExit();
  const sAt = session.shadow.isAtExit();

  if (pAt) {
    console.log(`Player at EXIT (7, 5)! Shadow is at: (${session.shadow.position.x}, ${session.shadow.position.y}), path len: ${cur.path.length}`);
  }
  if (sAt) {
    console.log(`Shadow at EXIT (0, 0)! Player is at: (${session.player.position.x}, ${session.player.position.y}), path len: ${cur.path.length}`);
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
