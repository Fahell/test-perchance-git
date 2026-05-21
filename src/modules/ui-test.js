/**
 * Módulo de Teste: Interface do Usuário
 * Cria um painel de controle com botões para testar os módulos.
 */

let logContainer;
let testResults = {};

export function initUITest() {
  console.log('🖥️ [UI-Test] Inicializando painel de testes...');
  
  // Cria o dashboard se não existir
  createDashboard();
  
  // Configura event listeners dos botões
  setupEventListeners();
  
  // Log inicial
  addLog('🎮 Painel de testes inicializado. Clique nos botões para executar testes.');
  
  return { addLog, updateResult };
}

function createDashboard() {
  // Remove dashboard existente se houver
  const existing = document.getElementById('test-dashboard');
  if (existing) existing.remove();
  
  // Cria container principal
  const dashboard = document.createElement('div');
  dashboard.id = 'test-dashboard';
  dashboard.style.cssText = `
    position: fixed;
    bottom: 10px;
    left: 10px;
    right: 10px;
    max-height: 40vh;
    background: rgba(20, 20, 30, 0.95);
    border: 2px solid #4ade80;
    border-radius: 8px;
    padding: 12px;
    font-family: monospace;
    font-size: 12px;
    color: #e2e8f0;
    z-index: 1000;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 8px;
  `;
  
  // Header
  const header = document.createElement('div');
  header.style.cssText = 'display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #444; padding-bottom: 8px;';
  header.innerHTML = `
    <strong>🧪 Painel de Testes</strong>
    <button id="btn-clear-logs" style="background:#333;color:#fff;border:1px solid #666;padding:2px 8px;cursor:pointer;border-radius:4px;">Limpar Logs</button>
  `;
  
  // Botões de teste
  const buttons = document.createElement('div');
  buttons.style.cssText = 'display: flex; flex-wrap: wrap; gap: 6px;';
  buttons.innerHTML = `
    <button id="btn-three" style="background:#0ea5e9;color:#fff;border:none;padding:6px 12px;cursor:pointer;border-radius:4px;">🎨 Testar Three.js</button>
    <button id="btn-perchance" style="background:#8b5cf6;color:#fff;border:none;padding:6px 12px;cursor:pointer;border-radius:4px;">🧪 Testar Perchance</button>
    <button id="btn-async" style="background:#f59e0b;color:#fff;border:none;padding:6px 12px;cursor:pointer;border-radius:4px;">⏳ Testar Async</button>
    <button id="btn-image" style="background:#ec4899;color:#fff;border:none;padding:6px 12px;cursor:pointer;border-radius:4px;">🖼️ Testar Imagem</button>
    <button id="btn-reset" style="background:#ef4444;color:#fff;border:none;padding:6px 12px;cursor:pointer;border-radius:4px;">🔄 Resetar Tudo</button>
  `;
  
  // Área de logs
  const logArea = document.createElement('div');
  logArea.id = 'test-logs';
  logArea.style.cssText = `
    flex: 1;
    min-height: 100px;
    max-height: 200px;
    background: #0f0f1a;
    border: 1px solid #333;
    border-radius: 4px;
    padding: 8px;
    overflow-y: auto;
    font-size: 11px;
    white-space: pre-wrap;
  `;
  
  // Área de resultados
  const resultsArea = document.createElement('div');
  resultsArea.id = 'test-results';
  resultsArea.style.cssText = `
    background: #1a1a2e;
    border: 1px solid #444;
    border-radius: 4px;
    padding: 8px;
    font-size: 11px;
    display: none;
  `;
  
  // Monta estrutura
  dashboard.appendChild(header);
  dashboard.appendChild(buttons);
  dashboard.appendChild(logArea);
  dashboard.appendChild(resultsArea);
  
  // Adiciona ao body
  document.body.appendChild(dashboard);
  
  // Salva referência do container de logs
  logContainer = logArea;
}

