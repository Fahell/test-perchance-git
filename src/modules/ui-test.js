// src/modules/ui-test.js
// Painel de testes com controles globais e log estruturado
import { root, getVar, getList } from 'https://cdn.jsdelivr.net/gh/Fahell/test-perchance-git@v1.2.13/src/perchance-bridge.js';
import { VERSION, CDN_BASE } from '../constants.js';

const CSS_URL = `${CDN_BASE}/styles/ui-test.css`;

function injectStylesheet() {
  if (document.getElementById('ui-test-styles')) return;
  const link = document.createElement('link');
  link.id = 'ui-test-styles';
  link.rel = 'stylesheet';
  link.href = CSS_URL;
  document.head.appendChild(link);
}

const buttonStatus = new Map();
const testResults = [];

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

let logDiv = null;

function formatTime() {
  const now = new Date();
  return now.toLocaleTimeString('pt-BR', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function log(message, type = 'info') {
  if (!logDiv) return;
  const entry = document.createElement('div');
  entry.className = `log-entry log-entry--${type}`;

  const timeSpan = document.createElement('span');
  timeSpan.className = 'log-entry__time';
  timeSpan.textContent = `[${formatTime()}]`;

  const msgSpan = document.createElement('span');
  msgSpan.className = 'log-entry__msg';
  msgSpan.textContent = message;

  entry.appendChild(timeSpan);
  entry.appendChild(msgSpan);
  logDiv.appendChild(entry);
  logDiv.scrollTop = logDiv.scrollHeight;

  testResults.push({ time: formatTime(), message, type });
}

async function runTest(btnId, testName, testFn) {
  setButtonStatus(btnId, 'running');
  const startTime = Date.now();
  try {
    await testFn();
    setButtonStatus(btnId, 'success');
    const duration = Date.now() - startTime;
    testResults[testResults.length - 1].duration = `${duration}ms`;
  } catch {
    setButtonStatus(btnId, 'error');
    const duration = Date.now() - startTime;
    testResults[testResults.length - 1].duration = `${duration}ms`;
  }
}

function clearLog() {
  if (!logDiv) return;
  logDiv.innerHTML = '';
  testResults.length = 0;
  buttonStatus.forEach((_, btnId) => setButtonStatus(btnId, 'idle'));
  log('🗑 Log limpo', 'info');
}

function exportResults() {
  if (testResults.length === 0) {
    log('⚠️ Nenhum resultado para exportar', 'warning');
    return;
  }
  const lines = testResults.map(r => `[${r.time}] [${r.type.toUpperCase()}] ${r.message}${r.duration ? ` (${r.duration})` : ''}`);
  const text = `🧪 Test Results - ${new Date().toISOString()}\n${'='.repeat(50)}\n${lines.join('\n')}`;
  navigator.clipboard.writeText(text).then(() => {
    log(`📋 ${testResults.length} resultados copiados!`, 'success');
  }).catch(() => {
    log('❌ Falha ao copiar para clipboard', 'error');
  });
}

async function runAllTests(testDefs) {
  log('▶ Executando todos os testes...', 'info');
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
  log(`🏁 Concluído: ${passed} ✅ | ${failed} ❌`, passed > 0 && failed === 0 ? 'success' : 'warning');
}

export function initUITest(rendererData, testModules) {
  console.log(`🎮 [UI-Test] Criando painel de testes ${VERSION}...`);

  injectStylesheet();

  const capturedSeed = getVar('GAME_SEED', 'N/A');
  const capturedRoot = !!root;
  console.log('📸 [UI-Test] Valores capturados:', { seed: capturedSeed, root: capturedRoot });

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
    apexchartsTest
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
  ];

  // Handler functions (extracted for reuse in Run All)
  async function diceHandler() {
    log('🎲 Rolando dados...', 'info');
    if (!diceTest || !diceTest.available) throw new Error('Plugin not available');
    const d20 = diceTest.rollD20();
    const d6 = diceTest.roll3D6();
    log(`✅ 1d20: ${d20.result} | 3d6: ${d6.result}`, 'success');
  }

  async function seederHandler() {
    log('🌱 Testando Seeder...', 'info');
    if (!seederTest || !seederTest.available) throw new Error('Plugin not available');
    const seed = seederTest.generateRandomSeed();
    seederTest.applySeed(seed);
    log(`✅ Seed aplicada: ${seed}`, 'success');
  }

  async function patternHandler() {
    log('🎨 Gerando padrão procedural...', 'info');
    if (!patternTest || !patternTest.available) throw new Error('Plugin not available');
    const result = patternTest.generateEmojiPattern();
    if (!result) throw new Error('Pattern generation failed');
    log('✅ Padrão gerado!', 'success');
  }

  async function aiTextHandler() {
    log('🤖 Gerando texto com IA...', 'info');
    if (!aiTextTest || !aiTextTest.available) throw new Error('Plugin not available');
    const result = await aiTextTest.generateBasic('Escreva uma frase curta sobre um aventureiro.');
    if (!result || !result.generatedText) throw new Error('Generation failed');
    const preview = result.generatedText.substring(0, 60) + '...';
    log(`✅ AI: "${preview}"`, 'success');
  }

  async function imageHandler() {
    log('🖼️ Gerando imagem com IA...', 'info');
    if (!imageTest || !imageTest.available) throw new Error('Plugin not available');
    const result = await imageTest.testBasicImage('papercraft warrior with sword, fantasy art style', 12345);
    if (!result) throw new Error('Generation failed');
    log('✅ Imagem gerada!', 'success');
  }

  async function ttsHandler() {
    log('🔊 Testando Text-to-Speech...', 'info');
    if (!ttsTest || !ttsTest.available) throw new Error('Plugin not available');
    ttsTest.speakBasic('Olá! Este é um teste de síntese de voz.');
    log('✅ Fala iniciada!', 'success');
  }

  async function cubeColorHandler() {
    log('🎲 Mudando cor do cubo...', 'info');
    if (!rendererData || !rendererData.cube || !rendererData.cube.material) throw new Error('Cube not available');
    rendererData.cube.material.color.setHex(Math.random() * 0xffffff);
    log('✅ Cor do cubo alterada!', 'success');
  }

  async function raycasterHandler() {
    log('🖱️ Raycaster: Clique nas esferas!', 'info');
    if (!raycasterTest || !raycasterTest.available) throw new Error('Raycaster not available');
    log(`✅ ${raycasterTest.spheres?.length || 0} esferas adicionadas`, 'success');
  }

  async function canvasHandler() {
    log('🎨 Testando Canvas 2D...', 'info');
    if (!canvasTest) throw new Error('Canvas not available');
    canvasTest.drawGradient();
    canvasTest.drawCircles(15);
    canvasTest.drawText('RPG Paper Craft', 256, 256);
    if (canvasTest.threeIntegration) canvasTest.showThreePlane();
    log('✅ Canvas desenhado!', 'success');
  }

  async function rpgIconHandler() {
    log('⚔️ Carregando RPG Icons...', 'info');
    if (!rpgIconTest || !rpgIconTest.available) throw new Error('Plugin not available');
    const icons = rpgIconTest.getMultipleIcons(6);
    if (!icons) throw new Error('Icon loading failed');
    log(`✅ ${icons.length} ícones carregados!`, 'success');
  }

  async function listsHandler() {
    log('📋 Testando listas...', 'info');
    if (!listsTest) throw new Error('Lists not available');
    const item = listsTest.testSelectOne('itens');
    const heroes = listsTest.testSelectUnique('nomes_herois', 2);
    const length = listsTest.testListLength('nomes_herois');
    log(`✅ Item: "${item}" | Heróis: ${heroes.length} | Tamanho: ${length}`, 'success');
  }

  async function bridgeHandler() {
    log(`📡 Seed: ${capturedSeed} | Root: ${capturedRoot}`, 'success');
  }

  async function stateSaveHandler() {
    log('💾 Salvando estado...', 'info');
    if (!stateTest) throw new Error('State not available');
    const state = stateTest.getDefaultState();
    state.player.name = 'Herói Testador';
    state.player.level = 5;
    state.world.bioma = 'floresta';
    if (!stateTest.save(state)) throw new Error('Save failed');
    log('✅ Estado salvo!', 'success');
  }

  async function stateLoadHandler() {
    log('📂 Carregando estado...', 'info');
    if (!stateTest) throw new Error('State not available');
    const loaded = stateTest.load();
    if (!loaded) throw new Error('No save found');
    log(`✅ Carregado: ${loaded.player.name} Lv.${loaded.player.level}`, 'success');
  }

  async function kvHandler() {
    log('💾 Testando KV Plugin...', 'info');
    if (!kvTest || !kvTest.available) throw new Error('Plugin not available');
    const saved = await kvTest.setSimpleValue('test_key', 'test_value');
    if (!saved) throw new Error('KV save failed');
    const retrieved = await kvTest.getValue('test_key');
    log(`✅ KV: test_key = "${retrieved}"`, 'success');
  }

  async function chartBarHandler() {
    log('📊 Renderizando Bar Chart...', 'info');
    if (!apexchartsTest) throw new Error('ApexCharts not available');
    const result = await apexchartsTest.renderBarChart();
    if (!result?.success) throw new Error('Chart render failed');
    log(`✅ Bar Chart: ${result.categories} categorias`, 'success');
  }

  async function chartLineHandler() {
    log('📈 Renderizando Line Chart...', 'info');
    if (!apexchartsTest) throw new Error('ApexCharts not available');
    const result = await apexchartsTest.renderLineChart();
    if (!result?.success) throw new Error('Chart render failed');
    log(`✅ Line Chart: ${result.points} pontos`, 'success');
  }

  async function chartPieHandler() {
    log('🍩 Renderizando Donut Chart...', 'info');
    if (!apexchartsTest) throw new Error('ApexCharts not available');
    const result = await apexchartsTest.renderPieChart();
    if (!result?.success) throw new Error('Chart render failed');
    log(`✅ Donut Chart: ${result.slices} fatias`, 'success');
  }

  async function chartRadarHandler() {
    log('🕸️ Renderizando Radar Chart...', 'info');
    if (!apexchartsTest) throw new Error('ApexCharts not available');
    const result = await apexchartsTest.renderRadarChart();
    if (!result?.success) throw new Error('Chart render failed');
    log(`✅ Radar Chart: ${result.axes} eixos`, 'success');
  }

  const panel = document.createElement('div');
  panel.id = 'ui-test-panel';

  panel.innerHTML = `
    <h3>🧪 Painel de Testes ${VERSION}</h3>
    
    <div class="ui-test-controls">
      <button id="btn-run-all" class="ui-test-btn ui-test-btn--system">▶ Todos</button>
      <button id="btn-clear-log" class="ui-test-btn ui-test-btn--system">🗑 Limpar</button>
      <button id="btn-export" class="ui-test-btn ui-test-btn--system">📋 Exportar</button>
    </div>
    
    <div class="ui-test-category">
      <strong style="color:var(--ui-color-generation)">🎲 Geração & Aleatoriedade</strong>
      <button id="btn-dice" class="ui-test-btn ui-test-btn--generation">🎲 Dice</button>
      <button id="btn-seeder" class="ui-test-btn ui-test-btn--generation">🌱 Seeder</button>
      <button id="btn-pattern" class="ui-test-btn ui-test-btn--generation">🎨 Pattern</button>
    </div>
    
    <div class="ui-test-category">
      <strong style="color:var(--ui-color-ai)">🤖 IA & Conteúdo</strong>
      <button id="btn-ai-text" class="ui-test-btn ui-test-btn--ai">🤖 AI Text</button>
      <button id="btn-image" class="ui-test-btn ui-test-btn--ai">🖼️ Image</button>
      <button id="btn-tts" class="ui-test-btn ui-test-btn--ai">🔊 TTS</button>
      <button id="btn-tts-stop" class="ui-test-btn ui-test-btn--ai">⏹️ Parar</button>
    </div>
    
    <div class="ui-test-category">
      <strong style="color:var(--ui-color-render)">🎨 Renderização</strong>
      <button id="btn-3d" class="ui-test-btn ui-test-btn--render">🎲 Cor Cubo</button>
      <button id="btn-raycaster" class="ui-test-btn ui-test-btn--render">🖱️ Raycaster</button>
      <button id="btn-canvas" class="ui-test-btn ui-test-btn--render">🎨 Canvas</button>
      <button id="btn-rpg-icon" class="ui-test-btn ui-test-btn--render">⚔️ RPG Icons</button>
    </div>
    
    <div class="ui-test-category">
      <strong style="color:var(--ui-color-viz)">📊 Visualização</strong>
      <button id="btn-chart-bar" class="ui-test-btn ui-test-btn--viz">📊 Bar</button>
      <button id="btn-chart-line" class="ui-test-btn ui-test-btn--viz">📈 Line</button>
      <button id="btn-chart-pie" class="ui-test-btn ui-test-btn--viz">🍩 Donut</button>
      <button id="btn-chart-radar" class="ui-test-btn ui-test-btn--viz">🕸️ Radar</button>
    </div>
    
    <div class="ui-test-category">
      <strong style="color:var(--ui-color-data)">💾 Dados & Estado</strong>
      <button id="btn-lists" class="ui-test-btn ui-test-btn--data">📋 Listas</button>
      <button id="btn-bridge" class="ui-test-btn ui-test-btn--data">🔗 Bridge</button>
      <button id="btn-state-save" class="ui-test-btn ui-test-btn--data">💾 Save</button>
      <button id="btn-state-load" class="ui-test-btn ui-test-btn--data">📂 Load</button>
      <button id="btn-kv" class="ui-test-btn ui-test-btn--data">💾 KV</button>
    </div>
    
    <div id="test-log">Aguardando interação...</div>
  `;

  document.body.appendChild(panel);
  console.log('📎 [UI-Test] Painel anexado ao document.body');

  const rect = panel.getBoundingClientRect();
  console.log(`📐 [UI-Test] Painel visível: ${rect.width}x${rect.height}px em (${rect.left}, ${rect.top})`);

  logDiv = document.getElementById('test-log');

  // Global controls
  document.getElementById('btn-run-all').onclick = () => runAllTests(testDefs);
  document.getElementById('btn-clear-log').onclick = clearLog;
  document.getElementById('btn-export').onclick = exportResults;

  // Individual test handlers
  document.getElementById('btn-dice').onclick = () => runTest('btn-dice', 'Dice', diceHandler);
  document.getElementById('btn-seeder').onclick = () => runTest('btn-seeder', 'Seeder', seederHandler);
  document.getElementById('btn-pattern').onclick = () => runTest('btn-pattern', 'Pattern', patternHandler);
  document.getElementById('btn-ai-text').onclick = () => runTest('btn-ai-text', 'AI Text', aiTextHandler);
  document.getElementById('btn-image').onclick = () => runTest('btn-image', 'Image', imageHandler);
  document.getElementById('btn-tts').onclick = () => runTest('btn-tts', 'TTS', ttsHandler);
  document.getElementById('btn-tts-stop').onclick = () => runTest('btn-tts-stop', 'TTS Stop', () => {
    log('⏹️ Parando fala...', 'info');
    if (!ttsTest) throw new Error('TTS not available');
    if (!ttsTest.stopSpeech()) throw new Error('Stop not available');
    log('✅ Fala parada', 'success');
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

  console.log(`✅ [UI-Test] Painel de testes ${VERSION} criado com controles globais.`);
}
