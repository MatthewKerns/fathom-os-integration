const Anthropic = require('@anthropic-ai/sdk');
const config = require('../utils/config');
const logger = require('../utils/logger');

const client = new Anthropic({
  apiKey: config.anthropic.apiKey,
});

/**
 * Process meeting data with Claude
 * @param {Object} meetingData - Raw meeting data from Fathom
 * @param {Object} context - OS context (contacts, projects, etc.)
 * @returns {Object} Processed meeting data
 */
async function processMeeting(meetingData, context) {
  logger.info('Sending meeting to Claude for processing');

  try {
    // TODO: Load prompt template from prompts/meetingProcessor.js
    const prompt = buildPrompt(meetingData, context);

    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: prompt,
      }],
    });

    const response = message.content[0].text;

    // TODO: Parse and validate response against output schema
    const parsed = JSON.parse(response);

    logger.info('Meeting processed successfully by Claude');
    return parsed;

  } catch (error) {
    logger.error('Claude processing error:', error);
    throw error;
  }
}

/**
 * Build prompt for Claude
 * TODO: Import from prompts/meetingProcessor.js
 */
function buildPrompt(meetingData, context) {
  return `Process this meeting data and extract structured information.

Meeting Data:
${JSON.stringify(meetingData, null, 2)}

Context:
${JSON.stringify(context, null, 2)}

Return structured JSON following the output schema.`;
}

module.exports = {
  processMeeting,
};
