# 🎮 Test Perchance Git (v1.2.3)

Projeto de teste para explorar as capacidades do Perchance com arquitetura modular usando ES6 Modules + GitHub + jsDelivr CDN.

## 📋 Visão Geral

Este projeto demonstra como modularizar código JavaScript para uso no Perchance, permitindo:
- ✅ Código organizado em múltiplos arquivos
- ✅ Versionamento com Git/GitHub
- ✅ Cache-busting via tags de versão
- ✅ Debug facilitado com logs detalhados
- ✅ Testes de plugins do Perchance

## 🏗️ Estrutura do Projeto

```
test-perchance-git/
├── for-perchance.html              # HTML Panel para copiar/colar no Perchance
├── for-perchance-list-panel.txt    # List Panel para copiar/colar no Perchance
├── test-local.html                 # Teste local no navegador
├── README.md                       # Este arquivo
├── .gitignore                      # Configuração Git
└── src/
    ├── main.js                     # Entry point (importa e inicializa tudo)
    ├── perchance-bridge.js         # Ponte segura para root/listas do Perchance
    └── modules/
        ├── renderer.js             # Three.js: cena, câmera, loop
        ├── logic.js                # Lógica do jogo (seed, bioma, eventos)
        ├── ui-test.js              # Painel de testes interativo
        ├── ai-text-test.js         # Teste do plugin AI Text
        ├── image-test.js           # Teste do plugin Image
        ├── lists-test.js           # Teste de listas avançadas
        ├── state-test.js           # Teste de persistência (localStorage)
        ├── raycaster-test.js       # Teste de clique em objetos 3D
        ├── canvas-test.js          # Teste de Canvas 2D + Three.js
        ├── tts-test.js             # Teste do plugin Text-to-Speech
        ├── dice-test.js            # Teste do plugin Dice
        ├── rpg-icon-test.js        # Teste do plugin RPG Icon
        ├── pattern-test.js         # Teste do plugin Pattern Maker
        ├── kv-test.js              # Teste do plugin KV (key-value)
        └── seeder-test.js          # Teste do plugin Seeder
```

## 🚀 Como Usar

### 1. Clone o Repositório

```bash
git clone https://github.com/Fahell/test-perchance-git.git
cd test-perchance-git
```

### 2. Configure o Perchance

#### HTML Panel
Cole o conteúdo de `for-perchance.html` no HTML Panel do seu gerador Perchance.

#### List Panel
Cole o conteúdo de `for-perchance-list-panel.txt` no List Panel:

```perchance
GAME_SEED = 12345
biomas
  tundra
  floresta
  montanha
  planície
itens
  espada mágica
  poção de cura
  mapa antigo
nomes_herois
  Aldric
  Seraphina
  Thorin
  Elara
  Kael

// Plugins (adicione os que quiser testar)
ai = {import:ai-text-plugin}
image = {import:text-to-image-plugin}
speak = {import:text-to-speech-plugin}
dice = {import:dice-plugin}
rpgIcon = {import:rpg-icon-plugin}
pattern = {import:pattern-maker-plugin}
kv = {import:kv-plugin}
seeder = {import:seeder-plugin}
```

### 3. Teste Localmente (Opcional)

Abra `test-local.html` no navegador para testar sem o Perchance.

### 4. Teste no Perchance

1. Cole o HTML Panel no Perchance
2. Cole o List Panel no Perchance
3. Clique em "Preview"
4. Use os botões do painel de testes

## 🧪 Módulos de Teste Disponíveis

### 🤖 IA
- **AI Text**: Geração de texto via IA (streaming, startWith, stopSequences)
- **Image**: Geração de imagem com preview visual (seed, removeBackground, resolução)

### 🎲 Perchance
- **Listas**: selectOne, selectUnique, selectMany, length
- **Bridge**: Acesso a root, variáveis e listas

### 🎨 Three.js
- **Cor Cubo**: Mudar cor do cubo 3D
- **Raycaster**: Clique em objetos 3D (esferas coloridas)
- **Canvas**: Canvas 2D + integração com Three.js (CanvasTexture)

### 🎮 RPG
- **Dice**: Rolagem de dados RPG (1d20, 3d6, 2d8+5, etc.)
- **RPG Icons**: ~500 ícones RPG temáticos com grid de preview

### 🔊 Áudio
- **TTS**: Text-to-Speech com controle de velocidade, pitch e volume

### 🌱 Seeds
- **Seeder**: Geração de seeds copiáveis para reprodutibilidade
- **Pattern**: Geração de padrões procedurais com preview

### 💾 Persistência
- **Save/Load**: localStorage para save/load de estado
- **KV**: Key-value storage persistente (sobrevive reloads)

## 🔄 Atualizando a Versão

### Para Desenvolvedores

Após fazer alterações:

```bash
# 1. Commit e push
git add .
git commit -m "feat: descrição das mudanças"
git push

# 2. Crie uma nova tag
git tag -a v1.2.1 -m "v1.2.1 - Descrição da versão"
git push origin v1.2.1
```

### Para Usuários

No `for-perchance.html`, atualize a URL:

```javascript
// De:
const { initGame } = await import("https://cdn.jsdelivr.net/gh/Fahell/test-perchance-git@v1.2.0/src/main.js");

// Para:
const { initGame } = await import("https://cdn.jsdelivr.net/gh/Fahell/test-perchance-git@v1.2.1/src/main.js");
```

## 🐛 Troubleshooting

### Erro: "Failed to fetch dynamically imported module"

**Causa**: A tag de versão não foi criada ou o push não foi feito.

**Solução**:
1. Verifique se a tag existe: `git tag -l`
2. Verifique se o push foi feito: `git log`
3. Crie a tag: `git tag -a v1.2.0 -m "v1.2.0"`
4. Push da tag: `git push origin v1.2.0`

### Erro: "Module not found"

**Causa**: URL incorreta ou arquivo não existe no repositório.

**Solução**:
1. Verifique a URL no console do navegador
2. Acesse a URL diretamente no navegador para ver se o arquivo existe
3. Verifique se o nome do arquivo está correto (case-sensitive)

### Cache do CDN não atualiza

**Causa**: O jsDelivr pode cachear arquivos antigos.

**Solução**:
1. Sempre use tags de versão (ex: `@v1.2.0`)
2. Para forçar atualização, crie uma nova tag
3. Limpe o cache do navegador (Ctrl+Shift+Del)

### Plugins não funcionam

**Causa**: Plugins não foram importados no List Panel.

**Solução**:
Adicione no List Panel:
```perchance
ai = {import:ai-text-plugin}
image = {import:text-to-image-plugin}
```

## 📚 Recursos Úteis

- [Perchance Official](https://perchance.org/)
- [Perchance Plugins](https://perchance.org/plugins)
- [jsDelivr CDN](https://www.jsdelivr.com/)
- [Three.js Documentation](https://threejs.org/docs/)

## 📝 Licença

Este projeto é de código aberto e pode ser usado livremente para aprendizado e desenvolvimento.

## 🤝 Contribuindo

Sinta-se à vontade para abrir issues ou pull requests com melhorias, novos testes de plugins ou correções de bugs.
