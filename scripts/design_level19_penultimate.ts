import { LevelDefinition } from '../src/types/level';
import { LevelFactory, BuiltLevelSession } from '../src/levels/LevelFactory';
import { LevelValidator } from '../src/solver/LevelValidator';
import { LevelSolver, Direction } from '../src/solver/LevelSolver';

export function createMasterLevel19(): LevelDefinition {
  const bounds = [
    ...Array.from({ length: 12 }, (_, x) => ({ x, y: 0 })),
    ...Array.from({ length: 12 }, (_, x) => ({ x, y: 11 })),
    ...Array.from({ length: 12 }, (_, y) => ({ x: 0, y })),
    ...Array.from({ length: 12 }, (_, y) => ({ x: 11, y })),
  ];

  // REAL WORLD (12x12)
  const realWalls = [
    ...bounds,

    // Zone 1: The Fractured Vestibule (Rows 1–3)
    // Weaving baffle corridors requiring coordinated cross-traversal
    { x: 2, y: 1 }, { x: 2, y: 2 },
    { x: 4, y: 2 }, { x: 4, y: 3 },
    { x: 6, y: 1 }, { x: 6, y: 2 },
    { x: 8, y: 2 }, { x: 8, y: 3 },
    { x: 10, y: 2 },

    // Zone 1 -> Zone 2 Barrier (Row 4, x=1..10 except gate at (9,4))
    { x: 1, y: 4 }, { x: 2, y: 4 }, { x: 3, y: 4 }, { x: 4, y: 4 }, { x: 5, y: 4 }, { x: 6, y: 4 }, { x: 7, y: 4 }, { x: 8, y: 4 }, { x: 10, y: 4 },

    // Zone 2: Clockwork Siphon & Hazard Conduits (Rows 5–6)
    { x: 2, y: 6 },
    { x: 6, y: 6 },
    { x: 8, y: 6 },

    // Zone 2 -> Zone 3 Barrier (Row 7, x=1..10 except gate at (4,7))
    { x: 1, y: 7 }, { x: 2, y: 7 }, { x: 3, y: 7 }, { x: 5, y: 7 }, { x: 6, y: 7 }, { x: 7, y: 7 }, { x: 8, y: 7 }, { x: 9, y: 7 }, { x: 10, y: 7 },

    // Zone 3: Confinement Vaults (Rows 8–9)
    // Cell Sigma enclosure (2,8):
    { x: 1, y: 8 }, // west wall
    // (2,7) is in Row 7 barrier
    // (2,9) is in Row 9 barrier
    // (3,8) is gate d-19-sigma
    // Central conduit walls
    { x: 4, y: 9 },

    // Zone 3 -> Zone 4 Barrier (Row 9, x=1..10 except gate at (5,9))
    { x: 1, y: 9 }, { x: 2, y: 9 }, { x: 4, y: 9 }, { x: 7, y: 9 }, { x: 8, y: 9 }, { x: 9, y: 9 }, { x: 10, y: 9 },

    // Zone 4: Final Sanctuary & Blast Doors (Rows 10–11)
    // Baffles in Row 10 forcing path down into Row 11
    { x: 4, y: 10 }, { x: 7, y: 10 },
  ];

  // SHADOW WORLD (12x12)
  const shadowWalls = [
    ...bounds,

    // Zone 1: The Fractured Vestibule (Rows 1–3)
    // Asymmetric counterpart weaving baffle corridors
    { x: 9, y: 1 }, { x: 9, y: 2 },
    { x: 7, y: 2 }, { x: 7, y: 3 },
    { x: 5, y: 1 }, { x: 5, y: 2 },
    { x: 3, y: 2 }, { x: 3, y: 3 },
    { x: 1, y: 2 },

    // Zone 1 -> Zone 2 Barrier (Row 4, x=1..10 except gate at (2,4))
    { x: 1, y: 4 }, { x: 3, y: 4 }, { x: 4, y: 4 }, { x: 5, y: 4 }, { x: 6, y: 4 }, { x: 7, y: 4 }, { x: 8, y: 4 }, { x: 9, y: 4 }, { x: 10, y: 4 },

    // Zone 2: Clockwork Siphon & Hazard Conduits (Rows 5–6)
    { x: 5, y: 6 },
    { x: 3, y: 6 },

    // Zone 2 -> Zone 3 Barrier (Row 7, x=1..10 except gate at (7,7))
    { x: 1, y: 7 }, { x: 2, y: 7 }, { x: 3, y: 7 }, { x: 4, y: 7 }, { x: 5, y: 7 }, { x: 6, y: 7 }, { x: 8, y: 7 }, { x: 9, y: 7 }, { x: 10, y: 7 },

    // Zone 3: Confinement Vaults (Rows 8–9)
    // Cell Omega enclosure (9,8):
    { x: 10, y: 8 }, // east wall
    // (9,7) is in Row 7 barrier
    // (9,9) is in Row 9 barrier
    // (8,8) is gate d-19-omega
    // Central conduit walls
    { x: 7, y: 9 },

    // Zone 3 -> Zone 4 Barrier (Row 9, x=1..10 except gate at (6,9))
    { x: 1, y: 9 }, { x: 2, y: 9 }, { x: 3, y: 9 }, { x: 4, y: 9 }, { x: 7, y: 9 }, { x: 9, y: 9 }, { x: 10, y: 9 },

    // Zone 4: Final Sanctuary & Blast Doors (Rows 10–11)
    // Baffles in Row 10 forcing path down into Row 11
    { x: 4, y: 10 }, { x: 7, y: 10 },
  ];

  return {
    id: 19,
    chapter: 'THE TRUTH',
    name: 'The Fractured Reality',
    width: 12,
    height: 12,
    difficulty: 'MASTER',
    hint: 'Fractured dimensions, sequential imprisonment, optical resonance, and synchronized liberation.',
    realStart: { x: 1, y: 1 },
    shadowStart: { x: 10, y: 1 },
    realExit: { x: 10, y: 10 },
    shadowExit: { x: 1, y: 10 },
    realWalls,
    shadowWalls,
    doors: [
      // Zone 1 -> Zone 2 Gates (Row 4)
      { id: 'd-19-t1-r', world: 'real', position: { x: 9, y: 4 }, initialOpen: false },
      { id: 'd-19-t1-s', world: 'shadow', position: { x: 2, y: 4 }, initialOpen: false },

      // Zone 2 -> Zone 3 Gates (Row 7)
      { id: 'd-19-t2-r', world: 'real', position: { x: 4, y: 7 }, initialOpen: false },
      { id: 'd-19-t2-s', world: 'shadow', position: { x: 7, y: 7 }, initialOpen: false },

      // Rescue 1: Real trapped in Cell Sigma (2,8) until Shadow hits sw-19-rescue-r
      { id: 'd-19-sigma', world: 'real', position: { x: 3, y: 8 }, initialOpen: false },

      // Rescue 2: Shadow trapped in Cell Omega (9,8) until Real hits sw-19-rescue-s
      { id: 'd-19-omega', world: 'shadow', position: { x: 8, y: 8 }, initialOpen: false },

      // Zone 3 Confinement Conduit Gates
      { id: 'd-19-path-r', world: 'real', position: { x: 5, y: 8 }, initialOpen: false },
      { id: 'd-19-path-s', world: 'shadow', position: { x: 6, y: 8 }, initialOpen: false },

      // Zone 3 -> Zone 4 Descent Gates (Row 9)
      { id: 'd-19-t3-r', world: 'real', position: { x: 5, y: 9 }, initialOpen: false },
      { id: 'd-19-t3-s', world: 'shadow', position: { x: 6, y: 9 }, initialOpen: false },

      // Zone 4 Final Blast Doors (Row 10)
      { id: 'd-19-fin-r', world: 'real', position: { x: 9, y: 10 }, initialOpen: false },
      { id: 'd-19-fin-s', world: 'shadow', position: { x: 2, y: 10 }, initialOpen: false },
    ],
    switches: [
      // Zone 1 Cross-Switches
      { id: 'sw-19-t1-r', world: 'real', position: { x: 2, y: 3 }, linkedDoorId: 'd-19-t1-s', activationBehavior: 'ACTIVATE_ONLY' },
      { id: 'sw-19-t1-s', world: 'shadow', position: { x: 9, y: 3 }, linkedDoorId: 'd-19-t1-r', activationBehavior: 'ACTIVATE_ONLY' },

      // Zone 2 Threshold Switches
      { id: 'sw-19-t2-r', world: 'real', position: { x: 9, y: 5 }, linkedDoorId: 'd-19-t2-s', activationBehavior: 'ACTIVATE_ONLY' },
      { id: 'sw-19-t2-s', world: 'shadow', position: { x: 2, y: 5 }, linkedDoorId: 'd-19-t2-r', activationBehavior: 'ACTIVATE_ONLY' },

      // Inside Cell Sigma (2,8): Real flips this switch to open Shadow's path d-19-path-s
      { id: 'sw-19-nex-r', world: 'real', position: { x: 2, y: 8 }, linkedDoorId: 'd-19-path-s', activationBehavior: 'ACTIVATE_ONLY' },

      // Shadow in Zone 3 at (3,8): Rescues Real by opening d-19-sigma!
      { id: 'sw-19-rescue-r', world: 'shadow', position: { x: 3, y: 8 }, linkedDoorId: 'd-19-sigma', activationBehavior: 'ACTIVATE_ONLY' },

      // Inside Cell Omega (9,8): Shadow flips this switch to open Real's path d-19-path-r
      { id: 'sw-19-nex-s', world: 'shadow', position: { x: 9, y: 8 }, linkedDoorId: 'd-19-path-r', activationBehavior: 'ACTIVATE_ONLY' },

      // Real in Zone 3 at (8,8): Rescues Shadow by opening d-19-omega!
      { id: 'sw-19-rescue-s', world: 'real', position: { x: 8, y: 8 }, linkedDoorId: 'd-19-omega', activationBehavior: 'ACTIVATE_ONLY' },

      // Simultaneous Confinement Descent Switches (in Zone 3, distinct positions)
      { id: 'sw-19-t3-r', world: 'real', position: { x: 3, y: 9 }, linkedDoorId: 'd-19-t3-s', activationBehavior: 'ACTIVATE_ONLY' },
      { id: 'sw-19-t3-s', world: 'shadow', position: { x: 8, y: 9 }, linkedDoorId: 'd-19-t3-r', activationBehavior: 'ACTIVATE_ONLY' },

      // Zone 4 Final Master Keys
      { id: 'sw-19-fin-r', world: 'real', position: { x: 2, y: 10 }, linkedDoorId: 'd-19-fin-s', activationBehavior: 'ACTIVATE_ONLY' },
      { id: 'sw-19-fin-s', world: 'shadow', position: { x: 9, y: 10 }, linkedDoorId: 'd-19-fin-r', activationBehavior: 'ACTIVATE_ONLY' },
    ],
    movingHazards: [
      { id: 'saw-19-r1', world: 'real', path: [{ x: 3, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }] },
      { id: 'saw-19-s1', world: 'shadow', path: [{ x: 8, y: 5 }, { x: 7, y: 5 }, { x: 8, y: 5 }] },
    ],
    timeLocks: [
      { id: 'tl-19-r1', world: 'real', position: { x: 1, y: 5 }, duration: 14, targetHazardIds: ['saw-19-r1', 'saw-19-s1'] },
      { id: 'tl-19-s1', world: 'shadow', position: { x: 10, y: 5 }, duration: 14, targetHazardIds: ['saw-19-r1', 'saw-19-s1'] },
    ],
    collapsingFloors: [
      { id: 'cf-19-r1', world: 'real', position: { x: 4, y: 1 }, stepsToCollapse: 2 },
      { id: 'cf-19-s1', world: 'shadow', position: { x: 7, y: 1 }, stepsToCollapse: 2 },
      { id: 'cf-19-r2', world: 'real', position: { x: 7, y: 10 }, stepsToCollapse: 2 },
      { id: 'cf-19-s2', world: 'shadow', position: { x: 4, y: 10 }, stepsToCollapse: 2 },
    ],
    portals: [
      // Tactical Rift into Cell Sigma (2,8)
      { id: 'port-19-r1', world: 'real', position: { x: 9, y: 6 }, targetWorld: 'real', targetPosition: { x: 2, y: 8 } },
      // Tactical Rift into Cell Omega (9,8) - placed at (10,6) in Shadow
      { id: 'port-19-s1', world: 'shadow', position: { x: 10, y: 6 }, targetWorld: 'shadow', targetPosition: { x: 9, y: 8 } },
    ],
    surpriseEvents: [
      {
        id: 'se-19-descent-seal',
        name: 'Descent Threshold Collapse',
        triggerType: 'STEP_ON',
        triggerWorld: 'real',
        triggerPosition: { x: 5, y: 9 },
        targetWorld: 'real',
        targetType: 'WALL',
        targetPosition: { x: 5, y: 8 },
        activationDelay: 0,
        action: 'SPAWN_WALL',
        animation: 'crumble',
        sound: 'wall_shift',
        warningClue: 'The descent threshold seals behind you — forward to the sanctuary!',
      },
    ],
    solutionTrace: [],
  };
}

