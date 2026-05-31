import { createTestContainer } from './test-container.js';

const PRESETS = {
  life: { born: [3], survive: [2, 3], name: 'Game of Life' },
  seeds: { born: [2], survive: [], name: 'Seeds' },
  dayNight: { born: [3, 6, 7, 8], survive: [3, 4, 6, 7, 8], name: 'Day & Night' },
  highLife: { born: [3, 6], survive: [2, 3], name: 'HighLife' },
  replicator: { born: [1, 3, 5, 7], survive: [1, 3, 5, 7], name: 'Replicator' }
};

let currentContainer = null;

export const cellularAutomataTest = {
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
        console.log('🗑️ [CellularAutomata] Container fechado');
      }
    });
    return currentContainer;
  },

  init(rendererData) {
    console.log('🧬 [CellularAutomata] Initializing...');

    const { contentArea } = this._getOrCreateContainer('🧬 Cellular Automata');

    this.canvas = document.createElement('canvas');
    this.canvas.width = 512;
    this.canvas.height = 512;
    this.canvas.style.cssText = 'border-radius: 4px; width: 100%; height: auto; max-width: 512px; display: block; margin: 0 auto; cursor: crosshair; image-rendering: pixelated;';
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });

    this.cols = Math.floor(this.canvas.width / this.cellSize);
    this.rows = Math.floor(this.canvas.height / this.cellSize);
    this.gridCurrent = new Uint8Array(this.cols * this.rows);
    this.gridNext = new Uint8Array(this.cols * this.rows);
    this.imageData = this.ctx.createImageData(this.canvas.width, this.canvas.height);

    this._buildControls(contentArea);
    contentArea.appendChild(this.canvas);

    this.randomize(0.3);
    this._render();

    this.canvas.addEventListener('click', (e) => this._handleCanvasClick(e));

    if (rendererData && rendererData.scene && typeof THREE !== 'undefined') {
      this._initThreeIntegration(rendererData);
    }

    console.log(`✅ [CellularAutomata] Grid ${this.cols}x${this.rows}, cell=${this.cellSize}px`);
  },

  _buildControls(container) {
    const controls = document.createElement('div');
    controls.style.cssText = 'display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; align-items: center; justify-content: center;';

    const btnStyle = 'padding: 4px 10px; border: 1px solid #555; border-radius: 4px; background: #2a2a2a; color: #eee; cursor: pointer; font-size: 12px;';

    const btnPlay = document.createElement('button');
    btnPlay.textContent = '▶ Play';
    btnPlay.style.cssText = btnStyle;
    btnPlay.onclick = () => {
      if (this.running) {
        this.stop();
        btnPlay.textContent = '▶ Play';
      } else {
        this.start();
        btnPlay.textContent = '⏸ Pause';
      }
    };

    const btnStep = document.createElement('button');
    btnStep.textContent = '⏭ Step';
    btnStep.style.cssText = btnStyle;
    btnStep.onclick = () => { this.stop(); btnPlay.textContent = '▶ Play'; this.step(); };

    const btnRandom = document.createElement('button');
    btnRandom.textContent = '🎲 Random';
    btnRandom.style.cssText = btnStyle;
    btnRandom.onclick = () => this.randomize(0.3);

    const btnClear = document.createElement('button');
    btnClear.textContent = '🗑 Clear';
    btnClear.style.cssText = btnStyle;
    btnClear.onclick = () => this.clear();

    const selectRule = document.createElement('select');
    selectRule.style.cssText = 'padding: 4px; border-radius: 4px; background: #2a2a2a; color: #eee; border: 1px solid #555; font-size: 12px;';
    for (const [key, preset] of Object.entries(PRESETS)) {
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = preset.name;
      selectRule.appendChild(opt);
    }
    selectRule.onchange = () => this.setRule(selectRule.value);

    const lblSpeed = document.createElement('label');
    lblSpeed.style.cssText = 'color: #ccc; font-size: 12px; display: flex; align-items: center; gap: 4px;';
    lblSpeed.textContent = 'FPS: ';
    const sliderSpeed = document.createElement('input');
    sliderSpeed.type = 'range';
    sliderSpeed.min = '1';
    sliderSpeed.max = '60';
    sliderSpeed.value = String(this.fps);
    sliderSpeed.style.width = '80px';
    const spanFps = document.createElement('span');
    spanFps.textContent = String(this.fps);
    spanFps.style.cssText = 'min-width: 20px; color: #aaa; font-size: 12px;';
    sliderSpeed.oninput = () => {
      this.fps = parseInt(sliderSpeed.value, 10);
      spanFps.textContent = String(this.fps);
    };
    lblSpeed.appendChild(sliderSpeed);
    lblSpeed.appendChild(spanFps);

    const spanGen = document.createElement('span');
    spanGen.id = 'ca-gen-counter';
    spanGen.style.cssText = 'color: #aaa; font-size: 12px; min-width: 60px; text-align: right;';
    spanGen.textContent = 'Gen: 0';

    controls.append(btnPlay, btnStep, btnRandom, btnClear, selectRule, lblSpeed, spanGen);
    container.appendChild(controls);
  },

  setRule(presetKey) {
    const preset = PRESETS[presetKey];
    if (!preset) {
      console.warn(`[CellularAutomata] Unknown preset: ${presetKey}`);
      return;
    }
    this.rule = preset;
    console.log(`🧬 [CellularAutomata] Rule set to ${preset.name} (B${preset.born.join('')}/S${preset.survive.join('')})`);
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
    console.log('🗑️ [CellularAutomata] Grid cleared');
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
    console.log('▶ [CellularAutomata] Started');
  },

  stop() {
    this.running = false;
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    console.log('⏸ [CellularAutomata] Stopped');
  },

  _loop() {
    if (!this.running) return;
    this.animationId = requestAnimationFrame((now) => {
      const interval = 1000 / this.fps;
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
    const el = document.getElementById('ca-gen-counter');
    if (el) el.textContent = `Gen: ${this.generation}`;
  },

  _initThreeIntegration(rendererData) {
    try {
      const texture = new THREE.CanvasTexture(this.canvas);
      texture.needsUpdate = true;
      texture.magFilter = THREE.NearestFilter;
      texture.minFilter = THREE.NearestFilter;

      const geometry = new THREE.PlaneGeometry(4, 4);
      const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide, transparent: true });
      const plane = new THREE.Mesh(geometry, material);
      plane.position.set(0, 0, -5);
      plane.visible = false;
      rendererData.scene.add(plane);

      this.threeIntegration = {
        plane,
        texture,
        show: () => { plane.visible = true; texture.needsUpdate = true; },
        hide: () => { plane.visible = false; },
        update: () => { texture.needsUpdate = true; }
      };
      console.log('✅ [CellularAutomata] Three.js integration ready');
    } catch (err) {
      console.warn('[CellularAutomata] Three.js integration failed:', err.message);
    }
  },

  cleanup() {
    this.stop();
    if (this.threeIntegration && this.threeIntegration.plane) {
      this.threeIntegration.plane.parent?.remove(this.threeIntegration.plane);
      this.threeIntegration.plane.geometry?.dispose();
      this.threeIntegration.plane.material?.dispose();
      this.threeIntegration.texture?.dispose();
    }
    this.canvas = null;
    this.ctx = null;
    this.imageData = null;
    this.gridCurrent = null;
    this.gridNext = null;
    this.threeIntegration = null;
    console.log('🗑️ [CellularAutomata] Resources cleaned up');
  }
};

console.log('🧬 [CellularAutomata] Module loaded');
