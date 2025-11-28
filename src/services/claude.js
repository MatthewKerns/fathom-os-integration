const Anthropic = require('@anthropic-ai/sdk');
const config = require('../utils/config');
const logger = require('../utils/logger');

// Initialize Anthropic client
const client = new Anthropic({
  apiKey: config.anthropic.apiKey,
});

/**
 * Process meeting with Claude AI
 * @param {string} prompt - The formatted prompt with meeting data and context
 * @returns {string} Claude's response (raw text)
 */
async function processMeeting(prompt) {
  logger.info('Sending meeting to Claude for processing');

  try {
    const startTime = Date.now();

    const message = await client.messages.create({
      model: config.anthropic.model || 'claude-3-5-sonnet-20241022',
      max_tokens: config.anthropic.maxTokens || 4096,
      temperature: 0.3, // Lower temperature for more consistent structured output
      messages: [{
        role: 'user',
        content: prompt,
      }],
      // Add system message for better JSON formatting
      system: `You are a meeting processor that analyzes meeting transcripts and outputs structured JSON.
Always respond with valid JSON matching the exact schema provided.
Do not include any text outside the JSON response.`
    });

    const response = message.content[0].text;
    const processingTime = Date.now() - startTime;

    logger.info('Claude processing complete', {
      processingTimeMs: processingTime,
      inputTokens: message.usage?.input_tokens,
      outputTokens: message.usage?.output_tokens
    });

    return response;

  } catch (error) {
    logger.error('Claude API error:', {
      error: error.message,
      statusCode: error.status,
      type: error.error?.type
    });

    // Handle specific API errors
    if (error.status === 429) {
      throw new Error('Claude API rate limit exceeded. Please try again later.');
    }
    if (error.status === 401) {
      throw new Error('Invalid Claude API key. Please check configuration.');
    }
    if (error.status === 400) {
      throw new Error('Invalid request to Claude API. Check prompt format.');
    }

    throw error;
  }
}

/**
 * Test Claude connectivity and API key
 */
async function testConnection() {
  try {
    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 100,
      messages: [{
        role: 'user',
        content: 'Say "OK" if you can read this.',
      }],
    });

    return response.content[0].text.includes('OK');
  } catch (error) {
    logger.error('Claude connection test failed:', error);
    return false;
  }
}

/**
 * Estimate token count for a prompt (rough approximation)
 */
function estimateTokens(text) {
  // Rough estimation: ~4 characters per token
  return Math.ceil(text.length / 4);
}

/**
 * Check if prompt is within token limits
 */
function checkTokenLimits(prompt) {
  const estimated = estimateTokens(prompt);
  const maxInput = 150000; // Claude 3.5 Sonnet max

  if (estimated > maxInput) {
    logger.warn('Prompt may exceed token limits', {
      estimated,
      maxInput
    });
    return false;
  }

  return true;
}

module.exports = {
  processMeeting,
  testConnection,
  estimateTokens,
  checkTokenLimits
};