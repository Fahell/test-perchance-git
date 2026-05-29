/**
 * Módulo de teste para o plugin text-to-image-plugin do Perchance
 * Testa: geração de imagem, seed, removeBackground, negativePrompt, resolução
 * @version 1.3.0
 */

import { root } from '../perchance-bridge.js';
import { showVisual, showText, clearVisual } from './output-area.js';

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

  // Teste 1: Geração básica com seed fixa
  async testBasicImage() {
    console.log('🖼️ [Image] Gerando imagem básica com seed fixa...');
    
    showText('⏳ Gerando imagem...');
    
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
        console.log('   Data URL length:', imageUrl.length, 'chars');
        console.log('   Tipo do resultado:', typeof result, result.constructor.name);
        
        const imgHtml = `
          <img src="${imageUrl}" style="
            max-width: 100%;
            max-height: 300px;
            object-fit: contain;
            image-rendering: pixelated;
            border-radius: 4px;
          " />
        `;
        showVisual(imgHtml, '🖼️ Imagem Gerada');
        
        const infoHtml = `
          <strong>✅ Seed:</strong> 12345<br>
          <strong>📐 Resolução:</strong> 512x512<br>
          <strong>📏 Tamanho:</strong> ${(imageUrl.length / 1024).toFixed(1)}KB
        `;
        showText(infoHtml);
        
        return { success: true, url: imageUrl, seed: 12345 };
      } else {
        throw new Error('Não foi possível extrair URL da imagem');
      }
    } catch (error) {
      console.error('❌ [Image] Falha na geração:', error.message);
      showText(`<span style="color: #ff6b6b;">❌ Erro: ${error.message}</span>`);
      return { success: false, error: error.message };
    }
  },

  // Teste 2: Remove background (fundo transparente)
  async testRemoveBackground() {
    console.log('🖼️ [Image] Testando removeBackground...');
    
    showText('⏳ Gerando imagem sem fundo...');
    
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
        
        const imgHtml = `
          <div style="
            background: 
              linear-gradient(45deg, #333 25%, transparent 25%),
              linear-gradient(-45deg, #333 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, #333 75%),
              linear-gradient(-45deg, transparent 75%, #333 75%);
            background-size: 20px 20px;
            background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
            padding: 10px;
            border-radius: 4px;
            display: inline-block;
          ">
            <img src="${imageUrl}" style="
              max-width: 100%;
              max-height: 300px;
              object-fit: contain;
              image-rendering: pixelated;
            " />
          </div>
        `;
        showVisual(imgHtml, '🔍 Imagem Sem Fundo');
        
        const infoHtml = `
          <strong>✅ Seed:</strong> 54321<br>
          <strong>🔍 RemoveBackground:</strong> true<br>
          <strong>🎨 Fundo:</strong> transparente (quadriculado)
        `;
        showText(infoHtml);
        
        return { success: true, url: imageUrl, transparent: true };
      } else {
        throw new Error('Não foi possível extrair URL da imagem');
      }
    } catch (error) {
      console.error('❌ [Image] Falha:', error.message);
      showText(`<span style="color: #ff6b6b;">❌ Erro: ${error.message}</span>`);
      return { success: false, error: error.message };
    }
  },

  // Teste 3: Comparação de seeds diferentes
  async testSeedComparison() {
    console.log('🖼️ [Image] Comparando seeds diferentes...');
    
    showText('⏳ Gerando 2 imagens com seeds diferentes...');
    
    try {
      const seed1 = 11111;
      const seed2 = 99999;
      const prompt = 'papercraft dragon, fantasy style';
      
      console.log(`   Gerando com seed ${seed1}...`);
      const result1 = await root.image(prompt, { seed: seed1, resolution: '256x256' });
      
      console.log(`   Gerando com seed ${seed2}...`);
      const result2 = await root.image(prompt, { seed: seed2, resolution: '256x256' });
      
      const url1 = this._extractImageUrl(result1);
      const url2 = this._extractImageUrl(result2);
      
      if (url1 && url2) {
        console.log('✅ [Image] Ambas imagens geradas!');
        
        const imgHtml = `
          <div style="display: flex; gap: 10px; align-items: center; justify-content: center;">
            <div style="text-align: center;">
              <img src="${url1}" style="
                width: 150px;
                height: 150px;
                object-fit: contain;
                border: 2px solid #4ade80;
                border-radius: 4px;
              " />
              <div style="color: #4ade80; font-size: 11px; margin-top: 5px;">Seed: ${seed1}</div>
            </div>
            <div style="color: #888; font-size: 20px;">vs</div>
            <div style="text-align: center;">
              <img src="${url2}" style="
                width: 150px;
                height: 150px;
                object-fit: contain;
                border: 2px solid #4ade80;
                border-radius: 4px;
              " />
              <div style="color: #4ade80; font-size: 11px; margin-top: 5px;">Seed: ${seed2}</div>
            </div>
          </div>
        `;
        showVisual(imgHtml, '🎲 Comparação de Seeds');
        
        const infoHtml = `
          <strong>✅ Mesma prompt,</strong> seeds diferentes<br>
          <strong>📐 Resolução:</strong> 256x256 cada
        `;
        showText(infoHtml);
        
        return { success: true, images: [url1, url2], seeds: [seed1, seed2] };
      } else {
        throw new Error('Falha ao gerar uma ou ambas imagens');
      }
    } catch (error) {
      console.error('❌ [Image] Falha na comparação:', error.message);
      showText(`<span style="color: #ff6b6b;">❌ Erro: ${error.message}</span>`);
      return { success: false, error: error.message };
    }
  },

  // Teste 4: Diferentes resoluções
  async testResolution() {
    console.log('🖼️ [Image] Testando resolução customizada...');
    
    showText('⏳ Gerando imagem 768x384...');
    
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
        
        const imgHtml = `
          <img src="${imageUrl}" style="
            max-width: 100%;
            max-height: 300px;
            object-fit: contain;
            image-rendering: pixelated;
            border-radius: 4px;
          " />
        `;
        showVisual(imgHtml, '📐 Resolução Customizada');
        
        const infoHtml = `
          <strong>✅ Seed:</strong> 77777<br>
          <strong>📐 Resolução:</strong> 768x384 (16:9)<br>
          <strong>🎨 Formato:</strong> wide/landscape
        `;
        showText(infoHtml);
        
        return { success: true, url: imageUrl, resolution: '768x384' };
      } else {
        throw new Error('Não foi possível extrair URL da imagem');
      }
    } catch (error) {
      console.error('❌ [Image] Falha:', error.message);
      showText(`<span style="color: #ff6b6b;">❌ Erro: ${error.message}</span>`);
      return { success: false, error: error.message };
    }
  },

  // Limpa o conteúdo visual
  clear() {
    clearVisual();
    console.log('🗑️ [Image] Preview de imagem limpo');
  }
};

// Inicialização
console.log('🖼️ [Image] Inicializando teste do plugin de imagem...');
if (imageTest.available) {
  console.log('✅ [Image] Plugin text-to-image-plugin disponível');
} else {
  console.warn('⚠️ [Image] Plugin text-to-image-plugin NÃO disponível');
  console.warn('   Adicione no List Panel: image = {import:text-to-image-plugin}');
}
