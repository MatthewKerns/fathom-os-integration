const { z } = require('zod');

/**
 * Zod schema for Fathom webhook payload validation
 */

// Meeting object schema
const MeetingSchema = z.object({
  id: z.string(),
  title: z.string().optional().default('Untitled Meeting'),
  url: z.string().url(),
  share_url: z.string().url().optional(),
  created_at: z.string().datetime().optional(),
  scheduled_start_time: z.string().datetime().optional(),
  scheduled_end_time: z.string().datetime().optional(),
  recording_start_time: z.string().datetime().optional(),
  recording_end_time: z.string().datetime().optional(),
  duration_seconds: z.number().int().positive(),
  platform: z.enum(['zoom', 'meet', 'teams']).optional(),
  calendar_event_id: z.string().optional(),
  calendar_invitees_domains_type: z.enum(['internal', 'external', 'mixed']).optional()
});

// Attendee object schema
const AttendeeSchema = z.object({
  name: z.string(),
  email: z.string().email().nullable().optional(),
  is_host: z.boolean().optional().default(false),
  is_organizer: z.boolean().optional().default(false),
  join_time: z.string().datetime().optional(),
  leave_time: z.string().datetime().optional(),
  speaking_time_seconds: z.number().int().nonnegative().optional()
});

// Action item object schema
const ActionItemSchema = z.object({
  text: z.string(),
  assignee: z.string().nullable().optional(),
  due_date: z.string().datetime().nullable().optional(),
  completed: z.boolean().default(false)
});

// Transcript entry object schema
const TranscriptEntrySchema = z.object({
  speaker: z.string(),
  start_time: z.number().nonnegative(),
  end_time: z.number().nonnegative(),
  text: z.string()
});

// Recording object schema
const RecordingSchema = z.object({
  video_url: z.string().url().optional(),
  audio_url: z.string().url().optional(),
  duration_seconds: z.number().int().positive().optional(),
  file_size_bytes: z.number().int().positive().optional()
});

// Metadata object schema
const MetadataSchema = z.object({
  fathom_user_id: z.string().optional(),
  workspace_id: z.string().optional(),
  webhook_version: z.string().optional()
});

// Main webhook payload schema
const WebhookPayloadSchema = z.object({
  event: z.literal('meeting.completed'),
  timestamp: z.string().datetime(),
  meeting: MeetingSchema,
  attendees: z.array(AttendeeSchema).default([]),
  summary: z.string().optional().default('No summary provided'),
  key_topics: z.array(z.string()).optional().default([]),
  action_items: z.array(ActionItemSchema).optional().default([]),
  transcript: z.array(TranscriptEntrySchema).optional().default([]),
  recording: RecordingSchema.optional(),
  metadata: MetadataSchema.optional()
});

/**
 * Transform webhook payload for processing
 * Normalizes data and adds computed fields
 */
function transformWebhookPayload(rawPayload) {
  // Parse and validate
  const validated = WebhookPayloadSchema.parse(rawPayload);

  // Add computed fields
  const transformed = {
    ...validated,
    meeting: {
      ...validated.meeting,
      date: validated.meeting.scheduled_start_time || validated.meeting.created_at,
      duration_minutes: Math.round(validated.meeting.duration_seconds / 60)
    },
    // Compile full transcript text
    transcript_text: validated.transcript
      .map(entry => `${entry.speaker}: ${entry.text}`)
      .join('\n\n')
  };

  return transformed;
}

/**
 * Validate webhook headers
 */
const WebhookHeadersSchema = z.object({
  'x-fathom-webhook-id': z.string().optional(),
  'x-fathom-delivery-id': z.string(),
  'x-fathom-timestamp': z.string().optional(),
  'x-fathom-signature': z.string().optional(),
  'authorization': z.string().optional()
});

/**
 * Extract and validate webhook headers
 */
function validateWebhookHeaders(headers) {
  // Convert headers to lowercase for consistency
  const normalizedHeaders = {};
  for (const [key, value] of Object.entries(headers)) {
    normalizedHeaders[key.toLowerCase()] = value;
  }

  return WebhookHeadersSchema.parse(normalizedHeaders);
}

module.exports = {
  WebhookPayloadSchema,
  WebhookHeadersSchema,
  MeetingSchema,
  AttendeeSchema,
  ActionItemSchema,
  TranscriptEntrySchema,
  RecordingSchema,
  MetadataSchema,
  transformWebhookPayload,
  validateWebhookHeaders
};