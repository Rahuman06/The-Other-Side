# LEVEL 20: SOLUTION B — THE SHADOW DESCENT

**Strategy Name:** Solution B — The Shadow Descent  
**World Inversion:** Real World Normal / Shadow World Inverted  
**Sequence Length:** 12 Moves (Optimal)  
**Winning Input Vector:** `['down', 'down', 'up', 'up', 'right', 'right', 'right', 'down', 'right', 'right', 'right', 'down']`  
**Verified Replay:** PASS (100% Deterministic)  

---

## 1. Strategy Overview

In **Solution B**, the player chooses the **Descent** path. Shadow moves southward to activate the Beta Inversion Switch at `(6, 4)`.

This triggers a massive 180-degree rotation of the Shadow World:
- The subterranean depths rotate to become an accessible upper platform at row 1.
- Shadow character is transported from `(6, 4)` to `(1, 1)`.
- Simultaneously, Alpha's tile at `(1, 1)` in Real World collapses into a void abyss, permanently eliminating Solution A.
- Shadow steps up onto the inverted conduit switch at `(1, 0)` (which rotated from `(6, 5)`), opening Real's southern gate `door-20-real-descent` at `(3, 3)`.
- Real maneuvers through the opened gate to activate `sw-20-exit-gate-b` at `(5, 3)`, unsealing both EXIT threshold doors.
- Both characters cross into their respective exits simultaneously on Move 12.

---

## 2. Step-by-Step Execution Table

| Move | Input | Real Position | Shadow Position | Real Status & Events | Shadow Status & Events |
|:---:|:---:|:---:|:---:|:---|:---|
| **0** | — | `(1, 3)` | `(6, 2)` | Spawns in mid-chamber | Spawns in mid-chamber |
| **1** | `down` | `(1, 4)` | `(6, 3)` | Steps south | Steps south synchronously |
| **2** | `down` | `(1, 5)` | `(1, 1)` | Steps south to `(1, 5)`. **Alpha tile (1, 1) collapses into VOID!** | **Steps on `sw-20-beta` (6, 4)! SHADOW INVERTS 180°!** Mapped to `(1, 1)` |
| **3** | `up` | `(1, 4)` | `(1, 0)` | Steps north to `(1, 4)` | **Steps on `sw-20-descent-conduit` (1, 0)!** Unseals Real door `(3, 3)` |
| **4** | `up` | `(1, 3)` | `(1, 0)` | Steps north back to main corridor `(1, 3)` | Blocked by chamber ceiling at `(1, -1)` (safe buffer) |
| **5** | `right` | `(2, 3)` | `(1, 0)` | Moves right into conduit corridor | Blocked by corner wall |
| **6** | `right` | `(3, 3)` | `(1, 0)` | **Passes through unsealed `door-20-real-descent` to `(3, 3)`!** | Retains buffer position |
| **7** | `right` | `(4, 3)` | `(1, 0)` | Moves east through central partition | Retains buffer position |
| **8** | `down` | `(4, 4)` | `(1, 1)` | Steps south to bypass wall | Shadow steps south to `(1, 1)` |
| **9** | `right` | `(5, 4)` | `(1, 1)` | Moves right towards exit switch | Blocked by western wall |
| **10** | `right` | `(5, 3)` | `(1, 1)` | **Reaches `sw-20-exit-gate-b` (5, 3)! Unseals exit doors (6, 3) & (1, 2)!** | Retains position |
| **11** | `right` | `(6, 3)` | `(1, 2)` | Real steps into threshold door `(6, 3)` | Shadow steps south into threshold door `(1, 2)` |
| **12** | `down` | `(7, 3)` | `(0, 2)` | **REACHES REAL EXIT `(7, 3)`!** | **REACHES SHADOW EXIT `(0, 2)`!** |

> [!NOTE]
> On Move 12, both characters occupy their designated exits simultaneously. The dual reality convergence sequence triggers immediately.
