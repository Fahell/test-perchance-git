// src/modules/output-area.js
// Managed output area for displaying test results and visual content
// Position: right side of test panel, organized slots for visual and text content

import { CDN_BASE } from '../constants.js';

const CSS_URL = `${CDN_BASE}/src/styles/output-area.css`;

let outputArea = null;
let visualSlot = null;
let textSlot = null;
let modalOverlay = null;

function injectStylesheet() {
  if (document.getElementById('output-area-styles')) return;
  const link = document.createElement('link');
  link.id = 'output-area-styles';
  link.rel = 'stylesheet';
  link.href = CSS_URL;
  document.head.appendChild(link);
}

function createOutputArea() {
  if (outputArea) return;

  outputArea = document.createElement('div');
  outputArea.id = 'output-area';

  const header = document.createElement('div');
  header.className = 'output-area__header';
  header.innerHTML = `
    <span class="output-area__title">📊 Output</span>
    <button class="output-area__clear" title="Clear all">🗑️</button>
  `;
  header.querySelector('.output-area__clear').onclick = () => clearAll();

  visualSlot = document.createElement('div');
  visualSlot.className = 'output-area__slot output-area__slot--visual';
  visualSlot.innerHTML = '<span class="output-area__placeholder">Visual results will appear here</span>';

  textSlot = document.createElement('div');
  textSlot.className = 'output-area__slot output-area__slot--text';
  textSlot.innerHTML = '<span class="output-area__placeholder">Text results will appear here</span>';

  outputArea.appendChild(header);
  outputArea.appendChild(visualSlot);
  outputArea.appendChild(textSlot);
  document.body.appendChild(outputArea);
}

function createModalOverlay() {
  if (modalOverlay) return modalOverlay;

  modalOverlay = document.createElement('div');
  modalOverlay.className = 'output-area__modal-overlay';
  modalOverlay.onclick = (e) => {
    if (e.target === modalOverlay) closeModal();
  };

  const modalContent = document.createElement('div');
  modalContent.className = 'output-area__modal-content';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'output-area__modal-close';
  closeBtn.innerHTML = '✕';
  closeBtn.title = 'Close';
  closeBtn.onclick = () => closeModal();

  const modalBody = document.createElement('div');
  modalBody.className = 'output-area__modal-body';

  modalContent.appendChild(closeBtn);
  modalContent.appendChild(modalBody);
  modalOverlay.appendChild(modalContent);
  document.body.appendChild(modalOverlay);

  return modalBody;
}

/**
 * Display visual content (charts, images, canvas, etc.)
 * @param {HTMLElement|string} content - DOM element or HTML string
 * @param {string} [title] - Optional title for the visual
 */
export function showVisual(content, title) {
  if (!outputArea) createOutputArea();

  const wrapper = document.createElement('div');
  wrapper.className = 'output-area__visual-wrapper';

  if (title) {
    const titleEl = document.createElement('div');
    titleEl.className = 'output-area__visual-title';
    titleEl.textContent = title;
    wrapper.appendChild(titleEl);
  }

  if (typeof content === 'string') {
    wrapper.innerHTML += content;
  } else {
    wrapper.appendChild(content);
  }

  visualSlot.innerHTML = '';
  visualSlot.appendChild(wrapper);
}

/**
 * Display text or information content
 * @param {string} html - HTML content to display
 */
export function showText(html) {
  if (!outputArea) createOutputArea();

  const wrapper = document.createElement('div');
  wrapper.className = 'output-area__text-wrapper';
  wrapper.innerHTML = html;

  textSlot.innerHTML = '';
  textSlot.appendChild(wrapper);
}

/**
 * Append text content (doesn't clear previous)
 * @param {string} html - HTML content to append
 */
export function appendText(html) {
  if (!outputArea) createOutputArea();

  if (textSlot.querySelector('.output-area__placeholder')) {
    textSlot.innerHTML = '';
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'output-area__text-wrapper';
  wrapper.innerHTML = html;

  textSlot.appendChild(wrapper);
}

/**
 * Show content in a fullscreen modal with backdrop
 * @param {HTMLElement|string} content - DOM element or HTML string
 * @param {string} [title] - Optional modal title
 * @returns {HTMLElement} The modal body element for further manipulation
 */
export function showModal(content, title) {
  const modalBody = createModalOverlay();

  if (title) {
    const titleEl = document.createElement('div');
    titleEl.className = 'output-area__modal-title';
    titleEl.textContent = title;
    modalBody.appendChild(titleEl);
  }

  if (typeof content === 'string') {
    modalBody.innerHTML += content;
  } else {
    modalBody.appendChild(content);
  }

  modalOverlay.classList.add('output-area__modal-overlay--visible');
  return modalBody;
}

/**
 * Close the modal
 */
export function closeModal() {
  if (modalOverlay) {
    modalOverlay.classList.remove('output-area__modal-overlay--visible');
    const modalBody = modalOverlay.querySelector('.output-area__modal-body');
    if (modalBody) modalBody.innerHTML = '';
  }
}

/**
 * Clear visual slot
 */
export function clearVisual() {
  if (visualSlot) {
    visualSlot.innerHTML = '<span class="output-area__placeholder">Visual results will appear here</span>';
  }
}

/**
 * Clear text slot
 */
export function clearText() {
  if (textSlot) {
    textSlot.innerHTML = '<span class="output-area__placeholder">Text results will appear here</span>';
  }
}

/**
 * Clear all slots
 */
export function clearAll() {
  clearVisual();
  clearText();
}

/**
 * Initialize the output area
 * Should be called once during game initialization
 */
export function initOutputArea() {
  injectStylesheet();
  createOutputArea();
  console.log('📊 [OutputArea] Initialized');
}
