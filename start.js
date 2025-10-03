#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Starting E-Siddhi Vidyalay Homepage Design...\n');

// Function to run a command
function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`📋 Running: ${command} ${args.join(' ')}`);

    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      cwd: __dirname,
      ...options
    });

    child.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ Command completed successfully\n`);
        resolve();
      } else {
        console.log(`❌ Command failed with exit code ${code}\n`);
        reject(new Error(`Command failed: ${command} ${args.join(' ')}`));
      }
    });

    child.on('error', (error) => {
      console.log(`❌ Command error: ${error.message}\n`);
      reject(error);
    });
  });
}

async function startApplication() {
  try {
    // Step 1: Install dependencies
    console.log('📦 Installing dependencies...');
    await runCommand('npm', ['install']);
    console.log('✅ Dependencies installed\n');

    // Step 2: Start the backend server in background
    console.log('🖥️  Starting backend server...');
    const serverProcess = spawn('node', ['server.js'], {
      stdio: 'inherit',
      shell: true,
      cwd: __dirname,
      detached: true
    });

    // Give server time to start
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('✅ Backend server started on http://localhost:3002\n');

    // Step 3: Start the frontend development server
    console.log('🌐 Starting frontend development server...');
    await runCommand('npm', ['run', 'dev'], { stdio: 'inherit' });

  } catch (error) {
    console.error('❌ Failed to start application:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure PostgreSQL is running');
    console.log('2. Make sure the database "e_siddhi_school" exists');
    console.log('3. Run the database setup scripts if needed:');
    console.log('   - node create-database.js');
    console.log('   - node setup-database.js');
    console.log('   - node check-tables.js');
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down...');
  process.exit(0);
});

// Start the application
startApplication();
