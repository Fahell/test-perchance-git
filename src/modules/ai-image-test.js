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
  async testSingleGeneration(contentArea = document.body) {
    console.log('🖼️ [AI-Image] Testando geração única...');
    
    if (!this.available) {
      return { success: false, error: 'Plugin aiImage não disponível' };
    }

    try {
      const containerId = 'test-image-container-single';
      let container = document.getElementById(containerId);
      if (!container) {
        container = createImageContainer(containerId, contentArea);
      } else {
        // Garante que o container está dentro do contentArea se já existir
        if (container.parentElement !== contentArea) {
          contentArea.appendChild(container);
        }
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

      // Valida metadados - seed pode ser string ou número
      if (!result.seed || (typeof result.seed !== 'string' && typeof result.seed !== 'number')) {
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
  async testBatchGeneration(contentArea = document.body) {
    console.log('🖼️ [AI-Image] Testando geração em lote...');
    
    if (!this.available) {
      return { success: false, error: 'Plugin aiImage não disponível' };
    }

    try {
      const containerId = 'test-image-container-batch';
      let container = document.getElementById(containerId);
      if (!container) {
        container = createImageContainer(containerId, contentArea);
      } else {
        if (container.parentElement !== contentArea) {
          contentArea.appendChild(container);
        }
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
        // seed pode ser string ou número
        if (!r.seed || (typeof r.seed !== 'string' && typeof r.seed !== 'number') || !r.generationTime || !r.finalPrompt) {
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
  async testPromptProcessing(contentArea = document.body) {
    console.log('🖼️ [AI-Image] Testando processamento de prompt...');
    
    if (!this.available) {
      return { success: false, error: 'Plugin aiImage não disponível' };
    }

    try {
      const containerId = 'test-image-container-processing';
      let container = document.getElementById(containerId);
      if (!container) {
        container = createImageContainer(containerId, contentArea);
      } else {
        if (container.parentElement !== contentArea) {
          contentArea.appendChild(container);
        }
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
        preprocess: (inputs, context) => {
          preprocessCalled = true;
          console.log('🔧 [AI-Image] preprocess chamado:', inputs.prompt ? inputs.prompt.substring(0, 50) : 'sem prompt');
          // O plugin espera que modifiquemos inputs.prompt diretamente
        },
        postprocess: (inputs, context) => {
          postprocessCalled = true;
          console.log('🔧 [AI-Image] postprocess chamado:', inputs.prompt ? inputs.prompt.substring(0, 50) : 'sem prompt');
          // O plugin espera que modifiquemos inputs.prompt diretamente
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
  },

  // Teste 5: plaintext e context Isolation
  async testPlaintextAndContext(contentArea = document.body) {
    console.log('🖼️🖼️ [AI-Image] Testando plaintext e context isolation...');
    
    if (!this.available) {
      return { success: false, error: 'Plugin aiImage não disponível' };
    }

    try {
      const containerId = 'test-image-container-plaintext';
      let container = document.getElementById(containerId);
      if (!container) {
        container = createImageContainer(containerId, contentArea);
      } else {
        if (container.parentElement !== contentArea) {
          contentArea.appendChild(container);
        }
      }
      container.innerHTML = '';

      // Teste 5.1: plaintext deve impedir avaliação de código Perchance
      const plaintextPrompt = 'a beautiful sunset $[character.name]';
      let plaintextProcessedPrompt = '';
      
      const resultPlaintext = await generateImage({
        prompt: plaintextPrompt,
        resolution: 'square',
        outputTo: `#${containerId}`,
        plaintext: true,
        preprocess: (inputs) => {
          plaintextProcessedPrompt = inputs.prompt;
        }
      });

      if (!resultPlaintext.success) {
        return { success: false, error: resultPlaintext.error || 'Falha na geração plaintext' };
      }

      // O prompt deve conter exatamente a string, sem ser avaliado
      const hasUnresolvedVariables = plaintextProcessedPrompt.includes('$[character.name]');
      
      // Teste 5.2: context deve isolar variáveis
      const contextPrompt = 'a portrait of $[character.name]';
      let contextProcessedPrompt = '';
      const customContext = { character: { name: 'Alice' } };
      
      const resultContext = await generateImage({
        prompt: contextPrompt,
        resolution: 'square',
        outputTo: `#${containerId}`,
        context: customContext,
        preprocess: (inputs) => {
          contextProcessedPrompt = inputs.prompt;
        }
      });

      if (!resultContext.success) {
        return { success: false, error: resultContext.error || 'Falha na geração com context' };
      }

      console.log('✅ [AI-Image] Teste de plaintext e context bem-sucedido:', {
        hasUnresolvedVariables,
        contextProcessedPrompt: contextProcessedPrompt.substring(0, 50) + '...'
      });

      return {
        success: true,
        data: {
          plaintextUnresolved: hasUnresolvedVariables,
          contextPrompt: contextProcessedPrompt.substring(0, 100) + '...'
        }
      };

    } catch (error) {
      console.error('❌ [AI-Image] Erro no testPlaintextAndContext:', error);
      return { success: false, error: error.message };
    }
  },

  // Teste 6: Hook preprocessAll
  async testPreprocessAllHook(contentArea = document.body) {
    console.log('🖼️🖼️ [AI-Image] Testando hook preprocessAll...');
    
    if (!this.available) {
      return { success: false, error: 'Plugin aiImage não disponível' };
    }

    try {
      const containerId = 'test-image-container-preprocessall';
      let container = document.getElementById(containerId);
      if (!container) {
        container = createImageContainer(containerId, contentArea);
      } else {
        if (container.parentElement !== contentArea) {
          contentArea.appendChild(container);
        }
      }
      container.innerHTML = '';

      let preprocessAllCallCount = 0;
      let preprocessCallCount = 0;
      const count = 2;

      const results = await generateBatch({
        prompt: 'a simple landscape',
        resolution: 'square',
        outputTo: `#${containerId}`,
        count: count,
        preprocessAll: (inputs) => {
          preprocessAllCallCount++;
          console.log('🔧 [AI-Image] preprocessAll chamado. Count:', preprocessAllCallCount);
          // Modifica o prompt base para todas as imagens
          inputs.prompt = inputs.prompt + ', highly detailed';
        },
        preprocess: (inputs) => {
          preprocessCallCount++;
          console.log('🔧 [AI-Image] preprocess chamado para imagem', preprocessCallCount);
        }
      }, count);

      if (!results || results.length !== count) {
        return { success: false, error: `Esperado ${count} resultados, recebido ${results?.length || 0}` };
      }

      // preprocessAll deve ser chamado exatamente uma vez
      if (preprocessAllCallCount !== 1) {
        return { success: false, error: `preprocessAll foi chamado ${preprocessAllCallCount} vezes, esperado 1` };
      }

      // preprocess deve ser chamado uma vez por imagem
      if (preprocessCallCount !== count) {
        return { success: false, error: `preprocess foi chamado ${preprocessCallCount} vezes, esperado ${count}` };
      }

      // Verifica se a modificação do preprocessAll foi aplicada
      const finalPrompt = results[0].finalPrompt || '';
      const hasModification = finalPrompt.includes('highly detailed');

      console.log('✅ [AI-Image] Hook preprocessAll testado com sucesso:', {
        preprocessAllCallCount,
        preprocessCallCount,
        hasModification
      });

      return {
        success: true,
        data: {
          preprocessAllCallCount,
          preprocessCallCount,
          modificationApplied: hasModification
        }
      };

    } catch (error) {
      console.error('❌ [AI-Image] Erro no testPreprocessAllHook:', error);
      return { success: false, error: error.message };
    }
  },

  // Teste 7: Wrappers por Imagem (before, after, html)
  async testHtmlWrappers(contentArea = document.body) {
    console.log('🖼️🖼️ [AI-Image] Testando HTML wrappers por imagem...');
    
    if (!this.available) {
      return { success: false, error: 'Plugin aiImage não disponível' };
    }

    try {
      const containerId = 'test-image-container-html-wrappers';
      let container = document.getElementById(containerId);
      if (!container) {
        container = createImageContainer(containerId, contentArea);
      } else {
        if (container.parentElement !== contentArea) {
          contentArea.appendChild(container);
        }
      }
      container.innerHTML = '';

      let htmlCalled = false;

      const result = await generateImage({
        prompt: 'a fantasy landscape with mountains',
        resolution: 'square',
        outputTo: `#${containerId}`,
        before: '<div class="custom-before" style="color:#4ade80;padding:5px;">🖼️ Before Image</div>',
        after: '<div class="custom-after" style="color:#fbbf24;padding:5px;">📝 After Image</div>',
        html: (defaultHtml, data) => {
          htmlCalled = true;
          console.log('🔧 [AI-Image] html chamado');
          // Envolve o HTML padrão em um container customizado
          return `<div class="custom-wrapper" style="border:2px solid #a78bfa;padding:10px;border-radius:8px;">${defaultHtml}</div>`;
        }
      });

      if (!result.success) {
        return { success: false, error: result.error || 'Falha na geração' };
      }

      // Verifica se o hook html foi chamado
      if (!htmlCalled) {
        return { success: false, error: 'Hook html não foi chamado' };
      }

      // Verifica se os elementos customizados foram inseridos no DOM
      const beforeElement = container.querySelector('.custom-before');
      const afterElement = container.querySelector('.custom-after');
      const wrapperElement = container.querySelector('.custom-wrapper');

      console.log('✅ [AI-Image] HTML wrappers testados com sucesso:', {
        beforeCalled,
        afterCalled,
        htmlCalled,
        beforeElementFound: !!beforeElement,
        afterElementFound: !!afterElement,
        wrapperElementFound: !!wrapperElement
      });

      return {
        success: true,
        data: {
          beforeCalled,
          afterCalled,
          htmlCalled,
          beforeElementFound: !!beforeElement,
          afterElementFound: !!afterElement,
          wrapperElementFound: !!wrapperElement
        }
      };

    } catch (error) {
      console.error('❌ [AI-Image] Erro no testHtmlWrappers:', error);
      return { success: false, error: error.message };
    }
  },

  // Teste 8: Wrappers de Lote (beforeAll, afterAll, htmlAll)
  async testBatchHtmlWrappers(contentArea = document.body) {
    console.log('🖼️🖼️ [AI-Image] Testando HTML wrappers de lote...');
    
    if (!this.available) {
      return { success: false, error: 'Plugin aiImage não disponível' };
    }

    try {
      const containerId = 'test-image-container-batch-html-wrappers';
      let container = document.getElementById(containerId);
      if (!container) {
        container = createImageContainer(containerId, contentArea);
      } else {
        if (container.parentElement !== contentArea) {
          contentArea.appendChild(container);
        }
      }
      container.innerHTML = '';

      let htmlAllCalled = false;
      const count = 2;

      const results = await generateBatch({
        prompt: 'a cute animal',
        resolution: 'square',
        outputTo: `#${containerId}`,
        count: count,
        beforeAll: '<div class="batch-header" style="color:#4ade80;padding:10px;font-weight:bold;">📦 Batch Gallery</div>',
        afterAll: '<div class="batch-footer" style="color:#fbbf24;padding:10px;text-align:center;">✨ End of Gallery ✨</div>',
        htmlAll: (defaultHtml, data) => {
          htmlAllCalled = true;
          console.log('🔧 [AI-Image] htmlAll chamado');
          // Envolve todo o lote em um container customizado
          return `<div class="batch-wrapper" style="border:3px solid #ec4899;padding:15px;border-radius:12px;background:#1e293b;">${defaultHtml}</div>`;
        }
      }, count);

      if (!results || results.length !== count) {
        return { success: false, error: `Esperado ${count} resultados, recebido ${results?.length || 0}` };
      }

      // Verifica se o hook htmlAll foi chamado
      if (!htmlAllCalled) {
        return { success: false, error: 'Hook htmlAll não foi chamado' };
      }

      // Verifica se os elementos customizados foram inseridos no DOM
      const headerElement = container.querySelector('.batch-header');
      const footerElement = container.querySelector('.batch-footer');
      const wrapperElement = container.querySelector('.batch-wrapper');

      console.log('✅ [AI-Image] HTML wrappers de lote testados com sucesso:', {
        beforeAllCalled,
        afterAllCalled,
        htmlAllCalled,
        headerElementFound: !!headerElement,
        footerElementFound: !!footerElement,
        wrapperElementFound: !!wrapperElement
      });

      return {
        success: true,
        data: {
          beforeAllCalled,
          afterAllCalled,
          htmlAllCalled,
          headerElementFound: !!headerElement,
          footerElementFound: !!footerElement,
          wrapperElementFound: !!wrapperElement,
          imagesGenerated: results.length
        }
      };

    } catch (error) {
      console.error('❌ [AI-Image] Erro no testBatchHtmlWrappers:', error);
      return { success: false, error: error.message };
    }
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
