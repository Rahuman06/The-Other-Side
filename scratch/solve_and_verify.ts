import { LevelDefinition } from '../src/types/level';
import { LevelFactory, BuiltLevelSession } from '../src/levels/LevelFactory';
import { LevelSolver, Direction } from '../src/solver/LevelSolver';

export interface PathResult {
  path: Direction[];
  realInverted: boolean;
  shadowInverted: boolean;
  alphaTriggered: boolean;
  betaTriggered: boolean;
}

export function exploreAllSolutions(level: LevelDefinition, maxDepth = 35, maxStates = 40000): {
  solutionsA: PathResult[];
  solutionsB: PathResult[];
  unintended: PathResult[];
  totalStates: number;
} {
  const session = LevelFactory.build(level);

  const initialSnap = LevelSolver.captureSnapshot(session);
  const initialKey = LevelSolver.serializeState(session);

  const visited = new Set<string>();
  visited.add(initialKey);

  interface QItem {
    snap: ReturnType<typeof LevelSolver.captureSnapshot>;
    path: Direction[];
  }

  const queue: QItem[] = [{ snap: initialSnap, path: [] }];
  let head = 0;
  let totalStates = 0;

  const solutionsA: PathResult[] = [];
  const solutionsB: PathResult[] = [];
  const unintended: PathResult[] = [];

  const ALL_DIRS: Direction[] = ['up', 'down', 'left', 'right'];

  while (head < queue.length && totalStates < maxStates) {
    const cur = queue[head++];
    totalStates++;

    if (cur.path.length >= maxDepth) continue;

    for (const d of ALL_DIRS) {
      LevelSolver.restoreSnapshot(session, cur.snap);
      const res = session.turnEngine.handleInput(d);
      session.turnEngine.endAnimation();

      if (!res || res.hazardTriggered) continue;

      const pAt = session.player.isAtExit();
      const sAt = session.shadow.isAtExit();

      if (pAt && sAt) {
        const nextPath = [...cur.path, d];
        const rInv = session.inversionEngine?.isRealInverted() ?? false;
        const sInv = session.inversionEngine?.isShadowInverted() ?? false;
        const alpha = session.puzzleManager.getSwitch('sw-20-alpha')?.isActive ?? false;
        const beta = session.puzzleManager.getSwitch('sw-20-beta')?.isActive ?? false;

        const pRes: PathResult = {
          path: nextPath,
          realInverted: rInv,
          shadowInverted: sInv,
          alphaTriggered: alpha,
          betaTriggered: beta,
        };

        if (rInv && !sInv && alpha && !beta) {
          solutionsA.push(pRes);
        } else if (!rInv && sInv && !alpha && beta) {
          solutionsB.push(pRes);
        } else {
          unintended.push(pRes);
        }
        continue;
      }

      const key = LevelSolver.serializeState(session);
      if (!visited.has(key)) {
        visited.add(key);
        queue.push({
          snap: LevelSolver.captureSnapshot(session),
          path: [...cur.path, d],
        });
      }
    }
  }

  return { solutionsA, solutionsB, unintended, totalStates };
}
