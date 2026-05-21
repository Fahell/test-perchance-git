# 🎮 RPG Paper Craft - Projeto de Teste Modular para Perchance

Este é um projeto de teste para validar a arquitetura modular de um RPG 3D no navegador usando:
- **Perchance** (HTML Panel + List Panel)
- **Three.js** (import via CDN)
- **ES Modules** (import/export nativo)
- **jsDelivr** (CDN para servir arquivos do GitHub)

## 📋 Estrutura de Arquivos

```
test-perchance-git/
├── src/
│   ├── main.js              # Entry point (exporta initGame)
│   ├── perchance-bridge.js  # Ponte segura para root/listas do Perchance
│   └── modules/
│       ├── renderer.js      # Three.js: cena, câmera, loop
│       ├── logic.js         # Lógica do jogo (dados do Perchance)
│       └── ui-test.js       # Painel de testes interativo
├── for-perchance.html       # COPIE PARA O HTML PANEL DO PERCHANCE
├── test-local.html          # TESTE LOCAL NO NAVEGADOR
└── README.md
```

## 🚀 Como Usar

### 1. Desenvolvimento Local
```bash
# Abra test-local.html no navegador (duplo clique ou Live Server)
# Teste os módulos sem precisar do Perchance
```

### 2. Deploy no Perchance

#### Passo 1: Commit e Push
```bash
cd C:\Users\Phadawan\Documents\MEGA\test-perchance-git
git add .
git commit -m "feat: descrição da mudança"
git push
```

#### Passo 2: Criar Tag de Versão
```bash
# Crie uma nova tag (incremente: v1.0.0 -> v1.0.1 -> v1.0.2...)
git tag -a v1.0.0 -m "Versão 1.0.0 - Testes iniciais"
git push origin v1.0.0
```

#### Passo 3: Atualizar URLs
Edite os arquivos abaixo e substitua `@v1.0.0` pela nova tag:
- `for-perchance.html` (linha ~70)
- `src/main.js` (linhas ~3, ~5, ~35)
- `src/modules/logic.js` (linha ~2)
- `src/modules/ui-test.js` (linha ~2)

#### Passo 4: Commit e Push das URLs Atualizadas
```bash
git add .
git commit -m "chore: bump version to v1.0.0"
git push
```

#### Passo 5: Cole no Perchance
1. Copie o conteúdo de `for-perchance.html`
2. Cole no **HTML Panel** do seu gerador no Perchance
3. Certifique-se de que o **List Panel** tem as listas básicas:
   ```perchance
   GAME_SEED = 12345
   biomas
       tundra
       floresta
       montanha
   eventos
       nada acontece
       encontro inesperado
       tesouro encontrado
   ```

## 🐛 Troubleshooting

### Problema: "The requested module does not provide an export named 'getVar'"

**Causa**: Cache do jsDelivr servindo versão antiga.

**Solução**:
1. Verifique se você criou a tag no Git: `git tag`
2. Confirme que o push foi feito: `git push origin --tags`
3. Limpe o cache do navegador (Ctrl+Shift+Del)
4. Use aba anônima para testar

### Problema: "Carregando módulos..." nunca some

**Causa**: Módulo `ui-test.js` não carregou ou teve erro.

**Solução**:
1. Abra o console (F12)
2. Procure por erros vermelhos
3. Verifique se a URL do import está correta
4. Teste o import manual no console:
   ```javascript
   import('https://cdn.jsdelivr.net/gh/Fahell/test-perchance-git@v1.0.0/src/modules/ui-test.js')
     .then(m => console.log('✅', Object.keys(m)))
     .catch(e => console.error('❌', e));
   ```

### Problema: Painel de testes não aparece

**Causa**: Z-index baixo ou elemento não anexado ao DOM.

**Solução**:
1. Abra o console (F12)
2. Execute: `document.getElementById('ui-test-panel')`
3. Se retornar `null`, o painel não foi criado
4. Verifique os logs de erro no console

## 📚 Aprendizados sobre o Perchance

1. **HTML Panel é um fragmento**: Não use `<!DOCTYPE>`, `<html>`, `<head>`, `<body>`
2. **DOM já está pronto**: Não use `DOMContentLoaded`, chame `initGame()` diretamente
3. **Execução duplicada**: O Perchance pode re-renderizar, use `sessionStorage` para proteger
4. **Plugins do Perchance**: Só funcionam no List Panel (`{import:text-to-image-plugin}`)
5. **Acesso a listas**: Use `window.root.nomeDaLista` ou o módulo `perchance-bridge.js`

## 🔗 Links Úteis

- [Documentação Perchance](https://perchance.org/docs)
- [jsDelivr GitHub](https://www.jsdelivr.com/github)
- [Three.js Docs](https://threejs.org/docs/)
- [ES Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)

## 📝 Versionamento

Este projeto usa **tags semânticas** (`v1.0.0`, `v1.0.1`, etc.) em vez de hashes de commit porque:
- Tags são mais legíveis e fáceis de manter
- jsDelivr cacheia tags de forma previsível
- Padrão da indústria (semver)

### Histórico de Versões

- **v1.0.0** - Estrutura inicial com testes de Three.js, Perchance Bridge e UI interativa
- **v0.x.x** - Versões anteriores com problemas de cache (hash de commit)
