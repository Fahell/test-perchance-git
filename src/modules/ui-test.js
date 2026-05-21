import { getVar, root } from '../perchance-bridge.js';

export function initUITest(rendererData) {
  console.log('🎮 [UI-Test] Criando painel de testes...');

  const panel = document.createElement('div');
  panel.id = 'ui-test-panel';
  panel.style.cssText = `
    position: fixed; bottom: 20px; left: 20px; z-index: 100;
    background: rgba(0, 0, 0, 0.85); color: white; padding: 15px;
    border-radius: 8px; font-family: monospace; font-size: 14px;
    border: 1px solid #4ade80; box-shadow: 0 4px 6px rgba(0,0,0,0.3);
    max-width: 300px;
  `;

  panel.innerHTML = `
    <h3 style="margin:0 0 10px 0; color:#4ade80;">🧪 Painel de Testes</h3>
    <button id="btn-test-perchance" style="margin:5px; padding:5px; cursor:pointer;">🔗 Testar Bridge</button>
    <button id="btn-test-3d" style="margin:5px; padding:5px; cursor:pointer;">🎲 Mudar Cor do Cubo</button>
    <div id="test-log" style="margin-top:10px; color:#aaa; font-size:12px;">Aguardando interação...</div>
  `;

  // Anexa ao body para garantir visibilidade acima de tudo
  document.body.appendChild(panel);

  // Event Listeners
  document.getElementById('btn-test-perchance').onclick = () => {
    const seed = getVar('GAME_SEED', 'N/A');
    const logDiv = document.getElementById('test-log');
    logDiv.textContent = `📡 Seed: ${seed} | Root: ${!!root}`;
    logDiv.style.color = '#4ade80';
  };

  document.getElementById('btn-test-3d').onclick = () => {
    if (rendererData && rendererData.cube) {
      rendererData.cube.material.color.setHex(Math.random() * 0xffffff);
      document.getElementById('test-log').textContent = '🎲 Cor do cubo alterada!';
    }
  };

  console.log('✅ [UI-Test] Painel de testes criado e visível.');
}
