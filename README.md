# 🎮 Teste Perchance + ES Modules + GitHub

## 📋 Visão Geral

Este projeto é um **ambiente de teste modularizado** para validar a arquitetura de desenvolvimento no Perchance usando ES Modules hospedados no GitHub via jsDelivr CDN.

**Versão Atual:** `v1.1.2` (Correção do tipo de retorno do plugin de imagem)

---

## 🏗️ Estrutura do Projeto

```
test-perchance-git/
├── for-perchance.html              # HTML Panel do Perchance (COPIAR)
├── for-perchance-list-panel.txt    # List Panel do Perchance (COPIAR)
├── src/
│   ├── main.js                     # Entry point
│   ├── perchance-bridge.js         # Ponte segura para root/listas
│   └── modules/
│       ├── renderer.js             # Three.js setup
│       ├── logic.js                # Lógica do jogo
│       ├── ui-test.js              # Painel de testes interativo
│       ├── ai-text-test.js         # Teste: Plugin AI Text
│       ├── image-test.js           # Teste: Plugin Image
│       ├── lists-test.js           # Teste: Listas avançadas
│       ├── raycaster-test.js       # Teste: Clique em objetos 3D
│       ├── state-test.js           # Teste: Persistência localStorage
│       └── canvas-test.js          # Teste: Canvas 2D + Three.js
├── test-local.html                 # Teste local (com mock do root)
└── README.md
```

---

## 🚀 Como Usar

### 1. No Perchance

#### HTML Panel
Cole o conteúdo de `for-perchance.html` no HTML Panel.

#### List Panel
Cole o conteúdo de `for-perchance-list-panel.txt` no List Panel:

```perchance
GAME_SEED = 12345

biomas
  tundra
  floresta
  montanha
  planície
  deserto

eventos
  nada acontece
  encontro inesperado
  tesouro encontrado

itens
  espada mágica
  poção de cura
  mapa antigo

nomes_herois
  Aldric
  Seraphina
  Thorin

adjetivos
  corajoso
  sábio
  ágil

ai = {import:ai-text-plugin}
image = {import:text-to-image-plugin}
```

**⚠️ IMPORTANTE sobre indentação:**
- O Perchance usa **2 ESPAÇOS** para indentação de listas
- NÃO use 4 espaços, tabs ou outros valores
- A sintaxe correta é: `item` (no topo) e `  subitem` (2 espaços)

### 2. No GitHub

Faça push do projeto para um repositório público.

### 3. Atualize as URLs

Em todos os arquivos `.js` e no `for-perchance.html`, substitua:
- `Fahell` → seu usuário do GitHub
- `test-perchance-git` → nome do seu repositório
- `@v1.1.0` → tag da versão (ex: `@v1.2.0`)

---

## 🧪 Testes Incluídos (v1.1.0)

### 🔌 Plugins do Perchance

| Teste | Descrição | Como Testar |
|-------|-----------|-------------|
| **🤖 AI Text** | Geração de texto via IA (streaming, startWith, stopSequences) | Clique em "🤖 AI Text" no painel |
| **🖼️ Image** | Geração de imagens via IA (prompt, seed, negativePrompt) | Clique em "🖼️ Image" no painel |

### 🎲 Funcionalidades Perchance

| Teste | Descrição | Como Testar |
|-------|-----------|-------------|
| **📋 Listas** | `selectOne`, `selectUnique`, `selectMany`, `pluralForm`, `titleCase`, `joinItems` | Clique em "📋 Listas" no painel |
| **🔗 Bridge** | Acesso a `root`, `GAME_SEED`, listas via `perchance-bridge.js` | Clique em "🔗 Bridge" no painel |

### 🎨 Three.js

| Teste | Descrição | Como Testar |
|-------|-----------|-------------|
| **🎲 Cor Cubo** | Muda cor do cubo 3D girando | Clique em "🎲 Cor Cubo" no painel |
| **🖱️ Raycaster** | Clique em esferas coloridas para interagir | Clique em "🖱️ Raycaster" e depois nas esferas |
| **🎨 Canvas** | Canvas 2D com gradientes, círculos, texto e integração com Three.js | Clique em "🎨 Canvas" no painel |

