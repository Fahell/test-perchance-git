# Changelog

Todas as mudanças notáveis deste projeto serão documentadas neste arquivo.

## [Unreleased]

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
