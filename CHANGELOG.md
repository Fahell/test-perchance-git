# Changelog

Todas as mudanças notáveis deste projeto serão documentadas neste arquivo.

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
