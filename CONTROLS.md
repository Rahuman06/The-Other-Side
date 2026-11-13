# CONTROLS — THE OTHER SIDE

*THE OTHER SIDE* supports seamless, lag-free control schemes tailored for desktop, tablet, and mobile devices.

---

## 1. Desktop Controls (Keyboard)

### Directional Movement
Both characters receive input simultaneously:
- **Up**: `W` or `Up Arrow` (Both characters move UP)
- **Down**: `S` or `Down Arrow` (Both characters move DOWN)
- **Left**: `A` or `Left Arrow` (Player moves LEFT, Shadow moves RIGHT)
- **Right**: `D` or `Right Arrow` (Player moves RIGHT, Shadow moves LEFT)

### System & Navigation Controls
- **Restart Level**: `R` (Instant restart without losing checkpoint or unlocked progress)
- **Pause / Resume**: `P` or `Escape` (Opens pause menu, halts gameplay lifecycle)
- **Confirm / Start / Continue**: `Space` or `Enter`
- **Menu Navigation**: Click or press `Space` / `Enter` on UI buttons

---

## 2. Mobile & Tablet Controls (Touch Interface)

When accessed on mobile or tablet devices, an on-screen tactile controller HUD automatically renders at the bottom of the viewport:

### Directional Touch D-Pad (Bottom-Left / Centered Ergonomics)
- **[ ▲ ] Button**: Move Up
- **[ ▼ ] Button**: Move Down
- **[ ◀ ] Button**: Move Left (Inverts for Shadow)
- **[ ▶ ] Button**: Move Right (Inverts for Shadow)

### Quick Action Buttons (Top HUD)
- **PAUSE Button**: Toggles pause modal and stops gameplay timer
- **RESTART Button**: Restarts current level session immediately

### Touch Engine Features
- **Touch-Action**: CSS `touch-action: none` prevents accidental pinch-zooming, double-tap zooming, and pull-to-refresh gestures.
- **Pointer Cancellation**: Seamlessly handles touch cancellation events (`pointercancel`, `pointerup`) to prevent sticky movement.
- **Multi-Touch Support**: Supports simultaneous taps and fast directional transitions.

---

## 3. Gamepad Support (Browser Standard)
- **D-Pad / Left Analog Stick**: Directional movement
- **A / Cross Button**: Confirm / Start
- **Start / Options Button**: Pause / Resume
- **Y / Triangle Button**: Quick Restart

---

## 4. Accessibility & Comfort
- **Reduced Motion**: Available in the Settings menu; shortens tween durations and eliminates screen shake for motion-sensitive players.
- **Audio Toggle**: One-click mute toggle accessible from the Main Menu and Pause screen.
- **Monochrome High Contrast**: WCAG AAA compliant contrast ratio (21:1) across all puzzle elements and text.
