# Test Perchance Git

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

Para criar uma nova release:

```bash
npm run release 1.3.1
```

Este comando:
1. Atualiza a versão em `package.json`, `constants.js` e `for-perchance.html`
2. Executa o build do Vite
3. Faz commit automático
4. Cria tag Git (`v1.3.1`)
5. Faz push para o GitHub

⏱️ **Aguarde ~10 minutos** para o CDN jsDelivr processar a nova versão.

## 🎮 Uso no Perchance

Cole o conteúdo de `for-perchance.html` no HTML Panel do seu gerador Perchance.

**Exemplo para v1.3.0:**
```html
<div id="game-container" style="position:relative; width:100vw; height:100vh; overflow:hidden; background:#1a1a1a;"></div>

<script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js" type="module"></script>

<script type="module">
  import("https://cdn.jsdelivr.net/gh/Fahell/test-perchance-git@v1.3.0/dist/main.bundle.js")
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
│   └── modules/
│       ├── renderer.js      # Renderizador Three.js
│       ├── logic.js         # Lógica do jogo
│       ├── ui-test.js       # UI de teste
│       └── *-test.js        # Módulos de teste (13 módulos)
├── dist/
│   ├── main.bundle.js       # Bundle único (gerado pelo Vite)
│   └── main.bundle.js.map   # Source map
├── scripts/
│   ├── release.js           # Script de release automatizado
│   └── refactor-imports.js  # Refatora imports CDN para relativos
├── for-perchance.html       # HTML Panel para Perchance
├── test-local.html          # Teste local fora do Perchance
├── vite.config.js           # Configuração do Vite
└── package.json
```

## 🔧 Tecnologias

- **Vite** - Bundler e dev server
- **Three.js** - Renderização 3D (carregado externamente via CDN)
- **ES6 Modules** - Módulos JavaScript nativos
- **jsDelivr CDN** - Distribuição via GitHub

## 📝 Fluxo de Trabalho

### Desenvolvimento
1. Edite os arquivos em `src/`
2. Teste localmente com `npm run dev`
3. Faça commits seguindo Conventional Commits (`feat:`, `fix:`, etc.)

### Deploy
1. Execute `npm run release X.Y.Z`
2. Aguarde ~10 minutos para o CDN processar
3. Atualize a versão no HTML Panel do Perchance

## 🐛 Debug

### Console do Navegador
Após o carregamento, o objeto `window.RPG` está disponível:
```javascript
window.RPG.renderer  // Dados do renderizador Three.js
window.RPG.seed      // Seed do jogo
window.RPG.bioma     // Bioma selecionado
window.RPG.tests     // Módulos de teste carregados
```

### Source Maps
O bundle inclui source maps (`main.bundle.js.map`) para debug no DevTools.

## 📄 Licença

ISC
