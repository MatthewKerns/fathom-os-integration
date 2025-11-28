const simpleGit = require('simple-git');
const fs = require('fs').promises;
const path = require('path');
const config = require('../utils/config');
const logger = require('../utils/logger');

const git = simpleGit(config.os.path);

/**
 * Update OS files based on processed meeting data
 * @param {Object} processedData - Data from Claude
 */
async function updateFiles(processedData) {
  logger.info('Updating OS files');

  try {
    const updates = [];

    // Create/update files based on meeting type
    if (processedData.meetingType === 'internal_partner') {
      updates.push(await createInternalMeetingNote(processedData));
    }

    if (processedData.meetingType === 'coaching') {
      updates.push(await createCoachingNote(processedData));
    }

    if (processedData.actionItems?.length > 0) {
      updates.push(await updateActionItems(processedData.actionItems));
    }

    if (processedData.roadmapAdditions?.length > 0) {
      updates.push(await updateRoadmap(processedData.roadmapAdditions));
    }

    // Commit changes
    await commitChanges(processedData, updates);

    logger.info('OS files updated successfully');
    return updates;

  } catch (error) {
    logger.error('Error updating files:', error);
    throw error;
  }
}

/**
 * Create internal meeting note file
 */
async function createInternalMeetingNote(data) {
  const filename = `${data.date}-${data.title.toLowerCase().replace(/\s+/g, '-')}.md`;
  const filepath = path.join(
    config.os.path,
    'claude-code-os-implementation/01-executive-office/internal-business-meetings/raw-notes',
    filename
  );

  // TODO: Use template from docs
  const content = `# ${data.title}\n\n**Date:** ${data.date}\n\n${data.summary}`;

  await fs.writeFile(filepath, content);
  return filepath;
}

/**
 * Create coaching call note
 */
async function createCoachingNote(data) {
  // TODO: Implement
  return null;
}

/**
 * Update action items tracker
 */
async function updateActionItems(items) {
  // TODO: Implement
  return null;
}

/**
 * Update roadmap file
 */
async function updateRoadmap(additions) {
  // TODO: Implement
  return null;
}

/**
 * Commit and push changes
 */
async function commitChanges(data, updates) {
  try {
    await git.add('./*');
    await git.commit(
      `Add meeting notes: ${data.title}\n\nProcessed by Fathom Integration`,
      {
        '--author': `"${config.github.author.name} <${config.github.author.email}>"`,
      }
    );

    // TODO: Optionally push to remote
    // await git.push();

    logger.info('Changes committed');

  } catch (error) {
    logger.error('Git commit error:', error);
    throw error;
  }
}

module.exports = {
  updateFiles,
};
