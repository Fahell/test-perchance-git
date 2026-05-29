// src/modules/canvas-test.js
// Canvas 2D tests with Three.js integration (CanvasTexture)
// Uses OutputArea for organized display

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { showVisual, showText, clearVisual, clearText } from './output-area.js';

export const canvasTest = {
  available: true,
  canvas2D: null,
  ctx: null,
  threeIntegration: null,

  init(rendererData) {
    console.log('🎨 [Canvas] Initializing Canvas 2D test...');

    this.canvas2D = document.createElement('canvas');
    this.canvas2D.width = 512;
    this.canvas2D.height = 512;
    this.canvas2D.style.cssText = 'border-radius: 4px; width: 100%; height: auto; max-width: 512px;';
    this.ctx = this.canvas2D.getContext('2d');

    showVisual(this.canvas2D, '🎨 Canvas 2D');
    showText('<strong>Status:</strong> Canvas initialized (512x512)');

    console.log('✅ [Canvas] Canvas 2D created (512x512)');

    if (rendererData && rendererData.scene) {
      console.log('🎨 [Canvas] Integrating with Three.js...');

      const texture = new THREE.CanvasTexture(this.canvas2D);
      texture.needsUpdate = true;

      const geometry = new THREE.PlaneGeometry(4, 4);
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide,
        transparent: true
      });
      const plane = new THREE.Mesh(geometry, material);
      plane.position.set(0, 0, -5);
      plane.visible = false;
      rendererData.scene.add(plane);

      this.threeIntegration = {
        plane,
        texture,

        show: () => {
          plane.visible = true;
          texture.needsUpdate = true;
          console.log('🎨 [Canvas] 3D plane visible');
        },

        hide: () => {
          plane.visible = false;
          console.log('🎨 [Canvas] 3D plane hidden');
        },

        update: () => {
          texture.needsUpdate = true;
          console.log('🎨 [Canvas] Texture updated');
        }
      };

      console.log('✅ [Canvas] Three.js integration complete');
    }
  },

  drawGradient() {
    if (!this.ctx) return;
    const gradient = this.ctx.createLinearGradient(0, 0, 512, 512);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, 512, 512);
    console.log('🎨 [Canvas] Gradient drawn');
    if (this.threeIntegration) this.threeIntegration.update();
    showText('<strong>Operation:</strong> Gradient<br><strong>Colors:</strong> #667eea → #764ba2');
  },

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
    console.log(`🎨 [Canvas] ${count} circles drawn`);
    if (this.threeIntegration) this.threeIntegration.update();
    showText(`<strong>Operation:</strong> Circles<br><strong>Count:</strong> ${count}`);
  },

  drawText(text = 'RPG Paper Craft', x = 256, y = 256) {
    if (!this.ctx) return;
    this.ctx.font = 'bold 32px monospace';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(text, x, y);

    this.ctx.shadowColor = '#000000';
    this.ctx.shadowBlur = 10;
    this.ctx.fillText(text, x, y);
    this.ctx.shadowBlur = 0;

    console.log(`🎨 [Canvas] Text "${text}" drawn`);
    if (this.threeIntegration) this.threeIntegration.update();
    showText(`<strong>Operation:</strong> Text<br><strong>Content:</strong> "${text}"<br><strong>Position:</strong> (${x}, ${y})`);
  },

  drawFogOfWar(revealX = 256, revealY = 256, revealRadius = 100) {
    if (!this.ctx) return;
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, 512, 512);

    this.ctx.save();
    this.ctx.globalCompositeOperation = 'destination-out';

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

    this.ctx.beginPath();
    this.ctx.arc(revealX, revealY, baseRadius, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
    console.log(`🎨 [Canvas] Fog-of-war drawn at (${revealX}, ${revealY})`);
    if (this.threeIntegration) this.threeIntegration.update();
    showText(`<strong>Operation:</strong> Fog of War<br><strong>Center:</strong> (${revealX}, ${revealY})<br><strong>Radius:</strong> ${revealRadius}px`);
  },

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

    console.log(`🎨 [Canvas] Grid drawn (cells of ${cellSize}px)`);
    if (this.threeIntegration) this.threeIntegration.update();
    showText(`<strong>Operation:</strong> Grid<br><strong>Cell Size:</strong> ${cellSize}px<br><strong>Cells:</strong> ${Math.floor(512 / cellSize)}x${Math.floor(512 / cellSize)}`);
  },

  showThreePlane() {
    if (this.threeIntegration) {
      this.threeIntegration.show();
    }
  },

  hideThreePlane() {
    if (this.threeIntegration) {
      this.threeIntegration.hide();
    }
  },

  cleanup() {
    clearVisual();
    clearText();

    if (this.threeIntegration && this.threeIntegration.plane) {
      this.threeIntegration.plane.parent.remove(this.threeIntegration.plane);
    }

    this.canvas2D = null;
    this.ctx = null;
    this.threeIntegration = null;

    console.log('🗑️ [Canvas] Canvas and resources cleaned up');
  }
};

console.log('🎨 [Canvas] Canvas 2D test module loaded');
