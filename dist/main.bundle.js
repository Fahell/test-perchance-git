import * as THREE$1 from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
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
const VERSION = "v1.26.9";
const CDN_BASE = `https://cdn.jsdelivr.net/gh/Fahell/test-perchance-git@v1.26.9`;
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
  const scene = new THREE$1.Scene();
  scene.background = new THREE$1.Color(2105381);
  const camera = new THREE$1.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1e3);
  camera.position.z = 5;
  const renderer = new THREE$1.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.domElement.style.position = "fixed";
  renderer.domElement.style.top = "0";
  renderer.domElement.style.left = "0";
  renderer.domElement.style.zIndex = "10";
  renderer.domElement.style.pointerEvents = "auto";
  renderer.domElement.setAttribute("data-threejs", "true");
  document.body.appendChild(renderer.domElement);
  const ambientLight = new THREE$1.AmbientLight(16777215, 0.6);
  scene.add(ambientLight);
  const directionalLight = new THREE$1.DirectionalLight(16777215, 0.8);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);
  const geometry2 = new THREE$1.BoxGeometry(1, 1, 1);
  const material2 = new THREE$1.MeshStandardMaterial({ color: 3900150 });
  const cube = new THREE$1.Mesh(geometry2, material2);
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
  aiImageTest: () => Promise.resolve().then(() => aiImageTest$1),
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
  particlesTest: () => Promise.resolve().then(() => particlesTest),
  cellularAutomataTest: () => Promise.resolve().then(() => cellularAutomataTest$1),
  indexeddbTest: () => Promise.resolve().then(() => indexeddbTest$1),
  gsapTest: () => Promise.resolve().then(() => gsapTest$1)
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
  if (modules.raycasterTest && modules.raycasterTest.init) {
    try {
      modules.raycasterTest.init(rendererData);
      console.log("✅ [Main] raycasterTest inicializado");
    } catch (e) {
      console.error("❌ [Main] Erro ao inicializar raycasterTest:", e.message);
    }
  }
  console.log("ℹ️ [Main] particlesTest carregado (inicialização manual via botão UI)");
}
async function initGame() {
  if (window.GAME_INITIALIZED) {
    console.warn("⏭️ Jogo já inicializado. Ignorando execução duplicada.");
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
    console.log("🎬 [Main] Starting GSAP background preload...");
    const gsapModule = await TEST_MODULES.gsapTest();
    if (gsapModule && gsapModule.gsapTest && gsapModule.gsapTest.preloadGsap) {
      gsapModule.gsapTest.preloadGsap();
    }
    initTestModules(testModules, rendererData);
    console.log("🔍 [Main] Carregando módulo ui-test.js...");
    const uiTestMod = await Promise.resolve().then(() => uiTest);
    if (uiTestMod && uiTestMod.initUITest) {
      console.log("🎮 [Main] Chamando initUITest...");
      console.log("📦 [Main] rendererData passado:", rendererData);
      console.log("🎲 renderer.cube:", rendererData.cube);
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
      **❌ Erro ao iniciar o jogo**

      **Mensagem:** ${error.message}

      **Stack:**

      \`\`\`
      ${error.stack || "N/A"}
      \`\`\`

      Verifique o console (F12) para mais detalhes.
    `;
    document.body.appendChild(errorDiv);
  }
}
console.log(`📦 [Main] main.js carregado (Vite bundle ${VERSION}). Aguardando initGame()...`);
function createTestContainer(title, options = {}) {
  const {
    id = `test-container-${Date.now()}`,
    className = "test-container",
    width = 800,
    height = 600,
    onClose = null
  } = options;
  const container2 = document.createElement("div");
  container2.id = id;
  container2.className = className;
  container2.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: ${width}px;
    max-width: 95vw;
    height: ${height}px;
    max-height: 95vh;
    background: rgba(0, 0, 0, 0.95);
    border: 2px solid #4ade80;
    border-radius: 8px;
    padding: 15px;
    z-index: 10000;
    overflow: auto;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    font-family: monospace;
    color: white;
  `;
  const closeBtn = document.createElement("button");
  closeBtn.className = "test-close-btn";
  closeBtn.innerHTML = "✕";
  closeBtn.style.cssText = `
    position: absolute;
    top: 10px;
    right: 10px;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #ff6b6b;
    color: white;
    border: none;
    cursor: pointer;
    font-size: 18px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    z-index: 10001;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  `;
  closeBtn.addEventListener("mouseover", () => {
    closeBtn.style.background = "#ff4757";
    closeBtn.style.transform = "scale(1.1)";
    closeBtn.style.boxShadow = "0 4px 12px rgba(255, 107, 107, 0.4)";
  });
  closeBtn.addEventListener("mouseout", () => {
    closeBtn.style.background = "#ff6b6b";
    closeBtn.style.transform = "scale(1)";
    closeBtn.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.3)";
  });
  const titleEl = document.createElement("h3");
  titleEl.style.cssText = `
    margin: 0 0 15px 0;
    color: #4ade80;
    font-size: 16px;
    font-weight: 600;
  `;
  titleEl.textContent = title;
  const contentArea = document.createElement("div");
  contentArea.className = "test-content-area";
  contentArea.style.cssText = `
    width: 100%;
    height: calc(100% - 50px);
    overflow: auto;
    background: #1a1a1a;
    border-radius: 4px;
    padding: 10px;
    border: 1px solid #404040;
  `;
  container2.appendChild(closeBtn);
  container2.appendChild(titleEl);
  container2.appendChild(contentArea);
  document.body.appendChild(container2);
  const close = () => {
    if (onClose) {
      try {
        onClose();
      } catch (error) {
        console.error("Error in onClose callback:", error);
      }
    }
    container2.remove();
    console.log(`🧹 [TestContainer] Closed: ${title}`);
  };
  closeBtn.addEventListener("click", close);
  console.log(`📦 [TestContainer] Created: ${title} (${VERSION})`);
  return {
    container: container2,
    contentArea,
    close
  };
}
let currentContainer$2 = null;
const imageTest = {
  available: !!root.image,
  // Helper para extrair URL da imagem do retorno do plugin
  _extractImageUrl(result) {
    if (!result) return null;
    if (result.dataUrl) return result.dataUrl;
    if (result.src) return result.src;
    if (result.url) return result.url;
    return null;
  },
  // Helper robusto para geração de imagens via onFinish (Promise wrapper)
  _generateImage(prompt, options = {}, timeout = 12e4) {
    return new Promise((resolve, reject) => {
      console.log(`🔧 [Image] _generateImage called:`, { prompt, options });
      const timer = setTimeout(() => {
        console.error(`⏰ [Image] Timeout after ${timeout / 1e3}s`);
        reject(new Error(`Timeout: Geração da imagem excedeu ${timeout / 1e3}s`));
      }, timeout);
      const handleFinish = (data) => {
        clearTimeout(timer);
        console.log(`✅ [Image] onFinish triggered`, data);
        if (options.onFinish) {
          try {
            options.onFinish(data);
          } catch (e) {
            console.warn("Caller onFinish error:", e);
          }
        }
        if (data && data.dataUrl) {
          resolve(data);
        } else {
          reject(new Error("Dados da imagem inválidos ou vazios"));
        }
      };
      try {
        const result = root.image(prompt, {
          ...options,
          onFinish: handleFinish
        });
        if (result && typeof result.then === "function") {
          result.catch((err) => {
            clearTimeout(timer);
            console.error(`❌ [Image] root.image promise rejected`, err);
            reject(err);
          });
        }
      } catch (err) {
        clearTimeout(timer);
        console.error(`❌ [Image] root.image threw error`, err);
        reject(err);
      }
    });
  },
  // Cria ou reutiliza o container modal
  _getOrCreateContainer(title) {
    if (currentContainer$2) {
      currentContainer$2.close();
    }
    currentContainer$2 = createTestContainer(title, {
      width: 900,
      height: 700,
      onClose: () => {
        currentContainer$2 = null;
        console.log("🗑️ [Image] Container fechado");
      }
    });
    return currentContainer$2;
  },
  // Teste 1: Geração básica com seed fixa
  async testBasicImage() {
    console.log("🖼️ [Image] Gerando imagem básica com seed fixa...");
    const { contentArea } = this._getOrCreateContainer("🖼️ Image Test - Basic Generation");
    contentArea.innerHTML = "<p>⏳ Gerando imagem...</p>";
    try {
      const result = await this._generateImage(
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
        console.log(" Data URL length:", imageUrl.length, "chars");
        console.log(" Tipo do resultado:", typeof result, result.constructor.name);
        contentArea.innerHTML = `
          <div style="text-align:center">
            <img src="${imageUrl}" style="max-width:100%; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.3)" />
            <p style="margin-top:12px; font-size:14px">
              <strong>✅ Seed:</strong> 12345 |
              <strong>📐 Resolução:</strong> 512x512 |
              <strong>📏 Tamanho:</strong> ${(imageUrl.length / 1024).toFixed(1)}KB
            </p>
          </div>
        `;
        return { success: true, url: imageUrl, seed: 12345 };
      } else {
        throw new Error("Não foi possível extrair URL da imagem");
      }
    } catch (error) {
      console.error("❌ [Image] Falha na geração:", error.message);
      contentArea.innerHTML = `<p style="color:red">❌ Erro: ${error.message}</p>`;
      return { success: false, error: error.message };
    }
  },
  // Teste 2: Remove background (fundo transparente)
  async testRemoveBackground() {
    console.log("🖼️ [Image] Testando removeBackground...");
    const { contentArea } = this._getOrCreateContainer("🔍 Image Test - Remove Background");
    contentArea.innerHTML = "<p>⏳ Gerando imagem sem fundo...</p>";
    try {
      const result = await this._generateImage(
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
        contentArea.innerHTML = `
          <div style="text-align:center; background: repeating-conic-gradient(#808080 0% 25%, transparent 0% 50%) 50% / 20px 20px; padding: 20px; border-radius: 8px;">
            <img src="${imageUrl}" style="max-width:100%; border-radius:8px;" />
            <p style="margin-top:12px; font-size:14px; background: white; padding: 8px; border-radius: 4px; display: inline-block;">
              <strong>✅ Seed:</strong> 54321 |
              <strong>🔍 RemoveBackground:</strong> true |
              <strong>🎨 Fundo:</strong> transparente (quadriculado)
            </p>
          </div>
        `;
        return { success: true, url: imageUrl, transparent: true };
      } else {
        throw new Error("Não foi possível extrair URL da imagem");
      }
    } catch (error) {
      console.error("❌ [Image] Falha:", error.message);
      contentArea.innerHTML = `<p style="color:red">❌ Erro: ${error.message}</p>`;
      return { success: false, error: error.message };
    }
  },
  // Teste 3: Comparação de seeds diferentes
  async testSeedComparison() {
    console.log("🖼️ [Image] Comparando seeds diferentes...");
    const { contentArea } = this._getOrCreateContainer("🎲 Image Test - Seed Comparison");
    contentArea.innerHTML = "<p>⏳ Gerando 2 imagens com seeds diferentes...</p>";
    try {
      const seed1 = 11111;
      const seed2 = 99999;
      const prompt = "papercraft dragon, fantasy style";
      console.log(` Gerando com seed ${seed1}...`);
      const result1 = await this._generateImage(prompt, { seed: seed1, size: 256 });
      console.log(` Gerando com seed ${seed2}...`);
      const result2 = await this._generateImage(prompt, { seed: seed2, size: 256 });
      const url1 = this._extractImageUrl(result1);
      const url2 = this._extractImageUrl(result2);
      if (url1 && url2) {
        console.log("✅ [Image] Ambas imagens geradas!");
        contentArea.innerHTML = `
          <div style="display:flex; gap:16px; justify-content:center; flex-wrap:wrap">
            <div style="text-align:center">
              <img src="${url1}" style="max-width:100%; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.3)" />
              <p style="margin-top:8px; font-size:13px">Seed: ${seed1}</p>
            </div>
            <div style="text-align:center">
              <img src="${url2}" style="max-width:100%; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.3)" />
              <p style="margin-top:8px; font-size:13px">Seed: ${seed2}</p>
            </div>
          </div>
          <p style="text-align:center; margin-top:12px; font-size:14px">
            <strong>✅ Mesma prompt,</strong> seeds diferentes |
            <strong>📐 Resolução:</strong> 256x256 cada
          </p>
        `;
        return { success: true, images: [url1, url2], seeds: [seed1, seed2] };
      } else {
        throw new Error("Falha ao gerar uma ou ambas imagens");
      }
    } catch (error) {
      console.error("❌ [Image] Falha na comparação:", error.message);
      contentArea.innerHTML = `<p style="color:red">❌ Erro: ${error.message}</p>`;
      return { success: false, error: error.message };
    }
  },
  // Teste 4: Diferentes resoluções
  async testResolution() {
    console.log("🖼️ [Image] Testando resolução customizada...");
    const { contentArea } = this._getOrCreateContainer("📐 Image Test - Custom Resolution");
    contentArea.innerHTML = "<p>⏳ Gerando imagem 768x384...</p>";
    try {
      const result = await this._generateImage(
        "papercraft landscape, wide view",
        {
          seed: 77777,
          resolution: "768x512",
          negativePrompt: "portrait, vertical"
        }
      );
      const imageUrl = this._extractImageUrl(result);
      if (imageUrl) {
        console.log("✅ [Image] Imagem wide gerada!");
        contentArea.innerHTML = `
          <div style="text-align:center">
            <img src="${imageUrl}" style="max-width:100%; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.3)" />
            <p style="margin-top:12px; font-size:14px">
              <strong>✅ Seed:</strong> 77777 |
              <strong>📐 Resolução:</strong> 768x384 (16:9) |
              <strong>🎨 Formato:</strong> wide/landscape
            </p>
          </div>
        `;
        return { success: true, url: imageUrl, resolution: "768x512" };
      } else {
        throw new Error("Não foi possível extrair URL da imagem");
      }
    } catch (error) {
      console.error("❌ [Image] Falha:", error.message);
      contentArea.innerHTML = `<p style="color:red">❌ Erro: ${error.message}</p>`;
      return { success: false, error: error.message };
    }
  },
  // Teste 5: Guidance Scale Comparison (CFG 3, 7, 15, 25)
  async testGuidanceScale() {
    console.log("🖼️ [Image] Testando guidance scale comparison...");
    const { contentArea } = this._getOrCreateContainer("⚖️ Image Test - Guidance Scale");
    contentArea.innerHTML = "<p>⏳ Gerando 3 imagens com CFG diferentes...</p>";
    try {
      const prompt = "papercraft castle, detailed, fantasy";
      const seed = 42424;
      const scales = [3, 7, 15];
      const results = [];
      for (const scale of scales) {
        console.log(` Gerando com CFG ${scale}...`);
        const result = await this._generateImage(prompt, {
          seed,
          size: 256,
          guidanceScale: scale
        });
        const url = this._extractImageUrl(result);
        if (url) results.push({ scale, url });
      }
      if (results.length === 3) {
        console.log("✅ [Image] Todas imagens geradas!");
        const imagesHtml = results.map((r) => `
          <div style="text-align:center">
            <img src="${r.url}" style="max-width:100%; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.3)" />
            <p style="margin-top:8px; font-size:13px; font-weight:bold">CFG: ${r.scale}</p>
          </div>
        `).join("");
        contentArea.innerHTML = `
          <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap:16px">
            ${imagesHtml}
          </div>
          <p style="text-align:center; margin-top:12px; font-size:14px">
            <strong>✅ Seed:</strong> ${seed} |
            <strong>📐 Resolução:</strong> 256x256 cada |
            <strong>⚖️ CFG:</strong> 3 (criativo) → 15 (rígido)
          </p>
        `;
        return { success: true, results };
      } else {
        throw new Error(`Apenas ${results.length}/3 imagens geradas`);
      }
    } catch (error) {
      console.error("❌ [Image] Falha no guidance scale:", error.message);
      contentArea.innerHTML = `<p style="color:red">❌ Erro: ${error.message}</p>`;
      return { success: false, error: error.message };
    }
  },
  // Teste 6: Negative Prompt Effect (com vs sem negativePrompt)
  async testNegativePrompt() {
    console.log("🖼️ [Image] Testando efeito do negative prompt...");
    const { contentArea } = this._getOrCreateContainer("🚫 Image Test - Negative Prompt");
    contentArea.innerHTML = "<p>⏳ Gerando com e sem negative prompt...</p>";
    try {
      const prompt = "papercraft character portrait";
      const seed = 55555;
      const negativePrompt = "blurry, low quality, distorted, ugly, deformed";
      console.log(" Gerando SEM negative prompt...");
      const resultWithout = await this._generateImage(prompt, {
        seed,
        size: 256
      });
      console.log(" Gerando COM negative prompt...");
      const resultWith = await this._generateImage(prompt, {
        seed,
        size: 256,
        negativePrompt
      });
      const urlWithout = this._extractImageUrl(resultWithout);
      const urlWith = this._extractImageUrl(resultWith);
      if (urlWithout && urlWith) {
        console.log("✅ [Image] Ambas imagens geradas!");
        contentArea.innerHTML = `
          <div style="display:flex; gap:16px; justify-content:center; flex-wrap:wrap">
            <div style="text-align:center">
              <img src="${urlWithout}" style="max-width:100%; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.3)" />
              <p style="margin-top:8px; font-size:13px; color:red">❌ Sem Negative Prompt</p>
            </div>
            <div style="text-align:center">
              <img src="${urlWith}" style="max-width:100%; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.3)" />
              <p style="margin-top:8px; font-size:13px; color:green">✅ Com Negative Prompt</p>
            </div>
          </div>
          <p style="text-align:center; margin-top:12px; font-size:14px">
            <strong>✅ Seed:</strong> ${seed} |
            <strong>🚫 Negative:</strong> "${negativePrompt}"
          </p>
        `;
        return { success: true, without: urlWithout, with: urlWith };
      } else {
        throw new Error("Falha ao gerar uma ou ambas imagens");
      }
    } catch (error) {
      console.error("❌ [Image] Falha no negative prompt:", error.message);
      contentArea.innerHTML = `<p style="color:red">❌ Erro: ${error.message}</p>`;
      return { success: false, error: error.message };
    }
  },
  // Teste 7: Model Trigger Words (anime, furry, normal)
  async testTriggerWords() {
    console.log("🖼️ [Image] Testando trigger words de modelos...");
    const { contentArea } = this._getOrCreateContainer("🎭 Image Test - Trigger Words");
    contentArea.innerHTML = "<p>⏳ Gerando com trigger words diferentes...</p>";
    try {
      const seed = 67890;
      const configs = [
        { label: "Normal", prompt: "papercraft cat, cute, simple" },
        { label: "Anime", prompt: "anime cat, kawaii, 1girl, danbooru style" },
        { label: "Furry", prompt: "anthropomorphic cat, fursuit, furry art style" }
      ];
      const results = [];
      for (const config2 of configs) {
        console.log(` Gerando estilo: ${config2.label}...`);
        const result = await this._generateImage(config2.prompt, {
          seed,
          size: 256
        });
        const url = this._extractImageUrl(result);
        if (url) results.push({ ...config2, url });
      }
      if (results.length === 3) {
        console.log("✅ [Image] Todos estilos gerados!");
        const imagesHtml = results.map((r) => `
          <div style="text-align:center">
            <img src="${r.url}" style="max-width:100%; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.3)" />
            <p style="margin-top:8px; font-size:13px; font-weight:bold">${r.label}</p>
            <p style="font-size:11px; color:#666; font-style:italic">${r.prompt}</p>
          </div>
        `).join("");
        contentArea.innerHTML = `
          <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:16px">
            ${imagesHtml}
          </div>
          <p style="text-align:center; margin-top:12px; font-size:14px">
            <strong>✅ Seed:</strong> ${seed} |
            <strong>🎭 Estilos:</strong> Normal, Anime, Furry |
            <strong>📐 Resolução:</strong> 256x256 cada
          </p>
        `;
        return { success: true, results };
      } else {
        throw new Error(`Apenas ${results.length}/3 estilos gerados`);
      }
    } catch (error) {
      console.error("❌ [Image] Falha nos trigger words:", error.message);
      contentArea.innerHTML = `<p style="color:red">❌ Erro: ${error.message}</p>`;
      return { success: false, error: error.message };
    }
  },
  // Teste 8: Emoji Prompts
  async testEmojiPrompts() {
    console.log("🖼️ [Image] Testando prompts com emojis...");
    const { contentArea } = this._getOrCreateContainer("😀 Image Test - Emoji Prompts");
    contentArea.innerHTML = "<p>⏳ Gerando imagens com emojis...</p>";
    try {
      const seed = 11122;
      const emojiConfigs = [
        { emoji: "🐉", prompt: "🐉 dragon, fantasy, papercraft" },
        { emoji: "🌸", prompt: "🌸 cherry blossom, japanese garden, serene" },
        { emoji: "🤖", prompt: "🤖 robot, sci-fi, mechanical, detailed" }
      ];
      const results = [];
      for (const config2 of emojiConfigs) {
        console.log(` Gerando com emoji ${config2.emoji}...`);
        const result = await this._generateImage(config2.prompt, {
          seed,
          size: 256
        });
        const url = this._extractImageUrl(result);
        if (url) results.push({ ...config2, url });
      }
      if (results.length === 3) {
        console.log("✅ [Image] Todas imagens com emoji geradas!");
        const imagesHtml = results.map((r) => `
          <div style="text-align:center">
            <img src="${r.url}" style="max-width:100%; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.3)" />
            <p style="margin-top:8px; font-size:20px">${r.emoji}</p>
            <p style="font-size:11px; color:#666; font-style:italic">${r.prompt}</p>
          </div>
        `).join("");
        contentArea.innerHTML = `
          <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:16px">
            ${imagesHtml}
          </div>
          <p style="text-align:center; margin-top:12px; font-size:14px">
            <strong>✅ Seed:</strong> ${seed} |
            <strong>😀 Emojis:</strong> funcionam como tokens no prompt |
            <strong>📐 Resolução:</strong> 256x256 cada
          </p>
        `;
        return { success: true, results };
      } else {
        throw new Error(`Apenas ${results.length}/3 imagens geradas`);
      }
    } catch (error) {
      console.error("❌ [Image] Falha nos emoji prompts:", error.message);
      contentArea.innerHTML = `<p style="color:red">❌ Erro: ${error.message}</p>`;
      return { success: false, error: error.message };
    }
  },
  // Teste 9: onFinish Callback com metadados
  async testOnFinishCallback() {
    console.log("🖼️ [Image] Testando onFinish callback...");
    const { contentArea } = this._getOrCreateContainer("📊 Image Test - onFinish Callback");
    contentArea.innerHTML = "<p>⏳ Gerando e capturando metadados...</p>";
    try {
      let metadata = null;
      const prompt = "papercraft owl, mystical forest, detailed feathers";
      const seed = 99988;
      console.log(" Gerando com onFinish callback...");
      const result = await this._generateImage(prompt, {
        seed,
        resolution: "512x512",
        guidanceScale: 8,
        negativePrompt: "blurry, low quality",
        onFinish: (data) => {
          metadata = data;
          console.log("📊 [Image] onFinish capturado:", data);
        }
      });
      const imageUrl = this._extractImageUrl(result);
      if (imageUrl) {
        console.log("✅ [Image] Imagem com callback gerada!");
        let metaHtml = '<div style="background:#f5f5f5; padding:12px; border-radius:8px; margin-top:16px; text-align:left; font-size:13px">';
        metaHtml += "<strong>📊 Metadados capturados:</strong><br><br>";
        if (metadata) {
          if (metadata.inputs) {
            metaHtml += `<strong>Prompt:</strong> ${metadata.inputs.prompt || "N/A"}<br>`;
            metaHtml += `<strong>Seed:</strong> ${metadata.inputs.seed || "N/A"}<br>`;
            metaHtml += `<strong>Negative Prompt:</strong> ${metadata.inputs.negativePrompt || "N/A"}<br>`;
            metaHtml += `<strong>Guidance Scale:</strong> ${metadata.inputs.guidanceScale || "N/A"}<br>`;
          }
          if (metadata.canvas) metaHtml += `<strong>Canvas:</strong> ${metadata.canvas.width}x${metadata.canvas.height}<br>`;
          if (metadata.dataUrl) metaHtml += `<strong>Data URL:</strong> ${metadata.dataUrl.length} chars<br>`;
        } else {
          metaHtml += "<em>onFinish não retornou dados, extraindo do resultado:</em><br>";
          if (result.inputs) {
            metaHtml += `<strong>Prompt:</strong> ${result.inputs.prompt || "N/A"}<br>`;
            metaHtml += `<strong>Seed:</strong> ${result.inputs.seed || "N/A"}<br>`;
          }
          if (result.canvas) metaHtml += `<strong>Canvas:</strong> ${result.canvas.width}x${result.canvas.height}<br>`;
          if (result.dataUrl) metaHtml += `<strong>Data URL:</strong> ${result.dataUrl.length} chars<br>`;
        }
        metaHtml += "</div>";
        contentArea.innerHTML = `
          <div style="text-align:center">
            <img src="${imageUrl}" style="max-width:100%; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.3)" />
            ${metaHtml}
          </div>
          <p style="text-align:center; margin-top:12px; font-size:14px">
            <strong>✅ Seed:</strong> ${seed} |
            <strong>📊 Callback:</strong> onFinish capturado |
            <strong>📐 Resolução:</strong> 512x512
          </p>
        `;
        return { success: true, url: imageUrl, metadata: metadata || result };
      } else {
        throw new Error("Não foi possível extrair URL da imagem");
      }
    } catch (error) {
      console.error("❌ [Image] Falha no onFinish:", error.message);
      contentArea.innerHTML = `<p style="color:red">❌ Erro: ${error.message}</p>`;
      return { success: false, error: error.message };
    }
  },
  // ============================================
  // PHASE 2 TESTS
  // ============================================
  async testTagEmphasis() {
    console.log("🖼️ [Image] Testando tag emphasis...");
    const { contentArea } = this._getOrCreateContainer("🎯 Image Test - Tag Emphasis");
    contentArea.innerHTML = "<p>⏳ Gerando 4 imagens com diferentes pesos de tag...</p>";
    try {
      const basePrompt = "papercraft dragon";
      const variations = [
        { weight: 0.5, label: "(dragon:0.5) - De-enfatizado" },
        { weight: 1, label: "(dragon:1.0) - Normal" },
        { weight: 1.5, label: "(dragon:1.5) - Ênfase" },
        { weight: 2, label: "(dragon:2.0) - Ênfase máxima" }
      ];
      const results = [];
      for (let i = 0; i < variations.length; i++) {
        const v = variations[i];
        console.log(` Gerando com peso ${v.weight}...`);
        const prompt = `${basePrompt}, (${basePrompt.split(" ")[1]}:${v.weight}), fantasy`;
        const result = await this._generateImage(prompt, {
          seed: 42424,
          size: 256,
          guidanceScale: 7
        });
        results.push({ ...result, label: v.label, weight: v.weight });
      }
      console.log(`✅ [Image] ${results.length}/4 imagens com emphasis geradas!`);
      let html = '<div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:16px; text-align:center">';
      for (const r of results) {
        const imageUrl = this._extractImageUrl(r);
        html += `
          <div>
            <img src="${imageUrl}" style="max-width:100%; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.3)" />
            <p style="margin-top:8px; font-size:13px"><strong>${r.label}</strong></p>
          </div>
        `;
      }
      html += "</div>";
      contentArea.innerHTML = html;
      return { success: true, count: results.length };
    } catch (error) {
      console.error("❌ [Image] Falha no tag emphasis:", error.message);
      contentArea.innerHTML = `<p style="color:red">❌ Erro: ${error.message}</p>`;
      return { success: false, error: error.message };
    }
  },
  async testPromptOrdering() {
    console.log("🖼️ [Image] Testando prompt ordering...");
    const { contentArea } = this._getOrCreateContainer("🔀 Image Test - Prompt Ordering");
    contentArea.innerHTML = "<p>⏳ Gerando 3 imagens com mesmas tags em ordens diferentes...</p>";
    try {
      const orders = [
        { prompt: "papercraft dragon, fantasy landscape, detailed", label: "Ordem 1: Dragon → Landscape" },
        { prompt: "fantasy landscape, papercraft dragon, detailed", label: "Ordem 2: Landscape → Dragon" },
        { prompt: "detailed, papercraft dragon, fantasy landscape", label: "Ordem 3: Detailed → Dragon" }
      ];
      const results = [];
      for (let i = 0; i < orders.length; i++) {
        console.log(` Gerando ordem ${i + 1}...`);
        const result = await this._generateImage(orders[i].prompt, {
          seed: 42424,
          size: 256,
          guidanceScale: 7
        });
        results.push({ ...result, label: orders[i].label });
      }
      console.log(`✅ [Image] ${results.length}/3 imagens com ordering geradas!`);
      let html = '<div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:16px; text-align:center">';
      for (const r of results) {
        const imageUrl = this._extractImageUrl(r);
        html += `
          <div>
            <img src="${imageUrl}" style="max-width:100%; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.3)" />
            <p style="margin-top:8px; font-size:12px"><strong>${r.label}</strong></p>
          </div>
        `;
      }
      html += "</div>";
      contentArea.innerHTML = html;
      return { success: true, count: results.length };
    } catch (error) {
      console.error("❌ [Image] Falha no prompt ordering:", error.message);
      contentArea.innerHTML = `<p style="color:red">❌ Erro: ${error.message}</p>`;
      return { success: false, error: error.message };
    }
  },
  async testCanvasPostProcessing() {
    console.log("🖼️ [Image] Testando canvas post-processing...");
    const { contentArea } = this._getOrCreateContainer("🎨 Image Test - Canvas Post-Processing");
    contentArea.innerHTML = "<p>⏳ Gerando imagem e aplicando filtros no canvas...</p>";
    try {
      const prompt = "papercraft castle, fantasy, detailed";
      console.log(" Gerando imagem base...");
      const result = await this._generateImage(prompt, {
        seed: 42424,
        size: 256,
        guidanceScale: 7
      });
      const imageUrl = this._extractImageUrl(result);
      console.log("✅ [Image] Imagem base gerada, aplicando filtros...");
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageUrl;
      });
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const originalDataUrl = canvas.toDataURL();
      ctx.filter = "grayscale(100%)";
      ctx.drawImage(img, 0, 0);
      const grayscaleDataUrl = canvas.toDataURL();
      ctx.filter = "sepia(100%)";
      ctx.drawImage(img, 0, 0);
      const sepiaDataUrl = canvas.toDataURL();
      ctx.filter = "none";
      ctx.drawImage(img, 0, 0);
      ctx.fillStyle = "rgba(255, 0, 0, 0.7)";
      ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
      ctx.fillStyle = "white";
      ctx.font = "bold 20px Arial";
      ctx.textAlign = "center";
      ctx.fillText("TEST OVERLAY", canvas.width / 2, canvas.height - 15);
      const overlayDataUrl = canvas.toDataURL();
      console.log("✅ [Image] Filtros aplicados com sucesso!");
      contentArea.innerHTML = `
        <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:16px; text-align:center">
          <div>
            <img src="${originalDataUrl}" style="max-width:100%; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.3)" />
            <p style="margin-top:8px; font-size:13px"><strong>Original</strong></p>
          </div>
          <div>
            <img src="${grayscaleDataUrl}" style="max-width:100%; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.3)" />
            <p style="margin-top:8px; font-size:13px"><strong>Grayscale</strong></p>
          </div>
          <div>
            <img src="${sepiaDataUrl}" style="max-width:100%; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.3)" />
            <p style="margin-top:8px; font-size:13px"><strong>Sepia</strong></p>
          </div>
          <div>
            <img src="${overlayDataUrl}" style="max-width:100%; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.3)" />
            <p style="margin-top:8px; font-size:13px"><strong>Text Overlay</strong></p>
          </div>
        </div>
      `;
      return { success: true, filters: ["original", "grayscale", "sepia", "overlay"] };
    } catch (error) {
      console.error("❌ [Image] Falha no canvas post-processing:", error.message);
      contentArea.innerHTML = `<p style="color:red">❌ Erro: ${error.message}</p>`;
      return { success: false, error: error.message };
    }
  },
  async testBreakKeyword() {
    console.log("🖼️ [Image] Testando BREAK keyword...");
    const { contentArea } = this._getOrCreateContainer("⚡ Image Test - BREAK Keyword");
    contentArea.innerHTML = "<p>⏳ Gerando 2 imagens: com e sem BREAK...</p>";
    try {
      const promptWithoutBreak = "papercraft dragon, fantasy landscape, detailed, high quality";
      const promptWithBreak = "papercraft dragon BREAK fantasy landscape, detailed, high quality";
      console.log(" Gerando SEM BREAK...");
      const result1 = await this._generateImage(promptWithoutBreak, {
        seed: 42424,
        size: 256,
        guidanceScale: 7
      });
      console.log(" Gerando COM BREAK...");
      const result2 = await this._generateImage(promptWithBreak, {
        seed: 42424,
        size: 256,
        guidanceScale: 7
      });
      console.log("✅ [Image] Imagens com BREAK geradas!");
      const url1 = this._extractImageUrl(result1);
      const url2 = this._extractImageUrl(result2);
      contentArea.innerHTML = `
        <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:16px; text-align:center">
          <div>
            <img src="${url1}" style="max-width:100%; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.3)" />
            <p style="margin-top:8px; font-size:13px"><strong>Sem BREAK</strong><br><code style="font-size:11px">${promptWithoutBreak}</code></p>
          </div>
          <div>
            <img src="${url2}" style="max-width:100%; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.3)" />
            <p style="margin-top:8px; font-size:13px"><strong>Com BREAK</strong><br><code style="font-size:11px">${promptWithBreak}</code></p>
          </div>
        </div>
        <p style="text-align:center; margin-top:16px; font-size:12px; color:#666">
          BREAK força separação de chunks de 75 tokens, permitindo prompts mais complexos sem diluição.
        </p>
      `;
      return { success: true, count: 2 };
    } catch (error) {
      console.error("❌ [Image] Falha no BREAK keyword:", error.message);
      contentArea.innerHTML = `<p style="color:red">❌ Erro: ${error.message}</p>`;
      return { success: false, error: error.message };
    }
  },
  // ===== TESTE 10: Tag Blending =====
  async testTagBlending(contentArea) {
    console.log("🖼️ [Image] Testando tag blending...");
    try {
      const blends = [
        { name: "0% (100% cyberpunk)", prompt: "papercraft cat [cyberpunk:steampunk:0]", desc: "100% cyberpunk" },
        { name: "50% (50/50)", prompt: "papercraft cat [cyberpunk:steampunk:0.5]", desc: "50% cyberpunk + 50% steampunk" },
        { name: "100% (100% steampunk)", prompt: "papercraft cat [cyberpunk:steampunk:1]", desc: "100% steampunk" }
      ];
      const results = [];
      for (let i = 0; i < blends.length; i++) {
        console.log(` Gerando blend ${i + 1}: ${blends[i].desc}...`);
        const result = await this._generateImage(blends[i].prompt, {
          seed: 42424,
          size: 256
        });
        results.push({ ...blends[i], url: this._extractImageUrl(result) });
      }
      console.log("✅ [Image] Blends gerados!");
      contentArea.innerHTML = `
        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:12px; text-align:center">
          ${results.map((r) => `
            <div>
              <img src="${r.url}" style="max-width:100%; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.3)" />
              <p style="margin-top:8px; font-size:12px"><strong>${r.name}</strong><br><code style="font-size:10px">${r.prompt}</code></p>
            </div>
          `).join("")}
        </div>
        <p style="text-align:center; margin-top:16px; font-size:12px; color:#666">
          Tag blending mistura dois estilos: <code>[from:to:ratio]</code> onde ratio vai de 0 (100% from) a 1 (100% to).
        </p>
      `;
      return { success: true, count: results.length };
    } catch (error) {
      console.error("❌ [Image] Falha no tag blending:", error.message);
      contentArea.innerHTML = `<p style="color:red">❌ Erro: ${error.message}</p>`;
      return { success: false, error: error.message };
    }
  },
  // ===== TESTE 11: Multi-Image Grid =====
  async testMultiImageGrid(contentArea) {
    console.log("🖼️ [Image] Testando multi-image grid...");
    try {
      const prompts = [
        "papercraft dragon, fire, detailed",
        "papercraft unicorn, rainbow, magical",
        "papercraft robot, futuristic, metal",
        "papercraft owl, mystical, forest"
      ];
      console.log(` Gerando ${prompts.length} imagens simultaneamente...`);
      const promises = prompts.map(
        (prompt, i) => this._generateImage(prompt, { seed: 42424 + i, size: 256 })
      );
      const results = await Promise.all(promises);
      console.log("✅ [Image] Grid gerado!");
      contentArea.innerHTML = `
        <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:12px; text-align:center">
          ${results.map((result, i) => `
            <div>
              <img src="${this._extractImageUrl(result)}" style="max-width:100%; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.3)" />
              <p style="margin-top:8px; font-size:11px"><code>${prompts[i]}</code></p>
            </div>
          `).join("")}
        </div>
        <p style="text-align:center; margin-top:16px; font-size:12px; color:#666">
          Geração paralela de múltiplas imagens usando <code>Promise.all()</code> para eficiência.
        </p>
      `;
      return { success: true, count: results.length };
    } catch (error) {
      console.error("❌ [Image] Falha no multi-image grid:", error.message);
      contentArea.innerHTML = `<p style="color:red">❌ Erro: ${error.message}</p>`;
      return { success: false, error: error.message };
    }
  },
  // ===== TESTE 12: Alternating Tags =====
  async testAlternatingTags(contentArea) {
    console.log("🖼️ [Image] Testando alternating tags...");
    try {
      const tests = [
        { name: "Sem alternância", prompt: "papercraft cat, blue, simple", desc: "Prompt normal" },
        { name: "Alternando blue|red", prompt: "papercraft cat [blue|red], simple", desc: "Alterna blue/red a cada step" },
        { name: "3-way alternation", prompt: "papercraft cat [blue|red|green], simple", desc: "Ciclo blue→red→green" }
      ];
      const results = [];
      for (let i = 0; i < tests.length; i++) {
        console.log(` Gerando ${i + 1}: ${tests[i].name}...`);
        const result = await this._generateImage(tests[i].prompt, {
          seed: 42424,
          size: 256
        });
        results.push({ ...tests[i], url: this._extractImageUrl(result) });
      }
      console.log("✅ [Image] Alternating tags gerados!");
      contentArea.innerHTML = `
        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:12px; text-align:center">
          ${results.map((r) => `
            <div>
              <img src="${r.url}" style="max-width:100%; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.3)" />
              <p style="margin-top:8px; font-size:12px"><strong>${r.name}</strong><br><code style="font-size:10px">${r.prompt}</code></p>
            </div>
          `).join("")}
        </div>
        <p style="text-align:center; margin-top:16px; font-size:12px; color:#666">
          Alternating tags <code>[tag1|tag2]</code> alternam entre tags a cada step de geração, criando misturas únicas.
        </p>
      `;
      return { success: true, count: results.length };
    } catch (error) {
      console.error("❌ [Image] Falha nos alternating tags:", error.message);
      contentArea.innerHTML = `<p style="color:red">❌ Erro: ${error.message}</p>`;
      return { success: false, error: error.message };
    }
  },
  // ===== TESTE 13: Add/Remove During Generation =====
  async testAddRemoveDuringGen(contentArea) {
    console.log("🖼️ [Image] Testando add/remove during generation...");
    try {
      const tests = [
        { name: "Sem modificação", prompt: "papercraft cat, simple", desc: "Prompt normal" },
        { name: "Adiciona wings em 50%", prompt: "papercraft cat [with wings:0.5], simple", desc: 'Adiciona "with wings" após 50% dos steps' },
        { name: "Remove tail em 50%", prompt: "papercraft cat with tail [with tail::0.5], simple", desc: 'Remove "with tail" após 50% dos steps' }
      ];
      const results = [];
      for (let i = 0; i < tests.length; i++) {
        console.log(` Gerando ${i + 1}: ${tests[i].name}...`);
        const result = await this._generateImage(tests[i].prompt, {
          seed: 42424,
          size: 256
        });
        results.push({ ...tests[i], url: this._extractImageUrl(result) });
      }
      console.log("✅ [Image] Add/remove during generation gerados!");
      contentArea.innerHTML = `
        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:12px; text-align:center">
          ${results.map((r) => `
            <div>
              <img src="${r.url}" style="max-width:100%; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.3)" />
              <p style="margin-top:8px; font-size:12px"><strong>${r.name}</strong><br><code style="font-size:10px">${r.prompt}</code></p>
            </div>
          `).join("")}
        </div>
        <p style="text-align:center; margin-top:16px; font-size:12px; color:#666">
          <code>[to:when]</code> adiciona tags após X% dos steps. <code>[from::when]</code> remove tags após X% dos steps.
        </p>
      `;
      return { success: true, count: results.length };
    } catch (error) {
      console.error("❌ [Image] Falha no add/remove during generation:", error.message);
      contentArea.innerHTML = `<p style="color:red">❌ Erro: ${error.message}</p>`;
      return { success: false, error: error.message };
    }
  },
  // Fecha o container
  close() {
    if (currentContainer$2) {
      currentContainer$2.close();
      currentContainer$2 = null;
      console.log("🗑️ [Image] Container fechado manualmente");
    }
  }
};
console.log("🖼️ [Image] Inicializando teste do plugin de imagem...");
if (imageTest.available) {
  console.log("✅ [Image] Plugin text-to-image-plugin disponível");
} else {
  console.warn("⚠️ [Image] Plugin text-to-image-plugin NÃO disponível");
  console.warn(" Adicione no List Panel: image = {import:text-to-image-plugin}");
}
const imageTest$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  imageTest
}, Symbol.toStringTag, { value: "Module" }));
async function _generateAIText(instruction, options = {}, timeout = 6e4) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Timeout: Geração de texto excedeu ${timeout / 1e3}s`));
    }, timeout);
    const userOnFinish = options.onFinish;
    const wrappedOptions = {
      ...options,
      onFinish: (data) => {
        clearTimeout(timeoutId);
        if (typeof userOnFinish === "function") {
          try {
            userOnFinish(data);
          } catch (e) {
            console.warn("onFinish user callback error:", e);
          }
        }
        resolve(data);
      }
    };
    try {
      console.log("🔧 [AI-Text] _generateAIText called:", { instruction, options: wrappedOptions });
      const result = root.ai({ instruction, ...wrappedOptions });
      if (result && typeof result.catch === "function") {
        result.catch((err) => {
          clearTimeout(timeoutId);
          reject(err);
        });
      }
    } catch (error) {
      clearTimeout(timeoutId);
      reject(error);
    }
  });
}
const aiTextTest = {
  available: !!root.ai,
  // Teste 1: startWith & hideStartWith
  async testStartWithAndHide() {
    console.log("🤖 [AI-Text] Testando startWith & hideStartWith...");
    if (!this.available) {
      return { success: false, error: "Plugin não disponível" };
    }
    try {
      const result1 = await _generateAIText(
        "Complete a frase sobre um dragão ancestral.",
        {
          startWith: "O dragão ancestral ",
          hideStartWith: false
        }
      );
      const result2 = await _generateAIText(
        "Complete a frase sobre um dragão ancestral.",
        {
          startWith: "O dragão ancestral ",
          hideStartWith: true
        }
      );
      console.log("✅ [AI-Text] startWith visível (text):", result1.text);
      console.log("✅ [AI-Text] startWith visível (generatedText):", result1.generatedText);
      console.log("✅ [AI-Text] startWith oculto (text):", result2.text);
      console.log("✅ [AI-Text] startWith oculto (generatedText):", result2.generatedText);
      return {
        success: true,
        visibleText: result1.text,
        visibleGenerated: result1.generatedText,
        hiddenText: result2.text,
        hiddenGenerated: result2.generatedText
      };
    } catch (error) {
      console.error("❌ [AI-Text] Erro no startWith test:", error);
      return { success: false, error: error.message };
    }
  },
  // Teste 2: stopSequences
  async testStopSequences() {
    console.log("🤖 [AI-Text] Testando stopSequences...");
    if (!this.available) {
      return { success: false, error: "Plugin não disponível" };
    }
    try {
      const result = await _generateAIText(
        'Conte uma história curta sobre um herói. Pare quando disser "FIM".',
        { stopSequences: ["FIM", "The End", "###"] }
      );
      console.log("✅ [AI-Text] Texto com stopSequences:", result.generatedText);
      return { success: true, text: result.generatedText };
    } catch (error) {
      console.error("❌ [AI-Text] Erro no stopSequences test:", error);
      return { success: false, error: error.message };
    }
  },
  // Teste 3: style & outputTo
  async testStyleAndOutputTo(containerId) {
    console.log("🤖 [AI-Text] Testando style & outputTo...");
    if (!this.available) {
      return { success: false, error: "Plugin não disponível" };
    }
    try {
      const targetId = `ai-output-${Date.now()}`;
      const targetDiv = document.createElement("div");
      targetDiv.id = targetId;
      targetDiv.style.cssText = "padding: 10px; margin-top: 10px; border: 1px solid #ccc; border-radius: 4px; min-height: 50px;";
      const container2 = document.getElementById(containerId);
      if (!container2) {
        throw new Error(`Container ${containerId} não encontrado`);
      }
      container2.appendChild(targetDiv);
      console.log("🔧 [AI-Text] Output element created:", targetId);
      const result = await _generateAIText(
        "Escreva uma citação inspiradora sobre aventura.",
        {
          outputTo: targetDiv,
          style: "color: #a78bfa; font-weight: bold; font-style: italic; padding: 15px; background: rgba(167, 139, 250, 0.1); border-radius: 8px;"
        }
      );
      console.log("✅ [AI-Text] Texto com style & outputTo:", result.generatedText);
      return { success: true, text: result.generatedText, targetId };
    } catch (error) {
      console.error("❌ [AI-Text] Erro no style & outputTo test:", error);
      return { success: false, error: error.message };
    }
  },
  // Teste 4: endButtons
  async testEndButtons() {
    console.log("🤖 [AI-Text] Testando endButtons...");
    if (!this.available) {
      return { success: false, error: "Plugin não disponível" };
    }
    try {
      const result = await _generateAIText(
        "Escreva um parágrafo sobre um mago misterioso.",
        { endButtons: "none" }
      );
      console.log("✅ [AI-Text] Texto sem endButtons:", result.generatedText);
      return { success: true, text: result.generatedText };
    } catch (error) {
      console.error("❌ [AI-Text] Erro no endButtons test:", error);
      return { success: false, error: error.message };
    }
  },
  // ===== FASE 2 TESTS =====
  // Teste 5: onChunk streaming
  async testOnChunkStreaming(uiElement = null) {
    console.log("🤖 [AI-Text] Testando onChunk streaming...");
    if (!this.available) {
      return { success: false, error: "Plugin não disponível" };
    }
    try {
      const chunks = [];
      const result = await _generateAIText(
        "Escreva uma frase curta sobre um cavaleiro.",
        {
          outputTo: uiElement,
          onChunk: (data) => {
            chunks.push({
              textChunk: data.textChunk,
              isFromStartWith: data.isFromStartWith,
              fullTextSoFar: data.fullTextSoFar
            });
            console.log("📦 [AI-Text] Chunk recebido:", data.textChunk);
          }
        }
      );
      console.log("✅ [AI-Text] onChunk streaming completado. Total chunks:", chunks.length);
      return {
        success: true,
        chunks,
        chunkCount: chunks.length,
        finalText: result.generatedText
      };
    } catch (error) {
      console.error("❌ [AI-Text] Erro no onChunk streaming test:", error);
      return { success: false, error: error.message };
    }
  },
  // Teste 6: onFinish capture
  async testOnFinishCapture() {
    console.log("🤖 [AI-Text] Testando onFinish capture...");
    if (!this.available) {
      return { success: false, error: "Plugin não disponível" };
    }
    try {
      let capturedData = null;
      const result = await _generateAIText(
        "Escreva uma frase sobre um dragão dourado.",
        {
          startWith: "O dragão dourado ",
          onFinish: (data) => {
            var _a, _b, _c;
            capturedData = {
              text: data.text,
              generatedText: data.generatedText,
              liveResponseText: data.liveResponseText,
              inputs: data.inputs
            };
            console.log("📊 [AI-Text] onFinish capturado:", {
              textLength: (_a = data.text) == null ? void 0 : _a.length,
              generatedTextLength: (_b = data.generatedText) == null ? void 0 : _b.length,
              hasStartWith: (_c = data.inputs) == null ? void 0 : _c.startWith
            });
          }
        }
      );
      console.log("✅ [AI-Text] onFinish capture completado");
      return {
        success: true,
        capturedData,
        result
      };
    } catch (error) {
      console.error("❌ [AI-Text] Erro no onFinish capture test:", error);
      return { success: false, error: error.message };
    }
  },
  // Teste 7: Dynamic prompts (instruction as function)
  async testDynamicPrompts() {
    console.log("🤖 [AI-Text] Testando dynamic prompts...");
    if (!this.available) {
      return { success: false, error: "Plugin não disponível" };
    }
    try {
      const instructionFn = () => {
        const subjects = ["um guerreiro", "um mago", "um ladino"];
        const places = ["floresta sombria", "montanha gelada", "deserto ardente"];
        const subject = subjects[Math.floor(Math.random() * subjects.length)];
        const place = places[Math.floor(Math.random() * places.length)];
        return `Escreva uma frase sobre ${subject} em ${place}.`;
      };
      const result = await _generateAIText(instructionFn, {});
      console.log("✅ [AI-Text] Dynamic prompt completado");
      return {
        success: true,
        text: result.generatedText,
        instructionType: "function"
      };
    } catch (error) {
      console.error("❌ [AI-Text] Erro no dynamic prompts test:", error);
      return { success: false, error: error.message };
    }
  },
  // Teste 8: render function
  async testRenderFunction(containerId) {
    console.log("🤖 [AI-Text] Testando render function...");
    if (!this.available) {
      return { success: false, error: "Plugin não disponível" };
    }
    try {
      const targetId = `ai-render-output-${Date.now()}`;
      const targetDiv = document.createElement("div");
      targetDiv.id = targetId;
      targetDiv.style.cssText = "padding: 10px; margin-top: 10px; border: 1px solid #ccc; border-radius: 4px; min-height: 50px;";
      const container2 = document.getElementById(containerId);
      if (!container2) {
        throw new Error(`Container ${containerId} não encontrado`);
      }
      container2.appendChild(targetDiv);
      const renderFn = (data) => {
        if (!data.text) return "";
        let transformed = data.text.replace(/\*([^*]+)\*/g, '<em style="color: #a78bfa; font-style: italic;">$1</em>');
        if (data.isPartial) {
          transformed += '<span style="color: #64748b;">▊</span>';
        }
        return transformed;
      };
      const result = await _generateAIText(
        "Escreva uma frase com uma ação entre asteriscos, como *sorri misteriosamente*.",
        {
          outputTo: targetDiv,
          render: renderFn
        }
      );
      console.log("✅ [AI-Text] render function completado");
      return {
        success: true,
        text: result.generatedText,
        targetId
      };
    } catch (error) {
      console.error("❌ [AI-Text] Erro no render function test:", error);
      return { success: false, error: error.message };
    }
  },
  // ===== FASE 3 TESTS =====
  // Teste 9: Structured JSON generation
  async testStructuredJSON() {
    console.log("🤖 [AI-Text] Testando structured JSON generation...");
    if (!this.available) {
      return { success: false, error: "Plugin não disponível" };
    }
    if (!root.jsonstream) {
      return { success: false, error: 'json-stream-plugin não importado. Adicione "jsonstream = {import:json-stream-plugin}" no List Panel do Perchance.' };
    }
    try {
      const instruction = 'Gere um objeto JSON com as seguintes propriedades: "name" (string), "age" (number), "occupation" (string). Responda APENAS com o JSON, sem texto adicional.';
      const stream = root.jsonstream();
      let isFirstChunk = true;
      const startWith = '```json\n{\n  "name": "';
      const result = await _generateAIText(instruction, {
        startWith,
        onChunk: (data) => {
          if (isFirstChunk) {
            isFirstChunk = false;
            return;
          }
          if (data && data.textChunk) {
            stream.add(data.textChunk);
          }
        }
      });
      if (stream.json_invalid) {
        return {
          success: false,
          error: "JSON inválido gerado pela IA",
          raw: result.generatedText
        };
      }
      if (!stream.json && !stream.json_complete) {
        return {
          success: false,
          error: "Nenhum JSON válido foi construído",
          raw: result.generatedText
        };
      }
      const parsed = stream.json;
      console.log("✅ [AI-Text] JSON estruturado gerado:", parsed);
      return {
        success: true,
        parsed,
        raw: result.generatedText
      };
    } catch (error) {
      console.error("❌ [AI-Text] Erro no structured JSON test:", error);
      return { success: false, error: error.message };
    }
  },
  // Teste 10: Markdown render transformation
  async testMarkdownRender() {
    console.log("🤖 [AI-Text] Testando markdown render transformation...");
    if (!this.available) {
      return { success: false, error: "Plugin não disponível" };
    }
    try {
      const instruction = "Escreva uma frase curta usando **negrito** e *itálico* para destacar palavras importantes.";
      let renderedChunks = [];
      const result = await _generateAIText(instruction, {
        render: (data) => {
          let html = data.text;
          html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
          html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
          renderedChunks.push({ text: data.text, html, isPartial: data.isPartial });
          return html;
        }
      });
      console.log("✅ [AI-Text] Markdown render completado. Total chunks:", renderedChunks.length);
      return {
        success: true,
        chunkCount: renderedChunks.length,
        finalText: result.generatedText,
        chunks: renderedChunks
      };
    } catch (error) {
      console.error("❌ [AI-Text] Erro no markdown render test:", error);
      return { success: false, error: error.message };
    }
  },
  // Teste 11: Concurrency limits
  async testConcurrencyLimits() {
    console.log("🤖 [AI-Text] Testando limites de concorrência...");
    if (!this.available) {
      return { success: false, error: "Plugin não disponível" };
    }
    try {
      const instructions = [
        "Escreva uma palavra sobre fogo.",
        "Escreva uma palavra sobre água.",
        "Escreva uma palavra sobre terra."
      ];
      const promises = instructions.map(
        (inst, i) => _generateAIText(inst, {}, 3e4).then((res) => ({ index: i, success: true, text: res.generatedText })).catch((err) => ({ index: i, success: false, error: err.message }))
      );
      const results = await Promise.all(promises);
      const successful = results.filter((r) => r.success).length;
      console.log(`✅ [AI-Text] Concorrência testada: ${successful}/${instructions.length} bem-sucedidos`);
      return {
        success: true,
        total: instructions.length,
        successful,
        results
      };
    } catch (error) {
      console.error("❌ [AI-Text] Erro no concurrency test:", error);
      return { success: false, error: error.message };
    }
  }
};
console.log("🤖 [AI-Text] Inicializando teste do plugin de texto IA...");
if (aiTextTest.available) {
  console.log("✅ [AI-Text] Plugin ai-text-plugin disponível");
} else {
  console.warn("⚠️⚠️ [AI-Text] Plugin ai-text-plugin NÃO disponível");
  console.warn("   Adicione no List Panel: ai = {import:ai-text-plugin}");
}
const aiTextTest$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  aiTextTest
}, Symbol.toStringTag, { value: "Module" }));
const RESOLUTION_MAP = {
  "square": "512x512",
  "wide": "768x512",
  "tall": "512x768",
  "hd": "1024x576",
  "portrait": "576x1024"
};
const isAvailable = () => !!root.aiImage;
const createImageContainer = (id, parent) => {
  const container2 = document.createElement("div");
  if (id) container2.id = id;
  container2.style.display = "flex";
  container2.style.flexWrap = "wrap";
  container2.style.gap = "10px";
  container2.style.justifyContent = "center";
  container2.style.padding = "10px";
  if (parent) {
    parent.appendChild(container2);
  }
  return container2;
};
const generateImage = (options = {}) => {
  return new Promise((resolve, reject) => {
    if (!isAvailable()) {
      const error = new Error("Plugin advanced-ai-image-plugin não disponível. Verifique se aiImage = {import:advanced-ai-image-plugin} está no List Panel.");
      console.error("❌ [AI-Image]", error.message);
      return reject(error);
    }
    if (!options.prompt || typeof options.prompt !== "string" || options.prompt.trim() === "") {
      const error = new Error("Prompt é obrigatório e não pode ser vazio");
      console.error("❌ [AI-Image]", error.message);
      return reject(error);
    }
    const startTime = Date.now();
    console.log("🎨 [AI-Image] Iniciando geração de imagem...", { prompt: options.prompt.substring(0, 50) + "..." });
    const resolution = RESOLUTION_MAP[options.resolution] || options.resolution || "512x512";
    const negativePrompt = options.negativePrompt || "";
    const pluginOptions = {
      ...options,
      prompt: options.prompt,
      // Passa o prompt original, o plugin vai processar
      negativePrompt,
      resolution,
      seed: options.seed === "random" || !options.seed ? "random" : options.seed,
      fragment: options.fragment !== false,
      // Padrão: true
      context: options.context || {},
      // Isolamento de contexto
      findContainer: options.findContainer || (options.container ? () => {
        const el = typeof options.container === "string" ? document.querySelector(options.container) : options.container;
        return el;
      } : null)
    };
    const userPreprocess = options.preprocess;
    pluginOptions.preprocess = function(inputs) {
      if (options.defaultQualityTags && typeof options.defaultQualityTags === "string") {
        inputs.prompt = `${inputs.prompt}, ${options.defaultQualityTags}`;
      }
      if (options.defaultNegativePrompt && typeof options.defaultNegativePrompt === "string") {
        if (!inputs.negativeprompt || inputs.negativeprompt.trim() === "") {
          inputs.negativeprompt = options.defaultNegativePrompt;
        }
      }
      if (typeof userPreprocess === "function") {
        try {
          userPreprocess(inputs);
        } catch (err) {
          console.warn("⚠️ [AI-Image] Erro no hook preprocess do usuário:", err);
        }
      }
    };
    const userPostprocess = options.postprocess;
    if (typeof userPostprocess === "function") {
      pluginOptions.postprocess = function(inputs) {
        try {
          userPostprocess(inputs);
        } catch (err) {
          console.warn("⚠️ [AI-Image] Erro no hook postprocess do usuário:", err);
        }
      };
    }
    const userOnStart = options.onStart;
    pluginOptions.onStart = function(result) {
      console.log("🚀 [AI-Image] onStart chamado pelo plugin");
      if (typeof userOnStart === "function") {
        try {
          userOnStart(result);
        } catch (err) {
          console.warn("⚠️ [AI-Image] Erro no callback onStart do usuário:", err);
        }
      }
    };
    const userOnFinish = options.onFinish;
    pluginOptions.onFinish = function(data) {
      const generationTime = Date.now() - startTime;
      console.log("✅ [AI-Image] Geração concluída em", generationTime, "ms");
      const inputs = data.inputs || {};
      const finalPrompt = inputs.prompt || data.prompt || options.prompt;
      const finalSeed = inputs.seed || data.seed || options.seed;
      const finalNegativePrompt = inputs.negativeprompt || data.negativeprompt || negativePrompt;
      if (typeof userOnFinish === "function") {
        try {
          userOnFinish(data);
        } catch (err) {
          console.warn("⚠️ [AI-Image] Erro no callback onFinish do usuário:", err);
        }
      }
      resolve({
        success: true,
        url: data.dataUrl || data.src || data.url,
        seed: finalSeed,
        generationTime,
        finalPrompt,
        negativePrompt: finalNegativePrompt,
        resolution,
        element: data.element || null,
        metadata: data
      });
    };
    delete pluginOptions.onChunk;
    delete pluginOptions.defaultQualityTags;
    delete pluginOptions.defaultNegativePrompt;
    delete pluginOptions.onAllFinish;
    try {
      const result = root.aiImage(pluginOptions);
      if (result && result.fragment) {
        const containerSelector = options.outputTo || options.container;
        let container2 = null;
        if (containerSelector) {
          if (typeof containerSelector === "string") {
            container2 = document.querySelector(containerSelector);
          } else if (containerSelector instanceof HTMLElement) {
            container2 = containerSelector;
          }
        }
        if (container2) {
          container2.innerHTML = "";
          container2.appendChild(result.fragment);
          console.log("🖼️\r [AI-Image] Fragment anexado ao container:", container2.id || containerSelector);
        } else {
          console.warn("⚠️\r [AI-Image] Container não encontrado para anexar fragment:", containerSelector);
        }
      }
      if (result && typeof result.then === "function") {
        result.catch((err) => {
          console.error("❌ [AI-Image] Erro na Promise do plugin:", err);
          reject(err);
        });
      }
    } catch (err) {
      console.error("❌ [AI-Image] Erro ao chamar o plugin:", err);
      reject(err);
    }
  });
};
const generateBatch = (options = {}, count = 1) => {
  return new Promise((resolve, reject) => {
    if (!isAvailable()) {
      const error = new Error("Plugin advanced-ai-image-plugin não disponível");
      console.error("❌ [AI-Image]", error.message);
      return reject(error);
    }
    if (!Number.isInteger(count) || count < 1 || count > 10) {
      const error = new Error("Count deve ser um inteiro entre 1 e 10");
      console.error("❌ [AI-Image]", error.message);
      return reject(error);
    }
    if (!options.prompt || typeof options.prompt !== "string" || options.prompt.trim() === "") {
      const error = new Error("Prompt é obrigatório e não pode ser vazio");
      console.error("❌ [AI-Image]", error.message);
      return reject(error);
    }
    const startTime = Date.now();
    console.log(`🎨 [AI-Image] Iniciando geração em lote de ${count} imagens...`);
    let completedCount = 0;
    const negativePrompt = options.negativePrompt || "";
    const pluginOptions = {
      ...options,
      prompt: options.prompt,
      negativePrompt,
      resolution: RESOLUTION_MAP[options.resolution] || options.resolution || "512x512",
      seed: options.seed === "random" || !options.seed ? "random" : options.seed,
      fragment: options.fragment !== false,
      context: options.context || {},
      findContainer: options.findContainer || (options.container ? () => {
        const el = typeof options.container === "string" ? document.querySelector(options.container) : options.container;
        return el;
      } : null)
    };
    const userPreprocess = options.preprocess;
    pluginOptions.preprocess = function(inputs) {
      if (options.defaultQualityTags && typeof options.defaultQualityTags === "string") {
        inputs.prompt = `${inputs.prompt}, ${options.defaultQualityTags}`;
      }
      if (options.defaultNegativePrompt && typeof options.defaultNegativePrompt === "string") {
        if (!inputs.negativeprompt || inputs.negativeprompt.trim() === "") {
          inputs.negativeprompt = options.defaultNegativePrompt;
        }
      }
      if (typeof userPreprocess === "function") {
        try {
          userPreprocess(inputs);
        } catch (err) {
          console.warn("⚠️ [AI-Image] Erro no hook preprocess do usuário:", err);
        }
      }
    };
    const userPostprocess = options.postprocess;
    if (typeof userPostprocess === "function") {
      pluginOptions.postprocess = function(inputs) {
        try {
          userPostprocess(inputs);
        } catch (err) {
          console.warn("⚠️ [AI-Image] Erro no hook postprocess do usuário:", err);
        }
      };
    }
    const userOnStart = options.onStart;
    pluginOptions.onStart = function(result) {
      console.log("🚀 [AI-Image] onStart chamado pelo plugin (batch)");
      if (typeof userOnStart === "function") {
        try {
          userOnStart(result);
        } catch (err) {
          console.warn("⚠️ [AI-Image] Erro no callback onStart do usuário:", err);
        }
      }
    };
    const userOnFinish = options.onFinish;
    pluginOptions.onFinish = function(data) {
      completedCount++;
      console.log(`📊 [AI-Image] Progresso: ${completedCount}/${count}`);
      if (typeof userOnFinish === "function") {
        try {
          userOnFinish(data, completedCount, count);
        } catch (err) {
          console.warn("⚠️ [AI-Image] Erro no callback onFinish do usuário:", err);
        }
      }
    };
    const userOnAllFinish = options.onAllFinish;
    pluginOptions.onAllFinish = function(dataArray) {
      const generationTime = Date.now() - startTime;
      console.log(`✅ [AI-Image] Lote completo: ${dataArray.length} imagens em ${generationTime}ms`);
      if (typeof userOnAllFinish === "function") {
        try {
          userOnAllFinish(dataArray);
        } catch (err) {
          console.warn("⚠️ [AI-Image] Erro no callback onAllFinish do usuário:", err);
        }
      }
      const mappedResults = dataArray.map((data, index) => {
        const inputs = data.inputs || {};
        const finalPrompt = inputs.prompt || data.prompt || options.prompt;
        const finalSeed = inputs.seed || data.seed || options.seed;
        const finalNegativePrompt = inputs.negativeprompt || data.negativeprompt || negativePrompt;
        return {
          success: true,
          url: data.dataUrl || data.src || data.url,
          seed: finalSeed,
          generationTime,
          finalPrompt,
          negativePrompt: finalNegativePrompt,
          resolution: pluginOptions.resolution,
          element: data.element || null,
          metadata: data,
          index
        };
      });
      resolve(mappedResults);
    };
    delete pluginOptions.onChunk;
    delete pluginOptions.defaultQualityTags;
    delete pluginOptions.defaultNegativePrompt;
    try {
      const result = root.aiImage(pluginOptions, count);
      if (result && result.fragment) {
        const containerSelector = options.outputTo || options.container;
        let container2 = null;
        if (containerSelector) {
          if (typeof containerSelector === "string") {
            container2 = document.querySelector(containerSelector);
          } else if (containerSelector instanceof HTMLElement) {
            container2 = containerSelector;
          }
        }
        if (container2) {
          container2.innerHTML = "";
          container2.appendChild(result.fragment);
          console.log("🖼️\r [AI-Image] Fragment do lote anexado ao container:", container2.id || containerSelector);
        } else {
          console.warn("⚠️\r [AI-Image] Container não encontrado para anexar fragment do lote:", containerSelector);
        }
      }
      if (result && typeof result.then === "function") {
        result.catch((err) => {
          console.error("❌ [AI-Image] Erro na Promise do plugin:", err);
          reject(err);
        });
      }
    } catch (err) {
      console.error("❌ [AI-Image] Erro ao chamar o plugin:", err);
      reject(err);
    }
  });
};
const aiImageTest = {
  available: isAvailable(),
  // Teste 1: Geração única com metadados
  async testSingleGeneration(contentArea = document.body) {
    console.log("🖼️ [AI-Image] Testando geração única...");
    if (!this.available) {
      return { success: false, error: "Plugin aiImage não disponível" };
    }
    try {
      const containerId = "test-image-container-single";
      let container2 = document.getElementById(containerId);
      if (!container2) {
        container2 = createImageContainer(containerId, contentArea);
      } else {
        if (container2.parentElement !== contentArea) {
          contentArea.appendChild(container2);
        }
      }
      container2.innerHTML = "";
      const startTime = Date.now();
      const result = await generateImage({
        prompt: "a beautiful sunset over mountains",
        resolution: "square",
        outputTo: `#${containerId}`,
        seed: "random",
        onStart: (data) => {
          console.log("🚀 [AI-Image] onStart chamado:", data);
        },
        onFinish: (data) => {
          console.log("✅ [AI-Image] onFinish chamado:", data);
        }
      });
      const elapsedTime2 = Date.now() - startTime;
      if (!result.success) {
        return { success: false, error: result.error || "Falha na geração" };
      }
      if (!result.seed || typeof result.seed !== "string" && typeof result.seed !== "number") {
        return { success: false, error: "Seed inválido ou ausente" };
      }
      if (!result.generationTime || result.generationTime <= 0) {
        return { success: false, error: "Tempo de geração inválido" };
      }
      if (!result.finalPrompt || result.finalPrompt.length === 0) {
        return { success: false, error: "Prompt final ausente" };
      }
      const imgElement = container2.querySelector("img, iframe");
      if (!imgElement) {
        return { success: false, error: "Elemento de imagem não encontrado no DOM" };
      }
      console.log("✅ [AI-Image] Geração única bem-sucedida:", {
        seed: result.seed,
        time: result.generationTime,
        prompt: result.finalPrompt.substring(0, 50) + "..."
      });
      return {
        success: true,
        data: {
          seed: result.seed,
          generationTime: result.generationTime,
          promptLength: result.finalPrompt.length,
          domElementFound: !!imgElement,
          totalTime: elapsedTime2
        }
      };
    } catch (error) {
      console.error("❌ [AI-Image] Erro no testSingleGeneration:", error);
      return { success: false, error: error.message };
    }
  },
  // Teste 2: Geração em lote
  async testBatchGeneration(contentArea = document.body) {
    console.log("🖼️ [AI-Image] Testando geração em lote...");
    if (!this.available) {
      return { success: false, error: "Plugin aiImage não disponível" };
    }
    try {
      const containerId = "test-image-container-batch";
      let container2 = document.getElementById(containerId);
      if (!container2) {
        container2 = createImageContainer(containerId, contentArea);
      } else {
        if (container2.parentElement !== contentArea) {
          contentArea.appendChild(container2);
        }
      }
      container2.innerHTML = "";
      const count = 2;
      let onAllFinishCalled = false;
      let finishedCount = 0;
      const startTime = Date.now();
      const results = await generateBatch({
        prompt: "a cute cat playing with yarn",
        resolution: "wide",
        outputTo: `#${containerId}`,
        orderByFinished: true,
        seed: "random",
        onFinish: (data) => {
          finishedCount++;
          console.log(`✅ [AI-Image] Imagem ${finishedCount}/${count} finalizada`);
        },
        onAllFinish: (allData) => {
          onAllFinishCalled = true;
          console.log("🎉 [AI-Image] onAllFinish chamado com", allData.length, "resultados");
        }
      }, count);
      const elapsedTime2 = Date.now() - startTime;
      if (!results || results.length !== count) {
        return { success: false, error: `Esperado ${count} resultados, recebido ${(results == null ? void 0 : results.length) || 0}` };
      }
      if (!onAllFinishCalled) {
        return { success: false, error: "onAllFinish não foi chamado" };
      }
      for (let i = 0; i < results.length; i++) {
        const r = results[i];
        if (!r.success) {
          return { success: false, error: `Resultado ${i} falhou: ${r.error}` };
        }
        if (!r.seed || typeof r.seed !== "string" && typeof r.seed !== "number" || !r.generationTime || !r.finalPrompt) {
          return { success: false, error: `Resultado ${i} tem metadados inválidos` };
        }
      }
      const imgElements = container2.querySelectorAll("img, iframe");
      if (imgElements.length !== count) {
        return { success: false, error: `Esperado ${count} elementos no DOM, encontrado ${imgElements.length}` };
      }
      console.log("✅ [AI-Image] Geração em lote bem-sucedida:", {
        count: results.length,
        totalTime: elapsedTime2
      });
      return {
        success: true,
        data: {
          count: results.length,
          allFinishedCalled: onAllFinishCalled,
          domElementsFound: imgElements.length,
          totalTime: elapsedTime2,
          seeds: results.map((r) => r.seed)
        }
      };
    } catch (error) {
      console.error("❌ [AI-Image] Erro no testBatchGeneration:", error);
      return { success: false, error: error.message };
    }
  },
  // Teste 3: Processamento de prompt (hooks e tags padrão)
  async testPromptProcessing(contentArea = document.body) {
    console.log("🖼️ [AI-Image] Testando processamento de prompt...");
    if (!this.available) {
      return { success: false, error: "Plugin aiImage não disponível" };
    }
    try {
      const containerId = "test-image-container-processing";
      let container2 = document.getElementById(containerId);
      if (!container2) {
        container2 = createImageContainer(containerId, contentArea);
      } else {
        if (container2.parentElement !== contentArea) {
          contentArea.appendChild(container2);
        }
      }
      container2.innerHTML = "";
      let preprocessCalled = false;
      let postprocessCalled = false;
      const result = await generateImage({
        prompt: "a simple red circle",
        resolution: "square",
        outputTo: `#${containerId}`,
        defaultQualityTags: "masterpiece, best quality, highres",
        defaultNegativePrompt: "blurry, lowres, bad anatomy",
        preprocess: (inputs, context) => {
          preprocessCalled = true;
          console.log("🔧 [AI-Image] preprocess chamado:", inputs.prompt ? inputs.prompt.substring(0, 50) : "sem prompt");
        },
        postprocess: (inputs, context) => {
          postprocessCalled = true;
          console.log("🔧 [AI-Image] postprocess chamado:", inputs.prompt ? inputs.prompt.substring(0, 50) : "sem prompt");
        }
      });
      if (!result.success) {
        return { success: false, error: result.error || "Falha na geração" };
      }
      if (!preprocessCalled) {
        return { success: false, error: "Hook preprocess não foi chamado" };
      }
      if (!postprocessCalled) {
        return { success: false, error: "Hook postprocess não foi chamado" };
      }
      const finalPrompt = result.finalPrompt || "";
      const hasQualityTags = finalPrompt.includes("masterpiece") || finalPrompt.includes("best quality");
      const hasNegativePrompt = finalPrompt.includes("blurry") || finalPrompt.includes("lowres");
      console.log("✅ [AI-Image] Processamento de prompt bem-sucedido:", {
        preprocessCalled,
        postprocessCalled,
        hasQualityTags,
        hasNegativePrompt,
        finalPromptLength: finalPrompt.length
      });
      return {
        success: true,
        data: {
          preprocessCalled,
          postprocessCalled,
          hasQualityTags,
          hasNegativePrompt,
          finalPrompt: finalPrompt.substring(0, 100) + "..."
        }
      };
    } catch (error) {
      console.error("❌ [AI-Image] Erro no testPromptProcessing:", error);
      return { success: false, error: error.message };
    }
  },
  // Teste 4: Tratamento de erros
  async testErrorHandling() {
    console.log("🖼️ [AI-Image] Testando tratamento de erros...");
    if (!this.available) {
      return { success: false, error: "Plugin aiImage não disponível" };
    }
    const errors = [];
    try {
      const result = await generateImage({
        prompt: "",
        resolution: "square"
      });
      if (result.success) {
        errors.push("Prompt vazio não gerou erro");
      } else {
        console.log("✅ [AI-Image] Prompt vazio tratado corretamente:", result.error);
      }
    } catch (error) {
      console.log("✅ [AI-Image] Prompt vazio lançou exceção:", error.message);
    }
    try {
      const result = await generateImage({
        prompt: "test",
        resolution: "invalid_resolution"
      });
      console.log("✅ [AI-Image] Resolução inválida tratada:", result.success ? "aceita" : "rejeitada");
    } catch (error) {
      console.log("✅ [AI-Image] Resolução inválida lançou exceção:", error.message);
    }
    try {
      const result = await generateImage({
        prompt: "test",
        resolution: "square",
        outputTo: "#non-existent-container-12345"
      });
      if (result.success) {
        errors.push("Container inexistente não gerou erro");
      } else {
        console.log("✅ [AI-Image] Container inexistente tratado corretamente:", result.error);
      }
    } catch (error) {
      console.log("✅ [AI-Image] Container inexistente lançou exceção:", error.message);
    }
    if (errors.length > 0) {
      return { success: false, error: errors.join("; ") };
    }
    console.log("✅ [AI-Image] Tratamento de erros bem-sucedido");
    return { success: true, data: { message: "Todos os cenários de erro foram tratados" } };
  }
};
console.log("🖼️ [AI-Image] Inicializando teste do plugin de imagem IA...");
if (aiImageTest.available) {
  console.log("✅ [AI-Image] Plugin advanced-ai-image-plugin disponível");
} else {
  console.warn("⚠️⚠️⚠️⚠️ [AI-Image] Plugin advanced-ai-image-plugin NÃO disponível");
  console.warn("   Adicione no List Panel: aiImage = {import:advanced-ai-image-plugin}");
}
const aiImageTest$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  aiImageTest
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
    this.raycaster = new THREE$1.Raycaster();
    this.mouse = new THREE$1.Vector2();
    const { scene, camera, renderer } = rendererData;
    const colors = [16739179, 5164484, 16770669, 9822675];
    for (let i = 0; i < 4; i++) {
      const geometry2 = new THREE$1.SphereGeometry(0.5, 16, 16);
      const material2 = new THREE$1.MeshStandardMaterial({
        color: colors[i],
        roughness: 0.3,
        metalness: 0.7
      });
      const sphere = new THREE$1.Mesh(geometry2, material2);
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
let currentContainer$1 = null;
const canvasTest = {
  available: true,
  canvas2D: null,
  ctx: null,
  threeIntegration: null,
  // Cria ou reutiliza o container modal
  _getOrCreateContainer(title) {
    if (currentContainer$1) {
      currentContainer$1.close();
    }
    currentContainer$1 = createTestContainer(title, {
      width: 700,
      height: 650,
      onClose: () => {
        this.cleanup();
        currentContainer$1 = null;
        console.log("🗑️ [Canvas] Container fechado");
      }
    });
    return currentContainer$1;
  },
  init(rendererData) {
    console.log("🎨 [Canvas] Initializing Canvas 2D test...");
    const { contentArea } = this._getOrCreateContainer("🎨 Canvas 2D Test");
    this.canvas2D = document.createElement("canvas");
    this.canvas2D.width = 512;
    this.canvas2D.height = 512;
    this.canvas2D.style.cssText = "border-radius: 4px; width: 100%; height: auto; max-width: 512px; display: block; margin: 0 auto;";
    this.ctx = this.canvas2D.getContext("2d");
    contentArea.innerHTML = "";
    contentArea.appendChild(this.canvas2D);
    console.log("✅ [Canvas] Canvas 2D created (512x512)");
    if (rendererData && rendererData.scene) {
      console.log("🎨 [Canvas] Integrating with Three.js...");
      const texture = new THREE$1.CanvasTexture(this.canvas2D);
      texture.needsUpdate = true;
      const geometry2 = new THREE$1.PlaneGeometry(4, 4);
      const material2 = new THREE$1.MeshBasicMaterial({
        map: texture,
        side: THREE$1.DoubleSide,
        transparent: true
      });
      const plane = new THREE$1.Mesh(geometry2, material2);
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
  close() {
    if (currentContainer$1) {
      currentContainer$1.close();
      currentContainer$1 = null;
      console.log("🗑️ [Canvas] Container fechado manualmente");
    }
  },
  cleanup() {
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
function cleanup$4() {
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
  cleanup: cleanup$4,
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
function isReady$3() {
  return mermaidReady;
}
function isLoading$3() {
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
function cleanup$3() {
  console.log(`🧹 [Mermaid] Cleanup (note: CDN script remains in DOM for reuse)`);
}
const mermaidTest = {
  preloadMermaid,
  getMermaid,
  isReady: isReady$3,
  isLoading: isLoading$3,
  renderDiagram,
  renderAllExamples,
  setTheme,
  cleanup: cleanup$3,
  DIAGRAMS
};
const mermaidTest$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  cleanup: cleanup$3,
  isLoading: isLoading$3,
  isReady: isReady$3,
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
function isReady$2() {
  return matterReady;
}
function isLoading$2() {
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
  document.getElementById("matter-close").addEventListener("click", cleanup$2);
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
function cleanup$2() {
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
  cleanup: cleanup$2,
  initPhysics,
  isLoading: isLoading$2,
  isReady: isReady$2,
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
function isReady$1() {
  return cannonReady;
}
function isLoading$1() {
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
  document.getElementById("cannon-close").addEventListener("click", cleanup$1);
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
    sceneRef$1 = new THREE$1.Scene();
    sceneRef$1.background = new THREE$1.Color(1710638);
    cameraRef = new THREE$1.PerspectiveCamera(60, width / height, 0.1, 100);
    cameraRef.position.set(8, 8, 8);
    cameraRef.lookAt(0, 0, 0);
    rendererRef = new THREE$1.WebGLRenderer({ antialias: true });
    rendererRef.setSize(width, height);
    rendererRef.setPixelRatio(window.devicePixelRatio);
    canvasContainer.appendChild(rendererRef.domElement);
    const ambientLight = new THREE$1.AmbientLight(4210752, 2);
    sceneRef$1.add(ambientLight);
    const directionalLight = new THREE$1.DirectionalLight(16777215, 1.5);
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
    const gridHelper = new THREE$1.GridHelper(20, 20, 4868682, 2763306);
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
  const geometry2 = new THREE$1.SphereGeometry(radius, 16, 16);
  const material2 = new THREE$1.MeshPhongMaterial({ color });
  const mesh = new THREE$1.Mesh(geometry2, material2);
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
  const geometry2 = new THREE$1.BoxGeometry(size, size, size);
  const material2 = new THREE$1.MeshPhongMaterial({ color });
  const mesh = new THREE$1.Mesh(geometry2, material2);
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
function cleanup$1() {
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
  cleanup: cleanup$1,
  initPhysics3D,
  isLoading: isLoading$1,
  isReady: isReady$1,
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
  const color = new THREE$1.Color();
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
  const geom = new THREE$1.BufferGeometry();
  geom.setAttribute("position", new THREE$1.BufferAttribute(positions, 3));
  geom.setAttribute("aVelocity", new THREE$1.BufferAttribute(velocities, 3));
  geom.setAttribute("aColor", new THREE$1.BufferAttribute(colors, 3));
  geom.setAttribute("aSize", new THREE$1.BufferAttribute(sizes, 1));
  geom.setAttribute("aLife", new THREE$1.BufferAttribute(lives, 1));
  return geom;
}
function createMaterial() {
  return new THREE$1.ShaderMaterial({
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
    blending: THREE$1.NormalBlending
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
  particles = new THREE$1.Points(geometry, material);
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
const PRESETS = {
  life: { born: [3], survive: [2, 3], name: "Game of Life" },
  seeds: { born: [2], survive: [], name: "Seeds" },
  dayNight: { born: [3, 6, 7, 8], survive: [3, 4, 6, 7, 8], name: "Day & Night" },
  highLife: { born: [3, 6], survive: [2, 3], name: "HighLife" },
  replicator: { born: [1, 3, 5, 7], survive: [1, 3, 5, 7], name: "Replicator" }
};
let currentContainer = null;
const cellularAutomataTest = {
  available: true,
  canvas: null,
  ctx: null,
  imageData: null,
  gridCurrent: null,
  gridNext: null,
  cols: 0,
  rows: 0,
  cellSize: 4,
  animationId: null,
  running: false,
  generation: 0,
  fps: 30,
  lastFrameTime: 0,
  rule: PRESETS.life,
  threeIntegration: null,
  _getOrCreateContainer(title) {
    if (currentContainer) {
      currentContainer.close();
    }
    currentContainer = createTestContainer(title, {
      width: 750,
      height: 700,
      onClose: () => {
        this.cleanup();
        currentContainer = null;
        console.log("🗑️ [CellularAutomata] Container fechado");
      }
    });
    return currentContainer;
  },
  init(rendererData) {
    console.log("🧬 [CellularAutomata] Initializing...");
    const { contentArea } = this._getOrCreateContainer("🧬 Cellular Automata");
    this.canvas = document.createElement("canvas");
    this.canvas.width = 512;
    this.canvas.height = 512;
    this.canvas.style.cssText = "border-radius: 4px; width: 100%; height: auto; max-width: 512px; display: block; margin: 0 auto; cursor: crosshair; image-rendering: pixelated;";
    this.ctx = this.canvas.getContext("2d", { willReadFrequently: true });
    this.cols = Math.floor(this.canvas.width / this.cellSize);
    this.rows = Math.floor(this.canvas.height / this.cellSize);
    this.gridCurrent = new Uint8Array(this.cols * this.rows);
    this.gridNext = new Uint8Array(this.cols * this.rows);
    this.imageData = this.ctx.createImageData(this.canvas.width, this.canvas.height);
    this._buildControls(contentArea);
    contentArea.appendChild(this.canvas);
    this.randomize(0.3);
    this._render();
    this.canvas.addEventListener("click", (e) => this._handleCanvasClick(e));
    if (rendererData && rendererData.scene && typeof THREE !== "undefined") {
      this._initThreeIntegration(rendererData);
    }
    console.log(`✅ [CellularAutomata] Grid ${this.cols}x${this.rows}, cell=${this.cellSize}px`);
  },
  _buildControls(container2) {
    const controls = document.createElement("div");
    controls.style.cssText = "display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; align-items: center; justify-content: center;";
    const btnStyle = "padding: 4px 10px; border: 1px solid #555; border-radius: 4px; background: #2a2a2a; color: #eee; cursor: pointer; font-size: 12px;";
    const btnPlay = document.createElement("button");
    btnPlay.textContent = "▶ Play";
    btnPlay.style.cssText = btnStyle;
    btnPlay.onclick = () => {
      if (this.running) {
        this.stop();
        btnPlay.textContent = "▶ Play";
      } else {
        this.start();
        btnPlay.textContent = "⏸ Pause";
      }
    };
    const btnStep = document.createElement("button");
    btnStep.textContent = "⏭ Step";
    btnStep.style.cssText = btnStyle;
    btnStep.onclick = () => {
      this.stop();
      btnPlay.textContent = "▶ Play";
      this.step();
    };
    const btnRandom = document.createElement("button");
    btnRandom.textContent = "🎲 Random";
    btnRandom.style.cssText = btnStyle;
    btnRandom.onclick = () => this.randomize(0.3);
    const btnClear = document.createElement("button");
    btnClear.textContent = "🗑 Clear";
    btnClear.style.cssText = btnStyle;
    btnClear.onclick = () => this.clear();
    const selectRule = document.createElement("select");
    selectRule.style.cssText = "padding: 4px; border-radius: 4px; background: #2a2a2a; color: #eee; border: 1px solid #555; font-size: 12px;";
    for (const [key, preset] of Object.entries(PRESETS)) {
      const opt = document.createElement("option");
      opt.value = key;
      opt.textContent = preset.name;
      selectRule.appendChild(opt);
    }
    selectRule.onchange = () => this.setRule(selectRule.value);
    const lblSpeed = document.createElement("label");
    lblSpeed.style.cssText = "color: #ccc; font-size: 12px; display: flex; align-items: center; gap: 4px;";
    lblSpeed.textContent = "FPS: ";
    const sliderSpeed = document.createElement("input");
    sliderSpeed.type = "range";
    sliderSpeed.min = "1";
    sliderSpeed.max = "60";
    sliderSpeed.value = String(this.fps);
    sliderSpeed.style.width = "80px";
    const spanFps = document.createElement("span");
    spanFps.textContent = String(this.fps);
    spanFps.style.cssText = "min-width: 20px; color: #aaa; font-size: 12px;";
    sliderSpeed.oninput = () => {
      this.fps = parseInt(sliderSpeed.value, 10);
      spanFps.textContent = String(this.fps);
    };
    lblSpeed.appendChild(sliderSpeed);
    lblSpeed.appendChild(spanFps);
    const spanGen = document.createElement("span");
    spanGen.id = "ca-gen-counter";
    spanGen.style.cssText = "color: #aaa; font-size: 12px; min-width: 60px; text-align: right;";
    spanGen.textContent = "Gen: 0";
    controls.append(btnPlay, btnStep, btnRandom, btnClear, selectRule, lblSpeed, spanGen);
    container2.appendChild(controls);
  },
  setRule(presetKey) {
    const preset = PRESETS[presetKey];
    if (!preset) {
      console.warn(`[CellularAutomata] Unknown preset: ${presetKey}`);
      return;
    }
    this.rule = preset;
    console.log(`🧬 [CellularAutomata] Rule set to ${preset.name} (B${preset.born.join("")}/S${preset.survive.join("")})`);
  },
  randomize(density = 0.3) {
    for (let i = 0; i < this.gridCurrent.length; i++) {
      this.gridCurrent[i] = Math.random() < density ? 1 : 0;
    }
    this.generation = 0;
    this._updateGenCounter();
    this._render();
    console.log(`🎲 [CellularAutomata] Randomized (density=${density})`);
  },
  clear() {
    this.gridCurrent.fill(0);
    this.generation = 0;
    this._updateGenCounter();
    this._render();
    console.log("🗑️ [CellularAutomata] Grid cleared");
  },
  step() {
    const { cols, rows, gridCurrent, gridNext, rule } = this;
    const bornSet = new Set(rule.born);
    const surviveSet = new Set(rule.survive);
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        let neighbors = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const nx = (x + dx + cols) % cols;
            const ny = (y + dy + rows) % rows;
            neighbors += gridCurrent[ny * cols + nx];
          }
        }
        const idx = y * cols + x;
        const alive = gridCurrent[idx] === 1;
        gridNext[idx] = (alive ? surviveSet.has(neighbors) : bornSet.has(neighbors)) ? 1 : 0;
      }
    }
    const temp = this.gridCurrent;
    this.gridCurrent = this.gridNext;
    this.gridNext = temp;
    this.generation++;
    this._updateGenCounter();
    this._render();
  },
  start() {
    if (this.running) return;
    this.running = true;
    this.lastFrameTime = performance.now();
    this._loop();
    console.log("▶ [CellularAutomata] Started");
  },
  stop() {
    this.running = false;
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    console.log("⏸ [CellularAutomata] Stopped");
  },
  _loop() {
    if (!this.running) return;
    this.animationId = requestAnimationFrame((now) => {
      const interval = 1e3 / this.fps;
      if (now - this.lastFrameTime >= interval) {
        this.step();
        this.lastFrameTime = now;
      }
      this._loop();
    });
  },
  _render() {
    if (!this.ctx || !this.imageData) return;
    const data = this.imageData.data;
    const { cols, rows, cellSize, gridCurrent } = this;
    const w = this.canvas.width;
    data.fill(0);
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (gridCurrent[y * cols + x] === 0) continue;
        const px = x * cellSize;
        const py = y * cellSize;
        for (let dy = 0; dy < cellSize; dy++) {
          for (let dx = 0; dx < cellSize; dx++) {
            const i = ((py + dy) * w + (px + dx)) * 4;
            data[i] = 100;
            data[i + 1] = 220;
            data[i + 2] = 100;
            data[i + 3] = 255;
          }
        }
      }
    }
    this.ctx.putImageData(this.imageData, 0, 0);
    if (this.threeIntegration) {
      this.threeIntegration.update();
    }
  },
  _handleCanvasClick(e) {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const cx = Math.floor((e.clientX - rect.left) * scaleX / this.cellSize);
    const cy = Math.floor((e.clientY - rect.top) * scaleY / this.cellSize);
    if (cx >= 0 && cx < this.cols && cy >= 0 && cy < this.rows) {
      const idx = cy * this.cols + cx;
      this.gridCurrent[idx] = this.gridCurrent[idx] ? 0 : 1;
      this._render();
    }
  },
  _updateGenCounter() {
    const el = document.getElementById("ca-gen-counter");
    if (el) el.textContent = `Gen: ${this.generation}`;
  },
  _initThreeIntegration(rendererData) {
    try {
      const texture = new THREE.CanvasTexture(this.canvas);
      texture.needsUpdate = true;
      texture.magFilter = THREE.NearestFilter;
      texture.minFilter = THREE.NearestFilter;
      const geometry2 = new THREE.PlaneGeometry(4, 4);
      const material2 = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide, transparent: true });
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
        },
        hide: () => {
          plane.visible = false;
        },
        update: () => {
          texture.needsUpdate = true;
        }
      };
      console.log("✅ [CellularAutomata] Three.js integration ready");
    } catch (err) {
      console.warn("[CellularAutomata] Three.js integration failed:", err.message);
    }
  },
  cleanup() {
    var _a, _b, _c, _d;
    this.stop();
    if (this.threeIntegration && this.threeIntegration.plane) {
      (_a = this.threeIntegration.plane.parent) == null ? void 0 : _a.remove(this.threeIntegration.plane);
      (_b = this.threeIntegration.plane.geometry) == null ? void 0 : _b.dispose();
      (_c = this.threeIntegration.plane.material) == null ? void 0 : _c.dispose();
      (_d = this.threeIntegration.texture) == null ? void 0 : _d.dispose();
    }
    this.canvas = null;
    this.ctx = null;
    this.imageData = null;
    this.gridCurrent = null;
    this.gridNext = null;
    this.threeIntegration = null;
    console.log("🗑️ [CellularAutomata] Resources cleaned up");
  }
};
console.log("🧬 [CellularAutomata] Module loaded");
const cellularAutomataTest$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  cellularAutomataTest
}, Symbol.toStringTag, { value: "Module" }));
const DB_NAME = "TestPerchanceDB";
const DB_VERSION = 1;
const STORE_TEST_DATA = "test_data";
const STORE_AI_RESULTS = "ai_results";
const AI_LIMITS = { maxTexts: 3, maxImages: 3 };
const TEST_VALUES = {
  str_test: "Hello, IndexedDB!",
  num_int: 42,
  num_float: 3.14159,
  bool_val: true,
  obj_player: { name: "Hero", level: 5, inventory: ["sword", "potion"], stats: { hp: 100, mp: 50 } },
  arr_items: ["espada", "pocao", "mapa", "escudo"],
  null_val: null,
  date_val: /* @__PURE__ */ new Date("2024-01-15T10:30:00Z"),
  u8_val: new Uint8Array([1, 2, 3, 4, 5])
};
const indexeddbTest = {
  available: typeof indexedDB !== "undefined",
  db: null,
  // ─── Lifecycle ───
  async openDB() {
    if (this.db) return this.db;
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_TEST_DATA)) {
          db.createObjectStore(STORE_TEST_DATA);
        }
        if (!db.objectStoreNames.contains(STORE_AI_RESULTS)) {
          const aiStore = db.createObjectStore(STORE_AI_RESULTS, { keyPath: "key" });
          aiStore.createIndex("type", "type", { unique: false });
          aiStore.createIndex("timestamp", "timestamp", { unique: false });
        }
      };
      request.onsuccess = (e) => {
        this.db = e.target.result;
        console.log("✅ [IDB] Database opened");
        resolve(this.db);
      };
      request.onerror = (e) => {
        console.error("❌ [IDB] Open failed:", e.target.error);
        reject(e.target.error);
      };
    });
  },
  closeDB() {
    if (this.db) {
      this.db.close();
      this.db = null;
      console.log("🔒 [IDB] Database closed");
    }
  },
  async deleteDB() {
    this.closeDB();
    return new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase(DB_NAME);
      request.onsuccess = () => {
        console.log("🗑️ [IDB] Database deleted");
        resolve(true);
      };
      request.onerror = (e) => {
        console.error("❌ [IDB] Delete failed:", e.target.error);
        reject(e.target.error);
      };
    });
  },
  // ─── Generic Store Operations ───
  async _tx(storeName, mode) {
    const db = await this.openDB();
    return db.transaction(storeName, mode).objectStore(storeName);
  },
  async _request(req) {
    return new Promise((resolve, reject) => {
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  },
  async put(storeName, key, value) {
    const store = await this._tx(storeName, "readwrite");
    if (store.keyPath) {
      return this._request(store.put(value));
    }
    return this._request(store.put(value, key));
  },
  async get(storeName, key) {
    const store = await this._tx(storeName, "readonly");
    return this._request(store.get(key));
  },
  async getAllKeys(storeName) {
    const store = await this._tx(storeName, "readonly");
    return this._request(store.getAllKeys());
  },
  async getAll(storeName) {
    const store = await this._tx(storeName, "readonly");
    return this._request(store.getAll());
  },
  async deleteKey(storeName, key) {
    const store = await this._tx(storeName, "readwrite");
    return this._request(store.delete(key));
  },
  async clearStore(storeName) {
    const store = await this._tx(storeName, "readwrite");
    return this._request(store.clear());
  },
  async count(storeName) {
    const store = await this._tx(storeName, "readonly");
    return this._request(store.count());
  },
  // ─── Test Data Store ───
  async saveAllTypes() {
    const results = [];
    for (const [key, value] of Object.entries(TEST_VALUES)) {
      try {
        await this.put(STORE_TEST_DATA, key, value);
        results.push({ key, type: typeof value, saved: true });
      } catch (e) {
        results.push({ key, type: typeof value, saved: false, error: e.message });
      }
    }
    console.log(`✅ [IDB] Saved ${results.filter((r) => r.saved).length}/${results.length} types`);
    return results;
  },
  async roundTrip(key, value) {
    await this.put(STORE_TEST_DATA, key, value);
    const retrieved = await this.get(STORE_TEST_DATA, key);
    const match = JSON.stringify(value) === JSON.stringify(retrieved);
    return { key, saved: value, retrieved, match };
  },
  async runPrimitiveTestSuite() {
    console.log("🗃️ [IDB] Running primitive test suite...");
    await this.openDB();
    const saveResults = await this.saveAllTypes();
    const keys = await this.getAllKeys(STORE_TEST_DATA);
    const roundTrips = [];
    for (const [key, value] of Object.entries(TEST_VALUES)) {
      const retrieved = await this.get(STORE_TEST_DATA, key);
      const match = JSON.stringify(value) === JSON.stringify(retrieved);
      roundTrips.push({ key, expected: typeof value, saved: value, retrieved, match });
    }
    const deleteResult = await this.deleteKey(STORE_TEST_DATA, "str_test");
    const keysAfterDelete = await this.getAllKeys(STORE_TEST_DATA);
    const estimate = await this.getStorageEstimate();
    return {
      saved: saveResults,
      totalKeys: keys.length,
      roundTrips,
      deleteSuccess: !!deleteResult,
      keysAfterDelete: keysAfterDelete.length,
      storageEstimate: estimate
    };
  },
  // ─── AI Results Store ───
  async _enforceLimit(type) {
    const max = type === "text" ? AI_LIMITS.maxTexts : AI_LIMITS.maxImages;
    const all = await this.loadAIResults();
    const ofType = all.filter((r) => r.type === type).sort((a, b) => a.timestamp - b.timestamp);
    while (ofType.length >= max) {
      const oldest = ofType.shift();
      await this.deleteKey(STORE_AI_RESULTS, oldest.key);
    }
  },
  async saveAIText(text, metadata = {}) {
    await this._enforceLimit("text");
    const key = `ai_text_${Date.now()}`;
    const record = {
      key,
      type: "text",
      content: text,
      timestamp: Date.now(),
      metadata: { chars: text.length, ...metadata }
    };
    await this.put(STORE_AI_RESULTS, key, record);
    console.log(`✅ [IDB] AI text saved: ${key}`);
    return record;
  },
  async saveAIImage(dataUrl, metadata = {}) {
    await this._enforceLimit("image");
    const key = `ai_image_${Date.now()}`;
    const record = {
      key,
      type: "image",
      content: dataUrl,
      timestamp: Date.now(),
      metadata: { sizeKB: Math.round(dataUrl.length / 1024), ...metadata }
    };
    await this.put(STORE_AI_RESULTS, key, record);
    console.log(`✅ [IDB] AI image saved: ${key}`);
    return record;
  },
  async saveAIBatch(texts, images) {
    const results = { texts: [], images: [] };
    for (const t of (texts || []).slice(0, AI_LIMITS.maxTexts)) {
      results.texts.push(await this.saveAIText(t.text, t.metadata));
    }
    for (const img of (images || []).slice(0, AI_LIMITS.maxImages)) {
      results.images.push(await this.saveAIImage(img.dataUrl, img.metadata));
    }
    return results;
  },
  async loadAIResults() {
    const all = await this.getAll(STORE_AI_RESULTS);
    return all.sort((a, b) => b.timestamp - a.timestamp);
  },
  async loadAITexts() {
    const all = await this.loadAIResults();
    return all.filter((r) => r.type === "text");
  },
  async loadAIImages() {
    const all = await this.loadAIResults();
    return all.filter((r) => r.type === "image");
  },
  async clearAIResults() {
    await this.clearStore(STORE_AI_RESULTS);
    console.log("🗑️ [IDB] AI results cleared");
  },
  async getAIResultsCount() {
    const all = await this.loadAIResults();
    return {
      texts: all.filter((r) => r.type === "text").length,
      images: all.filter((r) => r.type === "image").length,
      total: all.length
    };
  },
  // ─── Cross-store ───
  async clearAll() {
    await this.openDB();
    await this.clearStore(STORE_TEST_DATA);
    await this.clearStore(STORE_AI_RESULTS);
    console.log("🗑️ [IDB] All stores cleared");
  },
  // ─── Diagnostics ───
  async getStorageEstimate() {
    if (!navigator.storage || !navigator.storage.estimate) {
      return { available: false };
    }
    const est = await navigator.storage.estimate();
    return {
      available: true,
      quota: (est.quota / (1024 * 1024)).toFixed(2) + " MB",
      usage: (est.usage / (1024 * 1024)).toFixed(4) + " MB",
      percent: (est.usage / est.quota * 100).toFixed(4) + "%"
    };
  },
  checkSupport() {
    return {
      indexedDB: typeof indexedDB !== "undefined",
      idbKeyRange: typeof IDBKeyRange !== "undefined",
      storageEstimate: !!(navigator.storage && navigator.storage.estimate)
    };
  }
};
console.log("🗃️ [IDB] IndexedDB test module loaded");
if (indexeddbTest.available) {
  console.log("✅ [IDB] IndexedDB available");
} else {
  console.warn("⚠️ [IDB] IndexedDB NOT available");
}
const indexeddbTest$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  indexeddbTest
}, Symbol.toStringTag, { value: "Module" }));
const GSAP_CDN_URL = "https://cdn.jsdelivr.net/npm/gsap@3.12/dist/gsap.min.js";
let gsapPromise = null;
let gsapReady = false;
let gsapInstance = null;
function preloadGsap() {
  if (gsapPromise) {
    return gsapPromise;
  }
  gsapPromise = new Promise((resolve, reject) => {
    console.log(`🎬 [GSAP] Starting background load from CDN...`);
    if (window.gsap) {
      gsapReady = true;
      gsapInstance = window.gsap;
      console.log(`✅ [GSAP] Already loaded (${VERSION})`);
      resolve(gsapInstance);
      return;
    }
    const script = document.createElement("script");
    script.src = GSAP_CDN_URL;
    script.async = true;
    script.onload = () => {
      gsapReady = true;
      gsapInstance = window.gsap;
      console.log(`✅ [GSAP] Loaded from CDN (${VERSION})`);
      resolve(gsapInstance);
    };
    script.onerror = () => {
      const error = new Error("Failed to load GSAP from CDN");
      console.error(`❌ [GSAP] ${error.message}`);
      reject(error);
    };
    document.head.appendChild(script);
  });
  return gsapPromise;
}
async function getGsap() {
  if (gsapReady && gsapInstance) {
    return gsapInstance;
  }
  if (!gsapPromise) {
    preloadGsap();
  }
  console.log(`⏳ [GSAP] Waiting for GSAP to load...`);
  return gsapPromise;
}
function isReady() {
  return gsapReady;
}
function isLoading() {
  return gsapPromise !== null && !gsapReady;
}
function createDemoContainer() {
  let container2 = document.getElementById("gsap-demo-container");
  if (container2) {
    container2.innerHTML = "";
  } else {
    container2 = document.createElement("div");
    container2.id = "gsap-demo-container";
    container2.className = "gsap-demo-container";
    container2.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 600px;
      max-width: 90vw;
      max-height: 80vh;
      background: #0f172a;
      border: 2px solid #4ade80;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
      z-index: 10000;
      overflow-y: auto;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    `;
    const closeBtn = document.createElement("button");
    closeBtn.innerHTML = "✕";
    closeBtn.title = "Close";
    closeBtn.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: #dc2626;
      color: white;
      border: none;
      cursor: pointer;
      font-size: 18px;
      line-height: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    closeBtn.onclick = () => {
      container2.remove();
      console.log("🎬 GSAP demo closed");
    };
    container2.appendChild(closeBtn);
    document.body.appendChild(container2);
  }
  return container2;
}
function createStage(container2, title) {
  const stage = document.createElement("div");
  stage.className = "gsap-stage";
  stage.style.cssText = `
    margin-top: 20px;
    padding: 15px;
    background: #1e293b;
    border-radius: 8px;
    border: 1px solid #334155;
  `;
  const stageTitle = document.createElement("h4");
  stageTitle.textContent = title;
  stageTitle.style.cssText = `
    margin: 0 0 15px 0;
    color: #4ade80;
    font-size: 14px;
    font-weight: 600;
  `;
  stage.appendChild(stageTitle);
  const stageArea = document.createElement("div");
  stageArea.className = "gsap-stage-area";
  stageArea.style.cssText = `
    position: relative;
    min-height: 100px;
    background: #0f172a;
    border-radius: 4px;
    padding: 10px;
  `;
  stage.appendChild(stageArea);
  container2.appendChild(stage);
  return stageArea;
}
function createBox(stage, color = "#4ade80", text = "") {
  const box = document.createElement("div");
  box.className = "gsap-box";
  box.style.cssText = `
    width: 50px;
    height: 50px;
    background: ${color};
    border-radius: 4px;
    display: inline-block;
    margin: 5px;
    cursor: pointer;
    transition: transform 0.1s;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    color: white;
    font-size: 12px;
  `;
  box.textContent = text;
  box.onmouseenter = () => box.style.transform = "scale(1.1)";
  box.onmouseleave = () => box.style.transform = "scale(1)";
  stage.appendChild(box);
  return box;
}
async function testBasicTween() {
  const gsap = await getGsap();
  const container2 = createDemoContainer();
  const stage = createStage(container2, "Basic Tween (gsap.to)");
  const box = createBox(stage, "#4ade80");
  gsap.to(box, {
    duration: 1.5,
    x: 400,
    rotation: 360,
    borderRadius: "50%",
    backgroundColor: "#fbbf24",
    ease: "power2.inOut",
    repeat: -1,
    yoyo: true
  });
  console.log("✅ [GSAP] Basic tween started");
}
async function testFromTween() {
  const gsap = await getGsap();
  const container2 = createDemoContainer();
  const stage = createStage(container2, "From Tween (gsap.from)");
  const box = createBox(stage, "#3b82f6", "Hi!");
  gsap.from(box, {
    duration: 1,
    opacity: 0,
    y: -100,
    scale: 0.5,
    ease: "bounce.out"
  });
  console.log("✅ [GSAP] From tween started");
}
async function testFromToTween() {
  const gsap = await getGsap();
  const container2 = createDemoContainer();
  const stage = createStage(container2, "FromTo Tween (gsap.fromTo)");
  const box = createBox(stage, "#f472b6", "A→B");
  gsap.fromTo(
    box,
    { x: 0, opacity: 0.3, scale: 0.5 },
    {
      duration: 1.5,
      x: 350,
      opacity: 1,
      scale: 1.2,
      ease: "elastic.out(1, 0.3)",
      repeat: -1,
      yoyo: true
    }
  );
  console.log("✅ [GSAP] FromTo tween started");
}
async function testTimeline() {
  const gsap = await getGsap();
  const container2 = createDemoContainer();
  const stage = createStage(container2, "Timeline (sequenced)");
  const box1 = createBox(stage, "#8b5cf6", "1");
  const box2 = createBox(stage, "#06b6d4", "2");
  const box3 = createBox(stage, "#f59e0b", "3");
  const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });
  tl.to(box1, { duration: 0.5, y: 50, rotation: 180 }).to(box2, { duration: 0.5, y: 50, rotation: 180 }, "-=0.3").to(box3, { duration: 0.5, y: 50, rotation: 180 }, "-=0.3").to([box1, box2, box3], { duration: 0.5, y: 0, rotation: 0 }, "+=0.2");
  console.log("✅ [GSAP] Timeline started");
}
async function testStagger() {
  const gsap = await getGsap();
  const container2 = createDemoContainer();
  const stage = createStage(container2, "Stagger (cascading)");
  const boxes = [];
  const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6"];
  for (let i = 0; i < 6; i++) {
    const box = createBox(stage, colors[i], i + 1);
    boxes.push(box);
  }
  gsap.from(boxes, {
    duration: 0.8,
    opacity: 0,
    y: 50,
    scale: 0,
    stagger: 0.15,
    ease: "back.out(1.7)",
    repeat: -1,
    repeatDelay: 1
  });
  console.log("✅ [GSAP] Stagger started");
}
async function testEasing() {
  const gsap = await getGsap();
  const container2 = createDemoContainer();
  const stage = createStage(container2, "Easing Comparison");
  const easings = [
    { name: "linear", ease: "none" },
    { name: "power2", ease: "power2.inOut" },
    { name: "elastic", ease: "elastic.out(1, 0.3)" },
    { name: "bounce", ease: "bounce.out" }
  ];
  const colors = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"];
  easings.forEach((easing, i) => {
    const row = document.createElement("div");
    row.style.cssText = `
      display: flex;
      align-items: center;
      margin: 10px 0;
    `;
    const label = document.createElement("div");
    label.textContent = easing.name;
    label.style.cssText = `
      width: 80px;
      color: ${colors[i]};
      font-size: 12px;
      font-weight: bold;
    `;
    row.appendChild(label);
    const track = document.createElement("div");
    track.style.cssText = `
      flex: 1;
      height: 30px;
      background: #1e293b;
      border-radius: 4px;
      position: relative;
      overflow: hidden;
    `;
    const ball = document.createElement("div");
    ball.style.cssText = `
      width: 30px;
      height: 30px;
      background: ${colors[i]};
      border-radius: 50%;
      position: absolute;
      left: 0;
    `;
    track.appendChild(ball);
    row.appendChild(track);
    stage.appendChild(row);
    gsap.to(ball, {
      duration: 2,
      x: track.offsetWidth - 30,
      ease: easing.ease,
      repeat: -1,
      repeatDelay: 0.5,
      yoyo: true
    });
  });
  console.log("✅ [GSAP] Easing comparison started");
}
async function testCSSAnimation() {
  const gsap = await getGsap();
  const container2 = createDemoContainer();
  const stage = createStage(container2, "CSS Properties");
  const box = createBox(stage, "#ec4899", "CSS");
  box.style.width = "80px";
  box.style.height = "80px";
  gsap.to(box, {
    duration: 2,
    backgroundColor: "#8b5cf6",
    borderRadius: "50%",
    boxShadow: "0 0 30px rgba(139, 92, 246, 0.8)",
    border: "3px solid #fbbf24",
    transform: "rotate(360deg)",
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  });
  console.log("✅ [GSAP] CSS animation started");
}
async function testSVGAnimation() {
  const gsap = await getGsap();
  const container2 = createDemoContainer();
  const stage = createStage(container2, "SVG Animation");
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "200");
  svg.setAttribute("height", "100");
  svg.style.cssText = `
    display: block;
    margin: 20px auto;
  `;
  const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circle.setAttribute("cx", "50");
  circle.setAttribute("cy", "50");
  circle.setAttribute("r", "20");
  circle.setAttribute("fill", "#4ade80");
  svg.appendChild(circle);
  stage.appendChild(svg);
  gsap.to(circle, {
    duration: 2,
    attr: {
      cx: 150,
      r: 30
    },
    fill: "#fbbf24",
    repeat: -1,
    yoyo: true,
    ease: "power2.inOut"
  });
  console.log("✅ [GSAP] SVG animation started");
}
function cleanup() {
  const gsap = window.gsap;
  if (gsap) {
    gsap.killTweensOf("*");
    console.log("🧹 [GSAP] All tweens killed");
  }
  const container2 = document.getElementById("gsap-demo-container");
  if (container2) {
    container2.remove();
  }
  console.log("🧹 [GSAP] Cleanup complete (CDN script remains in DOM for reuse)");
}
const gsapTest = {
  preloadGsap,
  getGsap,
  isReady,
  isLoading,
  testBasicTween,
  testFromTween,
  testFromToTween,
  testTimeline,
  testStagger,
  testEasing,
  testCSSAnimation,
  testSVGAnimation,
  cleanup
};
const gsapTest$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  cleanup,
  getGsap,
  gsapTest,
  isLoading,
  isReady,
  preloadGsap,
  testBasicTween,
  testCSSAnimation,
  testEasing,
  testFromToTween,
  testFromTween,
  testSVGAnimation,
  testStagger,
  testTimeline
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
    aiImageTest: aiImageTest2,
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
    particlesTest: particlesTest2,
    cellularAutomataTest: cellularAutomataTest2,
    indexeddbTest: indexeddbTest2,
    gsapTest: gsapTest2
  } = testModules;
  const testDefs = [
    { btnId: "btn-dice", name: "Dice", fn: () => diceHandler() },
    { btnId: "btn-seeder", name: "Seeder", fn: () => seederHandler() },
    { btnId: "btn-pattern", name: "Pattern", fn: () => patternHandler() },
    { btnId: "btn-ai-text", name: "AI Text", fn: () => aiTextHandler() },
    { btnId: "btn-ai-startwith", name: "AI Text - startWith", fn: () => aiTextStartWithHandler() },
    { btnId: "btn-ai-stop", name: "AI Text - stopSequences", fn: () => aiTextStopSequencesHandler() },
    { btnId: "btn-ai-style", name: "AI Text - style & outputTo", fn: () => aiTextStyleOutputHandler() },
    { btnId: "btn-ai-endbuttons", name: "AI Text - endButtons", fn: () => aiTextEndButtonsHandler() },
    { btnId: "btn-ai-onchunk", name: "AI Text - onChunk", fn: () => aiTextOnChunkHandler() },
    { btnId: "btn-ai-onfinish", name: "AI Text - onFinish", fn: () => aiTextOnFinishHandler() },
    { btnId: "btn-ai-dynamic", name: "AI Text - Dynamic", fn: () => aiTextDynamicHandler() },
    { btnId: "btn-ai-render", name: "AI Text - Render", fn: () => aiTextRenderHandler() },
    { btnId: "btn-ai-json", name: "AI Text - JSON", fn: () => aiTextStructuredJSONHandler() },
    { btnId: "btn-ai-markdown", name: "AI Text - Markdown", fn: () => aiTextMarkdownRenderHandler() },
    { btnId: "btn-ai-concurrency", name: "AI Text - Concurrency", fn: () => aiTextConcurrencyHandler() },
    { btnId: "btn-ai-image-single", name: "AI Image - Single", fn: () => aiImageSingleHandler() },
    { btnId: "btn-ai-image-batch", name: "AI Image - Batch", fn: () => aiImageBatchHandler() },
    { btnId: "btn-ai-image-processing", name: "AI Image - Processing", fn: () => aiImageProcessingHandler() },
    { btnId: "btn-ai-image-errors", name: "AI Image - Errors", fn: () => aiImageErrorsHandler() },
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
    { btnId: "btn-particles", name: "Particles", fn: () => particlesHandler() },
    { btnId: "btn-gsap-basic", name: "GSAP Tween", fn: () => gsapBasicHandler() },
    { btnId: "btn-gsap-from", name: "GSAP From", fn: () => gsapFromHandler() },
    { btnId: "btn-gsap-timeline", name: "GSAP Timeline", fn: () => gsapTimelineHandler() },
    { btnId: "btn-gsap-stagger", name: "GSAP Stagger", fn: () => gsapStaggerHandler() },
    { btnId: "btn-gsap-easing", name: "GSAP Easing", fn: () => gsapEasingHandler() }
  ];
  const HOW_IT_WORKS_DATA = [
    { id: "dice", title: "🎲 Dice", what: "Tests Perchance native dice rolling syntax (1d4, 1d6, 1d20, etc.).", how: "Calls <code>root.dice()</code> for each standard RPG die, captures results, and renders a comparison table.", key: "Perchance <code>root.dice()</code>, RNG, string parsing." },
    { id: "seeder", title: "🌱 Seeder", what: "Validates deterministic seed generation for reproducible randomness.", how: "Generates multiple seeds from the same input string and verifies they produce identical outputs across runs.", key: "Seeded RNG, hash functions, reproducibility." },
    { id: "pattern", title: "🎨 Pattern", what: "Generates procedural textures/patterns using Perchance generators.", how: "Creates a canvas, fills it with algorithmic patterns driven by Perchance lists, and displays the result.", key: "Canvas 2D, procedural generation, Perchance lists." },
    { id: "ai-text", title: "🤖 AI Text", what: "Tests AI text generation via Perchance AI plugins.", how: "Calls the AI text plugin with a prompt, waits for async response, and renders the generated text.", key: "Async/await, plugin bridge, AI API integration." },
    { id: "ai-image", title: "🖼️ AI Image", what: "Tests advanced AI image generation with hooks and batch processing.", how: "Calls the advanced-ai-image-plugin with prompts, preprocess/postprocess hooks, and batch generation, displaying results in a responsive grid.", key: "Async image generation, DOM manipulation, plugin hooks, batch processing." },
    { id: "image", title: "🖼️ Image", what: "Tests AI image generation and rendering.", how: "Requests an image from the AI plugin, handles loading state, and displays the resulting image URL.", key: "Async image loading, error handling, DOM insertion." },
    { id: "tts", title: "🔊 TTS", what: "Tests Text-to-Speech using the Web Speech API.", how: "Initializes speech synthesis, configures voice/rate/pitch, and speaks a test phrase. Includes stop control.", key: "Web Speech API, <code>speechSynthesis</code>, async audio." },
    { id: "3d", title: "🎲 Cube Color", what: "Tests Three.js basic rendering and material color updates.", how: "Creates a Three.js scene with a rotating cube, updates its material color dynamically, and renders to canvas.", key: "Three.js, WebGL, animation loop, material updates." },
    { id: "raycaster", title: "🖱️ Raycaster", what: "Tests 3D click detection using Three.js Raycaster.", how: "Sets up a scene with multiple objects, casts a ray from camera on click, and highlights the intersected object.", key: "Three.js Raycaster, mouse coordinates, intersection testing." },
    { id: "canvas", title: "🎨 Canvas", what: "Tests HTML5 Canvas 2D drawing primitives.", how: "Draws shapes, gradients, and text on a 2D canvas context, verifying rendering pipeline.", key: 'Canvas 2D API, <code>getContext("2d")</code>, drawing commands.' },
    { id: "rpg-icon", title: "⚔️ RPG Icons", what: "Tests sprite sheet extraction and rendering for RPG-style icons.", how: "Loads a sprite sheet, calculates tile coordinates, and draws specific icons to canvas.", key: "Sprite sheets, <code>drawImage</code> slicing, asset management." },
    { id: "particles", title: "✨ Particles", what: "Tests a custom particle system with physics and lifecycle.", how: "Spawns particles with velocity, gravity, and fade-out. Updates and renders them each frame.", key: "RequestAnimationFrame, particle lifecycle, vector math." },
    { id: "cellular-automata", title: "🧬 Cellular Automata", what: "Tests grid-based simulation (e.g., Game of Life rules).", how: "Initializes a grid, applies neighbor-based rules each tick, and renders the evolving state.", key: "2D arrays, neighbor counting, simulation loops." },
    { id: "gsap", title: "🎬 GSAP", what: "Tests GSAP animation library (tweens, timelines, staggers, easing).", how: "Creates DOM elements, applies GSAP animations with various configs, and verifies cleanup.", key: "GSAP core, timelines, stagger, easing, memory cleanup." },
    { id: "charts", title: "📊 Charts", what: "Tests ApexCharts integration (Bar, Line, Donut, Radar).", how: "Initializes chart instances with mock data, renders responsive SVGs, and tests updates.", key: "ApexCharts, data binding, SVG rendering, responsive design." },
    { id: "audio", title: "🔊 Audio", what: "Tests Web Audio/Howler.js (SFX, Music, Sprites, Volume, Stop).", how: "Loads audio assets, plays loops/one-shots, adjusts gain, tests sprite markers, and stops playback.", key: "Web Audio API, Howler.js, audio sprites, gain control." },
    { id: "mermaid", title: "📊 Mermaid", what: "Tests Mermaid.js diagram rendering from markdown syntax.", how: "Passes mermaid syntax to the library, renders SVG/HTML output, and injects into container.", key: "Mermaid.js, markdown parsing, SVG injection." },
    { id: "matter", title: "⚛️ Matter.js", what: "Tests 2D physics simulation with rigid bodies.", how: "Creates a Matter.js world with bodies, constraints, and gravity. Runs simulation loop.", key: "Matter.js, rigid bodies, constraints, 2D physics loop." },
    { id: "cannon", title: "💣 Cannon-es", what: "Tests 3D physics simulation and collision detection.", how: "Sets up a Cannon-es world with spheres/boxes, applies forces, and syncs with visual mesh.", key: "Cannon-es, 3D collisions, physics step, mesh sync." },
    { id: "lists", title: "📋 Lists", what: "Tests Perchance list evaluation and random selection.", how: "Fetches lists via <code>getList()</code>, evaluates items, and displays random picks.", key: "Perchance lists, <code>getList()</code>, random evaluation." },
    { id: "bridge", title: "🔗 Bridge", what: "Tests the Perchance plugin bridge communication.", how: "Sends/receives data between JS and Perchance runtime, verifying payload integrity.", key: "Plugin bridge, message passing, data serialization." },
    { id: "state", title: "💾 Save/Load", what: "Tests localStorage state persistence.", how: "Serializes game state to JSON, saves to localStorage, reloads, and hydrates state.", key: "<code>localStorage</code>, JSON serialization, state hydration." },
    { id: "kv", title: "🗄️ KV", what: "Tests key-value storage plugin for structured data.", how: "Sets/gets/deletes KV pairs, verifies persistence and type handling.", key: "KV plugin, structured storage, CRUD operations." },
    { id: "indexeddb", title: "🗃️ IndexedDB", what: "Tests native browser NoSQL database for large/complex data.", how: "Opens DB, saves primitives & AI results (FIFO cache), loads them back, and clears stores.", key: "IndexedDB, async transactions, Blobs, FIFO eviction." },
    { id: "image-guidance", title: "⚖️ CFG Scale", what: "Tests guidance scale (CFG) parameter for AI image generation.", how: "Generates 3 images with different CFG values (3, 7, 15) to show creativity vs prompt adherence.", key: "guidanceScale parameter, prompt adherence, AI control." },
    { id: "image-negative", title: "🚫 Negative Prompt", what: "Tests negative prompt parameter to exclude elements from generation.", how: "Generates same image with and without negative prompt to show exclusion effect.", key: "negativePrompt parameter, element exclusion, AI refinement." },
    { id: "image-trigger", title: "🎭 Trigger Words", what: "Tests model-specific trigger words for different art styles.", how: "Generates images using trigger words for Normal, Anime, and Furry styles.", key: "Model triggers, style control, anime/furry generation." },
    { id: "image-emoji", title: "😀 Emoji Prompts", what: "Tests emoji support in AI image generation prompts.", how: "Generates images with emojis (🐉🌸🤖) as part of the prompt.", key: "Emoji tokens, prompt syntax, visual concept mapping." },
    { id: "image-onfinish", title: "📊 onFinish Callback", what: "Tests the onFinish callback for capturing generation metadata.", how: "Uses onFinish callback to capture and display image data, canvas, and inputs.", key: "onFinish callback, metadata capture, async completion." },
    { id: "image-emphasis", title: "🎯 Tag Emphasis", what: "Tests tag weighting/emphasis syntax (tag:weight).", how: "Generates images with different emphasis weights (0.5, 1.0, 1.5, 2.0) to show impact.", key: "Tag weighting, (tag:weight) syntax, prompt emphasis." },
    { id: "image-ordering", title: "🔄 Prompt Ordering", what: "Tests how tag order affects image composition.", how: "Generates images with same tags in different orders to show positional impact.", key: "Tag ordering, composition bias, prompt structure." },
    { id: "image-canvas", title: "🎨 Canvas Post-Processing", what: "Tests direct canvas manipulation after image generation.", how: "Accesses result.canvas to apply filters (grayscale, sepia) and overlay text.", key: "Canvas API, image processing, post-generation effects." },
    { id: "image-break", title: "⚡ BREAK Keyword", what: "Tests BREAK keyword for separating prompt chunks.", how: "Generates images with and without BREAK to show token separation effect.", key: "BREAK keyword, token chunking, prompt separation." },
    { id: "image-blending", title: "🎨 Tag Blending", what: "Tests tag blending syntax [from:to:ratio] for style mixing.", how: "Generates images with different blend ratios (0%, 50%, 100%) between styles.", key: "Tag blending, [from:to:ratio] syntax, style mixing." },
    { id: "image-grid", title: "🖼️ Multi-Image Grid", what: "Tests parallel generation of multiple images.", how: "Uses Promise.all() to generate 4 images simultaneously in a grid layout.", key: "Parallel generation, Promise.all(), batch processing." },
    { id: "image-alternating", title: "🔄 Alternating Tags", what: "Tests alternating tag syntax [tag1|tag2] for step variation.", how: "Generates images with alternating tags to show per-step variation effect.", key: "Alternating tags, [tag1|tag2] syntax, step variation." },
    { id: "image-addremove", title: "➕ Add/Remove During Gen", what: "Tests adding/removing tags during generation [to:when] and [from::when].", how: "Generates images with tags added/removed at specific generation steps.", key: "Dynamic prompts, [to:when] syntax, [from::when] syntax." },
    { id: "ai-json", title: "📋 Structured JSON", what: "Tests structured JSON output generation.", how: "Uses instruction to generate valid JSON and parses it to display structured data.", key: "JSON output, structured data, AI formatting." },
    { id: "ai-markdown", title: "📝 Markdown Render", what: "Tests markdown rendering during streaming.", how: "Uses render function to convert markdown syntax to HTML in real-time.", key: "Markdown parsing, real-time rendering, HTML conversion." },
    { id: "ai-concurrency", title: "⚡ Concurrency Limits", what: "Tests concurrent AI text generation limits.", how: "Generates multiple texts simultaneously to test rate limiting and concurrency.", key: "Concurrency control, rate limiting, parallel requests." }
  ];
  async function diceHandler() {
    console.log("🎲 Rolling dice...");
    if (!diceTest2 || !diceTest2.available) throw new Error("Plugin not available");
    const { contentArea } = createTestContainer("🎲 Dice Test", { id: "test-dice", width: 400, height: 300 });
    const d4 = { dice: "1d4", result: root.dice("1d4") };
    const d6 = { dice: "1d6", result: root.dice("1d6") };
    const d8 = { dice: "1d8", result: root.dice("1d8") };
    const d10 = { dice: "1d10", result: root.dice("1d10") };
    const d12 = { dice: "1d12", result: root.dice("1d12") };
    const d20 = { dice: "1d20", result: root.dice("1d20") };
    const d100 = { dice: "1d100", result: root.dice("1d100") };
    const allRolls = [d4, d6, d8, d10, d12, d20, d100];
    contentArea.innerHTML = allRolls.map(
      (r) => `<div style="display:flex;justify-content:space-between;padding:8px;border-bottom:1px solid #333;">
        <span style="color:#fbbf24;">${r.dice}</span>
        <span style="color:#4ade80;font-weight:bold;font-size:18px;">${r.result}</span>
      </div>`
    ).join("");
    console.log(`🎲 Results: ${allRolls.map((r) => r.dice + "=" + r.result).join(" | ")}`);
  }
  async function seederHandler() {
    console.log("🌱 Testing Seeder...");
    if (!seederTest2 || !seederTest2.available) throw new Error("Plugin not available");
    const { contentArea } = createTestContainer("🌱 Seeder Test", { id: "test-seeder", width: 500, height: 350 });
    const seed = seederTest2.generateRandomSeed();
    seederTest2.applySeed(seed);
    const repro = seederTest2.demonstrateReproducibility();
    contentArea.innerHTML = `
      <div style="padding:10px;">
        <div style="margin-bottom:15px;">
          <div style="color:#94a3b8;font-size:12px;">Seed gerada:</div>
          <div style="color:#4ade80;font-size:20px;font-family:monospace;margin-top:5px;">${seed}</div>
        </div>
        <div style="margin-bottom:15px;">
          <div style="color:#94a3b8;font-size:12px;">Execução 1:</div>
          <div style="color:#fbbf24;font-family:monospace;margin-top:5px;">${JSON.stringify((repro == null ? void 0 : repro.results1) || [])}</div>
        </div>
        <div style="margin-bottom:15px;">
          <div style="color:#94a3b8;font-size:12px;">Execução 2 (mesma seed):</div>
          <div style="color:#fbbf24;font-family:monospace;margin-top:5px;">${JSON.stringify((repro == null ? void 0 : repro.results2) || [])}</div>
        </div>
        <div style="padding:8px;background:${(repro == null ? void 0 : repro.match) ? "#166534" : "#991b1b"};border-radius:4px;text-align:center;">
          ${(repro == null ? void 0 : repro.match) ? "✅ Resultados idênticos — Seed funciona!" : "⚠️ Resultados diferentes (esperado sem listas)"}
        </div>
      </div>`;
    seederTest2.resetSeed();
    console.log(`✅ Seed applied: ${seed}`);
  }
  async function patternHandler() {
    console.log("🎨 Generating procedural pattern...");
    if (!patternTest2 || !patternTest2.available) throw new Error("Plugin not available");
    const { contentArea } = createTestContainer("🎨 Pattern Test", { id: "test-pattern", width: 500, height: 500 });
    contentArea.innerHTML = '<div style="color:#94a3b8;text-align:center;padding:20px;">Gerando padrão...</div>';
    const result = patternTest2.generateEmojiPattern();
    if (!result) {
      contentArea.innerHTML = '<div style="color:#ff6b6b;text-align:center;padding:20px;">❌ Falha na geração</div>';
      throw new Error("Pattern generation failed");
    }
    if (typeof result === "string" && result.startsWith("data:image/")) {
      contentArea.innerHTML = `<img src="${result}" style="width:100%;height:auto;border-radius:4px;" alt="Generated Pattern"/>`;
    } else {
      contentArea.innerHTML = `<div style="color:#fbbf24;padding:10px;">
        <div style="margin-bottom:10px;">Tipo: ${typeof result}</div>
        <div style="word-break:break-all;font-size:10px;max-height:300px;overflow:auto;">${String(result).substring(0, 500)}...</div>
      </div>`;
    }
    console.log("✅ Pattern generated!");
  }
  async function aiTextHandler() {
    console.log("🤖 Generating AI text...");
    if (!aiTextTest2 || !aiTextTest2.available) throw new Error("Plugin not available");
    const { contentArea } = createTestContainer("🤖 AI Text Test", { id: "test-ai-text", width: 600, height: 400 });
    contentArea.innerHTML = '<div style="color:#94a3b8;text-align:center;padding:20px;">⏳ Gerando texto com IA...</div>';
    const result = await aiTextTest2.generateBasic("Escreva uma frase curta sobre um aventureiro.");
    if (!(result == null ? void 0 : result.success) || !result.text) {
      contentArea.innerHTML = `<div style="color:#ff6b6b;padding:10px;">❌ Erro: ${(result == null ? void 0 : result.error) || "Resposta vazia"}</div>`;
      throw new Error((result == null ? void 0 : result.error) || "Empty response from AI");
    }
    contentArea.innerHTML = `
      <div style="padding:10px;">
        <div style="color:#94a3b8;font-size:12px;margin-bottom:10px;">Prompt: "Escreva uma frase curta sobre um aventureiro."</div>
        <div style="color:#e2e8f0;font-size:14px;line-height:1.6;padding:15px;background:#0f172a;border-radius:4px;border-left:3px solid #4ade80;">
          ${result.text}
        </div>
        <div style="color:#64748b;font-size:11px;margin-top:10px;">Caracteres: ${result.text.length}</div>
      </div>`;
    console.log(`✅ AI Text: "${result.text.substring(0, 80)}..."`);
  }
  async function aiTextStartWithHandler() {
    console.log("🤖 Testing startWith & hideStartWith...");
    if (!aiTextTest2 || !aiTextTest2.available) throw new Error("Plugin not available");
    const { contentArea } = createTestContainer("🤖 AI Text - startWith & hideStartWith", { id: "test-ai-startwith", width: 600, height: 500 });
    contentArea.innerHTML = '<div style="color:#94a3b8;text-align:center;padding:20px;">⏳ Gerando textos com startWith...</div>';
    const result = await aiTextTest2.testStartWithAndHide();
    if (!(result == null ? void 0 : result.success)) {
      contentArea.innerHTML = `<div style="color:#ff6b6b;padding:10px;">❌ Erro: ${(result == null ? void 0 : result.error) || "Falha no teste"}</div>`;
      throw new Error((result == null ? void 0 : result.error) || "Test failed");
    }
    contentArea.innerHTML = `
      <div style="padding:10px;">
        <div style="color:#94a3b8;font-size:12px;margin-bottom:10px;">Testando startWith & hideStartWith</div>
        <div style="margin-bottom:15px;">
          <div style="color:#a78bfa;font-size:11px;margin-bottom:5px;">✅ startWith VISÍVEL (hideStartWith: false):</div>
          <div style="color:#e2e8f0;font-size:13px;line-height:1.5;padding:10px;background:#0f172a;border-radius:4px;border-left:3px solid #a78bfa;">
            ${result.visibleText}
          </div>
        </div>
        <div>
          <div style="color:#4ade80;font-size:11px;margin-bottom:5px;">✅ startWith OCULTO (hideStartWith: true):</div>
          <div style="color:#e2e8f0;font-size:13px;line-height:1.5;padding:10px;background:#0f172a;border-radius:4px;border-left:3px solid #4ade80;">
            ${result.hiddenText}
          </div>
        </div>
      </div>`;
    console.log("✅ startWith test completed!");
  }
  async function aiTextStopSequencesHandler() {
    console.log("🤖 Testing stopSequences...");
    if (!aiTextTest2 || !aiTextTest2.available) throw new Error("Plugin not available");
    const { contentArea } = createTestContainer("🤖 AI Text - stopSequences", { id: "test-ai-stop", width: 600, height: 400 });
    contentArea.innerHTML = '<div style="color:#94a3b8;text-align:center;padding:20px;">⏳ Gerando texto com stopSequences...</div>';
    const result = await aiTextTest2.testStopSequences();
    if (!(result == null ? void 0 : result.success) || !result.text) {
      contentArea.innerHTML = `<div style="color:#ff6b6b;padding:10px;">❌ Erro: ${(result == null ? void 0 : result.error) || "Resposta vazia"}</div>`;
      throw new Error((result == null ? void 0 : result.error) || "Empty response");
    }
    contentArea.innerHTML = `
      <div style="padding:10px;">
        <div style="color:#94a3b8;font-size:12px;margin-bottom:10px;">Prompt: "Conte uma história curta sobre um herói. Pare quando disser 'FIM'."</div>
        <div style="color:#e2e8f0;font-size:13px;line-height:1.6;padding:15px;background:#0f172a;border-radius:4px;border-left:3px solid #f59e0b;">
          ${result.text}
        </div>
        <div style="color:#64748b;font-size:11px;margin-top:10px;">Caracteres: ${result.text.length} | Stop sequences: ['FIM', 'The End', '###']</div>
      </div>`;
    console.log("✅ stopSequences test completed!");
  }
  async function aiTextStyleOutputHandler() {
    console.log("🤖 Testing style & outputTo...");
    if (!aiTextTest2 || !aiTextTest2.available) throw new Error("Plugin not available");
    const { contentArea } = createTestContainer("🤖 AI Text - style & outputTo", { id: "test-ai-style", width: 600, height: 400 });
    contentArea.innerHTML = '<div style="color:#94a3b8;text-align:center;padding:20px;">⏳ Gerando texto com style & outputTo...</div>';
    const result = await aiTextTest2.testStyleAndOutputTo("test-ai-style");
    if (!(result == null ? void 0 : result.success) || !result.text) {
      contentArea.innerHTML = `<div style="color:#ff6b6b;padding:10px;">❌ Erro: ${(result == null ? void 0 : result.error) || "Resposta vazia"}</div>`;
      throw new Error((result == null ? void 0 : result.error) || "Empty response");
    }
    contentArea.innerHTML += `
      <div style="padding:10px;margin-top:10px;">
        <div style="color:#4ade80;font-size:12px;">✅ Texto renderizado diretamente no elemento #ai-text-output com CSS customizado!</div>
        <div style="color:#64748b;font-size:11px;margin-top:5px;">Caracteres: ${result.text.length}</div>
      </div>`;
    console.log("✅ style & outputTo test completed!");
  }
  async function aiTextEndButtonsHandler() {
    console.log("🤖 Testing endButtons...");
    if (!aiTextTest2 || !aiTextTest2.available) throw new Error("Plugin not available");
    const { contentArea } = createTestContainer("🤖 AI Text - endButtons", { id: "test-ai-endbuttons", width: 600, height: 400 });
    contentArea.innerHTML = '<div style="color:#94a3b8;text-align:center;padding:20px;">⏳ Gerando texto sem botões de editar/continuar...</div>';
    const result = await aiTextTest2.testEndButtons();
    if (!(result == null ? void 0 : result.success) || !result.text) {
      contentArea.innerHTML = `<div style="color:#ff6b6b;padding:10px;">❌ Erro: ${(result == null ? void 0 : result.error) || "Resposta vazia"}</div>`;
      throw new Error((result == null ? void 0 : result.error) || "Empty response");
    }
    contentArea.innerHTML = `
      <div style="padding:10px;">
        <div style="color:#94a3b8;font-size:12px;margin-bottom:10px;">Prompt: "Escreva um parágrafo sobre um mago misterioso."</div>
        <div style="color:#e2e8f0;font-size:13px;line-height:1.6;padding:15px;background:#0f172a;border-radius:4px;border-left:3px solid #ec4899;">
          ${result.text}
        </div>
        <div style="color:#64748b;font-size:11px;margin-top:10px;">Caracteres: ${result.text.length} | endButtons: 'none' (botões ocultados)</div>
      </div>`;
    console.log("✅ endButtons test completed!");
  }
  async function aiTextOnChunkHandler() {
    console.log("🤖 Testing onChunk streaming...");
    if (!aiTextTest2 || !aiTextTest2.available) throw new Error("Plugin not available");
    const { contentArea } = createTestContainer("🤖 AI Text - onChunk Streaming", { id: "test-ai-onchunk", width: 600, height: 500 });
    contentArea.innerHTML = `
      <div style="padding: 15px;">
        <div style="margin-bottom: 10px; color: #94a3b8; font-size: 12px;">
          📡 Streaming em tempo real:
        </div>
        <div id="stream-display" style="
          font-family: monospace; 
          white-space: pre-wrap; 
          background: #0f172a; 
          color: #4ade80; 
          padding: 15px; 
          min-height: 120px; 
          border-radius: 6px;
          border: 1px solid #334155;
          font-size: 14px;
          line-height: 1.6;
          max-height: 300px;
          overflow-y: auto;
        "></div>
        <div id="stream-status" style="margin-top: 10px; color: #64748b; font-size: 11px; text-align: center;">
          ⏳ Aguardando chunks...
        </div>
      </div>
    `;
    const streamDisplay = document.getElementById("stream-display");
    const streamStatus = document.getElementById("stream-status");
    const result = await aiTextTest2.testOnChunkStreaming(streamDisplay);
    if (!(result == null ? void 0 : result.success)) {
      contentArea.innerHTML = `<div style="color:#ff6b6b;padding:10px;">❌ Erro: ${(result == null ? void 0 : result.error) || "Falha no teste"}</div>`;
      throw new Error((result == null ? void 0 : result.error) || "Test failed");
    }
    streamStatus.innerHTML = `✅ <span style="color:#4ade80;">${result.chunkCount} chunks recebidos</span> | <span style="color:#94a3b8;">Texto final: ${result.finalText.length} caracteres</span>`;
    console.log("✅ onChunk streaming test completed!");
  }
  async function aiTextOnFinishHandler() {
    console.log("🤖 Testing onFinish capture...");
    if (!aiTextTest2 || !aiTextTest2.available) throw new Error("Plugin not available");
    const { contentArea } = createTestContainer("🤖 AI Text - onFinish Capture", { id: "test-ai-onfinish", width: 600, height: 500 });
    contentArea.innerHTML = '<div style="color:#94a3b8;text-align:center;padding:20px;">⏳ Gerando texto com onFinish...</div>';
    const result = await aiTextTest2.testOnFinishCapture();
    if (!(result == null ? void 0 : result.success)) {
      contentArea.innerHTML = `<div style="color:#ff6b6b;padding:10px;">❌ Erro: ${(result == null ? void 0 : result.error) || "Falha no teste"}</div>`;
      throw new Error((result == null ? void 0 : result.error) || "Test failed");
    }
    const data = result.capturedData;
    contentArea.innerHTML = `
      <div style="padding:10px;">
        <div style="color:#94a3b8;font-size:12px;margin-bottom:10px;">onFinish Data Capture</div>
        <div style="margin-bottom:15px;">
          <div style="color:#a78bfa;font-size:11px;margin-bottom:5px;">📊 data.text (inclui startWith):</div>
          <div style="color:#e2e8f0;font-size:13px;padding:10px;background:#0f172a;border-radius:4px;">${data.text}</div>
          <div style="color:#64748b;font-size:10px;margin-top:4px;">${data.text.length} caracteres</div>
        </div>
        <div style="margin-bottom:15px;">
          <div style="color:#4ade80;font-size:11px;margin-bottom:5px;">📝 data.generatedText (exclui startWith):</div>
          <div style="color:#e2e8f0;font-size:13px;padding:10px;background:#0f172a;border-radius:4px;">${data.generatedText}</div>
          <div style="color:#64748b;font-size:10px;margin-top:4px;">${data.generatedText.length} caracteres</div>
        </div>
        <div>
          <div style="color:#f59e0b;font-size:11px;margin-bottom:5px;">⚙️ data.inputs:</div>
          <pre style="color:#94a3b8;font-size:10px;padding:8px;background:#0f172a;border-radius:4px;overflow-x:auto;">${JSON.stringify(data.inputs, null, 2)}</pre>
        </div>
      </div>`;
    console.log("✅ onFinish capture test completed!");
  }
  async function aiTextDynamicHandler() {
    console.log("🤖 Testing dynamic prompts...");
    if (!aiTextTest2 || !aiTextTest2.available) throw new Error("Plugin not available");
    const { contentArea } = createTestContainer("🤖 AI Text - Dynamic Prompts", { id: "test-ai-dynamic", width: 600, height: 400 });
    contentArea.innerHTML = '<div style="color:#94a3b8;text-align:center;padding:20px;">⏳ Gerando com instruction dinâmica...</div>';
    const result = await aiTextTest2.testDynamicPrompts();
    if (!(result == null ? void 0 : result.success)) {
      contentArea.innerHTML = `<div style="color:#ff6b6b;padding:10px;">❌ Erro: ${(result == null ? void 0 : result.error) || "Falha no teste"}</div>`;
      throw new Error((result == null ? void 0 : result.error) || "Test failed");
    }
    contentArea.innerHTML = `
      <div style="padding:10px;">
        <div style="color:#94a3b8;font-size:12px;margin-bottom:10px;">Dynamic Prompt (instruction as function)</div>
        <div style="color:#e2e8f0;font-size:13px;line-height:1.6;padding:15px;background:#0f172a;border-radius:4px;border-left:3px solid #4ade80;">
          ${result.text}
        </div>
        <div style="color:#64748b;font-size:11px;margin-top:10px;">
          instruction type: ${result.instructionType} | Caracteres: ${result.text.length}
        </div>
      </div>`;
    console.log("✅ Dynamic prompts test completed!");
  }
  async function aiTextRenderHandler() {
    console.log("🤖 Testing render function...");
    if (!aiTextTest2 || !aiTextTest2.available) throw new Error("Plugin not available");
    const { contentArea } = createTestContainer("🤖 AI Text - Render Function", { id: "test-ai-render", width: 600, height: 400 });
    contentArea.innerHTML = '<div style="color:#94a3b8;text-align:center;padding:20px;">⏳ Gerando com render function...</div>';
    const result = await aiTextTest2.testRenderFunction("test-ai-render");
    if (!(result == null ? void 0 : result.success)) {
      contentArea.innerHTML = `<div style="color:#ff6b6b;padding:10px;">❌ Erro: ${(result == null ? void 0 : result.error) || "Falha no teste"}</div>`;
      throw new Error((result == null ? void 0 : result.error) || "Test failed");
    }
    contentArea.innerHTML += `
      <div style="padding:10px;margin-top:10px;">
        <div style="color:#4ade80;font-size:12px;">✅ Texto renderizado com transformação *ação* → <em>ação</em></div>
        <div style="color:#64748b;font-size:11px;margin-top:5px;">Caracteres: ${result.text.length}</div>
      </div>`;
    console.log("✅ Render function test completed!");
  }
  async function aiTextStructuredJSONHandler() {
    console.log("🤖 Testing structured JSON generation...");
    if (!aiTextTest2 || !aiTextTest2.available) throw new Error("Plugin not available");
    const { contentArea } = createTestContainer("🤖 AI Text - Structured JSON", { id: "test-ai-json", width: 600, height: 400 });
    contentArea.innerHTML = '<div style="color:#94a3b8;text-align:center;padding:20px;">⏳ Gerando JSON estruturado...</div>';
    const result = await aiTextTest2.testStructuredJSON();
    if (!(result == null ? void 0 : result.success)) {
      contentArea.innerHTML = `<div style="color:#ff6b6b;padding:10px;">❌ Erro: ${(result == null ? void 0 : result.error) || "Falha no teste"}</div>`;
      throw new Error((result == null ? void 0 : result.error) || "Test failed");
    }
    contentArea.innerHTML = `
      <div style="padding:15px;">
        <div style="color:#4ade80;font-size:12px;margin-bottom:10px;">✅ JSON estruturado gerado:</div>
        <pre style="background:#0f172a;color:#e2e8f0;padding:15px;border-radius:6px;overflow:auto;font-size:12px;">${JSON.stringify(result.parsed, null, 2)}</pre>
        <div style="color:#64748b;font-size:11px;margin-top:10px;">Campos: ${Object.keys(result.parsed).join(", ")}</div>
      </div>`;
    console.log("✅ Structured JSON test completed!");
  }
  async function aiTextMarkdownRenderHandler() {
    console.log("🤖 Testing markdown render...");
    if (!aiTextTest2 || !aiTextTest2.available) throw new Error("Plugin not available");
    const { contentArea } = createTestContainer("🤖 AI Text - Markdown Render", { id: "test-ai-markdown", width: 600, height: 400 });
    contentArea.innerHTML = '<div style="color:#94a3b8;text-align:center;padding:20px;">⏳ Gerando com render markdown...</div>';
    const result = await aiTextTest2.testMarkdownRender();
    if (!(result == null ? void 0 : result.success)) {
      contentArea.innerHTML = `<div style="color:#ff6b6b;padding:10px;">❌ Erro: ${(result == null ? void 0 : result.error) || "Falha no teste"}</div>`;
      throw new Error((result == null ? void 0 : result.error) || "Test failed");
    }
    const chunksHTML = result.chunks.map((c, i) => `<div style="margin-bottom:5px;"><span style="color:#64748b;">[${i}]</span> ${c.html}</div>`).join("");
    contentArea.innerHTML = `
      <div style="padding:15px;">
        <div style="color:#4ade80;font-size:12px;margin-bottom:10px;">✅ Texto com formatação markdown (${result.chunkCount} chunks):</div>
        <div style="background:#0f172a;color:#e2e8f0;padding:15px;border-radius:6px;line-height:1.6;max-height:250px;overflow-y:auto;">${chunksHTML}</div>
        <div style="color:#64748b;font-size:11px;margin-top:10px;">Texto final: ${result.finalText.length} caracteres</div>
      </div>`;
    console.log("✅ Markdown render test completed!");
  }
  async function aiTextConcurrencyHandler() {
    console.log("🤖 Testing concurrency limits...");
    if (!aiTextTest2 || !aiTextTest2.available) throw new Error("Plugin not available");
    const { contentArea } = createTestContainer("🤖 AI Text - Concurrency Limits", { id: "test-ai-concurrency", width: 600, height: 400 });
    contentArea.innerHTML = '<div style="color:#94a3b8;text-align:center;padding:20px;">⏳ Testando concorrência (3 solicitações simultâneas)...</div>';
    const result = await aiTextTest2.testConcurrencyLimits();
    if (!(result == null ? void 0 : result.success)) {
      contentArea.innerHTML = `<div style="color:#ff6b6b;padding:10px;">❌ Erro: ${(result == null ? void 0 : result.error) || "Falha no teste"}</div>`;
      throw new Error((result == null ? void 0 : result.error) || "Test failed");
    }
    const resultsHTML = result.results.map(
      (r) => `<div style="margin-bottom:5px;color:${r.success ? "#4ade80" : "#ff6b6b"};">
        ${r.success ? "✅" : "❌"} Solicitação ${r.index + 1}: ${r.success ? r.text : r.error}
      </div>`
    ).join("");
    contentArea.innerHTML = `
      <div style="padding:15px;">
        <div style="color:#4ade80;font-size:12px;margin-bottom:10px;">✅ Teste de concorrência concluído:</div>
        <div style="background:#0f172a;color:#e2e8f0;padding:15px;border-radius:6px;font-size:12px;max-height:250px;overflow-y:auto;">
          <div style="margin-bottom:10px;color:#94a3b8;">Total: ${result.total} | Sucesso: ${result.successful} | Falha: ${result.total - result.successful}</div>
          ${resultsHTML}
        </div>
      </div>`;
    console.log("✅ Concurrency test completed!");
  }
  async function aiImageSingleHandler() {
    console.log("🖼️ Testing AI Image single generation...");
    if (!aiImageTest2 || !aiImageTest2.available) throw new Error("Plugin not available");
    const { contentArea } = createTestContainer("🖼️ AI Image - Single Generation", { id: "test-ai-image-single", width: 600, height: 500 });
    contentArea.innerHTML = '<div style="color:#94a3b8;text-align:center;padding:20px;">⏳ Generating single image...</div>';
    const result = await aiImageTest2.testSingleGeneration(contentArea);
    if (!(result == null ? void 0 : result.success)) {
      contentArea.innerHTML = `<div style="color:#ff6b6b;padding:10px;">❌ Error: ${(result == null ? void 0 : result.error) || "Test failed"}</div>`;
      throw new Error((result == null ? void 0 : result.error) || "Test failed");
    }
    contentArea.innerHTML += `
      <div style="padding:15px;margin-top:15px;">
        <div style="color:#4ade80;font-size:12px;margin-bottom:10px;">✅ Single generation completed!</div>
        <div style="background:#0f172a;color:#e2e8f0;padding:15px;border-radius:6px;font-size:12px;">
          <div style="margin-bottom:8px;"><strong>Seed:</strong> ${result.data.seed}</div>
          <div style="margin-bottom:8px;"><strong>Generation Time:</strong> ${result.data.generationTime}ms</div>
          <div style="margin-bottom:8px;"><strong>Prompt Length:</strong> ${result.data.promptLength} chars</div>
          <div style="margin-bottom:8px;"><strong>DOM Element Found:</strong> ${result.data.domElementFound ? "✅" : "❌"}</div>
          <div><strong>Total Time:</strong> ${result.data.totalTime}ms</div>
        </div>
      </div>`;
    console.log("✅ AI Image single test completed!");
  }
  async function aiImageBatchHandler() {
    console.log("🖼️ Testing AI Image batch generation...");
    if (!aiImageTest2 || !aiImageTest2.available) throw new Error("Plugin not available");
    const { contentArea } = createTestContainer("🖼️ AI Image - Batch Generation", { id: "test-ai-image-batch", width: 600, height: 500 });
    contentArea.innerHTML = '<div style="color:#94a3b8;text-align:center;padding:20px;">⏳ Generating 2 images in batch...</div>';
    const result = await aiImageTest2.testBatchGeneration(contentArea);
    if (!(result == null ? void 0 : result.success)) {
      contentArea.innerHTML = `<div style="color:#ff6b6b;padding:10px;">❌ Error: ${(result == null ? void 0 : result.error) || "Test failed"}</div>`;
      throw new Error((result == null ? void 0 : result.error) || "Test failed");
    }
    const seedsHTML = result.data.seeds.map((s, i) => `<div>Image ${i + 1}: ${s}</div>`).join("");
    contentArea.innerHTML += `
      <div style="padding:15px;margin-top:15px;">
        <div style="color:#4ade80;font-size:12px;margin-bottom:10px;">✅ Batch generation completed!</div>
        <div style="background:#0f172a;color:#e2e8f0;padding:15px;border-radius:6px;font-size:12px;">
          <div style="margin-bottom:8px;"><strong>Count:</strong> ${result.data.count}</div>
          <div style="margin-bottom:8px;"><strong>onAllFinish Called:</strong> ${result.data.allFinishedCalled ? "✅" : "❌"}</div>
          <div style="margin-bottom:8px;"><strong>DOM Elements Found:</strong> ${result.data.domElementsFound}</div>
          <div style="margin-bottom:8px;"><strong>Total Time:</strong> ${result.data.totalTime}ms</div>
          <div style="margin-top:10px;padding-top:10px;border-top:1px solid #334155;">
            <strong>Seeds:</strong><br>${seedsHTML}
          </div>
        </div>
      </div>`;
    console.log("✅ AI Image batch test completed!");
  }
  async function aiImageProcessingHandler() {
    console.log("🖼️ Testing AI Image prompt processing...");
    if (!aiImageTest2 || !aiImageTest2.available) throw new Error("Plugin not available");
    const { contentArea } = createTestContainer("🖼️ AI Image - Prompt Processing", { id: "test-ai-image-processing", width: 600, height: 500 });
    contentArea.innerHTML = '<div style="color:#94a3b8;text-align:center;padding:20px;">⏳ Testing hooks and default tags...</div>';
    const result = await aiImageTest2.testPromptProcessing(contentArea);
    if (!(result == null ? void 0 : result.success)) {
      contentArea.innerHTML = `<div style="color:#ff6b6b;padding:10px;">❌ Error: ${(result == null ? void 0 : result.error) || "Test failed"}</div>`;
      throw new Error((result == null ? void 0 : result.error) || "Test failed");
    }
    contentArea.innerHTML += `
      <div style="padding:15px;margin-top:15px;">
        <div style="color:#4ade80;font-size:12px;margin-bottom:10px;">✅ Prompt processing completed!</div>
        <div style="background:#0f172a;color:#e2e8f0;padding:15px;border-radius:6px;font-size:12px;">
          <div style="margin-bottom:8px;"><strong>preprocess Called:</strong> ${result.data.preprocessCalled ? "✅" : "❌"}</div>
          <div style="margin-bottom:8px;"><strong>postprocess Called:</strong> ${result.data.postprocessCalled ? "✅" : "❌"}</div>
          <div style="margin-bottom:8px;"><strong>Has Quality Tags:</strong> ${result.data.hasQualityTags ? "✅" : "❌"}</div>
          <div style="margin-bottom:8px;"><strong>Has Negative Prompt:</strong> ${result.data.hasNegativePrompt ? "✅" : "❌"}</div>
          <div style="margin-top:10px;padding-top:10px;border-top:1px solid #334155;">
            <strong>Final Prompt (preview):</strong><br>
            <div style="background:#1e293b;padding:8px;border-radius:4px;margin-top:5px;word-break:break-all;font-family:monospace;font-size:11px;">
              ${result.data.finalPrompt}
            </div>
          </div>
        </div>
      </div>`;
    console.log("✅ AI Image processing test completed!");
  }
  async function aiImageErrorsHandler() {
    console.log("🖼️ Testing AI Image error handling...");
    if (!aiImageTest2 || !aiImageTest2.available) throw new Error("Plugin not available");
    const { contentArea } = createTestContainer("🖼️ AI Image - Error Handling", { id: "test-ai-image-errors", width: 600, height: 400 });
    contentArea.innerHTML = '<div style="color:#94a3b8;text-align:center;padding:20px;">⏳ Testing error scenarios...</div>';
    const result = await aiImageTest2.testErrorHandling();
    if (!(result == null ? void 0 : result.success)) {
      contentArea.innerHTML = `<div style="color:#ff6b6b;padding:10px;">❌ Error: ${(result == null ? void 0 : result.error) || "Test failed"}</div>`;
      throw new Error((result == null ? void 0 : result.error) || "Test failed");
    }
    contentArea.innerHTML += `
      <div style="padding:15px;margin-top:15px;">
        <div style="color:#4ade80;font-size:12px;margin-bottom:10px;">✅ Error handling test completed!</div>
        <div style="background:#0f172a;color:#e2e8f0;padding:15px;border-radius:6px;font-size:12px;">
          <div style="color:#94a3b8;">All error scenarios were handled gracefully:</div>
          <ul style="margin-top:10px;padding-left:20px;color:#4ade80;">
            <li>Empty prompt validation</li>
            <li>Invalid resolution handling</li>
            <li>Non-existent DOM container</li>
          </ul>
          <div style="margin-top:10px;color:#94a3b8;font-style:italic;">${result.data.message}</div>
        </div>
      </div>`;
    console.log("✅ AI Image error handling test completed!");
  }
  async function imageHandler() {
    console.log("🖼️ Generating AI image...");
    if (!imageTest2 || !imageTest2.available) throw new Error("Plugin not available");
    const result = await imageTest2.testBasicImage();
    if (!(result == null ? void 0 : result.success)) throw new Error((result == null ? void 0 : result.error) || "Image generation failed");
    console.log("✅ Image generated!");
  }
  async function imageGuidanceHandler() {
    console.log("⚖️ Testing guidance scale...");
    if (!imageTest2 || !imageTest2.available) throw new Error("Plugin not available");
    const result = await imageTest2.testGuidanceScale();
    if (!(result == null ? void 0 : result.success)) throw new Error((result == null ? void 0 : result.error) || "Guidance scale test failed");
    console.log("✅ Guidance scale test completed!");
  }
  async function imageNegativeHandler() {
    console.log("🚫 Testing negative prompt...");
    if (!imageTest2 || !imageTest2.available) throw new Error("Plugin not available");
    const result = await imageTest2.testNegativePrompt();
    if (!(result == null ? void 0 : result.success)) throw new Error((result == null ? void 0 : result.error) || "Negative prompt test failed");
    console.log("✅ Negative prompt test completed!");
  }
  async function imageTriggerHandler() {
    console.log("🎭 Testing trigger words...");
    if (!imageTest2 || !imageTest2.available) throw new Error("Plugin not available");
    const result = await imageTest2.testTriggerWords();
    if (!(result == null ? void 0 : result.success)) throw new Error((result == null ? void 0 : result.error) || "Trigger words test failed");
    console.log("✅ Trigger words test completed!");
  }
  async function imageEmojiHandler() {
    console.log("😀 Testing emoji prompts...");
    if (!imageTest2 || !imageTest2.available) throw new Error("Plugin not available");
    const result = await imageTest2.testEmojiPrompts();
    if (!(result == null ? void 0 : result.success)) throw new Error((result == null ? void 0 : result.error) || "Emoji prompts test failed");
    console.log("✅ Emoji prompts test completed!");
  }
  async function imageOnFinishHandler() {
    console.log("📊 Testing onFinish callback...");
    if (!imageTest2 || !imageTest2.available) throw new Error("Plugin not available");
    const result = await imageTest2.testOnFinishCallback();
    if (!(result == null ? void 0 : result.success)) throw new Error((result == null ? void 0 : result.error) || "onFinish callback test failed");
    console.log("✅ onFinish callback test completed!");
  }
  async function imageTagEmphasisHandler() {
    console.log("🎯 Testing tag emphasis...");
    if (!imageTest2 || !imageTest2.available) throw new Error("Plugin not available");
    const result = await imageTest2.testTagEmphasis();
    if (!(result == null ? void 0 : result.success)) throw new Error((result == null ? void 0 : result.error) || "Tag emphasis test failed");
    console.log("✅ Tag emphasis test completed!");
  }
  async function imagePromptOrderingHandler() {
    console.log("🔀 Testing prompt ordering...");
    if (!imageTest2 || !imageTest2.available) throw new Error("Plugin not available");
    const result = await imageTest2.testPromptOrdering();
    if (!(result == null ? void 0 : result.success)) throw new Error((result == null ? void 0 : result.error) || "Prompt ordering test failed");
    console.log("✅ Prompt ordering test completed!");
  }
  async function imageCanvasPostProcessingHandler() {
    console.log("🎨 Testing canvas post-processing...");
    if (!imageTest2 || !imageTest2.available) throw new Error("Plugin not available");
    const result = await imageTest2.testCanvasPostProcessing();
    if (!(result == null ? void 0 : result.success)) throw new Error((result == null ? void 0 : result.error) || "Canvas post-processing test failed");
    console.log("✅ Canvas post-processing test completed!");
  }
  async function imageBreakKeywordHandler() {
    console.log("⚡ Testing BREAK keyword...");
    if (!imageTest2 || !imageTest2.available) throw new Error("Plugin not available");
    const result = await imageTest2.testBreakKeyword();
    if (!(result == null ? void 0 : result.success)) throw new Error((result == null ? void 0 : result.error) || "BREAK keyword test failed");
    console.log("✅ BREAK keyword test completed!");
  }
  async function imageTagBlendingHandler() {
    console.log("🎨 Testing tag blending...");
    if (!imageTest2 || !imageTest2.available) throw new Error("Plugin not available");
    const { contentArea } = createTestContainer("🎨 Image Test - Tag Blending", { id: "test-image-blending", width: 800, height: 600 });
    const result = await imageTest2.testTagBlending(contentArea);
    if (!(result == null ? void 0 : result.success)) throw new Error((result == null ? void 0 : result.error) || "Tag blending test failed");
    console.log("✅ Tag blending test completed!");
  }
  async function imageMultiImageGridHandler() {
    console.log("🖼️ Testing multi-image grid...");
    if (!imageTest2 || !imageTest2.available) throw new Error("Plugin not available");
    const { contentArea } = createTestContainer("🖼️ Image Test - Multi-Image Grid", { id: "test-image-grid", width: 800, height: 600 });
    const result = await imageTest2.testMultiImageGrid(contentArea);
    if (!(result == null ? void 0 : result.success)) throw new Error((result == null ? void 0 : result.error) || "Multi-image grid test failed");
    console.log("✅ Multi-image grid test completed!");
  }
  async function imageAlternatingTagsHandler() {
    console.log("🔄 Testing alternating tags...");
    if (!imageTest2 || !imageTest2.available) throw new Error("Plugin not available");
    const { contentArea } = createTestContainer("🔄 Image Test - Alternating Tags", { id: "test-image-alternating", width: 800, height: 600 });
    const result = await imageTest2.testAlternatingTags(contentArea);
    if (!(result == null ? void 0 : result.success)) throw new Error((result == null ? void 0 : result.error) || "Alternating tags test failed");
    console.log("✅ Alternating tags test completed!");
  }
  async function imageAddRemoveDuringGenHandler() {
    console.log("➕ Testing add/remove during generation...");
    if (!imageTest2 || !imageTest2.available) throw new Error("Plugin not available");
    const { contentArea } = createTestContainer("➕ Image Test - Add/Remove During Gen", { id: "test-image-addremove", width: 800, height: 600 });
    const result = await imageTest2.testAddRemoveDuringGen(contentArea);
    if (!(result == null ? void 0 : result.success)) throw new Error((result == null ? void 0 : result.error) || "Add/remove during generation test failed");
    console.log("✅ Add/remove during generation test completed!");
  }
  async function ttsHandler() {
    console.log("🔊 Testing Text-to-Speech...");
    if (!ttsTest2 || !ttsTest2.available) throw new Error("Plugin not available");
    const { contentArea, container: container2 } = createTestContainer("🔊 TTS Test", { id: "test-tts", width: 500, height: 350 });
    const testText = "Olá! Este é um teste de síntese de voz no Perchance.";
    contentArea.innerHTML = `
      <div style="padding:10px;">
        <div style="color:#94a3b8;font-size:12px;margin-bottom:10px;">Texto:</div>
        <div style="color:#e2e8f0;padding:10px;background:#0f172a;border-radius:4px;margin-bottom:15px;">"${testText}"</div>
        <div style="display:flex;gap:10px;margin-bottom:15px;">
          <button id="tts-play" style="flex:1;padding:10px;background:#166534;color:white;border:none;border-radius:4px;cursor:pointer;font-size:14px;">▶ Falar</button>
          <button id="tts-stop" style="flex:1;padding:10px;background:#991b1b;color:white;border:none;border-radius:4px;cursor:pointer;font-size:14px;">⏹ Parar</button>
        </div>
        <div id="tts-status" style="color:#94a3b8;font-size:12px;text-align:center;">Pronto para falar</div>
      </div>`;
    const playBtn = container2.querySelector("#tts-play");
    const stopBtn = container2.querySelector("#tts-stop");
    const status = container2.querySelector("#tts-status");
    playBtn.addEventListener("click", () => {
      ttsTest2.speakBasic(testText);
      status.textContent = "🔊 Falando...";
      status.style.color = "#4ade80";
    });
    stopBtn.addEventListener("click", () => {
      ttsTest2.stopSpeech();
      status.textContent = "⏹ Parado";
      status.style.color = "#fbbf24";
    });
    console.log("✅ TTS container ready!");
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
    if (!canvasTest2.ctx) {
      console.log("🔄 [Canvas] Re-initializing canvas...");
      canvasTest2.init(rendererData);
    }
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
  async function indexeddbPrimitivesHandler() {
    console.log("🗃️ Testing IndexedDB primitives...");
    if (!indexeddbTest2 || !indexeddbTest2.available) throw new Error("IndexedDB not available");
    const { contentArea } = createTestContainer("🗃️ IndexedDB - Primitive Types", { id: "test-indexeddb", width: 700, height: 500 });
    contentArea.innerHTML = '<div style="color:#94a3b8;text-align:center;padding:20px;">⏳ Running test suite...</div>';
    const result = await indexeddbTest2.runPrimitiveTestSuite();
    const rows = result.roundTrips.map((r) => {
      const savedStr = JSON.stringify(r.saved).substring(0, 40);
      const retrievedStr = JSON.stringify(r.retrieved).substring(0, 40);
      return `<tr>
        <td style="color:#fbbf24;padding:6px;border-bottom:1px solid #333;">${r.key}</td>
        <td style="color:#94a3b8;padding:6px;border-bottom:1px solid #333;">${r.expected}</td>
        <td style="color:#e2e8f0;padding:6px;border-bottom:1px solid #333;font-size:11px;max-width:150px;overflow:hidden;text-overflow:ellipsis;">${savedStr}</td>
        <td style="color:#e2e8f0;padding:6px;border-bottom:1px solid #333;font-size:11px;max-width:150px;overflow:hidden;text-overflow:ellipsis;">${retrievedStr}</td>
        <td style="padding:6px;border-bottom:1px solid #333;text-align:center;">${r.match ? "✅" : "❌"}</td>
      </tr>`;
    }).join("");
    contentArea.innerHTML = `
      <div style="padding:10px;">
        <table style="width:100%;border-collapse:collapse;font-size:12px;">
          <thead><tr style="background:#1e293b;">
            <th style="padding:8px;color:#94a3b8;text-align:left;">Key</th>
            <th style="padding:8px;color:#94a3b8;text-align:left;">Type</th>
            <th style="padding:8px;color:#94a3b8;text-align:left;">Saved</th>
            <th style="padding:8px;color:#94a3b8;text-align:left;">Retrieved</th>
            <th style="padding:8px;color:#94a3b8;text-align:center;">Match</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <div style="margin-top:15px;display:flex;gap:15px;flex-wrap:wrap;">
          <div style="padding:8px;background:#1e293b;border-radius:4px;font-size:11px;">
            <span style="color:#94a3b8;">Keys saved:</span> <span style="color:#4ade80;">${result.totalKeys}</span>
          </div>
          <div style="padding:8px;background:#1e293b;border-radius:4px;font-size:11px;">
            <span style="color:#94a3b8;">After delete:</span> <span style="color:#fbbf24;">${result.keysAfterDelete}</span>
          </div>
          <div style="padding:8px;background:#1e293b;border-radius:4px;font-size:11px;">
            <span style="color:#94a3b8;">Quota:</span> <span style="color:#e2e8f0;">${result.storageEstimate.quota || "N/A"}</span>
          </div>
          <div style="padding:8px;background:#1e293b;border-radius:4px;font-size:11px;">
            <span style="color:#94a3b8;">Usage:</span> <span style="color:#e2e8f0;">${result.storageEstimate.usage || "N/A"}</span>
          </div>
        </div>
      </div>`;
    console.log(`✅ IndexedDB: ${result.totalKeys} types saved, ${result.keysAfterDelete} after delete`);
  }
  async function indexeddbAIHandler() {
    console.log("🤖 Generating AI + saving to IndexedDB...");
    if (!indexeddbTest2 || !indexeddbTest2.available) throw new Error("IndexedDB not available");
    if (!aiTextTest2 || !aiTextTest2.available) throw new Error("AI Text not available");
    if (!imageTest2 || !imageTest2.available) throw new Error("Image not available");
    const { contentArea } = createTestContainer("🤖 IndexedDB - AI Results", { id: "test-indexeddb-ai", width: 700, height: 600 });
    contentArea.innerHTML = '<div style="color:#94a3b8;text-align:center;padding:20px;">⏳ Generating 3 texts + 3 images and saving to IndexedDB...</div>';
    await indexeddbTest2.openDB();
    await indexeddbTest2.clearAIResults();
    const texts = [];
    const prompts = [
      "Write a short phrase about a brave knight.",
      "Describe a mysterious forest in one sentence.",
      "Write a riddle about a dragon."
    ];
    for (const p of prompts) {
      const r = await aiTextTest2.generateBasic(p);
      if (r == null ? void 0 : r.success) texts.push({ text: r.text, metadata: { prompt: p } });
    }
    const images = [];
    const imgPrompts = ["papercraft warrior", "papercraft wizard", "papercraft dragon"];
    for (const p of imgPrompts) {
      const r = await imageTest2.testBasicImage();
      if ((r == null ? void 0 : r.success) && r.url) images.push({ dataUrl: r.url, metadata: { prompt: p } });
      if (images.length >= 3) break;
    }
    await indexeddbTest2.saveAIBatch(texts, images);
    const loaded = await indexeddbTest2.loadAIResults();
    const count = await indexeddbTest2.getAIResultsCount();
    const textHtml = loaded.filter((r) => r.type === "text").map(
      (r) => `<div style="padding:8px;background:#0f172a;border-radius:4px;margin-bottom:8px;border-left:3px solid #4ade80;">
        <div style="color:#e2e8f0;font-size:12px;">${r.content}</div>
        <div style="color:#64748b;font-size:10px;margin-top:4px;">${r.metadata.chars} chars | ${new Date(r.timestamp).toLocaleTimeString()}</div>
      </div>`
    ).join("");
    const imgHtml = loaded.filter((r) => r.type === "image").map(
      (r) => `<div style="display:inline-block;margin:4px;">
        <img src="${r.content}" style="width:100px;height:100px;object-fit:cover;border-radius:4px;border:1px solid #404040;" />
        <div style="color:#64748b;font-size:9px;text-align:center;">${r.metadata.sizeKB}KB</div>
      </div>`
    ).join("");
    contentArea.innerHTML = `
      <div style="padding:10px;">
        <div style="color:#4ade80;font-weight:bold;margin-bottom:10px;">📝 Saved Texts (${count.texts}/3)</div>
        ${textHtml || '<div style="color:#ff6b6b;">No texts saved</div>'}
        <div style="color:#4ade80;font-weight:bold;margin:15px 0 10px;">🖼️ Saved Images (${count.images}/3)</div>
        <div style="display:flex;flex-wrap:wrap;">${imgHtml || '<div style="color:#ff6b6b;">No images saved</div>'}</div>
        <div style="margin-top:15px;padding:8px;background:#1e293b;border-radius:4px;font-size:11px;text-align:center;">
          <span style="color:#94a3b8;">Total records:</span> <span style="color:#4ade80;font-weight:bold;">${count.total}</span>
        </div>
      </div>`;
    console.log(`✅ IndexedDB AI: ${count.texts} texts + ${count.images} images saved`);
  }
  async function indexeddbLoadHandler() {
    console.log("📂 Loading saved AI results from IndexedDB...");
    if (!indexeddbTest2 || !indexeddbTest2.available) throw new Error("IndexedDB not available");
    const { contentArea } = createTestContainer("📂 IndexedDB - Load Saved", { id: "test-indexeddb-load", width: 700, height: 500 });
    await indexeddbTest2.openDB();
    const loaded = await indexeddbTest2.loadAIResults();
    const count = await indexeddbTest2.getAIResultsCount();
    if (loaded.length === 0) {
      contentArea.innerHTML = '<div style="color:#fbbf24;text-align:center;padding:20px;">⚠️ No saved results. Run "Generate AI + Save" first.</div>';
      return;
    }
    const textHtml = loaded.filter((r) => r.type === "text").map(
      (r) => `<div style="padding:8px;background:#0f172a;border-radius:4px;margin-bottom:8px;border-left:3px solid #4ade80;">
        <div style="color:#e2e8f0;font-size:12px;">${r.content}</div>
        <div style="color:#64748b;font-size:10px;margin-top:4px;">${r.metadata.chars} chars | ${new Date(r.timestamp).toLocaleTimeString()}</div>
      </div>`
    ).join("");
    const imgHtml = loaded.filter((r) => r.type === "image").map(
      (r) => `<div style="display:inline-block;margin:4px;">
        <img src="${r.content}" style="width:120px;height:120px;object-fit:cover;border-radius:4px;border:1px solid #404040;" />
        <div style="color:#64748b;font-size:9px;text-align:center;">${r.metadata.sizeKB}KB</div>
      </div>`
    ).join("");
    contentArea.innerHTML = `
      <div style="padding:10px;">
        <div style="color:#4ade80;font-weight:bold;margin-bottom:10px;">📝 Texts (${count.texts})</div>
        ${textHtml || '<div style="color:#94a3b8;">No texts</div>'}
        <div style="color:#4ade80;font-weight:bold;margin:15px 0 10px;">🖼️ Images (${count.images})</div>
        <div style="display:flex;flex-wrap:wrap;">${imgHtml || '<div style="color:#94a3b8;">No images</div>'}</div>
      </div>`;
    console.log(`✅ Loaded: ${count.texts} texts + ${count.images} images`);
  }
  async function indexeddbClearHandler() {
    console.log("🗑️ Clearing all IndexedDB test data...");
    if (!indexeddbTest2 || !indexeddbTest2.available) throw new Error("IndexedDB not available");
    await indexeddbTest2.deleteDB();
    console.log("✅ IndexedDB: All data cleared");
  }
  async function cellularAutomataHandler() {
    console.log("\\ud83e\\uddec Testing Cellular Automata...");
    if (!cellularAutomataTest2) throw new Error("Cellular Automata not available");
    if (cellularAutomataTest2.running) {
      cellularAutomataTest2.cleanup();
      console.log("\\uddd1\\ufe0f Cellular Automata: Disposed");
      return;
    }
    cellularAutomataTest2.init(rendererData);
    console.log("✅ Cellular Automata: 128x128 grid initialized");
  }
  async function gsapBasicHandler() {
    console.log("🎬 Testing GSAP Basic Tween...");
    if (!gsapTest2) throw new Error("GSAP not available");
    if (gsapTest2.isLoading && gsapTest2.isLoading()) {
      console.log("⏳ GSAP still loading, waiting...");
      await gsapTest2.getGsap();
    }
    await gsapTest2.testBasicTween();
  }
  async function gsapFromHandler() {
    console.log("🎬 Testing GSAP From Tween...");
    if (!gsapTest2) throw new Error("GSAP not available");
    await gsapTest2.testFromTween();
  }
  async function gsapTimelineHandler() {
    console.log("🎬 Testing GSAP Timeline...");
    if (!gsapTest2) throw new Error("GSAP not available");
    await gsapTest2.testTimeline();
  }
  async function gsapStaggerHandler() {
    console.log("🎬 Testing GSAP Stagger...");
    if (!gsapTest2) throw new Error("GSAP not available");
    await gsapTest2.testStagger();
  }
  async function gsapEasingHandler() {
    console.log("🎬 Testing GSAP Easing...");
    if (!gsapTest2) throw new Error("GSAP not available");
    await gsapTest2.testEasing();
  }
  async function gsapCleanupHandler() {
    console.log("🧹 GSAP Cleanup...");
    if (!gsapTest2) throw new Error("GSAP not available");
    gsapTest2.cleanup();
  }
  const panel = document.createElement("div");
  panel.id = "ui-test-panel";
  panel.innerHTML = `
    <h3>🧪 Test Panel ${VERSION}</h3>
    
    <div class="ui-test-controls">
      <button id="btn-run-all" class="ui-test-btn ui-test-btn--system">▶ Run All</button>
    </div>
    
    <div class="how-it-works-section">
      <details class="how-it-works-accordion">
        <summary style="color:#4ade80;font-weight:bold;cursor:pointer;padding:8px;background:#1e293b;border-radius:4px;">📖 How It Works (Click to expand)</summary>
        <div style="margin-top:8px;padding:8px;">
          <div id="how-it-works-container"></div>
        </div>
      </details>
    </div>
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
      <button id="btn-ai-startwith" class="ui-test-btn ui-test-btn--ai">🔤 startWith</button>
      <button id="btn-ai-stop" class="ui-test-btn ui-test-btn--ai">🛑 stopSequences</button>
      <button id="btn-ai-style" class="ui-test-btn ui-test-btn--ai">🎨 style & outputTo</button>
      <button id="btn-ai-endbuttons" class="ui-test-btn ui-test-btn--ai">🚫 endButtons</button>
      <button id="btn-ai-onchunk" class="ui-test-btn ui-test-btn--ai">📦 onChunk</button>
      <button id="btn-ai-onfinish" class="ui-test-btn ui-test-btn--ai">📊 onFinish</button>
      <button id="btn-ai-dynamic" class="ui-test-btn ui-test-btn--ai">🎲 Dynamic</button>
      <button id="btn-ai-render" class="ui-test-btn ui-test-btn--ai">🎨 Render</button>
      <button id="btn-ai-json" class="ui-test-btn ui-test-btn--ai">📋 JSON</button>
      <button id="btn-ai-markdown" class="ui-test-btn ui-test-btn--ai">📝 Markdown</button>
      <button id="btn-ai-concurrency" class="ui-test-btn ui-test-btn--ai">⚡ Concurrency</button>
    </div>
    
    <div class="ui-test-category">
      <strong style="color:#f472b6">🖼️ Advanced AI Image Plugin</strong>
      <button id="btn-ai-image-single" class="ui-test-btn ui-test-btn--ai">🖼️ Single</button>
      <button id="btn-ai-image-batch" class="ui-test-btn ui-test-btn--ai">🖼️ Batch</button>
      <button id="btn-ai-image-processing" class="ui-test-btn ui-test-btn--ai">⚙️ Processing</button>
      <button id="btn-ai-image-errors" class="ui-test-btn ui-test-btn--ai">⚠️ Errors</button>
    </div>
    
    <div class="ui-test-category">
      <strong style="color:var(--ui-color-render)">
    <div class="ui-test-category">
      <strong style="color:#a78bfa">🖼️ Image Generation Tests</strong>
      <button id="btn-image" class="ui-test-btn ui-test-btn--ai">🖼️ Image</button><button id="btn-image-guidance" class="ui-test-btn ui-test-btn--ai">⚖️ CFG Scale</button><button id="btn-image-negative" class="ui-test-btn ui-test-btn--ai">🚫 Negative</button><button id="btn-image-trigger" class="ui-test-btn ui-test-btn--ai">🎭 Triggers</button><button id="btn-image-emoji" class="ui-test-btn ui-test-btn--ai">😀 Emoji</button><button id="btn-image-onfinish" class="ui-test-btn ui-test-btn--ai">📊 Callback</button><button id="btn-image-emphasis" class="ui-test-btn ui-test-btn--ai">🎯 Emphasis</button><button id="btn-image-ordering" class="ui-test-btn ui-test-btn--ai">🔄 Ordering</button><button id="btn-image-canvas" class="ui-test-btn ui-test-btn--ai">🎨 Canvas</button><button id="btn-image-break" class="ui-test-btn ui-test-btn--ai">⚡ BREAK</button><button id="btn-image-blending" class="ui-test-btn ui-test-btn--ai">🎨 Blending</button><button id="btn-image-grid" class="ui-test-btn ui-test-btn--ai">🖼️ Grid</button><button id="btn-image-alternating" class="ui-test-btn ui-test-btn--ai">🔄 Alternating</button><button id="btn-image-addremove" class="ui-test-btn ui-test-btn--ai">➕ Add/Remove</button>
    </div>
    🎨 Rendering</strong>
      <button id="btn-3d" class="ui-test-btn ui-test-btn--render">🎲 Cube Color</button>
      <button id="btn-raycaster" class="ui-test-btn ui-test-btn--render">🖱️ Raycaster</button>
      <button id="btn-canvas" class="ui-test-btn ui-test-btn--render">🎨 Canvas</button>
      <button id="btn-rpg-icon" class="ui-test-btn ui-test-btn--render">⚔️ RPG Icons</button>
      <button id="btn-particles" class="ui-test-btn ui-test-btn--render">✨ Particles</button>
      <button id="btn-cellular-automata" class="ui-test-btn ui-test-btn--render">\\ud83e\\uddec Cellular Automata</button>
      <button id="btn-gsap-basic" class="ui-test-btn ui-test-btn--render">🎬 GSAP Tween</button>
      <button id="btn-gsap-from" class="ui-test-btn ui-test-btn--render">🎬 GSAP From</button>
      <button id="btn-gsap-timeline" class="ui-test-btn ui-test-btn--render">🎬 Timeline</button>
      <button id="btn-gsap-stagger" class="ui-test-btn ui-test-btn--render">🎬 Stagger</button>
      <button id="btn-gsap-easing" class="ui-test-btn ui-test-btn--render">🎬 Easing</button>
      <button id="btn-gsap-cleanup" class="ui-test-btn ui-test-btn--render">🧹 Cleanup</button>
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
      <button id="btn-indexeddb-types" class="ui-test-btn ui-test-btn--data">🗃️ IDB Types</button>
      <button id="btn-indexeddb-ai" class="ui-test-btn ui-test-btn--data">🤖 IDB+AI</button>
      <button id="btn-indexeddb-load" class="ui-test-btn ui-test-btn--data">📂 IDB Load</button>
      <button id="btn-indexeddb-clear" class="ui-test-btn ui-test-btn--data">🗑️ IDB Clear</button>
    </div>
  `;
  document.body.appendChild(panel);
  const howContainer = document.getElementById("how-it-works-container");
  if (howContainer) {
    HOW_IT_WORKS_DATA.forEach((item) => {
      const details = document.createElement("details");
      details.innerHTML = `
        <summary>${item.title}</summary>
        <div class="how-it-works-content">
          <h4>📌 What</h4><p>${item.what}</p>
          <h4>⚙️ How</h4><p>${item.how}</p>
          <h4>🔑 Key Concepts</h4><p>${item.key}</p>
        </div>
      `;
      howContainer.appendChild(details);
    });
    howContainer.addEventListener("toggle", (e) => {
      if (e.target.open) {
        howContainer.querySelectorAll("details").forEach((d) => {
          if (d !== e.target) d.open = false;
        });
      }
    });
  }
  console.log("📎 [UI-Test] Panel attached to document.body");
  const rect = panel.getBoundingClientRect();
  console.log(`📐 [UI-Test] Panel visible: ${rect.width}x${rect.height}px at (${rect.left}, ${rect.top})`);
  document.getElementById("btn-run-all").onclick = () => runAllTests(testDefs);
  document.getElementById("btn-dice").onclick = () => runTest("btn-dice", "Dice", diceHandler);
  document.getElementById("btn-seeder").onclick = () => runTest("btn-seeder", "Seeder", seederHandler);
  document.getElementById("btn-pattern").onclick = () => runTest("btn-pattern", "Pattern", patternHandler);
  document.getElementById("btn-ai-text").onclick = () => runTest("btn-ai-text", "AI Text", aiTextHandler);
  document.getElementById("btn-ai-startwith").onclick = () => runTest("btn-ai-startwith", "AI Text - startWith", aiTextStartWithHandler);
  document.getElementById("btn-ai-stop").onclick = () => runTest("btn-ai-stop", "AI Text - stopSequences", aiTextStopSequencesHandler);
  document.getElementById("btn-ai-style").onclick = () => runTest("btn-ai-style", "AI Text - style & outputTo", aiTextStyleOutputHandler);
  document.getElementById("btn-ai-endbuttons").onclick = () => runTest("btn-ai-endbuttons", "AI Text - endButtons", aiTextEndButtonsHandler);
  document.getElementById("btn-ai-onchunk").onclick = () => runTest("btn-ai-onchunk", "AI Text - onChunk", aiTextOnChunkHandler);
  document.getElementById("btn-ai-onfinish").onclick = () => runTest("btn-ai-onfinish", "AI Text - onFinish", aiTextOnFinishHandler);
  document.getElementById("btn-ai-dynamic").onclick = () => runTest("btn-ai-dynamic", "AI Text - Dynamic", aiTextDynamicHandler);
  document.getElementById("btn-ai-render").onclick = () => runTest("btn-ai-render", "AI Text - Render", aiTextRenderHandler);
  document.getElementById("btn-ai-json").onclick = () => runTest("btn-ai-json", "AI Text - JSON", aiTextStructuredJSONHandler);
  document.getElementById("btn-ai-markdown").onclick = () => runTest("btn-ai-markdown", "AI Text - Markdown", aiTextMarkdownRenderHandler);
  document.getElementById("btn-ai-concurrency").onclick = () => runTest("btn-ai-concurrency", "AI Text - Concurrency", aiTextConcurrencyHandler);
  document.getElementById("btn-ai-image-single").onclick = () => runTest("btn-ai-image-single", "AI Image - Single", aiImageSingleHandler);
  document.getElementById("btn-ai-image-batch").onclick = () => runTest("btn-ai-image-batch", "AI Image - Batch", aiImageBatchHandler);
  document.getElementById("btn-ai-image-processing").onclick = () => runTest("btn-ai-image-processing", "AI Image - Processing", aiImageProcessingHandler);
  document.getElementById("btn-ai-image-errors").onclick = () => runTest("btn-ai-image-errors", "AI Image - Errors", aiImageErrorsHandler);
  document.getElementById("btn-image").onclick = () => runTest("btn-image", "Image", imageHandler);
  document.getElementById("btn-image-guidance").onclick = () => runTest("btn-image-guidance", "CFG Scale", imageGuidanceHandler);
  document.getElementById("btn-image-negative").onclick = () => runTest("btn-image-negative", "Negative Prompt", imageNegativeHandler);
  document.getElementById("btn-image-trigger").onclick = () => runTest("btn-image-trigger", "Trigger Words", imageTriggerHandler);
  document.getElementById("btn-image-emoji").onclick = () => runTest("btn-image-emoji", "Emoji Prompts", imageEmojiHandler);
  document.getElementById("btn-image-onfinish").onclick = () => runTest("btn-image-onfinish", "onFinish Callback", imageOnFinishHandler);
  document.getElementById("btn-image-emphasis").onclick = () => runTest("btn-image-emphasis", "Tag Emphasis", imageTagEmphasisHandler);
  document.getElementById("btn-image-ordering").onclick = () => runTest("btn-image-ordering", "Prompt Ordering", imagePromptOrderingHandler);
  document.getElementById("btn-image-canvas").onclick = () => runTest("btn-image-canvas", "Canvas Post-Processing", imageCanvasPostProcessingHandler);
  document.getElementById("btn-image-break").onclick = () => runTest("btn-image-break", "BREAK Keyword", imageBreakKeywordHandler);
  document.getElementById("btn-image-blending").onclick = () => runTest("btn-image-blending", "Tag Blending", imageTagBlendingHandler);
  document.getElementById("btn-image-grid").onclick = () => runTest("btn-image-grid", "Multi-Image Grid", imageMultiImageGridHandler);
  document.getElementById("btn-image-alternating").onclick = () => runTest("btn-image-alternating", "Alternating Tags", imageAlternatingTagsHandler);
  document.getElementById("btn-image-addremove").onclick = () => runTest("btn-image-addremove", "Add/Remove During Gen", imageAddRemoveDuringGenHandler);
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
  document.getElementById("btn-indexeddb-types").onclick = () => runTest("btn-indexeddb-types", "IndexedDB Types", indexeddbPrimitivesHandler);
  document.getElementById("btn-indexeddb-ai").onclick = () => runTest("btn-indexeddb-ai", "IndexedDB AI", indexeddbAIHandler);
  document.getElementById("btn-indexeddb-load").onclick = () => runTest("btn-indexeddb-load", "IndexedDB Load", indexeddbLoadHandler);
  document.getElementById("btn-indexeddb-clear").onclick = () => runTest("btn-indexeddb-clear", "IndexedDB Clear", indexeddbClearHandler);
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
  document.getElementById("btn-cellular-automata").onclick = () => runTest("btn-cellular-automata", "Cellular Automata", cellularAutomataHandler);
  document.getElementById("btn-gsap-basic").onclick = () => runTest("btn-gsap-basic", "GSAP Tween", gsapBasicHandler);
  document.getElementById("btn-gsap-from").onclick = () => runTest("btn-gsap-from", "GSAP From", gsapFromHandler);
  document.getElementById("btn-gsap-timeline").onclick = () => runTest("btn-gsap-timeline", "GSAP Timeline", gsapTimelineHandler);
  document.getElementById("btn-gsap-stagger").onclick = () => runTest("btn-gsap-stagger", "GSAP Stagger", gsapStaggerHandler);
  document.getElementById("btn-gsap-easing").onclick = () => runTest("btn-gsap-easing", "GSAP Easing", gsapEasingHandler);
  document.getElementById("btn-gsap-cleanup").onclick = () => runTest("btn-gsap-cleanup", "GSAP Cleanup", gsapCleanupHandler);
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
