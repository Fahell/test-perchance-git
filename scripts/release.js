#!/usr/bin/env node

/**
 * Script de release automatizado
 * Uso: node scripts/release.js <version>
 * Exemplo: node scripts/release.js 1.3.0
 * 
 * Fluxo:
 * 1. Atualiza constants.js (fonte da verdade)
 * 2. Roda sync-version.cjs (sincroniza todos os arquivos)
 * 3. Roda build (gera bundle)
 * 4. Commit (pre-commit hook roda sync-version novamente)
 * 5. Tag
 * 6. Push
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.join(__dirname, '..');
const CONSTANTS_JS = path.join(ROOT_DIR, 'src/constants.js');

function updateConstantsJs(version) {
  console.log('📝 Atualizando constants.js (fonte da verdade)...');
  const content = `// src/constants.js
// Constantes globais do projeto

export const VERSION = 'v${version}';
export const CDN_BASE = \`https://cdn.jsdelivr.net/gh/Fahell/test-perchance-git@v${version}\`;
export const BUNDLE_PATH = \`\${CDN_BASE}/dist/main.bundle.js\`;
`;
  fs.writeFileSync(CONSTANTS_JS, content, 'utf-8');
  console.log(`✅ constants.js atualizado para v${version}`);
}

function syncAllFiles() {
  console.log('🔄 Sincronizando versão em todos os arquivos...');
  execSync('node scripts/sync-version.cjs', { stdio: 'inherit', cwd: ROOT_DIR });
}

function build() {
  console.log('🔨 Executando build do Vite...');
  execSync('npm run build', { stdio: 'inherit', cwd: ROOT_DIR });
}

function gitCommitAndTag(version) {
  console.log('📝 Fazendo commit e criando tag...');
  execSync('git add .', { cwd: ROOT_DIR });
  execSync(`git commit -m "chore: release v${version}"`, { cwd: ROOT_DIR });
  execSync(`git tag -a v${version} -m "Release v${version} - Vite bundle"`, { cwd: ROOT_DIR });
  console.log(`✅ Tag v${version} criada`);
}

function gitPush(version) {
  console.log('🚀 Fazendo push para o GitHub...');
  execSync('git push origin main', { stdio: 'inherit', cwd: ROOT_DIR });
  execSync(`git push origin v${version}`, { stdio: 'inherit', cwd: ROOT_DIR });
  console.log(`✅ Push completo. CDN jsDelivr irá processar em ~10 minutos.`);
}

function main() {
  const version = process.argv[2];
  
  if (!version) {
    console.error('❌ Uso: node scripts/release.js <version>');
    console.error('   Exemplo: node scripts/release.js 1.3.0');
    process.exit(1);
  }
  
  // Valida formato de versão (sem v)
  if (version.startsWith('v')) {
    console.error('❌ Não inclua "v" no número da versão. Use: 1.9.0');
    process.exit(1);
  }
  
  // Valida formato semver
  const semverRegex = /^\d+\.\d+\.\d+$/;
  if (!semverRegex.test(version)) {
    console.error('❌ Versão deve estar no formato semver (X.Y.Z)');
    console.error('   Exemplo: 1.9.0');
    process.exit(1);
  }
  
  console.log(`\n🚀 Iniciando release v${version}...\n`);
  
  try {
    // 1. Atualiza constants.js (fonte da verdade)
    updateConstantsJs(version);
    
    // 2. Sincroniza todos os arquivos baseado em constants.js
    syncAllFiles();
    
    // 3. Gera bundle
    build();
    
    // 4. Commit (pre-commit hook roda sync-version novamente)
    // 5. Tag
    gitCommitAndTag(version);
    
    // 6. Push
    gitPush(version);
    
    console.log(`\n✅ Release v${version} concluída com sucesso!`);
    console.log(`\n📦 Bundle disponível em:`);
    console.log(`   https://cdn.jsdelivr.net/gh/Fahell/test-perchance-git@v${version}/dist/main.bundle.js`);
    console.log(`\n⏱️  Aguarde ~10 minutos para o CDN jsDelivr processar.`);
  } catch (error) {
    console.error('\n❌ Erro durante o release:', error.message);
    process.exit(1);
  }
}

main();
