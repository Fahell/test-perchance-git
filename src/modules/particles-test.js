/**
 * Particles Test Module
 * GPU-accelerated particle system using THREE.Points + ShaderMaterial
 * Supports multiple patterns and color modes
 */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const DEFAULT_CONFIG = {
  count: 50000,
  areaSize: 20,
  particleSizeRange: [1, 4],
  speedMultiplier: 1.0,
  colorMode: 'rainbow',
  pattern: 'random'
};

let config = { ...DEFAULT_CONFIG };
let particles = null;
let material = null;
let geometry = null;
let sceneRef = null;
let elapsedTime = 0;
let updateCallback = null;
let rendererDataRef = null;

// ─── Shader Sources ───────────────────────────────────────────────────────────

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
    
    pos += 0.5 * sin(t * 0.5 + position.x * 2.0) * vec3(1.0, 0.5, 1.0);
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    
    gl_PointSize = aSize * uSizeMultiplier * uPixelRatio * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
    
    float lifeProgress = mod(t, aLife) / aLife;
    vAlpha = smoothstep(0.0, 0.1, lifeProgress) * smoothstep(1.0, 0.8, lifeProgress);
    vColor = aColor;
  }
`;

const fragmentShader = `
  varying vec3 vColor;
  varying float vAlpha;
  
  void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;
    
    float alpha = smoothstep(0.5, 0.2, dist) * vAlpha;
    gl_FragColor = vec4(vColor, alpha);
  }
`;

// ─── Color Generators ─────────────────────────────────────────────────────────

function generateColor(mode, index, total) {
  const color = new THREE.Color();
  
  switch (mode) {
    case 'rainbow':
      color.setHSL((index / total) * 0.8, 1.0, 0.6);
      break;
    case 'monochrome':
      color.setRGB(0.3, 0.6, 1.0);
      break;
    case 'temperature':
      const temp = index / total;
      color.setRGB(temp, 0.5 - temp * 0.5, 1.0 - temp);
      break;
    case 'fire':
      color.setHSL(0.05 + (index / total) * 0.1, 1.0, 0.5 + (index / total) * 0.3);
      break;
    default:
      color.setHSL(Math.random() * 0.8, 1.0, 0.6);
  }
  
  return [color.r, color.g, color.b];
}

// ─── Pattern Generators ───────────────────────────────────────────────────────

function generatePosition(pattern, index, total, areaSize) {
  let x, y, z;
  
  switch (pattern) {
    case 'sphere': {
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      const r = areaSize * 0.5;
      x = r * Math.sin(phi) * Math.cos(theta);
      y = r * Math.sin(phi) * Math.sin(theta);
      z = r * Math.cos(phi);
      break;
    }
      
    case 'galaxy': {
      const armCount = 4;
      const armIndex = index % armCount;
      const armOffset = (armIndex / armCount) * Math.PI * 2;
      const radius = (index / total) * areaSize * 0.5;
      const angle = armOffset + radius * 0.5;
      x = Math.cos(angle) * radius;
      y = (Math.random() - 0.5) * 2;
      z = Math.sin(angle) * radius;
      break;
    }
      
    case 'torus': {
      const R = areaSize * 0.3;
      const r2 = areaSize * 0.15;
      const u = Math.random() * Math.PI * 2;
      const v = Math.random() * Math.PI * 2;
      x = (R + r2 * Math.cos(v)) * Math.cos(u);
      y = r2 * Math.sin(v);
      z = (R + r2 * Math.cos(v)) * Math.sin(u);
      break;
    }
      
    case 'fountain':
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
    case 'fountain':
      vx = (Math.random() - 0.5) * 2;
      vy = Math.random() * 15 + 5;
      vz = (Math.random() - 0.5) * 2;
      break;
      
    default:
      vx = (Math.random() - 0.5) * 2;
      vy = (Math.random() - 0.5) * 2;
      vz = (Math.random() - 0.5) * 2;
  }
  
  return [vx, vy, vz];
}

// ─── Core Functions ───────────────────────────────────────────────────────────

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
  geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geom.setAttribute('aVelocity', new THREE.BufferAttribute(velocities, 3));
  geom.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
  geom.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  geom.setAttribute('aLife', new THREE.BufferAttribute(lives, 1));
  
  return geom;
}

function createMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      uSizeMultiplier: { value: 1.0 },
      uSpeedMultiplier: { value: config.speedMultiplier }
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
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

// ─── Public API ───────────────────────────────────────────────────────────────

export function init(rendererData) {
  if (!rendererData || !rendererData.scene) {
    console.error('❌ [Particles] Renderer data or scene not available');
    return;
  }
  
  rendererDataRef = rendererData;
  buildParticleSystem(rendererData.scene);
  
  // Register update callback internally
  if (rendererData.onUpdate) {
    updateCallback = (deltaTime) => update(deltaTime);
    rendererData.onUpdate(updateCallback);
  }
}

export function update(deltaTime) {
  if (!material) return;
  
  elapsedTime += deltaTime;
  material.uniforms.uTime.value = elapsedTime;
  material.uniforms.uSpeedMultiplier.value = config.speedMultiplier;
}

export function dispose() {
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
  
  // Remove update callback
  if (updateCallback && rendererDataRef && rendererDataRef.removeUpdateCallback) {
    rendererDataRef.removeUpdateCallback(updateCallback);
    updateCallback = null;
  }
  
  elapsedTime = 0;
  console.log('🗑️ [Particles] System disposed');
}

export function isActive() {
  return particles !== null && material !== null;
}

export function setCount(count) {
  config.count = Math.max(1000, Math.min(200000, count));
  if (sceneRef) buildParticleSystem(sceneRef);
}

export function setColorMode(mode) {
  config.colorMode = mode;
  if (sceneRef) buildParticleSystem(sceneRef);
}

export function setPattern(pattern) {
  config.pattern = pattern;
  if (sceneRef) buildParticleSystem(sceneRef);
}

export function setSpeedMultiplier(multiplier) {
  config.speedMultiplier = Math.max(0, Math.min(5, multiplier));
}

export function setSizeMultiplier(multiplier) {
  if (material) {
    material.uniforms.uSizeMultiplier.value = Math.max(0.1, Math.min(3, multiplier));
  }
}

export function getConfig() {
  return { ...config };
}

export function resetConfig() {
  config = { ...DEFAULT_CONFIG };
  if (sceneRef) buildParticleSystem(sceneRef);
}
