/**
 * Cannon-es 3D Physics Test Module
 * Renderiza física 3D em seu próprio container Three.js isolado
 */

import { VERSION } from '../constants.js';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

let cannonPromise = null;
let cannonReady = false;
let cannonModule = null;
let world = null;
let animationId = null;
let physicsObjects = [];
let containerEl = null;
let canvasContainer = null;
let sceneRef = null;
let cameraRef = null;
let rendererRef = null;
let bodyCount = 0;
let gravityIndex = 0;

const GRAVITY_STATES = [
  { y: -9.82, label: 'NORMAL' },
  { y: 9.82, label: 'INVERTED' },
  { y: 0, label: 'ZERO' }
];

const COLORS = [0xff6b6b, 0x4ecdc4, 0x45b7d1, 0xf9ca24, 0x6c5ce7, 0xa29bfe];

const CANNON_CDN = 'https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/dist/cannon-es.js';

export function preloadCannon() {
  if (cannonPromise) return;

  cannonPromise = (async () => {
    console.log('💣 [Cannon] Starting background load from CDN (ESM)...');
    try {
      cannonModule = await import(/* @vite-ignore */ CANNON_CDN);
      cannonReady = true;
      console.log(`✅ [Cannon] Loaded from CDN (${VERSION})`);
      return cannonModule;
    } catch (error) {
      console.error('❌ [Cannon] Failed to load from CDN:', error.message);
      throw error;
    }
  })();
}

export function isReady() {
  return cannonReady;
}

export function isLoading() {
  return cannonPromise !== null && !cannonReady;
}

async function getCannon() {
  if (cannonReady) return cannonModule;
  if (!cannonPromise) preloadCannon();
  console.log('⏳ [Cannon] Waiting for load to complete...');
  return await cannonPromise;
}

function createContainer() {
  containerEl = document.createElement('div');
  containerEl.id = 'cannon-physics';
  containerEl.className = 'matter-container';

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
  canvasContainer = document.getElementById('cannon-canvas');

  document.getElementById('cannon-close').addEventListener('click', cleanup);
  document.getElementById('btn-add-spheres').addEventListener('click', () => addSpheres(10));
  document.getElementById('btn-add-boxes').addEventListener('click', () => addBoxes(5));
  document.getElementById('btn-reset').addEventListener('click', resetSimulation);
  document.getElementById('btn-gravity').addEventListener('click', toggleGravity);
  document.getElementById('btn-explosion').addEventListener('click', applyExplosion);
}

/**
 * Inicializa simulação com renderer Three.js próprio, isolado do scene principal
 */
export async function initPhysics3D() {
  try {
    const CANNON = await getCannon();

    createContainer();

    const width = canvasContainer.clientWidth || 600;
    const height = canvasContainer.clientHeight || 400;

    // Scene próprio
    sceneRef = new THREE.Scene();
    sceneRef.background = new THREE.Color(0x1a1a2e);

    // Camera própria
    cameraRef = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    cameraRef.position.set(8, 8, 8);
    cameraRef.lookAt(0, 0, 0);

    // Renderer próprio dentro do canvas container
    rendererRef = new THREE.WebGLRenderer({ antialias: true });
    rendererRef.setSize(width, height);
    rendererRef.setPixelRatio(window.devicePixelRatio);
    canvasContainer.appendChild(rendererRef.domElement);

    // Luzes
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    sceneRef.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(5, 10, 5);
    sceneRef.add(directionalLight);

    // World
    world = new CANNON.World({ gravity: new CANNON.Vec3(0, -9.82, 0) });
    world.allowSleep = true;
    world.broadphase = new CANNON.SAPBroadphase(world);

    const defaultMaterial = new CANNON.Material('default');
    const contactMaterial = new CANNON.ContactMaterial(defaultMaterial, defaultMaterial, {
      friction: 0.4,
      restitution: 0.5
    });
    world.addContactMaterial(contactMaterial);
    world.defaultContactMaterial = contactMaterial;

    // Ground
    const groundShape = new CANNON.Plane();
    const groundBody = new CANNON.Body({ mass: 0, shape: groundShape });
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    groundBody.material = defaultMaterial;
    world.addBody(groundBody);

    // Grid visual
    const gridHelper = new THREE.GridHelper(20, 20, 0x4a4a4a, 0x2a2a2a);
    sceneRef.add(gridHelper);

    addSpheres(5);

    // Animation loop
    const fixedTimeStep = 1 / 60;

    function animate() {
      animationId = requestAnimationFrame(animate);
      world.fixedStep(fixedTimeStep);

      for (const { body, mesh } of physicsObjects) {
        mesh.position.copy(body.position);
        mesh.quaternion.copy(body.quaternion);
      }

      rendererRef.render(sceneRef, cameraRef);
    }

    animate();

    console.log('✅ [Cannon] 3D Physics simulation initialized (isolated renderer)');
  } catch (error) {
    console.error('❌ [Cannon] Failed to initialize:', error.message);
  }
}

