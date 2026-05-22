// src/modules/ui-test.js
// Painel de testes interativo com todos os módulos
import { root, getVar, getList } from 'https://cdn.jsdelivr.net/gh/Fahell/test-perchance-git@v1.2.0/src/perchance-bridge.js';

export function initUITest(rendererData, testModules) {
  console.log('🎮 [UI-Test] Criando painel de testes expandido v1.2.0...');

  // Captura valores do Perchance ANTES de qualquer delay
  const capturedSeed = getVar('GAME_SEED', 'N/A');
  const capturedRoot = !!root;
  console.log('📸 [UI-Test] Valores capturados:', { seed: capturedSeed, root: capturedRoot });

  // Desestrutura os módulos de teste
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

  // Cria painel flutuante
  const panel = document.createElement('div');
  panel.id = 'ui-test-panel';
  panel.style.cssText = `
    position: fixed; bottom: 20px; left: 20px; z-index: 9999;
    background: rgba(0, 0, 0, 0.9); color: white; padding: 15px;
    border-radius: 8px; font-family: monospace; font-size: 12px;
    border: 2px solid #4ade80; box-shadow: 0 4px 20px rgba(74, 222, 128, 0.3);
    max-width: 340px; max-height: 85vh; overflow-y: auto;
  `;

  panel.innerHTML = `
    <h3 style="margin:0 0 10px 0; color:#4ade80; font-size:14px;">🧪 Painel de Testes v1.2.0</h3>
    
    <div style="border-bottom: 1px solid #333; padding-bottom: 8px; margin-bottom: 8px;">
      <strong style="color:#4ade80;">🤖 IA</strong><br>
      <button id="btn-ai-text" style="margin:2px; padding:4px 8px; cursor:pointer; background:#1a1a2e; color:white; border:1px solid #4ade80; border-radius:4px;">🤖 AI Text</button>
      <button id="btn-image" style="margin:2px; padding:4px 8px; cursor:pointer; background:#1a1a2e; color:white; border:1px solid #4ade80; border-radius:4px;">🖼️ Image</button>
    </div>
    
    <div style="border-bottom: 1px solid #333; padding-bottom: 8px; margin-bottom: 8px;">
      <strong style="color:#4ade80;">🎲 Perchance</strong><br>
      <button id="btn-lists" style="margin:2px; padding:4px 8px; cursor:pointer; background:#1a1a2e; color:white; border:1px solid #4ade80; border-radius:4px;">📋 Listas</button>
      <button id="btn-bridge" style="margin:2px; padding:4px 8px; cursor:pointer; background:#1a1a2e; color:white; border:1px solid #4ade80; border-radius:4px;">🔗 Bridge</button>
    </div>
    
    <div style="border-bottom: 1px solid #333; padding-bottom: 8px; margin-bottom: 8px;">
      <strong style="color:#4ade80;">🎨 Three.js</strong><br>
      <button id="btn-3d" style="margin:2px; padding:4px 8px; cursor:pointer; background:#1a1a2e; color:white; border:1px solid #4ade80; border-radius:4px;">🎲 Cor Cubo</button>
      <button id="btn-raycaster" style="margin:2px; padding:4px 8px; cursor:pointer; background:#1a1a2e; color:white; border:1px solid #4ade80; border-radius:4px;">🖱️ Raycaster</button>
      <button id="btn-canvas" style="margin:2px; padding:4px 8px; cursor:pointer; background:#1a1a2e; color:white; border:1px solid #4ade80; border-radius:4px;">🎨 Canvas</button>
    </div>
    
    <div style="border-bottom: 1px solid #333; padding-bottom: 8px; margin-bottom: 8px;">
      <strong style="color:#fbbf24;">🎮 RPG</strong><br>
      <button id="btn-dice" style="margin:2px; padding:4px 8px; cursor:pointer; background:#1a1a2e; color:white; border:1px solid #fbbf24; border-radius:4px;">🎲 Dice</button>
      <button id="btn-rpg-icon" style="margin:2px; padding:4px 8px; cursor:pointer; background:#1a1a2e; color:white; border:1px solid #fbbf24; border-radius:4px;">⚔️ RPG Icons</button>
    </div>
    
    <div style="border-bottom: 1px solid #333; padding-bottom: 8px; margin-bottom: 8px;">
      <strong style="color:#a78bfa;">🔊 Áudio</strong><br>
      <button id="btn-tts" style="margin:2px; padding:4px 8px; cursor:pointer; background:#1a1a2e; color:white; border:1px solid #a78bfa; border-radius:4px;">🔊 TTS</button>
      <button id="btn-tts-stop" style="margin:2px; padding:4px 8px; cursor:pointer; background:#1a1a2e; color:white; border:1px solid #a78bfa; border-radius:4px;">⏹️ Parar</button>
    </div>
    
    <div style="border-bottom: 1px solid #333; padding-bottom: 8px; margin-bottom: 8px;">
      <strong style="color:#60a5fa;">🌱 Seeds</strong><br>
      <button id="btn-seeder" style="margin:2px; padding:4px 8px; cursor:pointer; background:#1a1a2e; color:white; border:1px solid #60a5fa; border-radius:4px;">🌱 Seeder</button>
      <button id="btn-pattern" style="margin:2px; padding:4px 8px; cursor:pointer; background:#1a1a2e; color:white; border:1px solid #60a5fa; border-radius:4px;">🎨 Pattern</button>
    </div>
    
    <div>
      <strong style="color:#f87171;">💾 Persistência</strong><br>
      <button id="btn-state-save" style="margin:2px; padding:4px 8px; cursor:pointer; background:#1a1a2e; color:white; border:1px solid #f87171; border-radius:4px;">💾 Save</button>
      <button id="btn-state-load" style="margin:2px; padding:4px 8px; cursor:pointer; background:#1a1a2e; color:white; border:1px solid #f87171; border-radius:4px;">📂 Load</button>
      <button id="btn-kv" style="margin:2px; padding:4px 8px; cursor:pointer; background:#1a1a2e; color:white; border:1px solid #f87171; border-radius:4px;">💾 KV</button>
    </div>
    
    <div id="test-log" style="margin-top:10px; color:#aaa; font-size:11px; max-height:100px; overflow-y: auto; background:#0a0a0a; padding:8px; border-radius:4px;">Aguardando interação...</div>
  `;

  // Anexa ao body
  document.body.appendChild(panel);
  console.log('📎 [UI-Test] Painel anexado ao document.body');

  // Verifica visibilidade
  const rect = panel.getBoundingClientRect();
  console.log(`📐 [UI-Test] Painel visível: ${rect.width}x${rect.height}px em (${rect.left}, ${rect.top})`);

  // Área de log
  const logDiv = document.getElementById('test-log');
  function log(message, color = '#aaa') {
    logDiv.innerHTML = `<span style="color:${color}">${message}</span><br>` + logDiv.innerHTML;
    // Mantém apenas as últimas 10 linhas
    const lines = logDiv.innerHTML.split('<br>');
    if (lines.length > 10) {
      logDiv.innerHTML = lines.slice(0, 10).join('<br>');
    }
  }

  // Event Listeners
  
  // AI Text
  document.getElementById('btn-ai-text').onclick = async () => {
    log('🤖 Testando AI Text...', '#4ade80');
    if (!aiTextTest || !aiTextTest.available) {
      log('⚠️ Plugin AI Text não disponível', '#ff6b6b');
      return;
    }
    try {
      const result = await aiTextTest.generateBasic();
      if (result && result.generatedText) {
        log(`✅ AI: "${result.generatedText.substring(0, 50)}..."`, '#4ade80');
      } else {
        log('⚠️ Texto gerado vazio', '#ff6b6b');
      }
    } catch (e) {
      log(`❌ Erro: ${e.message}`, '#ff6b6b');
    }
  };

  // Image
  document.getElementById('btn-image').onclick = async () => {
    log('🖼️ Testando Image Plugin...', '#4ade80');
    if (!imageTest) {
      log('⚠️ Plugin Image não disponível', '#ff6b6b');
      return;
    }
    try {
      const result = await imageTest.testBasicImage();
      if (result) {
        log('✅ Imagem gerada! Veja preview à direita', '#4ade80');
      } else {
        log('⚠️ Falha na geração (ver console)', '#ff6b6b');
      }
    } catch (e) {
      log(`❌ Erro: ${e.message}`, '#ff6b6b');
    }
  };

  // Listas
  document.getElementById('btn-lists').onclick = () => {
    log('📋 Testando listas...', '#4ade80');
    try {
      const item = listsTest.testSelectOne('itens');
      const heroes = listsTest.testSelectUnique('nomes_herois', 2);
      const length = listsTest.testListLength('nomes_herois');
      log(`✅ Item: "${item}" | Heróis: ${heroes.length} | Tamanho: ${length}`, '#4ade80');
    } catch (e) {
      log(`❌ Erro: ${e.message}`, '#ff6b6b');
    }
  };

  // Bridge
  document.getElementById('btn-bridge').onclick = () => {
    log(`📡 Seed: ${capturedSeed} | Root: ${capturedRoot}`, '#4ade80');
  };

  // Cor do Cubo
  document.getElementById('btn-3d').onclick = () => {
    log('🎲 Mudando cor do cubo...', '#4ade80');
    if (rendererData && rendererData.cube && rendererData.cube.material) {
      rendererData.cube.material.color.setHex(Math.random() * 0xffffff);
      log('✅ Cor do cubo alterada!', '#4ade80');
    } else {
      log('⚠️ Cubo não disponível', '#ff6b6b');
    }
  };

  // Raycaster
  document.getElementById('btn-raycaster').onclick = () => {
    log('🖱️ Raycaster: Clique nas esferas coloridas!', '#4ade80');
    if (raycasterTest) {
      log(`✅ ${raycasterTest.spheres?.length || 0} esferas adicionadas`, '#4ade80');
    } else {
      log('⚠️ Raycaster não disponível', '#ff6b6b');
    }
  };

  // Canvas
  document.getElementById('btn-canvas').onclick = () => {
    log('🎨 Testando Canvas 2D...', '#4ade80');
    if (canvasTest) {
      canvasTest.drawing?.clear?.();
      canvasTest.drawing?.drawGradient?.();
      canvasTest.drawing?.drawCircles?.(15);
      canvasTest.drawing?.drawText?.('RPG Paper Craft', 256, 256);
      if (canvasTest.threeIntegration) {
        canvasTest.threeIntegration.show?.();
        canvasTest.threeIntegration.update?.();
      }
      log('✅ Canvas desenhado!', '#4ade80');
    } else {
      log('⚠️ Canvas não disponível', '#ff6b6b');
    }
  };

  // Dice
  document.getElementById('btn-dice').onclick = () => {
    log('🎲 Rolando dados...', '#fbbf24');
    if (!diceTest || !diceTest.available) {
      log('⚠️ Plugin Dice não disponível', '#ff6b6b');
      return;
    }
    try {
      const d20 = diceTest.rollD20();
      const d6 = diceTest.roll3D6();
      log(`✅ 1d20: ${d20.result} | 3d6: ${d6.result}`, '#4ade80');
    } catch (e) {
      log(`❌ Erro: ${e.message}`, '#ff6b6b');
    }
  };

  // RPG Icons
  document.getElementById('btn-rpg-icon').onclick = () => {
    log('⚔️ Carregando RPG Icons...', '#fbbf24');
    if (!rpgIconTest || !rpgIconTest.available) {
      log('⚠️ Plugin RPG Icon não disponível', '#ff6b6b');
      return;
    }
    try {
      rpgIconTest.getMultipleIcons(12);
      log('✅ 12 ícones carregados! Veja grid no canto superior direito', '#4ade80');
    } catch (e) {
      log(`❌ Erro: ${e.message}`, '#ff6b6b');
    }
  };

  // TTS
  document.getElementById('btn-tts').onclick = () => {
    log('🔊 Testando Text-to-Speech...', '#a78bfa');
    if (!ttsTest || !ttsTest.available) {
      log('⚠️ Plugin TTS não disponível', '#ff6b6b');
      return;
    }
    try {
      ttsTest.testBasicSpeech();
      log('✅ Fala iniciada!', '#4ade80');
    } catch (e) {
      log(`❌ Erro: ${e.message}`, '#ff6b6b');
    }
  };

  // TTS Stop
  document.getElementById('btn-tts-stop').onclick = () => {
    log('⏹️ Parando fala...', '#a78bfa');
    if (ttsTest) {
      ttsTest.stopSpeech();
      log('✅ Fala parada', '#4ade80');
    }
  };

  // Seeder
  document.getElementById('btn-seeder').onclick = () => {
    log('🌱 Testando Seeder...', '#60a5fa');
    if (!seederTest || !seederTest.available) {
      log('⚠️ Plugin Seeder não disponível', '#ff6b6b');
      return;
    }
    try {
      const seed = seederTest.generateSeed();
      log(`✅ Seed gerada: ${seed.seed}`, '#4ade80');
    } catch (e) {
      log(`❌ Erro: ${e.message}`, '#ff6b6b');
    }
  };

  // Pattern
  document.getElementById('btn-pattern').onclick = async () => {
    log('🎨 Gerando padrão procedural...', '#60a5fa');
    if (!patternTest || !patternTest.available) {
      log('⚠️ Plugin Pattern não disponível', '#ff6b6b');
      return;
    }
    try {
      await patternTest.generateBasicPattern();
      log('✅ Padrão gerado! Veja preview no centro', '#4ade80');
    } catch (e) {
      log(`❌ Erro: ${e.message}`, '#ff6b6b');
    }
  };

  // State Save
  document.getElementById('btn-state-save').onclick = () => {
    log('💾 Salvando estado...', '#f87171');
    const state = stateTest.getDefaultState();
    state.player.name = 'Herói Testador';
    state.player.level = 5;
    state.world.bioma = 'floresta';
    const saved = stateTest.save(state);
    if (saved) {
      log('✅ Estado salvo!', '#4ade80');
    } else {
      log('❌ Erro ao salvar', '#ff6b6b');
    }
  };

  // State Load
  document.getElementById('btn-state-load').onclick = () => {
    log('📂 Carregando estado...', '#f87171');
    const loaded = stateTest.load();
    if (loaded) {
      log(`✅ Carregado: ${loaded.player.name} Lv.${loaded.player.level}`, '#4ade80');
    } else {
      log('⚠️ Nenhum save encontrado', '#ff6b6b');
    }
  };

  // KV
  document.getElementById('btn-kv').onclick = async () => {
    log('💾 Testando KV Plugin...', '#f87171');
    if (!kvTest || !kvTest.available) {
      log('⚠️ Plugin KV não disponível', '#ff6b6b');
      return;
    }
    try {
      await kvTest.setSimpleValue('test_key', 'test_value');
      const result = await kvTest.getValue('test_key');
      log(`✅ KV: test_key = ${result.value}`, '#4ade80');
    } catch (e) {
      log(`❌ Erro: ${e.message}`, '#ff6b6b');
    }
  };

  console.log('✅ [UI-Test] Painel de testes v1.2.0 criado e visível.');
}
