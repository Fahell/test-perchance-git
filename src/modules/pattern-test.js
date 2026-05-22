/**
 * Módulo de teste para o plugin pattern-maker-plugin do Perchance
 * Testa: geração de padrões procedurais baseados em imagem de entrada
 * @version 1.2.0
 */

import { root } from 'https://cdn.jsdelivr.net/gh/Fahell/test-perchance-git@v1.2.3/src/perchance-bridge.js';

export const patternTest = {
  available: !!root.pattern,
  containerId: 'pattern-preview-container',
  
  // Cria ou retorna o container de preview
  _getOrCreateContainer() {
    let container = document.getElementById(this.containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = this.containerId;
      container.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        width: 400px;
        background: rgba(0, 0, 0, 0.9);
        border: 2px solid #a78bfa;
        border-radius: 12px;
        padding: 15px;
        font-family: monospace;
        font-size: 12px;
        color: white;
        z-index: 9998;
        box-shadow: 0 4px 20px rgba(167, 139, 250, 0.3);
      `;
      container.innerHTML = `
        <h3 style="margin: 0 0 10px 0; color: #a78bfa; font-size: 14px;">🎨 Pattern Maker Preview</h3>
        <div id="pattern-preview-area" style="
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
          <span style="color: #666;">Nenhum padrão gerado</span>
        </div>
        <div id="pattern-info" style="color: #aaa; font-size: 11px;">
          Aguardando geração...
        </div>
      `;
      document.body.appendChild(container);
    }
    return container;
  },

  // Atualiza o preview com o padrão gerado
  _updatePreview(imageUrl, info) {
    const previewArea = document.getElementById('pattern-preview-area');
    const infoDiv = document.getElementById('pattern-info');
    
    if (imageUrl) {
      previewArea.innerHTML = `<img src="${imageUrl}" style="
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      " />`;
      infoDiv.innerHTML = info || '✅ Padrão gerado com sucesso!';
    } else {
      previewArea.innerHTML = '<span style="color: #ff6b6b;">❌ Falha na geração</span>';
      infoDiv.innerHTML = info || 'Erro ao gerar padrão';
    }
  },

  // Teste 1: Gerar padrão simples
  async generateBasicPattern() {
    console.log('🎨 [Pattern] Gerando padrão básico...');
    
    this._getOrCreateContainer();
    this._updatePreview(null, '⏳ Gerando padrão...');
    
    try {
      // Nota: O plugin pattern-maker requer uma imagem de entrada
      // Para teste, vamos usar um canvas simples como fonte
      const sourceCanvas = document.createElement('canvas');
      sourceCanvas.width = 64;
      sourceCanvas.height = 64;
      const ctx = sourceCanvas.getContext('2d');
      
      // Desenha um padrão simples na fonte
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(0, 0, 32, 32);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(32, 0, 32, 32);
      ctx.fillStyle = '#f87171';
      ctx.fillRect(0, 32, 32, 32);
      ctx.fillStyle = '#60a5fa';
      ctx.fillRect(32, 32, 32, 32);
      
      const sourceDataUrl = sourceCanvas.toDataURL();
      
      const result = await root.pattern({
        source: sourceDataUrl,
        seed: 12345
      });
      
      if (result) {
        const imageUrl = typeof result === 'string' ? result : result.dataUrl || result.src;
        
        if (imageUrl) {
          console.log('✅ [Pattern] Padrão gerado com sucesso!');
          this._updatePreview(imageUrl, `
            ✅ Seed: 12345<br>
            📐 Fonte: 64x64 canvas<br>
            🎨 Padrão procedural gerado
          `);
          return { success: true, url: imageUrl };
        }
      }
      
      throw new Error('Não foi possível gerar o padrão');
    } catch (error) {
      console.error('❌ [Pattern] Falha:', error.message);
      this._updatePreview(null, `❌ Erro: ${error.message}`);
      return { success: false, error: error.message };
    }
  },

  // Teste 2: Padrão com seed diferente
  async generatePatternWithSeed(seed) {
    console.log(`🎨 [Pattern] Gerando padrão com seed ${seed}...`);
    
    this._getOrCreateContainer();
    this._updatePreview(null, `⏳ Gerando padrão com seed ${seed}...`);
    
    try {
      const sourceCanvas = document.createElement('canvas');
      sourceCanvas.width = 32;
      sourceCanvas.height = 32;
      const ctx = sourceCanvas.getContext('2d');
      
      // Padrão xadrez
      for (let i = 0; i < 32; i += 8) {
        for (let j = 0; j < 32; j += 8) {
          ctx.fillStyle = ((i + j) / 8) % 2 === 0 ? '#333' : '#666';
          ctx.fillRect(i, j, 8, 8);
        }
      }
      
      const sourceDataUrl = sourceCanvas.toDataURL();
      
      const result = await root.pattern({
        source: sourceDataUrl,
        seed: seed
      });
      
      if (result) {
        const imageUrl = typeof result === 'string' ? result : result.dataUrl || result.src;
        
        if (imageUrl) {
          console.log(`✅ [Pattern] Padrão com seed ${seed} gerado!`);
          this._updatePreview(imageUrl, `
            ✅ Seed: ${seed}<br>
            📐 Fonte: 32x32 xadrez<br>
            🎨 Variação procedural
          `);
          return { success: true, url: imageUrl, seed: seed };
        }
      }
      
      throw new Error('Não foi possível gerar o padrão');
    } catch (error) {
      console.error('❌ [Pattern] Falha:', error.message);
      this._updatePreview(null, `❌ Erro: ${error.message}`);
      return { success: false, error: error.message };
    }
  },

  // Limpa o container
  clear() {
    const container = document.getElementById(this.containerId);
    if (container) {
      container.remove();
      console.log('🗑️ [Pattern] Container de preview removido');
    }
  }
};

// Inicialização
console.log('🎨 [Pattern] Inicializando teste do plugin pattern-maker...');
if (patternTest.available) {
  console.log('✅ [Pattern] Plugin pattern-maker-plugin disponível');
} else {
  console.warn('⚠️ [Pattern] Plugin pattern-maker-plugin NÃO disponível');
  console.warn('   Adicione no List Panel: pattern = {import:pattern-maker-plugin}');
}
