// src/main.js
// Entry point do jogo - importa e inicializa todos os módulos
import { root, getVar, getList } from 'https://cdn.jsdelivr.net/gh/Fahell/test-perchance-git@v1.2.0/src/perchance-bridge.js';
import { initRenderer } from 'https://cdn.jsdelivr.net/gh/Fahell/test-perchance-git@v1.2.0/src/modules/renderer.js';
import { initLogic } from 'https://cdn.jsdelivr.net/gh/Fahell/test-perchance-git@v1.2.0/src/modules/logic.js';

// Importa todos os módulos de teste
import { imageTest } from 'https://cdn.jsdelivr.net/gh/Fahell/test-perchance-git@v1.2.0/src/modules/image-test.js';
import { aiTextTest } from 'https://cdn.jsdelivr.net/gh/Fahell/test-perchance-git@v1.2.0/src/modules/ai-text-test.js';
import { listsTest } from 'https://cdn.jsdelivr.net/gh/Fahell/test-perchance-git@v1.2.0/src/modules/lists-test.js';
import { stateTest } from 'https://cdn.jsdelivr.net/gh/Fahell/test-perchance-git@v1.2.0/src/modules/state-test.js';
import { raycasterTest } from 'https://cdn.jsdelivr.net/gh/Fahell/test-perchance-git@v1.2.0/src/modules/raycaster-test.js';
import { canvasTest } from 'https://cdn.jsdelivr.net/gh/Fahell/test-perchance-git@v1.2.0/src/modules/canvas-test.js';
import { ttsTest } from 'https://cdn.jsdelivr.net/gh/Fahell/test-perchance-git@v1.2.0/src/modules/tts-test.js';
import { diceTest } from 'https://cdn.jsdelivr.net/gh/Fahell/test-perchance-git@v1.2.0/src/modules/dice-test.js';
import { rpgIconTest } from 'https://cdn.jsdelivr.net/gh/Fahell/test-perchance-git@v1.2.0/src/modules/rpg-icon-test.js';
import { patternTest } from 'https://cdn.jsdelivr.net/gh/Fahell/test-perchance-git@v1.2.0/src/modules/pattern-test.js';
import { kvTest } from 'https://cdn.jsdelivr.net/gh/Fahell/test-perchance-git@v1.2.0/src/modules/kv-test.js';
import { seederTest } from 'https://cdn.jsdelivr.net/gh/Fahell/test-perchance-git@v1.2.0/src/modules/seeder-test.js';

export async function initGame() {
  // 🛡️ Guard clause duplo para evitar execução duplicada
  if (window.GAME_INITIALIZED) {
    console.warn('⏭️ Jogo já inicializado. Ignorando execução duplicada.');
    return;
  }
  window.GAME_INITIALIZED = true;

  console.log('🔍 [Main] initGame() chamado. Verificando estado...');

  try {
    console.log('🚀 [Main] Iniciando jogo modularizado (primeira execução)...');

    // 1. Inicializa Renderizador (Three.js)
    const rendererData = initRenderer(document.getElementById('game-container'));

    // 2. Inicializa Lógica (Dados do Perchance)
    const seed = getVar('GAME_SEED', 999);
    const bioma = getList('biomas', ['planície']).selectOne;
    initLogic(seed, bioma);

    // 3. Carrega e inicializa UI de Teste (import dinâmico)
    console.log('🔍 [Main] Carregando módulo ui-test.js...');
    const { initUITest } = await import('https://cdn.jsdelivr.net/gh/Fahell/test-perchance-git@v1.2.0/src/modules/ui-test.js');
    console.log('📦 [Main] ui-test.js carregado. exports:', Object.keys(await import('https://cdn.jsdelivr.net/gh/Fahell/test-perchance-git@v1.2.0/src/modules/ui-test.js')));

    console.log('🎮 [Main] Chamando initUITest...');
    console.log('📦 [Main] rendererData passado:', rendererData);
    console.log('   renderer.cube:', rendererData.cube);

    // Passa todos os módulos de teste para a UI
    initUITest(rendererData, {
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
    });

    console.log('✅ [Main] Jogo inicializado com sucesso!');
    console.log('💡 Debug: window.RPG disponível no console');

    // Expor para debug no console
    window.RPG = {
      renderer: rendererData,
      seed,
      bioma,
      root,
      // Módulos de teste
      tests: {
        image: imageTest,
        aiText: aiTextTest,
        lists: listsTest,
        state: stateTest,
        raycaster: raycasterTest,
        canvas: canvasTest,
        tts: ttsTest,
        dice: diceTest,
        rpgIcon: rpgIconTest,
        pattern: patternTest,
        kv: kvTest,
        seeder: seederTest
      }
    };
  } catch (error) {
    console.error('❌ [Main] Erro fatal na inicialização:', error);

    // Mostra mensagem de erro na tela
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed; bottom: 20px; left: 20px; z-index: 9999;
      background: #ff0000; color: white; padding: 20px;
      border-radius: 8px; font-family: monospace; font-size: 14px;
      border: 2px solid #ff6b6b; max-width: 400px;
    `;
    errorDiv.innerHTML = `
      <strong>❌ Erro ao iniciar o jogo</strong><br>
      <small>${error.message}</small><br>
      <small>Verifique o console (F12) para mais detalhes.</small>
    `;
    document.body.appendChild(errorDiv);
  }
}

// Log para confirmar que o arquivo foi lido
console.log('📦 [Main] main.js carregado. Aguardando initGame()...');
