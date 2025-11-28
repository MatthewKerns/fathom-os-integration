# Fathom OS Integration

Automatically process Fathom meeting recordings and integrate structured notes directly into your AI Agency Development OS. This system uses Claude AI to analyze meetings, extract action items, update project files, and notify your team—saving ~45 minutes of manual work per meeting.

## 🎯 What This Does

When a Fathom meeting recording completes, this integration:

1. **Receives webhook** from Fathom with transcript and summary
2. **Analyzes with Claude AI** to classify meeting type and extract structured data
3. **Updates your OS files** automatically:
   - Creates meeting notes in appropriate directories
   - Updates partner-specific files for internal meetings
   - Tracks action items by priority (🔴 urgent, 🟡 important, 🟢 strategic)
   - Adds roadmap items and decisions
4. **Creates Gamma presentation** (optional) with meeting insights
5. **Sends Slack notifications** (optional) to your team channel

## ⚡ Current Status

**Phase 1 Complete ✅** - Core functionality implemented and tested
- Webhook processing pipeline
- Claude AI integration
- File management system
- Schema validation
- Context loading from OS
- Partner structure configured

**Ready for:** API key configuration and deployment

## 🚀 Quick Setup Guide

### Prerequisites

- Node.js 18+
- Git repository with your AI Agency OS
- Fathom account with webhook access
- Required API keys (see below)

### Step 1: Clone and Install

```bash
# Clone the repository
git clone https://github.com/MatthewKerns/fathom-os-integration.git
cd fathom-os-integration

# Install dependencies
npm install
```

### Step 2: Configure API Keys

```bash
# Copy environment template
cp .env.example .env

# Edit .env and add your keys
nano .env  # or use your preferred editor
```

**Required API Keys:**

