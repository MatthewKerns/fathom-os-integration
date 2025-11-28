# API Keys Required

Complete list of API keys needed for the Fathom integration to work with your AI Agency OS projects.

## Required Keys (Must Have)

### 1. ANTHROPIC_API_KEY ⚡ **REQUIRED**
**What it does:** Processes meeting transcripts with Claude AI to extract structured data

**Where to get it:**
1. Go to https://console.anthropic.com/settings/keys
2. Click "Create Key"
3. Copy the key (format: `sk-ant-api03-...`)

**Add to .env:**
```bash
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxx
```

**Cost:** Pay-as-you-go, ~$0.015 per meeting

---

### 2. FATHOM_WEBHOOK_SECRET ⚡ **REQUIRED**
**What it does:** Verifies webhook authenticity from Fathom

**Where to get it:**
1. Go to Fathom → Settings → Integrations
2. Click "Webhooks"
3. Add new webhook: `https://your-server.com/webhook/fathom`
4. Copy the webhook secret provided

**Add to .env:**
```bash
FATHOM_WEBHOOK_SECRET=your_secret_here
```

**Cost:** Free (part of Fathom subscription)

---

### 3. GITHUB_TOKEN ⚡ **REQUIRED**
**What it does:** Commits processed meeting notes to your AI Agency OS repos

**Where to get it:**
1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scopes: `repo` (full control of private repositories)
4. Generate and copy token (format: `ghp_...` or `github_pat_...`)

**Add to .env:**
```bash
GITHUB_TOKEN=ghp_xxxxxxxxxxxx
GITHUB_REPO=MatthewKerns/ai-agency-development-os
GIT_AUTHOR_NAME=Fathom Bot
GIT_AUTHOR_EMAIL=bot@matthewkerns.com
```

**Cost:** Free

---

## Optional Keys (Recommended)

### 4. GAMMA_API_KEY 🎨 **OPTIONAL** (NEW!)
**What it does:** Auto-generates beautiful presentations from meeting data

**Where to get it:**
1. Go to https://gamma.app
2. Upgrade to Pro account (required for API)
3. Go to Account Settings → API
4. Create new API key (format: `sk-gamma-...`)

**Add to .env:**
```bash
GAMMA_API_KEY=sk-gamma-xxxxxxxx
GAMMA_THEME_ID=Oasis
```

**What you get:**
- Auto-generated presentation for each meeting
- Slides with summary, action items, insights, next steps
- Professional formatting with AI-generated images
- Link included in Slack notifications

**Cost:** Included with Gamma Pro ($15-20/month), no additional API costs

---

### 5. SLACK_WEBHOOK_URL 💬 **OPTIONAL**
**What it does:** Sends meeting summaries to #meeting-summaries channel

**Where to get it:**
1. Go to https://api.slack.com/apps
2. Create new app (or use existing)
3. Enable "Incoming Webhooks"
4. Add webhook to workspace
5. Select `#meeting-summaries` channel
6. Copy webhook URL

**Add to .env:**
```bash
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXX
SLACK_CHANNEL=#meeting-summaries
```

**What you get:**
- Rich formatted notifications in Slack
- Meeting summary, action items, attendee count
- Link to Gamma presentation (if enabled)
- Posted to dedicated channel for easy reference

**Cost:** Free

---

## Configuration Paths

### OS_PATH ⚡ **REQUIRED**
**What it does:** Points to your AI Agency OS directory for context and file updates

**Add to .env:**
```bash
OS_PATH=/Users/matthewkerns/workspace/ai-agency-development-os
```

Or for sales OS:
```bash
OS_PATH=/Users/matthewkerns/workspace/ai-agency-sales-os
```

---

## Quick Setup Checklist

```bash
cd ~/workspace/fathom-os-integration
cp .env.example .env
```

Edit `.env` and add:

- [ ] ✅ ANTHROPIC_API_KEY
- [ ] ✅ FATHOM_WEBHOOK_SECRET
- [ ] ✅ GITHUB_TOKEN
- [ ] ✅ GITHUB_REPO
- [ ] ✅ OS_PATH
- [ ] 🎨 GAMMA_API_KEY (optional but awesome)
- [ ] 💬 SLACK_WEBHOOK_URL (optional but helpful)

Then:
```bash
npm install
npm run setup  # Verify all configs
npm run dev    # Start server
```

---

## Complete .env Example

```bash
# Server
PORT=3000
NODE_ENV=development
LOG_LEVEL=debug

# Fathom
FATHOM_WEBHOOK_SECRET=your_webhook_secret_here

# Claude
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxx

# GitHub / Git
GITHUB_TOKEN=ghp_xxxxxxxxxxxx
GITHUB_REPO=MatthewKerns/ai-agency-development-os
GIT_AUTHOR_NAME=Fathom Bot
GIT_AUTHOR_EMAIL=bot@matthewkerns.com

# AI Agency OS Path
OS_PATH=/Users/matthewkerns/workspace/ai-agency-development-os

# Gamma (optional - requires Pro account)
GAMMA_API_KEY=sk-gamma-xxxxxxxx
GAMMA_THEME_ID=Oasis

# Slack (optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXX
SLACK_CHANNEL=#meeting-summaries
```

---

## Feature Matrix

| Feature | Required Keys | What You Get |
|---------|--------------|--------------|
| **Basic Processing** | Anthropic, Fathom, GitHub | Meeting notes committed to OS |
| **+ Presentations** | + Gamma | Auto-generated slide decks |
| **+ Notifications** | + Slack | Team notifications with links |

---

## Cost Summary

| Service | Cost | Required? |
|---------|------|-----------|
| Anthropic Claude | ~$0.015/meeting | ✅ Required |
| Fathom | Part of subscription | ✅ Required |
| GitHub | Free | ✅ Required |
| Gamma Pro | $15-20/month | 🎨 Optional |
| Slack | Free | 💬 Optional |

**Total required cost:** ~$0.015 per meeting (just Claude)
**Total with all features:** ~$15-20/month + $0.015/meeting

**ROI:** Saves ~45 minutes of manual work per meeting
