# LEVEL 17 — TWO BECOME ONE

**Project:** THE OTHER SIDE  
**Chapter:** THE TRUTH / MASTER CAMPAIGN  
**Tagline:** TWO WORLDS. ONE MIND.  
**Difficulty:** Master  
**Status:** IMPLEMENTED, SOLVED & VERIFIED

---

## 1. Executive Summary & Design Vision

Level 17 embodies the core philosophical theme of the game: **Two Become One**. The two stickmen cannot solve their dilemmas through isolated spatial paths. They must operate as **one integrated logical machine** where an action in one world dynamically reconfigures physical constants in the other.

### The Central Psychological Surprise: Cross-World Portal Realignment
1. **The Apparent Independence:** The chamber presents two pressure plates:
   - **Plate A (`pp-17-real` at `(2, 2)`):** Appears to unlock access door `door-17-shadow-access` at `(6, 2)`.
   - **Plate B (`pp-17-shadow` at `(5, 2)`):** Unlocks exit door `door-17-real-exit` at `(5, 4)`.
2. **The Deception & Order Dependency:** Portal `p-17-shadow` at `(6, 4)` initially anchors to `(6, 1)` (a dead-end loop that returns the Shadow back to spawn). If the player rushes the portal without synchronizing plates, progress is impossible.
3. **The Discovery:** Stepping on Plate A in the Real World transmits a quantum harmonic frequency across the dimensional rift.
4. **The Realignment:** Plate A fires surprise event `se-17-portal-shift`, altering `p-17-shadow`'s destination in the Shadow World from `(6, 1)` to `(3, 4)` (the inner exit corridor).
5. **The Convergence:** Both characters enter their respective portals (`p-17-real` at `(1, 4)` and `p-17-shadow` at `(6, 4)`) simultaneously, materializing at `(4, 4)` and `(3, 4)` to cross their unlocked exit thresholds in unison.

```mermaid
flowchart TD
    subgraph RealWorld ["REAL WORLD"]
        startR["Spawn (1,1)"] --> moveR1["Move to (2,1)"]
        moveR1 --> plateA["Plate A (2,2)"]
        plateA --> doorR_time["Door Timed (1,2)"]
        doorR_time --> swR["Switch (0,4)"]
        swR --> portalR["Portal (1,4)"]
        portalR --> exitR["Real Exit (6,4)"]
    end

    subgraph Rift ["DIMENSIONAL RIFT"]
        plateA -.->|Realigns Portal Destination| portalShift["se-17-portal-shift"]
        swR -.->|Unlocks| doorS_exit["Door Shadow Exit (2,4)"]
        tlS -.->|Freezes Open| doorR_time
        plateB -.->|Unlocks| doorR_exit["Door Real Exit (5,4)"]
    end

    subgraph ShadowWorld ["SHADOW WORLD"]
        startS["Spawn (6,1)"] --> moveS1["Move to (5,1)"]
        moveS1 --> plateB["Plate B (5,2)"]
        portalShift -.->|Updates Target to (3,4)| portalS["Portal (6,4)"]
        plateB --> doorS_access["Door Access (6,2)"]
        doorS_access --> tlS["Time Lock (6,3)"]
        tlS --> portalS
        portalS --> exitS["Shadow Exit (1,4)"]
    end
```

---

## 2. World Layouts and Coordinate Mapping

Chamber dimensions: $8 \times 6$ grid ($X \in [0, 7], Y \in [0, 5]$).

### Real World Matrix
```
Y\X  0   1   2   3   4   5   6   7
0   [.] [.] [.] [W] [.] [W] [.] [.]
1   [.] (P) [.] [W] [.] [W] [.] [.]
2   [W] (D) (A) [W] [.] [W] [.] [.]
3   [.] [.] (S) [W] [.] [.] [.] [.]
4   (S) (O) (S) [.] [.] (D) (E) [.]
5   [.] [.] [.] [W] [.] [W] [.] [.]
```
- `(P)` = Player Start `(1, 1)`
- `(E)` = Real Exit `(6, 4)`
- `(A)` = Plate A `pp-17-real` `(2, 2)` (triggers `se-17-portal-shift` and opens `door-17-shadow-access`)
- `(O)` = Portal `p-17-real` `(1, 4)` (destination: `(4, 4)`)
- `(D)` at `(1, 2)` = Timed Door `door-17-timed-real` (held by Shadow time lock)
- `(D)` at `(5, 4)` = Exit Door `door-17-real-exit` (unlocked by Plate B in Shadow World)
- `(S)` at `(0, 4)` = Switch `sw-17-real` (unlocks `door-17-shadow-exit`)
- `(S)` at `(2, 3..4)` = Moving Saw `saw-17-real` (patrol path `(2,3) <-> (2,4)`)

### Shadow World Matrix
```
Y\X  0   1   2   3   4   5   6   7
0   [.] [.] [W] [.] [W] [.] [.] [.]
1   [.] [.] [W] [.] [W] [.] (S) [.]
2   [.] [.] [W] [.] [W] (B) (D) [W]
3   [.] [.] [.] [.] [W] [.] (T) [.]
4   [.] (E) (D) [.] [.] [.] (O) [.]
5   [.] [.] [W] [.] [W] [.] [.] [.]
```
- `(S)` = Shadow Start `(6, 1)`
- `(E)` = Shadow Exit `(1, 4)`
- `(B)` = Plate B `pp-17-shadow` `(5, 2)` (unlocks `door-17-real-exit`)
- `(O)` = Portal `p-17-shadow` `(6, 4)` (initial dest: `(6, 1)`; shifted dest: `(3, 4)`)
- `(D)` at `(6, 2)` = Access Door `door-17-shadow-access` (unlocked by Plate A)
- `(D)` at `(2, 4)` = Exit Door `door-17-shadow-exit` (unlocked by `sw-17-real`)
- `(T)` at `(6, 3)` = Time Lock `tl-17-shadow` (freezes `door-17-timed-real` open)

