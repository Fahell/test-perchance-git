// src/modules/ui-test.js
// Painel de testes com controles globais (console-only logging)
import { root, getVar, getList } from '../perchance-bridge.js';
import { VERSION, CDN_BASE } from '../constants.js';
import { createTestContainer } from './test-container.js';

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
    particlesTest,
    cellularAutomataTest
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
    const { contentArea } = createTestContainer('🎲 Dice Test', { id: 'test-dice', width: 400, height: 300 });
    const d4 = { dice: '1d4', result: root.dice('1d4') };
    const d6 = { dice: '1d6', result: root.dice('1d6') };
    const d8 = { dice: '1d8', result: root.dice('1d8') };
    const d10 = { dice: '1d10', result: root.dice('1d10') };
    const d12 = { dice: '1d12', result: root.dice('1d12') };
    const d20 = { dice: '1d20', result: root.dice('1d20') };
    const d100 = { dice: '1d100', result: root.dice('1d100') };
    const allRolls = [d4, d6, d8, d10, d12, d20, d100];
    contentArea.innerHTML = allRolls.map(r =>
      `<div style="display:flex;justify-content:space-between;padding:8px;border-bottom:1px solid #333;">
        <span style="color:#fbbf24;">${r.dice}</span>
        <span style="color:#4ade80;font-weight:bold;font-size:18px;">${r.result}</span>
      </div>`
    ).join('');
    console.log(`🎲 Results: ${allRolls.map(r => r.dice + '=' + r.result).join(' | ')}`);
  }

  async function seederHandler() {
    console.log('🌱 Testing Seeder...');
    if (!seederTest || !seederTest.available) throw new Error('Plugin not available');
    const { contentArea } = createTestContainer('🌱 Seeder Test', { id: 'test-seeder', width: 500, height: 350 });
    const seed = seederTest.generateRandomSeed();
    seederTest.applySeed(seed);
    const repro = seederTest.demonstrateReproducibility();
    contentArea.innerHTML = `
      <div style="padding:10px;">
        <div style="margin-bottom:15px;">
          <div style="color:#94a3b8;font-size:12px;">Seed gerada:</div>
          <div style="color:#4ade80;font-size:20px;font-family:monospace;margin-top:5px;">${seed}</div>
        </div>
        <div style="margin-bottom:15px;">
          <div style="color:#94a3b8;font-size:12px;">Execução 1:</div>
          <div style="color:#fbbf24;font-family:monospace;margin-top:5px;">${JSON.stringify(repro?.results1 || [])}</div>
        </div>
        <div style="margin-bottom:15px;">
          <div style="color:#94a3b8;font-size:12px;">Execução 2 (mesma seed):</div>
          <div style="color:#fbbf24;font-family:monospace;margin-top:5px;">${JSON.stringify(repro?.results2 || [])}</div>
        </div>
        <div style="padding:8px;background:${repro?.match ? '#166534' : '#991b1b'};border-radius:4px;text-align:center;">
          ${repro?.match ? '✅ Resultados idênticos — Seed funciona!' : '⚠️ Resultados diferentes (esperado sem listas)'}
        </div>
      </div>`;
    seederTest.resetSeed();
    console.log(`✅ Seed applied: ${seed}`);
  }

  async function patternHandler() {
    console.log('🎨 Generating procedural pattern...');
    if (!patternTest || !patternTest.available) throw new Error('Plugin not available');
    const { contentArea } = createTestContainer('🎨 Pattern Test', { id: 'test-pattern', width: 500, height: 500 });
    contentArea.innerHTML = '<div style="color:#94a3b8;text-align:center;padding:20px;">Gerando padrão...</div>';
    const result = patternTest.generateEmojiPattern();
    if (!result) { contentArea.innerHTML = '<div style="color:#ff6b6b;text-align:center;padding:20px;">❌ Falha na geração</div>'; throw new Error('Pattern generation failed'); }
    if (typeof result === 'string' && result.startsWith('data:image/')) {
      contentArea.innerHTML = `<img src="${result}" style="width:100%;height:auto;border-radius:4px;" alt="Generated Pattern"/>`;
    } else {
      contentArea.innerHTML = `<div style="color:#fbbf24;padding:10px;">
        <div style="margin-bottom:10px;">Tipo: ${typeof result}</div>
        <div style="word-break:break-all;font-size:10px;max-height:300px;overflow:auto;">${String(result).substring(0, 500)}...</div>
      </div>`;
    }
    console.log('✅ Pattern generated!');
  }

  async function aiTextHandler() {
    console.log('🤖 Generating AI text...');
    if (!aiTextTest || !aiTextTest.available) throw new Error('Plugin not available');
    const { contentArea } = createTestContainer('🤖 AI Text Test', { id: 'test-ai-text', width: 600, height: 400 });
    contentArea.innerHTML = '<div style="color:#94a3b8;text-align:center;padding:20px;">⏳ Gerando texto com IA...</div>';
    const result = await aiTextTest.generateBasic('Escreva uma frase curta sobre um aventureiro.');
    if (!result?.success || !result.text) {
      contentArea.innerHTML = `<div style="color:#ff6b6b;padding:10px;">❌ Erro: ${result?.error || 'Resposta vazia'}</div>`;
      throw new Error(result?.error || 'Empty response from AI');
    }
    contentArea.innerHTML = `
      <div style="padding:10px;">
        <div style="color:#94a3b8;font-size:12px;margin-bottom:10px;">Prompt: "Escreva uma frase curta sobre um aventureiro."</div>
        <div style="color:#e2e8f0;font-size:14px;line-height:1.6;padding:15px;background:#0f172a;border-radius:4px;border-left:3px solid #4ade80;">
          ${result.text}
        </div>
        <div style="color:#64748b;font-size:11px;margin-top:10px;">Caracteres: ${result.text.length}</div>
      </div>`;
    console.log(`✅ AI Text: "${result.text.substring(0, 80)}..."`);
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
    const { contentArea, container } = createTestContainer('🔊 TTS Test', { id: 'test-tts', width: 500, height: 350 });
    const testText = 'Olá! Este é um teste de síntese de voz no Perchance.';
    contentArea.innerHTML = `
      <div style="padding:10px;">
        <div style="color:#94a3b8;font-size:12px;margin-bottom:10px;">Texto:</div>
        <div style="color:#e2e8f0;padding:10px;background:#0f172a;border-radius:4px;margin-bottom:15px;">"${testText}"</div>
        <div style="display:flex;gap:10px;margin-bottom:15px;">
          <button id="tts-play" style="flex:1;padding:10px;background:#166534;color:white;border:none;border-radius:4px;cursor:pointer;font-size:14px;">▶ Falar</button>
          <button id="tts-stop" style="flex:1;padding:10px;background:#991b1b;color:white;border:none;border-radius:4px;cursor:pointer;font-size:14px;">⏹ Parar</button>
        </div>
        <div id="tts-status" style="color:#94a3b8;font-size:12px;text-align:center;">Pronto para falar</div>
      </div>`;
    const playBtn = container.querySelector('#tts-play');
    const stopBtn = container.querySelector('#tts-stop');
    const status = container.querySelector('#tts-status');
    playBtn.addEventListener('click', () => {
      ttsTest.speakBasic(testText);
      status.textContent = '🔊 Falando...';
      status.style.color = '#4ade80';
    });
    stopBtn.addEventListener('click', () => {
      ttsTest.stopSpeech();
      status.textContent = '⏹ Parado';
      status.style.color = '#fbbf24';
    });
    console.log('✅ TTS container ready!');
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
    
    // Re-initialize if canvas was cleaned up (container was closed)
    if (!canvasTest.ctx) {
      console.log('🔄 [Canvas] Re-initializing canvas...');
      canvasTest.init(rendererData);
    }
    
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
    
    // Toggle particles on/off using isActive()
    if (particlesTest.isActive && particlesTest.isActive()) {
      particlesTest.dispose();
      console.log('🗑️ Particles: System disposed');
      return;
    }
    
    particlesTest.init(rendererData);
    console.log('✅ Particles: 50,000 particles rendered');
  }


  async function cellularAutomataHandler() {
    console.log('\ud83e\uddec Testing Cellular Automata...');
    if (!cellularAutomataTest) throw new Error('Cellular Automata not available');
    
    // Toggle on/off
    if (cellularAutomataTest.running) {
      cellularAutomataTest.cleanup();
      console.log('\ud83d\uddd1\ufe0f Cellular Automata: Disposed');
      return;
    }
    
    cellularAutomataTest.init(rendererData);
    console.log('\u2705 Cellular Automata: 128x128 grid initialized');
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
      <button id="btn-cellular-automata" class="ui-test-btn ui-test-btn--render">\ud83e\uddec Cellular Automata</button>
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
  document.getElementById('btn-cellular-automata').onclick = () => runTest('btn-cellular-automata', 'Cellular Automata', cellularAutomataHandler);

  console.log(`✅ [UI-Test] Test panel ${VERSION} created with global controls.`);
}
