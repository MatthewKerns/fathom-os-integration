# Fathom Integration Implementation Plan

Step-by-step guide to build the custom server integration.

---

## Overview

**Tech Stack:**
- Runtime: Node.js 18+
- Framework: Express.js
- AI: Claude API (Anthropic SDK)
- Git: simple-git or GitHub API
- Notifications: Slack SDK

**Estimated Build Time:** 8-12 hours

---

## Phase 1: Project Setup

### Step 1.1: Initialize Project

```bash
mkdir fathom-meeting-processor
cd fathom-meeting-processor
npm init -y
```

### Step 1.2: Install Dependencies

```bash
# Core
npm install express dotenv

# Claude API
npm install @anthropic-ai/sdk

# Git operations
npm install simple-git

# Slack notifications
npm install @slack/web-api

# Utilities
npm install zod          # Schema validation
npm install winston      # Logging
npm install helmet       # Security headers
npm install express-rate-limit  # Rate limiting
```

### Step 1.3: Project Structure

```
fathom-meeting-processor/
├── src/
│   ├── index.js              # Entry point
│   ├── server.js             # Express server setup
│   ├── routes/
│   │   └── webhook.js        # Fathom webhook handler
│   ├── services/
│   │   ├── claude.js         # Claude API integration
│   │   ├── contextLoader.js  # Load OS context
│   │   ├── fileManager.js    # Git operations
│   │   └── notifier.js       # Slack notifications
│   ├── prompts/
│   │   └── meetingProcessor.js  # Prompt template
│   ├── schemas/
│   │   ├── webhookPayload.js # Zod schema for Fathom
│   │   └── outputSchema.js   # Zod schema for Claude output
│   └── utils/
│       ├── logger.js         # Winston logger
│       └── config.js         # Environment config
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

### Step 1.4: Environment Configuration

Create `.env.example`:

```bash
# Server
PORT=3000
NODE_ENV=development
LOG_LEVEL=debug

# Fathom
FATHOM_WEBHOOK_SECRET=your_webhook_secret_here

# Claude
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# GitHub / Git
GITHUB_TOKEN=your_github_token_here
GITHUB_REPO=MatthewKerns/ai-agency-development-os
GIT_AUTHOR_NAME=Fathom Bot
GIT_AUTHOR_EMAIL=bot@example.com
OS_REPO_PATH=/path/to/local/ai-agency-development-os

# Slack
SLACK_BOT_TOKEN=xoxb-your-slack-bot-token
SLACK_CHANNEL_MEETINGS=C0123456789
SLACK_CHANNEL_URGENT=C0123456780
```

---

## Phase 2: Core Server

### Step 2.1: Express Server (`src/server.js`)

```javascript
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const logger = require('./utils/logger');
const webhookRoutes = require('./routes/webhook');

const app = express();

// Security
app.use(helmet());
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: { error: 'Too many requests' }
});
app.use('/webhook', limiter);

