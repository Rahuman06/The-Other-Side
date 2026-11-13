import { LevelData, Position, WorldType } from '../types/game.js';
import { GridUtils } from './Grid.js';

export interface ValidationError {
  field: string;
  message: string;
}

export class LevelValidator {
  public static validate(level: unknown): LevelData {
    if (!level || typeof level !== 'object') {
      throw new Error('Level validation failed: level data must be a non-null object');
    }

    const raw = level as Partial<LevelData>;
    const errors: ValidationError[] = [];

    if (typeof raw.id !== 'number' || raw.id <= 0 || !Number.isInteger(raw.id)) {
      errors.push({ field: 'id', message: 'Level id must be a positive integer' });
    }

    if (typeof raw.name !== 'string' || raw.name.trim().length === 0) {
      errors.push({ field: 'name', message: 'Level name must be a non-empty string' });
    }

    if (typeof raw.width !== 'number' || raw.width <= 0 || !Number.isInteger(raw.width)) {
      errors.push({ field: 'width', message: 'Level width must be a positive integer' });
    }

    if (typeof raw.height !== 'number' || raw.height <= 0 || !Number.isInteger(raw.height)) {
      errors.push({ field: 'height', message: 'Level height must be a positive integer' });
    }

    if (errors.length > 0) {
      throw new Error(`Level validation failed:\n${errors.map((e) => `  - ${e.field}: ${e.message}`).join('\n')}`);
    }

    const width = raw.width!;
    const height = raw.height!;

    const validatePos = (pos: unknown, name: string): Position | null => {
      if (!pos || typeof pos !== 'object') {
        errors.push({ field: name, message: 'Position must be an object with x and y' });
        return null;
      }
      const p = pos as Partial<Position>;
      if (typeof p.x !== 'number' || !Number.isInteger(p.x) || typeof p.y !== 'number' || !Number.isInteger(p.y)) {
        errors.push({ field: name, message: 'Coordinates x and y must be integers' });
        return null;
      }
      if (!GridUtils.isInBounds({ x: p.x, y: p.y }, width, height)) {
        errors.push({
          field: name,
          message: `Position (${p.x}, ${p.y}) is out of bounds for grid size ${width}x${height}`,
        });
        return null;
      }
      return { x: p.x, y: p.y };
    };

    const realStart = validatePos(raw.realStart, 'realStart');
    const shadowStart = validatePos(raw.shadowStart, 'shadowStart');
    const realExit = validatePos(raw.realExit, 'realExit');
    const shadowExit = validatePos(raw.shadowExit, 'shadowExit');

    const realWallKeys = new Set<string>();
    const shadowWallKeys = new Set<string>();

    if (!Array.isArray(raw.realWalls)) {
      errors.push({ field: 'realWalls', message: 'realWalls must be an array' });
    } else {
      raw.realWalls.forEach((w, idx) => {
        const pos = validatePos(w, `realWalls[${idx}]`);
        if (pos) {
          const key = GridUtils.toKey(pos);
          if (realWallKeys.has(key)) {
            errors.push({ field: `realWalls[${idx}]`, message: `Duplicate real wall at (${pos.x}, ${pos.y})` });
          }
          realWallKeys.add(key);
        }
      });
    }

    if (!Array.isArray(raw.shadowWalls)) {
      errors.push({ field: 'shadowWalls', message: 'shadowWalls must be an array' });
    } else {
      raw.shadowWalls.forEach((w, idx) => {
        const pos = validatePos(w, `shadowWalls[${idx}]`);
        if (pos) {
          const key = GridUtils.toKey(pos);
          if (shadowWallKeys.has(key)) {
            errors.push({ field: `shadowWalls[${idx}]`, message: `Duplicate shadow wall at (${pos.x}, ${pos.y})` });
          }
          shadowWallKeys.add(key);
        }
      });
    }

    // Ensure starts and exits are not placed inside walls
    if (realStart && realWallKeys.has(GridUtils.toKey(realStart))) {
      errors.push({ field: 'realStart', message: 'realStart cannot be placed inside a wall' });
    }
    if (shadowStart && shadowWallKeys.has(GridUtils.toKey(shadowStart))) {
      errors.push({ field: 'shadowStart', message: 'shadowStart cannot be placed inside a wall' });
    }
    if (realExit && realWallKeys.has(GridUtils.toKey(realExit))) {
      errors.push({ field: 'realExit', message: 'realExit cannot be placed inside a wall' });
    }
    if (shadowExit && shadowWallKeys.has(GridUtils.toKey(shadowExit))) {
      errors.push({ field: 'shadowExit', message: 'shadowExit cannot be placed inside a wall' });
    }

    // Validate doors
    const doorIds = new Set<string>();
    const doorMap = new Map<string, { world: WorldType; position: Position }>();
    if (raw.doors) {
      if (!Array.isArray(raw.doors)) {
        errors.push({ field: 'doors', message: 'doors must be an array if provided' });
      } else {
        raw.doors.forEach((d, idx) => {
          if (!d.id || typeof d.id !== 'string') {
            errors.push({ field: `doors[${idx}].id`, message: 'Door must have a non-empty string id' });
          } else if (doorIds.has(d.id)) {
            errors.push({ field: `doors[${idx}].id`, message: `Duplicate door id "${d.id}"` });
          } else {
            doorIds.add(d.id);
          }

          if (d.world !== 'real' && d.world !== 'shadow') {
            errors.push({ field: `doors[${idx}].world`, message: 'Door world must be "real" or "shadow"' });
          }

          const pos = validatePos(d.position, `doors[${idx}].position`);
          if (pos && d.id) {
            doorMap.set(d.id, { world: d.world, position: pos });
          }
        });
      }
    }

    // Validate switches
    const switchIds = new Set<string>();
    if (raw.switches) {
      if (!Array.isArray(raw.switches)) {
        errors.push({ field: 'switches', message: 'switches must be an array if provided' });
      } else {
        raw.switches.forEach((s, idx) => {
          if (!s.id || typeof s.id !== 'string') {
            errors.push({ field: `switches[${idx}].id`, message: 'Switch must have a non-empty string id' });
          } else if (switchIds.has(s.id)) {
            errors.push({ field: `switches[${idx}].id`, message: `Duplicate switch id "${s.id}"` });
          } else {
            switchIds.add(s.id);
          }

          if (s.world !== 'real' && s.world !== 'shadow') {
            errors.push({ field: `switches[${idx}].world`, message: 'Switch world must be "real" or "shadow"' });
          }

          if (!s.targetDoorId || !doorIds.has(s.targetDoorId)) {
            errors.push({
              field: `switches[${idx}].targetDoorId`,
              message: `Switch "${s.id}" targets nonexistent door "${s.targetDoorId}"`,
            });
          }

          validatePos(s.position, `switches[${idx}].position`);
        });
      }
    }

    // Validate pressure plates
    const plateIds = new Set<string>();
    if (raw.pressurePlates) {
      if (!Array.isArray(raw.pressurePlates)) {
        errors.push({ field: 'pressurePlates', message: 'pressurePlates must be an array if provided' });
      } else {
        raw.pressurePlates.forEach((p, idx) => {
          if (!p.id || typeof p.id !== 'string') {
            errors.push({ field: `pressurePlates[${idx}].id`, message: 'Pressure plate must have a non-empty string id' });
          } else if (plateIds.has(p.id)) {
            errors.push({ field: `pressurePlates[${idx}].id`, message: `Duplicate pressure plate id "${p.id}"` });
          } else {
            plateIds.add(p.id);
          }

          if (p.world !== 'real' && p.world !== 'shadow') {
            errors.push({ field: `pressurePlates[${idx}].world`, message: 'Pressure plate world must be "real" or "shadow"' });
          }

          if (!p.targetDoorId || !doorIds.has(p.targetDoorId)) {
            errors.push({
              field: `pressurePlates[${idx}].targetDoorId`,
              message: `Pressure plate "${p.id}" targets nonexistent door "${p.targetDoorId}"`,
            });
          }

          validatePos(p.position, `pressurePlates[${idx}].position`);
        });
      }
    }

    // Validate hazards
    const hazardIds = new Set<string>();
    if (raw.hazards) {
      if (!Array.isArray(raw.hazards)) {
        errors.push({ field: 'hazards', message: 'hazards must be an array if provided' });
      } else {
        raw.hazards.forEach((h, idx) => {
          if (!h.id || typeof h.id !== 'string') {
            errors.push({ field: `hazards[${idx}].id`, message: 'Hazard must have a non-empty string id' });
          } else if (hazardIds.has(h.id)) {
            errors.push({ field: `hazards[${idx}].id`, message: `Duplicate hazard id "${h.id}"` });
          } else {
            hazardIds.add(h.id);
          }

          if (h.world !== 'real' && h.world !== 'shadow') {
            errors.push({ field: `hazards[${idx}].world`, message: 'Hazard world must be "real" or "shadow"' });
          }

          validatePos(h.position, `hazards[${idx}].position`);
        });
      }
    }

    // Validate checkpoints
    const checkpointIds = new Set<string>();
    if (raw.checkpoints) {
      if (!Array.isArray(raw.checkpoints)) {
        errors.push({ field: 'checkpoints', message: 'checkpoints must be an array if provided' });
      } else {
        raw.checkpoints.forEach((c, idx) => {
          if (!c.id || typeof c.id !== 'string') {
            errors.push({ field: `checkpoints[${idx}].id`, message: 'Checkpoint must have a non-empty string id' });
          } else if (checkpointIds.has(c.id)) {
            errors.push({ field: `checkpoints[${idx}].id`, message: `Duplicate checkpoint id "${c.id}"` });
          } else {
            checkpointIds.add(c.id);
          }

          const rPos = validatePos(c.realPosition, `checkpoints[${idx}].realPosition`);
          const sPos = validatePos(c.shadowPosition, `checkpoints[${idx}].shadowPosition`);

          if (rPos && realWallKeys.has(GridUtils.toKey(rPos))) {
            errors.push({ field: `checkpoints[${idx}].realPosition`, message: 'Checkpoint cannot be inside a real wall' });
          }
          if (sPos && shadowWallKeys.has(GridUtils.toKey(sPos))) {
            errors.push({ field: `checkpoints[${idx}].shadowPosition`, message: 'Checkpoint cannot be inside a shadow wall' });
          }
        });
      }
    }

    if (errors.length > 0) {
      throw new Error(`Level validation failed:\n${errors.map((e) => `  - ${e.field}: ${e.message}`).join('\n')}`);
    }

    return raw as LevelData;
  }
}
