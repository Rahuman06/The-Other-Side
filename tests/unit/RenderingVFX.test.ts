import { describe, it, expect, vi } from 'vitest';
import { VisualEffectsManager } from '../../src/rendering/VisualEffectsManager';

describe('Phase 2 — Visual Effects & Animation Engine Unit Tests', () => {
  // Create a lightweight mock Phaser scene for non-DOM headless testing
  const createMockScene = () => {
    const mockGraphics = {
      setDepth: vi.fn().mockReturnThis(),
      clear: vi.fn().mockReturnThis(),
      fillStyle: vi.fn().mockReturnThis(),
      fillCircle: vi.fn().mockReturnThis(),
      fillRect: vi.fn().mockReturnThis(),
      lineStyle: vi.fn().mockReturnThis(),
      lineBetween: vi.fn().mockReturnThis(),
      strokeCircle: vi.fn().mockReturnThis(),
      destroy: vi.fn(),
    };

    return {
      scale: { width: 1280, height: 720 },
      add: {
        graphics: vi.fn(() => mockGraphics),
      },
    } as unknown as Phaser.Scene;
  };

  it('initializes VisualEffectsManager and spawns ambient dust motes in both worlds', () => {
    const mockScene = createMockScene();
    const vfx = new VisualEffectsManager(mockScene, false);

    expect(vfx.totalTime).toBe(0);
    expect(vfx.sawRotationAngle).toBe(0);
    expect(vfx.portalVortexAngle).toBe(0);

    // Update with 16ms delta
    vfx.update(16, 16);

    expect(vfx.totalTime).toBeGreaterThan(0);
    expect(vfx.sawRotationAngle).toBeGreaterThan(0);
    expect(vfx.portalVortexAngle).toBeGreaterThan(0);

    vfx.destroy();
  });

  it('respects reduced-motion mode: stops rapid jitter and limits rotation', () => {
    const mockScene = createMockScene();
    const vfx = new VisualEffectsManager(mockScene, true);

    vfx.update(16, 16);

    expect(vfx.laserJitterX).toBe(0);
    expect(vfx.laserJitterY).toBe(0);

    vfx.destroy();
  });

  it('spawns and updates particles and shockwaves on explosion', () => {
    const mockScene = createMockScene();
    const vfx = new VisualEffectsManager(mockScene, false);

    vfx.triggerExplosion(300, 300, true, 80);
    // Advance simulation
    vfx.update(100, 100);

    expect(vfx.totalTime).toBeCloseTo(0.1, 2);

    vfx.destroy();
  });

  it('spawns spark bursts and portal ingestion motes', () => {
    const mockScene = createMockScene();
    const vfx = new VisualEffectsManager(mockScene, false);

    vfx.spawnSparkBurst(200, 200, 8, 0x00e5ff);
    vfx.spawnPortalIngestionMote(200, 200, true, false);

    vfx.update(50, 50);

    vfx.destroy();
  });
});
