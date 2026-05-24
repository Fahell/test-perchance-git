// src/modules/pattern-test.js
// Testa o plugin pattern-maker-plugin do Perchance (Wave Function Collapse)
// Documentação: https://perchance.org/pattern-maker-plugin
import { root } from 'https://cdn.jsdelivr.net/gh/Fahell/test-perchance-git@v1.2.5/src/perchance-bridge.js';

const hasDOM = typeof document !== 'undefined' && !!document.body;

export const patternTest = {
  available: !!root.pattern,

  // Teste 1: Gerar padrão com grid de emojis
  generateEmojiPattern() {
    if (!this.available) {
      console.warn('⚠️ [Pattern] Plugin pattern-maker-plugin não disponível');
      return null;
    }

    try {
      console.log('🎨 [Pattern] Gerando padrão com grid de emojis...');
      
      const patternOptions = {
        inputTextGrid: [
          '🌳🟩🟩🟩🌲🟩🟩🟩🟩🟩🟩🌾',
          '🟩🟩🟩🟦🟩🟩🟩🔲🔲🔲🔲🟩',
          '🟩🟦🟦🟦🟩🟩🟩🔲🏫🪑🔲🟩',
          '🟩🟦🟦🟦🌲🌷🌷🔲🏫🏫🔲🟩',
          '🟩🟩🟦🟦🟩🟩🟩🔲🚪🔲🔲🟩',
          '🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩',
          '🟩🌳🌳🟩🟩🟩🟩🟩🟩🟩🟩',
          '🟩🟩🌳🟦🟦🟦🟩🟩🌷🟩🟦🟦',
          '🟩🌳🟦🟦🟦🟩🟩🪨🟩🟩🟦🟩',
          '🌾🟩🟦🟦🟦🟩🟩🌳🟦🟦🟦🟩',
          '🟩🟩🟦🟦🟦🟦🟦🟦🟦🌳🟩🟩'
        ],
        settings: {
          width: 30,
          height: 30,
          n: 3,
          symmetry: 8,
          magnify: 0.6
        }
      };

      const result = root.pattern(patternOptions);
      
      console.log('✅ [Pattern] Padrão gerado com sucesso!');
      console.log('   Tipo do resultado:', typeof result);
      
      if (typeof result === 'string') {
        console.log('   Tamanho:', result.length, 'caracteres');
        
        if (result.startsWith('data:image/')) {
          this._showPatternPreview(result);
        } else {
          console.log('   ℹ️ Padrão gerado como string HTML');
          if (!hasDOM) {
            console.warn('   ⚠️ Renderização automática indisponível: ambiente sem DOM');
          } else {
            console.warn('   ⚠️ Renderização automática pode falhar (limitação conhecida do plugin)');
          }
          console.log('   💡 Para uso real, considere gerar padrões com Canvas 2D puro');
        }
      }
      
      return result;
    } catch (error) {
      console.error('❌ [Pattern] Erro ao gerar padrão:', error.message);
      return null;
    }
  },

  // Teste 2: Gerar padrão com configurações diferentes
  generateCustomPattern(width = 40, height = 40, n = 3, symmetry = 8) {
    if (!this.available) {
      console.warn('⚠️ [Pattern] Plugin pattern-maker-plugin não disponível');
      return null;
    }

    try {
      console.log(`🎨 [Pattern] Gerando padrão customizado (${width}x${height}, n=${n}, symmetry=${symmetry})...`);
      
      const patternOptions = {
        inputTextGrid: [
          '🟥🟧🟨🟩🟦🟪',
          '🟧🟨🟩🟦🟪🟥',
          '🟨🟩🟦🟪🟥🟧',
          '🟩🟦🟪🟥🟧🟨',
          '🟦🟪🟥🟧🟨🟩',
          '🟪🟥🟧🟨🟩🟦'
        ],
        settings: {
          width: width,
          height: height,
          n: n,
          symmetry: symmetry,
          magnify: 0.8
        }
      };

      const result = root.pattern(patternOptions);
      
      console.log('✅ [Pattern] Padrão customizado gerado!');
      return result;
    } catch (error) {
      console.error('❌ [Pattern] Erro ao gerar padrão customizado:', error.message);
      return null;
    }
  },

  // Teste 3: Gerar padrão periódico (tileable)
  generateTileablePattern() {
    if (!this.available) {
      console.warn('⚠️ [Pattern] Plugin pattern-maker-plugin não disponível');
      return null;
    }

    try {
      console.log('🎨 [Pattern] Gerando padrão tileable (periódico)...');
      
      const patternOptions = {
        inputTextGrid: [
          '🌲🌲🌳🌲🌲',
          '🌲🌳🌳🌳🌲',
          '🌳🌳🏫🌳🌳',
          '🌲🌳🌳🌳🌲',
          '🌲🌲🌳🌲🌲'
        ],
        settings: {
          width: 30,
          height: 30,
          n: 2,
          symmetry: 4,
          periodic: 1,
          magnify: 0.7
        }
      };

      const result = root.pattern(patternOptions);
      
      console.log('✅ [Pattern] Padrão tileable gerado!');
      console.log('   Este padrão pode ser repetido sem costuras visíveis');
      
      return result;
    } catch (error) {
      console.error('❌ [Pattern] Erro ao gerar padrão tileable:', error.message);
      return null;
    }
  },

  // Mostra preview do padrão gerado
  _showPatternPreview(dataUrl) {
    if (!hasDOM) {
      console.warn('⚠️ [Pattern] Preview indisponível: ambiente sem DOM');
      return;
    }

    const existing = document.getElementById('pattern-preview');
    if (existing) existing.remove();

    const container = document.createElement('div');
    container.id = 'pattern-preview';
    container.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 100;
      background: #1a1a2e;
      border: 2px solid #a855f7;
      border-radius: 8px;
      padding: 10px;
      max-width: 200px;
      box-shadow: 0 4px 12px rgba(168, 85, 247, 0.3);
    `;

    const title = document.createElement('div');
    title.style.cssText = 'color: #a855f7; font-family: monospace; font-size: 12px; margin-bottom: 5px;';
    title.textContent = '🎨 Pattern Preview';

    const img = document.createElement('img');
    img.src = dataUrl;
    img.style.cssText = 'width: 100%; height: auto; border-radius: 4px;';

    container.appendChild(title);
    container.appendChild(img);
    document.body.appendChild(container);

    console.log('🖼️ [Pattern] Preview exibido no canto inferior direito');

    setTimeout(() => {
      if (container.parentNode) {
        container.remove();
        console.log('🗑️ [Pattern] Preview removido');
      }
    }, 10000);
  },

  // Diagnóstico da API
  checkAPI() {
    console.log('🎨 [Pattern] Verificando API do plugin...');
    console.log('   root.pattern disponível:', !!root.pattern);
    console.log('   Tipo:', typeof root.pattern);
    
    if (typeof root.pattern === 'function') {
      console.log('   ✅ É uma função');
      console.log('   Uso: root.pattern({ inputTextGrid: [...], settings: {...} })');
      console.log('   Settings: width, height, n, symmetry, magnify, periodic');
    }
  }
};

console.log('🎨 [Pattern] Inicializando teste do plugin pattern-maker...');
if (patternTest.available) {
  console.log('✅ [Pattern] Plugin pattern-maker-plugin disponível');
  patternTest.checkAPI();
} else {
  console.warn('⚠️ [Pattern] Plugin pattern-maker-plugin NÃO disponível');
  console.warn('   Adicione no List Panel: pattern = {import:pattern-maker-plugin}');
}
