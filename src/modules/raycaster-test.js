// src/modules/raycaster-test.js
// Testa interação com objetos 3D via Raycaster do Three.js
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

export const raycasterTest = {
  available: false,
  spheres: [],
  raycaster: null,
  mouse: null,
  rendererData: null,

  // Inicializa o teste de raycaster
  init(rendererData) {
    console.log('🖱️ [Raycaster] Inicializando teste de clique em objetos 3D...');

    if (!rendererData || !rendererData.scene || !rendererData.camera) {
      console.warn('⚠️ [Raycaster] Renderer não disponível');
      return false;
    }

    this.rendererData = rendererData;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    const { scene, camera, renderer } = rendererData;

    // Adiciona esferas clicáveis para teste
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
      this.spheres.push(sphere);
    }

    console.log(`✅ [Raycaster] ${this.spheres.length} esferas clicáveis adicionadas à cena`);

    // Evento de clique
    const onMouseClick = (event) => {
      // Normaliza coordenadas do mouse (-1 a +1)
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, camera);
      const intersects = this.raycaster.intersectObjects(this.spheres);

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
    };

    // Evento de hover (muda cor ao passar o mouse)
    const onMouseMove = (event) => {
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, camera);
      const intersects = this.raycaster.intersectObjects(this.spheres);

      // Reseta todas as esferas
      this.spheres.forEach(s => {
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
    };

    // Anexa eventos ao canvas
    renderer.domElement.addEventListener('click', onMouseClick);
    renderer.domElement.addEventListener('mousemove', onMouseMove);

    this.available = true;
    console.log('✅ [Raycaster] Eventos de clique e hover ativados');
    return true;
  },

  // Retorna informações das esferas
  getSpheres() {
    return this.spheres.map(s => ({
      name: s.userData.name,
      position: s.position.clone(),
      color: s.material.color.getHex()
    }));
  },

  // Limpa tudo
  cleanup() {
    if (!this.rendererData) return;
    
    const { scene, renderer } = this.rendererData;
    this.spheres.forEach(s => scene.remove(s));
    this.spheres = [];
    console.log('🗑️ [Raycaster] Esferas limpas');
  }
};

// Inicialização
console.log('🖱️ [Raycaster] Inicializando teste de clique em objetos 3D...');