---

## 3. Visual Progression & Playable Demonstration

````carousel
![Level 17 Initial Chamber](file:///C:/Users/tmpra/.gemini/antigravity/brain/a881bca6-897a-4587-8134-d40075d6bac2/phase8-level17-initial.png)
<!-- slide -->
![Dual Plates Coordination & Portal Shift](file:///C:/Users/tmpra/.gemini/antigravity/brain/a881bca6-897a-4587-8134-d40075d6bac2/phase8-level17-plates-surprise.png)
<!-- slide -->
![Simultaneous Portal Teleportation](file:///C:/Users/tmpra/.gemini/antigravity/brain/a881bca6-897a-4587-8134-d40075d6bac2/phase8-level17-portal-teleport.png)
<!-- slide -->
![Simultaneous Dual Exit Victory](file:///C:/Users/tmpra/.gemini/antigravity/brain/a881bca6-897a-4587-8134-d40075d6bac2/phase8-level17-complete.png)
````

1. **Initial Chamber (Turn 0):** Both characters spawn separated by thick architectural partition walls. Portals and exit doors are visible across the central void.
2. **Dual Plate Synchronization (Turn 2):** Real steps onto Plate A as Shadow steps onto Plate B. Plate A triggers `se-17-portal-shift`: a shockwave ripples across the screen and realigns the Shadow portal's coordinates to `(3, 4)`.
3. **Simultaneous Teleportation (Turn 7):** Real enters `p-17-real` while Shadow enters `p-17-shadow`. Both characters disappear and rematerialize on opposite sides of the central partition corridor.
4. **Synchronized Exit Arrival (Turn 11):** Both characters navigate the exit corridor and step onto `(6, 4)` (Real) and `(1, 4)` (Shadow) at the exact same turn.

---

## 4. Mechanical Rules & Turn-by-Turn Execution

| Turn | Input | Real Pos | Shadow Pos | Mechanics & Environmental State Changes |
| :---: | :---: | :---: | :---: | :--- |
| **0** | — | `(1, 1)` | `(6, 1)` | Chamber baseline. All access doors locked. |
| **1** | `right` | `(2, 1)` | `(5, 1)` | Initial lateral alignment toward pressure plates. |
| **2** | `down` | `(2, 2)` | `(5, 2)` | **Master Synchronization:** Real hits Plate A `pp-17-real` (unlocks `door-17-shadow-access` and triggers `se-17-portal-shift` realigning `p-17-shadow` to `(3,4)`). Shadow hits Plate B `pp-17-shadow` (unlocks `door-17-real-exit`). |
| **3** | `left` | `(1, 2)` | `(6, 2)` | Real steps to `(1, 2)`. Shadow enters open `door-17-shadow-access` at `(6, 2)`. |
| **4** | `down` | `(1, 3)` | `(6, 3)` | Real advances to `(1, 3)`. Shadow activates `tl-17-shadow` `(6, 3)`, freezing timed door open. |
| **5** | `right` | `(2, 3)` | `(5, 3)` | Calibrate position past saw line. |
| **6** | `left` | `(1, 3)` | `(6, 3)` | Real hits `sw-17-real` at `(0, 4)` route, unlocking `door-17-shadow-exit` at `(2, 4)`. |
| **7** | `down` | `(4, 4)` | `(3, 4)` | **Dual Portal Teleportation:** Real enters `p-17-real` at `(1, 4)` -> teleports to `(4, 4)`. Shadow enters `p-17-shadow` at `(6, 4)` -> teleports to shifted destination `(3, 4)`! |
| **8** | `up` | `(4, 3)` | `(3, 3)` | Evade saw sweep along row 4 corridor. |
| **9** | `right` | `(5, 4)` | `(2, 4)` | Both characters pass through their unlocked exit threshold doors (`(5, 4)` and `(2, 4)`). |
| **10** | `right` | `(6, 4)` | `(1, 4)` | Real advances onto exit column 6; Shadow advances onto exit column 1. |
| **11** | `down` | `(6, 4)` | `(1, 4)` | **Simultaneous Arrival:** Real reaches Real Exit `(6, 4)`; Shadow reaches Shadow Exit `(1, 4)`. **VICTORY.** |

---

## 5. Verification & Test Metrics

- **Automated Level Solver:** Verified across all 20 levels (`npm run validate:levels`). Level 17 solved in 11 steps, exploring 591 states with 0 search limits.
- **Trace Replay Verification:** Deterministic 11-step sequence with exact coordinate synchronization.
- **Unit Test Suite:** `tests/unit/Level17.test.ts` (3 tests passed in 98ms).
- **Playwright Browser E2E:** `tests/browser/level17.spec.ts` passed in 12.6s on Microsoft Edge with zero fatal console errors.
- **Regression Suite:** 34/34 test suites, 248/248 tests passing.
- **Static Analysis & Build:** TypeScript typecheck (`0 errors`), ESLint (`0 errors, 0 warnings`), and Vite production build passed.

---

> [!NOTE]
> Level 17 demonstrates the philosophical core of THE OTHER SIDE: characters cannot succeed in isolation. Standing by for user review and approval before proceeding to **Level 18 — The Paradox**.
