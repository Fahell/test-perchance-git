/**
 * Módulo de teste para o plugin text-to-speech-plugin do Perchance
 * Testa: síntese de voz, velocidade, pitch, idiomas
 * @version 1.2.0
 */

import { root } from 'https://cdn.jsdelivr.net/gh/Fahell/test-perchance-git@v1.2.2/src/perchance-bridge.js';

export const ttsTest = {
  available: !!root.speak,
  
  // Teste 1: Falar texto básico
  testBasicSpeech() {
    console.log('🔊 [TTS] Testando fala básica...');
    
    if (!this.available) {
      console.warn('⚠️ [TTS] Plugin não disponível');
      return { success: false, error: 'Plugin não disponível' };
    }
    
    try {
      root.speak('Olá! Este é um teste de síntese de voz no Perchance.', {
        rate: 1.0,
        pitch: 1.0,
        volume: 1.0
      });
      
      console.log('✅ [TTS] Fala iniciada!');
      return { success: true };
    } catch (error) {
      console.error('❌ [TTS] Erro:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Teste 2: Diferentes velocidades
  testSpeedVariation() {
    console.log('🔊 [TTS] Testando variação de velocidade...');
    
    if (!this.available) {
      return { success: false, error: 'Plugin não disponível' };
    }
    
    try {
      // Fala rápida
      root.speak('Esta é uma fala rápida.', { rate: 1.5 });
      
      setTimeout(() => {
        // Fala lenta
        root.speak('Esta é uma fala lenta.', { rate: 0.7 });
      }, 2000);
      
      console.log('✅ [TTS] Variação de velocidade iniciada!');
      return { success: true };
    } catch (error) {
      console.error('❌ [TTS] Erro:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Teste 3: Diferentes tons (pitch)
  testPitchVariation() {
    console.log('🔊 [TTS] Testando variação de tom...');
    
    if (!this.available) {
      return { success: false, error: 'Plugin não disponível' };
    }
    
    try {
      // Tom agudo
      root.speak('Este é um tom agudo.', { pitch: 1.5 });
      
      setTimeout(() => {
        // Tom grave
        root.speak('Este é um tom grave.', { pitch: 0.5 });
      }, 2000);
      
      console.log('✅ [TTS] Variação de tom iniciada!');
      return { success: true };
    } catch (error) {
      console.error('❌ [TTS] Erro:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Teste 4: Parar fala
  stopSpeech() {
    console.log('🔊 [TTS] Parando fala...');
    
    if (!this.available) {
      return { success: false, error: 'Plugin não disponível' };
    }
    
    try {
      root.stopSpeaking();
      console.log('✅ [TTS] Fala parada!');
      return { success: true };
    } catch (error) {
      console.error('❌ [TTS] Erro:', error.message);
      return { success: false, error: error.message };
    }
  }
};

// Inicialização
console.log('🔊 [TTS] Inicializando teste do plugin text-to-speech...');
if (ttsTest.available) {
  console.log('✅ [TTS] Plugin text-to-speech-plugin disponível');
} else {
  console.warn('⚠️ [TTS] Plugin text-to-speech-plugin NÃO disponível');
  console.warn('   Adicione no List Panel: speak = {import:text-to-speech-plugin}');
}
