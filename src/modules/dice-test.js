/**
 * Módulo de teste para o plugin dice-plugin do Perchance
 * Testa: rolagem de dados com notação RPG (2d6, 1d20, etc.)
 * @version 1.2.0
 */

import { root } from 'https://cdn.jsdelivr.net/gh/Fahell/test-perchance-git@v1.1.3/src/perchance-bridge.js';

export const diceTest = {
  available: !!root.dice,
  
  // Teste 1: Rolar um dado simples (1d20)
  rollD20() {
    console.log('🎲 [Dice] Rolando 1d20...');
    
    if (!this.available) {
      console.warn('⚠️ [Dice] Plugin não disponível');
      return { success: false, error: 'Plugin não disponível' };
    }
    
    try {
      const result = root.dice('1d20');
      console.log(`✅ [Dice] Resultado: ${result}`);
      return { success: true, result: result };
    } catch (error) {
      console.error('❌ [Dice] Erro:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Teste 2: Rolar múltiplos dados (3d6)
  roll3D6() {
    console.log('🎲 [Dice] Rolando 3d6...');
    
    if (!this.available) {
      return { success: false, error: 'Plugin não disponível' };
    }
    
    try {
      const result = root.dice('3d6');
      console.log(`✅ [Dice] Resultado: ${result}`);
      return { success: true, result: result };
    } catch (error) {
      console.error('❌ [Dice] Erro:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Teste 3: Rolar com modificador (2d8+5)
  rollWithModifier() {
    console.log('🎲 [Dice] Rolando 2d8+5...');
    
    if (!this.available) {
      return { success: false, error: 'Plugin não disponível' };
    }
    
    try {
      const result = root.dice('2d8+5');
      console.log(`✅ [Dice] Resultado: ${result}`);
      return { success: true, result: result };
    } catch (error) {
      console.error('❌ [Dice] Erro:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Teste 4: Rolagem complexa (1d20+5 vs CA 15)
  rollAttack() {
    console.log('🎲 [Dice] Simulando ataque (1d20+5 vs CA 15)...');
    
    if (!this.available) {
      return { success: false, error: 'Plugin não disponível' };
    }
    
    try {
      const roll = root.dice('1d20+5');
      const ac = 15;
      const hit = roll >= ac;
      
      console.log(`✅ [Dice] Rolagem: ${roll} | ${hit ? 'ACERTO!' : 'ERROU'}`);
      return { success: true, roll: roll, ac: ac, hit: hit };
    } catch (error) {
      console.error('❌ [Dice] Erro:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Teste 5: Múltiplas rolagens de uma vez
  rollMultiple() {
    console.log('🎲 [Dice] Rolando múltiplos dados...');
    
    if (!this.available) {
      return { success: false, error: 'Plugin não disponível' };
    }
    
    try {
      const rolls = [];
      rolls.push({ dice: '1d4', result: root.dice('1d4') });
      rolls.push({ dice: '1d6', result: root.dice('1d6') });
      rolls.push({ dice: '1d8', result: root.dice('1d8') });
      rolls.push({ dice: '1d10', result: root.dice('1d10') });
      rolls.push({ dice: '1d12', result: root.dice('1d12') });
      rolls.push({ dice: '1d20', result: root.dice('1d20') });
      rolls.push({ dice: '1d100', result: root.dice('1d100') });
      
      console.log('✅ [Dice] Múltiplas rolagens:', rolls);
      return { success: true, rolls: rolls };
    } catch (error) {
      console.error('❌ [Dice] Erro:', error.message);
      return { success: false, error: error.message };
    }
  }
};

// Inicialização
console.log('🎲 [Dice] Inicializando teste do plugin dice...');
if (diceTest.available) {
  console.log('✅ [Dice] Plugin dice-plugin disponível');
} else {
  console.warn('⚠️ [Dice] Plugin dice-plugin NÃO disponível');
  console.warn('   Adicione no List Panel: dice = {import:dice-plugin}');
}
