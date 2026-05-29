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
const VERSION = "v1.11.2";
const CDN_BASE = `https://cdn.jsdelivr.net/gh/Fahell/test-perchance-git@v1.11.2`;
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
  const geometry2 = new THREE.BoxGeometry(1, 1, 1);
  const material2 = new THREE.MeshStandardMaterial({ color: 3900150 });
  const cube = new THREE.Mesh(geometry2, material2);
  scene.add(cube);
  const updateCallbacks = [];
  let lastTime = performance.now();
  const animate = () => {
    requestAnimationFrame(animate);
    const now = performance.now();
    const deltaTime = (now - lastTime) / 1e3;
    lastTime = now;
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    for (const callback of updateCallbacks) {
      try {
        callback(deltaTime);
      } catch (e) {
        console.error("[Renderer] Update callback error:", e.message);
      }
    }
    renderer.render(scene, camera);
  };
  animate();
  console.log("🎨 [Renderer] Three.js inicializado com sucesso!");
  return {
    scene,
    camera,
    renderer,
    cube,
    onUpdate: (callback) => {
      if (typeof callback === "function") {
        updateCallbacks.push(callback);
      }
    },
    removeUpdateCallback: (callback) => {
      const index = updateCallbacks.indexOf(callback);
      if (index > -1) updateCallbacks.splice(index, 1);
    }
  };
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
const CSS_URL$1 = `${CDN_BASE}/src/styles/output-area.css`;
let outputArea = null;
let visualSlot = null;
let textSlot = null;
function injectStylesheet$1() {
  if (document.getElementById("output-area-styles")) return;
  const link = document.createElement("link");
  link.id = "output-area-styles";
  link.rel = "stylesheet";
  link.href = CSS_URL$1;
  document.head.appendChild(link);
}
function createOutputArea() {
  if (outputArea) return;
  outputArea = document.createElement("div");
  outputArea.id = "output-area";
  const header = document.createElement("div");
  header.className = "output-area__header";
  header.innerHTML = `
    <span class="output-area__title">📊 Output</span>
    <button class="output-area__clear" title="Clear all">🗑️</button>
  `;
  header.querySelector(".output-area__clear").onclick = () => clearAll();
  visualSlot = document.createElement("div");
  visualSlot.className = "output-area__slot output-area__slot--visual";
  visualSlot.innerHTML = '<span class="output-area__placeholder">Visual results will appear here</span>';
  textSlot = document.createElement("div");
  textSlot.className = "output-area__slot output-area__slot--text";
  textSlot.innerHTML = '<span class="output-area__placeholder">Text results will appear here</span>';
  outputArea.appendChild(header);
  outputArea.appendChild(visualSlot);
  outputArea.appendChild(textSlot);
  document.body.appendChild(outputArea);
}
function showVisual(content, title) {
  if (!outputArea) createOutputArea();
  const wrapper = document.createElement("div");
  wrapper.className = "output-area__visual-wrapper";
  if (title) {
    const titleEl = document.createElement("div");
    titleEl.className = "output-area__visual-title";
    titleEl.textContent = title;
    wrapper.appendChild(titleEl);
  }
  if (typeof content === "string") {
    wrapper.innerHTML += content;
  } else {
    wrapper.appendChild(content);
  }
  visualSlot.innerHTML = "";
  visualSlot.appendChild(wrapper);
}
function showText(html) {
  if (!outputArea) createOutputArea();
  const wrapper = document.createElement("div");
  wrapper.className = "output-area__text-wrapper";
  wrapper.innerHTML = html;
  textSlot.innerHTML = "";
  textSlot.appendChild(wrapper);
}
function clearVisual() {
  if (visualSlot) {
    visualSlot.innerHTML = '<span class="output-area__placeholder">Visual results will appear here</span>';
  }
}
function clearText() {
  if (textSlot) {
    textSlot.innerHTML = '<span class="output-area__placeholder">Text results will appear here</span>';
  }
}
function clearAll() {
  clearVisual();
  clearText();
}
function initOutputArea() {
  injectStylesheet$1();
  createOutputArea();
  console.log("📊 [OutputArea] Initialized");
}
(() => {
  const originalLog = console.log.bind(console);
  console.log = (...args) => {
    if (args.length === 1 && typeof args[0] === "object" && args[0] !== null) {
      const keys = Object.keys(args[0]);
      if (keys.length === 1 && keys[0] === "isTrusted" && args[0].isTrusted === true) {
        return;
      }
    }
    originalLog(...args);
  };
})();
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
  audioTest: () => Promise.resolve().then(() => audioTest),
  mermaidTest: () => Promise.resolve().then(() => mermaidTest$1),
  matterTest: () => Promise.resolve().then(() => matterTest),
  cannonTest: () => Promise.resolve().then(() => cannonTest),
  particlesTest: () => Promise.resolve().then(() => particlesTest)
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
    console.warn("⏯️ Jogo já inicializado. Ignorando execução duplicada.");
    return;
  }
  window.GAME_INITIALIZED = true;
  console.log("🔍 [Main] initGame() chamado. Verificando estado...");
  try {
    console.log(`🚀 [Main] Iniciando jogo (Vite bundle ${VERSION})`);
    const { root: root2, getVar: getVar2, getList: getList2 } = bridgeMod;
    console.log("🎨 [Main] Chamando initRenderer...");
    const rendererData = initRenderer(document.getElementById("game-container"));
    const seed = getVar2("GAME_SEED", 999);
    const bioma = getList2("biomas", ["planície"]).selectOne;
    initLogic(seed, bioma);
    console.log("📊 [Main] Inicializando OutputArea...");
    initOutputArea();
    const testModules = await loadAllTestModules();
    console.log("📊 [Main] Starting Mermaid background preload...");
    const mermaidModule = await TEST_MODULES.mermaidTest();
    if (mermaidModule && mermaidModule.mermaidTest && mermaidModule.mermaidTest.preloadMermaid) {
      mermaidModule.mermaidTest.preloadMermaid();
    }
    console.log("⚛️ [Main] Starting Matter.js background preload...");
    const matterModule = await TEST_MODULES.matterTest();
    if (matterModule && matterModule.matterTest && matterModule.matterTest.preloadMatter) {
      matterModule.matterTest.preloadMatter();
    }
    console.log("💣 [Main] Starting Cannon-es background preload...");
    const cannonModule2 = await TEST_MODULES.cannonTest();
    if (cannonModule2 && cannonModule2.cannonTest && cannonModule2.cannonTest.preloadCannon) {
      cannonModule2.cannonTest.preloadCannon();
    }
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
console.log(`📦 [Main] main.js carregado (Vite bundle ${VERSION}). Aguardando initGame()...`);
const imageTest = {
  available: !!root.image,
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
  // Teste 1: Geração básica com seed fixa
  async testBasicImage() {
    console.log("🖼️ [Image] Gerando imagem básica com seed fixa...");
    showText("⏳ Gerando imagem...");
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
        const imgHtml = `
          <img src="${imageUrl}" style="
            max-width: 100%;
            max-height: 300px;
            object-fit: contain;
            image-rendering: pixelated;
            border-radius: 4px;
          " />
        `;
        showVisual(imgHtml, "🖼️ Imagem Gerada");
        const infoHtml = `
          <strong>✅ Seed:</strong> 12345<br>
          <strong>📐 Resolução:</strong> 512x512<br>
          <strong>📏 Tamanho:</strong> ${(imageUrl.length / 1024).toFixed(1)}KB
        `;
        showText(infoHtml);
        return { success: true, url: imageUrl, seed: 12345 };
      } else {
        throw new Error("Não foi possível extrair URL da imagem");
      }
    } catch (error) {
      console.error("❌ [Image] Falha na geração:", error.message);
      showText(`<span style="color: #ff6b6b;">❌ Erro: ${error.message}</span>`);
      return { success: false, error: error.message };
    }
  },
  // Teste 2: Remove background (fundo transparente)
  async testRemoveBackground() {
    console.log("🖼️ [Image] Testando removeBackground...");
    showText("⏳ Gerando imagem sem fundo...");
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
        const imgHtml = `
          <div style="
            background: 
              linear-gradient(45deg, #333 25%, transparent 25%),
              linear-gradient(-45deg, #333 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, #333 75%),
              linear-gradient(-45deg, transparent 75%, #333 75%);
            background-size: 20px 20px;
            background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
            padding: 10px;
            border-radius: 4px;
            display: inline-block;
          ">
            <img src="${imageUrl}" style="
              max-width: 100%;
              max-height: 300px;
              object-fit: contain;
              image-rendering: pixelated;
            " />
          </div>
        `;
        showVisual(imgHtml, "🔍 Imagem Sem Fundo");
        const infoHtml = `
          <strong>✅ Seed:</strong> 54321<br>
          <strong>🔍 RemoveBackground:</strong> true<br>
          <strong>🎨 Fundo:</strong> transparente (quadriculado)
        `;
        showText(infoHtml);
        return { success: true, url: imageUrl, transparent: true };
      } else {
        throw new Error("Não foi possível extrair URL da imagem");
      }
    } catch (error) {
      console.error("❌ [Image] Falha:", error.message);
      showText(`<span style="color: #ff6b6b;">❌ Erro: ${error.message}</span>`);
      return { success: false, error: error.message };
    }
  },
  // Teste 3: Comparação de seeds diferentes
  async testSeedComparison() {
    console.log("🖼️ [Image] Comparando seeds diferentes...");
    showText("⏳ Gerando 2 imagens com seeds diferentes...");
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
        const imgHtml = `
          <div style="display: flex; gap: 10px; align-items: center; justify-content: center;">
            <div style="text-align: center;">
              <img src="${url1}" style="
                width: 150px;
                height: 150px;
                object-fit: contain;
                border: 2px solid #4ade80;
                border-radius: 4px;
              " />
              <div style="color: #4ade80; font-size: 11px; margin-top: 5px;">Seed: ${seed1}</div>
            </div>
            <div style="color: #888; font-size: 20px;">vs</div>
            <div style="text-align: center;">
              <img src="${url2}" style="
                width: 150px;
                height: 150px;
                object-fit: contain;
                border: 2px solid #4ade80;
                border-radius: 4px;
              " />
              <div style="color: #4ade80; font-size: 11px; margin-top: 5px;">Seed: ${seed2}</div>
            </div>
          </div>
        `;
        showVisual(imgHtml, "🎲 Comparação de Seeds");
        const infoHtml = `
          <strong>✅ Mesma prompt,</strong> seeds diferentes<br>
          <strong>📐 Resolução:</strong> 256x256 cada
        `;
        showText(infoHtml);
        return { success: true, images: [url1, url2], seeds: [seed1, seed2] };
      } else {
        throw new Error("Falha ao gerar uma ou ambas imagens");
      }
    } catch (error) {
      console.error("❌ [Image] Falha na comparação:", error.message);
      showText(`<span style="color: #ff6b6b;">❌ Erro: ${error.message}</span>`);
      return { success: false, error: error.message };
    }
  },
  // Teste 4: Diferentes resoluções
  async testResolution() {
    console.log("🖼️ [Image] Testando resolução customizada...");
    showText("⏳ Gerando imagem 768x384...");
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
        const imgHtml = `
          <img src="${imageUrl}" style="
            max-width: 100%;
            max-height: 300px;
            object-fit: contain;
            image-rendering: pixelated;
            border-radius: 4px;
          " />
        `;
        showVisual(imgHtml, "📐 Resolução Customizada");
        const infoHtml = `
          <strong>✅ Seed:</strong> 77777<br>
          <strong>📐 Resolução:</strong> 768x384 (16:9)<br>
          <strong>🎨 Formato:</strong> wide/landscape
        `;
        showText(infoHtml);
        return { success: true, url: imageUrl, resolution: "768x384" };
      } else {
        throw new Error("Não foi possível extrair URL da imagem");
      }
    } catch (error) {
      console.error("❌ [Image] Falha:", error.message);
      showText(`<span style="color: #ff6b6b;">❌ Erro: ${error.message}</span>`);
      return { success: false, error: error.message };
    }
  },
  // Limpa o conteúdo visual
  clear() {
    clearVisual();
    console.log("🗑️ [Image] Preview de imagem limpo");
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
      const geometry2 = new THREE.SphereGeometry(0.5, 16, 16);
      const material2 = new THREE.MeshStandardMaterial({
        color: colors[i],
        roughness: 0.3,
        metalness: 0.7
      });
      const sphere = new THREE.Mesh(geometry2, material2);
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
  init(rendererData) {
    console.log("🎨 [Canvas] Initializing Canvas 2D test...");
    this.canvas2D = document.createElement("canvas");
    this.canvas2D.width = 512;
    this.canvas2D.height = 512;
    this.canvas2D.style.cssText = "border-radius: 4px; width: 100%; height: auto; max-width: 512px;";
    this.ctx = this.canvas2D.getContext("2d");
    showVisual(this.canvas2D, "🎨 Canvas 2D");
    showText("<strong>Status:</strong> Canvas initialized (512x512)");
    console.log("✅ [Canvas] Canvas 2D created (512x512)");
    if (rendererData && rendererData.scene) {
      console.log("🎨 [Canvas] Integrating with Three.js...");
      const texture = new THREE.CanvasTexture(this.canvas2D);
      texture.needsUpdate = true;
      const geometry2 = new THREE.PlaneGeometry(4, 4);
      const material2 = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide,
        transparent: true
      });
      const plane = new THREE.Mesh(geometry2, material2);
      plane.position.set(0, 0, -5);
      plane.visible = false;
      rendererData.scene.add(plane);
      this.threeIntegration = {
        plane,
        texture,
        show: () => {
          plane.visible = true;
          texture.needsUpdate = true;
          console.log("🎨 [Canvas] 3D plane visible");
        },
        hide: () => {
          plane.visible = false;
          console.log("🎨 [Canvas] 3D plane hidden");
        },
        update: () => {
          texture.needsUpdate = true;
          console.log("🎨 [Canvas] Texture updated");
        }
      };
      console.log("✅ [Canvas] Three.js integration complete");
    }
  },
  drawGradient() {
    if (!this.ctx) return;
    const gradient = this.ctx.createLinearGradient(0, 0, 512, 512);
    gradient.addColorStop(0, "#667eea");
    gradient.addColorStop(1, "#764ba2");
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, 512, 512);
    console.log("🎨 [Canvas] Gradient drawn");
    if (this.threeIntegration) this.threeIntegration.update();
    showText("<strong>Operation:</strong> Gradient<br><strong>Colors:</strong> #667eea → #764ba2");
  },
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
    console.log(`🎨 [Canvas] ${count} circles drawn`);
    if (this.threeIntegration) this.threeIntegration.update();
    showText(`<strong>Operation:</strong> Circles<br><strong>Count:</strong> ${count}`);
  },
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
    console.log(`🎨 [Canvas] Text "${text}" drawn`);
    if (this.threeIntegration) this.threeIntegration.update();
    showText(`<strong>Operation:</strong> Text<br><strong>Content:</strong> "${text}"<br><strong>Position:</strong> (${x}, ${y})`);
  },
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
    console.log(`🎨 [Canvas] Fog-of-war drawn at (${revealX}, ${revealY})`);
    if (this.threeIntegration) this.threeIntegration.update();
    showText(`<strong>Operation:</strong> Fog of War<br><strong>Center:</strong> (${revealX}, ${revealY})<br><strong>Radius:</strong> ${revealRadius}px`);
  },
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
    console.log(`🎨 [Canvas] Grid drawn (cells of ${cellSize}px)`);
    if (this.threeIntegration) this.threeIntegration.update();
    showText(`<strong>Operation:</strong> Grid<br><strong>Cell Size:</strong> ${cellSize}px<br><strong>Cells:</strong> ${Math.floor(512 / cellSize)}x${Math.floor(512 / cellSize)}`);
  },
  showThreePlane() {
    if (this.threeIntegration) {
      this.threeIntegration.show();
    }
  },
  hideThreePlane() {
    if (this.threeIntegration) {
      this.threeIntegration.hide();
    }
  },
  cleanup() {
    clearVisual();
    clearText();
    if (this.threeIntegration && this.threeIntegration.plane) {
      this.threeIntegration.plane.parent.remove(this.threeIntegration.plane);
    }
    this.canvas2D = null;
    this.ctx = null;
    this.threeIntegration = null;
    console.log("🗑️ [Canvas] Canvas and resources cleaned up");
  }
};
console.log("🎨 [Canvas] Canvas 2D test module loaded");
const canvasTest$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  canvasTest
}, Symbol.toStringTag, { value: "Module" }));
if (typeof window.speechSynthesis === "undefined") {
  window.speechSynthesis = {
    getVoices: () => [],
    speak: () => {
    },
    cancel: () => {
    },
    pause: () => {
    },
    resume: () => {
    },
    pending: false,
    speaking: false,
    paused: false
  };
}
const isSpeechSynthesisSupported = () => typeof window.speechSynthesis !== "undefined";
const ttsTest = {
  available: !!root.speak,
  speechApiSupported: isSpeechSynthesisSupported(),
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
      if (isSpeechSynthesisSupported()) {
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
  getAvailableVoices() {
    if (!isSpeechSynthesisSupported()) {
      console.warn("⚠️ [TTS] Web Speech API não disponível neste contexto (cross-origin iframe)");
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
  speakWithVoice(text = "Testando voz específica.", voiceName = null) {
    if (!isSpeechSynthesisSupported()) {
      console.warn("⚠️ [TTS] Web Speech API não disponível neste contexto (cross-origin iframe)");
      if (this.available) {
        console.log("🔊 [TTS] Fallback: usando plugin Perchance sem voz específica");
        return this.speakBasic(text);
      }
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
  checkAPI() {
    console.log("🔊 [TTS] Verificando API do plugin...");
    console.log("   root.speak disponível:", !!root.speak);
    console.log("   Tipo:", typeof root.speak);
    if (typeof root.speak === "function") {
      console.log("   ✅ Plugin Perchance disponível");
      console.log('   Uso: root.speak("texto")');
    }
    console.log("   Web Speech API:", isSpeechSynthesisSupported() ? "✅ Disponível (polyfill)" : "❌ Não disponível");
    if (isSpeechSynthesisSupported()) {
      setTimeout(() => {
        const voices = window.speechSynthesis.getVoices();
        console.log(`   Vozes carregadas: ${voices.length}`);
      }, 100);
    } else {
      console.log("   ℹ️ [TTS] Apenas o plugin Perchance (root.speak) será utilizado");
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
  if (isSpeechSynthesisSupported()) {
    console.log("   ℹ️ Web Speech API nativa disponível como fallback");
  } else {
    console.warn("   ❌ Nenhum método de TTS disponível neste contexto");
  }
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
const AUDIO_BASE = `https://cdn.jsdelivr.net/gh/Fahell/test-perchance-git@${VERSION}/assets/audio`;
const AUDIO_URLS = {
  click: `${AUDIO_BASE}/click.wav`,
  coin: `${AUDIO_BASE}/coin.wav`,
  explosion: `${AUDIO_BASE}/explosion.wav`,
  music: `${AUDIO_BASE}/music.wav`,
  sprite: `${AUDIO_BASE}/music.wav`
  // Using music as sprite example
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
      console.error(`   URL: ${AUDIO_URLS[name]}`);
    },
    onload: () => {
      console.log(`✅ [Audio] Loaded: ${name}`);
    },
    onplay: () => {
      console.log(`▶️ [Audio] Playing: ${name}`);
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
        html5: true,
        onload: () => console.log("✅ [Audio] Sprite loaded"),
        onerror: (id, error) => console.error("❌ [Audio] Sprite error:", error)
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
function cleanup$3() {
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
  cleanup: cleanup$3,
  getVolume,
  info,
  playMusic,
  playSFX,
  setVolume,
  stopAll,
  testSprite,
  toggleMusic
}, Symbol.toStringTag, { value: "Module" }));
const MERMAID_CDN_URL = "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js";
let mermaidPromise = null;
let mermaidReady = false;
let mermaidInstance = null;
function preloadMermaid() {
  if (mermaidPromise) {
    return mermaidPromise;
  }
  mermaidPromise = new Promise((resolve, reject) => {
    console.log(`📊 [Mermaid] Starting background load from CDN...`);
    if (window.mermaid) {
      mermaidReady = true;
      mermaidInstance = window.mermaid;
      console.log(`✅ [Mermaid] Already loaded in window`);
      resolve(window.mermaid);
      return;
    }
    const script = document.createElement("script");
    script.src = MERMAID_CDN_URL;
    script.async = true;
    script.onload = () => {
      mermaidReady = true;
      mermaidInstance = window.mermaid;
      mermaidInstance.initialize({
        startOnLoad: false,
        theme: "dark",
        securityLevel: "loose",
        fontFamily: "inherit",
        flowchart: {
          useMaxWidth: true,
          htmlLabels: true
        }
      });
      console.log(`✅ [Mermaid] Loaded from CDN (${VERSION})`);
      resolve(mermaidInstance);
    };
    script.onerror = () => {
      const error = new Error("Failed to load Mermaid from CDN");
      console.error(`❌ [Mermaid] ${error.message}`);
      reject(error);
    };
    document.head.appendChild(script);
  });
  return mermaidPromise;
}
async function getMermaid() {
  if (mermaidReady && mermaidInstance) {
    return mermaidInstance;
  }
  if (!mermaidPromise) {
    preloadMermaid();
  }
  console.log(`⏳ [Mermaid] Waiting for load to complete...`);
  return await mermaidPromise;
}
function isReady$2() {
  return mermaidReady;
}
function isLoading$2() {
  return mermaidPromise !== null && !mermaidReady;
}
const DIAGRAMS = {
  flowchart: `graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> B
    C --> E[End]`,
  sequence: `sequenceDiagram
    participant User
    participant Perchance
    participant CDN
    
    User->>Perchance: Load Game
    Perchance->>CDN: Fetch Bundle
    CDN-->>Perchance: main.bundle.js
    Perchance->>Perchance: initGame()
    Perchance-->>User: Game Ready`,
  pie: `pie title Project Structure
    "Modules" : 60
    "Styles" : 15
    "Assets" : 20
    "Config" : 5`,
  class: `classDiagram
    class Game {
      +init()
      +update()
      +render()
    }
    class Renderer {
      +scene
      +camera
      +render()
    }
    class Logic {
      +seed
      +biome
      +update()
    }
    Game --> Renderer
    Game --> Logic`,
  state: `stateDiagram-v2
    [*] --> Loading
    Loading --> Ready: Assets Loaded
    Ready --> Playing: Start Game
    Playing --> Paused: Pause
    Paused --> Playing: Resume
    Playing --> [*]: Quit`
};
async function renderDiagram(type, container2) {
  var _a;
  try {
    const mermaid = await getMermaid();
    const diagramCode = DIAGRAMS[type];
    if (!diagramCode) {
      throw new Error(`Unknown diagram type: ${type}`);
    }
    const diagramContainer = document.createElement("div");
    diagramContainer.className = "mermaid-diagram";
    diagramContainer.innerHTML = `
      <h4 class="mermaid-title">${type.charAt(0).toUpperCase() + type.slice(1)} Diagram</h4>
      <div class="mermaid-render"></div>
    `;
    container2.appendChild(diagramContainer);
    const renderId = `mermaid-${type}-${Date.now()}`;
    console.log(`🔍 [Mermaid] Rendering ${type} with ID: ${renderId}`);
    const result = await mermaid.render(renderId, diagramCode);
    console.log(`🔍 [Mermaid] Render result:`, { hasSvg: !!result.svg, svgLength: (_a = result.svg) == null ? void 0 : _a.length });
    const { svg } = result;
    const renderDiv = diagramContainer.querySelector(".mermaid-render");
    if (renderDiv) {
      renderDiv.innerHTML = svg;
      console.log(`🔍 [Mermaid] SVG inserted, innerHTML length:`, renderDiv.innerHTML.length);
    } else {
      console.error(`❌ [Mermaid] renderDiv not found!`);
    }
    console.log(`✅ [Mermaid] Rendered ${type} diagram`);
    console.log(`✅ [Mermaid] Rendered ${type} diagram`);
    return true;
  } catch (error) {
    console.error(`❌ [Mermaid] Failed to render ${type}:`, error.message);
    const errorDiv = document.createElement("div");
    errorDiv.className = "mermaid-error";
    errorDiv.innerHTML = `
      <strong>❌ Error rendering ${type}:</strong><br>
      ${error.message}
    `;
    container2.appendChild(errorDiv);
    return false;
  }
}
async function renderAllExamples(container2) {
  console.log(`📊 [Mermaid] Rendering all example diagrams...`);
  const results = {};
  const types = Object.keys(DIAGRAMS);
  for (const type of types) {
    results[type] = await renderDiagram(type, container2);
  }
  const successCount = Object.values(results).filter(Boolean).length;
  console.log(`✅ [Mermaid] Rendered ${successCount}/${types.length} diagrams`);
  return results;
}
async function setTheme(themeName) {
  const mermaid = await getMermaid();
  mermaid.initialize({
    startOnLoad: false,
    theme: themeName,
    securityLevel: "loose",
    fontFamily: "inherit"
  });
  console.log(`🎨 [Mermaid] Theme changed to: ${themeName}`);
}
function cleanup$2() {
  console.log(`🧹 [Mermaid] Cleanup (note: CDN script remains in DOM for reuse)`);
}
const mermaidTest = {
  preloadMermaid,
  getMermaid,
  isReady: isReady$2,
  isLoading: isLoading$2,
  renderDiagram,
  renderAllExamples,
  setTheme,
  cleanup: cleanup$2,
  DIAGRAMS
};
const mermaidTest$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  cleanup: cleanup$2,
  isLoading: isLoading$2,
  isReady: isReady$2,
  mermaidTest,
  renderAllExamples,
  renderDiagram,
  setTheme
}, Symbol.toStringTag, { value: "Module" }));
let matterPromise = null;
let matterReady = false;
let engine = null;
let render = null;
let runner = null;
let matterContainer = null;
let canvasContainer$1 = null;
let ballCount = 0;
function preloadMatter() {
  if (matterPromise) return;
  matterPromise = new Promise((resolve, reject) => {
    console.log("⚛️ [Matter] Starting background load from CDN...");
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/matter-js@0.20.0/build/matter.min.js";
    script.onload = () => {
      matterReady = true;
      console.log(`✅ [Matter] Loaded from CDN (${VERSION})`);
      resolve(window.Matter);
    };
    script.onerror = () => {
      console.error("❌ [Matter] Failed to load from CDN");
      reject(new Error("Failed to load Matter.js"));
    };
    document.head.appendChild(script);
  });
}
function isReady$1() {
  return matterReady;
}
function isLoading$1() {
  return matterPromise !== null && !matterReady;
}
async function getMatter() {
  if (matterReady) {
    return window.Matter;
  }
  if (!matterPromise) {
    preloadMatter();
  }
  console.log("⏳ [Matter] Waiting for load to complete...");
  return await matterPromise;
}
function createPhysicsContainer() {
  matterContainer = document.createElement("div");
  matterContainer.id = "matter-physics";
  matterContainer.className = "matter-container";
  matterContainer.innerHTML = `
    <button class="matter-close-btn" id="matter-close">✕</button>
    <h3 class="matter-title">⚛️ Matter.js Physics Test</h3>
    <div class="matter-controls">
      <button id="btn-add-balls" class="matter-btn matter-btn--add">Adicionar 10 Bolas</button>
      <button id="btn-reset" class="matter-btn matter-btn--reset">Reset</button>
      <button id="btn-gravity" class="matter-btn matter-btn--gravity">Toggle Gravity</button>
    </div>
    <div id="matter-canvas" class="matter-canvas"></div>
    <div class="matter-info">
      <span id="ball-counter">Bolas: 0</span>
      <span>Clique no canvas para adicionar bolas</span>
    </div>
  `;
  document.body.appendChild(matterContainer);
  canvasContainer$1 = document.getElementById("matter-canvas");
  document.getElementById("matter-close").addEventListener("click", cleanup$1);
  document.getElementById("btn-add-balls").addEventListener("click", () => addBalls(10));
  document.getElementById("btn-reset").addEventListener("click", resetSimulation$1);
  document.getElementById("btn-gravity").addEventListener("click", toggleGravity$1);
  canvasContainer$1.addEventListener("click", (e) => {
    const rect = canvasContainer$1.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    addBall(x, y);
  });
}
async function initPhysics() {
  try {
    const Matter2 = await getMatter();
    createPhysicsContainer();
    engine = Matter2.Engine.create();
    engine.world.gravity.y = 1;
    render = Matter2.Render.create({
      element: canvasContainer$1,
      engine,
      options: {
        width: 800,
        height: 600,
        wireframes: false,
        background: "#1a1a1a",
        pixelRatio: window.devicePixelRatio || 1
      }
    });
    const ground = Matter2.Bodies.rectangle(400, 590, 810, 20, {
      isStatic: true,
      render: { fillStyle: "#4a4a4a" }
    });
    const leftWall = Matter2.Bodies.rectangle(0, 300, 20, 600, {
      isStatic: true,
      render: { fillStyle: "#4a4a4a" }
    });
    const rightWall = Matter2.Bodies.rectangle(800, 300, 20, 600, {
      isStatic: true,
      render: { fillStyle: "#4a4a4a" }
    });
    const obstacle1 = Matter2.Bodies.rectangle(300, 400, 200, 20, {
      isStatic: true,
      angle: Math.PI * 0.1,
      render: { fillStyle: "#5a5a5a" }
    });
    const obstacle2 = Matter2.Bodies.rectangle(500, 300, 200, 20, {
      isStatic: true,
      angle: -Math.PI * 0.1,
      render: { fillStyle: "#5a5a5a" }
    });
    Matter2.World.add(engine.world, [ground, leftWall, rightWall, obstacle1, obstacle2]);
    Matter2.Render.run(render);
    runner = Matter2.Runner.create();
    Matter2.Runner.run(runner, engine);
    console.log("✅ [Matter] Physics simulation initialized");
    addBalls(5);
  } catch (error) {
    console.error("❌ [Matter] Failed to initialize:", error);
  }
}
function addBall(x = 400, y = 50) {
  if (!engine) {
    console.error("❌ [Matter] Physics engine not initialized");
    return;
  }
  const Matter2 = window.Matter;
  const colors = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#f9ca24", "#6c5ce7", "#a29bfe"];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const radius = 10 + Math.random() * 15;
  const ball = Matter2.Bodies.circle(x, y, radius, {
    restitution: 0.7,
    friction: 0.01,
    render: {
      fillStyle: color
    }
  });
  Matter2.World.add(engine.world, ball);
  ballCount++;
  updateBallCounter();
  console.log(`⚛️ [Matter] Ball added at (${x.toFixed(0)}, ${y.toFixed(0)})`);
}
function addBalls(count = 10) {
  for (let i = 0; i < count; i++) {
    const x = 100 + Math.random() * 600;
    const y = 50 + Math.random() * 100;
    setTimeout(() => addBall(x, y), i * 50);
  }
}
function updateBallCounter() {
  const counter = document.getElementById("ball-counter");
  if (counter) {
    counter.textContent = `Bolas: ${ballCount}`;
  }
}
function resetSimulation$1() {
  if (!engine) return;
  const Matter2 = window.Matter;
  const bodies = Matter2.Composite.allBodies(engine.world);
  bodies.forEach((body) => {
    if (!body.isStatic) {
      Matter2.World.remove(engine.world, body);
    }
  });
  ballCount = 0;
  updateBallCounter();
  console.log("🔄 [Matter] Simulation reset");
}
function toggleGravity$1() {
  if (!engine) return;
  const currentGravity = engine.world.gravity.y;
  if (currentGravity === 1) {
    engine.world.gravity.y = -1;
    console.log("🔄 [Matter] Gravity: INVERTED");
  } else if (currentGravity === -1) {
    engine.world.gravity.y = 0;
    console.log("🔄 [Matter] Gravity: ZERO");
  } else {
    engine.world.gravity.y = 1;
    console.log("🔄 [Matter] Gravity: NORMAL");
  }
}
function cleanup$1() {
  console.log("🧹 [Matter] Cleaning up...");
  if (runner) {
    Matter.Runner.stop(runner);
    runner = null;
  }
  if (render) {
    Matter.Render.stop(render);
    render.canvas.remove();
    render = null;
  }
  if (engine) {
    Matter.World.clear(engine.world);
    Matter.Engine.clear(engine);
    engine = null;
  }
  if (matterContainer) {
    matterContainer.remove();
    matterContainer = null;
    canvasContainer$1 = null;
  }
  ballCount = 0;
  console.log("✅ [Matter] Cleanup complete");
}
const matterTest = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  addBall,
  addBalls,
  cleanup: cleanup$1,
  initPhysics,
  isLoading: isLoading$1,
  isReady: isReady$1,
  preloadMatter,
  resetSimulation: resetSimulation$1,
  toggleGravity: toggleGravity$1
}, Symbol.toStringTag, { value: "Module" }));
let cannonPromise = null;
let cannonReady = false;
let cannonModule = null;
let world = null;
let animationId = null;
let physicsObjects = [];
let containerEl = null;
let canvasContainer = null;
let sceneRef$1 = null;
let cameraRef = null;
let rendererRef = null;
let bodyCount = 0;
let gravityIndex = 0;
const GRAVITY_STATES = [
  { y: -9.82, label: "NORMAL" },
  { y: 9.82, label: "INVERTED" },
  { y: 0, label: "ZERO" }
];
const COLORS = [16739179, 5164484, 4569041, 16370212, 7101671, 10656766];
const CANNON_CDN = "https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/dist/cannon-es.js";
function preloadCannon() {
  if (cannonPromise) return;
  cannonPromise = (async () => {
    console.log("💣 [Cannon] Starting background load from CDN (ESM)...");
    try {
      cannonModule = await import(
        /* @vite-ignore */
        CANNON_CDN
      );
      cannonReady = true;
      console.log(`✅ [Cannon] Loaded from CDN (${VERSION})`);
      return cannonModule;
    } catch (error) {
      console.error("❌ [Cannon] Failed to load from CDN:", error.message);
      throw error;
    }
  })();
}
function isReady() {
  return cannonReady;
}
function isLoading() {
  return cannonPromise !== null && !cannonReady;
}
async function getCannon() {
  if (cannonReady) return cannonModule;
  if (!cannonPromise) preloadCannon();
  console.log("⏳ [Cannon] Waiting for load to complete...");
  return await cannonPromise;
}
function createContainer() {
  containerEl = document.createElement("div");
  containerEl.id = "cannon-physics";
  containerEl.className = "matter-container";
  containerEl.innerHTML = `
    <button class="matter-close-btn" id="cannon-close">✕</button>
    <h3 class="matter-title">💣 Cannon-es 3D Physics</h3>
    <div class="matter-controls">
      <button id="btn-add-spheres" class="matter-btn matter-btn--add">Add 10 Spheres</button>
      <button id="btn-add-boxes" class="matter-btn matter-btn--add">Add 5 Boxes</button>
      <button id="btn-reset" class="matter-btn matter-btn--reset">Reset</button>
      <button id="btn-gravity" class="matter-btn matter-btn--gravity">Gravity</button>
      <button id="btn-explosion" class="matter-btn matter-btn--add">💥 Explosion</button>
    </div>
    <div id="cannon-canvas" class="matter-canvas"></div>
    <div class="matter-info">
      <span id="cannon-counter">Bodies: 0</span>
      <span>Click scene to add spheres</span>
    </div>
  `;
  document.body.appendChild(containerEl);
  canvasContainer = document.getElementById("cannon-canvas");
  document.getElementById("cannon-close").addEventListener("click", cleanup);
  document.getElementById("btn-add-spheres").addEventListener("click", () => addSpheres(10));
  document.getElementById("btn-add-boxes").addEventListener("click", () => addBoxes(5));
  document.getElementById("btn-reset").addEventListener("click", resetSimulation);
  document.getElementById("btn-gravity").addEventListener("click", toggleGravity);
  document.getElementById("btn-explosion").addEventListener("click", applyExplosion);
}
async function initPhysics3D() {
  try {
    let animate = function() {
      animationId = requestAnimationFrame(animate);
      world.fixedStep(fixedTimeStep);
      for (const { body, mesh } of physicsObjects) {
        mesh.position.copy(body.position);
        mesh.quaternion.copy(body.quaternion);
      }
      rendererRef.render(sceneRef$1, cameraRef);
    };
    const CANNON = await getCannon();
    createContainer();
    const width = canvasContainer.clientWidth || 600;
    const height = canvasContainer.clientHeight || 400;
    sceneRef$1 = new THREE.Scene();
    sceneRef$1.background = new THREE.Color(1710638);
    cameraRef = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    cameraRef.position.set(8, 8, 8);
    cameraRef.lookAt(0, 0, 0);
    rendererRef = new THREE.WebGLRenderer({ antialias: true });
    rendererRef.setSize(width, height);
    rendererRef.setPixelRatio(window.devicePixelRatio);
    canvasContainer.appendChild(rendererRef.domElement);
    const ambientLight = new THREE.AmbientLight(4210752, 2);
    sceneRef$1.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(16777215, 1.5);
    directionalLight.position.set(5, 10, 5);
    sceneRef$1.add(directionalLight);
    world = new CANNON.World({ gravity: new CANNON.Vec3(0, -9.82, 0) });
    world.allowSleep = true;
    world.broadphase = new CANNON.SAPBroadphase(world);
    const defaultMaterial = new CANNON.Material("default");
    const contactMaterial = new CANNON.ContactMaterial(defaultMaterial, defaultMaterial, {
      friction: 0.4,
      restitution: 0.5
    });
    world.addContactMaterial(contactMaterial);
    world.defaultContactMaterial = contactMaterial;
    const groundShape = new CANNON.Plane();
    const groundBody = new CANNON.Body({ mass: 0, shape: groundShape });
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    groundBody.material = defaultMaterial;
    world.addBody(groundBody);
    const gridHelper = new THREE.GridHelper(20, 20, 4868682, 2763306);
    sceneRef$1.add(gridHelper);
    addSpheres(5);
    const fixedTimeStep = 1 / 60;
    animate();
    console.log("✅ [Cannon] 3D Physics simulation initialized (isolated renderer)");
  } catch (error) {
    console.error("❌ [Cannon] Failed to initialize:", error.message);
  }
}
function addSphere(x, y, z) {
  if (!world || !sceneRef$1) {
    console.error("❌ [Cannon] World or scene not initialized");
    return;
  }
  const CANNON = cannonModule;
  const radius = 0.3 + Math.random() * 0.4;
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  const shape = new CANNON.Sphere(radius);
  const body = new CANNON.Body({ mass: 1, shape });
  body.position.set(
    x ?? Math.random() * 6 - 3,
    y ?? 5 + Math.random() * 5,
    z ?? Math.random() * 6 - 3
  );
  body.sleepSpeedLimit = 0.5;
  body.sleepTimeLimit = 1;
  world.addBody(body);
  const geometry2 = new THREE.SphereGeometry(radius, 16, 16);
  const material2 = new THREE.MeshPhongMaterial({ color });
  const mesh = new THREE.Mesh(geometry2, material2);
  sceneRef$1.add(mesh);
  physicsObjects.push({ body, mesh });
  bodyCount++;
  updateCounter();
  console.log(`💣 [Cannon] Sphere added (${bodyCount} bodies)`);
}
function addBox(x, y, z) {
  if (!world || !sceneRef$1) {
    console.error("❌ [Cannon] World or scene not initialized");
    return;
  }
  const CANNON = cannonModule;
  const size = 0.4 + Math.random() * 0.4;
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  const shape = new CANNON.Box(new CANNON.Vec3(size / 2, size / 2, size / 2));
  const body = new CANNON.Body({ mass: 1, shape });
  body.position.set(
    x ?? Math.random() * 6 - 3,
    y ?? 5 + Math.random() * 5,
    z ?? Math.random() * 6 - 3
  );
  body.sleepSpeedLimit = 0.5;
  body.sleepTimeLimit = 1;
  world.addBody(body);
  const geometry2 = new THREE.BoxGeometry(size, size, size);
  const material2 = new THREE.MeshPhongMaterial({ color });
  const mesh = new THREE.Mesh(geometry2, material2);
  sceneRef$1.add(mesh);
  physicsObjects.push({ body, mesh });
  bodyCount++;
  updateCounter();
  console.log(`💣 [Cannon] Box added (${bodyCount} bodies)`);
}
function addSpheres(count = 10) {
  for (let i = 0; i < count; i++) {
    setTimeout(() => addSphere(), i * 80);
  }
}
function addBoxes(count = 5) {
  for (let i = 0; i < count; i++) {
    setTimeout(() => addBox(), i * 80);
  }
}
function updateCounter() {
  const counter = document.getElementById("cannon-counter");
  if (counter) counter.textContent = `Bodies: ${bodyCount}`;
}
function resetSimulation() {
  if (!world || !sceneRef$1) return;
  for (const { body, mesh } of physicsObjects) {
    world.removeBody(body);
    sceneRef$1.remove(mesh);
    mesh.geometry.dispose();
    mesh.material.dispose();
  }
  physicsObjects = [];
  bodyCount = 0;
  updateCounter();
  console.log("🔄 [Cannon] Simulation reset");
}
function toggleGravity() {
  if (!world) return;
  gravityIndex = (gravityIndex + 1) % GRAVITY_STATES.length;
  const state = GRAVITY_STATES[gravityIndex];
  world.gravity.set(0, state.y, 0);
  console.log(`🔄 [Cannon] Gravity: ${state.label} (${state.y})`);
}
function applyExplosion() {
  if (!world) return;
  const CANNON = cannonModule;
  const force = 15;
  for (const { body } of physicsObjects) {
    body.wakeUp();
    const dir = body.position.vsub(new CANNON.Vec3(0, 0, 0));
    dir.normalize();
    body.applyImpulse(dir.scale(force));
  }
  console.log(`💥 [Cannon] Explosion applied to ${physicsObjects.length} bodies`);
}
function cleanup() {
  console.log("🧹 [Cannon] Cleaning up...");
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  if (world && sceneRef$1) {
    for (const { body, mesh } of physicsObjects) {
      world.removeBody(body);
      sceneRef$1.remove(mesh);
      mesh.geometry.dispose();
      mesh.material.dispose();
    }
  }
  if (rendererRef) {
    rendererRef.dispose();
    rendererRef = null;
  }
  physicsObjects = [];
  world = null;
  sceneRef$1 = null;
  cameraRef = null;
  bodyCount = 0;
  gravityIndex = 0;
  if (containerEl) {
    containerEl.remove();
    containerEl = null;
    canvasContainer = null;
  }
  console.log("✅ [Cannon] Cleanup complete");
}
const cannonTest = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  addBox,
  addBoxes,
  addSphere,
  addSpheres,
  applyExplosion,
  cleanup,
  initPhysics3D,
  isLoading,
  isReady,
  preloadCannon,
  resetSimulation,
  toggleGravity
}, Symbol.toStringTag, { value: "Module" }));
const DEFAULT_CONFIG = {
  count: 1e4,
  // Reduced from 50k for better browser performance
  areaSize: 20,
  particleSizeRange: [0.5, 2],
  // Reduced from [1, 4]
  speedMultiplier: 1,
  colorMode: "rainbow",
  pattern: "random"
};
let config = { ...DEFAULT_CONFIG };
let particles = null;
let material = null;
let geometry = null;
let sceneRef = null;
let elapsedTime = 0;
let updateCallback = null;
let rendererDataRef = null;
const vertexShader = `
  attribute vec3 aVelocity;
  attribute vec3 aColor;
  attribute float aSize;
  attribute float aLife;
  
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uSizeMultiplier;
  uniform float uSpeedMultiplier;
  
  varying vec3 vColor;
  varying float vAlpha;
  
  void main() {
    float t = uTime * uSpeedMultiplier;
    vec3 pos = position + aVelocity * mod(t, aLife);
    
    // Reduced oscillation from 0.5 to 0.1 for smoother motion
    pos += 0.1 * sin(t * 0.3 + position.x * 1.5) * vec3(1.0, 0.5, 1.0);
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    
    // Calculate point size with clamping to prevent saturation
    float size = aSize * uSizeMultiplier * uPixelRatio * (300.0 / -mvPosition.z);
    gl_PointSize = clamp(size, 1.0, 64.0);
    gl_Position = projectionMatrix * mvPosition;
    
    float lifeProgress = mod(t, aLife) / aLife;
    vAlpha = smoothstep(0.0, 0.1, lifeProgress) * smoothstep(1.0, 0.8, lifeProgress);
    vColor = aColor;
  }
`;
const fragmentShader = `
  varying vec3 vColor;
  varying float vAlpha;
  
  uniform float uAlphaMultiplier;
  
  void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;
    
    // Soft circle with reduced alpha
    float alpha = smoothstep(0.5, 0.2, dist) * vAlpha * uAlphaMultiplier;
    gl_FragColor = vec4(vColor, alpha);
  }
`;
function generateColor(mode, index, total) {
  const color = new THREE.Color();
  switch (mode) {
    case "rainbow":
      color.setHSL(index / total * 0.8, 0.8, 0.4);
      break;
    case "monochrome":
      color.setRGB(0.2, 0.5, 0.9);
      break;
    case "temperature":
      const temp = index / total;
      color.setRGB(temp * 0.8, 0.4 - temp * 0.4, 0.9 - temp * 0.8);
      break;
    case "fire":
      color.setHSL(0.05 + index / total * 0.1, 0.9, 0.4 + index / total * 0.2);
      break;
    default:
      color.setHSL(Math.random() * 0.8, 0.8, 0.4);
  }
  return [color.r, color.g, color.b];
}
function generatePosition(pattern, index, total, areaSize) {
  let x, y, z;
  switch (pattern) {
    case "sphere": {
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      const r = areaSize * 0.5;
      x = r * Math.sin(phi) * Math.cos(theta);
      y = r * Math.sin(phi) * Math.sin(theta);
      z = r * Math.cos(phi);
      break;
    }
    case "galaxy": {
      const armCount = 4;
      const armIndex = index % armCount;
      const armOffset = armIndex / armCount * Math.PI * 2;
      const radius = index / total * areaSize * 0.5;
      const angle = armOffset + radius * 0.5;
      x = Math.cos(angle) * radius;
      y = (Math.random() - 0.5) * 2;
      z = Math.sin(angle) * radius;
      break;
    }
    case "torus": {
      const R = areaSize * 0.3;
      const r2 = areaSize * 0.15;
      const u = Math.random() * Math.PI * 2;
      const v = Math.random() * Math.PI * 2;
      x = (R + r2 * Math.cos(v)) * Math.cos(u);
      y = r2 * Math.sin(v);
      z = (R + r2 * Math.cos(v)) * Math.sin(u);
      break;
    }
    case "fountain":
      x = (Math.random() - 0.5) * areaSize * 0.3;
      y = -areaSize * 0.4;
      z = (Math.random() - 0.5) * areaSize * 0.3;
      break;
    default:
      x = (Math.random() - 0.5) * areaSize;
      y = (Math.random() - 0.5) * areaSize;
      z = (Math.random() - 0.5) * areaSize;
  }
  return [x, y, z];
}
function generateVelocity(pattern) {
  let vx, vy, vz;
  switch (pattern) {
    case "fountain":
      vx = (Math.random() - 0.5) * 1;
      vy = Math.random() * 8 + 3;
      vz = (Math.random() - 0.5) * 1;
      break;
    default:
      vx = (Math.random() - 0.5) * 1;
      vy = (Math.random() - 0.5) * 1;
      vz = (Math.random() - 0.5) * 1;
  }
  return [vx, vy, vz];
}
function createGeometry(count) {
  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const lives = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const [x, y, z] = generatePosition(config.pattern, i, count, config.areaSize);
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
    const [vx, vy, vz] = generateVelocity(config.pattern);
    velocities[i * 3] = vx;
    velocities[i * 3 + 1] = vy;
    velocities[i * 3 + 2] = vz;
    const [r, g, b] = generateColor(config.colorMode, i, count);
    colors[i * 3] = r;
    colors[i * 3 + 1] = g;
    colors[i * 3 + 2] = b;
    const sizeMin = config.particleSizeRange[0];
    const sizeMax = config.particleSizeRange[1];
    sizes[i] = sizeMin + Math.random() * (sizeMax - sizeMin);
    lives[i] = 2 + Math.random() * 3;
  }
  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geom.setAttribute("aVelocity", new THREE.BufferAttribute(velocities, 3));
  geom.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
  geom.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
  geom.setAttribute("aLife", new THREE.BufferAttribute(lives, 1));
  return geom;
}
function createMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      uSizeMultiplier: { value: 1 },
      uSpeedMultiplier: { value: config.speedMultiplier },
      uAlphaMultiplier: { value: 0.8 }
      // New uniform to control alpha
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending
    // Changed from AdditiveBlending to prevent white saturation
  });
}
function buildParticleSystem(scene) {
  if (particles) {
    scene.remove(particles);
    if (geometry) geometry.dispose();
    if (material) material.dispose();
  }
  geometry = createGeometry(config.count);
  material = createMaterial();
  particles = new THREE.Points(geometry, material);
  particles.frustumCulled = false;
  scene.add(particles);
  sceneRef = scene;
  console.log(`✨ [Particles] System created: ${config.count} particles, pattern="${config.pattern}", color="${config.colorMode}"`);
}
function init(rendererData) {
  if (!rendererData || !rendererData.scene) {
    console.error("❌ [Particles] Renderer data or scene not available");
    return;
  }
  rendererDataRef = rendererData;
  buildParticleSystem(rendererData.scene);
  if (rendererData.onUpdate) {
    updateCallback = (deltaTime) => update(deltaTime);
    rendererData.onUpdate(updateCallback);
  }
}
function update(deltaTime) {
  if (!material) return;
  elapsedTime += deltaTime;
  material.uniforms.uTime.value = elapsedTime;
  material.uniforms.uSpeedMultiplier.value = config.speedMultiplier;
}
function dispose() {
  if (particles && sceneRef) {
    sceneRef.remove(particles);
    particles = null;
  }
  if (geometry) {
    geometry.dispose();
    geometry = null;
  }
  if (material) {
    material.dispose();
    material = null;
  }
  if (updateCallback && rendererDataRef && rendererDataRef.removeUpdateCallback) {
    rendererDataRef.removeUpdateCallback(updateCallback);
    updateCallback = null;
  }
  elapsedTime = 0;
  console.log("🗑️ [Particles] System disposed");
}
function isActive() {
  return particles !== null && material !== null;
}
function setCount(count) {
  config.count = Math.max(1e3, Math.min(5e4, count));
  if (sceneRef) buildParticleSystem(sceneRef);
}
function setColorMode(mode) {
  config.colorMode = mode;
  if (sceneRef) buildParticleSystem(sceneRef);
}
function setPattern(pattern) {
  config.pattern = pattern;
  if (sceneRef) buildParticleSystem(sceneRef);
}
function setSpeedMultiplier(multiplier) {
  config.speedMultiplier = Math.max(0, Math.min(5, multiplier));
}
function setSizeMultiplier(multiplier) {
  if (material) {
    material.uniforms.uSizeMultiplier.value = Math.max(0.1, Math.min(3, multiplier));
  }
}
function setAlphaMultiplier(alpha) {
  if (material) {
    material.uniforms.uAlphaMultiplier.value = Math.max(0.1, Math.min(1, alpha));
  }
}
function getConfig() {
  return { ...config };
}
function resetConfig() {
  config = { ...DEFAULT_CONFIG };
  if (sceneRef) buildParticleSystem(sceneRef);
}
const particlesTest = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  dispose,
  getConfig,
  init,
  isActive,
  resetConfig,
  setAlphaMultiplier,
  setColorMode,
  setCount,
  setPattern,
  setSizeMultiplier,
  setSpeedMultiplier,
  update
}, Symbol.toStringTag, { value: "Module" }));
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
async function runTest(btnId, testName, testFn) {
  setButtonStatus(btnId, "running");
  const startTime = Date.now();
  try {
    await testFn();
    const duration = Date.now() - startTime;
    console.log(`✅ [${testName}] Passed (${duration}ms)`);
    setButtonStatus(btnId, "success");
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ [${testName}] Failed (${duration}ms):`, error.message);
    setButtonStatus(btnId, "error");
  }
}
async function runAllTests(testDefs) {
  console.log("▶ Running all tests...");
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
  console.log(`🏁 Done: ${passed} ✅ | ${failed} ❌`);
}
function initUITest(rendererData, testModules) {
  console.log(`🎮 [UI-Test] Creating test panel ${VERSION}...`);
  injectStylesheet();
  const capturedSeed = getVar("GAME_SEED", "N/A");
  const capturedRoot = !!root;
  console.log("📸 [UI-Test] Captured values:", { seed: capturedSeed, root: capturedRoot });
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
    audioTest: audioTest2,
    mermaidTest: mermaidTest2,
    matterTest: matterTest2,
    cannonTest: cannonTest2,
    particlesTest: particlesTest2
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
    { btnId: "btn-audio-stop", name: "Audio Stop", fn: () => audioStopHandler() },
    { btnId: "btn-mermaid", name: "Mermaid", fn: () => mermaidHandler() },
    { btnId: "btn-matter", name: "Matter.js", fn: () => matterHandler() },
    { btnId: "btn-cannon", name: "Cannon-es", fn: () => cannonHandler() },
    { btnId: "btn-particles", name: "Particles", fn: () => particlesHandler() }
  ];
  async function diceHandler() {
    console.log("🎲 Rolling dice...");
    if (!diceTest2 || !diceTest2.available) throw new Error("Plugin not available");
    const d20 = diceTest2.rollD20();
    const d6 = diceTest2.roll3D6();
    console.log(`🎲 1d20: ${d20.result} | 3d6: ${d6.result}`);
  }
  async function seederHandler() {
    console.log("🌱 Testing Seeder...");
    if (!seederTest2 || !seederTest2.available) throw new Error("Plugin not available");
    const seed = seederTest2.generateRandomSeed();
    seederTest2.applySeed(seed);
    console.log(`✅ Seed applied: ${seed}`);
  }
  async function patternHandler() {
    console.log("🎨 Generating procedural pattern...");
    if (!patternTest2 || !patternTest2.available) throw new Error("Plugin not available");
    const result = patternTest2.generateEmojiPattern();
    if (!result) throw new Error("Pattern generation failed");
    console.log("✅ Pattern generated!");
  }
  async function aiTextHandler() {
    console.log("🤖 Generating AI text...");
    if (!aiTextTest2 || !aiTextTest2.available) throw new Error("Plugin not available");
    const result = await aiTextTest2.generateBasic("Escreva uma frase curta sobre um aventureiro.");
    if (!(result == null ? void 0 : result.success) || !result.text) throw new Error((result == null ? void 0 : result.error) || "Empty response from AI");
    const preview = result.text.substring(0, 80) + (result.text.length > 80 ? "..." : "");
    console.log(`✅ AI Text: "${preview}"`);
  }
  async function imageHandler() {
    console.log("🖼️ Generating AI image...");
    if (!imageTest2 || !imageTest2.available) throw new Error("Plugin not available");
    const result = await imageTest2.testBasicImage();
    if (!(result == null ? void 0 : result.success)) throw new Error((result == null ? void 0 : result.error) || "Image generation failed");
    console.log("✅ Image generated!");
  }
  async function ttsHandler() {
    console.log("🔊 Testing Text-to-Speech...");
    if (!ttsTest2 || !ttsTest2.available) throw new Error("Plugin not available");
    ttsTest2.speakBasic("Olá! Este é um teste de síntese de voz.");
    console.log("✅ Speech started!");
  }
  async function cubeColorHandler() {
    console.log("🎲 Changing cube color...");
    if (!rendererData || !rendererData.cube || !rendererData.cube.material) throw new Error("Cube not available");
    rendererData.cube.material.color.setHex(Math.random() * 16777215);
    console.log("✅ Cube color changed!");
  }
  async function raycasterHandler() {
    var _a;
    console.log("🖱️ Raycaster: Click on spheres!");
    if (!raycasterTest2 || !raycasterTest2.available) throw new Error("Raycaster not available");
    console.log(`✅ ${((_a = raycasterTest2.spheres) == null ? void 0 : _a.length) || 0} spheres added`);
  }
  async function canvasHandler() {
    console.log("🎨 Testing Canvas 2D...");
    if (!canvasTest2) throw new Error("Canvas not available");
    canvasTest2.drawGradient();
    canvasTest2.drawCircles(15);
    canvasTest2.drawText("RPG Paper Craft", 256, 256);
    if (canvasTest2.threeIntegration) canvasTest2.showThreePlane();
    console.log("✅ Canvas drawn!");
  }
  async function rpgIconHandler() {
    console.log("⚔️ Loading RPG Icons...");
    if (!rpgIconTest2 || !rpgIconTest2.available) throw new Error("Plugin not available");
    const icons = rpgIconTest2.getMultipleIcons(6);
    if (!icons) throw new Error("Icon loading failed");
    console.log(`✅ ${icons.length} icons loaded!`);
  }
  async function listsHandler() {
    console.log("📋 Testing lists...");
    if (!listsTest2) throw new Error("Lists not available");
    const item = listsTest2.testSelectOne("itens");
    const heroes = listsTest2.testSelectUnique("nomes_herois", 2);
    const length = listsTest2.testListLength("nomes_herois");
    console.log(`✅ Item: "${item}" | Heroes: ${heroes.length} | Length: ${length}`);
  }
  async function bridgeHandler() {
    console.log(`📡 Seed: ${capturedSeed} | Root: ${capturedRoot}`);
  }
  async function stateSaveHandler() {
    console.log("💾 Saving state...");
    if (!stateTest2) throw new Error("State not available");
    const state = stateTest2.getDefaultState();
    state.player.name = "Herói Testador";
    state.player.level = 5;
    state.world.bioma = "floresta";
    if (!stateTest2.save(state)) throw new Error("Save failed");
    console.log("✅ State saved!");
  }
  async function stateLoadHandler() {
    console.log("📂 Loading state...");
    if (!stateTest2) throw new Error("State not available");
    const loaded = stateTest2.load();
    if (!loaded) throw new Error("No save found");
    console.log(`✅ Loaded: ${loaded.player.name} Lv.${loaded.player.level}`);
  }
  async function kvHandler() {
    console.log("💾 Testing KV Plugin...");
    if (!kvTest2 || !kvTest2.available) throw new Error("Plugin not available");
    const saved = await kvTest2.setSimpleValue("test_key", "test_value");
    if (!saved) throw new Error("KV save failed");
    const retrieved = await kvTest2.getValue("test_key");
    console.log(`✅ KV: test_key = "${retrieved}"`);
  }
  async function chartBarHandler() {
    console.log("📊 Rendering Bar Chart...");
    if (!apexchartsTest2) throw new Error("ApexCharts not available");
    const result = await apexchartsTest2.renderBarChart();
    if (!(result == null ? void 0 : result.success)) throw new Error("Chart render failed");
    console.log(`✅ Bar Chart: ${result.categories} categories`);
  }
  async function chartLineHandler() {
    console.log("📈 Rendering Line Chart...");
    if (!apexchartsTest2) throw new Error("ApexCharts not available");
    const result = await apexchartsTest2.renderLineChart();
    if (!(result == null ? void 0 : result.success)) throw new Error("Chart render failed");
    console.log(`✅ Line Chart: ${result.points} points`);
  }
  async function chartPieHandler() {
    console.log("🍩 Rendering Donut Chart...");
    if (!apexchartsTest2) throw new Error("ApexCharts not available");
    const result = await apexchartsTest2.renderPieChart();
    if (!(result == null ? void 0 : result.success)) throw new Error("Chart render failed");
    console.log(`✅ Donut Chart: ${result.slices} slices`);
  }
  async function chartRadarHandler() {
    console.log("🕸️ Rendering Radar Chart...");
    if (!apexchartsTest2) throw new Error("ApexCharts not available");
    const result = await apexchartsTest2.renderRadarChart();
    if (!(result == null ? void 0 : result.success)) throw new Error("Chart render failed");
    console.log(`✅ Radar Chart: ${result.axes} axes`);
  }
  async function audioSFXHandler() {
    console.log("🔊 Testing SFX...");
    if (!audioTest2) throw new Error("Audio not available");
    const result = audioTest2.playSFX("click");
    if (!result) throw new Error("SFX failed");
    console.log("✅ SFX: click");
  }
  async function audioMusicHandler() {
    console.log("🎵 Testing music with loop...");
    if (!audioTest2) throw new Error("Audio not available");
    const result = audioTest2.playMusic("music");
    if (!result) throw new Error("Music failed");
    console.log("✅ Music started (loop)");
  }
  async function audioStopHandler() {
    console.log("🔇 Stopping all sounds...");
    if (!audioTest2) throw new Error("Audio not available");
    const result = audioTest2.stopAll();
    if (!result) throw new Error("Stop failed");
    console.log("✅ All sounds stopped");
  }
  async function audioSpriteHandler() {
    console.log("🎵 Testing audio sprite...");
    if (!audioTest2) throw new Error("Audio not available");
    const result = audioTest2.testSprite();
    if (!result) throw new Error("Sprite failed");
    console.log("✅ Sprite: middle (2-4s)");
  }
  async function audioVolumeHandler() {
    console.log("🔊 Testing volume...");
    if (!audioTest2) throw new Error("Audio not available");
    const current = audioTest2.getVolume();
    const newVolume = current > 0.5 ? 0.2 : 0.8;
    audioTest2.setVolume(newVolume);
    console.log(`✅ Volume: ${(newVolume * 100).toFixed(0)}%`);
  }
  async function mermaidHandler() {
    console.log("📊 Testing Mermaid.js...");
    if (!mermaidTest2) throw new Error("Mermaid not available");
    if (mermaidTest2.isLoading && mermaidTest2.isLoading()) {
      console.log("⏳ Mermaid still loading, waiting...");
      await mermaidTest2.getMermaid();
    }
    let diagramContainer = document.getElementById("mermaid-diagrams");
    if (!diagramContainer) {
      diagramContainer = document.createElement("div");
      diagramContainer.id = "mermaid-diagrams";
      diagramContainer.className = "mermaid-container";
      const closeBtn = document.createElement("button");
      closeBtn.className = "mermaid-close-btn";
      closeBtn.innerHTML = "✕";
      closeBtn.title = "Close";
      closeBtn.onclick = () => {
        diagramContainer.remove();
        console.log("📊 Diagrams closed");
      };
      diagramContainer.appendChild(closeBtn);
      document.body.appendChild(diagramContainer);
    } else {
      diagramContainer.innerHTML = "";
    }
    const results = await mermaidTest2.renderAllExamples(diagramContainer);
    const successCount = Object.values(results).filter(Boolean).length;
    const totalCount = Object.keys(results).length;
    console.log(`✅ Mermaid: ${successCount}/${totalCount} diagrams rendered`);
  }
  async function matterHandler() {
    console.log("⚛️ Testing Matter.js...");
    if (!matterTest2) throw new Error("Matter not available");
    if (matterTest2.isLoading && matterTest2.isLoading()) {
      console.log("⏳ Matter.js still loading, waiting...");
      await matterTest2.getMatter();
    }
    await matterTest2.initPhysics();
    console.log("✅ Matter.js: Physics simulation initialized");
  }
  async function cannonHandler() {
    console.log("💣 Testing Cannon-es...");
    if (!cannonTest2) throw new Error("Cannon-es not available");
    if (cannonTest2.isLoading && cannonTest2.isLoading()) {
      console.log("⏳ Cannon-es still loading, waiting...");
    }
    await cannonTest2.initPhysics3D();
    console.log("✅ Cannon-es: 3D Physics simulation initialized");
  }
  async function particlesHandler() {
    console.log("✨ Testing Particles...");
    if (!particlesTest2) throw new Error("Particles not available");
    if (!rendererData || !rendererData.scene) throw new Error("Scene not available");
    if (particlesTest2.isActive && particlesTest2.isActive()) {
      particlesTest2.dispose();
      console.log("🗑️ Particles: System disposed");
      return;
    }
    particlesTest2.init(rendererData);
    console.log("✅ Particles: 50,000 particles rendered");
  }
  const panel = document.createElement("div");
  panel.id = "ui-test-panel";
  panel.innerHTML = `
    <h3>🧪 Test Panel ${VERSION}</h3>
    
    <div class="ui-test-controls">
      <button id="btn-run-all" class="ui-test-btn ui-test-btn--system">▶ Run All</button>
    </div>
    
    <div class="ui-test-category">
      <strong style="color:var(--ui-color-generation)">🎲 Generation & Randomness</strong>
      <button id="btn-dice" class="ui-test-btn ui-test-btn--generation">🎲 Dice</button>
      <button id="btn-seeder" class="ui-test-btn ui-test-btn--generation">🌱 Seeder</button>
      <button id="btn-pattern" class="ui-test-btn ui-test-btn--generation">🎨 Pattern</button>
    </div>
    
    <div class="ui-test-category">
      <strong style="color:var(--ui-color-ai)">🤖 AI & Content</strong>
      <button id="btn-ai-text" class="ui-test-btn ui-test-btn--ai">🤖 AI Text</button>
      <button id="btn-image" class="ui-test-btn ui-test-btn--ai">🖼️ Image</button>
      <button id="btn-tts" class="ui-test-btn ui-test-btn--ai">🔊 TTS</button>
      <button id="btn-tts-stop" class="ui-test-btn ui-test-btn--ai">⏹️ Stop</button>
    </div>
    
    <div class="ui-test-category">
      <strong style="color:var(--ui-color-render)">🎨 Rendering</strong>
      <button id="btn-3d" class="ui-test-btn ui-test-btn--render">🎲 Cube Color</button>
      <button id="btn-raycaster" class="ui-test-btn ui-test-btn--render">🖱️ Raycaster</button>
      <button id="btn-canvas" class="ui-test-btn ui-test-btn--render">🎨 Canvas</button>
      <button id="btn-rpg-icon" class="ui-test-btn ui-test-btn--render">⚔️ RPG Icons</button>
      <button id="btn-particles" class="ui-test-btn ui-test-btn--render">✨ Particles</button>
    </div>
    
    <div class="ui-test-category">
      <strong style="color:var(--ui-color-viz)">📊 Visualization</strong>
      <button id="btn-chart-bar" class="ui-test-btn ui-test-btn--viz">📊 Bar</button>
      <button id="btn-chart-line" class="ui-test-btn ui-test-btn--viz">📈 Line</button>
      <button id="btn-chart-pie" class="ui-test-btn ui-test-btn--viz">🍩 Donut</button>
      <button id="btn-chart-radar" class="ui-test-btn ui-test-btn--viz">🕸️ Radar</button>
    </div>
    
    <div class="ui-test-category">
      <strong style="color:#ff6b9d">🔊 Audio</strong>
      <button id="btn-audio-sfx" class="ui-test-btn ui-test-btn--audio">🔊 SFX</button>
      <button id="btn-audio-music" class="ui-test-btn ui-test-btn--audio">🎵 Music</button>
      <button id="btn-audio-sprite" class="ui-test-btn ui-test-btn--audio">🎵 Sprite</button>
      <button id="btn-audio-volume" class="ui-test-btn ui-test-btn--audio">🔊 Volume</button>
      <button id="btn-audio-stop" class="ui-test-btn ui-test-btn--audio">🔇 Stop</button>
    </div>
    
    <div class="ui-test-category">
      <strong style="color:var(--ui-color-viz)">📊 Diagrams</strong>
      <button id="btn-mermaid" class="ui-test-btn ui-test-btn--viz">📊 Mermaid</button>
      <button id="btn-matter" class="ui-test-btn ui-test-btn--viz">⚛️ Matter.js</button>
      <button id="btn-cannon" class="ui-test-btn ui-test-btn--viz">💣 Cannon-es</button>
    </div>
    
    <div class="ui-test-category">
      <strong style="color:var(--ui-color-data)">💾 Data & State</strong>
      <button id="btn-lists" class="ui-test-btn ui-test-btn--data">📋 Lists</button>
      <button id="btn-bridge" class="ui-test-btn ui-test-btn--data">🔗 Bridge</button>
      <button id="btn-state-save" class="ui-test-btn ui-test-btn--data">💾 Save</button>
      <button id="btn-state-load" class="ui-test-btn ui-test-btn--data">📂 Load</button>
      <button id="btn-kv" class="ui-test-btn ui-test-btn--data">💾 KV</button>
    </div>
  `;
  document.body.appendChild(panel);
  console.log("📎 [UI-Test] Panel attached to document.body");
  const rect = panel.getBoundingClientRect();
  console.log(`📐 [UI-Test] Panel visible: ${rect.width}x${rect.height}px at (${rect.left}, ${rect.top})`);
  document.getElementById("btn-run-all").onclick = () => runAllTests(testDefs);
  document.getElementById("btn-dice").onclick = () => runTest("btn-dice", "Dice", diceHandler);
  document.getElementById("btn-seeder").onclick = () => runTest("btn-seeder", "Seeder", seederHandler);
  document.getElementById("btn-pattern").onclick = () => runTest("btn-pattern", "Pattern", patternHandler);
  document.getElementById("btn-ai-text").onclick = () => runTest("btn-ai-text", "AI Text", aiTextHandler);
  document.getElementById("btn-image").onclick = () => runTest("btn-image", "Image", imageHandler);
  document.getElementById("btn-tts").onclick = () => runTest("btn-tts", "TTS", ttsHandler);
  document.getElementById("btn-tts-stop").onclick = () => runTest("btn-tts-stop", "TTS Stop", () => {
    console.log("⏹️ Stopping speech...");
    if (!ttsTest2) throw new Error("TTS not available");
    if (!ttsTest2.stopSpeech()) throw new Error("Stop not available");
    console.log("✅ Speech stopped");
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
  document.getElementById("btn-mermaid").onclick = () => runTest("btn-mermaid", "Mermaid", mermaidHandler);
  document.getElementById("btn-matter").onclick = () => runTest("btn-matter", "Matter.js", matterHandler);
  document.getElementById("btn-cannon").onclick = () => runTest("btn-cannon", "Cannon-es", cannonHandler);
  document.getElementById("btn-particles").onclick = () => runTest("btn-particles", "Particles", particlesHandler);
  console.log(`✅ [UI-Test] Test panel ${VERSION} created with global controls.`);
}
const uiTest = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  initUITest
}, Symbol.toStringTag, { value: "Module" }));
export {
  initGame
};
//# sourceMappingURL=main.bundle.js.map
