// src/modules/canvas-test.js
// Testa Canvas 2D e integração com Three.js (CanvasTexture)
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

export function initCanvasTest(rendererData) {
  console.log('🎨 [Canvas] Inicializando teste de Canvas 2D...');

  // Cria canvas 2D para testes
  const canvas2D = document.createElement('canvas');
  canvas2D.width = 512;
  canvas2D.height = 512;
  canvas2D.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 50; border: 2px solid #4ade80; border-radius: 4px;';
  const ctx = canvas2D.getContext('2d');

  // Anexa ao body
  document.body.appendChild(canvas2D);

  console.log('✅ [Canvas] Canvas 2D criado (512x512)');

  // Funções de desenho
  const drawing = {
    // Limpa o canvas
    clear() {
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, 512, 512);
    },

    // Desenha um gradiente
    drawGradient() {
      const gradient = ctx.createLinearGradient(0, 0, 512, 512);
      gradient.addColorStop(0, '#667eea');
      gradient.addColorStop(1, '#764ba2');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 512, 512);
      console.log('🎨 [Canvas] Gradiente desenhado');
    },

    // Desenha círculos aleatórios
    drawCircles(count = 20) {
      for (let i = 0; i < count; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const radius = Math.random() * 50 + 10;
        const color = `hsl(${Math.random() * 360}, 70%, 60%)`;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      }
      console.log(`🎨 [Canvas] ${count} círculos desenhados`);
    },

    // Desenha texto
    drawText(text = 'RPG Paper Craft', x = 256, y = 256) {
      ctx.font = 'bold 32px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, x, y);

      // Sombra
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 10;
      ctx.fillText(text, x, y);
      ctx.shadowBlur = 0;

      console.log(`🎨 [Canvas] Texto "${text}" desenhado`);
    },

    // Desenha padrão de "papel rasgado" (fog-of-war)
    drawFogOfWar(revealX = 256, revealY = 256, revealRadius = 100) {
      // Fundo escuro (área não revelada)
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, 512, 512);

      // Área revelada (círculo com bordas irregulares)
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';

      // Cria padrão de "papel rasgado" com múltiplos círculos sobrepostos
      const baseRadius = revealRadius;
      for (let angle = 0; angle < Math.PI * 2; angle += 0.2) {
        const offset = Math.random() * 20 - 10;
        const x = revealX + Math.cos(angle) * (baseRadius + offset);
        const y = revealY + Math.sin(angle) * (baseRadius + offset);
        const r = Math.random() * 15 + 10;

        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Círculo principal
      ctx.beginPath();
      ctx.arc(revealX, revealY, baseRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
      console.log(`🎨 [Canvas] Fog-of-war desenhado em (${revealX}, ${revealY})`);
    },

    // Desenha grade (para debug)
    drawGrid(cellSize = 32) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;

      for (let x = 0; x <= 512; x += cellSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 512);
        ctx.stroke();
      }

      for (let y = 0; y <= 512; y += cellSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(512, y);
        ctx.stroke();
      }

      console.log(`🎨 [Canvas] Grade desenhada (células de ${cellSize}px)`);
    }
  };

  // Integração com Three.js (CanvasTexture)
  let threeIntegration = null;

  if (rendererData && rendererData.scene) {
    console.log('🎨 [Canvas] Integrando com Three.js...');

    // Cria textura a partir do canvas 2D
    const texture = new THREE.CanvasTexture(canvas2D);
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

    threeIntegration = {
      plane,
      texture,

      // Mostra o plano no Three.js
      show() {
        plane.visible = true;
        texture.needsUpdate = true;
        console.log('🎨 [Canvas] Plano 3D visível');
      },

      // Esconde o plano
      hide() {
        plane.visible = false;
        console.log('🎨 [Canvas] Plano 3D oculto');
      },

      // Atualiza a textura (após desenhar no canvas)
      update() {
        texture.needsUpdate = true;
        console.log('🎨 [Canvas] Textura atualizada');
      }
    };

    console.log('✅ [Canvas] Integração com Three.js concluída');
  }

  return {
    canvas2D,
    ctx,
    drawing,
    threeIntegration,

    // Limpa tudo
    cleanup() {
      document.body.removeChild(canvas2D);
      if (threeIntegration) {
        rendererData.scene.remove(threeIntegration.plane);
      }
      console.log('🗑️ [Canvas] Canvas e recursos limpos');
    }
  };
}
