# Example: Internal Partner Meeting Processing

This shows a complete example of how an internal partner meeting would be processed.

---

## Input: Fathom Webhook Payload

```json
{
  "event": "meeting.completed",
  "timestamp": "2025-11-27T16:00:00Z",
  "meeting": {
    "id": "mtg_example123",
    "title": "Weekly Partner Sync",
    "url": "https://fathom.video/share/example123",
    "created_at": "2025-11-27T15:30:00Z",
    "duration_seconds": 1800
  },
  "attendees": [
    {
      "name": "Matthew Kerns",
      "email": "matthew@agency.com",
      "is_host": true
    },
    {
      "name": "Linh Nguyen",
      "email": "linh@agency.com",
      "is_host": false
    }
  ],
  "summary": "Weekly sync between Matthew and Linh covering pipeline status, Trevor project completion, and Emma opportunity. Decided to prioritize closing current deals before expanding outreach.",
  "key_topics": [
    "Pipeline review",
    "Trevor P1 invoice",
    "Emma proposal",
    "Focus strategy"
  ],
  "action_items": [
    {
      "text": "Follow up with Trevor about payment",
      "assignee": "Matthew"
    },
    {
      "text": "Send proposal to Emma",
      "assignee": "Matthew"
    },
    {
      "text": "Update pipeline tracker",
      "assignee": "Linh"
    }
  ],
  "transcript": [
    {
      "speaker": "Matthew Kerns",
      "start_time": 0.0,
      "end_time": 8.0,
      "text": "Hey Linh, let's go through the pipeline. How's everything looking?"
    },
    {
      "speaker": "Linh Nguyen",
      "start_time": 8.0,
      "end_time": 22.0,
      "text": "Good! So Trevor is ready - he approved the work verbally. We just need to send the invoice for the $500 P1 deliverable."
    },
    {
      "speaker": "Matthew Kerns",
      "start_time": 22.0,
      "end_time": 35.0,
      "text": "Perfect, I'll follow up with him today about the invoice. What about Emma?"
    },
    {
      "speaker": "Linh Nguyen",
      "start_time": 35.0,
      "end_time": 55.0,
      "text": "Emma's interested in the email automation project. She mentioned she wants something in the $2-5k range. I have a call with her Tuesday."
    },
    {
      "speaker": "Matthew Kerns",
      "start_time": 55.0,
      "end_time": 75.0,
      "text": "Got it. I should prep a proposal before that call. What about new leads - should Mikael keep pushing outreach?"
    },
    {
      "speaker": "Linh Nguyen",
      "start_time": 75.0,
      "end_time": 95.0,
      "text": "I think we should focus on closing Trevor and Emma first. Better to close what we have than chase new ones."
    },
    {
      "speaker": "Matthew Kerns",
      "start_time": 95.0,
      "end_time": 110.0,
      "text": "Agreed. Let's tell Mikael to pause cold outreach until we close Emma. That way we can give these deals full attention."
    }
  ]
}
```

---

## Output: Claude Processed Result

