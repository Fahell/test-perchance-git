// src/modules/kv-test.js
// Testa o plugin kv-plugin do Perchance (IndexedDB key-value storage)
// Documentação: https://perchance.org/kv-plugin
import { root } from 'https://cdn.jsdelivr.net/gh/Fahell/test-perchance-git@v1.2.8/src/perchance-bridge.js';

export const kvTest = {
  available: !!root.kv,
  store: null, // Será inicializado com root.kv.testFolder

  // Inicializa o store (folder)
  initStore() {
    if (!this.available) return null;
    // O plugin kv usa "folders" como namespaces
    // root.kv.folderName retorna um objeto com métodos set/get/delete
    this.store = root.kv.testFolder;
    return this.store;
  },

  // Teste 1: Salvar valor simples
  async setSimpleValue(key = 'test_key', value = 'test_value') {
    if (!this.available) {
      console.warn('⚠️ [KV] Plugin kv-plugin não disponível');
      return null;
    }

    try {
      if (!this.store) this.initStore();
      
      console.log(`💾 [KV] Salvando: ${key} = ${value}...`);
      await this.store.set(key, value);
      console.log(`✅ [KV] Valor salvo com sucesso!`);
      return true;
    } catch (error) {
      console.error('❌ [KV] Erro ao salvar:', error.message);
      return null;
    }
  },

  // Teste 2: Recuperar valor
  async getValue(key = 'test_key') {
    if (!this.available) {
      console.warn('⚠️ [KV] Plugin kv-plugin não disponível');
      return null;
    }

    try {
      if (!this.store) this.initStore();
      
      console.log(`💾 [KV] Recuperando: ${key}...`);
      const value = await this.store.get(key);
      console.log(`✅ [KV] Valor recuperado: ${value}`);
      return value;
    } catch (error) {
      console.error('❌ [KV] Erro ao recuperar:', error.message);
      return null;
    }
  },

  // Teste 3: Salvar objeto complexo
  async saveComplexData() {
    if (!this.available) {
      console.warn('⚠️ [KV] Plugin kv-plugin não disponível');
      return null;
    }

    try {
      if (!this.store) this.initStore();
      
      const playerData = {
        name: 'Herói',
        level: 5,
        hp: 100,
        inventory: ['espada', 'poção', 'mapa'],
        stats: { strength: 10, agility: 8, intelligence: 12 }
      };

      console.log('💾 [KV] Salvando objeto complexo...');
      await this.store.set('player', playerData);
      console.log('✅ [KV] Objeto salvo com sucesso!');

      // Recupera e mostra
      const retrieved = await this.store.get('player');
      console.log('📦 [KV] Objeto recuperado:', retrieved);
      return retrieved;
    } catch (error) {
      console.error('❌ [KV] Erro ao salvar objeto:', error.message);
      return null;
    }
  },

  // Teste 4: Listar todas as chaves
  async listKeys() {
    if (!this.available) {
      console.warn('⚠️ [KV] Plugin kv-plugin não disponível');
      return null;
    }

    try {
      if (!this.store) this.initStore();
      
      console.log('📋 [KV] Listando chaves...');
      const keys = await this.store.keys();
      console.log('✅ [KV] Chaves:', keys);
      return keys;
    } catch (error) {
      console.error('❌ [KV] Erro ao listar chaves:', error.message);
      return null;
    }
  },

  // Teste 5: Deletar valor
  async deleteValue(key = 'test_key') {
    if (!this.available) {
      console.warn('⚠️ [KV] Plugin kv-plugin não disponível');
      return null;
    }

    try {
      if (!this.store) this.initStore();
      
      console.log(`🗑️ [KV] Deletando: ${key}...`);
      await this.store.delete(key);
      console.log('✅ [KV] Valor deletado!');
      return true;
    } catch (error) {
      console.error('❌ [KV] Erro ao deletar:', error.message);
      return null;
    }
  },

  // Teste 6: Update atômico (incrementa valor)
  async updateValue(key = 'counter') {
    if (!this.available) {
      console.warn('⚠️ [KV] Plugin kv-plugin não disponível');
      return null;
    }

    try {
      if (!this.store) this.initStore();
      
      console.log(`🔄 [KV] Incrementando ${key} atomicamente...`);
      await this.store.update(key, (v) => (v || 0) + 1);
      const newValue = await this.store.get(key);
      console.log(`✅ [KV] Novo valor de ${key}: ${newValue}`);
      return newValue;
    } catch (error) {
      console.error('❌ [KV] Erro ao atualizar:', error.message);
      return null;
    }
  },

  // Diagnóstico da API
  checkAPI() {
    console.log('💾 [KV] Verificando API do plugin...');
    console.log('   root.kv disponível:', !!root.kv);
    console.log('   Tipo:', typeof root.kv);
    
    if (root.kv) {
      console.log('   Props:', Object.keys(root.kv));
      
      // Tenta acessar um folder de teste
      try {
        const testStore = root.kv.testFolder;
        console.log('   ✅ root.kv.testFolder acessível');
        console.log('   Métodos do store:', Object.keys(testStore || {}));
      } catch (e) {
        console.log('   ❌ Erro ao acessar folder:', e.message);
      }
    }
  }
};

// Log de inicialização
console.log('💾 [KV] Inicializando teste do plugin kv...');
if (kvTest.available) {
  console.log('✅ [KV] Plugin kv-plugin disponível');
  kvTest.checkAPI();
} else {
  console.warn('⚠️ [KV] Plugin kv-plugin NÃO disponível');
  console.warn('   Adicione no List Panel: kv = {import:kv-plugin}');
}
