/**
 * Módulo de teste para o plugin kv-plugin do Perchance
 * Testa: armazenamento chave-valor persistente (sobrevive a reloads)
 * @version 1.2.0
 */

import { root } from 'https://cdn.jsdelivr.net/gh/Fahell/test-perchance-git@v1.2.2/src/perchance-bridge.js';

export const kvTest = {
  available: !!root.kv,
  
  // Teste 1: Salvar valor simples
  async setSimpleValue(key = 'test_key', value = 'test_value') {
    console.log(`💾 [KV] Salvando: ${key} = ${value}...`);
    
    if (!this.available) {
      console.warn('⚠️ [KV] Plugin não disponível');
      return { success: false, error: 'Plugin não disponível' };
    }
    
    try {
      await root.kv.set(key, value);
      console.log(`✅ [KV] Valor salvo: ${key} = ${value}`);
      return { success: true, key: key, value: value };
    } catch (error) {
      console.error('❌ [KV] Erro ao salvar:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Teste 2: Recuperar valor
  async getValue(key = 'test_key') {
    console.log(`💾 [KV] Recuperando: ${key}...`);
    
    if (!this.available) {
      return { success: false, error: 'Plugin não disponível' };
    }
    
    try {
      const value = await root.kv.get(key);
      console.log(`✅ [KV] Valor recuperado: ${key} = ${value}`);
      return { success: true, key: key, value: value };
    } catch (error) {
      console.error('❌ [KV] Erro ao recuperar:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Teste 3: Deletar valor
  async deleteValue(key = 'test_key') {
    console.log(`💾 [KV] Deletando: ${key}...`);
    
    if (!this.available) {
      return { success: false, error: 'Plugin não disponível' };
    }
    
    try {
      await root.kv.delete(key);
      console.log(`✅ [KV] Valor deletado: ${key}`);
      return { success: true, key: key };
    } catch (error) {
      console.error('❌ [KV] Erro ao deletar:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Teste 4: Listar todas as chaves
  async listAllKeys() {
    console.log('💾 [KV] Listando todas as chaves...');
    
    if (!this.available) {
      return { success: false, error: 'Plugin não disponível' };
    }
    
    try {
      const keys = await root.kv.keys();
      console.log(`✅ [KV] ${keys.length} chaves encontradas:`, keys);
      return { success: true, keys: keys, count: keys.length };
    } catch (error) {
      console.error('❌ [KV] Erro ao listar:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Teste 5: Salvar objeto complexo
  async saveComplexData() {
    console.log('💾 [KV] Salvando objeto complexo...');
    
    if (!this.available) {
      return { success: false, error: 'Plugin não disponível' };
    }
    
    try {
      const complexData = {
        player: {
          name: 'Hero',
          level: 5,
          stats: { hp: 100, mp: 50, str: 15 }
        },
        inventory: ['sword', 'potion', 'shield'],
        timestamp: Date.now()
      };
      
      await root.kv.set('game_save', JSON.stringify(complexData));
      console.log('✅ [KV] Objeto complexo salvo!');
      return { success: true, data: complexData };
    } catch (error) {
      console.error('❌ [KV] Erro:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Teste 6: Recuperar e parsear objeto complexo
  async loadComplexData() {
    console.log('💾 [KV] Recuperando objeto complexo...');
    
    if (!this.available) {
      return { success: false, error: 'Plugin não disponível' };
    }
    
    try {
      const raw = await root.kv.get('game_save');
      
      if (raw) {
        const data = JSON.parse(raw);
        console.log('✅ [KV] Objeto complexo recuperado:', data);
        return { success: true, data: data };
      } else {
        console.warn('⚠️ [KV] Nenhum dado encontrado para game_save');
        return { success: false, error: 'Nenhum dado encontrado' };
      }
    } catch (error) {
      console.error('❌ [KV] Erro:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Teste 7: Limpar todos os dados
  async clearAll() {
    console.log('💾 [KV] Limpando todos os dados...');
    
    if (!this.available) {
      return { success: false, error: 'Plugin não disponível' };
    }
    
    try {
      await root.kv.clear();
      console.log('✅ [KV] Todos os dados limpos!');
      return { success: true };
    } catch (error) {
      console.error('❌ [KV] Erro:', error.message);
      return { success: false, error: error.message };
    }
  }
};

// Inicialização
console.log('💾 [KV] Inicializando teste do plugin kv...');
if (kvTest.available) {
  console.log('✅ [KV] Plugin kv-plugin disponível');
} else {
  console.warn('⚠️ [KV] Plugin kv-plugin NÃO disponível');
  console.warn('   Adicione no List Panel: kv = {import:kv-plugin}');
}
