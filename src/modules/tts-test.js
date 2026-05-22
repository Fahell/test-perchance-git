// src/modules/tts-test.js
// Testa o plugin text-to-speech-plugin do Perchance
import { root } from 'https://cdn.jsdelivr.net/gh/Fahell/test-perchance-git@v1.2.4/src/perchance-bridge.js';

// Fallback: usa Web Speech API nativa do navegador se plugin não disponível
const useNativeTTS = !root.speak || typeof root.speak !== 'function';

let currentUtterance = null;

export const ttsTest = {
  available: !!root.speak || ('speechSynthesis' in window),
  useNativeTTS,
  
  // Teste 1: Fala básica
  async testBasicSpeech() {
    console.log('🔊 [TTS] Testando fala básica...');
    
    const text = 'Olá! Este é um teste de síntese de voz no Perchance.';
    
    try {
      if (useNativeTTS) {
        // Usa Web Speech API nativa
        if (!('speechSynthesis' in window)) {
          console.warn('⚠️ [TTS] speechSynthesis não disponível neste navegador');
          return;
        }
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'pt-BR';
        utterance.rate = 1;
        utterance.pitch = 1;
        
        currentUtterance = utterance;
        
        utterance.onstart = () => console.log('🔊 [TTS] Fala iniciada (nativa)');
        utterance.onend = () => {
          console.log('✅ [TTS] Fala concluída');
          currentUtterance = null;
        };
        utterance.onerror = (e) => console.error('❌ [TTS] Erro:', e);
        
        window.speechSynthesis.speak(utterance);
      } else {
        // Usa plugin do Perchance
        await root.speak(text);
        console.log('✅ [TTS] Fala iniciada via plugin');
      }
    } catch (e) {
      console.error('❌ [TTS] Erro:', e.message);
    }
  },
  
  // Teste 2: Velocidade variada
  async testSpeedVariation() {
    console.log('🔊 [TTS] Testando velocidade variada...');
    
    try {
      if (useNativeTTS) {
        const utterance = new SpeechSynthesisUtterance('Esta fala é mais lenta que o normal.');
        utterance.lang = 'pt-BR';
        utterance.rate = 0.7; // Mais lento
        utterance.pitch = 1.2;
        
        currentUtterance = utterance;
        
        utterance.onstart = () => console.log('🔊 [TTS] Fala lenta iniciada');
        utterance.onend = () => {
          console.log('✅ [TTS] Fala lenta concluída');
          currentUtterance = null;
        };
        
        window.speechSynthesis.speak(utterance);
      } else {
        await root.speak('Esta fala é mais lenta que o normal.', { rate: 0.7 });
      }
    } catch (e) {
      console.error('❌ [TTS] Erro:', e.message);
    }
  },
  
  // Teste 3: Parar fala
  stopSpeech() {
    console.log('🔊 [TTS] Parando fala...');
    
    try {
      if (useNativeTTS) {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          console.log('✅ [TTS] Fala parada (nativa)');
        }
      } else {
        // Tenta diferentes métodos do plugin
        if (typeof root.stopSpeaking === 'function') {
          root.stopSpeaking();
        } else if (typeof root.speak.stop === 'function') {
          root.speak.stop();
        } else if (typeof root.speak.cancel === 'function') {
          root.speak.cancel();
        } else {
          console.warn('⚠️ [TTS] Método de stop não encontrado no plugin');
          // Fallback: cancela via Web Speech API
          if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
          }
        }
        console.log('✅ [TTS] Fala parada');
      }
      currentUtterance = null;
    } catch (e) {
      console.error('❌ [TTS] Erro:', e.message);
    }
  },
  
  // Teste 4: Listar vozes disponíveis
  listVoices() {
    console.log('🔊 [TTS] Listando vozes disponíveis...');
    
    if ('speechSynthesis' in window) {
      const voices = window.speechSynthesis.getVoices();
      console.log(`📋 [TTS] ${voices.length} vozes encontradas:`);
      
      const ptVoices = voices.filter(v => v.lang.startsWith('pt'));
      if (ptVoices.length > 0) {
        console.log('🇧🇷 [TTS] Vozes em português:');
        ptVoices.forEach(v => console.log(`   - ${v.name} (${v.lang})`));
      } else {
        console.log('⚠️ [TTS] Nenhuma voz em português encontrada');
      }
      
      return voices;
    } else {
      console.warn('⚠️ [TTS] speechSynthesis não disponível');
      return [];
    }
  }
};

// Inicialização
console.log('🔊 [TTS] Inicializando teste do plugin text-to-speech...');
if (ttsTest.available) {
  console.log('✅ [TTS] Plugin text-to-speech disponível');
  console.log(`   Modo: ${ttsTest.useNativeTTS ? 'Web Speech API nativa' : 'Plugin Perchance'}`);
  
  // Carrega vozes (pode ser assíncrono em alguns navegadores)
  if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = () => {
      console.log('🔊 [TTS] Vozes carregadas');
    };
  }
} else {
  console.warn('⚠️ [TTS] Plugin text-to-speech NÃO disponível');
  console.warn('   Adicione no List Panel: speak = {import:text-to-speech-plugin}');
}
