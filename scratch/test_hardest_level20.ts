import { LevelDefinition } from '../src/types/level';
import { LevelFactory } from '../src/levels/LevelFactory';
import { LevelSolver, Direction } from '../src/solver/LevelSolver';

// Let's test a deeply baffled, high-complexity 9x7 or 8x6 architecture
// We want:
// 1. Pre-inversion stage: Characters cannot simply walk to Alpha or Beta.
//    Alpha is locked behind door-alpha, controlled by a pressure plate in Shadow.
//    Beta is locked behind door-beta, controlled by a pressure plate in Real.
//    This requires cross-world coordination before ANY inversion can occur!
// 2. Moving hazards or timed hazards patrolling the corridors.
// 3. World Inversion transforms the chamber layout completely.
// 4. Post-inversion stage: Inverted character must solve a secondary maze/hazard traverse to reach the conduit switch.
// 5. Non-inverted character must then navigate through their newly opened corridor to the exit release mechanism.
// 6. Dual exit convergence.
console.log('Prototyping hardest Level 20...');
