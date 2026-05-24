import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
const getPerchanceRoot = () => {
  if (typeof window !== "undefined") {
    if (window.root) return window.root;
    if (window.parent && window.parent.root) return window.parent.root;
  }
  return {};
};
const root = getPerchanceRoot();
const GAME_SEED = root.GAME_SEED;
const image = root.image;
const getVar = (varName, fallback = null) => {
  if (root[varName] !== void 0) {
    return root[varName];
  }
  return fallback;
};
const getList = (listName, fallback = []) => {
  if (root[listName] && typeof root[listName].selectOne === "function") {
    return root[listName];
  }
  return {
    selectOne: fallback[Math.floor(Math.random() * fallback.length)] || null,
    selectMany: (n) => fallback.slice(0, n),
    joinItems: (sep) => fallback.join(sep)
  };
};
console.log("🔗 perchance-bridge.js carregado. Root disponível:", !!root);
const bridgeMod = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GAME_SEED,
  getList,
  getVar,
  image,
  root
}, Symbol.toStringTag, { value: "Module" }));
function initRenderer(container2) {
  console.log("🎨 [Renderer] Inicializando Three.js...");
  const existingCanvas = document.querySelector('canvas[data-threejs="true"]');
  if (existingCanvas) {
    console.log("⚠️ [Renderer] Canvas Three.js já existe. Reutilizando...");
    return { scene: null, camera: null, renderer: null, cube: null };
  }
  const loadingEl = document.createElement("div");
  loadingEl.id = "loading-message";
  loadingEl.style.cssText = `
    position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
    background: rgba(30, 30, 50, 0.95); border: 2px solid #4ade80;
    border-radius: 12px; padding: 24px 40px; text-align: center;
    z-index: 2000; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    color: #e2e8f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;
  loadingEl.innerHTML = '🎮 Carregando módulos...<br><small style="display:block;margin-top:8px;color:#94a3b8;font-size:13px">Aguarde enquanto inicializamos o jogo modular</small>';
  document.body.appendChild(loadingEl);
  setTimeout(() => {
    const existingLoading = document.getElementById("loading-message");
    if (existingLoading) {
      existingLoading.remove();
      console.log("🗑️ [Renderer] Mensagem de loading removida (por ID).");
    }
  }, 100);
  document.querySelectorAll("div").forEach((el) => {
    var _a;
    if ((_a = el.textContent) == null ? void 0 : _a.includes("Carregando módulos")) {
      el.remove();
      console.log("🗑️ [Renderer] Mensagem de loading removida (por texto).");
    }
  });
  document.querySelectorAll('[style*="z-index: 2000"]').forEach((el) => {
    if (el.id !== "ui-test-panel") {
      el.remove();
      console.log("🗑️ [Renderer] Elemento com z-index alto removido.");
    }
  });
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(2105381);
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1e3);
  camera.position.z = 5;
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.domElement.style.position = "fixed";
  renderer.domElement.style.top = "0";
  renderer.domElement.style.left = "0";
  renderer.domElement.style.zIndex = "10";
  renderer.domElement.style.pointerEvents = "auto";
  renderer.domElement.setAttribute("data-threejs", "true");
  document.body.appendChild(renderer.domElement);
  const ambientLight = new THREE.AmbientLight(16777215, 0.6);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(16777215, 0.8);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshStandardMaterial({ color: 3900150 });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);
  const animate = () => {
    requestAnimationFrame(animate);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
  };
  animate();
  console.log("🎨 [Renderer] Three.js inicializado com sucesso!");
  return { scene, camera, renderer, cube };
}
function initLogic(seed, bioma) {
  console.log("🧠 [Logic] Inicializando lógica do jogo...");
  console.log(`   Seed: ${seed}`);
  console.log(`   Bioma: ${bioma}`);
  const eventos = getList("eventos", ["nada acontece", "encontro inesperado", "tesouro encontrado"]);
  const eventoAtual = eventos.selectOne;
  console.log(`🎲 Evento sorteado: ${eventoAtual}`);
  window.RPG = window.RPG || {};
  window.RPG.Logic = { seed, bioma, eventoAtual };
  console.log("💡 Debug: window.RPG disponível no console");
  console.log("✅ [Logic] Lógica inicializada com sucesso!");
}
const TEST_MODULES = {
  imageTest: () => Promise.resolve().then(() => imageTest$1),
  aiTextTest: () => Promise.resolve().then(() => aiTextTest$1),
  listsTest: () => Promise.resolve().then(() => listsTest$1),
  stateTest: () => Promise.resolve().then(() => stateTest$1),
  raycasterTest: () => Promise.resolve().then(() => raycasterTest$1),
  canvasTest: () => Promise.resolve().then(() => canvasTest$1),
  ttsTest: () => Promise.resolve().then(() => ttsTest$1),
  diceTest: () => Promise.resolve().then(() => diceTest$1),
  rpgIconTest: () => Promise.resolve().then(() => rpgIconTest$1),
  patternTest: () => Promise.resolve().then(() => patternTest$1),
  kvTest: () => Promise.resolve().then(() => kvTest$1),
  seederTest: () => Promise.resolve().then(() => seederTest$1),
  apexchartsTest: () => Promise.resolve().then(() => apexchartsTest$1),
  audioTest: () => Promise.resolve().then(() => audioTest)
};
const loadedModules = {};
async function loadTestModule(moduleName) {
  if (loadedModules[moduleName]) {
    return loadedModules[moduleName];
  }
  try {
    console.log(`🔍 [Main] Carregando ${moduleName}...`);
    const mod = await TEST_MODULES[moduleName]();
    loadedModules[moduleName] = mod;
    console.log(`✅ [Main] ${moduleName} carregado`);
    return mod;
  } catch (error) {
    console.error(`❌ [Main] Falha ao carregar ${moduleName}:`, error.message);
    return null;
  }
}
async function loadAllTestModules() {
  console.log("📦 [Main] Carregando módulos de teste em paralelo...");
  const promises = Object.keys(TEST_MODULES).map(async (key) => {
    const mod = await loadTestModule(key);
    return { key, mod };
  });
  const results = await Promise.all(promises);
  const modules = {};
  for (const { key, mod } of results) {
    if (mod) {
      modules[key] = mod[key] || mod;
    }
  }
  console.log(`✅ [Main] ${Object.keys(modules).length}/${Object.keys(TEST_MODULES).length} módulos carregados`);
  return modules;
}
function initTestModules(modules, rendererData) {
  console.log("🔧 [Main] Inicializando módulos que precisam de setup...");
  if (modules.canvasTest && modules.canvasTest.init) {
    try {
      modules.canvasTest.init(rendererData);
      console.log("✅ [Main] canvasTest inicializado");
    } catch (e) {
      console.error("❌ [Main] Erro ao inicializar canvasTest:", e.message);
    }
  }
  if (modules.raycasterTest && modules.raycasterTest.init) {
    try {
      modules.raycasterTest.init(rendererData);
      console.log("✅ [Main] raycasterTest inicializado");
    } catch (e) {
      console.error("❌ [Main] Erro ao inicializar raycasterTest:", e.message);
    }
  }
}
async function initGame() {
  if (window.GAME_INITIALIZED) {
    console.warn("⏭️ Jogo já inicializado. Ignorando execução duplicada.");
    return;
  }
  window.GAME_INITIALIZED = true;
  console.log("🔍 [Main] initGame() chamado. Verificando estado...");
  try {
    console.log("🚀 [Main] Iniciando jogo (Vite bundle v1.3.0)");
    const { root: root2, getVar: getVar2, getList: getList2 } = bridgeMod;
    console.log("🎨 [Main] Chamando initRenderer...");
    const rendererData = initRenderer(document.getElementById("game-container"));
    const seed = getVar2("GAME_SEED", 999);
    const bioma = getList2("biomas", ["planície"]).selectOne;
    initLogic(seed, bioma);
    const testModules = await loadAllTestModules();
    initTestModules(testModules, rendererData);
    console.log("🔍 [Main] Carregando módulo ui-test.js...");
    const uiTestMod = await Promise.resolve().then(() => uiTest);
    if (uiTestMod && uiTestMod.initUITest) {
      console.log("🎮 [Main] Chamando initUITest...");
      console.log("📦 [Main] rendererData passado:", rendererData);
      console.log("   renderer.cube:", rendererData.cube);
      uiTestMod.initUITest(rendererData, testModules);
    } else {
      console.error("❌ [Main] ui-test.js não carregou corretamente");
    }
    console.log("✅ [Main] Jogo inicializado com sucesso!");
    console.log("💡 Debug: window.RPG disponível no console");
    window.RPG = {
      renderer: rendererData,
      seed,
      bioma,
      root: root2,
      tests: testModules
    };
  } catch (error) {
    console.error("❌ [Main] Erro fatal na inicialização:", error);
    console.error("Stack trace:", error.stack);
    const errorDiv = document.createElement("div");
    errorDiv.style.cssText = ` 
      position: fixed; bottom: 20px; left: 20px; z-index: 9999;
      background: #ff0000; color: white; padding: 20px;
      border-radius: 8px; font-family: monospace; font-size: 14px;
      border: 2px solid #ff6b6b; max-width: 500px;
      max-height: 300px; overflow-y: auto;
    `;
    errorDiv.innerHTML = `
      <strong>❌ Erro ao iniciar o jogo</strong><br>
      <strong>Mensagem:</strong> ${error.message}<br>
      <strong>Stack:</strong><br>
      <pre style="font-size:11px; white-space:pre-wrap;">${error.stack || "N/A"}</pre>
      <small>Verifique o console (F12) para mais detalhes.</small>
    `;
    document.body.appendChild(errorDiv);
  }
}
console.log("📦 [Main] main.js carregado (Vite bundle). Aguardando initGame()...");
const imageTest = {
  available: !!root.image,
  containerId: "image-preview-container",
  // Helper para extrair URL da imagem do retorno do plugin
  _extractImageUrl(result) {
    if (!result) return null;
    if (result.dataUrl) return result.dataUrl;
    if (result.src) return result.src;
    if (result.url) return result.url;
    const strValue = result.toString ? result.toString() : String(result);
    if (strValue && strValue.startsWith("data:image/")) return strValue;
    if (typeof result === "string" && result.startsWith("data:image/")) return result;
    return null;
  },
  // Cria ou retorna o container de preview
  _getOrCreateContainer() {
    let container2 = document.getElementById(this.containerId);
    if (!container2) {
      container2 = document.createElement("div");
      container2.id = this.containerId;
      container2.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 320px;
        background: rgba(0, 0, 0, 0.9);
        border: 2px solid #4ade80;
        border-radius: 12px;
        padding: 15px;
        font-family: monospace;
        font-size: 12px;
        color: white;
        z-index: 9998;
        box-shadow: 0 4px 20px rgba(0, 255, 0, 0.3);
      `;
      container2.innerHTML = `
        <h3 style="margin: 0 0 10px 0; color: #4ade80; font-size: 14px;">🖼️ Preview de Imagem</h3>
        <div id="image-preview-area" style="
          width: 100%;
          height: 200px;
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          margin-bottom: 10px;
        ">
          <span style="color: #666;">Nenhuma imagem gerada</span>
        </div>
        <div id="image-info" style="color: #aaa; font-size: 11px;">
          Aguardando geração...
        </div>
      `;
      document.body.appendChild(container2);
    }
    return container2;
  },
  // Atualiza o preview com a imagem gerada
  _updatePreview(imageUrl, info2) {
    const previewArea = document.getElementById("image-preview-area");
    const infoDiv = document.getElementById("image-info");
    if (imageUrl) {
      previewArea.innerHTML = `<img src="${imageUrl}" style="
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
        image-rendering: pixelated;
      " />`;
      infoDiv.innerHTML = info2 || "✅ Imagem gerada com sucesso!";
    } else {
      previewArea.innerHTML = '<span style="color: #ff6b6b;">❌ Falha na geração</span>';
      infoDiv.innerHTML = info2 || "Erro ao gerar imagem";
    }
  },
  // Teste 1: Geração básica com seed fixa
  async testBasicImage() {
    console.log("🖼️ [Image] Gerando imagem básica com seed fixa...");
    this._getOrCreateContainer();
    this._updatePreview(null, "⏳ Gerando imagem...");
    try {
      const result = await root.image(
        "papercraft warrior with sword, fantasy art style",
        {
          seed: 12345,
          resolution: "512x512",
          negativePrompt: "blurry, low quality"
        }
      );
      const imageUrl = this._extractImageUrl(result);
      if (imageUrl) {
        console.log("✅ [Image] Imagem gerada com sucesso!");
        console.log("   Data URL length:", imageUrl.length, "chars");
        console.log("   Tipo do resultado:", typeof result, result.constructor.name);
        this._updatePreview(imageUrl, `
          ✅ Seed: 12345<br>
          📐 Resolução: 512x512<br>
          📏 Tamanho: ${(imageUrl.length / 1024).toFixed(1)}KB
        `);
        return { success: true, url: imageUrl, seed: 12345 };
      } else {
        throw new Error("Não foi possível extrair URL da imagem");
      }
    } catch (error) {
      console.error("❌ [Image] Falha na geração:", error.message);
      this._updatePreview(null, `❌ Erro: ${error.message}`);
      return { success: false, error: error.message };
    }
  },
  // Teste 2: Remove background (fundo transparente)
  async testRemoveBackground() {
    console.log("🖼️ [Image] Testando removeBackground...");
    this._getOrCreateContainer();
    this._updatePreview(null, "⏳ Gerando imagem sem fundo...");
    try {
      const result = await root.image(
        "papercraft character, simple background",
        {
          seed: 54321,
          resolution: "512x512",
          removeBackground: true,
          negativePrompt: "complex background, scenery"
        }
      );
      const imageUrl = this._extractImageUrl(result);
      if (imageUrl) {
        console.log("✅ [Image] Imagem sem fundo gerada!");
        const previewArea = document.getElementById("image-preview-area");
        previewArea.style.background = `
          linear-gradient(45deg, #333 25%, transparent 25%),
          linear-gradient(-45deg, #333 25%, transparent 25%),
          linear-gradient(45deg, transparent 75%, #333 75%),
          linear-gradient(-45deg, transparent 75%, #333 75%)
        `;
        previewArea.style.backgroundSize = "20px 20px";
        previewArea.style.backgroundPosition = "0 0, 0 10px, 10px -10px, -10px 0px";
        this._updatePreview(imageUrl, `
          ✅ Seed: 54321<br>
          🔍 RemoveBackground: true<br>
          🎨 Fundo transparente (quadriculado)
        `);
        return { success: true, url: imageUrl, transparent: true };
      } else {
        throw new Error("Não foi possível extrair URL da imagem");
      }
    } catch (error) {
      console.error("❌ [Image] Falha:", error.message);
      this._updatePreview(null, `❌ Erro: ${error.message}`);
      return { success: false, error: error.message };
    }
  },
  // Teste 3: Comparação de seeds diferentes
  async testSeedComparison() {
    console.log("🖼️ [Image] Comparando seeds diferentes...");
    this._getOrCreateContainer();
    this._updatePreview(null, "⏳ Gerando 2 imagens com seeds diferentes...");
    try {
      const seed1 = 11111;
      const seed2 = 99999;
      const prompt = "papercraft dragon, fantasy style";
      console.log(`   Gerando com seed ${seed1}...`);
      const result1 = await root.image(prompt, { seed: seed1, resolution: "256x256" });
      console.log(`   Gerando com seed ${seed2}...`);
      const result2 = await root.image(prompt, { seed: seed2, resolution: "256x256" });
      const url1 = this._extractImageUrl(result1);
      const url2 = this._extractImageUrl(result2);
      if (url1 && url2) {
        console.log("✅ [Image] Ambas imagens geradas!");
        const previewArea = document.getElementById("image-preview-area");
        previewArea.style.height = "250px";
        previewArea.innerHTML = `
          <div style="display: flex; gap: 5px; align-items: center; justify-content: center;">
            <div style="text-align: center;">
              <img src="${url1}" style="width: 120px; height: 120px; object-fit: contain;" />
              <div style="color: #4ade80; font-size: 10px; margin-top: 5px;">Seed: ${seed1}</div>
            </div>
            <div style="color: #666; font-size: 18px;">vs</div>
            <div style="text-align: center;">
              <img src="${url2}" style="width: 120px; height: 120px; object-fit: contain;" />
              <div style="color: #4ade80; font-size: 10px; margin-top: 5px;">Seed: ${seed2}</div>
            </div>
          </div>
        `;
        document.getElementById("image-info").innerHTML = `
          ✅ Mesma prompt, seeds diferentes<br>
          📐 Resolução: 256x256 cada
        `;
        return { success: true, images: [url1, url2], seeds: [seed1, seed2] };
      } else {
        throw new Error("Falha ao gerar uma ou ambas imagens");
      }
    } catch (error) {
      console.error("❌ [Image] Falha na comparação:", error.message);
      this._updatePreview(null, `❌ Erro: ${error.message}`);
      return { success: false, error: error.message };
    }
  },
  // Teste 4: Diferentes resoluções
  async testResolution() {
    console.log("🖼️ [Image] Testando resolução customizada...");
    this._getOrCreateContainer();
    this._updatePreview(null, "⏳ Gerando imagem 768x384...");
    try {
      const result = await root.image(
        "papercraft landscape, wide view",
        {
          seed: 77777,
          resolution: "768x384",
          negativePrompt: "portrait, vertical"
        }
      );
      const imageUrl = this._extractImageUrl(result);
      if (imageUrl) {
        console.log("✅ [Image] Imagem wide gerada!");
        const previewArea = document.getElementById("image-preview-area");
        previewArea.style.height = "180px";
        this._updatePreview(imageUrl, `
          ✅ Seed: 77777<br>
          📐 Resolução: 768x384 (16:9)<br>
          🎨 Formato wide/landscape
        `);
        return { success: true, url: imageUrl, resolution: "768x384" };
      } else {
        throw new Error("Não foi possível extrair URL da imagem");
      }
    } catch (error) {
      console.error("❌ [Image] Falha:", error.message);
      this._updatePreview(null, `❌ Erro: ${error.message}`);
      return { success: false, error: error.message };
    }
  },
  // Limpa o container
  clear() {
    const container2 = document.getElementById(this.containerId);
    if (container2) {
      container2.remove();
      console.log("🗑️ [Image] Container de preview removido");
    }
  }
};
console.log("🖼️ [Image] Inicializando teste do plugin de imagem...");
if (imageTest.available) {
  console.log("✅ [Image] Plugin text-to-image-plugin disponível");
} else {
  console.warn("⚠️ [Image] Plugin text-to-image-plugin NÃO disponível");
  console.warn("   Adicione no List Panel: image = {import:text-to-image-plugin}");
}
const imageTest$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  imageTest
}, Symbol.toStringTag, { value: "Module" }));
const aiTextTest = {
  available: !!root.ai,
  // Teste 1: Geração básica
  async generateBasic(prompt = "Escreva uma frase curta sobre um aventureiro.") {
    console.log("🤖 [AI-Text] Gerando texto básico...");
    if (!this.available) {
      console.warn("⚠️ [AI-Text] Plugin não disponível");
      return { success: false, error: "Plugin não disponível" };
    }
    try {
      const result = await root.ai(prompt);
      console.log("✅ [AI-Text] Texto gerado:", result.generatedText);
      return { success: true, text: result.generatedText };
    } catch (error) {
      console.error("❌ [AI-Text] Erro na geração básica:", error);
      return { success: false, error: error.message };
    }
  },
  // Teste 2: Geração com streaming (onChunk)
  async generateWithStreaming(prompt = "Descreva uma masmorra perigosa em 2 frases.") {
    console.log("🤖 [AI-Text] Gerando com streaming...");
    if (!this.available) {
      return { success: false, error: "Plugin não disponível" };
    }
    let fullText = "";
    try {
      const result = await root.ai({
        instruction: prompt,
        onChunk: (data) => {
          fullText += data.textChunk;
          console.log("📝 [AI-Text] Chunk:", data.textChunk);
        },
        onFinish: (data) => {
          console.log("✅ [AI-Text] Finalizado. Texto completo:", data.generatedText);
        }
      });
      return { success: true, text: fullText };
    } catch (error) {
      console.error("❌ [AI-Text] Erro no streaming:", error);
      return { success: false, error: error.message };
    }
  },
  // Teste 3: Geração com startWith
  async generateWithStartWith(prompt = "Complete a frase sobre um dragão.") {
    console.log("🤖 [AI-Text] Gerando com startWith...");
    if (!this.available) {
      return { success: false, error: "Plugin não disponível" };
    }
    try {
      const result = await root.ai({
        instruction: prompt,
        startWith: "O dragão ancestral",
        hideStartWith: false
      });
      console.log("✅ [AI-Text] Texto com startWith:", result.generatedText);
      return { success: true, text: result.generatedText };
    } catch (error) {
      console.error("❌ [AI-Text] Erro com startWith:", error);
      return { success: false, error: error.message };
    }
  },
  // Teste 4: Geração com stopSequences
  async generateWithStop(prompt = 'Conte uma história curta. Pare quando disser "fim".') {
    console.log("🤖 [AI-Text] Gerando com stopSequences...");
    if (!this.available) {
      return { success: false, error: "Plugin não disponível" };
    }
    try {
      const result = await root.ai({
        instruction: prompt,
        stopSequences: ["fim", "FIM", "The End"]
      });
      console.log("✅ [AI-Text] Texto com stop:", result.generatedText);
      return { success: true, text: result.generatedText };
    } catch (error) {
      console.error("❌ [AI-Text] Erro com stopSequences:", error);
      return { success: false, error: error.message };
    }
  }
};
console.log("🤖 [AI-Text] Inicializando teste do plugin de texto IA...");
if (aiTextTest.available) {
  console.log("✅ [AI-Text] Plugin ai-text-plugin disponível");
} else {
  console.warn("⚠️ [AI-Text] Plugin ai-text-plugin NÃO disponível");
  console.warn("   Adicione no List Panel: ai = {import:ai-text-plugin}");
}
const aiTextTest$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  aiTextTest
}, Symbol.toStringTag, { value: "Module" }));
const listsTest = {
  available: true,
  // Helper para obter lista (prioriza root, fallback para lista padrão)
  getPerchanceList(listName, fallback = []) {
    if (root && root[listName]) {
      return root[listName];
    }
    console.warn(`⚠️ [Lists] Lista '${listName}' não encontrada no root, usando fallback`);
    return fallback;
  },
  // Teste 1: selectOne (básico)
  testSelectOne(listName = "itens") {
    console.log(`📋 [Lists] Testando selectOne em '${listName}'...`);
    try {
      const list = this.getPerchanceList(listName, ["item padrão"]);
      const selected = typeof list.selectOne === "function" ? list.selectOne() : list.selectOne;
      console.log(`✅ [Lists] Item selecionado: ${selected}`);
      return selected;
    } catch (error) {
      console.error(`❌ [Lists] Erro em selectOne:`, error);
      return null;
    }
  },
  // Teste 2: selectMany (múltiplos itens com repetição)
  testSelectMany(listName = "itens", count = 3) {
    console.log(`📋 [Lists] Testando selectMany(${count}) em '${listName}'...`);
    try {
      const list = this.getPerchanceList(listName, ["item padrão"]);
      const selected = typeof list.selectMany === "function" ? list.selectMany(count) : Array(count).fill(list.selectOne || "item");
      console.log(`✅ [Lists] ${count} itens selecionados:`, selected);
      return selected;
    } catch (error) {
      console.error(`❌ [Lists] Erro em selectMany:`, error);
      return [];
    }
  },
  // Teste 3: selectUnique (sem repetição)
  testSelectUnique(listName = "nomes_herois", count = 2) {
    console.log(`📋 [Lists] Testando selectUnique(${count}) em '${listName}'...`);
    try {
      const list = this.getPerchanceList(listName, ["Herói Padrão"]);
      if (typeof list.selectUnique === "function") {
        const selected = list.selectUnique(count);
        console.log(`✅ [Lists] ${count} itens únicos selecionados:`, selected);
        return selected;
      } else {
        console.warn(`⚠️ [Lists] selectUnique não disponível, usando fallback com selectMany`);
        const items = list.selectMany ? list.selectMany(count * 2) : [];
        const unique = [...new Set(items.map((i) => typeof i === "object" ? i.toString() : i))].slice(0, count);
        console.log(`✅ [Lists] ${unique.length} itens únicos (fallback):`, unique);
        return unique;
      }
    } catch (error) {
      console.error(`❌ [Lists] Erro em selectUnique:`, error);
      return [];
    }
  },
  // Teste 4: consumableList (lista que "consome" itens)
  testConsumableList(listName = "eventos") {
    console.log(`📋 [Lists] Testando consumableList em '${listName}'...`);
    try {
      const list = this.getPerchanceList(listName, ["evento padrão"]);
      if (list.consumableList) {
        const consumable = list.consumableList;
        const results = [];
        for (let i = 0; i < 3; i++) {
          const item = typeof consumable.selectOne === "function" ? consumable.selectOne() : consumable.selectOne;
          results.push(item);
          console.log(`  Consumo ${i + 1}: ${item}`);
        }
        console.log(`✅ [Lists] Itens consumidos:`, results);
        return results;
      } else {
        console.warn(`⚠️ [Lists] consumableList não disponível`);
        return [];
      }
    } catch (error) {
      console.error(`❌ [Lists] Erro em consumableList:`, error);
      return [];
    }
  },
  // Teste 5: pluralForm
  testPluralForm(listName = "itens") {
    console.log(`📋 [Lists] Testando pluralForm em '${listName}'...`);
    try {
      const list = this.getPerchanceList(listName, ["item"]);
      const item = typeof list.selectOne === "function" ? list.selectOne() : list.selectOne;
      const singular = typeof item === "string" ? item : String(item);
      const plural = singular.pluralForm || `${singular}s`;
      console.log(`✅ [Lists] Singular: "${singular}" → Plural: "${plural}"`);
      return { singular, plural };
    } catch (error) {
      console.error(`❌ [Lists] Erro em pluralForm:`, error);
      return { singular: "item", plural: "items" };
    }
  },
  // Teste 6: titleCase
  testTitleCase(listName = "adjetivos") {
    console.log(`📋 [Lists] Testando titleCase em '${listName}'...`);
    try {
      const list = this.getPerchanceList(listName, ["adjetivo"]);
      const item = typeof list.selectOne === "function" ? list.selectOne() : list.selectOne;
      const normal = typeof item === "string" ? item : String(item);
      const titled = normal.titleCase || normal.charAt(0).toUpperCase() + normal.slice(1);
      console.log(`✅ [Lists] Normal: "${normal}" → TitleCase: "${titled}"`);
      return { normal, titled };
    } catch (error) {
      console.error(`❌ [Lists] Erro em titleCase:`, error);
      return { normal: "adjetivo", titled: "Adjetivo" };
    }
  },
  // Teste 7: joinItems
  testJoinItems(listName = "itens", separator = ", ") {
    console.log(`📋 [Lists] Testando joinItems("${separator}") em '${listName}'...`);
    try {
      const list = this.getPerchanceList(listName, ["item"]);
      const items = list.selectMany ? list.selectMany(3) : ["item1", "item2", "item3"];
      const joined = items.joinItems ? items.joinItems(separator) : items.join(separator);
      console.log(`✅ [Lists] Itens unidos: "${joined}"`);
      return joined;
    } catch (error) {
      console.error(`❌ [Lists] Erro em joinItems:`, error);
      return "item1, item2, item3";
    }
  },
  // Teste 8: Comprimento da lista
  testListLength(listName = "itens") {
    console.log(`📋 [Lists] Testando length de '${listName}'...`);
    try {
      const list = this.getPerchanceList(listName, ["item"]);
      const length = list.getLength ? list.getLength : list.length || 0;
      console.log(`✅ [Lists] Comprimento da lista: ${length}`);
      return length;
    } catch (error) {
      console.error(`❌ [Lists] Erro em getLength:`, error);
      return 0;
    }
  },
  // Teste 9: getAllKeys (lista de todas as chaves)
  testGetAllKeys(listName = "itens") {
    console.log(`📋 [Lists] Testando getAllKeys em '${listName}'...`);
    try {
      const list = this.getPerchanceList(listName, ["item"]);
      const keys = list.getAllKeys || list.$allKeys || [];
      console.log(`✅ [Lists] Chaves disponíveis:`, keys);
      return keys;
    } catch (error) {
      console.error(`❌ [Lists] Erro em getAllKeys:`, error);
      return [];
    }
  }
};
console.log("📋 [Lists] Inicializando teste de listas avançadas...");
const listsTest$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  listsTest
}, Symbol.toStringTag, { value: "Module" }));
const STORAGE_KEY = "rpg_perchance_state";
const STORAGE_VERSION = 1;
let storageAvailable = true;
try {
  const test = "__storage_test__";
  localStorage.setItem(test, test);
  localStorage.removeItem(test);
} catch (e) {
  console.warn("⚠️ [State] localStorage não disponível:", e.message);
  storageAvailable = false;
}
const defaultState = {
  version: STORAGE_VERSION,
  gameSeed: getVar("GAME_SEED", 12345),
  player: {
    name: "Herói",
    level: 1,
    hp: 100,
    maxHp: 100,
    inventory: []
  },
  world: {
    bioma: "planície",
    visitedChunks: [],
    discoveredItems: []
  },
  settings: {
    musicVolume: 0.7,
    sfxVolume: 1,
    language: "pt-BR"
  },
  lastSaved: null
};
const stateTest = {
  available: storageAvailable,
  // Salva estado
  save(state) {
    console.log("💾 [State] Salvando estado...");
    const stateToSave = {
      ...state,
      version: STORAGE_VERSION,
      lastSaved: (/* @__PURE__ */ new Date()).toISOString()
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
      console.log("✅ [State] Estado salvo com sucesso");
      return true;
    } catch (error) {
      console.error("❌ [State] Erro ao salvar:", error);
      return false;
    }
  },
  // Carrega estado
  load() {
    console.log("💾 [State] Carregando estado...");
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        console.log("⚠️ [State] Nenhum estado salvo encontrado");
        return null;
      }
      const state = JSON.parse(saved);
      if (state.version !== STORAGE_VERSION) {
        console.warn(`⚠️ [State] Versão do save (${state.version}) diferente da atual (${STORAGE_VERSION}). Migrando...`);
      }
      console.log("✅ [State] Estado carregado:", state);
      return state;
    } catch (error) {
      console.error("❌ [State] Erro ao carregar:", error);
      return null;
    }
  },
  // Limpa estado
  clear() {
    console.log("🗑️ [State] Limpando estado salvo...");
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log("✅ [State] Estado limpo");
      return true;
    } catch (error) {
      console.error("❌ [State] Erro ao limpar:", error);
      return false;
    }
  },
  // Retorna estado padrão
  getDefaultState() {
    return JSON.parse(JSON.stringify(defaultState));
  },
  // Retorna informações do storage
  getStorageInfo() {
    const saved = localStorage.getItem(STORAGE_KEY);
    return {
      hasSave: !!saved,
      size: saved ? saved.length : 0,
      lastSaved: saved ? JSON.parse(saved).lastSaved : null
    };
  }
};
console.log("💾 [State] Inicializando teste de persistência...");
if (stateTest.available) {
  console.log("✅ [State] localStorage disponível");
} else {
  console.warn("⚠️ [State] localStorage NÃO disponível");
}
const stateTest$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  stateTest
}, Symbol.toStringTag, { value: "Module" }));
const raycasterTest = {
  available: false,
  spheres: [],
  raycaster: null,
  mouse: null,
  rendererData: null,
  // Inicializa o teste de raycaster
  init(rendererData) {
    console.log("🖱️ [Raycaster] Inicializando teste de clique em objetos 3D...");
    if (!rendererData || !rendererData.scene || !rendererData.camera) {
      console.warn("⚠️ [Raycaster] Renderer não disponível");
      return false;
    }
    this.rendererData = rendererData;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    const { scene, camera, renderer } = rendererData;
    const colors = [16739179, 5164484, 16770669, 9822675];
    for (let i = 0; i < 4; i++) {
      const geometry = new THREE.SphereGeometry(0.5, 16, 16);
      const material = new THREE.MeshStandardMaterial({
        color: colors[i],
        roughness: 0.3,
        metalness: 0.7
      });
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.x = (i - 1.5) * 2;
      sphere.position.y = -2;
      sphere.position.z = -3;
      sphere.userData = { name: `Esfera ${i + 1}`, clickable: true };
      scene.add(sphere);
      this.spheres.push(sphere);
    }
    console.log(`✅ [Raycaster] ${this.spheres.length} esferas clicáveis adicionadas à cena`);
    const onMouseClick = (event) => {
      this.mouse.x = event.clientX / window.innerWidth * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      this.raycaster.setFromCamera(this.mouse, camera);
      const intersects = this.raycaster.intersectObjects(this.spheres);
      if (intersects.length > 0) {
        const clicked = intersects[0].object;
        console.log(`🖱️ [Raycaster] Clique detectado em: ${clicked.userData.name}`);
        console.log(`   Posição:`, clicked.position);
        const originalColor = clicked.material.color.getHex();
        clicked.material.color.setHex(16777215);
        setTimeout(() => {
          clicked.material.color.setHex(originalColor);
        }, 200);
        window.dispatchEvent(new CustomEvent("rpg-object-clicked", {
          detail: {
            name: clicked.userData.name,
            position: clicked.position.clone(),
            object: clicked
          }
        }));
      }
    };
    const onMouseMove = (event) => {
      this.mouse.x = event.clientX / window.innerWidth * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      this.raycaster.setFromCamera(this.mouse, camera);
      const intersects = this.raycaster.intersectObjects(this.spheres);
      this.spheres.forEach((s) => {
        if (s.userData.originalColor) {
          s.material.color.setHex(s.userData.originalColor);
        }
      });
      if (intersects.length > 0) {
        const hovered = intersects[0].object;
        if (!hovered.userData.originalColor) {
          hovered.userData.originalColor = hovered.material.color.getHex();
        }
        hovered.material.color.setHex(16777215);
        document.body.style.cursor = "pointer";
      } else {
        document.body.style.cursor = "default";
      }
    };
    renderer.domElement.addEventListener("click", onMouseClick);
    renderer.domElement.addEventListener("mousemove", onMouseMove);
    this.available = true;
    console.log("✅ [Raycaster] Eventos de clique e hover ativados");
    return true;
  },
  // Retorna informações das esferas
  getSpheres() {
    return this.spheres.map((s) => ({
      name: s.userData.name,
      position: s.position.clone(),
      color: s.material.color.getHex()
    }));
  },
  // Limpa tudo
  cleanup() {
    if (!this.rendererData) return;
    const { scene, renderer } = this.rendererData;
    this.spheres.forEach((s) => scene.remove(s));
    this.spheres = [];
    console.log("🗑️ [Raycaster] Esferas limpas");
  }
};
console.log("🖱️ [Raycaster] Inicializando teste de clique em objetos 3D...");
const raycasterTest$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  raycasterTest
}, Symbol.toStringTag, { value: "Module" }));
const canvasTest = {
  available: true,
  canvas2D: null,
  ctx: null,
  threeIntegration: null,
  // Inicializa o canvas 2D
  init(rendererData) {
    console.log("🎨 [Canvas] Inicializando teste de Canvas 2D...");
    this.canvas2D = document.createElement("canvas");
    this.canvas2D.width = 512;
    this.canvas2D.height = 512;
    this.canvas2D.style.cssText = "position: fixed; bottom: 20px; right: 20px; z-index: 50; border: 2px solid #4ade80; border-radius: 4px;";
    this.ctx = this.canvas2D.getContext("2d");
    document.body.appendChild(this.canvas2D);
    console.log("✅ [Canvas] Canvas 2D criado (512x512)");
    if (rendererData && rendererData.scene) {
      console.log("🎨 [Canvas] Integrando com Three.js...");
      const texture = new THREE.CanvasTexture(this.canvas2D);
      texture.needsUpdate = true;
      const geometry = new THREE.PlaneGeometry(4, 4);
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide,
        transparent: true
      });
      const plane = new THREE.Mesh(geometry, material);
      plane.position.set(0, 0, -5);
      plane.visible = false;
      rendererData.scene.add(plane);
      this.threeIntegration = {
        plane,
        texture,
        // Mostra o plano no Three.js
        show: () => {
          plane.visible = true;
          texture.needsUpdate = true;
          console.log("🎨 [Canvas] Plano 3D visível");
        },
        // Esconde o plano
        hide: () => {
          plane.visible = false;
          console.log("🎨 [Canvas] Plano 3D oculto");
        },
        // Atualiza a textura (após desenhar no canvas)
        update: () => {
          texture.needsUpdate = true;
          console.log("🎨 [Canvas] Textura atualizada");
        }
      };
      console.log("✅ [Canvas] Integração com Three.js concluída");
    }
  },
  // Desenha um gradiente
  drawGradient() {
    if (!this.ctx) return;
    const gradient = this.ctx.createLinearGradient(0, 0, 512, 512);
    gradient.addColorStop(0, "#667eea");
    gradient.addColorStop(1, "#764ba2");
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, 512, 512);
    console.log("🎨 [Canvas] Gradiente desenhado");
    if (this.threeIntegration) this.threeIntegration.update();
  },
  // Desenha círculos aleatórios
  drawCircles(count = 20) {
    if (!this.ctx) return;
    for (let i = 0; i < count; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const radius = Math.random() * 50 + 10;
      const color = `hsl(${Math.random() * 360}, 70%, 60%)`;
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius, 0, Math.PI * 2);
      this.ctx.fillStyle = color;
      this.ctx.fill();
    }
    console.log(`🎨 [Canvas] ${count} círculos desenhados`);
    if (this.threeIntegration) this.threeIntegration.update();
  },
  // Desenha texto
  drawText(text = "RPG Paper Craft", x = 256, y = 256) {
    if (!this.ctx) return;
    this.ctx.font = "bold 32px monospace";
    this.ctx.fillStyle = "#ffffff";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(text, x, y);
    this.ctx.shadowColor = "#000000";
    this.ctx.shadowBlur = 10;
    this.ctx.fillText(text, x, y);
    this.ctx.shadowBlur = 0;
    console.log(`🎨 [Canvas] Texto "${text}" desenhado`);
    if (this.threeIntegration) this.threeIntegration.update();
  },
  // Desenha padrão de "papel rasgado" (fog-of-war)
  drawFogOfWar(revealX = 256, revealY = 256, revealRadius = 100) {
    if (!this.ctx) return;
    this.ctx.fillStyle = "#000000";
    this.ctx.fillRect(0, 0, 512, 512);
    this.ctx.save();
    this.ctx.globalCompositeOperation = "destination-out";
    const baseRadius = revealRadius;
    for (let angle = 0; angle < Math.PI * 2; angle += 0.2) {
      const offset = Math.random() * 20 - 10;
      const x = revealX + Math.cos(angle) * (baseRadius + offset);
      const y = revealY + Math.sin(angle) * (baseRadius + offset);
      const r = Math.random() * 15 + 10;
      this.ctx.beginPath();
      this.ctx.arc(x, y, r, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.beginPath();
    this.ctx.arc(revealX, revealY, baseRadius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
    console.log(`🎨 [Canvas] Fog-of-war desenhado em (${revealX}, ${revealY})`);
    if (this.threeIntegration) this.threeIntegration.update();
  },
  // Desenha grade (para debug)
  drawGrid(cellSize = 32) {
    if (!this.ctx) return;
    this.ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    this.ctx.lineWidth = 1;
    for (let x = 0; x <= 512; x += cellSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, 512);
      this.ctx.stroke();
    }
    for (let y = 0; y <= 512; y += cellSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(512, y);
      this.ctx.stroke();
    }
    console.log(`🎨 [Canvas] Grade desenhada (células de ${cellSize}px)`);
    if (this.threeIntegration) this.threeIntegration.update();
  },
  // Mostra o plano 3D
  showThreePlane() {
    if (this.threeIntegration) {
      this.threeIntegration.show();
    }
  },
  // Esconde o plano 3D
  hideThreePlane() {
    if (this.threeIntegration) {
      this.threeIntegration.hide();
    }
  },
  // Limpa tudo
  cleanup() {
    if (this.canvas2D && this.canvas2D.parentNode) {
      this.canvas2D.parentNode.removeChild(this.canvas2D);
    }
    if (this.threeIntegration && this.threeIntegration.plane) {
      this.threeIntegration.plane.parent.remove(this.threeIntegration.plane);
    }
    console.log("🗑️ [Canvas] Canvas e recursos limpos");
  }
};
console.log("🎨 [Canvas] Inicializando teste de Canvas 2D...");
const canvasTest$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  canvasTest
}, Symbol.toStringTag, { value: "Module" }));
const ttsTest = {
  available: !!root.speak,
  // Teste 1: Fala básica
  speakBasic(text = "Olá! Este é um teste de síntese de voz no Perchance.") {
    if (!this.available) {
      console.warn("⚠️ [TTS] Plugin text-to-speech não disponível");
      return null;
    }
    try {
      console.log("🔊 [TTS] Iniciando fala básica...");
      console.log(`   Texto: "${text}"`);
      root.speak(text);
      console.log("✅ [TTS] Fala iniciada!");
      return true;
    } catch (error) {
      console.error("❌ [TTS] Erro ao iniciar fala:", error.message);
      return null;
    }
  },
  // Teste 2: Fala com opções (velocidade, tom, volume)
  speakWithOptions(text = "Testando velocidade e tom.", options = {}) {
    if (!this.available) {
      console.warn("⚠️ [TTS] Plugin text-to-speech não disponível");
      return null;
    }
    try {
      const rate = options.rate || 1;
      const pitch = options.pitch || 1;
      const volume = options.volume || 1;
      console.log("🔊 [TTS] Iniciando fala com opções...");
      console.log(`   Texto: "${text}"`);
      console.log(`   Rate: ${rate}, Pitch: ${pitch}, Volume: ${volume}`);
      try {
        root.speak(text, { rate, pitch, volume });
      } catch {
        root.speak(text);
      }
      console.log("✅ [TTS] Fala com opções iniciada!");
      return true;
    } catch (error) {
      console.error("❌ [TTS] Erro ao iniciar fala com opções:", error.message);
      return null;
    }
  },
  // Teste 3: Parar fala usando Web Speech API nativa
  stopSpeech() {
    try {
      console.log("🔊 [TTS] Parando fala...");
      if (root.speak && typeof root.speak.cancel === "function") {
        root.speak.cancel();
        console.log("✅ [TTS] Fala parada via plugin.cancel()");
        return true;
      }
      if (root.speak && typeof root.speak.stop === "function") {
        root.speak.stop();
        console.log("✅ [TTS] Fala parada via plugin.stop()");
        return true;
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        console.log("✅ [TTS] Fala parada via Web Speech API");
        return true;
      }
      console.warn("⚠️ [TTS] Nenhum método de stop disponível");
      return false;
    } catch (error) {
      console.error("❌ [TTS] Erro ao parar fala:", error.message);
      return null;
    }
  },
  // Teste 4: Verificar vozes disponíveis
  getAvailableVoices() {
    if (!window.speechSynthesis) {
      console.warn("⚠️ [TTS] Web Speech API não disponível");
      return [];
    }
    try {
      const voices = window.speechSynthesis.getVoices();
      console.log(`🔊 [TTS] ${voices.length} vozes disponíveis`);
      if (voices.length > 0) {
        const ptVoices = voices.filter((v) => v.lang.startsWith("pt"));
        console.log(`   Vozes em português: ${ptVoices.length}`);
        ptVoices.forEach((v) => {
          console.log(`   - ${v.name} (${v.lang})`);
        });
      }
      return voices;
    } catch (error) {
      console.error("❌ [TTS] Erro ao obter vozes:", error.message);
      return [];
    }
  },
  // Teste 5: Fala com voz específica (Web Speech API)
  speakWithVoice(text = "Testando voz específica.", voiceName = null) {
    if (!window.speechSynthesis) {
      console.warn("⚠️ [TTS] Web Speech API não disponível");
      return null;
    }
    try {
      console.log("🔊 [TTS] Iniciando fala com voz específica...");
      const utterance = new SpeechSynthesisUtterance(text);
      if (voiceName) {
        const voices = window.speechSynthesis.getVoices();
        const selectedVoice = voices.find((v) => v.name === voiceName);
        if (selectedVoice) {
          utterance.voice = selectedVoice;
          console.log(`   Voz selecionada: ${selectedVoice.name}`);
        }
      }
      utterance.onstart = () => console.log("🔊 [TTS] Fala iniciada");
      utterance.onend = () => console.log("🔊 [TTS] Fala concluída");
      utterance.onerror = (e) => console.error("❌ [TTS] Erro na fala:", e.error);
      window.speechSynthesis.speak(utterance);
      console.log("✅ [TTS] Fala com voz específica iniciada!");
      return true;
    } catch (error) {
      console.error("❌ [TTS] Erro ao falar com voz específica:", error.message);
      return null;
    }
  },
  // Diagnóstico da API
  checkAPI() {
    console.log("🔊 [TTS] Verificando API do plugin...");
    console.log("   root.speak disponível:", !!root.speak);
    console.log("   Tipo:", typeof root.speak);
    if (typeof root.speak === "function") {
      console.log("   ✅ É uma função");
      console.log('   Uso: root.speak("texto")');
    }
    console.log("   Web Speech API:", window.speechSynthesis ? "✅ Disponível" : "❌ Não disponível");
    if (window.speechSynthesis) {
      setTimeout(() => {
        const voices = window.speechSynthesis.getVoices();
        console.log(`   Vozes carregadas: ${voices.length}`);
      }, 100);
    }
  }
};
console.log("🔊 [TTS] Inicializando teste do plugin text-to-speech...");
if (ttsTest.available) {
  console.log("✅ [TTS] Plugin text-to-speech-plugin disponível");
  ttsTest.checkAPI();
} else {
  console.warn("⚠️ [TTS] Plugin text-to-speech-plugin NÃO disponível");
  console.warn("   Adicione no List Panel: speak = {import:text-to-speech-plugin}");
  console.warn("   Web Speech API nativa ainda pode ser usada como fallback");
}
const ttsTest$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ttsTest
}, Symbol.toStringTag, { value: "Module" }));
const diceTest = {
  available: !!root.dice,
  // Teste 1: Rolar um dado simples (1d20)
  rollD20() {
    console.log("🎲 [Dice] Rolando 1d20...");
    if (!this.available) {
      console.warn("⚠️ [Dice] Plugin não disponível");
      return { success: false, error: "Plugin não disponível" };
    }
    try {
      const result = root.dice("1d20");
      console.log(`✅ [Dice] Resultado: ${result}`);
      return { success: true, result };
    } catch (error) {
      console.error("❌ [Dice] Erro:", error.message);
      return { success: false, error: error.message };
    }
  },
  // Teste 2: Rolar múltiplos dados (3d6)
  roll3D6() {
    console.log("🎲 [Dice] Rolando 3d6...");
    if (!this.available) {
      return { success: false, error: "Plugin não disponível" };
    }
    try {
      const result = root.dice("3d6");
      console.log(`✅ [Dice] Resultado: ${result}`);
      return { success: true, result };
    } catch (error) {
      console.error("❌ [Dice] Erro:", error.message);
      return { success: false, error: error.message };
    }
  },
  // Teste 3: Rolar com modificador (2d8+5)
  rollWithModifier() {
    console.log("🎲 [Dice] Rolando 2d8+5...");
    if (!this.available) {
      return { success: false, error: "Plugin não disponível" };
    }
    try {
      const result = root.dice("2d8+5");
      console.log(`✅ [Dice] Resultado: ${result}`);
      return { success: true, result };
    } catch (error) {
      console.error("❌ [Dice] Erro:", error.message);
      return { success: false, error: error.message };
    }
  },
  // Teste 4: Rolagem complexa (1d20+5 vs CA 15)
  rollAttack() {
    console.log("🎲 [Dice] Simulando ataque (1d20+5 vs CA 15)...");
    if (!this.available) {
      return { success: false, error: "Plugin não disponível" };
    }
    try {
      const roll = root.dice("1d20+5");
      const ac = 15;
      const hit = roll >= ac;
      console.log(`✅ [Dice] Rolagem: ${roll} | ${hit ? "ACERTO!" : "ERROU"}`);
      return { success: true, roll, ac, hit };
    } catch (error) {
      console.error("❌ [Dice] Erro:", error.message);
      return { success: false, error: error.message };
    }
  },
  // Teste 5: Múltiplas rolagens de uma vez
  rollMultiple() {
    console.log("🎲 [Dice] Rolando múltiplos dados...");
    if (!this.available) {
      return { success: false, error: "Plugin não disponível" };
    }
    try {
      const rolls = [];
      rolls.push({ dice: "1d4", result: root.dice("1d4") });
      rolls.push({ dice: "1d6", result: root.dice("1d6") });
      rolls.push({ dice: "1d8", result: root.dice("1d8") });
      rolls.push({ dice: "1d10", result: root.dice("1d10") });
      rolls.push({ dice: "1d12", result: root.dice("1d12") });
      rolls.push({ dice: "1d20", result: root.dice("1d20") });
      rolls.push({ dice: "1d100", result: root.dice("1d100") });
      console.log("✅ [Dice] Múltiplas rolagens:", rolls);
      return { success: true, rolls };
    } catch (error) {
      console.error("❌ [Dice] Erro:", error.message);
      return { success: false, error: error.message };
    }
  }
};
console.log("🎲 [Dice] Inicializando teste do plugin dice...");
if (diceTest.available) {
  console.log("✅ [Dice] Plugin dice-plugin disponível");
} else {
  console.warn("⚠️ [Dice] Plugin dice-plugin NÃO disponível");
  console.warn("   Adicione no List Panel: dice = {import:dice-plugin}");
}
const diceTest$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  diceTest
}, Symbol.toStringTag, { value: "Module" }));
const rpgIconTest = {
  available: !!root.rpgIcon,
  // Lista de ícones comuns para teste
  commonIcons: ["sword", "shield", "potion", "scroll", "ring", "helmet", "armor", "bow", "axe", "staff", "gem", "coin"],
  // Teste 1: Obter um único ícone
  getSingleIcon(iconName = "sword") {
    if (!this.available) {
      console.warn("⚠️ [RPG-Icon] Plugin rpg-icon-plugin não disponível");
      return null;
    }
    try {
      console.log(`⚔️ [RPG-Icon] Obtendo ícone: ${iconName}...`);
      const html = root.rpgIcon(iconName);
      console.log("✅ [RPG-Icon] Ícone obtido!");
      console.log("   HTML:", html);
      return html;
    } catch (error) {
      console.error("❌ [RPG-Icon] Erro ao obter ícone:", error.message);
      return null;
    }
  },
  // Teste 2: Obter múltiplos ícones
  getMultipleIcons(count = 6) {
    if (!this.available) {
      console.warn("⚠️ [RPG-Icon] Plugin rpg-icon-plugin não disponível");
      return null;
    }
    try {
      console.log(`⚔️ [RPG-Icon] Obtendo ${count} ícones...`);
      const icons = [];
      const availableIcons = this.commonIcons.slice(0, count);
      for (const iconName of availableIcons) {
        try {
          const html = root.rpgIcon(iconName);
          icons.push({ name: iconName, html });
        } catch (e) {
          console.warn(`   ⚠️ Ícone "${iconName}" não disponível`);
        }
      }
      console.log(`✅ [RPG-Icon] ${icons.length} ícones obtidos!`);
      this._showIconGrid(icons);
      return icons;
    } catch (error) {
      console.error("❌ [RPG-Icon] Erro ao obter múltiplos ícones:", error.message);
      return null;
    }
  },
  // Teste 3: Obter ícone aleatório
  getRandomIcon() {
    if (!this.available) {
      console.warn("⚠️ [RPG-Icon] Plugin rpg-icon-plugin não disponível");
      return null;
    }
    try {
      const randomName = this.commonIcons[Math.floor(Math.random() * this.commonIcons.length)];
      console.log(`🎲 [RPG-Icon] Ícone aleatório: ${randomName}`);
      const html = root.rpgIcon(randomName);
      console.log("✅ [RPG-Icon] Ícone aleatório obtido!");
      return { name: randomName, html };
    } catch (error) {
      console.error("❌ [RPG-Icon] Erro ao obter ícone aleatório:", error.message);
      return null;
    }
  },
  // Teste 4: Demonstrar uso em HTML
  demonstrateUsage() {
    if (!this.available) {
      console.warn("⚠️ [RPG-Icon] Plugin rpg-icon-plugin não disponível");
      return null;
    }
    try {
      console.log("📖 [RPG-Icon] Demonstrando uso em HTML...");
      const sword = root.rpgIcon("sword");
      const shield = root.rpgIcon("shield");
      const potion = root.rpgIcon("potion");
      const html = `
        <div style="background:#2a2a3e; padding:15px; border-radius:8px; color:white; font-family:monospace;">
          <h3 style="margin:0 0 10px 0; color:#4ade80;">⚔️ Inventário</h3>
          <div style="display:flex; gap:10px; align-items:center;">
            <span>${sword}</span>
            <span>Espada Longa</span>
          </div>
          <div style="display:flex; gap:10px; align-items:center;">
            <span>${shield}</span>
            <span>Escudo de Ferro</span>
          </div>
          <div style="display:flex; gap:10px; align-items:center;">
            <span>${potion}</span>
            <span>Poção de Vida</span>
          </div>
        </div>
      `;
      console.log("✅ [RPG-Icon] HTML de inventário criado!");
      console.log("   Você pode injetar este HTML em qualquer elemento");
      return html;
    } catch (error) {
      console.error("❌ [RPG-Icon] Erro na demonstração:", error.message);
      return null;
    }
  },
  // Mostra grid de ícones no preview
  _showIconGrid(icons) {
    const existing = document.getElementById("rpg-icon-preview");
    if (existing) existing.remove();
    const container2 = document.createElement("div");
    container2.id = "rpg-icon-preview";
    container2.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 100;
      background: #1a1a2e;
      border: 2px solid #f59e0b;
      border-radius: 8px;
      padding: 10px;
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
    `;
    const title = document.createElement("div");
    title.style.cssText = "color: #f59e0b; font-family: monospace; font-size: 12px; margin-bottom: 8px;";
    title.textContent = "⚔️ RPG Icons";
    const grid = document.createElement("div");
    grid.style.cssText = "display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;";
    icons.forEach((icon) => {
      const item = document.createElement("div");
      item.style.cssText = `
        background: #2a2a3e;
        padding: 8px;
        border-radius: 4px;
        text-align: center;
        font-size: 20px;
      `;
      item.innerHTML = icon.html;
      item.title = icon.name;
      grid.appendChild(item);
    });
    container2.appendChild(title);
    container2.appendChild(grid);
    document.body.appendChild(container2);
    console.log("🖼️ [RPG-Icon] Grid de ícones exibido no canto superior direito");
    setTimeout(() => {
      if (container2.parentNode) {
        container2.remove();
        console.log("🗑️ [RPG-Icon] Preview removido");
      }
    }, 1e4);
  },
  // Diagnóstico da API
  checkAPI() {
    console.log("⚔️ [RPG-Icon] Verificando API do plugin...");
    console.log("   root.rpgIcon disponível:", !!root.rpgIcon);
    console.log("   Tipo:", typeof root.rpgIcon);
    if (typeof root.rpgIcon === "function") {
      console.log("   ✅ É uma função");
      console.log('   Uso: root.rpgIcon("sword") → retorna HTML string');
      console.log("   Ícones comuns:", this.commonIcons.join(", "));
    }
  }
};
console.log("⚔️ [RPG-Icon] Inicializando teste do plugin rpg-icon...");
if (rpgIconTest.available) {
  console.log("✅ [RPG-Icon] Plugin rpg-icon-plugin disponível");
  rpgIconTest.checkAPI();
} else {
  console.warn("⚠️ [RPG-Icon] Plugin rpg-icon-plugin NÃO disponível");
  console.warn("   Adicione no List Panel: rpgIcon = {import:rpg-icon-plugin}");
}
const rpgIconTest$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  rpgIconTest
}, Symbol.toStringTag, { value: "Module" }));
const hasDOM = typeof document !== "undefined" && !!document.body;
const patternTest = {
  available: !!root.pattern,
  // Teste 1: Gerar padrão com grid de emojis
  generateEmojiPattern() {
    if (!this.available) {
      console.warn("⚠️ [Pattern] Plugin pattern-maker-plugin não disponível");
      return null;
    }
    try {
      console.log("🎨 [Pattern] Gerando padrão com grid de emojis...");
      const patternOptions = {
        inputTextGrid: [
          "🌳🟩🟩🟩🌲🟩🟩🟩🟩🟩🟩🌾",
          "🟩🟩🟩🟦🟩🟩🟩🔲🔲🔲🔲🟩",
          "🟩🟦🟦🟦🟩🟩🟩🔲🏫🪑🔲🟩",
          "🟩🟦🟦🟦🌲🌷🌷🔲🏫🏫🔲🟩",
          "🟩🟩🟦🟦🟩🟩🟩🔲🚪🔲🔲🟩",
          "🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩",
          "🟩🌳🌳🟩🟩🟩🟩🟩🟩🟩🟩",
          "🟩🟩🌳🟦🟦🟦🟩🟩🌷🟩🟦🟦",
          "🟩🌳🟦🟦🟦🟩🟩🪨🟩🟩🟦🟩",
          "🌾🟩🟦🟦🟦🟩🟩🌳🟦🟦🟦🟩",
          "🟩🟩🟦🟦🟦🟦🟦🟦🟦🌳🟩🟩"
        ],
        settings: {
          width: 30,
          height: 30,
          n: 3,
          symmetry: 8,
          magnify: 0.6
        }
      };
      const result = root.pattern(patternOptions);
      console.log("✅ [Pattern] Padrão gerado com sucesso!");
      console.log("   Tipo do resultado:", typeof result);
      if (typeof result === "string") {
        console.log("   Tamanho:", result.length, "caracteres");
        if (result.startsWith("data:image/")) {
          this._showPatternPreview(result);
        } else {
          console.log("   ℹ️ Padrão gerado como string HTML");
          if (!hasDOM) {
            console.warn("   ⚠️ Renderização automática indisponível: ambiente sem DOM");
          } else {
            console.warn("   ⚠️ Renderização automática pode falhar (limitação conhecida do plugin)");
          }
          console.log("   💡 Para uso real, considere gerar padrões com Canvas 2D puro");
        }
      }
      return result;
    } catch (error) {
      console.error("❌ [Pattern] Erro ao gerar padrão:", error.message);
      return null;
    }
  },
  // Teste 2: Gerar padrão com configurações diferentes
  generateCustomPattern(width = 40, height = 40, n = 3, symmetry = 8) {
    if (!this.available) {
      console.warn("⚠️ [Pattern] Plugin pattern-maker-plugin não disponível");
      return null;
    }
    try {
      console.log(`🎨 [Pattern] Gerando padrão customizado (${width}x${height}, n=${n}, symmetry=${symmetry})...`);
      const patternOptions = {
        inputTextGrid: [
          "🟥🟧🟨🟩🟦🟪",
          "🟧🟨🟩🟦🟪🟥",
          "🟨🟩🟦🟪🟥🟧",
          "🟩🟦🟪🟥🟧🟨",
          "🟦🟪🟥🟧🟨🟩",
          "🟪🟥🟧🟨🟩🟦"
        ],
        settings: {
          width,
          height,
          n,
          symmetry,
          magnify: 0.8
        }
      };
      const result = root.pattern(patternOptions);
      console.log("✅ [Pattern] Padrão customizado gerado!");
      return result;
    } catch (error) {
      console.error("❌ [Pattern] Erro ao gerar padrão customizado:", error.message);
      return null;
    }
  },
  // Teste 3: Gerar padrão periódico (tileable)
  generateTileablePattern() {
    if (!this.available) {
      console.warn("⚠️ [Pattern] Plugin pattern-maker-plugin não disponível");
      return null;
    }
    try {
      console.log("🎨 [Pattern] Gerando padrão tileable (periódico)...");
      const patternOptions = {
        inputTextGrid: [
          "🌲🌲🌳🌲🌲",
          "🌲🌳🌳🌳🌲",
          "🌳🌳🏫🌳🌳",
          "🌲🌳🌳🌳🌲",
          "🌲🌲🌳🌲🌲"
        ],
        settings: {
          width: 30,
          height: 30,
          n: 2,
          symmetry: 4,
          periodic: 1,
          magnify: 0.7
        }
      };
      const result = root.pattern(patternOptions);
      console.log("✅ [Pattern] Padrão tileable gerado!");
      console.log("   Este padrão pode ser repetido sem costuras visíveis");
      return result;
    } catch (error) {
      console.error("❌ [Pattern] Erro ao gerar padrão tileable:", error.message);
      return null;
    }
  },
  // Mostra preview do padrão gerado
  _showPatternPreview(dataUrl) {
    if (!hasDOM) {
      console.warn("⚠️ [Pattern] Preview indisponível: ambiente sem DOM");
      return;
    }
    const existing = document.getElementById("pattern-preview");
    if (existing) existing.remove();
    const container2 = document.createElement("div");
    container2.id = "pattern-preview";
    container2.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 100;
      background: #1a1a2e;
      border: 2px solid #a855f7;
      border-radius: 8px;
      padding: 10px;
      max-width: 200px;
      box-shadow: 0 4px 12px rgba(168, 85, 247, 0.3);
    `;
    const title = document.createElement("div");
    title.style.cssText = "color: #a855f7; font-family: monospace; font-size: 12px; margin-bottom: 5px;";
    title.textContent = "🎨 Pattern Preview";
    const img = document.createElement("img");
    img.src = dataUrl;
    img.style.cssText = "width: 100%; height: auto; border-radius: 4px;";
    container2.appendChild(title);
    container2.appendChild(img);
    document.body.appendChild(container2);
    console.log("🖼️ [Pattern] Preview exibido no canto inferior direito");
    setTimeout(() => {
      if (container2.parentNode) {
        container2.remove();
        console.log("🗑️ [Pattern] Preview removido");
      }
    }, 1e4);
  },
  // Diagnóstico da API
  checkAPI() {
    console.log("🎨 [Pattern] Verificando API do plugin...");
    console.log("   root.pattern disponível:", !!root.pattern);
    console.log("   Tipo:", typeof root.pattern);
    if (typeof root.pattern === "function") {
      console.log("   ✅ É uma função");
      console.log("   Uso: root.pattern({ inputTextGrid: [...], settings: {...} })");
      console.log("   Settings: width, height, n, symmetry, magnify, periodic");
    }
  }
};
console.log("🎨 [Pattern] Inicializando teste do plugin pattern-maker...");
if (patternTest.available) {
  console.log("✅ [Pattern] Plugin pattern-maker-plugin disponível");
  patternTest.checkAPI();
} else {
  console.warn("⚠️ [Pattern] Plugin pattern-maker-plugin NÃO disponível");
  console.warn("   Adicione no List Panel: pattern = {import:pattern-maker-plugin}");
}
const patternTest$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  patternTest
}, Symbol.toStringTag, { value: "Module" }));
const kvTest = {
  available: !!root.kv,
  store: null,
  // Será inicializado com root.kv.testFolder
  // Inicializa o store (folder)
  initStore() {
    if (!this.available) return null;
    this.store = root.kv.testFolder;
    return this.store;
  },
  // Teste 1: Salvar valor simples
  async setSimpleValue(key = "test_key", value = "test_value") {
    if (!this.available) {
      console.warn("⚠️ [KV] Plugin kv-plugin não disponível");
      return null;
    }
    try {
      if (!this.store) this.initStore();
      console.log(`💾 [KV] Salvando: ${key} = ${value}...`);
      await this.store.set(key, value);
      console.log(`✅ [KV] Valor salvo com sucesso!`);
      return true;
    } catch (error) {
      console.error("❌ [KV] Erro ao salvar:", error.message);
      return null;
    }
  },
  // Teste 2: Recuperar valor
  async getValue(key = "test_key") {
    if (!this.available) {
      console.warn("⚠️ [KV] Plugin kv-plugin não disponível");
      return null;
    }
    try {
      if (!this.store) this.initStore();
      console.log(`💾 [KV] Recuperando: ${key}...`);
      const value = await this.store.get(key);
      console.log(`✅ [KV] Valor recuperado: ${value}`);
      return value;
    } catch (error) {
      console.error("❌ [KV] Erro ao recuperar:", error.message);
      return null;
    }
  },
  // Teste 3: Salvar objeto complexo
  async saveComplexData() {
    if (!this.available) {
      console.warn("⚠️ [KV] Plugin kv-plugin não disponível");
      return null;
    }
    try {
      if (!this.store) this.initStore();
      const playerData = {
        name: "Herói",
        level: 5,
        hp: 100,
        inventory: ["espada", "poção", "mapa"],
        stats: { strength: 10, agility: 8, intelligence: 12 }
      };
      console.log("💾 [KV] Salvando objeto complexo...");
      await this.store.set("player", playerData);
      console.log("✅ [KV] Objeto salvo com sucesso!");
      const retrieved = await this.store.get("player");
      console.log("📦 [KV] Objeto recuperado:", retrieved);
      return retrieved;
    } catch (error) {
      console.error("❌ [KV] Erro ao salvar objeto:", error.message);
      return null;
    }
  },
  // Teste 4: Listar todas as chaves
  async listKeys() {
    if (!this.available) {
      console.warn("⚠️ [KV] Plugin kv-plugin não disponível");
      return null;
    }
    try {
      if (!this.store) this.initStore();
      console.log("📋 [KV] Listando chaves...");
      const keys = await this.store.keys();
      console.log("✅ [KV] Chaves:", keys);
      return keys;
    } catch (error) {
      console.error("❌ [KV] Erro ao listar chaves:", error.message);
      return null;
    }
  },
  // Teste 5: Deletar valor
  async deleteValue(key = "test_key") {
    if (!this.available) {
      console.warn("⚠️ [KV] Plugin kv-plugin não disponível");
      return null;
    }
    try {
      if (!this.store) this.initStore();
      console.log(`🗑️ [KV] Deletando: ${key}...`);
      await this.store.delete(key);
      console.log("✅ [KV] Valor deletado!");
      return true;
    } catch (error) {
      console.error("❌ [KV] Erro ao deletar:", error.message);
      return null;
    }
  },
  // Teste 6: Update atômico (incrementa valor)
  async updateValue(key = "counter") {
    if (!this.available) {
      console.warn("⚠️ [KV] Plugin kv-plugin não disponível");
      return null;
    }
    try {
      if (!this.store) this.initStore();
      console.log(`🔄 [KV] Incrementando ${key} atomicamente...`);
      await this.store.update(key, (v) => (v || 0) + 1);
      const newValue = await this.store.get(key);
      console.log(`✅ [KV] Novo valor de ${key}: ${newValue}`);
      return newValue;
    } catch (error) {
      console.error("❌ [KV] Erro ao atualizar:", error.message);
      return null;
    }
  },
  // Diagnóstico da API
  checkAPI() {
    console.log("💾 [KV] Verificando API do plugin...");
    console.log("   root.kv disponível:", !!root.kv);
    console.log("   Tipo:", typeof root.kv);
    if (root.kv) {
      console.log("   Props:", Object.keys(root.kv));
      try {
        const testStore = root.kv.testFolder;
        console.log("   ✅ root.kv.testFolder acessível");
        console.log("   Métodos do store:", Object.keys(testStore || {}));
      } catch (e) {
        console.log("   ❌ Erro ao acessar folder:", e.message);
      }
    }
  }
};
console.log("💾 [KV] Inicializando teste do plugin kv...");
if (kvTest.available) {
  console.log("✅ [KV] Plugin kv-plugin disponível");
  kvTest.checkAPI();
} else {
  console.warn("⚠️ [KV] Plugin kv-plugin NÃO disponível");
  console.warn("   Adicione no List Panel: kv = {import:kv-plugin}");
}
const kvTest$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  kvTest
}, Symbol.toStringTag, { value: "Module" }));
const seederTest = {
  available: !!root.seeder,
  // Teste 1: Aplicar seed e demonstrar reprodutibilidade
  applySeed(seedText = "minha_seed_123") {
    if (!this.available) {
      console.warn("⚠️ [Seeder] Plugin seeder-plugin não disponível");
      return null;
    }
    try {
      console.log(`🌱 [Seeder] Aplicando seed: "${seedText}"...`);
      root.seeder(seedText);
      console.log("✅ [Seeder] Seed aplicada com sucesso!");
      console.log("   A partir de agora, seleções aleatórias do Perchance serão determinísticas");
      return seedText;
    } catch (error) {
      console.error("❌ [Seeder] Erro ao aplicar seed:", error.message);
      return null;
    }
  },
  // Teste 2: Demonstrar que a mesma seed produz os mesmos resultados
  demonstrateReproducibility() {
    if (!this.available) {
      console.warn("⚠️ [Seeder] Plugin seeder-plugin não disponível");
      return null;
    }
    try {
      const seed = "teste_reprodutibilidade";
      console.log(`🌱 [Seeder] Demonstrando reprodutibilidade com seed "${seed}"...`);
      root.seeder(seed);
      const results1 = [];
      for (let i = 0; i < 3; i++) {
        if (root.itens && typeof root.itens.selectOne === "function") {
          results1.push(root.itens.selectOne);
        } else {
          results1.push(Math.random().toFixed(4));
        }
      }
      root.seeder(seed);
      const results2 = [];
      for (let i = 0; i < 3; i++) {
        if (root.itens && typeof root.itens.selectOne === "function") {
          results2.push(root.itens.selectOne);
        } else {
          results2.push(Math.random().toFixed(4));
        }
      }
      console.log("📊 [Seeder] Resultados da primeira execução:", results1);
      console.log("📊 [Seeder] Resultados da segunda execução:", results2);
      const match = JSON.stringify(results1) === JSON.stringify(results2);
      console.log(match ? "✅ [Seeder] Resultados idênticos! Seed funciona!" : "⚠️ [Seeder] Resultados diferentes (pode ser esperado se não houver listas)");
      return { seed, results1, results2, match };
    } catch (error) {
      console.error("❌ [Seeder] Erro na demonstração:", error.message);
      return null;
    }
  },
  // Teste 3: Resetar para aleatoriedade normal
  resetSeed() {
    if (!this.available) {
      console.warn("⚠️ [Seeder] Plugin seeder-plugin não disponível");
      return null;
    }
    try {
      console.log("🔄 [Seeder] Resetando para aleatoriedade normal...");
      root.seeder("");
      console.log("✅ [Seeder] Seed resetado! Seleções voltarão a ser completamente aleatórias");
      return true;
    } catch (error) {
      console.error("❌ [Seeder] Erro ao resetar:", error.message);
      return null;
    }
  },
  // Teste 4: Gerar seed aleatória para compartilhar
  generateRandomSeed() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let seed = "";
    for (let i = 0; i < 12; i++) {
      seed += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    console.log(`🌱 [Seeder] Seed aleatória gerada: ${seed}`);
    console.log("   Compartilhe esta seed para reproduzir os mesmos resultados");
    return seed;
  },
  // Diagnóstico da API
  checkAPI() {
    console.log("🌱 [Seeder] Verificando API do plugin...");
    console.log("   root.seeder disponível:", !!root.seeder);
    console.log("   Tipo:", typeof root.seeder);
    if (typeof root.seeder === "function") {
      console.log("   ✅ É uma função");
      console.log('   Uso: root.seeder("minha_seed")');
    }
  }
};
console.log("🌱 [Seeder] Inicializando teste do plugin seeder...");
if (seederTest.available) {
  console.log("✅ [Seeder] Plugin seeder-plugin disponível");
  seederTest.checkAPI();
} else {
  console.warn("⚠️ [Seeder] Plugin seeder-plugin NÃO disponível");
  console.warn("   Adicione no List Panel: seeder = {import:seeder-plugin}");
}
const seederTest$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  seederTest
}, Symbol.toStringTag, { value: "Module" }));
const APEXCHARTS_CDN = "https://cdn.jsdelivr.net/npm/apexcharts@3/dist/apexcharts.min.js";
let ApexCharts = null;
let container = null;
let chartInstance = null;
async function loadApexCharts() {
  if (window.ApexCharts) {
    ApexCharts = window.ApexCharts;
    return true;
  }
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = APEXCHARTS_CDN;
    script.onload = () => {
      ApexCharts = window.ApexCharts;
      resolve(true);
    };
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}
function ensureContainer() {
  if (container && document.body.contains(container)) return container;
  container = document.createElement("div");
  container.id = "apexcharts-container";
  Object.assign(container.style, {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "600px",
    maxWidth: "90vw",
    maxHeight: "80vh",
    background: "#1a1a2e",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
    zIndex: "9999",
    overflow: "auto"
  });
  const closeBtn = document.createElement("button");
  closeBtn.textContent = "✕";
  Object.assign(closeBtn.style, {
    position: "absolute",
    top: "10px",
    right: "10px",
    background: "#e74c3c",
    color: "white",
    border: "none",
    borderRadius: "50%",
    width: "28px",
    height: "28px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold"
  });
  closeBtn.onclick = () => {
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }
    container.remove();
    container = null;
  };
  container.appendChild(closeBtn);
  const chartDiv = document.createElement("div");
  chartDiv.id = "apexcharts-chart";
  container.appendChild(chartDiv);
  document.body.appendChild(container);
  return container;
}
function getBaseOptions() {
  return {
    chart: {
      background: "transparent",
      foreColor: "#ffffff",
      toolbar: { show: false },
      animations: { enabled: true, easing: "easeinout", speed: 800 }
    },
    theme: { mode: "dark" },
    grid: { borderColor: "#333", strokeDashArray: 4 },
    tooltip: { theme: "dark" },
    dataLabels: { style: { fontSize: "12px", fontWeight: 600 } }
  };
}
const apexchartsTest = {
  available: false,
  async init() {
    this.available = await loadApexCharts();
    console.log(this.available ? "✅ [ApexCharts] Loaded" : "❌ [ApexCharts] Failed to load");
    return this.available;
  },
  async renderBarChart() {
    if (!this.available) await this.init();
    if (!ApexCharts) throw new Error("ApexCharts not loaded");
    ensureContainer();
    if (chartInstance) chartInstance.destroy();
    const options = {
      ...getBaseOptions(),
      series: [{
        name: "Stats",
        data: [44, 55, 57, 56, 61, 58, 63, 60, 66]
      }],
      chart: {
        ...getBaseOptions().chart,
        type: "bar",
        height: 350
      },
      plotOptions: {
        bar: {
          borderRadius: 6,
          columnWidth: "60%",
          distributed: true
        }
      },
      xaxis: {
        categories: ["STR", "DEX", "CON", "INT", "WIS", "CHA", "LCK", "PER", "END"],
        labels: { style: { fontSize: "12px" } }
      },
      yaxis: { title: { text: "Value" } },
      legend: { show: false },
      colors: ["#00e396", "#008ffb", "#feb019", "#ff4560", "#775dd0", "#00d4aa", "#f86624", "#3f51b5", "#e91e63"]
    };
    chartInstance = new ApexCharts(document.getElementById("apexcharts-chart"), options);
    await chartInstance.render();
    return { success: true, type: "bar", categories: 9 };
  },
  async renderLineChart() {
    if (!this.available) await this.init();
    if (!ApexCharts) throw new Error("ApexCharts not loaded");
    ensureContainer();
    if (chartInstance) chartInstance.destroy();
    const generateSeries = (points, base, variance) => {
      const data = [];
      let value = base;
      for (let i = 0; i < points; i++) {
        value += (Math.random() - 0.5) * variance;
        data.push({ x: i, y: Math.round(value) });
      }
      return data;
    };
    const options = {
      ...getBaseOptions(),
      series: [
        { name: "Player HP", data: generateSeries(20, 100, 15) },
        { name: "Enemy HP", data: generateSeries(20, 120, 20) }
      ],
      chart: {
        ...getBaseOptions().chart,
        type: "area",
        height: 350
      },
      stroke: { curve: "smooth", width: 3 },
      fill: {
        type: "gradient",
        gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.1 }
      },
      xaxis: { title: { text: "Turn" }, type: "numeric" },
      yaxis: { title: { text: "HP" } },
      colors: ["#00e396", "#ff4560"]
    };
    chartInstance = new ApexCharts(document.getElementById("apexcharts-chart"), options);
    await chartInstance.render();
    return { success: true, type: "line", points: 20 };
  },
  async renderPieChart() {
    if (!this.available) await this.init();
    if (!ApexCharts) throw new Error("ApexCharts not loaded");
    ensureContainer();
    if (chartInstance) chartInstance.destroy();
    const options = {
      ...getBaseOptions(),
      series: [35, 25, 20, 12, 8],
      labels: ["Warrior", "Mage", "Rogue", "Cleric", "Ranger"],
      chart: {
        ...getBaseOptions().chart,
        type: "donut",
        height: 380
      },
      plotOptions: {
        pie: {
          donut: {
            size: "65%",
            labels: {
              show: true,
              total: {
                show: true,
                label: "Total",
                fontSize: "16px",
                formatter: (w) => w.globals.seriesTotals.reduce((a, b) => a + b, 0)
              }
            }
          }
        }
      },
      stroke: { width: 2, colors: ["#1a1a2e"] },
      colors: ["#ff4560", "#008ffb", "#00e396", "#feb019", "#775dd0"],
      legend: { position: "bottom", fontSize: "14px" }
    };
    chartInstance = new ApexCharts(document.getElementById("apexcharts-chart"), options);
    await chartInstance.render();
    return { success: true, type: "donut", slices: 5 };
  },
  async renderRadarChart() {
    if (!this.available) await this.init();
    if (!ApexCharts) throw new Error("ApexCharts not loaded");
    ensureContainer();
    if (chartInstance) chartInstance.destroy();
    const randomStats = () => [40, 60, 75, 50, 65, 55].map((v) => v + Math.floor(Math.random() * 30));
    const options = {
      ...getBaseOptions(),
      series: [
        { name: "Player", data: randomStats() },
        { name: "NPC", data: randomStats() }
      ],
      chart: {
        ...getBaseOptions().chart,
        type: "radar",
        height: 380
      },
      xaxis: {
        categories: ["Attack", "Defense", "Speed", "Magic", "Stamina", "Luck"]
      },
      stroke: { width: 2 },
      fill: { opacity: 0.3 },
      markers: { size: 4 },
      colors: ["#00e396", "#ff4560"],
      plotOptions: {
        radar: {
          polygons: {
            strokeColors: "#333",
            connectorColors: "#333"
          }
        }
      }
    };
    chartInstance = new ApexCharts(document.getElementById("apexcharts-chart"), options);
    await chartInstance.render();
    return { success: true, type: "radar", axes: 6 };
  },
  destroy() {
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }
    if (container) {
      container.remove();
      container = null;
    }
  }
};
console.log("📊 [ApexCharts] Module loaded");
const apexchartsTest$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  apexchartsTest
}, Symbol.toStringTag, { value: "Module" }));
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
var howler = {};
/*!
 *  howler.js v2.2.4
 *  howlerjs.com
 *
 *  (c) 2013-2020, James Simpson of GoldFire Studios
 *  goldfirestudios.com
 *
 *  MIT License
 */