// Routes
app.use('/webhook', webhookRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
```

### Step 2.2: Webhook Route (`src/routes/webhook.js`)

```javascript
const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const { validateWebhook, validatePayload } = require('../middleware/validation');
const { processWebhook } = require('../services/processor');

router.post('/fathom', validateWebhook, validatePayload, async (req, res) => {
  const deliveryId = req.headers['x-fathom-delivery-id'];

  logger.info(`Received Fathom webhook`, { deliveryId });

  // Acknowledge receipt immediately
  res.status(200).json({ received: true, deliveryId });

  // Process asynchronously
  try {
    await processWebhook(req.body, deliveryId);
    logger.info(`Successfully processed webhook`, { deliveryId });
  } catch (error) {
    logger.error(`Failed to process webhook`, { deliveryId, error: error.message });
    // TODO: Add to retry queue or alert
  }
});

module.exports = router;
```

---

## Phase 3: Context Loader

### Step 3.1: Load OS Context (`src/services/contextLoader.js`)

```javascript
const fs = require('fs').promises;
const path = require('path');
const config = require('../utils/config');

const OS_PATH = config.osRepoPath;

async function loadContext() {
  const [contacts, projects, coaches, team] = await Promise.all([
    loadContacts(),
    loadProjects(),
    loadCoaches(),
    loadTeam()
  ]);

  return {
    contacts,
    projects,
    coaches,
    team,
    paths: {
      internalMeetings: '01-executive-office/internal-business-meetings/',
      coachingCalls: '05-hr-department/network-contacts/coaching-call-notes/',
      networkContacts: '05-hr-department/network-contacts/',
      activeProjects: '02-operations/project-management/active-projects/',
      dailyPlanning: '01-executive-office/daily-planning/logs/'
    }
  };
}

async function loadContacts() {
  const contactsPath = path.join(OS_PATH, 'claude-code-os-implementation/05-hr-department/network-contacts/by-category');
  const categories = ['clients', 'developers', 'coaches', 'potential-leads'];
  const contacts = [];

  for (const category of categories) {
    const categoryPath = path.join(contactsPath, category);
    try {
      const files = await fs.readdir(categoryPath);
      for (const file of files.filter(f => f.endsWith('.md'))) {
        const content = await fs.readFile(path.join(categoryPath, file), 'utf-8');
        contacts.push({
          name: extractName(content, file),
          email: extractEmail(content),
          category,
          filePath: `05-hr-department/network-contacts/by-category/${category}/${file}`
        });
      }
    } catch (e) {
      // Category folder may not exist
    }
  }

  return contacts;
}

async function loadProjects() {
  const projectsPath = path.join(OS_PATH, 'claude-code-os-implementation/02-operations/project-management/active-projects');
  const projects = [];

  try {
    const files = await fs.readdir(projectsPath);
    for (const file of files.filter(f => f.endsWith('.md'))) {
      const content = await fs.readFile(path.join(projectsPath, file), 'utf-8');
      projects.push({
        name: extractProjectName(content, file),
        client: extractClient(content),
        filePath: `02-operations/project-management/active-projects/${file}`
      });
    }
  } catch (e) {
    // No projects folder
  }

  return projects;
}

async function loadCoaches() {
  const coachesPath = path.join(OS_PATH, 'claude-code-os-implementation/05-hr-department/network-contacts/coaching-call-notes/by-coach');
  const coaches = [];

  try {
    const files = await fs.readdir(coachesPath);
    for (const file of files.filter(f => f.endsWith('.md'))) {
      coaches.push({
        name: file.replace('.md', '').replace(/-/g, ' '),
        filePath: `05-hr-department/network-contacts/coaching-call-notes/by-coach/${file}`
      });
    }
  } catch (e) {
    // No coaches folder
  }

  return coaches;
}

function loadTeam() {
  return {
    matthew: {
      name: 'Matthew Kerns',
      role: 'Architect',
      emailPatterns: ['matthew@', 'matt@']
    },
    linh: {
      name: 'Linh',
      role: 'Sales',
      emailPatterns: ['linh@']
    },
    mikael: {
      name: 'Mikael',
      role: 'BizDev',
      emailPatterns: ['mikael@', 'mekaiel@']
    }
  };
}

// Helper functions for parsing markdown
function extractName(content, filename) {
  const match = content.match(/^#\s+(.+)/m);
  return match ? match[1] : filename.replace('.md', '');
}

function extractEmail(content) {
  const match = content.match(/\*\*Email:\*\*\s*(.+)/i);
  return match ? match[1].trim() : null;
}

function extractProjectName(content, filename) {
  const match = content.match(/^#\s+(.+)/m);
  return match ? match[1] : filename.replace('.md', '');
}

function extractClient(content) {
  const match = content.match(/\*\*Client:\*\*\s*(.+)/i);
  return match ? match[1].trim() : null;
}

module.exports = { loadContext };
```

---

## Phase 4: Claude Integration

### Step 4.1: Claude Service (`src/services/claude.js`)

```javascript
const Anthropic = require('@anthropic-ai/sdk');
const config = require('../utils/config');
const logger = require('../utils/logger');
const { buildPrompt } = require('../prompts/meetingProcessor');

const anthropic = new Anthropic({
  apiKey: config.anthropicApiKey
});

async function processMeeting(webhookPayload, context) {
  const prompt = buildPrompt(webhookPayload, context);

  logger.debug('Sending to Claude', {
    meetingTitle: webhookPayload.meeting?.title,
    promptLength: prompt.length
  });

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8000,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ]
  });

  const responseText = message.content[0].text;

  // Extract JSON from response
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Claude response did not contain valid JSON');
  }

  const result = JSON.parse(jsonMatch[0]);

  logger.info('Claude processing complete', {
    classificationType: result.classification?.type,
    actionItemsCount: result.actionItems?.length,
    fileUpdatesCount: result.fileUpdates?.length
  });

  return result;
}

