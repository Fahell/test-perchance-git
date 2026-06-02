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
  },

  // ===== FASE 2 TESTS =====

  // Teste 5: onChunk streaming
  async testOnChunkStreaming() {
    console.log('🤖 [AI-Text] Testando onChunk streaming...');
    
    if (!this.available) {
      return { success: false, error: 'Plugin não disponível' };
    }
    
    try {
      const chunks = [];
      const result = await _generateAIText(
        'Escreva uma frase curta sobre um cavaleiro.',
        {
          onChunk: (data) => {
            chunks.push({
              textChunk: data.textChunk,
              isFromStartWith: data.isFromStartWith,
              fullTextSoFar: data.fullTextSoFar
            });
            console.log('📦 [AI-Text] Chunk recebido:', data.textChunk);
          }
        }
      );
      
      console.log('✅ [AI-Text] onChunk streaming completado. Total chunks:', chunks.length);
      return { 
        success: true, 
        chunks: chunks,
        chunkCount: chunks.length,
        finalText: result.generatedText
      };
    } catch (error) {
      console.error('❌ [AI-Text] Erro no onChunk streaming test:', error);
      return { success: false, error: error.message };
    }
  },

  // Teste 6: onFinish capture
  async testOnFinishCapture() {
    console.log('🤖 [AI-Text] Testando onFinish capture...');
    
    if (!this.available) {
      return { success: false, error: 'Plugin não disponível' };
    }
    
    try {
      let capturedData = null;
      const result = await _generateAIText(
        'Escreva uma frase sobre um dragão dourado.',
        {
          startWith: 'O dragão dourado ',
          onFinish: (data) => {
            capturedData = {
              text: data.text,
              generatedText: data.generatedText,
              liveResponseText: data.liveResponseText,
              inputs: data.inputs
            };
            console.log('📊 [AI-Text] onFinish capturado:', {
              textLength: data.text?.length,
              generatedTextLength: data.generatedText?.length,
              hasStartWith: data.inputs?.startWith
            });
          }
        }
      );
      
      console.log('✅ [AI-Text] onFinish capture completado');
      return { 
        success: true, 
        capturedData: capturedData,
        result: result
      };
    } catch (error) {
      console.error('❌ [AI-Text] Erro no onFinish capture test:', error);
      return { success: false, error: error.message };
    }
  },

  // Teste 7: Dynamic prompts (instruction as function)
  async testDynamicPrompts() {
    console.log('🤖 [AI-Text] Testando dynamic prompts...');
    
    if (!this.available) {
      return { success: false, error: 'Plugin não disponível' };
    }
    
    try {
      // instruction como função
      const instructionFn = () => {
        const subjects = ['um guerreiro', 'um mago', 'um ladino'];
        const places = ['floresta sombria', 'montanha gelada', 'deserto ardente'];
        const subject = subjects[Math.floor(Math.random() * subjects.length)];
        const place = places[Math.floor(Math.random() * places.length)];
        return `Escreva uma frase sobre ${subject} em ${place}.`;
      };
      
      const result = await _generateAIText(instructionFn, {});
      
      console.log('✅ [AI-Text] Dynamic prompt completado');
      return { 
        success: true, 
        text: result.generatedText,
        instructionType: 'function'
      };
    } catch (error) {
      console.error('❌ [AI-Text] Erro no dynamic prompts test:', error);
      return { success: false, error: error.message };
    }
  },

  // Teste 8: render function
  async testRenderFunction(containerId) {
    console.log('🤖 [AI-Text] Testando render function...');
    
    if (!this.available) {
      return { success: false, error: 'Plugin não disponível' };
    }
    
    try {
      // Cria elemento de saída
      const targetId = `ai-render-output-${Date.now()}`;
      const targetDiv = document.createElement('div');
      targetDiv.id = targetId;
      targetDiv.style.cssText = 'padding: 10px; margin-top: 10px; border: 1px solid #ccc; border-radius: 4px; min-height: 50px;';
      
      const container = document.getElementById(containerId);
      if (!container) {
        throw new Error(`Container ${containerId} não encontrado`);
      }
      container.appendChild(targetDiv);
      
      // render function que transforma *texto* em <em>texto</em>
      const renderFn = (data) => {
        if (!data.text) return '';
        // Transforma *texto* em <em>texto</em>
        let transformed = data.text.replace(/\*([^*]+)\*/g, '<em style="color: #a78bfa; font-style: italic;">$1</em>');
        // Adiciona indicador de streaming se parcial
        if (data.isPartial) {
          transformed += '<span style="color: #64748b;">▊</span>';
        }
        return transformed;
      };
      
      const result = await _generateAIText(
        'Escreva uma frase com uma ação entre asteriscos, como *sorri misteriosamente*.',
        {
          outputTo: targetDiv,
          render: renderFn
        }
      );
      
      console.log('✅ [AI-Text] render function completado');
      return { 
        success: true, 
        text: result.generatedText,
        targetId: targetId
      };
    } catch (error) {
      console.error('❌ [AI-Text] Erro no render function test:', error);
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