| Key | Purpose | Get it from |
|-----|---------|-------------|
| `ANTHROPIC_API_KEY` | Claude AI processing | [console.anthropic.com](https://console.anthropic.com/settings/keys) |
| `FATHOM_WEBHOOK_SECRET` | Webhook verification | Fathom Settings → Webhooks |
| `OS_PATH` | Path to your AI Agency OS | Local directory path |

**Optional Enhancements:**

| Key | Purpose | Get it from |
|-----|---------|-------------|
| `GITHUB_TOKEN` | Auto-commit to GitHub | [github.com/settings/tokens](https://github.com/settings/tokens) |
| `GAMMA_API_KEY` | Generate presentations | [gamma.app](https://gamma.app) (Pro required) |
| `SLACK_WEBHOOK_URL` | Team notifications | [api.slack.com/apps](https://api.slack.com/apps) |

### Step 3: Test Your Setup

```bash
# Run the test suite
node test.js

# You should see:
# ✅ Environment Config
# ✅ Directory Structure
# ✅ Dependencies
# ✅ Claude API (if key configured)
# ✅ OS Context (if OS_PATH correct)
```

### Step 4: Start the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start

# Server runs on http://localhost:3000
```

### Step 5: Configure Fathom Webhook

1. Go to Fathom → Settings → Integrations → Webhooks
2. Click "Add Webhook"
3. Enter your server URL: `https://your-server.com/webhook/fathom`
4. Copy the webhook secret
5. Add it to your `.env` as `FATHOM_WEBHOOK_SECRET`
6. Save and test with a meeting

### Step 6: Test with Sample Data

```bash
# Test webhook processing without a real meeting
curl -X POST http://localhost:3000/webhook/test
```

## 📁 How Files Are Organized

The integration creates and updates files in your AI Agency OS based on meeting type:

| Meeting Type | Files Created/Updated |
|--------------|----------------------|
| **Internal Partner** | • `01-executive-office/internal-business-meetings/raw-notes/YYYY-MM-DD-topic.md`<br>• `by-partner/{partner}.md`<br>• `action-items/active-items.md` |
| **Coaching Call** | • `05-hr-department/network-contacts/coaching-call-notes/raw-notes/`<br>• `by-coach/{coach}.md` |
| **Client Call** | • `02-operations/project-management/active-projects/{project}.md` |
| **Networking** | • `05-hr-department/network-contacts/by-category/{category}/{name}.md` |

## 👥 Equity Partners

The system recognizes these equity partners for internal meeting classification:

- **Matthew** (Architect) - Software development, OS development, agency building, prototyping
- **Trent** (Architect) - Software development, robotics, automation, developer hiring/onboarding
- **Mekaiel** - Systems, onboarding, sales, content systems, video editing
- **Chris** - Systems, onboarding, sales, lead management

## 🔧 Configuration Details

### Required Environment Variables

```bash
# Core Requirements
ANTHROPIC_API_KEY=sk-ant-api03-...  # Claude API for processing
FATHOM_WEBHOOK_SECRET=fws_...        # From Fathom webhook settings
OS_PATH=/path/to/your/ai-agency-os   # Local path to your OS repo

# Optional but Recommended
GITHUB_TOKEN=ghp_...                 # For auto-committing changes
GITHUB_REPO=YourName/ai-agency-os    # Your OS repository
GAMMA_API_KEY=sk-gamma-...           # For presentations (Pro required)
SLACK_WEBHOOK_URL=https://hooks...   # For team notifications
```

### Server Configuration

```bash
# Server Settings
PORT=3000                    # Server port
NODE_ENV=production         # or 'development'
LOG_LEVEL=info              # debug, info, warn, error

# Git Configuration
GIT_AUTHOR_NAME=Fathom Bot
GIT_AUTHOR_EMAIL=bot@your-agency.com
```

## 📊 What Gets Processed

From each meeting, the system extracts:

- **Classification** - Meeting type with confidence score
- **Attendees** - Names, emails, roles, new information learned
- **Action Items** - Owner, priority, deadline, context
- **Roadmap Items** - New initiatives, features, priorities
- **Decisions** - What was decided and why
- **Key Learnings** - About people, projects, market, strategy

## 🚨 Troubleshooting

### Common Issues

**"ANTHROPIC_API_KEY not configured"**
- Add your Claude API key to `.env`
- Get one at [console.anthropic.com](https://console.anthropic.com)

**"Cannot find OS path"**
- Update `OS_PATH` in `.env` to absolute path of your AI Agency OS
- Example: `/Users/yourname/workspace/ai-agency-development-os`

**"Invalid webhook signature"**
- Ensure `FATHOM_WEBHOOK_SECRET` matches exactly from Fathom settings
- No extra spaces or quotes

**Port already in use**
- Change `PORT` in `.env` to different port (e.g., 3001)
- Or kill existing process: `lsof -ti:3000 | xargs kill`

### Testing

```bash
# Run full test suite
node test.js

# Test webhook endpoint
curl http://localhost:3000/webhook/health

# Check logs
tail -f logs/combined.log
```

## 🛠 Development

### Running Tests
```bash
node test.js  # Comprehensive test suite
```

### File Structure
```
fathom-os-integration/
├── src/
│   ├── middleware/        # Webhook validation
│   ├── prompts/          # Claude prompts
│   ├── routes/           # Express routes
│   ├── schemas/          # Zod validation
│   ├── services/         # Core services
│   └── utils/            # Helpers
├── docs/                 # Documentation
├── logs/                 # Application logs
└── test.js              # Test suite
```

### Key Files
- `src/services/processor.js` - Main orchestration
- `src/prompts/meetingProcessor.js` - Claude prompt builder
- `src/schemas/outputSchema.js` - Response validation
- `src/services/fileManager.js` - File operations

## 📈 Performance

- **Processing time:** ~30-45 seconds per meeting
- **Manual time saved:** ~45 minutes per meeting
- **Token usage:** ~2,000-6,000 tokens per meeting (depending on length)
- **Cost:** ~$0.015 per meeting (Claude API only)

## 🔒 Security

- Webhook signature verification (HMAC-SHA256)
- Rate limiting (10 requests/minute)
- Input validation with Zod schemas
- Helmet.js security headers
- No sensitive data in logs

## 📝 License

ISC License - See LICENSE file

## 🤝 Support

- **Issues:** [GitHub Issues](https://github.com/MatthewKerns/fathom-os-integration/issues)
- **Documentation:** See `docs/` folder
- **Implementation Guide:** `docs/IMPLEMENTATION-PLAN.md`

---

**Built by:** Matthew Kerns and the AI Agency Team
**Status:** Phase 1 Complete ✅ - Ready for deployment