export function addSphere(x, y, z) {
  if (!world || !sceneRef) {
    console.error('❌ [Cannon] World or scene not initialized');
    return;
  }

  const CANNON = cannonModule;
  const radius = 0.3 + Math.random() * 0.4;
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];

  const shape = new CANNON.Sphere(radius);
  const body = new CANNON.Body({ mass: 1, shape });
  body.position.set(
    x ?? (Math.random() * 6 - 3),
    y ?? (5 + Math.random() * 5),
    z ?? (Math.random() * 6 - 3)
  );
  body.sleepSpeedLimit = 0.5;
  body.sleepTimeLimit = 1;
  world.addBody(body);

  const geometry = new THREE.SphereGeometry(radius, 16, 16);
  const material = new THREE.MeshPhongMaterial({ color });
  const mesh = new THREE.Mesh(geometry, material);
  sceneRef.add(mesh);

  physicsObjects.push({ body, mesh });
  bodyCount++;
  updateCounter();

  console.log(`💣 [Cannon] Sphere added (${bodyCount} bodies)`);
}

export function addBox(x, y, z) {
  if (!world || !sceneRef) {
    console.error('❌ [Cannon] World or scene not initialized');
    return;
  }

  const CANNON = cannonModule;
  const size = 0.4 + Math.random() * 0.4;
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];

  const shape = new CANNON.Box(new CANNON.Vec3(size / 2, size / 2, size / 2));
  const body = new CANNON.Body({ mass: 1, shape });
  body.position.set(
    x ?? (Math.random() * 6 - 3),
    y ?? (5 + Math.random() * 5),
    z ?? (Math.random() * 6 - 3)
  );
  body.sleepSpeedLimit = 0.5;
  body.sleepTimeLimit = 1;
  world.addBody(body);

  const geometry = new THREE.BoxGeometry(size, size, size);
  const material = new THREE.MeshPhongMaterial({ color });
  const mesh = new THREE.Mesh(geometry, material);
  sceneRef.add(mesh);

  physicsObjects.push({ body, mesh });
  bodyCount++;
  updateCounter();

  console.log(`💣 [Cannon] Box added (${bodyCount} bodies)`);
}

export function addSpheres(count = 10) {
  for (let i = 0; i < count; i++) {
    setTimeout(() => addSphere(), i * 80);
  }
}

export function addBoxes(count = 5) {
  for (let i = 0; i < count; i++) {
    setTimeout(() => addBox(), i * 80);
  }
}

function updateCounter() {
  const counter = document.getElementById('cannon-counter');
  if (counter) counter.textContent = `Bodies: ${bodyCount}`;
}

export function resetSimulation() {
  if (!world || !sceneRef) return;

  for (const { body, mesh } of physicsObjects) {
    world.removeBody(body);
    sceneRef.remove(mesh);
    mesh.geometry.dispose();
    mesh.material.dispose();
  }

  physicsObjects = [];
  bodyCount = 0;
  updateCounter();

  console.log('🔄 [Cannon] Simulation reset');
}

export function toggleGravity() {
  if (!world) return;

  gravityIndex = (gravityIndex + 1) % GRAVITY_STATES.length;
  const state = GRAVITY_STATES[gravityIndex];
  world.gravity.set(0, state.y, 0);

  console.log(`🔄 [Cannon] Gravity: ${state.label} (${state.y})`);
}

export function applyExplosion() {
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

export function cleanup() {
  console.log('🧹 [Cannon] Cleaning up...');

  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }

  if (world && sceneRef) {
    for (const { body, mesh } of physicsObjects) {
      world.removeBody(body);
      sceneRef.remove(mesh);
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
  sceneRef = null;
  cameraRef = null;
  bodyCount = 0;
  gravityIndex = 0;

  if (containerEl) {
    containerEl.remove();
    containerEl = null;
    canvasContainer = null;
  }

  console.log('✅ [Cannon] Cleanup complete');
}
