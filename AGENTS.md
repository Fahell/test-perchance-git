# AGENTS.md — Instruções para Agentes de IA

Este documento define o contexto operacional obrigatório para qualquer agente de IA que trabalhe neste repositório. Leia antes de executar qualquer ação.

## ⚠️ LEITURA OBRIGATÓRIA ANTES DE TUDO

1. **Leia PRIMEIRO:** `~/.ai-agent-instructions.md` (ou `$AI_AGENT_INSTRUCTIONS`) — regras globais do ambiente WSL2
2. **Depois leia este arquivo** — contexto específico deste projeto
3. Em caso de conflito, as regras globais têm precedência

## Ambiente de Desenvolvimento

- **SO de trabalho:** Ubuntu via WSL2 (não Windows nativo)
- **Diretório do projeto:** `/home/rafael/projects/test-perchance-git`
- **Shell:** Zsh com Oh My Zsh + PTY persistente via MCP Terminal
- **Node.js:** v24.x LTS (gerenciado por nvm) | **Python:** 3.12.9 (gerenciado por pyenv) | **Git:** 2.53+
- **GitHub CLI:** `gh` v2.92.0 autenticado via SSH
- **Acesso ao Windows:** Disponível via `/mnt/c/` apenas para leitura de configs do editor. Nunca desenvolva ou execute builds no FS do Windows.

## Ferramentas Disponíveis

| Ferramenta | Versão | Uso Principal |
|---|---|---|
| git | 2.53.0 | Versionamento (SSH) |
| gh | 2.92.0 | GitHub API (PRs, Issues, Releases) |
| node (nvm) | v24.16.0 LTS | Runtime JavaScript |
| python (pyenv) | 3.12.9 | Runtime Python |
| rg (ripgrep) | 15.1.0 | Busca de código rápida |
| fd (fd-find) | 10.3.0 | Busca de arquivos rápida |
| bat | 0.25.0 | `cat` com syntax highlighting |
| eza | 0.23.4 | `ls` moderno com ícones e git status |
| jq / yq | 1.8.1 / 3.4.3 | Manipulação JSON / YAML |
| htop | 3.4.1 | Monitor de processos |
| tmux | 3.6a | Multiplexador de terminal |
| httpie | 3.2.4 | Cliente HTTP human-friendly |
| pass | 1.7.4 | Gerenciador de senhas GPG |
| docker | 29.5.2 | Containers isolados + docker compose |
| fzf | 0.67.0 | Busca fuzzy (Ctrl+R historico, Ctrl+T arquivos, Alt+C dirs) |
| direnv | 2.37.1 | Variaveis de ambiente por projeto automatico (.envrc) |

### Aliases de Workflow

- `gs` = git status | `gl` = git log --oneline --graph -20 | `gd` = git diff
- `gp` = git push | `gc` = git commit -m | `ga` = git add
- `ll` = eza -la --icons --git | `lt` = tree -L 2 --dirsfirst
- `proj` = cd ~/projects | `agent-help` = exibe instruções globais

## Fluxo de Trabalho Obrigatório

1. Todas as edições, builds, testes e operações Git devem ser executadas dentro do WSL2
2. O editor acessa os arquivos via `\\wsl$\Ubuntu\home\rafael\projects\test-perchance-git` (mesmo FS, sem cópia)
3. Push via SSH: `git@github.com:Fahell/test-perchance-git.git`
4. Deploy via tag: crie tag anotada → push da tag → jsDelivr serve automaticamente

## Estrutura do Projeto

- `src/main.js` — Entry point (importa e inicializa módulos)
- `src/perchance-bridge.js` — Ponte segura para API root/listas do Perchance
- `src/modules/*.js` — Módulos independentes (renderer, lógica, testes de plugins)
- `for-perchance.html` — HTML Panel para copiar/colar no Perchance
- `for-perchance-list-panel.txt` — List Panel para copiar/colar no Perchance
- `test-local.html` — Teste local fora do Perchance (abrir no navegador)

## Regras de Versionamento

- Tags seguem semver: `vMAJOR.MINOR.PATCH`
- Sempre use tags anotadas: `git tag -a vX.Y.Z -m "descrição"`
- Sempre faça push da tag: `git push origin vX.Y.Z`
- Após criar tag, atualize a URL no `for-perchance.html`:
  ```js
  await import("https://cdn.jsdelivr.net/gh/Fahell/test-perchance-git@vX.Y.Z/src/main.js")
  ```
