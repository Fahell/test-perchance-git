  async function mermaidHandler() {
    log('📊 Testando Mermaid.js...', 'info');
    if (!mermaidTest) throw new Error('Mermaid not available');
    
    // Check if still loading
    if (mermaidTest.isLoading && mermaidTest.isLoading()) {
      log('⏳ Mermaid ainda carregando, aguarde...', 'warning');
      // Wait for it to finish
      await mermaidTest.getMermaid();
    }
    
    // Create or get diagram container
    let diagramContainer = document.getElementById('mermaid-diagrams');
    if (!diagramContainer) {
      diagramContainer = document.createElement('div');
      diagramContainer.id = 'mermaid-diagrams';
      diagramContainer.className = 'mermaid-container';
      
      // Add close button
      const closeBtn = document.createElement('button');
      closeBtn.className = 'mermaid-close-btn';
      closeBtn.innerHTML = '✕';
      closeBtn.title = 'Fechar';
      closeBtn.onclick = () => {
        diagramContainer.remove();
        log('📊 Diagramas fechados', 'info');
      };
      diagramContainer.appendChild(closeBtn);
      
      document.body.appendChild(diagramContainer);
    } else {
      // Clear existing diagrams (keep close button)
      const closeBtn = diagramContainer.querySelector('.mermaid-close-btn');
      diagramContainer.innerHTML = '';
      if (closeBtn) diagramContainer.appendChild(closeBtn);
    }
    
    // Render all examples
    const results = await mermaidTest.renderAllExamples(diagramContainer);
    const successCount = Object.values(results).filter(Boolean).length;
    const totalCount = Object.keys(results).length;
    
    log(`✅ Mermaid: ${successCount}/${totalCount} diagramas renderizados`, 'success');
  }