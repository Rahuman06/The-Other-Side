# LEVEL 20: SOLUTION A — THE MIRRORED ASCENT

**Strategy Name:** Solution A — The Mirrored Ascent  
**World Inversion:** Real World Inverted / Shadow World Normal  
**Sequence Length:** 12 Moves (Optimal)  
**Winning Input Vector:** `['up', 'up', 'down', 'right', 'down', 'right', 'up', 'right', 'up', 'right', 'right', 'right']`  
**Verified Replay:** PASS (100% Deterministic)  

---

## 1. Strategy Overview

In **Solution A**, the player chooses the **Ascent** path. Real moves northward to activate the Alpha Inversion Switch at `(1, 1)`. 

This triggers a massive 180-degree rotation of the Real World:
- The upper ceiling terrace rotates to become an accessible lower bridge at row 4.
- Real character is transported from `(1, 1)` to `(6, 4)`.
- Simultaneously, Beta's tile at `(6, 4)` in Shadow World collapses into a void abyss, permanently eliminating Solution B.
- Real steps down onto the inverted conduit switch at `(6, 5)` (which rotated from `(1, 0)`), opening Shadow's northern gate `door-20-shadow-ascent` at `(4, 2)`.
- Shadow maneuvers through the opened gate to activate `sw-20-exit-gate-a` at `(2, 2)`, unsealing both EXIT threshold doors.
- Both characters cross into their respective exits simultaneously on Move 12.

---

## 2. Step-by-Step Execution Table

| Move | Input | Real Position | Shadow Position | Real Status & Events | Shadow Status & Events |
|:---:|:---:|:---:|:---:|:---|:---|
| **0** | — | `(1, 3)` | `(6, 2)` | Spawns in mid-chamber | Spawns in mid-chamber |
| **1** | `up` | `(1, 2)` | `(6, 1)` | Steps north | Steps north synchronously |
| **2** | `up` | `(6, 4)` | `(6, 0)` | **Steps on `sw-20-alpha` (1, 1)! REAL INVERTS 180°!** Mapped to `(6, 4)` | Steps north to `(6, 0)`. **Beta tile (6, 4) collapses into VOID!** |
| **3** | `down` | `(6, 5)` | `(6, 1)` | **Steps on `sw-20-ascent-conduit` (6, 5)!** Unseals Shadow door `(4, 2)` | Steps south to `(6, 1)` |
| **4** | `right` | `(7, 5)` | `(5, 1)` | Moves right into eastern alcove | Moves left (mirrored) into conduit column |
| **5** | `down` | `(7, 5)` | `(5, 2)` | Blocked by wall at `(7, 6)` (safe buffer) | Steps south to `(5, 2)` directly before gate |
| **6** | `right` | `(7, 5)` | `(4, 2)` | Blocked by chamber boundary | **Passes through unsealed `door-20-shadow-ascent` to `(4, 2)`!** |
| **7** | `up` | `(7, 4)` | `(4, 1)` | Steps north along eastern bridge | Steps north into corridor bypass |
| **8** | `right` | `(7, 4)` | `(3, 1)` | Blocked by boundary | Steps left to `(3, 1)` |
| **9** | `up` | `(7, 4)` | `(3, 1)` | Blocked by upper boundary | Blocked by northern wall |
| **10** | `right` | `(6, 4)` | `(2, 1)` | Steps west towards exit threshold | Steps left to `(2, 1)` |
| **11** | `right` | `(6, 3)` | `(1, 2)` | **Reaches `sw-20-exit-gate-a` (2, 2)! Unseals exit doors (6, 3) & (1, 2)!** Real enters door | Shadow steps into threshold door `(1, 2)` |
| **12** | `right` | `(7, 3)` | `(0, 2)` | **REACHES REAL EXIT `(7, 3)`!** | **REACHES SHADOW EXIT `(0, 2)`!** |

> [!NOTE]
> On Move 12, both characters occupy their designated exits simultaneously. The dual reality convergence sequence triggers immediately.