```json
{
  "classification": {
    "type": "internal-partner",
    "confidence": 0.98,
    "reasoning": "Meeting between Matthew and Linh (equity partner with Sales role) discussing internal pipeline and strategy"
  },

  "attendees": [
    {
      "name": "Matthew Kerns",
      "email": "matthew@agency.com",
      "role": "Architect",
      "company": "AI Agency",
      "isKnownContact": true,
      "contactFilePath": null,
      "suggestedCategory": null,
      "newInfoLearned": []
    },
    {
      "name": "Linh Nguyen",
      "email": "linh@agency.com",
      "role": "Sales Lead",
      "company": "AI Agency",
      "isKnownContact": true,
      "contactFilePath": "01-executive-office/internal-business-meetings/by-partner/linh.md",
      "suggestedCategory": null,
      "newInfoLearned": [
        "Has call with Emma scheduled for Tuesday",
        "Prefers focusing on existing pipeline over new outreach"
      ]
    }
  ],

  "actionItems": [
    {
      "task": "Follow up with Trevor regarding $500 invoice for P1 deliverable - he approved work verbally",
      "owner": "Matthew",
      "priority": "urgent",
      "priorityEmoji": "🔴",
      "deadline": "2025-11-27",
      "context": "Payment collection for completed session history feature"
    },
    {
      "task": "Prepare and send proposal to Emma for email automation project ($2-5k range) before Tuesday call",
      "owner": "Matthew",
      "priority": "important",
      "priorityEmoji": "🟡",
      "deadline": "2025-12-01",
      "context": "Linh has discovery call with Emma on Tuesday, proposal needed beforehand"
    },
    {
      "task": "Update pipeline tracker with current deal statuses (Trevor, Emma)",
      "owner": "Linh",
      "priority": "important",
      "priorityEmoji": "🟡",
      "deadline": null,
      "context": "Keep pipeline visibility accurate for team alignment"
    },
    {
      "task": "Notify Mikael to pause cold outreach until Emma deal is closed",
      "owner": "Matthew",
      "priority": "important",
      "priorityEmoji": "🟡",
      "deadline": "2025-11-28",
      "context": "Strategic decision to focus team bandwidth on closing current pipeline"
    }
  ],

  "roadmapAdditions": [],

  "decisions": [
    {
      "decision": "Pause cold outreach and focus on closing Trevor and Emma before pursuing new leads",
      "context": "Discussed whether to expand outreach or prioritize current pipeline",
      "reasoning": "Better conversion probability with existing warm leads; gives each deal full attention",
      "implications": "Mikael should pause cold outreach until Emma deal closes; team bandwidth shifts to closing",
      "owner": "Matthew"
    }
  ],

  "keyLearnings": [
    {
      "category": "people",
      "learning": "Emma's budget range is $2-5k for email automation",
      "relevantTo": "Emma (potential client)"
    },
    {
      "category": "strategy",
      "learning": "Team alignment: quality of deal execution over quantity of pipeline",
      "relevantTo": "Agency sales strategy"
    }
  ],

  "fileUpdates": [
    {
      "action": "create",
      "path": "claude-code-os-implementation/01-executive-office/internal-business-meetings/raw-notes/2025-11-27-weekly-sync.md",
      "content": "# Internal Meeting: Weekly Partner Sync - 2025-11-27\n\n**Date:** 2025-11-27\n**Attendees:** Matthew, Linh\n**Duration:** 30 minutes\n**Meeting Type:** Internal Partner\n**Status:** [x] Processed\n**Fathom Link:** https://fathom.video/share/example123\n\n---\n\n## Summary\n\nWeekly sync covering pipeline status. Trevor P1 ready for invoice ($500). Emma interested in $2-5k email automation project - Linh has call Tuesday. Decided to pause new outreach and focus on closing current deals.\n\n---\n\n## Key Topics\n\n- Pipeline review\n- Trevor P1 invoice ($500)\n- Emma proposal preparation\n- Outreach focus strategy\n\n---\n\n## Action Items\n\n- 🔴 **Matthew:** Follow up with Trevor re: $500 invoice (today)\n- 🟡 **Matthew:** Send Emma proposal before Tuesday\n- 🟡 **Matthew:** Notify Mikael to pause cold outreach\n- 🟡 **Linh:** Update pipeline tracker\n\n---\n\n## Decisions\n\n1. **Pause cold outreach** - Focus on closing Trevor and Emma before new leads\n   - Reasoning: Better conversion with warm leads, full attention per deal\n   - Implication: Notify Mikael to pause outreach\n\n---\n\n**Processed on:** 2025-11-27\n**Auto-processed by:** Fathom Integration\n"
    },
    {
      "action": "append",
      "path": "claude-code-os-implementation/01-executive-office/internal-business-meetings/by-partner/linh.md",
      "content": "\n---\n\n## 2025-11-27 - Weekly Partner Sync\n\n**Attendees:** Matthew, Linh\n**Meeting type:** Weekly Sync\n\n**Key Decisions:**\n1. Pause cold outreach, focus on closing Trevor + Emma\n\n**Linh's Action Items:**\n- [ ] Update pipeline tracker\n\n**Updates from Linh:**\n- Trevor approved P1, ready for invoice\n- Emma interested in $2-5k email automation\n- Has call with Emma scheduled for Tuesday\n- Recommends focusing on existing pipeline\n\n**Next steps:**\n- Sync after Emma call next week\n\n**Raw notes:** `raw-notes/2025-11-27-weekly-sync.md`\n"
    },
    {
      "action": "update_section",
      "path": "claude-code-os-implementation/01-executive-office/internal-business-meetings/action-items/active-items.md",
      "section": "🔴 Urgent (Do Today/Tomorrow)",
      "content": "| 2025-11-27 | Matthew | Follow up with Trevor re: $500 P1 invoice | 2025-11-27 | [ ] |"
    },
    {
      "action": "update_section",
      "path": "claude-code-os-implementation/01-executive-office/internal-business-meetings/action-items/active-items.md",
      "section": "🟡 Important (This Week)",
      "content": "| 2025-11-27 | Matthew | Send Emma proposal before Tuesday | 2025-12-01 | [ ] |\n| 2025-11-27 | Matthew | Notify Mikael to pause cold outreach | 2025-11-28 | [ ] |\n| 2025-11-27 | Linh | Update pipeline tracker | - | [ ] |"
    }
  ],

  "summary": {
    "oneLineSummary": "Weekly sync - focus on closing Trevor ($500 invoice) and Emma before new outreach",
    "urgentItemsCount": 1,
    "totalActionItems": 4,
    "newContactsIdentified": 0,
    "filesAffected": 3
  },

  "notifications": {
    "slackSummary": "📝 *Meeting Processed: Weekly Partner Sync*\n\n*Type:* Internal Partner Meeting\n*Attendees:* Matthew, Linh\n*Duration:* 30 min\n\n🔴 *Urgent Actions:*\n• Follow up with Trevor re: $500 invoice → Matthew (today)\n\n🟡 *This Week:*\n• Send Emma proposal → Matthew (before Tuesday)\n• Notify Mikael to pause outreach → Matthew\n• Update pipeline tracker → Linh\n\n📋 *Decisions:*\n• Pause cold outreach, focus on current pipeline\n\n📁 *Files Updated:* 3\n• raw-notes/2025-11-27-weekly-sync.md (created)\n• by-partner/linh.md (updated)\n• action-items/active-items.md (updated)",
    "urgentAlert": "🚨 *Urgent Action Required*\n\nFrom Weekly Partner Sync:\n\n• Follow up with Trevor re: $500 P1 invoice\n  → Due: Today (2025-11-27)\n  → Why: Trevor approved work verbally, ready for payment"
  }
}
```

