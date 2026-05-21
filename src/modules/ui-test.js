// ⚠️ IMPORTANTE: Use URL absoluta com versão (tag) para evitar cache do CDN
// Atualize a tag (v1.0.0 -> v1.0.1 -> v1.0.2...) sempre que mudar o código
import { getVar, root } from 'https://cdn.jsdelivr.net/gh/Fahell/test-perchance-git@v1.0.0/src/perchance-bridge.js';

export function initUITest(rendererData) {
  try {
    console.log('🎮 [UI-Test] Criando painel de testes...');
    
    // Verifica se o body está disponível
    if (!document.body) {
      console.error('❌ [UI-Test] document.body não disponível. Tentando em 100ms...');
      setTimeout(() => initUITest(rendererData), 100);
      return;
    }

    const panel = document.createElement('div');
    panel.id = 'ui-test-panel';
    // Estilização mais visível para debug
    panel.style.cssText = `
      position: fixed; bottom: 20px; left: 20px; z-index: 9999;
      background: rgba(15, 23, 42, 0.95); color: #fff; padding: 15px;
      border-radius: 8px; font-family: monospace; font-size: 14px;
      border: 3px solid #22c55e; box-shadow: 0 0 20px rgba(34, 197, 94, 0.5);
      max-width: 320px; min-width: 280px;
    `;

    panel.innerHTML = `
      <h3 style="margin:0 0 12px 0; color:#22c55e; font-size:15px;">🧪 Painel de Testes</h3>
      <div style="display:flex; flex-direction:column; gap:8px;">
        <button id="btn-test-perchance" style="padding:8px 12px; background:#3b82f6; color:white; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">🔗 Testar Bridge</button>
        <button id="btn-test-3d" style="padding:8px 12px; background:#8b5cf6; color:white; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">🎲 Mudar Cor do Cubo</button>
      </div>
      <div id="test-log" style="margin-top:12px; padding:8px; background:rgba(0,0,0,0.3); border-radius:4px; color:#94a3b8; font-size:12px; min-height:20px;">⏳ Aguardando interação...</div>
    `;

    // Anexa ao body
    document.body.appendChild(panel);
    console.log('📎 [UI-Test] Painel anexado ao document.body');
    
    // Log de debug: posição e visibilidade
    setTimeout(() => {
      const rect = panel.getBoundingClientRect();
      console.log(`📐 [UI-Test] Painel visível: ${rect.width}x${rect.height}px em (${rect.left}, ${rect.top})`);
      console.log(`👁️ [UI-Test] Panel offsetParent: ${panel.offsetParent?.tagName || 'null'}`);
    }, 200);

    // Event Listeners com verificação de existência
    const btnBridge = document.getElementById('btn-test-perchance');
    const btn3d = document.getElementById('btn-test-3d');
    const logDiv = document.getElementById('test-log');
    
    if (btnBridge) {
      btnBridge.onclick = () => {
        const seed = getVar('GAME_SEED', 'N/A');
        if (logDiv) {
          logDiv.textContent = `📡 Seed: ${seed} | Root: ${!!root}`;
          logDiv.style.color = '#22c55e';
        }
        console.log('🔗 [UI-Test] Botão Bridge clicado');
      };
    } else {
      console.error('❌ [UI-Test] btn-test-perchance não encontrado');
    }

    if (btn3d) {
      btn3d.onclick = () => {
        if (rendererData && rendererData.cube) {
          rendererData.cube.material.color.setHex(Math.random() * 0xffffff);
          if (logDiv) logDiv.textContent = '🎲 Cor do cubo alterada!';
          console.log('🎲 [UI-Test] Cor do cubo alterada');
        } else {
          if (logDiv) logDiv.textContent = '⚠️ Cubo não disponível';
          console.warn('⚠️ [UI-Test] rendererData.cube não disponível');
        }
      };
    } else {
      console.error('❌ [UI-Test] btn-test-3d não encontrado');
    }

    console.log('✅ [UI-Test] Painel de testes criado e visível.');
    
  } catch (error) {
    console.error('❌ [UI-Test] Erro ao criar painel:', error);
    // Cria um alerta visual de erro
    const errorPanel = document.createElement('div');
    errorPanel.style.cssText = 'position:fixed;bottom:20px;left:20px;z-index:9999;background:#ef4444;color:white;padding:15px;border-radius:8px;font-family:monospace;';
    errorPanel.innerHTML = `<strong>❌ Erro UI:</strong><br>${error.message}`;
    document.body.appendChild(errorPanel);
  }
}
