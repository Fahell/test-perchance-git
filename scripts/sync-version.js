#!/usr/bin/env node
/**
 * sync-version.js - Sincroniza a versão de constants.js com for-perchance.html
 * 
 * Uso: node scripts/sync-version.js
 * 
 * Este script:
 * 1. Lê src/constants.js e extrai o valor de VERSION
 * 2. Atualiza todas as referências de versão em for-perchance.html
 * 3. Mostra um resumo das alterações
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CONSTANTS_PATH = path.join(ROOT, 'src', 'constants.js');
const PERCHANCE_HTML_PATH = path.join(ROOT, 'for-perchance.html');

function extractVersion() {
  const content = fs.readFileSync(CONSTANTS_PATH, 'utf-8');
  const match = content.match(/export\s+const\s+VERSION\s*=\s*['"]([^'"]+)['"]/);
  if (!match) {
    throw new Error('Não foi possível extrair VERSION de constants.js');
  }
  return match[1];
}

function updatePerchanceHtml(version) {
  const content = fs.readFileSync(PERCHANCE_HTML_PATH, 'utf-8');
  
  // Remove o prefixo 'v' para capturar ambos os formatos
  const versionNumber = version.replace(/^v/, '');
  
  // Padrões de versão a serem substituídos:
  // 1. <!-- Versão: 1.2.9 --> (sem v)
  // 2. @v1.2.9 (em URLs CDN, com v)
  // 3. v1.2.9 (em mensagens de log, com v)
  const versionPattern = /v?\d+\.\d+\.\d+/g;
  
  let updatedContent = content;
  let changesCount = 0;
  
  // Substitui todas as ocorrências de versão
  updatedContent = updatedContent.replace(versionPattern, (match) => {
    // Determina se a versão original tinha 'v' prefix
    const hadPrefix = match.startsWith('v');
    const newVersion = hadPrefix ? version : versionNumber;
    
    if (match !== newVersion) {
      changesCount++;
    }
    return newVersion;
  });
  
  return { updatedContent, changesCount };
}

function main() {
  try {
    console.log('🔄 Sincronizando versão...\n');
    
    // Extrai versão de constants.js
    const version = extractVersion();
    console.log(`📋 Versão detectada em constants.js: ${version}`);
    
    // Lê for-perchance.html atual
    const originalContent = fs.readFileSync(PERCHANCE_HTML_PATH, 'utf-8');
    const originalMatches = originalContent.match(/v?\d+\.\d+\.\d+/g) || [];
    console.log(`📄 Versões encontradas em for-perchance.html: ${[...new Set(originalMatches)].join(', ')}`);
    
    // Atualiza conteúdo
    const { updatedContent, changesCount } = updatePerchanceHtml(version);
    
    if (changesCount === 0) {
      console.log('\n✅ for-perchance.html já está sincronizado com a versão atual.');
      process.exit(0);
    }
    
    // Escreve arquivo atualizado
    fs.writeFileSync(PERCHANCE_HTML_PATH, updatedContent, 'utf-8');
    
    console.log(`\n✏️  ${changesCount} referência(s) atualizada(s) para ${version}`);
    console.log('✅ for-perchance.html sincronizado com sucesso!');
    
    // Mostra diff das linhas alteradas
    const originalLines = originalContent.split('\n');
    const updatedLines = updatedContent.split('\n');
    
    console.log('\n📝 Alterações:');
    originalLines.forEach((line, i) => {
      if (line !== updatedLines[i]) {
        const lineNum = String(i + 1).padStart(3, ' ');
        console.log(`  ${lineNum} - ${line.trim()}`);
        console.log(`  ${lineNum} + ${updatedLines[i].trim()}`);
      }
    });
    
    process.exit(0);
  } catch (err) {
    console.error(`\n❌ Erro: ${err.message}`);
    process.exit(1);
  }
}

main();
