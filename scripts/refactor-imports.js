#!/usr/bin/env node

/**
 * Script para refatorar imports CDN para imports relativos
 * Converte: import { X } from 'https://cdn.jsdelivr.net/.../perchance-bridge.js'
 * Para: import { X } from '../perchance-bridge.js'
 */

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '..', 'src');
const MODULES_DIR = path.join(SRC_DIR, 'modules');

// Padrão para detectar imports do perchance-bridge via CDN
const CDN_BRIDGE_PATTERN = /import\s+{([^}]+)}\s+from\s+['"]https:\/\/cdn\.jsdelivr\.net\/[^'"]*perchance-bridge\.js['"]/g;

function refactorFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;
  
  // Substitui imports CDN do perchance-bridge por imports relativos
  const newContent = content.replace(CDN_BRIDGE_PATTERN, (match, imports) => {
    modified = true;
    return `import {${imports}} from '../perchance-bridge.js'`;
  });
  
  if (modified) {
    fs.writeFileSync(filePath, newContent, 'utf-8');
    console.log(`✅ Refatorado: ${path.relative(SRC_DIR, filePath)}`);
    return true;
  }
  
  return false;
}

function main() {
  console.log('🔧 Refatorando imports CDN para imports relativos...\n');
  
  const files = fs.readdirSync(MODULES_DIR)
    .filter(f => f.endsWith('.js'))
    .map(f => path.join(MODULES_DIR, f));
  
  let count = 0;
  files.forEach(file => {
    if (refactorFile(file)) {
      count++;
    }
  });
  
  console.log(`\n✨ ${count} arquivo(s) refatorado(s)`);
}

main();
