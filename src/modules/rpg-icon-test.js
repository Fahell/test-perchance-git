// src/modules/rpg-icon-test.js
// Testa o plugin rpg-icon-plugin do Perchance
import { root } from 'https://cdn.jsdelivr.net/gh/Fahell/test-perchance-git@v1.2.4/src/perchance-bridge.js';

export const rpgIconTest = {
  available: !!root.rpgIcon,
  iconContainer: null,
  
  // Teste 1: Obter um único ícone
  getSingleIcon(iconName) {
    console.log(`⚔️ [RPG-Icon] Obtendo ícone: ${iconName || 'aleatório'}...`);
    
    try {
      if (!this.available) {
        console.warn('⚠️ [RPG-Icon] Plugin não disponível');
        return null;
      }
      
      // O plugin pode funcionar de diferentes formas
      // Tenta várias abordagens
      let iconData;
      
      if (typeof root.rpgIcon === 'function') {
        // Caso 1: É uma função
        iconData = iconName ? root.rpgIcon(iconName) : root.rpgIcon();
      } else if (typeof root.rpgIcon.selectOne === 'function') {
        // Caso 2: É uma lista
        iconData = root.rpgIcon.selectOne;
      } else if (typeof root.rpgIcon.get === 'function') {
        // Caso 3: Tem método get
        iconData = root.rpgIcon.get(iconName);
      } else if (root.rpgIcon && typeof root.rpgIcon.toString === 'function') {
        // Caso 4: Tenta usar como string
        iconData = root.rpgIcon.toString();
      }
      
      console.log('✅ [RPG-Icon] Ícone obtido:', iconData);
      return iconData;
    } catch (e) {
      console.error('❌ [RPG-Icon] Erro:', e.message);
      return null;
    }
  },
  
  // Teste 2: Obter múltiplos ícones
  getMultipleIcons(count = 12) {
    console.log(`⚔️ [RPG-Icon] Obtendo ${count} ícones...`);
    
    try {
      if (!this.available) {
        console.warn('⚠️ [RPG-Icon] Plugin não disponível');
        return [];
      }
      
      const icons = [];
      
      // Tenta diferentes abordagens
      if (typeof root.rpgIcon.selectMany === 'function') {
        // Caso 1: selectMany
        const items = root.rpgIcon.selectMany(count);
        for (let i = 0; i < items.length; i++) {
          icons.push(items[i]);
        }
      } else if (typeof root.rpgIcon === 'function') {
        // Caso 2: Chama função múltiplas vezes
        for (let i = 0; i < count; i++) {
          icons.push(root.rpgIcon());
        }
      } else {
        console.warn('⚠️ [RPG-Icon] Método de múltiplos ícones não encontrado');
        return [];
      }
      
      console.log(`✅ [RPG-Icon] ${icons.length} ícones obtidos`);
      this.displayIcons(icons);
      return icons;
    } catch (e) {
      console.error('❌ [RPG-Icon] Erro:', e.message);
      return [];
    }
  },
  
  // Teste 3: Exibir ícones em grid
  displayIcons(icons) {
    console.log('⚔️ [RPG-Icon] Exibindo ícones em grid...');
    
    try {
      // Remove container anterior
      if (this.iconContainer) {
        this.iconContainer.remove();
      }
      
      // Cria novo container
      this.iconContainer = document.createElement('div');
      this.iconContainer.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(0,0,0,0.85);
        padding: 15px;
        border-radius: 8px;
        z-index: 1000;
        max-width: 400px;
        max-height: 400px;
        overflow-y: auto;
        border: 1px solid #fbbf24;
      `;
      
      // Título
      const title = document.createElement('h3');
      title.style.cssText = 'margin: 0 0 10px 0; color: #fbbf24; font-family: monospace;';
      title.textContent = `⚔️ ${icons.length} Ícones RPG`;
      this.iconContainer.appendChild(title);
      
      // Grid de ícones
      const grid = document.createElement('div');
      grid.style.cssText = 'display: grid; grid-template-columns: repeat(6, 1fr); gap: 5px;';
      
      icons.forEach((icon, i) => {
        const cell = document.createElement('div');
        cell.style.cssText = `
          width: 40px;
          height: 40px;
          background: #374151;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          color: #9ca3af;
          overflow: hidden;
        `;
        
        // Se for uma URL de imagem
        if (typeof icon === 'string' && icon.startsWith('http')) {
          const img = document.createElement('img');
          img.src = icon;
          img.style.cssText = 'width: 100%; height: 100%; object-fit: contain;';
          img.onerror = () => {
            cell.textContent = `#${i+1}`;
          };
          cell.appendChild(img);
        } else {
          // Texto ou outro formato
          cell.textContent = typeof icon === 'string' ? icon.substring(0, 3) : `#${i+1}`;
        }
        
        grid.appendChild(cell);
      });
      
      this.iconContainer.appendChild(grid);
      
      // Botão de fechar
      const closeBtn = document.createElement('button');
      closeBtn.textContent = '✕';
      closeBtn.style.cssText = 'position: absolute; top: 5px; right: 5px; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer; padding: 2px 6px;';
      closeBtn.onclick = () => this.iconContainer.remove();
      this.iconContainer.appendChild(closeBtn);
      
      document.body.appendChild(this.iconContainer);
      console.log('✅ [RPG-Icon] Ícones exibidos');
    } catch (e) {
      console.error('❌ [RPG-Icon] Erro ao exibir:', e.message);
    }
  },
  
  // Teste 4: Verificar API do plugin
  checkAPI() {
    console.log('⚔️ [RPG-Icon] Verificando API do plugin...');
    
    if (!root.rpgIcon) {
      console.warn('⚠️ [RPG-Icon] root.rpgIcon não existe');
      return;
    }
    
    console.log('📋 [RPG-Icon] Propriedades disponíveis:');
    console.log('   Tipo:', typeof root.rpgIcon);
    
    if (typeof root.rpgIcon === 'object') {
      const props = Object.keys(root.rpgIcon);
      console.log('   Props:', props.join(', '));
      
      if (props.length === 0) {
        console.log('   ⚠️ Objeto vazio - plugin pode não ter carregado corretamente');
      }
    }
  }
};

// Inicialização
console.log('⚔️ [RPG-Icon] Inicializando teste do plugin rpg-icon...');
if (rpgIconTest.available) {
  console.log('✅ [RPG-Icon] Plugin rpg-icon-plugin disponível');
  rpgIconTest.checkAPI();
} else {
  console.warn('⚠️ [RPG-Icon] Plugin rpg-icon-plugin NÃO disponível');
  console.warn('   Adicione no List Panel: rpgIcon = {import:rpg-icon-plugin}');
}
