# Fathom Meeting Notes Integration

**Purpose:** Automatically process meeting notes from Fathom and integrate them into the AI Agency Development OS.

**Status:** Planning / Pre-Development

---

## Overview

This system automatically captures meeting data from Fathom via webhooks and uses Claude AI to:

1. **Classify meetings** by type (partner, coaching, client, networking)
2. **Identify attendees** and update contact records
3. **Extract action items** with priorities and owners
4. **Capture roadmap additions** from strategic discussions
5. **Document decisions** made during calls
6. **Update OS files** automatically in the correct locations

---

## The Problem

Manual meeting notes processing:
- Takes 30+ minutes per meeting
- Often delayed or forgotten
- Inconsistent formatting
- Action items fall through cracks
- Contact info not captured systematically
- Roadmap ideas lost

## The Solution

Automated pipeline:
```
Meeting ends → Fathom webhook fires → Server receives data →
Claude processes → Files updated → Notification sent
```

**Time to process:** ~30 seconds (vs 30 minutes manual)
**Consistency:** 100% (every meeting processed same way)
**Coverage:** Every field tested, every contact updated

---

## System Components

| Component | Technology | Purpose |
|-----------|------------|---------|
| Webhook Receiver | Node.js/Express | Receives Fathom webhooks |
| AI Processor | Claude API | Classifies and extracts data |
| File Manager | GitHub API / Git | Updates OS files |
| Notifier | Slack/Discord | Alerts on completion |

---

## Documentation Index

| Document | Purpose |
|----------|---------|
| [README.md](README.md) | This file - overview |
| [ARCHITECTURE.md](ARCHITECTURE.md) | System design and data flow |
| [IMPLEMENTATION-PLAN.md](IMPLEMENTATION-PLAN.md) | Step-by-step build guide |
| [prompts/MEETING-PROCESSOR.md](prompts/MEETING-PROCESSOR.md) | Claude prompt for processing |
| [schemas/WEBHOOK-PAYLOAD.md](schemas/WEBHOOK-PAYLOAD.md) | Fathom webhook data structure |
| [schemas/OUTPUT-SCHEMA.md](schemas/OUTPUT-SCHEMA.md) | Expected Claude output format |
| [examples/](examples/) | Sample inputs and outputs |

---

## Meeting Types Supported

| Type | Folder Destination | Triggers When |
|------|-------------------|---------------|
| Internal Partner | `01-executive-office/internal-business-meetings/` | Linh or Mikael on call |
| Coaching Call | `05-hr-department/network-contacts/coaching-call-notes/` | Known coach on call |
| Client Call | `02-operations/project-management/active-projects/` | Known client on call |
| Networking | `05-hr-department/network-contacts/` | New contacts identified |
| General | `05-hr-department/fathom-integration/processed/` | Fallback for unclassified |

---

## Key Features

### 1. Smart Classification
Automatically determines meeting type based on:
- Attendee email domains
- Known contact matching
- Meeting title keywords
- Calendar context

### 2. Contact Management
- Matches attendees against existing contacts
- Creates new contact files for unknowns
- Updates existing contacts with new information learned
- Tags contacts with meeting history

### 3. Action Item Extraction
- Pulls action items from Fathom
- Adds priority levels (🔴🟡🟢)
- Assigns owners (Matthew, Linh, Mikael, external)
- Sets deadlines where mentioned
- Routes urgent items to daily planning

### 4. Roadmap Integration
- Captures new ideas and features discussed
- Assigns P0-P5 priority levels
- Links to business value
- Adds to monthly roadmap-updates file

### 5. Decision Documentation
- Records decisions made
- Captures reasoning/context
- Notes implications
- Links to responsible party

---

## Integration Points

### Inputs
- Fathom webhook (meeting data)
- OS file structure (for context)
- Contact database (for matching)
- Project list (for classification)

### Outputs
- Raw meeting notes file
- Updated contact files
- Updated project files
- Action items tracker
- Roadmap updates
- Partner/coach session logs
- Slack notification

---

## Security Considerations

- Webhook endpoint requires authentication token
- API keys stored in environment variables
- No sensitive data logged
- GitHub commits use bot account
- Transcripts stored locally, not in logs

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Processing time | < 60 seconds |
| Classification accuracy | > 95% |
| Action item capture rate | 100% |
| Contact match rate | > 90% |
| File update success | 100% |

---

## Quick Start (After Implementation)

1. Ensure Fathom webhook is configured
2. Server is running and healthy
3. Have a meeting with Fathom recording
4. Meeting ends → Check Slack for notification
5. Review auto-generated files in OS

---

## Related Systems

- [Internal Business Meetings](../../../01-executive-office/internal-business-meetings/)
- [Coaching Call Notes](../network-contacts/coaching-call-notes/)
- [Network Contacts](../network-contacts/)
- [Daily Planning](../../../01-executive-office/daily-planning/)

---

**Last Updated:** 2025-11-27
**Status:** Documentation Complete, Implementation Pending
