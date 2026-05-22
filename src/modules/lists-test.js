// src/modules/lists-test.js
// Testa funcionalidades avançadas de listas do Perchance
import { root, getList } from 'https://cdn.jsdelivr.net/gh/Fahell/test-perchance-git@v1.2.4/src/perchance-bridge.js';

export const listsTest = {
  available: true,

  // Helper para obter lista (prioriza root, fallback para lista padrão)
  getPerchanceList(listName, fallback = []) {
    if (root && root[listName]) {
      return root[listName];
    }
    console.warn(`⚠️ [Lists] Lista '${listName}' não encontrada no root, usando fallback`);
    return fallback;
  },

  // Teste 1: selectOne (básico)
  testSelectOne(listName = 'itens') {
    console.log(`📋 [Lists] Testando selectOne em '${listName}'...`);
    try {
      const list = this.getPerchanceList(listName, ['item padrão']);
      const selected = typeof list.selectOne === 'function' ? list.selectOne() : list.selectOne;
      console.log(`✅ [Lists] Item selecionado: ${selected}`);
      return selected;
    } catch (error) {
      console.error(`❌ [Lists] Erro em selectOne:`, error);
      return null;
    }
  },

  // Teste 2: selectMany (múltiplos itens com repetição)
  testSelectMany(listName = 'itens', count = 3) {
    console.log(`📋 [Lists] Testando selectMany(${count}) em '${listName}'...`);
    try {
      const list = this.getPerchanceList(listName, ['item padrão']);
      const selected = typeof list.selectMany === 'function' 
        ? list.selectMany(count) 
        : Array(count).fill(list.selectOne || 'item');
      console.log(`✅ [Lists] ${count} itens selecionados:`, selected);
      return selected;
    } catch (error) {
      console.error(`❌ [Lists] Erro em selectMany:`, error);
      return [];
    }
  },

  // Teste 3: selectUnique (sem repetição)
  testSelectUnique(listName = 'nomes_herois', count = 2) {
    console.log(`📋 [Lists] Testando selectUnique(${count}) em '${listName}'...`);
    try {
      const list = this.getPerchanceList(listName, ['Herói Padrão']);
      
      // Verifica se selectUnique está disponível
      if (typeof list.selectUnique === 'function') {
        const selected = list.selectUnique(count);
        console.log(`✅ [Lists] ${count} itens únicos selecionados:`, selected);
        return selected;
      } else {
        // Fallback: simula selectUnique usando selectMany e filtrando duplicatas
        console.warn(`⚠️ [Lists] selectUnique não disponível, usando fallback com selectMany`);
        const items = list.selectMany ? list.selectMany(count * 2) : [];
        const unique = [...new Set(items.map(i => typeof i === 'object' ? i.toString() : i))].slice(0, count);
        console.log(`✅ [Lists] ${unique.length} itens únicos (fallback):`, unique);
        return unique;
      }
    } catch (error) {
      console.error(`❌ [Lists] Erro em selectUnique:`, error);
      return [];
    }
  },

  // Teste 4: consumableList (lista que "consome" itens)
  testConsumableList(listName = 'eventos') {
    console.log(`📋 [Lists] Testando consumableList em '${listName}'...`);
    try {
      const list = this.getPerchanceList(listName, ['evento padrão']);
      
      if (list.consumableList) {
        const consumable = list.consumableList;
        const results = [];
        
        for (let i = 0; i < 3; i++) {
          const item = typeof consumable.selectOne === 'function' 
            ? consumable.selectOne() 
            : consumable.selectOne;
          results.push(item);
          console.log(`  Consumo ${i + 1}: ${item}`);
        }

        console.log(`✅ [Lists] Itens consumidos:`, results);
        return results;
      } else {
        console.warn(`⚠️ [Lists] consumableList não disponível`);
        return [];
      }
    } catch (error) {
      console.error(`❌ [Lists] Erro em consumableList:`, error);
      return [];
    }
  },

  // Teste 5: pluralForm
  testPluralForm(listName = 'itens') {
    console.log(`📋 [Lists] Testando pluralForm em '${listName}'...`);
    try {
      const list = this.getPerchanceList(listName, ['item']);
      const item = typeof list.selectOne === 'function' ? list.selectOne() : list.selectOne;
      const singular = typeof item === 'string' ? item : String(item);
      const plural = singular.pluralForm || `${singular}s`;
      console.log(`✅ [Lists] Singular: "${singular}" → Plural: "${plural}"`);
      return { singular, plural };
    } catch (error) {
      console.error(`❌ [Lists] Erro em pluralForm:`, error);
      return { singular: 'item', plural: 'items' };
    }
  },

  // Teste 6: titleCase
  testTitleCase(listName = 'adjetivos') {
    console.log(`📋 [Lists] Testando titleCase em '${listName}'...`);
    try {
      const list = this.getPerchanceList(listName, ['adjetivo']);
      const item = typeof list.selectOne === 'function' ? list.selectOne() : list.selectOne;
      const normal = typeof item === 'string' ? item : String(item);
      const titled = normal.titleCase || normal.charAt(0).toUpperCase() + normal.slice(1);
      console.log(`✅ [Lists] Normal: "${normal}" → TitleCase: "${titled}"`);
      return { normal, titled };
    } catch (error) {
      console.error(`❌ [Lists] Erro em titleCase:`, error);
      return { normal: 'adjetivo', titled: 'Adjetivo' };
    }
  },

  // Teste 7: joinItems
  testJoinItems(listName = 'itens', separator = ', ') {
    console.log(`📋 [Lists] Testando joinItems("${separator}") em '${listName}'...`);
    try {
      const list = this.getPerchanceList(listName, ['item']);
      const items = list.selectMany ? list.selectMany(3) : ['item1', 'item2', 'item3'];
      const joined = items.joinItems 
        ? items.joinItems(separator) 
        : items.join(separator);
      console.log(`✅ [Lists] Itens unidos: "${joined}"`);
      return joined;
    } catch (error) {
      console.error(`❌ [Lists] Erro em joinItems:`, error);
      return 'item1, item2, item3';
    }
  },

  // Teste 8: Comprimento da lista
  testListLength(listName = 'itens') {
    console.log(`📋 [Lists] Testando length de '${listName}'...`);
    try {
      const list = this.getPerchanceList(listName, ['item']);
      const length = list.getLength 
        ? list.getLength 
        : list.length || 0;
      console.log(`✅ [Lists] Comprimento da lista: ${length}`);
      return length;
    } catch (error) {
      console.error(`❌ [Lists] Erro em getLength:`, error);
      return 0;
    }
  },

  // Teste 9: getAllKeys (lista de todas as chaves)
  testGetAllKeys(listName = 'itens') {
    console.log(`📋 [Lists] Testando getAllKeys em '${listName}'...`);
    try {
      const list = this.getPerchanceList(listName, ['item']);
      const keys = list.getAllKeys || list.$allKeys || [];
      console.log(`✅ [Lists] Chaves disponíveis:`, keys);
      return keys;
    } catch (error) {
      console.error(`❌ [Lists] Erro em getAllKeys:`, error);
      return [];
    }
  }
};

// Inicialização
console.log('📋 [Lists] Inicializando teste de listas avançadas...');
