/**
 * modules/renderer.js
 * Exemplo de módulo de renderização/UI.
 * Pode ser adaptado para Three.js, Canvas, ou manipulação de DOM.
 */

import { root } from '../perchance-bridge.js';

// Estado interno do módulo (privado)
let container = null;
let frameCount = 0;

/**
 * Inicializa o renderer e anexa ao elemento DOM especificado.
 * @param {HTMLElement|string} target - Seletor CSS ou elemento DOM
 * @returns {Object} API pública do renderer
 */
export function initRenderer(target) {
  container = typeof target === 'string' 
    ? document.querySelector(target) 
    : target;
  
  if (!container) {
    console.warn('⚠️ Container não encontrado. Renderer em modo headless.');
    return api;
  }

  // ✅ REMOVE a mensagem de loading (prioriza por ID, fallback por busca de texto)
  const loadingMsg = document.getElementById('loading-message') 
    || Array.from(container.children).find(child => 
      child.textContent?.includes('Carregando') || child.textContent?.includes('🎮')
    );
  if (loadingMsg) {
    loadingMsg.remove();
    console.log('🗑️ Mensagem de loading removida');
  }

  // ✅ Opcional: mostra indicador de "pronto" por 1 segundo
  const readyMsg = document.createElement('div');
  readyMsg.style.cssText = 'position:absolute; top:10px; left:50%; transform:translateX(-50%); color:#4ade80; font-family:monospace; font-size:14px; z-index:999;';
  readyMsg.textContent = '✅ Pronto!';
  container.appendChild(readyMsg);
  setTimeout(() => readyMsg.remove(), 1000);

  // Exemplo: cria um elemento visual simples para teste
  const debugPanel = document.createElement('div');
  debugPanel.id = 'debug-panel';
  debugPanel.style.cssText = `
    position: fixed; top: 10px; right: 10px;
    background: rgba(0,0,0,0.7); color: #0f0;
    padding: 10px; border-radius: 4px;
    font-family: monospace; font-size: 12px;
    z-index: 1000; pointer-events: none;
  `;
  document.body.appendChild(debugPanel);

  // Loop de renderização simplificado
  const renderLoop = () => {
    frameCount++;
    if (debugPanel.parentElement) {
      debugPanel.innerHTML = `
        🎮 RPG Test<br>
        Frame: ${frameCount}<br>
        Seed: ${root.GAME_SEED || 'N/A'}<br>
        FPS: ${Math.round(1000/16)}
      `;
    }
    requestAnimationFrame(renderLoop);
  };
  renderLoop();

  console.log('🎨 renderer.js inicializado');
  return api;
}

// API pública do módulo
const api = {
  /**
   * Atualiza o texto do debug panel.
   * @param {string} message 
   */
  debug: (message) => {
    const panel = document.getElementById('debug-panel');
    if (panel) panel.textContent = message;
  },
  
  /**
   * Cria um elemento canvas para fog-of-war ou outros efeitos.
   * @param {number} width 
   * @param {number} height 
   * @returns {HTMLCanvasElement}
   */
  createCanvas: (width, height) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.style.cssText = 'position:absolute; top:0; left:0; pointer-events:none;';
    return canvas;
  },
  
  /**
   * Limpa recursos e para o loop de renderização.
   */
  destroy: () => {
    const panel = document.getElementById('debug-panel');
    if (panel?.parentElement) panel.remove();
    console.log('🧹 renderer.js destruído');
  }
};

export default api;
