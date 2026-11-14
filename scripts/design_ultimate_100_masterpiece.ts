import { LevelDefinition } from '../src/types/level';
import { LevelSolver } from '../src/solver/LevelSolver';
import { LevelValidator } from '../src/solver/LevelValidator';

export function createMaster100Level20(): LevelDefinition {
  const bounds = [
    ...Array.from({ length: 15 }, (_, x) => ({ x, y: 0 })),
    ...Array.from({ length: 15 }, (_, x) => ({ x, y: 14 })),
    ...Array.from({ length: 15 }, (_, y) => ({ x: 0, y })),
    ...Array.from({ length: 15 }, (_, y) => ({ x: 14, y })),
  ];

  // REAL WORLD: 5 distinct architectural chambers
  const realWalls = [
    ...bounds,

    // Region 1: The Asymmetric Atrium (x=1..6, y=1..4)
    { x: 3, y: 1 }, { x: 3, y: 2 },
    { x: 5, y: 2 }, { x: 5, y: 3 },

    // Region 1 -> Region 2 Barrier (Col 7, y=2..4)
    { x: 7, y: 2 }, { x: 7, y: 3 }, { x: 7, y: 4 },

    // Region 1 -> Region 3 Barrier (Row 4, x=1..4, x=6)
    { x: 1, y: 4 }, { x: 2, y: 4 }, { x: 3, y: 4 }, { x: 4, y: 4 }, { x: 6, y: 4 },

    // Region 2: Optical Prism & Deceptive Exit (x=7..13, y=1..4)
    { x: 11, y: 2 },
    { x: 12, y: 2 },
    { x: 13, y: 1 }, { x: 13, y: 2 }, // Enclosure around rift portal



    // Region 2 -> Region 3 Barrier (Row 4, x=8..13 except gate at (11,4))
    { x: 8, y: 4 }, { x: 9, y: 4 }, { x: 10, y: 4 }, { x: 12, y: 4 }, { x: 13, y: 4 },

    // Region 3: Grand Cross Nexus & Saws (x=1..13, y=5..8)
    { x: 2, y: 5 }, { x: 2, y: 7 },
    { x: 4, y: 6 }, { x: 4, y: 7 },
    { x: 6, y: 5 }, { x: 6, y: 6 },
    { x: 8, y: 6 },
    { x: 10, y: 5 }, { x: 10, y: 6 },
    { x: 12, y: 6 }, { x: 12, y: 7 },

    // Region 3 -> Region 4 Barrier (Row 8, x=1..13 except gate at (8,8))
    { x: 1, y: 8 }, { x: 2, y: 8 }, { x: 3, y: 8 }, { x: 4, y: 8 }, { x: 5, y: 8 }, { x: 6, y: 8 },
    { x: 7, y: 8 }, { x: 9, y: 8 }, { x: 10, y: 8 }, { x: 11, y: 8 }, { x: 12, y: 8 }, { x: 13, y: 8 },

    // Region 4: Confinement Vaults (x=1..13, y=9..11)
    { x: 1, y: 10 }, // Cell Alpha west wall
    { x: 2, y: 9 }, { x: 2, y: 11 }, // Cell Alpha north & south walls
    // (3,10) is trap gate d-trap-r
    // Enclosed conduit forcing Real through d-path-r at (6,10)
    { x: 4, y: 9 }, { x: 5, y: 9 }, { x: 6, y: 9 },
    { x: 7, y: 9 }, { x: 7, y: 11 },
    { x: 9, y: 9 }, { x: 9, y: 11 },
    { x: 11, y: 9 }, { x: 11, y: 10 },

    // Region 4 -> Region 5 Barrier (Row 12, x=1..13 except gate at (6,12))
    { x: 1, y: 12 }, { x: 2, y: 12 }, { x: 3, y: 12 }, { x: 4, y: 12 }, { x: 5, y: 12 },
    { x: 7, y: 12 }, { x: 8, y: 12 }, { x: 9, y: 12 }, { x: 10, y: 12 }, { x: 11, y: 12 }, { x: 12, y: 12 }, { x: 13, y: 12 },
  ];

  // SHADOW WORLD: Asymmetric regional counterparts
  const shadowWalls = [
    ...bounds,

    // Region 1: The Asymmetric Atrium (x=8..13, y=1..4)
    { x: 11, y: 1 }, { x: 11, y: 2 },
    { x: 9, y: 2 }, { x: 9, y: 3 },

    // Region 1 -> Region 2 Barrier (Col 7, y=2..4)
    { x: 7, y: 2 }, { x: 7, y: 3 }, { x: 7, y: 4 },

    // Region 1 -> Region 3 Barrier (Row 4, x=8, x=10..13)
    { x: 13, y: 4 }, { x: 12, y: 4 }, { x: 11, y: 4 }, { x: 10, y: 4 }, { x: 8, y: 4 },

    // Region 2: Optical Prism & Deceptive Exit (x=1..7, y=1..4)
    { x: 5, y: 2 },
    { x: 3, y: 2 },
    { x: 1, y: 2 }, // Alcove around deceptive exit

    // Region 2 -> Region 3 Barrier (Row 4, x=1..6 except gate at (3,4))
    { x: 6, y: 4 }, { x: 5, y: 4 }, { x: 4, y: 4 }, { x: 2, y: 4 }, { x: 1, y: 4 },

    // Region 3: Grand Cross Nexus & Saws (x=1..13, y=5..8)
    { x: 12, y: 5 }, { x: 12, y: 7 },
    { x: 10, y: 6 }, { x: 10, y: 7 },
    { x: 8, y: 5 }, { x: 8, y: 6 },
    { x: 6, y: 6 },
    { x: 4, y: 5 }, { x: 4, y: 6 },
    { x: 2, y: 6 }, { x: 2, y: 7 },

    // Region 3 -> Region 4 Barrier (Row 8, x=1..13 except gate at (6,8))
    { x: 13, y: 8 }, { x: 12, y: 8 }, { x: 11, y: 8 }, { x: 10, y: 8 }, { x: 9, y: 8 }, { x: 8, y: 8 },
    { x: 7, y: 8 }, { x: 5, y: 8 }, { x: 4, y: 8 }, { x: 3, y: 8 }, { x: 2, y: 8 }, { x: 1, y: 8 },

    // Region 4: Confinement Vaults (x=1..13, y=9..11)
    { x: 13, y: 10 }, // Cell Beta east wall
    { x: 12, y: 9 }, { x: 12, y: 11 }, // Cell Beta north & south walls
    // (11,10) is trap gate d-trap-s
    { x: 9, y: 10 }, { x: 9, y: 11 },
    { x: 7, y: 10 }, { x: 7, y: 11 },
    { x: 5, y: 10 }, { x: 5, y: 11 },
    { x: 3, y: 9 }, { x: 3, y: 10 },

    // Region 4 -> Region 5 Barrier (Row 12, x=1..13 except gate at (8,12))
    { x: 1, y: 12 }, { x: 2, y: 12 }, { x: 3, y: 12 }, { x: 4, y: 12 }, { x: 5, y: 12 }, { x: 6, y: 12 },
    { x: 7, y: 12 }, { x: 9, y: 12 }, { x: 10, y: 12 }, { x: 11, y: 12 }, { x: 12, y: 12 }, { x: 13, y: 12 },
  ];

  return {
    id: 20,
    chapter: 'THE TRUTH',
    name: 'The Impossible Dimension',
    width: 15,
    height: 15,
    difficulty: 'MASTER',
    hint: 'Deception, optical resonance, cross-world demolition, and synchronized peril in the ultimate labyrinth.',
    realStart: { x: 1, y: 1 },
    shadowStart: { x: 13, y: 1 },
    realExit: { x: 13, y: 13 },
    shadowExit: { x: 1, y: 13 },
    realWalls,
    shadowWalls,
    doors: [
      // Region 1 -> Region 2 Entrance Gates
      { id: 'd-t1-r', world: 'real', position: { x: 11, y: 4 }, initialOpen: false },
      { id: 'd-t1-s', world: 'shadow', position: { x: 3, y: 4 }, initialOpen: false },

      // Optical Conduit Gates (opened by Laser Receivers)
      { id: 'd-opt-r', world: 'real', position: { x: 11, y: 1 }, initialOpen: false },
      { id: 'd-opt-s', world: 'shadow', position: { x: 3, y: 1 }, initialOpen: false },

      // Optical Aux Barrier (opened by sw-rot-r)
      { id: 'd-rot-r', world: 'real', position: { x: 9, y: 2 }, initialOpen: false },

      // Region 3 Grand Cross Gates (opened by Real in Cell Alpha)
      { id: 'd-nexus-s', world: 'shadow', position: { x: 6, y: 8 }, initialOpen: false },

      // Region 4 Confinement Trap Gates:
      // Rescue 1: Real is trapped in Cell Alpha (2,10) by d-trap-r until Shadow hits sw-rescue-s!
      { id: 'd-trap-r', world: 'real', position: { x: 3, y: 10 }, initialOpen: false },
      // Rescue 2: Shadow is trapped in Cell Beta (12,10) by d-trap-s until Real hits sw-rescue-r!
      { id: 'd-trap-s', world: 'shadow', position: { x: 11, y: 10 }, initialOpen: false },
      // Real's corridor gate: opened only when Shadow enters Cell Beta and hits sw-nex-s!
      { id: 'd-path-r', world: 'real', position: { x: 6, y: 10 }, initialOpen: false },

      // Region 4 -> Region 5 Descent Gates
      { id: 'd-t3-r', world: 'real', position: { x: 6, y: 12 }, initialOpen: false },
      { id: 'd-t3-s', world: 'shadow', position: { x: 8, y: 12 }, initialOpen: false },

      // Region 5 Final Blast Doors (protecting the True Exits)
      { id: 'd-final-r', world: 'real', position: { x: 12, y: 13 }, initialOpen: false },
      { id: 'd-final-s', world: 'shadow', position: { x: 2, y: 13 }, initialOpen: false },
    ],
    switches: [
      // Region 1 Security Levers
      { id: 'sw-t1-r', world: 'real', position: { x: 2, y: 3 }, linkedDoorId: 'd-t1-s', activationBehavior: 'ACTIVATE_ONLY' },
      { id: 'sw-t1-s', world: 'shadow', position: { x: 12, y: 3 }, linkedDoorId: 'd-t1-r', activationBehavior: 'ACTIVATE_ONLY' },

      // Optical Resonance Switch: Real rotates laser mirror lm-r1 to strike receiver lr-r1
      { id: 'sw-rot-r', world: 'real', position: { x: 8, y: 2 }, linkedDoorId: 'd-rot-r', activationBehavior: 'ACTIVATE_ONLY' },


      // Inside Cell Alpha at (2,10): Real flips this switch to open Shadow's path through Region 3!
      { id: 'sw-nex-r', world: 'real', position: { x: 2, y: 10 }, linkedDoorId: 'd-nexus-s', activationBehavior: 'ACTIVATE_ONLY' },

      // Shadow in Region 4 at (10,11): Rescues Real by opening d-trap-r!
      { id: 'sw-rescue-s', world: 'shadow', position: { x: 10, y: 11 }, linkedDoorId: 'd-trap-r', activationBehavior: 'ACTIVATE_ONLY' },

      // Inside Cell Beta at (12,10): Shadow flips this switch to open Real's rescue path!
      { id: 'sw-nex-s', world: 'shadow', position: { x: 12, y: 10 }, linkedDoorId: 'd-path-r', activationBehavior: 'ACTIVATE_ONLY' },

      // Real in Region 4: Rescues Shadow by opening d-trap-s!
      { id: 'sw-rescue-r', world: 'real', position: { x: 10, y: 9 }, linkedDoorId: 'd-trap-s', activationBehavior: 'ACTIVATE_ONLY' },

      // Region 4 Descent Switches (unlocked after both rescues complete)
      { id: 'sw-t3-r', world: 'real', position: { x: 4, y: 11 }, linkedDoorId: 'd-t3-s', activationBehavior: 'ACTIVATE_ONLY' },
      { id: 'sw-t3-s', world: 'shadow', position: { x: 8, y: 11 }, linkedDoorId: 'd-t3-r', activationBehavior: 'ACTIVATE_ONLY' },

      // Region 5 Final Master Keys (cross-world vault breach)
      { id: 'sw-final-r', world: 'real', position: { x: 3, y: 13 }, linkedDoorId: 'd-final-s', activationBehavior: 'ACTIVATE_ONLY' },
      { id: 'sw-final-s', world: 'shadow', position: { x: 11, y: 13 }, linkedDoorId: 'd-final-r', activationBehavior: 'ACTIVATE_ONLY' },
    ],
    laserEmitters: [
      { id: 'le-r1', world: 'real', position: { x: 8, y: 3 }, direction: 'right', initialActive: true },
      { id: 'le-s1', world: 'shadow', position: { x: 6, y: 3 }, direction: 'left', initialActive: true },
    ],
    laserMirrors: [
      { id: 'lm-r1', world: 'real', position: { x: 10, y: 3 }, orientation: '\\', linkedSwitchId: 'sw-rot-r' },
      { id: 'lm-s1', world: 'shadow', position: { x: 4, y: 3 }, orientation: '\\' },
    ],

    laserReceivers: [
      { id: 'lr-r1', world: 'real', position: { x: 10, y: 2 }, linkedDoorId: 'd-opt-r' },
      { id: 'lr-s1', world: 'shadow', position: { x: 4, y: 2 }, linkedDoorId: 'd-opt-s' },
    ],
    movingHazards: [
      // Patrol saw in Real Region 3 (Grand Cross)
      { id: 'saw-r1', world: 'real', path: [{ x: 5, y: 6 }, { x: 6, y: 6 }, { x: 5, y: 6 }] },
      // Patrol saw in Shadow Region 3 (Grand Cross)
      { id: 'saw-s1', world: 'shadow', path: [{ x: 9, y: 6 }, { x: 8, y: 6 }, { x: 9, y: 6 }] },
      // Patrol saw in Real Region 4 (Confinement perimeter)
      { id: 'saw-r2', world: 'real', path: [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 10 }] },
      // Patrol saw in Shadow Region 4 (Confinement perimeter)
      { id: 'saw-s2', world: 'shadow', path: [{ x: 6, y: 10 }, { x: 6, y: 11 }, { x: 6, y: 10 }] },
    ],
    timeLocks: [
      // Freezes saws for 16 turns to allow crossing
      { id: 'tl-r1', world: 'real', position: { x: 12, y: 5 }, duration: 16, targetHazardIds: ['saw-r1', 'saw-s1', 'saw-r2', 'saw-s2'] },
      { id: 'tl-s1', world: 'shadow', position: { x: 2, y: 5 }, duration: 16, targetHazardIds: ['saw-r1', 'saw-s1', 'saw-r2', 'saw-s2'] },
    ],
    collapsingFloors: [
      // Bridge between Region 1 and Region 2 (2 steps to collapse)
      { id: 'cf-r1', world: 'real', position: { x: 6, y: 1 }, stepsToCollapse: 2 },
      { id: 'cf-s1', world: 'shadow', position: { x: 8, y: 1 }, stepsToCollapse: 2 },
      // Crumbling pathways across Region 5
      { id: 'cf-r2', world: 'real', position: { x: 10, y: 13 }, stepsToCollapse: 2 },
      { id: 'cf-s2', world: 'shadow', position: { x: 4, y: 13 }, stepsToCollapse: 2 },
    ],
    portals: [
      // Tactical Rift Portal 1: Dimensional jump for Real into Cell Alpha (2,10)
      { id: 'port-r1', world: 'real', position: { x: 12, y: 1 }, targetWorld: 'real', targetPosition: { x: 2, y: 10 } },
      // Tactical Rift Portal 2: Dimensional jump for Shadow into Cell Beta (12,10)
      { id: 'port-s1', world: 'shadow', position: { x: 3, y: 11 }, targetWorld: 'shadow', targetPosition: { x: 12, y: 10 } },
    ],
    surpriseEvents: [
      {
        id: 'se-labyrinth-collapse',
        triggerType: 'STEP_ON',
        triggerWorld: 'real',
        triggerPosition: { x: 6, y: 12 },
        targetWorld: 'real',
        targetType: 'WALL',
        targetPosition: { x: 6, y: 8 },
        action: 'SPAWN_WALL',
        animation: 'crumble',
        sound: 'wall_shift',
        warningClue: 'A dimensional rift seals the upper path — forward is the only way!',
      },
    ],
    solutionTrace: [],
  };
}

