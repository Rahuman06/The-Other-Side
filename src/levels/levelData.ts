import { LevelData } from '../types/game.js';

export const LEVELS: readonly LevelData[] = [
  // Level 1: Parallel Awakening
  // Teaching: Opposite horizontal movement and reaching exits.
  {
    id: 1,
    name: 'Parallel Awakening',
    width: 7,
    height: 5,
    realStart: { x: 1, y: 2 },
    shadowStart: { x: 5, y: 2 },
    realExit: { x: 5, y: 2 },
    shadowExit: { x: 1, y: 2 },
    realWalls: [
      { x: 3, y: 0 },
      { x: 3, y: 1 },
      { x: 3, y: 3 },
      { x: 3, y: 4 },
    ],
    shadowWalls: [
      { x: 3, y: 0 },
      { x: 3, y: 1 },
      { x: 3, y: 3 },
      { x: 3, y: 4 },
    ],
  },

  // Level 2: Desynchronization
  // Teaching: Bumping into walls to shift relative positioning.
  {
    id: 2,
    name: 'Desynchronization',
    width: 7,
    height: 5,
    realStart: { x: 1, y: 2 },
    shadowStart: { x: 5, y: 2 },
    realExit: { x: 5, y: 1 },
    shadowExit: { x: 1, y: 3 },
    realWalls: [
      { x: 2, y: 2 }, // Real can bump into this to let Shadow advance
      { x: 4, y: 0 },
      { x: 4, y: 4 },
    ],
    shadowWalls: [
      { x: 4, y: 1 },
      { x: 2, y: 4 },
    ],
  },

  // Level 3: The Key & The Gate
  // Teaching: Switches and Doors. One world opens passage for the other.
  {
    id: 3,
    name: 'The Key & The Gate',
    width: 7,
    height: 5,
    realStart: { x: 1, y: 1 },
    shadowStart: { x: 5, y: 3 },
    realExit: { x: 5, y: 1 },
    shadowExit: { x: 1, y: 3 },
    realWalls: [
      { x: 3, y: 0 },
      { x: 3, y: 2 },
      { x: 3, y: 3 },
      { x: 3, y: 4 },
    ],
    shadowWalls: [
      { x: 3, y: 1 },
      { x: 3, y: 2 },
      { x: 3, y: 4 },
    ],
    doors: [
      // Door blocks Real at (3,1)
      { id: 'door-3-1', position: { x: 3, y: 1 }, world: 'real', initialOpen: false },
    ],
    switches: [
      // Switch in Shadow world at (2,3) opens door-3-1
      { id: 'sw-3-1', position: { x: 2, y: 3 }, targetDoorId: 'door-3-1', world: 'shadow' },
    ],
  },

  // Level 4: Weight of Two
  // Teaching: Pressure plates require continuous presence to hold a door open.
  {
    id: 4,
    name: 'Weight of Two',
    width: 7,
    height: 5,
    realStart: { x: 1, y: 3 },
    shadowStart: { x: 5, y: 3 },
    realExit: { x: 5, y: 1 },
    shadowExit: { x: 1, y: 1 },
    realWalls: [
      { x: 3, y: 0 },
      { x: 3, y: 2 },
      { x: 3, y: 4 },
    ],
    shadowWalls: [
      { x: 3, y: 0 },
      { x: 3, y: 2 },
      { x: 3, y: 4 },
    ],
    doors: [
      { id: 'door-4-real', position: { x: 3, y: 1 }, world: 'real', initialOpen: false },
      { id: 'door-4-shadow', position: { x: 3, y: 3 }, world: 'shadow', initialOpen: false },
    ],
    pressurePlates: [
      // Real stands on plate at (1,1) to open Shadow door at (3,3)
      { id: 'plate-4-1', position: { x: 1, y: 1 }, targetDoorId: 'door-4-shadow', world: 'real' },
      // Shadow stands on plate at (2,3) to open Real door at (3,1)
      { id: 'plate-4-2', position: { x: 2, y: 3 }, targetDoorId: 'door-4-real', world: 'shadow' },
    ],
  },

  // Level 5: Thresholds of Void
  // Teaching: Hazards and paired checkpoints.
  {
    id: 5,
    name: 'Thresholds of Void',
    width: 8,
    height: 5,
    realStart: { x: 0, y: 2 },
    shadowStart: { x: 7, y: 2 },
    realExit: { x: 7, y: 2 },
    shadowExit: { x: 0, y: 2 },
    realWalls: [
      { x: 2, y: 0 },
      { x: 2, y: 4 },
      { x: 5, y: 0 },
      { x: 5, y: 4 },
    ],
    shadowWalls: [
      { x: 2, y: 0 },
      { x: 2, y: 4 },
      { x: 5, y: 0 },
      { x: 5, y: 4 },
    ],
    hazards: [
      { id: 'hz-5-1', position: { x: 2, y: 1 }, world: 'real' },
      { id: 'hz-5-2', position: { x: 2, y: 3 }, world: 'real' },
      { id: 'hz-5-3', position: { x: 5, y: 1 }, world: 'shadow' },
      { id: 'hz-5-4', position: { x: 5, y: 3 }, world: 'shadow' },
    ],
    checkpoints: [
      { id: 'cp-5', realPosition: { x: 3, y: 2 }, shadowPosition: { x: 4, y: 2 } },
    ],
  },

  // Level 6: Cross-Dimensional Relay
  // Teaching: Two-phase puzzle coordinating switches across obstacles.
  {
    id: 6,
    name: 'Cross-Dimensional Relay',
    width: 8,
    height: 6,
    realStart: { x: 1, y: 1 },
    shadowStart: { x: 6, y: 1 },
    realExit: { x: 6, y: 4 },
    shadowExit: { x: 1, y: 4 },
    realWalls: [
      { x: 3, y: 0 },
      { x: 3, y: 1 },
      { x: 3, y: 3 },
      { x: 3, y: 5 },
      { x: 5, y: 2 },
      { x: 5, y: 3 },
    ],
    shadowWalls: [
      { x: 4, y: 0 },
      { x: 4, y: 2 },
      { x: 4, y: 4 },
      { x: 4, y: 5 },
      { x: 2, y: 2 },
      { x: 2, y: 3 },
    ],
    doors: [
      { id: 'door-6-1', position: { x: 3, y: 2 }, world: 'real', initialOpen: false },
      { id: 'door-6-2', position: { x: 4, y: 3 }, world: 'shadow', initialOpen: false },
    ],
    switches: [
      { id: 'sw-6-1', position: { x: 6, y: 3 }, targetDoorId: 'door-6-1', world: 'shadow' },
      { id: 'sw-6-2', position: { x: 4, y: 1 }, targetDoorId: 'door-6-2', world: 'real' },
    ],
    checkpoints: [
      { id: 'cp-6', realPosition: { x: 4, y: 2 }, shadowPosition: { x: 3, y: 3 } },
    ],
  },

  // Level 7: The Mirror Labyrinth
  // Teaching: Complex routing through asymmetric mazes with hazards.
  {
    id: 7,
    name: 'The Mirror Labyrinth',
    width: 8,
    height: 6,
    realStart: { x: 0, y: 0 },
    shadowStart: { x: 7, y: 0 },
    realExit: { x: 7, y: 5 },
    shadowExit: { x: 0, y: 5 },
    realWalls: [
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 3, y: 1 },
      { x: 3, y: 2 },
      { x: 3, y: 3 },
      { x: 5, y: 3 },
      { x: 5, y: 4 },
    ],
    shadowWalls: [
      { x: 6, y: 0 },
      { x: 6, y: 1 },
      { x: 4, y: 1 },
      { x: 4, y: 2 },
      { x: 4, y: 3 },
      { x: 2, y: 3 },
      { x: 2, y: 4 },
    ],
    hazards: [
      { id: 'hz-7-1', position: { x: 2, y: 4 }, world: 'real' },
      { id: 'hz-7-2', position: { x: 5, y: 1 }, world: 'shadow' },
    ],
    doors: [
      { id: 'door-7', position: { x: 5, y: 5 }, world: 'real', initialOpen: false },
    ],
    switches: [
      { id: 'sw-7', position: { x: 1, y: 2 }, targetDoorId: 'door-7', world: 'shadow' },
    ],
    checkpoints: [
      { id: 'cp-7', realPosition: { x: 2, y: 2 }, shadowPosition: { x: 5, y: 2 } },
    ],
  },

  // Level 8: Singularity (Grand Finale)
  // Master synthesis of dual navigation, switches, pressure plates, hazards and checkpoints.
  {
    id: 8,
    name: 'Singularity',
    width: 9,
    height: 7,
    realStart: { x: 1, y: 3 },
    shadowStart: { x: 7, y: 3 },
    realExit: { x: 7, y: 3 },
    shadowExit: { x: 1, y: 3 },
    realWalls: [
      { x: 3, y: 1 },
      { x: 3, y: 2 },
      { x: 3, y: 4 },
      { x: 3, y: 5 },
      { x: 5, y: 0 },
      { x: 5, y: 2 },
      { x: 5, y: 4 },
      { x: 5, y: 6 },
    ],
    shadowWalls: [
      { x: 5, y: 1 },
      { x: 5, y: 2 },
      { x: 5, y: 4 },
      { x: 5, y: 5 },
      { x: 3, y: 0 },
      { x: 3, y: 2 },
      { x: 3, y: 4 },
      { x: 3, y: 6 },
    ],
    doors: [
      { id: 'door-8-r1', position: { x: 3, y: 3 }, world: 'real', initialOpen: false },
      { id: 'door-8-s1', position: { x: 5, y: 3 }, world: 'shadow', initialOpen: false },
      { id: 'door-8-final', position: { x: 5, y: 3 }, world: 'real', initialOpen: false },
    ],
    switches: [
      { id: 'sw-8-1', position: { x: 6, y: 1 }, targetDoorId: 'door-8-r1', world: 'shadow' },
      { id: 'sw-8-2', position: { x: 2, y: 5 }, targetDoorId: 'door-8-final', world: 'real' },
    ],
    pressurePlates: [
      { id: 'plate-8-1', position: { x: 4, y: 1 }, targetDoorId: 'door-8-s1', world: 'real' },
    ],
    hazards: [
      { id: 'hz-8-1', position: { x: 4, y: 0 }, world: 'real' },
      { id: 'hz-8-2', position: { x: 4, y: 6 }, world: 'shadow' },
    ],
    checkpoints: [
      { id: 'cp-8', realPosition: { x: 4, y: 3 }, shadowPosition: { x: 4, y: 3 } },
    ],
  },
];
