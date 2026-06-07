// src/modules/ui-test.js
// Painel de testes com controles globais (console-only logging)
import { root, getVar, getList } from '../perchance-bridge.js';
import { VERSION, CDN_BASE } from '../constants.js';
import { createTestContainer } from './test-container.js';

const CSS_URL = `${CDN_BASE}/src/styles/ui-test.css`;

function injectStylesheet() {
  if (document.getElementById('ui-test-styles')) return;
  const link = document.createElement('link');
  link.id = 'ui-test-styles';
  link.rel = 'stylesheet';
  link.href = CSS_URL;
  document.head.appendChild(link);
}

const buttonStatus = new Map();

function setButtonStatus(btnId, status) {
  const btn = document.getElementById(btnId);
  if (!btn) return;

  btn.classList.remove('ui-test-btn--running', 'ui-test-btn--success', 'ui-test-btn--error');

  const existingStatus = btn.querySelector('.ui-test-btn__status');
  if (existingStatus) existingStatus.remove();

  if (status === 'idle') {
    buttonStatus.delete(btnId);
    return;
  }

  btn.classList.add(`ui-test-btn--${status}`);
  buttonStatus.set(btnId, status);

  const statusSpan = document.createElement('span');
  statusSpan.className = 'ui-test-btn__status';
  const icons = { running: '⏳', success: '✅', error: '❌' };
  statusSpan.textContent = icons[status] || '';
  btn.appendChild(statusSpan);
}

