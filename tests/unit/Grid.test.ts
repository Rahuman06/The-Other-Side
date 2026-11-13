import { describe, it, expect } from 'vitest';
import { GridUtils } from '@/logic/Grid';

describe('Unit - Grid Coordinate Calculations', () => {
  it('correctly compares positions', () => {
    expect(GridUtils.isSamePosition({ x: 2, y: 3 }, { x: 2, y: 3 })).toBe(true);
    expect(GridUtils.isSamePosition({ x: 2, y: 3 }, { x: 2, y: 4 })).toBe(false);
  });

  it('mirrors shadow horizontal movement opposite to real character', () => {
    const origin = { x: 3, y: 3 };
    expect(GridUtils.getRealTargetPosition(origin, 'right')).toEqual({ x: 4, y: 3 });
    expect(GridUtils.getShadowTargetPosition(origin, 'right')).toEqual({ x: 2, y: 3 });

    expect(GridUtils.getRealTargetPosition(origin, 'left')).toEqual({ x: 2, y: 3 });
    expect(GridUtils.getShadowTargetPosition(origin, 'left')).toEqual({ x: 4, y: 3 });
  });

  it('moves both characters synchronously in vertical directions', () => {
    const origin = { x: 3, y: 3 };
    expect(GridUtils.getRealTargetPosition(origin, 'up')).toEqual({ x: 3, y: 2 });
    expect(GridUtils.getShadowTargetPosition(origin, 'up')).toEqual({ x: 3, y: 2 });

    expect(GridUtils.getRealTargetPosition(origin, 'down')).toEqual({ x: 3, y: 4 });
    expect(GridUtils.getShadowTargetPosition(origin, 'down')).toEqual({ x: 3, y: 4 });
  });
});
