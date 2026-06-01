#!/usr/bin/env node
/**
 * Script de release automatizado
 * Uso: node scripts/release.js <version>
 * Exemplo: node scripts/release.js 1.3.0
 * 
 * Fluxo:
 * 1. Valida estado limpo do repositório
 * 2. Valida branch main (evita tags desvinculadas)
 * 3. Atualiza constants.js (fonte da verdade)
 * 4. Roda sync-version.cjs (sincroniza todos os arquivos)
 * 5. Roda build (gera bundle)
 * 6. Commit (pre-commit hook roda sync-version novamente)
 * 7. Tag
 * 8. Pull --rebase + Push
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.join(__dirname, '..');
const CONSTANTS_JS = path.join(ROOT_DIR, 'src/constants.js');

function checkCleanState() {
  console.log('🔍 Verificando estado do repositório...\n');
  
  // 1. Verifica se há mudanças não commitadas
  const status = execSync('git status --porcelain', { cwd: ROOT_DIR }).toString().trim();
  if (status) {
    console.error('❌ Working tree tem mudanças não commitadas.');
    console.error('\nArquivos modificados:');
    console.error(status);
    console.error('\n👉 Faça commit ou stash das mudanças antes de rodar o release.');
    console.error('   Comandos úteis:');
    console.error('   - git add . && git commit -m "wip: changes before release"');
    console.error('   - git stash');
    process.exit(1);
  }
  console.log('✅ Working tree limpo');
  
  // 2. Verifica se o local está atrás do remote
  try {
    console.log('🔄 Sincronizando com o remote...');
    execSync('git fetch origin', { cwd: ROOT_DIR, stdio: 'pipe' });
    
    const behind = execSync('git rev-list HEAD..origin/main --count', { cwd: ROOT_DIR }).toString().trim();
    const ahead = execSync('git rev-list origin/main..HEAD --count', { cwd: ROOT_DIR }).toString().trim();
    
    if (parseInt(behind) > 0) {
      console.error(`\n❌ Branch local está ${behind} commit(s) atrás do remote.`);
      console.error('\n👉 Execute "git pull --rebase origin main" antes de rodar o release.');
      console.error('   Ou o script fará isso automaticamente durante o push.');
      console.error('\n⚠️  Se você continuar, o script tentará fazer pull --rebase automaticamente.');
      console.error('   Se houver conflitos, o release será abortado.');
      
      // Pergunta se quer continuar
      console.log('\nContinuando com o release (pull --rebase será feito no push)...\n');
    }
    
    if (parseInt(ahead) > 0) {
      console.log(`✅ Branch local está ${ahead} commit(s) à frente do remote`);
    } else {
      console.log('✅ Branch local está sincronizado com o remote');
    }
  } catch (error) {
    console.warn('⚠️  Não foi possível verificar o estado do remote:', error.message);
    console.warn('   Continuando com o release...\n');
  }
  
  console.log('');
}

function checkMainBranch() {
  console.log('🔍 Verificando branch atual...\n');
  
  try {
    const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: ROOT_DIR }).toString().trim();
    
    if (currentBranch !== 'main') {
      console.error(`❌ Release deve ser executado na branch 'main'.`);
      console.error(`   Branch atual: ${currentBranch}`);
      console.error('\n👉 Fluxo correto:');
      console.error('   1. git checkout main');
      console.error('   2. git merge <sua-feature-branch> --no-ff');
      console.error('   3. npm run release X.Y.Z');
      console.error('\n⚠️  Release abortado para evitar tags desvinculadas.');
      process.exit(1);
    }
    
    console.log('✅ Branch atual: main\n');
  } catch (error) {
    console.warn('⚠️  Não foi possível verificar a branch atual:', error.message);
    console.warn('   Continuando com o release...\n');
  }
}

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
  console.log('🧹 Limpando cache do Vite...');
  execSync('rm -rf dist node_modules/.vite', { cwd: ROOT_DIR });
  console.log('✅ Cache limpo');
  console.log('🔨 Executando build do Vite...');
  execSync('npm run build', { stdio: 'inherit', cwd: ROOT_DIR });
}

function gitCommitAndTag(version) {
  console.log('📝 Fazendo commit e criando tag...');
  
  // 1. Verifica se a tag já existe
  try {
    const tagExists = execSync(`git tag -l v${version}`, { cwd: ROOT_DIR }).toString().trim();
    if (tagExists) {
      console.error(`\n❌ Tag v${version} já existe!`);
      console.error('\n👉 Opções:');
      console.error(`   - Delete a tag: git tag -d v${version} && git push origin :v${version}`);
      console.error('   - Use uma versão diferente');
      process.exit(1);
    }
  } catch (error) {
    // Tag não existe, podemos continuar
  }
  
  // 2. Adiciona mudanças
  execSync('git add .', { cwd: ROOT_DIR });
  
  // 3. Verifica se há mudanças para commitar
  const status = execSync('git status --porcelain', { cwd: ROOT_DIR }).toString().trim();
  
  if (!status) {
    console.log('ℹ️  Nenhuma mudança para commitar (arquivos já sincronizados)');
    console.log(`✅ Pulando commit, criando apenas a tag v${version}`);
  } else {
    // 4. Faz commit
    try {
      execSync(`git commit -m "chore: release v${version}"`, { cwd: ROOT_DIR });
      console.log(`✅ Commit criado: chore: release v${version}`);
    } catch (error) {
      console.error('\n❌ Erro ao criar commit:', error.message);
      console.error('\n👉 Possíveis causas:');
      console.error('   1. Pre-commit hook falhou - verifique os erros acima');
      console.error('   2. Nenhuma mudança para commitar');
      console.error('\n👉 Comandos úteis:');
      console.error('   - git status (para ver o estado atual)');
      console.error('   - git diff --cached (para ver mudanças staged)');
      process.exit(1);
    }
  }
  
  // 5. Cria tag
  try {
    execSync(`git tag -a v${version} -m "Release v${version} - Vite bundle"`, { cwd: ROOT_DIR });
    console.log(`✅ Tag v${version} criada`);
  } catch (error) {
    console.error(`\n❌ Erro ao criar tag v${version}:`, error.message);
    process.exit(1);
  }
}

function gitPush(version) {
  console.log('🚀 Fazendo push para o GitHub...');
  
  try {
    // 1. Tenta fazer pull --rebase para evitar conflitos
    console.log('🔄 Fazendo pull --rebase origin main...');
    execSync('git pull --rebase origin main', { stdio: 'inherit', cwd: ROOT_DIR });
    console.log('✅ Rebase concluído com sucesso');
  } catch (error) {
    console.error('\n❌ Erro durante o pull --rebase.');
    console.error('\n👉 Possíveis causas:');
    console.error('   1. Conflitos de merge - resolva manualmente e execute "git rebase --continue"');
    console.error('   2. Problemas de conexão com o GitHub');
    console.error('\n👉 Comandos úteis:');
    console.error('   - git rebase --abort (para cancelar o rebase)');
    console.error('   - git status (para ver o estado atual)');
    console.error('\n⚠️  Release abortado. Resolva os conflitos e tente novamente.');
    process.exit(1);
  }
  
  // 2. Push do branch main
  try {
    execSync('git push origin main', { stdio: 'inherit', cwd: ROOT_DIR });
    console.log('✅ Push do branch main concluído');
  } catch (error) {
    console.error('\n❌ Erro ao fazer push do branch main.');
    console.error('Erro:', error.message);
    process.exit(1);
  }
  
  // 3. Push da tag
  try {
    execSync(`git push origin v${version}`, { stdio: 'inherit', cwd: ROOT_DIR });
    console.log(`✅ Push da tag v${version} concluído`);
  } catch (error) {
    console.error(`\n❌ Erro ao fazer push da tag v${version}.`);
    console.error('Erro:', error.message);
    console.error('\n⚠️  O branch foi enviado, mas a tag falhou. Execute manualmente:');
    console.error(`   git push origin v${version}`);
    process.exit(1);
  }
  
  console.log(`\n✅ Push completo. CDN jsDelivr irá processar em ~10 minutos.`);
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
    // 0. Valida estado limpo do repositório
    checkCleanState();
    
    // 0.1 Valida branch main
    checkMainBranch();
    
    // 1. Atualiza constants.js (fonte da verdade)
    updateConstantsJs(version);
    
    // 2. Sincroniza todos os arquivos baseado em constants.js
    syncAllFiles();
    
    // 3. Gera bundle
    build();
    
    // 4. Commit (pre-commit hook roda sync-version novamente)
    // 5. Tag
    gitCommitAndTag(version);
    
    // 6. Pull --rebase + Push
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
