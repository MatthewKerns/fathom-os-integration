const logger = require('../utils/logger');
const config = require('../utils/config');
const { loadContext } = require('./contextLoader');
const { processMeeting } = require('./claude');
const { updateFiles } = require('./fileManager');
const { sendNotification } = require('./notifier');
const { createPresentation } = require('./gamma');
const { buildPrompt, parseResponse } = require('../prompts/meetingProcessor');
const { transformWebhookPayload } = require('../schemas/webhookPayload');
const { validateProcessorOutput, validateFilePaths, validatePriorities } = require('../schemas/outputSchema');

/**
 * Main webhook processor
 * Orchestrates the entire meeting processing pipeline
 */
async function processWebhook(webhookPayload, deliveryId) {
  const startTime = Date.now();

  logger.info('Starting webhook processing', {
    deliveryId,
    meetingId: webhookPayload.meeting?.id,
    meetingTitle: webhookPayload.meeting?.title
  });

  try {
    // Step 1: Transform and validate webhook data
    const transformedPayload = transformWebhookPayload(webhookPayload);

    // Step 2: Load OS context
    logger.debug('Loading OS context');
    const context = await loadContext();

    // Step 3: Build prompt for Claude
    logger.debug('Building Claude prompt');
    const prompt = buildPrompt(transformedPayload, context);

    // Step 4: Process with Claude
    logger.info('Sending to Claude for processing');
    const claudeResponse = await processMeeting(prompt);

    // Step 5: Parse and validate Claude's response
    logger.debug('Parsing Claude response');
    const parsedResponse = parseResponse(claudeResponse);

    // Step 6: Validate the output
    const validationResult = validateProcessorOutput(parsedResponse);
    if (!validationResult.success) {
      throw new Error(`Invalid Claude response: ${JSON.stringify(validationResult.error)}`);
    }

    const processedData = validationResult.data;

    // Additional validations
    const pathErrors = validateFilePaths(processedData);
    if (pathErrors.length > 0) {
      logger.warn('File path validation issues:', pathErrors);
    }

    const priorityErrors = validatePriorities(processedData);
    if (priorityErrors.length > 0) {
      logger.warn('Priority validation issues:', priorityErrors);
    }

    // Step 7: Update OS files
    logger.info('Updating OS files');
    const fileResults = await updateFiles(processedData);

    // Step 8: Create Gamma presentation (optional)
    let presentationUrl = null;
    if (config.gamma?.enabled && config.gamma?.apiKey) {
      try {
        logger.info('Creating Gamma presentation');
        presentationUrl = await createPresentation(processedData);
      } catch (error) {
        logger.error('Failed to create Gamma presentation:', error);
        // Continue processing even if Gamma fails
      }
    }

    // Step 9: Send notifications
    if (config.slack?.enabled) {
      try {
        logger.info('Sending Slack notification');
        await sendNotification({
          ...processedData,
          presentationUrl,
          filesUpdated: fileResults.length
        });
      } catch (error) {
        logger.error('Failed to send Slack notification:', error);
        // Continue processing even if notification fails
      }
    }

    // Calculate processing time
    const processingTime = Date.now() - startTime;

    logger.info('Webhook processing completed successfully', {
      deliveryId,
      meetingId: webhookPayload.meeting?.id,
      processingTimeMs: processingTime,
      filesUpdated: fileResults.length,
      actionItemsCount: processedData.actionItems?.length || 0,
      classificationType: processedData.classification?.type,
      presentationCreated: !!presentationUrl
    });

    return {
      success: true,
      deliveryId,
      processingTime,
      summary: processedData.summary,
      filesUpdated: fileResults.length,
      presentationUrl
    };

  } catch (error) {
    const processingTime = Date.now() - startTime;

    logger.error('Webhook processing failed', {
      deliveryId,
      error: error.message,
      stack: error.stack,
      processingTimeMs: processingTime
    });

    // Store failed webhook for retry
    await storeFailedWebhook(webhookPayload, deliveryId, error);

    throw error;
  }
}

/**
 * Store failed webhook for potential retry
 */
async function storeFailedWebhook(payload, deliveryId, error) {
  try {
    // In production, store in database or queue
    // For now, just log
    logger.error('Storing failed webhook for retry', {
      deliveryId,
      error: error.message
    });

    // Could write to a file for manual recovery
    const fs = require('fs').promises;
    const path = require('path');
    const failedDir = path.join(__dirname, '../../logs/failed-webhooks');

    await fs.mkdir(failedDir, { recursive: true });

    const filename = `${deliveryId}-${Date.now()}.json`;
    const filepath = path.join(failedDir, filename);

    await fs.writeFile(filepath, JSON.stringify({
      deliveryId,
      timestamp: new Date().toISOString(),
      error: error.message,
      payload
    }, null, 2));

    logger.info(`Failed webhook stored: ${filepath}`);
  } catch (storeError) {
    logger.error('Failed to store webhook for retry:', storeError);
  }
}

/**
 * Retry failed webhook
 */
async function retryFailedWebhook(deliveryId) {
  try {
    // Load failed webhook from storage
    const fs = require('fs').promises;
    const path = require('path');
    const failedDir = path.join(__dirname, '../../logs/failed-webhooks');

    // Find file with matching delivery ID
    const files = await fs.readdir(failedDir);
    const matchingFile = files.find(f => f.startsWith(deliveryId));

    if (!matchingFile) {
      throw new Error(`No failed webhook found for delivery ID: ${deliveryId}`);
    }

    const filepath = path.join(failedDir, matchingFile);
    const content = await fs.readFile(filepath, 'utf-8');
    const { payload } = JSON.parse(content);

    // Retry processing
    const result = await processWebhook(payload, `${deliveryId}-retry`);

    // Delete successful retry
    await fs.unlink(filepath);

    return result;
  } catch (error) {
    logger.error('Failed to retry webhook:', error);
    throw error;
  }
}

/**
 * Process a test webhook with sample data
 */
async function processTestWebhook() {
  const samplePayload = {
    event: 'meeting.completed',
    timestamp: new Date().toISOString(),
    meeting: {
      id: 'test_meeting_001',
      title: 'Test Internal Meeting',
      url: 'https://fathom.video/share/test001',
      duration_seconds: 1800,
      scheduled_start_time: new Date().toISOString(),
      scheduled_end_time: new Date(Date.now() + 1800000).toISOString()
    },
    attendees: [
      {
        name: 'Matthew Kerns',
        email: 'matthew@example.com',
        is_host: true,
        speaking_time_seconds: 900
      },
      {
        name: 'Chris',
        email: 'chris@example.com',
        speaking_time_seconds: 900
      }
    ],
    summary: 'Test meeting to validate the integration pipeline.',
    key_topics: ['Integration testing', 'Pipeline validation'],
    action_items: [
      {
        text: 'Test the webhook processing',
        assignee: 'Matthew',
        completed: false
      }
    ],
    transcript: [
      {
        speaker: 'Matthew Kerns',
        start_time: 0,
        end_time: 10,
        text: 'This is a test meeting to validate our integration.'
      },
      {
        speaker: 'Chris',
        start_time: 10,
        end_time: 20,
        text: 'Sounds good, let\'s make sure everything is working correctly.'
      }
    ]
  };

  return processWebhook(samplePayload, 'test_delivery_001');
}

module.exports = {
  processWebhook,
  retryFailedWebhook,
  processTestWebhook
};