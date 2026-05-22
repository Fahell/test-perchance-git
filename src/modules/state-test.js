// src/modules/state-test.js
// Testa persistência de estado com localStorage
import { getVar } from 'https://cdn.jsdelivr.net/gh/Fahell/test-perchance-git@v1.2.3/src/perchance-bridge.js';

const STORAGE_KEY = 'rpg_perchance_state';
const STORAGE_VERSION = 1;

// Verifica se localStorage está disponível
let storageAvailable = true;
try {
  const test = '__storage_test__';
  localStorage.setItem(test, test);
  localStorage.removeItem(test);
} catch (e) {
  console.warn('⚠️ [State] localStorage não disponível:', e.message);
  storageAvailable = false;
}

// Estado padrão
const defaultState = {
  version: STORAGE_VERSION,
  gameSeed: getVar('GAME_SEED', 12345),
  player: {
    name: 'Herói',
    level: 1,
    hp: 100,
    maxHp: 100,
    inventory: []
  },
  world: {
    bioma: 'planície',
    visitedChunks: [],
    discoveredItems: []
  },
  settings: {
    musicVolume: 0.7,
    sfxVolume: 1.0,
    language: 'pt-BR'
  },
  lastSaved: null
};

export const stateTest = {
  available: storageAvailable,

  // Salva estado
  save(state) {
    console.log('💾 [State] Salvando estado...');
    const stateToSave = {
      ...state,
      version: STORAGE_VERSION,
      lastSaved: new Date().toISOString()
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
      console.log('✅ [State] Estado salvo com sucesso');
      return true;
    } catch (error) {
      console.error('❌ [State] Erro ao salvar:', error);
      return false;
    }
  },

  // Carrega estado
  load() {
    console.log('💾 [State] Carregando estado...');
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        console.log('⚠️ [State] Nenhum estado salvo encontrado');
        return null;
      }

      const state = JSON.parse(saved);

      // Verifica versão (para migração futura)
      if (state.version !== STORAGE_VERSION) {
        console.warn(`⚠️ [State] Versão do save (${state.version}) diferente da atual (${STORAGE_VERSION}). Migrando...`);
        // Aqui você faria a migração de versão
      }

      console.log('✅ [State] Estado carregado:', state);
      return state;
    } catch (error) {
      console.error('❌ [State] Erro ao carregar:', error);
      return null;
    }
  },

  // Limpa estado
  clear() {
    console.log('🗑️ [State] Limpando estado salvo...');
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log('✅ [State] Estado limpo');
      return true;
    } catch (error) {
      console.error('❌ [State] Erro ao limpar:', error);
      return false;
    }
  },

  // Retorna estado padrão
  getDefaultState() {
    return JSON.parse(JSON.stringify(defaultState));
  },

  // Retorna informações do storage
  getStorageInfo() {
    const saved = localStorage.getItem(STORAGE_KEY);
    return {
      hasSave: !!saved,
      size: saved ? saved.length : 0,
      lastSaved: saved ? JSON.parse(saved).lastSaved : null
    };
  }
};

// Inicialização
console.log('💾 [State] Inicializando teste de persistência...');
if (stateTest.available) {
  console.log('✅ [State] localStorage disponível');
} else {
  console.warn('⚠️ [State] localStorage NÃO disponível');
}
