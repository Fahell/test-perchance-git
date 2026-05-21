import * as THREE from 'https://esm.sh/three';

/**
 * Módulo de Teste: Three.js
 * Importa Three.js via CDN (esm.sh) e cria uma cena básica.
 */

let scene, camera, renderer, cube;
let animationId;

export function initThreeTest(container) {
  console.log('🎨 [Three-Test] Inicializando Three.js...');
  
  try {
    // 1. Configuração da Cena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111); // Fundo escuro
    
    // 2. Câmera
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 3;
    
    // 3. Renderizador
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Adiciona o canvas ao container
    container.appendChild(renderer.domElement);
    console.log('🎨 [Three-Test] Canvas adicionado ao DOM');
    
    // 4. Objeto de Teste (Cubo)
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ 
      color: 0x00ffcc, 
      wireframe: true 
    });
    cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    
    // 5. Luz (opcional para wireframe, mas bom para testar)
    const light = new THREE.AmbientLight(0xffffff, 1);
    scene.add(light);
    
    // Inicia loop
    animate();
    
    // Handle Resize
    window.addEventListener('resize', onResize);
    
    console.log('✅ [Three-Test] Three.js inicializado com sucesso!');
    return true;
    
  } catch (error) {
    console.error('❌ [Three-Test] Erro ao inicializar Three.js:', error);
    return false;
  }
}

function animate() {
  animationId = requestAnimationFrame(animate);
  if (cube) {
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
  }
  renderer.render(scene, camera);
}

function onResize() {
  if (renderer && camera) {
    const container = renderer.domElement.parentElement;
    if (container) {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    }
  }
}

export function stopThreeTest() {
  if (animationId) cancelAnimationFrame(animationId);
  if (renderer && renderer.domElement.parentNode) {
    renderer.domElement.parentNode.removeChild(renderer.domElement);
  }
  console.log('⏹️ [Three-Test] Three.js parado.');
}
