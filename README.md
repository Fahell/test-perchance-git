# 🎮 RPG Paper Craft - Projeto Modular para Perchance

> Projeto de teste para modularização de código JavaScript no Perchance.org usando ES Modules + CDN (jsDelivr) + GitHub.

---

## 🚀 Visão Geral

Este projeto demonstra como:
- ✅ Separar código JavaScript em módulos reutilizáveis
- ✅ Importar bibliotecas externas (Three.js) via CDN com `type="module"`
- ✅ Acessar dados do Perchance (listas, variáveis, plugins) de forma segura via `root`
- ✅ Manter o HTML Panel limpo (~50 linhas) enquanto o código vive no GitHub
- ✅ Testar funcionalidades assíncronas e integração com plugins

---

## 📁 Estrutura de Arquivos

```
test-perchance-git/
├── 📄 README.md                    ← Você está aqui!
├── 📄 for-perchance.html           ← COPIE PARA O HTML PANEL DO PERCHANCE
├── 📄 test-local.html              ← TESTE LOCAL NO NAVEGADOR (opcional)
├── 📁 src/
│   ├── 📄 main.js                  ← Entry point (exporta initGame)
│   ├── 📄 perchance-bridge.js      ← Ponte segura para root/listas/plugins
│   └── 📁 modules/
│       ├── 📄 three-test.js        ← Teste: Import Three.js + cena 3D
│       ├── 📄 perchance-features-test.js ← Teste: Listas, seeds, plugins
│       └── 📄 ui-test.js           ← Painel interativo com botões de teste
└── 📄 .gitignore                   ← Arquivos para ignorar no Git
```

---

## 🛠️ Como Usar

### Passo 1: Configurar no GitHub
1. Crie um repositório público no GitHub: `seu-usuario/test-perchance-git`
2. Faça push deste projeto:
   ```bash
   cd C:\Users\Phadawan\Documents\MEGA\test-perchance-git
   git init
   git add .
   git commit -m "feat: initial modular test project"
   git remote add origin https://github.com/SEU_USUARIO/test-perchance-git.git
   git branch -M main
   git push -u origin main
   ```

### Passo 2: Atualizar a URL no Perchance
No arquivo `for-perchance.html`, edite a linha de import:
```html
<!-- DE (exemplo): -->
import { initGame } from "https://cdn.jsdelivr.net/gh/Fahell/test-perchance-git@main/src/main.js?v=9";

<!-- PARA (seus dados): -->
import { initGame } from "https://cdn.jsdelivr.net/gh/SEU_USUARIO/test-perchance-git@main/src/main.js?v=10";
```

> 🔑 **Dica de Cache**: Sempre incremente `?v=X` após cada push (`?v=2`, `?v=3`) para garantir que os jogadores recebam a versão mais recente.

