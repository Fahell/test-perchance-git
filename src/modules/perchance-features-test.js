/**
 * Módulo de Teste: Recursos do Perchance
 * Testa acesso a listas, variáveis, seeds e plugins via root bridge.
 */

import { root, getList, getVar } from '../perchance-bridge.js';

export function initPerchanceFeaturesTest() {
  console.log('🧪 [Perchance-Test] Testando recursos do Perchance...');
  
  const results = {
    seed: null,
    listAccess: null,
    pluginCheck: null,
    asyncTest: null
  };
  
  // 1. Teste: Acessar Variável (GAME_SEED)
  try {
    const seed = getVar('GAME_SEED', 12345);
    results.seed = seed;
    console.log(`🎲 [Perchance-Test] GAME_SEED: ${seed}`);
  } catch (e) {
    console.warn('⚠️ [Perchance-Test] GAME_SEED não encontrado, usando padrão');
    results.seed = 12345;
  }
  
  // 2. Teste: Acessar Lista (test_items)
  try {
    // Tenta acessar a lista 'test_items' do List Panel
    // Se não existir, usa fallback
    const items = getList('test_items', ['item_padrao_1', 'item_padrao_2', 'item_padrao_3']);
    const selectedItem = items.selectOne;
    results.listAccess = selectedItem;
    console.log(`📦 [Perchance-Test] Lista 'test_items': [${selectedItem}]`);
  } catch (e) {
    console.warn('⚠️ [Perchance-Test] Lista não acessível, usando fallback');
    results.listAccess = 'fallback_item';
  }
  
  // 3. Teste: Verificar Plugin de Imagem
  try {
    const hasImagePlugin = typeof root.image === 'function';
    results.pluginCheck = hasImagePlugin;
    console.log(`🖼️ [Perchance-Test] Plugin de imagem disponível: ${hasImagePlugin ? '✅ Sim' : '❌ Não'}`);
    
    if (hasImagePlugin) {
      console.log('💡 [Perchance-Test] Exemplo de uso: await root.image("prompt", { seed, resolution: "512x512" })');
    }
  } catch (e) {
    results.pluginCheck = false;
    console.warn('⚠️ [Perchance-Test] Erro ao verificar plugin:', e);
  }
  
  // 4. Teste: Async/Await Pattern (simulando chamada de plugin)
  results.asyncTest = new Promise(async (resolve) => {
    console.log('⏳ [Perchance-Test] Testando padrão async/await...');
    
    // Simula delay de rede/plugin
    await new Promise(r => setTimeout(r, 500));
    
    const mockResult = {
      success: true,
      data: `Resultado assíncrono com seed: ${results.seed}`,
      timestamp: Date.now()
    };
    
    console.log('✅ [Perchance-Test] Async test concluído:', mockResult);
    resolve(mockResult);
  });
  
  // Retorna objeto com resultados (para UI mostrar)
  return {
    getResults: () => results,
    runAsyncTest: () => results.asyncTest
  };
}

/**
 * Função utilitária para gerar prompt dinâmico baseado em listas do Perchance
 * Útil para integração com o plugin de imagem
 */
export function buildImagePrompt({ prefix = '', subjectList = 'subjects', styleList = 'styles', suffix = '' }) {
  const subject = getList(subjectList, ['hero']).selectOne;
  const style = getList(styleList, ['papercraft']).selectOne;
  
  const parts = [prefix, subject, style, suffix].filter(p => p && p.trim());
  return parts.join(', ');
}

/**
 * Exemplo de chamada segura ao plugin de imagem
 * @param {string} prompt - O prompt para geração
 * @param {Object} options - Opções adicionais (seed, resolution, etc.)
 */
export async function safeImageCall(prompt, options = {}) {
  if (typeof root.image !== 'function') {
    console.warn('⚠️ [Perchance-Test] Plugin de imagem não disponível');
    return null;
  }
  
  try {
    // Merge com seed padrão se não fornecida
    const opts = {
      seed: getVar('GAME_SEED', Math.floor(Math.random() * 100000)),
      resolution: '512x512',
      removeBackground: false,
      ...options
    };
    
    console.log(`🖼️ [Perchance-Test] Chamando plugin com prompt: "${prompt}"`);
    const result = await root.image(prompt, opts);
    console.log('✅ [Perchance-Test] Imagem gerada:', result);
    return result;
    
  } catch (error) {
    console.error('❌ [Perchance-Test] Erro ao gerar imagem:', error);
    return null;
  }
}