### 💾 Persistência

| Teste | Descrição | Como Testar |
|-------|-----------|-------------|
| **💾 Salvar** | Salva estado do jogo no localStorage | Clique em "💾 Salvar" no painel |
| **📂 Carregar** | Carrega estado salvo do localStorage | Clique em "📂 Carregar" no painel |

---

## 🔧 Arquitetura

### Por que Tags de Versão?

Usamos **tags semânticas** (`@v1.1.0`) em vez de `@main` ou hashes de commit:

| Abordagem | Prós | Contras |
|-----------|------|---------|
| `@main` | Sempre pega a última versão | Cache agressivo (12h+), difícil debugar |
| `@commit-hash` | Imutável, sem cache | Hash longo, difícil gerenciar |
| `@v1.1.0` | ✅ Previsível, legível, cache controlado | Requer criar tag a cada versão |

### Fluxo de Desenvolvimento

```bash
# 1. Faça suas mudanças
git add .
git commit -m "feat: nova funcionalidade"

# 2. Crie uma tag
git tag -a v1.1.0 -m "Versão 1.1.0 - Testes expandidos"

# 3. Push do código e da tag
git push && git push origin v1.1.0

# 4. Atualize TODAS as URLs nos arquivos para @v1.1.0
# 5. Limpe o cache do navegador (Ctrl+Shift+Del)
# 6. Teste no Perchance
```

---

## 🐛 Troubleshooting

### "Mensagem de loading não some"
- Verifique se o `renderer.js` está sendo carregado (console deve mostrar `🎨 [Renderer] Three.js inicializado com sucesso!`)
- Limpe o cache do navegador

### "Painel de testes não aparece"
- Verifique se o `ui-test.js` está sendo carregado (console deve mostrar `✅ [UI-Test] Painel de testes criado e visível.`)
- Verifique o z-index do painel (deve ser 9999)

### "Erro: does not provide an export named 'getVar'"
- O jsDelivr está servindo uma versão antiga em cache
- Solução: Use tags de versão (`@v1.1.0`) em TODOS os imports

### "Cubo não muda de cor"
- Verifique se o material é `MeshStandardMaterial` (não `MeshNormalMaterial`)
- Verifique no console: `rendererData.cube.material.color` deve existir

### "Plugin AI/Image não disponível"
- Certifique-se de que o List Panel tem:
  ```perchance
  ai = {import:ai-text-plugin}
  image = {import:text-to-image-plugin}
  ```
- Alguns plugins exigem conta logada no Perchance

### "Unexpected token '{'" ou "SyntaxError"
- Este erro ocorre ao usar `import` estático dentro de blocos `if/else`
- **Solução**: Use `await import()` (import dinâmico) dentro de condicionais
- O código correto está no `for-perchance.html` atualizado

### "localStorage não disponível"
- O Perchance roda em iframe sandboxed, que pode bloquear localStorage
- Use `sessionStorage` como fallback ou aceite que o save/load não funcionará

### "Cache do jsDelivr não atualiza"
- **Nunca** use `@main` ou branches em produção
- Sempre use tags (`@v1.1.0`) ou hashes de commit
- Limpe o cache do navegador: `Ctrl+Shift+Del`

---

## 📚 Recursos

- [Documentação Perchance](https://perchance.org/tutorial)
- [Three.js Documentation](https://threejs.org/docs/)
- [jsDelivr CDN](https://www.jsdelivr.com/)
- [ES Modules Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)

---

## 🎯 Próximos Passos

Após validar esta arquitetura de teste, você pode:

1. **Migrar seu RPG real** (`MAT/scenario`) para esta estrutura modular
2. **Adicionar módulos específicos**:
   - `world-generator.js` → Geração procedural de mundo
   - `fog-of-war.js` → Efeito de papel rasgado com CanvasTexture
   - `pathfinder.js` → A* para navegação de NPCs
   - `character-builder.js` → Geração de personagens via plugin de imagem
3. **Criar script de deploy** para automatizar git push + versionamento

---

## 📝 Licença

Este é um projeto de teste/demonstração. Use livremente como referência para seus próprios projetos no Perchance.