const level = createMasterLevel19();
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

console.log('--- Testing Strategy A (Real trapped first -> Shadow rescues -> Shadow trapped -> Real rescues) ---');

const sA = LevelFactory.build(level);
const traceA: Direction[] = [];

// Phase 1: Real enters Cell Sigma (2,8) and hits sw-19-nex-r
console.log('Phase 1: Real to Cell Sigma...');
const p1 = solveStage(sA, (sess) => {
  return sess.player.position.equals({ x: 2, y: 8 }) && sess.puzzleManager.getSwitch('sw-19-nex-r')?.isActive === true;
});
if (!p1) { console.error('Failed Phase 1'); process.exit(1); }
console.log('P1 moves:', p1.length, p1);
for (const dir of p1) { sA.turnEngine.handleInput(dir); sA.turnEngine.endAnimation(); }
traceA.push(...p1);

console.log('After Phase 1:');
console.log('Player pos:', sA.player.position, 'Shadow pos:', sA.shadow.position);
console.log('Doors:', sA.puzzleManager.getAllDoors().map(d => `${d.id}: ${d.isOpen}`));
console.log('Switches:', sA.puzzleManager.getAllSwitches().map(sw => `${sw.id}: ${sw.isActive}`));

// Phase 2: Shadow rescues Real (hits sw-19-rescue-r at (7,8))

