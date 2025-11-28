const simpleGit = require('simple-git');
const fs = require('fs').promises;
const path = require('path');
const config = require('../utils/config');
const logger = require('../utils/logger');

const git = simpleGit(config.os.path);

/**
 * Update OS files based on processed meeting data
 * @param {Object} processedData - Data from Claude processor output
 */
async function updateFiles(processedData) {
  logger.info('Updating OS files', {
    filesCount: processedData.fileUpdates?.length || 0
  });

  try {
    const results = [];

    // Process each file update from Claude's output
    for (const update of processedData.fileUpdates) {
      const result = await processFileUpdate(update);
      results.push(result);
    }

    // Commit all changes if configured to do so
    if (config.github?.autoCommit !== false && results.length > 0) {
      await commitChanges(processedData, results);
    }

    logger.info('OS files updated successfully', {
      filesUpdated: results.length
    });

    return results;

  } catch (error) {
    logger.error('Error updating files:', error);
    throw error;
  }
}

/**
 * Process a single file update based on action type
 */
async function processFileUpdate(update) {
  const fullPath = path.join(
    config.os.path,
    update.path.replace('claude-code-os-implementation/', '')
  );

  try {
    switch (update.action) {
      case 'create':
        return await createFile(fullPath, update.content);

      case 'append':
        return await appendToFile(fullPath, update.content);

      case 'update_section':
        return await updateFileSection(fullPath, update.section, update.content);

      default:
        throw new Error(`Unknown file action: ${update.action}`);
    }
  } catch (error) {
    logger.error(`Failed to process file update for ${fullPath}:`, error);
    throw error;
  }
}

/**
 * Create a new file
 */
async function createFile(filepath, content) {
  try {
    // Ensure directory exists
    const dir = path.dirname(filepath);
    await fs.mkdir(dir, { recursive: true });

    // Write file
    await fs.writeFile(filepath, content, 'utf-8');

    logger.info(`Created file: ${filepath}`);
    return {
      action: 'created',
      path: filepath,
      success: true
    };
  } catch (error) {
    logger.error(`Error creating file ${filepath}:`, error);
    throw error;
  }
}

/**
 * Append content to existing file
 */
async function appendToFile(filepath, content) {
  try {
    // Check if file exists
    const exists = await fileExists(filepath);

    if (!exists) {
      // Create file if it doesn't exist
      return await createFile(filepath, content);
    }

    // Read existing content
    const existing = await fs.readFile(filepath, 'utf-8');

    // Append new content with proper formatting
    const updated = existing.trimEnd() + '\n' + content;

    // Write back
    await fs.writeFile(filepath, updated, 'utf-8');

    logger.info(`Appended to file: ${filepath}`);
    return {
      action: 'appended',
      path: filepath,
      success: true
    };
  } catch (error) {
    logger.error(`Error appending to file ${filepath}:`, error);
    throw error;
  }
}

/**
 * Update a specific section in a file
 */
async function updateFileSection(filepath, section, content) {
  try {
    // Check if file exists
    const exists = await fileExists(filepath);

    if (!exists) {
      // Create file with section if it doesn't exist
      const newContent = `## ${section}\n\n${content}\n`;
      return await createFile(filepath, newContent);
    }

    // Read existing content
    const existing = await fs.readFile(filepath, 'utf-8');

    // Find and update section
    const sectionRegex = new RegExp(`(##\\s+${escapeRegex(section)}\\s*\\n)([^#]*?)(?=##|$)`, 'i');

    let updated;
    if (sectionRegex.test(existing)) {
      // Update existing section
      updated = existing.replace(sectionRegex, `$1${content}\n\n`);
    } else {
      // Append new section
      updated = existing.trimEnd() + `\n\n## ${section}\n\n${content}\n`;
    }

    // Write back
    await fs.writeFile(filepath, updated, 'utf-8');

    logger.info(`Updated section "${section}" in file: ${filepath}`);
    return {
      action: 'updated_section',
      path: filepath,
      section: section,
      success: true
    };
  } catch (error) {
    logger.error(`Error updating section in file ${filepath}:`, error);
    throw error;
  }
}

/**
 * Create internal meeting note file
 */
async function createInternalMeetingNote(data) {
  const date = new Date().toISOString().split('T')[0];
  const filename = `${date}-${data.title.toLowerCase().replace(/\s+/g, '-')}.md`;
  const filepath = path.join(
    config.os.path,
    '01-executive-office/internal-business-meetings/raw-notes',
    filename
  );

  const content = formatMeetingNote(data);

  await createFile(filepath, content);
  return filepath;
}

/**
 * Create coaching call note
 */
async function createCoachingNote(data) {
  const date = new Date().toISOString().split('T')[0];
  const coach = data.attendees.find(a => a.isCoach)?.name || 'unknown';
  const filename = `${date}-${coach.toLowerCase().replace(/\s+/g, '-')}.md`;
  const filepath = path.join(
    config.os.path,
    '05-hr-department/network-contacts/coaching-call-notes/raw-notes',
    filename
  );

  const content = formatMeetingNote(data);

  await createFile(filepath, content);
  return filepath;
}

