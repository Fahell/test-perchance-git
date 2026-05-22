/**
 * Módulo de teste para o plugin rpg-icon-plugin do Perchance
 * Testa: acesso a ~500 ícones RPG temáticos
 * @version 1.2.0
 */

import { root } from 'https://cdn.jsdelivr.net/gh/Fahell/test-perchance-git@v1.2.2/src/perchance-bridge.js';

export const rpgIconTest = {
  available: !!root.rpgIcon,
  containerId: 'rpg-icon-preview-container',
  
  // Cria ou retorna o container de preview
  _getOrCreateContainer() {
    let container = document.getElementById(this.containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = this.containerId;
      container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        width: 320px;
        background: rgba(0, 0, 0, 0.9);
        border: 2px solid #fbbf24;
        border-radius: 12px;
        padding: 15px;
        font-family: monospace;
        font-size: 12px;
        color: white;
        z-index: 9998;
        box-shadow: 0 4px 20px rgba(251, 191, 36, 0.3);
      `;
      container.innerHTML = `
        <h3 style="margin: 0 0 10px 0; color: #fbbf24; font-size: 14px;">⚔️ RPG Icons Preview</h3>
        <div id="rpg-icon-grid" style="
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 5px;
          margin-bottom: 10px;
        ">
        </div>
        <div id="rpg-icon-info" style="color: #aaa; font-size: 11px;">
          Aguardando teste...
        </div>
      `;
      document.body.appendChild(container);
    }
    return container;
  },

  // Atualiza o grid com ícones
  _updateGrid(icons) {
    const grid = document.getElementById('rpg-icon-grid');
    const info = document.getElementById('rpg-icon-info');
    
    grid.innerHTML = icons.map(icon => `
      <div style="
        width: 40px;
        height: 40px;
        background: #1a1a1a;
        border: 1px solid #333;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
      " title="${icon.name}">${icon.svg || '❓'}</div>
    `).join('');
    
    info.innerHTML = `✅ ${icons.length} ícones carregados`;
  },

  // Teste 1: Obter ícone aleatório
  getRandomIcon() {
    console.log('⚔️ [RPG-Icon] Obtendo ícone aleatório...');
    
    if (!this.available) {
      console.warn('⚠️ [RPG-Icon] Plugin não disponível');
      return { success: false, error: 'Plugin não disponível' };
    }
    
    try {
      const icon = root.rpgIcon();
      console.log('✅ [RPG-Icon] Ícone obtido:', icon);
      return { success: true, icon: icon };
    } catch (error) {
      console.error('❌ [RPG-Icon] Erro:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Teste 2: Obter ícone específico por categoria
  getIconByCategory(category = 'weapon') {
    console.log(`⚔️ [RPG-Icon] Obtendo ícone da categoria: ${category}...`);
    
    if (!this.available) {
      return { success: false, error: 'Plugin não disponível' };
    }
    
    try {
      const icon = root.rpgIcon({ category: category });
      console.log(`✅ [RPG-Icon] Ícone de ${category}:`, icon);
      return { success: true, icon: icon, category: category };
    } catch (error) {
      console.error('❌ [RPG-Icon] Erro:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Teste 3: Obter múltiplos ícones aleatórios
  getMultipleIcons(count = 12) {
    console.log(`⚔️ [RPG-Icon] Obtendo ${count} ícones aleatórios...`);
    
    if (!this.available) {
      return { success: false, error: 'Plugin não disponível' };
    }
    
    try {
      this._getOrCreateContainer();
      
      const icons = [];
      for (let i = 0; i < count; i++) {
        const icon = root.rpgIcon();
        icons.push({ name: `Icon ${i + 1}`, svg: icon });
      }
      
      this._updateGrid(icons);
      console.log(`✅ [RPG-Icon] ${count} ícones obtidos!`);
      
      return { success: true, icons: icons };
    } catch (error) {
      console.error('❌ [RPG-Icon] Erro:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Teste 4: Ícones de diferentes categorias
  getIconsByCategories() {
    console.log('⚔️ [RPG-Icon] Obtendo ícones de várias categorias...');
    
    if (!this.available) {
      return { success: false, error: 'Plugin não disponível' };
    }
    
    try {
      const categories = ['weapon', 'armor', 'potion', 'scroll', 'gem', 'shield'];
      const icons = [];
      
      categories.forEach(cat => {
        try {
          const icon = root.rpgIcon({ category: cat });
          icons.push({ name: cat, svg: icon });
        } catch (e) {
          icons.push({ name: cat, svg: '❓' });
        }
      });
      
      this._getOrCreateContainer();
      this._updateGrid(icons);
      
      console.log('✅ [RPG-Icon] Ícones por categoria obtidos!');
      return { success: true, icons: icons };
    } catch (error) {
      console.error('❌ [RPG-Icon] Erro:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Limpa o container
  clear() {
    const container = document.getElementById(this.containerId);
    if (container) {
      container.remove();
      console.log('🗑️ [RPG-Icon] Container de preview removido');
    }
  }
};

// Inicialização
console.log('⚔️ [RPG-Icon] Inicializando teste do plugin rpg-icon...');
if (rpgIconTest.available) {
  console.log('✅ [RPG-Icon] Plugin rpg-icon-plugin disponível');
} else {
  console.warn('⚠️ [RPG-Icon] Plugin rpg-icon-plugin NÃO disponível');
  console.warn('   Adicione no List Panel: rpgIcon = {import:rpg-icon-plugin}');
}
