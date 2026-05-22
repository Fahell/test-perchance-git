// src/modules/ui-test.js
// Painel de testes interativo com todos os módulos
import { root, getVar, getList } from 'https://cdn.jsdelivr.net/gh/Fahell/test-perchance-git@v1.1.3/src/perchance-bridge.js';
import { initAITextTest } from 'https://cdn.jsdelivr.net/gh/Fahell/test-perchance-git@v1.1.3/src/modules/ai-text-test.js';
import { initImageTest } from 'https://cdn.jsdelivr.net/gh/Fahell/test-perchance-git@v1.1.3/src/modules/image-test.js';
import { initListsTest } from 'https://cdn.jsdelivr.net/gh/Fahell/test-perchance-git@v1.1.3/src/modules/lists-test.js';
import { initRaycasterTest } from 'https://cdn.jsdelivr.net/gh/Fahell/test-perchance-git@v1.1.3/src/modules/raycaster-test.js';
import { initStateTest } from 'https://cdn.jsdelivr.net/gh/Fahell/test-perchance-git@v1.1.3/src/modules/state-test.js';
import { initCanvasTest } from 'https://cdn.jsdelivr.net/gh/Fahell/test-perchance-git@v1.1.3/src/modules/canvas-test.js';

export function initUITest(rendererData) {
  console.log('🎮 [UI-Test] Criando painel de testes expandido...');

  // Captura valores do Perchance ANTES de qualquer delay
  const capturedSeed = getVar('GAME_SEED', 'N/A');
  const capturedRoot = !!root;
  console.log('📸 [UI-Test] Valores capturados:', { seed: capturedSeed, root: capturedRoot });

  // Cria painel flutuante
  const panel = document.createElement('div');
  panel.id = 'ui-test-panel';
  panel.style.cssText = `
    position: fixed; bottom: 20px; left: 20px; z-index: 9999;
    background: rgba(0, 0, 0, 0.9); color: white; padding: 15px;
    border-radius: 8px; font-family: monospace; font-size: 12px;
    border: 2px solid #4ade80; box-shadow: 0 4px 20px rgba(74, 222, 128, 0.3);
    max-width: 320px; max-height: 80vh; overflow-y: auto;
  `;

  panel.innerHTML = `
    <h3 style="margin:0 0 10px 0; color:#4ade80; font-size:14px;">🧪 Painel de Testes v1.1.2</h3>
    
    <div style="border-bottom: 1px solid #333; padding-bottom: 8px; margin-bottom: 8px;">
      <strong style="color:#4ade80;">🔌 Plugins</strong><br>
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
    
    <div>
      <strong style="color:#4ade80;">💾 Estado</strong><br>
      <button id="btn-state-save" style="margin:2px; padding:4px 8px; cursor:pointer; background:#1a1a2e; color:white; border:1px solid #4ade80; border-radius:4px;">💾 Salvar</button>
      <button id="btn-state-load" style="margin:2px; padding:4px 8px; cursor:pointer; background:#1a1a2e; color:white; border:1px solid #4ade80; border-radius:4px;">📂 Carregar</button>
    </div>
    
    <div id="test-log" style="margin-top:10px; color:#aaa; font-size:11px; max-height:100px; overflow-y: auto; background:#0a0a0a; padding:8px; border-radius:4px;">Aguardando interação...</div>
  `;

  // Anexa ao body
  document.body.appendChild(panel);
  console.log('📎 [UI-Test] Painel anexado ao document.body');

  // Verifica visibilidade
  const rect = panel.getBoundingClientRect();
  console.log(`📐 [UI-Test] Painel visível: ${rect.width}x${rect.height}px em (${rect.left}, ${rect.top})`);
  console.log(`👁️ [UI-Test] Panel offsetParent:`, panel.offsetParent);

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

  // Inicializa módulos de teste
  const aiTextTest = initAITextTest();
  const imageTest = initImageTest();
  const listsTest = initListsTest();
  const stateTest = initStateTest();
  const raycasterTest = initRaycasterTest(rendererData);
  const canvasTest = initCanvasTest(rendererData);

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
        log('✅ Imagem gerada! Veja console para URL', '#4ade80');
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

  // State Save
  document.getElementById('btn-state-save').onclick = () => {
    log('💾 Salvando estado...', '#4ade80');
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
    log('📂 Carregando estado...', '#4ade80');
    const loaded = stateTest.load();
    if (loaded) {
      log(`✅ Carregado: ${loaded.player.name} Lv.${loaded.player.level}`, '#4ade80');
    } else {
      log('⚠️ Nenhum save encontrado', '#ff6b6b');
    }
  };

  console.log('✅ [UI-Test] Painel de testes criado e visível.');
}
