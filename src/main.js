/**
 * main.js
 * Ponto de entrada do jogo.
 * Este arquivo é importado diretamente no HTML Panel do Perchance.
 * 
 * exports: initGame() - função principal de inicialização
 */

// Imports de módulos locais (caminhos relativos à URL deste arquivo)
import { root, GAME_SEED } from './perchance-bridge.js';
import { initRenderer } from './modules/renderer.js';
import { initLogic } from './modules/logic.js';

// Estado global do jogo (opcional, para acesso externo)
export const game = {
  renderer: null,
  logic: null,
  seed: null
};

/**
 * Função principal de inicialização.
 * Chame esta função após importar o módulo no HTML Panel.
 */
export async function initGame(options = {}) {
  console.log('🚀 Iniciando jogo modularizado...');
  
  // 1. Configura seed (prioriza opção, depois Perchance, depois aleatório)
  const seed = options.seed 
    || Number(GAME_SEED) 
    || Math.floor(Math.random() * 100000);
  
  game.seed = seed;
  
  // 2. Inicializa módulos
  game.renderer = initRenderer('#game-container');
  game.logic = initLogic(seed);
  
  // 3. Exemplo de interação entre módulos
  game.renderer.debug(`🎮 Seed: ${seed} | Bioma: ${game.logic.getState().bioma}`);
  
  // 4. Exemplo: gera um evento aleatório via Perchance
  const evento = game.logic.rollEvent('eventos');
  console.log(`🎲 Evento sorteado: ${evento}`);
  
  // 5. Expor para debug global (opcional)
  if (typeof window !== 'undefined') {
    window.RPG = { game, root };
    console.log('💡 Debug: window.RPG disponível no console');
  }
  
  console.log('✅ Jogo inicializado com sucesso!');
  return game;
}

// Auto-inicialização opcional (apenas se root.GAME_SEED existir, ou seja, no Perchance)
// Comente esta linha se quiser controlar a inicialização manualmente
if (root?.GAME_SEED !== undefined) {
  // Pequeno delay para garantir que o DOM está pronto
  setTimeout(() => initGame(), 100);
}

console.log('📦 main.js carregado. Aguardando initGame()...');
