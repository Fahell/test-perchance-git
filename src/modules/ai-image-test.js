// src/modules/ai-image-test.js
// Testa o plugin advanced-ai-image-plugin do Perchance com wrapper assíncrono robusto
import { root } from '../perchance-bridge.js';
import { 
  isAvailable, 
  generateImage, 
  generateBatch, 
  createImageContainer 
} from './ai-image.js';

export const aiImageTest = {
  available: isAvailable(),
  
  // Teste 1: Geração única com metadados
  async testSingleGeneration() {
    console.log('🖼️ [AI-Image] Testando geração única...');
    
    if (!this.available) {
      return { success: false, error: 'Plugin aiImage não disponível' };
    }

    try {
      const containerId = 'test-image-container-single';
      let container = document.getElementById(containerId);
      if (!container) {
        container = createImageContainer(containerId, document.body);
      }
      container.innerHTML = ''; // Limpa conteúdo anterior

      const startTime = Date.now();
      const result = await generateImage({
        prompt: 'a beautiful sunset over mountains',
        resolution: 'square',
        outputTo: `#${containerId}`,
        seed: 'random',
        onStart: (data) => {
          console.log('🚀 [AI-Image] onStart chamado:', data);
        },
        onFinish: (data) => {
          console.log('✅ [AI-Image] onFinish chamado:', data);
        }
      });

      const elapsedTime = Date.now() - startTime;

      if (!result.success) {
        return { success: false, error: result.error || 'Falha na geração' };
      }

      // Valida metadados
      if (!result.seed || typeof result.seed !== 'string') {
        return { success: false, error: 'Seed inválido ou ausente' };
      }

      if (!result.generationTime || result.generationTime <= 0) {
        return { success: false, error: 'Tempo de geração inválido' };
      }

      if (!result.finalPrompt || result.finalPrompt.length === 0) {
        return { success: false, error: 'Prompt final ausente' };
      }

      // Verifica se elemento DOM foi criado
      const imgElement = container.querySelector('img, iframe');
      if (!imgElement) {
        return { success: false, error: 'Elemento de imagem não encontrado no DOM' };
      }

      console.log('✅ [AI-Image] Geração única bem-sucedida:', {
        seed: result.seed,
        time: result.generationTime,
        prompt: result.finalPrompt.substring(0, 50) + '...'
      });

      return {
        success: true,
        data: {
          seed: result.seed,
          generationTime: result.generationTime,
          promptLength: result.finalPrompt.length,
          domElementFound: !!imgElement,
          totalTime: elapsedTime
        }
      };

    } catch (error) {
      console.error('❌ [AI-Image] Erro no testSingleGeneration:', error);
      return { success: false, error: error.message };
    }
  },

  // Teste 2: Geração em lote
  async testBatchGeneration() {
    console.log('🖼️ [AI-Image] Testando geração em lote...');
    
    if (!this.available) {
      return { success: false, error: 'Plugin aiImage não disponível' };
    }

    try {
      const containerId = 'test-image-container-batch';
      let container = document.getElementById(containerId);
      if (!container) {
        container = createImageContainer(containerId, document.body);
      }
      container.innerHTML = '';

      const count = 2;
      let onAllFinishCalled = false;
      let finishedCount = 0;

      const startTime = Date.now();
      const results = await generateBatch({
        prompt: 'a cute cat playing with yarn',
        resolution: 'wide',
        outputTo: `#${containerId}`,
        orderByFinished: true,
        seed: 'random',
        onFinish: (data) => {
          finishedCount++;
          console.log(`✅ [AI-Image] Imagem ${finishedCount}/${count} finalizada`);
        },
        onAllFinish: (allData) => {
          onAllFinishCalled = true;
          console.log('🎉 [AI-Image] onAllFinish chamado com', allData.length, 'resultados');
        }
      }, count);

      const elapsedTime = Date.now() - startTime;

      if (!results || results.length !== count) {
        return { success: false, error: `Esperado ${count} resultados, recebido ${results?.length || 0}` };
      }

      if (!onAllFinishCalled) {
        return { success: false, error: 'onAllFinish não foi chamado' };
      }

      // Valida cada resultado
      for (let i = 0; i < results.length; i++) {
        const r = results[i];
        if (!r.success) {
          return { success: false, error: `Resultado ${i} falhou: ${r.error}` };
        }
        if (!r.seed || !r.generationTime || !r.finalPrompt) {
          return { success: false, error: `Resultado ${i} tem metadados inválidos` };
        }
      }

      // Verifica se elementos DOM foram criados
      const imgElements = container.querySelectorAll('img, iframe');
      if (imgElements.length !== count) {
        return { success: false, error: `Esperado ${count} elementos no DOM, encontrado ${imgElements.length}` };
      }

      console.log('✅ [AI-Image] Geração em lote bem-sucedida:', {
        count: results.length,
        totalTime: elapsedTime
      });

      return {
        success: true,
        data: {
          count: results.length,
          allFinishedCalled: onAllFinishCalled,
          domElementsFound: imgElements.length,
          totalTime: elapsedTime,
          seeds: results.map(r => r.seed)
        }
      };

    } catch (error) {
      console.error('❌ [AI-Image] Erro no testBatchGeneration:', error);
      return { success: false, error: error.message };
    }
  },

  // Teste 3: Processamento de prompt (hooks e tags padrão)
  async testPromptProcessing() {
    console.log('🖼️ [AI-Image] Testando processamento de prompt...');
    
    if (!this.available) {
      return { success: false, error: 'Plugin aiImage não disponível' };
    }

    try {
      const containerId = 'test-image-container-processing';
      let container = document.getElementById(containerId);
      if (!container) {
        container = createImageContainer(containerId, document.body);
      }
      container.innerHTML = '';

      let preprocessCalled = false;
      let postprocessCalled = false;

      const result = await generateImage({
        prompt: 'a simple red circle',
        resolution: 'square',
        outputTo: `#${containerId}`,
        defaultQualityTags: 'masterpiece, best quality, highres',
        defaultNegativePrompt: 'blurry, lowres, bad anatomy',
        preprocess: (prompt, context) => {
          preprocessCalled = true;
          console.log('🔧 [AI-Image] preprocess chamado:', prompt.substring(0, 50));
          return prompt; // Retorna sem modificar
        },
        postprocess: (prompt, context) => {
          postprocessCalled = true;
          console.log('🔧 [AI-Image] postprocess chamado:', prompt.substring(0, 50));
          return prompt;
        }
      });

      if (!result.success) {
        return { success: false, error: result.error || 'Falha na geração' };
      }

      // Verifica se hooks foram chamados
      if (!preprocessCalled) {
        return { success: false, error: 'Hook preprocess não foi chamado' };
      }

      if (!postprocessCalled) {
        return { success: false, error: 'Hook postprocess não foi chamado' };
      }

      // Verifica se tags padrão foram aplicadas ao prompt final
      const finalPrompt = result.finalPrompt || '';
      const hasQualityTags = finalPrompt.includes('masterpiece') || finalPrompt.includes('best quality');
      const hasNegativePrompt = finalPrompt.includes('blurry') || finalPrompt.includes('lowres');

      console.log('✅ [AI-Image] Processamento de prompt bem-sucedido:', {
        preprocessCalled,
        postprocessCalled,
        hasQualityTags,
        hasNegativePrompt,
        finalPromptLength: finalPrompt.length
      });

      return {
        success: true,
        data: {
          preprocessCalled,
          postprocessCalled,
          hasQualityTags,
          hasNegativePrompt,
          finalPrompt: finalPrompt.substring(0, 100) + '...'
        }
      };

    } catch (error) {
      console.error('❌ [AI-Image] Erro no testPromptProcessing:', error);
      return { success: false, error: error.message };
    }
  },

  // Teste 4: Tratamento de erros
  async testErrorHandling() {
    console.log('🖼️ [AI-Image] Testando tratamento de erros...');
    
    if (!this.available) {
      return { success: false, error: 'Plugin aiImage não disponível' };
    }

    const errors = [];

    // Teste 4.1: Prompt vazio
    try {
      const result = await generateImage({
        prompt: '',
        resolution: 'square'
      });
      
      if (result.success) {
        errors.push('Prompt vazio não gerou erro');
      } else {
        console.log('✅ [AI-Image] Prompt vazio tratado corretamente:', result.error);
      }
    } catch (error) {
      console.log('✅ [AI-Image] Prompt vazio lançou exceção:', error.message);
    }

    // Teste 4.2: Resolução inválida (deve ser tratada pelo módulo)
    try {
      const result = await generateImage({
        prompt: 'test',
        resolution: 'invalid_resolution'
      });
      
      // O módulo deve aceitar ou rejeitar, mas não deve crashar
      console.log('✅ [AI-Image] Resolução inválida tratada:', result.success ? 'aceita' : 'rejeitada');
    } catch (error) {
      console.log('✅ [AI-Image] Resolução inválida lançou exceção:', error.message);
    }

    // Teste 4.3: Container DOM inexistente
    try {
      const result = await generateImage({
        prompt: 'test',
        resolution: 'square',
        outputTo: '#non-existent-container-12345'
      });
      
      if (result.success) {
        errors.push('Container inexistente não gerou erro');
      } else {
        console.log('✅ [AI-Image] Container inexistente tratado corretamente:', result.error);
      }
    } catch (error) {
      console.log('✅ [AI-Image] Container inexistente lançou exceção:', error.message);
    }

    if (errors.length > 0) {
      return { success: false, error: errors.join('; ') };
    }

    console.log('✅ [AI-Image] Tratamento de erros bem-sucedido');
    return { success: true, data: { message: 'Todos os cenários de erro foram tratados' } };
  }
};

// Inicialização
console.log('🖼️ [AI-Image] Inicializando teste do plugin de imagem IA...');
if (aiImageTest.available) {
  console.log('✅ [AI-Image] Plugin advanced-ai-image-plugin disponível');
} else {
  console.warn('⚠️⚠️⚠️⚠️ [AI-Image] Plugin advanced-ai-image-plugin NÃO disponível');
  console.warn('   Adicione no List Panel: aiImage = {import:advanced-ai-image-plugin}');
}
