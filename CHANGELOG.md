# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [1.2.3] - 2025-01-21

### Corrigido
- **Diagnóstico melhorado**: `main.js` agora carrega módulos sequencialmente (não em paralelo) para identificar qual módulo falha
- Logs detalhados para cada etapa de carregamento
- Mensagens de erro na tela quando inicialização falha
- Stack traces completos no console

### Adicionado
- Função `loadModule()` com diagnóstico avançado (tenta fetch para verificar se arquivo existe)
- Tratamento de erro em `initTestModules()` para canvasTest e raycasterTest
- Mensagem de erro visual na tela quando jogo falha ao iniciar

---

## [1.2.2] - 2025-01-21

### Corrigido
- **Problema crítico**: Imports estáticos no topo do `main.js` causavam erro de "does not provide an export named"
- Todos os imports de módulos de teste agora são **dinâmicos** (`await import()`)
- URLs de import atualizadas para `@v1.2.2` em todos os arquivos
- `ui-test.js` atualizado para versão `@v1.2.2`

### Alterado
- `main.js` agora usa 100% imports dinâmicos para módulos de teste
- Removidos imports estáticos que causavam incompatibilidade com cache do jsDelivr
- Documentação atualizada com instruções claras de versionamento

### Notas Técnicas
- Tags Git são imutáveis: ao fazer mudanças, SEMPRE crie uma nova tag
- jsDelivr cacheia tags por até 12h; use `?v=` ou mude a tag para forçar refresh
- Imports estáticos no topo do arquivo são resolvidos antes do código executar, causando falhas se houver erro em qualquer módulo

---

## [1.2.0] - 2025-01-21

### Adicionado
- Novo módulo `tts-test.js` para testar o plugin text-to-speech
- Novo módulo `dice-test.js` para testar o plugin dice (rolagem de dados RPG)
- Novo módulo `rpg-icon-test.js` para testar o plugin rpg-icon (~500 ícones)
- Novo módulo `pattern-test.js` para testar o plugin pattern-maker
- Novo módulo `kv-test.js` para testar o plugin kv (key-value storage)
- Novo módulo `seeder-test.js` para testar o plugin seeder (seeds copiáveis)
- Preview visual de imagens geradas pelo plugin text-to-image
- Container de preview para RPG Icons no canto superior direito
- Container de preview para Pattern Maker no centro inferior
- Botões agrupados por categoria no painel de testes (IA, RPG, Áudio, Seeds, Persistência)

### Alterado
- `image-test.js` agora exibe imagem gerada em container visual com informações
- `ui-test.js` reorganizado com 12 botões de teste em categorias
- `main.js` atualizado para importar e passar todos os módulos de teste
- URLs de import atualizadas para @v1.2.0

### Corrigido
- Material do cubo alterado para `MeshStandardMaterial` para permitir mudança de cor

---

## [1.1.3] - 2025-01-20

### Corrigido
- Nome do método do AI Text test corrigido de `testBasicText` para `generateBasic`
- Adicionada verificação de disponibilidade (`available`) em todos os módulos de teste
- Tratamento de erros melhorado no painel de testes

---

## [1.1.2] - 2025-01-20

### Corrigido
- Tratamento do retorno do plugin text-to-image (retorna String object, não primitiva)
- Adicionado método `_extractImageUrl()` para extrair URL corretamente de diferentes formatos
- Mensagens de erro mais informativas quando geração de imagem falha

---

## [1.1.1] - 2025-01-20

### Corrigido
- API de listas: `selectUnique` não existe nativamente, implementado fallback seguro
- Tratamento de erros em todos os módulos de teste com try/catch
- Verificação de null/undefined antes de chamar métodos de teste

### Alterado
- Mensagens de log mais detalhadas para debug
- Fallback para `selectMany` + `Set` quando `selectUnique` não disponível

---

## [1.1.0] - 2025-01-20

### Adicionado
- Módulo `ai-text-test.js` para testar o plugin ai-text-plugin
- Módulo `image-test.js` para testar o plugin text-to-image-plugin
- Módulo `lists-test.js` para testar listas avançadas (selectMany, selectUnique, consumableList)
- Módulo `raycaster-test.js` para testar clique em objetos 3D com Raycaster
- Módulo `state-test.js` para testar persistência com localStorage
- Módulo `canvas-test.js` para testar Canvas 2D + integração com Three.js
- Painel de testes expandido com 9 botões organizados por categoria

### Alterado
- `main.js` agora importa dinamicamente o módulo ui-test
- `ui-test.js` refatorado para receber rendererData e testModules como parâmetros

---

## [1.0.2] - 2025-01-19

### Corrigido
- Material do cubo alterado de `MeshNormalMaterial` para `MeshStandardMaterial`
- URLs de import alteradas para absolutas com tags de versão
- Cache do jsDelivr bypassado usando tags em vez de branches

---

## [1.0.1] - 2025-01-19

### Corrigido
- Adicionada proteção contra execução duplicada com sessionStorage
- Mensagem de loading agora é removida corretamente
- Canvas do Three.js com z-index correto

---

## [1.0.0] - 2025-01-19

### Adicionado
- Estrutura inicial do projeto modular
- `main.js` como entry point
- `perchance-bridge.js` para acesso seguro ao root do Perchance
- `renderer.js` com setup básico do Three.js
- `logic.js` com lógica de jogo
- `ui-test.js` com painel de testes básico
- Documentação completa no README.md
- Arquivos de exemplo para HTML Panel e List Panel

---

## [0.1.0] - 2025-01-18

### Adicionado
- Projeto inicial de teste
- Prova de conceito de modularização com ES Modules
- Integração básica com jsDelivr CDN
