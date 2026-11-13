import { LevelDefinition } from '../types/level';
import { WorldGrid } from '../grid/WorldGrid';
import { TileType } from '../grid/TileType';
import { GridPoint } from '../grid/GridPosition';
import { Player } from '../entities/Player';
import { Shadow } from '../entities/Shadow';
import { Door } from '../puzzles/Door';
import { Switch } from './../puzzles/Switch';
import { PressurePlate } from '../puzzles/PressurePlate';
import { CheckpointPair } from '../puzzles/Checkpoint';
import { Bomb } from '../puzzles/Bomb';
import { DestructibleWall } from '../puzzles/DestructibleWall';
import { Portal } from '../puzzles/Portal';
import { MovingHazard } from '../puzzles/MovingHazard';
import { CollapsingFloor } from '../puzzles/CollapsingFloor';
import { LaserEmitter, LaserReceiver, LaserMirror } from '../puzzles/Laser';
import { TimeLock } from '../puzzles/TimeLock';
import { MovableBlock, MagneticField } from '../puzzles/Magnetic';
import { PuzzleManager } from '../puzzles/PuzzleManager';
import { CollisionEngine } from '../engine/CollisionEngine';
import { MovementEngine } from '../engine/MovementEngine';
import { TurnEngine, TurnEvents } from '../engine/TurnEngine';
import { SurpriseEventManager } from '../events/SurpriseEventManager';

export interface BuiltLevelSession {
  readonly definition: LevelDefinition;
  readonly player: Player;
  readonly shadow: Shadow;
  readonly playerGrid: WorldGrid;
  readonly shadowGrid: WorldGrid;
  readonly puzzleManager: PuzzleManager;
  readonly surpriseManager: SurpriseEventManager;
  readonly checkpoints: CheckpointPair[];
  readonly collisionEngine: CollisionEngine;
  readonly movementEngine: MovementEngine;
  readonly turnEngine: TurnEngine;
}

