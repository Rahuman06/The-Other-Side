# MOBILE PERFORMANCE REPORT — THE OTHER SIDE

**Status:** PASSED (Emulated Browser Metrics) / NOT TESTED (Physical Mobile Hardware)  
**Date:** 2026-11-27  
**Commit:** `a881bca6` -> `a136680`

## What Was Inspected
- `src/rendering/BackdropRenderer.ts` (DPR cap `Math.min(dpr, 1.5)`, object pools, `'game'` mode skipping gradients/particles/rays, `visibilitychange` power-saving pause)
- `src/rendering/VisualEffectsManager.ts` (48 ambient motes total, reduced-motion fast paths)
- `src/rendering/PuzzleObjectRenderer.ts` (reusable graphics redraw loop & cached label Maps)
- `src/ui/ObjectGuideModal.ts` (fixed tab listener/object leak on category switches)

## What Was Tested
- Mobile viewports in headless Edge: `360x640`, `390x844`, `412x915` portrait and `667x375`, `844x390`, `915x412` landscape
- Touch cluster availability (`#btn-mobile-left`, `#btn-mobile-right`, `#btn-mobile-up`, `#btn-mobile-down` >= `48px`) and visibility toggling on Pause / Win
- Bundle size & network payload check (`dist/assets/index-*.js` ~`76 kB` gzip + `phaser` ~`340 kB` gzip)

## What Was Discovered
- `ObjectGuideModal.createCategoryTabs()` had an active display-object & input-listener accumulation bug when users toggled tabs repeatedly; fixed by clearing `categoryTabsContainer`.
- `BackdropRenderer.ts` cleanly switches from `'menu'` cinematic mode to zero-gradient solid split `'game'` mode during puzzle levels and caps canvas DPR at `1.5`.
- Existing per-frame `GameScene.update` allocates minimal transient objects cleanly.

## What Was Fixed
- Eliminated `ObjectGuideModal` category tab display object and listener accumulation leak (`src/ui/ObjectGuideModal.ts`).
- Unified `SettingsModal` cleanly removing 286 lines of duplicate Menu Settings code (`src/rendering/MenuScene.ts`).

## Files Modified
- `src/ui/ObjectGuideModal.ts`, `src/ui/SettingsModal.ts`, `src/rendering/MenuScene.ts`

## Verification Evidence
- `tests/browser/release-qa.spec.ts` (Test 1 & Test 4 on `844x390` + mobile viewports): **PASSED**
- `tests/browser/visual.spec.ts` (375x667 portrait & 667x375 landscape touch tests): **PASSED**
- `tests/browser/intro-cinematic.spec.ts` & `outro-cinematic.spec.ts` mobile landscape checks: **PASSED**

## Remaining Problems
- **NOT TESTED** on physical Android or iOS handset hardware (only verified in Chromium/Edge mobile emulation with touch enabled).
