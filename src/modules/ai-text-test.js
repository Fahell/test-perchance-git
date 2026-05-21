// src/modules/ai-text-test.js
// Testa o plugin ai-text-plugin do Perchance
import { root } from '../perchance-bridge.js';

export function initAITextTest() {
  console.log('🤖 [AI-Text] Inicializando teste do plugin de texto IA...');

  if (!root.ai) {
    console.warn('⚠️ [AI-Text] Plugin ai-text-plugin não disponível no root');
    return {
      available: false,
      generate: () => Promise.resolve({ error: 'Plugin não disponível' })
    };
  }

  console.log('✅ [AI-Text] Plugin ai-text-plugin disponível');

  return {
    available: true,

    // Teste 1: Geração básica
    async generateBasic(prompt = 'Escreva uma frase curta sobre um aventureiro.') {
      console.log('🤖 [AI-Text] Gerando texto básico...');
      try {
        const result = await root.ai(prompt);
        console.log('✅ [AI-Text] Texto gerado:', result.generatedText);
        return result;
      } catch (error) {
        console.error('❌ [AI-Text] Erro na geração básica:', error);
        throw error;
      }
    },

    // Teste 2: Geração com streaming (onChunk)
    async generateWithStreaming(prompt = 'Descreva uma masmorra perigosa em 2 frases.') {
      console.log('🤖 [AI-Text] Gerando com streaming...');
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
        return result;
      } catch (error) {
        console.error('❌ [AI-Text] Erro no streaming:', error);
        throw error;
      }
    },

    // Teste 3: Geração com startWith
    async generateWithStartWith(prompt = 'Complete a frase sobre um dragão.') {
      console.log('🤖 [AI-Text] Gerando com startWith...');
      try {
        const result = await root.ai({
          instruction: prompt,
          startWith: 'O dragão ancestral',
          hideStartWith: false
        });
        console.log('✅ [AI-Text] Texto com startWith:', result.generatedText);
        return result;
      } catch (error) {
        console.error('❌ [AI-Text] Erro com startWith:', error);
        throw error;
      }
    },

    // Teste 4: Geração com stopSequences
    async generateWithStop(prompt = 'Conte uma história curta. Pare quando disser "fim".') {
      console.log('🤖 [AI-Text] Gerando com stopSequences...');
      try {
        const result = await root.ai({
          instruction: prompt,
          stopSequences: ['fim', 'FIM', 'The End']
        });
        console.log('✅ [AI-Text] Texto com stop:', result.generatedText);
        return result;
      } catch (error) {
        console.error('❌ [AI-Text] Erro com stopSequences:', error);
        throw error;
      }
    }
  };
}
