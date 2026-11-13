import { GridPosition, GridPoint } from '../grid/GridPosition';
import { Door } from './Door';
import { Switch } from './Switch';
import { PressurePlate } from './PressurePlate';
import { Bomb } from './Bomb';
import { DestructibleWall } from './DestructibleWall';
import { Portal } from './Portal';
import { MovingHazard } from './MovingHazard';
import { CollapsingFloor } from './CollapsingFloor';
import { LaserEmitter, LaserReceiver, LaserMirror, LaserSimulationResult, BeamSegment } from './Laser';
import { TimeLock } from './TimeLock';
import { MovableBlock, MagneticField } from './Magnetic';
import { MoveDirection } from '../engine/MovementEngine';

export interface ExplosionResult {
  readonly detonated: boolean;
  readonly detonatedBombIds: readonly string[];
  readonly lethal: boolean;
  readonly blastCoordinates: readonly { world: 'real' | 'shadow'; pos: GridPoint }[];
  readonly destroyedWallIds: readonly string[];
}

export interface PuzzleManagerConfig {
  readonly doors?: readonly Door[];
  readonly switches?: readonly Switch[];
  readonly pressurePlates?: readonly PressurePlate[];
  readonly bombs?: readonly Bomb[];
  readonly destructibleWalls?: readonly DestructibleWall[];
  readonly portals?: readonly Portal[];
  readonly movingHazards?: readonly MovingHazard[];
  readonly collapsingFloors?: readonly CollapsingFloor[];
  readonly laserEmitters?: readonly LaserEmitter[];
  readonly laserReceivers?: readonly LaserReceiver[];
  readonly laserMirrors?: readonly LaserMirror[];
  readonly timeLocks?: readonly TimeLock[];
  readonly movableBlocks?: readonly MovableBlock[];
  readonly magneticFields?: readonly MagneticField[];
  readonly isWall?: (world: 'real' | 'shadow', pos: GridPosition) => boolean;
}

function getDirDelta(dir: MoveDirection): GridPoint {
  switch (dir) {
    case 'up': return new GridPoint(0, -1);
    case 'right': return new GridPoint(1, 0);
    case 'down': return new GridPoint(0, 1);
    case 'left': return new GridPoint(-1, 0);
  }
}

export class PuzzleManager {
  private readonly doors: Map<string, Door> = new Map();
  private readonly switches: Map<string, Switch> = new Map();
  private readonly pressurePlates: Map<string, PressurePlate> = new Map();
  private readonly bombs: Map<string, Bomb> = new Map();
  private readonly destructibleWalls: Map<string, DestructibleWall> = new Map();
  private readonly portals: Map<string, Portal> = new Map();
  private readonly movingHazards: Map<string, MovingHazard> = new Map();
  private readonly collapsingFloors: Map<string, CollapsingFloor> = new Map();
  private readonly laserEmitters: Map<string, LaserEmitter> = new Map();
  private readonly laserReceivers: Map<string, LaserReceiver> = new Map();
  private readonly laserMirrors: Map<string, LaserMirror> = new Map();
  private readonly timeLocks: Map<string, TimeLock> = new Map();
  private readonly movableBlocks: Map<string, MovableBlock> = new Map();
  private readonly magneticFields: Map<string, MagneticField> = new Map();
  private readonly isWall?: (world: 'real' | 'shadow', pos: GridPosition) => boolean;

  // Mapping from doorId to linked switches and plates
  private readonly doorSwitches: Map<string, Switch[]> = new Map();
  private readonly doorPlates: Map<string, PressurePlate[]> = new Map();