async function runTest(btnId, testName, testFn) {
  setButtonStatus(btnId, 'running');
  const startTime = Date.now();
  try {
    await testFn();
    const duration = Date.now() - startTime;
    console.log(`✅ [${testName}] Passed (${duration}ms)`);
    setButtonStatus(btnId, 'success');
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ [${testName}] Failed (${duration}ms):`, error.message);
    setButtonStatus(btnId, 'error');
  }
}

async function runAllTests(testDefs) {
  console.log('▶ Running all tests...');
  for (const def of testDefs) {
    const btn = document.getElementById(def.btnId);
    if (!btn) continue;
    setButtonStatus(def.btnId, 'idle');
  }
  for (const def of testDefs) {
    await runTest(def.btnId, def.name, def.fn);
    await new Promise(r => setTimeout(r, 300));
  }
  const passed = [...buttonStatus.values()].filter(s => s === 'success').length;
  const failed = [...buttonStatus.values()].filter(s => s === 'error').length;
  console.log(`🏁 Done: ${passed} ✅ | ${failed} ❌`);
}

export function initUITest(rendererData, testModules) {
  console.log(`🎮 [UI-Test] Creating test panel ${VERSION}...`);

  injectStylesheet();

  const capturedSeed = getVar('GAME_SEED', 'N/A');
  const capturedRoot = !!root;
  console.log('📸 [UI-Test] Captured values:', { seed: capturedSeed, root: capturedRoot });

  const {
    imageTest,
    aiTextTest,
    aiImageTest,
    listsTest,
    stateTest,
    raycasterTest,
    canvasTest,
    ttsTest,
    diceTest,
    rpgIconTest,
    patternTest,
    kvTest,
    seederTest,
    apexchartsTest,
    audioTest,
    mermaidTest,
    matterTest,
    cannonTest,
    particlesTest,
    cellularAutomataTest,
    indexeddbTest,
    gsapTest,
    typewriterTest,
    terrain3DTest
  } = testModules;

  // Test definitions for Run All
  const testDefs = [
    { btnId: 'btn-dice', name: 'Dice', fn: () => diceHandler() },
    { btnId: 'btn-seeder', name: 'Seeder', fn: () => seederHandler() },
    { btnId: 'btn-pattern', name: 'Pattern', fn: () => patternHandler() },
    { btnId: 'btn-ai-text', name: 'AI Text', fn: () => aiTextHandler() },
    { btnId: 'btn-ai-startwith', name: 'AI Text - startWith', fn: () => aiTextStartWithHandler() },
    { btnId: 'btn-ai-stop', name: 'AI Text - stopSequences', fn: () => aiTextStopSequencesHandler() },
    { btnId: 'btn-ai-style', name: 'AI Text - style & outputTo', fn: () => aiTextStyleOutputHandler() },
    { btnId: 'btn-ai-endbuttons', name: 'AI Text - endButtons', fn: () => aiTextEndButtonsHandler() },
    { btnId: 'btn-ai-onchunk', name: 'AI Text - onChunk', fn: () => aiTextOnChunkHandler() },
    { btnId: 'btn-ai-onfinish', name: 'AI Text - onFinish', fn: () => aiTextOnFinishHandler() },
    { btnId: 'btn-ai-dynamic', name: 'AI Text - Dynamic', fn: () => aiTextDynamicHandler() },
    { btnId: 'btn-ai-render', name: 'AI Text - Render', fn: () => aiTextRenderHandler() },
    { btnId: 'btn-ai-json', name: 'AI Text - JSON', fn: () => aiTextStructuredJSONHandler() },
    { btnId: 'btn-ai-markdown', name: 'AI Text - Markdown', fn: () => aiTextMarkdownRenderHandler() },
    { btnId: 'btn-ai-concurrency', name: 'AI Text - Concurrency', fn: () => aiTextConcurrencyHandler() },
    { btnId: 'btn-ai-image-single', name: 'AI Image - Single', fn: () => aiImageSingleHandler() },
    { btnId: 'btn-ai-image-batch', name: 'AI Image - Batch', fn: () => aiImageBatchHandler() },
    { btnId: 'btn-ai-image-processing', name: 'AI Image - Processing', fn: () => aiImageProcessingHandler() },
    { btnId: 'btn-ai-image-errors', name: 'AI Image - Errors', fn: () => aiImageErrorsHandler() },
    { btnId: 'btn-ai-image-plaintext', name: 'AI Image - Plaintext/Context', fn: () => aiImagePlaintextContextHandler() },
    { btnId: 'btn-ai-image-preprocessall', name: 'AI Image - preprocessAll', fn: () => aiImagePreprocessAllHandler() },
    { btnId: 'btn-ai-image-html', name: 'AI Image - HTML Wrappers', fn: () => aiImageHtmlWrappersHandler() },
    { btnId: 'btn-ai-image-batch-html', name: 'AI Image - Batch HTML', fn: () => aiImageBatchHtmlWrappersHandler() },
    { btnId: 'btn-image', name: 'Image', fn: () => imageHandler() },
    { btnId: 'btn-tts', name: 'TTS', fn: () => ttsHandler() },
    { btnId: 'btn-3d', name: 'Cube Color', fn: () => cubeColorHandler() },
    { btnId: 'btn-raycaster', name: 'Raycaster', fn: () => raycasterHandler() },
    { btnId: 'btn-canvas', name: 'Canvas', fn: () => canvasHandler() },
    { btnId: 'btn-rpg-icon', name: 'RPG Icons', fn: () => rpgIconHandler() },
    { btnId: 'btn-lists', name: 'Lists', fn: () => listsHandler() },
    { btnId: 'btn-bridge', name: 'Bridge', fn: () => bridgeHandler() },
    { btnId: 'btn-state-save', name: 'Save', fn: () => stateSaveHandler() },
    { btnId: 'btn-state-load', name: 'Load', fn: () => stateLoadHandler() },
    { btnId: 'btn-kv', name: 'KV', fn: () => kvHandler() },
    { btnId: 'btn-chart-bar', name: 'Bar Chart', fn: () => chartBarHandler() },
    { btnId: 'btn-chart-line', name: 'Line Chart', fn: () => chartLineHandler() },
    { btnId: 'btn-chart-pie', name: 'Pie Chart', fn: () => chartPieHandler() },
    { btnId: 'btn-chart-radar', name: 'Radar Chart', fn: () => chartRadarHandler() },
    { btnId: 'btn-audio-sfx', name: 'Audio SFX', fn: () => audioSFXHandler() },
    { btnId: 'btn-audio-music', name: 'Audio Music', fn: () => audioMusicHandler() },
    { btnId: 'btn-audio-sprite', name: 'Audio Sprite', fn: () => audioSpriteHandler() },
    { btnId: 'btn-audio-volume', name: 'Audio Volume', fn: () => audioVolumeHandler() },
    { btnId: 'btn-audio-stop', name: 'Audio Stop', fn: () => audioStopHandler() },
    { btnId: 'btn-mermaid', name: 'Mermaid', fn: () => mermaidHandler() },
    { btnId: 'btn-matter', name: 'Matter.js', fn: () => matterHandler() },
    { btnId: 'btn-cannon', name: 'Cannon-es', fn: () => cannonHandler() },
    { btnId: 'btn-particles', name: 'Particles', fn: () => particlesHandler() },
    { btnId: 'btn-gsap-basic', name: 'GSAP Tween', fn: () => gsapBasicHandler() },
    { btnId: 'btn-gsap-from', name: 'GSAP From', fn: () => gsapFromHandler() },
    { btnId: 'btn-gsap-timeline', name: 'GSAP Timeline', fn: () => gsapTimelineHandler() },
    { btnId: 'btn-gsap-stagger', name: 'GSAP Stagger', fn: () => gsapStaggerHandler() },
    { btnId: 'btn-gsap-easing', name: 'GSAP Easing', fn: () => gsapEasingHandler() },
    { btnId: 'btn-typewriter', name: 'Typewriter', fn: () => typewriterHandler() },
    { btnId: 'btn-terrain-3d', name: '3D Terrain', fn: () => terrain3DHandler() }
  ];
  const HOW_IT_WORKS_DATA = [
    { id: 'dice', title: '🎲 Dice', what: 'Tests Perchance native dice rolling syntax (1d4, 1d6, 1d20, etc.).', how: 'Calls <code>root.dice()</code> for each standard RPG die, captures results, and renders a comparison table.', key: 'Perchance <code>root.dice()</code>, RNG, string parsing.' },
    { id: 'seeder', title: '🌱 Seeder', what: 'Validates deterministic seed generation for reproducible randomness.', how: 'Generates multiple seeds from the same input string and verifies they produce identical outputs across runs.', key: 'Seeded RNG, hash functions, reproducibility.' },
    { id: 'pattern', title: '🎨 Pattern', what: 'Generates procedural textures/patterns using Perchance generators.', how: 'Creates a canvas, fills it with algorithmic patterns driven by Perchance lists, and displays the result.', key: 'Canvas 2D, procedural generation, Perchance lists.' },
    { id: 'ai-text', title: '🤖 AI Text', what: 'Tests AI text generation via Perchance AI plugins.', how: 'Calls the AI text plugin with a prompt, waits for async response, and renders the generated text.', key: 'Async/await, plugin bridge, AI API integration.' },
    { id: 'ai-image', title: '🖼️ AI Image', what: 'Tests advanced AI image generation with hooks and batch processing.', how: 'Calls the advanced-ai-image-plugin with prompts, preprocess/postprocess hooks, and batch generation, displaying results in a responsive grid.', key: 'Async image generation, DOM manipulation, plugin hooks, batch processing.' },
    { id: 'image', title: '🖼️ Image', what: 'Tests AI image generation and rendering.', how: 'Requests an image from the AI plugin, handles loading state, and displays the resulting image URL.', key: 'Async image loading, error handling, DOM insertion.' },
    { id: 'tts', title: '🔊 TTS', what: 'Tests Text-to-Speech using the Web Speech API.', how: 'Initializes speech synthesis, configures voice/rate/pitch, and speaks a test phrase. Includes stop control.', key: 'Web Speech API, <code>speechSynthesis</code>, async audio.' },
    { id: '3d', title: '🎲 Cube Color', what: 'Tests Three.js basic rendering and material color updates.', how: 'Creates a Three.js scene with a rotating cube, updates its material color dynamically, and renders to canvas.', key: 'Three.js, WebGL, animation loop, material updates.' },
    { id: 'raycaster', title: '🖱️ Raycaster', what: 'Tests 3D click detection using Three.js Raycaster.', how: 'Sets up a scene with multiple objects, casts a ray from camera on click, and highlights the intersected object.', key: 'Three.js Raycaster, mouse coordinates, intersection testing.' },
    { id: 'canvas', title: '🎨 Canvas', what: 'Tests HTML5 Canvas 2D drawing primitives.', how: 'Draws shapes, gradients, and text on a 2D canvas context, verifying rendering pipeline.', key: 'Canvas 2D API, <code>getContext("2d")</code>, drawing commands.' },
    { id: 'rpg-icon', title: '⚔️ RPG Icons', what: 'Tests sprite sheet extraction and rendering for RPG-style icons.', how: 'Loads a sprite sheet, calculates tile coordinates, and draws specific icons to canvas.', key: 'Sprite sheets, <code>drawImage</code> slicing, asset management.' },
    { id: 'particles', title: '✨ Particles', what: 'Tests a custom particle system with physics and lifecycle.', how: 'Spawns particles with velocity, gravity, and fade-out. Updates and renders them each frame.', key: 'RequestAnimationFrame, particle lifecycle, vector math.' },
    { id: 'cellular-automata', title: '🧬 Cellular Automata', what: 'Tests grid-based simulation (e.g., Game of Life rules).', how: 'Initializes a grid, applies neighbor-based rules each tick, and renders the evolving state.', key: '2D arrays, neighbor counting, simulation loops.' },
    { id: 'gsap', title: '🎬 GSAP', what: 'Tests GSAP animation library (tweens, timelines, staggers, easing).', how: 'Creates DOM elements, applies GSAP animations with various configs, and verifies cleanup.', key: 'GSAP core, timelines, stagger, easing, memory cleanup.' },
    { id: 'charts', title: '📊 Charts', what: 'Tests ApexCharts integration (Bar, Line, Donut, Radar).', how: 'Initializes chart instances with mock data, renders responsive SVGs, and tests updates.', key: 'ApexCharts, data binding, SVG rendering, responsive design.' },
    { id: 'audio', title: '🔊 Audio', what: 'Tests Web Audio/Howler.js (SFX, Music, Sprites, Volume, Stop).', how: 'Loads audio assets, plays loops/one-shots, adjusts gain, tests sprite markers, and stops playback.', key: 'Web Audio API, Howler.js, audio sprites, gain control.' },
    { id: 'mermaid', title: '📊 Mermaid', what: 'Tests Mermaid.js diagram rendering from markdown syntax.', how: 'Passes mermaid syntax to the library, renders SVG/HTML output, and injects into container.', key: 'Mermaid.js, markdown parsing, SVG injection.' },
    { id: 'matter', title: '⚛️ Matter.js', what: 'Tests 2D physics simulation with rigid bodies.', how: 'Creates a Matter.js world with bodies, constraints, and gravity. Runs simulation loop.', key: 'Matter.js, rigid bodies, constraints, 2D physics loop.' },
    { id: 'cannon', title: '💣 Cannon-es', what: 'Tests 3D physics simulation and collision detection.', how: 'Sets up a Cannon-es world with spheres/boxes, applies forces, and syncs with visual mesh.', key: 'Cannon-es, 3D collisions, physics step, mesh sync.' },
    { id: 'lists', title: '📋 Lists', what: 'Tests Perchance list evaluation and random selection.', how: 'Fetches lists via <code>getList()</code>, evaluates items, and displays random picks.', key: 'Perchance lists, <code>getList()</code>, random evaluation.' },
    { id: 'bridge', title: '🔗 Bridge', what: 'Tests the Perchance plugin bridge communication.', how: 'Sends/receives data between JS and Perchance runtime, verifying payload integrity.', key: 'Plugin bridge, message passing, data serialization.' },
    { id: 'state', title: '💾 Save/Load', what: 'Tests localStorage state persistence.', how: 'Serializes game state to JSON, saves to localStorage, reloads, and hydrates state.', key: '<code>localStorage</code>, JSON serialization, state hydration.' },
    { id: 'kv', title: '🗄️ KV', what: 'Tests key-value storage plugin for structured data.', how: 'Sets/gets/deletes KV pairs, verifies persistence and type handling.', key: 'KV plugin, structured storage, CRUD operations.' },
    { id: 'indexeddb', title: '🗃️ IndexedDB', what: 'Tests native browser NoSQL database for large/complex data.', how: 'Opens DB, saves primitives & AI results (FIFO cache), loads them back, and clears stores.', key: 'IndexedDB, async transactions, Blobs, FIFO eviction.' },
    { id: 'image-guidance', title: '⚖️ CFG Scale', what: 'Tests guidance scale (CFG) parameter for AI image generation.', how: 'Generates 3 images with different CFG values (3, 7, 15) to show creativity vs prompt adherence.', key: 'guidanceScale parameter, prompt adherence, AI control.' },
    { id: 'image-negative', title: '🚫 Negative Prompt', what: 'Tests negative prompt parameter to exclude elements from generation.', how: 'Generates same image with and without negative prompt to show exclusion effect.', key: 'negativePrompt parameter, element exclusion, AI refinement.' },
    { id: 'image-trigger', title: '🎭 Trigger Words', what: 'Tests model-specific trigger words for different art styles.', how: 'Generates images using trigger words for Normal, Anime, and Furry styles.', key: 'Model triggers, style control, anime/furry generation.' },
    { id: 'image-emoji', title: '😀 Emoji Prompts', what: 'Tests emoji support in AI image generation prompts.', how: 'Generates images with emojis (🐉🌸🤖) as part of the prompt.', key: 'Emoji tokens, prompt syntax, visual concept mapping.' },
    { id: 'image-onfinish', title: '📊 onFinish Callback', what: 'Tests the onFinish callback for capturing generation metadata.', how: 'Uses onFinish callback to capture and display image data, canvas, and inputs.', key: 'onFinish callback, metadata capture, async completion.' },
    { id: 'image-emphasis', title: '🎯 Tag Emphasis', what: 'Tests tag weighting/emphasis syntax (tag:weight).', how: 'Generates images with different emphasis weights (0.5, 1.0, 1.5, 2.0) to show impact.', key: 'Tag weighting, (tag:weight) syntax, prompt emphasis.' },
    { id: 'image-ordering', title: '🔄 Prompt Ordering', what: 'Tests how tag order affects image composition.', how: 'Generates images with same tags in different orders to show positional impact.', key: 'Tag ordering, composition bias, prompt structure.' },
    { id: 'image-canvas', title: '🎨 Canvas Post-Processing', what: 'Tests direct canvas manipulation after image generation.', how: 'Accesses result.canvas to apply filters (grayscale, sepia) and overlay text.', key: 'Canvas API, image processing, post-generation effects.' },
    { id: 'image-break', title: '⚡ BREAK Keyword', what: 'Tests BREAK keyword for separating prompt chunks.', how: 'Generates images with and without BREAK to show token separation effect.', key: 'BREAK keyword, token chunking, prompt separation.' },
    { id: 'image-blending', title: '🎨 Tag Blending', what: 'Tests tag blending syntax [from:to:ratio] for style mixing.', how: 'Generates images with different blend ratios (0%, 50%, 100%) between styles.', key: 'Tag blending, [from:to:ratio] syntax, style mixing.' },
    { id: 'image-grid', title: '🖼️ Multi-Image Grid', what: 'Tests parallel generation of multiple images.', how: 'Uses Promise.all() to generate 4 images simultaneously in a grid layout.', key: 'Parallel generation, Promise.all(), batch processing.' },
    { id: 'image-alternating', title: '🔄 Alternating Tags', what: 'Tests alternating tag syntax [tag1|tag2] for step variation.', how: 'Generates images with alternating tags to show per-step variation effect.', key: 'Alternating tags, [tag1|tag2] syntax, step variation.' },
    { id: 'image-addremove', title: '➕ Add/Remove During Gen', what: 'Tests adding/removing tags during generation [to:when] and [from::when].', how: 'Generates images with tags added/removed at specific generation steps.', key: 'Dynamic prompts, [to:when] syntax, [from::when] syntax.' },
    { id: 'ai-json', title: '📋 Structured JSON', what: 'Tests structured JSON output generation.', how: 'Uses instruction to generate valid JSON and parses it to display structured data.', key: 'JSON output, structured data, AI formatting.' },
    { id: 'ai-markdown', title: '📝 Markdown Render', what: 'Tests markdown rendering during streaming.', how: 'Uses render function to convert markdown syntax to HTML in real-time.', key: 'Markdown parsing, real-time rendering, HTML conversion.' },
    { id: 'ai-concurrency', title: '⚡ Concurrency Limits', what: 'Tests concurrent AI text generation limits.', how: 'Generates multiple texts simultaneously to test rate limiting and concurrency.', key: 'Concurrency control, rate limiting, parallel requests.' },
  ];

  async function diceHandler() {
    console.log('🎲 Rolling dice...');
    if (!diceTest || !diceTest.available) throw new Error('Plugin not available');
    const { contentArea } = createTestContainer('🎲 Dice Test', { id: 'test-dice', width: 400, height: 300 });
    const d4 = { dice: '1d4', result: root.dice('1d4') };
    const d6 = { dice: '1d6', result: root.dice('1d6') };
    const d8 = { dice: '1d8', result: root.dice('1d8') };
    const d10 = { dice: '1d10', result: root.dice('1d10') };
    const d12 = { dice: '1d12', result: root.dice('1d12') };
    const d20 = { dice: '1d20', result: root.dice('1d20') };
    const d100 = { dice: '1d100', result: root.dice('1d100') };
    const allRolls = [d4, d6, d8, d10, d12, d20, d100];
    contentArea.innerHTML = allRolls.map(r =>
      `<div style="display:flex;justify-content:space-between;padding:8px;border-bottom:1px solid #333;">
        <span style="color:#fbbf24;">${r.dice}</span>
        <span style="color:#4ade80;font-weight:bold;font-size:18px;">${r.result}</span>
      </div>`
    ).join('');
    console.log(`🎲 Results: ${allRolls.map(r => r.dice + '=' + r.result).join(' | ')}`);
  }

  async function seederHandler() {
    console.log('🌱 Testing Seeder...');
    if (!seederTest || !seederTest.available) throw new Error('Plugin not available');
    const { contentArea } = createTestContainer('🌱 Seeder Test', { id: 'test-seeder', width: 500, height: 350 });
    const seed = seederTest.generateRandomSeed();
    seederTest.applySeed(seed);
    const repro = seederTest.demonstrateReproducibility();
    contentArea.innerHTML = `
      <div style="padding:10px;">
        <div style="margin-bottom:15px;">
          <div style="color:#94a3b8;font-size:12px;">Seed gerada:</div>
          <div style="color:#4ade80;font-size:20px;font-family:monospace;margin-top:5px;">${seed}</div>
        </div>
        <div style="margin-bottom:15px;">
          <div style="color:#94a3b8;font-size:12px;">Execução 1:</div>
          <div style="color:#fbbf24;font-family:monospace;margin-top:5px;">${JSON.stringify(repro?.results1 || [])}</div>
        </div>
        <div style="margin-bottom:15px;">
          <div style="color:#94a3b8;font-size:12px;">Execução 2 (mesma seed):</div>
          <div style="color:#fbbf24;font-family:monospace;margin-top:5px;">${JSON.stringify(repro?.results2 || [])}</div>
        </div>
        <div style="padding:8px;background:${repro?.match ? '#166534' : '#991b1b'};border-radius:4px;text-align:center;">
          ${repro?.match ? '✅ Resultados idênticos — Seed funciona!' : '⚠️ Resultados diferentes (esperado sem listas)'}
        </div>
      </div>`;
    seederTest.resetSeed();
    console.log(`✅ Seed applied: ${seed}`);
  }

  async function patternHandler() {
    console.log('🎨 Generating procedural pattern...');
    if (!patternTest || !patternTest.available) throw new Error('Plugin not available');
    const { contentArea } = createTestContainer('🎨 Pattern Test', { id: 'test-pattern', width: 500, height: 500 });
    contentArea.innerHTML = '<div style="color:#94a3b8;text-align:center;padding:20px;">Gerando padrão...</div>';
    const result = patternTest.generateEmojiPattern();
    if (!result) { contentArea.innerHTML = '<div style="color:#ff6b6b;text-align:center;padding:20px;">❌ Falha na geração</div>'; throw new Error('Pattern generation failed'); }
    if (typeof result === 'string' && result.startsWith('data:image/')) {
      contentArea.innerHTML = `<img src="${result}" style="width:100%;height:auto;border-radius:4px;" alt="Generated Pattern"/>`;
    } else {
      contentArea.innerHTML = `<div style="color:#fbbf24;padding:10px;">
        <div style="margin-bottom:10px;">Tipo: ${typeof result}</div>
        <div style="word-break:break-all;font-size:10px;max-height:300px;overflow:auto;">${String(result).substring(0, 500)}...</div>
      </div>`;
    }
    console.log('✅ Pattern generated!');
  }

  async function aiTextHandler() {
    console.log('🤖 Generating AI text...');
    if (!aiTextTest || !aiTextTest.available) throw new Error('Plugin not available');
    const { contentArea } = createTestContainer('🤖 AI Text Test', { id: 'test-ai-text', width: 600, height: 400 });
    contentArea.innerHTML = '<div style="color:#94a3b8;text-align:center;padding:20px;">⏳ Gerando texto com IA...</div>';
    const result = await aiTextTest.generateBasic('Escreva uma frase curta sobre um aventureiro.');
    if (!result?.success || !result.text) {
      contentArea.innerHTML = `<div style="color:#ff6b6b;padding:10px;">❌ Erro: ${result?.error || 'Resposta vazia'}</div>`;
      throw new Error(result?.error || 'Empty response from AI');
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


  // Phase 1: AI Text Tests
  async function aiTextStartWithHandler() {
    console.log('🤖 Testing startWith & hideStartWith...');
    if (!aiTextTest || !aiTextTest.available) throw new Error('Plugin not available');
    const { contentArea } = createTestContainer('🤖 AI Text - startWith & hideStartWith', { id: 'test-ai-startwith', width: 600, height: 500 });
    contentArea.innerHTML = '<div style="color:#94a3b8;text-align:center;padding:20px;">⏳ Gerando textos com startWith...</div>';
    
    const result = await aiTextTest.testStartWithAndHide();
    if (!result?.success) {
      contentArea.innerHTML = `<div style="color:#ff6b6b;padding:10px;">❌ Erro: ${result?.error || 'Falha no teste'}</div>`;
      throw new Error(result?.error || 'Test failed');
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
    console.log('✅ startWith test completed!');
  }

  async function aiTextStopSequencesHandler() {
    console.log('🤖 Testing stopSequences...');
    if (!aiTextTest || !aiTextTest.available) throw new Error('Plugin not available');
    const { contentArea } = createTestContainer('🤖 AI Text - stopSequences', { id: 'test-ai-stop', width: 600, height: 400 });
    contentArea.innerHTML = '<div style="color:#94a3b8;text-align:center;padding:20px;">⏳ Gerando texto com stopSequences...</div>';
    
    const result = await aiTextTest.testStopSequences();
    if (!result?.success || !result.text) {
      contentArea.innerHTML = `<div style="color:#ff6b6b;padding:10px;">❌ Erro: ${result?.error || 'Resposta vazia'}</div>`;
      throw new Error(result?.error || 'Empty response');
    }
    
    contentArea.innerHTML = `
      <div style="padding:10px;">
        <div style="color:#94a3b8;font-size:12px;margin-bottom:10px;">Prompt: "Conte uma história curta sobre um herói. Pare quando disser 'FIM'."</div>
        <div style="color:#e2e8f0;font-size:13px;line-height:1.6;padding:15px;background:#0f172a;border-radius:4px;border-left:3px solid #f59e0b;">
          ${result.text}
        </div>
        <div style="color:#64748b;font-size:11px;margin-top:10px;">Caracteres: ${result.text.length} | Stop sequences: ['FIM', 'The End', '###']</div>
      </div>`;
    console.log('✅ stopSequences test completed!');
  }

  async function aiTextStyleOutputHandler() {
    console.log('🤖 Testing style & outputTo...');
    if (!aiTextTest || !aiTextTest.available) throw new Error('Plugin not available');
    const { contentArea } = createTestContainer('🤖 AI Text - style & outputTo', { id: 'test-ai-style', width: 600, height: 400 });
    contentArea.innerHTML = '<div style="color:#94a3b8;text-align:center;padding:20px;">⏳ Gerando texto com style & outputTo...</div>';
    
    const result = await aiTextTest.testStyleAndOutputTo('test-ai-style');
    if (!result?.success || !result.text) {
      contentArea.innerHTML = `<div style="color:#ff6b6b;padding:10px;">❌ Erro: ${result?.error || 'Resposta vazia'}</div>`;
      throw new Error(result?.error || 'Empty response');
    }
    
    // The output is already rendered in the #ai-text-output element by the plugin
    // We just add a confirmation message
    contentArea.innerHTML += `
      <div style="padding:10px;margin-top:10px;">
        <div style="color:#4ade80;font-size:12px;">✅ Texto renderizado diretamente no elemento #ai-text-output com CSS customizado!</div>
        <div style="color:#64748b;font-size:11px;margin-top:5px;">Caracteres: ${result.text.length}</div>
      </div>`;
    console.log('✅ style & outputTo test completed!');
  }

  async function aiTextEndButtonsHandler() {
    console.log('🤖 Testing endButtons...');
    if (!aiTextTest || !aiTextTest.available) throw new Error('Plugin not available');
    const { contentArea } = createTestContainer('🤖 AI Text - endButtons', { id: 'test-ai-endbuttons', width: 600, height: 400 });
    contentArea.innerHTML = '<div style="color:#94a3b8;text-align:center;padding:20px;">⏳ Gerando texto sem botões de editar/continuar...</div>';
    
    const result = await aiTextTest.testEndButtons();
    if (!result?.success || !result.text) {
      contentArea.innerHTML = `<div style="color:#ff6b6b;padding:10px;">❌ Erro: ${result?.error || 'Resposta vazia'}</div>`;
      throw new Error(result?.error || 'Empty response');
    }
    
    contentArea.innerHTML = `
      <div style="padding:10px;">
        <div style="color:#94a3b8;font-size:12px;margin-bottom:10px;">Prompt: "Escreva um parágrafo sobre um mago misterioso."</div>
        <div style="color:#e2e8f0;font-size:13px;line-height:1.6;padding:15px;background:#0f172a;border-radius:4px;border-left:3px solid #ec4899;">
          ${result.text}
        </div>
        <div style="color:#64748b;font-size:11px;margin-top:10px;">Caracteres: ${result.text.length} | endButtons: 'none' (botões ocultados)</div>
      </div>`;
    console.log('✅ endButtons test completed!');
  }
  // ===== HANDLERS FASE 2 AI TEXT =====
  async function aiTextOnChunkHandler() {
    console.log('🤖 Testing onChunk streaming...');
    if (!aiTextTest || !aiTextTest.available) throw new Error('Plugin not available');
    const { contentArea } = createTestContainer('🤖 AI Text - onChunk Streaming', { id: 'test-ai-onchunk', width: 600, height: 500 });
    
    // Cria display para streaming em tempo real
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
    
    const streamDisplay = document.getElementById('stream-display');
    const streamStatus = document.getElementById('stream-status');
    
    const result = await aiTextTest.testOnChunkStreaming(streamDisplay);
    
    if (!result?.success) {
      contentArea.innerHTML = `<div style="color:#ff6b6b;padding:10px;">❌ Erro: ${result?.error || 'Falha no teste'}</div>`;
      throw new Error(result?.error || 'Test failed');
    }
    
    streamStatus.innerHTML = `✅ <span style="color:#4ade80;">${result.chunkCount} chunks recebidos</span> | <span style="color:#94a3b8;">Texto final: ${result.finalText.length} caracteres</span>`;
    console.log('✅ onChunk streaming test completed!');
  }

  async function aiTextOnFinishHandler() {
    console.log('🤖 Testing onFinish capture...');
    if (!aiTextTest || !aiTextTest.available) throw new Error('Plugin not available');
    const { contentArea } = createTestContainer('🤖 AI Text - onFinish Capture', { id: 'test-ai-onfinish', width: 600, height: 500 });
    contentArea.innerHTML = '<div style="color:#94a3b8;text-align:center;padding:20px;">⏳ Gerando texto com onFinish...</div>';
    
    const result = await aiTextTest.testOnFinishCapture();
    if (!result?.success) {
      contentArea.innerHTML = `<div style="color:#ff6b6b;padding:10px;">❌ Erro: ${result?.error || 'Falha no teste'}</div>`;
      throw new Error(result?.error || 'Test failed');
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
    console.log('✅ onFinish capture test completed!');
  }

  async function aiTextDynamicHandler() {
    console.log('🤖 Testing dynamic prompts...');
    if (!aiTextTest || !aiTextTest.available) throw new Error('Plugin not available');
    const { contentArea } = createTestContainer('🤖 AI Text - Dynamic Prompts', { id: 'test-ai-dynamic', width: 600, height: 400 });
    contentArea.innerHTML = '<div style="color:#94a3b8;text-align:center;padding:20px;">⏳ Gerando com instruction dinâmica...</div>';
    
    const result = await aiTextTest.testDynamicPrompts();
    if (!result?.success) {
      contentArea.innerHTML = `<div style="color:#ff6b6b;padding:10px;">❌ Erro: ${result?.error || 'Falha no teste'}</div>`;
      throw new Error(result?.error || 'Test failed');
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
    console.log('✅ Dynamic prompts test completed!');
  }

  async function aiTextRenderHandler() {
    console.log('🤖 Testing render function...');
    if (!aiTextTest || !aiTextTest.available) throw new Error('Plugin not available');
    const { contentArea } = createTestContainer('🤖 AI Text - Render Function', { id: 'test-ai-render', width: 600, height: 400 });
    contentArea.innerHTML = '<div style="color:#94a3b8;text-align:center;padding:20px;">⏳ Gerando com render function...</div>';
    
    const result = await aiTextTest.testRenderFunction('test-ai-render');
    if (!result?.success) {
      contentArea.innerHTML = `<div style="color:#ff6b6b;padding:10px;">❌ Erro: ${result?.error || 'Falha no teste'}</div>`;
      throw new Error(result?.error || 'Test failed');
    }
    
    contentArea.innerHTML += `
      <div style="padding:10px;margin-top:10px;">
        <div style="color:#4ade80;font-size:12px;">✅ Texto renderizado com transformação *ação* → <em>ação</em></div>
        <div style="color:#64748b;font-size:11px;margin-top:5px;">Caracteres: ${result.text.length}</div>
      </div>`;
    console.log('✅ Render function test completed!');
  }

  // ===== HANDLERS FASE 3 AI TEXT =====
  async function aiTextStructuredJSONHandler() {
    console.log('🤖 Testing structured JSON generation...');
    if (!aiTextTest || !aiTextTest.available) throw new Error('Plugin not available');
    const { contentArea } = createTestContainer('🤖 AI Text - Structured JSON', { id: 'test-ai-json', width: 600, height: 400 });
    contentArea.innerHTML = '<div style="color:#94a3b8;text-align:center;padding:20px;">⏳ Gerando JSON estruturado...</div>';
    
    const result = await aiTextTest.testStructuredJSON();
    if (!result?.success) {
      contentArea.innerHTML = `<div style="color:#ff6b6b;padding:10px;">❌ Erro: ${result?.error || 'Falha no teste'}</div>`;
      throw new Error(result?.error || 'Test failed');
    }
    
    contentArea.innerHTML = `
      <div style="padding:15px;">
        <div style="color:#4ade80;font-size:12px;margin-bottom:10px;">✅ JSON estruturado gerado:</div>
        <pre style="background:#0f172a;color:#e2e8f0;padding:15px;border-radius:6px;overflow:auto;font-size:12px;">${JSON.stringify(result.parsed, null, 2)}</pre>
        <div style="color:#64748b;font-size:11px;margin-top:10px;">Campos: ${Object.keys(result.parsed).join(', ')}</div>
      </div>`;
    console.log('✅ Structured JSON test completed!');
  }

  async function aiTextMarkdownRenderHandler() {
    console.log('🤖 Testing markdown render...');
    if (!aiTextTest || !aiTextTest.available) throw new Error('Plugin not available');
    const { contentArea } = createTestContainer('🤖 AI Text - Markdown Render', { id: 'test-ai-markdown', width: 600, height: 400 });
    contentArea.innerHTML = '<div style="color:#94a3b8;text-align:center;padding:20px;">⏳ Gerando com render markdown...</div>';
    
    const result = await aiTextTest.testMarkdownRender();
    if (!result?.success) {
      contentArea.innerHTML = `<div style="color:#ff6b6b;padding:10px;">❌ Erro: ${result?.error || 'Falha no teste'}</div>`;
      throw new Error(result?.error || 'Test failed');
    }
    
    // Exibe os chunks renderizados
    const chunksHTML = result.chunks.map((c, i) => `<div style="margin-bottom:5px;"><span style="color:#64748b;">[${i}]</span> ${c.html}</div>`).join('');
    
    contentArea.innerHTML = `
      <div style="padding:15px;">
        <div style="color:#4ade80;font-size:12px;margin-bottom:10px;">✅ Texto com formatação markdown (${result.chunkCount} chunks):</div>
        <div style="background:#0f172a;color:#e2e8f0;padding:15px;border-radius:6px;line-height:1.6;max-height:250px;overflow-y:auto;">${chunksHTML}</div>
        <div style="color:#64748b;font-size:11px;margin-top:10px;">Texto final: ${result.finalText.length} caracteres</div>
      </div>`;
    console.log('✅ Markdown render test completed!');
  }

  async function aiTextConcurrencyHandler() {
    console.log('🤖 Testing concurrency limits...');
    if (!aiTextTest || !aiTextTest.available) throw new Error('Plugin not available');
    const { contentArea } = createTestContainer('🤖 AI Text - Concurrency Limits', { id: 'test-ai-concurrency', width: 600, height: 400 });
    contentArea.innerHTML = '<div style="color:#94a3b8;text-align:center;padding:20px;">⏳ Testando concorrência (3 solicitações simultâneas)...</div>';
    
    const result = await aiTextTest.testConcurrencyLimits();
    if (!result?.success) {
      contentArea.innerHTML = `<div style="color:#ff6b6b;padding:10px;">❌ Erro: ${result?.error || 'Falha no teste'}</div>`;
      throw new Error(result?.error || 'Test failed');
    }
    
    const resultsHTML = result.results.map(r => 
      `<div style="margin-bottom:5px;color:${r.success ? '#4ade80' : '#ff6b6b'};">
        ${r.success ? '✅' : '❌'} Solicitação ${r.index + 1}: ${r.success ? r.text : r.error}
      </div>`
    ).join('');
    
    contentArea.innerHTML = `
      <div style="padding:15px;">
        <div style="color:#4ade80;font-size:12px;margin-bottom:10px;">✅ Teste de concorrência concluído:</div>
        <div style="background:#0f172a;color:#e2e8f0;padding:15px;border-radius:6px;font-size:12px;max-height:250px;overflow-y:auto;">
          <div style="margin-bottom:10px;color:#94a3b8;">Total: ${result.total} | Sucesso: ${result.successful} | Falha: ${result.total - result.successful}</div>
          ${resultsHTML}
        </div>
      </div>`;
    console.log('✅ Concurrency test completed!');
  }


  // Phase: AI Image Tests
  async function aiImageSingleHandler() {
    console.log('🖼️ Testing AI Image single generation...');
    if (!aiImageTest || !aiImageTest.available) throw new Error('Plugin not available');
    const { contentArea } = createTestContainer('🖼️ AI Image - Single Generation', { id: 'test-ai-image-single', width: 600, height: 500 });
    contentArea.innerHTML = '<div style="color:#94a3b8;text-align:center;padding:20px;">⏳ Generating single image...</div>';
    
    const result = await aiImageTest.testSingleGeneration(contentArea);
    if (!result?.success) {
      contentArea.innerHTML = `<div style="color:#ff6b6b;padding:10px;">❌ Error: ${result?.error || 'Test failed'}</div>`;
      throw new Error(result?.error || 'Test failed');
    }
    
    contentArea.innerHTML += `
      <div style="padding:15px;margin-top:15px;">
        <div style="color:#4ade80;font-size:12px;margin-bottom:10px;">✅ Single generation completed!</div>
        <div style="background:#0f172a;color:#e2e8f0;padding:15px;border-radius:6px;font-size:12px;">
          <div style="margin-bottom:8px;"><strong>Seed:</strong> ${result.data.seed}</div>
          <div style="margin-bottom:8px;"><strong>Generation Time:</strong> ${result.data.generationTime}ms</div>
          <div style="margin-bottom:8px;"><strong>Prompt Length:</strong> ${result.data.promptLength} chars</div>
          <div style="margin-bottom:8px;"><strong>DOM Element Found:</strong> ${result.data.domElementFound ? '✅' : '❌'}</div>
          <div><strong>Total Time:</strong> ${result.data.totalTime}ms</div>
        </div>
      </div>`;
    console.log('✅ AI Image single test completed!');
  }

  async function aiImageBatchHandler() {
    console.log('🖼️ Testing AI Image batch generation...');
    if (!aiImageTest || !aiImageTest.available) throw new Error('Plugin not available');
    const { contentArea } = createTestContainer('🖼️ AI Image - Batch Generation', { id: 'test-ai-image-batch', width: 600, height: 500 });
    contentArea.innerHTML = '<div style="color:#94a3b8;text-align:center;padding:20px;">⏳ Generating 2 images in batch...</div>';
    
    const result = await aiImageTest.testBatchGeneration(contentArea);
    if (!result?.success) {
      contentArea.innerHTML = `<div style="color:#ff6b6b;padding:10px;">❌ Error: ${result?.error || 'Test failed'}</div>`;
      throw new Error(result?.error || 'Test failed');
    }
    
    const seedsHTML = result.data.seeds.map((s, i) => `<div>Image ${i+1}: ${s}</div>`).join('');
    
    contentArea.innerHTML += `
      <div style="padding:15px;margin-top:15px;">
        <div style="color:#4ade80;font-size:12px;margin-bottom:10px;">✅ Batch generation completed!</div>
        <div style="background:#0f172a;color:#e2e8f0;padding:15px;border-radius:6px;font-size:12px;">
          <div style="margin-bottom:8px;"><strong>Count:</strong> ${result.data.count}</div>
          <div style="margin-bottom:8px;"><strong>onAllFinish Called:</strong> ${result.data.allFinishedCalled ? '✅' : '❌'}</div>
          <div style="margin-bottom:8px;"><strong>DOM Elements Found:</strong> ${result.data.domElementsFound}</div>
          <div style="margin-bottom:8px;"><strong>Total Time:</strong> ${result.data.totalTime}ms</div>
          <div style="margin-top:10px;padding-top:10px;border-top:1px solid #334155;">
            <strong>Seeds:</strong><br>${seedsHTML}
          </div>
        </div>
      </div>`;
    console.log('✅ AI Image batch test completed!');
  }

  async function aiImageProcessingHandler() {
    console.log('🖼️ Testing AI Image prompt processing...');
    if (!aiImageTest || !aiImageTest.available) throw new Error('Plugin not available');
    const { contentArea } = createTestContainer('🖼️ AI Image - Prompt Processing', { id: 'test-ai-image-processing', width: 600, height: 500 });
    contentArea.innerHTML = '<div style="color:#94a3b8;text-align:center;padding:20px;">⏳ Testing hooks and default tags...</div>';
    
    const result = await aiImageTest.testPromptProcessing(contentArea);
    if (!result?.success) {
      contentArea.innerHTML = `<div style="color:#ff6b6b;padding:10px;">❌ Error: ${result?.error || 'Test failed'}</div>`;
      throw new Error(result?.error || 'Test failed');
    }
    
    contentArea.innerHTML += `
      <div style="padding:15px;margin-top:15px;">
        <div style="color:#4ade80;font-size:12px;margin-bottom:10px;">✅ Prompt processing completed!</div>
        <div style="background:#0f172a;color:#e2e8f0;padding:15px;border-radius:6px;font-size:12px;">
          <div style="margin-bottom:8px;"><strong>preprocess Called:</strong> ${result.data.preprocessCalled ? '✅' : '❌'}</div>
          <div style="margin-bottom:8px;"><strong>postprocess Called:</strong> ${result.data.postprocessCalled ? '✅' : '❌'}</div>
          <div style="margin-bottom:8px;"><strong>Has Quality Tags:</strong> ${result.data.hasQualityTags ? '✅' : '❌'}</div>
          <div style="margin-bottom:8px;"><strong>Has Negative Prompt:</strong> ${result.data.hasNegativePrompt ? '✅' : '❌'}</div>
          <div style="margin-top:10px;padding-top:10px;border-top:1px solid #334155;">
            <strong>Final Prompt (preview):</strong><br>
            <div style="background:#1e293b;padding:8px;border-radius:4px;margin-top:5px;word-break:break-all;font-family:monospace;font-size:11px;">
              ${result.data.finalPrompt}
            </div>
          </div>
        </div>
      </div>`;
    console.log('✅ AI Image processing test completed!');
  }

  async function aiImageErrorsHandler() {
    console.log('🖼️ Testing AI Image error handling...');
    if (!aiImageTest || !aiImageTest.available) throw new Error('Plugin not available');
    const { contentArea } = createTestContainer('🖼️ AI Image - Error Handling', { id: 'test-ai-image-errors', width: 600, height: 400 });
    contentArea.innerHTML = '<div style="color:#94a3b8;text-align:center;padding:20px;">⏳ Testing error scenarios...</div>';
    
    const result = await aiImageTest.testErrorHandling();
    if (!result?.success) {
      contentArea.innerHTML = `<div style="color:#ff6b6b;padding:10px;">❌ Error: ${result?.error || 'Test failed'}</div>`;
      throw new Error(result?.error || 'Test failed');
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
    console.log('✅ AI Image error handling test completed!');
  }

  // Phase 1 & 2: AI Image Advanced Tests
  async function aiImagePlaintextContextHandler() {
    console.log('🖼️ Testing AI Image plaintext & context...');
    if (!aiImageTest || !aiImageTest.available) throw new Error('Plugin not available');
    const { contentArea } = createTestContainer('🖼️ AI Image - Plaintext & Context', { id: 'test-ai-image-plaintext', width: 600, height: 500 });
    contentArea.innerHTML = '<div style="color:#94a3b8;text-align:center;padding:20px;">⏳ Testing plaintext & context isolation...</div>';
    
    const result = await aiImageTest.testPlaintextAndContext(contentArea);
    if (!result?.success) {
      contentArea.innerHTML = `<div style="color:#ff6b6b;padding:10px;">❌ Error: ${result?.error || 'Test failed'}</div>`;
      throw new Error(result?.error || 'Test failed');
    }
    
    contentArea.innerHTML += `
      <div style="padding:15px;margin-top:15px;">
        <div style="color:#4ade80;font-size:12px;margin-bottom:10px;">✅ Plaintext & Context test completed!</div>
        <div style="background:#0f172a;color:#e2e8f0;padding:15px;border-radius:6px;font-size:12px;">
          <div style="margin-bottom:8px;"><strong>Plaintext Unresolved:</strong> ${result.data.plaintextUnresolved ? '✅' : '❌'}</div>
          <div style="margin-bottom:8px;"><strong>Context Prompt:</strong></div>
          <div style="background:#1e293b;padding:8px;border-radius:4px;font-family:monospace;font-size:11px;word-break:break-all;">${result.data.contextPrompt}</div>
        </div>
      </div>`;
    console.log('✅ AI Image plaintext & context test completed!');
  }

  async function aiImagePreprocessAllHandler() {
    console.log('🖼️ Testing AI Image preprocessAll hook...');
    if (!aiImageTest || !aiImageTest.available) throw new Error('Plugin not available');
    const { contentArea } = createTestContainer('🖼️ AI Image - preprocessAll Hook', { id: 'test-ai-image-preprocessall', width: 600, height: 500 });
    contentArea.innerHTML = '<div style="color:#94a3b8;text-align:center;padding:20px;">⏳ Testing preprocessAll hook...</div>';
    
    const result = await aiImageTest.testPreprocessAllHook(contentArea);
    if (!result?.success) {
      contentArea.innerHTML = `<div style="color:#ff6b6b;padding:10px;">❌ Error: ${result?.error || 'Test failed'}</div>`;
      throw new Error(result?.error || 'Test failed');
    }
    
    contentArea.innerHTML += `
      <div style="padding:15px;margin-top:15px;">
        <div style="color:#4ade80;font-size:12px;margin-bottom:10px;">✅ preprocessAll hook test completed!</div>
        <div style="background:#0f172a;color:#e2e8f0;padding:15px;border-radius:6px;font-size:12px;">
          <div style="margin-bottom:8px;"><strong>preprocessAll Calls:</strong> ${result.data.preprocessAllCallCount} (expected: 1)</div>
          <div style="margin-bottom:8px;"><strong>preprocess Calls:</strong> ${result.data.preprocessCallCount} (expected: 2)</div>
          <div style="margin-bottom:8px;"><strong>Modification Applied:</strong> ${result.data.modificationApplied ? '✅' : '❌'}</div>
        </div>
      </div>`;
    console.log('✅ AI Image preprocessAll hook test completed!');
  }

  async function aiImageHtmlWrappersHandler() {
    console.log('🖼️ Testing AI Image HTML wrappers...');
    if (!aiImageTest || !aiImageTest.available) throw new Error('Plugin not available');
    const { contentArea } = createTestContainer('🖼️ AI Image - HTML Wrappers', { id: 'test-ai-image-html', width: 600, height: 600 });
    contentArea.innerHTML = '<div style="color:#94a3b8;text-align:center;padding:20px;">⏳ Testing before/after/html hooks...</div>';
    
    const result = await aiImageTest.testHtmlWrappers(contentArea);
    if (!result?.success) {
      contentArea.innerHTML = `<div style="color:#ff6b6b;padding:10px;">❌ Error: ${result?.error || 'Test failed'}</div>`;
      throw new Error(result?.error || 'Test failed');
    }
    
    contentArea.innerHTML += `
      <div style="padding:15px;margin-top:15px;">
        <div style="color:#4ade80;font-size:12px;margin-bottom:10px;">✅ HTML wrappers test completed!</div>
        <div style="background:#0f172a;color:#e2e8f0;padding:15px;border-radius:6px;font-size:12px;">
          <div style="margin-bottom:8px;"><strong>before Called:</strong> ${result.data.beforeCalled ? '✅' : '❌'}</div>
          <div style="margin-bottom:8px;"><strong>after Called:</strong> ${result.data.afterCalled ? '✅' : '❌'}</div>
          <div style="margin-bottom:8px;"><strong>html Called:</strong> ${result.data.htmlCalled ? '✅' : '❌'}</div>
          <div style="margin-bottom:8px;"><strong>Before Element Found:</strong> ${result.data.beforeElementFound ? '✅' : '❌'}</div>
          <div style="margin-bottom:8px;"><strong>After Element Found:</strong> ${result.data.afterElementFound ? '✅' : '❌'}</div>
          <div><strong>Wrapper Element Found:</strong> ${result.data.wrapperElementFound ? '✅' : '❌'}</div>
        </div>
      </div>`;
    console.log('✅ AI Image HTML wrappers test completed!');
  }

  async function aiImageBatchHtmlWrappersHandler() {
    console.log('🖼️ Testing AI Image batch HTML wrappers...');
    if (!aiImageTest || !aiImageTest.available) throw new Error('Plugin not available');
    const { contentArea } = createTestContainer('🖼️ AI Image - Batch HTML Wrappers', { id: 'test-ai-image-batch-html', width: 600, height: 600 });
    contentArea.innerHTML = '<div style="color:#94a3b8;text-align:center;padding:20px;">⏳ Testing beforeAll/afterAll/htmlAll hooks...</div>';
    
    const result = await aiImageTest.testBatchHtmlWrappers(contentArea);
    if (!result?.success) {
      contentArea.innerHTML = `<div style="color:#ff6b6b;padding:10px;">❌ Error: ${result?.error || 'Test failed'}</div>`;
      throw new Error(result?.error || 'Test failed');
    }
    
    contentArea.innerHTML += `
      <div style="padding:15px;margin-top:15px;">
        <div style="color:#4ade80;font-size:12px;margin-bottom:10px;">✅ Batch HTML wrappers test completed!</div>
        <div style="background:#0f172a;color:#e2e8f0;padding:15px;border-radius:6px;font-size:12px;">
          <div style="margin-bottom:8px;"><strong>beforeAll Called:</strong> ${result.data.beforeAllCalled ? '✅' : '❌'}</div>
          <div style="margin-bottom:8px;"><strong>afterAll Called:</strong> ${result.data.afterAllCalled ? '✅' : '❌'}</div>
          <div style="margin-bottom:8px;"><strong>htmlAll Called:</strong> ${result.data.htmlAllCalled ? '✅' : '❌'}</div>
          <div style="margin-bottom:8px;"><strong>Header Element Found:</strong> ${result.data.headerElementFound ? '✅' : '❌'}</div>
          <div style="margin-bottom:8px;"><strong>Footer Element Found:</strong> ${result.data.footerElementFound ? '✅' : '❌'}</div>
          <div style="margin-bottom:8px;"><strong>Wrapper Element Found:</strong> ${result.data.wrapperElementFound ? '✅' : '❌'}</div>
          <div><strong>Images Generated:</strong> ${result.data.imagesGenerated}</div>
        </div>
      </div>`;
    console.log('✅ AI Image batch HTML wrappers test completed!');
  }


  async function imageHandler() {
    console.log('🖼️ Generating AI image...');
    if (!imageTest || !imageTest.available) throw new Error('Plugin not available');
    const result = await imageTest.testBasicImage();
    if (!result?.success) throw new Error(result?.error || 'Image generation failed');
    console.log('✅ Image generated!');
  }

  async function imageGuidanceHandler() {
    console.log('⚖️ Testing guidance scale...');
    if (!imageTest || !imageTest.available) throw new Error('Plugin not available');
    const result = await imageTest.testGuidanceScale();
    if (!result?.success) throw new Error(result?.error || 'Guidance scale test failed');
    console.log('✅ Guidance scale test completed!');
  }

  async function imageNegativeHandler() {
    console.log('🚫 Testing negative prompt...');
    if (!imageTest || !imageTest.available) throw new Error('Plugin not available');
    const result = await imageTest.testNegativePrompt();
    if (!result?.success) throw new Error(result?.error || 'Negative prompt test failed');
    console.log('✅ Negative prompt test completed!');
  }

  async function imageTriggerHandler() {
    console.log('🎭 Testing trigger words...');
    if (!imageTest || !imageTest.available) throw new Error('Plugin not available');
    const result = await imageTest.testTriggerWords();
    if (!result?.success) throw new Error(result?.error || 'Trigger words test failed');
    console.log('✅ Trigger words test completed!');
  }

  async function imageEmojiHandler() {
    console.log('😀 Testing emoji prompts...');
    if (!imageTest || !imageTest.available) throw new Error('Plugin not available');
    const result = await imageTest.testEmojiPrompts();
    if (!result?.success) throw new Error(result?.error || 'Emoji prompts test failed');
    console.log('✅ Emoji prompts test completed!');
  }

  async function imageOnFinishHandler() {
    console.log('📊 Testing onFinish callback...');
    if (!imageTest || !imageTest.available) throw new Error('Plugin not available');
    const result = await imageTest.testOnFinishCallback();
    if (!result?.success) throw new Error(result?.error || 'onFinish callback test failed');
    console.log('✅ onFinish callback test completed!');
  }
  async function imageTagEmphasisHandler() {
    console.log('🎯 Testing tag emphasis...');
    if (!imageTest || !imageTest.available) throw new Error('Plugin not available');
    const result = await imageTest.testTagEmphasis();
    if (!result?.success) throw new Error(result?.error || 'Tag emphasis test failed');
    console.log('✅ Tag emphasis test completed!');
  }

  async function imagePromptOrderingHandler() {
    console.log('🔀 Testing prompt ordering...');
    if (!imageTest || !imageTest.available) throw new Error('Plugin not available');
    const result = await imageTest.testPromptOrdering();
    if (!result?.success) throw new Error(result?.error || 'Prompt ordering test failed');
    console.log('✅ Prompt ordering test completed!');
  }

  async function imageCanvasPostProcessingHandler() {
    console.log('🎨 Testing canvas post-processing...');
    if (!imageTest || !imageTest.available) throw new Error('Plugin not available');
    const result = await imageTest.testCanvasPostProcessing();
    if (!result?.success) throw new Error(result?.error || 'Canvas post-processing test failed');
    console.log('✅ Canvas post-processing test completed!');
  }

  async function imageBreakKeywordHandler() {
    console.log('⚡ Testing BREAK keyword...');
    if (!imageTest || !imageTest.available) throw new Error('Plugin not available');
    const result = await imageTest.testBreakKeyword();
    if (!result?.success) throw new Error(result?.error || 'BREAK keyword test failed');
    console.log('✅ BREAK keyword test completed!');
  }






  // ===== HANDLERS FASE 3 =====
  async function imageTagBlendingHandler() {
    console.log('🎨 Testing tag blending...');
    if (!imageTest || !imageTest.available) throw new Error('Plugin not available');
    const { contentArea } = createTestContainer('🎨 Image Test - Tag Blending', { id: 'test-image-blending', width: 800, height: 600 });
    const result = await imageTest.testTagBlending(contentArea);
    if (!result?.success) throw new Error(result?.error || 'Tag blending test failed');
    console.log('✅ Tag blending test completed!');
  }

  async function imageMultiImageGridHandler() {
    console.log('🖼️ Testing multi-image grid...');
    if (!imageTest || !imageTest.available) throw new Error('Plugin not available');
    const { contentArea } = createTestContainer('🖼️ Image Test - Multi-Image Grid', { id: 'test-image-grid', width: 800, height: 600 });
    const result = await imageTest.testMultiImageGrid(contentArea);
    if (!result?.success) throw new Error(result?.error || 'Multi-image grid test failed');
    console.log('✅ Multi-image grid test completed!');
  }

  async function imageAlternatingTagsHandler() {
    console.log('🔄 Testing alternating tags...');
    if (!imageTest || !imageTest.available) throw new Error('Plugin not available');
    const { contentArea } = createTestContainer('🔄 Image Test - Alternating Tags', { id: 'test-image-alternating', width: 800, height: 600 });
    const result = await imageTest.testAlternatingTags(contentArea);
    if (!result?.success) throw new Error(result?.error || 'Alternating tags test failed');
    console.log('✅ Alternating tags test completed!');
  }

  async function imageAddRemoveDuringGenHandler() {
    console.log('➕ Testing add/remove during generation...');
    if (!imageTest || !imageTest.available) throw new Error('Plugin not available');
    const { contentArea } = createTestContainer('➕ Image Test - Add/Remove During Gen', { id: 'test-image-addremove', width: 800, height: 600 });
    const result = await imageTest.testAddRemoveDuringGen(contentArea);
    if (!result?.success) throw new Error(result?.error || 'Add/remove during generation test failed');
    console.log('✅ Add/remove during generation test completed!');
  }






  async function ttsHandler() {
    console.log('🔊 Testing Text-to-Speech...');
    if (!ttsTest || !ttsTest.available) throw new Error('Plugin not available');
    const { contentArea, container } = createTestContainer('🔊 TTS Test', { id: 'test-tts', width: 500, height: 350 });
    const testText = 'Olá! Este é um teste de síntese de voz no Perchance.';
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
    const playBtn = container.querySelector('#tts-play');
    const stopBtn = container.querySelector('#tts-stop');
    const status = container.querySelector('#tts-status');
    playBtn.addEventListener('click', () => {
      ttsTest.speakBasic(testText);
      status.textContent = '🔊 Falando...';
      status.style.color = '#4ade80';
    });
    stopBtn.addEventListener('click', () => {
      ttsTest.stopSpeech();
      status.textContent = '⏹ Parado';
      status.style.color = '#fbbf24';
    });
    console.log('✅ TTS container ready!');
  }

  async function cubeColorHandler() {
    console.log('🎲 Changing cube color...');
    if (!rendererData || !rendererData.cube || !rendererData.cube.material) throw new Error('Cube not available');
    rendererData.cube.material.color.setHex(Math.random() * 0xffffff);
    console.log('✅ Cube color changed!');
  }

  async function raycasterHandler() {
    console.log('🖱️ Raycaster: Click on spheres!');
    if (!raycasterTest || !raycasterTest.available) throw new Error('Raycaster not available');
    console.log(`✅ ${raycasterTest.spheres?.length || 0} spheres added`);
  }

  async function canvasHandler() {
    console.log('🎨 Testing Canvas 2D...');
    if (!canvasTest) throw new Error('Canvas not available');
    
    // Re-initialize if canvas was cleaned up (container was closed)
    if (!canvasTest.ctx) {
      console.log('🔄 [Canvas] Re-initializing canvas...');
      canvasTest.init(rendererData);
    }
    
    canvasTest.drawGradient();
    canvasTest.drawCircles(15);
    canvasTest.drawText('RPG Paper Craft', 256, 256);
    if (canvasTest.threeIntegration) canvasTest.showThreePlane();
    console.log('✅ Canvas drawn!');
  }

  async function rpgIconHandler() {
    console.log('⚔️ Loading RPG Icons...');
    if (!rpgIconTest || !rpgIconTest.available) throw new Error('Plugin not available');
    const icons = rpgIconTest.getMultipleIcons(6);
    if (!icons) throw new Error('Icon loading failed');
    console.log(`✅ ${icons.length} icons loaded!`);
  }

  async function listsHandler() {
    console.log('📋 Testing lists...');
    if (!listsTest) throw new Error('Lists not available');
    const item = listsTest.testSelectOne('itens');
    const heroes = listsTest.testSelectUnique('nomes_herois', 2);
    const length = listsTest.testListLength('nomes_herois');
    console.log(`✅ Item: "${item}" | Heroes: ${heroes.length} | Length: ${length}`);
  }

  async function bridgeHandler() {
    console.log(`📡 Seed: ${capturedSeed} | Root: ${capturedRoot}`);
  }

  async function stateSaveHandler() {
    console.log('💾 Saving state...');
    if (!stateTest) throw new Error('State not available');
    const state = stateTest.getDefaultState();
    state.player.name = 'Herói Testador';
    state.player.level = 5;
    state.world.bioma = 'floresta';
    if (!stateTest.save(state)) throw new Error('Save failed');
    console.log('✅ State saved!');
  }

  async function stateLoadHandler() {
    console.log('📂 Loading state...');
    if (!stateTest) throw new Error('State not available');
    const loaded = stateTest.load();
    if (!loaded) throw new Error('No save found');
    console.log(`✅ Loaded: ${loaded.player.name} Lv.${loaded.player.level}`);
  }

  async function kvHandler() {
    console.log('💾 Testing KV Plugin...');
    if (!kvTest || !kvTest.available) throw new Error('Plugin not available');
    const saved = await kvTest.setSimpleValue('test_key', 'test_value');
    if (!saved) throw new Error('KV save failed');
    const retrieved = await kvTest.getValue('test_key');
    console.log(`✅ KV: test_key = "${retrieved}"`);
  }

  async function chartBarHandler() {
    console.log('📊 Rendering Bar Chart...');
    if (!apexchartsTest) throw new Error('ApexCharts not available');
    const result = await apexchartsTest.renderBarChart();
    if (!result?.success) throw new Error('Chart render failed');
    console.log(`✅ Bar Chart: ${result.categories} categories`);
  }

  async function chartLineHandler() {
    console.log('📈 Rendering Line Chart...');
    if (!apexchartsTest) throw new Error('ApexCharts not available');
    const result = await apexchartsTest.renderLineChart();
    if (!result?.success) throw new Error('Chart render failed');
    console.log(`✅ Line Chart: ${result.points} points`);
  }

  async function chartPieHandler() {
    console.log('🍩 Rendering Donut Chart...');
    if (!apexchartsTest) throw new Error('ApexCharts not available');
    const result = await apexchartsTest.renderPieChart();
    if (!result?.success) throw new Error('Chart render failed');
    console.log(`✅ Donut Chart: ${result.slices} slices`);
  }

  async function chartRadarHandler() {
    console.log('🕸️ Rendering Radar Chart...');
    if (!apexchartsTest) throw new Error('ApexCharts not available');
    const result = await apexchartsTest.renderRadarChart();
    if (!result?.success) throw new Error('Chart render failed');
    console.log(`✅ Radar Chart: ${result.axes} axes`);
  }

  async function audioSFXHandler() {
    console.log('🔊 Testing SFX...');
    if (!audioTest) throw new Error('Audio not available');
    const result = audioTest.playSFX('click');
    if (!result) throw new Error('SFX failed');
    console.log('✅ SFX: click');
  }

  async function audioMusicHandler() {
    console.log('🎵 Testing music with loop...');
    if (!audioTest) throw new Error('Audio not available');
    const result = audioTest.playMusic('music');
    if (!result) throw new Error('Music failed');
    console.log('✅ Music started (loop)');
  }

  async function audioStopHandler() {
    console.log('🔇 Stopping all sounds...');
    if (!audioTest) throw new Error('Audio not available');
    const result = audioTest.stopAll();
    if (!result) throw new Error('Stop failed');
    console.log('✅ All sounds stopped');
  }

  async function audioSpriteHandler() {
    console.log('🎵 Testing audio sprite...');
    if (!audioTest) throw new Error('Audio not available');
    const result = audioTest.testSprite();
    if (!result) throw new Error('Sprite failed');
    console.log('✅ Sprite: middle (2-4s)');
  }

  async function audioVolumeHandler() {
    console.log('🔊 Testing volume...');
    if (!audioTest) throw new Error('Audio not available');
    const current = audioTest.getVolume();
    const newVolume = current > 0.5 ? 0.2 : 0.8;
    audioTest.setVolume(newVolume);
    console.log(`✅ Volume: ${(newVolume * 100).toFixed(0)}%`);
  }

  async function mermaidHandler() {
    console.log('📊 Testing Mermaid.js...');
    if (!mermaidTest) throw new Error('Mermaid not available');
    if (mermaidTest.isLoading && mermaidTest.isLoading()) {
      console.log('⏳ Mermaid still loading, waiting...');
      await mermaidTest.getMermaid();
    }
    let diagramContainer = document.getElementById('mermaid-diagrams');
    if (!diagramContainer) {
      diagramContainer = document.createElement('div');
      diagramContainer.id = 'mermaid-diagrams';
      diagramContainer.className = 'mermaid-container';
      const closeBtn = document.createElement('button');
      closeBtn.className = 'mermaid-close-btn';
      closeBtn.innerHTML = '✕';
      closeBtn.title = 'Close';
      closeBtn.onclick = () => {
        diagramContainer.remove();
        console.log('📊 Diagrams closed');
      };
      diagramContainer.appendChild(closeBtn);
      document.body.appendChild(diagramContainer);
    } else {
      diagramContainer.innerHTML = '';
    }
    const results = await mermaidTest.renderAllExamples(diagramContainer);
    const successCount = Object.values(results).filter(Boolean).length;
    const totalCount = Object.keys(results).length;
    console.log(`✅ Mermaid: ${successCount}/${totalCount} diagrams rendered`);
  }

  async function matterHandler() {
    console.log('⚛️ Testing Matter.js...');
    if (!matterTest) throw new Error('Matter not available');
    if (matterTest.isLoading && matterTest.isLoading()) {
      console.log('⏳ Matter.js still loading, waiting...');
      await matterTest.getMatter();
    }
    await matterTest.initPhysics();
    console.log('✅ Matter.js: Physics simulation initialized');
  }

  async function cannonHandler() {
    console.log('💣 Testing Cannon-es...');
    if (!cannonTest) throw new Error('Cannon-es not available');
    if (cannonTest.isLoading && cannonTest.isLoading()) {
      console.log('⏳ Cannon-es still loading, waiting...');
    }
    await cannonTest.initPhysics3D();
    console.log('✅ Cannon-es: 3D Physics simulation initialized');
  }

  async function particlesHandler() {
    console.log('✨ Testing Particles...');
    if (!particlesTest) throw new Error('Particles not available');
    if (!rendererData || !rendererData.scene) throw new Error('Scene not available');
    
    // Toggle particles on/off using isActive()
    if (particlesTest.isActive && particlesTest.isActive()) {
      particlesTest.dispose();
      console.log('🗑️ Particles: System disposed');
      return;
    }
    
    particlesTest.init(rendererData);
    console.log('✅ Particles: 50,000 particles rendered');
  }






  async function indexeddbPrimitivesHandler() {
    console.log('🗃️ Testing IndexedDB primitives...');
    if (!indexeddbTest || !indexeddbTest.available) throw new Error('IndexedDB not available');
    const { contentArea } = createTestContainer('🗃️ IndexedDB - Primitive Types', { id: 'test-indexeddb', width: 700, height: 500 });
    contentArea.innerHTML = '<div style="color:#94a3b8;text-align:center;padding:20px;">⏳ Running test suite...</div>';
    const result = await indexeddbTest.runPrimitiveTestSuite();
    const rows = result.roundTrips.map(r => {
      const savedStr = JSON.stringify(r.saved).substring(0, 40);
      const retrievedStr = JSON.stringify(r.retrieved).substring(0, 40);
      return `<tr>
        <td style="color:#fbbf24;padding:6px;border-bottom:1px solid #333;">${r.key}</td>
        <td style="color:#94a3b8;padding:6px;border-bottom:1px solid #333;">${r.expected}</td>
        <td style="color:#e2e8f0;padding:6px;border-bottom:1px solid #333;font-size:11px;max-width:150px;overflow:hidden;text-overflow:ellipsis;">${savedStr}</td>
        <td style="color:#e2e8f0;padding:6px;border-bottom:1px solid #333;font-size:11px;max-width:150px;overflow:hidden;text-overflow:ellipsis;">${retrievedStr}</td>
        <td style="padding:6px;border-bottom:1px solid #333;text-align:center;">${r.match ? '✅' : '❌'}</td>
      </tr>`;
    }).join('');
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
            <span style="color:#94a3b8;">Quota:</span> <span style="color:#e2e8f0;">${result.storageEstimate.quota || 'N/A'}</span>
          </div>
          <div style="padding:8px;background:#1e293b;border-radius:4px;font-size:11px;">
            <span style="color:#94a3b8;">Usage:</span> <span style="color:#e2e8f0;">${result.storageEstimate.usage || 'N/A'}</span>
          </div>
        </div>
      </div>`;
    console.log(`✅ IndexedDB: ${result.totalKeys} types saved, ${result.keysAfterDelete} after delete`);
  }

  async function indexeddbAIHandler() {
    console.log('🤖 Generating AI + saving to IndexedDB...');
    if (!indexeddbTest || !indexeddbTest.available) throw new Error('IndexedDB not available');
    if (!aiTextTest || !aiTextTest.available) throw new Error('AI Text not available');
    if (!imageTest || !imageTest.available) throw new Error('Image not available');
    const { contentArea } = createTestContainer('🤖 IndexedDB - AI Results', { id: 'test-indexeddb-ai', width: 700, height: 600 });
    contentArea.innerHTML = '<div style="color:#94a3b8;text-align:center;padding:20px;">⏳ Generating 3 texts + 3 images and saving to IndexedDB...</div>';
    await indexeddbTest.openDB();
    await indexeddbTest.clearAIResults();
    const texts = [];
    const prompts = [
      'Write a short phrase about a brave knight.',
      'Describe a mysterious forest in one sentence.',
      'Write a riddle about a dragon.'
    ];
    for (const p of prompts) {
      const r = await aiTextTest.generateBasic(p);
      if (r?.success) texts.push({ text: r.text, metadata: { prompt: p } });
    }
    const images = [];
    const imgPrompts = ['papercraft warrior', 'papercraft wizard', 'papercraft dragon'];
    for (const p of imgPrompts) {
      const r = await imageTest.testBasicImage();
      if (r?.success && r.url) images.push({ dataUrl: r.url, metadata: { prompt: p } });
      if (images.length >= 3) break;
    }
    await indexeddbTest.saveAIBatch(texts, images);
    const loaded = await indexeddbTest.loadAIResults();
    const count = await indexeddbTest.getAIResultsCount();
    const textHtml = loaded.filter(r => r.type === 'text').map(r =>
      `<div style="padding:8px;background:#0f172a;border-radius:4px;margin-bottom:8px;border-left:3px solid #4ade80;">
        <div style="color:#e2e8f0;font-size:12px;">${r.content}</div>
        <div style="color:#64748b;font-size:10px;margin-top:4px;">${r.metadata.chars} chars | ${new Date(r.timestamp).toLocaleTimeString()}</div>
      </div>`
    ).join('');
    const imgHtml = loaded.filter(r => r.type === 'image').map(r =>
      `<div style="display:inline-block;margin:4px;">
        <img src="${r.content}" style="width:100px;height:100px;object-fit:cover;border-radius:4px;border:1px solid #404040;" />
        <div style="color:#64748b;font-size:9px;text-align:center;">${r.metadata.sizeKB}KB</div>
      </div>`
    ).join('');
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
    console.log('📂 Loading saved AI results from IndexedDB...');
    if (!indexeddbTest || !indexeddbTest.available) throw new Error('IndexedDB not available');
    const { contentArea } = createTestContainer('📂 IndexedDB - Load Saved', { id: 'test-indexeddb-load', width: 700, height: 500 });
    await indexeddbTest.openDB();
    const loaded = await indexeddbTest.loadAIResults();
    const count = await indexeddbTest.getAIResultsCount();
    if (loaded.length === 0) {
      contentArea.innerHTML = '<div style="color:#fbbf24;text-align:center;padding:20px;">⚠️ No saved results. Run "Generate AI + Save" first.</div>';
      return;
    }
    const textHtml = loaded.filter(r => r.type === 'text').map(r =>
      `<div style="padding:8px;background:#0f172a;border-radius:4px;margin-bottom:8px;border-left:3px solid #4ade80;">
        <div style="color:#e2e8f0;font-size:12px;">${r.content}</div>
        <div style="color:#64748b;font-size:10px;margin-top:4px;">${r.metadata.chars} chars | ${new Date(r.timestamp).toLocaleTimeString()}</div>
      </div>`
    ).join('');
    const imgHtml = loaded.filter(r => r.type === 'image').map(r =>
      `<div style="display:inline-block;margin:4px;">
        <img src="${r.content}" style="width:120px;height:120px;object-fit:cover;border-radius:4px;border:1px solid #404040;" />
        <div style="color:#64748b;font-size:9px;text-align:center;">${r.metadata.sizeKB}KB</div>
      </div>`
    ).join('');
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
    console.log('🗑️ Clearing all IndexedDB test data...');
    if (!indexeddbTest || !indexeddbTest.available) throw new Error('IndexedDB not available');
    await indexeddbTest.deleteDB();
    console.log('✅ IndexedDB: All data cleared');
  }

  async function cellularAutomataHandler() {
    console.log('\\ud83e\\uddec Testing Cellular Automata...');
    if (!cellularAutomataTest) throw new Error('Cellular Automata not available');
    
    // Toggle on/off
    if (cellularAutomataTest.running) {
      cellularAutomataTest.cleanup();
      console.log('\\uddd1\\ufe0f Cellular Automata: Disposed');
      return;
    }
    
    cellularAutomataTest.init(rendererData);
    console.log('✅ Cellular Automata: 128x128 grid initialized');
  }

  async function gsapBasicHandler() {
    console.log('🎬 Testing GSAP Basic Tween...');
    if (!gsapTest) throw new Error('GSAP not available');
    if (gsapTest.isLoading && gsapTest.isLoading()) {
      console.log('⏳ GSAP still loading, waiting...');
      await gsapTest.getGsap();
    }
    await gsapTest.testBasicTween();
  }

  async function gsapFromHandler() {
    console.log('🎬 Testing GSAP From Tween...');
    if (!gsapTest) throw new Error('GSAP not available');
    await gsapTest.testFromTween();
  }

  async function gsapTimelineHandler() {
    console.log('🎬 Testing GSAP Timeline...');
    if (!gsapTest) throw new Error('GSAP not available');
    await gsapTest.testTimeline();
  }

  async function gsapStaggerHandler() {
    console.log('🎬 Testing GSAP Stagger...');
    if (!gsapTest) throw new Error('GSAP not available');
    await gsapTest.testStagger();
  }

  async function gsapEasingHandler() {
    console.log('🎬 Testing GSAP Easing...');
    if (!gsapTest) throw new Error('GSAP not available');
    await gsapTest.testEasing();
  }

  async function gsapCleanupHandler() {
    console.log('🧹 GSAP Cleanup...');
    if (!gsapTest) throw new Error('GSAP not available');
    gsapTest.cleanup();
  }






  async function typewriterHandler() {
    console.log('⌨️ Testing Typewriter + AI streaming integration...');
    if (!typewriterTest || !typewriterTest.available) throw new Error('Typewriter test not available');
    const { contentArea } = createTestContainer('⌨️ Typewriter + AI Streaming', { id: 'test-typewriter', width: 600, height: 500 });
    
    // Create display for streaming with typewriter effect
    contentArea.innerHTML = `
      <div style="padding: 15px;">
        <div style="margin-bottom: 10px; color: #94a3b8; font-size: 12px;">
          📡 Streaming IA com efeito typewriter (30 caracteres/segundo):
        </div>
        <div id="typewriter-display" style="
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
        <div id="typewriter-status" style="margin-top: 10px; color: #64748b; font-size: 11px; text-align: center;">
          ⏳ Aguardando início...
        </div>
      </div>
    `;
    
    const typewriterDisplay = document.getElementById('typewriter-display');
    const typewriterStatus = document.getElementById('typewriter-status');
    
    typewriterStatus.textContent = '⏳ Gerando texto com IA e aplicando typewriter...';
    
    const result = await typewriterTest.testTypewriterIntegration(typewriterDisplay, {
      charsPerSecond: 30,
      prompt: 'Escreva uma frase curta sobre um aventureiro em uma floresta mágica.'
    });
    
    if (!result?.success) {
      contentArea.innerHTML = `<div style="color:#ff6b6b;padding:10px;">❌ Erro: ${result?.error || 'Falha no teste'}</div>`;
      throw new Error(result?.error || 'Test failed');
    }
    
    typewriterStatus.innerHTML = `✅ <span style="color:#4ade80;">${result.totalChunks} chunks recebidos</span> | <span style="color:#94a3b8;">${result.totalChars} caracteres digitados</span> | <span style="color:#f59e0b;">${result.charsPerSecond} chars/s</span>`;
    console.log('✅ Typewriter integration test completed!');
  }

  async function terrain3DHandler() {
    console.log('🏔️ Testing 3D Layered Terrain...');
    if (!terrain3DTest || !terrain3DTest.available) throw new Error('3D Terrain test not available');
    const { contentArea } = createTestContainer('🏔️ 3D Layered Terrain', { id: 'test-terrain-3d', width: 800, height: 600 });
    
    contentArea.innerHTML = '<div style="color:#94a3b8;text-align:center;padding:20px;">⏳ Inicializando cena Three.js e gerando terreno...</div>';
    
    const result = await terrain3DTest.initializeTerrain(contentArea);
    
    if (!result?.success) {
      contentArea.innerHTML = `<div style="color:#ff6b6b;padding:10px;">❌ Erro: ${result?.error || 'Falha na inicialização'}</div>`;
      throw new Error(result?.error || 'Terrain initialization failed');
    }
    
    contentArea.innerHTML += `
      <div style="padding:10px;margin-top:10px;">
        <div style="color:#4ade80;font-size:12px;">✅ Terreno 10x10 renderizado com sucesso!</div>
        <div style="color:#64748b;font-size:11px;margin-top:5px;">Câmera isométrica | 6 níveis de altura | Paleta de cores por camada</div>
      </div>`;
    console.log('✅ 3D Terrain test completed!');
  }

  const panel = document.createElement('div');
  panel.id = 'ui-test-panel';

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
      <button id="btn-typewriter" class="ui-test-btn ui-test-btn--ai">⌨️ Typewriter</button>
      <button id="btn-tts" class="ui-test-btn ui-test-btn--ai">🔊 TTS</button>
    </div>
    
    <div class="ui-test-category">
      <strong style="color:#f472b6">🖼️ Advanced AI Image Plugin</strong>
      <button id="btn-ai-image-single" class="ui-test-btn ui-test-btn--ai">🖼️ Single</button>
      <button id="btn-ai-image-batch" class="ui-test-btn ui-test-btn--ai">🖼️ Batch</button>
      <button id="btn-ai-image-processing" class="ui-test-btn ui-test-btn--ai">⚙️ Processing</button>
      <button id="btn-ai-image-errors" class="ui-test-btn ui-test-btn--ai">⚠️ Errors</button>
      <button id="btn-ai-image-plaintext" class="ui-test-btn ui-test-btn--ai">🔒 Plaintext</button>
      <button id="btn-ai-image-preprocessall" class="ui-test-btn ui-test-btn--ai">🔧 preprocessAll</button>
      <button id="btn-ai-image-html" class="ui-test-btn ui-test-btn--ai">🎨 HTML</button>
      <button id="btn-ai-image-batch-html" class="ui-test-btn ui-test-btn--ai">📦 Batch HTML</button>
    </div>
    
    <div class="ui-test-category">
      <strong style="color:#a78bfa">🖼️ Image Generation Tests</strong>
      <button id="btn-image" class="ui-test-btn ui-test-btn--ai">🖼️ Image</button>
      <button id="btn-image-guidance" class="ui-test-btn ui-test-btn--ai">⚖️ CFG Scale</button>
      <button id="btn-image-negative" class="ui-test-btn ui-test-btn--ai">🚫 Negative</button>
      <button id="btn-image-trigger" class="ui-test-btn ui-test-btn--ai">🎭 Triggers</button>
      <button id="btn-image-emoji" class="ui-test-btn ui-test-btn--ai">😀 Emoji</button>
      <button id="btn-image-onfinish" class="ui-test-btn ui-test-btn--ai">📊 Callback</button>
      <button id="btn-image-emphasis" class="ui-test-btn ui-test-btn--ai">🎯 Emphasis</button>
      <button id="btn-image-ordering" class="ui-test-btn ui-test-btn--ai">🔄 Ordering</button>
      <button id="btn-image-canvas" class="ui-test-btn ui-test-btn--ai">🎨 Canvas</button>
      <button id="btn-image-break" class="ui-test-btn ui-test-btn--ai">⚡ BREAK</button>
      <button id="btn-image-blending" class="ui-test-btn ui-test-btn--ai">🎨 Blending</button>
      <button id="btn-image-grid" class="ui-test-btn ui-test-btn--ai">🖼️ Grid</button>
      <button id="btn-image-alternating" class="ui-test-btn ui-test-btn--ai">🔄 Alternating</button>
      <button id="btn-image-addremove" class="ui-test-btn ui-test-btn--ai">➕ Add/Remove</button>
    </div>
    
    <div class="ui-test-category">
      <strong style="color:var(--ui-color-render)">🎨 Rendering</strong>
      <button id="btn-3d" class="ui-test-btn ui-test-btn--render">🎲 Cube Color</button>
      <button id="btn-raycaster" class="ui-test-btn ui-test-btn--render">🖱️ Raycaster</button>
      <button id="btn-canvas" class="ui-test-btn ui-test-btn--render">🎨 Canvas</button>
      <button id="btn-rpg-icon" class="ui-test-btn ui-test-btn--render">⚔️ RPG Icons</button>
      <button id="btn-particles" class="ui-test-btn ui-test-btn--render">✨ Particles</button>
      <button id="btn-cellular-automata" class="ui-test-btn ui-test-btn--render">\\ud83e\\uddec Cellular Automata</button>
      <button id="btn-terrain-3d" class="ui-test-btn ui-test-btn--render">🏔️ 3D Terrain</button>
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

  // Render How It Works Accordion
  const howContainer = document.getElementById('how-it-works-container');
  if (howContainer) {
    HOW_IT_WORKS_DATA.forEach(item => {
      const details = document.createElement('details');
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
    // Accordion behavior: only one open at a time
    howContainer.addEventListener('toggle', (e) => {
      if (e.target.open) {
        howContainer.querySelectorAll('details').forEach(d => {
          if (d !== e.target) d.open = false;
        });
      }
    });
  }

  console.log('📎 [UI-Test] Panel attached to document.body');

  const rect = panel.getBoundingClientRect();
  console.log(`📐 [UI-Test] Panel visible: ${rect.width}x${rect.height}px at (${rect.left}, ${rect.top})`);

  // Global controls
  document.getElementById('btn-run-all').onclick = () => runAllTests(testDefs);

  // Individual test handlers
  document.getElementById('btn-dice').onclick = () => runTest('btn-dice', 'Dice', diceHandler);
  document.getElementById('btn-seeder').onclick = () => runTest('btn-seeder', 'Seeder', seederHandler);
  document.getElementById('btn-pattern').onclick = () => runTest('btn-pattern', 'Pattern', patternHandler);
  document.getElementById('btn-ai-text').onclick = () => runTest('btn-ai-text', 'AI Text', aiTextHandler);
  document.getElementById('btn-ai-startwith').onclick = () => runTest('btn-ai-startwith', 'AI Text - startWith', aiTextStartWithHandler);
  document.getElementById('btn-ai-stop').onclick = () => runTest('btn-ai-stop', 'AI Text - stopSequences', aiTextStopSequencesHandler);
  document.getElementById('btn-ai-style').onclick = () => runTest('btn-ai-style', 'AI Text - style & outputTo', aiTextStyleOutputHandler);
  document.getElementById('btn-ai-endbuttons').onclick = () => runTest('btn-ai-endbuttons', 'AI Text - endButtons', aiTextEndButtonsHandler);
  document.getElementById('btn-ai-onchunk').onclick = () => runTest('btn-ai-onchunk', 'AI Text - onChunk', aiTextOnChunkHandler);
  document.getElementById('btn-ai-onfinish').onclick = () => runTest('btn-ai-onfinish', 'AI Text - onFinish', aiTextOnFinishHandler);
  document.getElementById('btn-ai-dynamic').onclick = () => runTest('btn-ai-dynamic', 'AI Text - Dynamic', aiTextDynamicHandler);
  document.getElementById('btn-ai-render').onclick = () => runTest('btn-ai-render', 'AI Text - Render', aiTextRenderHandler);
  document.getElementById('btn-ai-json').onclick = () => runTest('btn-ai-json', 'AI Text - JSON', aiTextStructuredJSONHandler);
  document.getElementById('btn-ai-markdown').onclick = () => runTest('btn-ai-markdown', 'AI Text - Markdown', aiTextMarkdownRenderHandler);
  document.getElementById('btn-ai-concurrency').onclick = () => runTest('btn-ai-concurrency', 'AI Text - Concurrency', aiTextConcurrencyHandler);
  document.getElementById('btn-ai-image-single').onclick = () => runTest('btn-ai-image-single', 'AI Image - Single', aiImageSingleHandler);
  document.getElementById('btn-ai-image-batch').onclick = () => runTest('btn-ai-image-batch', 'AI Image - Batch', aiImageBatchHandler);
  document.getElementById('btn-ai-image-processing').onclick = () => runTest('btn-ai-image-processing', 'AI Image - Processing', aiImageProcessingHandler);
  document.getElementById('btn-ai-image-errors').onclick = () => runTest('btn-ai-image-errors', 'AI Image - Errors', aiImageErrorsHandler);
  document.getElementById('btn-ai-image-plaintext').onclick = () => runTest('btn-ai-image-plaintext', 'AI Image - Plaintext/Context', aiImagePlaintextContextHandler);
  document.getElementById('btn-ai-image-preprocessall').onclick = () => runTest('btn-ai-image-preprocessall', 'AI Image - preprocessAll', aiImagePreprocessAllHandler);
  document.getElementById('btn-ai-image-html').onclick = () => runTest('btn-ai-image-html', 'AI Image - HTML Wrappers', aiImageHtmlWrappersHandler);
  document.getElementById('btn-ai-image-batch-html').onclick = () => runTest('btn-ai-image-batch-html', 'AI Image - Batch HTML', aiImageBatchHtmlWrappersHandler);
  document.getElementById('btn-image').onclick = () => runTest('btn-image', 'Image', imageHandler);
  document.getElementById('btn-image-guidance').onclick = () => runTest('btn-image-guidance', 'CFG Scale', imageGuidanceHandler);
  document.getElementById('btn-image-negative').onclick = () => runTest('btn-image-negative', 'Negative Prompt', imageNegativeHandler);
  document.getElementById('btn-image-trigger').onclick = () => runTest('btn-image-trigger', 'Trigger Words', imageTriggerHandler);
  document.getElementById('btn-image-emoji').onclick = () => runTest('btn-image-emoji', 'Emoji Prompts', imageEmojiHandler);
  document.getElementById('btn-image-onfinish').onclick = () => runTest('btn-image-onfinish', 'onFinish Callback', imageOnFinishHandler);
  document.getElementById('btn-image-emphasis').onclick = () => runTest('btn-image-emphasis', 'Tag Emphasis', imageTagEmphasisHandler);
  document.getElementById('btn-image-ordering').onclick = () => runTest('btn-image-ordering', 'Prompt Ordering', imagePromptOrderingHandler);
  document.getElementById('btn-image-canvas').onclick = () => runTest('btn-image-canvas', 'Canvas Post-Processing', imageCanvasPostProcessingHandler);
  document.getElementById('btn-image-break').onclick = () => runTest('btn-image-break', 'BREAK Keyword', imageBreakKeywordHandler);
  document.getElementById('btn-image-blending').onclick = () => runTest('btn-image-blending', 'Tag Blending', imageTagBlendingHandler);
  document.getElementById('btn-image-grid').onclick = () => runTest('btn-image-grid', 'Multi-Image Grid', imageMultiImageGridHandler);
  document.getElementById('btn-image-alternating').onclick = () => runTest('btn-image-alternating', 'Alternating Tags', imageAlternatingTagsHandler);
  document.getElementById('btn-image-addremove').onclick = () => runTest('btn-image-addremove', 'Add/Remove During Gen', imageAddRemoveDuringGenHandler);
  document.getElementById('btn-tts').onclick = () => runTest('btn-tts', 'TTS', ttsHandler);
  document.getElementById('btn-3d').onclick = () => runTest('btn-3d', 'Cube Color', cubeColorHandler);
  document.getElementById('btn-raycaster').onclick = () => runTest('btn-raycaster', 'Raycaster', raycasterHandler);
  document.getElementById('btn-canvas').onclick = () => runTest('btn-canvas', 'Canvas', canvasHandler);
  document.getElementById('btn-rpg-icon').onclick = () => runTest('btn-rpg-icon', 'RPG Icons', rpgIconHandler);
  document.getElementById('btn-lists').onclick = () => runTest('btn-lists', 'Lists', listsHandler);
  document.getElementById('btn-bridge').onclick = () => runTest('btn-bridge', 'Bridge', bridgeHandler);
  document.getElementById('btn-state-save').onclick = () => runTest('btn-state-save', 'Save', stateSaveHandler);
  document.getElementById('btn-state-load').onclick = () => runTest('btn-state-load', 'Load', stateLoadHandler);
  document.getElementById('btn-kv').onclick = () => runTest('btn-kv', 'KV', kvHandler);
  document.getElementById('btn-indexeddb-types').onclick = () => runTest('btn-indexeddb-types', 'IndexedDB Types', indexeddbPrimitivesHandler);
  document.getElementById('btn-indexeddb-ai').onclick = () => runTest('btn-indexeddb-ai', 'IndexedDB AI', indexeddbAIHandler);
  document.getElementById('btn-indexeddb-load').onclick = () => runTest('btn-indexeddb-load', 'IndexedDB Load', indexeddbLoadHandler);
  document.getElementById('btn-indexeddb-clear').onclick = () => runTest('btn-indexeddb-clear', 'IndexedDB Clear', indexeddbClearHandler);
  document.getElementById('btn-chart-bar').onclick = () => runTest('btn-chart-bar', 'Bar Chart', chartBarHandler);
  document.getElementById('btn-chart-line').onclick = () => runTest('btn-chart-line', 'Line Chart', chartLineHandler);
  document.getElementById('btn-chart-pie').onclick = () => runTest('btn-chart-pie', 'Pie Chart', chartPieHandler);
  document.getElementById('btn-chart-radar').onclick = () => runTest('btn-chart-radar', 'Radar Chart', chartRadarHandler);
  document.getElementById('btn-audio-sfx').onclick = () => runTest('btn-audio-sfx', 'Audio SFX', audioSFXHandler);
  document.getElementById('btn-audio-music').onclick = () => runTest('btn-audio-music', 'Audio Music', audioMusicHandler);
  document.getElementById('btn-audio-sprite').onclick = () => runTest('btn-audio-sprite', 'Audio Sprite', audioSpriteHandler);
  document.getElementById('btn-audio-volume').onclick = () => runTest('btn-audio-volume', 'Audio Volume', audioVolumeHandler);
  document.getElementById('btn-audio-stop').onclick = () => runTest('btn-audio-stop', 'Audio Stop', audioStopHandler);
  document.getElementById('btn-mermaid').onclick = () => runTest('btn-mermaid', 'Mermaid', mermaidHandler);
  document.getElementById('btn-matter').onclick = () => runTest('btn-matter', 'Matter.js', matterHandler);
  document.getElementById('btn-cannon').onclick = () => runTest('btn-cannon', 'Cannon-es', cannonHandler);
  document.getElementById('btn-particles').onclick = () => runTest('btn-particles', 'Particles', particlesHandler);
  document.getElementById('btn-cellular-automata').onclick = () => runTest('btn-cellular-automata', 'Cellular Automata', cellularAutomataHandler);
  document.getElementById('btn-terrain-3d').onclick = () => runTest('btn-terrain-3d', '3D Terrain', terrain3DHandler);
  document.getElementById('btn-gsap-basic').onclick = () => runTest('btn-gsap-basic', 'GSAP Tween', gsapBasicHandler);
  document.getElementById('btn-gsap-from').onclick = () => runTest('btn-gsap-from', 'GSAP From', gsapFromHandler);
  document.getElementById('btn-gsap-timeline').onclick = () => runTest('btn-gsap-timeline', 'GSAP Timeline', gsapTimelineHandler);
  document.getElementById('btn-gsap-stagger').onclick = () => runTest('btn-gsap-stagger', 'GSAP Stagger', gsapStaggerHandler);
  document.getElementById('btn-gsap-easing').onclick = () => runTest('btn-gsap-easing', 'GSAP Easing', gsapEasingHandler);
  document.getElementById('btn-gsap-cleanup').onclick = () => runTest('btn-gsap-cleanup', 'GSAP Cleanup', gsapCleanupHandler);
  document.getElementById('btn-typewriter').onclick = () => runTest('btn-typewriter', 'Typewriter', typewriterHandler);

  console.log(`✅ [UI-Test] Test panel ${VERSION} created with global controls.`);
}