export class LevelFactory {
  public static build(level: LevelDefinition, events?: TurnEvents): BuiltLevelSession {
    const playerGrid = new WorldGrid({ width: level.width, height: level.height });
    const shadowGrid = new WorldGrid({ width: level.width, height: level.height });

    // 1. Walls
    for (const w of level.realWalls) {
      playerGrid.setTileType(w, TileType.WALL);
    }
    for (const w of level.shadowWalls) {
      shadowGrid.setTileType(w, TileType.WALL);
    }

    // 2. Exits
    playerGrid.setTileType(level.realExit, TileType.EXIT);
    shadowGrid.setTileType(level.shadowExit, TileType.EXIT);

    // 3. Doors
    const doors: Door[] = [];
    for (const d of level.doors ?? []) {
      const doorInstance = new Door({
        id: d.id,
        world: d.world,
        position: d.position,
        initialOpen: d.initialOpen,
        activationRule: d.activationRule,
      });
      doors.push(doorInstance);

      const targetGrid = d.world === 'real' ? playerGrid : shadowGrid;
      targetGrid.setCell({
        position: GridPoint.from(d.position),
        tileType: TileType.DOOR,
        door: { id: d.id, isOpen: !!d.initialOpen },
      });
    }

    // 4. Switches
    const switches: Switch[] = [];
    for (const s of level.switches ?? []) {
      const switchInstance = new Switch({
        id: s.id,
        world: s.world,
        position: s.position,
        linkedDoorId: s.linkedDoorId,
        initialActive: s.initialActive,
        activationBehavior: s.activationBehavior,
      });
      switches.push(switchInstance);

      const targetGrid = s.world === 'real' ? playerGrid : shadowGrid;
      targetGrid.setCell({
        position: GridPoint.from(s.position),
        tileType: TileType.SWITCH,
        switch: { id: s.id, targetDoorId: s.linkedDoorId, isActive: !!s.initialActive },
      });
    }

    // 5. Pressure Plates
    const plates: PressurePlate[] = [];
    for (const p of level.pressurePlates ?? []) {
      const plateInstance = new PressurePlate({
        id: p.id,
        world: p.world,
        position: p.position,
        linkedDoorId: p.linkedDoorId,
      });
      plates.push(plateInstance);

      const targetGrid = p.world === 'real' ? playerGrid : shadowGrid;
      targetGrid.setCell({
        position: GridPoint.from(p.position),
        tileType: TileType.PRESSURE_PLATE,
        pressurePlate: { id: p.id, targetDoorId: p.linkedDoorId, isPressed: false },
      });
    }

    // 6. Hazards
    for (const h of level.hazards ?? []) {
      const targetGrid = h.world === 'real' ? playerGrid : shadowGrid;
      targetGrid.setCell({
        position: GridPoint.from(h.position),
        tileType: TileType.HAZARD,
        hazard: { id: h.id },
      });
    }

    // 7. Checkpoints
    const checkpoints: CheckpointPair[] = [];
    for (const c of level.checkpoints ?? []) {
      const cpInstance = new CheckpointPair({
        id: c.id,
        realPosition: c.realPosition,
        shadowPosition: c.shadowPosition,
      });
      checkpoints.push(cpInstance);

      playerGrid.setCell({
        position: GridPoint.from(c.realPosition),
        tileType: TileType.CHECKPOINT,
        checkpoint: { id: c.id, isActivated: false },
      });
      shadowGrid.setCell({
        position: GridPoint.from(c.shadowPosition),
        tileType: TileType.CHECKPOINT,
        checkpoint: { id: c.id, isActivated: false },
      });
    }

    // 7b. Destructible Walls
    const destructibleWalls: DestructibleWall[] = [];
    for (const dw of level.destructibleWalls ?? []) {
      const wallInstance = new DestructibleWall({
        id: dw.id,
        world: dw.world,
        position: dw.position,
      });
      destructibleWalls.push(wallInstance);
      const targetGrid = dw.world === 'real' ? playerGrid : shadowGrid;
      targetGrid.setTileType(dw.position, TileType.DESTRUCTIBLE_WALL);
    }

    // 7c. Bombs
    const bombs: Bomb[] = [];
    for (const b of level.bombs ?? []) {
      const bombInstance = new Bomb({
        id: b.id,
        world: b.world,
        position: b.position,
        timer: b.timer,
        radius: b.radius,
        crossWorld: b.crossWorld,
        triggerType: b.triggerType,
        linkedSwitchId: b.linkedSwitchId,
      });
      bombs.push(bombInstance);
      const targetGrid = b.world === 'real' ? playerGrid : shadowGrid;
      targetGrid.setTileType(b.position, TileType.BOMB);
    }

    // 7d. Portals
    const portals: Portal[] = [];
    for (const p of level.portals ?? []) {
      const portalInstance = new Portal({
        id: p.id,
        world: p.world,
        position: p.position,
        targetWorld: p.targetWorld,
        targetPosition: p.targetPosition,
        destinations: p.destinations,
        corrupted: p.corrupted,
        initialActive: p.initialActive,
        linkedSwitchId: p.linkedSwitchId,
      });
      portals.push(portalInstance);
      const targetGrid = p.world === 'real' ? playerGrid : shadowGrid;
      targetGrid.setTileType(p.position, TileType.PORTAL);
    }

    // 7e. Moving Hazards (Saws)
    const movingHazards: MovingHazard[] = [];
    for (const mh of level.movingHazards ?? []) {
      const mhInstance = new MovingHazard({
        id: mh.id,
        world: mh.world,
        path: mh.path,
        initialIndex: mh.initialIndex,
      });
      movingHazards.push(mhInstance);
    }

    // 7f. Collapsing Floors
    const collapsingFloors: CollapsingFloor[] = [];
    for (const cf of level.collapsingFloors ?? []) {
      const cfInstance = new CollapsingFloor({
        id: cf.id,
        world: cf.world,
        position: cf.position,
        stepsToCollapse: cf.stepsToCollapse,
      });
      collapsingFloors.push(cfInstance);
      const targetGrid = cf.world === 'real' ? playerGrid : shadowGrid;
      targetGrid.setTileType(cf.position, TileType.COLLAPSING_FLOOR);
    }

    // 7g. Laser Emitters
    const laserEmitters: LaserEmitter[] = [];
    for (const le of level.laserEmitters ?? []) {
      const emitterInstance = new LaserEmitter({
        id: le.id,
        world: le.world,
        position: le.position,
        direction: le.direction,
        initialActive: le.initialActive,
        linkedSwitchId: le.linkedSwitchId,
      });
      laserEmitters.push(emitterInstance);
      const targetGrid = le.world === 'real' ? playerGrid : shadowGrid;
      targetGrid.setTileType(le.position, TileType.LASER_EMITTER);
    }

    // 7h. Laser Receivers
    const laserReceivers: LaserReceiver[] = [];
    for (const lr of level.laserReceivers ?? []) {
      const receiverInstance = new LaserReceiver({
        id: lr.id,
        world: lr.world,
        position: lr.position,
        linkedDoorId: lr.linkedDoorId,
      });
      laserReceivers.push(receiverInstance);
      const targetGrid = lr.world === 'real' ? playerGrid : shadowGrid;
      targetGrid.setTileType(lr.position, TileType.LASER_RECEIVER);
    }

    // 7i. Laser Mirrors
    const laserMirrors: LaserMirror[] = [];
    for (const lm of level.laserMirrors ?? []) {
      const mirrorInstance = new LaserMirror({
        id: lm.id,
        world: lm.world,
        position: lm.position,
        orientation: lm.orientation,
        rotatable: lm.rotatable,
        linkedSwitchId: lm.linkedSwitchId,
      });
      laserMirrors.push(mirrorInstance);
      const targetGrid = lm.world === 'real' ? playerGrid : shadowGrid;
      targetGrid.setTileType(lm.position, TileType.MIRROR);
    }

    // 7j. Time Locks
    const timeLocks: TimeLock[] = [];
    for (const tl of level.timeLocks ?? []) {
      const tlInstance = new TimeLock({
        id: tl.id,
        world: tl.world,
        position: tl.position,
        duration: tl.duration,
        linkedDoorId: tl.linkedDoorId,
        targetHazardIds: tl.targetHazardIds,
      });
      timeLocks.push(tlInstance);
      const targetGrid = tl.world === 'real' ? playerGrid : shadowGrid;
      targetGrid.setTileType(tl.position, TileType.TIME_LOCK);
    }

    // 7k. Movable Blocks
    const movableBlocks: MovableBlock[] = [];
    for (const mb of level.movableBlocks ?? []) {
      const mbInstance = new MovableBlock({
        id: mb.id,
        world: mb.world,
        position: mb.position,
        magneticType: mb.magneticType,
      });
      movableBlocks.push(mbInstance);
      const targetGrid = mb.world === 'real' ? playerGrid : shadowGrid;
      targetGrid.setTileType(mb.position, TileType.MOVABLE_BLOCK);
    }

    // 7l. Magnetic Fields
    const magneticFields: MagneticField[] = [];
    for (const mf of level.magneticFields ?? []) {
      const mfInstance = new MagneticField({
        id: mf.id,
        world: mf.world,
        position: mf.position,
        direction: mf.direction,
        polarity: mf.polarity,
        range: mf.range,
        initialActive: mf.initialActive,
        linkedSwitchId: mf.linkedSwitchId,
      });
      magneticFields.push(mfInstance);
      const targetGrid = mf.world === 'real' ? playerGrid : shadowGrid;
      targetGrid.setTileType(mf.position, TileType.MAGNETIC_FIELD);
    }

    // 8. Entities
    const player = new Player(level.realStart, level.realExit);
    const shadow = new Shadow(level.shadowStart, level.shadowExit);

    // 9. Puzzle Manager
    const puzzleManager = new PuzzleManager({
      doors,
      switches,
      pressurePlates: plates,
      bombs,
      destructibleWalls,
      portals,
      movingHazards,
      collapsingFloors,
      laserEmitters,
      laserReceivers,
      laserMirrors,
      timeLocks,
      movableBlocks,
      magneticFields,
      isWall: (world, pos) => {
        const grid = world === 'real' ? playerGrid : shadowGrid;
        return grid.isInBounds(pos) && grid.getCell(pos)?.tileType === TileType.WALL;
      },
    });

    // Initial simulation of lasers and magnetic fields
    puzzleManager.simulateLasers(GridPoint.from(level.realStart), GridPoint.from(level.shadowStart));
    puzzleManager.simulateMagneticFields(GridPoint.from(level.realStart), GridPoint.from(level.shadowStart));
    puzzleManager.evaluatePressurePlates(GridPoint.from(level.realStart), GridPoint.from(level.shadowStart));

    // 10. Engines
    const collisionEngine = new CollisionEngine({
      playerGrid,
      shadowGrid,
      puzzleManager,
      exitBehavior: level.exitBehavior ?? 'LOCK_ON_ARRIVAL',
    });

    const movementEngine = new MovementEngine(player, shadow, collisionEngine);

    const surpriseManager = new SurpriseEventManager({
      events: level.surpriseEvents ?? [],
      playerGrid,
      shadowGrid,
      puzzleManager,
    });

    const turnEngine = new TurnEngine({
      movementEngine,
      checkpoints,
      puzzleManager,
      surpriseManager,
      events,
    });

    return {
      definition: level,
      player,
      shadow,
      playerGrid,
      shadowGrid,
      puzzleManager,
      surpriseManager,
      checkpoints,
      collisionEngine,
      movementEngine,
      turnEngine,
    };
  }
}
