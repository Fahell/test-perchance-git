// src/modules/image-test.js
// Testa o plugin text-to-image-plugin do Perchance
import { root, getVar } from '../perchance-bridge.js';

export function initImageTest() {
  console.log('🖼️ [Image] Inicializando teste do plugin de imagem...');

  if (!root.image) {
    console.warn('⚠️ [Image] Plugin text-to-image-plugin não disponível no root');
    return {
      available: false,
      generate: () => Promise.resolve({ error: 'Plugin não disponível' })
    };
  }

  console.log('✅ [Image] Plugin text-to-image-plugin disponível');

  return {
    available: true,

    // Teste 1: Geração básica
    async generateBasic(prompt = 'papercraft warrior with sword') {
      console.log('🖼️ [Image] Gerando imagem básica...');
      const seed = getVar('GAME_SEED', 12345);

      try {
        const result = await root.image(prompt, {
          seed: seed,
          resolution: '512x512',
          guidanceScale: 7
        });
        console.log('✅ [Image] Imagem gerada:', result.src || result);
        return result;
      } catch (error) {
        console.error('❌ [Image] Erro na geração básica:', error);
        throw error;
      }
    },

    // Teste 2: Geração com negativePrompt
    async generateWithNegative(prompt = 'fantasy landscape') {
      console.log('🖼️ [Image] Gerando com negativePrompt...');
      const seed = getVar('GAME_SEED', 12345);

      try {
        const result = await root.image(prompt, {
          seed: seed,
          resolution: '512x512',
          negativePrompt: 'blurry, low quality, distorted',
          guidanceScale: 10
        });
        console.log('✅ [Image] Imagem com negative gerada');
        return result;
      } catch (error) {
        console.error('❌ [Image] Erro com negativePrompt:', error);
        throw error;
      }
    },

    // Teste 3: Geração com removeBackground
    async generateTransparent(prompt = 'papercraft character') {
      console.log('🖼️ [Image] Gerando com removeBackground...');
      const seed = getVar('GAME_SEED', 12345);

      try {
        const result = await root.image(prompt, {
          seed: seed,
          resolution: '512x512',
          removeBackground: true
        });
        console.log('✅ [Image] Imagem com fundo removido gerada');
        return result;
      } catch (error) {
        console.error('❌ [Image] Erro com removeBackground:', error);
        throw error;
      }
    },

    // Helper: Criar elemento <img> a partir do resultado
    createImageElement(result, container) {
      const img = document.createElement('img');
      img.src = result.src || result;
      img.style.cssText = 'max-width: 200px; border: 2px solid #4ade80; border-radius: 4px; margin: 10px;';
      if (container) container.appendChild(img);
      return img;
    }
  };
}
