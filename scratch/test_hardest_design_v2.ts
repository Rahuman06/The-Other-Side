import { LevelDefinition } from '../src/types/level';
import { LevelFactory } from '../src/levels/LevelFactory';
import { LevelSolver, Direction } from '../src/solver/LevelSolver';

// The Ultimate 9x7 Masterpiece: 20+ Moves, Extreme Complexity, Strictly Two Solutions
export const LEVEL_20_ULTIMATE: LevelDefinition = {
  id: 20,
  chapter: 'THE TRUTH',
  name: 'The Final Paradox',
  width: 9,
  height: 7,
  difficulty: 'MASTER',
  hint: 'Two worlds. One mind. Sometimes the way forward is on the other side of what you believe.',
  realStart: { x: 1, y: 3 },
  shadowStart: { x: 7, y: 3 },
  realExit: { x: 8, y: 0 },
  shadowExit: { x: 0, y: 6 },
  fixedTilesReal: [{ x: 7, y: 0 }],
  fixedTilesShadow: [{ x: 1, y: 6 }],
  realWalls: [
    // Outer perimeter corners
    { x: 0, y: 6 },
    { x: 8, y: 6 },

    // Central dividing column 4 - blocks ALL rows 0 to 5 completely
    { x: 4, y: 0 },
    { x: 4, y: 1 },
    { x: 4, y: 2 },
    { x: 4, y: 3 },
    { x: 4, y: 4 },
    { x: 4, y: 5 },
    // row 6 is closed door-20-real-conduit at (4, 6)

    // Internal baffles creating multi-layer labyrinth
    { x: 2, y: 1 },
    { x: 2, y: 2 },
    { x: 2, y: 4 },
    { x: 2, y: 5 },

    { x: 6, y: 1 },
    { x: 6, y: 2 },
    { x: 6, y: 4 },
    { x: 6, y: 5 },

    // Horizontal barrier walls
    { x: 0, y: 2 },
    { x: 3, y: 2 },
    { x: 5, y: 4 },
    { x: 8, y: 4 },

    { x: 3, y: 5 },
    { x: 5, y: 1 },
  ],
  shadowWalls: [
    // Outer perimeter corners (180° counterpart: 8-x, 6-y)
    { x: 8, y: 0 },
    { x: 0, y: 0 },

    // Central dividing column 4 - blocks ALL rows 1 to 6 completely
    // row 0 is closed door-20-shadow-conduit at (4, 0)
    { x: 4, y: 1 },
    { x: 4, y: 2 },
    { x: 4, y: 3 },
    { x: 4, y: 4 },
    { x: 4, y: 5 },
    { x: 4, y: 6 },

    // Internal baffles
    { x: 6, y: 5 },
    { x: 6, y: 4 },
    { x: 6, y: 2 },
    { x: 6, y: 1 },

    { x: 2, y: 5 },
    { x: 2, y: 4 },
    { x: 2, y: 2 },
    { x: 2, y: 1 },

    // Horizontal barrier walls
    { x: 8, y: 4 },
    { x: 5, y: 4 },
    { x: 3, y: 2 },
    { x: 0, y: 2 },

    { x: 5, y: 1 },
    { x: 3, y: 5 },
  ],
  doors: [
    // Pre-inversion security gates
    { id: 'door-20-alpha-gate', world: 'real', position: { x: 1, y: 2 }, initialOpen: false },
    { id: 'door-20-beta-gate', world: 'shadow', position: { x: 7, y: 4 }, initialOpen: false },

    // Cross-world conduit gates
    { id: 'door-20-shadow-conduit', world: 'shadow', position: { x: 4, y: 0 }, initialOpen: false },
    { id: 'door-20-real-conduit', world: 'real', position: { x: 4, y: 6 }, initialOpen: false },

    // Fixed Exit threshold doors
    { id: 'door-20-exit-real', world: 'real', position: { x: 7, y: 0 }, initialOpen: false, activationRule: 'ANY' },
    { id: 'door-20-exit-shadow', world: 'shadow', position: { x: 1, y: 6 }, initialOpen: false, activationRule: 'ANY' },

    // Indicator doors
    { id: 'door-20-ind-a', world: 'real', position: { x: 0, y: 4 }, initialOpen: false },
    { id: 'door-20-ind-b', world: 'shadow', position: { x: 8, y: 2 }, initialOpen: false },
  ],
  switches: [
    // Pre-inversion prep switches:
    { id: 'sw-20-prep-shadow', world: 'shadow', position: { x: 8, y: 5 }, linkedDoorId: 'door-20-alpha-gate', activationBehavior: 'ACTIVATE_ONLY' },
    { id: 'sw-20-prep-real', world: 'real', position: { x: 0, y: 1 }, linkedDoorId: 'door-20-beta-gate', activationBehavior: 'ACTIVATE_ONLY' },

    // Strategy A - Ascent
    { id: 'sw-20-alpha', world: 'real', position: { x: 1, y: 0 }, linkedDoorId: 'door-20-ind-a', activationBehavior: 'ACTIVATE_ONLY' },
    // Real conduit switch placed at (1, 1) - rotates to (7, 5) when Real inverts!
    { id: 'sw-20-ascent-conduit', world: 'real', position: { x: 1, y: 1 }, linkedDoorId: 'door-20-shadow-conduit', activationBehavior: 'ACTIVATE_ONLY' },
    // Shadow exit gate switch at (3, 0)
    { id: 'sw-20-exit-gate-a', world: 'shadow', position: { x: 3, y: 0 }, linkedDoorId: 'door-20-exit-real', activationBehavior: 'ACTIVATE_ONLY' },
    { id: 'sw-20-exit-gate-a2', world: 'shadow', position: { x: 3, y: 0 }, linkedDoorId: 'door-20-exit-shadow', activationBehavior: 'ACTIVATE_ONLY' },

    // Strategy B - Descent
    { id: 'sw-20-beta', world: 'shadow', position: { x: 7, y: 6 }, linkedDoorId: 'door-20-ind-b', activationBehavior: 'ACTIVATE_ONLY' },
    // Shadow conduit switch placed at (7, 5) - rotates to (1, 1) when Shadow inverts!
    { id: 'sw-20-descent-conduit', world: 'shadow', position: { x: 7, y: 5 }, linkedDoorId: 'door-20-real-conduit', activationBehavior: 'ACTIVATE_ONLY' },
    // Real exit gate switch at (5, 6)
    { id: 'sw-20-exit-gate-b', world: 'real', position: { x: 5, y: 6 }, linkedDoorId: 'door-20-exit-real', activationBehavior: 'ACTIVATE_ONLY' },
    { id: 'sw-20-exit-gate-b2', world: 'real', position: { x: 5, y: 6 }, linkedDoorId: 'door-20-exit-shadow', activationBehavior: 'ACTIVATE_ONLY' },
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
      targetPosition: { x: 7, y: 6 },
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
