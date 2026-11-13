import { describe, it, expect } from 'vitest';
import { GAME_WIDTH, GAME_HEIGHT, PALETTE, ANIMATION } from '@/core/constants';

describe('Phase 02 - Monochrome Visual System Configuration', () => {
  it('defines logical 1280 × 720 canvas dimensions', () => {
    expect(GAME_WIDTH).toBe(1280);
    expect(GAME_HEIGHT).toBe(720);
  });

  it('configures strict Real World palette values', () => {
    expect(PALETTE.real.backgroundHex).toBe('#FFFFFF');
    expect(PALETTE.real.characterHex).toBe('#080808');
    expect(PALETTE.real.wallsHex).toBe('#171717');
    expect(PALETTE.real.floorHex).toBe('#F2F2F2');
    expect(PALETTE.real.text).toBe('#171717');
    expect(PALETTE.real.secondaryHex).toBe('#888888');
  });

  it('configures strict Shadow World palette values', () => {
    expect(PALETTE.shadow.backgroundHex).toBe('#101010');
    expect(PALETTE.shadow.characterHex).toBe('#FFFFFF');
    expect(PALETTE.shadow.wallsHex).toBe('#F2F2F2');
    expect(PALETTE.shadow.floorHex).toBe('#171717');
    expect(PALETTE.shadow.text).toBe('#FFFFFF');
    expect(PALETTE.shadow.secondaryHex).toBe('#AAAAAA');
  });

  it('defines subtle divider color', () => {
    expect(PALETTE.dividerHex).toBe('#333333');
  });

  it('targets 120ms animation tween duration', () => {
    expect(ANIMATION.MOVE_DURATION).toBe(120);
  });
});
