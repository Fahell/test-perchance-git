/**
 * perchance-bridge.js
 * Ponte segura para acessar o ambiente do Perchance a partir de módulos ES6.
 * 
 * No Perchance, todas as listas, variáveis e plugins ficam no objeto `root`
 * (que é window.root ou parent.root dependendo do contexto).
 * 
 * Este módulo exporta esse objeto de forma segura, com fallback para testes locais.
 */

// Detecta o objeto root do Perchance ou cria um mock para testes locais
const getPerchanceRoot = () => {
  if (typeof window !== 'undefined') {
    // Prioriza window.root (quando roda direto no Perchance)
    if (window.root) return window.root;
    // Fallback para parent.root (em alguns contextos de iframe)
    if (window.parent && window.parent.root) return window.parent.root;
  }
  // Retorna objeto vazio para testes locais (não quebra o código)
  return {};
};

export const root = getPerchanceRoot();

// Exporta atalhos úteis (opcional, para conveniência)
export const GAME_SEED = root.GAME_SEED;
export const image = root.image; // Plugin text-to-image, se importado no List Panel

// Helper para acessar variáveis do Perchance com fallback seguro
export const getVar = (varName, fallback = null) => {
  if (root[varName] !== undefined) {
    return root[varName];
  }
  // Retorna fallback para testes locais ou variável não definida
  return fallback;
};

// Helper para acessar listas com fallback seguro
export const getList = (listName, fallback = []) => {
  if (root[listName] && typeof root[listName].selectOne === 'function') {
    return root[listName];
  }
  // Retorna um objeto mock para testes locais
  return {
    selectOne: fallback[Math.floor(Math.random() * fallback.length)] || null,
    selectMany: (n) => fallback.slice(0, n),
    joinItems: (sep) => fallback.join(sep)
  };
};

console.log('🔗 perchance-bridge.js carregado. Root disponível:', !!root);
