# 🛠️ Guia de Desenvolvimento

## Configuração Inicial

Execute uma vez após clonar o repositório:

```bash
# No Git Bash:
./scripts/setup.sh
```

Isso configura:
- Git hooks locais (validação automática)
- Verifica dependências do sistema
- Configura o repositório para uso dos scripts de automação

## Workflow de Desenvolvimento

### 1. Desenvolver Localmente

```bash
# Iniciar servidor local
./scripts/dev-server.sh

# Abra http://localhost:8080/test-local.html no navegador
```

### 2. Testar

- Use o Chrome DevTools (F12) para monitorar o console
- Os módulos de teste estão em `src/modules/`
- O entry point é `src/main.js`

### 3. Sincronizar com GitHub

```bash
./scripts/sync.sh
```

Este script:
- Detecta mudanças não commitadas
- Puxa mudanças remotas (rebase)
- Envia commits locais

### 4. Criar Release

Quando estiver pronto para uma nova versão:

```bash
./scripts/release.sh 1.3.0 "feat: descrição da mudança"
```

Este script automaticamente:
1. ✅ Valida o formato da versão (semver)
2. ✅ Commita mudanças pendentes
3. ✅ Atualiza versão em `for-perchance.html`
4. ✅ Atualiza versão em `README.md`
5. ✅ Cria tag anotada (`v1.3.0`)
6. ✅ Push para GitHub (commits + tags)
7. ✅ Mostra URL do CDN

### 5. Verificar CDN

```bash
./scripts/check-cdn.sh 1.3.0
```

O jsDelivr leva ~1-5 minutos para propagar novas tags.

## Estrutura de Arquivos

```
test-perchance-git/
├── scripts/                    # Scripts de automação
│   ├── setup.sh               # Configuração inicial
│   ├── release.sh             # Release automatizado
│   ├── sync.sh                # Sincronização com GitHub
│   ├── dev-server.sh          # Servidor local
│   └── check-cdn.sh           # Verificar CDN
├── .githooks/                  # Git hooks customizados
│   ├── pre-commit             # Validação de sintaxe JS
│   └── pre-push               # Validação de versão
├── .github/workflows/          # CI/CD
│   └── validate.yml           # Validação automática
├── .vscode/                    # Configurações do VS Code
│   ├── settings.json
│   ├── extensions.json
│   └── launch.json
├── src/                        # Código-fonte
│   ├── main.js                # Entry point
│   ├── perchance-bridge.js    # Ponte para Perchance
│   └── modules/               # Módulos de teste
├── for-perchance.html          # HTML Panel para Perchance
├── for-perchance-list-panel.txt # List Panel para Perchance
├── test-local.html             # Teste local
├── README.md                   # Documentação principal
├── CHANGELOG.md                # Histórico de mudanças
└── CONTRIBUTING.md             # Este arquivo
```

## Convenções de Código

### Commits

Use o padrão Conventional Commits:

```
feat: nova funcionalidade
fix: correção de bug
docs: mudanças em documentação
style: formatação, sem mudança de lógica
refactor: refatoração de código
test: adição ou correção de testes
chore: tarefas de manutenção
```

### Versionamento

Seguimos [Semantic Versioning](https://semver.org/):

- **MAJOR** (X.0.0): Mudanças incompatíveis na API
- **MINOR** (0.X.0): Novas funcionalidades compatíveis
- **PATCH** (0.0.X): Correções de bugs

### Módulos JS

Cada módulo em `src/modules/` deve exportar:

```javascript
export async function init() {
  // Inicialização do módulo
}

export function checkAPI() {
  // Diagnóstico de API (opcional)
}
```

## Troubleshooting

### CDN não atualiza

```bash
# Force purge do cache:
# Acesse no navegador:
https://purge.jsdelivr.net/gh/Fahell/test-perchance-git@vX.Y.Z/src/main.js
```

### Git hooks não executam

```bash
# Reconfigure:
git config core.hooksPath .githooks
chmod +x .githooks/*
```

### Conflitos de merge

```bash
# Abortar rebase:
git rebase --abort

# Resolver conflitos manualmente, depois:
git add .
git rebase --continue
```
