import { describe, it, expect, beforeEach } from 'vitest';
import { TileType } from '@/grid/TileType';
import { WorldGrid } from '@/grid/WorldGrid';
import { GridPoint } from '@/grid/GridPosition';
import { CollisionEngine } from '@/engine/CollisionEngine';
import { GridValidator } from '@/grid/GridValidator';

describe('Phase 04 — Grid and Collision Engine', () => {
  let playerGrid: WorldGrid;
  let shadowGrid: WorldGrid;
  let collisions: CollisionEngine;

  beforeEach(() => {
    playerGrid = new WorldGrid({ width: 5, height: 5 });
    shadowGrid = new WorldGrid({ width: 5, height: 5 });
    collisions = new CollisionEngine({ playerGrid, shadowGrid });
  });

  // 1. Wall collision
  it('1. Wall collision: blocks movement into wall tiles', () => {
    playerGrid.setTileType({ x: 2, y: 1 }, TileType.WALL);
    const evalResult = collisions.evaluatePlayerDestination({ x: 2, y: 1 }, false);

    expect(evalResult.canEnter).toBe(false);
    expect(evalResult.isBlocked).toBe(true);
    expect(evalResult.tileType).toBe(TileType.WALL);
  });

  // 2. Open floor movement
  it('2. Open floor movement: allows movement into floor tiles', () => {
    playerGrid.setTileType({ x: 2, y: 2 }, TileType.FLOOR);
    const evalResult = collisions.evaluatePlayerDestination({ x: 2, y: 2 }, false);

    expect(evalResult.canEnter).toBe(true);
    expect(evalResult.isBlocked).toBe(false);
    expect(evalResult.tileType).toBe(TileType.FLOOR);
  });

  // 3. Closed door collision
  it('3. Closed door collision: blocks entry while door is closed', () => {
    playerGrid.setCell({
      position: new GridPoint(2, 3),
      tileType: TileType.DOOR,
      door: { id: 'door-1', isOpen: false },
    });

    const evalResult = collisions.evaluatePlayerDestination({ x: 2, y: 3 }, false);
    expect(evalResult.canEnter).toBe(false);
    expect(evalResult.isBlocked).toBe(true);
    expect(evalResult.tileType).toBe(TileType.DOOR);
  });

  // 4. Open door movement
  it('4. Open door movement: allows entry while door is open', () => {
    playerGrid.setCell({
      position: new GridPoint(2, 3),
      tileType: TileType.DOOR,
      door: { id: 'door-1', isOpen: false },
    });

    // Open door
    playerGrid.setDoorState('door-1', true);

    const evalResult = collisions.evaluatePlayerDestination({ x: 2, y: 3 }, false);
    expect(evalResult.canEnter).toBe(true);
    expect(evalResult.isBlocked).toBe(false);
    expect(evalResult.tileType).toBe(TileType.DOOR);
  });

  // 5. Hazard detection
  it('5. Hazard detection: allows entry but flags destination as hazard', () => {
    shadowGrid.setCell({
      position: new GridPoint(1, 1),
      tileType: TileType.HAZARD,
      hazard: { id: 'haz-1' },
    });

    const evalResult = collisions.evaluateShadowDestination({ x: 1, y: 1 }, false);
    expect(evalResult.canEnter).toBe(true);
    expect(evalResult.isHazard).toBe(true);
    expect(evalResult.tileType).toBe(TileType.HAZARD);
  });

  // 6. Boundary collision
  it('6. Boundary collision: blocks movement outside grid bounds', () => {
    expect(collisions.isPlayerDestinationFree({ x: -1, y: 2 }, false)).toBe(false);
    expect(collisions.isPlayerDestinationFree({ x: 2, y: -1 }, false)).toBe(false);
    expect(collisions.isPlayerDestinationFree({ x: 5, y: 2 }, false)).toBe(false);
    expect(collisions.isPlayerDestinationFree({ x: 2, y: 5 }, false)).toBe(false);
  });

  // 7. Invalid coordinates
  it('7. Invalid coordinates: rejects non-integers and NaN during coordinate parsing', () => {
    expect(() => new GridPoint(1.2, 3)).toThrow(/must be integers/);
    expect(() => new GridPoint(2, NaN)).toThrow(/must be integers/);

    expect(() =>
      GridValidator.validateAndBuild({
        width: 5,
        height: 5,
        cells: [{ x: 1.5, y: 2, tileType: 'FLOOR' }],
      })
    ).toThrow(/Invalid cell coordinate/);
  });

  // 8. Unknown tile types
  it('8. Unknown tile types: produces a level validation error', () => {
    expect(() =>
      GridValidator.validateAndBuild({
        width: 5,
        height: 5,
        cells: [{ x: 1, y: 1, tileType: 'LAVA_PIT' }],
      })
    ).toThrow(/Unknown tile type "LAVA_PIT"/);

    expect(() =>
      GridValidator.validateAndBuild({
        width: 5,
        height: 5,
        cells: [{ x: 2, y: 2, tileType: 'teleporter' }],
      })
    ).toThrow(/Unknown tile type "teleporter"/);
  });

  // 9. Overlapping objects
  it('9. Overlapping objects: rejects duplicate or overlapping cell definitions', () => {
    expect(() =>
      GridValidator.validateAndBuild({
        width: 5,
        height: 5,
        cells: [
          { x: 2, y: 2, tileType: 'FLOOR' },
          { x: 2, y: 2, tileType: 'WALL' },
        ],
      })
    ).toThrow(/Overlapping cell definition detected at position \(2, 2\)/);
  });

  // 10. Invalid starting positions
  it('10. Invalid starting positions: prevents characters from spawning inside walls or closed doors', () => {
    // Spawning inside wall
    expect(() =>
      GridValidator.validateAndBuild({
        width: 5,
        height: 5,
        spawnPosition: { x: 2, y: 2 },
        cells: [{ x: 2, y: 2, tileType: 'WALL' }],
      })
    ).toThrow(/Character cannot spawn inside a WALL at \(2, 2\)/);

    // Spawning inside closed door
    expect(() =>
      GridValidator.validateAndBuild({
        width: 5,
        height: 5,
        spawnPosition: { x: 3, y: 3 },
        cells: [{ x: 3, y: 3, tileType: 'DOOR', door: { id: 'd1', isOpen: false } }],
      })
    ).toThrow(/Character cannot spawn inside a closed DOOR at \(3, 3\)/);

    // Spawning inside open door is permitted
    expect(() =>
      GridValidator.validateAndBuild({
        width: 5,
        height: 5,
        spawnPosition: { x: 3, y: 3 },
        cells: [{ x: 3, y: 3, tileType: 'DOOR', door: { id: 'd1', isOpen: true } }],
      })
    ).not.toThrow();
  });

  describe('Additional Interactive Tiles (Switches, Pressure Plates, Checkpoints, Exits)', () => {
    it('evaluates switches, pressure plates, checkpoints and exits as walkable', () => {
      playerGrid.setCell({
        position: new GridPoint(0, 1),
        tileType: TileType.SWITCH,
        switch: { id: 'sw-1', targetDoorId: 'd1', isActive: false },
      });
      playerGrid.setCell({
        position: new GridPoint(0, 2),
        tileType: TileType.PRESSURE_PLATE,
        pressurePlate: { id: 'pp-1', targetDoorId: 'd1', isPressed: false },
      });
      playerGrid.setCell({
        position: new GridPoint(0, 3),
        tileType: TileType.CHECKPOINT,
        checkpoint: { id: 'cp-1', isActivated: false },
      });
      playerGrid.setCell({
        position: new GridPoint(0, 4),
        tileType: TileType.EXIT,
      });

      expect(collisions.evaluatePlayerDestination({ x: 0, y: 1 }, false).isSwitch).toBe(true);
      expect(collisions.evaluatePlayerDestination({ x: 0, y: 2 }, false).isPressurePlate).toBe(true);
      expect(collisions.evaluatePlayerDestination({ x: 0, y: 3 }, false).isCheckpoint).toBe(true);
      expect(collisions.evaluatePlayerDestination({ x: 0, y: 4 }, false).isExit).toBe(true);
    });
  });
});
