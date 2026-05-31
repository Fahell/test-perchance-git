    // ===== SECTION 4: GSAP HANDLERS =====
    const gsapTimelineHandler = async () => {
        showStatus('Running GSAP Timeline...', 'info');
        const result = await gsapTest.testTimeline();
        if (result.success) {
            showStatus(result.message, 'success');
        } else {
            showStatus(result.message, 'error');
        }
    };

    const gsapStaggerHandler = async () => {
        showStatus('Running GSAP Stagger...', 'info');
        const result = await gsapTest.testStagger();
        if (result.success) {
            showStatus(result.message, 'success');
        } else {
            showStatus(result.message, 'error');
        }
    };

    const gsapEasingHandler = async () => {
        showStatus('Running GSAP Easing Comparison...', 'info');
        const result = await gsapTest.testEasing();
        if (result.success) {
            showStatus(result.message, 'success');
        } else {
            showStatus(result.message, 'error');
        }
    };

    const gsapCleanupHandler = async () => {
        const result = gsapTest.cleanup();
        showStatus(result.message, result.success ? 'success' : 'error');
    };

    // Expose handlers to global scope for onclick attributes
    window.gsapTimelineHandler = gsapTimelineHandler;
    window.gsapStaggerHandler = gsapStaggerHandler;
    window.gsapEasingHandler = gsapEasingHandler;
    window.gsapCleanupHandler = gsapCleanupHandler;
