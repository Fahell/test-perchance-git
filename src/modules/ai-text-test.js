// src/modules/ai-text-test.js
// Testa o plugin ai-text-plugin do Perchance com wrapper assíncrono robusto
import { root } from '../perchance-bridge.js';

// Helper: Wrapper assíncrono para root.ai() usando onFinish
async function _generateAIText(instruction, options = {}, timeout = 60000) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Timeout: Geração de texto excedeu ${timeout/1000}s`));
    }, timeout);

    // Merge options com onFinish
    const userOnFinish = options.onFinish;
    const wrappedOptions = {
      ...options,
      onFinish: (data) => {
        clearTimeout(timeoutId);
        // Executa callback do usuário se existir
        if (typeof userOnFinish === 'function') {
          try { userOnFinish(data); } catch(e) { console.warn('onFinish user callback error:', e); }
        }
        resolve(data);
      }
    };

    try {
      console.log('🔧 [AI-Text] _generateAIText called:', { instruction, options: wrappedOptions });
      // Chama o plugin. Se retornar Promise, trata erro.
      const result = root.ai({ instruction, ...wrappedOptions });
      if (result && typeof result.catch === 'function') {
        result.catch(err => {
          clearTimeout(timeoutId);
          reject(err);
        });
      }
    } catch (error) {
      clearTimeout(timeoutId);
      reject(error);
    }
  });
}

export const aiTextTest = {
  available: !!root.ai,
  
  // Teste 1: startWith & hideStartWith
  async testStartWithAndHide() {
    console.log('🤖 [AI-Text] Testando startWith & hideStartWith...');
    
    if (!this.available) {
      return { success: false, error: 'Plugin não disponível' };
    }
    
    try {
      // Teste 1a: startWith visível (hideStartWith: false)
      const result1 = await _generateAIText(
        'Complete a frase sobre um dragão ancestral.',
        { 
          startWith: 'O dragão ancestral ',
          hideStartWith: false 
        }
      );
      
      // Teste 1b: startWith oculto (hideStartWith: true)
      const result2 = await _generateAIText(
        'Complete a frase sobre um dragão ancestral.',
        { 
          startWith: 'O dragão ancestral ',
          hideStartWith: true 
        }
      );
      
      // result.text inclui startWith (se hideStartWith=false), result.generatedText NUNCA inclui
      console.log('✅ [AI-Text] startWith visível (text):', result1.text);
      console.log('✅ [AI-Text] startWith visível (generatedText):', result1.generatedText);
      console.log('✅ [AI-Text] startWith oculto (text):', result2.text);
      console.log('✅ [AI-Text] startWith oculto (generatedText):', result2.generatedText);
      
      return { 
        success: true, 
        visibleText: result1.text,
        visibleGenerated: result1.generatedText,
        hiddenText: result2.text,
        hiddenGenerated: result2.generatedText
      };
    } catch (error) {
      console.error('❌ [AI-Text] Erro no startWith test:', error);
      return { success: false, error: error.message };
    }
  },

  // Teste 2: stopSequences
  async testStopSequences() {
    console.log('🤖 [AI-Text] Testando stopSequences...');
    
    if (!this.available) {
      return { success: false, error: 'Plugin não disponível' };
    }
    
    try {
      const result = await _generateAIText(
        'Conte uma história curta sobre um herói. Pare quando disser "FIM".',
        { stopSequences: ['FIM', 'The End', '###'] }
      );
      
      console.log('✅ [AI-Text] Texto com stopSequences:', result.generatedText);
      return { success: true, text: result.generatedText };
    } catch (error) {
      console.error('❌ [AI-Text] Erro no stopSequences test:', error);
      return { success: false, error: error.message };
    }
  },

  // Teste 3: style & outputTo
  async testStyleAndOutputTo(containerId) {
    console.log('🤖 [AI-Text] Testando style & outputTo...');
    
    if (!this.available) {
      return { success: false, error: 'Plugin não disponível' };
    }
    
    try {
      // Cria um elemento de saída ÚNICO e garante que está no DOM
      const targetId = `ai-output-${Date.now()}`;
      const targetDiv = document.createElement('div');
      targetDiv.id = targetId;
      targetDiv.style.cssText = 'padding: 10px; margin-top: 10px; border: 1px solid #ccc; border-radius: 4px; min-height: 50px;';
      
      const container = document.getElementById(containerId);
      if (!container) {
        throw new Error(`Container ${containerId} não encontrado`);
      }
      container.appendChild(targetDiv);
      
      console.log('🔧 [AI-Text] Output element created:', targetId);
      
      const result = await _generateAIText(
        'Escreva uma citação inspiradora sobre aventura.',
        { 
          outputTo: targetDiv,
          style: 'color: #a78bfa; font-weight: bold; font-style: italic; padding: 15px; background: rgba(167, 139, 250, 0.1); border-radius: 8px;'
        }
      );
      
      console.log('✅ [AI-Text] Texto com style & outputTo:', result.generatedText);
      return { success: true, text: result.generatedText, targetId };
    } catch (error) {
      console.error('❌ [AI-Text] Erro no style & outputTo test:', error);
      return { success: false, error: error.message };
    }
  },

  // Teste 4: endButtons
  async testEndButtons() {
    console.log('🤖 [AI-Text] Testando endButtons...');
    
    if (!this.available) {
      return { success: false, error: 'Plugin não disponível' };
    }
    
    try {
      const result = await _generateAIText(
        'Escreva um parágrafo sobre um mago misterioso.',
        { endButtons: 'none' }
      );
      
      console.log('✅ [AI-Text] Texto sem endButtons:', result.generatedText);
      return { success: true, text: result.generatedText };
    } catch (error) {
      console.error('❌ [AI-Text] Erro no endButtons test:', error);
      return { success: false, error: error.message };
    }
  }
};

// Inicialização
console.log('🤖 [AI-Text] Inicializando teste do plugin de texto IA...');
if (aiTextTest.available) {
  console.log('✅ [AI-Text] Plugin ai-text-plugin disponível');
} else {
  console.warn('⚠️⚠️ [AI-Text] Plugin ai-text-plugin NÃO disponível');
  console.warn('   Adicione no List Panel: ai = {import:ai-text-plugin}');
}
