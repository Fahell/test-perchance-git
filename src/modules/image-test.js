/**
 * Módulo de teste para o plugin text-to-image-plugin do Perchance
 * Testa: geração, seed, removeBackground, guidanceScale, negativePrompt, trigger words, emojis, onFinish, resolução
 * @version 1.5.1
 */

import { root } from '../perchance-bridge.js';
import { createTestContainer } from './test-container.js';

let currentContainer = null;

export const imageTest = {
  available: !!root.image,

  // Helper para extrair URL da imagem do retorno do plugin
  _extractImageUrl(result) {
    if (!result) return null;
    if (result.dataUrl) return result.dataUrl;
    if (result.src) return result.src;
    if (result.url) return result.url;
    return null;
  },

  // Helper robusto para geração de imagens via onFinish (Promise wrapper)
  _generateImage(prompt, options = {}, timeout = 120000) {
    return new Promise((resolve, reject) => {
      console.log(`🔧 [Image] _generateImage called:`, { prompt, options });
      const timer = setTimeout(() => {
        console.error(`⏰ [Image] Timeout after ${timeout/1000}s`);
        reject(new Error(`Timeout: Geração da imagem excedeu ${timeout/1000}s`));
      }, timeout);

      const handleFinish = (data) => {
        clearTimeout(timer);
        console.log(`✅ [Image] onFinish triggered`, data);
        // Call caller's callback if provided
        if (options.onFinish) {
          try { options.onFinish(data); } catch (e) { console.warn('Caller onFinish error:', e); }
        }
        
        if (data && data.dataUrl) {
          resolve(data);
        } else {
          reject(new Error('Dados da imagem inválidos ou vazios'));
        }
      };

      try {
        const result = root.image(prompt, {
          ...options,
          onFinish: handleFinish
        });
        
        // Handle if root.image returns a promise that might reject
        if (result && typeof result.then === 'function') {
          result.catch(err => {
            clearTimeout(timer);
            console.error(`❌ [Image] root.image promise rejected`, err);
            reject(err);
          });
        }
      } catch (err) {
        clearTimeout(timer);
        console.error(`❌ [Image] root.image threw error`, err);
        reject(err);
      }
    });
  },

  // Cria ou reutiliza o container modal
  _getOrCreateContainer(title) {
    if (currentContainer) {
      currentContainer.close();
    }
    currentContainer = createTestContainer(title, {
      width: 900,
      height: 700,
      onClose: () => {
        currentContainer = null;
        console.log('🗑️ [Image] Container fechado');
      }
    });
    return currentContainer;
  },

  // Teste 1: Geração básica com seed fixa
  async testBasicImage() {
    console.log('🖼️ [Image] Gerando imagem básica com seed fixa...');

    const { contentArea } = this._getOrCreateContainer('🖼️ Image Test - Basic Generation');
    contentArea.innerHTML = '<p>⏳ Gerando imagem...</p>';

    try {
      const result = await this._generateImage(
        'papercraft warrior with sword, fantasy art style',
        {
          seed: 12345,
          resolution: '512x512',
          negativePrompt: 'blurry, low quality'
        }
      );

      const imageUrl = this._extractImageUrl(result);

      if (imageUrl) {
        console.log('✅ [Image] Imagem gerada com sucesso!');
        console.log(' Data URL length:', imageUrl.length, 'chars');
        console.log(' Tipo do resultado:', typeof result, result.constructor.name);

        contentArea.innerHTML = `
          <div style="text-align:center">
            <img src="${imageUrl}" style="max-width:100%; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.3)" />
            <p style="margin-top:12px; font-size:14px">
              <strong>✅ Seed:</strong> 12345 |
              <strong>📐 Resolução:</strong> 512x512 |
              <strong>📏 Tamanho:</strong> ${(imageUrl.length / 1024).toFixed(1)}KB
            </p>
          </div>
        `;

        return { success: true, url: imageUrl, seed: 12345 };
      } else {
        throw new Error('Não foi possível extrair URL da imagem');
      }
    } catch (error) {
      console.error('❌ [Image] Falha na geração:', error.message);
      contentArea.innerHTML = `<p style="color:red">❌ Erro: ${error.message}</p>`;
      return { success: false, error: error.message };
    }
  },

  // Teste 2: Remove background (fundo transparente)
  async testRemoveBackground() {
    console.log('🖼️ [Image] Testando removeBackground...');

    const { contentArea } = this._getOrCreateContainer('🔍 Image Test - Remove Background');
    contentArea.innerHTML = '<p>⏳ Gerando imagem sem fundo...</p>';

    try {
      const result = await this._generateImage(
        'papercraft character, simple background',
        {
          seed: 54321,
          resolution: '512x512',
          removeBackground: true,
          negativePrompt: 'complex background, scenery'
        }
      );

      const imageUrl = this._extractImageUrl(result);

      if (imageUrl) {
        console.log('✅ [Image] Imagem sem fundo gerada!');

        contentArea.innerHTML = `
          <div style="text-align:center; background: repeating-conic-gradient(#808080 0% 25%, transparent 0% 50%) 50% / 20px 20px; padding: 20px; border-radius: 8px;">
            <img src="${imageUrl}" style="max-width:100%; border-radius:8px;" />
            <p style="margin-top:12px; font-size:14px; background: white; padding: 8px; border-radius: 4px; display: inline-block;">
              <strong>✅ Seed:</strong> 54321 |
              <strong>🔍 RemoveBackground:</strong> true |
              <strong>🎨 Fundo:</strong> transparente (quadriculado)
            </p>
          </div>
        `;

        return { success: true, url: imageUrl, transparent: true };
      } else {
        throw new Error('Não foi possível extrair URL da imagem');
      }
    } catch (error) {
      console.error('❌ [Image] Falha:', error.message);
      contentArea.innerHTML = `<p style="color:red">❌ Erro: ${error.message}</p>`;
      return { success: false, error: error.message };
    }
  },

  // Teste 3: Comparação de seeds diferentes
  async testSeedComparison() {
    console.log('🖼️ [Image] Comparando seeds diferentes...');

    const { contentArea } = this._getOrCreateContainer('🎲 Image Test - Seed Comparison');
    contentArea.innerHTML = '<p>⏳ Gerando 2 imagens com seeds diferentes...</p>';

    try {
      const seed1 = 11111;
      const seed2 = 99999;
      const prompt = 'papercraft dragon, fantasy style';

      console.log(` Gerando com seed ${seed1}...`);
      const result1 = await this._generateImage(prompt, { seed: seed1, size: 256 });

      console.log(` Gerando com seed ${seed2}...`);
      const result2 = await this._generateImage(prompt, { seed: seed2, size: 256 });

      const url1 = this._extractImageUrl(result1);
      const url2 = this._extractImageUrl(result2);

      if (url1 && url2) {
        console.log('✅ [Image] Ambas imagens geradas!');

        contentArea.innerHTML = `
          <div style="display:flex; gap:16px; justify-content:center; flex-wrap:wrap">
            <div style="text-align:center">
              <img src="${url1}" style="max-width:100%; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.3)" />
              <p style="margin-top:8px; font-size:13px">Seed: ${seed1}</p>
            </div>
            <div style="text-align:center">
              <img src="${url2}" style="max-width:100%; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.3)" />
              <p style="margin-top:8px; font-size:13px">Seed: ${seed2}</p>
            </div>
          </div>
          <p style="text-align:center; margin-top:12px; font-size:14px">
            <strong>✅ Mesma prompt,</strong> seeds diferentes |
            <strong>📐 Resolução:</strong> 256x256 cada
          </p>
        `;

        return { success: true, images: [url1, url2], seeds: [seed1, seed2] };
      } else {
        throw new Error('Falha ao gerar uma ou ambas imagens');
      }
    } catch (error) {
      console.error('❌ [Image] Falha na comparação:', error.message);
      contentArea.innerHTML = `<p style="color:red">❌ Erro: ${error.message}</p>`;
      return { success: false, error: error.message };
    }
  },

  // Teste 4: Diferentes resoluções
  async testResolution() {
    console.log('🖼️ [Image] Testando resolução customizada...');

    const { contentArea } = this._getOrCreateContainer('📐 Image Test - Custom Resolution');
    contentArea.innerHTML = '<p>⏳ Gerando imagem 768x384...</p>';

    try {
      const result = await this._generateImage(
        'papercraft landscape, wide view',
        {
          seed: 77777,
          resolution: '768x512',
          negativePrompt: 'portrait, vertical'
        }
      );

      const imageUrl = this._extractImageUrl(result);

      if (imageUrl) {
        console.log('✅ [Image] Imagem wide gerada!');

        contentArea.innerHTML = `
          <div style="text-align:center">
            <img src="${imageUrl}" style="max-width:100%; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.3)" />
            <p style="margin-top:12px; font-size:14px">
              <strong>✅ Seed:</strong> 77777 |
              <strong>📐 Resolução:</strong> 768x384 (16:9) |
              <strong>🎨 Formato:</strong> wide/landscape
            </p>
          </div>
        `;

        return { success: true, url: imageUrl, resolution: '768x512' };
      } else {
        throw new Error('Não foi possível extrair URL da imagem');
      }
    } catch (error) {
      console.error('❌ [Image] Falha:', error.message);
      contentArea.innerHTML = `<p style="color:red">❌ Erro: ${error.message}</p>`;
      return { success: false, error: error.message };
    }
  },

  // Teste 5: Guidance Scale Comparison (CFG 3, 7, 15, 25)
  async testGuidanceScale() {
    console.log('🖼️ [Image] Testando guidance scale comparison...');

    const { contentArea } = this._getOrCreateContainer('⚖️ Image Test - Guidance Scale');
    contentArea.innerHTML = '<p>⏳ Gerando 3 imagens com CFG diferentes...</p>';

    try {
      const prompt = 'papercraft castle, detailed, fantasy';
      const seed = 42424;
      const scales = [3, 7, 15];
      const results = [];

      for (const scale of scales) {
        console.log(` Gerando com CFG ${scale}...`);
        const result = await this._generateImage(prompt, {
          seed,
          size: 256,
          guidanceScale: scale
        });
        const url = this._extractImageUrl(result);
        if (url) results.push({ scale, url });
      }

      if (results.length === 3) {
        console.log('✅ [Image] Todas imagens geradas!');

        const imagesHtml = results.map(r => `
          <div style="text-align:center">
            <img src="${r.url}" style="max-width:100%; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.3)" />
            <p style="margin-top:8px; font-size:13px; font-weight:bold">CFG: ${r.scale}</p>
          </div>
        `).join('');

        contentArea.innerHTML = `
          <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap:16px">
            ${imagesHtml}
          </div>
          <p style="text-align:center; margin-top:12px; font-size:14px">
            <strong>✅ Seed:</strong> ${seed} |
            <strong>📐 Resolução:</strong> 256x256 cada |
            <strong>⚖️ CFG:</strong> 3 (criativo) → 15 (rígido)
          </p>
        `;

        return { success: true, results };
      } else {
        throw new Error(`Apenas ${results.length}/3 imagens geradas`);
      }
    } catch (error) {
      console.error('❌ [Image] Falha no guidance scale:', error.message);
      contentArea.innerHTML = `<p style="color:red">❌ Erro: ${error.message}</p>`;
      return { success: false, error: error.message };
    }
  },

  // Teste 6: Negative Prompt Effect (com vs sem negativePrompt)
  async testNegativePrompt() {
    console.log('🖼️ [Image] Testando efeito do negative prompt...');

    const { contentArea } = this._getOrCreateContainer('🚫 Image Test - Negative Prompt');
    contentArea.innerHTML = '<p>⏳ Gerando com e sem negative prompt...</p>';

    try {
      const prompt = 'papercraft character portrait';
      const seed = 55555;
      const negativePrompt = 'blurry, low quality, distorted, ugly, deformed';

      console.log(' Gerando SEM negative prompt...');
      const resultWithout = await this._generateImage(prompt, {
        seed,
        size: 256
      });

      console.log(' Gerando COM negative prompt...');
      const resultWith = await this._generateImage(prompt, {
        seed,
        size: 256,
        negativePrompt
      });

      const urlWithout = this._extractImageUrl(resultWithout);
      const urlWith = this._extractImageUrl(resultWith);

      if (urlWithout && urlWith) {
        console.log('✅ [Image] Ambas imagens geradas!');

        contentArea.innerHTML = `
          <div style="display:flex; gap:16px; justify-content:center; flex-wrap:wrap">
            <div style="text-align:center">
              <img src="${urlWithout}" style="max-width:100%; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.3)" />
              <p style="margin-top:8px; font-size:13px; color:red">❌ Sem Negative Prompt</p>
            </div>
            <div style="text-align:center">
              <img src="${urlWith}" style="max-width:100%; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.3)" />
              <p style="margin-top:8px; font-size:13px; color:green">✅ Com Negative Prompt</p>
            </div>
          </div>
          <p style="text-align:center; margin-top:12px; font-size:14px">
            <strong>✅ Seed:</strong> ${seed} |
            <strong>🚫 Negative:</strong> "${negativePrompt}"
          </p>
        `;

        return { success: true, without: urlWithout, with: urlWith };
      } else {
        throw new Error('Falha ao gerar uma ou ambas imagens');
      }
    } catch (error) {
      console.error('❌ [Image] Falha no negative prompt:', error.message);
      contentArea.innerHTML = `<p style="color:red">❌ Erro: ${error.message}</p>`;
      return { success: false, error: error.message };
    }
  },

  // Teste 7: Model Trigger Words (anime, furry, normal)
  async testTriggerWords() {
    console.log('🖼️ [Image] Testando trigger words de modelos...');

    const { contentArea } = this._getOrCreateContainer('🎭 Image Test - Trigger Words');
    contentArea.innerHTML = '<p>⏳ Gerando com trigger words diferentes...</p>';

    try {
      const seed = 67890;
      const configs = [
        { label: 'Normal', prompt: 'papercraft cat, cute, simple' },
        { label: 'Anime', prompt: 'anime cat, kawaii, 1girl, danbooru style' },
        { label: 'Furry', prompt: 'anthropomorphic cat, fursuit, furry art style' }
      ];
      const results = [];

      for (const config of configs) {
        console.log(` Gerando estilo: ${config.label}...`);
        const result = await this._generateImage(config.prompt, {
          seed,
          size: 256
        });
        const url = this._extractImageUrl(result);
        if (url) results.push({ ...config, url });
      }

      if (results.length === 3) {
        console.log('✅ [Image] Todos estilos gerados!');

        const imagesHtml = results.map(r => `
          <div style="text-align:center">
            <img src="${r.url}" style="max-width:100%; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.3)" />
            <p style="margin-top:8px; font-size:13px; font-weight:bold">${r.label}</p>
            <p style="font-size:11px; color:#666; font-style:italic">${r.prompt}</p>
          </div>
        `).join('');

        contentArea.innerHTML = `
          <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:16px">
            ${imagesHtml}
          </div>
          <p style="text-align:center; margin-top:12px; font-size:14px">
            <strong>✅ Seed:</strong> ${seed} |
            <strong>🎭 Estilos:</strong> Normal, Anime, Furry |
            <strong>📐 Resolução:</strong> 256x256 cada
          </p>
        `;

        return { success: true, results };
      } else {
        throw new Error(`Apenas ${results.length}/3 estilos gerados`);
      }
    } catch (error) {
      console.error('❌ [Image] Falha nos trigger words:', error.message);
      contentArea.innerHTML = `<p style="color:red">❌ Erro: ${error.message}</p>`;
      return { success: false, error: error.message };
    }
  },

  // Teste 8: Emoji Prompts
  async testEmojiPrompts() {
    console.log('🖼️ [Image] Testando prompts com emojis...');

    const { contentArea } = this._getOrCreateContainer('😀 Image Test - Emoji Prompts');
    contentArea.innerHTML = '<p>⏳ Gerando imagens com emojis...</p>';

    try {
      const seed = 11122;
      const emojiConfigs = [
        { emoji: '🐉', prompt: '🐉 dragon, fantasy, papercraft' },
        { emoji: '🌸', prompt: '🌸 cherry blossom, japanese garden, serene' },
        { emoji: '🤖', prompt: '🤖 robot, sci-fi, mechanical, detailed' }
      ];
      const results = [];

      for (const config of emojiConfigs) {
        console.log(` Gerando com emoji ${config.emoji}...`);
        const result = await this._generateImage(config.prompt, {
          seed,
          size: 256
        });
        const url = this._extractImageUrl(result);
        if (url) results.push({ ...config, url });
      }

      if (results.length === 3) {
        console.log('✅ [Image] Todas imagens com emoji geradas!');

        const imagesHtml = results.map(r => `
          <div style="text-align:center">
            <img src="${r.url}" style="max-width:100%; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.3)" />
            <p style="margin-top:8px; font-size:20px">${r.emoji}</p>
            <p style="font-size:11px; color:#666; font-style:italic">${r.prompt}</p>
          </div>
        `).join('');

        contentArea.innerHTML = `
          <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:16px">
            ${imagesHtml}
          </div>
          <p style="text-align:center; margin-top:12px; font-size:14px">
            <strong>✅ Seed:</strong> ${seed} |
            <strong>😀 Emojis:</strong> funcionam como tokens no prompt |
            <strong>📐 Resolução:</strong> 256x256 cada
          </p>
        `;

        return { success: true, results };
      } else {
        throw new Error(`Apenas ${results.length}/3 imagens geradas`);
      }
    } catch (error) {
      console.error('❌ [Image] Falha nos emoji prompts:', error.message);
      contentArea.innerHTML = `<p style="color:red">❌ Erro: ${error.message}</p>`;
      return { success: false, error: error.message };
    }
  },

  // Teste 9: onFinish Callback com metadados
  async testOnFinishCallback() {
    console.log('🖼️ [Image] Testando onFinish callback...');

    const { contentArea } = this._getOrCreateContainer('📊 Image Test - onFinish Callback');
    contentArea.innerHTML = '<p>⏳ Gerando e capturando metadados...</p>';

    try {
      let metadata = null;
      const prompt = 'papercraft owl, mystical forest, detailed feathers';
      const seed = 99988;

      console.log(' Gerando com onFinish callback...');
      const result = await this._generateImage(prompt, {
        seed,
        resolution: '512x512',
        guidanceScale: 8,
        negativePrompt: 'blurry, low quality',
        onFinish: (data) => {
          metadata = data;
          console.log('📊 [Image] onFinish capturado:', data);
        }
      });

      const imageUrl = this._extractImageUrl(result);

      if (imageUrl) {
        console.log('✅ [Image] Imagem com callback gerada!');

        // Build metadata display
        let metaHtml = '<div style="background:#f5f5f5; padding:12px; border-radius:8px; margin-top:16px; text-align:left; font-size:13px">';
        metaHtml += '<strong>📊 Metadados capturados:</strong><br><br>';

        if (metadata) {
          if (metadata.inputs) {
            metaHtml += `<strong>Prompt:</strong> ${metadata.inputs.prompt || 'N/A'}<br>`;
            metaHtml += `<strong>Seed:</strong> ${metadata.inputs.seed || 'N/A'}<br>`;
            metaHtml += `<strong>Negative Prompt:</strong> ${metadata.inputs.negativePrompt || 'N/A'}<br>`;
            metaHtml += `<strong>Guidance Scale:</strong> ${metadata.inputs.guidanceScale || 'N/A'}<br>`;
          }
          if (metadata.canvas) metaHtml += `<strong>Canvas:</strong> ${metadata.canvas.width}x${metadata.canvas.height}<br>`;
          if (metadata.dataUrl) metaHtml += `<strong>Data URL:</strong> ${metadata.dataUrl.length} chars<br>`;
        } else {
          // Fallback: extract from result directly
          metaHtml += '<em>onFinish não retornou dados, extraindo do resultado:</em><br>';
          if (result.inputs) {
            metaHtml += `<strong>Prompt:</strong> ${result.inputs.prompt || 'N/A'}<br>`;
            metaHtml += `<strong>Seed:</strong> ${result.inputs.seed || 'N/A'}<br>`;
          }
          if (result.canvas) metaHtml += `<strong>Canvas:</strong> ${result.canvas.width}x${result.canvas.height}<br>`;
          if (result.dataUrl) metaHtml += `<strong>Data URL:</strong> ${result.dataUrl.length} chars<br>`;
        }
        metaHtml += '</div>';

        contentArea.innerHTML = `
          <div style="text-align:center">
            <img src="${imageUrl}" style="max-width:100%; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.3)" />
            ${metaHtml}
          </div>
          <p style="text-align:center; margin-top:12px; font-size:14px">
            <strong>✅ Seed:</strong> ${seed} |
            <strong>📊 Callback:</strong> onFinish capturado |
            <strong>📐 Resolução:</strong> 512x512
          </p>
        `;

        return { success: true, url: imageUrl, metadata: metadata || result };
      } else {
        throw new Error('Não foi possível extrair URL da imagem');
      }
    } catch (error) {
      console.error('❌ [Image] Falha no onFinish:', error.message);
      contentArea.innerHTML = `<p style="color:red">❌ Erro: ${error.message}</p>`;
      return { success: false, error: error.message };
    }
  },
  // ============================================
  // PHASE 2 TESTS
  // ============================================

  async testTagEmphasis() {
    console.log('🖼️ [Image] Testando tag emphasis...');
    const { contentArea } = this._getOrCreateContainer('🎯 Image Test - Tag Emphasis');
    contentArea.innerHTML = '<p>⏳ Gerando 4 imagens com diferentes pesos de tag...</p>';
    try {
      const basePrompt = 'papercraft dragon';
      const variations = [
        { weight: 0.5, label: '(dragon:0.5) - De-enfatizado' },
        { weight: 1.0, label: '(dragon:1.0) - Normal' },
        { weight: 1.5, label: '(dragon:1.5) - Ênfase' },
        { weight: 2.0, label: '(dragon:2.0) - Ênfase máxima' }
      ];
      const results = [];
      for (let i = 0; i < variations.length; i++) {
        const v = variations[i];
        console.log(` Gerando com peso ${v.weight}...`);
        const prompt = `${basePrompt}, (${basePrompt.split(' ')[1]}:${v.weight}), fantasy`;
        const result = await this._generateImage(prompt, {
          seed: 42424,
          size: 256,
          guidanceScale: 7
        });
        results.push({ ...result, label: v.label, weight: v.weight });
      }
      console.log(`✅ [Image] ${results.length}/4 imagens com emphasis geradas!`);
      let html = '<div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:16px; text-align:center">';
      for (const r of results) {
        const imageUrl = this._extractImageUrl(r);
        html += `
          <div>
            <img src="${imageUrl}" style="max-width:100%; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.3)" />
            <p style="margin-top:8px; font-size:13px"><strong>${r.label}</strong></p>
          </div>
        `;
      }
      html += '</div>';
      contentArea.innerHTML = html;
      return { success: true, count: results.length };
    } catch (error) {
      console.error('❌ [Image] Falha no tag emphasis:', error.message);
      contentArea.innerHTML = `<p style="color:red">❌ Erro: ${error.message}</p>`;
      return { success: false, error: error.message };
    }
  },

  async testPromptOrdering() {
    console.log('🖼️ [Image] Testando prompt ordering...');
    const { contentArea } = this._getOrCreateContainer('🔀 Image Test - Prompt Ordering');
    contentArea.innerHTML = '<p>⏳ Gerando 3 imagens com mesmas tags em ordens diferentes...</p>';
    try {
      const orders = [
        { prompt: 'papercraft dragon, fantasy landscape, detailed', label: 'Ordem 1: Dragon → Landscape' },
        { prompt: 'fantasy landscape, papercraft dragon, detailed', label: 'Ordem 2: Landscape → Dragon' },
        { prompt: 'detailed, papercraft dragon, fantasy landscape', label: 'Ordem 3: Detailed → Dragon' }
      ];
      const results = [];
      for (let i = 0; i < orders.length; i++) {
        console.log(` Gerando ordem ${i + 1}...`);
        const result = await this._generateImage(orders[i].prompt, {
          seed: 42424,
          size: 256,
          guidanceScale: 7
        });
        results.push({ ...result, label: orders[i].label });
      }
      console.log(`✅ [Image] ${results.length}/3 imagens com ordering geradas!`);
      let html = '<div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:16px; text-align:center">';
      for (const r of results) {
        const imageUrl = this._extractImageUrl(r);
        html += `
          <div>
            <img src="${imageUrl}" style="max-width:100%; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.3)" />
            <p style="margin-top:8px; font-size:12px"><strong>${r.label}</strong></p>
          </div>
        `;
      }
      html += '</div>';
      contentArea.innerHTML = html;
      return { success: true, count: results.length };
    } catch (error) {
      console.error('❌ [Image] Falha no prompt ordering:', error.message);
      contentArea.innerHTML = `<p style="color:red">❌ Erro: ${error.message}</p>`;
      return { success: false, error: error.message };
    }
  },

  async testCanvasPostProcessing() {
    console.log('🖼️ [Image] Testando canvas post-processing...');
    const { contentArea } = this._getOrCreateContainer('🎨 Image Test - Canvas Post-Processing');
    contentArea.innerHTML = '<p>⏳ Gerando imagem e aplicando filtros no canvas...</p>';
    try {
      const prompt = 'papercraft castle, fantasy, detailed';
      console.log(' Gerando imagem base...');
      const result = await this._generateImage(prompt, {
        seed: 42424,
        size: 256,
        guidanceScale: 7
      });
      const imageUrl = this._extractImageUrl(result);
      console.log('✅ [Image] Imagem base gerada, aplicando filtros...');
      // Create a canvas to apply filters
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageUrl;
      });
      canvas.width = img.width;
      canvas.height = img.height;
      // Draw original
      ctx.drawImage(img, 0, 0);
      const originalDataUrl = canvas.toDataURL();
      // Apply grayscale filter
      ctx.filter = 'grayscale(100%)';
      ctx.drawImage(img, 0, 0);
      const grayscaleDataUrl = canvas.toDataURL();
      // Apply sepia filter
      ctx.filter = 'sepia(100%)';
      ctx.drawImage(img, 0, 0);
      const sepiaDataUrl = canvas.toDataURL();
      // Apply text overlay
      ctx.filter = 'none';
      ctx.drawImage(img, 0, 0);
      ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
      ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
      ctx.fillStyle = 'white';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('TEST OVERLAY', canvas.width / 2, canvas.height - 15);
      const overlayDataUrl = canvas.toDataURL();
      console.log('✅ [Image] Filtros aplicados com sucesso!');
      contentArea.innerHTML = `
        <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:16px; text-align:center">
          <div>
            <img src="${originalDataUrl}" style="max-width:100%; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.3)" />
            <p style="margin-top:8px; font-size:13px"><strong>Original</strong></p>
          </div>
          <div>
            <img src="${grayscaleDataUrl}" style="max-width:100%; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.3)" />
            <p style="margin-top:8px; font-size:13px"><strong>Grayscale</strong></p>
          </div>
          <div>
            <img src="${sepiaDataUrl}" style="max-width:100%; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.3)" />
            <p style="margin-top:8px; font-size:13px"><strong>Sepia</strong></p>
          </div>
          <div>
            <img src="${overlayDataUrl}" style="max-width:100%; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.3)" />
            <p style="margin-top:8px; font-size:13px"><strong>Text Overlay</strong></p>
          </div>
        </div>
      `;
      return { success: true, filters: ['original', 'grayscale', 'sepia', 'overlay'] };
    } catch (error) {
      console.error('❌ [Image] Falha no canvas post-processing:', error.message);
      contentArea.innerHTML = `<p style="color:red">❌ Erro: ${error.message}</p>`;
      return { success: false, error: error.message };
    }
  },

  async testBreakKeyword() {
    console.log('🖼️ [Image] Testando BREAK keyword...');
    const { contentArea } = this._getOrCreateContainer('⚡ Image Test - BREAK Keyword');
    contentArea.innerHTML = '<p>⏳ Gerando 2 imagens: com e sem BREAK...</p>';
    try {
      const promptWithoutBreak = 'papercraft dragon, fantasy landscape, detailed, high quality';
      const promptWithBreak = 'papercraft dragon BREAK fantasy landscape, detailed, high quality';
      console.log(' Gerando SEM BREAK...');
      const result1 = await this._generateImage(promptWithoutBreak, {
        seed: 42424,
        size: 256,
        guidanceScale: 7
      });
      console.log(' Gerando COM BREAK...');
      const result2 = await this._generateImage(promptWithBreak, {
        seed: 42424,
        size: 256,
        guidanceScale: 7
      });
      console.log('✅ [Image] Imagens com BREAK geradas!');
      const url1 = this._extractImageUrl(result1);
      const url2 = this._extractImageUrl(result2);
      contentArea.innerHTML = `
        <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:16px; text-align:center">
          <div>
            <img src="${url1}" style="max-width:100%; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.3)" />
            <p style="margin-top:8px; font-size:13px"><strong>Sem BREAK</strong><br><code style="font-size:11px">${promptWithoutBreak}</code></p>
          </div>
          <div>
            <img src="${url2}" style="max-width:100%; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.3)" />
            <p style="margin-top:8px; font-size:13px"><strong>Com BREAK</strong><br><code style="font-size:11px">${promptWithBreak}</code></p>
          </div>
        </div>
        <p style="text-align:center; margin-top:16px; font-size:12px; color:#666">
          BREAK força separação de chunks de 75 tokens, permitindo prompts mais complexos sem diluição.
        </p>
      `;
      return { success: true, count: 2 };
    } catch (error) {
      console.error('❌ [Image] Falha no BREAK keyword:', error.message);
      contentArea.innerHTML = `<p style="color:red">❌ Erro: ${error.message}</p>`;
      return { success: false, error: error.message };
    }
  },


  // ===== TESTE 10: Tag Blending =====
  async testTagBlending(contentArea) {
    console.log('🖼️ [Image] Testando tag blending...');
    try {
      const blends = [
        { name: '0% (100% cyberpunk)', prompt: 'papercraft cat [cyberpunk:steampunk:0]', desc: '100% cyberpunk' },
        { name: '50% (50/50)', prompt: 'papercraft cat [cyberpunk:steampunk:0.5]', desc: '50% cyberpunk + 50% steampunk' },
        { name: '100% (100% steampunk)', prompt: 'papercraft cat [cyberpunk:steampunk:1]', desc: '100% steampunk' }
      ];
      
      const results = [];
      for (let i = 0; i < blends.length; i++) {
        console.log(` Gerando blend ${i+1}: ${blends[i].desc}...`);
        const result = await this._generateImage(blends[i].prompt, {
          seed: 42424,
          size: 256
        });
        results.push({ ...blends[i], url: this._extractImageUrl(result) });
      }
      
      console.log('✅ [Image] Blends gerados!');
      contentArea.innerHTML = `
        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:12px; text-align:center">
          ${results.map(r => `
            <div>
              <img src="${r.url}" style="max-width:100%; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.3)" />
              <p style="margin-top:8px; font-size:12px"><strong>${r.name}</strong><br><code style="font-size:10px">${r.prompt}</code></p>
            </div>
          `).join('')}
        </div>
        <p style="text-align:center; margin-top:16px; font-size:12px; color:#666">
          Tag blending mistura dois estilos: <code>[from:to:ratio]</code> onde ratio vai de 0 (100% from) a 1 (100% to).
        </p>
      `;
      return { success: true, count: results.length };
    } catch (error) {
      console.error('❌ [Image] Falha no tag blending:', error.message);
      contentArea.innerHTML = `<p style="color:red">❌ Erro: ${error.message}</p>`;
      return { success: false, error: error.message };
    }
  },

  // ===== TESTE 11: Multi-Image Grid =====
  async testMultiImageGrid(contentArea) {
    console.log('🖼️ [Image] Testando multi-image grid...');
    try {
      const prompts = [
        'papercraft dragon, fire, detailed',
        'papercraft unicorn, rainbow, magical',
        'papercraft robot, futuristic, metal',
        'papercraft owl, mystical, forest'
      ];
      
      console.log(` Gerando ${prompts.length} imagens simultaneamente...`);
      const promises = prompts.map((prompt, i) => 
        this._generateImage(prompt, { seed: 42424 + i, size: 256 })
      );
      const results = await Promise.all(promises);
      
      console.log('✅ [Image] Grid gerado!');
      contentArea.innerHTML = `
        <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:12px; text-align:center">
          ${results.map((result, i) => `
            <div>
              <img src="${this._extractImageUrl(result)}" style="max-width:100%; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.3)" />
              <p style="margin-top:8px; font-size:11px"><code>${prompts[i]}</code></p>
            </div>
          `).join('')}
        </div>
        <p style="text-align:center; margin-top:16px; font-size:12px; color:#666">
          Geração paralela de múltiplas imagens usando <code>Promise.all()</code> para eficiência.
        </p>
      `;
      return { success: true, count: results.length };
    } catch (error) {
      console.error('❌ [Image] Falha no multi-image grid:', error.message);
      contentArea.innerHTML = `<p style="color:red">❌ Erro: ${error.message}</p>`;
      return { success: false, error: error.message };
    }
  },

  // ===== TESTE 12: Alternating Tags =====
  async testAlternatingTags(contentArea) {
    console.log('🖼️ [Image] Testando alternating tags...');
    try {
      const tests = [
        { name: 'Sem alternância', prompt: 'papercraft cat, blue, simple', desc: 'Prompt normal' },
        { name: 'Alternando blue|red', prompt: 'papercraft cat [blue|red], simple', desc: 'Alterna blue/red a cada step' },
        { name: '3-way alternation', prompt: 'papercraft cat [blue|red|green], simple', desc: 'Ciclo blue→red→green' }
      ];
      
      const results = [];
      for (let i = 0; i < tests.length; i++) {
        console.log(` Gerando ${i+1}: ${tests[i].name}...`);
        const result = await this._generateImage(tests[i].prompt, {
          seed: 42424,
          size: 256
        });
        results.push({ ...tests[i], url: this._extractImageUrl(result) });
      }
      
      console.log('✅ [Image] Alternating tags gerados!');
      contentArea.innerHTML = `
        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:12px; text-align:center">
          ${results.map(r => `
            <div>
              <img src="${r.url}" style="max-width:100%; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.3)" />
              <p style="margin-top:8px; font-size:12px"><strong>${r.name}</strong><br><code style="font-size:10px">${r.prompt}</code></p>
            </div>
          `).join('')}
        </div>
        <p style="text-align:center; margin-top:16px; font-size:12px; color:#666">
          Alternating tags <code>[tag1|tag2]</code> alternam entre tags a cada step de geração, criando misturas únicas.
        </p>
      `;
      return { success: true, count: results.length };
    } catch (error) {
      console.error('❌ [Image] Falha nos alternating tags:', error.message);
      contentArea.innerHTML = `<p style="color:red">❌ Erro: ${error.message}</p>`;
      return { success: false, error: error.message };
    }
  },

  // ===== TESTE 13: Add/Remove During Generation =====
  async testAddRemoveDuringGen(contentArea) {
    console.log('🖼️ [Image] Testando add/remove during generation...');
    try {
      const tests = [
        { name: 'Sem modificação', prompt: 'papercraft cat, simple', desc: 'Prompt normal' },
        { name: 'Adiciona wings em 50%', prompt: 'papercraft cat [with wings:0.5], simple', desc: 'Adiciona "with wings" após 50% dos steps' },
        { name: 'Remove tail em 50%', prompt: 'papercraft cat with tail [with tail::0.5], simple', desc: 'Remove "with tail" após 50% dos steps' }
      ];
      
      const results = [];
      for (let i = 0; i < tests.length; i++) {
        console.log(` Gerando ${i+1}: ${tests[i].name}...`);
        const result = await this._generateImage(tests[i].prompt, {
          seed: 42424,
          size: 256
        });
        results.push({ ...tests[i], url: this._extractImageUrl(result) });
      }
      
      console.log('✅ [Image] Add/remove during generation gerados!');
      contentArea.innerHTML = `
        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:12px; text-align:center">
          ${results.map(r => `
            <div>
              <img src="${r.url}" style="max-width:100%; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.3)" />
              <p style="margin-top:8px; font-size:12px"><strong>${r.name}</strong><br><code style="font-size:10px">${r.prompt}</code></p>
            </div>
          `).join('')}
        </div>
        <p style="text-align:center; margin-top:16px; font-size:12px; color:#666">
          <code>[to:when]</code> adiciona tags após X% dos steps. <code>[from::when]</code> remove tags após X% dos steps.
        </p>
      `;
      return { success: true, count: results.length };
    } catch (error) {
      console.error('❌ [Image] Falha no add/remove during generation:', error.message);
      contentArea.innerHTML = `<p style="color:red">❌ Erro: ${error.message}</p>`;
      return { success: false, error: error.message };
    }
  },


  // Fecha o container
  close() {
    if (currentContainer) {
      currentContainer.close();
      currentContainer = null;
      console.log('🗑️ [Image] Container fechado manualmente');
    }
  }
};

// Inicialização
console.log('🖼️ [Image] Inicializando teste do plugin de imagem...');
if (imageTest.available) {
  console.log('✅ [Image] Plugin text-to-image-plugin disponível');
} else {
  console.warn('⚠️ [Image] Plugin text-to-image-plugin NÃO disponível');
  console.warn(' Adicione no List Panel: image = {import:text-to-image-plugin}');
}
