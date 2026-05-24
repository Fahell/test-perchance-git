#!/usr/bin/env node
/**
 * sync-version.js - Synchronizes version from constants.js across the entire project
 * 
 * Usage: node scripts/sync-version.js
 * 
 * Features:
 * - Validates semver format (vMAJOR.MINOR.PATCH)
 * - Scans entire project for version occurrences
 * - Excludes node_modules, dist, .git, and binary files
 * - Warns about missing tags and unpushed changes
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const CONSTANTS_PATH = path.join(ROOT, 'src', 'constants.js');

// Directories to exclude from scanning
const EXCLUDED_DIRS = new Set([
  'node_modules',
  'dist',
  '.git',
  '.husky',
  '.vscode',
  'coverage'
]);

// File extensions to scan
const TEXT_EXTENSIONS = new Set([
  '.js', '.jsx', '.ts', '.tsx', '.mjs',
  '.html', '.htm',
  '.css', '.scss', '.less',
  '.md', '.txt',
  '.json', '.yml', '.yaml',
  '.sh', '.bash'
]);

// Specific files to always include
const INCLUDE_FILES = new Set([
  'README.md',
  'for-perchance.html',
  'AGENTS.md'
]);

/**
 * Validates semver format: vMAJOR.MINOR.PATCH or MAJOR.MINOR.PATCH
 */
function validateSemver(version) {
  const semverPattern = /^v?(\d+)\.(\d+)\.(\d+)(?:-([a-zA-Z0-9.-]+))?(?:\+([a-zA-Z0-9.-]+))?$/;
  const match = version.match(semverPattern);
  
  if (!match) {
    throw new Error(`Invalid semver format: "${version}". Expected: vMAJOR.MINOR.PATCH or MAJOR.MINOR.PATCH`);
  }
  
  const [, major, minor, patch] = match;
  return {
    valid: true,
    major: parseInt(major, 10),
    minor: parseInt(minor, 10),
    patch: parseInt(patch, 10),
    normalized: `v${major}.${minor}.${patch}`
  };
}

/**
 * Extracts version from constants.js
 */
function extractVersion() {
  const content = fs.readFileSync(CONSTANTS_PATH, 'utf-8');
  const match = content.match(/export\s+const\s+VERSION\s*=\s*['"]([^'"]+)['"]/);
  if (!match) {
    throw new Error('Could not extract VERSION from constants.js');
  }
  return match[1];
}

/**
 * Checks if a file is likely binary (not text)
 */
function isBinaryFile(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    const length = Math.min(buffer.length, 8000);
    
    for (let i = 0; i < length; i++) {
      // Check for null bytes (common in binary files)
      if (buffer[i] === 0) return true;
    }
    
    return false;
  } catch {
    return true;
  }
}

/**
 * Recursively finds all text files in the project
 */
function findTextFiles(dir, fileList = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      if (!EXCLUDED_DIRS.has(entry.name) && !entry.name.startsWith('.')) {
        findTextFiles(fullPath, fileList);
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      const isIncluded = INCLUDE_FILES.has(entry.name);
      const hasTextExt = TEXT_EXTENSIONS.has(ext);
      
      if (isIncluded || hasTextExt) {
        if (!isBinaryFile(fullPath)) {
          fileList.push(fullPath);
        }
      }
    }
  }
  
  return fileList;
}

/**
 * Updates version occurrences in a file
 */
function updateFileVersion(filePath, version, stats) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const versionPattern = /v?\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?/g;
  
  let updatedContent = content;
  let changesCount = 0;
  const oldVersions = new Set();
  
  updatedContent = updatedContent.replace(versionPattern, (match) => {
    // Skip if it's the source of truth (constants.js)
    if (filePath === CONSTANTS_PATH) {
      return match;
    }
    
    const hadPrefix = match.startsWith('v');
    const newVersion = hadPrefix ? version : version.replace(/^v/, '');
    
    if (match !== newVersion) {
      changesCount++;
      oldVersions.add(match);
    }
    
    return newVersion;
  });
  
  if (changesCount > 0) {
    fs.writeFileSync(filePath, updatedContent, 'utf-8');
    stats.totalChanges += changesCount;
    stats.filesUpdated.push({
      path: path.relative(ROOT, filePath),
      count: changesCount,
      oldVersions: [...oldVersions]
    });
  }
  
  return changesCount;
}

/**
 * Checks for unpushed changes and missing tags
 */
function checkGitStatus(version) {
  const warnings = [];
  
  try {
    // Check if tag exists
    try {
      execSync(`git rev-parse ${version}`, { stdio: 'ignore' });
      // Tag exists, check if it's pushed
      try {
        execSync(`git ls-remote --tags origin ${version}`, { stdio: 'ignore' });
      } catch {
        warnings.push(`Tag ${version} exists locally but hasn't been pushed. Run: git push origin ${version}`);
      }
    } catch {
      warnings.push(`Tag ${version} doesn't exist. Create it with: git tag -a ${version} -m "Release ${version}"`);
      warnings.push(`After creating the tag, push it with: git push origin ${version}`);
    }
    
    // Check for uncommitted changes
    const status = execSync('git status --porcelain', { encoding: 'utf-8' });
    if (status.trim()) {
      warnings.push('There are uncommitted changes in the repository. Don\'t forget to commit and push them.');
    }
  } catch {
    // Git commands failed, skip warnings
  }
  
  return warnings;
}

function main() {
  try {
    console.log('🔄 Synchronizing version...\n');
    
    // Extract and validate version
    const rawVersion = extractVersion();
    const validation = validateSemver(rawVersion);
    const version = validation.normalized;
    
    console.log(`📋 Version detected in constants.js: ${version}`);
    console.log(`   Semver: ${validation.major}.${validation.minor}.${validation.patch}\n`);
    
    // Find all text files in the project
    const textFiles = findTextFiles(ROOT);
    console.log(`📂 Scanning ${textFiles.length} text files...\n`);
    
    // Update files
    const stats = {
      totalChanges: 0,
      filesUpdated: []
    };
    
    for (const filePath of textFiles) {
      // Skip constants.js (source of truth)
      if (filePath === CONSTANTS_PATH) continue;
      
      updateFileVersion(filePath, version, stats);
    }
    
    // Print results
    console.log('='.repeat(60));
    
    if (stats.totalChanges === 0) {
      console.log('✅ All files are already synchronized.');
    } else {
      console.log(`✅ ${stats.totalChanges} change(s) applied:\n`);
      
      for (const file of stats.filesUpdated) {
        const oldVersionsStr = file.oldVersions.join(', ');
        console.log(`   📄 ${file.path}`);
        console.log(`      ${file.count} occurrence(s): ${oldVersionsStr} → ${version}`);
      }
    }
    
    // Check git status and show warnings
    console.log('\n' + '='.repeat(60));
    console.log('📌 Git Status Check:\n');
    
    const warnings = checkGitStatus(version);
    
    if (warnings.length === 0) {
      console.log('   ✅ Repository is up to date.');
    } else {
      for (const warning of warnings) {
        console.log(`   ⚠️  ${warning}`);
      }
    }
    
    console.log('');
    process.exit(0);
  } catch (err) {
    console.error(`\n❌ Error: ${err.message}`);
    process.exit(1);
  }
}

main();