  constructor(config: PuzzleManagerConfig = {}) {
    this.isWall = config.isWall;
    const objectIds = new Set<string>();

    for (const door of config.doors ?? []) {
      if (objectIds.has(door.id)) {
        throw new Error(`Duplicate puzzle object ID detected: "${door.id}"`);
      }
      objectIds.add(door.id);
      this.doors.set(door.id, door);
      this.doorSwitches.set(door.id, []);
      this.doorPlates.set(door.id, []);
    }

    for (const b of config.bombs ?? []) {
      if (objectIds.has(b.id)) {
        throw new Error(`Duplicate puzzle object ID detected: "${b.id}"`);
      }
      objectIds.add(b.id);
      this.bombs.set(b.id, b);
    }

    for (const dw of config.destructibleWalls ?? []) {
      if (objectIds.has(dw.id)) {
        throw new Error(`Duplicate puzzle object ID detected: "${dw.id}"`);
      }
      objectIds.add(dw.id);
      this.destructibleWalls.set(dw.id, dw);
    }

    for (const p of config.portals ?? []) {
      if (objectIds.has(p.id)) {
        throw new Error(`Duplicate puzzle object ID detected: "${p.id}"`);
      }
      objectIds.add(p.id);
      this.portals.set(p.id, p);
    }

    for (const mh of config.movingHazards ?? []) {
      if (objectIds.has(mh.id)) {
        throw new Error(`Duplicate puzzle object ID detected: "${mh.id}"`);
      }
      objectIds.add(mh.id);
      this.movingHazards.set(mh.id, mh);
    }

    for (const cf of config.collapsingFloors ?? []) {
      if (objectIds.has(cf.id)) {
        throw new Error(`Duplicate puzzle object ID detected: "${cf.id}"`);
      }
      objectIds.add(cf.id);
      this.collapsingFloors.set(cf.id, cf);
    }

    for (const em of config.laserEmitters ?? []) {
      if (objectIds.has(em.id)) {
        throw new Error(`Duplicate puzzle object ID detected: "${em.id}"`);
      }
      objectIds.add(em.id);
      this.laserEmitters.set(em.id, em);
    }

    for (const rx of config.laserReceivers ?? []) {
      if (objectIds.has(rx.id)) {
        throw new Error(`Duplicate puzzle object ID detected: "${rx.id}"`);
      }
      objectIds.add(rx.id);
      this.laserReceivers.set(rx.id, rx);
    }

    for (const lm of config.laserMirrors ?? []) {
      if (objectIds.has(lm.id)) {
        throw new Error(`Duplicate puzzle object ID detected: "${lm.id}"`);
      }
      objectIds.add(lm.id);
      this.laserMirrors.set(lm.id, lm);
    }

    for (const tl of config.timeLocks ?? []) {
      if (objectIds.has(tl.id)) {
        throw new Error(`Duplicate puzzle object ID detected: "${tl.id}"`);
      }
      objectIds.add(tl.id);
      this.timeLocks.set(tl.id, tl);
    }

    for (const mb of config.movableBlocks ?? []) {
      if (objectIds.has(mb.id)) {
        throw new Error(`Duplicate puzzle object ID detected: "${mb.id}"`);
      }
      objectIds.add(mb.id);
      this.movableBlocks.set(mb.id, mb);
    }

    for (const mf of config.magneticFields ?? []) {
      if (objectIds.has(mf.id)) {
        throw new Error(`Duplicate puzzle object ID detected: "${mf.id}"`);
      }
      objectIds.add(mf.id);
      this.magneticFields.set(mf.id, mf);
    }

    for (const sw of config.switches ?? []) {
      if (objectIds.has(sw.id)) {
        throw new Error(`Duplicate puzzle object ID detected: "${sw.id}"`);
      }
      objectIds.add(sw.id);
      const targetsDoor = this.doors.has(sw.linkedDoorId);
      const targetsBomb = this.bombs.has(sw.linkedDoorId);
      const targetsMirror = this.laserMirrors.has(sw.linkedDoorId);
      const targetsEmitter = this.laserEmitters.has(sw.linkedDoorId);
      const targetsMagnet = this.magneticFields.has(sw.linkedDoorId);
      if (
        !targetsDoor &&
        !targetsBomb &&
        !targetsMirror &&
        !targetsEmitter &&
        !targetsMagnet &&
        sw.linkedDoorId !== 'none'
      ) {
        throw new Error(
          `Switch "${sw.id}" targets nonexistent door or bomb "${sw.linkedDoorId}"`
        );
      }
      this.switches.set(sw.id, sw);
      if (targetsDoor) {
        this.doorSwitches.get(sw.linkedDoorId)!.push(sw);
      }
    }

    for (const plate of config.pressurePlates ?? []) {
      if (objectIds.has(plate.id)) {
        throw new Error(`Duplicate puzzle object ID detected: "${plate.id}"`);
      }
      objectIds.add(plate.id);
      if (!this.doors.has(plate.linkedDoorId)) {
        throw new Error(`Pressure plate "${plate.id}" targets nonexistent door "${plate.linkedDoorId}"`);
      }
      this.pressurePlates.set(plate.id, plate);
      this.doorPlates.get(plate.linkedDoorId)!.push(plate);
    }

    // Require an explicit activation rule for multi-switch doors!
    for (const [doorId, linkedSwitches] of this.doorSwitches.entries()) {
      if (linkedSwitches.length > 1) {
        const door = this.doors.get(doorId)!;
        if (door.activationRule !== 'ALL' && door.activationRule !== 'ANY') {
          throw new Error(
            `Door "${doorId}" is controlled by ${linkedSwitches.length} switches and requires an explicit activation rule ('ALL' or 'ANY').`
          );
        }
      }
    }

    // Evaluate initial door states based on initial trigger positions
    this.recalculateAllDoors();
  }