module.exports = { processMeeting };
```

### Step 4.2: Prompt Builder (`src/prompts/meetingProcessor.js`)

```javascript
const fs = require('fs');
const path = require('path');

// Load the prompt template from the OS documentation
// In production, this would read from:
// 05-hr-department/fathom-integration/prompts/MEETING-PROCESSOR.md

function buildPrompt(webhookPayload, context) {
  const { meeting, attendees, summary, action_items, transcript } = webhookPayload;

  // Format attendees list
  const attendeesList = attendees
    .map(a => `- ${a.name}${a.email ? ` (${a.email})` : ''}`)
    .join('\n');

  // Format action items
  const actionItemsList = action_items
    .map(item => `- ${item.text}${item.assignee ? ` [${item.assignee}]` : ''}`)
    .join('\n');

  // Format transcript (truncate if too long)
  const maxTranscriptLength = 50000;
  let transcriptText = transcript
    .map(t => `[${t.speaker}]: ${t.text}`)
    .join('\n');

  if (transcriptText.length > maxTranscriptLength) {
    transcriptText = transcriptText.slice(-maxTranscriptLength);
    transcriptText = '... [transcript truncated] ...\n' + transcriptText;
  }

  // Format contacts for context
  const contactsList = context.contacts
    .map(c => `- ${c.name}${c.email ? ` (${c.email})` : ''} [${c.category}]`)
    .join('\n');

  // Format projects
  const projectsList = context.projects
    .map(p => `- ${p.name}${p.client ? ` (Client: ${p.client})` : ''}`)
    .join('\n');

  // Format coaches
  const coachesList = context.coaches
    .map(c => `- ${c.name}`)
    .join('\n');

  // Build the full prompt
  return `You are processing meeting notes for the AI Agency Development OS.

[Full prompt from MEETING-PROCESSOR.md goes here - loaded from file]

## Current Date
${new Date().toISOString().split('T')[0]}

## Known Contacts
${contactsList || 'No contacts in database yet'}

## Active Projects
${projectsList || 'No active projects'}

## Known Coaches
${coachesList || 'No coaches in database yet'}

## Meeting Data from Fathom

**Meeting Title:** ${meeting.title || 'Untitled Meeting'}

**Date:** ${meeting.created_at?.split('T')[0] || new Date().toISOString().split('T')[0]}

**Duration:** ${Math.round((meeting.duration_seconds || 0) / 60)} minutes

**Attendees:**
${attendeesList}

**Fathom Summary:**
${summary || 'No summary available'}

**Fathom Action Items:**
${actionItemsList || 'No action items extracted'}

**Full Transcript:**
${transcriptText}

---

Analyze this meeting and respond with ONLY valid JSON following the schema provided.`;
}

module.exports = { buildPrompt };
```

---

## Phase 5: File Manager

### Step 5.1: Git Operations (`src/services/fileManager.js`)

```javascript
const simpleGit = require('simple-git');
const fs = require('fs').promises;
const path = require('path');
const config = require('../utils/config');
const logger = require('../utils/logger');

const git = simpleGit(config.osRepoPath);

