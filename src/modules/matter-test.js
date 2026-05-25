/**
 * Matter.js Physics Test Module
 * Testa integração do motor de física 2D no ambiente Perchance
 */

import { VERSION } from '../constants.js';

let matterPromise = null;
let matterReady = false;
let engine = null;
let render = null;
let runner = null;
let matterContainer = null;
let canvasContainer = null;
let ballCount = 0;

/**
 * Inicia o preload assíncrono do Matter.js via CDN
 */
export function preloadMatter() {
  if (matterPromise) return;
  
  matterPromise = new Promise((resolve, reject) => {
    console.log('⚛️ [Matter] Starting background load from CDN...');
    
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/matter-js@0.20.0/build/matter.min.js';
    
    script.onload = () => {
      matterReady = true;
      console.log(`✅ [Matter] Loaded from CDN (${VERSION})`);
      resolve(window.Matter);
    };
    
    script.onerror = () => {
      console.error('❌ [Matter] Failed to load from CDN');
      reject(new Error('Failed to load Matter.js'));
    };
    
    document.head.appendChild(script);
  });
}

/**
 * Verifica se o Matter.js está pronto
 */
export function isReady() {
  return matterReady;
}

/**
 * Verifica se o Matter.js está carregando
 */
export function isLoading() {
  return matterPromise !== null && !matterReady;
}

/**
 * Obtém a instância do Matter.js (aguarda se necessário)
 */
async function getMatter() {
  if (matterReady) {
    return window.Matter;
  }
  
  if (!matterPromise) {
    preloadMatter();
  }
  
  console.log('⏳ [Matter] Waiting for load to complete...');
  return await matterPromise;
}

/**
 * Cria o container modal para a simulação de física
 */
function createPhysicsContainer() {
  matterContainer = document.createElement('div');
  matterContainer.id = 'matter-physics';
  matterContainer.className = 'matter-container';
  
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
  canvasContainer = document.getElementById('matter-canvas');
  
  // Event listeners
  document.getElementById('matter-close').addEventListener('click', cleanup);
  document.getElementById('btn-add-balls').addEventListener('click', () => addBalls(10));
  document.getElementById('btn-reset').addEventListener('click', resetSimulation);
  document.getElementById('btn-gravity').addEventListener('click', toggleGravity);
  
  // Clique no canvas para adicionar bola
  canvasContainer.addEventListener('click', (e) => {
    const rect = canvasContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    addBall(x, y);
  });
}

/**
 * Inicializa o motor de física Matter.js
 */
export async function initPhysics() {
  try {
    const Matter = await getMatter();
    
    createPhysicsContainer();
    
    // Criar engine
    engine = Matter.Engine.create();
    engine.world.gravity.y = 1;
    
    // Criar renderer
    render = Matter.Render.create({
      element: canvasContainer,
      engine: engine,
      options: {
        width: 800,
        height: 600,
        wireframes: false,
        background: '#1a1a1a',
        pixelRatio: window.devicePixelRatio || 1
      }
    });
    
    // Chão e paredes
    const ground = Matter.Bodies.rectangle(400, 590, 810, 20, { 
      isStatic: true,
      render: { fillStyle: '#4a4a4a' }
    });
    
    const leftWall = Matter.Bodies.rectangle(0, 300, 20, 600, { 
      isStatic: true,
      render: { fillStyle: '#4a4a4a' }
    });
    
    const rightWall = Matter.Bodies.rectangle(800, 300, 20, 600, { 
      isStatic: true,
      render: { fillStyle: '#4a4a4a' }
    });
    
    // Obstáculos em ângulo
    const obstacle1 = Matter.Bodies.rectangle(300, 400, 200, 20, {
      isStatic: true,
      angle: Math.PI * 0.1,
      render: { fillStyle: '#5a5a5a' }
    });
    
    const obstacle2 = Matter.Bodies.rectangle(500, 300, 200, 20, {
      isStatic: true,
      angle: -Math.PI * 0.1,
      render: { fillStyle: '#5a5a5a' }
    });
    
    Matter.World.add(engine.world, [ground, leftWall, rightWall, obstacle1, obstacle2]);
    
    // Iniciar renderização e simulação
    Matter.Render.run(render);
    runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);
    
    console.log('✅ [Matter] Physics simulation initialized');
    
    // Adicionar algumas bolas iniciais
    addBalls(5);
    
  } catch (error) {
    console.error('❌ [Matter] Failed to initialize:', error);
  }
}

/**
 * Adiciona uma bola na posição especificada
 */
export function addBall(x = 400, y = 50) {
  if (!engine) {
    console.error('❌ [Matter] Physics engine not initialized');
    return;
  }
  
  const Matter = window.Matter;
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#a29bfe'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const radius = 10 + Math.random() * 15;
  
  const ball = Matter.Bodies.circle(x, y, radius, {
    restitution: 0.7,
    friction: 0.01,
    render: {
      fillStyle: color
    }
  });
  
  Matter.World.add(engine.world, ball);
  ballCount++;
  updateBallCounter();
  
  console.log(`⚛️ [Matter] Ball added at (${x.toFixed(0)}, ${y.toFixed(0)})`);
}

/**
 * Adiciona múltiplas bolas em posições aleatórias
 */
export function addBalls(count = 10) {
  for (let i = 0; i < count; i++) {
    const x = 100 + Math.random() * 600;
    const y = 50 + Math.random() * 100;
    setTimeout(() => addBall(x, y), i * 50);
  }
}

/**
 * Atualiza o contador de bolas na UI
 */
function updateBallCounter() {
  const counter = document.getElementById('ball-counter');
  if (counter) {
    counter.textContent = `Bolas: ${ballCount}`;
  }
}

/**
 * Reseta a simulação (remove todas as bolas)
 */
export function resetSimulation() {
  if (!engine) return;
  
  const Matter = window.Matter;
  const bodies = Matter.Composite.allBodies(engine.world);
  
  bodies.forEach(body => {
    if (!body.isStatic) {
      Matter.World.remove(engine.world, body);
    }
  });
  
  ballCount = 0;
  updateBallCounter();
  
  console.log('🔄 [Matter] Simulation reset');
}

/**
 * Alterna entre gravidade normal, invertida e zero
 */
export function toggleGravity() {
  if (!engine) return;
  
  const currentGravity = engine.world.gravity.y;
  
  if (currentGravity === 1) {
    engine.world.gravity.y = -1;
    console.log('🔄 [Matter] Gravity: INVERTED');
  } else if (currentGravity === -1) {
    engine.world.gravity.y = 0;
    console.log('🔄 [Matter] Gravity: ZERO');
  } else {
    engine.world.gravity.y = 1;
    console.log('🔄 [Matter] Gravity: NORMAL');
  }
}

/**
 * Limpa recursos e remove o container
 */
export function cleanup() {
  console.log('🧹 [Matter] Cleaning up...');
  
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
    canvasContainer = null;
  }
  
  ballCount = 0;
  console.log('✅ [Matter] Cleanup complete');
}
