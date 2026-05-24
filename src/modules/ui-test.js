// src/modules/ui-test.js
// Painel de testes interativo com todos os módulos (v1.2.8)
import { root, getVar, getList } from 'https://cdn.jsdelivr.net/gh/Fahell/test-perchance-git@v1.2.7/src/perchance-bridge.js';

const VERSION = 'v1.2.8';
const CSS_URL = `https://cdn.jsdelivr.net/gh/Fahell/test-perchance-git@${VERSION}/src/styles/ui-test.css`;

function injectStylesheet() {
  if (document.getElementById('ui-test-styles')) return;
  const link = document.createElement('link');
  link.id = 'ui-test-styles';
  link.rel = 'stylesheet';
  link.href = CSS_URL;
  document.head.appendChild(link);
}

export function initUITest(rendererData, testModules) {
  console.log(`🎮 [UI-Test] Criando painel de testes expandido ${VERSION}...`);

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
    seederTest
  } = testModules;

  const panel = document.createElement('div');
  panel.id = 'ui-test-panel';

  panel.innerHTML = `
    <h3>🧪 Painel de Testes ${VERSION}</h3>
    
    <div class="ui-test-category">
      <strong style="color:var(--ui-color-ai)">🤖 IA</strong>
      <button id="btn-ai-text" class="ui-test-btn">🤖 AI Text</button>
      <button id="btn-image" class="ui-test-btn">🖼️ Image</button>
    </div>
    
    <div class="ui-test-category">
      <strong style="color:var(--ui-color-perchance)">🎲 Perchance</strong>
      <button id="btn-lists" class="ui-test-btn">📋 Listas</button>
      <button id="btn-bridge" class="ui-test-btn">🔗 Bridge</button>
    </div>
    
    <div class="ui-test-category">
      <strong style="color:var(--ui-color-threejs)">🎨 Three.js</strong>
      <button id="btn-3d" class="ui-test-btn">🎲 Cor Cubo</button>
      <button id="btn-raycaster" class="ui-test-btn">🖱️ Raycaster</button>
      <button id="btn-canvas" class="ui-test-btn">🎨 Canvas</button>
    </div>
    
    <div class="ui-test-category">
      <strong style="color:var(--ui-color-rpg)">🎮 RPG</strong>
      <button id="btn-dice" class="ui-test-btn ui-test-btn--rpg">🎲 Dice</button>
      <button id="btn-rpg-icon" class="ui-test-btn ui-test-btn--rpg">⚔️ RPG Icons</button>
    </div>
    
    <div class="ui-test-category">
      <strong style="color:var(--ui-color-audio)">🔊 Áudio</strong>
      <button id="btn-tts" class="ui-test-btn ui-test-btn--audio">🔊 TTS</button>
      <button id="btn-tts-stop" class="ui-test-btn ui-test-btn--audio">⏹️ Parar</button>
    </div>
    
    <div class="ui-test-category">
      <strong style="color:var(--ui-color-seeds)">🌱 Seeds</strong>
      <button id="btn-seeder" class="ui-test-btn ui-test-btn--seeds">🌱 Seeder</button>
      <button id="btn-pattern" class="ui-test-btn ui-test-btn--seeds">🎨 Pattern</button>
    </div>
    
    <div class="ui-test-category">
      <strong style="color:var(--ui-color-persist)">💾 Persistência</strong>
      <button id="btn-state-save" class="ui-test-btn ui-test-btn--persist">💾 Save</button>
      <button id="btn-state-load" class="ui-test-btn ui-test-btn--persist">📂 Load</button>
      <button id="btn-kv" class="ui-test-btn ui-test-btn--persist">💾 KV</button>
    </div>
    
    <div id="test-log">Aguardando interação...</div>
  `;

  document.body.appendChild(panel);
  console.log('📎 [UI-Test] Painel anexado ao document.body');

  const rect = panel.getBoundingClientRect();
  console.log(`📐 [UI-Test] Painel visível: ${rect.width}x${rect.height}px em (${rect.left}, ${rect.top})`);

  const logDiv = document.getElementById('test-log');
  function log(message, type = 'info') {
    if (!logDiv) return;
    const entry = document.createElement('div');
    entry.className = `log-entry log-entry--${type}`;
    entry.textContent = message;
    logDiv.appendChild(entry);
    logDiv.scrollTop = logDiv.scrollHeight;
  }

  // AI Text
  document.getElementById('btn-ai-text').onclick = async () => {
    log('🤖 Gerando texto com IA...', 'info');
    if (!aiTextTest || !aiTextTest.available) {
      log('⚠️ Plugin AI Text não disponível', 'warning');
      return;
    }
    try {
      const result = await aiTextTest.generateBasic('Escreva uma frase curta sobre um aventureiro.');
      if (result && result.generatedText) {
        const preview = result.generatedText.substring(0, 60) + '...';
        log(`✅ AI: "${preview}"`, 'success');
      } else {
        log('❌ Erro ao gerar texto', 'error');
      }
    } catch (e) {
      log(`❌ Erro: ${e.message}`, 'error');
    }
  };

  // Image
  document.getElementById('btn-image').onclick = async () => {
    log('🖼️ Gerando imagem com IA...', 'info');
    if (!imageTest || !imageTest.available) {
      log('⚠️ Plugin Image não disponível', 'warning');
      return;
    }
    try {
      const result = await imageTest.testBasicImage('papercraft warrior with sword, fantasy art style', 12345);
      if (result) {
        log('✅ Imagem gerada! Veja preview no canto inferior direito', 'success');
      } else {
        log('❌ Erro ao gerar imagem', 'error');
      }
    } catch (e) {
      log(`❌ Erro: ${e.message}`, 'error');
    }
  };

  // Listas
  document.getElementById('btn-lists').onclick = () => {
    log('📋 Testando listas...', 'info');
    try {
      if (!listsTest) {
        log('⚠️ Lists não disponível', 'warning');
        return;
      }
      const item = listsTest.testSelectOne('itens');
      const heroes = listsTest.testSelectUnique('nomes_herois', 2);
      const length = listsTest.testListLength('nomes_herois');
      log(`✅ Item: "${item}" | Heróis: ${heroes.length} | Tamanho: ${length}`, 'success');
    } catch (e) {
      log(`❌ Erro: ${e.message}`, 'error');
    }
  };

  // Bridge
  document.getElementById('btn-bridge').onclick = () => {
    log(`📡 Seed: ${capturedSeed} | Root: ${capturedRoot}`, 'success');
  };

  // Cor do Cubo
  document.getElementById('btn-3d').onclick = () => {
    log('🎲 Mudando cor do cubo...', 'info');
    if (rendererData && rendererData.cube && rendererData.cube.material) {
      rendererData.cube.material.color.setHex(Math.random() * 0xffffff);
      log('✅ Cor do cubo alterada!', 'success');
    } else {
      log('⚠️ Cubo não disponível', 'warning');
    }
  };

  // Raycaster
  document.getElementById('btn-raycaster').onclick = () => {
    log('🖱️ Raycaster: Clique nas esferas coloridas!', 'info');
    if (raycasterTest && raycasterTest.available) {
      log(`✅ ${raycasterTest.spheres?.length || 0} esferas adicionadas`, 'success');
    } else {
      log('⚠️ Raycaster não disponível', 'warning');
    }
  };

  // Canvas
  document.getElementById('btn-canvas').onclick = () => {
    log('🎨 Testando Canvas 2D...', 'info');
    if (canvasTest) {
      canvasTest.drawGradient();
      canvasTest.drawCircles(15);
      canvasTest.drawText('RPG Paper Craft', 256, 256);
      if (canvasTest.threeIntegration) {
        canvasTest.showThreePlane();
      }
      log('✅ Canvas desenhado!', 'success');
    } else {
      log('⚠️ Canvas não disponível', 'warning');
    }
  };

  // Dice
  document.getElementById('btn-dice').onclick = () => {
    log('🎲 Rolando dados...', 'info');
    if (!diceTest || !diceTest.available) {
      log('⚠️ Plugin Dice não disponível', 'warning');
      return;
    }
    try {
      const d20 = diceTest.rollD20();
      const d6 = diceTest.roll3D6();
      log(`✅ 1d20: ${d20.result} | 3d6: ${d6.result}`, 'success');
    } catch (e) {
      log(`❌ Erro: ${e.message}`, 'error');
    }
  };

  // RPG Icons
  document.getElementById('btn-rpg-icon').onclick = () => {
    log('⚔️ Carregando RPG Icons...', 'info');
    if (!rpgIconTest || !rpgIconTest.available) {
      log('⚠️ Plugin RPG Icon não disponível', 'warning');
      return;
    }
    try {
      const icons = rpgIconTest.getMultipleIcons(6);
      log(icons ? `✅ ${icons.length} ícones carregados! Veja grid no canto superior direito` : '❌ Erro ao carregar ícones', icons ? 'success' : 'error');
    } catch (e) {
      log(`❌ Erro: ${e.message}`, 'error');
    }
  };

  // TTS
  document.getElementById('btn-tts').onclick = () => {
    log('🔊 Testando Text-to-Speech...', 'info');
    if (!ttsTest || !ttsTest.available) {
      log('⚠️ Plugin TTS não disponível', 'warning');
      return;
    }
    try {
      ttsTest.speakBasic('Olá! Este é um teste de síntese de voz.');
      log('✅ Fala iniciada!', 'success');
    } catch (e) {
      log(`❌ Erro: ${e.message}`, 'error');
    }
  };

  // TTS Stop
  document.getElementById('btn-tts-stop').onclick = () => {
    log('⏹️ Parando fala...', 'info');
    if (ttsTest) {
      const stopped = ttsTest.stopSpeech();
      log(stopped ? '✅ Fala parada' : '⚠️ Nenhum método de stop disponível', stopped ? 'success' : 'warning');
    }
  };

  // Seeder
  document.getElementById('btn-seeder').onclick = () => {
    log('🌱 Testando Seeder...', 'info');
    if (!seederTest || !seederTest.available) {
      log('⚠️ Plugin Seeder não disponível', 'warning');
      return;
    }
    try {
      const seed = seederTest.generateRandomSeed();
      seederTest.applySeed(seed);
      log(`✅ Seed aplicada: ${seed}`, 'success');
      log('   Seleções agora são determinísticas!', 'success');
    } catch (e) {
      log(`❌ Erro: ${e.message}`, 'error');
    }
  };

  // Pattern
  document.getElementById('btn-pattern').onclick = async () => {
    log('🎨 Gerando padrão procedural...', 'info');
    if (!patternTest || !patternTest.available) {
      log('⚠️ Plugin Pattern não disponível', 'warning');
      return;
    }
    try {
      const result = patternTest.generateEmojiPattern();
      log(result ? '✅ Padrão gerado! Veja preview no canto inferior direito' : '❌ Erro ao gerar padrão', result ? 'success' : 'error');
    } catch (e) {
      log(`❌ Erro: ${e.message}`, 'error');
    }
  };

  // State Save
  document.getElementById('btn-state-save').onclick = () => {
    log('💾 Salvando estado...', 'info');
    if (!stateTest) {
      log('⚠️ State não disponível', 'warning');
      return;
    }
    const state = stateTest.getDefaultState();
    state.player.name = 'Herói Testador';
    state.player.level = 5;
    state.world.bioma = 'floresta';
    const saved = stateTest.save(state);
    if (saved) {
      log('✅ Estado salvo!', 'success');
    } else {
      log('❌ Erro ao salvar', 'error');
    }
  };

  // State Load
  document.getElementById('btn-state-load').onclick = () => {
    log('📂 Carregando estado...', 'info');
    if (!stateTest) {
      log('⚠️ State não disponível', 'warning');
      return;
    }
    const loaded = stateTest.load();
    if (loaded) {
      log(`✅ Carregado: ${loaded.player.name} Lv.${loaded.player.level}`, 'success');
    } else {
      log('⚠️ Nenhum save encontrado', 'warning');
    }
  };

  // KV
  document.getElementById('btn-kv').onclick = async () => {
    log('💾 Testando KV Plugin...', 'info');
    if (!kvTest || !kvTest.available) {
      log('⚠️ Plugin KV não disponível', 'warning');
      return;
    }
    try {
      const saved = await kvTest.setSimpleValue('test_key', 'test_value');
      if (saved) {
        const retrieved = await kvTest.getValue('test_key');
        log(`✅ KV: test_key = "${retrieved}"`, 'success');
      } else {
        log('❌ Erro ao salvar', 'error');
      }
    } catch (e) {
      log(`❌ Erro: ${e.message}`, 'error');
    }
  };

  console.log(`✅ [UI-Test] Painel de testes ${VERSION} criado e visível.`);
}
