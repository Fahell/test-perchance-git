// src/main.js
// Entry point do jogo - importa e inicializa todos os módulos
import { root, getVar, getList } from 'https://cdn.jsdelivr.net/gh/Fahell/test-perchance-git@v1.2.0/src/perchance-bridge.js';
import { initRenderer } from 'https://cdn.jsdelivr.net/gh/Fahell/test-perchance-git@v1.2.0/src/modules/renderer.js';
import { initLogic } from 'https://cdn.jsdelivr.net/gh/Fahell/test-perchance-git@v1.2.0/src/modules/logic.js';

// Mapeamento de módulos de teste (carregados sob demanda via import dinâmico)
const TEST_MODULES = {
  imageTest: 'image-test.js',
  aiTextTest: 'ai-text-test.js',
  listsTest: 'lists-test.js',
  stateTest: 'state-test.js',
  raycasterTest: 'raycaster-test.js',
  canvasTest: 'canvas-test.js',
  ttsTest: 'tts-test.js',
  diceTest: 'dice-test.js',
  rpgIconTest: 'rpg-icon-test.js',
  patternTest: 'pattern-test.js',
  kvTest: 'kv-test.js',
  seederTest: 'seeder-test.js'
};

const BASE_URL = 'https://cdn.jsdelivr.net/gh/Fahell/test-perchance-git@v1.2.0/src/modules/';

// Cache de módulos carregados
const loadedModules = {};

// Carrega um módulo de teste dinamicamente
async function loadTestModule(moduleName) {
  if (loadedModules[moduleName]) {
    return loadedModules[moduleName];
  }
  
  try {
    const module = await import(BASE_URL + TEST_MODULES[moduleName]);
    loadedModules[moduleName] = module;
    console.log(`📦 [Main] Módulo ${moduleName} carregado`);
    return module;
  } catch (error) {
    console.error(`❌ [Main] Falha ao carregar ${moduleName}:`, error);
    return null;
  }
}

// Carrega todos os módulos de teste
async function loadAllTestModules() {
  console.log('📦 [Main] Carregando módulos de teste...');
  
  const modules = {};
  for (const [key, file] of Object.entries(TEST_MODULES)) {
    const mod = await loadTestModule(key);
    if (mod) {
      // Extrai o export principal (geralmente o nome do teste)
      const exportName = key;
      modules[key] = mod[exportName] || mod;
    }
  }
  
  console.log(`✅ [Main] ${Object.keys(modules).length} módulos carregados`);
  return modules;
}

// Inicializa módulos que precisam de setup
function initTestModules(modules, rendererData) {
  console.log('🔧 [Main] Inicializando módulos que precisam de setup...');
  
  // CanvasTest precisa do rendererData para integração com Three.js
  if (modules.canvasTest && modules.canvasTest.init) {
    modules.canvasTest.init(rendererData);
    console.log('✅ [Main] canvasTest inicializado');
  }
  
  // RaycasterTest precisa do rendererData para adicionar esferas
  if (modules.raycasterTest && modules.raycasterTest.init) {
    modules.raycasterTest.init(rendererData);
    console.log('✅ [Main] raycasterTest inicializado');
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
    console.log('🚀 [Main] Iniciando jogo modularizado (primeira execução)...');

    // 1. Inicializa Renderizador (Three.js)
    const rendererData = initRenderer(document.getElementById('game-container'));

    // 2. Inicializa Lógica (Dados do Perchance)
    const seed = getVar('GAME_SEED', 999);
    const bioma = getList('biomas', ['planície']).selectOne;
    initLogic(seed, bioma);

    // 3. Carrega todos os módulos de teste dinamicamente
    const testModules = await loadAllTestModules();

    // 3.5. Inicializa módulos que precisam de setup (canvasTest, raycasterTest)
    initTestModules(testModules, rendererData);

    // 4. Carrega e inicializa UI de Teste
    console.log('🔍 [Main] Carregando módulo ui-test.js...');
    const { initUITest } = await import('https://cdn.jsdelivr.net/gh/Fahell/test-perchance-git@v1.2.0/src/modules/ui-test.js');
    
    console.log('🎮 [Main] Chamando initUITest...');
    console.log('📦 [Main] rendererData passado:', rendererData);
    console.log('   renderer.cube:', rendererData.cube);

    // Passa todos os módulos de teste para a UI
    initUITest(rendererData, testModules);

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
