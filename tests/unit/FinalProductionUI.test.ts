import { describe, it, expect, vi } from 'vitest';

// Provide basic window stub for Phaser module loader in Node environment
if (typeof (global as any).window === 'undefined') {
  (global as any).window = {
    addEventListener: () => {},
    removeEventListener: () => {},
    location: { search: '', hostname: 'localhost' },
    navigator: { userAgent: 'node', maxTouchPoints: 0 },
    document: {
      createElement: () => ({ getContext: () => null }),
      documentElement: {},
    },
  };
}

import { ALL_GUIDE_OBJECTS } from '../../src/ui/ObjectGuideModal';

describe('Final Production UI & Object Guide Verification', () => {
  it('verifies all expected gameplay objects are registered in ALL_GUIDE_OBJECTS', () => {
    const ids = ALL_GUIDE_OBJECTS.map((o) => o.id);
    expect(ids).toContain('characters');
    expect(ids).toContain('exit');
    expect(ids).toContain('switch');
    expect(ids).toContain('door');
    expect(ids).toContain('saw');
    expect(ids).toContain('bomb');
    expect(ids).toContain('portal');
    expect(ids).toContain('laser_emitter');
    expect(ids).toContain('laser_mirror');
    expect(ids).toContain('laser_receiver');
    expect(ids).toContain('collapsing_floor');
    expect(ids).toContain('pressure_plate');
    expect(ids).toContain('destructible_wall');
    expect(ids).toContain('time_lock');
    expect(ids).toContain('movable_block');
    expect(ids).toContain('checkpoint');
  });

  it('verifies every guide entry provides comprehensive mechanical documentation', () => {
    for (const entry of ALL_GUIDE_OBJECTS) {
      expect(entry.name.length).toBeGreaterThan(3);
      expect(entry.description.length).toBeGreaterThan(10);
      expect(entry.howItWorks.length).toBeGreaterThan(10);
      expect(entry.effect.length).toBeGreaterThan(10);
      expect(entry.dangerOrLimitation.length).toBeGreaterThan(5);
      expect(['REAL WORLD', 'SHADOW WORLD', 'BOTH WORLDS']).toContain(entry.worldAvailability);
      expect(entry.crossWorldRelationship.length).toBeGreaterThan(10);
      expect(typeof entry.renderExactAsset).toBe('function');
    }
  });

  it('executes renderExactAsset for all guide objects without crashing on mock graphics', () => {
    const mockGraphics: any = {
      lineStyle: vi.fn().mockReturnThis(),
      fillStyle: vi.fn().mockReturnThis(),
      beginPath: vi.fn().mockReturnThis(),
      moveTo: vi.fn().mockReturnThis(),
      lineTo: vi.fn().mockReturnThis(),
      strokePath: vi.fn().mockReturnThis(),
      closePath: vi.fn().mockReturnThis(),
      fillPath: vi.fn().mockReturnThis(),
      fillCircle: vi.fn().mockReturnThis(),
      strokeCircle: vi.fn().mockReturnThis(),
      fillRect: vi.fn().mockReturnThis(),
      strokeRect: vi.fn().mockReturnThis(),
      fillRoundedRect: vi.fn().mockReturnThis(),
      strokeRoundedRect: vi.fn().mockReturnThis(),
      lineBetween: vi.fn().mockReturnThis(),
    };

    for (const entry of ALL_GUIDE_OBJECTS) {
      // Test Real World render
      expect(() => {
        entry.renderExactAsset(mockGraphics, 100, 100, 48, true, 0);
      }).not.toThrow();

      // Test Shadow World render
      expect(() => {
        entry.renderExactAsset(mockGraphics, 200, 100, 48, false, 1);
      }).not.toThrow();
    }
  });

  it('confirms categories cover all gameplay domains', () => {
    const categories = new Set(ALL_GUIDE_OBJECTS.map((o) => o.category));
    expect(categories.has('CHARACTERS')).toBe(true);
    expect(categories.has('HAZARDS')).toBe(true);
    expect(categories.has('MECHANISMS')).toBe(true);
    expect(categories.has('DIMENSIONAL')).toBe(true);
    expect(categories.has('ENVIRONMENT')).toBe(true);
  });
});
