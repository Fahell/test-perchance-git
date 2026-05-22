// src/modules/tts-test.js
// Testa o plugin text-to-speech-plugin do Perchance
// Documentação: https://perchance.org/text-to-speech-plugin
import { root } from 'https://cdn.jsdelivr.net/gh/Fahell/test-perchance-git@v1.2.5/src/perchance-bridge.js';

export const ttsTest = {
  available: !!root.speak,
  
  // Teste 1: Fala básica
  speakBasic(text = 'Olá! Este é um teste de síntese de voz no Perchance.') {
    if (!this.available) {
      console.warn('⚠️ [TTS] Plugin text-to-speech não disponível');
      return null;
    }

    try {
      console.log('🔊 [TTS] Iniciando fala básica...');
      console.log(`   Texto: "${text}"`);
      
      // Chama o plugin de fala
      root.speak(text);
      
      console.log('✅ [TTS] Fala iniciada!');
      return true;
    } catch (error) {
      console.error('❌ [TTS] Erro ao iniciar fala:', error.message);
      return null;
    }
  },

  // Teste 2: Fala com opções (velocidade, tom, volume)
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
      
      // Tenta passar opções se o plugin suportar
      // Nota: a API do plugin pode variar
      try {
        root.speak(text, { rate, pitch, volume });
      } catch {
        // Fallback: chama sem opções
        root.speak(text);
      }
      
      console.log('✅ [TTS] Fala com opções iniciada!');
      return true;
    } catch (error) {
      console.error('❌ [TTS] Erro ao iniciar fala com opções:', error.message);
      return null;
    }
  },

  // Teste 3: Parar fala usando Web Speech API nativa
  stopSpeech() {
    try {
      console.log('🔊 [TTS] Parando fala...');
      
      // Método 1: Tenta método do plugin (se existir)
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
      
      // Método 2: Usa Web Speech API nativa (fallback confiável)
      if (window.speechSynthesis) {
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

  // Teste 4: Verificar vozes disponíveis
  getAvailableVoices() {
    if (!window.speechSynthesis) {
      console.warn('⚠️ [TTS] Web Speech API não disponível');
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

  // Teste 5: Fala com voz específica (Web Speech API)
  speakWithVoice(text = 'Testando voz específica.', voiceName = null) {
    if (!window.speechSynthesis) {
      console.warn('⚠️ [TTS] Web Speech API não disponível');
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

  // Diagnóstico da API
  checkAPI() {
    console.log('🔊 [TTS] Verificando API do plugin...');
    console.log('   root.speak disponível:', !!root.speak);
    console.log('   Tipo:', typeof root.speak);
    
    if (typeof root.speak === 'function') {
      console.log('   ✅ É uma função');
      console.log('   Uso: root.speak("texto")');
    }
    
    console.log('   Web Speech API:', window.speechSynthesis ? '✅ Disponível' : '❌ Não disponível');
    
    // Carrega vozes (pode ser assíncrono)
    if (window.speechSynthesis) {
      setTimeout(() => {
        const voices = window.speechSynthesis.getVoices();
        console.log(`   Vozes carregadas: ${voices.length}`);
      }, 100);
    }
  }
};

// Log de inicialização
console.log('🔊 [TTS] Inicializando teste do plugin text-to-speech...');
if (ttsTest.available) {
  console.log('✅ [TTS] Plugin text-to-speech-plugin disponível');
  ttsTest.checkAPI();
} else {
  console.warn('⚠️ [TTS] Plugin text-to-speech-plugin NÃO disponível');
  console.warn('   Adicione no List Panel: speak = {import:text-to-speech-plugin}');
  console.warn('   Web Speech API nativa ainda pode ser usada como fallback');
}
