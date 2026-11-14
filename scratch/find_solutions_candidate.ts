import { LEVEL_20_V8 } from './test_hardest_level20_v3';
import { LevelFactory } from '../src/levels/LevelFactory';
import { LevelSolver, Direction } from '../src/solver/LevelSolver';

interface SolutionPath {
  seq: Direction[];
  realInvertedAtEnd: boolean;
  shadowInvertedAtEnd: boolean;
  switchesHit: string[];
}

export function findAllSolutions(level = LEVEL_20_V8, maxDepth = 35, maxStates = 100000) {
  const session = LevelFactory.build(level);
  const queue: Array<{
    actions: Direction[];
    snapshot: any;
  }> = [];

  const visited = new Map<string, number>();
  const initialKey = LevelSolver.serializeState(session);
  visited.set(initialKey, 0);

  queue.push({
    actions: [],
    snapshot: LevelSolver.captureSnapshot(session),
  });

  const ALL_DIRECTIONS: Direction[] = ['up', 'right', 'down', 'left'];
  const winningPaths: SolutionPath[] = [];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current.actions.length >= maxDepth) continue;

    for (const dir of ALL_DIRECTIONS) {
      LevelSolver.restoreSnapshot(session, current.snapshot);
      const res = session.turnEngine.handleInput(dir);
      session.turnEngine.endAnimation();
      if (!res || res.hazardTriggered) continue;
      if (!res.playerMoved && !res.shadowMoved) continue;

      const actions = [...current.actions, dir];

      if (res.bothAtExit) {
        const activeSwitches = session.puzzleManager.getAllSwitches().filter(s => s.isActive).map(s => s.id);
        winningPaths.push({
          seq: actions,
          realInvertedAtEnd: session.inversionEngine.isRealInverted(),
          shadowInvertedAtEnd: session.inversionEngine.isShadowInverted(),
          switchesHit: activeSwitches,
        });
        continue;
      }

      const key = LevelSolver.serializeState(session);
      const prevDepth = visited.get(key);
      if (prevDepth !== undefined && prevDepth <= actions.length) {
        continue;
      }
      visited.set(key, actions.length);

      if (visited.size > maxStates) {
        console.log('Reached max states limit:', maxStates);
        return winningPaths;
      }

      queue.push({
        actions,
        snapshot: LevelSolver.captureSnapshot(session),
      });
    }
  }

  return winningPaths;
}

console.log('Starting exhaustive search on Candidate Level 20 V8...');
const solutions = findAllSolutions(LEVEL_20_V8, 35, 100000);
console.log(`Found ${solutions.length} total winning paths:`);

const familyA = solutions.filter(s => s.realInvertedAtEnd && !s.shadowInvertedAtEnd);
const familyB = solutions.filter(s => !s.realInvertedAtEnd && s.shadowInvertedAtEnd);
const other = solutions.filter(s => !familyA.includes(s) && !familyB.includes(s));

console.log(`Family A (Mirrored Ascent): ${familyA.length} paths`);
if (familyA.length > 0) {
  console.log('Shortest Family A sequence length:', familyA[0].seq.length);
  console.log('Shortest Family A sequence:', familyA[0].seq);
  console.log('Family A switches:', familyA[0].switchesHit);
}

console.log(`Family B (Shadow Descent): ${familyB.length} paths`);
if (familyB.length > 0) {
  console.log('Shortest Family B sequence length:', familyB[0].seq.length);
  console.log('Shortest Family B sequence:', familyB[0].seq);
  console.log('Family B switches:', familyB[0].switchesHit);
}

console.log(`Unclassified / Other paths: ${other.length}`);
if (other.length > 0) {
  console.log('Other sample:', other[0]);
}
