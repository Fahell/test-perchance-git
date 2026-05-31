const fs = require('fs');
const file = 'src/modules/ui-test.js';
let content = fs.readFileSync(file, 'utf8');

// The broken pattern has GSAP functions inside cellularAutomataHandler
// We will use a regex to find the block and fix it
const brokenRegex = /(\s+cellularAutomataTest\.init\(rendererData\);)\s+async function gsapBasicHandler\(\) \{[\s\S]*?gsapTest\.cleanup\(\);\s+\}\s+console\.log\('\\\\u2705 Cellular Automata: 128x128 grid initialized'\);\s+\}/;

const match = content.match(brokenRegex);
if (match) {
  const fixedBlock = `$1
    console.log('✅ Cellular Automata: 128x128 grid initialized');
  }

  async function gsapBasicHandler() {
    console.log('🎬 Testing GSAP Basic Tween...');
    if (!gsapTest) throw new Error('GSAP not available');
    if (gsapTest.isLoading && gsapTest.isLoading()) {
      console.log('⏳ GSAP still loading, waiting...');
      await gsapTest.getGsap();
    }
    await gsapTest.testBasicTween();
  }

  async function gsapFromHandler() {
    console.log('🎬 Testing GSAP From Tween...');
    if (!gsapTest) throw new Error('GSAP not available');
    await gsapTest.testFromTween();
  }

  async function gsapTimelineHandler() {
    console.log('🎬 Testing GSAP Timeline...');
    if (!gsapTest) throw new Error('GSAP not available');
    await gsapTest.testTimeline();
  }

  async function gsapStaggerHandler() {
    console.log('🎬 Testing GSAP Stagger...');
    if (!gsapTest) throw new Error('GSAP not available');
    await gsapTest.testStagger();
  }

  async function gsapEasingHandler() {
    console.log('🎬 Testing GSAP Easing...');
    if (!gsapTest) throw new Error('GSAP not available');
    await gsapTest.testEasing();
  }

  async function gsapCleanupHandler() {
    console.log('🧹 GSAP Cleanup...');
    if (!gsapTest) throw new Error('GSAP not available');
    gsapTest.cleanup();
  }`;

  content = content.replace(brokenRegex, fixedBlock);
  fs.writeFileSync(file, content);
  console.log('✅ File fixed successfully');
} else {
  console.log('❌ Broken pattern not found');
}
