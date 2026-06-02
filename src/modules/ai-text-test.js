// src/modules/ai-text-test.js
// Testa o plugin ai-text-plugin do Perchance
import { root } from '../perchance-bridge.js';

export const aiTextTest = {
  available: !!root.ai,
  
  // Teste 1: startWith & hideStartWith
  async testStartWithAndHide() {
    console.log('🤖 [AI-Text] Testando startWith & hideStartWith...');
    
    if (!this.available) {
      return { success: false, error: 'Plugin não disponível' };
    }
    
    try {
      // Teste 1a: startWith visível
      const result1 = await root.ai({
        instruction: 'Complete a frase sobre um dragão ancestral.',
        startWith: 'O dragão ancestral ',
        hideStartWith: false
      });
      
      // Teste 1b: startWith oculto
      const result2 = await root.ai({
        instruction: 'Complete a frase sobre um dragão ancestral.',
        startWith: 'O dragão ancestral ',
        hideStartWith: true
      });
      
      console.log('✅ [AI-Text] startWith visível:', result1.generatedText);
      console.log('✅ [AI-Text] startWith oculto:', result2.generatedText);
      
      return { 
        success: true, 
        visible: result1.generatedText, 
        hidden: result2.generatedText 
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
      const result = await root.ai({
        instruction: 'Conte uma história curta sobre um herói. Pare quando disser "FIM".',
        stopSequences: ['FIM', 'The End', '###']
      });
      
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
      // Cria um elemento de saída se não existir
      let outputEl = document.getElementById('ai-text-output');
      if (!outputEl) {
        outputEl = document.createElement('div');
        outputEl.id = 'ai-text-output';
        outputEl.style.cssText = 'padding: 10px; margin-top: 10px; border: 1px solid #ccc; border-radius: 4px;';
        const container = document.getElementById(containerId);
        if (container) {
          container.appendChild(outputEl);
        }
      }
      
      const result = await root.ai({
        instruction: 'Escreva uma citação inspiradora sobre aventura.',
        outputTo: 'ai-text-output',
        style: 'color: #a78bfa; font-weight: bold; font-style: italic; padding: 15px; background: rgba(167, 139, 250, 0.1); border-radius: 8px;'
      });
      
      console.log('✅ [AI-Text] Texto com style & outputTo:', result.generatedText);
      return { success: true, text: result.generatedText };
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
      const result = await root.ai({
        instruction: 'Escreva um parágrafo sobre um mago misterioso.',
        endButtons: 'none'
      });
      
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
  console.warn('⚠️ [AI-Text] Plugin ai-text-plugin NÃO disponível');
  console.warn('   Adicione no List Panel: ai = {import:ai-text-plugin}');
}
