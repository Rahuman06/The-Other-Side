import { createTestLevel } from './test_layout';
import { LevelFactory } from '../src/levels/LevelFactory';
import { LevelSolver } from '../src/solver/LevelSolver';

const level = createTestLevel();
const session = LevelFactory.build(level);

const visited = new Set<string>();
const q = [{ snap: LevelSolver.captureSnapshot(session), p: session.player.position.clone(), s: session.shadow.position.clone() }];
visited.add(`${q[0].p.x},${q[0].p.y}|${q[0].s.x},${q[0].s.y}`);

const playerPositions = new Set<string>();
const shadowPositions = new Set<string>();

while (q.length > 0) {
  const cur = q.shift()!;
  playerPositions.add(`${cur.p.x},${cur.p.y}`);
  shadowPositions.add(`${cur.s.x},${cur.s.y}`);

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

console.log('Total joint positions reached:', visited.size);
console.log('Player positions:', Array.from(playerPositions).sort());
console.log('Shadow positions:', Array.from(shadowPositions).sort());
console.log('Alpha at (0, 5) reached?', playerPositions.has('0,5'));
console.log('Beta at (7, 0) reached?', shadowPositions.has('7,0'));
