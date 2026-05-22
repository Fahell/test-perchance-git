// src/modules/image-test.js
// Testa o plugin de geração de imagens do Perchance
import { root } from '../perchance-bridge.js';

export function initImageTest() {
  console.log('🖼️ [Image] Inicializando teste do plugin de imagem...');

  // Verifica se o plugin está disponível
  const imagePlugin = root?.image;
  if (!imagePlugin) {
    console.warn('⚠️ [Image] Plugin text-to-image-plugin não disponível. Adicione ao List Panel:');
    console.warn('   image = {import:text-to-image-plugin}');
    return null;
  }

  console.log('✅ [Image] Plugin text-to-image-plugin disponível');

  return {
    // Teste 1: Geração básica
    async testBasicImage() {
      console.log('🖼️ [Image] Gerando imagem básica...');
      try {
        const result = await imagePlugin({
          prompt: 'papercraft warrior with sword, fantasy art style',
          resolution: '512x512',
          seed: 12345,
          negativePrompt: 'blurry, low quality'
        });

        // O plugin retorna um objeto String com propriedades extras (canvas, dataUrl, inputs)
        // ou uma string primitiva data URL
        const imageUrl = this._extractImageUrl(result);
        
        if (imageUrl) {
          console.log('✅ [Image] Imagem gerada com sucesso!');
          console.log('   Data URL length:', imageUrl.length, 'chars');
          console.log('   Tipo do resultado:', typeof result, result instanceof String ? '(String object)' : '');
          return imageUrl;
        } else {
          console.error('❌ [Image] Falha na geração:', result);
          console.error('   Tipo:', typeof result, '| Chaves:', Object.keys(result || {}));
          return null;
        }
      } catch (error) {
        console.error('❌ [Image] Erro na geração:', error.message);
        console.log('💡 [Image] Dica: Este erro pode ser causado por:');
        console.log('   1. Limite de uso do plugin (conta não logada)');
        console.log('   2. Problema temporário no servidor do Perchance');
        console.log('   3. Prompt muito complexo ou inválido');
        return null;
      }
    },

    // Teste 2: Geração com seed específica
    async testSeededImage(seed = 99999) {
      console.log(`🖼️ [Image] Gerando imagem com seed ${seed}...`);
      try {
        const result = await imagePlugin({
          prompt: 'papercraft mage with staff, blue robes',
          resolution: '512x512',
          seed: seed
        });

        const imageUrl = this._extractImageUrl(result);
        
        if (imageUrl) {
          console.log(`✅ [Image] Imagem com seed ${seed} gerada!`);
          console.log('   Data URL length:', imageUrl.length, 'chars');
          return imageUrl;
        } else {
          console.error('❌ [Image] Falha na geração com seed');
          return null;
        }
      } catch (error) {
        console.error('❌ [Image] Erro:', error.message);
        return null;
      }
    },

    // Teste 3: Geração com negative prompt
    async testNegativePrompt() {
      console.log('🖼️ [Image] Gerando imagem com negative prompt...');
      try {
        const result = await imagePlugin({
          prompt: 'papercraft dragon, red scales, breathing fire',
          resolution: '512x512',
          seed: 54321,
          negativePrompt: 'realistic, photograph, low quality, blurry'
        });

        const imageUrl = this._extractImageUrl(result);
        
        if (imageUrl) {
          console.log('✅ [Image] Imagem com negative prompt gerada!');
          console.log('   Data URL length:', imageUrl.length, 'chars');
          return imageUrl;
        } else {
          console.error('❌ [Image] Falha na geração');
          return null;
        }
      } catch (error) {
        console.error('❌ [Image] Erro:', error.message);
        return null;
      }
    },

    // Teste 4: Exibir imagem no DOM
    async testDisplayImage(container) {
      console.log('🖼️ [Image] Gerando e exibindo imagem no DOM...');
      try {
        const result = await imagePlugin({
          prompt: 'papercraft castle on a hill, sunset, fantasy',
          resolution: '512x512',
          seed: 77777
        });

        const imageUrl = this._extractImageUrl(result);
        
        if (imageUrl) {
          // Cria elemento de imagem
          const img = document.createElement('img');
          img.src = imageUrl;
          img.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            max-width: 400px;
            max-height: 400px;
            border: 2px solid #4ade80;
            border-radius: 8px;
            z-index: 10000;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
          `;

          // Adiciona ao body
          document.body.appendChild(img);

          // Remove após 5 segundos
          setTimeout(() => {
            img.remove();
            console.log('🗑️ [Image] Imagem removida do DOM');
          }, 5000);

          console.log('✅ [Image] Imagem exibida no DOM por 5 segundos');
          return imageUrl;
        } else {
          console.error('❌ [Image] Falha na geração');
          return null;
        }
      } catch (error) {
        console.error('❌ [Image] Erro:', error.message);
        return null;
      }
    },

    // Teste 5: Informações do plugin
    getPluginInfo() {
      console.log('🖼️ [Image] Obtendo informações do plugin...');
      const info = {
        available: !!imagePlugin,
        type: typeof imagePlugin,
        name: imagePlugin?.name || 'text-to-image-plugin'
      };
      console.log('✅ [Image] Informações do plugin:', info);
      return info;
    },

    // Helper privado: Extrai a URL da imagem do resultado do plugin
    _extractImageUrl(result) {
      if (!result) return null;
      
      // Caso 1: Objeto com propriedade dataUrl (formato do text-to-image-plugin)
      if (result.dataUrl) {
        return result.dataUrl;
      }
      
      // Caso 2: Objeto com propriedade src
      if (result.src) {
        return result.src;
      }
      
      // Caso 3: Objeto com propriedade url
      if (result.url) {
        return result.url;
      }
      
      // Caso 4: O próprio resultado é uma String object (String object com valor data URL)
      // O plugin text-to-image-plugin retorna um String object especial
      const strValue = result.toString ? result.toString() : String(result);
      if (strValue && strValue.startsWith('data:image/')) {
        return strValue;
      }
      
      // Caso 5: String primitiva
      if (typeof result === 'string' && result.startsWith('data:image/')) {
        return result;
      }
      
      return null;
    }
  };
}
