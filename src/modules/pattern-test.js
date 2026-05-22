// src/modules/pattern-test.js
// Testa o plugin pattern-maker-plugin do Perchance
import { root } from 'https://cdn.jsdelivr.net/gh/Fahell/test-perchance-git@v1.2.4/src/perchance-bridge.js';

export const patternTest = {
  available: !!root.pattern,
  patternContainer: null,
  
  // Teste 1: Verificar API do plugin
  checkAPI() {
    console.log('🎨 [Pattern] Verificando API do plugin...');
    
    if (!root.pattern) {
      console.warn('⚠️ [Pattern] root.pattern não existe');
      return null;
    }
    
    console.log('📋 [Pattern] Propriedades disponíveis:');
    console.log('   Tipo:', typeof root.pattern);
    
    if (typeof root.pattern === 'object') {
      const props = Object.keys(root.pattern);
      console.log('   Props:', props.join(', '));
      return props;
    } else if (typeof root.pattern === 'function') {
      console.log('   É uma função');
      return ['function'];
    }
    
    return null;
  },
  
  // Teste 2: Gerar padrão básico
  async generateBasicPattern() {
    console.log('🎨 [Pattern] Gerando padrão básico...');
    
    try {
      if (!this.available) {
        console.warn('⚠️ [Pattern] Plugin não disponível');
        return null;
      }
      
      let patternResult;
      
      // Tenta diferentes abordagens
      if (typeof root.pattern === 'function') {
        // Caso 1: É uma função
        patternResult = await root.pattern();
      } else if (typeof root.pattern.generate === 'function') {
        // Caso 2: Tem método generate
        patternResult = await root.pattern.generate();
      } else if (typeof root.pattern.create === 'function') {
        // Caso 3: Tem método create
        patternResult = await root.pattern.create();
      } else if (typeof root.pattern.selectOne === 'function') {
        // Caso 4: É uma lista
        patternResult = root.pattern.selectOne;
      } else {
        console.warn('⚠️ [Pattern] Método de geração não encontrado. Use checkAPI() para ver métodos disponíveis.');
        return null;
      }
      
      console.log('✅ [Pattern] Padrão gerado:', patternResult);
      
      // Tenta exibir se for uma imagem ou canvas
      if (patternResult) {
        this.displayPattern(patternResult);
      }
      
      return patternResult;
    } catch (e) {
      console.error('❌ [Pattern] Erro ao gerar:', e.message);
      console.log('💡 [Pattern] Dica: Este plugin pode requerer parâmetros específicos');
      return null;
    }
  },
  
  // Teste 3: Gerar padrão com opções
  async generateWithOptions(options = {}) {
    console.log('🎨 [Pattern] Gerando padrão com opções...', options);
    
    try {
      if (!this.available) {
        console.warn('⚠️ [Pattern] Plugin não disponível');
        return null;
      }
      
      let patternResult;
      
      if (typeof root.pattern === 'function') {
        patternResult = await root.pattern(options);
      } else if (typeof root.pattern.generate === 'function') {
        patternResult = await root.pattern.generate(options);
      } else {
        console.warn('⚠️ [Pattern] Método com opções não encontrado');
        return null;
      }
      
      console.log('✅ [Pattern] Padrão com opções gerado');
      this.displayPattern(patternResult);
      return patternResult;
    } catch (e) {
      console.error('❌ [Pattern] Erro:', e.message);
      return null;
    }
  },
  
  // Teste 4: Exibir padrão
  displayPattern(patternData) {
    console.log('🎨 [Pattern] Exibindo padrão...');
    
    try {
      // Remove container anterior
      if (this.patternContainer) {
        this.patternContainer.remove();
      }
      
      // Cria novo container
      this.patternContainer = document.createElement('div');
      this.patternContainer.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0,0,0,0.9);
        padding: 20px;
        border-radius: 12px;
        z-index: 1000;
        border: 2px solid #a855f7;
        max-width: 90vw;
        max-height: 90vh;
        overflow: auto;
      `;
      
      // Título
      const title = document.createElement('h3');
      title.style.cssText = 'margin: 0 0 15px 0; color: #a855f7; font-family: monospace; text-align: center;';
      title.textContent = '🎨 Padrão Gerado';
      this.patternContainer.appendChild(title);
      
      // Conteúdo
      const content = document.createElement('div');
      content.style.cssText = 'text-align: center;';
      
      if (typeof patternData === 'string' && patternData.startsWith('data:image/')) {
        // Data URL
        const img = document.createElement('img');
        img.src = patternData;
        img.style.cssText = 'max-width: 100%; max-height: 60vh; border-radius: 8px;';
        content.appendChild(img);
      } else if (patternData instanceof HTMLCanvasElement) {
        // Canvas
        content.appendChild(patternData);
      } else if (typeof patternData === 'string' && patternData.startsWith('http')) {
        // URL externa
        const img = document.createElement('img');
        img.src = patternData;
        img.style.cssText = 'max-width: 100%; max-height: 60vh; border-radius: 8px;';
        img.onerror = () => {
          content.textContent = `URL: ${patternData}`;
        };
        content.appendChild(img);
      } else {
        // Outro formato
        content.textContent = typeof patternData === 'string' ? patternData : JSON.stringify(patternData, null, 2);
        content.style.cssText += 'color: #9ca3af; font-family: monospace; font-size: 12px; max-width: 400px;';
      }
      
      this.patternContainer.appendChild(content);
      
      // Botão de fechar
      const closeBtn = document.createElement('button');
      closeBtn.textContent = '✕ Fechar';
      closeBtn.style.cssText = 'display: block; margin: 15px auto 0; background: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer; padding: 8px 16px; font-family: monospace;';
      closeBtn.onclick = () => this.patternContainer.remove();
      this.patternContainer.appendChild(closeBtn);
      
      document.body.appendChild(this.patternContainer);
      console.log('✅ [Pattern] Padrão exibido');
    } catch (e) {
      console.error('❌ [Pattern] Erro ao exibir:', e.message);
    }
  },
  
  // Teste 5: Limpar padrão
  clearPattern() {
    if (this.patternContainer) {
      this.patternContainer.remove();
      this.patternContainer = null;
      console.log('✅ [Pattern] Padrão removido');
    }
  }
};

// Inicialização
console.log('🎨 [Pattern] Inicializando teste do plugin pattern-maker...');
if (patternTest.available) {
  console.log('✅ [Pattern] Plugin pattern-maker-plugin disponível');
  patternTest.checkAPI();
} else {
  console.warn('⚠️ [Pattern] Plugin pattern-maker-plugin NÃO disponível');
  console.warn('   Adicione no List Panel: pattern = {import:pattern-maker-plugin}');
}
