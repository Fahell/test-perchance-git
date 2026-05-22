/**
 * Módulo de teste para o plugin seeder-plugin do Perchance
 * Testa: geração e uso de seeds copiáveis para reprodutibilidade
 * @version 1.2.0
 */

import { root } from 'https://cdn.jsdelivr.net/gh/Fahell/test-perchance-git@v1.2.2/src/perchance-bridge.js';

export const seederTest = {
  available: !!root.seeder,
  
  // Teste 1: Gerar seed aleatória
  generateSeed() {
    console.log('🌱 [Seeder] Gerando seed aleatória...');
    
    if (!this.available) {
      console.warn('⚠️ [Seeder] Plugin não disponível');
      return { success: false, error: 'Plugin não disponível' };
    }
    
    try {
      const seed = root.seeder();
      console.log(`✅ [Seeder] Seed gerada: ${seed}`);
      return { success: true, seed: seed };
    } catch (error) {
      console.error('❌ [Seeder] Erro:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Teste 2: Usar seed específica
  useSeed(seed = 'my-custom-seed') {
    console.log(`🌱 [Seeder] Usando seed: ${seed}...`);
    
    if (!this.available) {
      return { success: false, error: 'Plugin não disponível' };
    }
    
    try {
      root.seeder(seed);
      console.log(`✅ [Seeder] Seed definida: ${seed}`);
      return { success: true, seed: seed };
    } catch (error) {
      console.error('❌ [Seeder] Erro:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Teste 3: Demonstrar reprodutibilidade
  demonstrateReproducibility() {
    console.log('🌱 [Seeder] Demonstrando reprodutibilidade...');
    
    if (!this.available) {
      return { success: false, error: 'Plugin não disponível' };
    }
    
    try {
      const seed = 'test-reproducibility';
      
      // Gera valores com a mesma seed
      root.seeder(seed);
      const values1 = [
        Math.random(),
        Math.random(),
        Math.random()
      ];
      
      // Reseta e gera novamente
      root.seeder(seed);
      const values2 = [
        Math.random(),
        Math.random(),
        Math.random()
      ];
      
      const match = JSON.stringify(values1) === JSON.stringify(values2);
      
      console.log(`✅ [Seeder] Seed: ${seed}`);
      console.log(`   Valores 1: ${values1.map(v => v.toFixed(4)).join(', ')}`);
      console.log(`   Valores 2: ${values2.map(v => v.toFixed(4)).join(', ')}`);
      console.log(`   ${match ? '✅ IDÊNTICOS!' : '❌ DIFERENTES!'}`);
      
      return { success: true, seed: seed, values1: values1, values2: values2, match: match };
    } catch (error) {
      console.error('❌ [Seeder] Erro:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Teste 4: Gerar seed baseada em string
  seedFromString(input = 'hello world') {
    console.log(`🌱 [Seeder] Gerando seed de: "${input}"...`);
    
    if (!this.available) {
      return { success: false, error: 'Plugin não disponível' };
    }
    
    try {
      const seed = root.seeder(input);
      console.log(`✅ [Seeder] Seed de "${input}": ${seed}`);
      return { success: true, input: input, seed: seed };
    } catch (error) {
      console.error('❌ [Seeder] Erro:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Teste 5: Obter seed atual
  getCurrentSeed() {
    console.log('🌱 [Seeder] Obtendo seed atual...');
    
    if (!this.available) {
      return { success: false, error: 'Plugin não disponível' };
    }
    
    try {
      const seed = root.seeder();
      console.log(`✅ [Seeder] Seed atual: ${seed}`);
      return { success: true, seed: seed };
    } catch (error) {
      console.error('❌ [Seeder] Erro:', error.message);
      return { success: false, error: error.message };
    }
  }
};

// Inicialização
console.log('🌱 [Seeder] Inicializando teste do plugin seeder...');
if (seederTest.available) {
  console.log('✅ [Seeder] Plugin seeder-plugin disponível');
} else {
  console.warn('⚠️ [Seeder] Plugin seeder-plugin NÃO disponível');
  console.warn('   Adicione no List Panel: seeder = {import:seeder-plugin}');
}
