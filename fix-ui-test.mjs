import fs from 'fs';

const file = 'src/modules/ui-test.js';
let content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

let newLines = [];
let i = 0;
let fixed = false;

while (i < lines.length) {
  const line = lines[i];
  
  // Detect the broken start: cellularAutomataTest.init followed immediately by gsapBasicHandler
  if (line.includes('cellularAutomataTest.init(rendererData);') && 
      i + 1 < lines.length && lines[i+1].includes('async function gsapBasicHandler()')) {
    
    // Add the init line
    newLines.push(line);
    // Add the missing log and closing brace for cellularAutomataHandler
    newLines.push("    console.log('✅ Cellular Automata: 128x128 grid initialized');");
    newLines.push("  }");
    newLines.push("");
    i++; // move to gsapBasicHandler line
    
    // Now process GSAP functions until we find the misplaced cellular automata log
    while (i < lines.length) {
      const gLine = lines[i];
      
      // Skip the misplaced log and closing brace
      if (gLine.includes("Cellular Automata: 128x128 grid initialized") || 
          (gLine.trim() === '}' && i+1 < lines.length && lines[i+1].includes('const panel = document.createElement'))) {
        i++; 
        continue;
      }
      
      // Fix indentation of GSAP functions (they are indented too much or too little)
      // They should be at 2 spaces indentation relative to initUITest
      if (gLine.startsWith('  async function gsap') || gLine.startsWith('async function gsap')) {
        newLines.push(gLine.replace(/^\s*/, '  '));
      } else if (gLine.trim() === '' && i > 0 && lines[i-1].includes('}')) {
        newLines.push('');
      } else if (gLine.startsWith('    ') || gLine.startsWith('  ')) {
        // Keep internal indentation
        newLines.push(gLine);
      } else {
        newLines.push(gLine);
      }
      i++;
    }
    fixed = true;
  } else {
    newLines.push(line);
    i++;
  }
}

if (fixed) {
  fs.writeFileSync(file, newLines.join('\n'));
  console.log('✅ File fixed successfully');
} else {
  console.log('❌ Broken pattern not found');
}
