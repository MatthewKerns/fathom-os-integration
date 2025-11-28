# Claude Processor Output Schema

The expected JSON structure from Claude after processing meeting notes.

---

## Full Schema

```typescript
interface MeetingProcessorOutput {
  classification: Classification;
  attendees: Attendee[];
  actionItems: ActionItem[];
  roadmapAdditions: RoadmapItem[];
  decisions: Decision[];
  keyLearnings: Learning[];
  fileUpdates: FileUpdate[];
  summary: Summary;
  notifications: Notifications;
}

interface Classification {
  type: 'internal-partner' | 'coaching-call' | 'client-call' | 'networking' | 'sales-call' | 'other';
  confidence: number; // 0.0 to 1.0
  reasoning: string;
}

interface Attendee {
  name: string;
  email: string | null;
  role: string | null;
  company: string | null;
  isKnownContact: boolean;
  contactFilePath: string | null;
  suggestedCategory: 'clients' | 'developers' | 'coaches' | 'potential-leads' | null;
  newInfoLearned: string[];
}

interface ActionItem {
  task: string;
  owner: 'Matthew' | 'Linh' | 'Mikael' | string; // string for external names
  priority: 'urgent' | 'important' | 'strategic';
  priorityEmoji: '🔴' | '🟡' | '🟢';
  deadline: string | null; // YYYY-MM-DD format
  context: string;
}

interface RoadmapItem {
  description: string;
  businessValue: string;
  priority: 'P0' | 'P1' | 'P2' | 'P3' | 'P4' | 'P5';
  owner: string;
  relatedProject: string | null;
}

interface Decision {
  decision: string;
  context: string;
  reasoning: string;
  implications: string;
  owner: string;
}

interface Learning {
  category: 'people' | 'projects' | 'market' | 'strategy';
  learning: string;
  relevantTo: string;
}

interface FileUpdate {
  action: 'create' | 'append' | 'update_section';
  path: string;
  section?: string; // Required for 'update_section'
  content: string;
}

interface Summary {
  oneLineSummary: string;
  urgentItemsCount: number;
  totalActionItems: number;
  newContactsIdentified: number;
  filesAffected: number;
}

interface Notifications {
  slackSummary: string;
  urgentAlert: string | null;
}
```

---

## Example Output

### Internal Partner Meeting

