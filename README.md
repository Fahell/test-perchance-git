# 🎮 Perchance Modular Test Project

Projeto de teste para explorar as capacidades do **Perchance.org** com arquitetura modular usando ES Modules via GitHub + jsDelivr CDN.

**Versão:** 1.2.0  
**Status:** ✅ Testes expandidos com 12 módulos de teste

---

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Novidades na v1.2.0](#-novidades-na-v120)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Plugins Testados](#-plugins-testados)
- [Como Usar](#-como-usar)
- [Troubleshooting](#-troubleshooting)
- [Changelog](#-changelog)

---

## 🎯 Visão Geral

Este projeto demonstra como criar um gerador Perchance com código JavaScript modular, hospedado no GitHub e servido via CDN, mantendo o HTML Panel do Perchance limpo e focado apenas na inicialização.

### ✅ Benefícios

- **Código organizado**: Módulos separados por funcionalidade
- **Versionamento**: Controle via Git com tags semânticas
- **Cache-busting**: Uso de tags para evitar cache do CDN
- **Debug moderno**: Console do navegador + sourcemaps
- **Reutilização**: Módulos podem ser importados em outros projetos

---

## 🆕 Novidades na v1.2.0

### Novos Módulos de Teste

| Módulo | Plugin Testado | Funcionalidade |
|--------|----------------|----------------|
| `tts-test.js` | text-to-speech-plugin | Síntese de voz com controle de velocidade, tom e volume |
| `dice-test.js` | dice-plugin | Rolagem de dados RPG (2d6, 1d20+5, etc.) |
| `rpg-icon-test.js` | rpg-icon-plugin | ~500 ícones RPG temáticos |
| `pattern-test.js` | pattern-maker-plugin | Geração de padrões procedurais |
| `kv-test.js` | kv-plugin | Persistência chave-valor avançada |
| `seeder-test.js` | seeder-plugin | Seeds copiáveis para reprodutibilidade |

### Melhorias

- **Image Preview**: Imagens geradas agora aparecem num container visual no canto da tela
- **Painel Reorganizado**: Botões agrupados por categoria (IA, RPG, Áudio, Seeds, Persistência)
- **Logs Melhorados**: Feedback visual no painel de testes

---

## 📁 Estrutura do Projeto

```
test-perchance-git/
├── for-perchance.html              # HTML Panel (cole no Perchance)
├── for-perchance-list-panel.txt    # List Panel (cole no Perchance)
├── README.md                       # Esta documentação
├── CHANGELOG.md                    # Histórico de mudanças
├── test-local.html                 # Teste local no navegador
├── .gitignore                      # Ignora node_modules, .DS_Store
│
└── src/
    ├── main.js                     # Entry point (importa todos os módulos)
    ├── perchance-bridge.js         # Ponte segura para root/listas do Perchance
    │
    └── modules/
        ├── ai-text-test.js         # Plugin AI Text (geração de texto)
        ├── image-test.js           # Plugin Image (geração de imagem)
        ├── lists-test.js           # Listas avançadas (selectMany, selectUnique)
        ├── state-test.js           # Persistência com localStorage
        ├── raycaster-test.js       # Clique em objetos 3D
        ├── canvas-test.js          # Canvas 2D + Three.js
        ├── renderer.js             # Three.js (cena, câmera, loop)
        ├── logic.js                # Lógica do jogo
        │
        └── [NOVOS v1.2.0]
            ├── tts-test.js         # Text-to-Speech
            ├── dice-test.js        # Rolagem de dados
            ├── rpg-icon-test.js    # Ícones RPG
            ├── pattern-test.js     # Padrões procedurais
            ├── kv-test.js          # Key-Value storage
            └── seeder-test.js      # Seeds copiáveis
```

---

## 🔌 Plugins Testados

### Plugins de IA
| Plugin | Uso | Exemplo |
|--------|-----|---------|
| `ai-text-plugin` | Geração de texto por IA | `ai("Escreva uma história...")` |
| `text-to-image-plugin` | Geração de imagem por IA | `image("prompt", {seed: 123})` |

### Plugins de RPG
| Plugin | Uso | Exemplo |
|--------|-----|---------|
| `dice-plugin` | Rolagem de dados | `dice("2d6+3")` |
| `rpg-icon-plugin` | Ícones temáticos | `rpgIcon({category: "weapon"})` |

### Plugins de Áudio
| Plugin | Uso | Exemplo |
|--------|-----|---------|
| `text-to-speech-plugin` | Síntese de voz | `speak("Olá!", {rate: 1.0})` |

### Plugins de Persistência
| Plugin | Uso | Exemplo |
|--------|-----|---------|
| `kv-plugin` | Storage persistente | `kv.set("key", "value")` |
| `remember-plugin` | Variáveis persistentes | `remember("playerName", "Hero")` |

### Plugins de Geração Procedural
| Plugin | Uso | Exemplo |
|--------|-----|---------|
| `pattern-maker-plugin` | Padrões procedurais | `pattern({source: img, seed: 123})` |
| `seeder-plugin` | Seeds copiáveis | `seeder("my-seed")` |

---

## 🚀 Como Usar

### Passo 1: Configurar o GitHub

1. Faça fork ou clone este repositório
2. Faça suas modificações nos arquivos da pasta `src/`
3. Commit e push:
   ```bash
   git add .
   git commit -m "feat: sua modificação"
   git push
   ```

### Passo 2: Criar Tag de Versão

```bash
# Cria tag
git tag -a v1.2.0 -m "Versão 1.2.0 - Novos testes de plugins"

# Push da tag
git push origin v1.2.0
```

### Passo 3: Configurar o Perchance

#### HTML Panel
Cole o conteúdo de `for-perchance.html`:

```html
<div id="game-container" style="width:100vw; height:100vh; overflow:hidden;"></div>

<script type="module">
  const { initGame } = await import("https://cdn.jsdelivr.net/gh/SEU_USUARIO/SEU_REPO@v1.2.0/src/main.js");
  console.log('📄 HTML Panel injetado, chamando initGame()...');
  initGame();
</script>
```

#### List Panel
Cole o conteúdo de `for-perchance-list-panel.txt`:

```perchance
GAME_SEED = 12345

biomas
  tundra
  floresta
  montanha

// Plugins
ai = {import:ai-text-plugin}
image = {import:text-to-image-plugin}
speak = {import:text-to-speech-plugin}
dice = {import:dice-plugin}
// ... adicione os plugins que quiser testar
```

### Passo 4: Testar

1. Recarregue o preview do Perchance
2. Abra o Console (F12)
3. Use os botões do painel de testes no canto inferior esquerdo

---

## 🐛 Troubleshooting

### Problema: "Unexpected token '{'"
**Causa:** Import estático dentro de bloco condicional  
**Solução:** Use `await import()` (import dinâmico)

### Problema: Cache do CDN não atualiza
**Causa:** jsDelivr cacheia branches por até 12h  
**Solução:** Sempre use tags de versão (`@v1.2.0`) em vez de branches (`@main`)

### Problema: Plugin não disponível
**Causa:** Plugin não foi importado no List Panel  
**Solução:** Adicione `variavel = {import:nome-do-plugin}` no List Panel

### Problema: Imagem não aparece no preview
**Causa:** Plugin text-to-image retornou erro ou timeout  
**Solução:** Verifique o console para mensagens de erro. Pode ser limite de uso para contas não logadas.

### Problema: Sintaxe de listas incorreta
**Causa:** Indentação com 4 espaços em vez de 2  
**Solução:** Use exatamente 2 espaços para indentar itens de listas no Perchance

---

## 📝 Changelog

### v1.2.0 (2025-01-21)
- ✅ Adicionados 6 novos módulos de teste (TTS, Dice, RPG Icons, Pattern, KV, Seeder)
- ✅ Image test agora mostra preview visual da imagem gerada
- ✅ Painel de testes reorganizado por categorias
- ✅ URLs atualizadas para @v1.2.0

### v1.1.3 (2025-01-20)
- ✅ Corrigido nome do método AI Text (`testBasicText` → `generateBasic`)
- ✅ Adicionada verificação de disponibilidade dos plugins

### v1.1.2 (2025-01-20)
- ✅ Corrigido tratamento do retorno do plugin text-to-image (String object)
- ✅ Adicionado método `_extractImageUrl()` para extrair URL corretamente

### v1.1.1 (2025-01-20)
- ✅ Corrigido API de listas (`selectUnique` não existe, usando fallback)
- ✅ Melhorado tratamento de erros em todos os módulos

### v1.1.0 (2025-01-20)
- ✅ Adicionados 6 novos módulos de teste
- ✅ Painel de testes expandido com 9 botões
- ✅ Testes para AI Text, Image, Listas, Raycaster, State, Canvas

### v1.0.2 (2025-01-19)
- ✅ Corrigido material do cubo para `MeshStandardMaterial`
- ✅ URLs absolutas com tags para evitar cache

### v1.0.0 (2025-01-19)
- ✅ Primeira versão funcional
- ✅ Módulos básicos: renderer, logic, bridge, ui-test

---

## 📚 Recursos Adicionais

- [Documentação Oficial do Perchance](https://perchance.org/docs)
- [Lista de Plugins do Perchance](https://perchance.org/plugins)
- [jsDelivr CDN](https://www.jsdelivr.com/)
- [Three.js Documentation](https://threejs.org/docs/)

---

## 🤝 Contribuindo

Sinta-se à vontade para:
- Reportar bugs via Issues
- Sugerir novos testes via Issues
- Enviar Pull Requests com melhorias

---

## 📄 Licença

Este projeto é um exemplo educacional. Use livremente em seus próprios geradores Perchance!

---

**Desenvolvido com ❤️ para a comunidade Perchance**
