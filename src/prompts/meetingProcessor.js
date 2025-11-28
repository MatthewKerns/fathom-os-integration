// File system and path imports removed - not used in this module

/**
 * Build the Claude prompt for processing meeting notes
 * @param {Object} webhookPayload - The Fathom webhook payload
 * @param {Object} context - Loaded OS context (contacts, projects, etc)
 * @returns {string} The formatted prompt for Claude
 */
function buildPrompt(webhookPayload, context) {
  const { meeting, attendees, summary, action_items, transcript } = webhookPayload;

  // Format attendees list
  const attendeesList = attendees
    .map(a => `- ${a.name} (${a.email || 'no email'})${a.role ? ' - ' + a.role : ''}`)
    .join('\n');

  // Format contacts list (summarized for token management)
  const contactsList = formatContactsList(context.contacts);

  // Format projects list
  const projectsList = formatProjectsList(context.projects);

  // Format coaches list
  const coachesList = formatCoachesList(context.coaches);

  // Format action items from Fathom
  const fathomActionItems = action_items
    .map(item => `- ${item.description}${item.assignee ? ' [Assigned to: ' + item.assignee + ']' : ''}`)
    .join('\n');

  // Build the prompt using the template from MEETING-PROCESSOR.md
  const prompt = `You are processing meeting notes for the AI Agency Development OS - a system that helps run an AI automation agency.

Your job is to analyze meeting data from Fathom and:
1. Classify the meeting type
2. Identify all attendees and match to known contacts
3. Extract actionable information
4. Determine which OS files need updates
5. Generate the exact content for each file update

---

## OS Structure

The AI Agency Development OS has this structure:

\`\`\`
claude-code-os-implementation/
├── 01-executive-office/
│   ├── internal-business-meetings/    # Partner meetings (Mekaiel, Chris, Trent)
│   │   ├── raw-notes/                 # Fathom exports
│   │   ├── by-partner/                # mekaiel.md, chris.md, trent.md
│   │   ├── action-items/              # active-items.md
│   │   └── roadmap-updates/           # YYYY-MM.md
│   └── daily-planning/
│       └── logs/                      # Daily plans
├── 02-operations/
│   └── project-management/
│       └── active-projects/           # Client project files
└── 05-hr-department/
    └── network-contacts/
        ├── by-category/               # Contact files by type
        │   ├── clients/
        │   ├── developers/
        │   ├── coaches/
        │   └── potential-leads/
        └── coaching-call-notes/       # Coaching sessions
            ├── raw-notes/
            ├── by-coach/
            └── by-topic/
\`\`\`

---

## Team Members

These are the equity partners in the agency:

**Matthew (Architect)**
- Role: Strong software development, dev systems, company OS development, agency building, prototyping, validation and testing
- Email patterns: [matthew@..., matt@...]

**Mekaiel**
- Role: Systems, onboarding, sales, content systems + video editing connection
- Email patterns: [mekaiel@..., mikael@...]

**Chris**
- Role: Systems, onboarding, sales, list of leads management
- Email patterns: [chris@...]

**Trent (Architect)**
- Role: Strong software development, development systems, robotics + physical automation, hiring/assessing/onboarding developers, prototyping, validation and testing
- Email patterns: [trent@...]

Note: The agency is evolving to define and adapt roles to fulfill all demands of a scaling agency.

---

## Known Coaches

${coachesList}

---

## Known Contacts

${contactsList}

---

## Active Projects

${projectsList}

---

## Current Date

${new Date().toISOString().split('T')[0]}

---

## Meeting Data from Fathom

**Meeting Title:** ${meeting.title || 'Untitled Meeting'}

**Date:** ${meeting.date}

**Duration:** ${meeting.duration_minutes} minutes

**Attendees:**
${attendeesList}

**Fathom Summary:**
${summary || 'No summary provided'}

**Fathom Action Items:**
${fathomActionItems || 'No action items identified'}

**Full Transcript:**
${truncateTranscript(transcript)}

---

## Your Task

Analyze this meeting and provide a structured JSON response with the following sections:

### 1. CLASSIFICATION

Determine the meeting type:
- \`internal-partner\` → Meeting with Mekaiel, Chris, and/or Trent (equity partners)
- \`coaching-call\` → Meeting with a known coach
- \`client-call\` → Meeting with a known client or about a known project
- \`networking\` → Meeting with new contacts / relationship building
- \`sales-call\` → Discovery or sales conversation with potential client
- \`other\` → Doesn't fit above categories

### 2. ATTENDEES

For each person on the call:
- Name
- Email (if available)
- Role/Company (if known)
- Is this a known contact?
- Contact file path if known
- Category for new contacts
- New information learned

### 3. ACTION ITEMS

Extract ALL action items from:
- Fathom's action items list
- Commitments made in transcript
- Follow-ups mentioned

For each action item:
- Task description (clear, actionable)
- Owner: Matthew | Mekaiel | Chris | Trent | [External Name]
- Priority:
  - 🔴 \`urgent\` - Do today or tomorrow
  - 🟡 \`important\` - Do this week
  - 🟢 \`strategic\` - Do this month
- Deadline (if mentioned)
- Context (why this matters)

### 4. ROADMAP ADDITIONS

New ideas, features, or initiatives discussed:
- Description
- Business value
- Priority: P0-P5
- Owner
- Related project

### 5. DECISIONS MADE

Any decisions reached:
- Decision
- Context
- Reasoning
- Implications
- Owner

### 6. KEY LEARNINGS

Important information learned about:
- People (relationships, preferences, background)
- Projects (requirements, constraints, timelines)
- Market (trends, opportunities, threats)
- Strategic insights

### 7. FILE UPDATES

Specify exactly which files need to be created or updated based on meeting type and content.

---

## Output Format

Respond with ONLY valid JSON matching the exact structure shown in the documentation.

Important:
- Be thorough in extracting action items
- Be specific with task descriptions
- Match contacts carefully
- Generate valid markdown for file content
- Use exact file paths from the OS structure`;

  return prompt;
}

