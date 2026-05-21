# Changelog - Testes Perchance Modularizados

## v1.1.1 - Correções de API de Listas e Tratamento de Erros (2026-05-21)

### 🐛 Correções

#### `lists-test.js`
- ✅ Corrigido erro `selectUnique is not a function`
- ✅ Adicionado fallback seguro para quando `selectUnique` não está disponível
- ✅ Verificação de tipo antes de chamar métodos (`typeof list.selectUnique === 'function'`)
- ✅ Melhor tratamento de erro com try/catch em todos os testes
- ✅ Adicionado teste `testGetAllKeys()` para listar todas as chaves disponíveis
- ✅ Logs mais detalhados para diagnóstico

#### `image-test.js`
- ✅ Melhor tratamento de erro para `fetch_failure` (problema do servidor Perchance)
- ✅ Mensagens de erro mais claras com dicas de troubleshooting
- ✅ Logs explicando possíveis causas do erro (limite de uso, problema temporário, prompt inválido)
- ✅ Retorno seguro (`null`) em caso de falha

#### `ui-test.js`
- ✅ Atualizado para v1.1.1
- ✅ Chamadas corrigidas para `listsTest.testSelectUnique()` (agora retorna array)
- ✅ Verificação de null/undefined antes de chamar métodos dos testes
- ✅ Logs mais seguros com fallbacks

### 📝 Notas Técnicas

#### API de Listas do Perchance
A documentação oficial confirma que:
- `root.listName.selectOne` - retorna um item aleatório
- `root.listName.selectMany(n)` - retorna array de n itens (pode repetir)
- `root.listName.selectUnique(n)` - retorna array de n itens únicos
- `root.listName.consumableList` - retorna lista consumível

**Importante**: Quando o método não está disponível (ex: fallback), o código agora usa alternativas seguras.

#### Problema do Image Plugin
O erro `fetch_failure` é causado por:
1. Limite de uso do plugin (conta não logada)
2. Problema temporário no servidor do Perchance
3. Timeout na requisição

**Solução**: Fazer login no Perchance ou aguardar alguns minutos e tentar novamente.

---

## v1.1.0 - Testes Expandidos (2026-05-21)

### ✨ Novos Módulos

1. **`ai-text-test.js`** - Teste do plugin AI Text
   - Geração básica de texto
   - Streaming com `onChunk`
   - `startWith` e `stopSequences`

2. **`image-test.js`** - Teste do plugin Image
   - Geração com prompt, seed, negativePrompt
   - Exibição de imagem no DOM

3. **`lists-test.js`** - Teste de listas avançadas
   - `selectOne`, `selectMany`, `selectUnique`
   - `consumableList`, `pluralForm`, `titleCase`
   - `joinItems`, `getLength`

4. **`raycaster-test.js`** - Interação 3D
   - Clique em objetos 3D
   - Hover com mudança de cor
   - Eventos customizados

5. **`state-test.js`** - Persistência
   - Save/Load com localStorage
   - Migração de versão
   - Estado padrão

6. **`canvas-test.js`** - Canvas 2D + Three.js
   - Desenho procedural
   - CanvasTexture para fog-of-war
   - Integração com cena 3D

### 🎮 Painel de Testes Expandido
- 9 botões interativos organizados por categoria
- Área de log com histórico
- Visual melhorado com bordas verdes brilhantes

---

## v1.0.2 - Correção de Material do Cubo (2026-05-21)

### 🐛 Correções
- Material do cubo alterado de `MeshNormalMaterial` para `MeshStandardMaterial`
- Permite mudança de cor via `material.color.setHex()`
- Imports atualizados com URLs absolutas e tags

---

## v1.0.0 - Versão Inicial (2026-05-21)

### ✨ Funcionalidades
- Arquitetura modular com ES6 Modules
- Bridge segura para acessar `root` do Perchance
- Three.js via CDN (esm.sh)
- Painel de testes básico
- Sistema de guard clause para execução única

### 📁 Estrutura
```
test-perchance-git/
├── src/
│   ├── main.js              # Entry point
│   ├── perchance-bridge.js  # Ponte para Perchance
│   └── modules/
│       ├── renderer.js      # Three.js
│       ├── logic.js         # Lógica do jogo
│       └── ui-test.js       # Painel de testes
├── for-perchance.html       # HTML Panel
└── for-perchance-list-panel.txt  # List Panel
```

---

## 📚 Documentação

- [Tutorial Perchance](https://perchance.org/tutorial)
- [Perchance Reference](https://perchance.org/perchance-reference)
- [Perchance Methods Wiki](https://perchance.fandom.com/wiki/Perchance_Methods)
- [Unique Selections](https://perchance.fandom.com/wiki/Unique_Selections)

## 🔗 Links Úteis

- [jsDelivr CDN](https://www.jsdelivr.com/github)
- [ES Modules no Navegador](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- [Three.js Documentation](https://threejs.org/docs/)