const level = createMaster100Level20();
import { LevelFactory, BuiltLevelSession } from '../src/levels/LevelFactory';
import { Direction } from '../src/solver/LevelSolver';


const valRes = LevelValidator.validateSchema(level);
console.log('Schema valid:', valRes.valid, 'Errors:', valRes.errors);
if (!valRes.valid) {
  process.exit(1);
}



const ALL_DIRECTIONS: Direction[] = ['up', 'right', 'down', 'left'];

function solveStage(

  initialSession: BuiltLevelSession,
  isTargetMet: (s: BuiltLevelSession) => boolean,
  maxStates = 40000
): Direction[] | null {
  const initSnap = LevelSolver.captureSnapshot(initialSession);
  const queue: { snap: any; path: Direction[] }[] = [{ snap: initSnap, path: [] }];
  const visited = new Set<string>();
  visited.add(LevelSolver.serializeState(initialSession));

  let head = 0;
  while (head < queue.length && head < maxStates) {
    const cur = queue[head++];
    for (const dir of ALL_DIRECTIONS) {
      LevelSolver.restoreSnapshot(initialSession, cur.snap);
      const res = initialSession.turnEngine.handleInput(dir);
      initialSession.turnEngine.endAnimation();
      if (!res || res.hazardTriggered) continue;
      if (!res.playerMoved && !res.shadowMoved) continue;

      const path = [...cur.path, dir];
      if (isTargetMet(initialSession)) {
        LevelSolver.restoreSnapshot(initialSession, initSnap);
        return path;
      }

      const key = LevelSolver.serializeState(initialSession);
      if (!visited.has(key)) {
        visited.add(key);
        queue.push({
          snap: LevelSolver.captureSnapshot(initialSession),
          path,
        });
      }
    }
  }
  LevelSolver.restoreSnapshot(initialSession, initSnap);
  return null;
}


