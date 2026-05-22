// src/modules/seeder-test.js
// Testa o plugin seeder-plugin do Perchance
import { root } from 'https://cdn.jsdelivr.net/gh/Fahell/test-perchance-git@v1.2.4/src/perchance-bridge.js';

export const seederTest = {
  available: !!root.seeder,
  
  // Teste 1: Verificar API do plugin
  checkAPI() {
    console.log('🌱 [Seeder] Verificando API do plugin...');
    
    if (!root.seeder) {
      console.warn('⚠️ [Seeder] root.seeder não existe');
      return null;
    }
    
    console.log('📋 [Seeder] Propriedades disponíveis:');
    console.log('   Tipo:', typeof root.seeder);
    
    if (typeof root.seeder === 'object') {
      const props = Object.keys(root.seeder);
      console.log('   Props:', props.join(', '));
      return props;
    } else if (typeof root.seeder === 'function') {
      console.log('   É uma função');
      return ['function'];
    }
    
    return null;
  },
  
  // Teste 2: Gerar seed
  generateSeed() {
    console.log('🌱 [Seeder] Gerando seed...');
    
    try {
      if (!this.available) {
        console.warn('⚠️ [Seeder] Plugin não disponível');
        return null;
      }
      
      let seed;
      
      // Tenta diferentes abordagens
      if (typeof root.seeder === 'function') {
        // Caso 1: É uma função
        seed = root.seeder();
      } else if (typeof root.seeder.generate === 'function') {
        // Caso 2: Tem método generate
        seed = root.seeder.generate();
      } else if (typeof root.seeder.create === 'function') {
        // Caso 3: Tem método create
        seed = root.seeder.create();
      } else if (typeof root.seeder.selectOne === 'function') {
        // Caso 4: É uma lista
        seed = root.seeder.selectOne;
      } else if (typeof root.seeder.get === 'function') {
        // Caso 5: Tem método get
        seed = root.seeder.get();
      } else {
        console.warn('⚠️ [Seeder] Método de geração não encontrado. Use checkAPI() para ver métodos disponíveis.');
        return null;
      }
      
      // Converte para string se necessário
      const seedStr = seed ? String(seed) : '(vazio)';
      console.log(`✅ [Seeder] Seed gerada: ${seedStr}`);
      
      // Copia para clipboard se possível
      if (seed && navigator.clipboard) {
        navigator.clipboard.writeText(seedStr).then(() => {
          console.log('📋 [Seeder] Seed copiada para o clipboard');
        }).catch(() => {
          console.log('⚠️ [Seeder] Não foi possível copiar para clipboard');
        });
      }
      
      return seed;
    } catch (e) {
      console.error('❌ [Seeder] Erro ao gerar:', e.message);
      return null;
    }
  },
  
  // Teste 3: Demonstrar reprodutibilidade
  demonstrateReproducibility() {
    console.log('🌱 [Seeder] Demonstrando reprodutibilidade...');
    
    try {
      if (!this.available) {
        console.warn('⚠️ [Seeder] Plugin não disponível');
        return;
      }
      
      // Gera uma seed fixa
      const fixedSeed = 12345;
      console.log(`🔒 [Seeder] Usando seed fixa: ${fixedSeed}`);
      
      // Tenta usar a seed para gerar conteúdo
      let result1, result2;
      
      if (typeof root.seeder === 'function') {
        result1 = root.seeder({ seed: fixedSeed });
        result2 = root.seeder({ seed: fixedSeed });
      } else if (typeof root.seeder.generate === 'function') {
        result1 = root.seeder.generate({ seed: fixedSeed });
        result2 = root.seeder.generate({ seed: fixedSeed });
      }
      
      if (result1 !== undefined && result2 !== undefined) {
        const same = JSON.stringify(result1) === JSON.stringify(result2);
        console.log(`✅ [Seeder] Mesma seed produz mesmo resultado: ${same}`);
        console.log('   Resultado 1:', result1);
        console.log('   Resultado 2:', result2);
      }
    } catch (e) {
      console.error('❌ [Seeder] Erro:', e.message);
    }
  },
  
  // Teste 4: Usar com Math.random
  testWithRandom() {
    console.log('🌱 [Seeder] Testando com Math.random...');
    
    try {
      // Salva Math.random original
      const originalRandom = Math.random;
      
      // Se o plugin fornece um random com seed
      if (root.seeder && typeof root.seeder.random === 'function') {
        Math.random = root.seeder.random;
        console.log('✅ [Seeder] Math.random substituído pela versão com seed');
        
        // Gera alguns números
        const nums = [];
        for (let i = 0; i < 5; i++) {
          nums.push(Math.random());
        }
        console.log('🎲 [Seeder] Números gerados:', nums);
        
        // Restaura Math.random
        Math.random = originalRandom;
        console.log('✅ [Seeder] Math.random restaurado');
      } else {
        console.warn('⚠️ [Seeder] Plugin não fornece random com seed');
      }
    } catch (e) {
      console.error('❌ [Seeder] Erro:', e.message);
    }
  }
};

// Inicialização
console.log('🌱 [Seeder] Inicializando teste do plugin seeder...');
if (seederTest.available) {
  console.log('✅ [Seeder] Plugin seeder-plugin disponível');
  seederTest.checkAPI();
} else {
  console.warn('⚠️ [Seeder] Plugin seeder-plugin NÃO disponível');
  console.warn('   Adicione no List Panel: seeder = {import:seeder-plugin}');
}
