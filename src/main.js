/**
 * Entry Point do Jogo Modularizado
 * Orquestra a inicialização de todos os módulos de teste.
 */

import { initUITest, addLog } from './modules/ui-test.js';

// Variável global para debug
window.RPG = window.RPG || {};

export async function initGame() {
  console.log('🚀 [Main] Iniciando jogo modularizado...');
  addLog('🚀 Sistema inicializado. Aguardando comandos...');
  
  try {
    // 1. Inicializa UI de testes primeiro (para feedback visual)
    initUITest();
    
    // 2. Carrega módulos sob demanda (lazy loading)
    // Isso evita erros se um módulo falhar, os outros continuam funcionando
    
    // Three.js: Carrega apenas quando o usuário clicar no botão
    // (já configurado no ui-test.js)
    
    // Perchance Features: Também lazy load via botão
    // (configurado no ui-test.js)
    
    // 3. Remove mensagem de loading
    removeLoadingMessage();
    
    // 4. Log de sucesso
    console.log('✅ [Main] Todos os módulos carregados. Painel de testes disponível.');
    addLog('✅ Módulos carregados. Use o painel inferior para executar testes.');
    
    // 5. Expor para debug no console
    window.RPG = {
      version: '1.0.0-test',
      modules: {
        ui: 'loaded',
        three: 'lazy',
        perchance: 'lazy'
      },
      addLog // Expor função de log para uso externo
    };
    
    return true;
    
  } catch (error) {
    console.error('❌ [Main] Erro crítico na inicialização:', error);
    addLog(`❌ Erro: ${error.message}`);
    return false;
  }
}

/**
 * Remove a mensagem de loading inicial
 */
function removeLoadingMessage() {
  // Tenta por ID primeiro (mais eficiente)
  const loadingMsg = document.getElementById('loading-message');
  if (loadingMsg) {
    loadingMsg.remove();
    console.log('🗑️ [Main] Mensagem de loading removida (por ID)');
    return;
  }
  
  // Fallback: busca por conteúdo de texto
  const candidates = Array.from(document.body.children).filter(el => 
    el.textContent?.includes('Carregando') || 
    el.textContent?.includes('🎮')
  );
  
  for (const el of candidates) {
    if (el.tagName === 'DIV' && el.style?.position === 'absolute') {
      el.remove();
      console.log('🗑️ [Main] Mensagem de loading removida (fallback)');
      return;
    }
  }
  
  console.log('ℹ️ [Main] Nenhuma mensagem de loading encontrada para remover');
}

/**
 * Função utilitária para reload suave (útil para desenvolvimento)
 */
export function softReload() {
  console.log('🔄 [Main] Soft reload solicitado...');
  addLog('🔄 Recarregando módulos...');
  
  // Remove canvas do Three.js se existir
  const canvas = document.querySelector('#three-test-container canvas');
  if (canvas?.parentElement) {
    canvas.parentElement.remove();
  }
  
  // Limpa logs
  const logs = document.getElementById('test-logs');
  if (logs) logs.innerHTML = '';
  
  // Re-inicializa
  initGame();
}

// Expõe para uso global (opcional, para debug)
window.RPG.softReload = softReload;
