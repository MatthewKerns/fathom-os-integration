const { z } = require('zod');

/**
 * Zod schema for Claude processor output validation
 */

// Classification schema
const ClassificationSchema = z.object({
  type: z.enum(['internal-partner', 'coaching-call', 'client-call', 'networking', 'sales-call', 'other']),
  confidence: z.number().min(0).max(1),
  reasoning: z.string().min(1)
});

// Attendee schema
const AttendeeSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().nullable().optional(),
  role: z.string().nullable().optional(),
  company: z.string().nullable().optional(),
  isKnownContact: z.boolean(),
  contactFilePath: z.string().nullable().optional(),
  suggestedCategory: z.enum(['clients', 'developers', 'coaches', 'potential-leads']).nullable().optional(),
  newInfoLearned: z.array(z.string()).default([])
});

// Action item schema
const ActionItemSchema = z.object({
  task: z.string().min(1),
  owner: z.string().min(1), // Can be Matthew, Mekaiel, Chris, Trent, or external name
  priority: z.enum(['urgent', 'important', 'strategic']),
  priorityEmoji: z.enum(['🔴', '🟡', '🟢']),
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(), // YYYY-MM-DD format
  context: z.string().min(1)
});

// Roadmap item schema
const RoadmapItemSchema = z.object({
  description: z.string().min(1),
  businessValue: z.string().min(1),
  priority: z.enum(['P0', 'P1', 'P2', 'P3', 'P4', 'P5']),
  owner: z.string().min(1),
  relatedProject: z.string().nullable().optional()
});

// Decision schema
const DecisionSchema = z.object({
  decision: z.string().min(1),
  context: z.string().min(1),
  reasoning: z.string().min(1),
  implications: z.string().min(1),
  owner: z.string().min(1)
});

// Learning schema
const LearningSchema = z.object({
  category: z.enum(['people', 'projects', 'market', 'strategy']),
  learning: z.string().min(1),
  relevantTo: z.string().min(1)
});

// File update schema
const FileUpdateSchema = z.object({
  action: z.enum(['create', 'append', 'update_section']),
  path: z.string().min(1),
  section: z.string().optional(), // Required for update_section
  content: z.string().min(1)
});

// Summary schema
const SummarySchema = z.object({
  oneLineSummary: z.string().min(1).max(200),
  urgentItemsCount: z.number().int().nonnegative(),
  totalActionItems: z.number().int().nonnegative(),
  newContactsIdentified: z.number().int().nonnegative(),
  filesAffected: z.number().int().nonnegative()
});

// Notifications schema
const NotificationsSchema = z.object({
  slackSummary: z.string().min(1),
  urgentAlert: z.string().nullable().optional()
});

// Main output schema
const ProcessorOutputSchema = z.object({
  classification: ClassificationSchema,
  attendees: z.array(AttendeeSchema).min(1),
  actionItems: z.array(ActionItemSchema).default([]),
  roadmapAdditions: z.array(RoadmapItemSchema).default([]),
  decisions: z.array(DecisionSchema).default([]),
  keyLearnings: z.array(LearningSchema).default([]),
  fileUpdates: z.array(FileUpdateSchema).min(1),
  summary: SummarySchema,
  notifications: NotificationsSchema
});

// Error response schema
const ErrorResponseSchema = z.object({
  error: z.literal(true),
  errorType: z.enum(['classification_uncertain', 'no_transcript', 'invalid_input', 'other']),
  errorMessage: z.string().min(1),
  partialResult: z.object({}).passthrough().optional(),
  requiresHumanReview: z.boolean()
});

/**
 * Validate and transform Claude's response
 */
function validateProcessorOutput(response) {
  try {
    // Try to parse as normal output first
    return {
      success: true,
      data: ProcessorOutputSchema.parse(response)
    };
  } catch (error) {
    // Check if it's an error response
    try {
      const errorResponse = ErrorResponseSchema.parse(response);
      return {
        success: false,
        error: errorResponse
      };
    } catch {
      // Neither valid output nor valid error
      throw new Error(`Invalid Claude response format: ${error.message}`);
    }
  }
}

/**
 * Validate file paths in the output
 */
function validateFilePaths(output) {
  const errors = [];

  for (const fileUpdate of output.fileUpdates) {
    // Check that paths start with the expected prefix
    if (!fileUpdate.path.startsWith('claude-code-os-implementation/')) {
      errors.push(`Invalid path prefix: ${fileUpdate.path}`);
    }

    // Check for update_section having a section
    if (fileUpdate.action === 'update_section' && !fileUpdate.section) {
      errors.push(`Missing section for update_section action: ${fileUpdate.path}`);
    }

    // Check for valid path characters
    if (!/^[a-zA-Z0-9\-_/\.]+$/.test(fileUpdate.path)) {
      errors.push(`Invalid characters in path: ${fileUpdate.path}`);
    }
  }

  return errors;
}

/**
 * Validate priority and emoji alignment
 */
function validatePriorities(output) {
  const priorityEmojiMap = {
    'urgent': '🔴',
    'important': '🟡',
    'strategic': '🟢'
  };

  const errors = [];

  for (const item of output.actionItems) {
    if (priorityEmojiMap[item.priority] !== item.priorityEmoji) {
      errors.push(`Priority mismatch for task: ${item.task}`);
    }
  }

  return errors;
}

/**
 * Transform output for file system operations
 */
function transformForFileSystem(output) {
  // Replace OS path prefix with actual path
  const transformed = {
    ...output,
    fileUpdates: output.fileUpdates.map(update => ({
      ...update,
      path: update.path.replace('claude-code-os-implementation/', '')
    }))
  };

  return transformed;
}

module.exports = {
  ProcessorOutputSchema,
  ErrorResponseSchema,
  ClassificationSchema,
  AttendeeSchema,
  ActionItemSchema,
  RoadmapItemSchema,
  DecisionSchema,
  LearningSchema,
  FileUpdateSchema,
  SummarySchema,
  NotificationsSchema,
  validateProcessorOutput,
  validateFilePaths,
  validatePriorities,
  transformForFileSystem
};