console.log('Phase 2: Shadow rescues Real...');
const p2Snap = LevelSolver.captureSnapshot(sA);
const p2Q: { snap: any; path: Direction[] }[] = [{ snap: p2Snap, path: [] }];
const p2Vis = new Set<string>();
p2Vis.add(LevelSolver.serializeState(sA));
let p2Count = 0;
let p2Found: Direction[] | null = null;
while (p2Q.length > 0 && p2Count < 5000) {
  const cur = p2Q.shift()!;
  p2Count++;
  for (const dir of ALL_DIRECTIONS) {
    LevelSolver.restoreSnapshot(sA, cur.snap);
    const res = sA.turnEngine.handleInput(dir);
    sA.turnEngine.endAnimation();
    if (!res || res.hazardTriggered) continue;
    if (!res.playerMoved && !res.shadowMoved) continue;
    const path = [...cur.path, dir];
    if (sA.puzzleManager.getSwitch('sw-19-rescue-r')?.isActive === true) {
      p2Found = path;
      break;
    }
    const key = LevelSolver.serializeState(sA);
    if (!p2Vis.has(key)) {
      p2Vis.add(key);
      p2Q.push({ snap: LevelSolver.captureSnapshot(sA), path });
    }
  }
  if (p2Found) break;
}
console.log('Phase 2 debug: count:', p2Count, 'vis size:', p2Vis.size, 'found:', !!p2Found);
if (!p2Found) {
  console.log('Sample states in Phase 2:');
  for (const k of Array.from(p2Vis).slice(0, 10)) {
    console.log(k);
  }
  const maxSY = Math.max(...Array.from(p2Vis).map(k => { const m = k.match(/S\((\d+),(\d+)/); return m ? parseInt(m[2]) : 0; }));
  const maxSX = Math.max(...Array.from(p2Vis).map(k => { const m = k.match(/S\((\d+),(\d+)/); return m ? parseInt(m[1]) : 0; }));
  console.log('Max SX:', maxSX, 'Max SY:', maxSY);
  const y8States = Array.from(p2Vis).filter(k => k.includes(',8,0)|D'));
  console.log('Shadow at y=8 sample states (first 10):');
  for (const s of y8States.slice(0, 10)) console.log(s);
  process.exit(1);

}
console.log('P2 moves:', p2Found.length, p2Found);
let dbgP2Sess = LevelFactory.build(level);
for (const dir of traceA) { dbgP2Sess.turnEngine.handleInput(dir); dbgP2Sess.turnEngine.endAnimation(); }
console.log('Step-by-step Phase 2:');
for (const dir of p2Found) {
  dbgP2Sess.turnEngine.handleInput(dir);
  dbgP2Sess.turnEngine.endAnimation();
  console.log(`Dir: ${dir} -> P: ${dbgP2Sess.player.position} | S: ${dbgP2Sess.shadow.position}`);
}
for (const dir of p2Found) { sA.turnEngine.handleInput(dir); sA.turnEngine.endAnimation(); }
traceA.push(...p2Found);


// Phase 3: Shadow enters Cell Omega (9,8) and hits sw-19-nex-s
console.log('Phase 3: Shadow to Cell Omega...');
const p3Snap = LevelSolver.captureSnapshot(sA);
const p3Q: { snap: any; path: Direction[] }[] = [{ snap: p3Snap, path: [] }];
const p3Vis = new Set<string>();
p3Vis.add(LevelSolver.serializeState(sA));
let p3Count = 0;
let p3Found: Direction[] | null = null;
while (p3Q.length > 0 && p3Count < 10000) {
  const cur = p3Q.shift()!;
  p3Count++;
  for (const dir of ALL_DIRECTIONS) {
    LevelSolver.restoreSnapshot(sA, cur.snap);
    const res = sA.turnEngine.handleInput(dir);
    sA.turnEngine.endAnimation();
    if (!res || res.hazardTriggered) continue;
    if (!res.playerMoved && !res.shadowMoved) continue;
    const path = [...cur.path, dir];
    if (sA.shadow.position.equals({ x: 9, y: 8 }) && sA.puzzleManager.getSwitch('sw-19-nex-s')?.isActive === true) {
      p3Found = path;
      break;
    }
    const key = LevelSolver.serializeState(sA);
    if (!p3Vis.has(key)) {
      p3Vis.add(key);
      p3Q.push({ snap: LevelSolver.captureSnapshot(sA), path });
    }
  }
  if (p3Found) break;
}
console.log('Phase 3 debug: count:', p3Count, 'vis size:', p3Vis.size, 'found:', !!p3Found);
if (!p3Found) {
  console.log('Sample states in Phase 3:');
  for (const k of Array.from(p3Vis).slice(0, 10)) console.log(k);
  process.exit(1);
}
console.log('P3 moves:', p3Found.length, p3Found);
for (const dir of p3Found) { sA.turnEngine.handleInput(dir); sA.turnEngine.endAnimation(); }
traceA.push(...p3Found);


// Phase 4: Real rescues Shadow (hits sw-19-rescue-s at (4,8))
console.log('Phase 4: Real rescues Shadow...');
const p4 = solveStage(sA, (sess) => {
  return sess.puzzleManager.getSwitch('sw-19-rescue-s')?.isActive === true;
});
if (!p4) { console.error('Failed Phase 4'); process.exit(1); }
console.log('P4 moves:', p4.length, p4);
for (const dir of p4) { sA.turnEngine.handleInput(dir); sA.turnEngine.endAnimation(); }
traceA.push(...p4);

// Phase 5: Simultaneous Confinement (sw-19-t3-r and sw-19-t3-s)
console.log('Phase 5: Simultaneous Confinement...');
const p5 = solveStage(sA, (sess) => {
  return sess.puzzleManager.getSwitch('sw-19-t3-r')?.isActive === true && sess.puzzleManager.getSwitch('sw-19-t3-s')?.isActive === true;
});
if (!p5) { console.error('Failed Phase 5'); process.exit(1); }
console.log('P5 moves:', p5.length, p5);
for (const dir of p5) { sA.turnEngine.handleInput(dir); sA.turnEngine.endAnimation(); }
traceA.push(...p5);

console.log('After Phase 5:');
console.log('Player pos:', sA.player.position, 'Shadow pos:', sA.shadow.position);
console.log('Doors:', sA.puzzleManager.getAllDoors().map(d => `${d.id}: ${d.isOpen}`));
console.log('Switches:', sA.puzzleManager.getAllSwitches().map(sw => `${sw.id}: ${sw.isActive}`));

// Phase 6: Zone 4 Master Keys & True Exits
console.log('Phase 6: Final master keys & exits...');
const p6Snap = LevelSolver.captureSnapshot(sA);
const p6Q: { snap: any; path: Direction[] }[] = [{ snap: p6Snap, path: [] }];
const p6Vis = new Set<string>();
p6Vis.add(LevelSolver.serializeState(sA));
let p6Count = 0;
let p6Found: Direction[] | null = null;
while (p6Q.length > 0 && p6Count < 10000) {
  const cur = p6Q.shift()!;
  p6Count++;
  for (const dir of ALL_DIRECTIONS) {
    LevelSolver.restoreSnapshot(sA, cur.snap);
    const res = sA.turnEngine.handleInput(dir);
    sA.turnEngine.endAnimation();
    if (!res || res.hazardTriggered) continue;
    if (!res.playerMoved && !res.shadowMoved) continue;
    const path = [...cur.path, dir];
    if (sA.player.isAtExit() && sA.shadow.isAtExit()) {
      p6Found = path;
      break;
    }
    const key = LevelSolver.serializeState(sA);
    if (!p6Vis.has(key)) {
      p6Vis.add(key);
      p6Q.push({ snap: LevelSolver.captureSnapshot(sA), path });
    }
  }
  if (p6Found) break;
}
console.log('Phase 6 search finished. Count:', p6Count, 'vis size:', p6Vis.size, 'found:', !!p6Found);
if (!p6Found) {
  console.log('Sample states in Phase 6:');
  for (const k of Array.from(p6Vis).slice(0, 10)) {
    console.log(k);
  }
  const maxPY = Math.max(...Array.from(p6Vis).map(k => { const m = k.match(/P\((\d+),(\d+)/); return m ? parseInt(m[2]) : 0; }));
  const maxSY = Math.max(...Array.from(p6Vis).map(k => { const m = k.match(/S\((\d+),(\d+)/); return m ? parseInt(m[2]) : 0; }));
  console.log('Max PY:', maxPY, 'Max SY:', maxSY);
  process.exit(1);
}
console.log('P6 moves:', p6Found.length, p6Found);
for (const dir of p6Found) { sA.turnEngine.handleInput(dir); sA.turnEngine.endAnimation(); }
traceA.push(...p6Found);

console.log('Strategy A Total Moves:', traceA.length);
console.log('FULL TRACE A:', JSON.stringify(traceA));

console.log('--- Testing Full Replay for Strategy A ---');
const sAReplay = LevelFactory.build(level);
let stepA = 0;
for (const dir of traceA) {
  stepA++;
  const res = sAReplay.turnEngine.handleInput(dir);
  sAReplay.turnEngine.endAnimation();
  if (!res || res.hazardTriggered) {
    console.error(`REPLAY A FAILED at step ${stepA} (${dir})!`);
    process.exit(1);
  }
}
console.log('Replay A finished at step:', stepA);
console.log('Player at exit?', sAReplay.player.isAtExit(), 'Pos:', sAReplay.player.position);
console.log('Shadow at exit?', sAReplay.shadow.isAtExit(), 'Pos:', sAReplay.shadow.position);
console.log('Game state A:', sAReplay.turnEngine.state);
if (sAReplay.player.isAtExit() && sAReplay.shadow.isAtExit() && sAReplay.turnEngine.state === 'COMPLETED') {
  console.log('>>> STRATEGY A REPLAY: 100% SUCCESSFUL (Length: ' + traceA.length + ') <<<');
} else {
  console.error('>>> STRATEGY A DID NOT REACH COMPLETED STATE! <<<');
  process.exit(1);
}

console.log('\n============================================================');
console.log('--- Testing Strategy B (Shadow trapped first -> Real rescues -> Real trapped -> Shadow rescues) ---');
console.log('============================================================');
const sB = LevelFactory.build(level);
const traceB: Direction[] = [];

// Phase 1B: Shadow enters Cell Omega (9,8) and hits sw-19-nex-s
console.log('Phase 1B: Shadow to Cell Omega...');
const p1b = solveStage(sB, (sess) => {
  return sess.shadow.position.equals({ x: 9, y: 8 }) && sess.puzzleManager.getSwitch('sw-19-nex-s')?.isActive === true;
});
if (!p1b) { console.error('Failed Phase 1B'); process.exit(1); }
console.log('P1B moves:', p1b.length, p1b);
for (const dir of p1b) { sB.turnEngine.handleInput(dir); sB.turnEngine.endAnimation(); }
traceB.push(...p1b);

// Phase 2B: Real rescues Shadow (hits sw-19-rescue-s at (8,8))
console.log('Phase 2B: Real rescues Shadow...');
const p2b = solveStage(sB, (sess) => {
  return sess.puzzleManager.getSwitch('sw-19-rescue-s')?.isActive === true;
});
if (!p2b) { console.error('Failed Phase 2B'); process.exit(1); }
console.log('P2B moves:', p2b.length, p2b);
for (const dir of p2b) { sB.turnEngine.handleInput(dir); sB.turnEngine.endAnimation(); }
traceB.push(...p2b);

// Phase 3B: Real enters Cell Sigma (2,8) and hits sw-19-nex-r
console.log('Phase 3B: Real to Cell Sigma...');
const p3b = solveStage(sB, (sess) => {
  return sess.player.position.equals({ x: 2, y: 8 }) && sess.puzzleManager.getSwitch('sw-19-nex-r')?.isActive === true;
});
if (!p3b) { console.error('Failed Phase 3B'); process.exit(1); }
console.log('P3B moves:', p3b.length, p3b);
for (const dir of p3b) { sB.turnEngine.handleInput(dir); sB.turnEngine.endAnimation(); }
traceB.push(...p3b);

// Phase 4B: Shadow rescues Real (hits sw-19-rescue-r at (3,8))
console.log('Phase 4B: Shadow rescues Real...');
const p4b = solveStage(sB, (sess) => {
  return sess.puzzleManager.getSwitch('sw-19-rescue-r')?.isActive === true;
});
if (!p4b) { console.error('Failed Phase 4B'); process.exit(1); }
console.log('P4B moves:', p4b.length, p4b);
for (const dir of p4b) { sB.turnEngine.handleInput(dir); sB.turnEngine.endAnimation(); }
traceB.push(...p4b);

// Phase 5B: Simultaneous Confinement (sw-19-t3-r and sw-19-t3-s)
console.log('Phase 5B: Simultaneous Confinement...');
const p5b = solveStage(sB, (sess) => {
  return sess.puzzleManager.getSwitch('sw-19-t3-r')?.isActive === true && sess.puzzleManager.getSwitch('sw-19-t3-s')?.isActive === true;
});
if (!p5b) { console.error('Failed Phase 5B'); process.exit(1); }
console.log('P5B moves:', p5b.length, p5b);
for (const dir of p5b) { sB.turnEngine.handleInput(dir); sB.turnEngine.endAnimation(); }
traceB.push(...p5b);

// Phase 6B: Zone 4 Master Keys & True Exits
console.log('Phase 6B: Final master keys & exits...');
const p6b = solveStage(sB, (sess) => {
  return sess.player.isAtExit() && sess.shadow.isAtExit();
});
if (!p6b) { console.error('Failed Phase 6B'); process.exit(1); }
console.log('P6B moves:', p6b.length, p6b);
for (const dir of p6b) { sB.turnEngine.handleInput(dir); sB.turnEngine.endAnimation(); }
traceB.push(...p6b);

console.log('Strategy B Total Moves:', traceB.length);
console.log('FULL TRACE B:', JSON.stringify(traceB));

console.log('--- Testing Full Replay for Strategy B ---');
const sBReplay = LevelFactory.build(level);
let stepB = 0;
for (const dir of traceB) {
  stepB++;
  const res = sBReplay.turnEngine.handleInput(dir);
  sBReplay.turnEngine.endAnimation();
  if (!res || res.hazardTriggered) {
    console.error(`REPLAY B FAILED at step ${stepB} (${dir})!`);
    process.exit(1);
  }
}
console.log('Replay B finished at step:', stepB);
console.log('Player at exit?', sBReplay.player.isAtExit(), 'Pos:', sBReplay.player.position);
console.log('Shadow at exit?', sBReplay.shadow.isAtExit(), 'Pos:', sBReplay.shadow.position);
console.log('Game state B:', sBReplay.turnEngine.state);
if (sBReplay.player.isAtExit() && sBReplay.shadow.isAtExit() && sBReplay.turnEngine.state === 'COMPLETED') {
  console.log('>>> STRATEGY B REPLAY: 100% SUCCESSFUL (Length: ' + traceB.length + ') <<<');
} else {
  console.error('>>> STRATEGY B DID NOT REACH COMPLETED STATE! <<<');
  process.exit(1);
}
console.log('\n============================================================');
console.log('--- Reachable Exploration Analysis ---');
console.log('============================================================');
const expSession = LevelFactory.build(level);
const expVis = new Set<string>();
const expQueue = [LevelSolver.captureSnapshot(expSession)];
expVis.add(LevelSolver.serializeState(expSession));

let expHead = 0;
// We explore meaningful states up to depth / step limits
const strategicStates = new Set<string>(); // unique (P.x, P.y, S.x, S.y, DoorStates, SwitchStates)

while (expHead < expQueue.length && expHead < 50000) {
  const snap = expQueue[expHead++];
  for (const dir of ALL_DIRECTIONS) {
    LevelSolver.restoreSnapshot(expSession, snap);
    const res = expSession.turnEngine.handleInput(dir);
    expSession.turnEngine.endAnimation();
    if (!res || res.hazardTriggered) continue;
    if (!res.playerMoved && !res.shadowMoved) continue;

    const key = LevelSolver.serializeState(expSession);
    if (!expVis.has(key)) {
      expVis.add(key);
      expQueue.push(LevelSolver.captureSnapshot(expSession));

      // Strategic key ignoring saw cycle
      const stratKey = `P(${expSession.player.position.x},${expSession.player.position.y})|S(${expSession.shadow.position.x},${expSession.shadow.position.y})|D[${expSession.puzzleManager.getAllDoors().map(d=>d.isOpen?1:0).join('')}]|SW[${expSession.puzzleManager.getAllSwitches().map(s=>s.isActive?1:0).join('')}]`;
      strategicStates.add(stratKey);
    }
  }
}

console.log('Total Raw Reachable Game States (including saw oscillations):', expVis.size);
console.log('Meaningful Strategic Situations (P_pos, S_pos, Doors, Switches):', strategicStates.size);
process.exit(0);


