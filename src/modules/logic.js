/**
 * modules/logic.js
 * Exemplo de módulo de lógica de jogo.
 * Demonstra interação com o perchance-bridge e outros módulos.
 */

// ⚠️ IMPORTANTE: Use URL absoluta com versão para evitar cache do CDN
// Atualize o ?v=X sempre que mudar perchance-bridge.js
import { root, getList } from 'https://cdn.jsdelivr.net/gh/Fahell/test-perchance-git@main/src/perchance-bridge.js?v=12';

// Estado do jogo (privado)
const gameState = {
  seed: null,
  bioma: null,
  turn: 0,
  inventory: []
};

/**
 * Inicializa a lógica do jogo com uma seed.
 * @param {number} seed - Seed para geração procedural
 * @returns {Object} API pública da lógica
 */
export function initLogic(seed) {
  gameState.seed = seed || Math.floor(Math.random() * 100000);
  
  // Exemplo: usa uma lista do Perchance via bridge
  const biomasList = getList('biomas', ['floresta', 'deserto', 'montanha', 'tundra']);
  gameState.bioma = biomasList.selectOne;
  
  console.log(`🧠 logic.js inicializado. Seed: ${gameState.seed}, Bioma: ${gameState.bioma}`);
  return api;
}

// API pública do módulo
const api = {
  /**
   * Avança um turno do jogo.
   */
  nextTurn: () => {
    gameState.turn++;
    console.log(`🔄 Turno ${gameState.turn} no bioma: ${gameState.bioma}`);
    return gameState.turn;
  },
  
  /**
   * Adiciona um item ao inventário.
   * @param {string} item 
   */
  addItem: (item) => {
    gameState.inventory.push(item);
    console.log(`🎒 Item adicionado: ${item}`);
    return gameState.inventory;
  },
  
  /**
   * Gera um evento aleatório usando listas do Perchance.
   * @param {string} listaNome - Nome da lista no List Panel
   * @returns {string} Item sorteado
   */
  rollEvent: (listaNome) => {
    const lista = getList(listaNome, ['nada acontece', 'encontro inesperado', 'tesouro encontrado']);
    return lista.selectOne;
  },
  
  /**
   * Obtém o estado atual do jogo (para debug ou save).
   * @returns {Object} Cópia do estado
   */
  getState: () => ({ ...gameState })
};

export default api;
