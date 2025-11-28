#!/usr/bin/env node

/**
 * Test script for Fathom OS Integration
 * Run with: node test.js
 */

const path = require('path');
const fs = require('fs').promises;

// Load environment variables
require('dotenv').config();

const config = require('./src/utils/config');
const logger = require('./src/utils/logger');

// Import services
const { testConnection } = require('./src/services/claude');
const { loadContext } = require('./src/services/contextLoader');
const { processTestWebhook } = require('./src/services/processor');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, colors.blue);
  console.log('='.repeat(60));
}

async function checkEnvironment() {
  logSection('Checking Environment Configuration');

  const checks = [
    {
      name: 'ANTHROPIC_API_KEY',
      value: config.anthropic?.apiKey,
      required: true
    },
    {
      name: 'FATHOM_WEBHOOK_SECRET',
      value: config.fathom?.webhookSecret,
      required: true
    },
    {
      name: 'OS_PATH',
      value: config.os?.path,
      required: true
    },
    {
      name: 'GITHUB_TOKEN',
      value: config.github?.token,
      required: false
    },
    {
      name: 'GAMMA_API_KEY',
      value: config.gamma?.apiKey,
      required: false
    },
    {
      name: 'SLACK_WEBHOOK_URL',
      value: config.slack?.webhookUrl,
      required: false
    }
  ];

  let allRequired = true;

  for (const check of checks) {
    const status = check.value ? '✓' : '✗';
    const color = check.value ? colors.green : (check.required ? colors.red : colors.yellow);
    const label = check.required && !check.value ? ' (REQUIRED)' : '';
    log(`${status} ${check.name}${label}`, color);

    if (check.required && !check.value) {
      allRequired = false;
    }
  }

  return allRequired;
}

async function checkDirectories() {
  logSection('Checking Directory Structure');

  const dirs = [
    'src/prompts',
    'src/schemas',
    'src/services',
    'src/middleware',
    'src/routes',
    'src/utils',
    'logs'
  ];

  let allExist = true;

  for (const dir of dirs) {
    try {
      await fs.access(path.join(__dirname, dir));
      log(`✓ ${dir}`, colors.green);
    } catch {
      log(`✗ ${dir}`, colors.red);
      allExist = false;
    }
  }

  return allExist;
}

async function checkDependencies() {
  logSection('Checking Node Dependencies');

  const packageJson = require('./package.json');
  const requiredDeps = [
    'express',
    'dotenv',
    '@anthropic-ai/sdk',
    'simple-git',
    'zod',
    'winston',
    'helmet',
    'express-rate-limit'
  ];

  let allInstalled = true;

  for (const dep of requiredDeps) {
    const installed = packageJson.dependencies[dep] || packageJson.devDependencies[dep];
    if (installed) {
      log(`✓ ${dep} (${installed})`, colors.green);
    } else {
      log(`✗ ${dep} - Not in package.json`, colors.red);
      allInstalled = false;
    }

    // Check if actually installed
    try {
      require.resolve(dep);
    } catch {
      log(`  ⚠ ${dep} not installed - run npm install`, colors.yellow);
      allInstalled = false;
    }
  }

  return allInstalled;
}

async function testClaude() {
  logSection('Testing Claude API Connection');

  try {
    log('Testing Claude API key...', colors.yellow);
    const connected = await testConnection();

    if (connected) {
      log('✓ Claude API connection successful', colors.green);
      return true;
    } else {
      log('✗ Claude API connection failed', colors.red);
      return false;
    }
  } catch (error) {
    log(`✗ Claude API error: ${error.message}`, colors.red);
    return false;
  }
}

async function testOSContext() {
  logSection('Testing OS Context Loading');

  try {
    log('Loading OS context...', colors.yellow);
    const context = await loadContext();

    log(`✓ Contacts loaded: ${context.contacts.length}`, colors.green);
    log(`✓ Projects loaded: ${context.projects.length}`, colors.green);
    log(`✓ Coaches loaded: ${context.coaches.length}`, colors.green);
    log(`✓ Partners loaded: ${Object.keys(context.partners).length}`, colors.green);

    return true;
  } catch (error) {
    log(`✗ Context loading failed: ${error.message}`, colors.red);
    return false;
  }
}