- Commits seguem Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`

## Restrições Defensivas

- Nunca execute comandos destrutivos sem confirmação explícita
- Nunca modifique arquivos em `/mnt/c/` exceto configs do editor quando solicitado
- Plugins do Perchance exigem contexto DOM específico; erros de `null.dataset` são limitações conhecidas (ver README)
- O jsDelivr cacheia por tag; nunca confie em URLs sem versão (`@main`) para produção
- Valide `git status` antes de qualquer operação de merge/rebase

## Scripts do Projeto

Todos os scripts estão em `scripts/` e devem ser executados diretamente no WSL2:

| Script | Função | Uso |
|---|---|---|
| `scripts/dev-server.sh` | Servidor HTTP local para testes | `./scripts/dev-server.sh [porta]` |
| `scripts/sync.sh` | Sincroniza com repositório remoto | `./scripts/sync.sh` |
| `scripts/setup.sh` | Configura hooks e verifica ferramentas | `./scripts/setup.sh` |
| `scripts/release.sh` | Cria tag, atualiza versão e push | `./scripts/release.sh vX.Y.Z` |
| `scripts/check-cdn.sh` | Verifica disponibilidade na CDN jsDelivr | `./scripts/check-cdn.sh vX.Y.Z` |

> ⚠️ **Nota:** Os wrappers `.bat` foram removidos. Execute os scripts `.sh` diretamente.
> O `dev-server.sh` usa `python` (pyenv shim), não `python3`.

## Comandos Úteis

```bash
find src/ -name '*.js' | head -20
./scripts/dev-server.sh
git tag -l --sort=-v:refname
```

## Contexto do Domínio

Este projeto modulariza JavaScript ES6 para uso no Perchance (https://perchance.org), plataforma de geração procedural. Os módulos são servidos via GitHub + jsDelivr CDN porque o Perchance não suporta bundlers. Cada módulo em `src/modules/` testa um plugin ou funcionalidade específica do ecossistema Perchance.

## 🔒 Security Controls (Project-Level Reference)

This project inherits all global security controls from `~/.ai-agent-instructions.md`. Key reminders:

- **NEVER use `rm`** — Use `del` (trash-cli) for safe deletion
- **Git pre-commit hook is active** — Blocks `.env`, `.pem`, `.key`, `.credentials` files and hardcoded secrets
- **Escape hatch**: `command rm` only with explicit user confirmation and logged intent
- For full security policy, run: `agent-help` or read `$AI_AGENT_INSTRUCTIONS`

## ⚡ Startup Otimizado (Lazy-Loading)

O Zsh foi otimizado para startup rápido (<0.25s). NVM e pyenv usam **lazy-loading**: os binários `node`, `npm`, `npx`, `python`, `pip` são funções shell que carregam o runtime apenas na primeira invocação. Isso é transparente para uso normal, mas esteja ciente:

- A **primeira** chamada a `node`/`python` em uma sessão terá ~300ms adicionais (carregamento do runtime)
- Chamadas subsequentes são instantâneas
- Se precisar do runtime carregado explicitamente: `__load_nvm` ou `__load_pyenv`
- Oh My Zsh auto-update está desativado (`zstyle ':omz:update' mode disabled`)

## 🔧 Aliases de Portabilidade

| Alias | Aponta Para | Motivo |
|-------|-------------|--------|
| `fd` | `fdfind` | Ubuntu nomeia o binário como `fdfind`; alias garante compatibilidade cross-distro |
| `ff` | `fdfind --type f` | Busca rápida apenas arquivos |

## 🪝 Git Pre-Commit Hook: Automação de Versionamento

O projeto possui um hook de pre-commit que automatiza a atualização de versões em múltiplos arquivos.

### Comportamento do Hook

**O hook só atualiza as versões automaticamente se houver alterações em `src/constants.js`.**

Quando `constants.js` é modificado, o hook automaticamente:
- Atualiza a versão em `package.json`
- Atualiza URLs de versão em `for-perchance.html`
- Sincroniza outras referências de versão no projeto

### Fluxo Correto para Releases

1. **Atualize `src/constants.js`** com a nova versão:
   ```javascript
   export const VERSION = '1.4.0';
   ```

2. **Faça commit** - o hook detectará a mudança em `constants.js` e atualizará os outros arquivos automaticamente

3. **Adicione os arquivos atualizados pelo hook** e faça o commit final:
   ```bash
   git add .
   git commit -m "chore: release v1.4.0"
   ```

4. **Crie a tag e faça push**:
   ```bash
   git tag -a v1.4.0 -m "Release v1.4.0"
   git push origin main --tags
   ```

### ⚠️ Importante

- **Nunca** crie uma tag sem antes atualizar `constants.js`
- Se você esquecer de atualizar `constants.js`, o hook **não** atualizará as versões nos outros arquivos
- Sempre verifique se `constants.js`, `package.json` e `for-perchance.html` estão com a mesma versão antes de criar a tag
- O hook é o mecanismo oficial de sincronização de versões; não edite manualmente `package.json` ou `for-perchance.html` para atualizar versões

### Exemplo de Erro Comum

❌ **Errado:**
```bash
# Atualiza apenas package.json manualmente
npm version 1.4.0
git tag -a v1.4.0 -m "Release v1.4.0"
# constants.js ainda está em 1.3.0! O hook não foi acionado.
```

✅ **Correto:**
```bash
# Atualiza constants.js primeiro
sed -i "s/VERSION = '1.3.0'/VERSION = '1.4.0'/" src/constants.js
git add src/constants.js
git commit -m "chore: release v1.4.0"
# Hook atualiza package.json e for-perchance.html automaticamente
git add .
git commit --amend --no-edit
git tag -a v1.4.0 -m "Release v1.4.0"
git push origin main --tags
```
