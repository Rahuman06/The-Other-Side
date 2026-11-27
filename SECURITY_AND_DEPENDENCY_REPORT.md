# SECURITY AND DEPENDENCY REPORT — THE OTHER SIDE

**Status:** PASSED (Production Dependencies Clean)  
**Date:** 2026-11-27  
**Commit:** `a136680`

## What Was Inspected
- `package.json`, `package-lock.json`
- Production source code (`src/`): storage sanitization, URL parameter handling, DOM overlays, inline SVG favicon

## What Was Tested
- Ran `npm audit --registry=https://registry.npmjs.org --omit=dev` (production dependencies)
- Ran `npm audit --registry=https://registry.npmjs.org` (full dev + prod dependency tree)
- Reviewed `PreloadScene.ts` (`?level=N` parsing with `parseInt(..., 10)` bounded to `1..20`), `StorageManager.ts` (JSON schema & type validation, safe memory fallback), and DOM manipulation in `MobileControlsOverlay.ts` (static button elements without `innerHTML` user-input sinks)

## What Was Discovered
- **Production runtime dependencies (`npm audit --omit=dev`):** **0 vulnerabilities** (`phaser ^3.88.2` clean).
- **Development tooling (`npm audit`):** Reports 10 advisories (8 moderate, 2 critical) strictly in dev-only test/lint dependencies (`vitest` / `@vitest/mocker` / `tinypool` and `typescript-eslint` / `minimatch`), none of which are bundled into `dist/` or `dist-poki/`.
- No `eval`, `new Function`, unsafe `innerHTML` injection from query strings/storage, or hardcoded secrets found in `src/`.

## Files Modified
- No dependency version downgrades/upgrades required; left locked runtime dependencies clean.

## Verification Evidence
- `npm audit --registry=https://registry.npmjs.org --omit=dev`: **`found 0 vulnerabilities` (exit 0)**
- `npm run typecheck` & `npm run lint`: **0 errors**

## Remaining Problems
- Optional post-release dev-tooling update: upgrading `vitest` / `typescript-eslint` major versions (`npm audit fix --force`, breaking dev changes) was deferred to avoid destabilizing the verified test runner before release.
