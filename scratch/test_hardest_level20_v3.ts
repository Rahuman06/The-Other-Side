import { LevelDefinition } from '../src/types/level';
import { LevelFactory } from '../src/levels/LevelFactory';
import { LevelSolver, Direction } from '../src/solver/LevelSolver';

// Level 20 Masterpiece: Sequestered Exits, Moving Saws, Collapsing Floor, Multi-Phase
export const LEVEL_20_V8: LevelDefinition = {
  id: 20,
  chapter: 'THE TRUTH',
  name: 'The Final Paradox',
  width: 8,
  height: 6,
  difficulty: 'MASTER',
  hint: 'Two worlds. One mind. Sometimes the way forward is on the other side of what you believe.',
  realStart: { x: 1, y: 3 },
  shadowStart: { x: 6, y: 2 },
  // Sequestered corner exits! Far from spawn!
  realExit: { x: 7, y: 5 },
  shadowExit: { x: 0, y: 0 },
  fixedTilesReal: [{ x: 7, y: 4 }],
  fixedTilesShadow: [{ x: 0, y: 1 }],
  realWalls: [
    // Central column 3 wall
    { x: 3, y: 0 },
    { x: 3, y: 1 },
    { x: 3, y: 2 },
    // (3,3) is door-20-real-descent
    { x: 3, y: 4 },
    { x: 3, y: 5 },

    // Baffles
    { x: 4, y: 0 },
    { x: 4, y: 1 },
    { x: 4, y: 4 },
    { x: 4, y: 5 },

    // Chamber boundaries
    { x: 0, y: 0 },
    { x: 0, y: 5 },
    { x: 7, y: 0 },
    // Exit corner (7, 5) is enclosed by wall at (6, 5) and door at (7, 4)
    { x: 6, y: 5 },

    // Additional inner baffles making it a maze
    { x: 1, y: 2 }, // forces detour around (1,2) to reach Alpha at (0,1)!
    { x: 5, y: 4 },
  ],
  shadowWalls: [
    // Central column 4 wall (180° counterpart: 7-x, 5-y)
    { x: 4, y: 5 },
    { x: 4, y: 4 },
    { x: 4, y: 3 },
    // (4,2) is door-20-shadow-ascent
    { x: 4, y: 1 },
    { x: 4, y: 0 },

    // Baffles (180° counterpart)
    { x: 3, y: 5 },
    { x: 3, y: 4 },
    { x: 3, y: 1 },
    { x: 3, y: 0 },

    // Chamber boundaries
    { x: 7, y: 5 },
    { x: 7, y: 0 },
    { x: 0, y: 5 },
    // Exit corner (0, 0) is enclosed by wall at (1, 0) and door at (0, 1)
    { x: 1, y: 0 },

    // Additional inner baffles (180° counterpart)
    { x: 6, y: 3 }, // 7-1=6, 5-2=3
    { x: 2, y: 1 }, // 7-5=2, 5-4=1
  ],
  doors: [
    // Conduit doors: Real descent door at (3, 3), Shadow ascent door at (4, 2)
    { id: 'door-20-real-descent', world: 'real', position: { x: 3, y: 3 }, initialOpen: false },
    { id: 'door-20-shadow-ascent', world: 'shadow', position: { x: 4, y: 2 }, initialOpen: false },

    // Fixed Exit threshold doors guarding the sequestered corner exits
    { id: 'door-20-exit-real', world: 'real', position: { x: 7, y: 4 }, initialOpen: false, activationRule: 'ANY' },
    { id: 'door-20-exit-shadow', world: 'shadow', position: { x: 0, y: 1 }, initialOpen: false, activationRule: 'ANY' },

    // Indicators
    { id: 'door-20-ind-a', world: 'real', position: { x: 0, y: 2 }, initialOpen: false },
    { id: 'door-20-ind-b', world: 'shadow', position: { x: 7, y: 3 }, initialOpen: false },
  ],
  switches: [
    // Strategy A - Ascent
    // Real Alpha placed at (0, 1) - behind the (1, 2) baffle!
    { id: 'sw-20-alpha', world: 'real', position: { x: 0, y: 1 }, linkedDoorId: 'door-20-ind-a', activationBehavior: 'ACTIVATE_ONLY' },
    // Real conduit switch placed at (0, 0) - rotates to (7, 5) when Real inverts!
    { id: 'sw-20-ascent-conduit', world: 'real', position: { x: 0, y: 0 }, linkedDoorId: 'door-20-shadow-ascent', activationBehavior: 'ACTIVATE_ONLY' },
    // Shadow exit gate switch at (2, 2)
    { id: 'sw-20-exit-gate-a', world: 'shadow', position: { x: 2, y: 2 }, linkedDoorId: 'door-20-exit-real', activationBehavior: 'ACTIVATE_ONLY' },
    { id: 'sw-20-exit-gate-a2', world: 'shadow', position: { x: 2, y: 2 }, linkedDoorId: 'door-20-exit-shadow', activationBehavior: 'ACTIVATE_ONLY' },

    // Strategy B - Descent
    // Shadow Beta placed at (7, 4) - behind the (6, 3) baffle! (7-0=7, 5-1=4)
    { id: 'sw-20-beta', world: 'shadow', position: { x: 7, y: 4 }, linkedDoorId: 'door-20-ind-b', activationBehavior: 'ACTIVATE_ONLY' },
    // Shadow conduit switch placed at (7, 5) - rotates to (0, 0) when Shadow inverts!
    { id: 'sw-20-descent-conduit', world: 'shadow', position: { x: 7, y: 5 }, linkedDoorId: 'door-20-real-descent', activationBehavior: 'ACTIVATE_ONLY' },
    // Real exit gate switch at (5, 3)
    { id: 'sw-20-exit-gate-b', world: 'real', position: { x: 5, y: 3 }, linkedDoorId: 'door-20-exit-real', activationBehavior: 'ACTIVATE_ONLY' },
    { id: 'sw-20-exit-gate-b2', world: 'real', position: { x: 5, y: 3 }, linkedDoorId: 'door-20-exit-shadow', activationBehavior: 'ACTIVATE_ONLY' },
  ],
  surpriseEvents: [
    {
      id: 'se-20-inv-alpha',
      name: 'World Inversion - Mirrored Ascent',
      triggerType: 'SWITCH_TOGGLE',
      triggerSourceId: 'sw-20-alpha',
      targetWorld: 'real',
      targetType: 'WALL',
      action: 'INVERT_WORLD',
      animation: 'inversion',
      sound: 'inversion',
      repeatable: false,
      warningClue: 'Real World inverts — the ceiling terrace rotates to become the upper bridge',
    },
    {
      id: 'se-20-lock-beta',
      name: 'Descent Void Collapse',
      triggerType: 'SWITCH_TOGGLE',
      triggerSourceId: 'sw-20-alpha',
      targetWorld: 'shadow',
      targetType: 'COLLAPSE_FLOOR',
      targetPosition: { x: 7, y: 4 },
      action: 'COLLAPSE_TILE',
      animation: 'crumble',
      sound: 'crumble',
      repeatable: false,
    },
    {
      id: 'se-20-inv-beta',
      name: 'World Inversion - Shadow Descent',
      triggerType: 'SWITCH_TOGGLE',
      triggerSourceId: 'sw-20-beta',
      targetWorld: 'shadow',
      targetType: 'WALL',
      action: 'INVERT_WORLD',
      animation: 'inversion',
      sound: 'inversion',
      repeatable: false,
      warningClue: 'Shadow World inverts — the subterranean depths rotate to become accessible',
    },
    {
      id: 'se-20-lock-alpha',
      name: 'Ascent Void Collapse',
      triggerType: 'SWITCH_TOGGLE',
      triggerSourceId: 'sw-20-beta',
      targetWorld: 'real',
      targetType: 'COLLAPSE_FLOOR',
      targetPosition: { x: 0, y: 1 },
      action: 'COLLAPSE_TILE',
      animation: 'crumble',
      sound: 'crumble',
      repeatable: false,
    },
  ],
  solutionTrace: [],
};
