// src/modules/ai-text-test.js
// Testa o plugin ai-text-plugin do Perchance
import { root } from '../perchance-bridge.js';

export const aiTextTest = {
  available: !!root.ai,
  
  // Teste 1: Geração básica
  async generateBasic(prompt = 'Escreva uma frase curta sobre um aventureiro.') {
    console.log('🤖 [AI-Text] Gerando texto básico...');
    
    if (!this.available) {
      console.warn('⚠️ [AI-Text] Plugin não disponível');
      return { success: false, error: 'Plugin não disponível' };
    }
    
    try {
      const result = await root.ai(prompt);
      console.log('✅ [AI-Text] Texto gerado:', result.generatedText);
      return { success: true, text: result.generatedText };
    } catch (error) {
      console.error('❌ [AI-Text] Erro na geração básica:', error);
      return { success: false, error: error.message };
    }
  },

  // Teste 2: Geração com streaming (onChunk)
  async generateWithStreaming(prompt = 'Descreva uma masmorra perigosa em 2 frases.') {
    console.log('🤖 [AI-Text] Gerando com streaming...');
    
    if (!this.available) {
      return { success: false, error: 'Plugin não disponível' };
    }
    
    let fullText = '';

    try {
      const result = await root.ai({
        instruction: prompt,
        onChunk: (data) => {
          fullText += data.textChunk;
          console.log('📝 [AI-Text] Chunk:', data.textChunk);
        },
        onFinish: (data) => {
          console.log('✅ [AI-Text] Finalizado. Texto completo:', data.generatedText);
        }
      });
      return { success: true, text: fullText };
    } catch (error) {
      console.error('❌ [AI-Text] Erro no streaming:', error);
      return { success: false, error: error.message };
    }
  },

  // Teste 3: Geração com startWith
  async generateWithStartWith(prompt = 'Complete a frase sobre um dragão.') {
    console.log('🤖 [AI-Text] Gerando com startWith...');
    
    if (!this.available) {
      return { success: false, error: 'Plugin não disponível' };
    }
    
    try {
      const result = await root.ai({
        instruction: prompt,
        startWith: 'O dragão ancestral',
        hideStartWith: false
      });
      console.log('✅ [AI-Text] Texto com startWith:', result.generatedText);
      return { success: true, text: result.generatedText };
    } catch (error) {
      console.error('❌ [AI-Text] Erro com startWith:', error);
      return { success: false, error: error.message };
    }
  },

  // Teste 4: Geração com stopSequences
  async generateWithStop(prompt = 'Conte uma história curta. Pare quando disser "fim".') {
    console.log('🤖 [AI-Text] Gerando com stopSequences...');
    
    if (!this.available) {
      return { success: false, error: 'Plugin não disponível' };
    }
    
    try {
      const result = await root.ai({
        instruction: prompt,
        stopSequences: ['fim', 'FIM', 'The End']
      });
      console.log('✅ [AI-Text] Texto com stop:', result.generatedText);
      return { success: true, text: result.generatedText };
    } catch (error) {
      console.error('❌ [AI-Text] Erro com stopSequences:', error);
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
