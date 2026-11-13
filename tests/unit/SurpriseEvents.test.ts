import { describe, it, expect, beforeEach } from 'vitest';
import { SurpriseEventManager } from '../../src/events/SurpriseEventManager';
import { WorldGrid } from '../../src/grid/WorldGrid';
import { LevelFactory } from '../../src/levels/LevelFactory';
import { ALL_LEVELS } from '../../src/levels/levelsData';
import { SurpriseEventConfig } from '../../src/types/surprise';
import { TileType } from '../../src/grid/TileType';
import { GridPoint } from '../../src/grid/GridPosition';
import { MoveDirection } from '../../src/engine/MovementEngine';

describe('SurpriseEventManager Engine & Unit Tests', () => {
  let playerGrid: WorldGrid;
  let shadowGrid: WorldGrid;

  beforeEach(() => {
    playerGrid = new WorldGrid({ width: 7, height: 5 });
    shadowGrid = new WorldGrid({ width: 7, height: 5 });
  });

  it('initializes with PENDING state for all defined surprise events', () => {
    const events: SurpriseEventConfig[] = [
      {
        id: 'test-step-on',
        name: 'Step On Trap',
        triggerType: 'STEP_ON',
        triggerWorld: 'real',
        triggerPosition: { x: 2, y: 2 },
        targetWorld: 'real',
        targetType: 'WALL',
        targetPosition: { x: 3, y: 2 },
        activationDelay: 0,
        action: 'SPAWN_WALL',
        animation: 'crumble',
        sound: 'crumble',
        warningClue: 'Faint vibration on the floor',
      },
    ];

    const manager = new SurpriseEventManager({ events, playerGrid, shadowGrid });
    expect(manager.getEventState('test-step-on')).toBe('PENDING');
    expect(manager.getEvents().length).toBe(1);
  });

  it('triggers immediate SPAWN_WALL upon STEP_ON event', () => {
    const events: SurpriseEventConfig[] = [
      {
        id: 'test-wall-drop',
        name: 'Wall Drop',
        triggerType: 'STEP_ON',
        triggerWorld: 'real',
        triggerPosition: { x: 2, y: 2 },
        targetWorld: 'real',
        targetType: 'WALL',
        targetPosition: { x: 3, y: 2 },
        activationDelay: 0,
        action: 'SPAWN_WALL',
        animation: 'crumble',
        sound: 'crumble',
        warningClue: 'Cracks in the ceiling',
      },
    ];

    const manager = new SurpriseEventManager({ events, playerGrid, shadowGrid });
    expect(playerGrid.isWalkable({ x: 3, y: 2 })).toBe(true);

    // Evaluate turn where player moves onto (2,2)
    const triggered = manager.evaluateTurn({
      playerPos: GridPoint.from({ x: 2, y: 2 }),
      playerOldPos: GridPoint.from({ x: 1, y: 2 }),
      shadowPos: GridPoint.from({ x: 5, y: 2 }),
      shadowOldPos: GridPoint.from({ x: 5, y: 2 }),
      realExitPos: GridPoint.from({ x: 6, y: 2 }),
      shadowExitPos: GridPoint.from({ x: 1, y: 2 }),
      turnCount: 1,
    });

    expect(triggered).toBe(true);
    expect(manager.getEventState('test-wall-drop')).toBe('COMPLETED');
    expect(playerGrid.isWalkable({ x: 3, y: 2 })).toBe(false);
    expect(playerGrid.getCell({ x: 3, y: 2 })?.tileType).toBe(TileType.WALL);
  });

  it('arms delayed trap and triggers after specified countdown turns', () => {
    const events: SurpriseEventConfig[] = [
      {
        id: 'test-delayed-collapse',
        name: 'Delayed Floor Collapse',
        triggerType: 'STEP_ON',
        triggerWorld: 'real',
        triggerPosition: { x: 2, y: 2 },
        targetWorld: 'real',
        targetType: 'COLLAPSE_FLOOR',
        targetPosition: { x: 1, y: 2 },
        activationDelay: 2,
        action: 'COLLAPSE_TILE',
        animation: 'crumble',
        sound: 'crumble',
        warningClue: 'Hairline fractures',
      },
    ];

    const manager = new SurpriseEventManager({ events, playerGrid, shadowGrid });

    // Turn 1: Player steps on trigger
    manager.evaluateTurn({
      playerPos: GridPoint.from({ x: 2, y: 2 }),
      playerOldPos: GridPoint.from({ x: 1, y: 2 }),
      shadowPos: GridPoint.from({ x: 5, y: 2 }),
      shadowOldPos: GridPoint.from({ x: 5, y: 2 }),
      realExitPos: GridPoint.from({ x: 6, y: 2 }),
      shadowExitPos: GridPoint.from({ x: 1, y: 2 }),
      turnCount: 1,
    });

    // Event is ARMED, not yet triggered
    expect(manager.getEventState('test-delayed-collapse')).toBe('ARMED');
    expect(playerGrid.isWalkable({ x: 1, y: 2 })).toBe(true);

    // Turn 2: Delay countdown decrements (delayRemaining = 1)
    manager.evaluateTurn({
      playerPos: GridPoint.from({ x: 3, y: 2 }),
      playerOldPos: GridPoint.from({ x: 2, y: 2 }),
      shadowPos: GridPoint.from({ x: 4, y: 2 }),
      shadowOldPos: GridPoint.from({ x: 5, y: 2 }),
      realExitPos: GridPoint.from({ x: 6, y: 2 }),
      shadowExitPos: GridPoint.from({ x: 1, y: 2 }),
      turnCount: 2,
    });

    expect(manager.getEventState('test-delayed-collapse')).toBe('ARMED');
    expect(playerGrid.isWalkable({ x: 1, y: 2 })).toBe(true);

    // Turn 3: Countdown reaches 0 -> Triggers!
    manager.evaluateTurn({
      playerPos: GridPoint.from({ x: 4, y: 2 }),
      playerOldPos: GridPoint.from({ x: 3, y: 2 }),
      shadowPos: GridPoint.from({ x: 3, y: 2 }),
      shadowOldPos: GridPoint.from({ x: 4, y: 2 }),
      realExitPos: GridPoint.from({ x: 6, y: 2 }),
      shadowExitPos: GridPoint.from({ x: 1, y: 2 }),
      turnCount: 3,
    });

    expect(manager.getEventState('test-delayed-collapse')).toBe('COMPLETED');
    expect(playerGrid.isWalkable({ x: 1, y: 2 })).toBe(false);
  });

  it('triggers on STEP_OFF event', () => {
    const events: SurpriseEventConfig[] = [
      {
        id: 'test-step-off',
        name: 'Step Off Trap',
        triggerType: 'STEP_OFF',
        triggerWorld: 'real',
        triggerPosition: { x: 2, y: 2 },
        targetWorld: 'real',
        targetType: 'WALL',
        targetPosition: { x: 2, y: 2 },
        activationDelay: 0,
        action: 'SPAWN_WALL',
        animation: 'crumble',
        sound: 'crumble',
        warningClue: 'Tile quivers when weight is removed',
      },
    ];

    const manager = new SurpriseEventManager({ events, playerGrid, shadowGrid });

    // Step off (2,2) to (3,2)
    manager.evaluateTurn({
      playerPos: GridPoint.from({ x: 3, y: 2 }),
      playerOldPos: GridPoint.from({ x: 2, y: 2 }),
      shadowPos: GridPoint.from({ x: 4, y: 2 }),
      shadowOldPos: GridPoint.from({ x: 4, y: 2 }),
      realExitPos: GridPoint.from({ x: 6, y: 2 }),
      shadowExitPos: GridPoint.from({ x: 1, y: 2 }),
      turnCount: 1,
    });

    expect(manager.getEventState('test-step-off')).toBe('COMPLETED');
    expect(playerGrid.isWalkable({ x: 2, y: 2 })).toBe(false);
  });

  it('triggers on PROXIMITY to target', () => {
    const events: SurpriseEventConfig[] = [
      {
        id: 'test-proximity',
        name: 'Proximity Trap',
        triggerType: 'PROXIMITY',
        triggerWorld: 'real',
        triggerPosition: { x: 4, y: 2 },
        triggerRadius: 1,
        targetWorld: 'real',
        targetType: 'WALL',
        targetPosition: { x: 5, y: 2 },
        activationDelay: 0,
        action: 'SPAWN_WALL',
        animation: 'crumble',
        sound: 'distortion',
        warningClue: 'Air distorts nearby',
      },
    ];

    const manager = new SurpriseEventManager({ events, playerGrid, shadowGrid });

    // Player moves to (3,2), which is distance 1 from (4,2)
    manager.evaluateTurn({
      playerPos: GridPoint.from({ x: 3, y: 2 }),
      playerOldPos: GridPoint.from({ x: 2, y: 2 }),
      shadowPos: GridPoint.from({ x: 4, y: 2 }),
      shadowOldPos: GridPoint.from({ x: 5, y: 2 }),
      realExitPos: GridPoint.from({ x: 6, y: 2 }),
      shadowExitPos: GridPoint.from({ x: 1, y: 2 }),
      turnCount: 1,
    });

    expect(manager.getEventState('test-proximity')).toBe('COMPLETED');
    expect(playerGrid.isWalkable({ x: 5, y: 2 })).toBe(false);
  });

  it('triggers on SWITCH_TOGGLE notification', () => {
    const events: SurpriseEventConfig[] = [
      {
        id: 'test-switch-event',
        name: 'Secret Door Opening',
        triggerType: 'SWITCH_TOGGLE',
        triggerSourceId: 'sw-1',
        targetWorld: 'shadow',
        targetType: 'WALL',
        targetPosition: { x: 0, y: 0 },
        activationDelay: 0,
        action: 'REMOVE_WALL',
        animation: 'spark',
        sound: 'wall_open',
        warningClue: 'A click in the distance',
      },
    ];

    shadowGrid.setTileType({ x: 0, y: 0 }, TileType.WALL);
    const manager = new SurpriseEventManager({ events, playerGrid, shadowGrid });

    manager.notifySwitchToggle('sw-1', true);
    expect(manager.getEventState('test-switch-event')).toBe('COMPLETED');
    expect(shadowGrid.isWalkable({ x: 0, y: 0 })).toBe(true);
  });

  it('triggers on BOMB_DETONATED notification', () => {
    const events: SurpriseEventConfig[] = [
      {
        id: 'test-bomb-echo',
        name: 'Bomb Shockwave Collapse',
        triggerType: 'BOMB_DETONATED',
        triggerSourceId: 'bomb-alpha',
        targetWorld: 'real',
        targetType: 'COLLAPSE_FLOOR',
        targetPosition: { x: 0, y: 0 },
        activationDelay: 0,
        action: 'COLLAPSE_TILE',
        animation: 'crumble',
        sound: 'explosion',
        warningClue: 'Tremor from the blast',
      },
    ];

    const manager = new SurpriseEventManager({ events, playerGrid, shadowGrid });
    manager.notifyBombDetonated('bomb-alpha');
    expect(manager.getEventState('test-bomb-echo')).toBe('COMPLETED');
    expect(playerGrid.isWalkable({ x: 0, y: 0 })).toBe(false);
  });

  it('accurately captures and restores snapshots reverting modified tiles', () => {
    const events: SurpriseEventConfig[] = [
      {
        id: 'test-revert',
        name: 'Revert Test',
        triggerType: 'STEP_ON',
        triggerWorld: 'real',
        triggerPosition: { x: 2, y: 2 },
        targetWorld: 'real',
        targetType: 'WALL',
        targetPosition: { x: 3, y: 2 },
        activationDelay: 0,
        action: 'SPAWN_WALL',
        animation: 'crumble',
        sound: 'crumble',
        warningClue: 'Unstable foundation',
      },
    ];

    const manager = new SurpriseEventManager({ events, playerGrid, shadowGrid });
    const snapshotBefore = manager.captureSnapshot();

    // Trigger trap
    manager.evaluateTurn({
      playerPos: GridPoint.from({ x: 2, y: 2 }),
      playerOldPos: GridPoint.from({ x: 1, y: 2 }),
      shadowPos: GridPoint.from({ x: 5, y: 2 }),
      shadowOldPos: GridPoint.from({ x: 5, y: 2 }),
      realExitPos: GridPoint.from({ x: 6, y: 2 }),
      shadowExitPos: GridPoint.from({ x: 1, y: 2 }),
      turnCount: 1,
    });

    expect(manager.getEventState('test-revert')).toBe('COMPLETED');
    expect(playerGrid.isWalkable({ x: 3, y: 2 })).toBe(false);

    // Restore snapshot
    manager.restoreSnapshot(snapshotBefore);
    expect(manager.getEventState('test-revert')).toBe('PENDING');
    expect(playerGrid.isWalkable({ x: 3, y: 2 })).toBe(true);
  });

  it('integrates seamlessly with Level 11 in TurnEngine', () => {
    const level11Def = ALL_LEVELS.find((l) => l.id === 11);
    expect(level11Def).toBeDefined();
    expect(level11Def?.surpriseEvents?.length).toBeGreaterThan(0);

    const session = LevelFactory.build(level11Def!);
    expect(session.surpriseManager).toBeDefined();
    expect(session.surpriseManager.getEvents().length).toBe(2);

    // Replay solution moves
    for (let i = 0; i < level11Def!.solutionTrace!.length; i++) {
      const move = level11Def!.solutionTrace![i];
      if (session.turnEngine.state === 'COMPLETED') break;
      const res = session.turnEngine.handleInput(move as MoveDirection);
      expect(res).not.toBeNull();
      session.turnEngine.endAnimation();
      expect(session.turnEngine.state).not.toBe('DYING');
    }

    expect(session.turnEngine.state).toBe('COMPLETED');
  });
});
