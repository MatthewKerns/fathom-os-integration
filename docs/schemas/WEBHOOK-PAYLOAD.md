# Fathom Webhook Payload Schema

Documentation of the data structure received from Fathom webhooks.

---

## Webhook Event: `meeting.completed`

This event fires when a meeting recording has finished processing and all data is available.

---

## Full Payload Structure

```json
{
  "event": "meeting.completed",
  "timestamp": "2025-11-27T15:30:00Z",
  "meeting": {
    "id": "mtg_abc123xyz",
    "title": "Weekly Partner Sync",
    "url": "https://fathom.video/share/abc123xyz",
    "share_url": "https://fathom.video/share/abc123xyz",
    "created_at": "2025-11-27T15:00:00Z",
    "scheduled_start_time": "2025-11-27T15:00:00Z",
    "scheduled_end_time": "2025-11-27T15:30:00Z",
    "recording_start_time": "2025-11-27T15:01:23Z",
    "recording_end_time": "2025-11-27T15:28:45Z",
    "duration_seconds": 1642,
    "platform": "zoom",
    "calendar_event_id": "cal_xyz789",
    "calendar_invitees_domains_type": "internal"
  },
  "attendees": [
    {
      "name": "Matthew Kerns",
      "email": "matthew@example.com",
      "is_host": true,
      "is_organizer": true,
      "join_time": "2025-11-27T15:00:00Z",
      "leave_time": "2025-11-27T15:28:45Z",
      "speaking_time_seconds": 845
    },
    {
      "name": "Linh Nguyen",
      "email": "linh@example.com",
      "is_host": false,
      "is_organizer": false,
      "join_time": "2025-11-27T15:01:00Z",
      "leave_time": "2025-11-27T15:28:45Z",
      "speaking_time_seconds": 797
    }
  ],
  "summary": "Matthew and Linh discussed the pipeline status and upcoming deliverables. Key focus areas included Trevor's project completion and Emma's potential deal. Action items were assigned for follow-ups.",
  "key_topics": [
    "Pipeline review",
    "Trevor project status",
    "Emma opportunity",
    "Weekly priorities"
  ],
  "action_items": [
    {
      "text": "Follow up with Trevor about payment",
      "assignee": "Matthew",
      "due_date": null,
      "completed": false
    },
    {
      "text": "Send Emma proposal",
      "assignee": "Matthew",
      "due_date": "2025-11-28",
      "completed": false
    },
    {
      "text": "Update pipeline tracker",
      "assignee": "Linh",
      "due_date": null,
      "completed": false
    }
  ],
  "transcript": [
    {
      "speaker": "Matthew Kerns",
      "start_time": 0.0,
      "end_time": 5.5,
      "text": "Hey Linh, thanks for jumping on. Let's go through the pipeline."
    },
    {
      "speaker": "Linh Nguyen",
      "start_time": 5.5,
      "end_time": 12.3,
      "text": "Sounds good. So Trevor is still waiting on approval for the first phase."
    }
  ],
  "recording": {
    "video_url": "https://fathom.video/recordings/abc123xyz/video.mp4",
    "audio_url": "https://fathom.video/recordings/abc123xyz/audio.mp3",
    "duration_seconds": 1642,
    "file_size_bytes": 125000000
  },
  "metadata": {
    "fathom_user_id": "user_123",
    "workspace_id": "ws_456",
    "webhook_version": "2.0"
  }
}
```

---

## Field Descriptions

### Root Level

| Field | Type | Description |
|-------|------|-------------|
| `event` | string | Event type, always `meeting.completed` for this webhook |
| `timestamp` | ISO 8601 | When the webhook was sent |
| `meeting` | object | Core meeting metadata |
| `attendees` | array | List of meeting participants |
| `summary` | string | AI-generated meeting summary |
| `key_topics` | array | Main topics discussed |
| `action_items` | array | Extracted action items |
| `transcript` | array | Full transcript with timestamps |
| `recording` | object | Recording file URLs |
| `metadata` | object | Fathom account metadata |

