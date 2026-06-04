/**
 * Módulo para o plugin advanced-ai-image-plugin do Perchance
 * Fornece uma API de alto nível para geração avançada de imagens com IA
 * @version 1.26.0
 * @module ai-image
 */

import { root } from '../perchance-bridge.js';

/**
 * @typedef {Object} ImageGenerationOptions
 * @property {string} prompt - Descrição da imagem a ser gerada
 * @property {string} [negativePrompt] - Descrição do que evitar na imagem
 * @property {string|number} [seed='random'] - Seed para reprodutibilidade ou 'random'
 * @property {string} [resolution='square'] - Resolução: 'square' (512x512), 'wide' (768x512), 'tall' (512x768) ou formato customizado 'WxH'
 * @property {number} [guidanceScale=7] - Escala de orientação do modelo (1-20)
 * @property {number} [steps=30] - Número de passos de inferência (10-50)
 * @property {string} [generatorName] - Nome do gerador específico do Perchance
 * @property {Function} [onStart] - Callback chamado quando a geração inicia
 * @property {Function} [onFinish] - Callback chamado quando a geração termina
 * @property {Function} [onChunk] - Callback chamado a cada chunk de progresso
 * @property {Function} [onAllFinish] - Callback chamado quando todas as imagens do lote terminam
 * @property {Function} [preprocess] - Hook para modificar o prompt antes do envio
 * @property {Function} [postprocess] - Hook para modificar o prompt após processamento inicial
 * @property {string} [defaultQualityTags] - Tags de qualidade padrão a serem adicionadas (ex: "masterpiece, best quality")
 * @property {string} [defaultNegativePrompt] - Prompt negativo padrão a ser usado se nenhum for fornecido
 * @property {Object} [context] - Contexto para avaliação de variáveis do Perchance (ex: { characterName: "Alice" })
 * @property {string|HTMLElement} [container] - Seletor CSS ou elemento DOM para inserir a imagem
 * @property {boolean} [fragment=true] - Se true, usa DocumentFragment para inserção limpa (padrão: true)
 * @property {boolean} [orderByFinished=false] - Se true, reordena imagens por ordem de conclusão (requer container com display: flex)
 * @property {Function} [findContainer] - Função para encontrar container dinamicamente
 */

/**
 * @typedef {Object} ImageGenerationResult
 * @property {string} url - URL da imagem gerada (dataUrl ou URL externa)
 * @property {string|number} seed - Seed utilizada na geração
 * @property {number} generationTime - Tempo de geração em milissegundos
 * @property {string} prompt - Prompt final utilizado (após hooks)
 * @property {string} resolution - Resolução final utilizada
 * @property {HTMLElement} [element] - Elemento DOM da imagem (se inserido)
 * @property {Object} [metadata] - Metadados adicionais do plugin
 */

/**
 * Mapeamento de atalhos de resolução para dimensões
 * @private
 */
const RESOLUTION_MAP = {
  'square': '512x512',
  'wide': '768x512',
  'tall': '512x768',
  'hd': '1024x576',
  'portrait': '576x1024'
};

/**
 * Verifica se o plugin advanced-ai-image está disponível
 * @returns {boolean}
 */
export const isAvailable = () => !!root.aiImage;

/**
 * Cria um container otimizado para exibição de imagens (com display: flex)
 * @param {string} [id] - ID opcional para o container
 * @param {HTMLElement} [parent] - Elemento pai onde o container será inserido
 * @returns {HTMLElement} O container criado
 */
export const createImageContainer = (id, parent) => {
  const container = document.createElement('div');
  if (id) container.id = id;
  
  // Estilos otimizados para orderByFinished
  container.style.display = 'flex';
  container.style.flexWrap = 'wrap';
  container.style.gap = '10px';
  container.style.justifyContent = 'center';
  container.style.padding = '10px';
  
  if (parent) {
    parent.appendChild(container);
  }
  
  return container;
};

/**
 * Aplica hooks de preprocessamento (padrão + customizado)
 * @private
 */
const applyPreprocess = (prompt, options) => {
  let finalPrompt = prompt;

  // Aplica tags de qualidade padrão se fornecidas
  if (options.defaultQualityTags && typeof options.defaultQualityTags === 'string') {
    finalPrompt = `${finalPrompt}, ${options.defaultQualityTags}`;
  }

  // Aplica hook customizado do usuário
  if (typeof options.preprocess === 'function') {
    try {
      finalPrompt = options.preprocess(finalPrompt);
    } catch (err) {
      console.warn('⚠️ [AI-Image] Erro no hook preprocess do usuário:', err);
    }
  }

  return finalPrompt;
};

