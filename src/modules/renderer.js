import * as THREE from 'https://esm.sh/three@0.160.0';

export function initRenderer(container) {
  console.log('🎨 [Renderer] Inicializando Three.js...');

  // 🛡️ Verifica se já existe um canvas Three.js (evita criar duplicado em re-execuções)
  const existingCanvas = document.querySelector('canvas[data-threejs="true"]');
  if (existingCanvas) {
    console.log('⚠️ [Renderer] Canvas Three.js já existe. Reutilizando...');
    // Retorna um objeto vazio mas funcional
    return { scene: null, camera: null, renderer: null, cube: null };
  }

  // 🎨 Cria mensagem de loading via JS (evita reaparecer em re-renderizações)
  const loadingEl = document.createElement('div');
  loadingEl.id = 'loading-message';
  loadingEl.style.cssText = `
    position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
    background: rgba(30, 30, 50, 0.95); border: 2px solid #4ade80;
    border-radius: 12px; padding: 24px 40px; text-align: center;
    z-index: 2000; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    color: #e2e8f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;
  loadingEl.innerHTML = '🎮 Carregando módulos...<br><small style="display:block;margin-top:8px;color:#94a3b8;font-size:13px">Aguarde enquanto inicializamos o jogo modular</small>';
  document.body.appendChild(loadingEl);

  // 🗑️ Remove mensagem de loading após 100ms (dá tempo de ver, mas não atrapalha)
  setTimeout(() => {
    const existingLoading = document.getElementById('loading-message');
    if (existingLoading) {
      existingLoading.remove();
      console.log('🗑️ [Renderer] Mensagem de loading removida (por ID).');
    }
  }, 100);
  
  // Fallback: remove qualquer elemento com texto "Carregando"
  document.querySelectorAll('div').forEach(el => {
    if (el.textContent?.includes('Carregando módulos')) {
      el.remove();
      console.log('🗑️ [Renderer] Mensagem de loading removida (por texto).');
    }
  });
  
  // Fallback agressivo: remove TODOS os elementos com z-index alto que não são nossos
  document.querySelectorAll('[style*="z-index: 2000"]').forEach(el => {
    if (el.id !== 'ui-test-panel') {
      el.remove();
      console.log('🗑️ [Renderer] Elemento com z-index alto removido.');
    }
  });

  // 🖼️ Setup Three.js
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x202025);

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  
  // ⚠️ Configuração crítica para z-index e posicionamento
  renderer.domElement.style.position = 'fixed';
  renderer.domElement.style.top = '0';
  renderer.domElement.style.left = '0';
  renderer.domElement.style.zIndex = '10'; 
  renderer.domElement.style.pointerEvents = 'auto';
  
  // 🔖 Marca o canvas para identificação em re-execuções
  renderer.domElement.setAttribute('data-threejs', 'true');

  // Anexa ao body para evitar overflow:hidden do container
  document.body.appendChild(renderer.domElement);

  // 💡 Iluminação (necessária para MeshStandardMaterial)
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);

  // Cubo de teste girando (com material que permite mudar cor)
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshStandardMaterial({ color: 0x3b82f6 }); // Azul inicial
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  // Loop de animação
  const animate = () => {
    requestAnimationFrame(animate);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
  };
  animate();

  console.log('🎨 [Renderer] Three.js inicializado com sucesso!');
  return { scene, camera, renderer, cube };
}