var hasRequiredHowler;
function requireHowler() {
  if (hasRequiredHowler) return howler;
  hasRequiredHowler = 1;
  (function(exports) {
    (function() {
      var HowlerGlobal2 = function() {
        this.init();
      };
      HowlerGlobal2.prototype = {
        /**
         * Initialize the global Howler object.
         * @return {Howler}
         */
        init: function() {
          var self2 = this || Howler2;
          self2._counter = 1e3;
          self2._html5AudioPool = [];
          self2.html5PoolSize = 10;
          self2._codecs = {};
          self2._howls = [];
          self2._muted = false;
          self2._volume = 1;
          self2._canPlayEvent = "canplaythrough";
          self2._navigator = typeof window !== "undefined" && window.navigator ? window.navigator : null;
          self2.masterGain = null;
          self2.noAudio = false;
          self2.usingWebAudio = true;
          self2.autoSuspend = true;
          self2.ctx = null;
          self2.autoUnlock = true;
          self2._setup();
          return self2;
        },
        /**
         * Get/set the global volume for all sounds.
         * @param  {Float} vol Volume from 0.0 to 1.0.
         * @return {Howler/Float}     Returns self or current volume.
         */
        volume: function(vol) {
          var self2 = this || Howler2;
          vol = parseFloat(vol);
          if (!self2.ctx) {
            setupAudioContext();
          }
          if (typeof vol !== "undefined" && vol >= 0 && vol <= 1) {
            self2._volume = vol;
            if (self2._muted) {
              return self2;
            }
            if (self2.usingWebAudio) {
              self2.masterGain.gain.setValueAtTime(vol, Howler2.ctx.currentTime);
            }
            for (var i = 0; i < self2._howls.length; i++) {
              if (!self2._howls[i]._webAudio) {
                var ids = self2._howls[i]._getSoundIds();
                for (var j = 0; j < ids.length; j++) {
                  var sound = self2._howls[i]._soundById(ids[j]);
                  if (sound && sound._node) {
                    sound._node.volume = sound._volume * vol;
                  }
                }
              }
            }
            return self2;
          }
          return self2._volume;
        },
        /**
         * Handle muting and unmuting globally.
         * @param  {Boolean} muted Is muted or not.
         */
        mute: function(muted) {
          var self2 = this || Howler2;
          if (!self2.ctx) {
            setupAudioContext();
          }
          self2._muted = muted;
          if (self2.usingWebAudio) {
            self2.masterGain.gain.setValueAtTime(muted ? 0 : self2._volume, Howler2.ctx.currentTime);
          }
          for (var i = 0; i < self2._howls.length; i++) {
            if (!self2._howls[i]._webAudio) {
              var ids = self2._howls[i]._getSoundIds();
              for (var j = 0; j < ids.length; j++) {
                var sound = self2._howls[i]._soundById(ids[j]);
                if (sound && sound._node) {
                  sound._node.muted = muted ? true : sound._muted;
                }
              }
            }
          }
          return self2;
        },
        /**
         * Handle stopping all sounds globally.
         */
        stop: function() {
          var self2 = this || Howler2;
          for (var i = 0; i < self2._howls.length; i++) {
            self2._howls[i].stop();
          }
          return self2;
        },
        /**
         * Unload and destroy all currently loaded Howl objects.
         * @return {Howler}
         */
        unload: function() {
          var self2 = this || Howler2;
          for (var i = self2._howls.length - 1; i >= 0; i--) {
            self2._howls[i].unload();
          }
          if (self2.usingWebAudio && self2.ctx && typeof self2.ctx.close !== "undefined") {
            self2.ctx.close();
            self2.ctx = null;
            setupAudioContext();
          }
          return self2;
        },
        /**
         * Check for codec support of specific extension.
         * @param  {String} ext Audio file extention.
         * @return {Boolean}
         */
        codecs: function(ext) {
          return (this || Howler2)._codecs[ext.replace(/^x-/, "")];
        },
        /**
         * Setup various state values for global tracking.
         * @return {Howler}
         */
        _setup: function() {
          var self2 = this || Howler2;
          self2.state = self2.ctx ? self2.ctx.state || "suspended" : "suspended";
          self2._autoSuspend();
          if (!self2.usingWebAudio) {
            if (typeof Audio !== "undefined") {
              try {
                var test = new Audio();
                if (typeof test.oncanplaythrough === "undefined") {
                  self2._canPlayEvent = "canplay";
                }
              } catch (e) {
                self2.noAudio = true;
              }
            } else {
              self2.noAudio = true;
            }
          }
          try {
            var test = new Audio();
            if (test.muted) {
              self2.noAudio = true;
            }
          } catch (e) {
          }
          if (!self2.noAudio) {
            self2._setupCodecs();
          }
          return self2;
        },
        /**
         * Check for browser support for various codecs and cache the results.
         * @return {Howler}
         */
        _setupCodecs: function() {
          var self2 = this || Howler2;
          var audioTest2 = null;
          try {
            audioTest2 = typeof Audio !== "undefined" ? new Audio() : null;
          } catch (err) {
            return self2;
          }
          if (!audioTest2 || typeof audioTest2.canPlayType !== "function") {
            return self2;
          }
          var mpegTest = audioTest2.canPlayType("audio/mpeg;").replace(/^no$/, "");
          var ua = self2._navigator ? self2._navigator.userAgent : "";
          var checkOpera = ua.match(/OPR\/(\d+)/g);
          var isOldOpera = checkOpera && parseInt(checkOpera[0].split("/")[1], 10) < 33;
          var checkSafari = ua.indexOf("Safari") !== -1 && ua.indexOf("Chrome") === -1;
          var safariVersion = ua.match(/Version\/(.*?) /);
          var isOldSafari = checkSafari && safariVersion && parseInt(safariVersion[1], 10) < 15;
          self2._codecs = {
            mp3: !!(!isOldOpera && (mpegTest || audioTest2.canPlayType("audio/mp3;").replace(/^no$/, ""))),
            mpeg: !!mpegTest,
            opus: !!audioTest2.canPlayType('audio/ogg; codecs="opus"').replace(/^no$/, ""),
            ogg: !!audioTest2.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, ""),
            oga: !!audioTest2.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, ""),
            wav: !!(audioTest2.canPlayType('audio/wav; codecs="1"') || audioTest2.canPlayType("audio/wav")).replace(/^no$/, ""),
            aac: !!audioTest2.canPlayType("audio/aac;").replace(/^no$/, ""),
            caf: !!audioTest2.canPlayType("audio/x-caf;").replace(/^no$/, ""),
            m4a: !!(audioTest2.canPlayType("audio/x-m4a;") || audioTest2.canPlayType("audio/m4a;") || audioTest2.canPlayType("audio/aac;")).replace(/^no$/, ""),
            m4b: !!(audioTest2.canPlayType("audio/x-m4b;") || audioTest2.canPlayType("audio/m4b;") || audioTest2.canPlayType("audio/aac;")).replace(/^no$/, ""),
            mp4: !!(audioTest2.canPlayType("audio/x-mp4;") || audioTest2.canPlayType("audio/mp4;") || audioTest2.canPlayType("audio/aac;")).replace(/^no$/, ""),
            weba: !!(!isOldSafari && audioTest2.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, "")),
            webm: !!(!isOldSafari && audioTest2.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, "")),
            dolby: !!audioTest2.canPlayType('audio/mp4; codecs="ec-3"').replace(/^no$/, ""),
            flac: !!(audioTest2.canPlayType("audio/x-flac;") || audioTest2.canPlayType("audio/flac;")).replace(/^no$/, "")
          };
          return self2;
        },
        /**
         * Some browsers/devices will only allow audio to be played after a user interaction.
         * Attempt to automatically unlock audio on the first user interaction.
         * Concept from: http://paulbakaus.com/tutorials/html5/web-audio-on-ios/
         * @return {Howler}
         */
        _unlockAudio: function() {
          var self2 = this || Howler2;
          if (self2._audioUnlocked || !self2.ctx) {
            return;
          }
          self2._audioUnlocked = false;
          self2.autoUnlock = false;
          if (!self2._mobileUnloaded && self2.ctx.sampleRate !== 44100) {
            self2._mobileUnloaded = true;
            self2.unload();
          }
          self2._scratchBuffer = self2.ctx.createBuffer(1, 1, 22050);
          var unlock = function(e) {
            while (self2._html5AudioPool.length < self2.html5PoolSize) {
              try {
                var audioNode = new Audio();
                audioNode._unlocked = true;
                self2._releaseHtml5Audio(audioNode);
              } catch (e2) {
                self2.noAudio = true;
                break;
              }
            }
            for (var i = 0; i < self2._howls.length; i++) {
              if (!self2._howls[i]._webAudio) {
                var ids = self2._howls[i]._getSoundIds();
                for (var j = 0; j < ids.length; j++) {
                  var sound = self2._howls[i]._soundById(ids[j]);
                  if (sound && sound._node && !sound._node._unlocked) {
                    sound._node._unlocked = true;
                    sound._node.load();
                  }
                }
              }
            }
            self2._autoResume();
            var source = self2.ctx.createBufferSource();
            source.buffer = self2._scratchBuffer;
            source.connect(self2.ctx.destination);
            if (typeof source.start === "undefined") {
              source.noteOn(0);
            } else {
              source.start(0);
            }
            if (typeof self2.ctx.resume === "function") {
              self2.ctx.resume();
            }
            source.onended = function() {
              source.disconnect(0);
              self2._audioUnlocked = true;
              document.removeEventListener("touchstart", unlock, true);
              document.removeEventListener("touchend", unlock, true);
              document.removeEventListener("click", unlock, true);
              document.removeEventListener("keydown", unlock, true);
              for (var i2 = 0; i2 < self2._howls.length; i2++) {
                self2._howls[i2]._emit("unlock");
              }
            };
          };
          document.addEventListener("touchstart", unlock, true);
          document.addEventListener("touchend", unlock, true);
          document.addEventListener("click", unlock, true);
          document.addEventListener("keydown", unlock, true);
          return self2;
        },
        /**
         * Get an unlocked HTML5 Audio object from the pool. If none are left,
         * return a new Audio object and throw a warning.
         * @return {Audio} HTML5 Audio object.
         */
        _obtainHtml5Audio: function() {
          var self2 = this || Howler2;
          if (self2._html5AudioPool.length) {
            return self2._html5AudioPool.pop();
          }
          var testPlay = new Audio().play();
          if (testPlay && typeof Promise !== "undefined" && (testPlay instanceof Promise || typeof testPlay.then === "function")) {
            testPlay.catch(function() {
              console.warn("HTML5 Audio pool exhausted, returning potentially locked audio object.");
            });
          }
          return new Audio();
        },
        /**
         * Return an activated HTML5 Audio object to the pool.
         * @return {Howler}
         */
        _releaseHtml5Audio: function(audio) {
          var self2 = this || Howler2;
          if (audio._unlocked) {
            self2._html5AudioPool.push(audio);
          }
          return self2;
        },
        /**
         * Automatically suspend the Web Audio AudioContext after no sound has played for 30 seconds.
         * This saves processing/energy and fixes various browser-specific bugs with audio getting stuck.
         * @return {Howler}
         */
        _autoSuspend: function() {
          var self2 = this;
          if (!self2.autoSuspend || !self2.ctx || typeof self2.ctx.suspend === "undefined" || !Howler2.usingWebAudio) {
            return;
          }
          for (var i = 0; i < self2._howls.length; i++) {
            if (self2._howls[i]._webAudio) {
              for (var j = 0; j < self2._howls[i]._sounds.length; j++) {
                if (!self2._howls[i]._sounds[j]._paused) {
                  return self2;
                }
              }
            }
          }
          if (self2._suspendTimer) {
            clearTimeout(self2._suspendTimer);
          }
          self2._suspendTimer = setTimeout(function() {
            if (!self2.autoSuspend) {
              return;
            }
            self2._suspendTimer = null;
            self2.state = "suspending";
            var handleSuspension = function() {
              self2.state = "suspended";
              if (self2._resumeAfterSuspend) {
                delete self2._resumeAfterSuspend;
                self2._autoResume();
              }
            };
            self2.ctx.suspend().then(handleSuspension, handleSuspension);
          }, 3e4);
          return self2;
        },
        /**
         * Automatically resume the Web Audio AudioContext when a new sound is played.
         * @return {Howler}
         */
        _autoResume: function() {
          var self2 = this;
          if (!self2.ctx || typeof self2.ctx.resume === "undefined" || !Howler2.usingWebAudio) {
            return;
          }
          if (self2.state === "running" && self2.ctx.state !== "interrupted" && self2._suspendTimer) {
            clearTimeout(self2._suspendTimer);
            self2._suspendTimer = null;
          } else if (self2.state === "suspended" || self2.state === "running" && self2.ctx.state === "interrupted") {
            self2.ctx.resume().then(function() {
              self2.state = "running";
              for (var i = 0; i < self2._howls.length; i++) {
                self2._howls[i]._emit("resume");
              }
            });
            if (self2._suspendTimer) {
              clearTimeout(self2._suspendTimer);
              self2._suspendTimer = null;
            }
          } else if (self2.state === "suspending") {
            self2._resumeAfterSuspend = true;
          }
          return self2;
        }
      };
      var Howler2 = new HowlerGlobal2();
      var Howl2 = function(o) {
        var self2 = this;
        if (!o.src || o.src.length === 0) {
          console.error("An array of source files must be passed with any new Howl.");
          return;
        }
        self2.init(o);
      };
      Howl2.prototype = {
        /**
         * Initialize a new Howl group object.
         * @param  {Object} o Passed in properties for this group.
         * @return {Howl}
         */
        init: function(o) {
          var self2 = this;
          if (!Howler2.ctx) {
            setupAudioContext();
          }
          self2._autoplay = o.autoplay || false;
          self2._format = typeof o.format !== "string" ? o.format : [o.format];
          self2._html5 = o.html5 || false;
          self2._muted = o.mute || false;
          self2._loop = o.loop || false;
          self2._pool = o.pool || 5;
          self2._preload = typeof o.preload === "boolean" || o.preload === "metadata" ? o.preload : true;
          self2._rate = o.rate || 1;
          self2._sprite = o.sprite || {};
          self2._src = typeof o.src !== "string" ? o.src : [o.src];
          self2._volume = o.volume !== void 0 ? o.volume : 1;
          self2._xhr = {
            method: o.xhr && o.xhr.method ? o.xhr.method : "GET",
            headers: o.xhr && o.xhr.headers ? o.xhr.headers : null,
            withCredentials: o.xhr && o.xhr.withCredentials ? o.xhr.withCredentials : false
          };
          self2._duration = 0;
          self2._state = "unloaded";
          self2._sounds = [];
          self2._endTimers = {};
          self2._queue = [];
          self2._playLock = false;
          self2._onend = o.onend ? [{ fn: o.onend }] : [];
          self2._onfade = o.onfade ? [{ fn: o.onfade }] : [];
          self2._onload = o.onload ? [{ fn: o.onload }] : [];
          self2._onloaderror = o.onloaderror ? [{ fn: o.onloaderror }] : [];
          self2._onplayerror = o.onplayerror ? [{ fn: o.onplayerror }] : [];
          self2._onpause = o.onpause ? [{ fn: o.onpause }] : [];
          self2._onplay = o.onplay ? [{ fn: o.onplay }] : [];
          self2._onstop = o.onstop ? [{ fn: o.onstop }] : [];
          self2._onmute = o.onmute ? [{ fn: o.onmute }] : [];
          self2._onvolume = o.onvolume ? [{ fn: o.onvolume }] : [];
          self2._onrate = o.onrate ? [{ fn: o.onrate }] : [];
          self2._onseek = o.onseek ? [{ fn: o.onseek }] : [];
          self2._onunlock = o.onunlock ? [{ fn: o.onunlock }] : [];
          self2._onresume = [];
          self2._webAudio = Howler2.usingWebAudio && !self2._html5;
          if (typeof Howler2.ctx !== "undefined" && Howler2.ctx && Howler2.autoUnlock) {
            Howler2._unlockAudio();
          }
          Howler2._howls.push(self2);
          if (self2._autoplay) {
            self2._queue.push({
              event: "play",
              action: function() {
                self2.play();
              }
            });
          }
          if (self2._preload && self2._preload !== "none") {
            self2.load();
          }
          return self2;
        },
        /**
         * Load the audio file.
         * @return {Howler}
         */
        load: function() {
          var self2 = this;
          var url = null;
          if (Howler2.noAudio) {
            self2._emit("loaderror", null, "No audio support.");
            return;
          }
          if (typeof self2._src === "string") {
            self2._src = [self2._src];
          }
          for (var i = 0; i < self2._src.length; i++) {
            var ext, str;
            if (self2._format && self2._format[i]) {
              ext = self2._format[i];
            } else {
              str = self2._src[i];
              if (typeof str !== "string") {
                self2._emit("loaderror", null, "Non-string found in selected audio sources - ignoring.");
                continue;
              }
              ext = /^data:audio\/([^;,]+);/i.exec(str);
              if (!ext) {
                ext = /\.([^.]+)$/.exec(str.split("?", 1)[0]);
              }
              if (ext) {
                ext = ext[1].toLowerCase();
              }
            }
            if (!ext) {
              console.warn('No file extension was found. Consider using the "format" property or specify an extension.');
            }
            if (ext && Howler2.codecs(ext)) {
              url = self2._src[i];
              break;
            }
          }
          if (!url) {
            self2._emit("loaderror", null, "No codec support for selected audio sources.");
            return;
          }
          self2._src = url;
          self2._state = "loading";
          if (window.location.protocol === "https:" && url.slice(0, 5) === "http:") {
            self2._html5 = true;
            self2._webAudio = false;
          }
          new Sound2(self2);
          if (self2._webAudio) {
            loadBuffer(self2);
          }
          return self2;
        },
        /**
         * Play a sound or resume previous playback.
         * @param  {String/Number} sprite   Sprite name for sprite playback or sound id to continue previous.
         * @param  {Boolean} internal Internal Use: true prevents event firing.
         * @return {Number}          Sound ID.
         */
        play: function(sprite, internal) {
          var self2 = this;
          var id = null;
          if (typeof sprite === "number") {
            id = sprite;
            sprite = null;
          } else if (typeof sprite === "string" && self2._state === "loaded" && !self2._sprite[sprite]) {
            return null;
          } else if (typeof sprite === "undefined") {
            sprite = "__default";
            if (!self2._playLock) {
              var num = 0;
              for (var i = 0; i < self2._sounds.length; i++) {
                if (self2._sounds[i]._paused && !self2._sounds[i]._ended) {
                  num++;
                  id = self2._sounds[i]._id;
                }
              }
              if (num === 1) {
                sprite = null;
              } else {
                id = null;
              }
            }
          }
          var sound = id ? self2._soundById(id) : self2._inactiveSound();
          if (!sound) {
            return null;
          }
          if (id && !sprite) {
            sprite = sound._sprite || "__default";
          }
          if (self2._state !== "loaded") {
            sound._sprite = sprite;
            sound._ended = false;
            var soundId = sound._id;
            self2._queue.push({
              event: "play",
              action: function() {
                self2.play(soundId);
              }
            });
            return soundId;
          }
          if (id && !sound._paused) {
            if (!internal) {
              self2._loadQueue("play");
            }
            return sound._id;
          }
          if (self2._webAudio) {
            Howler2._autoResume();
          }
          var seek = Math.max(0, sound._seek > 0 ? sound._seek : self2._sprite[sprite][0] / 1e3);
          var duration = Math.max(0, (self2._sprite[sprite][0] + self2._sprite[sprite][1]) / 1e3 - seek);
          var timeout = duration * 1e3 / Math.abs(sound._rate);
          var start = self2._sprite[sprite][0] / 1e3;
          var stop = (self2._sprite[sprite][0] + self2._sprite[sprite][1]) / 1e3;
          sound._sprite = sprite;
          sound._ended = false;
          var setParams = function() {
            sound._paused = false;
            sound._seek = seek;
            sound._start = start;
            sound._stop = stop;
            sound._loop = !!(sound._loop || self2._sprite[sprite][2]);
          };
          if (seek >= stop) {
            self2._ended(sound);
            return;
          }
          var node = sound._node;
          if (self2._webAudio) {
            var playWebAudio = function() {
              self2._playLock = false;
              setParams();
              self2._refreshBuffer(sound);
              var vol = sound._muted || self2._muted ? 0 : sound._volume;
              node.gain.setValueAtTime(vol, Howler2.ctx.currentTime);
              sound._playStart = Howler2.ctx.currentTime;
              if (typeof node.bufferSource.start === "undefined") {
                sound._loop ? node.bufferSource.noteGrainOn(0, seek, 86400) : node.bufferSource.noteGrainOn(0, seek, duration);
              } else {
                sound._loop ? node.bufferSource.start(0, seek, 86400) : node.bufferSource.start(0, seek, duration);
              }
              if (timeout !== Infinity) {
                self2._endTimers[sound._id] = setTimeout(self2._ended.bind(self2, sound), timeout);
              }
              if (!internal) {
                setTimeout(function() {
                  self2._emit("play", sound._id);
                  self2._loadQueue();
                }, 0);
              }
            };
            if (Howler2.state === "running" && Howler2.ctx.state !== "interrupted") {
              playWebAudio();
            } else {
              self2._playLock = true;
              self2.once("resume", playWebAudio);
              self2._clearTimer(sound._id);
            }
          } else {
            var playHtml5 = function() {
              node.currentTime = seek;
              node.muted = sound._muted || self2._muted || Howler2._muted || node.muted;
              node.volume = sound._volume * Howler2.volume();
              node.playbackRate = sound._rate;
              try {
                var play = node.play();
                if (play && typeof Promise !== "undefined" && (play instanceof Promise || typeof play.then === "function")) {
                  self2._playLock = true;
                  setParams();
                  play.then(function() {
                    self2._playLock = false;
                    node._unlocked = true;
                    if (!internal) {
                      self2._emit("play", sound._id);
                    } else {
                      self2._loadQueue();
                    }
                  }).catch(function() {
                    self2._playLock = false;
                    self2._emit("playerror", sound._id, "Playback was unable to start. This is most commonly an issue on mobile devices and Chrome where playback was not within a user interaction.");
                    sound._ended = true;
                    sound._paused = true;
                  });
                } else if (!internal) {
                  self2._playLock = false;
                  setParams();
                  self2._emit("play", sound._id);
                }
                node.playbackRate = sound._rate;
                if (node.paused) {
                  self2._emit("playerror", sound._id, "Playback was unable to start. This is most commonly an issue on mobile devices and Chrome where playback was not within a user interaction.");
                  return;
                }
                if (sprite !== "__default" || sound._loop) {
                  self2._endTimers[sound._id] = setTimeout(self2._ended.bind(self2, sound), timeout);
                } else {
                  self2._endTimers[sound._id] = function() {
                    self2._ended(sound);
                    node.removeEventListener("ended", self2._endTimers[sound._id], false);
                  };
                  node.addEventListener("ended", self2._endTimers[sound._id], false);
                }
              } catch (err) {
                self2._emit("playerror", sound._id, err);
              }
            };
            if (node.src === "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA") {
              node.src = self2._src;
              node.load();
            }
            var loadedNoReadyState = window && window.ejecta || !node.readyState && Howler2._navigator.isCocoonJS;
            if (node.readyState >= 3 || loadedNoReadyState) {
              playHtml5();
            } else {
              self2._playLock = true;
              self2._state = "loading";
              var listener = function() {
                self2._state = "loaded";
                playHtml5();
                node.removeEventListener(Howler2._canPlayEvent, listener, false);
              };
              node.addEventListener(Howler2._canPlayEvent, listener, false);
              self2._clearTimer(sound._id);
            }
          }
          return sound._id;
        },
        /**
         * Pause playback and save current position.
         * @param  {Number} id The sound ID (empty to pause all in group).
         * @return {Howl}
         */
        pause: function(id) {
          var self2 = this;
          if (self2._state !== "loaded" || self2._playLock) {
            self2._queue.push({
              event: "pause",
              action: function() {
                self2.pause(id);
              }
            });
            return self2;
          }
          var ids = self2._getSoundIds(id);
          for (var i = 0; i < ids.length; i++) {
            self2._clearTimer(ids[i]);
            var sound = self2._soundById(ids[i]);
            if (sound && !sound._paused) {
              sound._seek = self2.seek(ids[i]);
              sound._rateSeek = 0;
              sound._paused = true;
              self2._stopFade(ids[i]);
              if (sound._node) {
                if (self2._webAudio) {
                  if (!sound._node.bufferSource) {
                    continue;
                  }
                  if (typeof sound._node.bufferSource.stop === "undefined") {
                    sound._node.bufferSource.noteOff(0);
                  } else {
                    sound._node.bufferSource.stop(0);
                  }
                  self2._cleanBuffer(sound._node);
                } else if (!isNaN(sound._node.duration) || sound._node.duration === Infinity) {
                  sound._node.pause();
                }
              }
            }
            if (!arguments[1]) {
              self2._emit("pause", sound ? sound._id : null);
            }
          }
          return self2;
        },
        /**
         * Stop playback and reset to start.
         * @param  {Number} id The sound ID (empty to stop all in group).
         * @param  {Boolean} internal Internal Use: true prevents event firing.
         * @return {Howl}
         */
        stop: function(id, internal) {
          var self2 = this;
          if (self2._state !== "loaded" || self2._playLock) {
            self2._queue.push({
              event: "stop",
              action: function() {
                self2.stop(id);
              }
            });
            return self2;
          }
          var ids = self2._getSoundIds(id);
          for (var i = 0; i < ids.length; i++) {
            self2._clearTimer(ids[i]);
            var sound = self2._soundById(ids[i]);
            if (sound) {
              sound._seek = sound._start || 0;
              sound._rateSeek = 0;
              sound._paused = true;
              sound._ended = true;
              self2._stopFade(ids[i]);
              if (sound._node) {
                if (self2._webAudio) {
                  if (sound._node.bufferSource) {
                    if (typeof sound._node.bufferSource.stop === "undefined") {
                      sound._node.bufferSource.noteOff(0);
                    } else {
                      sound._node.bufferSource.stop(0);
                    }
                    self2._cleanBuffer(sound._node);
                  }
                } else if (!isNaN(sound._node.duration) || sound._node.duration === Infinity) {
                  sound._node.currentTime = sound._start || 0;
                  sound._node.pause();
                  if (sound._node.duration === Infinity) {
                    self2._clearSound(sound._node);
                  }
                }
              }
              if (!internal) {
                self2._emit("stop", sound._id);
              }
            }
          }
          return self2;
        },
        /**
         * Mute/unmute a single sound or all sounds in this Howl group.
         * @param  {Boolean} muted Set to true to mute and false to unmute.
         * @param  {Number} id    The sound ID to update (omit to mute/unmute all).
         * @return {Howl}
         */
        mute: function(muted, id) {
          var self2 = this;
          if (self2._state !== "loaded" || self2._playLock) {
            self2._queue.push({
              event: "mute",
              action: function() {
                self2.mute(muted, id);
              }
            });
            return self2;
          }
          if (typeof id === "undefined") {
            if (typeof muted === "boolean") {
              self2._muted = muted;
            } else {
              return self2._muted;
            }
          }
          var ids = self2._getSoundIds(id);
          for (var i = 0; i < ids.length; i++) {
            var sound = self2._soundById(ids[i]);
            if (sound) {
              sound._muted = muted;
              if (sound._interval) {
                self2._stopFade(sound._id);
              }
              if (self2._webAudio && sound._node) {
                sound._node.gain.setValueAtTime(muted ? 0 : sound._volume, Howler2.ctx.currentTime);
              } else if (sound._node) {
                sound._node.muted = Howler2._muted ? true : muted;
              }
              self2._emit("mute", sound._id);
            }
          }
          return self2;
        },
        /**
         * Get/set the volume of this sound or of the Howl group. This method can optionally take 0, 1 or 2 arguments.
         *   volume() -> Returns the group's volume value.
         *   volume(id) -> Returns the sound id's current volume.
         *   volume(vol) -> Sets the volume of all sounds in this Howl group.
         *   volume(vol, id) -> Sets the volume of passed sound id.
         * @return {Howl/Number} Returns self or current volume.
         */
        volume: function() {
          var self2 = this;
          var args = arguments;
          var vol, id;
          if (args.length === 0) {
            return self2._volume;
          } else if (args.length === 1 || args.length === 2 && typeof args[1] === "undefined") {
            var ids = self2._getSoundIds();
            var index = ids.indexOf(args[0]);
            if (index >= 0) {
              id = parseInt(args[0], 10);
            } else {
              vol = parseFloat(args[0]);
            }
          } else if (args.length >= 2) {
            vol = parseFloat(args[0]);
            id = parseInt(args[1], 10);
          }
          var sound;
          if (typeof vol !== "undefined" && vol >= 0 && vol <= 1) {
            if (self2._state !== "loaded" || self2._playLock) {
              self2._queue.push({
                event: "volume",
                action: function() {
                  self2.volume.apply(self2, args);
                }
              });
              return self2;
            }
            if (typeof id === "undefined") {
              self2._volume = vol;
            }
            id = self2._getSoundIds(id);
            for (var i = 0; i < id.length; i++) {
              sound = self2._soundById(id[i]);
              if (sound) {
                sound._volume = vol;
                if (!args[2]) {
                  self2._stopFade(id[i]);
                }
                if (self2._webAudio && sound._node && !sound._muted) {
                  sound._node.gain.setValueAtTime(vol, Howler2.ctx.currentTime);
                } else if (sound._node && !sound._muted) {
                  sound._node.volume = vol * Howler2.volume();
                }
                self2._emit("volume", sound._id);
              }
            }
          } else {
            sound = id ? self2._soundById(id) : self2._sounds[0];
            return sound ? sound._volume : 0;
          }
          return self2;
        },
        /**
         * Fade a currently playing sound between two volumes (if no id is passed, all sounds will fade).
         * @param  {Number} from The value to fade from (0.0 to 1.0).
         * @param  {Number} to   The volume to fade to (0.0 to 1.0).
         * @param  {Number} len  Time in milliseconds to fade.
         * @param  {Number} id   The sound id (omit to fade all sounds).
         * @return {Howl}
         */
        fade: function(from, to, len, id) {
          var self2 = this;
          if (self2._state !== "loaded" || self2._playLock) {
            self2._queue.push({
              event: "fade",
              action: function() {
                self2.fade(from, to, len, id);
              }
            });
            return self2;
          }
          from = Math.min(Math.max(0, parseFloat(from)), 1);
          to = Math.min(Math.max(0, parseFloat(to)), 1);
          len = parseFloat(len);
          self2.volume(from, id);
          var ids = self2._getSoundIds(id);
          for (var i = 0; i < ids.length; i++) {
            var sound = self2._soundById(ids[i]);
            if (sound) {
              if (!id) {
                self2._stopFade(ids[i]);
              }
              if (self2._webAudio && !sound._muted) {
                var currentTime = Howler2.ctx.currentTime;
                var end = currentTime + len / 1e3;
                sound._volume = from;
                sound._node.gain.setValueAtTime(from, currentTime);
                sound._node.gain.linearRampToValueAtTime(to, end);
              }
              self2._startFadeInterval(sound, from, to, len, ids[i], typeof id === "undefined");
            }
          }
          return self2;
        },
        /**
         * Starts the internal interval to fade a sound.
         * @param  {Object} sound Reference to sound to fade.
         * @param  {Number} from The value to fade from (0.0 to 1.0).
         * @param  {Number} to   The volume to fade to (0.0 to 1.0).
         * @param  {Number} len  Time in milliseconds to fade.
         * @param  {Number} id   The sound id to fade.
         * @param  {Boolean} isGroup   If true, set the volume on the group.
         */
        _startFadeInterval: function(sound, from, to, len, id, isGroup) {
          var self2 = this;
          var vol = from;
          var diff = to - from;
          var steps = Math.abs(diff / 0.01);
          var stepLen = Math.max(4, steps > 0 ? len / steps : len);
          var lastTick = Date.now();
          sound._fadeTo = to;
          sound._interval = setInterval(function() {
            var tick = (Date.now() - lastTick) / len;
            lastTick = Date.now();
            vol += diff * tick;
            vol = Math.round(vol * 100) / 100;
            if (diff < 0) {
              vol = Math.max(to, vol);
            } else {
              vol = Math.min(to, vol);
            }
            if (self2._webAudio) {
              sound._volume = vol;
            } else {
              self2.volume(vol, sound._id, true);
            }
            if (isGroup) {
              self2._volume = vol;
            }
            if (to < from && vol <= to || to > from && vol >= to) {
              clearInterval(sound._interval);
              sound._interval = null;
              sound._fadeTo = null;
              self2.volume(to, sound._id);
              self2._emit("fade", sound._id);
            }
          }, stepLen);
        },
        /**
         * Internal method that stops the currently playing fade when
         * a new fade starts, volume is changed or the sound is stopped.
         * @param  {Number} id The sound id.
         * @return {Howl}
         */
        _stopFade: function(id) {
          var self2 = this;
          var sound = self2._soundById(id);
          if (sound && sound._interval) {
            if (self2._webAudio) {
              sound._node.gain.cancelScheduledValues(Howler2.ctx.currentTime);
            }
            clearInterval(sound._interval);
            sound._interval = null;
            self2.volume(sound._fadeTo, id);
            sound._fadeTo = null;
            self2._emit("fade", id);
          }
          return self2;
        },
        /**
         * Get/set the loop parameter on a sound. This method can optionally take 0, 1 or 2 arguments.
         *   loop() -> Returns the group's loop value.
         *   loop(id) -> Returns the sound id's loop value.
         *   loop(loop) -> Sets the loop value for all sounds in this Howl group.
         *   loop(loop, id) -> Sets the loop value of passed sound id.
         * @return {Howl/Boolean} Returns self or current loop value.
         */
        loop: function() {
          var self2 = this;
          var args = arguments;
          var loop, id, sound;
          if (args.length === 0) {
            return self2._loop;
          } else if (args.length === 1) {
            if (typeof args[0] === "boolean") {
              loop = args[0];
              self2._loop = loop;
            } else {
              sound = self2._soundById(parseInt(args[0], 10));
              return sound ? sound._loop : false;
            }
          } else if (args.length === 2) {
            loop = args[0];
            id = parseInt(args[1], 10);
          }
          var ids = self2._getSoundIds(id);
          for (var i = 0; i < ids.length; i++) {
            sound = self2._soundById(ids[i]);
            if (sound) {
              sound._loop = loop;
              if (self2._webAudio && sound._node && sound._node.bufferSource) {
                sound._node.bufferSource.loop = loop;
                if (loop) {
                  sound._node.bufferSource.loopStart = sound._start || 0;
                  sound._node.bufferSource.loopEnd = sound._stop;
                  if (self2.playing(ids[i])) {
                    self2.pause(ids[i], true);
                    self2.play(ids[i], true);
                  }
                }
              }
            }
          }
          return self2;
        },
        /**
         * Get/set the playback rate of a sound. This method can optionally take 0, 1 or 2 arguments.
         *   rate() -> Returns the first sound node's current playback rate.
         *   rate(id) -> Returns the sound id's current playback rate.
         *   rate(rate) -> Sets the playback rate of all sounds in this Howl group.
         *   rate(rate, id) -> Sets the playback rate of passed sound id.
         * @return {Howl/Number} Returns self or the current playback rate.
         */
        rate: function() {
          var self2 = this;
          var args = arguments;
          var rate, id;
          if (args.length === 0) {
            id = self2._sounds[0]._id;
          } else if (args.length === 1) {
            var ids = self2._getSoundIds();
            var index = ids.indexOf(args[0]);
            if (index >= 0) {
              id = parseInt(args[0], 10);
            } else {
              rate = parseFloat(args[0]);
            }
          } else if (args.length === 2) {
            rate = parseFloat(args[0]);
            id = parseInt(args[1], 10);
          }
          var sound;
          if (typeof rate === "number") {
            if (self2._state !== "loaded" || self2._playLock) {
              self2._queue.push({
                event: "rate",
                action: function() {
                  self2.rate.apply(self2, args);
                }
              });
              return self2;
            }
            if (typeof id === "undefined") {
              self2._rate = rate;
            }
            id = self2._getSoundIds(id);
            for (var i = 0; i < id.length; i++) {
              sound = self2._soundById(id[i]);
              if (sound) {
                if (self2.playing(id[i])) {
                  sound._rateSeek = self2.seek(id[i]);
                  sound._playStart = self2._webAudio ? Howler2.ctx.currentTime : sound._playStart;
                }
                sound._rate = rate;
                if (self2._webAudio && sound._node && sound._node.bufferSource) {
                  sound._node.bufferSource.playbackRate.setValueAtTime(rate, Howler2.ctx.currentTime);
                } else if (sound._node) {
                  sound._node.playbackRate = rate;
                }
                var seek = self2.seek(id[i]);
                var duration = (self2._sprite[sound._sprite][0] + self2._sprite[sound._sprite][1]) / 1e3 - seek;
                var timeout = duration * 1e3 / Math.abs(sound._rate);
                if (self2._endTimers[id[i]] || !sound._paused) {
                  self2._clearTimer(id[i]);
                  self2._endTimers[id[i]] = setTimeout(self2._ended.bind(self2, sound), timeout);
                }
                self2._emit("rate", sound._id);
              }
            }
          } else {
            sound = self2._soundById(id);
            return sound ? sound._rate : self2._rate;
          }
          return self2;
        },
        /**
         * Get/set the seek position of a sound. This method can optionally take 0, 1 or 2 arguments.
         *   seek() -> Returns the first sound node's current seek position.
         *   seek(id) -> Returns the sound id's current seek position.
         *   seek(seek) -> Sets the seek position of the first sound node.
         *   seek(seek, id) -> Sets the seek position of passed sound id.
         * @return {Howl/Number} Returns self or the current seek position.
         */
        seek: function() {
          var self2 = this;
          var args = arguments;
          var seek, id;
          if (args.length === 0) {
            if (self2._sounds.length) {
              id = self2._sounds[0]._id;
            }
          } else if (args.length === 1) {
            var ids = self2._getSoundIds();
            var index = ids.indexOf(args[0]);
            if (index >= 0) {
              id = parseInt(args[0], 10);
            } else if (self2._sounds.length) {
              id = self2._sounds[0]._id;
              seek = parseFloat(args[0]);
            }
          } else if (args.length === 2) {
            seek = parseFloat(args[0]);
            id = parseInt(args[1], 10);
          }
          if (typeof id === "undefined") {
            return 0;
          }
          if (typeof seek === "number" && (self2._state !== "loaded" || self2._playLock)) {
            self2._queue.push({
              event: "seek",
              action: function() {
                self2.seek.apply(self2, args);
              }
            });
            return self2;
          }
          var sound = self2._soundById(id);
          if (sound) {
            if (typeof seek === "number" && seek >= 0) {
              var playing = self2.playing(id);
              if (playing) {
                self2.pause(id, true);
              }
              sound._seek = seek;
              sound._ended = false;
              self2._clearTimer(id);
              if (!self2._webAudio && sound._node && !isNaN(sound._node.duration)) {
                sound._node.currentTime = seek;
              }
              var seekAndEmit = function() {
                if (playing) {
                  self2.play(id, true);
                }
                self2._emit("seek", id);
              };
              if (playing && !self2._webAudio) {
                var emitSeek = function() {
                  if (!self2._playLock) {
                    seekAndEmit();
                  } else {
                    setTimeout(emitSeek, 0);
                  }
                };
                setTimeout(emitSeek, 0);
              } else {
                seekAndEmit();
              }
            } else {
              if (self2._webAudio) {
                var realTime = self2.playing(id) ? Howler2.ctx.currentTime - sound._playStart : 0;
                var rateSeek = sound._rateSeek ? sound._rateSeek - sound._seek : 0;
                return sound._seek + (rateSeek + realTime * Math.abs(sound._rate));
              } else {
                return sound._node.currentTime;
              }
            }
          }
          return self2;
        },
        /**
         * Check if a specific sound is currently playing or not (if id is provided), or check if at least one of the sounds in the group is playing or not.
         * @param  {Number}  id The sound id to check. If none is passed, the whole sound group is checked.
         * @return {Boolean} True if playing and false if not.
         */
        playing: function(id) {
          var self2 = this;
          if (typeof id === "number") {
            var sound = self2._soundById(id);
            return sound ? !sound._paused : false;
          }
          for (var i = 0; i < self2._sounds.length; i++) {
            if (!self2._sounds[i]._paused) {
              return true;
            }
          }
          return false;
        },
        /**
         * Get the duration of this sound. Passing a sound id will return the sprite duration.
         * @param  {Number} id The sound id to check. If none is passed, return full source duration.
         * @return {Number} Audio duration in seconds.
         */
        duration: function(id) {
          var self2 = this;
          var duration = self2._duration;
          var sound = self2._soundById(id);
          if (sound) {
            duration = self2._sprite[sound._sprite][1] / 1e3;
          }
          return duration;
        },
        /**
         * Returns the current loaded state of this Howl.
         * @return {String} 'unloaded', 'loading', 'loaded'
         */
        state: function() {
          return this._state;
        },
        /**
         * Unload and destroy the current Howl object.
         * This will immediately stop all sound instances attached to this group.
         */
        unload: function() {
          var self2 = this;
          var sounds2 = self2._sounds;
          for (var i = 0; i < sounds2.length; i++) {
            if (!sounds2[i]._paused) {
              self2.stop(sounds2[i]._id);
            }
            if (!self2._webAudio) {
              self2._clearSound(sounds2[i]._node);
              sounds2[i]._node.removeEventListener("error", sounds2[i]._errorFn, false);
              sounds2[i]._node.removeEventListener(Howler2._canPlayEvent, sounds2[i]._loadFn, false);
              sounds2[i]._node.removeEventListener("ended", sounds2[i]._endFn, false);
              Howler2._releaseHtml5Audio(sounds2[i]._node);
            }
            delete sounds2[i]._node;
            self2._clearTimer(sounds2[i]._id);
          }
          var index = Howler2._howls.indexOf(self2);
          if (index >= 0) {
            Howler2._howls.splice(index, 1);
          }
          var remCache = true;
          for (i = 0; i < Howler2._howls.length; i++) {
            if (Howler2._howls[i]._src === self2._src || self2._src.indexOf(Howler2._howls[i]._src) >= 0) {
              remCache = false;
              break;
            }
          }
          if (cache && remCache) {
            delete cache[self2._src];
          }
          Howler2.noAudio = false;
          self2._state = "unloaded";
          self2._sounds = [];
          self2 = null;
          return null;
        },
        /**
         * Listen to a custom event.
         * @param  {String}   event Event name.
         * @param  {Function} fn    Listener to call.
         * @param  {Number}   id    (optional) Only listen to events for this sound.
         * @param  {Number}   once  (INTERNAL) Marks event to fire only once.
         * @return {Howl}
         */
        on: function(event, fn, id, once) {
          var self2 = this;
          var events = self2["_on" + event];
          if (typeof fn === "function") {
            events.push(once ? { id, fn, once } : { id, fn });
          }
          return self2;
        },
        /**
         * Remove a custom event. Call without parameters to remove all events.
         * @param  {String}   event Event name.
         * @param  {Function} fn    Listener to remove. Leave empty to remove all.
         * @param  {Number}   id    (optional) Only remove events for this sound.
         * @return {Howl}
         */
        off: function(event, fn, id) {
          var self2 = this;
          var events = self2["_on" + event];
          var i = 0;
          if (typeof fn === "number") {
            id = fn;
            fn = null;
          }
          if (fn || id) {
            for (i = 0; i < events.length; i++) {
              var isId = id === events[i].id;
              if (fn === events[i].fn && isId || !fn && isId) {
                events.splice(i, 1);
                break;
              }
            }
          } else if (event) {
            self2["_on" + event] = [];
          } else {
            var keys = Object.keys(self2);
            for (i = 0; i < keys.length; i++) {
              if (keys[i].indexOf("_on") === 0 && Array.isArray(self2[keys[i]])) {
                self2[keys[i]] = [];
              }
            }
          }
          return self2;
        },
        /**
         * Listen to a custom event and remove it once fired.
         * @param  {String}   event Event name.
         * @param  {Function} fn    Listener to call.
         * @param  {Number}   id    (optional) Only listen to events for this sound.
         * @return {Howl}
         */
        once: function(event, fn, id) {
          var self2 = this;
          self2.on(event, fn, id, 1);
          return self2;
        },
        /**
         * Emit all events of a specific type and pass the sound id.
         * @param  {String} event Event name.
         * @param  {Number} id    Sound ID.
         * @param  {Number} msg   Message to go with event.
         * @return {Howl}
         */
        _emit: function(event, id, msg) {
          var self2 = this;
          var events = self2["_on" + event];
          for (var i = events.length - 1; i >= 0; i--) {
            if (!events[i].id || events[i].id === id || event === "load") {
              setTimeout((function(fn) {
                fn.call(this, id, msg);
              }).bind(self2, events[i].fn), 0);
              if (events[i].once) {
                self2.off(event, events[i].fn, events[i].id);
              }
            }
          }
          self2._loadQueue(event);
          return self2;
        },
        /**
         * Queue of actions initiated before the sound has loaded.
         * These will be called in sequence, with the next only firing
         * after the previous has finished executing (even if async like play).
         * @return {Howl}
         */
        _loadQueue: function(event) {
          var self2 = this;
          if (self2._queue.length > 0) {
            var task = self2._queue[0];
            if (task.event === event) {
              self2._queue.shift();
              self2._loadQueue();
            }
            if (!event) {
              task.action();
            }
          }
          return self2;
        },
        /**
         * Fired when playback ends at the end of the duration.
         * @param  {Sound} sound The sound object to work with.
         * @return {Howl}
         */
        _ended: function(sound) {
          var self2 = this;
          var sprite = sound._sprite;
          if (!self2._webAudio && sound._node && !sound._node.paused && !sound._node.ended && sound._node.currentTime < sound._stop) {
            setTimeout(self2._ended.bind(self2, sound), 100);
            return self2;
          }
          var loop = !!(sound._loop || self2._sprite[sprite][2]);
          self2._emit("end", sound._id);
          if (!self2._webAudio && loop) {
            self2.stop(sound._id, true).play(sound._id);
          }
          if (self2._webAudio && loop) {
            self2._emit("play", sound._id);
            sound._seek = sound._start || 0;
            sound._rateSeek = 0;
            sound._playStart = Howler2.ctx.currentTime;
            var timeout = (sound._stop - sound._start) * 1e3 / Math.abs(sound._rate);
            self2._endTimers[sound._id] = setTimeout(self2._ended.bind(self2, sound), timeout);
          }
          if (self2._webAudio && !loop) {
            sound._paused = true;
            sound._ended = true;
            sound._seek = sound._start || 0;
            sound._rateSeek = 0;
            self2._clearTimer(sound._id);
            self2._cleanBuffer(sound._node);
            Howler2._autoSuspend();
          }
          if (!self2._webAudio && !loop) {
            self2.stop(sound._id, true);
          }
          return self2;
        },
        /**
         * Clear the end timer for a sound playback.
         * @param  {Number} id The sound ID.
         * @return {Howl}
         */
        _clearTimer: function(id) {
          var self2 = this;
          if (self2._endTimers[id]) {
            if (typeof self2._endTimers[id] !== "function") {
              clearTimeout(self2._endTimers[id]);
            } else {
              var sound = self2._soundById(id);
              if (sound && sound._node) {
                sound._node.removeEventListener("ended", self2._endTimers[id], false);
              }
            }
            delete self2._endTimers[id];
          }
          return self2;
        },
        /**
         * Return the sound identified by this ID, or return null.
         * @param  {Number} id Sound ID
         * @return {Object}    Sound object or null.
         */
        _soundById: function(id) {
          var self2 = this;
          for (var i = 0; i < self2._sounds.length; i++) {
            if (id === self2._sounds[i]._id) {
              return self2._sounds[i];
            }
          }
          return null;
        },
        /**
         * Return an inactive sound from the pool or create a new one.
         * @return {Sound} Sound playback object.
         */
        _inactiveSound: function() {
          var self2 = this;
          self2._drain();
          for (var i = 0; i < self2._sounds.length; i++) {
            if (self2._sounds[i]._ended) {
              return self2._sounds[i].reset();
            }
          }
          return new Sound2(self2);
        },
        /**
         * Drain excess inactive sounds from the pool.
         */
        _drain: function() {
          var self2 = this;
          var limit = self2._pool;
          var cnt = 0;
          var i = 0;
          if (self2._sounds.length < limit) {
            return;
          }
          for (i = 0; i < self2._sounds.length; i++) {
            if (self2._sounds[i]._ended) {
              cnt++;
            }
          }
          for (i = self2._sounds.length - 1; i >= 0; i--) {
            if (cnt <= limit) {
              return;
            }
            if (self2._sounds[i]._ended) {
              if (self2._webAudio && self2._sounds[i]._node) {
                self2._sounds[i]._node.disconnect(0);
              }
              self2._sounds.splice(i, 1);
              cnt--;
            }
          }
        },
        /**
         * Get all ID's from the sounds pool.
         * @param  {Number} id Only return one ID if one is passed.
         * @return {Array}    Array of IDs.
         */
        _getSoundIds: function(id) {
          var self2 = this;
          if (typeof id === "undefined") {
            var ids = [];
            for (var i = 0; i < self2._sounds.length; i++) {
              ids.push(self2._sounds[i]._id);
            }
            return ids;
          } else {
            return [id];
          }
        },
        /**
         * Load the sound back into the buffer source.
         * @param  {Sound} sound The sound object to work with.
         * @return {Howl}
         */
        _refreshBuffer: function(sound) {
          var self2 = this;
          sound._node.bufferSource = Howler2.ctx.createBufferSource();
          sound._node.bufferSource.buffer = cache[self2._src];
          if (sound._panner) {
            sound._node.bufferSource.connect(sound._panner);
          } else {
            sound._node.bufferSource.connect(sound._node);
          }
          sound._node.bufferSource.loop = sound._loop;
          if (sound._loop) {
            sound._node.bufferSource.loopStart = sound._start || 0;
            sound._node.bufferSource.loopEnd = sound._stop || 0;
          }
          sound._node.bufferSource.playbackRate.setValueAtTime(sound._rate, Howler2.ctx.currentTime);
          return self2;
        },
        /**
         * Prevent memory leaks by cleaning up the buffer source after playback.
         * @param  {Object} node Sound's audio node containing the buffer source.
         * @return {Howl}
         */
        _cleanBuffer: function(node) {
          var self2 = this;
          var isIOS = Howler2._navigator && Howler2._navigator.vendor.indexOf("Apple") >= 0;
          if (!node.bufferSource) {
            return self2;
          }
          if (Howler2._scratchBuffer && node.bufferSource) {
            node.bufferSource.onended = null;
            node.bufferSource.disconnect(0);
            if (isIOS) {
              try {
                node.bufferSource.buffer = Howler2._scratchBuffer;
              } catch (e) {
              }
            }
          }
          node.bufferSource = null;
          return self2;
        },
        /**
         * Set the source to a 0-second silence to stop any downloading (except in IE).
         * @param  {Object} node Audio node to clear.
         */
        _clearSound: function(node) {
          var checkIE = /MSIE |Trident\//.test(Howler2._navigator && Howler2._navigator.userAgent);
          if (!checkIE) {
            node.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";
          }
        }
      };
      var Sound2 = function(howl) {
        this._parent = howl;
        this.init();
      };
      Sound2.prototype = {
        /**
         * Initialize a new Sound object.
         * @return {Sound}
         */
        init: function() {
          var self2 = this;
          var parent = self2._parent;
          self2._muted = parent._muted;
          self2._loop = parent._loop;
          self2._volume = parent._volume;
          self2._rate = parent._rate;
          self2._seek = 0;
          self2._paused = true;
          self2._ended = true;
          self2._sprite = "__default";
          self2._id = ++Howler2._counter;
          parent._sounds.push(self2);
          self2.create();
          return self2;
        },
        /**
         * Create and setup a new sound object, whether HTML5 Audio or Web Audio.
         * @return {Sound}
         */
        create: function() {
          var self2 = this;
          var parent = self2._parent;
          var volume = Howler2._muted || self2._muted || self2._parent._muted ? 0 : self2._volume;
          if (parent._webAudio) {
            self2._node = typeof Howler2.ctx.createGain === "undefined" ? Howler2.ctx.createGainNode() : Howler2.ctx.createGain();
            self2._node.gain.setValueAtTime(volume, Howler2.ctx.currentTime);
            self2._node.paused = true;
            self2._node.connect(Howler2.masterGain);
          } else if (!Howler2.noAudio) {
            self2._node = Howler2._obtainHtml5Audio();
            self2._errorFn = self2._errorListener.bind(self2);
            self2._node.addEventListener("error", self2._errorFn, false);
            self2._loadFn = self2._loadListener.bind(self2);
            self2._node.addEventListener(Howler2._canPlayEvent, self2._loadFn, false);
            self2._endFn = self2._endListener.bind(self2);
            self2._node.addEventListener("ended", self2._endFn, false);
            self2._node.src = parent._src;
            self2._node.preload = parent._preload === true ? "auto" : parent._preload;
            self2._node.volume = volume * Howler2.volume();
            self2._node.load();
          }
          return self2;
        },
        /**
         * Reset the parameters of this sound to the original state (for recycle).
         * @return {Sound}
         */
        reset: function() {
          var self2 = this;
          var parent = self2._parent;
          self2._muted = parent._muted;
          self2._loop = parent._loop;
          self2._volume = parent._volume;
          self2._rate = parent._rate;
          self2._seek = 0;
          self2._rateSeek = 0;
          self2._paused = true;
          self2._ended = true;
          self2._sprite = "__default";
          self2._id = ++Howler2._counter;
          return self2;
        },
        /**
         * HTML5 Audio error listener callback.
         */
        _errorListener: function() {
          var self2 = this;
          self2._parent._emit("loaderror", self2._id, self2._node.error ? self2._node.error.code : 0);
          self2._node.removeEventListener("error", self2._errorFn, false);
        },
        /**
         * HTML5 Audio canplaythrough listener callback.
         */
        _loadListener: function() {
          var self2 = this;
          var parent = self2._parent;
          parent._duration = Math.ceil(self2._node.duration * 10) / 10;
          if (Object.keys(parent._sprite).length === 0) {
            parent._sprite = { __default: [0, parent._duration * 1e3] };
          }
          if (parent._state !== "loaded") {
            parent._state = "loaded";
            parent._emit("load");
            parent._loadQueue();
          }
          self2._node.removeEventListener(Howler2._canPlayEvent, self2._loadFn, false);
        },
        /**
         * HTML5 Audio ended listener callback.
         */
        _endListener: function() {
          var self2 = this;
          var parent = self2._parent;
          if (parent._duration === Infinity) {
            parent._duration = Math.ceil(self2._node.duration * 10) / 10;
            if (parent._sprite.__default[1] === Infinity) {
              parent._sprite.__default[1] = parent._duration * 1e3;
            }
            parent._ended(self2);
          }
          self2._node.removeEventListener("ended", self2._endFn, false);
        }
      };
      var cache = {};
      var loadBuffer = function(self2) {
        var url = self2._src;
        if (cache[url]) {
          self2._duration = cache[url].duration;
          loadSound(self2);
          return;
        }
        if (/^data:[^;]+;base64,/.test(url)) {
          var data = atob(url.split(",")[1]);
          var dataView = new Uint8Array(data.length);
          for (var i = 0; i < data.length; ++i) {
            dataView[i] = data.charCodeAt(i);
          }
          decodeAudioData(dataView.buffer, self2);
        } else {
          var xhr = new XMLHttpRequest();
          xhr.open(self2._xhr.method, url, true);
          xhr.withCredentials = self2._xhr.withCredentials;
          xhr.responseType = "arraybuffer";
          if (self2._xhr.headers) {
            Object.keys(self2._xhr.headers).forEach(function(key) {
              xhr.setRequestHeader(key, self2._xhr.headers[key]);
            });
          }
          xhr.onload = function() {
            var code = (xhr.status + "")[0];
            if (code !== "0" && code !== "2" && code !== "3") {
              self2._emit("loaderror", null, "Failed loading audio file with status: " + xhr.status + ".");
              return;
            }
            decodeAudioData(xhr.response, self2);
          };
          xhr.onerror = function() {
            if (self2._webAudio) {
              self2._html5 = true;
              self2._webAudio = false;
              self2._sounds = [];
              delete cache[url];
              self2.load();
            }
          };
          safeXhrSend(xhr);
        }
      };
      var safeXhrSend = function(xhr) {
        try {
          xhr.send();
        } catch (e) {
          xhr.onerror();
        }
      };
      var decodeAudioData = function(arraybuffer, self2) {
        var error = function() {
          self2._emit("loaderror", null, "Decoding audio data failed.");
        };
        var success = function(buffer) {
          if (buffer && self2._sounds.length > 0) {
            cache[self2._src] = buffer;
            loadSound(self2, buffer);
          } else {
            error();
          }
        };
        if (typeof Promise !== "undefined" && Howler2.ctx.decodeAudioData.length === 1) {
          Howler2.ctx.decodeAudioData(arraybuffer).then(success).catch(error);
        } else {
          Howler2.ctx.decodeAudioData(arraybuffer, success, error);
        }
      };
      var loadSound = function(self2, buffer) {
        if (buffer && !self2._duration) {
          self2._duration = buffer.duration;
        }
        if (Object.keys(self2._sprite).length === 0) {
          self2._sprite = { __default: [0, self2._duration * 1e3] };
        }
        if (self2._state !== "loaded") {
          self2._state = "loaded";
          self2._emit("load");
          self2._loadQueue();
        }
      };
      var setupAudioContext = function() {
        if (!Howler2.usingWebAudio) {
          return;
        }
        try {
          if (typeof AudioContext !== "undefined") {
            Howler2.ctx = new AudioContext();
          } else if (typeof webkitAudioContext !== "undefined") {
            Howler2.ctx = new webkitAudioContext();
          } else {
            Howler2.usingWebAudio = false;
          }
        } catch (e) {
          Howler2.usingWebAudio = false;
        }
        if (!Howler2.ctx) {
          Howler2.usingWebAudio = false;
        }
        var iOS = /iP(hone|od|ad)/.test(Howler2._navigator && Howler2._navigator.platform);
        var appVersion = Howler2._navigator && Howler2._navigator.appVersion.match(/OS (\d+)_(\d+)_?(\d+)?/);
        var version = appVersion ? parseInt(appVersion[1], 10) : null;
        if (iOS && version && version < 9) {
          var safari = /safari/.test(Howler2._navigator && Howler2._navigator.userAgent.toLowerCase());
          if (Howler2._navigator && !safari) {
            Howler2.usingWebAudio = false;
          }
        }
        if (Howler2.usingWebAudio) {
          Howler2.masterGain = typeof Howler2.ctx.createGain === "undefined" ? Howler2.ctx.createGainNode() : Howler2.ctx.createGain();
          Howler2.masterGain.gain.setValueAtTime(Howler2._muted ? 0 : Howler2._volume, Howler2.ctx.currentTime);
          Howler2.masterGain.connect(Howler2.ctx.destination);
        }
        Howler2._setup();
      };
      {
        exports.Howler = Howler2;
        exports.Howl = Howl2;
      }
      if (typeof commonjsGlobal !== "undefined") {
        commonjsGlobal.HowlerGlobal = HowlerGlobal2;
        commonjsGlobal.Howler = Howler2;
        commonjsGlobal.Howl = Howl2;
        commonjsGlobal.Sound = Sound2;
      } else if (typeof window !== "undefined") {
        window.HowlerGlobal = HowlerGlobal2;
        window.Howler = Howler2;
        window.Howl = Howl2;
        window.Sound = Sound2;
      }
    })();
    /*!
     *  Spatial Plugin - Adds support for stereo and 3D audio where Web Audio is supported.
     *  
     *  howler.js v2.2.4
     *  howlerjs.com
     *
     *  (c) 2013-2020, James Simpson of GoldFire Studios
     *  goldfirestudios.com
     *
     *  MIT License
     */
    (function() {
      HowlerGlobal.prototype._pos = [0, 0, 0];
      HowlerGlobal.prototype._orientation = [0, 0, -1, 0, 1, 0];
      HowlerGlobal.prototype.stereo = function(pan) {
        var self2 = this;
        if (!self2.ctx || !self2.ctx.listener) {
          return self2;
        }
        for (var i = self2._howls.length - 1; i >= 0; i--) {
          self2._howls[i].stereo(pan);
        }
        return self2;
      };
      HowlerGlobal.prototype.pos = function(x, y, z) {
        var self2 = this;
        if (!self2.ctx || !self2.ctx.listener) {
          return self2;
        }
        y = typeof y !== "number" ? self2._pos[1] : y;
        z = typeof z !== "number" ? self2._pos[2] : z;
        if (typeof x === "number") {
          self2._pos = [x, y, z];
          if (typeof self2.ctx.listener.positionX !== "undefined") {
            self2.ctx.listener.positionX.setTargetAtTime(self2._pos[0], Howler.ctx.currentTime, 0.1);
            self2.ctx.listener.positionY.setTargetAtTime(self2._pos[1], Howler.ctx.currentTime, 0.1);
            self2.ctx.listener.positionZ.setTargetAtTime(self2._pos[2], Howler.ctx.currentTime, 0.1);
          } else {
            self2.ctx.listener.setPosition(self2._pos[0], self2._pos[1], self2._pos[2]);
          }
        } else {
          return self2._pos;
        }
        return self2;
      };
      HowlerGlobal.prototype.orientation = function(x, y, z, xUp, yUp, zUp) {
        var self2 = this;
        if (!self2.ctx || !self2.ctx.listener) {
          return self2;
        }
        var or = self2._orientation;
        y = typeof y !== "number" ? or[1] : y;
        z = typeof z !== "number" ? or[2] : z;
        xUp = typeof xUp !== "number" ? or[3] : xUp;
        yUp = typeof yUp !== "number" ? or[4] : yUp;
        zUp = typeof zUp !== "number" ? or[5] : zUp;
        if (typeof x === "number") {
          self2._orientation = [x, y, z, xUp, yUp, zUp];
          if (typeof self2.ctx.listener.forwardX !== "undefined") {
            self2.ctx.listener.forwardX.setTargetAtTime(x, Howler.ctx.currentTime, 0.1);
            self2.ctx.listener.forwardY.setTargetAtTime(y, Howler.ctx.currentTime, 0.1);
            self2.ctx.listener.forwardZ.setTargetAtTime(z, Howler.ctx.currentTime, 0.1);
            self2.ctx.listener.upX.setTargetAtTime(xUp, Howler.ctx.currentTime, 0.1);
            self2.ctx.listener.upY.setTargetAtTime(yUp, Howler.ctx.currentTime, 0.1);
            self2.ctx.listener.upZ.setTargetAtTime(zUp, Howler.ctx.currentTime, 0.1);
          } else {
            self2.ctx.listener.setOrientation(x, y, z, xUp, yUp, zUp);
          }
        } else {
          return or;
        }
        return self2;
      };
      Howl.prototype.init = /* @__PURE__ */ (function(_super) {
        return function(o) {
          var self2 = this;
          self2._orientation = o.orientation || [1, 0, 0];
          self2._stereo = o.stereo || null;
          self2._pos = o.pos || null;
          self2._pannerAttr = {
            coneInnerAngle: typeof o.coneInnerAngle !== "undefined" ? o.coneInnerAngle : 360,
            coneOuterAngle: typeof o.coneOuterAngle !== "undefined" ? o.coneOuterAngle : 360,
            coneOuterGain: typeof o.coneOuterGain !== "undefined" ? o.coneOuterGain : 0,
            distanceModel: typeof o.distanceModel !== "undefined" ? o.distanceModel : "inverse",
            maxDistance: typeof o.maxDistance !== "undefined" ? o.maxDistance : 1e4,
            panningModel: typeof o.panningModel !== "undefined" ? o.panningModel : "HRTF",
            refDistance: typeof o.refDistance !== "undefined" ? o.refDistance : 1,
            rolloffFactor: typeof o.rolloffFactor !== "undefined" ? o.rolloffFactor : 1
          };
          self2._onstereo = o.onstereo ? [{ fn: o.onstereo }] : [];
          self2._onpos = o.onpos ? [{ fn: o.onpos }] : [];
          self2._onorientation = o.onorientation ? [{ fn: o.onorientation }] : [];
          return _super.call(this, o);
        };
      })(Howl.prototype.init);
      Howl.prototype.stereo = function(pan, id) {
        var self2 = this;
        if (!self2._webAudio) {
          return self2;
        }
        if (self2._state !== "loaded") {
          self2._queue.push({
            event: "stereo",
            action: function() {
              self2.stereo(pan, id);
            }
          });
          return self2;
        }
        var pannerType = typeof Howler.ctx.createStereoPanner === "undefined" ? "spatial" : "stereo";
        if (typeof id === "undefined") {
          if (typeof pan === "number") {
            self2._stereo = pan;
            self2._pos = [pan, 0, 0];
          } else {
            return self2._stereo;
          }
        }
        var ids = self2._getSoundIds(id);
        for (var i = 0; i < ids.length; i++) {
          var sound = self2._soundById(ids[i]);
          if (sound) {
            if (typeof pan === "number") {
              sound._stereo = pan;
              sound._pos = [pan, 0, 0];
              if (sound._node) {
                sound._pannerAttr.panningModel = "equalpower";
                if (!sound._panner || !sound._panner.pan) {
                  setupPanner(sound, pannerType);
                }
                if (pannerType === "spatial") {
                  if (typeof sound._panner.positionX !== "undefined") {
                    sound._panner.positionX.setValueAtTime(pan, Howler.ctx.currentTime);
                    sound._panner.positionY.setValueAtTime(0, Howler.ctx.currentTime);
                    sound._panner.positionZ.setValueAtTime(0, Howler.ctx.currentTime);
                  } else {
                    sound._panner.setPosition(pan, 0, 0);
                  }
                } else {
                  sound._panner.pan.setValueAtTime(pan, Howler.ctx.currentTime);
                }
              }
              self2._emit("stereo", sound._id);
            } else {
              return sound._stereo;
            }
          }
        }
        return self2;
      };
      Howl.prototype.pos = function(x, y, z, id) {
        var self2 = this;
        if (!self2._webAudio) {
          return self2;
        }
        if (self2._state !== "loaded") {
          self2._queue.push({
            event: "pos",
            action: function() {
              self2.pos(x, y, z, id);
            }
          });
          return self2;
        }
        y = typeof y !== "number" ? 0 : y;
        z = typeof z !== "number" ? -0.5 : z;
        if (typeof id === "undefined") {
          if (typeof x === "number") {
            self2._pos = [x, y, z];
          } else {
            return self2._pos;
          }
        }
        var ids = self2._getSoundIds(id);
        for (var i = 0; i < ids.length; i++) {
          var sound = self2._soundById(ids[i]);
          if (sound) {
            if (typeof x === "number") {
              sound._pos = [x, y, z];
              if (sound._node) {
                if (!sound._panner || sound._panner.pan) {
                  setupPanner(sound, "spatial");
                }
                if (typeof sound._panner.positionX !== "undefined") {
                  sound._panner.positionX.setValueAtTime(x, Howler.ctx.currentTime);
                  sound._panner.positionY.setValueAtTime(y, Howler.ctx.currentTime);
                  sound._panner.positionZ.setValueAtTime(z, Howler.ctx.currentTime);
                } else {
                  sound._panner.setPosition(x, y, z);
                }
              }
              self2._emit("pos", sound._id);
            } else {
              return sound._pos;
            }
          }
        }
        return self2;
      };
      Howl.prototype.orientation = function(x, y, z, id) {
        var self2 = this;
        if (!self2._webAudio) {
          return self2;
        }
        if (self2._state !== "loaded") {
          self2._queue.push({
            event: "orientation",
            action: function() {
              self2.orientation(x, y, z, id);
            }
          });
          return self2;
        }
        y = typeof y !== "number" ? self2._orientation[1] : y;
        z = typeof z !== "number" ? self2._orientation[2] : z;
        if (typeof id === "undefined") {
          if (typeof x === "number") {
            self2._orientation = [x, y, z];
          } else {
            return self2._orientation;
          }
        }
        var ids = self2._getSoundIds(id);
        for (var i = 0; i < ids.length; i++) {
          var sound = self2._soundById(ids[i]);
          if (sound) {
            if (typeof x === "number") {
              sound._orientation = [x, y, z];
              if (sound._node) {
                if (!sound._panner) {
                  if (!sound._pos) {
                    sound._pos = self2._pos || [0, 0, -0.5];
                  }
                  setupPanner(sound, "spatial");
                }
                if (typeof sound._panner.orientationX !== "undefined") {
                  sound._panner.orientationX.setValueAtTime(x, Howler.ctx.currentTime);
                  sound._panner.orientationY.setValueAtTime(y, Howler.ctx.currentTime);
                  sound._panner.orientationZ.setValueAtTime(z, Howler.ctx.currentTime);
                } else {
                  sound._panner.setOrientation(x, y, z);
                }
              }
              self2._emit("orientation", sound._id);
            } else {
              return sound._orientation;
            }
          }
        }
        return self2;
      };
      Howl.prototype.pannerAttr = function() {
        var self2 = this;
        var args = arguments;
        var o, id, sound;
        if (!self2._webAudio) {
          return self2;
        }
        if (args.length === 0) {
          return self2._pannerAttr;
        } else if (args.length === 1) {
          if (typeof args[0] === "object") {
            o = args[0];
            if (typeof id === "undefined") {
              if (!o.pannerAttr) {
                o.pannerAttr = {
                  coneInnerAngle: o.coneInnerAngle,
                  coneOuterAngle: o.coneOuterAngle,
                  coneOuterGain: o.coneOuterGain,
                  distanceModel: o.distanceModel,
                  maxDistance: o.maxDistance,
                  refDistance: o.refDistance,
                  rolloffFactor: o.rolloffFactor,
                  panningModel: o.panningModel
                };
              }
              self2._pannerAttr = {
                coneInnerAngle: typeof o.pannerAttr.coneInnerAngle !== "undefined" ? o.pannerAttr.coneInnerAngle : self2._coneInnerAngle,
                coneOuterAngle: typeof o.pannerAttr.coneOuterAngle !== "undefined" ? o.pannerAttr.coneOuterAngle : self2._coneOuterAngle,
                coneOuterGain: typeof o.pannerAttr.coneOuterGain !== "undefined" ? o.pannerAttr.coneOuterGain : self2._coneOuterGain,
                distanceModel: typeof o.pannerAttr.distanceModel !== "undefined" ? o.pannerAttr.distanceModel : self2._distanceModel,
                maxDistance: typeof o.pannerAttr.maxDistance !== "undefined" ? o.pannerAttr.maxDistance : self2._maxDistance,
                refDistance: typeof o.pannerAttr.refDistance !== "undefined" ? o.pannerAttr.refDistance : self2._refDistance,
                rolloffFactor: typeof o.pannerAttr.rolloffFactor !== "undefined" ? o.pannerAttr.rolloffFactor : self2._rolloffFactor,
                panningModel: typeof o.pannerAttr.panningModel !== "undefined" ? o.pannerAttr.panningModel : self2._panningModel
              };
            }
          } else {
            sound = self2._soundById(parseInt(args[0], 10));
            return sound ? sound._pannerAttr : self2._pannerAttr;
          }
        } else if (args.length === 2) {
          o = args[0];
          id = parseInt(args[1], 10);
        }
        var ids = self2._getSoundIds(id);
        for (var i = 0; i < ids.length; i++) {
          sound = self2._soundById(ids[i]);
          if (sound) {
            var pa = sound._pannerAttr;
            pa = {
              coneInnerAngle: typeof o.coneInnerAngle !== "undefined" ? o.coneInnerAngle : pa.coneInnerAngle,
              coneOuterAngle: typeof o.coneOuterAngle !== "undefined" ? o.coneOuterAngle : pa.coneOuterAngle,
              coneOuterGain: typeof o.coneOuterGain !== "undefined" ? o.coneOuterGain : pa.coneOuterGain,
              distanceModel: typeof o.distanceModel !== "undefined" ? o.distanceModel : pa.distanceModel,
              maxDistance: typeof o.maxDistance !== "undefined" ? o.maxDistance : pa.maxDistance,
              refDistance: typeof o.refDistance !== "undefined" ? o.refDistance : pa.refDistance,
              rolloffFactor: typeof o.rolloffFactor !== "undefined" ? o.rolloffFactor : pa.rolloffFactor,
              panningModel: typeof o.panningModel !== "undefined" ? o.panningModel : pa.panningModel
            };
            var panner = sound._panner;
            if (!panner) {
              if (!sound._pos) {
                sound._pos = self2._pos || [0, 0, -0.5];
              }
              setupPanner(sound, "spatial");
              panner = sound._panner;
            }
            panner.coneInnerAngle = pa.coneInnerAngle;
            panner.coneOuterAngle = pa.coneOuterAngle;
            panner.coneOuterGain = pa.coneOuterGain;
            panner.distanceModel = pa.distanceModel;
            panner.maxDistance = pa.maxDistance;
            panner.refDistance = pa.refDistance;
            panner.rolloffFactor = pa.rolloffFactor;
            panner.panningModel = pa.panningModel;
          }
        }
        return self2;
      };
      Sound.prototype.init = /* @__PURE__ */ (function(_super) {
        return function() {
          var self2 = this;
          var parent = self2._parent;
          self2._orientation = parent._orientation;
          self2._stereo = parent._stereo;
          self2._pos = parent._pos;
          self2._pannerAttr = parent._pannerAttr;
          _super.call(this);
          if (self2._stereo) {
            parent.stereo(self2._stereo);
          } else if (self2._pos) {
            parent.pos(self2._pos[0], self2._pos[1], self2._pos[2], self2._id);
          }
        };
      })(Sound.prototype.init);
      Sound.prototype.reset = /* @__PURE__ */ (function(_super) {
        return function() {
          var self2 = this;
          var parent = self2._parent;
          self2._orientation = parent._orientation;
          self2._stereo = parent._stereo;
          self2._pos = parent._pos;
          self2._pannerAttr = parent._pannerAttr;
          if (self2._stereo) {
            parent.stereo(self2._stereo);
          } else if (self2._pos) {
            parent.pos(self2._pos[0], self2._pos[1], self2._pos[2], self2._id);
          } else if (self2._panner) {
            self2._panner.disconnect(0);
            self2._panner = void 0;
            parent._refreshBuffer(self2);
          }
          return _super.call(this);
        };
      })(Sound.prototype.reset);
      var setupPanner = function(sound, type) {
        type = type || "spatial";
        if (type === "spatial") {
          sound._panner = Howler.ctx.createPanner();
          sound._panner.coneInnerAngle = sound._pannerAttr.coneInnerAngle;
          sound._panner.coneOuterAngle = sound._pannerAttr.coneOuterAngle;
          sound._panner.coneOuterGain = sound._pannerAttr.coneOuterGain;
          sound._panner.distanceModel = sound._pannerAttr.distanceModel;
          sound._panner.maxDistance = sound._pannerAttr.maxDistance;
          sound._panner.refDistance = sound._pannerAttr.refDistance;
          sound._panner.rolloffFactor = sound._pannerAttr.rolloffFactor;
          sound._panner.panningModel = sound._pannerAttr.panningModel;
          if (typeof sound._panner.positionX !== "undefined") {
            sound._panner.positionX.setValueAtTime(sound._pos[0], Howler.ctx.currentTime);
            sound._panner.positionY.setValueAtTime(sound._pos[1], Howler.ctx.currentTime);
            sound._panner.positionZ.setValueAtTime(sound._pos[2], Howler.ctx.currentTime);
          } else {
            sound._panner.setPosition(sound._pos[0], sound._pos[1], sound._pos[2]);
          }
          if (typeof sound._panner.orientationX !== "undefined") {
            sound._panner.orientationX.setValueAtTime(sound._orientation[0], Howler.ctx.currentTime);
            sound._panner.orientationY.setValueAtTime(sound._orientation[1], Howler.ctx.currentTime);
            sound._panner.orientationZ.setValueAtTime(sound._orientation[2], Howler.ctx.currentTime);
          } else {
            sound._panner.setOrientation(sound._orientation[0], sound._orientation[1], sound._orientation[2]);
          }
        } else {
          sound._panner = Howler.ctx.createStereoPanner();
          sound._panner.pan.setValueAtTime(sound._stereo, Howler.ctx.currentTime);
        }
        sound._panner.connect(sound._node);
        if (!sound._paused) {
          sound._parent.pause(sound._id, true).play(sound._id, true);
        }
      };
    })();
  })(howler);
  return howler;
}
var howlerExports = requireHowler();
const AUDIO_URLS = {
  click: "https://www.soundjay.com/buttons/sounds/button-09.mp3",
  coin: "https://www.soundjay.com/misc/sounds/coin-flip-1.mp3",
  explosion: "https://www.soundjay.com/misc/sounds/explosion-01.mp3",
  music: "https://www.bensound.com/bensound-music/bensound-sunny.mp3",
  // Audio sprite example (multiple sounds in one file)
  sprite: "https://www.soundjay.com/human/sounds/crowd-applause-01.mp3"
};
const sounds = {};
let globalVolume = 0.5;
function createSound(name, options = {}) {
  if (sounds[name]) return sounds[name];
  const defaultOptions = {
    src: [AUDIO_URLS[name]],
    volume: globalVolume,
    html5: true,
    // Force HTML5 Audio for better compatibility
    preload: true,
    onerror: (id, error) => {
      console.error(`🔊 [Audio] Error loading ${name}:`, error);
    }
  };
  sounds[name] = new howlerExports.Howl({ ...defaultOptions, ...options });
  return sounds[name];
}
function playSFX(name) {
  try {
    const sound = createSound(name);
    sound.play();
    console.log(`🔊 [Audio] Playing SFX: ${name}`);
    return true;
  } catch (error) {
    console.error(`❌ [Audio] Failed to play ${name}:`, error.message);
    return false;
  }
}
function playMusic(name = "music") {
  try {
    const sound = createSound(name, {
      loop: true,
      volume: globalVolume * 0.5
      // Music quieter than SFX
    });
    sound.play();
    console.log(`🎵 [Audio] Playing music: ${name} (loop: true)`);
    return true;
  } catch (error) {
    console.error(`❌ [Audio] Failed to play music:`, error.message);
    return false;
  }
}
function stopAll() {
  try {
    Object.values(sounds).forEach((sound) => {
      if (sound.playing()) {
        sound.stop();
      }
    });
    console.log("🔇 [Audio] All sounds stopped");
    return true;
  } catch (error) {
    console.error("❌ [Audio] Failed to stop sounds:", error.message);
    return false;
  }
}
function setVolume(level) {
  globalVolume = Math.max(0, Math.min(1, level));
  Object.values(sounds).forEach((sound) => {
    sound.volume(globalVolume);
  });
  console.log(`🔊 [Audio] Global volume: ${(globalVolume * 100).toFixed(0)}%`);
  return globalVolume;
}
function getVolume() {
  return globalVolume;
}
function toggleMusic(name = "music") {
  try {
    const sound = sounds[name];
    if (!sound) return false;
    if (sound.playing()) {
      sound.pause();
      console.log(`⏸️ [Audio] Paused: ${name}`);
    } else {
      sound.play();
      console.log(`▶️ [Audio] Resumed: ${name}`);
    }
    return true;
  } catch (error) {
    console.error("❌ [Audio] Toggle failed:", error.message);
    return false;
  }
}
function testSprite() {
  try {
    if (!sounds.sprite) {
      sounds.sprite = new howlerExports.Howl({
        src: [AUDIO_URLS.sprite],
        sprite: {
          start: [0, 2e3],
          // 0-2s
          middle: [2e3, 4e3],
          // 2-4s
          end: [4e3, 6e3]
          // 4-6s
        },
        volume: globalVolume,
        html5: true
      });
    }
    sounds.sprite.play("middle");
    console.log("🎵 [Audio] Playing sprite: middle (2-4s)");
    return true;
  } catch (error) {
    console.error("❌ [Audio] Sprite test failed:", error.message);
    return false;
  }
}
function checkAvailability() {
  return {
    available: typeof howlerExports.Howl !== "undefined",
    webAudio: Howler.usingWebAudio,
    html5Audio: !Howler.usingWebAudio,
    code: "audio-test"
  };
}
function cleanup() {
  stopAll();
  Object.keys(sounds).forEach((key) => {
    sounds[key].unload();
    delete sounds[key];
  });
  console.log("🧹 [Audio] All sounds unloaded");
}
const info = {
  name: "Howler.js Audio Test",
  version: "1.0.0",
  description: "Audio playback with Howler.js for Perchance",
  author: "Fahell"
};
const audioTest = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  checkAvailability,
  cleanup,
  getVolume,
  info,
  playMusic,
  playSFX,
  setVolume,
  stopAll,
  testSprite,
  toggleMusic
}, Symbol.toStringTag, { value: "Module" }));
const VERSION = "v1.3.0";
const CDN_BASE = `https://cdn.jsdelivr.net/gh/Fahell/test-perchance-git@${VERSION}`;
const CSS_URL = `${CDN_BASE}/src/styles/ui-test.css`;
function injectStylesheet() {
  if (document.getElementById("ui-test-styles")) return;
  const link = document.createElement("link");
  link.id = "ui-test-styles";
  link.rel = "stylesheet";
  link.href = CSS_URL;
  document.head.appendChild(link);
}
const buttonStatus = /* @__PURE__ */ new Map();
const testResults = [];
function setButtonStatus(btnId, status) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.classList.remove("ui-test-btn--running", "ui-test-btn--success", "ui-test-btn--error");
  const existingStatus = btn.querySelector(".ui-test-btn__status");
  if (existingStatus) existingStatus.remove();
  if (status === "idle") {
    buttonStatus.delete(btnId);
    return;
  }
  btn.classList.add(`ui-test-btn--${status}`);
  buttonStatus.set(btnId, status);
  const statusSpan = document.createElement("span");
  statusSpan.className = "ui-test-btn__status";
  const icons = { running: "⏳", success: "✅", error: "❌" };
  statusSpan.textContent = icons[status] || "";
  btn.appendChild(statusSpan);
}
let logDiv = null;
function formatTime() {
  const now = /* @__PURE__ */ new Date();
  return now.toLocaleTimeString("pt-BR", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
}
function log(message, type = "info") {
  if (!logDiv) return;
  const entry = document.createElement("div");
  entry.className = `log-entry log-entry--${type}`;
  const timeSpan = document.createElement("span");
  timeSpan.className = "log-entry__time";
  timeSpan.textContent = `[${formatTime()}]`;
  const msgSpan = document.createElement("span");
  msgSpan.className = "log-entry__msg";
  msgSpan.textContent = message;
  entry.appendChild(timeSpan);
  entry.appendChild(msgSpan);
  logDiv.appendChild(entry);
  logDiv.scrollTop = logDiv.scrollHeight;
  testResults.push({ time: formatTime(), message, type });
}
async function runTest(btnId, testName, testFn) {
  setButtonStatus(btnId, "running");
  const startTime = Date.now();
  try {
    await testFn();
    setButtonStatus(btnId, "success");
    const duration = Date.now() - startTime;
    testResults[testResults.length - 1].duration = `${duration}ms`;
  } catch {
    setButtonStatus(btnId, "error");
    const duration = Date.now() - startTime;
    testResults[testResults.length - 1].duration = `${duration}ms`;
  }
}
function clearLog() {
  if (!logDiv) return;
  logDiv.innerHTML = "";
  testResults.length = 0;
  buttonStatus.forEach((_, btnId) => setButtonStatus(btnId, "idle"));
  log("🗑 Log limpo", "info");
}
function exportResults() {
  if (testResults.length === 0) {
    log("⚠️ Nenhum resultado para exportar", "warning");
    return;
  }
  const lines = testResults.map((r) => `[${r.time}] [${r.type.toUpperCase()}] ${r.message}${r.duration ? ` (${r.duration})` : ""}`);
  const text = `🧪 Test Results - ${(/* @__PURE__ */ new Date()).toISOString()}
${"=".repeat(50)}
${lines.join("\n")}`;
  navigator.clipboard.writeText(text).then(() => {
    log(`📋 ${testResults.length} resultados copiados!`, "success");
  }).catch(() => {
    log("❌ Falha ao copiar para clipboard", "error");
  });
}
async function runAllTests(testDefs) {
  log("▶ Executando todos os testes...", "info");
  for (const def of testDefs) {
    const btn = document.getElementById(def.btnId);
    if (!btn) continue;
    setButtonStatus(def.btnId, "idle");
  }
  for (const def of testDefs) {
    await runTest(def.btnId, def.name, def.fn);
    await new Promise((r) => setTimeout(r, 300));
  }
  const passed = [...buttonStatus.values()].filter((s) => s === "success").length;
  const failed = [...buttonStatus.values()].filter((s) => s === "error").length;
  log(`🏁 Concluído: ${passed} ✅ | ${failed} ❌`, passed > 0 && failed === 0 ? "success" : "warning");
}
function initUITest(rendererData, testModules) {
  console.log(`🎮 [UI-Test] Criando painel de testes ${VERSION}...`);
  injectStylesheet();
  const capturedSeed = getVar("GAME_SEED", "N/A");
  const capturedRoot = !!root;
  console.log("📸 [UI-Test] Valores capturados:", { seed: capturedSeed, root: capturedRoot });
  const {
    imageTest: imageTest2,
    aiTextTest: aiTextTest2,
    listsTest: listsTest2,
    stateTest: stateTest2,
    raycasterTest: raycasterTest2,
    canvasTest: canvasTest2,
    ttsTest: ttsTest2,
    diceTest: diceTest2,
    rpgIconTest: rpgIconTest2,
    patternTest: patternTest2,
    kvTest: kvTest2,
    seederTest: seederTest2,
    apexchartsTest: apexchartsTest2,
    audioTest: audioTest2
  } = testModules;
  const testDefs = [
    { btnId: "btn-dice", name: "Dice", fn: () => diceHandler() },
    { btnId: "btn-seeder", name: "Seeder", fn: () => seederHandler() },
    { btnId: "btn-pattern", name: "Pattern", fn: () => patternHandler() },
    { btnId: "btn-ai-text", name: "AI Text", fn: () => aiTextHandler() },
    { btnId: "btn-image", name: "Image", fn: () => imageHandler() },
    { btnId: "btn-tts", name: "TTS", fn: () => ttsHandler() },
    { btnId: "btn-3d", name: "Cube Color", fn: () => cubeColorHandler() },
    { btnId: "btn-raycaster", name: "Raycaster", fn: () => raycasterHandler() },
    { btnId: "btn-canvas", name: "Canvas", fn: () => canvasHandler() },
    { btnId: "btn-rpg-icon", name: "RPG Icons", fn: () => rpgIconHandler() },
    { btnId: "btn-lists", name: "Lists", fn: () => listsHandler() },
    { btnId: "btn-bridge", name: "Bridge", fn: () => bridgeHandler() },
    { btnId: "btn-state-save", name: "Save", fn: () => stateSaveHandler() },
    { btnId: "btn-state-load", name: "Load", fn: () => stateLoadHandler() },
    { btnId: "btn-kv", name: "KV", fn: () => kvHandler() },
    { btnId: "btn-chart-bar", name: "Bar Chart", fn: () => chartBarHandler() },
    { btnId: "btn-chart-line", name: "Line Chart", fn: () => chartLineHandler() },
    { btnId: "btn-chart-pie", name: "Pie Chart", fn: () => chartPieHandler() },
    { btnId: "btn-chart-radar", name: "Radar Chart", fn: () => chartRadarHandler() },
    { btnId: "btn-audio-sfx", name: "Audio SFX", fn: () => audioSFXHandler() },
    { btnId: "btn-audio-music", name: "Audio Music", fn: () => audioMusicHandler() },
    { btnId: "btn-audio-sprite", name: "Audio Sprite", fn: () => audioSpriteHandler() },
    { btnId: "btn-audio-volume", name: "Audio Volume", fn: () => audioVolumeHandler() },
    { btnId: "btn-audio-stop", name: "Audio Stop", fn: () => audioStopHandler() }
  ];
  async function diceHandler() {
    log("🎲 Rolando dados...", "info");
    if (!diceTest2 || !diceTest2.available) throw new Error("Plugin not available");
    const d20 = diceTest2.rollD20();
    const d6 = diceTest2.roll3D6();
    log(`✅ 1d20: ${d20.result} | 3d6: ${d6.result}`, "success");
  }
  async function seederHandler() {
    log("🌱 Testando Seeder...", "info");
    if (!seederTest2 || !seederTest2.available) throw new Error("Plugin not available");
    const seed = seederTest2.generateRandomSeed();
    seederTest2.applySeed(seed);
    log(`✅ Seed aplicada: ${seed}`, "success");
  }
  async function patternHandler() {
    log("🎨 Gerando padrão procedural...", "info");
    if (!patternTest2 || !patternTest2.available) throw new Error("Plugin not available");
    const result = patternTest2.generateEmojiPattern();
    if (!result) throw new Error("Pattern generation failed");
    log("✅ Padrão gerado!", "success");
  }
  async function aiTextHandler() {
    log("🤖 Gerando texto com IA...", "info");
    if (!aiTextTest2 || !aiTextTest2.available) throw new Error("Plugin not available");
    const result = await aiTextTest2.generateBasic("Escreva uma frase curta sobre um aventureiro.");
    if (!result || !result.generatedText) throw new Error("Generation failed");
    const preview = result.generatedText.substring(0, 60) + "...";
    log(`✅ AI: "${preview}"`, "success");
  }
  async function imageHandler() {
    log("🖼️ Gerando imagem com IA...", "info");
    if (!imageTest2 || !imageTest2.available) throw new Error("Plugin not available");
    const result = await imageTest2.testBasicImage("papercraft warrior with sword, fantasy art style", 12345);
    if (!result) throw new Error("Generation failed");
    log("✅ Imagem gerada!", "success");
  }
  async function ttsHandler() {
    log("🔊 Testando Text-to-Speech...", "info");
    if (!ttsTest2 || !ttsTest2.available) throw new Error("Plugin not available");
    ttsTest2.speakBasic("Olá! Este é um teste de síntese de voz.");
    log("✅ Fala iniciada!", "success");
  }
  async function cubeColorHandler() {
    log("🎲 Mudando cor do cubo...", "info");
    if (!rendererData || !rendererData.cube || !rendererData.cube.material) throw new Error("Cube not available");
    rendererData.cube.material.color.setHex(Math.random() * 16777215);
    log("✅ Cor do cubo alterada!", "success");
  }
  async function raycasterHandler() {
    var _a;
    log("🖱️ Raycaster: Clique nas esferas!", "info");
    if (!raycasterTest2 || !raycasterTest2.available) throw new Error("Raycaster not available");
    log(`✅ ${((_a = raycasterTest2.spheres) == null ? void 0 : _a.length) || 0} esferas adicionadas`, "success");
  }
  async function canvasHandler() {
    log("🎨 Testando Canvas 2D...", "info");
    if (!canvasTest2) throw new Error("Canvas not available");
    canvasTest2.drawGradient();
    canvasTest2.drawCircles(15);
    canvasTest2.drawText("RPG Paper Craft", 256, 256);
    if (canvasTest2.threeIntegration) canvasTest2.showThreePlane();
    log("✅ Canvas desenhado!", "success");
  }
  async function rpgIconHandler() {
    log("⚔️ Carregando RPG Icons...", "info");
    if (!rpgIconTest2 || !rpgIconTest2.available) throw new Error("Plugin not available");
    const icons = rpgIconTest2.getMultipleIcons(6);
    if (!icons) throw new Error("Icon loading failed");
    log(`✅ ${icons.length} ícones carregados!`, "success");
  }
  async function listsHandler() {
    log("📋 Testando listas...", "info");
    if (!listsTest2) throw new Error("Lists not available");
    const item = listsTest2.testSelectOne("itens");
    const heroes = listsTest2.testSelectUnique("nomes_herois", 2);
    const length = listsTest2.testListLength("nomes_herois");
    log(`✅ Item: "${item}" | Heróis: ${heroes.length} | Tamanho: ${length}`, "success");
  }
  async function bridgeHandler() {
    log(`📡 Seed: ${capturedSeed} | Root: ${capturedRoot}`, "success");
  }
  async function stateSaveHandler() {
    log("💾 Salvando estado...", "info");
    if (!stateTest2) throw new Error("State not available");
    const state = stateTest2.getDefaultState();
    state.player.name = "Herói Testador";
    state.player.level = 5;
    state.world.bioma = "floresta";
    if (!stateTest2.save(state)) throw new Error("Save failed");
    log("✅ Estado salvo!", "success");
  }
  async function stateLoadHandler() {
    log("📂 Carregando estado...", "info");
    if (!stateTest2) throw new Error("State not available");
    const loaded = stateTest2.load();
    if (!loaded) throw new Error("No save found");
    log(`✅ Carregado: ${loaded.player.name} Lv.${loaded.player.level}`, "success");
  }
  async function kvHandler() {
    log("💾 Testando KV Plugin...", "info");
    if (!kvTest2 || !kvTest2.available) throw new Error("Plugin not available");
    const saved = await kvTest2.setSimpleValue("test_key", "test_value");
    if (!saved) throw new Error("KV save failed");
    const retrieved = await kvTest2.getValue("test_key");
    log(`✅ KV: test_key = "${retrieved}"`, "success");
  }
  async function chartBarHandler() {
    log("📊 Renderizando Bar Chart...", "info");
    if (!apexchartsTest2) throw new Error("ApexCharts not available");
    const result = await apexchartsTest2.renderBarChart();
    if (!(result == null ? void 0 : result.success)) throw new Error("Chart render failed");
    log(`✅ Bar Chart: ${result.categories} categorias`, "success");
  }
  async function chartLineHandler() {
    log("📈 Renderizando Line Chart...", "info");
    if (!apexchartsTest2) throw new Error("ApexCharts not available");
    const result = await apexchartsTest2.renderLineChart();
    if (!(result == null ? void 0 : result.success)) throw new Error("Chart render failed");
    log(`✅ Line Chart: ${result.points} pontos`, "success");
  }
  async function chartPieHandler() {
    log("🍩 Renderizando Donut Chart...", "info");
    if (!apexchartsTest2) throw new Error("ApexCharts not available");
    const result = await apexchartsTest2.renderPieChart();
    if (!(result == null ? void 0 : result.success)) throw new Error("Chart render failed");
    log(`✅ Donut Chart: ${result.slices} fatias`, "success");
  }
  async function chartRadarHandler() {
    log("🕸️ Renderizando Radar Chart...", "info");
    if (!apexchartsTest2) throw new Error("ApexCharts not available");
    const result = await apexchartsTest2.renderRadarChart();
    if (!(result == null ? void 0 : result.success)) throw new Error("Chart render failed");
    log(`✅ Radar Chart: ${result.axes} eixos`, "success");
  }
  async function audioSFXHandler() {
    log("🔊 Testando SFX...", "info");
    if (!audioTest2) throw new Error("Audio not available");
    const result = audioTest2.playSFX("click");
    if (!result) throw new Error("SFX failed");
    log("✅ SFX: click", "success");
  }
  async function audioMusicHandler() {
    log("🎵 Testando música com loop...", "info");
    if (!audioTest2) throw new Error("Audio not available");
    const result = audioTest2.playMusic("music");
    if (!result) throw new Error("Music failed");
    log("✅ Música iniciada (loop)", "success");
  }
  async function audioStopHandler() {
    log("🔇 Parando todos os sons...", "info");
    if (!audioTest2) throw new Error("Audio not available");
    const result = audioTest2.stopAll();
    if (!result) throw new Error("Stop failed");
    log("✅ Todos os sons parados", "success");
  }
  async function audioSpriteHandler() {
    log("🎵 Testando audio sprite...", "info");
    if (!audioTest2) throw new Error("Audio not available");
    const result = audioTest2.testSprite();
    if (!result) throw new Error("Sprite failed");
    log("✅ Sprite: middle (2-4s)", "success");
  }
  async function audioVolumeHandler() {
    log("🔊 Testando volume...", "info");
    if (!audioTest2) throw new Error("Audio not available");
    const current = audioTest2.getVolume();
    const newVolume = current > 0.5 ? 0.2 : 0.8;
    audioTest2.setVolume(newVolume);
    log(`✅ Volume: ${(newVolume * 100).toFixed(0)}%`, "success");
  }
  const panel = document.createElement("div");
  panel.id = "ui-test-panel";
  panel.innerHTML = `
    <h3>🧪 Painel de Testes ${VERSION}</h3>
    
    <div class="ui-test-controls">
      <button id="btn-run-all" class="ui-test-btn ui-test-btn--system">▶ Todos</button>
      <button id="btn-clear-log" class="ui-test-btn ui-test-btn--system">🗑 Limpar</button>
      <button id="btn-export" class="ui-test-btn ui-test-btn--system">📋 Exportar</button>
    </div>
    
    <div class="ui-test-category">
      <strong style="color:var(--ui-color-generation)">🎲 Geração & Aleatoriedade</strong>
      <button id="btn-dice" class="ui-test-btn ui-test-btn--generation">🎲 Dice</button>
      <button id="btn-seeder" class="ui-test-btn ui-test-btn--generation">🌱 Seeder</button>
      <button id="btn-pattern" class="ui-test-btn ui-test-btn--generation">🎨 Pattern</button>
    </div>
    
    <div class="ui-test-category">
      <strong style="color:var(--ui-color-ai)">🤖 IA & Conteúdo</strong>
      <button id="btn-ai-text" class="ui-test-btn ui-test-btn--ai">🤖 AI Text</button>
      <button id="btn-image" class="ui-test-btn ui-test-btn--ai">🖼️ Image</button>
      <button id="btn-tts" class="ui-test-btn ui-test-btn--ai">🔊 TTS</button>
      <button id="btn-tts-stop" class="ui-test-btn ui-test-btn--ai">⏹️ Parar</button>
    </div>
    
    <div class="ui-test-category">
      <strong style="color:var(--ui-color-render)">🎨 Renderização</strong>
      <button id="btn-3d" class="ui-test-btn ui-test-btn--render">🎲 Cor Cubo</button>
      <button id="btn-raycaster" class="ui-test-btn ui-test-btn--render">🖱️ Raycaster</button>
      <button id="btn-canvas" class="ui-test-btn ui-test-btn--render">🎨 Canvas</button>
      <button id="btn-rpg-icon" class="ui-test-btn ui-test-btn--render">⚔️ RPG Icons</button>
    </div>
    
    <div class="ui-test-category">
      <strong style="color:var(--ui-color-viz)">📊 Visualização</strong>
      <button id="btn-chart-bar" class="ui-test-btn ui-test-btn--viz">📊 Bar</button>
      <button id="btn-chart-line" class="ui-test-btn ui-test-btn--viz">📈 Line</button>
      <button id="btn-chart-pie" class="ui-test-btn ui-test-btn--viz">🍩 Donut</button>
      <button id="btn-chart-radar" class="ui-test-btn ui-test-btn--viz">🕸️ Radar</button>
    </div>
    
    <div class="ui-test-category">
      <strong style="color:#ff6b9d">🔊 Áudio</strong>
      <button id="btn-audio-sfx" class="ui-test-btn ui-test-btn--audio">🔊 SFX</button>
      <button id="btn-audio-music" class="ui-test-btn ui-test-btn--audio">🎵 Music</button>
      <button id="btn-audio-sprite" class="ui-test-btn ui-test-btn--audio">🎵 Sprite</button>
      <button id="btn-audio-volume" class="ui-test-btn ui-test-btn--audio">🔊 Volume</button>
      <button id="btn-audio-stop" class="ui-test-btn ui-test-btn--audio">🔇 Stop</button>
    </div>
    
    <div class="ui-test-category">
      <strong style="color:var(--ui-color-data)">💾 Dados & Estado</strong>
      <button id="btn-lists" class="ui-test-btn ui-test-btn--data">📋 Listas</button>
      <button id="btn-bridge" class="ui-test-btn ui-test-btn--data">🔗 Bridge</button>
      <button id="btn-state-save" class="ui-test-btn ui-test-btn--data">💾 Save</button>
      <button id="btn-state-load" class="ui-test-btn ui-test-btn--data">📂 Load</button>
      <button id="btn-kv" class="ui-test-btn ui-test-btn--data">💾 KV</button>
    </div>
    
    <div id="test-log">Aguardando interação...</div>
  `;
  document.body.appendChild(panel);
  console.log("📎 [UI-Test] Painel anexado ao document.body");
  const rect = panel.getBoundingClientRect();
  console.log(`📐 [UI-Test] Painel visível: ${rect.width}x${rect.height}px em (${rect.left}, ${rect.top})`);
  logDiv = document.getElementById("test-log");
  document.getElementById("btn-run-all").onclick = () => runAllTests(testDefs);
  document.getElementById("btn-clear-log").onclick = clearLog;
  document.getElementById("btn-export").onclick = exportResults;
  document.getElementById("btn-dice").onclick = () => runTest("btn-dice", "Dice", diceHandler);
  document.getElementById("btn-seeder").onclick = () => runTest("btn-seeder", "Seeder", seederHandler);
  document.getElementById("btn-pattern").onclick = () => runTest("btn-pattern", "Pattern", patternHandler);
  document.getElementById("btn-ai-text").onclick = () => runTest("btn-ai-text", "AI Text", aiTextHandler);
  document.getElementById("btn-image").onclick = () => runTest("btn-image", "Image", imageHandler);
  document.getElementById("btn-tts").onclick = () => runTest("btn-tts", "TTS", ttsHandler);
  document.getElementById("btn-tts-stop").onclick = () => runTest("btn-tts-stop", "TTS Stop", () => {
    log("⏹️ Parando fala...", "info");
    if (!ttsTest2) throw new Error("TTS not available");
    if (!ttsTest2.stopSpeech()) throw new Error("Stop not available");
    log("✅ Fala parada", "success");
  });
  document.getElementById("btn-3d").onclick = () => runTest("btn-3d", "Cube Color", cubeColorHandler);
  document.getElementById("btn-raycaster").onclick = () => runTest("btn-raycaster", "Raycaster", raycasterHandler);
  document.getElementById("btn-canvas").onclick = () => runTest("btn-canvas", "Canvas", canvasHandler);
  document.getElementById("btn-rpg-icon").onclick = () => runTest("btn-rpg-icon", "RPG Icons", rpgIconHandler);
  document.getElementById("btn-lists").onclick = () => runTest("btn-lists", "Lists", listsHandler);
  document.getElementById("btn-bridge").onclick = () => runTest("btn-bridge", "Bridge", bridgeHandler);
  document.getElementById("btn-state-save").onclick = () => runTest("btn-state-save", "Save", stateSaveHandler);
  document.getElementById("btn-state-load").onclick = () => runTest("btn-state-load", "Load", stateLoadHandler);
  document.getElementById("btn-kv").onclick = () => runTest("btn-kv", "KV", kvHandler);
  document.getElementById("btn-chart-bar").onclick = () => runTest("btn-chart-bar", "Bar Chart", chartBarHandler);
  document.getElementById("btn-chart-line").onclick = () => runTest("btn-chart-line", "Line Chart", chartLineHandler);
  document.getElementById("btn-chart-pie").onclick = () => runTest("btn-chart-pie", "Pie Chart", chartPieHandler);
  document.getElementById("btn-chart-radar").onclick = () => runTest("btn-chart-radar", "Radar Chart", chartRadarHandler);
  document.getElementById("btn-audio-sfx").onclick = () => runTest("btn-audio-sfx", "Audio SFX", audioSFXHandler);
  document.getElementById("btn-audio-music").onclick = () => runTest("btn-audio-music", "Audio Music", audioMusicHandler);
  document.getElementById("btn-audio-sprite").onclick = () => runTest("btn-audio-sprite", "Audio Sprite", audioSpriteHandler);
  document.getElementById("btn-audio-volume").onclick = () => runTest("btn-audio-volume", "Audio Volume", audioVolumeHandler);
  document.getElementById("btn-audio-stop").onclick = () => runTest("btn-audio-stop", "Audio Stop", audioStopHandler);
  console.log(`✅ [UI-Test] Painel de testes ${VERSION} criado com controles globais.`);
}
const uiTest = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  initUITest
}, Symbol.toStringTag, { value: "Module" }));
export {
  initGame
};
//# sourceMappingURL=main.bundle.js.map
