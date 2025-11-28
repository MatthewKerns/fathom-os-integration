# Fathom Meeting Notes Integration

Automatically process meeting notes from Fathom and integrate them into the AI Agency Development OS.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

**Core Dependencies:**
- `express` - Web server
- `dotenv` - Environment configuration
- `@anthropic-ai/sdk` - Claude API
- `simple-git` - Git operations
- `axios` - HTTP client (Gamma & Slack)
- `zod` - Schema validation
- `winston` - Logging
- `helmet` - Security
- `express-rate-limit` - Rate limiting

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your credentials
```

### 3. Run Server

```bash
# Development
npm run dev

# Production
npm start
```

### 4. Configure Fathom Webhook

1. Go to Fathom settings
2. Add webhook URL: `https://your-server.com/webhook/fathom`
3. Copy webhook secret to `.env`

## Project Structure

```
fathom-integration/
├── src/
│   ├── index.js              # Entry point
│   ├── server.js             # Express server
│   ├── routes/
│   │   └── webhook.js        # Webhook handler
│   ├── services/
│   │   ├── claude.js         # Claude API
│   │   ├── contextLoader.js  # OS context
│   │   ├── fileManager.js    # Git operations
│   │   ├── gamma.js          # Gamma presentations
│   │   └── notifier.js       # Slack notifications
│   ├── prompts/
│   │   └── meetingProcessor.js
│   ├── schemas/
│   │   ├── webhookPayload.js
│   │   └── outputSchema.js
│   └── utils/
│       ├── logger.js
│       └── config.js
├── docs/                     # Full documentation
└── package.json

```

## Documentation

See `docs/` folder for comprehensive documentation:
- **README.md** - System overview
- **ARCHITECTURE.md** - System design
- **IMPLEMENTATION-PLAN.md** - Build guide
- **prompts/MEETING-PROCESSOR.md** - Claude prompts
- **schemas/** - Data schemas
- **examples/** - Sample data

## How It Works

```
Meeting ends → Fathom webhook → Server receives →
Load OS context → Claude processes → Files updated →
Gamma presentation created → Slack notification sent
```

**What gets created:**
- 📝 Structured meeting notes in AI Agency OS
- 🎨 Gamma presentation with insights & action items
- 💬 Slack notification to #meeting-summaries
- 📊 Updated contact records
- ✅ Tracked action items by person

**Processing time:** ~30-45 seconds
**Manual time saved:** ~45 minutes per meeting

## Status

- [x] Documentation complete
- [ ] Core server setup
- [ ] Webhook receiver
- [ ] Claude integration
- [ ] File management
- [ ] Testing

---

**Reference:** See `docs/` for full implementation plan
