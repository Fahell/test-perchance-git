import * as THREE from 'https://esm.sh/three@0.160.0';

export function initRenderer(container) {
  console.log('🎨 [Renderer] Inicializando Three.js...');

  // 🗑️ Remove mensagem de loading
  const loadingEl = document.getElementById('loading-message');
  if (loadingEl) {
    loadingEl.remove();
    console.log('🗑️ [Renderer] Mensagem de loading removida.');
  }

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

  // Anexa ao body para evitar overflow:hidden do container
  document.body.appendChild(renderer.domElement);

  // Cubo de teste girando
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshNormalMaterial();
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
