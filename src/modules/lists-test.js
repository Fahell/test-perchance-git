// src/modules/lists-test.js
// Testa funcionalidades avançadas de listas do Perchance
import { root, getList } from '../perchance-bridge.js';

export function initListsTest() {
  console.log('📋 [Lists] Inicializando teste de listas avançadas...');

  return {
    // Teste 1: selectOne (básico)
    testSelectOne(listName = 'itens') {
      console.log(`📋 [Lists] Testando selectOne em '${listName}'...`);
      const list = getList(listName, ['item padrão']);
      const selected = list.selectOne;
      console.log(`✅ [Lists] Item selecionado: ${selected}`);
      return selected;
    },

    // Teste 2: selectMany (múltiplos itens)
    testSelectMany(listName = 'itens', count = 3) {
      console.log(`📋 [Lists] Testando selectMany(${count}) em '${listName}'...`);
      const list = getList(listName, ['item padrão']);
      const selected = list.selectMany(count);
      console.log(`✅ [Lists] ${count} itens selecionados:`, selected);
      return selected;
    },

    // Teste 3: selectUnique (sem repetição)
    testSelectUnique(listName = 'nomes_herois', count = 3) {
      console.log(`📋 [Lists] Testando selectUnique(${count}) em '${listName}'...`);
      const list = getList(listName, ['Herói Padrão']);
      const selected = list.selectUnique(count);
      console.log(`✅ [Lists] ${count} itens únicos selecionados:`, selected);
      return selected;
    },

    // Teste 4: consumableList (lista que "consome" itens)
    testConsumableList(listName = 'eventos') {
      console.log(`📋 [Lists] Testando consumableList em '${listName}'...`);
      const list = getList(listName, ['evento padrão']);
      const consumable = list.consumableList;

      const results = [];
      for (let i = 0; i < 3; i++) {
        const item = consumable.selectOne;
        results.push(item);
        console.log(`  Consumo ${i + 1}: ${item}`);
      }

      console.log(`✅ [Lists] Itens consumidos:`, results);
      return results;
    },

    // Teste 5: pluralForm
    testPluralForm(listName = 'itens') {
      console.log(`📋 [Lists] Testando pluralForm em '${listName}'...`);
      const list = getList(listName, ['item']);
      const singular = list.selectOne;
      const plural = list.selectOne.pluralForm;
      console.log(`✅ [Lists] Singular: "${singular}" → Plural: "${plural}"`);
      return { singular, plural };
    },

    // Teste 6: titleCase
    testTitleCase(listName = 'adjetivos') {
      console.log(`📋 [Lists] Testando titleCase em '${listName}'...`);
      const list = getList(listName, ['adjetivo']);
      const normal = list.selectOne;
      const titled = list.selectOne.titleCase;
      console.log(`✅ [Lists] Normal: "${normal}" → TitleCase: "${titled}"`);
      return { normal, titled };
    },

    // Teste 7: joinItems
    testJoinItems(listName = 'itens', separator = ', ') {
      console.log(`📋 [Lists] Testando joinItems("${separator}") em '${listName}'...`);
      const list = getList(listName, ['item']);
      const items = list.selectMany(3);
      const joined = items.joinItems(separator);
      console.log(`✅ [Lists] Itens unidos: "${joined}"`);
      return joined;
    },

    // Teste 8: Comprimento da lista
    testListLength(listName = 'itens') {
      console.log(`📋 [Lists] Testando length de '${listName}'...`);
      const list = getList(listName, ['item']);
      const length = list.length;
      console.log(`✅ [Lists] Comprimento da lista: ${length}`);
      return length;
    }
  };
}