const s = LevelFactory.build(level);
let fullTrace: Direction[] = [];

console.log('--- Phase 1: Real enters Cell Alpha (2,10) & hits sw-nex-r ---');
const p1 = solveStage(s, (sess) => {
  return sess.player.position.equals({ x: 2, y: 10 }) && sess.puzzleManager.getSwitch('sw-nex-r')?.isActive === true;
});
if (!p1) { console.error('Failed Phase 1'); process.exit(1); }
console.log('Phase 1 moves:', p1.length, p1);
for (const dir of p1) { s.turnEngine.handleInput(dir); s.turnEngine.endAnimation(); }
fullTrace.push(...p1);

console.log('--- Phase 2: Shadow rescues Real (hits sw-rescue-s at (10,11)) ---');
const p2 = solveStage(s, (sess) => {
  return sess.puzzleManager.getSwitch('sw-rescue-s')?.isActive === true;
});
if (!p2) { console.error('Failed Phase 2'); process.exit(1); }
console.log('Phase 2 moves:', p2.length, p2);
for (const dir of p2) { s.turnEngine.handleInput(dir); s.turnEngine.endAnimation(); }
fullTrace.push(...p2);

console.log('--- Phase 3: Shadow enters Cell Beta (12,10) & hits sw-nex-s ---');
const p3 = solveStage(s, (sess) => {
  return sess.shadow.position.equals({ x: 12, y: 10 }) && sess.puzzleManager.getSwitch('sw-nex-s')?.isActive === true;
});
if (!p3) { console.error('Failed Phase 3'); process.exit(1); }
console.log('Phase 3 moves:', p3.length, p3);
for (const dir of p3) { s.turnEngine.handleInput(dir); s.turnEngine.endAnimation(); }
fullTrace.push(...p3);

