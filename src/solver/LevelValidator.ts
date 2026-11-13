import { LevelDefinition } from '../types/level';
import { MoveDirection } from '../engine/MovementEngine';
import { LevelFactory, BuiltLevelSession } from '../levels/LevelFactory';
import { GridPoint } from '../grid/GridPosition';

export type Direction = MoveDirection;

export interface SchemaValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface ReplayResult {
  readonly success: boolean;
  readonly died: boolean;
  readonly completed: boolean;
  readonly finalPlayerPos: GridPoint;
  readonly finalShadowPos: GridPoint;
  readonly errorDetails: string | null;
}

export class LevelValidator {
  /**
   * Validates level schema, geometric bounds, wall & hazard collisions with spawns/exits,
   * puzzle object references, and multi-switch rules.
   */
  public static validateSchema(level: LevelDefinition): SchemaValidationResult {
    const errors: string[] = [];

    // 1. Basic properties
    if (typeof level.id !== 'number' || level.id < 1) {
      errors.push(`Level ID must be a positive integer, received: ${level.id}`);
    }
    if (!level.name || level.name.trim().length === 0) {
      errors.push('Level name must be a non-empty string');
    }
    if (!level.chapter || level.chapter.trim().length === 0) {
      errors.push('Level chapter must be a non-empty string');
    }
    if (typeof level.width !== 'number' || level.width < 3) {
      errors.push(`Level width must be >= 3, received: ${level.width}`);
    }
    if (typeof level.height !== 'number' || level.height < 3) {
      errors.push(`Level height must be >= 3, received: ${level.height}`);
    }

    if (errors.length > 0) {
      return { valid: false, errors };
    }

    // 2. Positions and Bounds
    const rStart = GridPoint.from(level.realStart);
    const sStart = GridPoint.from(level.shadowStart);
    const rExit = GridPoint.from(level.realExit);
    const sExit = GridPoint.from(level.shadowExit);

    if (!rStart.isInBounds(level.width, level.height)) {
      errors.push(`realStart (${rStart.x}, ${rStart.y}) is out of bounds for ${level.width}x${level.height}`);
    }
    if (!sStart.isInBounds(level.width, level.height)) {
      errors.push(`shadowStart (${sStart.x}, ${sStart.y}) is out of bounds for ${level.width}x${level.height}`);
    }
    if (!rExit.isInBounds(level.width, level.height)) {
      errors.push(`realExit (${rExit.x}, ${rExit.y}) is out of bounds for ${level.width}x${level.height}`);
    }
    if (!sExit.isInBounds(level.width, level.height)) {
      errors.push(`shadowExit (${sExit.x}, ${sExit.y}) is out of bounds for ${level.width}x${level.height}`);
    }

    if (rStart.equals(rExit)) {
      errors.push('realStart cannot be identical to realExit');
    }
    if (sStart.equals(sExit)) {
      errors.push('shadowStart cannot be identical to shadowExit');
    }

    // 3. Walls
    const rWalls = new Set<string>();
    for (const w of level.realWalls) {
      const pt = GridPoint.from(w);
      if (!pt.isInBounds(level.width, level.height)) {
        errors.push(`realWall (${pt.x}, ${pt.y}) is out of bounds`);
      }
      rWalls.add(pt.toKey());
    }

    const sWalls = new Set<string>();
    for (const w of level.shadowWalls) {
      const pt = GridPoint.from(w);
      if (!pt.isInBounds(level.width, level.height)) {
        errors.push(`shadowWall (${pt.x}, ${pt.y}) is out of bounds`);
      }
      sWalls.add(pt.toKey());
    }

    if (rWalls.has(rStart.toKey())) {
      errors.push(`realStart (${rStart.x}, ${rStart.y}) spawns inside a real wall`);
    }
    if (sWalls.has(sStart.toKey())) {
      errors.push(`shadowStart (${sStart.x}, ${sStart.y}) spawns inside a shadow wall`);
    }
    if (rWalls.has(rExit.toKey())) {
      errors.push(`realExit (${rExit.x}, ${rExit.y}) is blocked by a real wall`);
    }
    if (sWalls.has(sExit.toKey())) {
      errors.push(`shadowExit (${sExit.x}, ${sExit.y}) is blocked by a shadow wall`);
    }

    // 4. Hazards
    const rHazards = new Set<string>();
    const sHazards = new Set<string>();
    for (const hz of level.hazards ?? []) {
      const pt = GridPoint.from(hz.position);
      if (!pt.isInBounds(level.width, level.height)) {
        errors.push(`Hazard "${hz.id}" at (${pt.x}, ${pt.y}) is out of bounds`);
      }
      if (hz.world === 'real') {
        rHazards.add(pt.toKey());
      } else {
        sHazards.add(pt.toKey());
      }
    }

    if (rHazards.has(rStart.toKey())) {
      errors.push(`realStart (${rStart.x}, ${rStart.y}) spawns inside a hazard`);
    }
    if (sHazards.has(sStart.toKey())) {
      errors.push(`shadowStart (${sStart.x}, ${sStart.y}) spawns inside a hazard`);
    }

    // 5. Unique IDs across all puzzle objects
    const objectIds = new Set<string>();
    const doorIds = new Set<string>();
    const bombIds = new Set<string>();
    const magnetIds = new Set<string>();

    for (const d of level.doors ?? []) {
      if (objectIds.has(d.id)) {
        errors.push(`Duplicate puzzle object ID: "${d.id}"`);
      }
      objectIds.add(d.id);
      doorIds.add(d.id);

      const pt = GridPoint.from(d.position);
      if (!pt.isInBounds(level.width, level.height)) {
        errors.push(`Door "${d.id}" at (${pt.x}, ${pt.y}) is out of bounds`);
      }
      if (d.world === 'real' && rStart.equals(pt) && !d.initialOpen) {
        errors.push(`realStart spawns inside closed door "${d.id}"`);
      }
      if (d.world === 'shadow' && sStart.equals(pt) && !d.initialOpen) {
        errors.push(`shadowStart spawns inside closed door "${d.id}"`);
      }
    }

    for (const b of level.bombs ?? []) {
      if (objectIds.has(b.id)) {
        errors.push(`Duplicate puzzle object ID: "${b.id}"`);
      }
      objectIds.add(b.id);
      bombIds.add(b.id);

      const pt = GridPoint.from(b.position);
      if (!pt.isInBounds(level.width, level.height)) {
        errors.push(`Bomb "${b.id}" at (${pt.x}, ${pt.y}) is out of bounds`);
      }
    }

    for (const dw of level.destructibleWalls ?? []) {
      if (objectIds.has(dw.id)) {
        errors.push(`Duplicate puzzle object ID: "${dw.id}"`);
      }
      objectIds.add(dw.id);

      const pt = GridPoint.from(dw.position);
      if (!pt.isInBounds(level.width, level.height)) {
        errors.push(`Destructible wall "${dw.id}" at (${pt.x}, ${pt.y}) is out of bounds`);
      }
    }

    for (const p of level.portals ?? []) {
      if (objectIds.has(p.id)) {
        errors.push(`Duplicate puzzle object ID: "${p.id}"`);
      }
      objectIds.add(p.id);

      const pt = GridPoint.from(p.position);
      if (!pt.isInBounds(level.width, level.height)) {
        errors.push(`Portal "${p.id}" at (${pt.x}, ${pt.y}) is out of bounds`);
      }

      if (p.destinations && p.destinations.length > 0) {
        for (let i = 0; i < p.destinations.length; i++) {
          const dest = GridPoint.from(p.destinations[i].targetPosition);
          if (!dest.isInBounds(level.width, level.height)) {
            errors.push(`Portal "${p.id}" destination[${i}] at (${dest.x}, ${dest.y}) is out of bounds`);
          }
        }
      } else if (p.targetPosition) {
        const targetPt = GridPoint.from(p.targetPosition);
        if (!targetPt.isInBounds(level.width, level.height)) {
          errors.push(`Portal "${p.id}" targetPosition at (${targetPt.x}, ${targetPt.y}) is out of bounds`);
        }
      }
    }

    for (const mh of level.movingHazards ?? []) {
      if (objectIds.has(mh.id)) {
        errors.push(`Duplicate puzzle object ID: "${mh.id}"`);
      }
      objectIds.add(mh.id);

      if (!mh.path || mh.path.length < 2) {
        errors.push(`Moving hazard "${mh.id}" must have at least 2 waypoints`);
      } else {
        for (let i = 0; i < mh.path.length; i++) {
          const pt = GridPoint.from(mh.path[i]);
          if (!pt.isInBounds(level.width, level.height)) {
            errors.push(`Moving hazard "${mh.id}" waypoint[${i}] at (${pt.x}, ${pt.y}) is out of bounds`);
          }
        }
      }
    }

    for (const cf of level.collapsingFloors ?? []) {
      if (objectIds.has(cf.id)) {
        errors.push(`Duplicate puzzle object ID: "${cf.id}"`);
      }
      objectIds.add(cf.id);

      const pt = GridPoint.from(cf.position);
      if (!pt.isInBounds(level.width, level.height)) {
        errors.push(`Collapsing floor "${cf.id}" at (${pt.x}, ${pt.y}) is out of bounds`);
      }
    }

    const emitterIds = new Set<string>();
    for (const le of level.laserEmitters ?? []) {
      if (objectIds.has(le.id)) {
        errors.push(`Duplicate puzzle object ID: "${le.id}"`);
      }
      objectIds.add(le.id);
      emitterIds.add(le.id);

      const pt = GridPoint.from(le.position);
      if (!pt.isInBounds(level.width, level.height)) {
        errors.push(`Laser emitter "${le.id}" at (${pt.x}, ${pt.y}) is out of bounds`);
      }
    }

    const mirrorIds = new Set<string>();
    for (const lm of level.laserMirrors ?? []) {
      if (objectIds.has(lm.id)) {
        errors.push(`Duplicate puzzle object ID: "${lm.id}"`);
      }
      objectIds.add(lm.id);
      mirrorIds.add(lm.id);

      const pt = GridPoint.from(lm.position);
      if (!pt.isInBounds(level.width, level.height)) {
        errors.push(`Laser mirror "${lm.id}" at (${pt.x}, ${pt.y}) is out of bounds`);
      }
      if (lm.orientation !== '/' && lm.orientation !== '\\') {
        errors.push(`Laser mirror "${lm.id}" has invalid orientation: "${lm.orientation}"`);
      }
    }


    for (const mf of level.magneticFields ?? []) {
      if (objectIds.has(mf.id)) {
        errors.push(`Duplicate puzzle object ID: "${mf.id}"`);
      }
      objectIds.add(mf.id);
      magnetIds.add(mf.id);

      const pt = GridPoint.from(mf.position);
      if (!pt.isInBounds(level.width, level.height)) {
        errors.push(`Magnetic field "${mf.id}" at (${pt.x}, ${pt.y}) is out of bounds`);
      }
      if (mf.polarity !== 'ATTRACT' && mf.polarity !== 'REPEL') {
        errors.push(`Magnetic field "${mf.id}" has invalid polarity: "${mf.polarity}"`);
      }
    }

    for (const lr of level.laserReceivers ?? []) {
      if (objectIds.has(lr.id)) {
        errors.push(`Duplicate puzzle object ID: "${lr.id}"`);
      }
      objectIds.add(lr.id);

      const pt = GridPoint.from(lr.position);
      if (!pt.isInBounds(level.width, level.height)) {
        errors.push(`Laser receiver "${lr.id}" at (${pt.x}, ${pt.y}) is out of bounds`);
      }
      if (!doorIds.has(lr.linkedDoorId) && !magnetIds.has(lr.linkedDoorId)) {
        errors.push(`Laser receiver "${lr.id}" targets nonexistent door or magnet "${lr.linkedDoorId}"`);
      }
    }

    for (const tl of level.timeLocks ?? []) {
      if (objectIds.has(tl.id)) {
        errors.push(`Duplicate puzzle object ID: "${tl.id}"`);
      }
      objectIds.add(tl.id);

      const pt = GridPoint.from(tl.position);
      if (!pt.isInBounds(level.width, level.height)) {
        errors.push(`Time lock "${tl.id}" at (${pt.x}, ${pt.y}) is out of bounds`);
      }
      if (tl.duration <= 0) {
        errors.push(`Time lock "${tl.id}" must have duration > 0`);
      }
      if (tl.linkedDoorId && !doorIds.has(tl.linkedDoorId)) {
        errors.push(`Time lock "${tl.id}" targets nonexistent door "${tl.linkedDoorId}"`);
      }
    }

    const blockIds = new Set<string>();
    for (const mb of level.movableBlocks ?? []) {
      if (objectIds.has(mb.id)) {
        errors.push(`Duplicate puzzle object ID: "${mb.id}"`);
      }
      objectIds.add(mb.id);
      blockIds.add(mb.id);

      const pt = GridPoint.from(mb.position);
      if (!pt.isInBounds(level.width, level.height)) {
        errors.push(`Movable block "${mb.id}" at (${pt.x}, ${pt.y}) is out of bounds`);
      }
    }


    const switchCounts = new Map<string, number>();
    for (const sw of level.switches ?? []) {
      if (objectIds.has(sw.id)) {
        errors.push(`Duplicate puzzle object ID: "${sw.id}"`);
      }
      objectIds.add(sw.id);

      const pt = GridPoint.from(sw.position);
      if (!pt.isInBounds(level.width, level.height)) {
        errors.push(`Switch "${sw.id}" at (${pt.x}, ${pt.y}) is out of bounds`);
      }
      if (
        !doorIds.has(sw.linkedDoorId) &&
        !bombIds.has(sw.linkedDoorId) &&
        !mirrorIds.has(sw.linkedDoorId) &&
        !emitterIds.has(sw.linkedDoorId) &&
        !magnetIds.has(sw.linkedDoorId) &&
        sw.linkedDoorId !== 'none'
      ) {
        errors.push(`Switch "${sw.id}" targets nonexistent door, bomb, mirror, emitter, or magnet "${sw.linkedDoorId}"`);
      }

      switchCounts.set(sw.linkedDoorId, (switchCounts.get(sw.linkedDoorId) ?? 0) + 1);
    }

    for (const pl of level.pressurePlates ?? []) {
      if (objectIds.has(pl.id)) {
        errors.push(`Duplicate puzzle object ID: "${pl.id}"`);
      }
      objectIds.add(pl.id);

      const pt = GridPoint.from(pl.position);
      if (!pt.isInBounds(level.width, level.height)) {
        errors.push(`Pressure plate "${pl.id}" at (${pt.x}, ${pt.y}) is out of bounds`);
      }
      if (!doorIds.has(pl.linkedDoorId)) {
        errors.push(`Pressure plate "${pl.id}" targets nonexistent door "${pl.linkedDoorId}"`);
      }
    }

    // Require ALL or ANY rule for doors with >1 controlling switch
    for (const d of level.doors ?? []) {
      const count = switchCounts.get(d.id) ?? 0;
      if (count > 1 && d.activationRule !== 'ALL' && d.activationRule !== 'ANY') {
        errors.push(
          `Door "${d.id}" is controlled by ${count} switches and requires an explicit activationRule ('ALL' or 'ANY')`
        );
      }
    }

    // 6. Checkpoints
    for (const cp of level.checkpoints ?? []) {
      if (objectIds.has(cp.id)) {
        errors.push(`Duplicate puzzle object ID: "${cp.id}"`);
      }
      objectIds.add(cp.id);

      const rPt = GridPoint.from(cp.realPosition);
      const sPt = GridPoint.from(cp.shadowPosition);
      if (!rPt.isInBounds(level.width, level.height)) {
        errors.push(`Checkpoint "${cp.id}" realPosition is out of bounds`);
      }
      if (!sPt.isInBounds(level.width, level.height)) {
        errors.push(`Checkpoint "${cp.id}" shadowPosition is out of bounds`);
      }
      if (rWalls.has(rPt.toKey())) {
        errors.push(`Checkpoint "${cp.id}" realPosition is inside a wall`);
      }
      if (sWalls.has(sPt.toKey())) {
        errors.push(`Checkpoint "${cp.id}" shadowPosition is inside a wall`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Authoritatively replays a movement sequence through the actual game engine rules.
   */
  public static replaySolution(
    level: LevelDefinition,
    moves: readonly Direction[]
  ): ReplayResult {
    let died = false;
    let completed = false;

    let session: BuiltLevelSession;
    try {
      session = LevelFactory.build(level, {
        onDeath: () => {
          died = true;
        },
        onLevelComplete: () => {
          completed = true;
        },
      });
    } catch (err) {
      return {
        success: false,
        died: false,
        completed: false,
        finalPlayerPos: GridPoint.from(level.realStart),
        finalShadowPos: GridPoint.from(level.shadowStart),
        errorDetails: err instanceof Error ? err.message : String(err),
      };
    }

    for (let i = 0; i < moves.length; i++) {
      const dir = moves[i];
      const res = session.turnEngine.handleInput(dir);
      session.turnEngine.endAnimation();

      if (!res) {
        return {
          success: false,
          died,
          completed,
          finalPlayerPos: session.player.position,
          finalShadowPos: session.shadow.position,
          errorDetails: `Move ${i + 1} (${dir}) was rejected by TurnEngine`,
        };
      }

      if (res.hazardTriggered) {
        died = true;
      }
    }

    const success = !died && (completed || session.turnEngine.state === 'COMPLETED');

    return {
      success,
      died,
      completed: completed || session.turnEngine.state === 'COMPLETED',
      finalPlayerPos: session.player.position,
      finalShadowPos: session.shadow.position,
      errorDetails: success ? null : `Replay finished with state=${session.turnEngine.state}, died=${died}`,
    };
  }
}
