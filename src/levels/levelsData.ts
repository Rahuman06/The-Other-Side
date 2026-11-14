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
      { id: 'sw-16-real', world: 'real', position: { x: 2, y: 3 }, linkedDoorId: 'door-16-shadow' },
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
      },
    ],
    laserEmitters: [
      { id: 'le-16-real', world: 'real', position: { x: 2, y: 0 }, direction: 'down', initialActive: true },
    ],
    laserMirrors: [
      { id: 'mirror-16-real', world: 'real', position: { x: 2, y: 1 }, orientation: '/', rotatable: true, linkedSwitchId: 'sw-16-shadow' },
    ],
    laserReceivers: [
      { id: 'rx-16-real', world: 'real', position: { x: 3, y: 1 }, linkedDoorId: 'magnet-16-shadow' },
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
      'right', // 2. Real to (2,3) [hits sw-16-real -> unlocks door-16-shadow]; Shadow to (5,2).
      'down',  // 3. Real holds at wall; Shadow steps on sw-16-shadow (5,3) -> rotates mirror-16-real to '\' -> laser hits rx-16-real -> activates magnet-16-shadow in opposite world! Magnet pulls block-16-shadow onto plate-16-shadow (6,1) -> unlocks door-16-real!
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
        id: 'se-16-optical-deception',
        name: 'The Wrong Reflection',
        triggerType: 'SWITCH_TOGGLE',
        triggerSourceId: 'sw-16-shadow',
        targetWorld: 'shadow',
        targetType: 'WALL',
        targetPosition: { x: 7, y: 0 },
        activationDelay: 0,
        action: 'REMOVE_WALL',
        animation: 'spark',
        sound: 'distortion',
        warningClue: 'A subtle magnetic pulse ripples across the rift; the optical receiver hums with magnetic force.',
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
        warningClue: 'The reflection shatters where you stood moments ago.',
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
    difficulty: 'MASTER',
    hint: 'Both operate as one logical system: synchronize pressure plates, evade moving hazards, and discover the cross-world portal realignment.',
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
      { id: 'pp-17-shadow', world: 'shadow', position: { x: 5, y: 2 }, linkedDoorId: 'door-17-real-exit' },
    ],
    switches: [
      { id: 'sw-17-real', world: 'real', position: { x: 0, y: 4 }, linkedDoorId: 'door-17-shadow-exit' },
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
      'right', // 1. Real to (2,1), Shadow to (5,1)
      'down',  // 2. Real to pp-17-real (2,2) [shifts p-17-shadow dest to (3,4)!]; Shadow to pp-17-shadow (5,2) [unlocks door-17-real-exit!]
      'left',  // 3. Real to (1,2), Shadow enters open door-17-shadow-access (6,2)
      'down',  // 4. Real to (1,3), Shadow steps on tl-17-shadow (6,3) [freezes door-17-timed-real open]
      'right', // 5. Real to (2,3), Shadow to (5,3)
      'left',  // 6. Real hits sw-17-real at (0,4) [unlocks door-17-shadow-exit (2,4)]; Shadow held by wall (7,3)
      'down',  // 7. Real enters p-17-real at (1,4) [teleports to (4,4)!]; Shadow enters p-17-shadow at (6,4) [teleports to shifted dest (3,4)!]
      'up',    // 8. Stagger calibration step avoiding saw line
      'right', // 9. Real to (5,4); Shadow to (2,4)
      'right', // 10. Real to (6,4); Shadow to (1,4)
      'down',  // 11. Real reaches Real Exit (6,4); Shadow reaches Shadow Exit (1,4) -> VICTORY!
    ],
    surpriseEvents: [
      {
        id: 'se-17-portal-shift',
        name: 'Harmonic Portal Realignment',
        triggerType: 'STEP_ON',
        triggerWorld: 'real',
        triggerPosition: { x: 2, y: 2 },
        targetWorld: 'shadow',
        targetType: 'PORTAL',
        targetId: 'p-17-shadow',
        secondaryTargetPosition: { x: 3, y: 4 },
        activationDelay: 0,
        action: 'SHIFT_PORTAL',
        animation: 'shockwave',
        sound: 'wall_open',
        warningClue: 'A dimensional resonance shimmers across the rift; the shadow portal anchor realigns.',
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
    difficulty: 'MASTER',
    hint: 'Actions in one world alter routes in the other. Time the bomb, dodge the saw blade, and synchronize across the rift.',
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
      { x: 0, y: 3 },
      { x: 2, y: 3 },
      { x: 5, y: 5 },
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
      { x: 5, y: 3 },
      { x: 2, y: 5 },
    ],
    timeLocks: [
      {
        id: 'tl-18-real',
        world: 'real',
        position: { x: 2, y: 1 },
        duration: 3,
        linkedDoorId: 'door-18-shadow-vault',
      },
    ],
    doors: [
      { id: 'door-18-shadow-vault', world: 'shadow', position: { x: 6, y: 2 }, initialOpen: false },
      { id: 'door-18-real-mid', world: 'real', position: { x: 1, y: 2 }, initialOpen: false },
      { id: 'door-18-shadow-bomb', world: 'shadow', position: { x: 3, y: 4 }, initialOpen: false },
      { id: 'door-18-shadow-exit', world: 'shadow', position: { x: 2, y: 4 }, initialOpen: false },
    ],
    switches: [
      { id: 'sw-18-shadow-1', world: 'shadow', position: { x: 6, y: 3 }, linkedDoorId: 'door-18-real-mid' },
      { id: 'sw-18-real-2', world: 'real', position: { x: 1, y: 3 }, linkedDoorId: 'door-18-shadow-bomb' },
      { id: 'sw-18-real-exit', world: 'real', position: { x: 6, y: 2 }, linkedDoorId: 'door-18-shadow-exit' },
    ],
    portals: [
      {
        id: 'p-18-real',
        world: 'real',
        position: { x: 1, y: 4 },
        targetWorld: 'real',
        targetPosition: { x: 1, y: 1 },
      },
      {
        id: 'p-18-shadow',
        world: 'shadow',
        position: { x: 6, y: 4 },
        targetWorld: 'shadow',
        targetPosition: { x: 3, y: 5 },
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
    movingHazards: [
      {
        id: 'saw-18-real',
        world: 'real',
        path: [
          { x: 5, y: 3 },
          { x: 6, y: 3 },
        ],
        initialIndex: 0,
      },
    ],
    checkpoints: [
      { id: 'cp-18', realPosition: { x: 1, y: 3 }, shadowPosition: { x: 3, y: 5 } },
    ],
    solutionTrace: [
      'right', // 1. Real to (2,1) [starts tl-18-real, 3-turn window!]; Shadow to (5,1)
      'left',  // 2. Real to (1,1); Shadow to (6,1)
      'down',  // 3. Real held at (1,1); Shadow penetrates vault door (6,2)
      'down',  // 4. Shadow activates sw-18-shadow-1 (6,3) [unseals door-18-real-mid (1,2)!]
      'down',  // 5. Real to (1,2); Shadow enters portal p-18-shadow (6,4) -> teleports to (3,5)!
      'down',  // 6. Real activates sw-18-real-2 (1,3) [unseals bomb chamber door-18-shadow-bomb (3,4)!]
      'up',    // 7. Shadow steps through door into bomb chamber (3,4); Real to (1,2)
      'up',    // 8. Shadow steps on bomb-18-shadow (3,3) [ARMS BOMB, timer: 3!]; Real retreats to (1,1)
      'down',  // 9. Shadow retreats from blast to (3,4); Real to (1,2)
      'down',  // 10. Shadow shelters at (3,5); Real to (1,3) [activates cp-18 checkpoint!]
      'up',    // 11. BOMB DETONATES! Pulverizes dw-18-real (5,4), collapses (1,1), shifts p-18-real to (4,4)!
      'down',  // 12. Real approaches portal at (1,3); Shadow holds shelter (3,5)
      'down',  // 13. Real enters portal p-18-real (1,4) -> TELEPORTS TO EXIT VESTIBULE (4,4)!
      'up',    // 14. Real to (4,3); Shadow to (3,4)
      'up',    // 15. Real to (4,2); Shadow to (3,3)
      'right', // 16. Real to (5,2); Shadow to (2,3)
      'right', // 17. Real steps on sw-18-real-exit (6,2) [UNLOCKS SHADOW EXIT DOOR (2,4)!]; Shadow to (1,3)
      'right', // 18. Real traverses northern perimeter (7,2) avoiding saw line; Shadow to (0,3)
      'down',  // 19. Real descends column 7 to (7,3); Shadow to (0,4)
      'down',  // 20. Real descends to (7,4); Shadow to (0,5)
      'left',  // 21. Real moves to (6,4); Shadow moves to (1,5)
      'up',    // 22. Real at Real Exit (6,4); Shadow reaches Shadow Exit (1,4) -> SIMULTANEOUS VICTORY!
    ],
    surpriseEvents: [
      {
        id: 'se-18-bomb-portal-shift',
        name: 'Explosive Rift Realignment',
        triggerType: 'BOMB_DETONATED',
        triggerSourceId: 'bomb-18-shadow',
        targetWorld: 'real',
        targetType: 'PORTAL',
        targetId: 'p-18-real',
        secondaryTargetPosition: { x: 4, y: 4 },
        activationDelay: 0,
        action: 'SHIFT_PORTAL',
        animation: 'shockwave',
        sound: 'explosion',
        warningClue: 'The cross-world blast ripples through the rift, shifting the real portal anchor to the exit chamber!',
      },
      {
        id: 'se-18-bomb-collapse-old',
        name: 'Singularity Route Collapse',
        triggerType: 'BOMB_DETONATED',
        triggerSourceId: 'bomb-18-shadow',
        targetWorld: 'real',
        targetType: 'COLLAPSE_FLOOR',
        targetPosition: { x: 1, y: 1 },
        activationDelay: 0,
        action: 'COLLAPSE_TILE',
        animation: 'crumble',
        sound: 'crumble',
        warningClue: 'The shockwave shatters the northern origin chamber into a bottomless abyss!',
      },
    ],
  },
  {
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
    realWalls: [
      ...Array.from({ length: 12 }, (_, x) => ({ x, y: 0 })),
      ...Array.from({ length: 12 }, (_, x) => ({ x, y: 11 })),
      ...Array.from({ length: 12 }, (_, y) => ({ x: 0, y })),
      ...Array.from({ length: 12 }, (_, y) => ({ x: 11, y })),

      // Zone 1: The Fractured Vestibule (Rows 1–3)
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
      { x: 1, y: 8 },
      { x: 4, y: 9 },

      // Zone 3 -> Zone 4 Barrier (Row 9, x=1..10 except gate at (5,9))
      { x: 1, y: 9 }, { x: 2, y: 9 }, { x: 4, y: 9 }, { x: 7, y: 9 }, { x: 8, y: 9 }, { x: 9, y: 9 }, { x: 10, y: 9 },

      // Zone 4: Final Sanctuary & Blast Doors (Rows 10–11)
      { x: 4, y: 10 }, { x: 7, y: 10 },
    ],
    shadowWalls: [
      ...Array.from({ length: 12 }, (_, x) => ({ x, y: 0 })),
      ...Array.from({ length: 12 }, (_, x) => ({ x, y: 11 })),
      ...Array.from({ length: 12 }, (_, y) => ({ x: 0, y })),
      ...Array.from({ length: 12 }, (_, y) => ({ x: 11, y })),

      // Zone 1: The Fractured Vestibule (Rows 1–3)
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
      { x: 10, y: 8 },
      { x: 7, y: 9 },

      // Zone 3 -> Zone 4 Barrier (Row 9, x=1..10 except gate at (6,9))
      { x: 1, y: 9 }, { x: 2, y: 9 }, { x: 3, y: 9 }, { x: 4, y: 9 }, { x: 7, y: 9 }, { x: 9, y: 9 }, { x: 10, y: 9 },

      // Zone 4: Final Sanctuary & Blast Doors (Rows 10–11)
      { x: 4, y: 10 }, { x: 7, y: 10 },
    ],
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
    solutionTrace: [
      "down","down","right","right","up","up","right","right","down","down","right","right","up","up","right","right","down","down","down","down","down","up","left","left","left","left","down","left","down","down","right","right","right","right","left","left","left","left","up","up","left","left","left","right","right","right","right","right","right","left","left","left","left","left","down","right","down","down","left","right","up","up","right","right","right","down","down","right","right","right","right"
    ],
  },
  {
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
    realWalls: [
      // Outer boundary (15x15)
      ...Array.from({ length: 15 }, (_, x) => ({ x, y: 0 })),
      ...Array.from({ length: 15 }, (_, x) => ({ x, y: 14 })),
      ...Array.from({ length: 15 }, (_, y) => ({ x: 0, y })),
      ...Array.from({ length: 15 }, (_, y) => ({ x: 14, y })),

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
    ],
    shadowWalls: [
      // Outer boundary (15x15)
      ...Array.from({ length: 15 }, (_, x) => ({ x, y: 0 })),
      ...Array.from({ length: 15 }, (_, x) => ({ x, y: 14 })),
      ...Array.from({ length: 15 }, (_, y) => ({ x: 0, y })),
      ...Array.from({ length: 15 }, (_, y) => ({ x: 14, y })),

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
    ],
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
    solutionTrace: [
      'right', 'down', 'down', 'right', 'right', 'up', 'up', 'right',
      'right', 'right', 'right', 'down', 'up', 'right', 'right', 'right',
      'right', 'down', 'down', 'left', 'down', 'down', 'down', 'down',
      'left', 'left', 'left', 'down', 'down', 'left', 'left', 'left',
      'left', 'down', 'down', 'up', 'up', 'right', 'right', 'right',
      'right', 'right', 'right', 'down', 'down', 'right', 'up', 'right',
      'right', 'up', 'up', 'up', 'right', 'up', 'up', 'down',
      'down', 'right', 'right', 'up', 'up', 'right', 'left', 'down',
      'down', 'left', 'left', 'left', 'down', 'down', 'down', 'right',
      'right', 'up', 'down', 'left', 'left', 'left', 'right', 'up',
      'right', 'right', 'right', 'down', 'left', 'left', 'down', 'left',
      'left', 'right', 'right', 'down', 'down', 'left', 'left', 'left',
      'right', 'right', 'right', 'right', 'right', 'right', 'right', 'right',
      'right', 'right'
    ],
  },
];
