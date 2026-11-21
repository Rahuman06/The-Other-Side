import { describe, it, expect, beforeEach } from 'vitest';
import { AudioContextManager } from '../../src/audio/AudioContextManager';
import { AtmosphericMusic } from '../../src/audio/AtmosphericMusic';
import { SoundEffects } from '../../src/audio/SoundEffects';
import { AudioManager } from '../../src/audio/AudioManager';
import { StorageManager } from '../../src/storage/StorageManager';

describe('Phase 4 — Thriller Audio Engine & Web Audio API Suite', () => {
  let storage: StorageManager;
  let audioMgr: AudioManager;

  beforeEach(() => {
    storage = new StorageManager();
    storage.resetProgress();
    audioMgr = AudioManager.getInstance();
    audioMgr.init(storage);
  });

  describe('AudioContextManager Lifecycle & Volume Controls', () => {
    it('provides a singleton instance with default volumes', () => {
      const ctxMgr = AudioContextManager.getInstance();
      expect(ctxMgr).toBeDefined();
      expect(ctxMgr.getMasterVolume()).toBe(0.85);
      expect(ctxMgr.getMusicVolume()).toBe(0.85);
      expect(ctxMgr.getSfxVolume()).toBe(0.85);
      expect(ctxMgr.isMuted()).toBe(false);
    });

    it('clamps volume inputs between 0.0 and 1.0', () => {
      const ctxMgr = AudioContextManager.getInstance();

      ctxMgr.setMasterVolume(1.5);
      expect(ctxMgr.getMasterVolume()).toBe(1.0);

      ctxMgr.setMasterVolume(-0.5);
      expect(ctxMgr.getMasterVolume()).toBe(0.0);

      ctxMgr.setMusicVolume(2.0);
      expect(ctxMgr.getMusicVolume()).toBe(1.0);

      ctxMgr.setSfxVolume(-1.0);
      expect(ctxMgr.getSfxVolume()).toBe(0.0);

      // Restore
      ctxMgr.setMasterVolume(0.85);
      ctxMgr.setMusicVolume(0.85);
      ctxMgr.setSfxVolume(0.85);
    });

    it('toggles muted state and respects mute on master gain', () => {
      const ctxMgr = AudioContextManager.getInstance();
      ctxMgr.setMuted(true);
      expect(ctxMgr.isMuted()).toBe(true);

      ctxMgr.setMuted(false);
      expect(ctxMgr.isMuted()).toBe(false);
    });
  });

  describe('AtmosphericMusic Thriller Engine', () => {
    it('instantiates and supports all gameplay audio states without throwing', () => {
      const music = new AtmosphericMusic();

      expect(() => {
        music.start('menu', 'THE BEGINNING');
        music.setState('normal');
        music.setState('hazard_proximity');
        music.setState('bomb_countdown');
        music.setState('surprise');
        music.setState('transformation');
        music.setState('death');
        music.setState('respawn');
        music.setState('level_complete');
        music.setState('ending');
      }).not.toThrow();

      music.stop();
    });

    it('supports chapter harmonic profiles', () => {
      const music = new AtmosphericMusic();

      expect(() => {
        music.start('normal', 'THE BEGINNING');
        music.setChapter('THE CONNECTION');
        music.setChapter('THE SEPARATION');
        music.setChapter('THE REFLECTION');
        music.setChapter('THE TRUTH');
      }).not.toThrow();

      music.stop();
    });

    it('safely stops and cleans up active timers and nodes', () => {
      const music = new AtmosphericMusic();
      music.start('menu', 'THE BEGINNING');
      expect(() => music.stop()).not.toThrow();
      expect(() => music.stop()).not.toThrow(); // Idempotent stop
    });
  });

  describe('SoundEffects Procedural Synthesis Suite', () => {
    it('dispatches legacy sound names cleanly', () => {
      const sfx = new SoundEffects(false);

      expect(() => {
        sfx.play('step');
        sfx.play('bump');
        sfx.play('switch');
        sfx.play('checkpoint');
        sfx.play('death');
        sfx.play('win');
        sfx.play('ending');
      }).not.toThrow();
    });

    it('synthesizes differentiated footsteps for Real and Shadow worlds', () => {
      const sfx = new SoundEffects(false);
      expect(() => sfx.playStep(true)).not.toThrow();
      expect(() => sfx.playStep(false)).not.toThrow();
    });

    it('synthesizes all puzzle object-specific sound effects', () => {
      const sfx = new SoundEffects(false);

      expect(() => {
        sfx.playPressurePlate(true);
        sfx.playPressurePlate(false);
        sfx.playDoor(true);
        sfx.playDoor(false);
        sfx.playLaser('active');
        sfx.playLaser('impact');
        sfx.playSaw('whir');
        sfx.playSaw('impact');
        sfx.playBombTick(3);
        sfx.playBombTick(1);
        sfx.playBombExplosion();
        sfx.playPortalTravel();
        sfx.playMirror();
        sfx.playMagnetic();
        sfx.playTimeLock(true);
        sfx.playTimeLock(false);
        sfx.playCollapsingFloor(1);
        sfx.playCollapsingFloor(2);
        sfx.playMovingWall();
        sfx.playCheckpoint();
        sfx.playExitArrival();
        sfx.playDeath();
        sfx.playRespawn();
        sfx.playWin();
      }).not.toThrow();
    });

    it('synthesizes unexpected surprise event sounds', () => {
      const sfx = new SoundEffects(false);

      expect(() => {
        sfx.playSurpriseImpact();
        sfx.playMechanicalWarning();
        sfx.playEnvironmentalTransformation();
        sfx.playPortalDistortion();
        sfx.playHiddenMechanism();
      }).not.toThrow();
    });

    it('suppresses audio output when muted', () => {
      const sfx = new SoundEffects(true);
      expect(sfx.isMuted()).toBe(true);

      // Verify execution completes safely without triggering audio nodes
      expect(() => {
        sfx.playStep(true);
        sfx.playBombExplosion();
        sfx.playSurpriseImpact();
      }).not.toThrow();
    });
  });

  describe('AudioManager Persistent Coordination', () => {
    it('persists volume adjustments directly into StorageManager', () => {
      audioMgr.setMasterVolume(0.8);
      expect(storage.getProgress().masterVolume).toBe(0.8);

      audioMgr.setMusicVolume(0.6);
      expect(storage.getProgress().musicVolume).toBe(0.6);

      audioMgr.setSfxVolume(0.9);
      expect(storage.getProgress().sfxVolume).toBe(0.9);

      audioMgr.setMuted(true);
      expect(storage.getProgress().muted).toBe(true);
    });

    it('coordinates music state transitions and stopping all music', () => {
      expect(() => {
        audioMgr.playMenuMusic();
        audioMgr.playGameMusic('THE SEPARATION');
        audioMgr.setGameplayState('hazard_proximity');
        audioMgr.stopAllMusic();
      }).not.toThrow();
    });
  });
});