---

## Generated Files

### File 1: raw-notes/2025-11-27-weekly-sync.md

```markdown
# Internal Meeting: Weekly Partner Sync - 2025-11-27

**Date:** 2025-11-27
**Attendees:** Matthew, Linh
**Duration:** 30 minutes
**Meeting Type:** Internal Partner
**Status:** [x] Processed
**Fathom Link:** https://fathom.video/share/example123

---

## Summary

Weekly sync covering pipeline status. Trevor P1 ready for invoice ($500). Emma interested in $2-5k email automation project - Linh has call Tuesday. Decided to pause new outreach and focus on closing current deals.

---

## Key Topics

- Pipeline review
- Trevor P1 invoice ($500)
- Emma proposal preparation
- Outreach focus strategy

---

## Action Items

- 🔴 **Matthew:** Follow up with Trevor re: $500 invoice (today)
- 🟡 **Matthew:** Send Emma proposal before Tuesday
- 🟡 **Matthew:** Notify Mikael to pause cold outreach
- 🟡 **Linh:** Update pipeline tracker

---

## Decisions

1. **Pause cold outreach** - Focus on closing Trevor and Emma before new leads
   - Reasoning: Better conversion with warm leads, full attention per deal
   - Implication: Notify Mikael to pause outreach

---

**Processed on:** 2025-11-27
**Auto-processed by:** Fathom Integration
```

### File 2: by-partner/linh.md (appended section)

```markdown
---

## 2025-11-27 - Weekly Partner Sync

**Attendees:** Matthew, Linh
**Meeting type:** Weekly Sync

**Key Decisions:**
1. Pause cold outreach, focus on closing Trevor + Emma

**Linh's Action Items:**
- [ ] Update pipeline tracker

**Updates from Linh:**
- Trevor approved P1, ready for invoice
- Emma interested in $2-5k email automation
- Has call with Emma scheduled for Tuesday
- Recommends focusing on existing pipeline

**Next steps:**
- Sync after Emma call next week

**Raw notes:** `raw-notes/2025-11-27-weekly-sync.md`
```

### Slack Notification

```
📝 Meeting Processed: Weekly Partner Sync

Type: Internal Partner Meeting
Attendees: Matthew, Linh
Duration: 30 min

🔴 Urgent Actions:
• Follow up with Trevor re: $500 invoice → Matthew (today)

🟡 This Week:
• Send Emma proposal → Matthew (before Tuesday)
• Notify Mikael to pause outreach → Matthew
• Update pipeline tracker → Linh

📋 Decisions:
• Pause cold outreach, focus on current pipeline

📁 Files Updated: 3
• raw-notes/2025-11-27-weekly-sync.md (created)
• by-partner/linh.md (updated)
• action-items/active-items.md (updated)
```

---

**Last Updated:** 2025-11-27