async function applyFileUpdates(fileUpdates, meetingTitle, date) {
  const branchName = `auto/meeting-${date}-${Date.now()}`;

  try {
    // Ensure we're on main and up to date
    await git.checkout('main');
    await git.pull('origin', 'main');

    // Create new branch
    await git.checkoutLocalBranch(branchName);

    // Apply each file update
    for (const update of fileUpdates) {
      await applyUpdate(update);
    }

    // Commit changes
    const commitMessage = `Auto-process: ${meetingTitle} (${date})`;
    await git.add('.');
    await git.commit(commitMessage);

    // Push branch
    await git.push('origin', branchName);

    // Merge to main (if no conflicts)
    await git.checkout('main');
    await git.merge([branchName, '--no-ff', '-m', `Merge: ${commitMessage}`]);
    await git.push('origin', 'main');

    // Clean up branch
    await git.deleteLocalBranch(branchName, true);

    logger.info('File updates applied successfully', {
      branch: branchName,
      filesUpdated: fileUpdates.length
    });

    return { success: true, branch: branchName };

  } catch (error) {
    logger.error('Error applying file updates', { error: error.message });

    // Try to recover
    try {
      await git.checkout('main');
    } catch (e) {
      // Already on main or other issue
    }

    return { success: false, error: error.message, branch: branchName };
  }
}

async function applyUpdate(update) {
  const fullPath = path.join(config.osRepoPath, update.path);
  const dir = path.dirname(fullPath);

  // Ensure directory exists
  await fs.mkdir(dir, { recursive: true });

  switch (update.action) {
    case 'create':
      await fs.writeFile(fullPath, update.content, 'utf-8');
      break;

    case 'append':
      const existing = await fs.readFile(fullPath, 'utf-8').catch(() => '');
      await fs.writeFile(fullPath, existing + update.content, 'utf-8');
      break;

    case 'update_section':
      await updateSection(fullPath, update.section, update.content);
      break;

    default:
      throw new Error(`Unknown update action: ${update.action}`);
  }

  logger.debug('Applied file update', { path: update.path, action: update.action });
}

async function updateSection(filePath, sectionName, newContent) {
  const content = await fs.readFile(filePath, 'utf-8');

  // Find the section and add content after the table header
  const sectionRegex = new RegExp(`(## ${sectionName}[\\s\\S]*?\\|[\\s\\S]*?\\|\\n)`, 'i');
  const match = content.match(sectionRegex);

  if (match) {
    // Insert new row after the header row
    const updated = content.replace(sectionRegex, `$1${newContent}\n`);
    await fs.writeFile(filePath, updated, 'utf-8');
  } else {
    // Section not found, append to end
    await fs.writeFile(filePath, content + `\n\n## ${sectionName}\n\n${newContent}\n`, 'utf-8');
  }
}

module.exports = { applyFileUpdates };
```

---

## Phase 6: Notifications

### Step 6.1: Slack Notifier (`src/services/notifier.js`)

```javascript
const { WebClient } = require('@slack/web-api');
const config = require('../utils/config');
const logger = require('../utils/logger');

const slack = new WebClient(config.slackBotToken);

async function sendNotification(result, meetingTitle) {
  try {
    // Main meeting notification
    await slack.chat.postMessage({
      channel: config.slackChannelMeetings,
      text: result.notifications.slackSummary,
      mrkdwn: true
    });

    // Urgent alert if needed
    if (result.notifications.urgentAlert) {
      await slack.chat.postMessage({
        channel: config.slackChannelUrgent,
        text: result.notifications.urgentAlert,
        mrkdwn: true
      });
    }

    logger.info('Slack notifications sent', { meetingTitle });

  } catch (error) {
    logger.error('Failed to send Slack notification', { error: error.message });
    // Don't throw - notification failure shouldn't fail the whole process
  }
}

async function sendErrorAlert(error, meetingTitle) {
  try {
    await slack.chat.postMessage({
      channel: config.slackChannelUrgent,
      text: `⚠️ *Meeting Processing Failed*\n\nMeeting: ${meetingTitle}\nError: ${error.message}\n\nManual processing required.`,
      mrkdwn: true
    });
  } catch (e) {
    logger.error('Failed to send error alert', { error: e.message });
  }
}

module.exports = { sendNotification, sendErrorAlert };
```

---

## Phase 7: Main Processor

### Step 7.1: Orchestrator (`src/services/processor.js`)

```javascript
const { loadContext } = require('./contextLoader');
const { processMeeting } = require('./claude');
const { applyFileUpdates } = require('./fileManager');
const { sendNotification, sendErrorAlert } = require('./notifier');
const logger = require('../utils/logger');

