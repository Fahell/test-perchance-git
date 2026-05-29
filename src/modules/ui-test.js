// src/modules/ui-test.js
// Painel de testes com controles globais (console-only logging)
import { root, getVar, getList } from '../perchance-bridge.js';
import { VERSION, CDN_BASE } from '../constants.js';

const CSS_URL = `${CDN_BASE}/src/styles/ui-test.css`;

function injectStylesheet() {
  if (document.getElementById('ui-test-styles')) return;
  const link = document.createElement('link');
  link.id = 'ui-test-styles';
  link.rel = 'stylesheet';
  link.href = CSS_URL;
  document.head.appendChild(link);
}

const buttonStatus = new Map();

function setButtonStatus(btnId, status) {
  const btn = document.getElementById(btnId);
  if (!btn) return;

  btn.classList.remove('ui-test-btn--running', 'ui-test-btn--success', 'ui-test-btn--error');

  const existingStatus = btn.querySelector('.ui-test-btn__status');
  if (existingStatus) existingStatus.remove();

  if (status === 'idle') {
    buttonStatus.delete(btnId);
    return;
  }

  btn.classList.add(`ui-test-btn--${status}`);
  buttonStatus.set(btnId, status);

  const statusSpan = document.createElement('span');
  statusSpan.className = 'ui-test-btn__status';
  const icons = { running: '⏳', success: '✅', error: '❌' };
  statusSpan.textContent = icons[status] || '';
  btn.appendChild(statusSpan);
}

