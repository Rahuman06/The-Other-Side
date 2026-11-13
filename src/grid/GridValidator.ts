import { GridPoint, GridPosition } from './GridPosition';
import { TileType, VALID_TILE_TYPES } from './TileType';
import { WorldGrid } from './WorldGrid';

export interface RawCellData {
  readonly x: number;
  readonly y: number;
  readonly tileType: string;
  readonly door?: { id: string; isOpen?: boolean };
  readonly switch?: { id: string; targetDoorId: string; isActive?: boolean };
  readonly pressurePlate?: { id: string; targetDoorId: string };
  readonly hazard?: { id: string };
  readonly checkpoint?: { id: string };
}

export interface GridValidationConfig {
  readonly width: number;
  readonly height: number;
  readonly spawnPosition?: GridPosition;
  readonly exitPosition?: GridPosition;
  readonly cells: readonly RawCellData[];
}

export class GridValidator {
  public static validateAndBuild(config: GridValidationConfig): WorldGrid {
    if (!Number.isInteger(config.width) || config.width <= 0) {
      throw new Error(`Invalid grid width: ${config.width}. Must be a positive integer.`);
    }
    if (!Number.isInteger(config.height) || config.height <= 0) {
      throw new Error(`Invalid grid height: ${config.height}. Must be a positive integer.`);
    }

    const grid = new WorldGrid({ width: config.width, height: config.height });
    const visitedKeys = new Set<string>();

    for (let i = 0; i < config.cells.length; i++) {
      const raw = config.cells[i];

      // Coordinate validation
      if (!Number.isInteger(raw.x) || !Number.isInteger(raw.y)) {
        throw new Error(`Invalid cell coordinate at index ${i}: (${raw.x}, ${raw.y})`);
      }

      const pt = new GridPoint(raw.x, raw.y);
      if (!pt.isInBounds(config.width, config.height)) {
        throw new Error(
          `Cell at index ${i} has out-of-bounds coordinates (${raw.x}, ${raw.y}) for grid ${config.width}x${config.height}`
        );
      }

      // Overlapping objects check
      const key = pt.toKey();
      if (visitedKeys.has(key)) {
        throw new Error(`Overlapping cell definition detected at position (${raw.x}, ${raw.y})`);
      }
      visitedKeys.add(key);

      // Unknown tile type validation
      if (!VALID_TILE_TYPES.has(raw.tileType)) {
        throw new Error(`Unknown tile type "${raw.tileType}" at position (${raw.x}, ${raw.y})`);
      }

      const tileType = raw.tileType as TileType;

      grid.setCell({
        position: pt,
        tileType,
        door: raw.door ? { id: raw.door.id, isOpen: !!raw.door.isOpen } : undefined,
        switch: raw.switch
          ? { id: raw.switch.id, targetDoorId: raw.switch.targetDoorId, isActive: !!raw.switch.isActive }
          : undefined,
        pressurePlate: raw.pressurePlate
          ? { id: raw.pressurePlate.id, targetDoorId: raw.pressurePlate.targetDoorId, isPressed: false }
          : undefined,
        hazard: raw.hazard ? { id: raw.hazard.id } : undefined,
        checkpoint: raw.checkpoint ? { id: raw.checkpoint.id, isActivated: false } : undefined,
      });
    }

    // Spawn validation: Do not allow characters to spawn inside walls or closed doors
    if (config.spawnPosition) {
      const spawnPt = GridPoint.from(config.spawnPosition);
      if (!spawnPt.isInBounds(config.width, config.height)) {
        throw new Error(`Spawn position (${spawnPt.x}, ${spawnPt.y}) is out of bounds`);
      }

      const spawnCell = grid.getCell(spawnPt);
      if (spawnCell) {
        if (spawnCell.tileType === TileType.WALL) {
          throw new Error(`Character cannot spawn inside a WALL at (${spawnPt.x}, ${spawnPt.y})`);
        }
        if (spawnCell.tileType === TileType.DOOR && !spawnCell.door?.isOpen) {
          throw new Error(`Character cannot spawn inside a closed DOOR at (${spawnPt.x}, ${spawnPt.y})`);
        }
      }
    }

    // Exit validation
    if (config.exitPosition) {
      const exitPt = GridPoint.from(config.exitPosition);
      if (!exitPt.isInBounds(config.width, config.height)) {
        throw new Error(`Exit position (${exitPt.x}, ${exitPt.y}) is out of bounds`);
      }
      const exitCell = grid.getCell(exitPt);
      if (exitCell && exitCell.tileType === TileType.WALL) {
        throw new Error(`Exit cannot be placed inside a WALL at (${exitPt.x}, ${exitPt.y})`);
      }
    }

    return grid;
  }
}
