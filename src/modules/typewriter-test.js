// src/modules/typewriter-test.js
// Testa a integração entre ai-text-plugin (streaming de chunks) e efeito typewriter
import { root } from '../perchance-bridge.js';
import { aiTextTest } from './ai-text-test.js';

// Logger simples (substituir pelo logger do projeto se existir)
const log = (msg, ...args) => console.log(`⌨️ [Typewriter] ${msg}`, ...args);
const warn = (msg, ...args) => console.warn(`⚠️ [Typewriter] ${msg}`, ...args);
const error = (msg, ...args) => console.error(`❌ [Typewriter] ${msg}`, ...args);

export const typewriterTest = {
  available: !!aiTextTest?.available,
  
  /**
   * Testa a integração de streaming de chunks da IA com efeito typewriter.
   * Em vez de exibir os chunks inteiros de uma vez (como no onChunk padrão),
   * este teste suaviza a exibição digitando caractere por caractere.
   * 
   * @param {HTMLElement} uiElement - Elemento DOM onde o texto será exibido
   * @param {Object} options - Opções de configuração
   * @param {number} options.charsPerSecond - Velocidade de digitação (padrão: 30)
   * @param {string} options.prompt - Prompt para a IA
   * @returns {Promise<Object>} Resultado do teste
   */
  async testTypewriterIntegration(uiElement, options = {}) {
    log('Iniciando teste de integração typewriter + AI streaming...');
    
    if (!this.available) {
      return { success: false, error: 'ai-text-plugin não disponível' };
    }
    
    const {
      charsPerSecond = 30,
      prompt = 'Escreva uma frase curta sobre um aventureiro em uma floresta mágica.'
    } = options;
    
    // Configura o elemento de saída
    if (!uiElement) {
      return { success: false, error: 'Elemento UI não fornecido' };
    }
    
    uiElement.innerHTML = '';
    uiElement.style.cssText += 'font-family: monospace; white-space: pre-wrap; line-height: 1.6;';
    
    // Fila de caracteres a serem digitados
    const charQueue = [];
    let isTyping = false;
    let totalCharsReceived = 0;
    let totalChunksReceived = 0;
    
    // Função que consome a fila e digita caractere por caractere
    const typeNextChar = () => {
      if (charQueue.length === 0) {
        isTyping = false;
        return;
      }
      
      isTyping = true;
      const char = charQueue.shift();
      uiElement.textContent += char;
      
      // Calcula o delay baseado na velocidade desejada
      const delayMs = 1000 / charsPerSecond;
      setTimeout(typeNextChar, delayMs);
    };
    
    // Adiciona caracteres à fila quando um chunk chega
    const onChunkHandler = (data) => {
      if (data && data.textChunk) {
        totalChunksReceived++;
        const chars = data.textChunk.split('');
        charQueue.push(...chars);
        totalCharsReceived += chars.length;
        
        // Inicia a digitação se não estiver ativa
        if (!isTyping) {
          typeNextChar();
        }
      }
    };
    
    try {
      // Passamos null como uiElement para evitar que o ai-text-plugin escreva diretamente no DOM.
      // O typewriter-test.js gerenciará a exibição do texto através do customOnChunk.
      const result = await aiTextTest.testOnChunkStreaming(null, {
        customOnChunk: onChunkHandler
      });
      
      // Aguarda a fila ser completamente processada
      await new Promise(resolve => {
        const checkQueue = () => {
          if (charQueue.length === 0 && !isTyping) {
            resolve();
          } else {
            setTimeout(checkQueue, 100);
          }
        };
        checkQueue();
      });
      
      log(`Teste concluído. Chunks: ${totalChunksReceived}, Caracteres: ${totalCharsReceived}`);
      
      return {
        success: true,
        totalChunks: totalChunksReceived,
        totalChars: totalCharsReceived,
        finalText: uiElement.textContent,
        charsPerSecond
      };
      
    } catch (err) {
      error('Erro no teste de integração:', err);
      return { success: false, error: err.message };
    }
  }
};

log('Módulo typewriter-test.js carregado.');
if (typewriterTest.available) {
  log('ai-text-plugin disponível para integração.');
} else {
  warn('ai-text-plugin NÃO disponível. Verifique se está importado no List Panel.');
}