### Passo 3: Copiar para o Perchance
1. Abra seu gerador no [Perchance.org](https://perchance.org)
2. No **HTML Panel**, cole TODO o conteúdo de `for-perchance.html`
3. No **List Panel**, adicione as configurações mínimas (veja abaixo)
4. Clique em "Preview" para testar

### Passo 4: Configurar o List Panel (Mínimo Necessário)
```perchance
# Variáveis
GAME_SEED = 12345

# Listas de teste
test_items
    espada mágica
    poção de cura
    mapa antigo
    amuleto raro

art_styles
    papercraft
    pixel art
    aquarela
    óleo sobre tela

# Plugin de imagem (opcional, para teste completo)
imagem = {import:text-to-image-plugin}
```

---

## 🧪 Módulos de Teste Incluídos

### 🎨 `three-test.js` - Three.js via CDN
- Importa Three.js de `https://esm.sh/three`
- Cria cena, câmera e renderizador
- Renderiza cubo animado em wireframe
- Handle de resize automático

**Como testar**: Clique no botão "🎨 Testar Three.js" no painel inferior.

### 🧪 `perchance-features-test.js` - Recursos do Perchance
- Acessa `GAME_SEED` via `root`
- Lê listas com fallback seguro (`getList()`)
- Verifica disponibilidade do plugin de imagem
- Demonstra padrões async/await

**Como testar**: Clique em "🧪 Testar Perchance" → "⏳ Testar Async".

### 🖼️ `perchance-features-test.js` - Plugin de Imagem (Mock/Real)
- Função `buildImagePrompt()`: Gera prompts dinâmicos a partir de listas
- Função `safeImageCall()`: Chama o plugin com tratamento de erro
- Mostra URL da imagem gerada na UI

**Pré-requisito**: Ter `{import:text-to-image-plugin}` no List Panel.

### 🖥️ `ui-test.js` - Painel Interativo
- Dashboard flutuante com botões de teste
- Log em tempo real das execuções
- Área de resultados formatada
- Botão de reset para limpar estado

---

## 🔗 Acessando Dados do Perchance nos Módulos

Nunca use `import { animal } from ...` para listas do Perchance. Use sempre a bridge:

```javascript
// Em qualquer módulo .js:
import { root, getList, getVar } from '../perchance-bridge.js';

// ✅ Correto: Acessar variável
const seed = getVar('GAME_SEED', 12345);

// ✅ Correto: Acessar lista com fallback
const items = getList('test_items', ['default']);
const item = items.selectOne;

// ✅ Correto: Usar plugin de imagem
if (typeof root.image === 'function') {
  const img = await root.image("prompt", { seed, resolution: "512x512" });
}
```

---

## ⚠️ Solução de Problemas (Troubleshooting)

### ❌ Preview fica em "Carregando..."
1. Abra o Console do Navegador (F12 → Console)
2. Verifique se há erros de import (URL incorreta, 404)
3. Confirme que a URL usa `cdn.jsdelivr.net` (não `raw.githubusercontent.com`)
4. Tente incrementar `?v=` na URL do import

### ❌ Three.js não renderiza
1. Verifique se o container `#three-test-container` existe no DOM
2. Confirme que `initThreeTest(container)` recebeu um elemento válido
3. Cheque se há erros de CORS no Console (jsDelivr deve funcionar)

### ❌ Listas do Perchance retornam undefined
1. Confirme que a lista existe no **List Panel** (não no HTML Panel)
2. Use `getList('nome', ['fallback'])` para evitar crashes
3. Verifique se `root` está disponível: `console.log(!!window.root)`

### ❌ Plugin de imagem não gera nada
1. O plugin exibe anúncios para usuários não logados (normal)
2. Pode haver limite de requisições por minuto
3. Verifique se o prompt não está vazio ou muito longo

---

## 📚 Recursos e Documentação

- [Perchance Tutorial](https://perchance.org/tutorial)
- [Perchance JavaScript Docs](https://perchance.org/docs/javascript)
- [Plugin: Text-to-Image](https://perchance.org/learn-perchance-plugins-text-to-image)
- [jsDelivr GitHub CDN](https://www.jsdelivr.com/package/docs/gh)
- [esm.sh - CDN para ES Modules](https://esm.sh/)
- [Three.js Documentation](https://threejs.org/docs/)

---

## 🐛 Troubleshooting: "Carregando módulos..." preso

**Problema**: O preview mostra "🎮 Carregando módulos..." eternamente, mas o console mostra logs de sucesso.

**Causa**: O HTML Panel do Perchance é injetado como fragmento via `innerHTML`, não como documento completo. Ter `<html>`, `<head>`, `<body>` ou usar `DOMContentLoaded` não funciona como esperado.

**Solução aplicada**:
1. ✅ `for-perchance.html` agora é apenas um fragmento (sem tags de documento)
2. ✅ Guard clause usa apenas `window.GAME_INITIALIZED` (não `sessionStorage`)
3. ✅ `initGame()` é chamado imediatamente (sem esperar `DOMContentLoaded`)
4. ✅ `renderer.js` remove o loading ANTES de criar o canvas

**Se o problema persistir**:
- Limpe o cache do navegador (Ctrl+Shift+Del)
- Use aba anônima para teste
- Incremente `?v=` na URL do import
- Verifique se `biomas` e outras listas existem no List Panel

---

## 🐛 Troubleshooting

### Problema: Preview fica preso em "Carregando módulos..."

**Causa**: O Perchance re-renderiza o preview do HTML Panel, o que causa execução duplicada do script. A flag `window` é perdida entre re-renderizações.

**Solução** (aplicada na v9):
1. **`sessionStorage` para persistência**: Usa `sessionStorage.getItem('rpg_initialized')` que persiste entre re-renderizações do iframe do Perchance.
2. **Loading via JavaScript**: A mensagem de loading NÃO está mais no HTML estático (é criada/removida via JS).
3. **Detecção de canvas duplicado**: O renderer verifica se já existe um `<canvas data-threejs="true">` antes de criar um novo.
4. **Guard clause duplo**: Verifica tanto `sessionStorage` quanto `window.GAME_INITIALIZED`.

**Como testar**:
```javascript
// No console do navegador (F12)
window.resetGame(); // Reseta o sessionStorage e recarrega a página
```

### Problema: Logs aparecem duplicados no console

**Causa**: O Perchance executa o HTML Panel duas vezes durante o carregamento inicial.

**Solução**: Isso é normal e esperado. O `sessionStorage` impede a re-execução real do código. Você verá:
```
📄 HTML Panel injetado, chamando initGame()...
⏭️ Jogo já inicializado (sessionStorage). Ignorando re-execução.
```

### Problema: Painel de testes não aparece (tela em branco com apenas HUD)

**Sintoma**: Console mostra logs de sucesso, mas a tela está em branco exceto pelo HUD de FPS e pelo balão de informações estático.

**Causas possíveis**:
1. **Import dinâmico falhou**: O módulo `ui-test.js` não foi carregado via CDN (URL incorreta, arquivo não existe no GitHub, erro de CORS).
2. **Erro silencioso em `initUITest`**: A função lançou um erro antes de criar o painel.
3. **Painel fora da viewport ou escondido**: `z-index` conflitante ou posicionamento incorreto.

**Solução aplicada (v10)**:
1. ✅ `main.js` agora tem `try/catch` específico para o import dinâmico com logs detalhados.
2. ✅ `ui-test.js` tem `try/catch` interno e verifica se `document.body` está disponível.
3. ✅ Painel agora tem `z-index: 9999`, borda verde brilhante e sombra para máxima visibilidade.
4. ✅ Logs de debug mostram posição do painel e se os botões foram encontrados.
5. ✅ Alertas visuais (caixas vermelhas) aparecem se houver erro, com mensagem no console.

**Como diagnosticar**:
```javascript
// No console do navegador (F12), procure por:
// ✅ Logs esperados:
//   🎮 [UI-Test] Criando painel de testes...
//   📎 [UI-Test] Painel anexado ao document.body
//   📐 [UI-Test] Painel visível: 320xXXXpx em (20, YYY)

// ❌ Se aparecer:
//   ❌ [Main] Falha ao importar ui-test.js: ...
//   → Verifique se o arquivo existe em: https://cdn.jsdelivr.net/gh/SEU_USUARIO/test-perchance-git@main/src/modules/ui-test.js

// ❌ Se aparecer:
//   ❌ [UI-Test] btn-test-perchance não encontrado
//   → O innerHTML pode ter falhado; verifique erros de sintaxe no template string
```

**Passos para corrigir**:
1. Verifique se `src/modules/ui-test.js` existe no seu repositório no GitHub.
2. Confirme que a URL no import usa `cdn.jsdelivr.net` (não `raw.githubusercontent.com`).
3. Incremente `?v=` na URL do import em `for-perchance.html`.
4. Limpe o cache do navegador (Ctrl+Shift+Del) ou use aba anônima.
5. Recarregue o preview e verifique o console para logs de erro específicos.

---

## 🔄 Fluxo de Desenvolvimento Recomendado

```bash
# 1. Desenvolva localmente
code C:\Users\Phadawan\Documents\MEGA\test-perchance-git

# 2. Teste local com test-local.html (opcional)

# 3. Commit e push
git add .
git commit -m "feat: add new test module"
git push

# 4. Atualize versão no Perchance
# Edite for-perchance.html: ?v=3 → ?v=4

# 5. Teste no preview do Perchance

# 6. Repita!
```

---

## 🎯 Próximos Passos (Ideias)

- [ ] Adicionar módulo `input-handler.js` para controles de teclado/mouse
- [ ] Criar `world-generator.js` com SimplexNoise para terreno procedural
- [ ] Integrar `fog-of-war.js` com CanvasTexture para efeito de papel rasgado
- [ ] Adicionar `character-builder.js` para NPCs gerados via IA
- [ ] Criar script de deploy automático (atualiza `?v=` automaticamente)

---

## 🤝 Contribuindo

Este é um projeto de teste pessoal. Para sugerir melhorias:
1. Fork este repositório
2. Crie uma branch: `git checkout -b feature/minha-sugestao`
3. Commit: `git commit -m 'feat: minha melhoria'`
4. Push: `git push origin feature/minha-sugestao`
5. Abra um Pull Request no GitHub

---

## 📄 Licença

MIT License - Sinta-se à vontade para usar, modificar e distribuir.

Feito com ❤️ para a comunidade Perchance.
