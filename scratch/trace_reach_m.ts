import { createMasterCandidate } from './search_hard_master';
import { LevelFactory } from '../src/levels/LevelFactory';
import { LevelSolver } from '../src/solver/LevelSolver';

const level = createMasterCandidate();
const session = LevelFactory.build(level);

const visited = new Set<string>();
const q = [{ snap: LevelSolver.captureSnapshot(session), p: session.player.position.clone(), s: session.shadow.position.clone() }];
visited.add(`${q[0].p.x},${q[0].p.y}|${q[0].s.x},${q[0].s.y}`);

const pPos = new Set<string>();
const sPos = new Set<string>();

while (q.length > 0) {
  const cur = q.shift()!;
  pPos.add(`${cur.p.x},${cur.p.y}`);
  sPos.add(`${cur.s.x},${cur.s.y}`);

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

console.log('Total states:', visited.size);
console.log('Player positions:', Array.from(pPos).sort());
console.log('Shadow positions:', Array.from(sPos).sort());
console.log('sw-20-key-alpha at (5, 3) reached by Shadow?', sPos.has('5,3'));
console.log('sw-20-key-beta at (2, 2) reached by Real?', pPos.has('2,2'));
