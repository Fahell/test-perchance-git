# Git Hooks

Hooks automatizados para garantir consistência do projeto.

## Hooks Disponíveis

### `pre-commit`

**Função:** Sincroniza automaticamente a versão em `for-perchance.html` com `src/constants.js` antes de cada commit.

**Comportamento:**
1. Lê `VERSION` de `src/constants.js`
2. Atualiza todas as referências em `for-perchance.html`
3. Se houver mudanças, adiciona `for-perchance.html` ao commit automaticamente

**Vantagens sobre watcher:**
- ✅ Zero overhead (sem processo rodando)
- ✅ Executa apenas quando necessário
- ✅ Não depende de sessão de terminal ativa
- ✅ Mais confiável e previsível

## Instalação

```bash
./scripts/install-hooks.sh
```

## Teste Manual

```bash
# Edite constants.js temporariamente
echo "export const VERSION = 'v9.9.9';" > src/constants.js

# Execute o hook manualmente
.git/hooks/pre-commit

# Verifique se for-perchance.html foi atualizado
grep -o 'v[0-9]\.[0-9]\.[0-9]' for-perchance.html | head -1

# Reverta
git checkout src/constants.js for-perchance.html
```