/**
 * Aplica hooks de postprocessamento
 * @private
 */
const applyPostprocess = (prompt, options) => {
  let finalPrompt = prompt;

  if (typeof options.postprocess === 'function') {
    try {
      finalPrompt = options.postprocess(finalPrompt);
    } catch (err) {
      console.warn('⚠️ [AI-Image] Erro no hook postprocess do usuário:', err);
    }
  }

  return finalPrompt;
};

/**
 * Gera uma única imagem usando o plugin advanced-ai-image-plugin
 * @param {ImageGenerationOptions} options - Opções de geração
 * @returns {Promise<ImageGenerationResult>} Resultado da geração
 * @throws {Error} Se o plugin não estiver disponível ou parâmetros inválidos
 */
export const generateImage = (options = {}) => {
  return new Promise((resolve, reject) => {
    // Validação defensiva
    if (!isAvailable()) {
      const error = new Error('Plugin advanced-ai-image-plugin não disponível. Verifique se aiImage = {import:advanced-ai-image-plugin} está no List Panel.');
      console.error('❌ [AI-Image]', error.message);
      return reject(error);
    }

    if (!options.prompt || typeof options.prompt !== 'string' || options.prompt.trim() === '') {
      const error = new Error('Prompt é obrigatório e não pode ser vazio');
      console.error('❌ [AI-Image]', error.message);
      return reject(error);
    }

    const startTime = Date.now();
    console.log('🎨 [AI-Image] Iniciando geração de imagem...', { prompt: options.prompt.substring(0, 50) + '...' });

    // Traduz atalhos de resolução
    const resolution = RESOLUTION_MAP[options.resolution] || options.resolution || '512x512';
    
    // Aplica hooks de preprocessamento
    const processedPrompt = applyPreprocess(options.prompt, options);
    
    // Define prompt negativo (customizado ou padrão)
    const negativePrompt = options.negativePrompt || options.defaultNegativePrompt || '';

    // Prepara opções para o plugin
    const pluginOptions = {
      ...options,
      prompt: processedPrompt, // Usa o prompt processado
      negativePrompt,
      resolution,
      seed: options.seed === 'random' || !options.seed ? 'random' : options.seed,
      fragment: options.fragment !== false, // Padrão: true
      context: options.context || {}, // Isolamento de contexto
      findContainer: options.findContainer || (options.container ? () => {
        const el = typeof options.container === 'string' ? document.querySelector(options.container) : options.container;
        return el;
      } : null),
      onFinish: (data) => {
        const generationTime = Date.now() - startTime;
        console.log('✅ [AI-Image] Geração concluída em', generationTime, 'ms');
        
        // Aplica postprocess se necessário (para fins de log/retorno)
        const finalPrompt = applyPostprocess(data.prompt || processedPrompt, options);
        
        // Callback do usuário
        if (typeof options.onFinish === 'function') {
          try {
            options.onFinish(data);
          } catch (err) {
            console.warn('⚠️ [AI-Image] Erro no callback onFinish do usuário:', err);
          }
        }

        // Resolve com resultado estruturado
        resolve({
          url: data.dataUrl || data.src || data.url,
          seed: data.seed || options.seed,
          generationTime,
          prompt: finalPrompt,
          negativePrompt,
          resolution,
          element: data.element || null,
          metadata: data
        });
      }
    };

    // Remove callbacks que não devem ser passados diretamente para o plugin
    delete pluginOptions.onStart;
    delete pluginOptions.onChunk;
    delete pluginOptions.defaultQualityTags;
    delete pluginOptions.defaultNegativePrompt;

    // Callback de início
    if (typeof options.onStart === 'function') {
      try {
        options.onStart();
      } catch (err) {
        console.warn('⚠️ [AI-Image] Erro no callback onStart:', err);
      }
    }

    try {
      // Chama o plugin do Perchance
      const result = root.aiImage(processedPrompt, pluginOptions);
      
      // Se retornar uma Promise, trata rejeição
      if (result && typeof result.then === 'function') {
        result.catch(err => {
          console.error('❌ [AI-Image] Erro na Promise do plugin:', err);
          reject(err);
        });
      }
    } catch (err) {
      console.error('❌ [AI-Image] Erro ao chamar o plugin:', err);
      reject(err);
    }
  });
};

