# MOBILE LANDSCAPE LAYOUT REPORT
## THE OTHER SIDE — TWO WORLDS. ONE MIND.

**System:** Mobile Landscape Layout, Screen Orientation & Viewport Optimization  
**Date:** November 2026  
**Status:** PASSED & FULLY VERIFIED  

---

### 1. Landscape Presentation Architecture

*THE OTHER SIDE* is architecturally engineered around simultaneous dual-world visualization:
- **Left Half ($x: 0 \rightarrow 640$):** Real World (monochrome light aesthetic, inverted horizontal movement).
- **Right Half ($x: 640 \rightarrow 1280$):** Shadow World (monochrome dark aesthetic, synchronized vertical movement).
- **Center Line ($x = 640$):** Central dimensional threshold with energy pulse.

In portrait orientation on a phone, placing two side-by-side worlds severely compressed the game, reducing the playable height to only ~219px and generating ~74% dead space. 

By pivoting to **Automatic Landscape Presentation**, the game canvas expands to fill the full height ($100\text{dvh}$) and width ($100\text{vw}$) of the device screen, delivering:
1. **Readable Game Elements:** Grid tiles, wall borders, character silhouettes, doors, keys, and traps are large, sharp, and easily discernible.
2. **Balanced Side-by-Side View:** Both worlds are displayed simultaneously with balanced lighting and symmetry.
3. **Optimized Screen Area:** Eliminates excessive black margins while maintaining the native 16:9 canvas aspect ratio.

---

### 2. Automatic Orientation & Device Rotation Overlay

#### 2.1 Screen Orientation API Integration
Upon the player's initial touch interaction, the game invokes:
```typescript
if (typeof screen !== 'undefined' && 'orientation' in screen) {
  const orientation = screen.orientation as ScreenOrientation & {
    lock?: (o: string) => Promise<void>;
  };
  if (typeof orientation.lock === 'function') {
    orientation.lock('landscape').catch(() => {
      // Gracefully ignored on browsers restricting programmatic lock (e.g., iOS Safari)
    });
  }
}
```

#### 2.2 Themed Device Rotation Overlay (`#orientation-overlay`)
For browsers that restrict programmatic orientation locking (such as iOS Safari or non-fullscreen Android tabs):
- When held in **Portrait orientation** on mobile or tablet devices ($\le 1024\text{px}$), the screen presents a themed rotation overlay:
  - Deep black `#000000` backdrop.
  - Minimalist animated smartphone icon rotating $90^\circ$ into landscape with glowing cyan accent.
  - Clear typography: **ROTATE YOUR DEVICE TO PLAY**
  - Subtitle: **TWO WORLDS. ONE MIND. DESIGNED FOR LANDSCAPE GAMEPLAY.**
- As soon as the user rotates their device to landscape, CSS media queries (`@media (orientation: portrait)`) immediately and automatically dismiss the overlay without reloading or interrupting game state.
- Completely suppressed on desktop computers with fine mouse pointers:
  ```css
  @media (hover: hover) and (pointer: fine) and (min-width: 1025px) {
    .orientation-overlay {
      display: none !important;
    }
  }
  ```

---

### 3. Multi-Device Landscape Viewport Verification Matrix

| Device Profile | Native Resolution | Landscape Viewport (CSS px) | Canvas Dimensions (CSS px) | Side Clearance (per side) | Verification Status |
|---|---|---|---|---|---|
| **iPhone 13 / 14 / 15** | 1170 × 2532 | 844 × 390 | 693.3 × 390.0 | 75.3 px | **PASSED** |
| **iPhone 14 / 15 Pro Max** | 1290 × 2796 | 932 × 430 | 764.4 × 430.0 | 83.8 px | **PASSED** |
| **iPhone SE (3rd Gen)** | 750 × 1334 | 667 × 375 | 666.7 × 375.0 | 0.2 px (Full fit) | **PASSED** |
| **Samsung Galaxy S22** | 1080 × 2400 | 800 × 360 | 640.0 × 360.0 | 80.0 px | **PASSED** |
| **Google Pixel 7 / 8** | 1080 × 2400 | 915 × 412 | 732.4 × 412.0 | 91.3 px | **PASSED** |
| **iPad Mini / Air** | 1620 × 2160 | 1024 × 768 | 1024.0 × 576.0 | 0 px (Top/Bottom 96px) | **PASSED** |

---

### 4. Safe-Area Inset Protection
All layout anchors respect CSS safe-area insets (`env(safe-area-inset-left)`, `env(safe-area-inset-right)`, `env(safe-area-inset-bottom)`), ensuring that iPhone Dynamic Islands, notch cameras, and Android system navigation bars never overlap game graphics or control buttons.
