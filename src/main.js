import { root, getVar, getList } from './perchance-bridge.js';
import { initRenderer } from './modules/renderer.js';
import { initLogic } from './modules/logic.js';

export async function initGame() {
  console.log('🔍 [Main] initGame() chamado. Verificando estado...');
  
  // 🛡️ Guard clause: evita execução duplicada no Perchance
  // O HTML Panel é injetado via innerHTML, então usamos apenas window flag
  if (window.GAME_INITIALIZED) {
    console.warn('⚠️ [Main] Jogo já inicializado (window flag). Ignorando.');
    return;
  }
  
  // Marca como inicializado
  window.GAME_INITIALIZED = true;
  
  console.log('🚀 [Main] Iniciando jogo modularizado...');

  try {
    // 1. Inicializa Renderizador (Three.js)
    const renderer = initRenderer(document.getElementById('game-container'));

    // 2. Inicializa Lógica (Dados do Perchance)
    const seed = getVar('GAME_SEED', 999);
    const bioma = getList('biomas', ['planície']).selectOne;
    initLogic(seed, bioma);

    // 3. Inicializa UI de Teste (Carregamento dinâmico)
    const { initUITest } = await import('./modules/ui-test.js');
    initUITest(renderer);

    console.log('✅ [Main] Jogo inicializado com sucesso!');
  } catch (error) {
    console.error('❌ [Main] Erro fatal na inicialização:', error);
  }
}

console.log('📦 [Main] main.js carregado. Aguardando initGame()...');