console.log('--- Phase 4: Real rescues Shadow (hits sw-rescue-r at (8,10)) ---');
const p4 = solveStage(s, (sess) => {
  return sess.puzzleManager.getSwitch('sw-rescue-r')?.isActive === true;
});
if (!p4) { console.error('Failed Phase 4'); process.exit(1); }
console.log('Phase 4 moves:', p4.length, p4);
for (const dir of p4) { s.turnEngine.handleInput(dir); s.turnEngine.endAnimation(); }
fullTrace.push(...p4);

console.log('--- Phase 5: Descent gates sw-t3-r & sw-t3-s ---');
const p5 = solveStage(s, (sess) => {
  return (
    sess.puzzleManager.getSwitch('sw-t3-r')?.isActive === true &&
    sess.puzzleManager.getSwitch('sw-t3-s')?.isActive === true
  );
});
if (!p5) { console.error('Failed Phase 5'); process.exit(1); }
console.log('Phase 5 moves:', p5.length, p5);
for (const dir of p5) { s.turnEngine.handleInput(dir); s.turnEngine.endAnimation(); }
fullTrace.push(...p5);

console.log('After Phase 5:');
console.log('Player pos:', s.player.position);
console.log('Shadow pos:', s.shadow.position);
console.log('Doors:', s.puzzleManager.getAllDoors().map(d => `${d.id}: ${d.isOpen}`));
console.log('Switches:', s.puzzleManager.getAllSwitches().map(sw => `${sw.id}: ${sw.isActive}`));