  public getDoor(id: string): Door | null {
    return this.doors.get(id) ?? null;
  }

  public getDoorAt(world: 'real' | 'shadow', pos: GridPosition): Door | null {
    for (const door of this.doors.values()) {
      if (door.world === world && door.position.equals(pos)) {
        return door;
      }
    }
    return null;
  }

  public getSwitch(id: string): Switch | null {
    return this.switches.get(id) ?? null;
  }

  public getSwitchAt(world: 'real' | 'shadow', pos: GridPosition): Switch | null {
    for (const sw of this.switches.values()) {
      if (sw.world === world && sw.position.equals(pos)) {
        return sw;
      }
    }
    return null;
  }

  public getPressurePlate(id: string): PressurePlate | null {
    return this.pressurePlates.get(id) ?? null;
  }

  public getPressurePlateAt(world: 'real' | 'shadow', pos: GridPosition): PressurePlate | null {
    for (const plate of this.pressurePlates.values()) {
      if (plate.world === world && plate.position.equals(pos)) {
        return plate;
      }
    }
    return null;
  }

  public getAllDoors(): readonly Door[] {
    return Array.from(this.doors.values());
  }

  public getAllSwitches(): readonly Switch[] {
    return Array.from(this.switches.values());
  }

  public getAllPressurePlates(): readonly PressurePlate[] {
    return Array.from(this.pressurePlates.values());
  }

  public getBomb(id: string): Bomb | null {
    return this.bombs.get(id) ?? null;
  }

  public getBombAt(world: 'real' | 'shadow', pos: GridPosition): Bomb | null {
    for (const b of this.bombs.values()) {
      if (b.world === world && b.position.equals(pos) && !b.isDetonated) {
        return b;
      }
    }
    return null;
  }

  public getAllBombs(): readonly Bomb[] {
    return Array.from(this.bombs.values());
  }

  public getDestructibleWall(id: string): DestructibleWall | null {
    return this.destructibleWalls.get(id) ?? null;
  }

  public getDestructibleWallAt(world: 'real' | 'shadow', pos: GridPosition): DestructibleWall | null {
    for (const dw of this.destructibleWalls.values()) {
      if (dw.world === world && dw.position.equals(pos)) {
        return dw;
      }
    }
    return null;
  }

  public getAllDestructibleWalls(): readonly DestructibleWall[] {
    return Array.from(this.destructibleWalls.values());
  }

  public getPortal(id: string): Portal | null {
    return this.portals.get(id) ?? null;
  }

  public getPortalAt(world: 'real' | 'shadow', pos: GridPosition): Portal | null {
    for (const p of this.portals.values()) {
      if (p.world === world && p.position.equals(pos) && p.isActive) {
        return p;
      }
    }
    return null;
  }

  public getAllPortals(): readonly Portal[] {
    return Array.from(this.portals.values());
  }

  public getMovingHazard(id: string): MovingHazard | null {
    return this.movingHazards.get(id) ?? null;
  }

  public getAllMovingHazards(): readonly MovingHazard[] {
    return Array.from(this.movingHazards.values());
  }

  public getMovingHazardAt(world: 'real' | 'shadow', pos: GridPosition): MovingHazard | null {
    for (const mh of this.movingHazards.values()) {
      if (mh.world === world && mh.position.equals(pos)) {
        return mh;
      }
    }
    return null;
  }

