// src/modules/mermaid-test.js
// Mermaid.js integration test with async CDN loading

import { VERSION } from '../constants.js';

const MERMAID_CDN_URL = 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js';

let mermaidPromise = null;
let mermaidReady = false;
let mermaidInstance = null;

/**
 * Starts loading Mermaid from CDN in the background (non-blocking)
 */
function preloadMermaid() {
  if (mermaidPromise) {
    return mermaidPromise;
  }

  mermaidPromise = new Promise((resolve, reject) => {
    console.log(`📊 [Mermaid] Starting background load from CDN...`);
    
    // Check if already loaded
    if (window.mermaid) {
      mermaidReady = true;
      mermaidInstance = window.mermaid;
      console.log(`✅ [Mermaid] Already loaded in window`);
      resolve(window.mermaid);
      return;
    }

    const script = document.createElement('script');
    script.src = MERMAID_CDN_URL;
    script.async = true;
    
    script.onload = () => {
      mermaidReady = true;
      mermaidInstance = window.mermaid;
      
      // Initialize Mermaid
      mermaidInstance.initialize({
        startOnLoad: false,
        theme: 'dark',
        securityLevel: 'loose',
        fontFamily: 'inherit',
        flowchart: {
          useMaxWidth: true,
          htmlLabels: true
        }
      });
      
      console.log(`✅ [Mermaid] Loaded from CDN (v${VERSION})`);
      resolve(mermaidInstance);
    };
    
    script.onerror = () => {
      const error = new Error('Failed to load Mermaid from CDN');
      console.error(`❌ [Mermaid] ${error.message}`);
      reject(error);
    };
    
    document.head.appendChild(script);
  });

  return mermaidPromise;
}

/**
 * Gets the Mermaid instance, waiting if still loading
 */
async function getMermaid() {
  if (mermaidReady && mermaidInstance) {
    return mermaidInstance;
  }
  
  if (!mermaidPromise) {
    preloadMermaid();
  }
  
  console.log(`⏳ [Mermaid] Waiting for load to complete...`);
  return await mermaidPromise;
}

/**
 * Checks if Mermaid is ready
 */
export function isReady() {
  return mermaidReady;
}

/**
 * Checks if Mermaid is currently loading
 */
export function isLoading() {
  return mermaidPromise !== null && !mermaidReady;
}

/**
 * Example diagrams for testing
 */
const DIAGRAMS = {
  flowchart: `graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> B
    C --> E[End]`,

  sequence: `sequenceDiagram
    participant User
    participant Perchance
    participant CDN
    
    User->>Perchance: Load Game
    Perchance->>CDN: Fetch Bundle
    CDN-->>Perchance: main.bundle.js
    Perchance->>Perchance: initGame()
    Perchance-->>User: Game Ready`,

  pie: `pie title Project Structure
    "Modules" : 60
    "Styles" : 15
    "Assets" : 20
    "Config" : 5`,

  class: `classDiagram
    class Game {
      +init()
      +update()
      +render()
    }
    class Renderer {
      +scene
      +camera
      +render()
    }
    class Logic {
      +seed
      +biome
      +update()
    }
    Game --> Renderer
    Game --> Logic`,

  state: `stateDiagram-v2
    [*] --> Loading
    Loading --> Ready: Assets Loaded
    Ready --> Playing: Start Game
    Playing --> Paused: Pause
    Paused --> Playing: Resume
    Playing --> [*]: Quit`
};

/**
 * Renders a specific diagram type
 */
export async function renderDiagram(type, container) {
  try {
    const mermaid = await getMermaid();
    const diagramCode = DIAGRAMS[type];
    
    if (!diagramCode) {
      throw new Error(`Unknown diagram type: ${type}`);
    }

    // Generate unique ID
    const id = `mermaid-${type}-${Date.now()}`;
    
    // Create container for this diagram
    const diagramContainer = document.createElement('div');
    diagramContainer.className = 'mermaid-diagram';
    diagramContainer.innerHTML = `
      <h4 class="mermaid-title">${type.charAt(0).toUpperCase() + type.slice(1)} Diagram</h4>
      <div id="${id}" class="mermaid-render"></div>
    `;
    
    container.appendChild(diagramContainer);
    
    // Render diagram
    const { svg } = await mermaid.render(id, diagramCode);
    document.getElementById(id).innerHTML = svg;
    
    console.log(`✅ [Mermaid] Rendered ${type} diagram`);
    return true;
  } catch (error) {
    console.error(`❌ [Mermaid] Failed to render ${type}:`, error.message);
    
    // Show error in container
    const errorDiv = document.createElement('div');
    errorDiv.className = 'mermaid-error';
    errorDiv.innerHTML = `
      <strong>❌ Error rendering ${type}:</strong><br>
      ${error.message}
    `;
    container.appendChild(errorDiv);
    
    return false;
  }
}

/**
 * Renders all example diagrams
 */
export async function renderAllExamples(container) {
  console.log(`📊 [Mermaid] Rendering all example diagrams...`);
  
  const results = {};
  const types = Object.keys(DIAGRAMS);
  
  for (const type of types) {
    results[type] = await renderDiagram(type, container);
  }
  
  const successCount = Object.values(results).filter(Boolean).length;
  console.log(`✅ [Mermaid] Rendered ${successCount}/${types.length} diagrams`);
  
  return results;
}

/**
 * Changes the Mermaid theme
 */
export async function setTheme(themeName) {
  const mermaid = await getMermaid();
  
  mermaid.initialize({
    startOnLoad: false,
    theme: themeName,
    securityLevel: 'loose',
    fontFamily: 'inherit'
  });
  
  console.log(`🎨 [Mermaid] Theme changed to: ${themeName}`);
}

/**
 * Cleanup function
 */
export function cleanup() {
  console.log(`🧹 [Mermaid] Cleanup (note: CDN script remains in DOM for reuse)`);
  // We don't remove the script from DOM to allow reuse
  // Just reset internal state
}

// Export for debugging
export const mermaidTest = {
  preloadMermaid,
  getMermaid,
  isReady,
  isLoading,
  renderDiagram,
  renderAllExamples,
  setTheme,
  cleanup,
  DIAGRAMS
};
