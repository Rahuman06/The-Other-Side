import { describe, it, expect } from 'vitest';
import { LevelSolver } from '@/solver/LevelSolver';
import { LevelValidator } from '@/solver/LevelValidator';
import { LevelDefinition } from '@/types/level';
import { ALL_LEVELS } from '@/levels/levelsData';

describe('Phase 08 — Automated Level Solver and Validator Engine', () => {
  describe('Schema Validation', () => {
    it('validates schema for all 20 production levels', () => {
      for (const level of ALL_LEVELS) {
        const res = LevelValidator.validateSchema(level);
        expect(res.valid).toBe(true);
        expect(res.errors).toHaveLength(0);
      }
    });

    it('rejects levels with out-of-bounds start or exit coordinates', () => {
      const badLevel: LevelDefinition = {
        ...ALL_LEVELS[0],
        realStart: { x: 99, y: 99 },
      };
      const res = LevelValidator.validateSchema(badLevel);
      expect(res.valid).toBe(false);
      expect(res.errors.some((e) => e.includes('out of bounds'))).toBe(true);
    });

    it('rejects levels where characters spawn inside walls', () => {
      const badLevel: LevelDefinition = {
        ...ALL_LEVELS[0],
        realWalls: [{ x: 1, y: 2 }], // realStart is (1, 2)
      };
      const res = LevelValidator.validateSchema(badLevel);
      expect(res.valid).toBe(false);
      expect(res.errors.some((e) => e.includes('spawns inside a real wall'))).toBe(true);
    });

    it('rejects duplicate puzzle object IDs', () => {
      const badLevel: LevelDefinition = {
        ...ALL_LEVELS[4],
        switches: [
          { id: ALL_LEVELS[4].doors![0].id, world: 'shadow', position: { x: 2, y: 2 }, linkedDoorId: ALL_LEVELS[4].doors![0].id },
        ],
      };
      const res = LevelValidator.validateSchema(badLevel);
      expect(res.valid).toBe(false);
      expect(res.errors.some((e) => e.includes('Duplicate puzzle object ID'))).toBe(true);
    });

    it('rejects switches targeting nonexistent doors', () => {
      const badLevel: LevelDefinition = {
        ...ALL_LEVELS[4],
        switches: [
          { id: 'sw-missing', world: 'shadow', position: { x: 2, y: 2 }, linkedDoorId: 'ghost-door' },
        ],
      };
      const res = LevelValidator.validateSchema(badLevel);
      expect(res.valid).toBe(false);
      expect(res.errors.some((e) => e.includes('nonexistent door'))).toBe(true);
    });

    it('rejects multi-switch doors without explicit ALL or ANY activation rule', () => {
      const badLevel: LevelDefinition = {
        id: 99,
        chapter: 'THE REFLECTION',
        name: 'Ambiguous Rule Gate',
        width: 7,
        height: 5,
        difficulty: 'HARD',
        hint: 'Rule is missing.',
        realStart: { x: 1, y: 2 },
        shadowStart: { x: 5, y: 2 },
        realExit: { x: 5, y: 2 },
        shadowExit: { x: 1, y: 2 },
        realWalls: [],
        shadowWalls: [],
        doors: [{ id: 'door-ambiguous', world: 'real', position: { x: 3, y: 2 }, initialOpen: false }],
        switches: [
          { id: 'sw-a', world: 'real', position: { x: 2, y: 1 }, linkedDoorId: 'door-ambiguous' },
          { id: 'sw-b', world: 'shadow', position: { x: 4, y: 1 }, linkedDoorId: 'door-ambiguous' },
        ],
        solutionTrace: ['right'],
      };
      const res = LevelValidator.validateSchema(badLevel);
      expect(res.valid).toBe(false);
      expect(res.errors.some((e) => e.includes('explicit activationRule'))).toBe(true);
    });
  });

  describe('BFS Solver & State Space Exploration', () => {
    it('solves Level 1 and returns optimal 4-step sequence', () => {
      const result = LevelSolver.solve(ALL_LEVELS[0]);
      expect(result.solutionFound).toBe(true);
      expect(result.solutionLength).toBe(4);
      expect(result.solutionSequence).toEqual(['right', 'right', 'right', 'right']);
      expect(result.searchLimitReached).toBe(false);
      expect(result.replayVerified).toBe(true);
      expect(result.exploredStateCount).toBeGreaterThan(0);
    });

    it('prunes moves leading to hazard deaths', () => {
      // Level 9 introduces hazards. The solver should avoid entering the hazard.
      const result = LevelSolver.solve(ALL_LEVELS[8]);
      expect(result.solutionFound).toBe(true);
      expect(result.replayVerified).toBe(true);

      const replay = LevelValidator.replaySolution(ALL_LEVELS[8], result.solutionSequence);
      expect(replay.died).toBe(false);
      expect(replay.completed).toBe(true);
    });

    it('provably identifies genuinely unsolvable levels when state space is exhausted', () => {
      // Create a level where exit is completely enclosed by walls
      const unsolvableLevel: LevelDefinition = {
        id: 98,
        chapter: 'THE BEGINNING',
        name: 'The Impossible Box',
        width: 5,
        height: 5,
        difficulty: 'EASY',
        hint: 'You cannot enter.',
        realStart: { x: 1, y: 2 },
        shadowStart: { x: 3, y: 2 },
        realExit: { x: 4, y: 2 },
        shadowExit: { x: 0, y: 2 },
        realWalls: [
          { x: 4, y: 1 },
          { x: 3, y: 2 }, // Seals exit (4,2)
          { x: 4, y: 3 },
        ],
        shadowWalls: [],
        solutionTrace: ['right'],
      };

      const result = LevelSolver.solve(unsolvableLevel);
      expect(result.schemaValid).toBe(true);
      expect(result.solutionFound).toBe(false);
      expect(result.searchLimitReached).toBe(false); // Did NOT hit limit, space was exhausted!
      expect(result.errorDetails).toContain('provably unsolvable');
    });

    it('does NOT report unsolvable when search limit is reached', () => {
      // Constrain maxStates to 2 on Level 6 (which requires >2 states)
      const result = LevelSolver.solve(ALL_LEVELS[5], { maxStates: 2 });
      expect(result.solutionFound).toBe(false);
      expect(result.searchLimitReached).toBe(true);
      expect(result.errorDetails).toContain('Search computational limit reached');
      expect(result.errorDetails).not.toContain('unsolvable');
    });

    it('respects maxDepth boundary limit', () => {
      // Constrain maxDepth to 2 on Level 6 (which needs 6 steps)
      const result = LevelSolver.solve(ALL_LEVELS[5], { maxDepth: 2 });
      expect(result.solutionFound).toBe(false);
      expect(result.searchLimitReached).toBe(true);
    });
  });

  describe('Authoritative Replay Verification', () => {
    it('verifies that replaying invalid sequences fails', () => {
      // Attempting to move into a wall repeatedly
      const replay = LevelValidator.replaySolution(ALL_LEVELS[0], ['left', 'left']);
      expect(replay.completed).toBe(false);
      expect(replay.success).toBe(false);
    });

    it('replays solution traces for all 20 levels successfully through the authoritative engine', () => {
      for (const level of ALL_LEVELS) {
        const replay = LevelValidator.replaySolution(level, level.solutionTrace);
        expect(replay.success).toBe(true);
        expect(replay.died).toBe(false);
        expect(replay.completed).toBe(true);
      }
    });
  });
});
