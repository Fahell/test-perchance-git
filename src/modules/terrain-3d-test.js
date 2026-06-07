// src/modules/terrain-3d-test.js
// Teste de integração 3D: Terreno em camadas usando Three.js
import { root } from '../perchance-bridge.js';

// Logger local
const log = (msg, ...args) => console.log(`🏔️ [Terrain3D] ${msg}`, ...args);
const warn = (msg, ...args) => console.warn(`⚠️ [Terrain3D] ${msg}`, ...args);
const error = (msg, ...args) => console.error(`❌ [Terrain3D] ${msg}`, ...args);

// Paleta de cores para os níveis do terreno (1 a 6)
const TERRAIN_PALETTE = {
  1: 0x1E90FF, // Água Profunda (DodgerBlue)
  2: 0x87CEFA, // Água Rasa (LightSkyBlue)
  3: 0xF4A460, // Areia/Margem (SandyBrown)
  4: 0x32CD32, // Grama (LimeGreen)
  5: 0x228B22, // Floresta (ForestGreen)
  6: 0x808080, // Montanha (Gray)
};

const GRID_SIZE = 10;
const CELL_SIZE = 1;
const MAX_HEIGHT = 6;

export const terrain3DTest = {
  available: true, // Three.js é carregado dinamicamente
  scene: null,
  camera: null,
  renderer: null,
  terrainGroup: null,
  animationId: null,
  THREE: null,

  /**
   * Inicializa a cena 3D com um terreno em camadas.
   * @param {HTMLElement} container - Elemento DOM onde o canvas será renderizado
   * @param {Object} options - Opções de configuração
   * @returns {Promise<Object>} Resultado da inicialização
   */
  async initializeTerrain(container, options = {}) {
    log('Iniciando teste de terreno 3D em camadas...');

    if (!container) {
      return { success: false, error: 'Container DOM não fornecido.' };
    }

    try {
      // Importação dinâmica do Three.js via CDN para evitar adicionar ao package.json
      this.THREE = await import('https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js');
      
      this._setupScene(container);
      this._setupCamera(container);
      this._setupRenderer(container);
      this._setupLights();
      
      this.terrainGroup = new this.THREE.Group();
      this.scene.add(this.terrainGroup);

      this.generateAndRenderTerrain();
      
      this._animate();
      log('Inicialização completa.');
      return { success: true, message: 'Terreno 3D inicializado com sucesso.' };
    } catch (err) {
      error('Falha na inicialização:', err);
      return { success: false, error: err.message };
    }
  },

  _setupScene(container) {
    this.scene = new this.THREE.Scene();
    this.scene.background = new this.THREE.Color(0x87CEEB); // Céu azul
  },

  _setupCamera(container) {
    const aspect = container.clientWidth / container.clientHeight;
    const d = 10; // Tamanho do frustum ortográfico
    this.camera = new this.THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);
    
    // Posição isométrica
    this.camera.position.set(20, 20, 20);
    this.camera.lookAt(0, 0, 0);
  },

  _setupRenderer(container) {
    this.renderer = new this.THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(this.renderer.domElement);
  },

  _setupLights() {
    const ambientLight = new this.THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new this.THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    this.scene.add(directionalLight);
  },

  /**
   * Gera um mapa 10x10 válido (água só toca margem, sem penhascos abruptos).
   * @returns {Array<Array<number>>} Matriz 10x10 com alturas de 1 a 6
   */
  generateValidMap() {
    const map = [];
    const center = GRID_SIZE / 2;

    for (let x = 0; x < GRID_SIZE; x++) {
      map[x] = [];
      for (let z = 0; z < GRID_SIZE; z++) {
        // Distância de Chebyshev do centro (para ilhas quadradas)
        const dx = Math.abs(x - center);
        const dz = Math.abs(z - center);
        const distance = Math.max(dx, dz);

        // Altura base diminui conforme afasta do centro
        let height = MAX_HEIGHT - distance;
        
        // Pequena variação aleatória
        height += Math.floor(Math.random() * 2) - 1;

        // Garante que a altura esteja entre 1 e MAX_HEIGHT
        height = Math.max(1, Math.min(MAX_HEIGHT, height));
        map[x][z] = height;
      }
    }
    return map;
  },

  /**
   * Limpa o terreno atual e renderiza um novo baseado no mapa gerado.
   */
  generateAndRenderTerrain() {
    if (!this.terrainGroup) return;

    // Limpa meshes anteriores
    while(this.terrainGroup.children.length > 0) { 
      const child = this.terrainGroup.children[0];
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
      this.terrainGroup.remove(child); 
    }

    const map = this.generateValidMap();
    const offset = (GRID_SIZE * CELL_SIZE) / 2;

    for (let x = 0; x < GRID_SIZE; x++) {
      for (let z = 0; z < GRID_SIZE; z++) {
        const height = map[x][z];
        const color = TERRAIN_PALETTE[height];

        const geometry = new this.THREE.BoxGeometry(CELL_SIZE, height * CELL_SIZE, CELL_SIZE);
        const material = new this.THREE.MeshLambertMaterial({ color });
        const cube = new this.THREE.Mesh(geometry, material);

        // Posiciona o cubo. Y é metade da altura para que a base fique em y=0
        cube.position.set(
          x * CELL_SIZE - offset + CELL_SIZE / 2,
          (height * CELL_SIZE) / 2,
          z * CELL_SIZE - offset + CELL_SIZE / 2
        );

        this.terrainGroup.add(cube);
      }
    }
    log(`Terreno 10x10 gerado e renderizado.`);
  },

  _animate() {
    this.animationId = requestAnimationFrame(() => this._animate());
    
    // Rotação lenta opcional para visualização
    // if (this.terrainGroup) this.terrainGroup.rotation.y += 0.005;

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  },

  /**
   * Limpa recursos do Three.js e remove o canvas do DOM.
   */
  dispose() {
    log('Descartando recursos 3D...');
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
    }
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.terrainGroup = null;
  }
};

log('Módulo terrain-3d-test.js carregado.');
