// src/modules/gsap-test.js
// GSAP integration test with async CDN loading
import { VERSION } from '../constants.js';

const GSAP_CDN_URL = 'https://cdn.jsdelivr.net/npm/gsap@3.12/dist/gsap.min.js';

let gsapPromise = null;
let gsapReady = false;
let gsapInstance = null;

/**
 * Starts loading GSAP from CDN in the background (non-blocking)
 */
export function preloadGsap() {
  if (gsapPromise) {
    return gsapPromise;
  }

  gsapPromise = new Promise((resolve, reject) => {
    console.log(`🎬 [GSAP] Starting background load from CDN...`);

    // Check if already loaded
    if (window.gsap) {
      gsapReady = true;
      gsapInstance = window.gsap;
      console.log(`✅ [GSAP] Already loaded (${VERSION})`);
      resolve(gsapInstance);
      return;
    }

    const script = document.createElement('script');
    script.src = GSAP_CDN_URL;
    script.async = true;

    script.onload = () => {
      gsapReady = true;
      gsapInstance = window.gsap;
      console.log(`✅ [GSAP] Loaded from CDN (${VERSION})`);
      resolve(gsapInstance);
    };

    script.onerror = () => {
      const error = new Error('Failed to load GSAP from CDN');
      console.error(`❌ [GSAP] ${error.message}`);
      reject(error);
    };

    document.head.appendChild(script);
  });

  return gsapPromise;
}

/**
 * Gets the GSAP instance, waiting if still loading
 */
export async function getGsap() {
  if (gsapReady && gsapInstance) {
    return gsapInstance;
  }

  if (!gsapPromise) {
    preloadGsap();
  }

  console.log(`⏳ [GSAP] Waiting for GSAP to load...`);
  return gsapPromise;
}

/**
 * Checks if GSAP is ready
 */
export function isReady() {
  return gsapReady;
}

/**
 * Checks if GSAP is currently loading
 */
export function isLoading() {
  return gsapPromise !== null && !gsapReady;
}

/**
 * Creates a demo container for GSAP animations
 */
