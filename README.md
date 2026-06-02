# Test Perchance Git (v1.22.0)

Projeto de teste para explorar as capacidades do Perchance com arquitetura modular usando ES6 Modules + GitHub + jsDelivr CDN.

## 🚀 Performance Otimizada com Vite

A partir da versão **v1.3.0**, o projeto utiliza **Vite** para gerar um bundle único, reduzindo drasticamente o tempo de carregamento:

| Antes (v1.2.x) | Depois (v1.3.0+) |
|----------------|------------------|
| 16 requisições HTTP | 1 requisição HTTP |
| ~10-15s carregamento | ~1-2s carregamento |
| 70KB+ (múltiplos arquivos) | 70KB (1 arquivo minificado) |
| Carregamento sequencial | Carregamento paralelo |

## 📦 Instalação

```bash
npm install
```

## 🛠️ Desenvolvimento

### Modo Desenvolvimento (HMR)
```bash
npm run dev
```

### Build para Produção
```bash
npm run build
```

O bundle será gerado em `dist/main.bundle.js`.

### Preview do Build
```bash
npm run preview
```

## 📤 Release (Deploy)

O projeto utiliza **Husky** com pre-commit hook + script automatizado para gerenciar releases.

### Fluxo Automatizado (Obrigatório)

Use o script de release que automatiza TUDO:

```bash
npm run release 1.22.0
```

⚠️ **Importante:** O script de release **deve ser executado exclusivamente na branch `main`**. Isso evita a criação de tags desvinculadas do histórico principal.

O script executa automaticamente:
1. ✅ Verifica se está na branch `main` (bloqueia se não estiver)
2. ✅ Verifica working tree limpo
3. ✅ Atualiza `src/constants.js` (fonte da verdade)
4. ✅ Sincroniza todos os arquivos via `sync-version.cjs`
5. ✅ Gera bundle via `npm run build`
6. ✅ Cria commit e tag
7. ✅ Pull --rebase e push para o GitHub

### Fluxo Manual (Alternativo)

Se preferir fazer manualmente:

1. **Atualize `src/constants.js`** com a nova versão:
   ```javascript
   export const VERSION = 'v1.22.0';
   ```

2. **Faça commit** - o pre-commit hook detectará a mudança e atualizará automaticamente:
   - `package.json`
   - `for-perchance.html`
   - `README.md`
   - `AGENTS.md`
   - Outros arquivos com referências à versão
   
   ```bash
   git add src/constants.js
   git commit -m "chore: release v1.22.0"
   ```

3. **Gere o bundle**:
   ```bash
   npm run build
   git add dist/
   git commit --amend --no-edit
   ```

4. **Crie a tag e faça push**:
   ```bash
   git tag -a v1.22.0 -m "Release v1.22.0"
   git push origin main --tags
   ```

⏱️ **Aguarde ~10 minutos** para o CDN jsDelivr processar a nova versão.

### ⚠️ Importante

- **Nunca** crie uma tag sem antes atualizar `constants.js`
- O pre-commit hook **sempre roda** em qualquer commit (idempotente, ~50ms)
- Se tudo já estiver sincronizado, o hook não faz mudanças
- Sempre use `npm run release X.Y.Z` para evitar esquecimentos
- Não edite manualmente `package.json`, `for-perchance.html`, `README.md` ou `AGENTS.md` para atualizar versões

## 🎮 Uso no Perchance

Cole o conteúdo de `for-perchance.html` no HTML Panel do seu gerador Perchance.
**Exemplo para v1.22.0:**
```html
<div id="game-container" style="position:relative; width:100vw; height:100vh; overflow:hidden; background:#1a1a1a;"></div>

<script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js" type="module"></script>

<script type="module">
  import("https://cdn.jsdelivr.net/gh/Fahell/test-perchance-git@v1.22.0/dist/main.bundle.js")
    .then(module => module.initGame())
    .catch(err => console.error('Erro:', err));
</script>
```

## 📁 Estrutura do Projeto

```
├── src/
│   ├── main.js              # Entry point (imports estáticos + dynamic imports)
│   ├── perchance-bridge.js  # Ponte segura para API do Perchance
│   ├── constants.js         # Constantes globais (versão, CDN)
│   ├── modules/             # Módulos independentes
│   │   ├── image-test.js    # Testes avançados de geração de imagem (14 testes)
│   │   ├── ui-test.js       # Interface de seleção de testes (UI)
│   │   ├── three-test.js    # Three.js (3D)
│   │   ├── cannon-test.js   # Cannon-es (física 3D)
│   │   ├── matter-test.js   # Matter.js (física 2D)
│   │   ├── mermaid-test.js  # Mermaid (diagramas)
│   │   ├── apexcharts-test.js # ApexCharts (gráficos)
│   │   ├── canvas-test.js   # Canvas 2D nativo
│   │   ├── howler-test.js   # Howler.js (áudio)
│   │   └── kv-test.js       # Key-Value storage (Perchance)
│   └── styles/              # Arquivos CSS
├── dist/
│   └── main.bundle.js       # Bundle único gerado pelo Vite (committed)
├── scripts/
│   ├── release.cjs          # Script de release automatizado (com proteção de branch)
│   ├── sync-version.cjs     # Sincroniza versão em todos os arquivos
│   └── snapshot.sh          # Gerenciamento de snapshots do projeto
├── .husky/
│   └── pre-commit           # Hook que roda sync-version.cjs
├── for-perchance.html       # HTML Panel para copy/paste no Perchance
├── for-perchance-list-panel.txt  # List Panel para copy/paste no Perchance
└── test-local.html          # Teste local fora do Perchance
```

