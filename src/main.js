// src/main.js
// Entry point do jogo - v1.3.0 com Vite bundling

// Imports estáticos para módulos críticos
import * as bridgeMod from './perchance-bridge.js';
import { initRenderer } from './modules/renderer.js';
import { initLogic } from './modules/logic.js';

// Mapeamento de módulos de teste (dynamic imports)
const TEST_MODULES = {
  imageTest: () => import('./modules/image-test.js'),
  aiTextTest: () => import('./modules/ai-text-test.js'),
  listsTest: () => import('./modules/lists-test.js'),
  stateTest: () => import('./modules/state-test.js'),
  raycasterTest: () => import('./modules/raycaster-test.js'),
  canvasTest: () => import('./modules/canvas-test.js'),
  ttsTest: () => import('./modules/tts-test.js'),
  diceTest: () => import('./modules/dice-test.js'),
  rpgIconTest: () => import('./modules/rpg-icon-test.js'),
  patternTest: () => import('./modules/pattern-test.js'),
  kvTest: () => import('./modules/kv-test.js'),
  seederTest: () => import('./modules/seeder-test.js'),
  apexchartsTest: () => import('./modules/apexcharts-test.js'),
  audioTest: () => import('./modules/audio-test.js')
};

// Cache de módulos carregados
const loadedModules = {};

// Carrega um módulo de teste dinamicamente
async function loadTestModule(moduleName) {
  if (loadedModules[moduleName]) {
    return loadedModules[moduleName];
  }
  
  try {
    console.log(`🔍 [Main] Carregando ${moduleName}...`);
    const mod = await TEST_MODULES[moduleName]();
    loadedModules[moduleName] = mod;
    console.log(`✅ [Main] ${moduleName} carregado`);
    return mod;
  } catch (error) {
    console.error(`❌ [Main] Falha ao carregar ${moduleName}:`, error.message);
    return null;
  }
}

// Carrega todos os módulos de teste em paralelo
async function loadAllTestModules() {
  console.log('📦 [Main] Carregando módulos de teste em paralelo...');
  
  const promises = Object.keys(TEST_MODULES).map(async (key) => {
    const mod = await loadTestModule(key);
    return { key, mod };
  });
  
  const results = await Promise.all(promises);
  const modules = {};
  
  for (const { key, mod } of results) {
    if (mod) {
      modules[key] = mod[key] || mod;
    }
  }
  
  console.log(`✅ [Main] ${Object.keys(modules).length}/${Object.keys(TEST_MODULES).length} módulos carregados`);
  return modules;
}

// Inicializa módulos que precisam de setup
function initTestModules(modules, rendererData) {
  console.log('🔧 [Main] Inicializando módulos que precisam de setup...');
  
  if (modules.canvasTest && modules.canvasTest.init) {
    try {
      modules.canvasTest.init(rendererData);
      console.log('✅ [Main] canvasTest inicializado');
    } catch (e) {
      console.error('❌ [Main] Erro ao inicializar canvasTest:', e.message);
    }
  }
  
  if (modules.raycasterTest && modules.raycasterTest.init) {
    try {
      modules.raycasterTest.init(rendererData);
      console.log('✅ [Main] raycasterTest inicializado');
    } catch (e) {
      console.error('❌ [Main] Erro ao inicializar raycasterTest:', e.message);
    }
  }
}

export async function initGame() {
  // 🛡️ Guard clause duplo para evitar execução duplicada
  if (window.GAME_INITIALIZED) {
    console.warn('⏭️ Jogo já inicializado. Ignorando execução duplicada.');
    return;
  }
  window.GAME_INITIALIZED = true;

  console.log('🔍 [Main] initGame() chamado. Verificando estado...');

  try {
    console.log('🚀 [Main] Iniciando jogo (Vite bundle v1.3.0)');

    const { root, getVar, getList } = bridgeMod;

    // 1. Inicializa Renderizador (Three.js)
    console.log('🎨 [Main] Chamando initRenderer...');
    const rendererData = initRenderer(document.getElementById('game-container'));

    // 2. Inicializa Lógica (Dados do Perchance)
    const seed = getVar('GAME_SEED', 999);
    const bioma = getList('biomas', ['planície']).selectOne;
    initLogic(seed, bioma);

    // 3. Carrega todos os módulos de teste em paralelo
    const testModules = await loadAllTestModules();

    // 4. Inicializa módulos que precisam de setup (canvasTest, raycasterTest)
    initTestModules(testModules, rendererData);

    // 5. Carrega e inicializa UI de Teste
    console.log('🔍 [Main] Carregando módulo ui-test.js...');
    const uiTestMod = await import('./modules/ui-test.js');
    
    if (uiTestMod && uiTestMod.initUITest) {
      console.log('🎮 [Main] Chamando initUITest...');
      console.log('📦 [Main] rendererData passado:', rendererData);
      console.log('   renderer.cube:', rendererData.cube);

      // Passa todos os módulos de teste para a UI
      uiTestMod.initUITest(rendererData, testModules);
    } else {
      console.error('❌ [Main] ui-test.js não carregou corretamente');
    }

    console.log('✅ [Main] Jogo inicializado com sucesso!');
    console.log('💡 Debug: window.RPG disponível no console');

    // Expor para debug no console
    window.RPG = {
      renderer: rendererData,
      seed,
      bioma,
      root,
      tests: testModules
    };
  } catch (error) {
    console.error('❌ [Main] Erro fatal na inicialização:', error);
    console.error('Stack trace:', error.stack);

    // Mostra mensagem de erro na tela
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = ` 
      position: fixed; bottom: 20px; left: 20px; z-index: 9999;
      background: #ff0000; color: white; padding: 20px;
      border-radius: 8px; font-family: monospace; font-size: 14px;
      border: 2px solid #ff6b6b; max-width: 500px;
      max-height: 300px; overflow-y: auto;
    `;
    errorDiv.innerHTML = `
      <strong>❌ Erro ao iniciar o jogo</strong><br>
      <strong>Mensagem:</strong> ${error.message}<br>
      <strong>Stack:</strong><br>
      <pre style="font-size:11px; white-space:pre-wrap;">${error.stack || 'N/A'}</pre>
      <small>Verifique o console (F12) para mais detalhes.</small>
    `;
    document.body.appendChild(errorDiv);
  }
}

// Log para confirmar que o arquivo foi lido
console.log('📦 [Main] main.js carregado (Vite bundle). Aguardando initGame()...');