/**
 * Format a meeting note with standard template
 */
function formatMeetingNote(data) {
  const date = new Date().toISOString().split('T')[0];
  const attendees = data.attendees.map(a => a.name).join(', ');
  const actionItems = data.actionItems?.map(item =>
    `- ${item.priorityEmoji} **${item.owner}:** ${item.task}${item.deadline ? ` (due: ${item.deadline})` : ''}`
  ).join('\n') || 'No action items';

  return `# ${data.summary.oneLineSummary}

**Date:** ${date}
**Attendees:** ${attendees}
**Duration:** ${data.meeting?.duration_minutes || 'Unknown'} minutes
**Meeting Type:** ${data.classification.type}
**Status:** [x] Processed
**Fathom Link:** ${data.meeting?.url || 'N/A'}

---

## Summary

${data.summary.oneLineSummary}

---

## Key Topics

${data.key_topics?.map(topic => `- ${topic}`).join('\n') || '- No specific topics identified'}

---

## Action Items

${actionItems}

---

## Decisions

${data.decisions?.map(d => `1. **${d.decision}** - ${d.reasoning}`).join('\n\n') || 'No decisions made'}

---

## Key Learnings

${data.keyLearnings?.map(l => `- **${l.category}:** ${l.learning}`).join('\n') || 'No key learnings identified'}

---

## Processed

**Processed on:** ${date}
**Auto-processed by:** Fathom Integration
`;
}

/**
 * Update action items tracker
 */
async function updateActionItems(items, meetingDate) {
  const filepath = path.join(
    config.os.path,
    '01-executive-office/internal-business-meetings/action-items/active-items.md'
  );

  // Format items for the table
  const formattedItems = items.map(item => {
    const date = meetingDate || new Date().toISOString().split('T')[0];
    const deadline = item.deadline || '-';
    return `| ${date} | ${item.owner} | ${item.task} | ${deadline} | [ ] |`;
  });

  // Group by priority
  const urgent = formattedItems.filter((_, i) => items[i].priority === 'urgent');
  const important = formattedItems.filter((_, i) => items[i].priority === 'important');
  const strategic = formattedItems.filter((_, i) => items[i].priority === 'strategic');

  // Update sections
  const updates = [];

  if (urgent.length > 0) {
    updates.push({
      action: 'update_section',
      path: filepath,
      section: '🔴 Urgent (Do Today/Tomorrow)',
      content: urgent.join('\n')
    });
  }

  if (important.length > 0) {
    updates.push({
      action: 'update_section',
      path: filepath,
      section: '🟡 Important (This Week)',
      content: important.join('\n')
    });
  }

  if (strategic.length > 0) {
    updates.push({
      action: 'update_section',
      path: filepath,
      section: '🟢 Strategic (This Month)',
      content: strategic.join('\n')
    });
  }

  // Process all updates
  for (const update of updates) {
    await updateFileSection(update.path, update.section, update.content);
  }

  return filepath;
}

/**
 * Update roadmap file
 */
async function updateRoadmap(additions) {
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const filepath = path.join(
    config.os.path,
    '01-executive-office/internal-business-meetings/roadmap-updates',
    `${currentMonth}.md`
  );

  // Format roadmap items
  const content = additions.map(item => {
    return `### ${item.description}

**Priority:** ${item.priority}
**Owner:** ${item.owner}
**Business Value:** ${item.businessValue}
${item.relatedProject ? `**Related Project:** ${item.relatedProject}` : ''}

---
`;
  }).join('\n');

  await appendToFile(filepath, content);
  return filepath;
}

/**
 * Commit and push changes
 */
async function commitChanges(data, updates) {
  try {
    // Check if we're in a git repo
    const isRepo = await git.checkIsRepo();
    if (!isRepo) {
      logger.warn('Not in a git repository, skipping commit');
      return;
    }

    // Add all modified files
    await git.add('./*');

    // Check if there are changes to commit
    const status = await git.status();
    if (status.files.length === 0) {
      logger.info('No changes to commit');
      return;
    }

    // Create commit message
    const commitMessage = `Add meeting notes: ${data.summary?.oneLineSummary || 'Meeting processed'}

Meeting Type: ${data.classification?.type || 'unknown'}
Files Updated: ${updates.length}
Action Items: ${data.actionItems?.length || 0}

Processed by Fathom Integration`;

    // Commit
    await git.commit(commitMessage, {
      '--author': `"${config.github.author.name} <${config.github.author.email}>"`,
    });

    logger.info('Changes committed to git');

    // Push if configured
    if (config.github?.autoPush === true) {
      await git.push();
      logger.info('Changes pushed to remote');
    }

  } catch (error) {
    logger.error('Git operation error:', error);
    // Don't throw - git errors shouldn't break file processing
  }
}

/**
 * Check if file exists
 */
async function fileExists(filepath) {
  try {
    await fs.access(filepath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Escape special regex characters
 */
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = {
  updateFiles,
  createInternalMeetingNote,
  createCoachingNote,
  updateActionItems,
  updateRoadmap,
  commitChanges,
  processFileUpdate
};