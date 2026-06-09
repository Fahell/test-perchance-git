/**
 * Terrain 3D Test Module (Phase 2: Procedural Generation)
 * Tests 3D layered terrain generation with Simplex Noise and Cellular Automata smoothing.
 */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

let createNoise2D = null;

async function loadSimplexNoise() {
    if (!createNoise2D) {
        try {
            const module = await import('https://cdn.jsdelivr.net/npm/simplex-noise@4.0.1/dist/esm/simplex-noise.js');
            createNoise2D = module.createNoise2D;
        } catch (error) {
            console.error('❌ [Terrain3D] Failed to load SimplexNoise:', error);
            throw error;
        }
    }
    return createNoise2D;
}

// Seeded PRNG (Mulberry32) for reproducibility
function mulberry32(a) {
    return function() {
        let t = (a += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function generateProceduralMap(seed, size = 10) {
    const rand = mulberry32(seed);
    const noise2D = createNoise2D(rand);
    const map = [];
    const center = size / 2;

    // 1. Generate base noise with island bias to guarantee water at edges
    for (let y = 0; y < size; y++) {
        map[y] = [];
        for (let x = 0; x < size; x++) {
            const nx = x / size * 3; // Frequency
            const ny = y / size * 3;
            const value = noise2D(nx, ny); // -1 to 1
            
            // Island bias: lower the edges to guarantee water
            const dx = (x - center) / center;
            const dy = (y - center) / center;
            const dist = Math.sqrt(dx * dx + dy * dy); // 0 at center, ~1.4 at corners
            const islandFactor = Math.max(0, 1 - dist * 0.6); // 1 at center, 0 at edges
            
            let heightValue = (value + 1) / 2; // Normalize to 0 - 1
            heightValue = heightValue * islandFactor; // Edges become 0 (water)
            
            // Discretize into 6 bands (1 to 6)
            let level = Math.floor(heightValue * 6) + 1;
            level = Math.max(1, Math.min(6, level));
            
            // Force absolute edges to be water (level 1 or 2) just in case
            if (x === 0 || x === size - 1 || y === 0 || y === size - 1) {
                level = Math.min(level, 2);
            }
            
            map[y][x] = level;
        }
    }

    // 2. Fix transitions (Cellular Automata / Smoothing)
    return fixTransitions(map, 3);
}

function fixTransitions(map, iterations = 3) {
    const size = map.length;
    let currentMap = map.map((row) => [...row]);

    for (let iter = 0; iter < iterations; iter++) {
        const newMap = currentMap.map((row) => [...row]);
        let changed = false;

        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                let current = currentMap[y][x];
                let minNeighbor = current;
                let maxNeighbor = current;

                const neighbors = [
                    { nx: x, ny: y - 1 },
                    { nx: x, ny: y + 1 },
                    { nx: x - 1, ny: y },
                    { nx: x + 1, ny: y },
                ];

                for (const { nx, ny } of neighbors) {
                    if (nx >= 0 && nx < size && ny >= 0 && ny < size) {
                        const nVal = currentMap[ny][nx];
                        if (nVal < minNeighbor) minNeighbor = nVal;
                        if (nVal > maxNeighbor) maxNeighbor = nVal;
                    }
                }

                // Prevent cliffs: max difference between adjacent cells is 1
                let cellChanged = false;
                if (maxNeighbor - current > 1) {
                    current = maxNeighbor - 1;
                    cellChanged = true;
                } else if (current - minNeighbor > 1) {
                    current = minNeighbor + 1;
                    cellChanged = true;
                }

                if (cellChanged) {
                    newMap[y][x] = current;
                    changed = true;
                }
            }
        }
        currentMap = newMap;
        if (!changed) break;
    }
    return currentMap;
}

const TERRAIN_PALETTE = {
    1: 0x1E90FF, // Água Profunda (Dodger Blue)
    2: 0x87CEEB, // Água Rasa (Sky Blue)
    3: 0xF4A460, // Areia/Margem (Sandy Brown)
    4: 0x32CD32, // Grama (Lime Green)
    5: 0x228B22, // Floresta (Forest Green)
    6: 0x808080, // Montanha (Gray)
};

const TERRAIN_NAMES = {
    1: 'Água Profunda',
    2: 'Água Rasa',
    3: 'Areia',
    4: 'Grama',
    5: 'Floresta',
    6: 'Montanha',
};

class Terrain3DTest {
    constructor() {
        this.available = true;
        this.container = null;
        this.canvasContainer = null;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.animationId = null;
    }

    async init(container) {
        this.container = container;
        this.container.innerHTML = '';

        // Controls
        const controls = document.createElement('div');
        controls.style.cssText = 'margin-bottom: 10px; display: flex; gap: 10px; align-items: center; flex-wrap: wrap;';

        const label = document.createElement('label');
        label.textContent = 'Seed:';
        label.style.fontSize = '14px';

        const seedInput = document.createElement('input');
        seedInput.type = 'text';
        seedInput.value = '12345';
        seedInput.style.padding = '5px';
        seedInput.style.borderRadius = '4px';
        seedInput.style.border = '1px solid #ccc';

        const generateBtn = document.createElement('button');
        generateBtn.textContent = '🔄 Gerar Terreno';
        generateBtn.style.padding = '6px 12px';
        generateBtn.style.cursor = 'pointer';
        generateBtn.style.borderRadius = '4px';
        generateBtn.style.border = '1px solid #007bff';
        generateBtn.style.backgroundColor = '#007bff';
        generateBtn.style.color = 'white';

        const info = document.createElement('div');
        info.style.cssText = 'font-size: 12px; color: #666; margin-top: 5px; width: 100%;';

        controls.appendChild(label);
        controls.appendChild(seedInput);
        controls.appendChild(generateBtn);
        this.container.appendChild(controls);
        this.container.appendChild(info);

        // Canvas container
        this.canvasContainer = document.createElement('div');
        this.canvasContainer.style.cssText = 'width: 100%; height: 400px; border: 1px solid #ccc; border-radius: 4px; overflow: hidden; background: #111;';
        this.container.appendChild(this.canvasContainer);

        // Legend
        const legend = document.createElement('div');
        legend.style.cssText = 'margin-top: 10px; display: flex; flex-wrap: wrap; gap: 10px; font-size: 12px; justify-content: center; padding: 8px; background: #f9f9f9; border-radius: 4px; border: 1px solid #ddd;';
        for (let level = 1; level <= 6; level++) {
            const item = document.createElement('div');
            item.style.cssText = 'display: flex; align-items: center; gap: 5px;';
            const colorHex = '#' + TERRAIN_PALETTE[level].toString(16).padStart(6, '0');
            item.innerHTML = `<div style="width: 14px; height: 14px; background-color: ${colorHex}; border: 1px solid #333; border-radius: 2px;"></div><span>${TERRAIN_NAMES[level]}</span>`;
            legend.appendChild(item);
        }
        this.container.appendChild(legend);

        generateBtn.onclick = async () => {
            info.textContent = '⏳ Gerando terreno procedural...';
            generateBtn.disabled = true;
            
            try {
                const seed = parseInt(seedInput.value) || Math.floor(Math.random() * 100000);
                seedInput.value = seed;
                await this.renderTerrain(seed, 10);
                info.textContent = `✅ Terreno gerado com sucesso! Seed: ${seed} | Regras de transição aplicadas.`;
            } catch (error) {
                console.error('❌ [Terrain3D] Error generating terrain:', error);
                info.textContent = `❌ Erro ao gerar terreno: ${error.message}`;
            } finally {
                generateBtn.disabled = false;
            }
        };

        // Initial generation
        generateBtn.click();
    }

    async renderTerrain(seed, size = 10) {
        // Defensive cleanup of previous instance
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        if (this.renderer && this.canvasContainer && this.renderer.domElement.parentNode) {
            this.canvasContainer.removeChild(this.renderer.domElement);
            this.renderer.dispose();
        }
        if (this.scene) {
            this.scene.traverse((object) => {
                if (object.geometry) object.geometry.dispose();
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach((m) => m.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            });
        }

        await loadSimplexNoise();
        const map = generateProceduralMap(seed, size);

        // Setup Three.js
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x222222);

        const aspect = this.canvasContainer.clientWidth / this.canvasContainer.clientHeight || 1;
        const frustumSize = 20; // Increased to ensure terrain fits well
        this.camera = new THREE.OrthographicCamera(
            (frustumSize * aspect) / -2,
            (frustumSize * aspect) / 2,
            frustumSize / 2,
            frustumSize / -2,
            1,
            1000
        );
        this.camera.position.set(20, 20, 20);
        this.camera.lookAt(0, 0, 0);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.canvasContainer.clientWidth || 800, this.canvasContainer.clientHeight || 400);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.canvasContainer.appendChild(this.renderer.domElement);

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(10, 20, 10);
        this.scene.add(dirLight);

        // Generate Meshes
        const offset = (size * 1.5) / 2;
        const geometry = new THREE.BoxGeometry(1.4, 1, 1.4); // Slight gap for grid effect

        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const level = map[y][x];
                const height = level * 0.5; // Reduced height for step-like appearance
                const material = new THREE.MeshLambertMaterial({ color: TERRAIN_PALETTE[level] });
                const mesh = new THREE.Mesh(geometry, material);
                
                mesh.position.set(x * 1.5 - offset, height / 2, y * 1.5 - offset);
                mesh.scale.y = height;
                
                this.scene.add(mesh);
            }
        }

        // Animation Loop (slow rotation for better 3D visualization)
        const animate = () => {
            this.animationId = requestAnimationFrame(animate);
            this.scene.rotation.y += 0.002;
            this.renderer.render(this.scene, this.camera);
        };
        animate();
    }

    runTest() {
        console.log('🏔️ [Terrain3D] Módulo carregado e pronto para inicialização via UI.');
        return { passed: true, message: 'Módulo carregado com sucesso' };
    }
}

export const terrain3DTest = new Terrain3DTest();
