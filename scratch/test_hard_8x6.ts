import { LevelDefinition } from '../src/types/level';
import { LevelFactory } from '../src/levels/LevelFactory';
import { LevelSolver, Direction } from '../src/solver/LevelSolver';

export const LEVEL_20_HARD_8X6: LevelDefinition = {
  id: 20,
  chapter: 'THE TRUTH',
  name: 'The Final Paradox',
  width: 8,
  height: 6,
  difficulty: 'MASTER',
  hint: 'Two worlds. One mind. Sometimes the way forward is on the other side of what you believe.',
  realStart: { x: 1, y: 3 },
  shadowStart: { x: 6, y: 2 },
  realExit: { x: 7, y: 5 },
  shadowExit: { x: 0, y: 0 },
  fixedTilesReal: [{ x: 6, y: 5 }],
  fixedTilesShadow: [{ x: 1, y: 0 }],
  realWalls: [
    // Column 3 dividing barrier: blocks normal crossing
    { x: 3, y: 0 },
    { x: 3, y: 1 },
    { x: 3, y: 2 },
    { x: 3, y: 3 },
    // (3, 4) is closed door-20-real-conduit!
    { x: 3, y: 5 },

    // Baffles in Real World
    { x: 2, y: 1 },
    { x: 2, y: 3 },
    { x: 4, y: 1 },
    { x: 4, y: 2 },
    { x: 4, y: 5 },
    { x: 5, y: 3 },
    { x: 5, y: 5 },
    { x: 0, y: 2 },
    { x: 0, y: 4 },
    { x: 7, y: 1 },
    { x: 7, y: 3 },
  ],
  shadowWalls: [
    // Column 4 dividing barrier (180° inverse: 7-x, 5-y)
    // 7 - 3 = 4; rows: 5-0=5, 5-1=4, 5-2=3, 5-3=2, 5-5=0
    { x: 4, y: 5 },
    { x: 4, y: 4 },
    { x: 4, y: 3 },
    { x: 4, y: 2 },
    // (4, 1) is closed door-20-shadow-conduit!
    { x: 4, y: 0 },

    // Baffles in Shadow World (exact 180° inverse)
    { x: 5, y: 4 },
    { x: 5, y: 2 },
    { x: 3, y: 4 },
    { x: 3, y: 3 },
    { x: 3, y: 0 },
    { x: 2, y: 2 },
    { x: 2, y: 0 },
    { x: 7, y: 3 },
    { x: 7, y: 1 },
    { x: 0, y: 4 },
    { x: 0, y: 2 },
  ],
  doors: [
    // Pre-inversion security gates guarding Alpha and Beta
    { id: 'door-20-alpha-gate', world: 'real', position: { x: 1, y: 1 }, initialOpen: false },
    { id: 'door-20-beta-gate', world: 'shadow', position: { x: 6, y: 4 }, initialOpen: false },

    // Cross-world conduit doors
    { id: 'door-20-shadow-conduit', world: 'shadow', position: { x: 4, y: 1 }, initialOpen: false },
    { id: 'door-20-real-conduit', world: 'real', position: { x: 3, y: 4 }, initialOpen: false },

    // Fixed exit threshold doors
    { id: 'door-20-exit-real', world: 'real', position: { x: 6, y: 5 }, initialOpen: false, activationRule: 'ANY' },
    { id: 'door-20-exit-shadow', world: 'shadow', position: { x: 1, y: 0 }, initialOpen: false, activationRule: 'ANY' },

    // Indicators
    { id: 'door-20-ind-a', world: 'real', position: { x: 0, y: 0 }, initialOpen: false },
    { id: 'door-20-ind-b', world: 'shadow', position: { x: 7, y: 5 }, initialOpen: false },
  ],
  switches: [
    // Pre-inversion prep switches
    // Shadow navigates to (7, 4) to open door-20-alpha-gate for Real
    { id: 'sw-20-prep-shadow', world: 'shadow', position: { x: 7, y: 4 }, linkedDoorId: 'door-20-alpha-gate', activationBehavior: 'ACTIVATE_ONLY' },
    // Real navigates to (0, 1) to open door-20-beta-gate for Shadow
    { id: 'sw-20-prep-real', world: 'real', position: { x: 0, y: 1 }, linkedDoorId: 'door-20-beta-gate', activationBehavior: 'ACTIVATE_ONLY' },

    // Strategy A - Ascent
    // Real Alpha at (1, 0)
    { id: 'sw-20-alpha', world: 'real', position: { x: 1, y: 0 }, linkedDoorId: 'door-20-ind-a', activationBehavior: 'ACTIVATE_ONLY' },
    // Real conduit switch placed at (7, 5) - inverts to (0, 0) when Real inverts!
    { id: 'sw-20-ascent-conduit', world: 'real', position: { x: 7, y: 5 }, linkedDoorId: 'door-20-shadow-conduit', activationBehavior: 'ACTIVATE_ONLY' },
    // Shadow exit gate switch at (2, 1)
    { id: 'sw-20-exit-gate-a', world: 'shadow', position: { x: 2, y: 1 }, linkedDoorId: 'door-20-exit-real', activationBehavior: 'ACTIVATE_ONLY' },
    { id: 'sw-20-exit-gate-a2', world: 'shadow', position: { x: 2, y: 1 }, linkedDoorId: 'door-20-exit-shadow', activationBehavior: 'ACTIVATE_ONLY' },

    // Strategy B - Descent
    // Shadow Beta at (6, 5)
    { id: 'sw-20-beta', world: 'shadow', position: { x: 6, y: 5 }, linkedDoorId: 'door-20-ind-b', activationBehavior: 'ACTIVATE_ONLY' },
    // Shadow conduit switch placed at (0, 0) - inverts to (7, 5) when Shadow inverts!
    { id: 'sw-20-descent-conduit', world: 'shadow', position: { x: 0, y: 0 }, linkedDoorId: 'door-20-real-conduit', activationBehavior: 'ACTIVATE_ONLY' },
    // Real exit gate switch at (5, 4)
    { id: 'sw-20-exit-gate-b', world: 'real', position: { x: 5, y: 4 }, linkedDoorId: 'door-20-exit-real', activationBehavior: 'ACTIVATE_ONLY' },
    { id: 'sw-20-exit-gate-b2', world: 'real', position: { x: 5, y: 4 }, linkedDoorId: 'door-20-exit-shadow', activationBehavior: 'ACTIVATE_ONLY' },
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
      targetPosition: { x: 6, y: 5 },
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
      targetPosition: { x: 1, y: 0 },
      action: 'COLLAPSE_TILE',
      animation: 'crumble',
      sound: 'crumble',
      repeatable: false,
    },
  ],
  solutionTrace: [],
};
