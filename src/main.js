// src/main.js
// Entry point do jogo - v1.2.15 com ApexCharts integration

const BASE_URL = 'https://cdn.jsdelivr.net/gh/Fahell/test-perchance-git@v1.2.15/src';

// Mapeamento de módulos de teste
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
  seederTest: 'seeder-test.js',
  apexchartsTest: 'apexcharts-test.js'
};

// Cache de módulos carregados
const loadedModules = {};

// Carrega um módulo dinamicamente com tratamento de erro detalhado
async function loadModule(path, moduleName = 'módulo') {
  const url = `${BASE_URL}/${path}`;
  try {
    console.log(`🔍 [Main] Tentando carregar ${moduleName}...`);
    const module = await import(url);
    console.log(`✅ [Main] ${moduleName} carregado com sucesso`);
    return module;
  } catch (error) {
    console.error(`❌ [Main] Falha ao carregar ${moduleName}`);
    console.error(`   URL: ${url}`);
    console.error(`   Erro: ${error.message}`);
    console.error(`   Stack:`, error.stack);
    
    // Tenta diagnosticar o problema
    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.error(`   HTTP Status: ${response.status}`);
      } else {
        const text = await response.text();
        console.error(`   Arquivo existe (${text.length} bytes), mas tem erro de sintaxe ou import quebrado`);
      }
    } catch (fetchError) {
      console.error(`   Falha ao buscar arquivo: ${fetchError.message}`);
    }
    
    return null;
  }
}

// Carrega um módulo de teste dinamicamente
async function loadTestModule(moduleName) {
  if (loadedModules[moduleName]) {
    return loadedModules[moduleName];
  }
  
  const mod = await loadModule(`modules/${TEST_MODULES[moduleName]}`, moduleName);
  if (mod) {
    loadedModules[moduleName] = mod;
  }
  return mod;
}

// Carrega todos os módulos de teste
async function loadAllTestModules() {
  console.log('📦 [Main] Carregando módulos de teste...');
  
  const modules = {};
  for (const [key, file] of Object.entries(TEST_MODULES)) {
    const mod = await loadTestModule(key);
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
    console.log('🚀 [Main] Iniciando jogo modularizado (primeira execução)');

    // 1. Carrega módulos críticos SEQUENCIALMENTE (para identificar qual falha)
    console.log('📦 [Main] Carregando perchance-bridge.js...');
    const bridgeMod = await loadModule('perchance-bridge.js', 'perchance-bridge');
    if (!bridgeMod) throw new Error('Falha ao carregar perchance-bridge.js');

    console.log('📦 [Main] Carregando renderer.js...');
    const rendererMod = await loadModule('modules/renderer.js', 'renderer');
    if (!rendererMod) throw new Error('Falha ao carregar renderer.js (provavelmente Three.js não carregou)');

    console.log('📦 [Main] Carregando logic.js...');
    const logicMod = await loadModule('modules/logic.js', 'logic');
    if (!logicMod) throw new Error('Falha ao carregar logic.js');

    const { root, getVar, getList } = bridgeMod;
    const { initRenderer } = rendererMod;
    const { initLogic } = logicMod;

    // 2. Inicializa Renderizador (Three.js)
    console.log('🎨 [Main] Chamando initRenderer...');
    const rendererData = initRenderer(document.getElementById('game-container'));

    // 3. Inicializa Lógica (Dados do Perchance)
    const seed = getVar('GAME_SEED', 999);
    const bioma = getList('biomas', ['planície']).selectOne;
    initLogic(seed, bioma);

    // 4. Carrega todos os módulos de teste dinamicamente
    const testModules = await loadAllTestModules();

    // 5. Inicializa módulos que precisam de setup (canvasTest, raycasterTest)
    initTestModules(testModules, rendererData);

    // 6. Carrega e inicializa UI de Teste
    console.log('🔍 [Main] Carregando módulo ui-test.js...');
    const uiTestMod = await loadModule('modules/ui-test.js', 'ui-test');
    
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
console.log('📦 [Main] main.js carregado. Aguardando initGame()...');
