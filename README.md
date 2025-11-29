# Fathom OS Integration

Automatically process Fathom meeting recordings and integrate structured notes directly into your Company Operating System. This system uses Claude AI to analyze meetings, extract action items, update project files, and notify your team—saving ~45 minutes of manual work per meeting.

## 🎯 What This Does

When a Fathom meeting recording completes, this integration:

1. **Receives webhook** from Fathom with transcript and summary
2. **Analyzes with Claude AI** to classify meeting type and extract structured data
3. **Updates your OS files** automatically:
   - Creates meeting notes in appropriate directories
   - Updates team member files for internal meetings
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
- Team structure configured

**Ready for:** API key configuration and deployment

## 🚀 Quick Setup Guide

### Prerequisites

- Node.js 18+
- Git repository with your Company OS
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
| `OS_PATH` | Path to your Company OS | Local directory path |

**Optional Enhancements:**

| Key | Purpose | Get it from |
|-----|---------|-------------|
| `GITHUB_TOKEN` | Auto-commit to GitHub | [github.com/settings/tokens](https://github.com/settings/tokens) |
| `GAMMA_API_KEY` | Generate presentations | [gamma.app](https://gamma.app) (Pro required) |
| `SLACK_WEBHOOK_URL` | Team notifications | [api.slack.com/apps](https://api.slack.com/apps) |

### Step 3: Configure Your Team

Edit `src/services/contextLoader.js` to add your team members:

```javascript
// Replace with your company's team structure
return {
  john: {
    email: 'john@company.com',
    role: 'CEO',
    name: 'John Smith'
  },
  sarah: {
    email: 'sarah@company.com',
    role: 'CTO',
    name: 'Sarah Johnson'
  },
  // Add more team members as needed
};
```

### Step 4: Test Your Setup

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

### Step 5: Start the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start

# Server runs on http://localhost:3000
```

### Step 6: Configure Fathom Webhook

1. Go to Fathom → Settings → Integrations → Webhooks
2. Click "Add Webhook"
3. Enter your server URL: `https://your-server.com/webhook/fathom`
4. Copy the webhook secret
5. Add it to your `.env` as `FATHOM_WEBHOOK_SECRET`
6. Save and test with a meeting

### Step 7: Test with Sample Data

```bash
# Test webhook processing without a real meeting
curl -X POST http://localhost:3000/webhook/test
```

## 📁 How Files Are Organized

The integration creates and updates files in your Company OS based on meeting type:

| Meeting Type | Files Created/Updated | Use Case |
|--------------|----------------------|----------|
| **Internal Team** | • `executive/meetings/raw-notes/YYYY-MM-DD-topic.md`<br>• `team/{member}.md`<br>• `action-items/active-items.md` | Team syncs, planning sessions |
| **Client/Customer** | • `clients/{client-name}/meetings/YYYY-MM-DD.md`<br>• `projects/{project}.md` | Client calls, project updates |
| **Vendor/Partner** | • `vendors/{vendor-name}/meetings/YYYY-MM-DD.md` | Vendor discussions, partnerships |
| **Interview** | • `hr/interviews/{candidate-name}-YYYY-MM-DD.md` | Recruitment, hiring |
| **Board/Investor** | • `board/meetings/YYYY-MM-DD.md`<br>• `board/action-items.md` | Board meetings, investor updates |

## 🏢 Customizing for Your Company

### Directory Structure

Modify `src/prompts/meetingProcessor.js` to match your company's file structure:

```javascript
// Example: Customize your OS structure
company-os/
├── executive/           # Leadership & strategy
├── operations/         # Day-to-day operations
├── sales/             # Sales & revenue
├── engineering/       # Product & development
├── hr/               # People & culture
├── finance/          # Financial management
└── clients/          # Customer relationships
```

### Meeting Types

Configure meeting classifications in `src/prompts/meetingProcessor.js`:

```javascript
// Customize meeting types for your company
- 'internal-team'     // Team meetings
- 'client-meeting'    // Customer calls
- 'sales-call'        // Sales opportunities
- 'vendor-meeting'    // Supplier/partner discussions
- 'interview'         // Hiring interviews
- 'board-meeting'     // Board/investor meetings
- 'training'          // Training sessions
- 'review'            // Performance/project reviews
```

### Action Item Owners

Update valid owners in `src/schemas/outputSchema.js` to match your team.

## 🔧 Configuration Details

### Required Environment Variables

```bash
# Core Requirements
ANTHROPIC_API_KEY=sk-ant-api03-...  # Claude API for processing
FATHOM_WEBHOOK_SECRET=fws_...        # From Fathom webhook settings
OS_PATH=/path/to/your/company-os     # Local path to your OS repo

# Optional but Recommended
GITHUB_TOKEN=ghp_...                 # For auto-committing changes
GITHUB_REPO=YourCompany/company-os   # Your OS repository
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
GIT_AUTHOR_EMAIL=bot@your-company.com
```

## 📊 What Gets Processed

From each meeting, the system extracts:

- **Classification** - Meeting type with confidence score
- **Attendees** - Names, emails, roles, new information learned
- **Action Items** - Owner, priority, deadline, context
- **Decisions** - What was decided and why
- **Next Steps** - Follow-ups and future actions
- **Key Topics** - Main discussion points
- **Risks/Issues** - Problems identified
- **Opportunities** - Business opportunities discussed

## 🎯 Use Cases by Department

### Executive Team
- Strategic planning sessions → Update strategy docs
- Leadership meetings → Track decisions and initiatives
- Board prep → Compile board materials

### Sales
- Customer calls → Update CRM records
- Pipeline reviews → Track deal progress
- QBRs → Generate account summaries

### Engineering
- Sprint planning → Update project trackers
- Architecture reviews → Document technical decisions
- Incident reviews → Create postmortems

### HR
- Interviews → Standardized interview notes
- Performance reviews → Track feedback
- Team meetings → Culture initiatives

### Finance
- Budget reviews → Track spending decisions
- Vendor negotiations → Document terms
- Audit meetings → Compliance tracking

## 🚨 Troubleshooting

### Common Issues

**"ANTHROPIC_API_KEY not configured"**
- Add your Claude API key to `.env`
- Get one at [console.anthropic.com](https://console.anthropic.com)

**"Cannot find OS path"**
- Update `OS_PATH` in `.env` to absolute path of your Company OS
- Example: `/Users/yourname/workspace/company-os`

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

### Key Files to Customize
- `src/services/contextLoader.js` - Your team structure
- `src/prompts/meetingProcessor.js` - Meeting types & OS structure
- `src/schemas/outputSchema.js` - Valid action item owners
- `src/services/fileManager.js` - File creation logic

## 📈 Performance

- **Processing time:** ~30-45 seconds per meeting
- **Manual time saved:** ~45 minutes per meeting
- **Token usage:** ~2,000-6,000 tokens per meeting (depending on length)
- **Cost:** ~$0.015 per meeting (Claude API only)
- **Capacity:** 100+ meetings/day per instance

## 🔒 Security

- Webhook signature verification (HMAC-SHA256)
- Rate limiting (10 requests/minute)
- Input validation with Zod schemas
- Helmet.js security headers
- No sensitive data in logs
- Optional encryption for stored files

## 🤝 Support

- **Issues:** [GitHub Issues](https://github.com/MatthewKerns/fathom-os-integration/issues)
- **Documentation:** See `docs/` folder
- **Implementation Guide:** `docs/IMPLEMENTATION-PLAN.md`

## 📝 License

ISC License - See LICENSE file

---

**Status:** Phase 1 Complete ✅ - Ready for deployment
**Suitable for:** Any company using Fathom for meeting recordings
**ROI:** Save ~45 minutes of manual work per meeting