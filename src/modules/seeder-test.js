// src/modules/seeder-test.js
// Testa o plugin seeder-plugin do Perchance (randomização determinística)
// Documentação: https://perchance.org/seeder-plugin
import { root } from 'https://cdn.jsdelivr.net/gh/Fahell/test-perchance-git@v1.2.5/src/perchance-bridge.js';

export const seederTest = {
  available: !!root.seeder,

  // Teste 1: Aplicar seed e demonstrar reprodutibilidade
  applySeed(seedText = 'minha_seed_123') {
    if (!this.available) {
      console.warn('⚠️ [Seeder] Plugin seeder-plugin não disponível');
      return null;
    }

    try {
      console.log(`🌱 [Seeder] Aplicando seed: "${seedText}"...`);
      
      // O plugin seeder é chamado como função com a string da seed
      // Isso configura o gerador de números aleatórios do Perchance
      root.seeder(seedText);
      
      console.log('✅ [Seeder] Seed aplicada com sucesso!');
      console.log('   A partir de agora, seleções aleatórias do Perchance serão determinísticas');
      return seedText;
    } catch (error) {
      console.error('❌ [Seeder] Erro ao aplicar seed:', error.message);
      return null;
    }
  },

  // Teste 2: Demonstrar que a mesma seed produz os mesmos resultados
  demonstrateReproducibility() {
    if (!this.available) {
      console.warn('⚠️ [Seeder] Plugin seeder-plugin não disponível');
      return null;
    }

    try {
      const seed = 'teste_reprodutibilidade';
      
      console.log(`🌱 [Seeder] Demonstrando reprodutibilidade com seed "${seed}"...`);
      
      // Aplica a seed
      root.seeder(seed);
      
      // Faz algumas seleções aleatórias (usando listas do Perchance se disponíveis)
      const results1 = [];
      for (let i = 0; i < 3; i++) {
        // Usa root.itens se disponível, senão gera números aleatórios
        if (root.itens && typeof root.itens.selectOne === 'function') {
          results1.push(root.itens.selectOne);
        } else {
          results1.push(Math.random().toFixed(4));
        }
      }
      
      // Reaplica a mesma seed
      root.seeder(seed);
      
      // Faz as mesmas seleções novamente
      const results2 = [];
      for (let i = 0; i < 3; i++) {
        if (root.itens && typeof root.itens.selectOne === 'function') {
          results2.push(root.itens.selectOne);
        } else {
          results2.push(Math.random().toFixed(4));
        }
      }
      
      console.log('📊 [Seeder] Resultados da primeira execução:', results1);
      console.log('📊 [Seeder] Resultados da segunda execução:', results2);
      
      const match = JSON.stringify(results1) === JSON.stringify(results2);
      console.log(match ? '✅ [Seeder] Resultados idênticos! Seed funciona!' : '⚠️ [Seeder] Resultados diferentes (pode ser esperado se não houver listas)');
      
      return { seed, results1, results2, match };
    } catch (error) {
      console.error('❌ [Seeder] Erro na demonstração:', error.message);
      return null;
    }
  },

  // Teste 3: Resetar para aleatoriedade normal
  resetSeed() {
    if (!this.available) {
      console.warn('⚠️ [Seeder] Plugin seeder-plugin não disponível');
      return null;
    }

    try {
      console.log('🔄 [Seeder] Resetando para aleatoriedade normal...');
      
      // Chamar com string vazia ou null reseta para aleatoriedade normal
      root.seeder('');
      
      console.log('✅ [Seeder] Seed resetado! Seleções voltarão a ser completamente aleatórias');
      return true;
    } catch (error) {
      console.error('❌ [Seeder] Erro ao resetar:', error.message);
      return null;
    }
  },

  // Teste 4: Gerar seed aleatória para compartilhar
  generateRandomSeed() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let seed = '';
    for (let i = 0; i < 12; i++) {
      seed += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    console.log(`🌱 [Seeder] Seed aleatória gerada: ${seed}`);
    console.log('   Compartilhe esta seed para reproduzir os mesmos resultados');
    
    return seed;
  },

  // Diagnóstico da API
  checkAPI() {
    console.log('🌱 [Seeder] Verificando API do plugin...');
    console.log('   root.seeder disponível:', !!root.seeder);
    console.log('   Tipo:', typeof root.seeder);
    
    if (typeof root.seeder === 'function') {
      console.log('   ✅ É uma função');
      console.log('   Uso: root.seeder("minha_seed")');
    }
  }
};

// Log de inicialização
console.log('🌱 [Seeder] Inicializando teste do plugin seeder...');
if (seederTest.available) {
  console.log('✅ [Seeder] Plugin seeder-plugin disponível');
  seederTest.checkAPI();
} else {
  console.warn('⚠️ [Seeder] Plugin seeder-plugin NÃO disponível');
  console.warn('   Adicione no List Panel: seeder = {import:seeder-plugin}');
}
