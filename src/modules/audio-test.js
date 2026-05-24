// src/modules/audio-test.js
// Howler.js audio test module for Perchance environment
import { Howl } from 'howler';
import { VERSION } from '../constants.js';

// Base URL for audio files (hosted on GitHub, served via jsDelivr CDN with CORS)
const AUDIO_BASE = `https://cdn.jsdelivr.net/gh/Fahell/test-perchance-git@${VERSION}/assets/audio`;

// Audio files hosted in the repository
const AUDIO_URLS = {
  click: `${AUDIO_BASE}/click.wav`,
  coin: `${AUDIO_BASE}/coin.wav`,
  explosion: `${AUDIO_BASE}/explosion.wav`,
  music: `${AUDIO_BASE}/music.wav`,
  sprite: `${AUDIO_BASE}/music.wav` // Using music as sprite example
};

// Sound instances cache
const sounds = {};
let globalVolume = 0.5;

// Initialize a Howl instance
function createSound(name, options = {}) {
  if (sounds[name]) return sounds[name];
  
  const defaultOptions = {
    src: [AUDIO_URLS[name]],
    volume: globalVolume,
    html5: true, // Force HTML5 Audio for better compatibility
    preload: true,
    onerror: (id, error) => {
      console.error(`🔊 [Audio] Error loading ${name}:`, error);
      console.error(`   URL: ${AUDIO_URLS[name]}`);
    },
    onload: () => {
      console.log(`✅ [Audio] Loaded: ${name}`);
    },
    onplay: () => {
      console.log(`▶️ [Audio] Playing: ${name}`);
    }
  };
  
  sounds[name] = new Howl({ ...defaultOptions, ...options });
  return sounds[name];
}

// Play a sound effect
export function playSFX(name) {
  try {
    const sound = createSound(name);
    sound.play();
    console.log(`🔊 [Audio] Playing SFX: ${name}`);
    return true;
  } catch (error) {
    console.error(`❌ [Audio] Failed to play ${name}:`, error.message);
    return false;
  }
}

// Play music with loop
export function playMusic(name = 'music') {
  try {
    const sound = createSound(name, {
      loop: true,
      volume: globalVolume * 0.5 // Music quieter than SFX
    });
    sound.play();
    console.log(`🎵 [Audio] Playing music: ${name} (loop: true)`);
    return true;
  } catch (error) {
    console.error(`❌ [Audio] Failed to play music:`, error.message);
    return false;
  }
}

// Stop all sounds
export function stopAll() {
  try {
    Object.values(sounds).forEach(sound => {
      if (sound.playing()) {
        sound.stop();
      }
    });
    console.log('🔇 [Audio] All sounds stopped');
    return true;
  } catch (error) {
    console.error('❌ [Audio] Failed to stop sounds:', error.message);
    return false;
  }
}

// Set global volume (0-1)
export function setVolume(level) {
  globalVolume = Math.max(0, Math.min(1, level));
  Object.values(sounds).forEach(sound => {
    sound.volume(globalVolume);
  });
  console.log(`🔊 [Audio] Global volume: ${(globalVolume * 100).toFixed(0)}%`);
  return globalVolume;
}

// Get current volume
export function getVolume() {
  return globalVolume;
}

// Pause/Resume music
export function toggleMusic(name = 'music') {
  try {
    const sound = sounds[name];
    if (!sound) return false;
    
    if (sound.playing()) {
      sound.pause();
      console.log(`⏸️ [Audio] Paused: ${name}`);
    } else {
      sound.play();
      console.log(`▶️ [Audio] Resumed: ${name}`);
    }
    return true;
  } catch (error) {
    console.error('❌ [Audio] Toggle failed:', error.message);
    return false;
  }
}

// Test sprite functionality (multiple sounds in one file)
export function testSprite() {
  try {
    // Create a sprite sound
    if (!sounds.sprite) {
      sounds.sprite = new Howl({
        src: [AUDIO_URLS.sprite],
        sprite: {
          start: [0, 2000],      // 0-2s
          middle: [2000, 4000],  // 2-4s
          end: [4000, 6000]      // 4-6s
        },
        volume: globalVolume,
        html5: true,
        onload: () => console.log('✅ [Audio] Sprite loaded'),
        onerror: (id, error) => console.error('❌ [Audio] Sprite error:', error)
      });
    }
    
    sounds.sprite.play('middle');
    console.log('🎵 [Audio] Playing sprite: middle (2-4s)');
    return true;
  } catch (error) {
    console.error('❌ [Audio] Sprite test failed:', error.message);
    return false;
  }
}

// Check if Howler is available
export function checkAvailability() {
  return {
    available: typeof Howl !== 'undefined',
    webAudio: Howler.usingWebAudio,
    html5Audio: !Howler.usingWebAudio,
    code: 'audio-test'
  };
}

// Cleanup all sounds
export function cleanup() {
  stopAll();
  Object.keys(sounds).forEach(key => {
    sounds[key].unload();
    delete sounds[key];
  });
  console.log('🧹 [Audio] All sounds unloaded');
}

// Module info
export const info = {
  name: 'Howler.js Audio Test',
  version: '1.0.0',
  description: 'Audio playback with Howler.js for Perchance',
  author: 'Fahell'
};