### Meeting Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique meeting identifier |
| `title` | string | Meeting title from calendar |
| `url` | string | Link to Fathom meeting page |
| `share_url` | string | Shareable link (may be same as url) |
| `created_at` | ISO 8601 | When the meeting was created in Fathom |
| `scheduled_start_time` | ISO 8601 | Calendar scheduled start |
| `scheduled_end_time` | ISO 8601 | Calendar scheduled end |
| `recording_start_time` | ISO 8601 | Actual recording start |
| `recording_end_time` | ISO 8601 | Actual recording end |
| `duration_seconds` | integer | Total recording length |
| `platform` | string | Meeting platform: zoom, meet, teams |
| `calendar_event_id` | string | Associated calendar event ID |
| `calendar_invitees_domains_type` | string | `internal`, `external`, or `mixed` |

### Attendee Object

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Display name |
| `email` | string | Email address (may be null) |
| `is_host` | boolean | Whether this person hosted |
| `is_organizer` | boolean | Whether this person organized |
| `join_time` | ISO 8601 | When they joined |
| `leave_time` | ISO 8601 | When they left |
| `speaking_time_seconds` | integer | Total time spent speaking |

### Action Item Object

| Field | Type | Description |
|-------|------|-------------|
| `text` | string | Action item description |
| `assignee` | string | Person assigned (may be null) |
| `due_date` | ISO 8601 or null | Due date if mentioned |
| `completed` | boolean | Completion status |

### Transcript Entry Object

| Field | Type | Description |
|-------|------|-------------|
| `speaker` | string | Speaker name |
| `start_time` | float | Seconds from recording start |
| `end_time` | float | Seconds from recording start |
| `text` | string | What was said |

### Recording Object

| Field | Type | Description |
|-------|------|-------------|
| `video_url` | string | URL to download video |
| `audio_url` | string | URL to download audio |
| `duration_seconds` | integer | Recording length |
| `file_size_bytes` | integer | Video file size |

---

## Webhook Headers

```
POST /webhook/fathom HTTP/1.1
Host: your-server.com
Content-Type: application/json
Authorization: Bearer {your_webhook_secret}
X-Fathom-Webhook-ID: whk_abc123
X-Fathom-Delivery-ID: del_xyz789
X-Fathom-Timestamp: 1701100200
X-Fathom-Signature: sha256=abcdef123456...
```

### Header Descriptions

| Header | Description |
|--------|-------------|
| `Authorization` | Your webhook secret for verification |
| `X-Fathom-Webhook-ID` | Unique webhook configuration ID |
| `X-Fathom-Delivery-ID` | Unique delivery attempt ID (for idempotency) |
| `X-Fathom-Timestamp` | Unix timestamp of send time |
| `X-Fathom-Signature` | HMAC signature for payload verification |

---

## Signature Verification

```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

---

## Example: Minimal Payload

Some fields may be missing depending on meeting type:

```json
{
  "event": "meeting.completed",
  "timestamp": "2025-11-27T15:30:00Z",
  "meeting": {
    "id": "mtg_abc123xyz",
    "title": "Quick Call",
    "url": "https://fathom.video/share/abc123xyz",
    "duration_seconds": 300
  },
  "attendees": [
    {
      "name": "Matthew Kerns",
      "email": "matthew@example.com"
    },
    {
      "name": "Unknown Guest",
      "email": null
    }
  ],
  "summary": "Brief discussion about project timeline.",
  "key_topics": ["Project timeline"],
  "action_items": [],
  "transcript": [
    {
      "speaker": "Matthew Kerns",
      "start_time": 0.0,
      "end_time": 10.0,
      "text": "Let's quickly sync on the timeline."
    }
  ]
}
```

---

## Handling Missing Fields

Always handle potentially missing fields:

```javascript
const meetingTitle = payload.meeting?.title || 'Untitled Meeting';
const attendees = payload.attendees || [];
const actionItems = payload.action_items || [];
const transcript = payload.transcript || [];

// Email may be null for unknown attendees
const attendeeEmails = attendees
  .filter(a => a.email)
  .map(a => a.email.toLowerCase());
```

---

## Rate Limits

- Fathom may retry failed webhooks up to 3 times
- Use `X-Fathom-Delivery-ID` for idempotency
- Respond with 200 within 30 seconds to acknowledge receipt

---

**Last Updated:** 2025-11-27
