import { LevelDefinition } from '../types/level';

export const ALL_LEVELS: readonly LevelDefinition[] = [
  // ==========================================
  // CHAPTER 1: THE BEGINNING (Levels 1–4)
  // ==========================================
  {
    id: 1,
    chapter: 'THE BEGINNING',
    name: 'Awakening',
    width: 7,
    height: 5,
    difficulty: 'EASY',
    hint: 'Move right. The shadow will mirror your horizontal motion.',
    realStart: { x: 1, y: 2 },
    shadowStart: { x: 5, y: 2 },
    realExit: { x: 5, y: 2 },
    shadowExit: { x: 1, y: 2 },
    realWalls: [{ x: 3, y: 0 }, { x: 3, y: 1 }, { x: 3, y: 3 }, { x: 3, y: 4 }],
    shadowWalls: [{ x: 3, y: 0 }, { x: 3, y: 1 }, { x: 3, y: 3 }, { x: 3, y: 4 }],
    solutionTrace: ['right', 'right', 'right', 'right'],
  },
  {
    id: 2,
    chapter: 'THE BEGINNING',
    name: 'Two Paths',
    width: 7,
    height: 5,
    difficulty: 'EASY',
    hint: 'One world has an obstacle that the other does not. One character can move while the other is blocked.',
    realStart: { x: 1, y: 2 },
    shadowStart: { x: 5, y: 2 },
    realExit: { x: 5, y: 2 },
    shadowExit: { x: 1, y: 2 },
    realWalls: [{ x: 2, y: 2 }, { x: 3, y: 0 }, { x: 3, y: 4 }],
    shadowWalls: [{ x: 3, y: 0 }, { x: 3, y: 4 }],
    solutionTrace: ['right', 'up', 'right', 'right', 'down', 'right', 'right'],
  },
  {
    id: 3,
    chapter: 'THE BEGINNING',
    name: 'The First Connection',
    width: 7,
    height: 5,
    difficulty: 'EASY',
    hint: 'Step on the switch in the Real World to open the gate in the Shadow World.',
    realStart: { x: 1, y: 2 },
    shadowStart: { x: 5, y: 2 },
    realExit: { x: 5, y: 2 },
    shadowExit: { x: 1, y: 2 },
    realWalls: [{ x: 3, y: 0 }, { x: 3, y: 1 }, { x: 3, y: 3 }, { x: 3, y: 4 }],
    shadowWalls: [{ x: 3, y: 0 }, { x: 3, y: 1 }, { x: 3, y: 3 }, { x: 3, y: 4 }],
    doors: [{ id: 'door-3', world: 'shadow', position: { x: 3, y: 2 }, initialOpen: false }],
    switches: [{ id: 'sw-3', world: 'real', position: { x: 2, y: 2 }, linkedDoorId: 'door-3' }],
    solutionTrace: ['right', 'right', 'right', 'right'],
  },
  {
    id: 4,
    chapter: 'THE BEGINNING',
    name: 'Alignment',
    width: 7,
    height: 5,
    difficulty: 'MEDIUM',
    hint: 'Position the Shadow strategically to unlock the door before moving together to the exits.',
    realStart: { x: 1, y: 1 },
    shadowStart: { x: 5, y: 1 },
    realExit: { x: 5, y: 3 },
    shadowExit: { x: 1, y: 3 },
    realWalls: [{ x: 2, y: 1 }, { x: 3, y: 0 }, { x: 3, y: 4 }],
    shadowWalls: [{ x: 3, y: 0 }, { x: 3, y: 4 }],
    doors: [{ id: 'door-4', world: 'real', position: { x: 4, y: 3 }, initialOpen: false }],
    switches: [{ id: 'sw-4', world: 'shadow', position: { x: 3, y: 1 }, linkedDoorId: 'door-4' }],
    solutionTrace: ['right', 'right', 'down', 'down', 'right', 'right', 'right', 'right'],
  },

  // ==========================================
  // CHAPTER 2: THE CONNECTION (Levels 5–8)
  // ==========================================
  {
    id: 5,
    chapter: 'THE CONNECTION',
    name: 'The Impossible Choice',
    width: 7,
    height: 5,
    difficulty: 'MEDIUM',
    hint: 'Hold the plate against a wall so your shadow can pass, then trade places.',
    realStart: { x: 1, y: 2 },
    shadowStart: { x: 5, y: 2 },
    realExit: { x: 5, y: 2 },
    shadowExit: { x: 1, y: 2 },
    realWalls: [
      { x: 0, y: 1 },
      { x: 0, y: 2 },
      { x: 1, y: 0 },
      { x: 2, y: 1 },
      { x: 3, y: 0 },
      { x: 3, y: 1 },
      { x: 3, y: 3 },
      { x: 3, y: 4 },
      { x: 5, y: 3 },
      { x: 5, y: 4 },
      { x: 6, y: 0 },
      { x: 6, y: 1 },
      { x: 6, y: 2 },
    ],
    shadowWalls: [
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: 2 },
      { x: 1, y: 3 },
      { x: 1, y: 4 },
      { x: 2, y: 1 },
      { x: 2, y: 2 },
      { x: 3, y: 2 },
      { x: 3, y: 3 },
      { x: 3, y: 4 },
      { x: 4, y: 0 },
      { x: 4, y: 2 },
      { x: 5, y: 0 },
    ],
    doors: [
      { id: 'door-5-shadow', world: 'shadow', position: { x: 4, y: 1 }, initialOpen: false },
      { id: 'door-5-real', world: 'real', position: { x: 3, y: 2 }, initialOpen: false },
    ],
    pressurePlates: [
      { id: 'plate-5-real', world: 'real', position: { x: 1, y: 1 }, linkedDoorId: 'door-5-shadow' },
      { id: 'plate-5-shadow', world: 'shadow', position: { x: 3, y: 1 }, linkedDoorId: 'door-5-real' },
    ],
    // 1. up    -> Real to (1,1) [Plate 1 pressed -> Door 1 opens], Shadow to (5,1)
    // 2. right -> Real blocked at (1,1) [wall stop (2,1)], Shadow to (4,1) [through Door 1]
    // 3. right -> Real blocked at (1,1), Shadow to (3,1) [Plate 2 pressed -> Door 2 opens]
    // 4. down  -> Real to (1,2) [off Plate 1 -> Door 1 closes], Shadow blocked at (3,1) [wall stop (3,2)]
    // 5. right -> Real to (2,2), Shadow blocked at (3,1) [wall stop (2,1)]
    // 6. right -> Real to (3,2) [through Door 2], Shadow blocked at (3,1)
    // 7. right -> Real to (4,2) [past Door 2], Shadow blocked at (3,1)
    // 8. up    -> Real to (4,1), Shadow to (3,0) [off Plate 2 -> Door 2 closes]
    // 9. right -> Real to (5,1), Shadow to (2,0)
    // 10. right-> Real blocked at (5,1) [wall stop (6,1)], Shadow to (1,0)
    // 11. down -> Real to (5,2) [Exit!], Shadow to (1,1)
    // 12. down -> Real blocked at (5,2) [wall stop (5,3)], Shadow to (1,2) [Exit!]
    solutionTrace: [
      'up',
      'right',
      'right',
      'down',
      'right',
      'right',
      'right',
      'up',
      'right',
      'right',
      'down',
      'down',
    ],
  },
  {
    id: 6,
    chapter: 'THE CONNECTION',
    name: 'Detonation',
    width: 7,
    height: 5,
    difficulty: 'HARD',
    hint: 'Prime the bomb, flee south to shelter from the blast, and cross the breached walls.',
    realStart: { x: 1, y: 2 },
    shadowStart: { x: 5, y: 2 },
    realExit: { x: 5, y: 2 },
    shadowExit: { x: 1, y: 2 },
    realWalls: [
      { x: 1, y: 0 },
      { x: 3, y: 0 },
      { x: 3, y: 1 },
      { x: 3, y: 3 },
      { x: 3, y: 4 },
      { x: 6, y: 0 },
      { x: 6, y: 1 },
      { x: 6, y: 2 },
      { x: 6, y: 3 },
      { x: 6, y: 4 },
      { x: 5, y: 3 },
      { x: 5, y: 4 },
      { x: 0, y: 1 },
      { x: 0, y: 2 },
      { x: 0, y: 3 },
      { x: 0, y: 4 },
    ],
    shadowWalls: [
      { x: 5, y: 0 },
      { x: 3, y: 0 },
      { x: 3, y: 2 },
      { x: 3, y: 3 },
      { x: 3, y: 4 },
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: 2 },
      { x: 0, y: 3 },
      { x: 0, y: 4 },
      { x: 1, y: 3 },
      { x: 1, y: 4 },
      { x: 4, y: 0 },
      { x: 4, y: 3 },
      { x: 4, y: 4 },
      { x: 5, y: 4 },
    ],
    destructibleWalls: [
      { id: 'dw-6-real', world: 'real', position: { x: 3, y: 2 } },
      { id: 'dw-6-shadow', world: 'shadow', position: { x: 3, y: 1 } },
    ],
    bombs: [
      {
        id: 'bomb-6-primary',
        world: 'real',
        position: { x: 2, y: 1 },
        timer: 3,
        radius: 1,
        crossWorld: true,
        triggerType: 'STEP',
      },
      {
        id: 'bomb-6-secondary',
        world: 'shadow',
        position: { x: 2, y: 2 },
        timer: 5,
        radius: 1,
        crossWorld: true,
        triggerType: 'STEP',
      },
    ],
    // 1. up    -> Real (1,1), Shadow (5,1)
    // 2. right -> Real (2,1) [steps on Bomb 1! Timer=3], Shadow (4,1)
    // 3. down  -> Real (2,2) [Timer=2], Shadow (4,2)
    // 4. down  -> Real (2,3) [Timer=1], Shadow (4,2) [wall stop]
    // 5. down  -> Real (2,4) [Timer=0 -> DETONATION! Safe in shelter!], Shadow (4,2) [Safe!]
    // 6. up    -> Real (2,3), Shadow (4,1)
    // 7. up    -> Real (2,2), Shadow (4,1) [wall stop]
    // 8. right -> Real (3,2) [breached dw-6-real!], Shadow (3,1) [breached dw-6-shadow!]
    // 9. right -> Real (4,2), Shadow (2,1)
    // 10. right-> Real (5,2) [Real Exit!], Shadow (1,1)
    // 11. down -> Real (5,2) [Exit], Shadow (1,2) [Shadow Exit! Level Complete!]
    solutionTrace: [
      'up',
      'right',
      'down',
      'down',
      'down',
      'up',
      'up',
      'right',
      'right',
      'right',
      'down',
    ],
  },
  {
    id: 7,
    chapter: 'THE CONNECTION',
    name: 'Through the Other Side',
    width: 7,
    height: 5,
    difficulty: 'HARD',
    hint: 'Use the rift portals to cross the impenetrable barrier and unlock the counterpart gates.',
    realStart: { x: 1, y: 2 },
    shadowStart: { x: 5, y: 2 },
    realExit: { x: 5, y: 2 },
    shadowExit: { x: 1, y: 2 },
    realWalls: [
      { x: 3, y: 0 },
      { x: 3, y: 1 },
      { x: 3, y: 2 },
      { x: 3, y: 3 },
      { x: 3, y: 4 },
      { x: 6, y: 0 },
      { x: 6, y: 1 },
      { x: 6, y: 2 },
      { x: 6, y: 3 },
      { x: 6, y: 4 },
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: 2 },
      { x: 0, y: 3 },
      { x: 0, y: 4 },
      { x: 1, y: 4 },
      { x: 5, y: 4 },
    ],
    shadowWalls: [
      { x: 3, y: 0 },
      { x: 3, y: 1 },
      { x: 3, y: 2 },
      { x: 3, y: 3 },
      { x: 3, y: 4 },
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: 2 },
      { x: 0, y: 3 },
      { x: 0, y: 4 },
      { x: 6, y: 0 },
      { x: 6, y: 1 },
      { x: 6, y: 2 },
      { x: 6, y: 3 },
      { x: 6, y: 4 },
      { x: 5, y: 0 },
      { x: 1, y: 0 },
    ],
    doors: [
      { id: 'door-7-real', world: 'real', position: { x: 4, y: 2 }, initialOpen: false },
      { id: 'door-7-shadow', world: 'shadow', position: { x: 2, y: 2 }, initialOpen: false },
    ],
    switches: [
      { id: 'sw-7-real', world: 'real', position: { x: 4, y: 3 }, linkedDoorId: 'door-7-shadow' },
      { id: 'sw-7-shadow', world: 'shadow', position: { x: 2, y: 3 }, linkedDoorId: 'door-7-real' },
    ],
    portals: [
      {
        id: 'portal-7-real-in',
        world: 'real',
        position: { x: 1, y: 1 },
        targetWorld: 'real',
        targetPosition: { x: 4, y: 1 },
        initialActive: true,
      },
      {
        id: 'portal-7-shadow-in',
        world: 'shadow',
        position: { x: 5, y: 3 },
        targetWorld: 'shadow',
        targetPosition: { x: 2, y: 3 },
        initialActive: true,
      },
      {
        id: 'portal-7-shadow-return',
        world: 'shadow',
        position: { x: 2, y: 1 },
        targetWorld: 'shadow',
        targetPosition: { x: 5, y: 1 },
        initialActive: true,
      },
    ],
    // 1. up    -> Real steps into (1,1) -> teleports to (4,1)! Shadow (5,1)
    // 2. right -> Real to (5,1), Shadow to (4,1)
    // 3. down  -> Real to (5,2) [Exit], Shadow to (4,2)
    // 4. down  -> Real held at (5,2), Shadow to (4,3)
    // 5. left  -> Real to (4,2) [door opened], Shadow to (5,3) -> teleports to (2,3) [hits sw-7-shadow!]
    // 6. right -> Real to (5,2) [Real Exit], Shadow to (1,3)
    // 7. up    -> Real held at (5,2), Shadow to (1,2) [Shadow Exit! Level Complete!]
    solutionTrace: ['up', 'right', 'down', 'down', 'left', 'right', 'up'],
  },
  {
    id: 8,
    chapter: 'THE CONNECTION',
    name: 'Chain Reaction',
    width: 7,
    height: 5,
    difficulty: 'EXPERT',
    hint: 'Teleport to prime the bomb, shelter from the double blast, then cross the cleared rifts.',
    realStart: { x: 1, y: 2 },
    shadowStart: { x: 5, y: 2 },
    realExit: { x: 5, y: 2 },
    shadowExit: { x: 1, y: 2 },
    realWalls: [
      { x: 3, y: 0 },
      { x: 3, y: 1 },
      { x: 3, y: 3 },
      { x: 3, y: 4 },
      { x: 6, y: 0 },
      { x: 6, y: 1 },
      { x: 6, y: 2 },
      { x: 6, y: 3 },
      { x: 6, y: 4 },
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: 2 },
      { x: 0, y: 3 },
      { x: 0, y: 4 },
      { x: 5, y: 0 },
      { x: 5, y: 4 },
    ],
    shadowWalls: [
      { x: 3, y: 0 },
      { x: 3, y: 1 },
      { x: 3, y: 3 },
      { x: 3, y: 4 },
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: 2 },
      { x: 0, y: 3 },
      { x: 0, y: 4 },
      { x: 6, y: 0 },
      { x: 6, y: 1 },
      { x: 6, y: 2 },
      { x: 6, y: 3 },
      { x: 6, y: 4 },
      { x: 1, y: 0 },
      { x: 1, y: 4 },
    ],
    destructibleWalls: [
      { id: 'dw-8-real', world: 'real', position: { x: 3, y: 2 } },
      { id: 'dw-8-shadow', world: 'shadow', position: { x: 3, y: 2 } },
    ],
    bombs: [
      {
        id: 'bomb-8-primary',
        world: 'real',
        position: { x: 4, y: 1 },
        timer: 3,
        radius: 1,
        crossWorld: true,
        triggerType: 'STEP',
      },
      {
        id: 'bomb-8-secondary',
        world: 'shadow',
        position: { x: 4, y: 2 },
        timer: 5, // Chain ignited by Bomb 1
        radius: 1,
        crossWorld: true,
        triggerType: 'STEP',
      },
    ],
    portals: [
      {
        id: 'portal-8-real-in',
        world: 'real',
        position: { x: 1, y: 1 },
        targetWorld: 'real',
        targetPosition: { x: 4, y: 1 }, // Teleports directly onto Bomb 1 to prime it!
        initialActive: true,
      },
    ],
    solutionTrace: [
      'up',    // 1. Real teleports to (4,1) via portal, primes Bomb 1
      'down',  // 2. Real to (4,2), Shadow to (5,2)
      'down',  // 3. Real to (4,3), Shadow to (5,3)
      'down',  // 4. Real to (4,4), Shadow to (5,4) -> Detonates Bomb 1 & chain detonates Bomb 2! Destroys walls!
      'up',    // 5. Real to (4,3), Shadow to (5,3)
      'up',    // 6. Real to (4,2), Shadow to (5,2)
      'right', // 7. Real to (5,2) [Real Exit], Shadow to (4,2)
      'right', // 8. Real anchored at (5,2), Shadow breaches (3,2)
      'right', // 9. Real anchored, Shadow to (2,2)
      'right', // 10. Real anchored, Shadow to (1,2) [Shadow Exit] -> VICTORY!
    ],
  },

  // ==========================================
  // CHAPTER 3: THE SEPARATION (Levels 9–12)
  // ==========================================
  {
    id: 9,
    chapter: 'THE SEPARATION',
    name: 'The Corruption',
    width: 8,
    height: 5,
    difficulty: 'EXPERT',
    hint: 'The corrupted portal shifts destinations each entry. Align both worlds to clear hazardous paths.',
    realStart: { x: 1, y: 2 },
    shadowStart: { x: 6, y: 2 },
    realExit: { x: 6, y: 2 },
    shadowExit: { x: 1, y: 2 },
    realWalls: [
      { x: 3, y: 0 },
      { x: 3, y: 1 },
      { x: 3, y: 3 },
      { x: 3, y: 4 },
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: 2 },
      { x: 0, y: 3 },
      { x: 0, y: 4 },
      { x: 7, y: 0 },
      { x: 7, y: 1 },
      { x: 7, y: 2 },
      { x: 7, y: 3 },
      { x: 7, y: 4 },
      { x: 5, y: 0 },
      { x: 5, y: 1 },
      { x: 5, y: 2 },
      { x: 5, y: 3 },
      { x: 5, y: 4 },
    ],
    shadowWalls: [
      { x: 4, y: 0 },
      { x: 4, y: 4 },
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: 2 },
      { x: 0, y: 3 },
      { x: 0, y: 4 },
      { x: 7, y: 0 },
      { x: 7, y: 1 },
      { x: 7, y: 2 },
      { x: 7, y: 3 },
      { x: 7, y: 4 },
      { x: 2, y: 0 },
      { x: 2, y: 4 },
    ],
    hazards: [
      { id: 'hz-9-shadow-1', world: 'shadow', position: { x: 5, y: 1 } },
      { id: 'hz-9-shadow-2', world: 'shadow', position: { x: 3, y: 3 } },
      { id: 'hz-9-real-trap', world: 'real', position: { x: 4, y: 3 } },
    ],
    doors: [
      { id: 'door-9-real', world: 'real', position: { x: 3, y: 2 }, initialOpen: false },
      { id: 'door-9-shadow', world: 'shadow', position: { x: 4, y: 2 }, initialOpen: false },
    ],
    switches: [
      { id: 'sw-9-real', world: 'real', position: { x: 4, y: 0 }, linkedDoorId: 'door-9-shadow' },
      { id: 'sw-9-shadow', world: 'shadow', position: { x: 3, y: 1 }, linkedDoorId: 'door-9-real' },
    ],
    portals: [
      {
        id: 'portal-9-corrupt',
        world: 'real',
        position: { x: 1, y: 1 },
        corrupted: true,
        destinations: [
          { targetWorld: 'real', targetPosition: { x: 4, y: 1 } },
          { targetWorld: 'real', targetPosition: { x: 6, y: 1 } },
        ],
        initialActive: true,
      },
      {
        id: 'portal-9-return',
        world: 'real',
        position: { x: 4, y: 2 },
        targetWorld: 'real',
        targetPosition: { x: 1, y: 2 },
        initialActive: true,
      },
    ],
    solutionTrace: [
      'up',    // 1. Real enters portal-9-corrupt -> teleports to Dest 0: (4,1), Shadow to (6,1)
      'up',    // 2. Real to (4,0) [hits sw-9-real, opening door-9-shadow!], Shadow to (6,0)
      'down',  // 3. Real to (4,1), Shadow to (6,1)
      'down',  // 4. Real to (4,2) [enters portal-9-return -> lands on (1,2)], Shadow to (6,2)
      'right', // 5. Real to (2,2), Shadow to (5,2)
      'right', // 6. Real held at (2,2) by door-9-real, Shadow enters open door-9-shadow at (4,2)
      'right', // 7. Real held, Shadow to (3,2)
      'right', // 8. Real held, Shadow to (2,2)
      'right', // 9. Real held, Shadow reaches Shadow Exit at (1,2) [Locked on arrival!]
      'up',    // 10. Real to (2,1), Shadow remains locked
      'left',  // 11. Real enters portal-9-corrupt -> teleports to Dest 1: (6,1)!
      'down',  // 12. Real reaches Real Exit at (6,2) -> Simultaneous Exit & VICTORY!
    ],
  },
  {
    id: 10,
    chapter: 'THE SEPARATION',
    name: 'The Turning Blade',
    width: 7,
    height: 5,
    difficulty: 'EXPERT',
    hint: 'Saw blades patrol predictable circuits around the exits. Time your crossing while holding open the gates.',
    realStart: { x: 1, y: 2 },
    shadowStart: { x: 5, y: 2 },
    realExit: { x: 5, y: 2 },
    shadowExit: { x: 1, y: 2 },
    realWalls: [
      { x: 3, y: 0 },
      { x: 3, y: 1 },
      { x: 3, y: 3 },
      { x: 3, y: 4 },
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: 2 },
      { x: 0, y: 3 },
      { x: 0, y: 4 },
      { x: 6, y: 0 },
      { x: 6, y: 1 },
      { x: 6, y: 2 },
      { x: 6, y: 3 },
      { x: 6, y: 4 },
    ],
    shadowWalls: [
      { x: 3, y: 0 },
      { x: 3, y: 1 },
      { x: 3, y: 3 },
      { x: 3, y: 4 },
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: 2 },
      { x: 0, y: 3 },
      { x: 0, y: 4 },
      { x: 6, y: 0 },
      { x: 6, y: 1 },
      { x: 6, y: 2 },
      { x: 6, y: 3 },
      { x: 6, y: 4 },
    ],
    doors: [
      { id: 'door-10-real', world: 'real', position: { x: 3, y: 2 }, initialOpen: false },
      { id: 'door-10-shadow', world: 'shadow', position: { x: 3, y: 2 }, initialOpen: false },
    ],
    pressurePlates: [
      { id: 'plate-10-real', world: 'real', position: { x: 2, y: 2 }, linkedDoorId: 'door-10-shadow' },
      { id: 'plate-10-shadow', world: 'shadow', position: { x: 2, y: 1 }, linkedDoorId: 'door-10-real' },
    ],
    movingHazards: [
      {
        id: 'saw-10-real',
        world: 'real',
        path: [
          { x: 4, y: 1 },
          { x: 5, y: 1 },
          { x: 5, y: 3 },
          { x: 4, y: 3 },
        ],
        initialIndex: 0,
      },
      {
        id: 'saw-10-shadow',
        world: 'shadow',
        path: [
          { x: 4, y: 3 },
          { x: 5, y: 3 },
          { x: 5, y: 1 },
          { x: 4, y: 1 },
        ],
        initialIndex: 0,
      },
    ],
    solutionTrace: [
      'right', // 1. Real to (2,2) [plate-10-real: opens door-10-shadow!], Shadow to (4,2)
      'right', // 2. Real held at (2,2) by closed door-10-real, Shadow enters open door-10-shadow to (3,2)
      'down',  // 3. Real to (2,3), Shadow to (3,3)
      'right', // 4. Real to (3,3) [wall stop], Shadow to (2,3)
      'up',    // 5. Real to (2,2), Shadow to (2,2)
      'right', // 6. Real held at (2,2), Shadow reaches Shadow Exit at (1,2) [Locked on arrival!]
      'right', // 7. Real held, Shadow held
      'right', // 8. Real enters open door-10-real to (4,2), Shadow held
      'down',  // 9. Real reaches Real Exit at (5,2) -> VICTORY!
    ],
  },
  {
    id: 11,
    chapter: 'THE SEPARATION',
    name: 'No Way Back',
    width: 8,
    height: 5,
    difficulty: 'EXPERT',
    hint: 'Fragile floors crumble into the void once stepped off. Stepping onto the upper bridge triggers a delayed collapse across the rift.',
    realStart: { x: 1, y: 2 },
    shadowStart: { x: 6, y: 2 },
    realExit: { x: 6, y: 2 },
    shadowExit: { x: 1, y: 2 },
    realWalls: [
      { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 }, { x: 7, y: 0 },
      { x: 0, y: 4 }, { x: 1, y: 4 }, { x: 2, y: 4 }, { x: 3, y: 4 }, { x: 4, y: 4 }, { x: 5, y: 4 }, { x: 6, y: 4 }, { x: 7, y: 4 },
      { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 },
      { x: 7, y: 1 }, { x: 7, y: 2 }, { x: 7, y: 3 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 2, y: 3 },
      { x: 5, y: 0 },
    ],
    shadowWalls: [
      { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 }, { x: 7, y: 0 },
      { x: 0, y: 4 }, { x: 1, y: 4 }, { x: 2, y: 4 }, { x: 3, y: 4 }, { x: 4, y: 4 }, { x: 5, y: 4 }, { x: 6, y: 4 }, { x: 7, y: 4 },
      { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 },
      { x: 7, y: 1 }, { x: 7, y: 2 }, { x: 7, y: 3 },
      { x: 6, y: 1 },
      { x: 5, y: 1 },
      { x: 5, y: 3 },
      { x: 2, y: 0 },
    ],
    collapsingFloors: [
      { id: 'cf-11-real-entry', world: 'real', position: { x: 2, y: 2 } },
      { id: 'cf-11-shadow-entry', world: 'shadow', position: { x: 5, y: 2 } },
      { id: 'cf-11-real-mid', world: 'real', position: { x: 4, y: 2 } },
      { id: 'cf-11-shadow-mid', world: 'shadow', position: { x: 3, y: 2 } },
      { id: 'cf-11-real-bridge', world: 'real', position: { x: 3, y: 1 } },
      { id: 'cf-11-shadow-bridge', world: 'shadow', position: { x: 4, y: 1 } },
      { id: 'cf-11-real-upper', world: 'real', position: { x: 4, y: 1 } },
      { id: 'cf-11-shadow-upper', world: 'shadow', position: { x: 3, y: 1 } },
    ],
    checkpoints: [
      { id: 'cp-11', realPosition: { x: 3, y: 2 }, shadowPosition: { x: 4, y: 2 } },
    ],
    movingHazards: [
      {
        id: 'saw-11-real',
        world: 'real',
        path: [
          { x: 5, y: 2 },
          { x: 5, y: 1 },
          { x: 5, y: 2 },
          { x: 5, y: 3 },
        ],
        initialIndex: 0,
      },
      {
        id: 'saw-11-shadow',
        world: 'shadow',
        path: [
          { x: 2, y: 2 },
          { x: 2, y: 3 },
          { x: 2, y: 2 },
          { x: 2, y: 1 },
        ],
        initialIndex: 0,
      },
    ],
    solutionTrace: [
      'right', // 1. Real onto cf-11-real-entry (2,2), Shadow onto cf-11-shadow-entry (5,2) [Floors crack!]
      'right', // 2. Real to cp-11 (3,2), Shadow to cp-11 (4,2) [Checkpoint activated! Entry floors collapse, cross-collapse armed!]
      'up',    // 3. Real up onto fragile bridge (3,1), Shadow up onto (4,1) [Shadow lower path collapses!]
      'right', // 4. Real to cf-11-real-upper (4,1), Shadow to (3,1) [Bridge collapses behind!]
      'down',  // 5. Real to cf-11-real-mid (4,2), Shadow to cf-11-shadow-mid (3,2) [Evading upper saw return!]
      'down',  // 6. Real down to (4,3), Shadow down to (3,3)
      'left',  // 7. Stagger step left: Real to (3,3), Shadow to (4,3) [Synchronizing saw cycle!]
      'right', // 8. Real enters safe row 3 corridor (4,3), Shadow to (3,3)
      'right', // 9. Real breaches column 5 into (5,3), Shadow breaches column 2 into (2,3) while saws swing north!
      'right', // 10. Real to (6,3), Shadow to (1,3) [Saws swing behind into row 3!]
      'up',    // 11. Real ascends into Real Exit (6,2), Shadow ascends into Shadow Exit (1,2) -> VICTORY!
    ],
    surpriseEvents: [
      {
        id: 'se-11-cross-collapse',
        name: 'Sympathetic Vault Collapse',
        triggerType: 'STEP_ON',
        triggerWorld: 'real',
        triggerPosition: { x: 3, y: 2 },
        targetWorld: 'shadow',
        targetType: 'COLLAPSE_FLOOR',
        targetPosition: { x: 4, y: 3 },
        activationDelay: 1,
        action: 'COLLAPSE_TILE',
        animation: 'crumble',
        sound: 'crumble',
        warningClue: 'A sympathetic tremor echoes through the lower Shadow corridor floor',
      },
      {
        id: 'se-11-real-seal',
        name: 'Origin Platform Collapse',
        triggerType: 'STEP_ON',
        triggerWorld: 'real',
        triggerPosition: { x: 3, y: 2 },
        targetWorld: 'real',
        targetType: 'COLLAPSE_FLOOR',
        targetPosition: { x: 1, y: 2 },
        activationDelay: 1,
        action: 'COLLAPSE_TILE',
        animation: 'crumble',
        sound: 'crumble',
        warningClue: 'Faint hairline fractures vibrating across the entry platform',
      },
    ],
  },
  {
    id: 12,
    chapter: 'THE SEPARATION',
    name: 'The Countdown',
    width: 8,
    height: 5,
    difficulty: 'EXPERT',
    hint: 'Prime the countdown bomb, cross the crumbling bridges before they collapse, and evade the dual saws.',
    realStart: { x: 1, y: 2 },
    shadowStart: { x: 6, y: 2 },
    realExit: { x: 6, y: 2 },
    shadowExit: { x: 1, y: 2 },
    realWalls: [
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: 2 },
      { x: 0, y: 3 },
      { x: 0, y: 4 },
      { x: 7, y: 0 },
      { x: 7, y: 1 },
      { x: 7, y: 2 },
      { x: 7, y: 3 },
      { x: 7, y: 4 },
      { x: 4, y: 0 },
      { x: 4, y: 4 },
      { x: 2, y: 1 },
      { x: 2, y: 3 },
    ],
    shadowWalls: [
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: 2 },
      { x: 0, y: 3 },
      { x: 0, y: 4 },
      { x: 7, y: 0 },
      { x: 7, y: 1 },
      { x: 7, y: 2 },
      { x: 7, y: 3 },
      { x: 7, y: 4 },
      { x: 3, y: 0 },
      { x: 3, y: 4 },
      { x: 5, y: 1 },
      { x: 5, y: 3 },
    ],
    collapsingFloors: [
      { id: 'cf-12-real', world: 'real', position: { x: 2, y: 2 } },
      { id: 'cf-12-shadow', world: 'shadow', position: { x: 5, y: 2 } },
    ],
    doors: [
      { id: 'door-12-real', world: 'real', position: { x: 4, y: 2 }, initialOpen: false },
      { id: 'door-12-shadow', world: 'shadow', position: { x: 3, y: 2 }, initialOpen: false },
    ],
    switches: [
      { id: 'sw-12-real', world: 'real', position: { x: 3, y: 3 }, linkedDoorId: 'door-12-shadow' },
      { id: 'sw-12-shadow', world: 'shadow', position: { x: 4, y: 3 }, linkedDoorId: 'door-12-real' },
    ],
    bombs: [
      {
        id: 'bomb-12',
        world: 'real',
        position: { x: 3, y: 1 },
        timer: 4,
        radius: 1,
        crossWorld: true,
        triggerType: 'STEP',
      },
    ],
    destructibleWalls: [
      { id: 'dw-12-real', world: 'real', position: { x: 4, y: 1 } },
      { id: 'dw-12-shadow', world: 'shadow', position: { x: 3, y: 1 } },
    ],
    movingHazards: [
      {
        id: 'saw-12-real',
        world: 'real',
        path: [
          { x: 5, y: 0 },
          { x: 5, y: 1 },
          { x: 5, y: 2 },
          { x: 5, y: 3 },
          { x: 5, y: 4 },
          { x: 5, y: 3 },
          { x: 5, y: 2 },
          { x: 5, y: 1 },
        ],
        initialIndex: 0,
      },
      {
        id: 'saw-12-shadow',
        world: 'shadow',
        path: [
          { x: 2, y: 4 },
          { x: 2, y: 3 },
          { x: 2, y: 2 },
          { x: 2, y: 1 },
          { x: 2, y: 0 },
          { x: 2, y: 1 },
          { x: 2, y: 2 },
          { x: 2, y: 3 },
        ],
        initialIndex: 0,
      },
    ],
    solutionTrace: [
      'up',    // 1. Stagger step up to calibrate saw patrol cycle
      'down',  // 2. Return to start row
      'right', // 3. Real crosses cf-12-real at (2,2), Shadow crosses cf-12-shadow at (5,2)
      'right', // 4. Real reaches door-12-real at (4,2) stop, Shadow to door-12-shadow stop [Floors collapse behind!]
      'down',  // 5. Real hits sw-12-real at (3,3), Shadow hits sw-12-shadow at (4,3) -> Both doors unlock!
      'up',    // 6. Return to corridor at row 2
      'right', // 7. Real enters open door-12-real at (4,2), Shadow enters open door-12-shadow at (3,2)
      'right', // 8. Real crosses saw corridor to (5,2), Shadow crosses saw corridor to (2,2)
      'right', // 9. Real to (6,2) [Real Exit], Shadow to (1,2) [Shadow Exit] -> VICTORY!
    ],
    surpriseEvents: [
      {
        id: 'se-12-shockwave',
        name: 'Detonation Shockwave',
        triggerType: 'STEP_ON',
        triggerWorld: 'real',
        triggerPosition: { x: 3, y: 3 },
        targetWorld: 'real',
        targetType: 'COLLAPSE_FLOOR',
        targetPosition: { x: 1, y: 2 },
        activationDelay: 1,
        action: 'COLLAPSE_TILE',
        animation: 'crumble',
        sound: 'crumble',
        warningClue: 'Subterranean tremor destabilizing the abandoned entry zone',
      },
      {
        id: 'se-12-vault-breach',
        name: 'Vault Breach Alarm',
        triggerType: 'SWITCH_TOGGLE',
        triggerSourceId: 'sw-12-real',
        targetWorld: 'shadow',
        targetType: 'WALL',
        targetPosition: { x: 3, y: 0 },
        activationDelay: 0,
        action: 'REMOVE_WALL',
        animation: 'spark',
        sound: 'wall_open',
        warningClue: 'Structural integrity alarm sounding in the northern perimeter',
      },
    ],
  },

  // ==========================================
  // CHAPTER 4: THE REFLECTION (Levels 13–16)
  // ==========================================
  {
    id: 13,
    chapter: 'THE REFLECTION',
    name: 'Refraction',
    width: 7,
    height: 5,
    difficulty: 'EXPERT',
    hint: 'Laser beams create lethal barriers. Use independent collision to rotate mirrors in sequence, clearing danger zones and powering the gateway receivers.',
    realStart: { x: 1, y: 2 },
    shadowStart: { x: 5, y: 2 },
    realExit: { x: 5, y: 2 },
    shadowExit: { x: 1, y: 2 },
    realWalls: [
      { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 },
      { x: 0, y: 4 }, { x: 1, y: 4 }, { x: 2, y: 4 }, { x: 3, y: 4 }, { x: 4, y: 4 }, { x: 5, y: 4 }, { x: 6, y: 4 },
      { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 },
      { x: 6, y: 1 }, { x: 6, y: 2 }, { x: 6, y: 3 },
      { x: 3, y: 1 }, { x: 3, y: 3 },
      { x: 1, y: 1 },
    ],
    shadowWalls: [
      { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 },
      { x: 0, y: 4 }, { x: 1, y: 4 }, { x: 2, y: 4 }, { x: 3, y: 4 }, { x: 4, y: 4 }, { x: 5, y: 4 }, { x: 6, y: 4 },
      { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 },
      { x: 6, y: 1 }, { x: 6, y: 2 }, { x: 6, y: 3 },
      { x: 3, y: 1 }, { x: 3, y: 3 },
      { x: 5, y: 3 },
    ],
    doors: [
      { id: 'door-13-real', world: 'real', position: { x: 3, y: 2 }, initialOpen: false },
      { id: 'door-13-shadow', world: 'shadow', position: { x: 3, y: 2 }, initialOpen: false },
    ],
    switches: [
      { id: 'sw-13-real', world: 'real', position: { x: 1, y: 3 }, linkedDoorId: 'mirror-13-shadow' },
      { id: 'sw-13-shadow', world: 'shadow', position: { x: 5, y: 1 }, linkedDoorId: 'mirror-13-real' },
    ],
    laserEmitters: [
      { id: 'le-13-real', world: 'real', position: { x: 2, y: 0 }, direction: 'down', initialActive: true },
      { id: 'le-13-shadow', world: 'shadow', position: { x: 4, y: 0 }, direction: 'down', initialActive: true },
    ],
    laserMirrors: [
      { id: 'mirror-13-real', world: 'real', position: { x: 2, y: 1 }, orientation: '/', rotatable: true, linkedSwitchId: 'sw-13-shadow' },
      { id: 'mirror-13-shadow', world: 'shadow', position: { x: 4, y: 1 }, orientation: '\\', rotatable: true, linkedSwitchId: 'sw-13-real' },
    ],
    laserReceivers: [
      { id: 'rx-13-real', world: 'real', position: { x: 3, y: 1 }, linkedDoorId: 'door-13-shadow' },
      { id: 'rx-13-shadow', world: 'shadow', position: { x: 3, y: 1 }, linkedDoorId: 'door-13-real' },
    ],
    solutionTrace: [
      'down',  // 1. Real steps down onto sw-13-real (1,3); Shadow held by wall (5,3). Rotates mirror-13-shadow to '/' -> opens door-13-real & clears (5,1)!
      'up',    // 2. Real returns to (1,2); Shadow steps up onto sw-13-shadow (5,1). Rotates mirror-13-real to '\' -> opens door-13-shadow & clears (1,1)!
      'right', // 3. Real to (2,2); Shadow to (4,1).
      'up',    // 4. Real holds at (2,2) against mirror-13-real; Shadow aligns to (4,1).
      'down',  // 5. Real at (2,2); Shadow returns down to corridor (4,2).
      'right', // 6. Real crosses into open door-13-real (3,2); Shadow crosses into open door-13-shadow (3,2).
      'right', // 7. Real to (4,2); Shadow to (2,2).
      'right', // 8. Real reaches Real Exit at (5,2); Shadow reaches Shadow Exit at (1,2) -> VICTORY!
    ],
    surpriseEvents: [
      {
        id: 'se-13-cross-vault',
        name: 'Prismatic Vault Flare',
        triggerType: 'STEP_ON',
        triggerWorld: 'real',
        triggerPosition: { x: 1, y: 3 },
        targetWorld: 'shadow',
        targetType: 'WALL',
        targetPosition: { x: 5, y: 0 },
        activationDelay: 0,
        action: 'REMOVE_WALL',
        animation: 'spark',
        sound: 'distortion',
        warningClue: 'Prismatic optical flare vibrating across the mirror chamber ceiling',
      },
      {
        id: 'se-13-collapse-entry',
        name: 'Refraction Collapse',
        triggerType: 'STEP_ON',
        triggerWorld: 'real',
        triggerPosition: { x: 2, y: 2 },
        targetWorld: 'real',
        targetType: 'COLLAPSE_FLOOR',
        targetPosition: { x: 1, y: 3 },
        activationDelay: 1,
        action: 'COLLAPSE_TILE',
        animation: 'crumble',
        sound: 'crumble',
        warningClue: 'The switch platform begins groaning under structural stress',
      },
    ],
  },
  {
    id: 14,
    chapter: 'THE REFLECTION',
    name: 'The Frozen Moment',
    width: 7,
    height: 5,
    difficulty: 'EXPERT',
    hint: 'High-speed saw blades patrol the exit corridors. Step on the Time Locks to freeze the blades for just long enough to slip past.',
    realStart: { x: 1, y: 2 },
    shadowStart: { x: 5, y: 2 },
    realExit: { x: 5, y: 2 },
    shadowExit: { x: 1, y: 2 },
    realWalls: [
      { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 },
      { x: 0, y: 4 }, { x: 1, y: 4 }, { x: 2, y: 4 }, { x: 3, y: 4 }, { x: 4, y: 4 }, { x: 5, y: 4 }, { x: 6, y: 4 },
      { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 },
      { x: 6, y: 1 }, { x: 6, y: 2 }, { x: 6, y: 3 },
      { x: 3, y: 1 }, { x: 3, y: 3 },
      { x: 1, y: 1 },
      { x: 2, y: 3 },
    ],
    shadowWalls: [
      { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 },
      { x: 0, y: 4 }, { x: 1, y: 4 }, { x: 2, y: 4 }, { x: 3, y: 4 }, { x: 4, y: 4 }, { x: 5, y: 4 }, { x: 6, y: 4 },
      { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 },
      { x: 6, y: 1 }, { x: 6, y: 2 }, { x: 6, y: 3 },
      { x: 3, y: 1 }, { x: 3, y: 3 },
      { x: 5, y: 3 },
    ],
    doors: [
      { id: 'door-14-real', world: 'real', position: { x: 3, y: 2 }, initialOpen: false },
      { id: 'door-14-shadow', world: 'shadow', position: { x: 3, y: 2 }, initialOpen: false },
    ],
    timeLocks: [
      { id: 'tl-14-real', world: 'real', position: { x: 1, y: 3 }, duration: 6, linkedDoorId: 'door-14-shadow', targetHazardIds: ['saw-14-shadow'] },
      { id: 'tl-14-shadow', world: 'shadow', position: { x: 5, y: 1 }, duration: 6, linkedDoorId: 'door-14-real', targetHazardIds: ['saw-14-real'] },
    ],
    movingHazards: [
      {
        id: 'saw-14-real',
        world: 'real',
        path: [
          { x: 4, y: 1 },
          { x: 4, y: 2 },
          { x: 4, y: 3 },
          { x: 4, y: 2 },
        ],
        initialIndex: 0,
      },
      {
        id: 'saw-14-shadow',
        world: 'shadow',
        path: [
          { x: 2, y: 3 },
          { x: 2, y: 2 },
          { x: 2, y: 1 },
          { x: 2, y: 2 },
        ],
        initialIndex: 0,
      },
    ],
    solutionTrace: [
      'up',    // 1. Shadow steps on tl-14-shadow at (5,1), freezing saw-14-real and opening door-14-real!
      'right', // 2. Shadow steps left to (4,1); Real aligns to (2,2).
      'down',  // 3. Real holds at (2,2) against wall (2,3); Shadow aligns to row 2 at (4,2).
      'left',  // 4. Stagger alignment back to (1,2) and (5,2).
      'down',  // 5. Real steps on tl-14-real at (1,3), freezing saw-14-shadow and opening door-14-shadow!
      'up',    // 6. Real returns to (1,2); Shadow holds.
      'right', // 7. Real to (2,2); Shadow to (4,2).
      'down',  // 8. Stagger calibration step.
      'right', // 9. Real crosses through open door-14-real into (3,2); Shadow crosses into (3,2).
      'right', // 10. Real crosses frozen saw lane to (4,2); Shadow crosses frozen saw lane to (2,2).
      'right', // 11. Real reaches Real Exit at (5,2); Shadow reaches Shadow Exit at (1,2) -> VICTORY!
    ],
    surpriseEvents: [
      {
        id: 'se-14-stasis-ripple',
        name: 'Stasis Dilation Ripple',
        triggerType: 'STEP_ON',
        triggerWorld: 'shadow',
        triggerPosition: { x: 5, y: 1 },
        targetWorld: 'shadow',
        targetType: 'WALL',
        targetPosition: { x: 0, y: 0 },
        activationDelay: 0,
        action: 'REMOVE_WALL',
        animation: 'flicker',
        sound: 'stasis_tick',
        warningClue: 'Temporal resonance echoing through the stasis conduit',
      },
      {
        id: 'se-14-corridor-seal',
        name: 'Temporal Void Seal',
        triggerType: 'STEP_ON',
        triggerWorld: 'real',
        triggerPosition: { x: 3, y: 2 },
        targetWorld: 'real',
        targetType: 'COLLAPSE_FLOOR',
        targetPosition: { x: 1, y: 3 },
        activationDelay: 1,
        action: 'COLLAPSE_TILE',
        animation: 'crumble',
        sound: 'crumble',
        warningClue: 'Temporal lock exhausts its energy, collapsing the southern junction',
      },
    ],
  },
  {
    id: 15,
    chapter: 'THE REFLECTION',
    name: 'Magnetic',
    width: 7,
    height: 5,
    difficulty: 'EXPERT',
    hint: 'Manipulate cross-world magnetic fields to attract movable blocks onto pressure plates, securing open passage through the locked barriers.',
    realStart: { x: 1, y: 2 },
    shadowStart: { x: 5, y: 2 },
    realExit: { x: 5, y: 2 },
    shadowExit: { x: 1, y: 2 },
    realWalls: [
      { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 },
      { x: 0, y: 4 }, { x: 1, y: 4 }, { x: 2, y: 4 }, { x: 3, y: 4 }, { x: 4, y: 4 }, { x: 5, y: 4 }, { x: 6, y: 4 },
      { x: 0, y: 1 }, { x: 0, y: 2 },
      { x: 6, y: 1 }, { x: 6, y: 2 }, { x: 6, y: 3 },
      { x: 3, y: 1 }, { x: 3, y: 3 },
    ],
    shadowWalls: [
      { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 },
      { x: 0, y: 4 }, { x: 1, y: 4 }, { x: 2, y: 4 }, { x: 3, y: 4 }, { x: 4, y: 4 }, { x: 5, y: 4 }, { x: 6, y: 4 },
      { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 },
      { x: 6, y: 2 }, { x: 6, y: 3 },
      { x: 3, y: 1 }, { x: 3, y: 3 },
    ],
    doors: [
      { id: 'door-15-real', world: 'real', position: { x: 3, y: 2 }, initialOpen: false },
      { id: 'door-15-shadow', world: 'shadow', position: { x: 3, y: 2 }, initialOpen: false },
    ],
    pressurePlates: [
      { id: 'plate-15-real', world: 'real', position: { x: 1, y: 3 }, linkedDoorId: 'door-15-shadow' },
      { id: 'plate-15-shadow', world: 'shadow', position: { x: 5, y: 1 }, linkedDoorId: 'door-15-real' },
    ],
    switches: [
      { id: 'sw-15-real', world: 'real', position: { x: 1, y: 1 }, linkedDoorId: 'magnet-15-shadow' },
      { id: 'sw-15-shadow', world: 'shadow', position: { x: 5, y: 3 }, linkedDoorId: 'magnet-15-real' },
    ],
    movableBlocks: [
      { id: 'block-15-real', world: 'real', position: { x: 2, y: 3 }, magneticType: 'ATTRACT' },
      { id: 'block-15-shadow', world: 'shadow', position: { x: 4, y: 1 }, magneticType: 'ATTRACT' },
    ],
    magneticFields: [
      {
        id: 'magnet-15-real',
        world: 'real',
        position: { x: 0, y: 3 },
        direction: 'right',
        polarity: 'ATTRACT',
        initialActive: false,
        linkedSwitchId: 'sw-15-shadow',
      },
      {
        id: 'magnet-15-shadow',
        world: 'shadow',
        position: { x: 6, y: 1 },
        direction: 'left',
        polarity: 'ATTRACT',
        initialActive: false,
        linkedSwitchId: 'sw-15-real',
      },
    ],
    solutionTrace: [
      'up',    // 1. Real steps on sw-15-real (1,1) -> activates magnet-15-shadow (6,1)!
      'down',  // 2. Real to (1,2), Shadow to (5,2) -> magnet-15-shadow pulls block-15-shadow onto plate-15-shadow (5,1), opening door-15-real!
      'down',  // 3. Shadow steps on sw-15-shadow (5,3) -> activates magnet-15-real (0,3)!
      'up',    // 4. Real to (1,2), Shadow to (5,2) -> magnet-15-real pulls block-15-real onto plate-15-real (1,3), opening door-15-shadow!
      'right', // 5. Real to (2,2); Shadow to (4,2).
      'right', // 6. Real crosses into open door-15-real (3,2); Shadow crosses into open door-15-shadow (3,2).
      'right', // 7. Real to (4,2); Shadow to (2,2).
      'right', // 8. Real reaches Real Exit at (5,2); Shadow reaches Shadow Exit at (1,2) -> VICTORY!
    ],
    surpriseEvents: [
      {
        id: 'se-15-flux-breach',
        name: 'Flux Containment Breach',
        triggerType: 'STEP_ON',
        triggerWorld: 'real',
        triggerPosition: { x: 1, y: 1 },
        targetWorld: 'real',
        targetType: 'WALL',
        targetPosition: { x: 0, y: 0 },
        activationDelay: 0,
        action: 'REMOVE_WALL',
        animation: 'spark',
        sound: 'distortion',
        warningClue: 'Magnetic field surges violently against the containment barrier',
      },
      {
        id: 'se-15-induction-lock',
        name: 'Induction Circuit Lock',
        triggerType: 'STEP_ON',
        triggerWorld: 'real',
        triggerPosition: { x: 3, y: 2 },
        targetWorld: 'shadow',
        targetType: 'COLLAPSE_FLOOR',
        targetPosition: { x: 5, y: 3 },
        activationDelay: 1,
        action: 'COLLAPSE_TILE',
        animation: 'crumble',
        sound: 'crumble',
        warningClue: 'Residual polarity short-circuits the secondary floor grid',
      },
    ],
  },
  {
    id: 16,
    chapter: 'THE REFLECTION',
    name: 'The Wrong Reflection',
    width: 8,
    height: 5,
    difficulty: 'EXPERT',
    hint: 'The ultimate reflection test: synchronize lasers, magnetic pull, time locks, and moving hazards to escape.',
    realStart: { x: 1, y: 2 },
    shadowStart: { x: 6, y: 2 },
    realExit: { x: 6, y: 2 },
    shadowExit: { x: 1, y: 2 },
    realWalls: [
      { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 }, { x: 7, y: 0 },
      { x: 0, y: 4 }, { x: 1, y: 4 }, { x: 2, y: 4 }, { x: 3, y: 4 }, { x: 4, y: 4 }, { x: 5, y: 4 }, { x: 6, y: 4 }, { x: 7, y: 4 },
      { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 },
      { x: 7, y: 1 }, { x: 7, y: 2 }, { x: 7, y: 3 },
      { x: 3, y: 1 }, { x: 3, y: 3 },
      { x: 1, y: 1 },
    ],
    shadowWalls: [
      { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 }, { x: 7, y: 0 },
      { x: 0, y: 4 }, { x: 1, y: 4 }, { x: 2, y: 4 }, { x: 3, y: 4 }, { x: 4, y: 4 }, { x: 5, y: 4 }, { x: 6, y: 4 }, { x: 7, y: 4 },
      { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 },
      { x: 7, y: 2 }, { x: 7, y: 3 },
      { x: 4, y: 1 }, { x: 4, y: 3 },
      { x: 6, y: 3 },
    ],
    doors: [
      { id: 'door-16-real', world: 'real', position: { x: 3, y: 2 }, initialOpen: false },
      { id: 'door-16-shadow', world: 'shadow', position: { x: 4, y: 2 }, initialOpen: false },
    ],
    switches: [
      { id: 'sw-16-real', world: 'real', position: { x: 2, y: 3 }, linkedDoorId: 'magnet-16-shadow' },
      { id: 'sw-16-shadow', world: 'shadow', position: { x: 5, y: 3 }, linkedDoorId: 'mirror-16-real' },
    ],
    pressurePlates: [
      { id: 'plate-16-shadow', world: 'shadow', position: { x: 6, y: 1 }, linkedDoorId: 'door-16-real' },
    ],
    movableBlocks: [
      { id: 'block-16-shadow', world: 'shadow', position: { x: 5, y: 1 }, magneticType: 'ATTRACT' },
    ],
    magneticFields: [
      {
        id: 'magnet-16-shadow',
        world: 'shadow',
        position: { x: 7, y: 1 },
        direction: 'left',
        polarity: 'ATTRACT',
        initialActive: false,
        linkedSwitchId: 'sw-16-real',
      },
    ],
    laserEmitters: [
      { id: 'le-16-real', world: 'real', position: { x: 2, y: 0 }, direction: 'down', initialActive: true },
    ],
    laserMirrors: [
      { id: 'mirror-16-real', world: 'real', position: { x: 2, y: 1 }, orientation: '/', rotatable: true, linkedSwitchId: 'sw-16-shadow' },
    ],
    laserReceivers: [
      { id: 'rx-16-real', world: 'real', position: { x: 3, y: 1 }, linkedDoorId: 'door-16-shadow' },
    ],
    timeLocks: [
      { id: 'tl-16-real', world: 'real', position: { x: 1, y: 3 }, duration: 6, targetHazardIds: ['saw-16-shadow'] },
      { id: 'tl-16-shadow', world: 'shadow', position: { x: 6, y: 1 }, duration: 6, targetHazardIds: ['saw-16-real'] },
    ],
    movingHazards: [
      {
        id: 'saw-16-real',
        world: 'real',
        path: [
          { x: 5, y: 1 },
          { x: 5, y: 2 },
          { x: 5, y: 3 },
          { x: 5, y: 2 },
        ],
        initialIndex: 0,
      },
      {
        id: 'saw-16-shadow',
        world: 'shadow',
        path: [
          { x: 2, y: 3 },
          { x: 2, y: 2 },
          { x: 2, y: 1 },
          { x: 2, y: 2 },
        ],
        initialIndex: 0,
      },
    ],
    solutionTrace: [
      'down',  // 1. Real steps on tl-16-real (1,3); Shadow held by wall (6,3). Freezes saw-16-shadow!
      'right', // 2. Real to (2,3) [hits sw-16-real -> activates magnet-16-shadow]; Shadow to (5,2). Magnet pulls block-16-shadow onto plate-16-shadow (6,1) -> unlocks door-16-real!
      'down',  // 3. Real holds at wall; Shadow steps on sw-16-shadow (5,3) -> rotates mirror-16-real to '\' -> laser hits rx-16-real -> unlocks door-16-shadow!
      'up',    // 4. Real to (2,2); Shadow to (5,2).
      'right', // 5. Real enters open door-16-real (3,2); Shadow enters open door-16-shadow (4,2).
      'right', // 6. Real crosses into (4,2); Shadow crosses into (3,2).
      'down',  // 7. Stagger alignment around patrol paths.
      'right', // 8. Real to (5,2); Shadow to (2,2).
      'right', // 9. Real to (6,2); Shadow to (1,2).
      'up',    // 10. Real reaches Real Exit at (6,2); Shadow reaches Shadow Exit at (1,2) -> VICTORY!
    ],
    surpriseEvents: [
      {
        id: 'se-16-illusion-rift',
        name: 'Mirrored Dimension Rift',
        triggerType: 'STEP_ON',
        triggerWorld: 'real',
        triggerPosition: { x: 1, y: 3 },
        targetWorld: 'shadow',
        targetType: 'WALL',
        targetPosition: { x: 7, y: 0 },
        activationDelay: 0,
        action: 'REMOVE_WALL',
        animation: 'flicker',
        sound: 'distortion',
        warningClue: 'Mirrored dimensions warp, revealing the unstitched void',
      },
      {
        id: 'se-16-mirror-trap',
        name: 'Shattered Origin Trap',
        triggerType: 'STEP_ON',
        triggerWorld: 'real',
        triggerPosition: { x: 3, y: 2 },
        targetWorld: 'real',
        targetType: 'COLLAPSE_FLOOR',
        targetPosition: { x: 1, y: 3 },
        activationDelay: 1,
        action: 'COLLAPSE_TILE',
        animation: 'crumble',
        sound: 'crumble',
        warningClue: 'The reflection shatters where you stood moments ago',
      },
    ],
  },

  // ==========================================
  // CHAPTER 5: THE TRUTH (Levels 17–20)
  // ==========================================
  {
    id: 17,
    chapter: 'THE TRUTH',
    name: 'Two Become One',
    width: 8,
    height: 6,
    difficulty: 'EXPERT',
    hint: 'Coordinate pressure plates, portals, and switches to converge as one.',
    realStart: { x: 1, y: 1 },
    shadowStart: { x: 6, y: 1 },
    realExit: { x: 6, y: 4 },
    shadowExit: { x: 1, y: 4 },
    realWalls: [
      { x: 3, y: 0 },
      { x: 3, y: 1 },
      { x: 3, y: 2 },
      { x: 3, y: 3 },
      { x: 3, y: 5 },
      { x: 5, y: 0 },
      { x: 5, y: 1 },
      { x: 5, y: 2 },
      { x: 5, y: 5 },
      { x: 0, y: 2 },
    ],
    shadowWalls: [
      { x: 4, y: 0 },
      { x: 4, y: 1 },
      { x: 4, y: 2 },
      { x: 4, y: 3 },
      { x: 4, y: 5 },
      { x: 2, y: 0 },
      { x: 2, y: 1 },
      { x: 2, y: 2 },
      { x: 2, y: 5 },
      { x: 7, y: 2 },
    ],
    movingHazards: [
      {
        id: 'saw-17-real',
        world: 'real',
        path: [
          { x: 2, y: 3 },
          { x: 2, y: 4 },
        ],
        initialIndex: 0,
      },
    ],
    timeLocks: [
      {
        id: 'tl-17-shadow',
        world: 'shadow',
        position: { x: 6, y: 3 },
        duration: 6,
        linkedDoorId: 'door-17-timed-real',
      },
    ],
    doors: [
      { id: 'door-17-timed-real', world: 'real', position: { x: 1, y: 2 }, initialOpen: false },
      { id: 'door-17-shadow-access', world: 'shadow', position: { x: 6, y: 2 }, initialOpen: false },
      { id: 'door-17-shadow-exit', world: 'shadow', position: { x: 2, y: 4 }, initialOpen: false },
      { id: 'door-17-real-exit', world: 'real', position: { x: 5, y: 4 }, initialOpen: false },
    ],
    pressurePlates: [
      { id: 'pp-17-real', world: 'real', position: { x: 2, y: 2 }, linkedDoorId: 'door-17-shadow-access' },
    ],
    switches: [
      { id: 'sw-17-real', world: 'real', position: { x: 0, y: 4 }, linkedDoorId: 'door-17-shadow-exit' },
      { id: 'sw-17-shadow', world: 'shadow', position: { x: 7, y: 4 }, linkedDoorId: 'door-17-real-exit' },
    ],
    portals: [
      {
        id: 'p-17-real',
        world: 'real',
        position: { x: 1, y: 4 },
        targetWorld: 'real',
        targetPosition: { x: 4, y: 4 },
      },
      {
        id: 'p-17-shadow',
        world: 'shadow',
        position: { x: 6, y: 4 },
        targetWorld: 'shadow',
        targetPosition: { x: 3, y: 4 },
      },
    ],
    checkpoints: [
      { id: 'cp-17', realPosition: { x: 1, y: 1 }, shadowPosition: { x: 6, y: 1 } },
    ],
    solutionTrace: [
      'right',
      'down',
      'left',
      'down',
      'left',
      'left',
      'down',
      'right',
      'right',
      'right',
    ],
    surpriseEvents: [
      {
        id: 'se-17-harmonic-shift',
        name: 'Harmonic Wall Shift',
        triggerType: 'STEP_ON',
        triggerWorld: 'real',
        triggerPosition: { x: 2, y: 2 },
        targetWorld: 'real',
        targetType: 'WALL',
        targetPosition: { x: 3, y: 0 },
        activationDelay: 0,
        action: 'REMOVE_WALL',
        animation: 'spark',
        sound: 'wall_open',
        warningClue: 'Resonant harmonic hum echoing from the central partition',
      },
      {
        id: 'se-17-portal-instability',
        name: 'Portal Surge Instability',
        triggerType: 'STEP_ON',
        triggerWorld: 'real',
        triggerPosition: { x: 0, y: 4 },
        targetWorld: 'shadow',
        targetType: 'COLLAPSE_FLOOR',
        targetPosition: { x: 6, y: 1 },
        activationDelay: 1,
        action: 'COLLAPSE_TILE',
        animation: 'crumble',
        sound: 'crumble',
        warningClue: 'High-energy portal surge obliterates the origin platform',
      },
    ],
  },
  {
    id: 18,
    chapter: 'THE TRUTH',
    name: 'The Paradox',
    width: 8,
    height: 6,
    difficulty: 'EXPERT',
    hint: 'Actions in one world alter routes in the other. Time the bomb after opening the rift.',
    realStart: { x: 1, y: 1 },
    shadowStart: { x: 6, y: 1 },
    realExit: { x: 6, y: 4 },
    shadowExit: { x: 1, y: 4 },
    realWalls: [
      { x: 3, y: 0 },
      { x: 3, y: 1 },
      { x: 3, y: 2 },
      { x: 3, y: 3 },
      { x: 3, y: 4 },
      { x: 3, y: 5 },
      { x: 0, y: 2 },
      { x: 2, y: 2 },
    ],
    shadowWalls: [
      { x: 4, y: 0 },
      { x: 4, y: 1 },
      { x: 4, y: 2 },
      { x: 4, y: 3 },
      { x: 4, y: 4 },
      { x: 4, y: 5 },
      { x: 7, y: 2 },
      { x: 5, y: 2 },
    ],
    timeLocks: [
      {
        id: 'tl-18-real',
        world: 'real',
        position: { x: 2, y: 1 },
        duration: 5,
        linkedDoorId: 'door-18-shadow-vault',
      },
    ],
    doors: [
      { id: 'door-18-shadow-vault', world: 'shadow', position: { x: 6, y: 2 }, initialOpen: false },
      { id: 'door-18-real-portal', world: 'real', position: { x: 1, y: 2 }, initialOpen: false },
    ],
    switches: [
      { id: 'sw-18-shadow', world: 'shadow', position: { x: 6, y: 3 }, linkedDoorId: 'door-18-real-portal' },
    ],
    portals: [
      {
        id: 'p-18-real',
        world: 'real',
        position: { x: 1, y: 4 },
        targetWorld: 'real',
        targetPosition: { x: 4, y: 4 },
      },
      {
        id: 'p-18-shadow',
        world: 'shadow',
        position: { x: 6, y: 4 },
        targetWorld: 'shadow',
        targetPosition: { x: 3, y: 4 },
      },
    ],
    bombs: [
      {
        id: 'bomb-18-shadow',
        world: 'shadow',
        position: { x: 3, y: 3 },
        timer: 3,
        radius: 1,
        crossWorld: true,
        triggerType: 'STEP',
      },
    ],
    destructibleWalls: [
      { id: 'dw-18-real', world: 'real', position: { x: 5, y: 4 } },
    ],
    solutionTrace: [
      'right',
      'left',
      'down',
      'down',
      'down',
      'down',
      'down',
      'up',
      'right',
      'right',
      'down',
    ],
    surpriseEvents: [
      {
        id: 'se-18-quantum-tremor',
        name: 'Quantum Displacement Tremor',
        triggerType: 'STEP_ON',
        triggerWorld: 'real',
        triggerPosition: { x: 2, y: 1 },
        targetWorld: 'real',
        targetType: 'WALL',
        targetPosition: { x: 0, y: 2 },
        activationDelay: 0,
        action: 'REMOVE_WALL',
        animation: 'shockwave',
        sound: 'distortion',
        warningClue: 'Quantum displacement wave fracturing the dimensional anchor',
      },
      {
        id: 'se-18-singularity-echo',
        name: 'Singularity Echo Collapse',
        triggerType: 'BOMB_DETONATED',
        triggerSourceId: 'bomb-18-shadow',
        targetWorld: 'shadow',
        targetType: 'COLLAPSE_FLOOR',
        targetPosition: { x: 4, y: 0 },
        activationDelay: 0,
        action: 'COLLAPSE_TILE',
        animation: 'crumble',
        sound: 'explosion',
        warningClue: 'Bomb shockwave reverberating into the void ceiling',
      },
    ],
  },
  {
    id: 19,
    chapter: 'THE TRUTH',
    name: 'The Last Connection',
    width: 8,
    height: 6,
    difficulty: 'EXPERT',
    hint: 'Every mechanism is interconnected. Slide the magnetic core, breach the rift, and synchronize the final passage.',
    realStart: { x: 1, y: 1 },
    shadowStart: { x: 6, y: 1 },
    realExit: { x: 6, y: 4 },
    shadowExit: { x: 1, y: 4 },
    realWalls: [
      { x: 3, y: 0 },
      { x: 3, y: 1 },
      { x: 3, y: 2 },
      { x: 3, y: 3 },
      { x: 3, y: 5 },
    ],
    shadowWalls: [
      { x: 4, y: 0 },
      { x: 4, y: 1 },
      { x: 4, y: 2 },
      { x: 4, y: 3 },
      { x: 4, y: 5 },
    ],
    checkpoints: [
      { id: 'cp-19', realPosition: { x: 2, y: 1 }, shadowPosition: { x: 5, y: 1 } },
    ],
    collapsingFloors: [
      { id: 'cf-19-real', world: 'real', position: { x: 2, y: 1 }, stepsToCollapse: 1 },
    ],
    portals: [
      {
        id: 'p-19-shadow',
        world: 'shadow',
        position: { x: 6, y: 3 },
        targetWorld: 'shadow',
        targetPosition: { x: 7, y: 4 },
      },
    ],
    movingHazards: [
      {
        id: 'saw-19-shadow',
        world: 'shadow',
        path: [
          { x: 5, y: 3 },
          { x: 5, y: 2 },
        ],
        initialIndex: 0,
      },
    ],
    movableBlocks: [
      { id: 'block-19-real', world: 'real', position: { x: 2, y: 3 } },
    ],
    magneticFields: [
      {
        id: 'mag-19-real',
        world: 'real',
        position: { x: 0, y: 3 },
        direction: 'right',
        polarity: 'ATTRACT',
        initialActive: false,
        linkedSwitchId: 'sw-19-shadow',
      },
    ],
    pressurePlates: [
      { id: 'pp-19-real', world: 'real', position: { x: 1, y: 3 }, linkedDoorId: 'door-19-shadow' },
    ],
    switches: [
      { id: 'sw-19-shadow', world: 'shadow', position: { x: 6, y: 2 }, linkedDoorId: 'mag-19-real' },
      { id: 'sw-19-real', world: 'real', position: { x: 1, y: 2 }, linkedDoorId: 'door-19-real' },
    ],
    doors: [
      { id: 'door-19-real', world: 'real', position: { x: 3, y: 4 }, initialOpen: false },
      { id: 'door-19-shadow', world: 'shadow', position: { x: 4, y: 4 }, initialOpen: false },
    ],
    solutionTrace: [
      'down',
      'left',
      'down',
      'down',
      'right',
      'right',
      'right',
      'right',
      'right',
      'right',
    ],
    surpriseEvents: [
      {
        id: 'se-19-dimensional-breach',
        name: 'Dimensional Breach Wall',
        triggerType: 'STEP_ON',
        triggerWorld: 'real',
        triggerPosition: { x: 1, y: 2 },
        targetWorld: 'real',
        targetType: 'WALL',
        targetPosition: { x: 3, y: 0 },
        activationDelay: 0,
        action: 'REMOVE_WALL',
        animation: 'spark',
        sound: 'wall_open',
        warningClue: 'Sympathetic resonance dissolving the central boundary wall',
      },
      {
        id: 'se-19-void-cascade',
        name: 'Void Cascade Collapse',
        triggerType: 'STEP_ON',
        triggerWorld: 'real',
        triggerPosition: { x: 3, y: 4 },
        targetWorld: 'real',
        targetType: 'COLLAPSE_FLOOR',
        targetPosition: { x: 1, y: 1 },
        activationDelay: 1,
        action: 'COLLAPSE_TILE',
        animation: 'crumble',
        sound: 'crumble',
        warningClue: 'The reality behind you collapses into infinite blackness',
      },
    ],
  },
  {
    id: 20,
    chapter: 'THE TRUTH',
    name: 'The Other Side',
    width: 9,
    height: 7,
    difficulty: 'EXPERT',
    hint: 'Two worlds. One mind. Complete the journey together.',
    realStart: { x: 1, y: 3 },
    shadowStart: { x: 7, y: 3 },
    realExit: { x: 7, y: 3 },
    shadowExit: { x: 1, y: 3 },
    realWalls: [
      { x: 4, y: 0 },
      { x: 4, y: 1 },
      { x: 4, y: 2 },
      { x: 4, y: 4 },
      { x: 4, y: 5 },
      { x: 4, y: 6 },
      { x: 6, y: 0 },
      { x: 6, y: 1 },
      { x: 6, y: 5 },
      { x: 6, y: 6 },
    ],
    shadowWalls: [
      { x: 4, y: 0 },
      { x: 4, y: 1 },
      { x: 4, y: 2 },
      { x: 4, y: 4 },
      { x: 4, y: 5 },
      { x: 4, y: 6 },
      { x: 2, y: 0 },
      { x: 2, y: 1 },
      { x: 2, y: 5 },
      { x: 2, y: 6 },
    ],
    checkpoints: [
      { id: 'cp-20', realPosition: { x: 2, y: 3 }, shadowPosition: { x: 6, y: 3 } },
    ],
    movingHazards: [
      {
        id: 'saw-20-real',
        world: 'real',
        path: [
          { x: 3, y: 1 },
          { x: 3, y: 2 },
        ],
        initialIndex: 0,
      },
    ],
    timeLocks: [
      {
        id: 'tl-20-shadow',
        world: 'shadow',
        position: { x: 5, y: 1 },
        duration: 3,
        targetHazardIds: ['saw-20-real'],
      },
    ],
    movableBlocks: [
      { id: 'block-20-shadow', world: 'shadow', position: { x: 7, y: 5 } },
    ],
    magneticFields: [
      {
        id: 'mag-20-shadow',
        world: 'shadow',
        position: { x: 5, y: 5 },
        direction: 'right',
        polarity: 'ATTRACT',
        initialActive: false,
        linkedSwitchId: 'sw-20-real',
      },
    ],
    pressurePlates: [
      { id: 'pp-20-shadow', world: 'shadow', position: { x: 6, y: 5 }, linkedDoorId: 'door-20-real' },
    ],
    doors: [
      { id: 'door-20-real', world: 'real', position: { x: 4, y: 3 }, initialOpen: false },
      { id: 'door-20-shadow', world: 'shadow', position: { x: 4, y: 3 }, initialOpen: false },
    ],
    switches: [
      { id: 'sw-20-real', world: 'real', position: { x: 1, y: 5 }, linkedDoorId: 'mag-20-shadow' },
      { id: 'sw-20-shadow', world: 'shadow', position: { x: 7, y: 1 }, linkedDoorId: 'door-20-shadow' },
    ],
    solutionTrace: [
      'down',
      'down',
      'up',
      'up',
      'up',
      'right',
      'right',
      'down',
      'right',
      'down',
      'right',
      'right',
      'right',
      'right',
    ],
    surpriseEvents: [
      {
        id: 'se-20-final-nexus',
        name: 'Dual Reality Convergence',
        triggerType: 'STEP_ON',
        triggerWorld: 'real',
        triggerPosition: { x: 1, y: 5 },
        targetWorld: 'shadow',
        targetType: 'WALL',
        targetPosition: { x: 4, y: 0 },
        activationDelay: 0,
        action: 'REMOVE_WALL',
        animation: 'shockwave',
        sound: 'hazard_trigger',
        warningClue: 'The illusion of duality shatters — two worlds begin fusing into one',
      },
      {
        id: 'se-20-convergence-echo',
        name: 'Singularity Convergence Trap',
        triggerType: 'STEP_ON',
        triggerWorld: 'real',
        triggerPosition: { x: 4, y: 3 },
        targetWorld: 'both',
        targetType: 'COLLAPSE_FLOOR',
        targetPosition: { x: 1, y: 5 },
        secondaryTargetPosition: { x: 7, y: 5 },
        activationDelay: 1,
        action: 'COLLAPSE_TILE',
        animation: 'crumble',
        sound: 'crumble',
        warningClue: 'The past cannot be reached — forward is the only path',
      },
    ],
  },
];