async function processWebhook(payload, deliveryId) {
  const meetingTitle = payload.meeting?.title || 'Untitled Meeting';
  const meetingDate = payload.meeting?.created_at?.split('T')[0] ||
    new Date().toISOString().split('T')[0];

  logger.info('Starting meeting processing', { meetingTitle, deliveryId });

  try {
    // Step 1: Load current OS context
    const context = await loadContext();
    logger.debug('Context loaded', {
      contactsCount: context.contacts.length,
      projectsCount: context.projects.length
    });

    // Step 2: Process with Claude
    const result = await processMeeting(payload, context);

    // Step 3: Apply file updates
    const fileResult = await applyFileUpdates(
      result.fileUpdates,
      meetingTitle,
      meetingDate
    );

    if (!fileResult.success) {
      throw new Error(`File update failed: ${fileResult.error}`);
    }

    // Step 4: Send notifications
    await sendNotification(result, meetingTitle);

    logger.info('Meeting processing complete', {
      meetingTitle,
      deliveryId,
      classificationType: result.classification.type,
      actionItemsCount: result.actionItems.length,
      filesUpdated: result.fileUpdates.length
    });

    return result;

  } catch (error) {
    logger.error('Meeting processing failed', {
      meetingTitle,
      deliveryId,
      error: error.message
    });

    await sendErrorAlert(error, meetingTitle);
    throw error;
  }
}

module.exports = { processWebhook };
```

---

## Phase 8: Deployment

### Step 8.1: Deployment Options

**Option A: VPS (Recommended for simplicity)**
- DigitalOcean Droplet ($6/mo)
- Install Node.js, clone repo, run with PM2
- Use nginx for SSL/reverse proxy

**Option B: Railway/Render (Easy deployment)**
- Push to GitHub
- Connect to Railway
- Auto-deploy on push

**Option C: AWS Lambda (Serverless)**
- More complex setup
- Good for cost optimization at scale

### Step 8.2: PM2 Setup (for VPS)

```bash
# Install PM2
npm install -g pm2

# Start the application
pm2 start src/index.js --name fathom-processor

# Save process list
pm2 save

# Set up startup script
pm2 startup
```

### Step 8.3: Nginx Configuration

```nginx
server {
    listen 80;
    server_name meetings.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name meetings.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/meetings.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/meetings.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Phase 9: Fathom Configuration

### Step 9.1: Set Up Webhook in Fathom

1. Go to Fathom → Settings → API Access
2. Click "Add Webhook"
3. Enter URL: `https://meetings.yourdomain.com/webhook/fathom`
4. Select events: "Meeting Completed", "Transcript Ready"
5. Copy the webhook secret to your `.env` file
6. Test with a sample meeting

### Step 9.2: Verify Integration

```bash
# Test health endpoint
curl https://meetings.yourdomain.com/health

# Check logs
pm2 logs fathom-processor

# Test with manual webhook (for development)
curl -X POST https://meetings.yourdomain.com/webhook/fathom \
  -H "Authorization: Bearer YOUR_SECRET" \
  -H "Content-Type: application/json" \
  -d @test-payload.json
```

---

## Testing Checklist

- [ ] Server starts without errors
- [ ] Health endpoint returns 200
- [ ] Webhook endpoint validates auth token
- [ ] Invalid payloads return 400
- [ ] Context loader reads OS files correctly
- [ ] Claude returns valid JSON
- [ ] File updates create correct files
- [ ] Git commits have proper messages
- [ ] Slack notifications send correctly
- [ ] Error handling works for all failure modes
- [ ] End-to-end test with real Fathom meeting

---

## Maintenance

### Monitoring
- Set up uptime monitoring (UptimeRobot, etc.)
- Monitor error rates in logs
- Track processing times

### Updates
- Pull OS repo changes regularly
- Update dependencies monthly
- Review Claude prompt for improvements

### Backups
- Git history provides file backup
- Log rotation with PM2

---

**Last Updated:** 2025-11-27