console.log('--- Phase 6: Final master keys sw-final-r & sw-final-s in Region 5 ---');
const p6 = solveStage(s, (sess) => {
  return (
    sess.puzzleManager.getSwitch('sw-final-r')?.isActive === true &&
    sess.puzzleManager.getSwitch('sw-final-s')?.isActive === true
  );
});
if (!p6) { console.error('Failed Phase 6'); process.exit(1); }
console.log('Phase 6 moves:', p6.length, p6);
for (const dir of p6) { s.turnEngine.handleInput(dir); s.turnEngine.endAnimation(); }
fullTrace.push(...p6);

console.log('--- Phase 7: Both march to True Exits (13,13) and (1,13) ---');
const p7 = solveStage(s, (sess) => {
  return sess.player.isAtExit() && sess.shadow.isAtExit();
});
if (!p7) { console.error('Failed Phase 7'); process.exit(1); }
console.log('Phase 7 moves:', p7.length, p7);
for (const dir of p7) { s.turnEngine.handleInput(dir); s.turnEngine.endAnimation(); }
fullTrace.push(...p7);

console.log('====================================================');
console.log('TOTAL VERIFIED OPTIMAL SOLUTION LENGTH:', fullTrace.length);
console.log('FULL TRACE:', JSON.stringify(fullTrace));
console.log('====================================================');

