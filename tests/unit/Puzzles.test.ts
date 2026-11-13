import { describe, it, expect, beforeEach } from 'vitest';
import { Door } from '@/puzzles/Door';
import { Switch } from '@/puzzles/Switch';
import { PressurePlate } from '@/puzzles/PressurePlate';
import { PuzzleManager } from '@/puzzles/PuzzleManager';
import { Player } from '@/entities/Player';
import { Shadow } from '@/entities/Shadow';
import { CollisionEngine } from '@/engine/CollisionEngine';
import { MovementEngine } from '@/engine/MovementEngine';
import { GridPoint } from '@/grid/GridPosition';

describe('Phase 05 — Puzzle Mechanics (Switches, Plates, Doors & Edge Cases)', () => {
  let door: Door;
  let sw: Switch;
  let plate: PressurePlate;
  let puzzleManager: PuzzleManager;

  beforeEach(() => {
    door = new Door({
      id: 'door-1',
      world: 'real',
      position: { x: 3, y: 2 },
      initialOpen: false,
    });

    sw = new Switch({
      id: 'sw-1',
      world: 'shadow',
      position: { x: 2, y: 2 },
      linkedDoorId: 'door-1',
      initialActive: false,
      activationBehavior: 'TOGGLE',
    });

    plate = new PressurePlate({
      id: 'plate-1',
      world: 'real',
      position: { x: 1, y: 2 },
      linkedDoorId: 'door-1',
    });

    puzzleManager = new PuzzleManager({
      doors: [door],
      switches: [sw],
      pressurePlates: [plate],
    });
  });

  describe('Unique Object ID Enforcement & Validation', () => {
    it('rejects duplicate IDs across puzzle objects', () => {
      expect(() =>
        new PuzzleManager({
          doors: [
            new Door({ id: 'obj-dup', world: 'real', position: { x: 0, y: 0 } }),
            new Door({ id: 'obj-dup', world: 'real', position: { x: 1, y: 1 } }),
          ],
        })
      ).toThrow(/Duplicate puzzle object ID/);

      expect(() =>
        new PuzzleManager({
          doors: [new Door({ id: 'obj-1', world: 'real', position: { x: 0, y: 0 } })],
          switches: [
            new Switch({ id: 'obj-1', world: 'shadow', position: { x: 1, y: 1 }, linkedDoorId: 'obj-1' }),
          ],
        })
      ).toThrow(/Duplicate puzzle object ID/);
    });

    it('rejects switches or plates linking to nonexistent doors', () => {
      expect(() =>
        new PuzzleManager({
          switches: [
            new Switch({ id: 'sw-err', world: 'real', position: { x: 0, y: 0 }, linkedDoorId: 'door-none' }),
          ],
        })
      ).toThrow(/targets nonexistent door/);
    });

    it('requires an explicit activation rule (ALL or ANY) for doors controlled by multiple switches', () => {
      const swA = new Switch({ id: 'sw-a', world: 'real', position: { x: 0, y: 0 }, linkedDoorId: 'door-multi' });
      const swB = new Switch({ id: 'sw-b', world: 'real', position: { x: 1, y: 0 }, linkedDoorId: 'door-multi' });

      // Door with default/DIRECT rule fails validation when controlled by multiple switches
      const multiDoorInvalid = new Door({
        id: 'door-multi',
        world: 'real',
        position: { x: 2, y: 0 },
        activationRule: 'DIRECT',
      });

      expect(() =>
        new PuzzleManager({
          doors: [multiDoorInvalid],
          switches: [swA, swB],
        })
      ).toThrow(/requires an explicit activation rule/);

      // Valid with ALL or ANY
      const multiDoorValid = new Door({
        id: 'door-multi',
        world: 'real',
        position: { x: 2, y: 0 },
        activationRule: 'ALL',
      });

      expect(() =>
        new PuzzleManager({
          doors: [multiDoorValid],
          switches: [swA, swB],
        })
      ).not.toThrow();
    });
  });

  describe('Important Edge Cases', () => {
    // 1. Character stands on a switch
    it('Case 1: Character stands on a switch -> activates switch and linked door', () => {
      expect(sw.isActive).toBe(false);
      expect(door.isOpen).toBe(false);

      // Character steps onto switch cell (2,2) from (1,2)
      puzzleManager.onCharacterMove('shadow', { x: 1, y: 2 }, { x: 2, y: 2 });

      expect(sw.isActive).toBe(true);
      expect(door.isOpen).toBe(true);
    });

    // 2. Character leaves a switch
    it('Case 2: Character leaves a switch -> switch remains active', () => {
      // Enter switch
      puzzleManager.onCharacterMove('shadow', { x: 1, y: 2 }, { x: 2, y: 2 });
      expect(sw.isActive).toBe(true);
      expect(door.isOpen).toBe(true);

      // Leave switch to (3,2)
      puzzleManager.onCharacterMove('shadow', { x: 2, y: 2 }, { x: 3, y: 2 });

      // Switch maintains its toggled state
      expect(sw.isActive).toBe(true);
      expect(door.isOpen).toBe(true);
    });

    // 3. Switch activates a door
    it('Case 3: Switch activates a door and enables passage through it', () => {
      expect(door.isOpen).toBe(false);
      expect(puzzleManager.isDoorBlocking('real', { x: 2, y: 2 }, { x: 3, y: 2 })).toBe(true);

      // Step on switch
      puzzleManager.onCharacterMove('shadow', { x: 1, y: 2 }, { x: 2, y: 2 });
      expect(door.isOpen).toBe(true);
      expect(puzzleManager.isDoorBlocking('real', { x: 2, y: 2 }, { x: 3, y: 2 })).toBe(false);
    });

    // 4 & 5. Door closes while character occupies its cell & character can leave after it closes
    it('Case 4 & 5: Character occupying a closed door cell can leave after it closes', () => {
      // Step onto pressure plate at (1,2) to open door at (3,2)
      puzzleManager.evaluatePressurePlates({ x: 1, y: 2 }, { x: 0, y: 0 });
      expect(plate.isPressed).toBe(true);
      expect(door.isOpen).toBe(true);

      // Real character walks into open door at (3,2) while Shadow steps onto plate or another trigger
      // Now pressure plate is released because character is at (3,2)
      puzzleManager.evaluatePressurePlates({ x: 3, y: 2 }, { x: 0, y: 0 });
      expect(plate.isPressed).toBe(false);
      expect(door.isOpen).toBe(false); // Door closes while character occupies its cell!

      // The character is currently at (3,2) [the closed door cell].
      // When attempting to LEAVE to (4,2), the closed door must NOT block exit!
      const isExitBlocked = puzzleManager.isDoorBlocking('real', { x: 3, y: 2 }, { x: 4, y: 2 });
      expect(isExitBlocked).toBe(false); // Permitted to leave!

      // Conversely, an outside character attempting to ENTER the closed door from (2,2) MUST be blocked
      const isEntryBlocked = puzzleManager.isDoorBlocking('real', { x: 2, y: 2 }, { x: 3, y: 2 });
      expect(isEntryBlocked).toBe(true); // Entry blocked!
    });

    // 6. Two switches control the same door (ALL rule vs ANY rule)
    it('Case 6A: Multi-switch door with ALL rule opens only when all switches are active', () => {
      const sw1 = new Switch({ id: 'sw-a', world: 'real', position: { x: 0, y: 0 }, linkedDoorId: 'door-all' });
      const sw2 = new Switch({ id: 'sw-b', world: 'shadow', position: { x: 4, y: 4 }, linkedDoorId: 'door-all' });
      const multiDoor = new Door({
        id: 'door-all',
        world: 'real',
        position: { x: 2, y: 2 },
        activationRule: 'ALL',
      });

      const pm = new PuzzleManager({
        doors: [multiDoor],
        switches: [sw1, sw2],
      });

      expect(multiDoor.isOpen).toBe(false);

      // Step on switch 1 only
      pm.onCharacterMove('real', { x: 1, y: 0 }, { x: 0, y: 0 });
      expect(sw1.isActive).toBe(true);
      expect(sw2.isActive).toBe(false);
      expect(multiDoor.isOpen).toBe(false); // Still closed!

      // Step on switch 2
      pm.onCharacterMove('shadow', { x: 3, y: 4 }, { x: 4, y: 4 });
      expect(sw1.isActive).toBe(true);
      expect(sw2.isActive).toBe(true);
      expect(multiDoor.isOpen).toBe(true); // Opened because ALL are active!

      // Toggle switch 1 off
      pm.onCharacterMove('real', { x: 0, y: 1 }, { x: 0, y: 0 });
      expect(sw1.isActive).toBe(false);
      expect(multiDoor.isOpen).toBe(false); // Closes immediately!
    });

    it('Case 6B: Multi-switch door with ANY rule opens when at least one switch is active', () => {
      const sw1 = new Switch({ id: 'sw-any-1', world: 'real', position: { x: 0, y: 0 }, linkedDoorId: 'door-any' });
      const sw2 = new Switch({ id: 'sw-any-2', world: 'shadow', position: { x: 4, y: 4 }, linkedDoorId: 'door-any' });
      const anyDoor = new Door({
        id: 'door-any',
        world: 'real',
        position: { x: 2, y: 2 },
        activationRule: 'ANY',
      });

      const pm = new PuzzleManager({
        doors: [anyDoor],
        switches: [sw1, sw2],
      });

      expect(anyDoor.isOpen).toBe(false);

      // Activate one switch
      pm.onCharacterMove('real', { x: 1, y: 0 }, { x: 0, y: 0 });
      expect(anyDoor.isOpen).toBe(true); // Opens because ANY is satisfied!
    });

    // 7. A switch activates repeatedly
    it('Case 7: A switch activates repeatedly on repeated entries', () => {
      // Entry 1: toggles ON
      puzzleManager.onCharacterMove('shadow', { x: 1, y: 2 }, { x: 2, y: 2 });
      expect(sw.isActive).toBe(true);
      expect(door.isOpen).toBe(true);

      // Leave cell
      puzzleManager.onCharacterMove('shadow', { x: 2, y: 2 }, { x: 1, y: 2 });
      expect(sw.isActive).toBe(true);

      // Entry 2: toggles OFF
      puzzleManager.onCharacterMove('shadow', { x: 1, y: 2 }, { x: 2, y: 2 });
      expect(sw.isActive).toBe(false);
      expect(door.isOpen).toBe(false);

      // Entry 3: toggles ON again
      puzzleManager.onCharacterMove('shadow', { x: 2, y: 2 }, { x: 1, y: 2 });
      puzzleManager.onCharacterMove('shadow', { x: 1, y: 2 }, { x: 2, y: 2 });
      expect(sw.isActive).toBe(true);
      expect(door.isOpen).toBe(true);
    });

    // 8. A door is already open
    it('Case 8: Handles initially open doors properly', () => {
      const openDoor = new Door({
        id: 'door-open',
        world: 'real',
        position: { x: 1, y: 1 },
        initialOpen: true,
      });

      const pm = new PuzzleManager({ doors: [openDoor] });
      expect(openDoor.isOpen).toBe(true);
      expect(pm.isDoorBlocking('real', { x: 0, y: 1 }, { x: 1, y: 1 })).toBe(false);
    });

    // 9. A reset occurs while a door is open
    it('Case 9: A reset occurs while a door is open -> restores initial states', () => {
      // Activate switch to open door
      puzzleManager.onCharacterMove('shadow', { x: 1, y: 2 }, { x: 2, y: 2 });
      expect(door.isOpen).toBe(true);
      expect(sw.isActive).toBe(true);

      // Reset
      puzzleManager.reset();

      expect(door.isOpen).toBe(false); // Restored to initial false
      expect(sw.isActive).toBe(false);
      expect(plate.isPressed).toBe(false);
    });
  });

  describe('Integration with Movement & Collision Engine', () => {
    it('allows player to walk through a door opened by shadow switch', () => {
      const p = new Player({ x: 2, y: 2 });
      const s = new Shadow({ x: 1, y: 2 });

      const d = new Door({ id: 'd-test', world: 'real', position: { x: 3, y: 2 }, initialOpen: false });
      const switchTrigger = new Switch({
        id: 'sw-test',
        world: 'shadow',
        position: { x: 0, y: 2 }, // When Shadow moves right, it goes from 1,2 to 0,2 (mirrored!)
        linkedDoorId: 'd-test',
      });

      const pm = new PuzzleManager({ doors: [d], switches: [switchTrigger] });
      const col = new CollisionEngine({
        width: 5,
        height: 5,
        puzzleManager: pm,
      });
      const mov = new MovementEngine(p, s, col);

      // First, Real tries to move right into closed door at (3,2).
      // Pre-movement: Player is at (2,2), target is (3,2) [door is closed].
      // Shadow is at (1,2), moving right targets (0,2) [switch!].
      // In the pre-movement state, door is closed, so Player is blocked! Shadow moves to switch!
      const move1 = mov.executeMove('right');
      expect(move1.playerMoved).toBe(false);
      expect(move1.shadowMoved).toBe(true);
      expect(p.position).toEqual(new GridPoint(2, 2));
      expect(s.position).toEqual(new GridPoint(0, 2)); // Hit switch!
      expect(d.isOpen).toBe(true); // Switch opened door!

      // Next move right: Player can now freely walk through the open door to (3,2)!
      const move2 = mov.executeMove('right');
      expect(move2.playerMoved).toBe(true);
      expect(p.position).toEqual(new GridPoint(3, 2));
    });
  });
});
