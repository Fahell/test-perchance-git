/**
 * Módulo de teste para o plugin text-to-image-plugin do Perchance
 * Testa: geração de imagem, seed, removeBackground, negativePrompt, resolução
 * @version 1.4.0
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

    const strValue = result.toString ? result.toString() : String(result);
    if (strValue && strValue.startsWith('data:image/')) return strValue;

    if (typeof result === 'string' && result.startsWith('data:image/')) return result;

    return null;
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
    contentArea.innerHTML = '<div style="text-align:center;padding:20px;color:#aaa;">⏳ Gerando imagem...</div>';

    try {
      const result = await root.image(
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
          <div style="text-align:center;">
            <img src="${imageUrl}" style="max-width:100%;height:auto;border:1px solid #404040;border-radius:4px;" />
            <div style="margin-top:15px;color:#aaa;font-size:11px;">
              <strong>✅ Seed:</strong> 12345 |
              <strong>📐 Resolução:</strong> 512x512 |
              <strong>📏 Tamanho:</strong> ${(imageUrl.length / 1024).toFixed(1)}KB
            </div>
          </div>
        `;

        return { success: true, url: imageUrl, seed: 12345 };
      } else {
        throw new Error('Não foi possível extrair URL da imagem');
      }
    } catch (error) {
      console.error('❌ [Image] Falha na geração:', error.message);
      contentArea.innerHTML = `<div style="color:#ff6b6b;padding:20px;">❌ Erro: ${error.message}</div>`;
      return { success: false, error: error.message };
    }
  },

  // Teste 2: Remove background (fundo transparente)
  async testRemoveBackground() {
    console.log('🖼️ [Image] Testando removeBackground...');

    const { contentArea } = this._getOrCreateContainer('🔍 Image Test - Remove Background');
    contentArea.innerHTML = '<div style="text-align:center;padding:20px;color:#aaa;">⏳ Gerando imagem sem fundo...</div>';

    try {
      const result = await root.image(
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
          <div style="text-align:center;">
            <div style="display:inline-block;padding:20px;background:repeating-conic-gradient(#808080 0% 25%, transparent 0% 50%) 50% / 20px 20px;">
              <img src="${imageUrl}" style="max-width:400px;height:auto;" />
            </div>
            <div style="margin-top:15px;color:#aaa;font-size:11px;">
              <strong>✅ Seed:</strong> 54321 |
              <strong>🔍 RemoveBackground:</strong> true |
              <strong>🎨 Fundo:</strong> transparente (quadriculado)
            </div>
          </div>
        `;

        return { success: true, url: imageUrl, transparent: true };
      } else {
        throw new Error('Não foi possível extrair URL da imagem');
      }
    } catch (error) {
      console.error('❌ [Image] Falha:', error.message);
      contentArea.innerHTML = `<div style="color:#ff6b6b;padding:20px;">❌ Erro: ${error.message}</div>`;
      return { success: false, error: error.message };
    }
  },

  // Teste 3: Comparação de seeds diferentes
  async testSeedComparison() {
    console.log('🖼️ [Image] Comparando seeds diferentes...');

    const { contentArea } = this._getOrCreateContainer('🎲 Image Test - Seed Comparison');
    contentArea.innerHTML = '<div style="text-align:center;padding:20px;color:#aaa;">⏳ Gerando 2 imagens com seeds diferentes...</div>';

    try {
      const seed1 = 11111;
      const seed2 = 99999;
      const prompt = 'papercraft dragon, fantasy style';

      console.log(` Gerando com seed ${seed1}...`);
      const result1 = await root.image(prompt, { seed: seed1, resolution: '256x256' });

      console.log(` Gerando com seed ${seed2}...`);
      const result2 = await root.image(prompt, { seed: seed2, resolution: '256x256' });

      const url1 = this._extractImageUrl(result1);
      const url2 = this._extractImageUrl(result2);

      if (url1 && url2) {
        console.log('✅ [Image] Ambas imagens geradas!');

        contentArea.innerHTML = `
          <div style="text-align:center;">
            <div style="display:flex;gap:20px;justify-content:center;align-items:center;">
              <div style="text-align:center;">
                <img src="${url1}" style="max-width:256px;height:auto;border:1px solid #404040;" />
                <div style="margin-top:5px;color:#aaa;font-size:11px;">Seed: ${seed1}</div>
              </div>
              <div style="color:#4ade80;font-size:24px;font-weight:bold;">vs</div>
              <div style="text-align:center;">
                <img src="${url2}" style="max-width:256px;height:auto;border:1px solid #404040;" />
                <div style="margin-top:5px;color:#aaa;font-size:11px;">Seed: ${seed2}</div>
              </div>
            </div>
            <div style="margin-top:15px;color:#aaa;font-size:11px;">
              <strong>✅ Mesma prompt,</strong> seeds diferentes |
              <strong>📐 Resolução:</strong> 256x256 cada
            </div>
          </div>
        `;

        return { success: true, images: [url1, url2], seeds: [seed1, seed2] };
      } else {
        throw new Error('Falha ao gerar uma ou ambas imagens');
      }
    } catch (error) {
      console.error('❌ [Image] Falha na comparação:', error.message);
      contentArea.innerHTML = `<div style="color:#ff6b6b;padding:20px;">❌ Erro: ${error.message}</div>`;
      return { success: false, error: error.message };
    }
  },

  // Teste 4: Diferentes resoluções
  async testResolution() {
    console.log('🖼️ [Image] Testando resolução customizada...');

    const { contentArea } = this._getOrCreateContainer('📐 Image Test - Custom Resolution');
    contentArea.innerHTML = '<div style="text-align:center;padding:20px;color:#aaa;">⏳ Gerando imagem 768x384...</div>';

    try {
      const result = await root.image(
        'papercraft landscape, wide view',
        {
          seed: 77777,
          resolution: '768x384',
          negativePrompt: 'portrait, vertical'
        }
      );

      const imageUrl = this._extractImageUrl(result);

      if (imageUrl) {
        console.log('✅ [Image] Imagem wide gerada!');

        contentArea.innerHTML = `
          <div style="text-align:center;">
            <img src="${imageUrl}" style="max-width:100%;height:auto;border:1px solid #404040;border-radius:4px;" />
            <div style="margin-top:15px;color:#aaa;font-size:11px;">
              <strong>✅ Seed:</strong> 77777 |
              <strong>📐 Resolução:</strong> 768x384 (16:9) |
              <strong>🎨 Formato:</strong> wide/landscape
            </div>
          </div>
        `;

        return { success: true, url: imageUrl, resolution: '768x384' };
      } else {
        throw new Error('Não foi possível extrair URL da imagem');
      }
    } catch (error) {
      console.error('❌ [Image] Falha:', error.message);
      contentArea.innerHTML = `<div style="color:#ff6b6b;padding:20px;">❌ Erro: ${error.message}</div>`;
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
