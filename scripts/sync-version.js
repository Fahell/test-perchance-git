#!/usr/bin/env node
/**
 * sync-version.js - Sincroniza a versão de constants.js com múltiplos arquivos
 * 
 * Uso: node scripts/sync-version.js
 * 
 * Arquivos sincronizados:
 * 1. for-perchance.html - URLs CDN e comentários HTML
 * 2. README.md - Linha 1 (título do projeto)
 * 3. src/main.js - Comentário de versão e BASE_URL
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CONSTANTS_PATH = path.join(ROOT, 'src', 'constants.js');
const PERCHANCE_HTML_PATH = path.join(ROOT, 'for-perchance.html');
const README_PATH = path.join(ROOT, 'README.md');
const MAIN_JS_PATH = path.join(ROOT, 'src', 'main.js');

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
  const versionNumber = version.replace(/^v/, '');
  const versionPattern = /v?\d+\.\d+\.\d+/g;
  
  let updatedContent = content;
  let changesCount = 0;
  
  updatedContent = updatedContent.replace(versionPattern, (match) => {
    const hadPrefix = match.startsWith('v');
    const newVersion = hadPrefix ? version : versionNumber;
    if (match !== newVersion) changesCount++;
    return newVersion;
  });
  
  return { updatedContent, changesCount };
}

function updateReadme(version) {
  const content = fs.readFileSync(README_PATH, 'utf-8');
  const lines = content.split('\n');
  let changesCount = 0;
  
  // Linha 1: Título do projeto "# 🎮 Test Perchance Git (vX.Y.Z)"
  const titlePattern = /^(# .+\()(v?\d+\.\d+\.\d+)(\))$/;
  if (titlePattern.test(lines[0])) {
    const oldLine = lines[0];
    lines[0] = lines[0].replace(titlePattern, `$1${version}$3`);
    if (oldLine !== lines[0]) changesCount++;
  }
  
  return { updatedContent: lines.join('\n'), changesCount };
}

function updateMainJs(version) {
  const content = fs.readFileSync(MAIN_JS_PATH, 'utf-8');
  const versionPattern = /v?\d+\.\d+\.\d+/g;
  
  let updatedContent = content;
  let changesCount = 0;
  
  updatedContent = updatedContent.replace(versionPattern, (match) => {
    const hadPrefix = match.startsWith('v');
    const newVersion = hadPrefix ? version : version.replace(/^v/, '');
    if (match !== newVersion) changesCount++;
    return newVersion;
  });
  
  return { updatedContent, changesCount };
}

function main() {
  try {
    console.log('🔄 Sincronizando versão...\n');
    
    const version = extractVersion();
    console.log(`📋 Versão detectada em constants.js: ${version}\n`);
    
    let totalChanges = 0;
    
    // 1. for-perchance.html
    const perchanceOriginal = fs.readFileSync(PERCHANCE_HTML_PATH, 'utf-8');
    const perchanceMatches = perchanceOriginal.match(/v?\d+\.\d+\.\d+/g) || [];
    console.log(`📄 for-perchance.html: ${[...new Set(perchanceMatches)].join(', ')}`);
    
    const { updatedContent: perchanceUpdated, changesCount: perchanceChanges } = updatePerchanceHtml(version);
    if (perchanceChanges > 0) {
      fs.writeFileSync(PERCHANCE_HTML_PATH, perchanceUpdated, 'utf-8');
      console.log(`   ✏️  ${perchanceChanges} referência(s) atualizada(s) para ${version}`);
    } else {
      console.log(`   ✅ Já sincronizado`);
    }
    totalChanges += perchanceChanges;
    
    // 2. README.md
    const readmeOriginal = fs.readFileSync(README_PATH, 'utf-8');
    const readmeTitleMatch = readmeOriginal.match(/^(# .+\()(v?\d+\.\d+\.\d+)(\))/);
    const readmeCurrentVersion = readmeTitleMatch ? readmeTitleMatch[2] : 'desconhecida';
    console.log(`\n📄 README.md (título): ${readmeCurrentVersion}`);
    
    const { updatedContent: readmeUpdated, changesCount: readmeChanges } = updateReadme(version);
    if (readmeChanges > 0) {
      fs.writeFileSync(README_PATH, readmeUpdated, 'utf-8');
      console.log(`   ✏️  Título atualizado para ${version}`);
    } else {
      console.log(`   ✅ Já sincronizado`);
    }
    totalChanges += readmeChanges;
    
    // 3. src/main.js
    const mainOriginal = fs.readFileSync(MAIN_JS_PATH, 'utf-8');
    const mainMatches = mainOriginal.match(/v?\d+\.\d+\.\d+/g) || [];
    console.log(`\n📄 src/main.js: ${[...new Set(mainMatches)].join(', ')}`);
    
    const { updatedContent: mainUpdated, changesCount: mainChanges } = updateMainJs(version);
    if (mainChanges > 0) {
      fs.writeFileSync(MAIN_JS_PATH, mainUpdated, 'utf-8');
      console.log(`   ✏️  ${mainChanges} referência(s) atualizada(s) para ${version}`);
    } else {
      console.log(`   ✅ Já sincronizado`);
    }
    totalChanges += mainChanges;
    
    // Resumo
    console.log(`\n${'='.repeat(50)}`);
    if (totalChanges === 0) {
      console.log('✅ Todos os arquivos já estão sincronizados.');
    } else {
      console.log(`✅ ${totalChanges} alteração(ões) aplicada(s) em ${[perchanceChanges > 0 && 'for-perchance.html', readmeChanges > 0 && 'README.md', mainChanges > 0 && 'src/main.js'].filter(Boolean).join(', ')}`);
    }
    
    process.exit(0);
  } catch (err) {
    console.error(`\n❌ Erro: ${err.message}`);
    process.exit(1);
  }
}

main();