/**
 * Gera múltiplas imagens em lote
 * @param {ImageGenerationOptions} options - Opções base de geração
 * @param {number} count - Número de imagens a gerar (1-10)
 * @returns {Promise<ImageGenerationResult[]>} Array de resultados
 * @throws {Error} Se count for inválido ou plugin não disponível
 */
export const generateBatch = (options = {}, count = 1) => {
  return new Promise((resolve, reject) => {
    // Validação defensiva
    if (!isAvailable()) {
      const error = new Error('Plugin advanced-ai-image-plugin não disponível');
      console.error('❌ [AI-Image]', error.message);
      return reject(error);
    }

    if (!Number.isInteger(count) || count < 1 || count > 10) {
      const error = new Error('Count deve ser um inteiro entre 1 e 10');
      console.error('❌ [AI-Image]', error.message);
      return reject(error);
    }

    if (!options.prompt || typeof options.prompt !== 'string' || options.prompt.trim() === '') {
      const error = new Error('Prompt é obrigatório e não pode ser vazio');
      console.error('❌ [AI-Image]', error.message);
      return reject(error);
    }

    const startTime = Date.now();
    console.log(`🎨 [AI-Image] Iniciando geração em lote de ${count} imagens...`);

    const results = [];
    let completedCount = 0;

    // Aplica hooks de preprocessamento
    const processedPrompt = applyPreprocess(options.prompt, options);
    const negativePrompt = options.negativePrompt || options.defaultNegativePrompt || '';

    // Prepara opções para o plugin com count nativo
    const pluginOptions = {
      ...options,
      prompt: processedPrompt,
      negativePrompt,
      count,
      resolution: RESOLUTION_MAP[options.resolution] || options.resolution || '512x512',
      seed: options.seed === 'random' || !options.seed ? 'random' : options.seed,
      fragment: options.fragment !== false,
      context: options.context || {},
      findContainer: options.findContainer || (options.container ? () => {
        const el = typeof options.container === 'string' ? document.querySelector(options.container) : options.container;
        return el;
      } : null),
      onAllFinish: (dataArray) => {
        const generationTime = Date.now() - startTime;
        console.log(`✅ [AI-Image] Lote completo: ${dataArray.length} imagens em ${generationTime}ms`);

        // Callback do usuário
        if (typeof options.onAllFinish === 'function') {
          try {
            options.onAllFinish(dataArray);
          } catch (err) {
            console.warn('⚠️ [AI-Image] Erro no callback onAllFinish:', err);
          }
        }

        // Mapeia resultados
        const mappedResults = dataArray.map((data, index) => ({
          url: data.dataUrl || data.src || data.url,
          seed: data.seed || options.seed,
          generationTime,
          prompt: applyPostprocess(data.prompt || processedPrompt, options),
          negativePrompt,
          resolution: pluginOptions.resolution,
          element: data.element || null,
          metadata: data,
          index
        }));

        resolve(mappedResults);
      },
      onFinish: (data) => {
        completedCount++;
        console.log(`📊 [AI-Image] Progresso: ${completedCount}/${count}`);

        // Callback individual do usuário
        if (typeof options.onFinish === 'function') {
          try {
            options.onFinish(data, completedCount, count);
          } catch (err) {
            console.warn('⚠️ [AI-Image] Erro no callback onFinish:', err);
          }
        }
      }
    };

    // Remove callbacks que não devem ser passados diretamente
    delete pluginOptions.onStart;
    delete pluginOptions.onChunk;
    delete pluginOptions.onAllFinish;
    delete pluginOptions.defaultQualityTags;
    delete pluginOptions.defaultNegativePrompt;

    // Callback de início
    if (typeof options.onStart === 'function') {
      try {
        options.onStart(count);
      } catch (err) {
        console.warn('⚠️ [AI-Image] Erro no callback onStart:', err);
      }
    }

    try {
      // Chama o plugin do Perchance
      const result = root.aiImage(processedPrompt, pluginOptions);
      
      // Se retornar uma Promise, trata rejeição
      if (result && typeof result.then === 'function') {
        result.catch(err => {
          console.error('❌ [AI-Image] Erro na Promise do plugin:', err);
          reject(err);
        });
      }
    } catch (err) {
      console.error('❌ [AI-Image] Erro ao chamar o plugin:', err);
      reject(err);
    }
  });
};

// Exporta objeto principal para compatibilidade
export const aiImageModule = {
  isAvailable,
  generateImage,
  generateBatch,
  createImageContainer,
  RESOLUTION_MAP
};