  public isHazardFrozen(hazardId: string): boolean {
    for (const tl of this.timeLocks.values()) {
      if (tl.isActive) {
        if (!tl.targetHazardIds || tl.targetHazardIds.length === 0 || tl.targetHazardIds.includes(hazardId)) {
          return true;
        }
      }
    }
    return false;
  }

  public tickTimeLocks(): void {
    for (const tl of this.timeLocks.values()) {
      tl.tick();
    }
    this.recalculateAllDoors();
  }

  public getAllTimeLocks(): readonly TimeLock[] {
    return Array.from(this.timeLocks.values());
  }

  public getTimeLock(id: string): TimeLock | null {
    return this.timeLocks.get(id) ?? null;
  }

  public getTimeLockAt(world: 'real' | 'shadow', pos: GridPosition): TimeLock | null {
    for (const tl of this.timeLocks.values()) {
      if (tl.world === world && tl.position.equals(pos)) {
        return tl;
      }
    }
    return null;
  }

  public getAllMovableBlocks(): readonly MovableBlock[] {
    return Array.from(this.movableBlocks.values());
  }

  public getMovableBlock(id: string): MovableBlock | null {
    return this.movableBlocks.get(id) ?? null;
  }

  public getMovableBlockAt(world: 'real' | 'shadow', pos: GridPosition): MovableBlock | null {
    for (const mb of this.movableBlocks.values()) {
      if (mb.world === world && mb.position.equals(pos)) {
        return mb;
      }
    }
    return null;
  }

  public getAllMagneticFields(): readonly MagneticField[] {
    return Array.from(this.magneticFields.values());
  }

  public getMagneticField(id: string): MagneticField | null {
    return this.magneticFields.get(id) ?? null;
  }

  public getMagneticFieldAt(world: 'real' | 'shadow', pos: GridPosition): MagneticField | null {
    for (const mf of this.magneticFields.values()) {
      if (mf.world === world && mf.position.equals(pos)) {
        return mf;
      }
    }
    return null;
  }

  public simulateMagneticFields(playerPos?: GridPosition, shadowPos?: GridPosition): void {
    for (const mf of this.magneticFields.values()) {
      if (!mf.isActive) continue;

      const delta = getDirDelta(mf.direction);
      let curr = mf.position.clone();

      for (let step = 1; step <= mf.range; step++) {
        const next = new GridPoint(curr.x + delta.x, curr.y + delta.y);
        if (next.x < 0 || next.x > 15 || next.y < 0 || next.y > 15) break;

        // Stop at walls or closed doors
        if (this.isWall && this.isWall(mf.world, next)) break;
        const door = this.getDoorAt(mf.world, next);
        if (door && !door.isOpen) break;

        // Check if there is a MovableBlock
        const block = this.getMovableBlockAt(mf.world, next);
        if (block) {
          let moveDelta: GridPoint;
          if (mf.polarity === 'ATTRACT') {
            moveDelta = new GridPoint(-delta.x, -delta.y);
          } else {
            moveDelta = delta;
          }

          const target = new GridPoint(block.position.x + moveDelta.x, block.position.y + moveDelta.y);
          if (target.equals(mf.position)) {
            // Block is pulled directly against the magnet; cannot enter inside the magnet
            break;
          }
          const inBounds = target.x >= 0 && target.x < 16 && target.y >= 0 && target.y < 16;
          const isTargetWall = this.isWall ? this.isWall(block.world, target) : false;
          const targetDoor = this.getDoorAt(block.world, target);
          const isTargetDoorClosed = targetDoor && !targetDoor.isOpen;
          const isTargetOtherBlock = this.getMovableBlockAt(block.world, target) !== null;
          const isTargetPlayer = block.world === 'real' && playerPos && target.equals(playerPos);
          const isTargetShadow = block.world === 'shadow' && shadowPos && target.equals(shadowPos);

          if (
            inBounds &&
            !isTargetWall &&
            !isTargetDoorClosed &&
            !isTargetOtherBlock &&
            !isTargetPlayer &&
            !isTargetShadow
          ) {
            block.setPosition(target);
          }
          break;
        }

        curr = next;
      }
    }
  }

