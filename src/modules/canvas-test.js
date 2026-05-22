// src/modules/canvas-test.js
// Testa Canvas 2D e integração com Three.js (CanvasTexture)
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

export const canvasTest = {
  available: true,
  canvas2D: null,
  ctx: null,
  threeIntegration: null,

  // Inicializa o canvas 2D
  init(rendererData) {
    console.log('🎨 [Canvas] Inicializando teste de Canvas 2D...');

    // Cria canvas 2D para testes
    this.canvas2D = document.createElement('canvas');
    this.canvas2D.width = 512;
    this.canvas2D.height = 512;
    this.canvas2D.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 50; border: 2px solid #4ade80; border-radius: 4px;';
    this.ctx = this.canvas2D.getContext('2d');

    // Anexa ao body
    document.body.appendChild(this.canvas2D);

    console.log('✅ [Canvas] Canvas 2D criado (512x512)');

    // Integração com Three.js (CanvasTexture)
    if (rendererData && rendererData.scene) {
      console.log('🎨 [Canvas] Integrando com Three.js...');

      // Cria textura a partir do canvas 2D
      const texture = new THREE.CanvasTexture(this.canvas2D);
      texture.needsUpdate = true;

      // Cria um plano com a textura
      const geometry = new THREE.PlaneGeometry(4, 4);
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide,
        transparent: true
      });
      const plane = new THREE.Mesh(geometry, material);
      plane.position.set(0, 0, -5);
      plane.visible = false; // Começa invisível
      rendererData.scene.add(plane);

      this.threeIntegration = {
        plane,
        texture,

        // Mostra o plano no Three.js
        show: () => {
          plane.visible = true;
          texture.needsUpdate = true;
          console.log('🎨 [Canvas] Plano 3D visível');
        },

        // Esconde o plano
        hide: () => {
          plane.visible = false;
          console.log('🎨 [Canvas] Plano 3D oculto');
        },

        // Atualiza a textura (após desenhar no canvas)
        update: () => {
          texture.needsUpdate = true;
          console.log('🎨 [Canvas] Textura atualizada');
        }
      };

      console.log('✅ [Canvas] Integração com Three.js concluída');
    }
  },

  // Desenha um gradiente
  drawGradient() {
    if (!this.ctx) return;
    const gradient = this.ctx.createLinearGradient(0, 0, 512, 512);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, 512, 512);
    console.log('🎨 [Canvas] Gradiente desenhado');
    if (this.threeIntegration) this.threeIntegration.update();
  },

  // Desenha círculos aleatórios
  drawCircles(count = 20) {
    if (!this.ctx) return;
    for (let i = 0; i < count; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const radius = Math.random() * 50 + 10;
      const color = `hsl(${Math.random() * 360}, 70%, 60%)`;

      this.ctx.beginPath();
      this.ctx.arc(x, y, radius, 0, Math.PI * 2);
      this.ctx.fillStyle = color;
      this.ctx.fill();
    }
    console.log(`🎨 [Canvas] ${count} círculos desenhados`);
    if (this.threeIntegration) this.threeIntegration.update();
  },

  // Desenha texto
  drawText(text = 'RPG Paper Craft', x = 256, y = 256) {
    if (!this.ctx) return;
    this.ctx.font = 'bold 32px monospace';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(text, x, y);

    // Sombra
    this.ctx.shadowColor = '#000000';
    this.ctx.shadowBlur = 10;
    this.ctx.fillText(text, x, y);
    this.ctx.shadowBlur = 0;

    console.log(`🎨 [Canvas] Texto "${text}" desenhado`);
    if (this.threeIntegration) this.threeIntegration.update();
  },

  // Desenha padrão de "papel rasgado" (fog-of-war)
  drawFogOfWar(revealX = 256, revealY = 256, revealRadius = 100) {
    if (!this.ctx) return;
    // Fundo escuro (área não revelada)
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, 512, 512);

    // Área revelada (círculo com bordas irregulares)
    this.ctx.save();
    this.ctx.globalCompositeOperation = 'destination-out';

    // Cria padrão de "papel rasgado" com múltiplos círculos sobrepostos
    const baseRadius = revealRadius;
    for (let angle = 0; angle < Math.PI * 2; angle += 0.2) {
      const offset = Math.random() * 20 - 10;
      const x = revealX + Math.cos(angle) * (baseRadius + offset);
      const y = revealY + Math.sin(angle) * (baseRadius + offset);
      const r = Math.random() * 15 + 10;

      this.ctx.beginPath();
      this.ctx.arc(x, y, r, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Círculo principal
    this.ctx.beginPath();
    this.ctx.arc(revealX, revealY, baseRadius, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
    console.log(`🎨 [Canvas] Fog-of-war desenhado em (${revealX}, ${revealY})`);
    if (this.threeIntegration) this.threeIntegration.update();
  },

  // Desenha grade (para debug)
  drawGrid(cellSize = 32) {
    if (!this.ctx) return;
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    this.ctx.lineWidth = 1;

    for (let x = 0; x <= 512; x += cellSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, 512);
      this.ctx.stroke();
    }

    for (let y = 0; y <= 512; y += cellSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(512, y);
      this.ctx.stroke();
    }

    console.log(`🎨 [Canvas] Grade desenhada (células de ${cellSize}px)`);
    if (this.threeIntegration) this.threeIntegration.update();
  },

  // Mostra o plano 3D
  showThreePlane() {
    if (this.threeIntegration) {
      this.threeIntegration.show();
    }
  },

  // Esconde o plano 3D
  hideThreePlane() {
    if (this.threeIntegration) {
      this.threeIntegration.hide();
    }
  },

  // Limpa tudo
  cleanup() {
    if (this.canvas2D && this.canvas2D.parentNode) {
      this.canvas2D.parentNode.removeChild(this.canvas2D);
    }
    if (this.threeIntegration && this.threeIntegration.plane) {
      this.threeIntegration.plane.parent.remove(this.threeIntegration.plane);
    }
    console.log('🗑️ [Canvas] Canvas e recursos limpos');
  }
};

// Inicialização
console.log('🎨 [Canvas] Inicializando teste de Canvas 2D...');
