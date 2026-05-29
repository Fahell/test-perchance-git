#!/usr/bin/env node

/**
 * Script de release automatizado
 * Uso: node scripts/release.js <version>
 * Exemplo: node scripts/release.js 1.3.0
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.join(__dirname, '..');
const PACKAGE_JSON = path.join(ROOT_DIR, 'package.json');
const CONSTANTS_JS = path.join(ROOT_DIR, 'src/constants.js');
const FOR_PERCHANCE_HTML = path.join(ROOT_DIR, 'for-perchance.html');

function updatePackageJson(version) {
  console.log('📦 Atualizando package.json...');
  const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf-8'));
  pkg.version = version;
  fs.writeFileSync(PACKAGE_JSON, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');
}

function updateConstantsJs(version) {
  console.log('📝 Atualizando constants.js...');
  const content = `// src/constants.js
// Constantes globais do projeto

export const VERSION = 'v${version}';
export const CDN_BASE = \`https://cdn.jsdelivr.net/gh/Fahell/test-perchance-git@v${version}\`;
export const BUNDLE_PATH = \`\${CDN_BASE}/dist/main.bundle.js\`;
`;
  fs.writeFileSync(CONSTANTS_JS, content, 'utf-8');
}

function updateForPerchanceHtml(version) {
  console.log('🎨 Atualizando for-perchance.html...');
  const content = `<!-- For Perchance - HTML Panel -->
<!-- Versão: ${version} (Vite Bundle) -->
<!-- Cole este conteúdo no HTML Panel do seu gerador Perchance -->

<div id="game-container" style="position:relative; width:100vw; height:100vh; overflow:hidden; background:#1a1a1a;"></div>

<!-- Three.js deve ser carregado antes do bundle (dependência externa) -->
<script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js" type="module"></script>

<script type="module">
  // Protege contra execução dupla
  if (window.__RPG_INITIALIZED) {
    console.log('⏭️ Jogo já inicializado. Ignorando re-execução.');
  } else {
    window.__RPG_INITIALIZED = true;
    console.log('📄 HTML Panel injetado, carregando bundle v${version}...');
    
    // Importa o bundle único do GitHub via jsDelivr CDN
    // ⚠️ SEMPRE use tags de versão (ex: @v${version}) para evitar cache do CDN
    import("https://cdn.jsdelivr.net/gh/Fahell/test-perchance-git@v${version}/dist/main.bundle.js")
      .then(module => {
        console.log('✅ Bundle carregado, chamando initGame()...');
        module.initGame();
      })
      .catch(err => {
        console.error('❌ Falha ao carregar bundle:', err);
        console.log('💡 Possíveis causas:');
        console.log('   1. Tag v${version} não existe no GitHub');
        console.log('   2. Cache do CDN jsDelivr (aguarde 10 min ou mude a versão)');
        console.log('   3. Problema de CORS ou rede');
        console.log('   4. Three.js não carregou (verifique se o script do Three.js está acima)');
      });
  }
</script>
`;
  fs.writeFileSync(FOR_PERCHANCE_HTML, content, 'utf-8');
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
    console.error('❌ Não inclua "v" no número da versão. Use: v1.9.0.3.0');
    process.exit(1);
  }
  
  console.log(`\n🚀 Iniciando release v${version}...\n`);
  
  try {
    updatePackageJson(version);
    updateConstantsJs(version);
    updateForPerchanceHtml(version);
    build();
    gitCommitAndTag(version);
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