  public advanceMovingHazards(
    playerOld: GridPoint,
    playerNew: GridPoint,
    shadowOld: GridPoint,
    shadowNew: GridPoint
  ): boolean {
    let lethal = false;

    for (const mh of this.movingHazards.values()) {
      const frozen = this.isHazardFrozen(mh.id);
      const sawOld = mh.position.clone();
      const sawNew = frozen ? sawOld : mh.advance();

      if (mh.world === 'real') {
        if (sawNew.equals(playerNew) || (!frozen && sawOld.equals(playerNew) && sawNew.equals(playerOld))) {
          lethal = true;
        }
      } else {
        if (sawNew.equals(shadowNew) || (!frozen && sawOld.equals(shadowNew) && sawNew.equals(shadowOld))) {
          lethal = true;
        }
      }
    }

    return lethal;
  }

  public getCollapsingFloor(id: string): CollapsingFloor | null {
    return this.collapsingFloors.get(id) ?? null;
  }

  public getAllCollapsingFloors(): readonly CollapsingFloor[] {
    return Array.from(this.collapsingFloors.values());
  }

  public getCollapsingFloorAt(world: 'real' | 'shadow', pos: GridPosition): CollapsingFloor | null {
    for (const cf of this.collapsingFloors.values()) {
      if (cf.world === world && cf.position.equals(pos)) {
        return cf;
      }
    }
    return null;
  }

  public isCollapsingFloorCollapsed(world: 'real' | 'shadow', pos: GridPosition): boolean {
    const cf = this.getCollapsingFloorAt(world, pos);
    return !!cf?.isCollapsed;
  }

  public updateCollapsingFloors(playerPos: GridPosition, shadowPos: GridPosition): void {
    for (const cf of this.collapsingFloors.values()) {
      const isOccupied =
        (cf.world === 'real' && cf.position.equals(playerPos)) ||
        (cf.world === 'shadow' && cf.position.equals(shadowPos));
      cf.updateOccupancy(isOccupied);
    }
  }

  public getAllLaserEmitters(): readonly LaserEmitter[] {
    return Array.from(this.laserEmitters.values());
  }

  public getLaserEmitter(id: string): LaserEmitter | null {
    return this.laserEmitters.get(id) ?? null;
  }

  public getLaserEmitterAt(world: 'real' | 'shadow', pos: GridPosition): LaserEmitter | null {
    for (const em of this.laserEmitters.values()) {
      if (em.world === world && em.position.equals(pos)) {
        return em;
      }
    }
    return null;
  }

  public getAllLaserReceivers(): readonly LaserReceiver[] {
    return Array.from(this.laserReceivers.values());
  }

  public getLaserReceiver(id: string): LaserReceiver | null {
    return this.laserReceivers.get(id) ?? null;
  }

  public getLaserReceiverAt(world: 'real' | 'shadow', pos: GridPosition): LaserReceiver | null {
    for (const rx of this.laserReceivers.values()) {
      if (rx.world === world && rx.position.equals(pos)) {
        return rx;
      }
    }
    return null;
  }

  public getAllLaserMirrors(): readonly LaserMirror[] {
    return Array.from(this.laserMirrors.values());
  }

  public getLaserMirror(id: string): LaserMirror | null {
    return this.laserMirrors.get(id) ?? null;
  }

  public getLaserMirrorAt(world: 'real' | 'shadow', pos: GridPosition): LaserMirror | null {
    for (const lm of this.laserMirrors.values()) {
      if (lm.world === world && lm.position.equals(pos)) {
        return lm;
      }
    }
    return null;
  }