/**
 * Format contacts list for the prompt (summarized to save tokens)
 */
function formatContactsList(contacts) {
  if (!contacts || contacts.length === 0) {
    return 'No contacts loaded';
  }

  return contacts
    .map(c => `- ${c.name} (${c.category}): ${c.email || 'no email'}${c.company ? ' @ ' + c.company : ''}`)
    .slice(0, 50) // Limit to 50 contacts to manage tokens
    .join('\n') + (contacts.length > 50 ? `\n... and ${contacts.length - 50} more` : '');
}

/**
 * Format projects list for the prompt
 */
function formatProjectsList(projects) {
  if (!projects || projects.length === 0) {
    return 'No active projects';
  }

  return projects
    .map(p => `- ${p.name}: ${p.client} (${p.status})`)
    .join('\n');
}

/**
 * Format coaches list for the prompt
 */
function formatCoachesList(coaches) {
  if (!coaches || coaches.length === 0) {
    return 'No known coaches';
  }

  return coaches
    .map(c => `- ${c.name}: ${c.specialty || 'General'}`)
    .join('\n');
}

/**
 * Truncate transcript if too long (token management)
 */
function truncateTranscript(transcript, maxLength = 15000) {
  if (!transcript) return 'No transcript available';

  if (transcript.length <= maxLength) {
    return transcript;
  }

  // Take the last portion of the transcript (most recent discussion)
  const truncated = transcript.slice(-maxLength);
  return `[Transcript truncated to last ${maxLength} characters for token management]\n\n...${truncated}`;
}

/**
 * Parse and validate Claude's response
 */
function parseResponse(claudeResponse) {
  try {
    const parsed = JSON.parse(claudeResponse);

    // Validate required fields exist
    const requiredFields = ['classification', 'attendees', 'actionItems', 'fileUpdates', 'summary'];
    for (const field of requiredFields) {
      if (!parsed[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate classification type
    const validTypes = ['internal-partner', 'coaching-call', 'client-call', 'networking', 'sales-call', 'other'];
    if (!validTypes.includes(parsed.classification.type)) {
      throw new Error(`Invalid classification type: ${parsed.classification.type}`);
    }

    return parsed;
  } catch (error) {
    throw new Error(`Failed to parse Claude response: ${error.message}`);
  }
}

module.exports = {
  buildPrompt,
  parseResponse,
  formatContactsList,
  formatProjectsList,
  formatCoachesList,
  truncateTranscript
};