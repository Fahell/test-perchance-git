import { root, getVar, getList } from './perchance-bridge.js';
import { initRenderer } from './modules/renderer.js';
import { initLogic } from './modules/logic.js';

export async function initGame() {
  console.log('🔍 [Main] initGame() chamado. Verificando estado...');
  
  // 🛡️ Guard clause duplo: sessionStorage + window flag
  // sessionStorage persiste entre re-renderizações do Perchance
  if (sessionStorage.getItem('rpg_initialized') === 'true' && window.GAME_INITIALIZED) {
    console.warn('⚠️ [Main] Jogo já inicializado (sessionStorage + window). Ignorando.');
    return;
  }
  
  // Marca como inicializado
  window.GAME_INITIALIZED = true;
  
  console.log('🚀 [Main] Iniciando jogo modularizado (primeira execução)...');

  try {
    // 1. Inicializa Renderizador (Three.js)
    const renderer = initRenderer(document.getElementById('game-container'));

    // 2. Inicializa Lógica (Dados do Perchance)
    const seed = getVar('GAME_SEED', 999);
    const bioma = getList('biomas', ['planície']).selectOne;
    initLogic(seed, bioma);

    // 3. Inicializa UI de Teste (Carregamento dinâmico com tratamento de erro)
    console.log('🔍 [Main] Carregando módulo ui-test.js...');
    try {
      const uiModule = await import('./modules/ui-test.js?v=11');
      console.log('📦 [Main] ui-test.js carregado. exports:', Object.keys(uiModule));
      
      if (typeof uiModule.initUITest === 'function') {
        console.log('🎮 [Main] Chamando initUITest...');
        uiModule.initUITest(renderer);
      } else {
        console.error('❌ [Main] initUITest não é uma função. exports:', Object.keys(uiModule));
      }
    } catch (importError) {
      console.error('❌ [Main] Falha ao importar ui-test.js:', importError);
      // Cria um alerta visual para o usuário
      const errorAlert = document.createElement('div');
      errorAlert.style.cssText = 'position:fixed;bottom:20px;left:20px;z-index:9999;background:#ef4444;color:white;padding:15px;border-radius:8px;font-family:monospace;max-width:400px;';
      errorAlert.innerHTML = `<strong>❌ Erro ao carregar UI:</strong><br>${importError.message}<br><small style="color:#fca5a5">Verifique console para detalhes</small>`;
      document.body.appendChild(errorAlert);
    }

    console.log('✅ [Main] Jogo inicializado com sucesso!');
  } catch (error) {
    console.error('❌ [Main] Erro fatal na inicialização:', error);
    // Alerta visual para erros fatais
    const fatalAlert = document.createElement('div');
    fatalAlert.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:9999;background:#dc2626;color:white;padding:20px;border-radius:12px;font-family:monospace;max-width:500px;text-align:center;';
    fatalAlert.innerHTML = `<strong>❌ Erro Fatal</strong><br><pre style="text-align:left;margin:10px 0;font-size:12px">${error.message}</pre><button onclick="location.reload()" style="padding:8px 16px;background:white;color:#dc2626;border:none;border-radius:4px;cursor:pointer;font-weight:bold">🔄 Recarregar</button>`;
    document.body.appendChild(fatalAlert);
  }
}

console.log('📦 [Main] main.js carregado. Aguardando initGame()...');
