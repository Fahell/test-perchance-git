import { root, getVar, getList } from './perchance-bridge.js';
import { initRenderer } from './modules/renderer.js';
import { initLogic } from './modules/logic.js';

export async function initGame() {
  console.log('🔍 [Main] initGame() chamado. Verificando estado...');
  
  // 🛡️ Guard clause duplo: sessionStorage (sobrevive a reloads) + window (rápido)
  const alreadyInit = sessionStorage.getItem('RPG_INITIALIZED') === 'done';
  if (alreadyInit || window.GAME_INITIALIZED) {
    console.warn('⚠️ [Main] Jogo já inicializado. Ignorando execução duplicada.');
    return;
  }
  
  // Marca AMBOS os flags
  window.GAME_INITIALIZED = true;
  sessionStorage.setItem('RPG_INITIALIZED', 'done');
  
  console.log('🚀 [Main] Iniciando jogo modularizado (primeira execução)...');

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
