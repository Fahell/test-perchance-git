// src/modules/rpg-icon-test.js
// Testa o plugin rpg-icon-plugin do Perchance (~500 ícones RPG)
// Documentação: https://perchance.org/rpg-icon-plugin
import { root } from 'https://cdn.jsdelivr.net/gh/Fahell/test-perchance-git@v1.2.8/src/perchance-bridge.js';

export const rpgIconTest = {
  available: !!root.rpgIcon,

  // Lista de ícones comuns para teste
  commonIcons: ['sword', 'shield', 'potion', 'scroll', 'ring', 'helmet', 'armor', 'bow', 'axe', 'staff', 'gem', 'coin'],

  // Teste 1: Obter um único ícone
  getSingleIcon(iconName = 'sword') {
    if (!this.available) {
      console.warn('⚠️ [RPG-Icon] Plugin rpg-icon-plugin não disponível');
      return null;
    }

    try {
      console.log(`⚔️ [RPG-Icon] Obtendo ícone: ${iconName}...`);
      
      // O plugin retorna HTML string diretamente
      const html = root.rpgIcon(iconName);
      
      console.log('✅ [RPG-Icon] Ícone obtido!');
      console.log('   HTML:', html);
      
      return html;
    } catch (error) {
      console.error('❌ [RPG-Icon] Erro ao obter ícone:', error.message);
      return null;
    }
  },

  // Teste 2: Obter múltiplos ícones
  getMultipleIcons(count = 6) {
    if (!this.available) {
      console.warn('⚠️ [RPG-Icon] Plugin rpg-icon-plugin não disponível');
      return null;
    }

    try {
      console.log(`⚔️ [RPG-Icon] Obtendo ${count} ícones...`);
      
      const icons = [];
      const availableIcons = this.commonIcons.slice(0, count);
      
      for (const iconName of availableIcons) {
        try {
          const html = root.rpgIcon(iconName);
          icons.push({ name: iconName, html: html });
        } catch (e) {
          console.warn(`   ⚠️ Ícone "${iconName}" não disponível`);
        }
      }
      
      console.log(`✅ [RPG-Icon] ${icons.length} ícones obtidos!`);
      
      // Mostra grid de preview
      this._showIconGrid(icons);
      
      return icons;
    } catch (error) {
      console.error('❌ [RPG-Icon] Erro ao obter múltiplos ícones:', error.message);
      return null;
    }
  },

  // Teste 3: Obter ícone aleatório
  getRandomIcon() {
    if (!this.available) {
      console.warn('⚠️ [RPG-Icon] Plugin rpg-icon-plugin não disponível');
      return null;
    }

    try {
      const randomName = this.commonIcons[Math.floor(Math.random() * this.commonIcons.length)];
      console.log(`🎲 [RPG-Icon] Ícone aleatório: ${randomName}`);
      
      const html = root.rpgIcon(randomName);
      
      console.log('✅ [RPG-Icon] Ícone aleatório obtido!');
      return { name: randomName, html: html };
    } catch (error) {
      console.error('❌ [RPG-Icon] Erro ao obter ícone aleatório:', error.message);
      return null;
    }
  },

  // Teste 4: Demonstrar uso em HTML
  demonstrateUsage() {
    if (!this.available) {
      console.warn('⚠️ [RPG-Icon] Plugin rpg-icon-plugin não disponível');
      return null;
    }

    try {
      console.log('📖 [RPG-Icon] Demonstrando uso em HTML...');
      
      const sword = root.rpgIcon('sword');
      const shield = root.rpgIcon('shield');
      const potion = root.rpgIcon('potion');
      
      const html = `
        <div style="background:#2a2a3e; padding:15px; border-radius:8px; color:white; font-family:monospace;">
          <h3 style="margin:0 0 10px 0; color:#4ade80;">⚔️ Inventário</h3>
          <div style="display:flex; gap:10px; align-items:center;">
            <span>${sword}</span>
            <span>Espada Longa</span>
          </div>
          <div style="display:flex; gap:10px; align-items:center;">
            <span>${shield}</span>
            <span>Escudo de Ferro</span>
          </div>
          <div style="display:flex; gap:10px; align-items:center;">
            <span>${potion}</span>
            <span>Poção de Vida</span>
          </div>
        </div>
      `;
      
      console.log('✅ [RPG-Icon] HTML de inventário criado!');
      console.log('   Você pode injetar este HTML em qualquer elemento');
      
      return html;
    } catch (error) {
      console.error('❌ [RPG-Icon] Erro na demonstração:', error.message);
      return null;
    }
  },

  // Mostra grid de ícones no preview
  _showIconGrid(icons) {
    // Remove preview anterior se existir
    const existing = document.getElementById('rpg-icon-preview');
    if (existing) existing.remove();

    // Cria container para o grid
    const container = document.createElement('div');
    container.id = 'rpg-icon-preview';
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 100;
      background: #1a1a2e;
      border: 2px solid #f59e0b;
      border-radius: 8px;
      padding: 10px;
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
    `;

    const title = document.createElement('div');
    title.style.cssText = 'color: #f59e0b; font-family: monospace; font-size: 12px; margin-bottom: 8px;';
    title.textContent = '⚔️ RPG Icons';

    const grid = document.createElement('div');
    grid.style.cssText = 'display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;';

    icons.forEach(icon => {
      const item = document.createElement('div');
      item.style.cssText = `
        background: #2a2a3e;
        padding: 8px;
        border-radius: 4px;
        text-align: center;
        font-size: 20px;
      `;
      item.innerHTML = icon.html;
      item.title = icon.name;
      grid.appendChild(item);
    });

    container.appendChild(title);
    container.appendChild(grid);
    document.body.appendChild(container);

    console.log('🖼️ [RPG-Icon] Grid de ícones exibido no canto superior direito');

    // Auto-remove após 10 segundos
    setTimeout(() => {
      if (container.parentNode) {
        container.remove();
        console.log('🗑️ [RPG-Icon] Preview removido');
      }
    }, 10000);
  },

  // Diagnóstico da API
  checkAPI() {
    console.log('⚔️ [RPG-Icon] Verificando API do plugin...');
    console.log('   root.rpgIcon disponível:', !!root.rpgIcon);
    console.log('   Tipo:', typeof root.rpgIcon);
    
    if (typeof root.rpgIcon === 'function') {
      console.log('   ✅ É uma função');
      console.log('   Uso: root.rpgIcon("sword") → retorna HTML string');
      console.log('   Ícones comuns:', this.commonIcons.join(', '));
    }
  }
};

// Log de inicialização
console.log('⚔️ [RPG-Icon] Inicializando teste do plugin rpg-icon...');
if (rpgIconTest.available) {
  console.log('✅ [RPG-Icon] Plugin rpg-icon-plugin disponível');
  rpgIconTest.checkAPI();
} else {
  console.warn('⚠️ [RPG-Icon] Plugin rpg-icon-plugin NÃO disponível');
  console.warn('   Adicione no List Panel: rpgIcon = {import:rpg-icon-plugin}');
}