  public simulateLasers(playerPos?: GridPoint, shadowPos?: GridPoint): LaserSimulationResult {
    let beamSegments: BeamSegment[] = [];
    let lethalTiles = new Set<string>();
    let poweredReceiverIds = new Set<string>();

    for (let pass = 0; pass < 2; pass++) {
      beamSegments = [];
      lethalTiles = new Set<string>();
      poweredReceiverIds = new Set<string>();

      for (const rx of this.laserReceivers.values()) {
        rx.setPowered(false);
      }

      for (const emitter of this.laserEmitters.values()) {
        if (!emitter.isActive) continue;

        const currWorld = emitter.world;
        let currPos = emitter.position.clone();
        let currDir = emitter.direction;
        const visited = new Set<string>();

        while (true) {
          const stateKey = `${currWorld}:${currPos.x}:${currPos.y}:${currDir}`;
          if (visited.has(stateKey)) break;
          visited.add(stateKey);

          const delta = getDirDelta(currDir);
          const nextPos = new GridPoint(currPos.x + delta.x, currPos.y + delta.y);

          // Check bounds
          if (nextPos.x < 0 || nextPos.x > 15 || nextPos.y < 0 || nextPos.y > 15) {
            break;
          }

          // Check walls
          if (this.isWall && this.isWall(currWorld, nextPos)) {
            beamSegments.push({ from: currPos.clone(), to: nextPos.clone(), world: currWorld });
            break;
          }

          // Check door blocking
          const door = this.getDoorAt(currWorld, nextPos);
          if (door && !door.isOpen) {
            beamSegments.push({ from: currPos.clone(), to: nextPos.clone(), world: currWorld });
            break;
          }

          // Check destructible wall blocking
          const dw = this.getDestructibleWallAt(currWorld, nextPos);
          if (dw && !dw.isDestroyed) {
            beamSegments.push({ from: currPos.clone(), to: nextPos.clone(), world: currWorld });
            break;
          }

          // Check mirror
          const mirror = this.getLaserMirrorAt(currWorld, nextPos);
          if (mirror) {
            beamSegments.push({ from: currPos.clone(), to: nextPos.clone(), world: currWorld });
            const reflectedDir = mirror.reflect(currDir);
            if (!reflectedDir) break;
            currPos = nextPos;
            currDir = reflectedDir;
            continue;
          }

          // Check receiver
          const receiver = this.getLaserReceiverAt(currWorld, nextPos);
          if (receiver) {
            receiver.setPowered(true);
            poweredReceiverIds.add(receiver.id);
            beamSegments.push({ from: currPos.clone(), to: nextPos.clone(), world: currWorld });
            break;
          }

          // Check other emitter
          const otherEmitter = this.getLaserEmitterAt(currWorld, nextPos);
          if (otherEmitter) {
            beamSegments.push({ from: currPos.clone(), to: nextPos.clone(), world: currWorld });
            break;
          }

          // Beam traverses nextPos
          beamSegments.push({ from: currPos.clone(), to: nextPos.clone(), world: currWorld });
          lethalTiles.add(`${currWorld}:${nextPos.x}:${nextPos.y}`);

          // Check character hit (terminates beam)
          if (currWorld === 'real' && playerPos && nextPos.equals(playerPos)) {
            break;
          }
          if (currWorld === 'shadow' && shadowPos && nextPos.equals(shadowPos)) {
            break;
          }

          currPos = nextPos;
        }
      }

      for (const rx of this.laserReceivers.values()) {
        const mf = this.magneticFields.get(rx.linkedDoorId);
        if (mf) {
          mf.setActive(rx.isPowered);
        }
      }

      this.recalculateAllDoors();
    }

    return {
      beamSegments,
      lethalTiles,
      poweredReceiverIds,
    };
  }

  public isLaserLethalAt(
    world: 'real' | 'shadow',
    pos: GridPosition,
    playerPos?: GridPoint,
    shadowPos?: GridPoint
  ): boolean {
    const sim = this.simulateLasers(playerPos, shadowPos);
    return sim.lethalTiles.has(`${world}:${pos.x}:${pos.y}`);
  }

