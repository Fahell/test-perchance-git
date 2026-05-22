/**
 * Módulo de teste para o plugin text-to-image-plugin do Perchance
 * Testa: geração de imagem, seed, removeBackground, negativePrompt, resolução
 * @version 1.2.0
 */

import { root } from 'https://cdn.jsdelivr.net/gh/Fahell/test-perchance-git@v1.2.3/src/perchance-bridge.js';

export const imageTest = {
  available: !!root.image,
  containerId: 'image-preview-container',
  
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

  // Cria ou retorna o container de preview
  _getOrCreateContainer() {
    let container = document.getElementById(this.containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = this.containerId;
      container.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 320px;
        background: rgba(0, 0, 0, 0.9);
        border: 2px solid #4ade80;
        border-radius: 12px;
        padding: 15px;
        font-family: monospace;
        font-size: 12px;
        color: white;
        z-index: 9998;
        box-shadow: 0 4px 20px rgba(0, 255, 0, 0.3);
      `;
      container.innerHTML = `
        <h3 style="margin: 0 0 10px 0; color: #4ade80; font-size: 14px;">🖼️ Preview de Imagem</h3>
        <div id="image-preview-area" style="
          width: 100%;
          height: 200px;
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          margin-bottom: 10px;
        ">
          <span style="color: #666;">Nenhuma imagem gerada</span>
        </div>
        <div id="image-info" style="color: #aaa; font-size: 11px;">
          Aguardando geração...
        </div>
      `;
      document.body.appendChild(container);
    }
    return container;
  },

  // Atualiza o preview com a imagem gerada
  _updatePreview(imageUrl, info) {
    const previewArea = document.getElementById('image-preview-area');
    const infoDiv = document.getElementById('image-info');
    
    if (imageUrl) {
      previewArea.innerHTML = `<img src="${imageUrl}" style="
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
        image-rendering: pixelated;
      " />`;
      infoDiv.innerHTML = info || '✅ Imagem gerada com sucesso!';
    } else {
      previewArea.innerHTML = '<span style="color: #ff6b6b;">❌ Falha na geração</span>';
      infoDiv.innerHTML = info || 'Erro ao gerar imagem';
    }
  },

  // Teste 1: Geração básica com seed fixa
  async testBasicImage() {
    console.log('🖼️ [Image] Gerando imagem básica com seed fixa...');
    
    this._getOrCreateContainer();
    this._updatePreview(null, '⏳ Gerando imagem...');
    
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
        
        this._updatePreview(imageUrl, `
          ✅ Seed: 12345<br>
          📐 Resolução: 512x512<br>
          📏 Tamanho: ${(imageUrl.length / 1024).toFixed(1)}KB
        `);
        
        return { success: true, url: imageUrl, seed: 12345 };
      } else {
        throw new Error('Não foi possível extrair URL da imagem');
      }
    } catch (error) {
      console.error('❌ [Image] Falha na geração:', error.message);
      this._updatePreview(null, `❌ Erro: ${error.message}`);
      return { success: false, error: error.message };
    }
  },

  // Teste 2: Remove background (fundo transparente)
  async testRemoveBackground() {
    console.log('🖼️ [Image] Testando removeBackground...');
    
    this._getOrCreateContainer();
    this._updatePreview(null, '⏳ Gerando imagem sem fundo...');
    
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
        
        // Aplica fundo quadriculado para demonstrar transparência
        const previewArea = document.getElementById('image-preview-area');
        previewArea.style.background = `
          linear-gradient(45deg, #333 25%, transparent 25%),
          linear-gradient(-45deg, #333 25%, transparent 25%),
          linear-gradient(45deg, transparent 75%, #333 75%),
          linear-gradient(-45deg, transparent 75%, #333 75%)
        `;
        previewArea.style.backgroundSize = '20px 20px';
        previewArea.style.backgroundPosition = '0 0, 0 10px, 10px -10px, -10px 0px';
        
        this._updatePreview(imageUrl, `
          ✅ Seed: 54321<br>
          🔍 RemoveBackground: true<br>
          🎨 Fundo transparente (quadriculado)
        `);
        
        return { success: true, url: imageUrl, transparent: true };
      } else {
        throw new Error('Não foi possível extrair URL da imagem');
      }
    } catch (error) {
      console.error('❌ [Image] Falha:', error.message);
      this._updatePreview(null, `❌ Erro: ${error.message}`);
      return { success: false, error: error.message };
    }
  },

  // Teste 3: Comparação de seeds diferentes
  async testSeedComparison() {
    console.log('🖼️ [Image] Comparando seeds diferentes...');
    
    this._getOrCreateContainer();
    this._updatePreview(null, '⏳ Gerando 2 imagens com seeds diferentes...');
    
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
        
        const previewArea = document.getElementById('image-preview-area');
        previewArea.style.height = '250px';
        previewArea.innerHTML = `
          <div style="display: flex; gap: 5px; align-items: center; justify-content: center;">
            <div style="text-align: center;">
              <img src="${url1}" style="width: 120px; height: 120px; object-fit: contain;" />
              <div style="color: #4ade80; font-size: 10px; margin-top: 5px;">Seed: ${seed1}</div>
            </div>
            <div style="color: #666; font-size: 18px;">vs</div>
            <div style="text-align: center;">
              <img src="${url2}" style="width: 120px; height: 120px; object-fit: contain;" />
              <div style="color: #4ade80; font-size: 10px; margin-top: 5px;">Seed: ${seed2}</div>
            </div>
          </div>
        `;
        
        document.getElementById('image-info').innerHTML = `
          ✅ Mesma prompt, seeds diferentes<br>
          📐 Resolução: 256x256 cada
        `;
        
        return { success: true, images: [url1, url2], seeds: [seed1, seed2] };
      } else {
        throw new Error('Falha ao gerar uma ou ambas imagens');
      }
    } catch (error) {
      console.error('❌ [Image] Falha na comparação:', error.message);
      this._updatePreview(null, `❌ Erro: ${error.message}`);
      return { success: false, error: error.message };
    }
  },

  // Teste 4: Diferentes resoluções
  async testResolution() {
    console.log('🖼️ [Image] Testando resolução customizada...');
    
    this._getOrCreateContainer();
    this._updatePreview(null, '⏳ Gerando imagem 768x384...');
    
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
        
        const previewArea = document.getElementById('image-preview-area');
        previewArea.style.height = '180px';
        
        this._updatePreview(imageUrl, `
          ✅ Seed: 77777<br>
          📐 Resolução: 768x384 (16:9)<br>
          🎨 Formato wide/landscape
        `);
        
        return { success: true, url: imageUrl, resolution: '768x384' };
      } else {
        throw new Error('Não foi possível extrair URL da imagem');
      }
    } catch (error) {
      console.error('❌ [Image] Falha:', error.message);
      this._updatePreview(null, `❌ Erro: ${error.message}`);
      return { success: false, error: error.message };
    }
  },

  // Limpa o container
  clear() {
    const container = document.getElementById(this.containerId);
    if (container) {
      container.remove();
      console.log('🗑️ [Image] Container de preview removido');
    }
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
