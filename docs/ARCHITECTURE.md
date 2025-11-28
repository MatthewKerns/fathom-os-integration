# Fathom Integration Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FATHOM                                          │
│                    (Meeting Recording & Notes)                               │
│                                                                              │
│  Meeting ends → Processing → Webhook fired                                   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ POST /webhook/fathom
                                    │ (JSON payload)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         WEBHOOK SERVER                                       │
│                      (Node.js / Express)                                     │
│                                                                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐              │
│  │  Auth Middleware │→│ Payload Parser  │→│  Queue Manager  │              │
│  │  (verify token) │  │ (validate data) │  │ (rate limiting) │              │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CONTEXT LOADER                                       │
│                                                                              │
│  Loads from AI Agency Development OS:                                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐              │
│  │ Known Contacts  │  │ Active Projects │  │  Team Members   │              │
│  │ (for matching)  │  │ (for classify)  │  │ (Linh, Mikael)  │              │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘              │
│                                                                              │
│  ┌─────────────────┐  ┌─────────────────┐                                   │
│  │  Known Coaches  │  │  File Structure │                                   │
│  │ (Richard, Denis)│  │  (path mapping) │                                   │
│  └─────────────────┘  └─────────────────┘                                   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CLAUDE AI PROCESSOR                                  │
│                        (Claude API - Sonnet)                                 │
│                                                                              │
│  Input: Meeting data + OS context                                            │
│  Prompt: prompts/MEETING-PROCESSOR.md                                        │
│                                                                              │
│  Processing Steps:                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ 1. CLASSIFY     │ Determine meeting type based on attendees/title   │    │
│  │ 2. IDENTIFY     │ Match attendees to known contacts                 │    │
│  │ 3. EXTRACT      │ Pull action items, decisions, insights            │    │
│  │ 4. PRIORITIZE   │ Assign urgency levels to action items             │    │
│  │ 5. MAP          │ Determine which OS files need updates             │    │
│  │ 6. GENERATE     │ Create content for each file update               │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  Output: Structured JSON (see schemas/OUTPUT-SCHEMA.md)                      │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FILE MANAGER                                         │
│                      (GitHub API / Git CLI)                                  │
│                                                                              │
│  For each file update from Claude:                                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐              │
│  │  Read Current   │→│  Apply Changes  │→│    Commit       │              │
│  │  File Content   │  │  (create/edit)  │  │  to Branch      │              │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘              │
│                                                                              │
│  Commit message: "Auto-process: {meeting_title} ({date})"                    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         NOTIFIER                                             │
│                      (Slack / Discord)                                       │
│                                                                              │
│  Sends summary:                                                              │
│  - Meeting type and title                                                    │
│  - Attendees identified                                                      │
│  - Action items (with urgency flags)                                         │
│  - Files created/updated                                                     │
│  - Links to view changes                                                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Detail

### Step 1: Webhook Receipt

```
Fathom POST → /webhook/fathom
Headers:
  - Authorization: Bearer {FATHOM_WEBHOOK_SECRET}
  - Content-Type: application/json

Body: {
  event: "meeting.completed",
  meeting: { ... },
  transcript: [ ... ],
  summary: "...",
  action_items: [ ... ]
}
```

### Step 2: Context Loading

Server loads current OS state:

```javascript
const context = {
  // Known contacts (for attendee matching)
  contacts: loadContacts('05-hr-department/network-contacts/'),

  // Active projects (for classification)
  projects: loadProjects('02-operations/project-management/active-projects/'),

  // Team members (for partner meeting detection)
  team: {
    linh: { email: 'linh@...', role: 'Sales' },
    mikael: { email: 'mikael@...', role: 'BizDev' }
  },

  // Known coaches (for coaching call detection)
  coaches: loadCoaches('05-hr-department/network-contacts/coaching-call-notes/by-coach/'),

  // File structure map
  paths: {
    internalMeetings: '01-executive-office/internal-business-meetings/',
    coachingCalls: '05-hr-department/network-contacts/coaching-call-notes/',
    networkContacts: '05-hr-department/network-contacts/',
    activeProjects: '02-operations/project-management/active-projects/',
    dailyPlanning: '01-executive-office/daily-planning/logs/',
    roadmapUpdates: '01-executive-office/internal-business-meetings/roadmap-updates/'
  }
};
```

### Step 3: Claude Processing

```javascript
const prompt = loadPrompt('prompts/MEETING-PROCESSOR.md');
const fullPrompt = interpolate(prompt, {
  meeting: webhookPayload,
  context: context,
  currentDate: new Date().toISOString().split('T')[0]
});

const response = await claude.messages.create({
  model: 'claude-sonnet-4-20250514',
  max_tokens: 8000,
  messages: [{ role: 'user', content: fullPrompt }]
});

const result = JSON.parse(response.content[0].text);
```

### Step 4: File Updates

```javascript
for (const fileUpdate of result.fileUpdates) {
  switch (fileUpdate.action) {
    case 'create':
      await createFile(fileUpdate.path, fileUpdate.content);
      break;
    case 'append':
      await appendToFile(fileUpdate.path, fileUpdate.content);
      break;
    case 'update_section':
      await updateSection(fileUpdate.path, fileUpdate.section, fileUpdate.content);
      break;
  }
}

await git.commit(`Auto-process: ${meeting.title} (${date})`);
await git.push();
```

### Step 5: Notification