function createDemoContainer() {
  let container = document.getElementById('gsap-demo-container');

  if (container) {
    // Clear existing content
    container.innerHTML = '';
  } else {
    container = document.createElement('div');
    container.id = 'gsap-demo-container';
    container.className = 'gsap-demo-container';
    container.style.cssText = `
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

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '✕';
    closeBtn.title = 'Close';
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
      container.remove();
      console.log('🎬 GSAP demo closed');
    };
    container.appendChild(closeBtn);

    document.body.appendChild(container);
  }

  return container;
}

/**
 * Creates a stage area for animations
 */
function createStage(container, title) {
  const stage = document.createElement('div');
  stage.className = 'gsap-stage';
  stage.style.cssText = `
    margin-top: 20px;
    padding: 15px;
    background: #1e293b;
    border-radius: 8px;
    border: 1px solid #334155;
  `;

  const stageTitle = document.createElement('h4');
  stageTitle.textContent = title;
  stageTitle.style.cssText = `
    margin: 0 0 15px 0;
    color: #4ade80;
    font-size: 14px;
    font-weight: 600;
  `;
  stage.appendChild(stageTitle);

  const stageArea = document.createElement('div');
  stageArea.className = 'gsap-stage-area';
  stageArea.style.cssText = `
    position: relative;
    min-height: 100px;
    background: #0f172a;
    border-radius: 4px;
    padding: 10px;
  `;
  stage.appendChild(stageArea);

  container.appendChild(stage);
  return stageArea;
}

/**
 * Creates an animated element
 */
function createBox(stage, color = '#4ade80', text = '') {
  const box = document.createElement('div');
  box.className = 'gsap-box';
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
  box.onmouseenter = () => box.style.transform = 'scale(1.1)';
  box.onmouseleave = () => box.style.transform = 'scale(1)';

  stage.appendChild(box);
  return box;
}

/**
 * Test: Basic Tween (gsap.to)
 */
export async function testBasicTween() {
  const gsap = await getGsap();
  const container = createDemoContainer();
  const stage = createStage(container, 'Basic Tween (gsap.to)');

  const box = createBox(stage, '#4ade80');

  // Animate
  gsap.to(box, {
    duration: 1.5,
    x: 400,
    rotation: 360,
    borderRadius: '50%',
    backgroundColor: '#fbbf24',
    ease: 'power2.inOut',
    repeat: -1,
    yoyo: true
  });

  console.log('✅ [GSAP] Basic tween started');
}

/**
 * Test: From Tween (gsap.from)
 */
export async function testFromTween() {
  const gsap = await getGsap();
  const container = createDemoContainer();
  const stage = createStage(container, 'From Tween (gsap.from)');

  const box = createBox(stage, '#3b82f6', 'Hi!');

  // Animate from
  gsap.from(box, {
    duration: 1,
    opacity: 0,
    y: -100,
    scale: 0.5,
    ease: 'bounce.out'
  });

  console.log('✅ [GSAP] From tween started');
}

/**
 * Test: FromTo Tween (gsap.fromTo)
 */
export async function testFromToTween() {
  const gsap = await getGsap();
  const container = createDemoContainer();
  const stage = createStage(container, 'FromTo Tween (gsap.fromTo)');

  const box = createBox(stage, '#f472b6', 'A→B');

  // Animate from to
  gsap.fromTo(box, 
    { x: 0, opacity: 0.3, scale: 0.5 },
    { 
      duration: 1.5,
      x: 350, 
      opacity: 1, 
      scale: 1.2,
      ease: 'elastic.out(1, 0.3)',
      repeat: -1,
      yoyo: true
    }
  );

  console.log('✅ [GSAP] FromTo tween started');
}

/**
 * Test: Timeline (sequenced animations)
 */
export async function testTimeline() {
  const gsap = await getGsap();
  const container = createDemoContainer();
  const stage = createStage(container, 'Timeline (sequenced)');

  const box1 = createBox(stage, '#8b5cf6', '1');
  const box2 = createBox(stage, '#06b6d4', '2');
  const box3 = createBox(stage, '#f59e0b', '3');

  // Create timeline
  const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });

  tl.to(box1, { duration: 0.5, y: 50, rotation: 180 })
    .to(box2, { duration: 0.5, y: 50, rotation: 180 }, '-=0.3')
    .to(box3, { duration: 0.5, y: 50, rotation: 180 }, '-=0.3')
    .to([box1, box2, box3], { duration: 0.5, y: 0, rotation: 0 }, '+=0.2');

  console.log('✅ [GSAP] Timeline started');
}

/**
 * Test: Stagger (multiple elements with delay)
 */
export async function testStagger() {
  const gsap = await getGsap();
  const container = createDemoContainer();
  const stage = createStage(container, 'Stagger (cascading)');

  // Create multiple boxes
  const boxes = [];
  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'];

  for (let i = 0; i < 6; i++) {
    const box = createBox(stage, colors[i], i + 1);
    boxes.push(box);
  }

  // Stagger animation
  gsap.from(boxes, {
    duration: 0.8,
    opacity: 0,
    y: 50,
    scale: 0,
    stagger: 0.15,
    ease: 'back.out(1.7)',
    repeat: -1,
    repeatDelay: 1
  });

  console.log('✅ [GSAP] Stagger started');
}

/**
 * Test: Easing Comparison
 */
export async function testEasing() {
  const gsap = await getGsap();
  const container = createDemoContainer();
  const stage = createStage(container, 'Easing Comparison');

  const easings = [
    { name: 'linear', ease: 'none' },
    { name: 'power2', ease: 'power2.inOut' },
    { name: 'elastic', ease: 'elastic.out(1, 0.3)' },
    { name: 'bounce', ease: 'bounce.out' }
  ];

  const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

  easings.forEach((easing, i) => {
    const row = document.createElement('div');
    row.style.cssText = `
      display: flex;
      align-items: center;
      margin: 10px 0;
    `;

    const label = document.createElement('div');
    label.textContent = easing.name;
    label.style.cssText = `
      width: 80px;
      color: ${colors[i]};
      font-size: 12px;
      font-weight: bold;
    `;
    row.appendChild(label);

    const track = document.createElement('div');
    track.style.cssText = `
      flex: 1;
      height: 30px;
      background: #1e293b;
      border-radius: 4px;
      position: relative;
      overflow: hidden;
    `;

    const ball = document.createElement('div');
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

    // Animate with specific easing
    gsap.to(ball, {
      duration: 2,
      x: track.offsetWidth - 30,
      ease: easing.ease,
      repeat: -1,
      repeatDelay: 0.5,
      yoyo: true
    });
  });

  console.log('✅ [GSAP] Easing comparison started');
}

/**
 * Test: CSS Properties Animation
 */
export async function testCSSAnimation() {
  const gsap = await getGsap();
  const container = createDemoContainer();
  const stage = createStage(container, 'CSS Properties');

  const box = createBox(stage, '#ec4899', 'CSS');
  box.style.width = '80px';
  box.style.height = '80px';

  gsap.to(box, {
    duration: 2,
    backgroundColor: '#8b5cf6',
    borderRadius: '50%',
    boxShadow: '0 0 30px rgba(139, 92, 246, 0.8)',
    border: '3px solid #fbbf24',
    transform: 'rotate(360deg)',
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut'
  });

  console.log('✅ [GSAP] CSS animation started');
}

/**
 * Test: SVG Animation
 */
export async function testSVGAnimation() {
  const gsap = await getGsap();
  const container = createDemoContainer();
  const stage = createStage(container, 'SVG Animation');

  // Create SVG
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '200');
  svg.setAttribute('height', '100');
  svg.style.cssText = `
    display: block;
    margin: 20px auto;
  `;

  // Create circle
  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  circle.setAttribute('cx', '50');
  circle.setAttribute('cy', '50');
  circle.setAttribute('r', '20');
  circle.setAttribute('fill', '#4ade80');

  svg.appendChild(circle);
  stage.appendChild(svg);

  // Animate SVG attributes
  gsap.to(circle, {
    duration: 2,
    attr: {
      cx: 150,
      r: 30
    },
    fill: '#fbbf24',
    repeat: -1,
    yoyo: true,
    ease: 'power2.inOut'
  });

  console.log('✅ [GSAP] SVG animation started');
}

/**
 * Cleanup function
 */
export function cleanup() {
  const gsap = window.gsap;
  if (gsap) {
    // Kill all tweens
    gsap.killTweensOf('*');
    console.log('🧹 [GSAP] All tweens killed');
  }

  // Remove demo container
  const container = document.getElementById('gsap-demo-container');
  if (container) {
    container.remove();
  }

  console.log('🧹 [GSAP] Cleanup complete (CDN script remains in DOM for reuse)');
}

// Export for debugging
export const gsapTest = {
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
