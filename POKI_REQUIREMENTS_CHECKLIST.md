# POKI REQUIREMENTS CHECKLIST — THE OTHER SIDE

**Date:** 2026-11-27  
**Target Build:** `dist-poki/` (`the-other-side-poki.zip`)

| Requirement | Status | Verification Evidence |
| :--- | :--- | :--- |
| Official Poki SDK v2 `<script src="https://game-cdn.poki.com/scripts/v2/poki-sdk.js">` included in Poki build | **PASSED** | Verified in `dist-poki/index.html` line 205; excluded from Ad-Free `dist/` |
| `PokiSDK.init()` resolves safely offline / under ad blockers | **PASSED** | `PokiIntegration.test.ts` + live Playwright aborted `poki-sdk.js` check on `dist-poki/` |
| `gameLoadingStart()` / `gameLoadingFinished()` called accurately | **PASSED** | `PreloadScene.ts` lines 15 & 150 + `release-qa.spec.ts` trace |
| `gameplayStart()` / `gameplayStop()` called without duplicates | **PASSED** | `PokiIntegration.ts` state tracking + `GameScene` / `MenuScene` |
| `commercialBreak()` placed cleanly only on Pause -> Resume | **PASSED** | `GameScene.togglePause()` awaited with re-entrancy & input lock |
| Audio muted/suspended during ads and restored afterward | **PASSED** | `AudioManager.suspendForAd()` / `resumeFromAd()` preserves user mute state |
| Zero external CDN/API calls (besides `poki-sdk.js` in Poki build) | **PASSED** | URL grep on `dist/` and `dist-poki/` (`EXTERNAL_REQUESTS_AUDIT.md`) |
| Safe in Private / Incognito / blocked `localStorage` | **PASSED** | Fixed `SecurityError` on `window.localStorage` getter; verified via Playwright |
| Responsive 16:9 across Poki viewports (`640x360`, `836x470`, `1031x580`) + mobile | **PASSED** | All 13 viewports verified in `tests/browser/release-qa.spec.ts` |
| No browser context menu / text selection / pull-to-refresh interference | **PASSED** | `BootScene` contextmenu disabled + CSS `user-select: none; touch-action: none` |
| No unauthorized third-party ads or branding overlays | **PASSED** | Self-contained clean build |
| Official hosted Poki Inspector upload (`inspector.poki.dev`) | **NOT TESTED** | Interactive web upload to Poki Developer portal requires user/studio session |
| Official Poki submission acceptance | **NOT VERIFIED** | Cannot claim platform approval prior to manual developer submission |