  /**
   * Ticks active bombs and executes detonations, chain reactions, wall destruction,
   * and lethality checking against character positions.
   */
  public tickBombs(playerPos: GridPosition, shadowPos: GridPosition): ExplosionResult {
    const detonatedBombs: Bomb[] = [];

    for (const b of this.bombs.values()) {
      if (b.isActive && !b.isDetonated) {
        const justDetonated = b.tick();
        if (justDetonated) {
          detonatedBombs.push(b);
        }
      }
    }

    if (detonatedBombs.length === 0) {
      return {
        detonated: false,
        detonatedBombIds: [],
        lethal: false,
        blastCoordinates: [],
        destroyedWallIds: [],
      };
    }

    // Process all detonations including chain reactions
    const processedBombIds = new Set<string>();
    const blastCoordinates: { world: 'real' | 'shadow'; pos: GridPoint }[] = [];
    const destroyedWallIds: string[] = [];
    let lethal = false;

    const queue = [...detonatedBombs];
    while (queue.length > 0) {
      const currentBomb = queue.shift()!;
      if (processedBombIds.has(currentBomb.id)) continue;
      processedBombIds.add(currentBomb.id);

      const blastPoints = currentBomb.getBlastCoordinates();
      const targetWorlds: ('real' | 'shadow')[] = currentBomb.crossWorld
        ? ['real', 'shadow']
        : [currentBomb.world];

      for (const w of targetWorlds) {
        for (const pt of blastPoints) {
          blastCoordinates.push({ world: w, pos: pt });

          // Destroy destructible walls
          const wall = this.getDestructibleWallAt(w, pt);
          if (wall && !wall.isDestroyed) {
            wall.destroy();
            destroyedWallIds.push(wall.id);
          }

          // Chain reaction: ignite/detonate any other bomb in blast
          const otherBomb = this.getBombAt(w, pt);
          if (otherBomb && otherBomb.id !== currentBomb.id && !otherBomb.isDetonated) {
            otherBomb.forceDetonate();
            queue.push(otherBomb);
          }

          // Check if Real player is caught
          if (w === 'real' && pt.equals(playerPos)) {
            lethal = true;
          }

          // Check if Shadow player is caught
          if (w === 'shadow' && pt.equals(shadowPos)) {
            lethal = true;
          }
        }
      }
    }

    return {
      detonated: true,
      detonatedBombIds: Array.from(processedBombIds),
      lethal,
      blastCoordinates,
      destroyedWallIds,
    };
  }

  /**
   * Called during a movement transaction when a character transitions from oldPos to newPos.
   * Activates switch or bomb if character enters its cell.
   */
  public onCharacterMove(
    world: 'real' | 'shadow',
    oldPos: GridPosition,
    newPos: GridPosition
  ): void {
    // 1. Process Switches: activate when character ENTERS the cell
    for (const sw of this.switches.values()) {
      if (sw.world === world) {
        const wasOnSwitch = sw.position.equals(oldPos);
        const isOnSwitch = sw.position.equals(newPos);

        if (!wasOnSwitch && isOnSwitch) {
          sw.onEnter();
          const linkedBomb = this.bombs.get(sw.linkedDoorId);
          if (linkedBomb) {
            linkedBomb.activate();
          }
          for (const portal of this.portals.values()) {
            if (portal.linkedSwitchId === sw.id) {
              portal.setActive(sw.isActive);
            }
          }
          for (const mirror of this.laserMirrors.values()) {
            if (mirror.linkedSwitchId === sw.id) {
              mirror.rotate();
            }
          }
          for (const emitter of this.laserEmitters.values()) {
            if (emitter.linkedSwitchId === sw.id) {
              emitter.setActive(!emitter.isActive);
            }
          }
          for (const mf of this.magneticFields.values()) {
            if (mf.linkedSwitchId === sw.id) {
              mf.toggle();
            }
          }
        }
      }
    }

    // 2. Process Bombs: activate if stepped on and triggerType is 'STEP'
    for (const b of this.bombs.values()) {
      if (b.world === world && b.triggerType === 'STEP') {
        const wasOnBomb = b.position.equals(oldPos);
        const isOnBomb = b.position.equals(newPos);
        if (!wasOnBomb && isOnBomb) {
          b.activate();
        }
      }
    }

    // 2b. Process Time Locks: activate when entered
    for (const tl of this.timeLocks.values()) {
      if (tl.world === world) {
        const wasOnTl = tl.position.equals(oldPos);
        const isOnTl = tl.position.equals(newPos);
        if (!wasOnTl && isOnTl) {
          tl.activate();
        }
      }
    }

    // 3. Recalculate puzzle state
    this.recalculateAllDoors();
  }

  /**
   * Evaluates occupancy of pressure plates based on committed character positions.
   */
  public evaluatePressurePlates(playerPos: GridPosition, shadowPos: GridPosition): void {
    for (const plate of this.pressurePlates.values()) {
      const isOccupiedByChar =
        (plate.world === 'real' && plate.position.equals(playerPos)) ||
        (plate.world === 'shadow' && plate.position.equals(shadowPos));
      const isOccupiedByBlock = Array.from(this.movableBlocks.values()).some(
        (b) => b.world === plate.world && b.position.equals(plate.position)
      );

      plate.setPressed(isOccupiedByChar || isOccupiedByBlock);
    }

    this.recalculateAllDoors();
  }