```json
{
  "classification": {
    "type": "internal-partner",
    "confidence": 0.98,
    "reasoning": "Meeting includes Linh (Sales partner) and discusses pipeline/deal strategy"
  },

  "attendees": [
    {
      "name": "Matthew Kerns",
      "email": "matthew@example.com",
      "role": "Architect",
      "company": "AI Agency",
      "isKnownContact": true,
      "contactFilePath": null,
      "suggestedCategory": null,
      "newInfoLearned": []
    },
    {
      "name": "Linh Nguyen",
      "email": "linh@example.com",
      "role": "Sales Lead",
      "company": "AI Agency",
      "isKnownContact": true,
      "contactFilePath": "01-executive-office/internal-business-meetings/by-partner/linh.md",
      "suggestedCategory": null,
      "newInfoLearned": [
        "Has call scheduled with Emma next Tuesday",
        "Prefers async updates via Slack over calls"
      ]
    }
  ],

  "actionItems": [
    {
      "task": "Send follow-up email to Trevor regarding $500 invoice for P1 deliverable",
      "owner": "Matthew",
      "priority": "urgent",
      "priorityEmoji": "🔴",
      "deadline": "2025-11-28",
      "context": "Payment collection for completed session history feature - Trevor approved work verbally"
    },
    {
      "task": "Prepare and send proposal to Emma for email automation project",
      "owner": "Matthew",
      "priority": "important",
      "priorityEmoji": "🟡",
      "deadline": "2025-11-29",
      "context": "Emma showed strong interest, Linh has call scheduled for Tuesday"
    },
    {
      "task": "Update pipeline tracker with current deal statuses",
      "owner": "Linh",
      "priority": "important",
      "priorityEmoji": "🟡",
      "deadline": null,
      "context": "Keep pipeline visibility accurate for weekly reviews"
    }
  ],

  "roadmapAdditions": [
    {
      "description": "Build proposal template system to speed up client quotes",
      "businessValue": "Reduce proposal creation time from 2 hours to 30 minutes",
      "priority": "P2",
      "owner": "Matthew",
      "relatedProject": null
    }
  ],

  "decisions": [
    {
      "decision": "Focus on closing Trevor and Emma before pursuing new leads",
      "context": "Discussed whether to expand outreach or focus on current pipeline",
      "reasoning": "Better to close existing deals (higher probability) than chase new ones",
      "implications": "Mikael should pause cold outreach until Emma deal is closed",
      "owner": "Matthew"
    }
  ],

  "keyLearnings": [
    {
      "category": "people",
      "learning": "Emma prefers detailed technical proposals with clear timelines",
      "relevantTo": "Emma (potential client)"
    },
    {
      "category": "strategy",
      "learning": "Current close rate is ~60% - focusing on fewer deals increases bandwidth for each",
      "relevantTo": "Agency sales strategy"
    }
  ],

  "fileUpdates": [
    {
      "action": "create",
      "path": "claude-code-os-implementation/01-executive-office/internal-business-meetings/raw-notes/2025-11-27-pipeline-review.md",
      "content": "# Internal Meeting: Pipeline Review - 2025-11-27\n\n**Date:** 2025-11-27\n**Attendees:** Matthew, Linh\n**Duration:** 27 minutes\n**Meeting Type:** Internal Partner\n**Status:** [x] Processed\n**Fathom Link:** https://fathom.video/share/abc123xyz\n\n---\n\n## Summary\n\nReviewed current pipeline status with focus on Trevor P1 completion and Emma opportunity. Decided to focus on closing current deals before expanding outreach.\n\n---\n\n## Key Topics\n\n- Trevor invoice collection\n- Emma proposal preparation\n- Pipeline prioritization strategy\n\n---\n\n## Action Items\n\n- 🔴 **Matthew:** Follow up with Trevor re: invoice (due: 2025-11-28)\n- 🟡 **Matthew:** Send Emma proposal (due: 2025-11-29)\n- 🟡 **Linh:** Update pipeline tracker\n\n---\n\n## Decisions\n\n1. **Focus current pipeline over new leads** - Close Trevor and Emma before new outreach\n\n---\n\n## Processed\n\n**Processed on:** 2025-11-27\n**Auto-processed by:** Fathom Integration\n"
    },
    {
      "action": "append",
      "path": "claude-code-os-implementation/01-executive-office/internal-business-meetings/by-partner/linh.md",
      "content": "\n---\n\n## 2025-11-27 - Pipeline Review\n\n**Attendees:** Matthew, Linh\n**Meeting type:** Weekly Sync\n\n**Key Decisions:**\n1. Focus on closing Trevor and Emma before new leads\n\n**Linh's Action Items:**\n- [ ] Update pipeline tracker\n\n**Updates from Linh:**\n- Has call scheduled with Emma next Tuesday\n- Prefers async Slack updates over additional calls\n\n**Next steps:**\n- Linh to update pipeline by EOD\n- Sync after Emma call next week\n\n**Raw notes:** `raw-notes/2025-11-27-pipeline-review.md`\n"
    },
    {
      "action": "update_section",
      "path": "claude-code-os-implementation/01-executive-office/internal-business-meetings/action-items/active-items.md",
      "section": "🔴 Urgent (Do Today/Tomorrow)",
      "content": "| 2025-11-27 | Matthew | Follow up with Trevor re: $500 invoice | 2025-11-28 | [ ] |"
    },
    {
      "action": "update_section",
      "path": "claude-code-os-implementation/01-executive-office/internal-business-meetings/action-items/active-items.md",
      "section": "🟡 Important (This Week)",
      "content": "| 2025-11-27 | Matthew | Send Emma proposal | 2025-11-29 | [ ] |\n| 2025-11-27 | Linh | Update pipeline tracker | - | [ ] |"
    }
  ],

  "summary": {
    "oneLineSummary": "Pipeline review with Linh - focusing on closing Trevor and Emma before new outreach",
    "urgentItemsCount": 1,
    "totalActionItems": 3,
    "newContactsIdentified": 0,
    "filesAffected": 3
  },

  "notifications": {
    "slackSummary": "📝 *Meeting Processed: Pipeline Review*\n\n*Type:* Internal Partner Meeting\n*Attendees:* Matthew, Linh\n*Duration:* 27 min\n\n🔴 *Urgent Actions:*\n• Follow up with Trevor re: invoice → Matthew (due tomorrow)\n\n🟡 *This Week:*\n• Send Emma proposal → Matthew\n• Update pipeline tracker → Linh\n\n📁 *Files Updated:* 3\n• raw-notes/2025-11-27-pipeline-review.md (created)\n• by-partner/linh.md (updated)\n• action-items/active-items.md (updated)",
    "urgentAlert": "🚨 *Urgent Action Required*\n\nFrom today's pipeline review with Linh:\n\n• Follow up with Trevor re: $500 invoice\n  → Due: Tomorrow (2025-11-28)\n  → Why: Payment collection for completed P1 work"
  }
}
```

---

## Validation Rules

### Classification
- `type` must be one of the defined enum values
- `confidence` must be between 0.0 and 1.0
- `reasoning` must be non-empty

### Attendees
- At least one attendee required
- `name` is required and non-empty
- `newInfoLearned` can be empty array but must exist

### Action Items
- `task` must be specific and actionable (not vague)
- `owner` must be one of: Matthew, Linh, Mikael, or specific external name
- `priority` and `priorityEmoji` must match
- `deadline` must be YYYY-MM-DD format or null

### File Updates
- `path` must start with `claude-code-os-implementation/`
- `path` must use forward slashes
- `content` must be valid markdown
- For `update_section`, `section` is required

### Summary
- All counts must be non-negative integers
- `oneLineSummary` should be under 100 characters

---

## Error Response Format

If Claude cannot process the meeting, it should return:

```json
{
  "error": true,
  "errorType": "classification_uncertain" | "no_transcript" | "invalid_input" | "other",
  "errorMessage": "Human-readable explanation of the error",
  "partialResult": {
    // Any fields that could be determined
  },
  "requiresHumanReview": true
}
```

---

**Last Updated:** 2025-11-27
