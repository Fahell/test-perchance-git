// ⚠️ IMPORTANTE: Use URL absoluta com versão (tag) para evitar cache do CDN
import { getVar, getList } from 'https://cdn.jsdelivr.net/gh/Fahell/test-perchance-git@v1.2.5/src/perchance-bridge.js';

export function initLogic(seed, bioma) {
  console.log('🧠 [Logic] Inicializando lógica do jogo...');
  console.log(`   Seed: ${seed}`);
  console.log(`   Bioma: ${bioma}`);
  
  // Exemplo de uso de variáveis do Perchance
  const eventos = getList('eventos', ['nada acontece', 'encontro inesperado', 'tesouro encontrado']);
  const eventoAtual = eventos.selectOne;
  console.log(`🎲 Evento sorteado: ${eventoAtual}`);
  
  // Expor para debug
  window.RPG = window.RPG || {};
  window.RPG.Logic = { seed, bioma, eventoAtual };
  
  console.log('💡 Debug: window.RPG disponível no console');
  console.log('✅ [Logic] Lógica inicializada com sucesso!');
}