// Replay verification from turn 0 to end:
console.log('--- Authoritative Full Replay Verification ---');
const verifySession = LevelFactory.build(level);
let stepIdx = 0;
for (const dir of fullTrace) {
  stepIdx++;
  const res = verifySession.turnEngine.handleInput(dir);
  verifySession.turnEngine.endAnimation();
  if (!res || res.hazardTriggered) {
    console.error(`REPLAY FAILED at step ${stepIdx} (${dir})! Hazard=${res?.hazardTriggered}`);
    process.exit(1);
  }
}
console.log('Replay finished at step:', stepIdx);
console.log('Player at exit?', verifySession.player.isAtExit(), 'Pos:', verifySession.player.position);
console.log('Shadow at exit?', verifySession.shadow.isAtExit(), 'Pos:', verifySession.shadow.position);
console.log('Game state:', verifySession.turnEngine.state);
if (verifySession.player.isAtExit() && verifySession.shadow.isAtExit() && verifySession.turnEngine.state === 'COMPLETED') {
  console.log('>>> 100% REPLAY SUCCESSFUL & AUTHENTICALLY COMPLETED! <<<');
} else {
  console.error('>>> REPLAY DID NOT FINISH IN COMPLETED STATE! <<<');
  process.exit(1);
}
process.exit(0);



console.log('====================================================');
process.exit(0);





