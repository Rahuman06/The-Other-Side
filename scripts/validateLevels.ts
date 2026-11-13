import { ALL_LEVELS } from '../src/levels/levelsData';
import { LevelSolver, SolverResult } from '../src/solver/LevelSolver';
import { LevelValidator } from '../src/solver/LevelValidator';

export function runLevelValidation(): boolean {
  console.log('='.repeat(80));
  console.log('THE OTHER SIDE — AUTOMATED LEVEL VALIDATION & BFS SOLVER ENGINE');
  console.log('='.repeat(80));
  console.log(`Validating all ${ALL_LEVELS.length} handcrafted levels across 5 chapters...\n`);

  let allPassed = true;
  const results: SolverResult[] = [];

  for (const level of ALL_LEVELS) {
    const start = performance.now();
    const result = LevelSolver.solve(level);
    const durationMs = (performance.now() - start).toFixed(1);
    results.push(result);

    // Also verify the handcrafted solutionTrace stored in the level definition
    const traceReplay = LevelValidator.replaySolution(level, level.solutionTrace);

    const statusBadge = result.solutionFound && result.replayVerified && traceReplay.success
      ? '✓ PASSED'
      : '✗ FAILED';

    console.log(`[Level ${String(level.id).padStart(2, '0')}] ${level.name} (${level.chapter}) -> ${statusBadge}`);
    console.log(`   Schema Valid:         ${result.schemaValid ? 'YES' : 'NO'}`);
    console.log(`   Solution Found:       ${result.solutionFound ? 'YES' : 'NO'}`);
    console.log(`   Solution Length:      ${result.solutionLength} steps`);
    console.log(`   Solution Sequence:    ${result.solutionSequence.join(' -> ') || '(none)'}`);
    console.log(`   Explored States:      ${result.exploredStateCount}`);
    console.log(`   Search Limit Reached: ${result.searchLimitReached ? 'YES' : 'NO'}`);
    console.log(`   Trace Replay Valid:   ${traceReplay.success ? 'YES' : 'NO'}`);
    console.log(`   Compute Time:         ${durationMs}ms`);

    if (result.errorDetails) {
      console.log(`   Error Details:        ${result.errorDetails}`);
    }
    if (!traceReplay.success && traceReplay.errorDetails) {
      console.log(`   Trace Error:          ${traceReplay.errorDetails}`);
    }
    console.log('-'.repeat(80));

    if (!result.solutionFound || !result.replayVerified || !traceReplay.success) {
      allPassed = false;
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('FINAL VALIDATION SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total Levels Validated: ${results.length}`);
  console.log(`Successfully Solved & Verified: ${results.filter((r) => r.solutionFound && r.replayVerified).length}`);
  console.log(`Search Limits Reached: ${results.filter((r) => r.searchLimitReached).length}`);
  console.log(`Unsolvable / Invalid: ${results.filter((r) => !r.solutionFound && !r.searchLimitReached).length}`);
  console.log('='.repeat(80));

  if (!allPassed) {
    console.error('\n[FATAL] One or more levels failed schema validation or could not be solved/replayed.');
    return false;
  }

  console.log('\n[SUCCESS] All 20 levels passed schema validation, BFS automated solving, and replay verification.');
  return true;
}

// When executed directly from CLI
const success = runLevelValidation();
if (!success) {
  process.exit(1);
}
