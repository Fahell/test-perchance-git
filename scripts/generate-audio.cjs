// Generate simple audio files for testing
const fs = require('fs');
const path = require('path');

// Generate a simple WAV file with a sine wave
function generateWav(filename, frequency, duration, sampleRate = 44100) {
  const numSamples = sampleRate * duration;
  const numChannels = 2;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * bitsPerSample / 8;
  const blockAlign = numChannels * bitsPerSample / 8;
  const dataSize = numSamples * blockAlign;
  const fileSize = 36 + dataSize;
  
  const buffer = Buffer.alloc(44 + dataSize);
  
  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(fileSize, 4);
  buffer.write('WAVE', 8);
  
  // fmt chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // chunk size
  buffer.writeUInt16LE(1, 20); // PCM format
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  
  // data chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  
  // Generate sine wave samples
  const amplitude = 0.5;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const sample = Math.sin(2 * Math.PI * frequency * t) * amplitude;
    const intSample = Math.floor(sample * 32767);
    
    // Write for both channels (stereo)
    buffer.writeInt16LE(intSample, 44 + i * 4);
    buffer.writeInt16LE(intSample, 46 + i * 4);
  }
  
  const outputPath = path.join(__dirname, '..', 'assets', 'audio', filename);
  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ Generated ${filename} (${frequency}Hz, ${duration}s)`);
}

// Create audio directory
const audioDir = path.join(__dirname, '..', 'assets', 'audio');
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

// Generate audio files
generateWav('click.wav', 800, 0.1);      // High pitch click
generateWav('coin.wav', 1200, 0.15);     // Higher pitch coin
generateWav('explosion.wav', 100, 0.5);  // Low pitch explosion
generateWav('music.wav', 440, 5);        // A4 note for music loop

console.log('\n📁 Audio files generated in assets/audio/');
console.log('   These can be served via jsDelivr CDN from GitHub');
