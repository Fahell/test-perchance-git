// src/modules/raycaster-test.js
// Testa interação com objetos 3D via Raycaster do Three.js
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

export function initRaycasterTest(rendererData) {
  console.log('🖱️ [Raycaster] Inicializando teste de clique em objetos 3D...');

  if (!rendererData || !rendererData.scene || !rendererData.camera) {
    console.warn('⚠️ [Raycaster] Renderer não disponível');
    return { available: false };
  }

  const { scene, camera, renderer } = rendererData;
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  // Adiciona esferas clicáveis para teste
  const spheres = [];
  const colors = [0xff6b6b, 0x4ecdc4, 0xffe66d, 0x95e1d3];

  for (let i = 0; i < 4; i++) {
    const geometry = new THREE.SphereGeometry(0.5, 16, 16);
    const material = new THREE.MeshStandardMaterial({
      color: colors[i],
      roughness: 0.3,
      metalness: 0.7
    });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.x = (i - 1.5) * 2;
    sphere.position.y = -2;
    sphere.position.z = -3;
    sphere.userData = { name: `Esfera ${i + 1}`, clickable: true };
    scene.add(sphere);
    spheres.push(sphere);
  }

  console.log(`✅ [Raycaster] ${spheres.length} esferas clicáveis adicionadas à cena`);

  // Evento de clique
  function onMouseClick(event) {
    // Normaliza coordenadas do mouse (-1 a +1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(spheres);

    if (intersects.length > 0) {
      const clicked = intersects[0].object;
      console.log(`🖱️ [Raycaster] Clique detectado em: ${clicked.userData.name}`);
      console.log(`   Posição:`, clicked.position);

      // Feedback visual: pisca a esfera
      const originalColor = clicked.material.color.getHex();
      clicked.material.color.setHex(0xffffff);
      setTimeout(() => {
        clicked.material.color.setHex(originalColor);
      }, 200);

      // Dispara evento customizado
      window.dispatchEvent(new CustomEvent('rpg-object-clicked', {
        detail: {
          name: clicked.userData.name,
          position: clicked.position.clone(),
          object: clicked
        }
      }));
    }
  }

  // Evento de hover (muda cor ao passar o mouse)
  function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(spheres);

    // Reseta todas as esferas
    spheres.forEach(s => {
      if (s.userData.originalColor) {
        s.material.color.setHex(s.userData.originalColor);
      }
    });

    if (intersects.length > 0) {
      const hovered = intersects[0].object;
      if (!hovered.userData.originalColor) {
        hovered.userData.originalColor = hovered.material.color.getHex();
      }
      hovered.material.color.setHex(0xffffff);
      document.body.style.cursor = 'pointer';
    } else {
      document.body.style.cursor = 'default';
    }
  }

  // Anexa eventos ao canvas
  renderer.domElement.addEventListener('click', onMouseClick);
  renderer.domElement.addEventListener('mousemove', onMouseMove);

  console.log('✅ [Raycaster] Eventos de clique e hover ativados');

  return {
    available: true,
    spheres,
    cleanup: () => {
      renderer.domElement.removeEventListener('click', onMouseClick);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      spheres.forEach(s => scene.remove(s));
      console.log('🗑️ [Raycaster] Eventos removidos e esferas limpas');
    }
  };
}
