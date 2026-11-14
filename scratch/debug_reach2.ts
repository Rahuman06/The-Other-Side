import { createTestLevel } from './test_layout';
import { LevelFactory } from '../src/levels/LevelFactory';
import { LevelSolver } from '../src/solver/LevelSolver';

const level = createTestLevel();
const session = LevelFactory.build(level);

const visited = new Set<string>();
const q = [{ snap: LevelSolver.captureSnapshot(session), p: session.player.position.clone(), s: session.shadow.position.clone() }];
visited.add(`${q[0].p.x},${q[0].p.y}|${q[0].s.x},${q[0].s.y}`);

while (q.length > 0) {
  const cur = q.shift()!;
  if (cur.p.x === 0 && cur.p.y === 4) {
    console.log('Player at (0, 4) with Shadow at:', cur.s.x, cur.s.y);
  }

  for (const d of ['up', 'down', 'left', 'right'] as const) {
    LevelSolver.restoreSnapshot(session, cur.snap);
    const res = session.turnEngine.handleInput(d);
    session.turnEngine.endAnimation();
    if (!res || res.hazardTriggered) continue;

    const p = session.player.position;
    const s = session.shadow.position;
    const key = `${p.x},${p.y}|${s.x},${s.y}`;
    if (!visited.has(key)) {
      visited.add(key);
      q.push({ snap: LevelSolver.captureSnapshot(session), p: p.clone(), s: s.clone() });
    }
  }
}