  /**
   * Checks if a closed door blocks movement from `fromPos` to `targetPos`.
   * If a character is already standing inside a door cell when it closes,
   * they are permitted to LEAVE that cell.
   */
  public isDoorBlocking(
    world: 'real' | 'shadow',
    fromPos: GridPosition,
    targetPos: GridPosition
  ): boolean {
    for (const door of this.doors.values()) {
      if (door.world === world && door.position.equals(targetPos)) {
        // If the door is open, it allows entry
        if (door.isOpen) {
          return false;
        }

        // Closed door:
        // A character already occupying the door cell must be able to leave after it closes
        if (door.position.equals(fromPos)) {
          // Exiting the closed door is permitted!
          return false;
        }

        // Entering a closed door from outside is blocked
        return true;
      }
    }

    return false;
  }

  /**
   * Explicitly recalculates door states based on linked switches and pressure plates.
   */
  public recalculateAllDoors(): void {
    for (const [doorId, door] of this.doors.entries()) {
      const linkedSwitches = this.doorSwitches.get(doorId) ?? [];
      const linkedPlates = this.doorPlates.get(doorId) ?? [];
      const linkedReceivers = Array.from(this.laserReceivers.values()).filter((r) => r.linkedDoorId === doorId);
      const linkedTimeLocks = Array.from(this.timeLocks.values()).filter((t) => t.linkedDoorId === doorId);

      let switchConditionMet = false;

      if (linkedSwitches.length === 1) {
        switchConditionMet = linkedSwitches[0].isActive;
      } else if (linkedSwitches.length > 1) {
        if (door.activationRule === 'ALL') {
          switchConditionMet = linkedSwitches.every((s) => s.isActive);
        } else if (door.activationRule === 'ANY') {
          switchConditionMet = linkedSwitches.some((s) => s.isActive);
        }
      }

      const platePressed = linkedPlates.some((p) => p.isPressed);
      const receiverPowered = linkedReceivers.some((r) => r.isPowered);
      const timeLockActive = linkedTimeLocks.some((t) => t.isActive);

      const hasSwitches = linkedSwitches.length > 0;
      const hasPlates = linkedPlates.length > 0;
      const hasReceivers = linkedReceivers.length > 0;
      const hasTimeLocks = linkedTimeLocks.length > 0;

      if (hasSwitches || hasPlates || hasReceivers || hasTimeLocks) {
        let open = false;
        if (hasSwitches && switchConditionMet) open = true;
        if (hasPlates && platePressed) open = true;
        if (hasReceivers && receiverPowered) open = true;
        if (hasTimeLocks && timeLockActive) open = true;
        door.setOpen(open);
      } else {
        door.setOpen(door.initialOpen);
      }
    }
  }

  /**
   * Resets all puzzle objects to their initial configuration.
   */
  public reset(): void {
    for (const door of this.doors.values()) {
      door.reset();
    }
    for (const sw of this.switches.values()) {
      sw.reset();
    }
    for (const plate of this.pressurePlates.values()) {
      plate.reset();
    }
    for (const bomb of this.bombs.values()) {
      bomb.reset();
    }
    for (const wall of this.destructibleWalls.values()) {
      wall.reset();
    }
    for (const portal of this.portals.values()) {
      portal.reset();
    }
    for (const mh of this.movingHazards.values()) {
      mh.reset();
    }
    for (const cf of this.collapsingFloors.values()) {
      cf.reset();
    }
    for (const emitter of this.laserEmitters.values()) {
      emitter.reset();
    }
    for (const receiver of this.laserReceivers.values()) {
      receiver.reset();
    }
    for (const mirror of this.laserMirrors.values()) {
      mirror.reset();
    }
    for (const tl of this.timeLocks.values()) {
      tl.reset();
    }
    for (const mb of this.movableBlocks.values()) {
      mb.reset();
    }
    for (const mf of this.magneticFields.values()) {
      mf.reset();
    }
    this.recalculateAllDoors();
  }
}
