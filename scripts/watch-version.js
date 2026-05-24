#!/usr/bin/env node

/**
 * Watcher for automatic version synchronization.
 * Monitors src/constants.js and runs sync-version.js when changes are detected.
 * 
 * Usage: node scripts/watch-version.js
 * Stop: Ctrl+C
 */

import { watch } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CONSTANTS_FILE = join(__dirname, '../src/constants.js');
const SYNC_SCRIPT = join(__dirname, 'sync-version.js');

// Debounce to prevent multiple executions on rapid saves
let debounceTimer = null;
const DEBOUNCE_MS = 500;

let isRunning = false;

async function runSync() {
  if (isRunning) {
    console.log('⏳ Sync already in progress, skipping...');
    return;
  }

  isRunning = true;
  console.log('\n🔔 Change detected in constants.js');
  console.log('🔄 Running sync-version.js...\n');

  try {
    const { stdout, stderr } = await execAsync(`node "${SYNC_SCRIPT}"`);
    
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
    
    console.log('✅ Sync complete. Watching for changes...\n');
  } catch (error) {
    console.error('❌ Error running sync:', error.message);
    if (error.stdout) console.log(error.stdout);
    if (error.stderr) console.error(error.stderr);
  } finally {
    isRunning = false;
  }
}

function debouncedSync() {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  
  debounceTimer = setTimeout(runSync, DEBOUNCE_MS);
}

function startWatcher() {
  console.log('👀 Watching for changes in src/constants.js...');
  console.log('📄 Target: for-perchance.html');
  console.log('⏱️  Debounce: 500ms');
  console.log('🛑 Press Ctrl+C to stop\n');

  try {
    watch(CONSTANTS_FILE, { persistent: true }, (eventType, filename) => {
      if (eventType === 'change') {
        debouncedSync();
      }
    });

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n\n👋 Stopping watcher...');
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      console.log('\n\n👋 Stopping watcher...');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Error starting watcher:', error.message);
    process.exit(1);
  }
}

// Run once on start to ensure everything is in sync
console.log('🚀 Starting version watcher...\n');
runSync().then(() => {
  startWatcher();
}).catch((error) => {
  console.error('❌ Initial sync failed:', error.message);
  process.exit(1);
});
