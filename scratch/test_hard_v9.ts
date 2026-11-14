import { LevelDefinition } from '../src/types/level';
import { LevelFactory } from '../src/levels/LevelFactory';
import { LevelSolver, Direction } from '../src/solver/LevelSolver';

export const LEVEL_20_V9: LevelDefinition = {
  id: 20,
  chapter: 'THE TRUTH',
  name: 'The Final Paradox',
  width: 8,
  height: 6,
  difficulty: 'MASTER',
  hint: 'Two worlds. One mind. Sometimes the way forward is on the other side of what you believe.',
  realStart: { x: 1, y: 3 },
  shadowStart: { x: 6, y: 2 },
  // Far corner sequestered exits!
  realExit: { x: 7, y: 5 },
  shadowExit: { x: 0, y: 0 },
  fixedTilesReal: [{ x: 6, y: 5 }],
  fixedTilesShadow: [{ x: 1, y: 0 }],
  realWalls: [
    // Central column 3 wall
    { x: 3, y: 0 },
    { x: 3, y: 1 },
    { x: 3, y: 2 },
    // (3,3) is door-20-real-descent
    { x: 3, y: 4 },
    { x: 3, y: 5 },

    // Column 4 baffles
    { x: 4, y: 0 },
    { x: 4, y: 1 },
    { x: 4, y: 4 },
    { x: 4, y: 5 },

    // Real exit vault enclosure at (7, 5): enclosed by walls at (6, 4), (7, 4)
    // with threshold door at (6, 5)
    { x: 7, y: 4 },
    { x: 6, y: 4 },

    // Baffles in Real
    { x: 0, y: 0 },
    { x: 0, y: 5 },
    { x: 7, y: 0 },
    { x: 2, y: 1 }, // blocks direct horizontal into Alpha
    { x: 0, y: 1 }, // blocks western approach to Alpha -> ONLY approached from (1,2) via UP!
  ],
  shadowWalls: [
    // Central column 4 wall (180° counterpart: 7-x, 5-y)
    { x: 4, y: 5 },
    { x: 4, y: 4 },
    { x: 4, y: 3 },
    // (4,2) is door-20-shadow-ascent
    { x: 4, y: 1 },
    { x: 4, y: 0 },

    // Column 3 baffles
    { x: 3, y: 5 },
    { x: 3, y: 4 },
    { x: 3, y: 1 },
    { x: 3, y: 0 },

    // Shadow exit vault enclosure at (0, 0): enclosed by walls at (0, 1), (1, 1)
    // with threshold door at (1, 0)
    // (180° of (7, 4) is (0, 1), 180° of (6, 4) is (1, 1))
    { x: 0, y: 1 },
    { x: 1, y: 1 },

    // Baffles in Shadow (180° counterpart)
    { x: 7, y: 5 },
    { x: 7, y: 0 },
    { x: 0, y: 5 },
    { x: 5, y: 4 }, // 7-2=5, 5-1=4 -> blocks direct horizontal into Beta
    { x: 7, y: 4 }, // blocks eastern approach to Beta -> ONLY approached from (6,3) via DOWN!
  ],
  doors: [
    // Conduit doors: Real descent door at (3, 3), Shadow ascent door at (4, 2)
    { id: 'door-20-real-descent', world: 'real', position: { x: 3, y: 3 }, initialOpen: false },
    { id: 'door-20-shadow-ascent', world: 'shadow', position: { x: 4, y: 2 }, initialOpen: false },

    // Fixed Exit threshold doors guarding corner exits
    { id: 'door-20-exit-real', world: 'real', position: { x: 6, y: 5 }, initialOpen: false, activationRule: 'ANY' },
    { id: 'door-20-exit-shadow', world: 'shadow', position: { x: 1, y: 0 }, initialOpen: false, activationRule: 'ANY' },

    // Indicators
    { id: 'door-20-ind-a', world: 'real', position: { x: 0, y: 2 }, initialOpen: false },
    { id: 'door-20-ind-b', world: 'shadow', position: { x: 7, y: 3 }, initialOpen: false },
  ],
  switches: [
    // Strategy A - Ascent
    // Real Alpha at (1, 1) - ONLY reachable from (1, 2) by moving UP!
    { id: 'sw-20-alpha', world: 'real', position: { x: 1, y: 1 }, linkedDoorId: 'door-20-ind-a', activationBehavior: 'ACTIVATE_ONLY' },
    // Real conduit switch placed at (1, 0) - inverts to (6, 5) when Real inverts!
    { id: 'sw-20-ascent-conduit', world: 'real', position: { x: 1, y: 0 }, linkedDoorId: 'door-20-shadow-ascent', activationBehavior: 'ACTIVATE_ONLY' },
    // Shadow exit gate switch at (2, 2)
    { id: 'sw-20-exit-gate-a', world: 'shadow', position: { x: 2, y: 2 }, linkedDoorId: 'door-20-exit-real', activationBehavior: 'ACTIVATE_ONLY' },
    { id: 'sw-20-exit-gate-a2', world: 'shadow', position: { x: 2, y: 2 }, linkedDoorId: 'door-20-exit-shadow', activationBehavior: 'ACTIVATE_ONLY' },

    // Strategy B - Descent
    // Shadow Beta at (6, 4) - ONLY reachable from (6, 3) by moving DOWN!
    { id: 'sw-20-beta', world: 'shadow', position: { x: 6, y: 4 }, linkedDoorId: 'door-20-ind-b', activationBehavior: 'ACTIVATE_ONLY' },
    // Shadow conduit switch placed at (6, 5) - inverts to (1, 0) when Shadow inverts!
    { id: 'sw-20-descent-conduit', world: 'shadow', position: { x: 6, y: 5 }, linkedDoorId: 'door-20-real-descent', activationBehavior: 'ACTIVATE_ONLY' },
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
      targetPosition: { x: 6, y: 4 },
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
      targetPosition: { x: 1, y: 1 },
      action: 'COLLAPSE_TILE',
      animation: 'crumble',
      sound: 'crumble',
      repeatable: false,
    },
  ],
  solutionTrace: [],
};
