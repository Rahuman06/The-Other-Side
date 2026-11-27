import Phaser from 'phaser';
import { FocusableItem, KeyboardNavManager } from './KeyboardNavManager';
import { AudioManager } from '../audio/AudioManager';

export interface VolumeSliderOptions {
  scene: Phaser.Scene;
  container: Phaser.GameObjects.Container;
  id: string;
  label: string;
  y: number;
  modalW: number;
  value: number;
  onChange: (value: number) => void;
  hitZonesOut?: Phaser.GameObjects.Zone[];
}

export interface VolumeSliderControl {
  focusItem: FocusableItem;
  setValue: (value: number, silent?: boolean) => void;
  getValue: () => number;
}

/**
 * Reusable accessible volume slider for both Main Menu Settings and In-Game SettingsModal.
 * Supports pointer tap-to-seek, smooth drag anywhere across the track, hover glow,
 * non-overlapping 46px vertical touch target (for >= 54px row pitch), and keyboard activation.
 */
export function createVolumeSlider(opts: VolumeSliderOptions): VolumeSliderControl {
  const { scene, container, id, label, y, modalW, onChange, hitZonesOut } = opts;

  let currentValue = Math.max(0, Math.min(1, opts.value));
  let isHovered = false;
  let isDragging = false;

  const trackW = Math.min(182, modalW - 246);
  const trackX = 24;
  const trackLeft = trackX - trackW / 2;
  const trackRight = trackX + trackW / 2;
  const labelX = -modalW / 2 + 32;
  const valueX = modalW / 2 - 32;

  const labelText = scene.add
    .text(labelX, y, label, {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '12.5px',
      fontStyle: 'bold',
      color: '#D8D8D8',
      letterSpacing: 1.1,
    })
    .setOrigin(0, 0.5);
  container.add(labelText);

  const trackGfx = scene.add.graphics();
  container.add(trackGfx);

  const pctText = scene.add
    .text(valueX, y, `${Math.round(currentValue * 100)}%`, {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#FFFFFF',
      letterSpacing: 0.8,
    })
    .setOrigin(1, 0.5);
  container.add(pctText);

  const renderSlider = () => {
    trackGfx.clear();
    const fillW = trackW * currentValue;
    const knobX = trackLeft + fillW;

    // Background groove
    trackGfx.fillStyle(0x202020, 0.95);
    trackGfx.fillRoundedRect(trackLeft, y - 3.5, trackW, 7, 3.5);
    trackGfx.lineStyle(1, isHovered || isDragging ? 0x666666 : 0x383838, 0.9);
    trackGfx.strokeRoundedRect(trackLeft, y - 3.5, trackW, 7, 3.5);

    // Active cyan level bar
    if (fillW > 0.5) {
      trackGfx.fillStyle(0x00e5ff, isHovered || isDragging ? 1.0 : 0.88);
      trackGfx.fillRoundedRect(trackLeft, y - 3.5, fillW, 7, 3.5);
    }

    // Draggable thumb handle
    const knobRadius = isDragging ? 9 : isHovered ? 8.5 : 7.5;
    trackGfx.fillStyle(0xffffff, 1);
    trackGfx.fillCircle(knobX, y, knobRadius);
    trackGfx.lineStyle(2, 0x00e5ff, isHovered || isDragging ? 1 : 0.85);
    trackGfx.strokeCircle(knobX, y, knobRadius);
  };

  renderSlider();

  const updateFromValue = (val: number, silent: boolean) => {
    const clamped = Math.round(Math.max(0, Math.min(1, val)) * 100) / 100;
    const changed = Math.abs(clamped - currentValue) > 0.001;
    currentValue = clamped;
    pctText.setText(`${Math.round(currentValue * 100)}%`);
    renderSlider();
    if (!silent && changed) {
      onChange(currentValue);
    }
  };

  const applyPointerX = (pointerX: number) => {
    const localX = pointerX - container.x;
    const ratio = (localX - trackLeft) / (trackRight - trackLeft);
    updateFromValue(ratio, false);
  };

  // Non-overlapping 46px height zone across slider track + value area
  const hitW = trackW + 34;
  const hit = scene.add
    .zone(trackX, y, hitW, 46)
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true });

  hit.on('pointerover', () => {
    isHovered = true;
    renderSlider();
    KeyboardNavManager.getInstance().setFocusById(id);
  });

  hit.on('pointerout', () => {
    isHovered = false;
    if (!isDragging) {
      renderSlider();
    }
  });

  hit.on(
    'pointerdown',
    (pointer: Phaser.Input.Pointer, _lx: number, _ly: number, event: Phaser.Types.Input.EventData) => {
      if (event && event.stopPropagation) event.stopPropagation();
      isDragging = true;
      KeyboardNavManager.getInstance().setFocusById(id);
      AudioManager.getInstance().sfx.playUiClick();
      applyPointerX(pointer.x);
    }
  );

  const onSceneMove = (pointer: Phaser.Input.Pointer) => {
    if (!isDragging || !container.visible || !hit.input?.enabled) {
      if (isDragging && (!container.visible || !hit.input?.enabled)) {
        isDragging = false;
        renderSlider();
      }
      return;
    }
    if (!pointer.isDown) {
      isDragging = false;
      renderSlider();
      return;
    }
    applyPointerX(pointer.x);
  };

  const onSceneUp = () => {
    if (!isDragging) return;
    isDragging = false;
    renderSlider();
  };

  scene.input.on('pointermove', onSceneMove);
  scene.input.on('pointerup', onSceneUp);
  scene.input.on('pointerupoutside', onSceneUp);

  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    scene.input.off('pointermove', onSceneMove);
    scene.input.off('pointerup', onSceneUp);
    scene.input.off('pointerupoutside', onSceneUp);
  });

  container.add(hit);
  hitZonesOut?.push(hit);

  const focusItem: FocusableItem = {
    id,
    getBounds: () => ({
      x: container.x + trackX,
      y: container.y + y,
      width: trackW + 24,
      height: 36,
    }),
    onActivate: () => {
      AudioManager.getInstance().sfx.playUiClick();
      // Keyboard step cycle: increments by 15% (wraps 100% -> 0%) for accessible slider control
      const next = currentValue >= 0.99 ? 0 : Math.min(1, currentValue + 0.15);
      updateFromValue(next, false);
    },
  };

  return {
    focusItem,
    setValue: (val: number, silent = true) => updateFromValue(val, silent),
    getValue: () => currentValue,
  };
}
