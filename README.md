# 🎮 Test Project: Perchance + ES Modules + GitHub CDN

Este é um projeto de teste para modularizar código JavaScript do Perchance usando ES Modules e hospedagem externa via jsdelivr.

## 📁 Estrutura

```
test-perchance-git/
├── README.md                    ← Este arquivo
├── for-perchance.html           ← CÓPIE O CONTEÚDO PARA O HTML PANEL DO PERCHANCE
├── test-local.html              ← Teste local no navegador (simula o ambiente Perchance)
└── src/
    ├── main.js                  ← Ponto de entrada (exporta initGame())
    ├── perchance-bridge.js      ← Ponte segura para acessar root/listas do Perchance
    └── modules/
        ├── renderer.js          ← Exemplo: módulo de renderização/UI
        └── logic.js             ← Exemplo: módulo de lógica de jogo
```

## 🚀 Como Usar

### 1. Desenvolvimento Local
1. Abra `test-local.html` no seu navegador (ou use Live Server do VS Code).
2. O arquivo simula `window.root` com dados de teste.
3. Veja o console para confirmar que os módulos estão carregando corretamente.

### 2. Deploy para GitHub
1. Crie um repositório público no GitHub.
2. Faça push de TODO o conteúdo desta pasta para o repositório.
3. Anote a URL do seu repositório: `https://github.com/SEU_USUARIO/SEU_REPO`

### 3. Configurar no Perchance
1. Abra `for-perchance.html` e copie o conteúdo.
2. No Perchance, cole no **HTML Panel**.
3. **IMPORTANTE**: Substitua a URL de import no `<script type="module">`:
   ```html
   <!-- DE: -->
   import { initGame } from "https://cdn.jsdelivr.net/gh/SEU_USUARIO/SEU_REPO@main/src/main.js?v=1";
   
   <!-- PARA: -->
   import { initGame } from "https://cdn.jsdelivr.net/gh/seu-usuario/seu-repo@main/src/main.js?v=1";
   ```
4. No **List Panel** do Perchance, mantenha suas listas, plugins e variáveis normalmente:
   ```perchance
   GAME_SEED = 12345
   biomas
       floresta
       deserto
       montanha
   imagem = {import:text-to-image-plugin}
   ```

### 4. Atualizar Versão
Sempre que fizer alterações e push no GitHub:
1. Incremente o parâmetro `?v=` na URL do import (ex: `?v=2`, `?v=3`).
2. Isso força o navegador dos jogadores a buscar a nova versão (cache busting).

## 🔗 Links Úteis

- [jsdelivr GitHub CDN Docs](https://www.jsdelivr.com/package/docs/gh)
- [Perchance HTML Panel Docs](https://perchance.org/docs/html-panel)
- [MDN: JavaScript Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)

## ⚠️ Notas Importantes

- **CORS**: jsdelivr configura headers CORS automaticamente ✅
- **MIME Type**: jsdelivr serve `.js` como `application/javascript` ✅
- **Imports Relativos**: Dentro de `main.js`, use imports relativos (`./modules/renderer.js`). O navegador resolve a partir da URL do `main.js`.
- **Acesso ao Perchance**: Sempre use `perchance-bridge.js` para acessar `root`. Nunca importe `window` diretamente.
- **Plugins**: `{import:...}` só funciona no List Panel. Acesse via `root.nomeDoPlugin`.

## 🔧 Troubleshooting: "Carregando módulos..." não some?

**Sintoma**: Console mostra logs de sucesso ✅, mas o preview fica preso na mensagem de loading.

**Causa**: O `renderer.js` não estava removendo o elemento de loading do DOM.

**Solução aplicada**:
1. No `for-perchance.html`, a mensagem de loading agora tem `id="loading-message"`.
2. No `renderer.js`, adicionamos código para remover esse elemento ao inicializar:
   ```js
   const loadingMsg = document.getElementById('loading-message') 
     || Array.from(container.children).find(child => 
       child.textContent?.includes('Carregando')
     );
   if (loadingMsg) loadingMsg.remove();
   ```

**Se ainda acontecer**:
1. Verifique se o `#game-container` existe no HTML Panel.
2. Confirme que `initRenderer('#game-container')` está sendo chamado.
3. Abra o console e veja se há warnings como "Container não encontrado".
4. Limpe o cache do navegador ou incremente `?v=` na URL do import.

---

*Projeto criado para teste de modularização no Perchance.org*
