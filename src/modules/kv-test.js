// src/modules/kv-test.js
// Testa o plugin kv-plugin do Perchance
import { root } from 'https://cdn.jsdelivr.net/gh/Fahell/test-perchance-git@v1.2.4/src/perchance-bridge.js';

export const kvTest = {
  available: !!root.kv,
  
  // Teste 1: Verificar API do plugin
  checkAPI() {
    console.log('💾 [KV] Verificando API do plugin...');
    
    if (!root.kv) {
      console.warn('⚠️ [KV] root.kv não existe');
      return null;
    }
    
    console.log('📋 [KV] Propriedades disponíveis:');
    console.log('   Tipo:', typeof root.kv);
    
    if (typeof root.kv === 'object') {
      const props = Object.keys(root.kv);
      console.log('   Props:', props.join(', '));
      return props;
    } else if (typeof root.kv === 'function') {
      console.log('   É uma função');
      return ['function'];
    }
    
    return null;
  },
  
  // Teste 2: Salvar valor simples
  async setSimpleValue(key, value) {
    console.log(`💾 [KV] Salvando: ${key} = ${value}...`);
    
    try {
      if (!this.available) {
        console.warn('⚠️ [KV] Plugin não disponível');
        return false;
      }
      
      // Tenta diferentes APIs
      if (typeof root.kv.set === 'function') {
        await root.kv.set(key, value);
        console.log(`✅ [KV] Salvo com sucesso: ${key}`);
        return true;
      } else if (typeof root.kv === 'function') {
        // Talvez seja uma função que recebe objeto
        await root.kv({ [key]: value });
        console.log(`✅ [KV] Salvo com sucesso: ${key}`);
        return true;
      } else if (typeof root.kv.store === 'function') {
        await root.kv.store(key, value);
        console.log(`✅ [KV] Salvo com sucesso: ${key}`);
        return true;
      } else {
        console.warn('⚠️ [KV] Método set não encontrado. Use checkAPI() para ver métodos disponíveis.');
        return false;
      }
    } catch (e) {
      console.error('❌ [KV] Erro ao salvar:', e.message);
      return false;
    }
  },
  
  // Teste 3: Recuperar valor
  async getValue(key) {
    console.log(`💾 [KV] Recuperando: ${key}...`);
    
    try {
      if (!this.available) {
        console.warn('⚠️ [KV] Plugin não disponível');
        return null;
      }
      
      let value;
      
      // Tenta diferentes APIs
      if (typeof root.kv.get === 'function') {
        value = await root.kv.get(key);
      } else if (typeof root.kv === 'function') {
        value = await root.kv(key);
      } else if (typeof root.kv.retrieve === 'function') {
        value = await root.kv.retrieve(key);
      } else {
        console.warn('⚠️ [KV] Método get não encontrado. Use checkAPI() para ver métodos disponíveis.');
        return null;
      }
      
      console.log(`✅ [KV] Recuperado: ${key} = ${value}`);
      return value;
    } catch (e) {
      console.error('❌ [KV] Erro ao recuperar:', e.message);
      return null;
    }
  },
  
  // Teste 4: Deletar valor
  async deleteValue(key) {
    console.log(`💾 [KV] Deletando: ${key}...`);
    
    try {
      if (!this.available) {
        console.warn('⚠️ [KV] Plugin não disponível');
        return false;
      }
      
      if (typeof root.kv.delete === 'function') {
        await root.kv.delete(key);
        console.log(`✅ [KV] Deletado: ${key}`);
        return true;
      } else if (typeof root.kv.remove === 'function') {
        await root.kv.remove(key);
        console.log(`✅ [KV] Deletado: ${key}`);
        return true;
      } else {
        console.warn('⚠️ [KV] Método delete não encontrado');
        return false;
      }
    } catch (e) {
      console.error('❌ [KV] Erro ao deletar:', e.message);
      return false;
    }
  },
  
  // Teste 5: Listar todas as chaves
  async listKeys() {
    console.log('💾 [KV] Listando todas as chaves...');
    
    try {
      if (!this.available) {
        console.warn('⚠️ [KV] Plugin não disponível');
        return [];
      }
      
      let keys;
      
      if (typeof root.kv.keys === 'function') {
        keys = await root.kv.keys();
      } else if (typeof root.kv.list === 'function') {
        keys = await root.kv.list();
      } else if (typeof root.kv.getAll === 'function') {
        const all = await root.kv.getAll();
        keys = Object.keys(all);
      } else {
        console.warn('⚠️ [KV] Método para listar chaves não encontrado');
        return [];
      }
      
      console.log(`📋 [KV] ${keys.length} chaves encontradas:`, keys);
      return keys;
    } catch (e) {
      console.error('❌ [KV] Erro ao listar:', e.message);
      return [];
    }
  },
  
  // Teste 6: Salvar dados complexos
  async saveComplexData() {
    console.log('💾 [KV] Salvando dados complexos...');
    
    const complexData = {
      player: {
        name: 'Hero',
        level: 5,
        stats: { hp: 100, mp: 50 }
      },
      inventory: ['sword', 'potion', 'shield'],
      timestamp: Date.now()
    };
    
    try {
      const success = await this.setSimpleValue('game_data', JSON.stringify(complexData));
      
      if (success) {
        // Tenta recuperar
        const retrieved = await this.getValue('game_data');
        if (retrieved) {
          const parsed = JSON.parse(retrieved);
          console.log('✅ [KV] Dados complexos salvos e recuperados:', parsed);
          return parsed;
        }
      }
      
      return null;
    } catch (e) {
      console.error('❌ [KV] Erro com dados complexos:', e.message);
      return null;
    }
  }
};

// Inicialização
console.log('💾 [KV] Inicializando teste do plugin kv...');
if (kvTest.available) {
  console.log('✅ [KV] Plugin kv-plugin disponível');
  kvTest.checkAPI();
} else {
  console.warn('⚠️ [KV] Plugin kv-plugin NÃO disponível');
  console.warn('   Adicione no List Panel: kv = {import:kv-plugin}');
}
