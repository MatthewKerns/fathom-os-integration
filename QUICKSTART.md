# Quick Start Guide

Get the Fathom integration running in 5 minutes.

## Step 1: Install Dependencies

```bash
cd ~/workspace/fathom-integration
npm install
```

If it times out, install in batches (see [INSTALL.md](INSTALL.md))

## Step 2: Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add your keys:
```bash
ANTHROPIC_API_KEY=sk-ant-xxx
FATHOM_WEBHOOK_SECRET=your_secret
GITHUB_TOKEN=ghp_xxx
OS_PATH=/Users/matthewkerns/workspace/ai-agency-development-os

# Optional but recommended
GAMMA_API_KEY=sk-gamma-xxx
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx
```

See [API_KEYS_REQUIRED.md](API_KEYS_REQUIRED.md) for detailed setup instructions.

## Step 3: Run Setup Check

```bash
npm run setup
```

Should show ✅ for all checks.

## Step 4: Start Server

```bash
# Development (auto-reload)
npm run dev

# Production
npm start
```

Server runs on http://localhost:3000

## Step 5: Test Health

```bash
curl http://localhost:3000/health
```

Should return: `{"status":"ok","timestamp":"..."}`

## Step 6: Configure Fathom

1. Go to Fathom settings → Webhooks
2. Add webhook URL: `https://your-server.com/webhook/fathom`
3. Copy webhook secret to `.env`
4. Restart server

## What's Next?

The current implementation is a skeleton. To complete:

1. **Implement prompt template** (`src/prompts/meetingProcessor.js`)
2. **Add schemas** (`src/schemas/`) using Zod
3. **Complete context loader** (`src/services/contextLoader.js`)
4. **Finish file manager** (`src/services/fileManager.js`)
5. **Test with sample data** (see `docs/examples/`)

See [docs/IMPLEMENTATION-PLAN.md](docs/IMPLEMENTATION-PLAN.md) for full roadmap.

## Project Status

- ✅ Project structure created
- ✅ Basic server setup
- ✅ Route handlers stubbed
- ✅ Service layer stubbed
- ✅ Documentation imported
- ⏳ Prompt template (TODO)
- ⏳ Schema validation (TODO)
- ⏳ File operations (TODO)
- ⏳ Testing (TODO)

## Estimated Time to Complete

- Phase 1 (Core): 4-6 hours
- Phase 2 (Testing): 2-3 hours
- Phase 3 (Polish): 1-2 hours

**Total: 8-12 hours**

## Files Reference

| File | Purpose |
|------|---------|
| `src/index.js` | Server entry point |
| `src/server.js` | Express app setup |
| `src/routes/webhook.js` | Fathom webhook handler |
| `src/services/claude.js` | Claude API integration |
| `src/services/contextLoader.js` | Load OS context |
| `src/services/fileManager.js` | Git file operations |
| `src/services/notifier.js` | Slack notifications |
| `src/utils/config.js` | Environment config |
| `src/utils/logger.js` | Winston logger |

## Support

- **Documentation:** See `docs/` folder
- **Implementation Plan:** `docs/IMPLEMENTATION-PLAN.md`
- **Architecture:** `docs/ARCHITECTURE.md`
- **Examples:** `docs/examples/`
