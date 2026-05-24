
### 🐛 Correções

#### constants.js
- Adicionada exportação `CDN_BASE` (estava faltando)
- `CDN_BASE` é derivado dinamicamente de `VERSION`

#### ui-test.js
- Import do `perchance-bridge.js` atualizado de v1.2.9 para v1.2.13
- Correção de erro: "The requested module '../constants.js' does not provide an export named 'CDN_BASE'"

## [1.2.13] - 2026-05-24

### 🔄 Simplificação do Git Hook

#### Pre-commit Hook
- Refatorado para **sempre executar** `sync-version.js` (idempotente)
- Código simplificado de 42 linhas para 15 linhas
- Elimina risco de drift de versão (consistência absoluta garantida)
- Overhead mínimo (~50ms por commit)

#### Decisão Arquitetural
- Correctness > Efficiency
- Hook idempotente é mais confiável que detecção condicional

# Changelog

Todas as mudanças notáveis deste projeto serão documentadas neste arquivo.

## [1.2.12] - 2026-05-24

### 🔄 Expansão do Script de Sincronização

#### sync-version.js Expandido
- Script agora sincroniza **3 arquivos** (antes apenas 1):
  - `for-perchance.html` — URLs CDN e comentários HTML
  - `README.md` — Título do projeto (linha 1)
  - `src/main.js` — Comentário de versão e BASE_URL
- Detecção e atualização automática de múltiplos formatos de versão
- Output detalhado mostrando quais arquivos foram atualizados
- Idempotente: só altera o que está desatualizado

#### Git Hook Pre-commit
- Hook executa `sync-version.js` automaticamente antes de cada commit
- Garante que todos os arquivos estejam sincronizados com `constants.js`
- Zero overhead: só executa no momento do commit
- Documentação atualizada em `scripts/git-hooks/README.md`

### 🎯 Benefícios
- **Single source of truth** — Altere apenas `constants.js` e tudo é atualizado
- **Consistência garantida** — README, main.js e for-perchance.html sempre alinhados
- **Zero trabalho manual** — Hook automático elimina passos esquecidos
- **Feedback claro** — Script mostra exatamente o que foi alterado

### 📝 Documentação
- README.md atualizado com lista completa de arquivos sincronizados
- Exemplos de output do script expandido

## [1.2.11] - 2026-05-24
## [1.2.11] - 2026-05-24

### 🤖 Automação Avançada

#### watch-version.js Script (#12)
- Novo script `scripts/watch-version.js` para sincronização automática em tempo real
- Monitora `src/constants.js` via `fs.watch` nativo do Node.js
- Executa `sync-version.js` automaticamente quando detecta mudanças
- Debounce de 500ms para evitar execuções múltiplas em saves rápidos
- Proteção contra execuções concorrentes
- Graceful shutdown (Ctrl+C via handlers SIGINT/SIGTERM)
- Initial sync ao iniciar para garantir consistência
- Feedback visual com emojis e logs claros no terminal

### 🎯 Benefícios
- **Zero passos manuais** — Edite `constants.js` e o sync acontece automaticamente
- **Sem dependências** — Usa apenas APIs nativas do Node.js
- **Dev-friendly** — Deixe rodando em um terminal separado durante desenvolvimento
- **Workflow otimizado** — Editar → Salvar → Sync automático → Commit

### 📝 Documentação
- README atualizado com seção "Modo Automático (Recomendado)"
- Exemplos de uso e output do watcher
- Workflow recomendado com 2 terminais (watcher + desenvolvimento)


## [1.2.10] - 2026-05-24

### ⚙️ Automação de Versão

#### sync-version.js Script (#10)
- Novo script `scripts/sync-version.js` para sincronização automática de versões
- Lê `VERSION` de `src/constants.js` e atualiza `for-perchance.html`
- Suporta formatos com e sem prefixo `v` (`v1.2.10` e `1.2.10`)
- Idempotente: não faz alterações se já estiver sincronizado
- Mostra diff das alterações quando atualizações são feitas
- Documentação completa adicionada ao README.md

### 🎯 Benefícios
- Elimina erros manuais de sincronização de versão CDN
- Consistência garantida entre `constants.js` e `for-perchance.html`
- Workflow de release simplificado: editar `constants.js` → rodar script → commit


## [1.2.9] - 2026-05-24

### ✨ Nova Categoria: Visualização de Dados