## 📚 Documentação

- `docs/iframe-access-perchance-guide.md` — Como acessar iframes cross-origin do Perchance via CDP
- `docs/snapshot-guide.md` — Guia de gerenciamento de snapshots do projeto
- `docs/release-guide.md` — Guia detalhado do processo de release
- `AGENTS.md` — Instruções para AI agents e contexto do projeto

## 🔧 Scripts Disponíveis

| Script | Função | Uso |
|---|---|---|
| `npm run dev` | Servidor de desenvolvimento com HMR | Desenvolvimento local |
| `npm run build` | Gera bundle de produção | Antes de deploy |
| `npm run preview` | Preview do build de produção | Testar build localmente |
| `npm run release X.Y.Z` | Release automatizado completo | Deploy de nova versão |
| `npm run snapshot:create <name>` | Cria snapshot do estado atual | Antes de refactors |
| `npm run snapshot:list` | Lista todos os snapshots | Verificar estado |
| `node scripts/sync-version.cjs` | Sincroniza versão manualmente | Quando necessário |

## 🧪 Módulos de Teste

O projeto inclui módulos de teste para validar integração com bibliotecas e plugins do Perchance:

### 🖼️ Image Generation Tests (Seção Dedicada)
Testes avançados para o plugin `text-to-image` do Perchance, organizados em uma seção própria no painel:

**Fase 1 - Fundamentos:**
- ⚖️ **Guidance Scale (CFG)**: Comparação de aderência ao prompt (CFG 3, 7, 15)
- 🚫 **Negative Prompt**: Efeito de exclusão de elementos indesejados
- 🎭 **Trigger Words**: Teste de modelos específicos (Normal, Anime, Furry)
- 😀 **Emoji Prompts**: Geração com emojis como tokens visuais
- 📊 **onFinish Callback**: Captura de metadados da geração

**Fase 2 - Técnicas Intermediárias:**
- 🎯 **Tag Emphasis**: Pesos de tags `(tag:0.5)` até `(tag:2.0)`
- 🔄 **Prompt Ordering**: Impacto da ordem das tags na composição
- 🎨 **Canvas Post-Processing**: Manipulação direta do canvas (filtros, texto)
- ⚡ **BREAK Keyword**: Separação de chunks de tokens

**Fase 3 - Técnicas Avançadas:**
- 🎨 **Tag Blending**: Mistura de estilos `[from:to:ratio]`
- 🖼️ **Multi-Image Grid**: Geração paralela de múltiplas imagens
- 🔄 **Alternating Tags**: Alternância entre tags a cada step `[tag1|tag2]`
- ➕ **Add/Remove During Gen**: Adicionar/remover tags durante geração `[to:when]`

### Outros Testes
- `renderer.js` — Three.js (3D)
- `logic.js` — Lógica do jogo
- `ui-test.js` — Interface de seleção de testes
- `three-test.js` — Teste básico Three.js
- `cannon-test.js` — Cannon-es (física 3D)
- `matter-test.js` — Matter.js (física 2D)
- `mermaid-test.js` — Mermaid (diagramas)
- `apexcharts-test.js` — ApexCharts (gráficos)
- `canvas-test.js` — Canvas 2D nativo
- `howler-test.js` — Howler.js (áudio)
- `kv-test.js` — Key-Value storage (Perchance)
- `output-area.js` — Área de exibição organizada

## 🛡️ Boas Práticas

1. **Sempre use `npm run release X.Y.Z`** para releases (na branch `main`)
2. **Nunca edite manualmente** arquivos de versão (use `constants.js`)
3. **Commit atômico**: uma mudança por vez
4. **Teste localmente** com `npm run dev` antes de fazer release
5. **Verifique o bundle** em `dist/main.bundle.js` após mudanças
6. **Aguarde o CDN** propagar (~10 minutos) antes de testar no Perchance
7. **Crie snapshots** antes de refactors complexos (`npm run snapshot:create pre-refactor`)

## 📝 Versionamento

Este projeto segue [Semantic Versioning](https://semver.org/):

- **MAJOR** (X.0.0): Mudanças incompatíveis na API
- **MINOR** (0.X.0): Novas funcionalidades compatíveis
- **PATCH** (0.0.X): Correções de bugs compatíveis

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

ISC

---

**Última atualização:** v1.22.0
