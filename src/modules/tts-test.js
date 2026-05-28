// src/modules/tts-test.js
// Testa o plugin text-to-speech-plugin do Perchance
// Documentação: https://perchance.org/text-to-speech-plugin
import { root } from '../perchance-bridge.js';

// Polyfill: Web Speech API is unavailable in cross-origin iframes.
// The Perchance text-to-speech-plugin uses setInterval to poll
// window.speechSynthesis.getVoices() every 100ms. Without this polyfill,
// it throws TypeError in a tight loop (the "isTrusted" noise).
// This stub returns an empty voices array so the plugin's clearInterval
// is triggered and the polling stops.
if (typeof window.speechSynthesis === 'undefined') {
  window.speechSynthesis = {
    getVoices: () => [],
    speak: () => {},
    cancel: () => {},
    pause: () => {},
    resume: () => {},
    pending: false,
    speaking: false,
    paused: false
  };
}

const isSpeechSynthesisSupported = () => typeof window.speechSynthesis !== 'undefined';

export const ttsTest = {
  available: !!root.speak,
  speechApiSupported: isSpeechSynthesisSupported(),

  speakBasic(text = 'Olá! Este é um teste de síntese de voz no Perchance.') {
    if (!this.available) {
      console.warn('⚠️ [TTS] Plugin text-to-speech não disponível');
      return null;
    }

    try {
      console.log('🔊 [TTS] Iniciando fala básica...');
      console.log(`   Texto: "${text}"`);
      root.speak(text);
      console.log('✅ [TTS] Fala iniciada!');
      return true;
    } catch (error) {
      console.error('❌ [TTS] Erro ao iniciar fala:', error.message);
      return null;
    }
  },

  speakWithOptions(text = 'Testando velocidade e tom.', options = {}) {
    if (!this.available) {
      console.warn('⚠️ [TTS] Plugin text-to-speech não disponível');
      return null;
    }

    try {
      const rate = options.rate || 1.0;
      const pitch = options.pitch || 1.0;
      const volume = options.volume || 1.0;

      console.log('🔊 [TTS] Iniciando fala com opções...');
      console.log(`   Texto: "${text}"`);
      console.log(`   Rate: ${rate}, Pitch: ${pitch}, Volume: ${volume}`);

      try {
        root.speak(text, { rate, pitch, volume });
      } catch {
        root.speak(text);
      }

      console.log('✅ [TTS] Fala com opções iniciada!');
      return true;
    } catch (error) {
      console.error('❌ [TTS] Erro ao iniciar fala com opções:', error.message);
      return null;
    }
  },

  stopSpeech() {
    try {
      console.log('🔊 [TTS] Parando fala...');

      if (root.speak && typeof root.speak.cancel === 'function') {
        root.speak.cancel();
        console.log('✅ [TTS] Fala parada via plugin.cancel()');
        return true;
      }

      if (root.speak && typeof root.speak.stop === 'function') {
        root.speak.stop();
        console.log('✅ [TTS] Fala parada via plugin.stop()');
        return true;
      }

      if (isSpeechSynthesisSupported()) {
        window.speechSynthesis.cancel();
        console.log('✅ [TTS] Fala parada via Web Speech API');
        return true;
      }

      console.warn('⚠️ [TTS] Nenhum método de stop disponível');
      return false;
    } catch (error) {
      console.error('❌ [TTS] Erro ao parar fala:', error.message);
      return null;
    }
  },

  getAvailableVoices() {
    if (!isSpeechSynthesisSupported()) {
      console.warn('⚠️ [TTS] Web Speech API não disponível neste contexto (cross-origin iframe)');
      return [];
    }

    try {
      const voices = window.speechSynthesis.getVoices();
      console.log(`🔊 [TTS] ${voices.length} vozes disponíveis`);

      if (voices.length > 0) {
        const ptVoices = voices.filter(v => v.lang.startsWith('pt'));
        console.log(`   Vozes em português: ${ptVoices.length}`);
        ptVoices.forEach(v => {
          console.log(`   - ${v.name} (${v.lang})`);
        });
      }

      return voices;
    } catch (error) {
      console.error('❌ [TTS] Erro ao obter vozes:', error.message);
      return [];
    }
  },

  speakWithVoice(text = 'Testando voz específica.', voiceName = null) {
    if (!isSpeechSynthesisSupported()) {
      console.warn('⚠️ [TTS] Web Speech API não disponível neste contexto (cross-origin iframe)');
      if (this.available) {
        console.log('🔊 [TTS] Fallback: usando plugin Perchance sem voz específica');
        return this.speakBasic(text);
      }
      return null;
    }

    try {
      console.log('🔊 [TTS] Iniciando fala com voz específica...');

      const utterance = new SpeechSynthesisUtterance(text);

      if (voiceName) {
        const voices = window.speechSynthesis.getVoices();
        const selectedVoice = voices.find(v => v.name === voiceName);
        if (selectedVoice) {
          utterance.voice = selectedVoice;
          console.log(`   Voz selecionada: ${selectedVoice.name}`);
        }
      }

      utterance.onstart = () => console.log('🔊 [TTS] Fala iniciada');
      utterance.onend = () => console.log('🔊 [TTS] Fala concluída');
      utterance.onerror = (e) => console.error('❌ [TTS] Erro na fala:', e.error);

      window.speechSynthesis.speak(utterance);
      console.log('✅ [TTS] Fala com voz específica iniciada!');
      return true;
    } catch (error) {
      console.error('❌ [TTS] Erro ao falar com voz específica:', error.message);
      return null;
    }
  },

  checkAPI() {
    console.log('🔊 [TTS] Verificando API do plugin...');
    console.log('   root.speak disponível:', !!root.speak);
    console.log('   Tipo:', typeof root.speak);

    if (typeof root.speak === 'function') {
      console.log('   ✅ Plugin Perchance disponível');
      console.log('   Uso: root.speak("texto")');
    }

    console.log('   Web Speech API:', isSpeechSynthesisSupported() ? '✅ Disponível (polyfill)' : '❌ Não disponível');

    if (isSpeechSynthesisSupported()) {
      setTimeout(() => {
        const voices = window.speechSynthesis.getVoices();
        console.log(`   Vozes carregadas: ${voices.length}`);
      }, 100);
    } else {
      console.log('   ℹ️ [TTS] Apenas o plugin Perchance (root.speak) será utilizado');
    }
  }
};

console.log('🔊 [TTS] Inicializando teste do plugin text-to-speech...');
if (ttsTest.available) {
  console.log('✅ [TTS] Plugin text-to-speech-plugin disponível');
  ttsTest.checkAPI();
} else {
  console.warn('⚠️ [TTS] Plugin text-to-speech-plugin NÃO disponível');
  console.warn('   Adicione no List Panel: speak = {import:text-to-speech-plugin}');
  if (isSpeechSynthesisSupported()) {
    console.log('   ℹ️ Web Speech API nativa disponível como fallback');
  } else {
    console.warn('   ❌ Nenhum método de TTS disponível neste contexto');
  }
}
