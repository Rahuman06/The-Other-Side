# LEVEL 20: AUTOMATED SOLVER BENCHMARK REPORT

**Engine:** `LevelSolver.ts` & `LevelValidator.ts`  
**Chamber ID:** 20  
**Chamber Name:** The Final Paradox  
**Chapter:** THE TRUTH  
**Difficulty:** MASTER  

---

## 1. Solver Run Statistics

```
================================================================================
LEVEL 20 SOLVER BENCHMARK RESULTS
================================================================================
Schema Validation:               PASSED (0 Errors)
Optimal Solution Found:          YES
Optimal Sequence Length:         12 steps
Explored State Count:            557 states
Search Limit Reached:            NO
Deterministic Replay Verified:   YES
Execution / Compute Time:        65.7 ms
================================================================================
```

---

## 2. Canonical Solution Vector

```json
[
  "up",
  "up",
  "down",
  "right",
  "down",
  "right",
  "up",
  "right",
  "up",
  "right",
  "right",
  "right"
]
```

---

## 3. Schema & Constraint Integrity Audit

- **Grid Size:** $8 \times 6$ (Within maximum bounds $9 \times 7$)
- **Starts In Bounds & Unobstructed:**
  - `realStart` at `(1, 3)` — Valid FLOOR tile
  - `shadowStart` at `(6, 2)` — Valid FLOOR tile
- **Exits In Bounds & Unobstructed:**
  - `realExit` at `(7, 3)` — Valid FLOOR tile
  - `shadowExit` at `(0, 2)` — Valid FLOOR tile
- **Door Activation Rule Integrity:**
  - `door-20-exit-real` (controlled by switches `sw-20-exit-gate-a` and `sw-20-exit-gate-b`) has explicit `activationRule: 'ANY'`
  - `door-20-exit-shadow` (controlled by switches `sw-20-exit-gate-a2` and `sw-20-exit-gate-b2`) has explicit `activationRule: 'ANY'`
- **Fixed Anchor Integrity:**
  - `fixedTilesReal`: `[{ x: 6, y: 3 }]`
  - `fixedTilesShadow`: `[{ x: 1, y: 2 }]`