#### ApexCharts Integration (#7)
- Novo módulo `src/modules/apexcharts-test.js` com 4 tipos de gráficos SVG
- **Bar Chart**: Stats de RPG (STR, DEX, CON, etc.) com cores distribuídas
- **Area Chart**: HP Player vs Enemy ao longo de 20 turnos
- **Donut Chart**: Distribuição de classes (Warrior, Mage, Rogue, etc.)
- **Radar Chart**: Comparação de atributos Player vs NPC
- Carregamento lazy via CDN (apenas quando solicitado)
- Container modal com tema dark e animações suaves
- Nova categoria "📊 Visualização" no painel de testes

#### Integração (#8)
- Adicionado `apexchartsTest` ao mapeamento `TEST_MODULES` no main.js
- CSS atualizado com nova cor `--ui-color-viz` (#f39c12)
- 4 novos handlers no ui-test.js para gráficos

### 📊 Stress Test Objetivos
- Carregamento dinâmico de libs de terceiros via CDN
- Renderização SVG pesada dentro do Perchance
- Modais overlay sobre o painel de testes
- Integração com design system existente

## [1.2.8] - 2026-05-24

### ✨ UI do Perchance — Reorganização Completa

#### Design System & CSS (#2)
- Extraídos todos os estilos inline para `src/styles/ui-test.css`
- Criados design tokens em variáveis CSS (`:root`) para cores, espaçamento, tipografia, bordas e sombras
- Classes semânticas substituem inline styles (`.ui-test-btn`, `.ui-test-category`, `.ui-test-log-entry`)
- Stylesheet injetado dinamicamente via jsDelivr CDN com deduplicação
- Log estruturado com elementos DOM e classes de tipo (`--success`, `--error`, `--warning`, `--info`)

#### Status por Botão (#3)
- Wrapper universal `runTest(btnId, testFn)` gerencia estado automaticamente
- Cada botão exibe indicador visual: ⏳ executando, ✅ sucesso, ❌ erro
- Classes CSS dedicadas: `--running` (dimmed), `--success` (green glow), `--error` (red glow)
- Todos os 17 handlers refatorados para usar `runTest()` com feedback visual imediato

#### Controles Globais & Log Estruturado (#4)
- **▶ Todos**: Executa todos os 15 testes sequencialmente (300ms delay entre cada)
- **🗑 Limpar**: Reseta log e status de todos os botões
- **📋 Exportar**: Copia resultados formatados com timestamps para clipboard
- Log com timestamps `[HH:MM:SS]`, cores por tipo e histórico em `testResults[]`
- Categorias reorganizadas por domínio funcional: Geração, IA, Renderização, Dados & Estado

#### Versão Dinâmica (#5)
- Criado `src/constants.js` como fonte única de verdade para versionamento
- `VERSION` e `CDN_BASE` exportados centralizadamente
- `ui-test.js` importa versão dinamicamente, eliminando strings hardcoded
- `CSS_URL` derivado automaticamente de `CDN_BASE`

#### Templates do Perchance (#6)
- Atualizadas referências hardcoded em `for-perchance.html` e `for-perchance-list-panel.txt` para v1.2.8
- URLs da CDN atualizadas de `@v1.2.7` para `@v1.2.8`


### 🐛 Correções
- **pattern-test.js**: Checks defensivos de DOM, try/catch em todos os métodos de geração e preview com fallback seguro (#1)

### 📝 Documentação
- Adicionado `AGENTS.md` com contexto operacional completo para agentes de IA
- Documentado inventário de ferramentas (Docker, fzf, direnv, ripgrep, fd, bat, eza)
- Documentada otimização de startup do zsh e alias `fd`
- Adicionada referência de controles de segurança

### 🔧 Refatoração
- Removidos wrappers `.bat`, `dev-server.sh` agora usa Python HTTP Server
- Scripts documentados no AGENTS.md

## [1.2.7] - 2025-01-22

### 📝 Documentação
- Atualizada versão no README para 1.2.7

### 🔧 Chore
- Bump de versão para 1.2.7
- Automação de ambiente de desenvolvimento

## [1.2.6] - 2025-01-22

### 📝 Documentação
- Documentada limitação conhecida do pattern plugin (erro de `dataset` fora do DOM Perchance)
- Melhorados logs de diagnóstico

## [1.2.5] - 2025-01-22

### 🐛 Correções Críticas de API

#### KV Plugin
- **Corrigido**: API incorreta `root.kv.set()` → `root.kv.folderName.set()`
- **Novo**: Método `initStore()` para inicializar o folder
- **Novo**: Métodos `listKeys()`, `deleteValue()`, `updateValue()`
- **Documentação**: https://perchance.org/kv-plugin

#### Seeder Plugin
- **Corrigido**: `generateSeed()` retornava vazio
- **Novo**: `applySeed(seedText)` configura seed global
- **Novo**: `demonstrateReproducibility()` prova que mesma seed = mesmos resultados
- **Novo**: `resetSeed()` volta para aleatoriedade normal
- **Documentação**: https://perchance.org/seeder-plugin

#### Pattern Maker Plugin
- **Corrigido**: `generateBasicPattern()` falhava por falta de opções
- **Novo**: `generateEmojiPattern()` com grid de emojis exemplo
- **Novo**: `generateCustomPattern(width, height, n, symmetry)`
- **Novo**: `generateTileablePattern()` para padrões periódicos
- **Novo**: Preview visual automático no canto inferior direito
- **Documentação**: https://perchance.org/pattern-maker-plugin
- **⚠️ Limitação Conhecida**: O padrão é gerado com sucesso, mas a renderização automática pode falhar com erro `Cannot read properties of null (reading 'dataset')`. Isso acontece porque o plugin espera um contexto DOM específico do Perchance que não existe quando chamado via JavaScript puro. O teste é mantido para validação da API e documentação.

#### RPG Icon Plugin
- **Corrigido**: `getMultipleIcons()` tentava usar `evaluateItem` (não existe)
- **Corrigido**: Plugin retorna HTML string diretamente, não objeto
- **Novo**: Grid de preview visual no canto superior direito
- **Novo**: `demonstrateUsage()` mostra exemplo de inventário HTML
- **Documentação**: https://perchance.org/rpg-icon-plugin

#### TTS Plugin
- **Corrigido**: `stopSpeech()` tentava método inexistente no plugin
- **Novo**: Fallback para Web Speech API nativa (`window.speechSynthesis.cancel()`)
- **Novo**: `getAvailableVoices()` lista vozes do navegador
- **Novo**: `speakWithVoice()` para selecionar voz específica
- **Documentação**: https://perchance.org/text-to-speech-plugin

### 📝 Documentação
- Adicionados links para documentação oficial de cada plugin
- Exemplos de uso baseados na documentação oficial
- Comentários explicativos em cada módulo

### 🔧 Melhorias Técnicas
- Todos os módulos agora têm método `checkAPI()` para diagnóstico
- Logs mais claros com dicas de troubleshooting
- Fallbacks automáticos quando API é diferente do esperado

## [1.2.4] - 2025-01-22

### 🔧 Melhorias

- Carregamento sequencial de módulos para melhor diagnóstico
- Logs detalhados em cada etapa de carregamento
- Mensagem de erro visual na tela quando falha

## [1.2.3] - 2025-01-22

### 🔧 Melhorias

- Conversão de todos os imports de módulos de teste para dinâmicos
- Isolamento de erros por módulo

## [1.2.2] - 2025-01-22

### 🐛 Correções

- Corrigido erro de exports em módulos de teste

## [1.2.0] - 2025-01-22

### ✨ Novos Recursos

- 12 módulos de teste completos
- Preview visual de imagens geradas
- Testes de plugins: AI Text, Image, TTS, Dice, RPG Icon, Pattern, KV, Seeder

## [1.1.3] - 2025-01-21

### 🐛 Correções

- Corrigido nome do método AI Text

## [1.1.2] - 2025-01-21

### 🐛 Correções

- Corrigido tratamento do retorno do plugin de imagem

## [1.1.1] - 2025-01-21

### 🐛 Correções

- Corrigido API de listas (selectUnique)
- Melhor tratamento de erros

## [1.1.0] - 2025-01-21

### ✨ Novos Recursos

- 6 novos módulos de teste (TTS, Dice, RPG Icon, Pattern, KV, Seeder)
- Painel de testes expandido com 12 botões

## [1.0.2] - 2025-01-20

### 🐛 Correções

- Material do cubo alterado para MeshStandardMaterial

## [1.0.1] - 2025-01-20

### 🐛 Correções

- Debug logs para interação com cubo 3D

## [1.0.0] - 2025-01-20

### ✨ Lançamento Inicial

- Arquitetura modular com ES Modules
- Integração com Three.js
- Ponte para Perchance (perchance-bridge.js)
- 6 módulos de teste iniciais

## [v1.2.15] - 2026-05-24

### Fixed
- Fixed CSS path in ui-test.js (added /src/ to CDN URL)
  - CSS was not loading because path was missing /src/ directory
  - Panel styles (position, z-index, colors) now apply correctly
  - Panel should now be visible in Perchance

