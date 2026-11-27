# POKI SDK EVENT VERIFICATION REPORT — THE OTHER SIDE

**Status:** PASSED (Automated SDK v2 Mock Verification) / NOT TESTED (Live Hosted Poki Inspector UI)  
**Date:** 2026-11-27  
**Commit:** `a136680`

## What Was Inspected
- `src/poki/PokiIntegration.ts`
- `src/scenes/PreloadScene.ts`, `src/scenes/MenuScene.ts`, `src/scenes/GameScene.ts`, `src/systems/InputController.ts`
- `vite.config.ts`, `package.json`

## What Was Tested
- `tests/unit/PokiIntegration.test.ts` (5 unit tests covering offline fallback, loading events, `gameplayStart`/`gameplayStop` deduping, `commercialBreak`, `rewardedBreak`)
- `tests/browser/release-qa.spec.ts` (Test 4 injecting `window.PokiSDK` mock and verifying exact event trace through Pause -> Settings -> Pause -> Resume `commercialBreak` -> Win Level 1)
- Ad-blocked `dist-poki/` preview verification (`page.route('**/poki-sdk.js', route => route.abort())`)

## What Was Discovered & Fixed
1. `index.html` previously lacked the official `https://game-cdn.poki.com/scripts/v2/poki-sdk.js` script tag for Poki submission builds; added mode-gated injection via `vite.config.ts` (`npm run build:poki` outputs `dist-poki/` with `poki-sdk.js`, while standard `npm run build` outputs Ad-Free `dist/` without `poki-sdk.js`).
2. `pokiBridge.commercialBreak()` was previously never invoked; wired exclusively on returning from Pause to active Gameplay in `GameScene.togglePause()` (never mid-puzzle, never on Level Select exit, never on milestones/timers).
3. Added `isAdActive()`, async `isResumingFromPause` guard, input lockouts in `InputController.ts` and `GameScene` ESC listener, and non-destructive `AudioManager.suspendForAd()` / `resumeFromAd()` during `commercialBreak`.

## Files Modified
- `vite.config.ts`, `package.json`, `src/poki/PokiIntegration.ts`, `src/scenes/GameScene.ts`, `src/systems/InputController.ts`, `src/audio/AudioManager.ts`

## Verification Evidence
- `tests/unit/PokiIntegration.test.ts`: **PASSED** (5/5)
- `tests/browser/release-qa.spec.ts`: Confirmed `init`, `gameLoadingStart`, `gameLoadingFinished`, `gameplayStart`, `gameplayStop`, `commercialBreak:start`, `commercialBreak:end` trace cleanly. **PASSED**
- `dist-poki/` with aborted `poki-sdk.js`: `requestedPokiSdk: true`, `activeWithAdBlock: true`, `errs: []`. **PASSED**

## Remaining Problems
- Upload of `dist-poki/` / `the-other-side-poki.zip` to the interactive Poki for Developers / `inspector.poki.dev` web UI was **NOT TESTED** in this session (requires interactive Poki developer session).