async function runTest(btnId, testName, testFn) {
  setButtonStatus(btnId, 'running');
  const startTime = Date.now();
  try {
    await testFn();
    const duration = Date.now() - startTime;
    console.log(`✅ [${testName}] Passed (${duration}ms)`);
    setButtonStatus(btnId, 'success');
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ [${testName}] Failed (${duration}ms):`, error.message);
    setButtonStatus(btnId, 'error');
  }
}

async function runAllTests(testDefs) {
  console.log('▶ Running all tests...');
  for (const def of testDefs) {
    const btn = document.getElementById(def.btnId);
    if (!btn) continue;
    setButtonStatus(def.btnId, 'idle');
  }
  for (const def of testDefs) {
    await runTest(def.btnId, def.name, def.fn);
    await new Promise(r => setTimeout(r, 300));
  }
  const passed = [...buttonStatus.values()].filter(s => s === 'success').length;
  const failed = [...buttonStatus.values()].filter(s => s === 'error').length;
  console.log(`🏁 Done: ${passed} ✅ | ${failed} ❌`);
}

export function initUITest(rendererData, testModules) {
  console.log(`🎮 [UI-Test] Creating test panel ${VERSION}...`);

  injectStylesheet();

  const capturedSeed = getVar('GAME_SEED', 'N/A');
  const capturedRoot = !!root;
  console.log('📸 [UI-Test] Captured values:', { seed: capturedSeed, root: capturedRoot });

  const {
    imageTest,
    aiTextTest,
    listsTest,
    stateTest,
    raycasterTest,
    canvasTest,
    ttsTest,
    diceTest,
    rpgIconTest,
    patternTest,
    kvTest,
    seederTest,
    apexchartsTest,
    audioTest,
    mermaidTest,
    matterTest,
    cannonTest,
    particlesTest
  } = testModules;

  // Test definitions for Run All
  const testDefs = [
    { btnId: 'btn-dice', name: 'Dice', fn: () => diceHandler() },
    { btnId: 'btn-seeder', name: 'Seeder', fn: () => seederHandler() },
    { btnId: 'btn-pattern', name: 'Pattern', fn: () => patternHandler() },
    { btnId: 'btn-ai-text', name: 'AI Text', fn: () => aiTextHandler() },
    { btnId: 'btn-image', name: 'Image', fn: () => imageHandler() },
    { btnId: 'btn-tts', name: 'TTS', fn: () => ttsHandler() },
    { btnId: 'btn-3d', name: 'Cube Color', fn: () => cubeColorHandler() },
    { btnId: 'btn-raycaster', name: 'Raycaster', fn: () => raycasterHandler() },
    { btnId: 'btn-canvas', name: 'Canvas', fn: () => canvasHandler() },
    { btnId: 'btn-rpg-icon', name: 'RPG Icons', fn: () => rpgIconHandler() },
    { btnId: 'btn-lists', name: 'Lists', fn: () => listsHandler() },
    { btnId: 'btn-bridge', name: 'Bridge', fn: () => bridgeHandler() },
    { btnId: 'btn-state-save', name: 'Save', fn: () => stateSaveHandler() },
    { btnId: 'btn-state-load', name: 'Load', fn: () => stateLoadHandler() },
    { btnId: 'btn-kv', name: 'KV', fn: () => kvHandler() },
    { btnId: 'btn-chart-bar', name: 'Bar Chart', fn: () => chartBarHandler() },
    { btnId: 'btn-chart-line', name: 'Line Chart', fn: () => chartLineHandler() },
    { btnId: 'btn-chart-pie', name: 'Pie Chart', fn: () => chartPieHandler() },
    { btnId: 'btn-chart-radar', name: 'Radar Chart', fn: () => chartRadarHandler() },
    { btnId: 'btn-audio-sfx', name: 'Audio SFX', fn: () => audioSFXHandler() },
    { btnId: 'btn-audio-music', name: 'Audio Music', fn: () => audioMusicHandler() },
    { btnId: 'btn-audio-sprite', name: 'Audio Sprite', fn: () => audioSpriteHandler() },
    { btnId: 'btn-audio-volume', name: 'Audio Volume', fn: () => audioVolumeHandler() },
    { btnId: 'btn-audio-stop', name: 'Audio Stop', fn: () => audioStopHandler() },
    { btnId: 'btn-mermaid', name: 'Mermaid', fn: () => mermaidHandler() },
    { btnId: 'btn-matter', name: 'Matter.js', fn: () => matterHandler() },
    { btnId: 'btn-cannon', name: 'Cannon-es', fn: () => cannonHandler() },
    { btnId: 'btn-particles', name: 'Particles', fn: () => particlesHandler() },
  ];

  async function diceHandler() {
    console.log('🎲 Rolling dice...');
    if (!diceTest || !diceTest.available) throw new Error('Plugin not available');
    const d20 = diceTest.rollD20();
    const d6 = diceTest.roll3D6();
    console.log(`🎲 1d20: ${d20.result} | 3d6: ${d6.result}`);
  }

  async function seederHandler() {
    console.log('🌱 Testing Seeder...');
    if (!seederTest || !seederTest.available) throw new Error('Plugin not available');
    const seed = seederTest.generateRandomSeed();
    seederTest.applySeed(seed);
    console.log(`✅ Seed applied: ${seed}`);
  }

  async function patternHandler() {
    console.log('🎨 Generating procedural pattern...');
    if (!patternTest || !patternTest.available) throw new Error('Plugin not available');
    const result = patternTest.generateEmojiPattern();
    if (!result) throw new Error('Pattern generation failed');
    console.log('✅ Pattern generated!');
  }

  async function aiTextHandler() {
    console.log('🤖 Generating AI text...');
    if (!aiTextTest || !aiTextTest.available) throw new Error('Plugin not available');
    const result = await aiTextTest.generateBasic('Escreva uma frase curta sobre um aventureiro.');
    if (!result?.success || !result.text) throw new Error(result?.error || 'Empty response from AI');
    const preview = result.text.substring(0, 80) + (result.text.length > 80 ? '...' : '');
    console.log(`✅ AI Text: "${preview}"`);
  }

  async function imageHandler() {
    console.log('🖼️ Generating AI image...');
    if (!imageTest || !imageTest.available) throw new Error('Plugin not available');
    const result = await imageTest.testBasicImage();
    if (!result?.success) throw new Error(result?.error || 'Image generation failed');
    console.log('✅ Image generated!');
  }

  async function ttsHandler() {
    console.log('🔊 Testing Text-to-Speech...');
    if (!ttsTest || !ttsTest.available) throw new Error('Plugin not available');
    ttsTest.speakBasic('Olá! Este é um teste de síntese de voz.');
    console.log('✅ Speech started!');
  }

  async function cubeColorHandler() {
    console.log('🎲 Changing cube color...');
    if (!rendererData || !rendererData.cube || !rendererData.cube.material) throw new Error('Cube not available');
    rendererData.cube.material.color.setHex(Math.random() * 0xffffff);
    console.log('✅ Cube color changed!');
  }

  async function raycasterHandler() {
    console.log('🖱️ Raycaster: Click on spheres!');
    if (!raycasterTest || !raycasterTest.available) throw new Error('Raycaster not available');
    console.log(`✅ ${raycasterTest.spheres?.length || 0} spheres added`);
  }

  async function canvasHandler() {
    console.log('🎨 Testing Canvas 2D...');
    if (!canvasTest) throw new Error('Canvas not available');
    canvasTest.drawGradient();
    canvasTest.drawCircles(15);
    canvasTest.drawText('RPG Paper Craft', 256, 256);
    if (canvasTest.threeIntegration) canvasTest.showThreePlane();
    console.log('✅ Canvas drawn!');
  }

  async function rpgIconHandler() {
    console.log('⚔️ Loading RPG Icons...');
    if (!rpgIconTest || !rpgIconTest.available) throw new Error('Plugin not available');
    const icons = rpgIconTest.getMultipleIcons(6);
    if (!icons) throw new Error('Icon loading failed');
    console.log(`✅ ${icons.length} icons loaded!`);
  }

  async function listsHandler() {
    console.log('📋 Testing lists...');
    if (!listsTest) throw new Error('Lists not available');
    const item = listsTest.testSelectOne('itens');
    const heroes = listsTest.testSelectUnique('nomes_herois', 2);
    const length = listsTest.testListLength('nomes_herois');
    console.log(`✅ Item: "${item}" | Heroes: ${heroes.length} | Length: ${length}`);
  }

  async function bridgeHandler() {
    console.log(`📡 Seed: ${capturedSeed} | Root: ${capturedRoot}`);
  }

  async function stateSaveHandler() {
    console.log('💾 Saving state...');
    if (!stateTest) throw new Error('State not available');
    const state = stateTest.getDefaultState();
    state.player.name = 'Herói Testador';
    state.player.level = 5;
    state.world.bioma = 'floresta';
    if (!stateTest.save(state)) throw new Error('Save failed');
    console.log('✅ State saved!');
  }

  async function stateLoadHandler() {
    console.log('📂 Loading state...');
    if (!stateTest) throw new Error('State not available');
    const loaded = stateTest.load();
    if (!loaded) throw new Error('No save found');
    console.log(`✅ Loaded: ${loaded.player.name} Lv.${loaded.player.level}`);
  }

  async function kvHandler() {
    console.log('💾 Testing KV Plugin...');
    if (!kvTest || !kvTest.available) throw new Error('Plugin not available');
    const saved = await kvTest.setSimpleValue('test_key', 'test_value');
    if (!saved) throw new Error('KV save failed');
    const retrieved = await kvTest.getValue('test_key');
    console.log(`✅ KV: test_key = "${retrieved}"`);
  }

  async function chartBarHandler() {
    console.log('📊 Rendering Bar Chart...');
    if (!apexchartsTest) throw new Error('ApexCharts not available');
    const result = await apexchartsTest.renderBarChart();
    if (!result?.success) throw new Error('Chart render failed');
    console.log(`✅ Bar Chart: ${result.categories} categories`);
  }

  async function chartLineHandler() {
    console.log('📈 Rendering Line Chart...');
    if (!apexchartsTest) throw new Error('ApexCharts not available');
    const result = await apexchartsTest.renderLineChart();
    if (!result?.success) throw new Error('Chart render failed');
    console.log(`✅ Line Chart: ${result.points} points`);
  }

  async function chartPieHandler() {
    console.log('🍩 Rendering Donut Chart...');
    if (!apexchartsTest) throw new Error('ApexCharts not available');
    const result = await apexchartsTest.renderPieChart();
    if (!result?.success) throw new Error('Chart render failed');
    console.log(`✅ Donut Chart: ${result.slices} slices`);
  }

  async function chartRadarHandler() {
    console.log('🕸️ Rendering Radar Chart...');
    if (!apexchartsTest) throw new Error('ApexCharts not available');
    const result = await apexchartsTest.renderRadarChart();
    if (!result?.success) throw new Error('Chart render failed');
    console.log(`✅ Radar Chart: ${result.axes} axes`);
  }

  async function audioSFXHandler() {
    console.log('🔊 Testing SFX...');
    if (!audioTest) throw new Error('Audio not available');
    const result = audioTest.playSFX('click');
    if (!result) throw new Error('SFX failed');
    console.log('✅ SFX: click');
  }

  async function audioMusicHandler() {
    console.log('🎵 Testing music with loop...');
    if (!audioTest) throw new Error('Audio not available');
    const result = audioTest.playMusic('music');
    if (!result) throw new Error('Music failed');
    console.log('✅ Music started (loop)');
  }

  async function audioStopHandler() {
    console.log('🔇 Stopping all sounds...');
    if (!audioTest) throw new Error('Audio not available');
    const result = audioTest.stopAll();
    if (!result) throw new Error('Stop failed');
    console.log('✅ All sounds stopped');
  }

  async function audioSpriteHandler() {
    console.log('🎵 Testing audio sprite...');
    if (!audioTest) throw new Error('Audio not available');
    const result = audioTest.testSprite();
    if (!result) throw new Error('Sprite failed');
    console.log('✅ Sprite: middle (2-4s)');
  }

  async function audioVolumeHandler() {
    console.log('🔊 Testing volume...');
    if (!audioTest) throw new Error('Audio not available');
    const current = audioTest.getVolume();
    const newVolume = current > 0.5 ? 0.2 : 0.8;
    audioTest.setVolume(newVolume);
    console.log(`✅ Volume: ${(newVolume * 100).toFixed(0)}%`);
  }

  async function mermaidHandler() {
    console.log('📊 Testing Mermaid.js...');
    if (!mermaidTest) throw new Error('Mermaid not available');
    if (mermaidTest.isLoading && mermaidTest.isLoading()) {
      console.log('⏳ Mermaid still loading, waiting...');
      await mermaidTest.getMermaid();
    }
    let diagramContainer = document.getElementById('mermaid-diagrams');
    if (!diagramContainer) {
      diagramContainer = document.createElement('div');
      diagramContainer.id = 'mermaid-diagrams';
      diagramContainer.className = 'mermaid-container';
      const closeBtn = document.createElement('button');
      closeBtn.className = 'mermaid-close-btn';
      closeBtn.innerHTML = '✕';
      closeBtn.title = 'Close';
      closeBtn.onclick = () => {
        diagramContainer.remove();
        console.log('📊 Diagrams closed');
      };
      diagramContainer.appendChild(closeBtn);
      document.body.appendChild(diagramContainer);
    } else {
      diagramContainer.innerHTML = '';
    }
    const results = await mermaidTest.renderAllExamples(diagramContainer);
    const successCount = Object.values(results).filter(Boolean).length;
    const totalCount = Object.keys(results).length;
    console.log(`✅ Mermaid: ${successCount}/${totalCount} diagrams rendered`);
  }

  async function matterHandler() {
    console.log('⚛️ Testing Matter.js...');
    if (!matterTest) throw new Error('Matter not available');
    if (matterTest.isLoading && matterTest.isLoading()) {
      console.log('⏳ Matter.js still loading, waiting...');
      await matterTest.getMatter();
    }
    await matterTest.initPhysics();
    console.log('✅ Matter.js: Physics simulation initialized');
  }

  async function cannonHandler() {
    console.log('💣 Testing Cannon-es...');
    if (!cannonTest) throw new Error('Cannon-es not available');
    if (cannonTest.isLoading && cannonTest.isLoading()) {
      console.log('⏳ Cannon-es still loading, waiting...');
    }
    await cannonTest.initPhysics3D();
    console.log('✅ Cannon-es: 3D Physics simulation initialized');
  }

  async function particlesHandler() {
    console.log('✨ Testing Particles...');
    if (!particlesTest) throw new Error('Particles not available');
    if (!rendererData || !rendererData.scene) throw new Error('Scene not available');
    
    // Toggle particles on/off
    if (particlesTest.getConfig && particlesTest.getConfig().count > 0) {
      // Check if particles are already active by trying to dispose
      try {
        particlesTest.dispose();
        console.log('🗑️ Particles: System disposed');
        return;
      } catch (e) {
        // Ignore, continue to init
      }
    }
    
    particlesTest.init(rendererData);
    console.log('✅ Particles: 50,000 particles rendered');
  }

  const panel = document.createElement('div');
  panel.id = 'ui-test-panel';

  panel.innerHTML = `
    <h3>🧪 Test Panel ${VERSION}</h3>
    
    <div class="ui-test-controls">
      <button id="btn-run-all" class="ui-test-btn ui-test-btn--system">▶ Run All</button>
    </div>
    
    <div class="ui-test-category">
      <strong style="color:var(--ui-color-generation)">🎲 Generation & Randomness</strong>
      <button id="btn-dice" class="ui-test-btn ui-test-btn--generation">🎲 Dice</button>
      <button id="btn-seeder" class="ui-test-btn ui-test-btn--generation">🌱 Seeder</button>
      <button id="btn-pattern" class="ui-test-btn ui-test-btn--generation">🎨 Pattern</button>
    </div>
    
    <div class="ui-test-category">
      <strong style="color:var(--ui-color-ai)">🤖 AI & Content</strong>
      <button id="btn-ai-text" class="ui-test-btn ui-test-btn--ai">🤖 AI Text</button>
      <button id="btn-image" class="ui-test-btn ui-test-btn--ai">🖼️ Image</button>
      <button id="btn-tts" class="ui-test-btn ui-test-btn--ai">🔊 TTS</button>
      <button id="btn-tts-stop" class="ui-test-btn ui-test-btn--ai">⏹️ Stop</button>
    </div>
    
    <div class="ui-test-category">
      <strong style="color:var(--ui-color-render)">🎨 Rendering</strong>
      <button id="btn-3d" class="ui-test-btn ui-test-btn--render">🎲 Cube Color</button>
      <button id="btn-raycaster" class="ui-test-btn ui-test-btn--render">🖱️ Raycaster</button>
      <button id="btn-canvas" class="ui-test-btn ui-test-btn--render">🎨 Canvas</button>
      <button id="btn-rpg-icon" class="ui-test-btn ui-test-btn--render">⚔️ RPG Icons</button>
      <button id="btn-particles" class="ui-test-btn ui-test-btn--render">✨ Particles</button>
    </div>
    
    <div class="ui-test-category">
      <strong style="color:var(--ui-color-viz)">📊 Visualization</strong>
      <button id="btn-chart-bar" class="ui-test-btn ui-test-btn--viz">📊 Bar</button>
      <button id="btn-chart-line" class="ui-test-btn ui-test-btn--viz">📈 Line</button>
      <button id="btn-chart-pie" class="ui-test-btn ui-test-btn--viz">🍩 Donut</button>
      <button id="btn-chart-radar" class="ui-test-btn ui-test-btn--viz">🕸️ Radar</button>
    </div>
    
    <div class="ui-test-category">
      <strong style="color:#ff6b9d">🔊 Audio</strong>
      <button id="btn-audio-sfx" class="ui-test-btn ui-test-btn--audio">🔊 SFX</button>
      <button id="btn-audio-music" class="ui-test-btn ui-test-btn--audio">🎵 Music</button>
      <button id="btn-audio-sprite" class="ui-test-btn ui-test-btn--audio">🎵 Sprite</button>
      <button id="btn-audio-volume" class="ui-test-btn ui-test-btn--audio">🔊 Volume</button>
      <button id="btn-audio-stop" class="ui-test-btn ui-test-btn--audio">🔇 Stop</button>
    </div>
    
    <div class="ui-test-category">
      <strong style="color:var(--ui-color-viz)">📊 Diagrams</strong>
      <button id="btn-mermaid" class="ui-test-btn ui-test-btn--viz">📊 Mermaid</button>
      <button id="btn-matter" class="ui-test-btn ui-test-btn--viz">⚛️ Matter.js</button>
      <button id="btn-cannon" class="ui-test-btn ui-test-btn--viz">💣 Cannon-es</button>
    </div>
    
    <div class="ui-test-category">
      <strong style="color:var(--ui-color-data)">💾 Data & State</strong>
      <button id="btn-lists" class="ui-test-btn ui-test-btn--data">📋 Lists</button>
      <button id="btn-bridge" class="ui-test-btn ui-test-btn--data">🔗 Bridge</button>
      <button id="btn-state-save" class="ui-test-btn ui-test-btn--data">💾 Save</button>
      <button id="btn-state-load" class="ui-test-btn ui-test-btn--data">📂 Load</button>
      <button id="btn-kv" class="ui-test-btn ui-test-btn--data">💾 KV</button>
    </div>
  `;

  document.body.appendChild(panel);
  console.log('📎 [UI-Test] Panel attached to document.body');

  const rect = panel.getBoundingClientRect();
  console.log(`📐 [UI-Test] Panel visible: ${rect.width}x${rect.height}px at (${rect.left}, ${rect.top})`);

  // Global controls
  document.getElementById('btn-run-all').onclick = () => runAllTests(testDefs);

  // Individual test handlers
  document.getElementById('btn-dice').onclick = () => runTest('btn-dice', 'Dice', diceHandler);
  document.getElementById('btn-seeder').onclick = () => runTest('btn-seeder', 'Seeder', seederHandler);
  document.getElementById('btn-pattern').onclick = () => runTest('btn-pattern', 'Pattern', patternHandler);
  document.getElementById('btn-ai-text').onclick = () => runTest('btn-ai-text', 'AI Text', aiTextHandler);
  document.getElementById('btn-image').onclick = () => runTest('btn-image', 'Image', imageHandler);
  document.getElementById('btn-tts').onclick = () => runTest('btn-tts', 'TTS', ttsHandler);
  document.getElementById('btn-tts-stop').onclick = () => runTest('btn-tts-stop', 'TTS Stop', () => {
    console.log('⏹️ Stopping speech...');
    if (!ttsTest) throw new Error('TTS not available');
    if (!ttsTest.stopSpeech()) throw new Error('Stop not available');
    console.log('✅ Speech stopped');
  });
  document.getElementById('btn-3d').onclick = () => runTest('btn-3d', 'Cube Color', cubeColorHandler);
  document.getElementById('btn-raycaster').onclick = () => runTest('btn-raycaster', 'Raycaster', raycasterHandler);
  document.getElementById('btn-canvas').onclick = () => runTest('btn-canvas', 'Canvas', canvasHandler);
  document.getElementById('btn-rpg-icon').onclick = () => runTest('btn-rpg-icon', 'RPG Icons', rpgIconHandler);
  document.getElementById('btn-lists').onclick = () => runTest('btn-lists', 'Lists', listsHandler);
  document.getElementById('btn-bridge').onclick = () => runTest('btn-bridge', 'Bridge', bridgeHandler);
  document.getElementById('btn-state-save').onclick = () => runTest('btn-state-save', 'Save', stateSaveHandler);
  document.getElementById('btn-state-load').onclick = () => runTest('btn-state-load', 'Load', stateLoadHandler);
  document.getElementById('btn-kv').onclick = () => runTest('btn-kv', 'KV', kvHandler);
  document.getElementById('btn-chart-bar').onclick = () => runTest('btn-chart-bar', 'Bar Chart', chartBarHandler);
  document.getElementById('btn-chart-line').onclick = () => runTest('btn-chart-line', 'Line Chart', chartLineHandler);
  document.getElementById('btn-chart-pie').onclick = () => runTest('btn-chart-pie', 'Pie Chart', chartPieHandler);
  document.getElementById('btn-chart-radar').onclick = () => runTest('btn-chart-radar', 'Radar Chart', chartRadarHandler);
  document.getElementById('btn-audio-sfx').onclick = () => runTest('btn-audio-sfx', 'Audio SFX', audioSFXHandler);
  document.getElementById('btn-audio-music').onclick = () => runTest('btn-audio-music', 'Audio Music', audioMusicHandler);
  document.getElementById('btn-audio-sprite').onclick = () => runTest('btn-audio-sprite', 'Audio Sprite', audioSpriteHandler);
  document.getElementById('btn-audio-volume').onclick = () => runTest('btn-audio-volume', 'Audio Volume', audioVolumeHandler);
  document.getElementById('btn-audio-stop').onclick = () => runTest('btn-audio-stop', 'Audio Stop', audioStopHandler);
  document.getElementById('btn-mermaid').onclick = () => runTest('btn-mermaid', 'Mermaid', mermaidHandler);
  document.getElementById('btn-matter').onclick = () => runTest('btn-matter', 'Matter.js', matterHandler);
  document.getElementById('btn-cannon').onclick = () => runTest('btn-cannon', 'Cannon-es', cannonHandler);
  document.getElementById('btn-particles').onclick = () => runTest('btn-particles', 'Particles', particlesHandler);

  console.log(`✅ [UI-Test] Test panel ${VERSION} created with global controls.`);
}
