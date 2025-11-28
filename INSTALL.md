# Installation Guide

## Prerequisites

- Node.js 18+
- npm or yarn
- AI Agency Development OS repository cloned locally
- Anthropic API key
- Fathom account with webhook access

## Installation Steps

### 1. Install Dependencies

The npm install timed out during setup. Run manually:

```bash
cd ~/workspace/fathom-integration

# Install in batches if needed
npm install express dotenv
npm install @anthropic-ai/sdk
npm install simple-git
npm install @slack/web-api
npm install zod winston helmet express-rate-limit
npm install -D nodemon
```

Or all at once:
```bash
npm install
```

### 2. Run Setup Script

```bash
npm run setup
```

This will:
- Check Node.js version
- Create logs directory
- Verify .env configuration
- Check OS path

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add:

```bash
# Required
ANTHROPIC_API_KEY=sk-ant-...
FATHOM_WEBHOOK_SECRET=your_webhook_secret
OS_PATH=/Users/matthewkerns/workspace/ai-agency-development-os

# Optional
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
PORT=3000
```

### 4. Verify Setup

```bash
# Run setup check
npm run setup

# Start server in dev mode
npm run dev

# Test health endpoint
curl http://localhost:3000/health
```

Should return: `{"status":"ok","timestamp":"..."}`

### 5. Configure Fathom Webhook

1. Go to Fathom settings → Webhooks
2. Add new webhook:
   - URL: `https://your-server.com/webhook/fathom`
   - Copy the webhook secret
3. Add secret to `.env` as `FATHOM_WEBHOOK_SECRET`
4. Restart server

## Troubleshooting

### npm install fails

Try installing packages in smaller groups:
```bash
npm install express dotenv
npm install @anthropic-ai/sdk simple-git
# etc.
```

### Port already in use

Change `PORT` in `.env` to different port (e.g., 3001)

### Logs directory missing

Run: `npm run setup` or manually: `mkdir logs`

### Can't find OS path

Update `OS_PATH` in `.env` to absolute path of your ai-agency-development-os repo

## Development

```bash
# Development mode (auto-reload)
npm run dev

# Production mode
npm start
```

## Next Steps

See [README.md](README.md) for usage and [docs/IMPLEMENTATION-PLAN.md](docs/IMPLEMENTATION-PLAN.md) for development roadmap.
