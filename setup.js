#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up Fathom Integration...\n');

// 1. Check Node version
console.log('1. Checking Node.js version...');
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
if (majorVersion < 18) {
  console.error('❌ Node.js 18+ required. Current:', nodeVersion);
  process.exit(1);
}
console.log('✅ Node.js version:', nodeVersion);

// 2. Create logs directory
console.log('\n2. Creating logs directory...');
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
  console.log('✅ Created logs directory');
} else {
  console.log('✅ Logs directory exists');
}

// 3. Check for .env file
console.log('\n3. Checking environment configuration...');
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');
if (!fs.existsSync(envPath)) {
  console.log('⚠️  No .env file found');
  console.log('   Copy .env.example to .env and configure:');
  console.log('   cp .env.example .env');
} else {
  console.log('✅ .env file exists');
}

// 4. Check required env vars (if .env exists)
if (fs.existsSync(envPath)) {
  require('dotenv').config();
  const requiredVars = [
    'ANTHROPIC_API_KEY',
    'FATHOM_WEBHOOK_SECRET',
    'OS_PATH',
  ];

  console.log('\n4. Checking required environment variables...');
  let missingVars = [];
  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName);
      console.log(`   ❌ Missing: ${varName}`);
    } else {
      console.log(`   ✅ ${varName}`);
    }
  });

  if (missingVars.length > 0) {
    console.log('\n⚠️  Please configure missing variables in .env');
  }
}

// 5. Verify OS path
console.log('\n5. Checking AI Agency Development OS path...');
const osPath = process.env.OS_PATH || '/Users/matthewkerns/workspace/ai-agency-development-os';
if (fs.existsSync(osPath)) {
  console.log('✅ OS path exists:', osPath);
} else {
  console.log('❌ OS path not found:', osPath);
  console.log('   Update OS_PATH in .env');
}

console.log('\n✅ Setup complete!\n');
console.log('Next steps:');
console.log('1. Configure .env with your API keys');
console.log('2. Run: npm run dev');
console.log('3. Configure Fathom webhook to point to your server\n');