async function testWebhookProcessing() {
  logSection('Testing Webhook Processing (Dry Run)');

  // Check if we should skip this test (no API key)
  if (!config.anthropic?.apiKey) {
    log('⚠ Skipping webhook test - no Claude API key', colors.yellow);
    return true;
  }

  try {
    log('Processing test webhook...', colors.yellow);
    log('Note: This will NOT actually call Claude API or modify files', colors.yellow);

    // Create a test webhook payload
    const testPayload = {
      event: 'meeting.completed',
      timestamp: new Date().toISOString(),
      meeting: {
        id: 'test_001',
        title: 'Test Meeting - Do Not Process',
        url: 'https://fathom.video/share/test',
        duration_seconds: 600
      },
      attendees: [
        { name: 'Test User', email: 'test@example.com' }
      ],
      summary: 'This is a test meeting for validation purposes.',
      action_items: [],
      transcript: []
    };

    // Just validate the structure, don't actually process
    const { WebhookPayloadSchema } = require('./src/schemas/webhookPayload');
    const validation = WebhookPayloadSchema.safeParse(testPayload);

    if (validation.success) {
      log('✓ Test webhook structure is valid', colors.green);
      return true;
    } else {
      log('✗ Test webhook validation failed', colors.red);
      console.log(validation.error.errors);
      return false;
    }
  } catch (error) {
    log(`✗ Webhook test failed: ${error.message}`, colors.red);
    return false;
  }
}

async function checkGitRepo() {
  logSection('Checking Git Repository');

  try {
    const simpleGit = require('simple-git');
    const git = simpleGit(config.os?.path || '.');

    const isRepo = await git.checkIsRepo();
    if (isRepo) {
      log('✓ Git repository detected', colors.green);
      const status = await git.status();
      log(`  Branch: ${status.current}`, colors.blue);
      log(`  Modified files: ${status.modified.length}`, colors.blue);
      return true;
    } else {
      log('✗ Not a git repository', colors.red);
      return false;
    }
  } catch (error) {
    log(`✗ Git check failed: ${error.message}`, colors.red);
    return false;
  }
}

async function runAllTests() {
  console.log('\n' + '='.repeat(60));
  log('FATHOM OS INTEGRATION - PHASE 1 TEST SUITE', colors.blue);
  console.log('='.repeat(60));

  const results = {
    environment: await checkEnvironment(),
    directories: await checkDirectories(),
    dependencies: await checkDependencies(),
    claude: false,
    context: false,
    webhook: false,
    git: false
  };

  // Only test services if environment is configured
  if (results.environment) {
    results.claude = await testClaude();
    results.context = await testOSContext();
    results.webhook = await testWebhookProcessing();
    results.git = await checkGitRepo();
  }

  // Summary
  logSection('Test Summary');

  const tests = [
    { name: 'Environment Config', passed: results.environment },
    { name: 'Directory Structure', passed: results.directories },
    { name: 'Dependencies', passed: results.dependencies },
    { name: 'Claude API', passed: results.claude },
    { name: 'OS Context', passed: results.context },
    { name: 'Webhook Structure', passed: results.webhook },
    { name: 'Git Repository', passed: results.git }
  ];

  let passedCount = 0;

  for (const test of tests) {
    const status = test.passed ? '✓ PASS' : '✗ FAIL';
    const color = test.passed ? colors.green : colors.red;
    log(`${status} - ${test.name}`, color);
    if (test.passed) passedCount++;
  }

  console.log('\n' + '='.repeat(60));
  const overallColor = passedCount === tests.length ? colors.green : colors.yellow;
  log(`Overall: ${passedCount}/${tests.length} tests passed`, overallColor);

  if (passedCount < tests.length) {
    console.log('\nNext steps:');
    if (!results.environment) {
      log('1. Copy .env.example to .env and add your API keys', colors.yellow);
    }
    if (!results.dependencies) {
      log('2. Run: npm install', colors.yellow);
    }
    if (!results.claude) {
      log('3. Add valid ANTHROPIC_API_KEY to .env', colors.yellow);
    }
  } else {
    log('\n✓ Phase 1 implementation is complete and ready!', colors.green);
    log('\nYou can now:', colors.blue);
    log('1. Start the server: npm run dev', colors.blue);
    log('2. Configure Fathom webhook to point to your server', colors.blue);
    log('3. Test with: curl -X POST http://localhost:3000/webhook/test', colors.blue);
  }

  console.log('='.repeat(60) + '\n');
}

// Run tests
runAllTests().catch(error => {
  log(`\n✗ Test suite error: ${error.message}`, colors.red);
  process.exit(1);
});