function setupEventListeners() {
  // Botão Limpar Logs
  document.getElementById('btn-clear-logs')?.addEventListener('click', () => {
    if (logContainer) logContainer.innerHTML = '';
    addLog('🗑️ Logs limpos.');
  });
  
  // Botão Testar Three.js
  document.getElementById('btn-three')?.addEventListener('click', async () => {
    addLog('▶️ Executando teste de Three.js...');
    try {
      const { initThreeTest, stopThreeTest } = await import('./three-test.js');
      
      // Cria container para o canvas se não existir
      let container = document.getElementById('three-test-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'three-test-container';
        container.style.cssText = 'position:fixed;top:10px;right:10px;width:300px;height:200px;border:2px solid #0ea5e9;border-radius:8px;z-index:999;';
        document.body.appendChild(container);
      }
      
      const success = initThreeTest(container);
      addLog(success ? '✅ Three.js: Sucesso!' : '❌ Three.js: Falha');
      
      // Salva função de stop para o botão reset
      window.__threeStop = stopThreeTest;
      
    } catch (error) {
      addLog(`❌ Erro ao importar/iniciar Three.js: ${error.message}`);
    }
  });
  
  // Botão Testar Perchance
  document.getElementById('btn-perchance')?.addEventListener('click', async () => {
    addLog('▶️ Executando teste de recursos do Perchance...');
    try {
      const { initPerchanceFeaturesTest } = await import('./perchance-features-test.js');
      const tester = initPerchanceFeaturesTest();
      const results = tester.getResults();
      
      // Mostra resultados na UI
      showResults({
        '🎲 GAME_SEED': results.seed,
        '📦 Lista (selectOne)': results.listAccess,
        '🖼️ Plugin Disponível': results.pluginCheck ? '✅ Sim' : '❌ Não'
      });
      
      addLog('✅ Teste de Perchance concluído. Veja resultados abaixo.');
      
      // Salva referência para teste async
      window.__perchanceTester = tester;
      
    } catch (error) {
      addLog(`❌ Erro no teste de Perchance: ${error.message}`);
    }
  });
  
  // Botão Testar Async
  document.getElementById('btn-async')?.addEventListener('click', async () => {
    addLog('▶️ Executando teste assíncrono...');
    if (!window.__perchanceTester) {
      addLog('⚠️ Execute o teste de Perchance primeiro.');
      return;
    }
    
    try {
      const result = await window.__perchanceTester.runAsyncTest();
      showResults({ '⏳ Async Result': JSON.stringify(result, null, 2) });
      addLog('✅ Teste async concluído.');
    } catch (error) {
      addLog(`❌ Erro no teste async: ${error.message}`);
    }
  });
  
  // Botão Testar Imagem (Mock/Simulação)
  document.getElementById('btn-image')?.addEventListener('click', async () => {
    addLog('▶️ Testando integração com plugin de imagem...');
    try {
      const { safeImageCall, buildImagePrompt } = await import('./perchance-features-test.js');
      
      // Constrói prompt de exemplo
      const prompt = buildImagePrompt({
        prefix: 'papercraft style',
        subjectList: 'test_items',
        styleList: 'art_styles',
        suffix: 'fantasy rpg character'
      });
      
      addLog(`📝 Prompt gerado: "${prompt}"`);
      
      // Tenta chamar o plugin (se disponível)
      const hasPlugin = typeof (window.root?.image) === 'function';
      if (hasPlugin) {
        addLog('🔄 Chamando plugin de imagem (pode demorar)...');
        const img = await safeImageCall(prompt, { resolution: '256x256' });
        if (img) {
          showResults({ '🖼️ URL da Imagem': `<img src="${img}" style="max-width:200px">` });
          addLog('✅ Imagem gerada com sucesso!');
        } else {
          addLog('⚠️ Plugin retornou null (pode ser limite de uso ou erro)');
        }
      } else {
        addLog('⚠️ Plugin de imagem não disponível no List Panel.');
        addLog('💡 Adicione no List Panel: imagem = {import:text-to-image-plugin}');
        showResults({ 'ℹ️ Info': 'Plugin não detectado. Configure no List Panel.' });
      }
      
    } catch (error) {
      addLog(`❌ Erro no teste de imagem: ${error.message}`);
    }
  });
  
  // Botão Resetar Tudo
  document.getElementById('btn-reset')?.addEventListener('click', () => {
    addLog('🔄 Resetando testes...');
    
    // Para Three.js se estiver rodando
    if (window.__threeStop) {
      window.__threeStop();
      const container = document.getElementById('three-test-container');
      if (container) container.remove();
      window.__threeStop = null;
    }
    
    // Limpa resultados
    const resultsArea = document.getElementById('test-results');
    if (resultsArea) {
      resultsArea.style.display = 'none';
      resultsArea.innerHTML = '';
    }
    
    // Limpa referências
    window.__perchanceTester = null;
    
    addLog('✅ Tudo resetado.');
  });
}

/**
 * Adiciona uma mensagem ao log do painel
 */
export function addLog(message) {
  if (!logContainer) return;
  
  const timestamp = new Date().toLocaleTimeString();
  const entry = document.createElement('div');
  entry.style.cssText = 'margin: 2px 0; border-left: 3px solid #4ade80; padding-left: 8px;';
  entry.innerHTML = `<span style="color:#666">[${timestamp}]</span> ${message}`;
  
  logContainer.appendChild(entry);
  logContainer.scrollTop = logContainer.scrollHeight;
}

/**
 * Mostra resultados formatados na área de resultados
 */
export function updateResult(key, value) {
  testResults[key] = value;
  showResults(testResults);
}

function showResults(results) {
  const area = document.getElementById('test-results');
  if (!area) return;
  
  area.style.display = 'block';
  area.innerHTML = `<strong>📊 Resultados:</strong><br>` + 
    Object.entries(results).map(([k, v]) => 
      `<div style="margin:4px 0"><strong>${k}:</strong> ${typeof v === 'object' ? '<pre>' + JSON.stringify(v, null, 2) + '</pre>' : v}</div>`
    ).join('');
}