```javascript
await slack.postMessage({
  channel: '#meeting-notes',
  blocks: [
    header(`Meeting Processed: ${meeting.title}`),
    section(`Type: ${result.classification.type}`),
    section(`Attendees: ${result.attendees.map(a => a.name).join(', ')}`),
    divider(),
    section('**Action Items:**'),
    ...result.actionItems.map(item =>
      bullet(`${item.priority} ${item.task} → ${item.owner}`)
    ),
    divider(),
    section(`Files updated: ${result.fileUpdates.length}`),
    button('View Changes', commitUrl)
  ]
});
```

---

## Component Details

### Webhook Server

**Technology:** Node.js + Express

**Endpoints:**
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/webhook/fathom` | POST | Receive Fathom webhooks |
| `/health` | GET | Health check |
| `/status` | GET | Processing queue status |

**Middleware:**
- `authenticateWebhook` - Verify Fathom webhook token
- `validatePayload` - Ensure required fields present
- `rateLimit` - Prevent abuse (10 req/min)

**Error Handling:**
- 401 for invalid auth
- 400 for malformed payload
- 500 for processing errors (with retry)
- All errors logged + Slack alert

### Context Loader

**Purpose:** Build context object for Claude processing

**Loads:**
1. **Contacts** - Scan `network-contacts/by-category/` for all contact files
2. **Projects** - Scan `active-projects/` for current projects
3. **Coaches** - Parse `coaching-call-notes/by-coach/` for coach list
4. **Team** - Hardcoded Linh, Mikael, Matthew info

**Caching:**
- Cache context for 5 minutes
- Invalidate on git pull
- Force refresh on `/refresh-context` endpoint

### Claude Processor

**Model:** Claude Sonnet (fast, cost-effective)

**Prompt:** See `prompts/MEETING-PROCESSOR.md`

**Output Format:** See `schemas/OUTPUT-SCHEMA.md`

**Token Budget:**
- Input: ~4000 tokens (prompt + context + meeting)
- Output: ~3000 tokens (structured response)
- Max: 8000 tokens total

**Fallback:**
- If classification uncertain, ask for human review
- If contact match < 70% confidence, flag for review

### File Manager

**Method:** Direct git operations (not GitHub API)

**Process:**
1. Pull latest from main
2. Create branch: `auto/meeting-{date}-{id}`
3. Apply file changes
4. Commit with descriptive message
5. Push branch
6. Auto-merge to main (if no conflicts)

**Conflict Handling:**
- If conflict, keep branch open
- Notify via Slack
- Manual review required

### Notifier

**Channels:**
- `#meeting-notes` - All processed meetings
- `#urgent-actions` - Only 🔴 urgent items
- DM to owner - Personal action items

**Message Format:**
```
📝 Meeting Processed: Weekly Partner Sync

Type: Internal Partner Meeting
Attendees: Matthew, Linh
Duration: 45 min

🔴 Urgent Actions:
• Follow up with Trevor re: payment → Matthew (today)

🟡 This Week:
• Review Emma proposal → Matthew
• Update pipeline tracker → Linh

📁 Files Updated:
• internal-business-meetings/raw-notes/2025-11-27-weekly-sync.md
• internal-business-meetings/by-partner/linh.md
• internal-business-meetings/action-items/active-items.md

[View Changes] [Edit Meeting Notes]
```

---

## Environment Variables

```bash
# Fathom
FATHOM_WEBHOOK_SECRET=xxx          # Verify webhook authenticity
FATHOM_API_KEY=xxx                 # For fetching additional data if needed

# Claude
ANTHROPIC_API_KEY=xxx              # Claude API access

# GitHub
GITHUB_TOKEN=xxx                   # Repo access for commits
GITHUB_REPO=MatthewKerns/ai-agency-development-os
GITHUB_BRANCH=main                 # Target branch for merges

# Slack
SLACK_BOT_TOKEN=xxx                # Send notifications
SLACK_CHANNEL_MEETINGS=#meeting-notes
SLACK_CHANNEL_URGENT=#urgent-actions

# Server
PORT=3000
NODE_ENV=production
LOG_LEVEL=info
```

---

## Error Handling

| Error Type | Handling | Notification |
|------------|----------|--------------|
| Invalid webhook token | 401, log attempt | Slack alert |
| Malformed payload | 400, log payload | None |
| Claude API error | Retry 3x, then fail | Slack alert |
| Git conflict | Keep branch, skip merge | Slack alert + manual |
| File write error | Retry 3x, then fail | Slack alert |
| Slack error | Log only, don't fail | None |

---

## Scaling Considerations

**Current Design:** Single server, synchronous processing

**Future Scaling:**
- Queue system (Redis/Bull) for async processing
- Multiple workers for parallel meeting processing
- Webhook deduplication (idempotency keys)
- Rate limiting per Fathom account

**Expected Load:**
- 5-10 meetings/day initially
- Processing time: 30-60 seconds each
- No scaling needed until 50+ meetings/day

---

## Security Model

1. **Webhook Authentication**
   - Fathom includes secret token in header
   - Server validates before processing

2. **API Keys**
   - All keys in environment variables
   - Never logged or exposed

3. **Git Access**
   - Bot account with limited repo access
   - Only push to designated branches

4. **Data Handling**
   - Transcripts processed, not stored in logs
   - Meeting content stored only in OS files
   - No external data transmission beyond Slack summary

---

## Monitoring

**Health Checks:**
- `/health` endpoint returns 200 if healthy
- Uptime monitoring via external service

**Metrics:**
- Meetings processed per day
- Average processing time
- Error rate
- Classification accuracy (via feedback)

**Alerts:**
- Server down > 5 min
- Error rate > 10%
- Processing queue > 5 items

---

**Last Updated:** 2025-11-27
