/**
 * Test Container Utility
 * Creates modal containers for test outputs with close button
 */

import { VERSION } from '../constants.js';

/**
 * Creates a modal container for test output
 * @param {string} title - Title for the container
 * @param {Object} options - Container options
 * @param {string} options.id - Container ID (default: 'test-container-{timestamp}')
 * @param {string} options.className - Additional CSS class (default: 'test-container')
 * @param {number} options.width - Container width in px (default: 800)
 * @param {number} options.height - Container height in px (default: 600)
 * @param {Function} options.onClose - Callback when container is closed
 * @returns {Object} Container object with { container, contentArea, close }
 */
export function createTestContainer(title, options = {}) {
  const {
    id = `test-container-${Date.now()}`,
    className = 'test-container',
    width = 800,
    height = 600,
    onClose = null
  } = options;

  // Create container
  const container = document.createElement('div');
  container.id = id;
  container.className = className;
  container.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: ${width}px;
    max-width: 95vw;
    height: ${height}px;
    max-height: 95vh;
    background: rgba(0, 0, 0, 0.95);
    border: 2px solid #4ade80;
    border-radius: 8px;
    padding: 15px;
    z-index: 10000;
    overflow: auto;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    font-family: monospace;
    color: white;
  `;

  // Create close button
  const closeBtn = document.createElement('button');
  closeBtn.className = 'test-close-btn';
  closeBtn.innerHTML = '✕';
  closeBtn.style.cssText = `
    position: absolute;
    top: 10px;
    right: 10px;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #ff6b6b;
    color: white;
    border: none;
    cursor: pointer;
    font-size: 18px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    z-index: 10001;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  `;

  closeBtn.addEventListener('mouseover', () => {
    closeBtn.style.background = '#ff4757';
    closeBtn.style.transform = 'scale(1.1)';
    closeBtn.style.boxShadow = '0 4px 12px rgba(255, 107, 107, 0.4)';
  });

  closeBtn.addEventListener('mouseout', () => {
    closeBtn.style.background = '#ff6b6b';
    closeBtn.style.transform = 'scale(1)';
    closeBtn.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
  });

  // Create title
  const titleEl = document.createElement('h3');
  titleEl.style.cssText = `
    margin: 0 0 15px 0;
    color: #4ade80;
    font-size: 16px;
    font-weight: 600;
  `;
  titleEl.textContent = title;

  // Create content area
  const contentArea = document.createElement('div');
  contentArea.className = 'test-content-area';
  contentArea.style.cssText = `
    width: 100%;
    height: calc(100% - 50px);
    overflow: auto;
    background: #1a1a1a;
    border-radius: 4px;
    padding: 10px;
    border: 1px solid #404040;
  `;

  // Assemble container
  container.appendChild(closeBtn);
  container.appendChild(titleEl);
  container.appendChild(contentArea);
  document.body.appendChild(container);

  // Close function
  const close = () => {
    if (onClose) {
      try {
        onClose();
      } catch (error) {
        console.error('Error in onClose callback:', error);
      }
    }
    container.remove();
    console.log(`🧹 [TestContainer] Closed: ${title}`);
  };

  closeBtn.addEventListener('click', close);

  console.log(`📦 [TestContainer] Created: ${title} (${VERSION})`);

  return {
    container,
    contentArea,
    close
  };
}

/**
 * Closes all test containers
 */
export function closeAllTestContainers() {
  const containers = document.querySelectorAll('.test-container');
  containers.forEach(container => container.remove());
  console.log(`🧹 [TestContainer] Closed ${containers.length} container(s)`);
}
