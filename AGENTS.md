# AGENTS.md — Instruções para Agentes de IA

Este documento define o contexto operacional obrigatório para qualquer agente de IA que trabalhe neste repositório. Leia antes de executar qualquer ação.

## Ambiente de Desenvolvimento

- **SO de trabalho:** Ubuntu via WSL2 (não Windows nativo)
- **Diretório do projeto:** `/home/rafael/projects/test-perchance-git`
- **Shell:** Bash com PTY persistente via MCP Terminal
- **Node.js:** v22.x | **Python:** 3.14 | **Git:** 2.53+
- **Acesso ao Windows:** Disponível via `/mnt/c/` apenas para leitura de configs do editor. Nunca desenvolva ou execute builds no FS do Windows.

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

## Comandos Úteis

```bash
find src/ -name '*.js' | head -20
npx serve .
git tag -l --sort=-v:refname
```

## Contexto do Domínio

Este projeto modulariza JavaScript ES6 para uso no Perchance (https://perchance.org), plataforma de geração procedural. Os módulos são servidos via GitHub + jsDelivr CDN porque o Perchance não suporta bundlers. Cada módulo em `src/modules/` testa um plugin ou funcionalidade específica do ecossistema Perchance.
