const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const config = require('../utils/config');
const claudeService = require('../services/claude');
const contextLoader = require('../services/contextLoader');
const fileManager = require('../services/fileManager');
const gammaService = require('../services/gamma');
const notifier = require('../services/notifier');

// Webhook verification middleware
const verifyWebhook = (req, res, next) => {
  const signature = req.headers['x-fathom-signature'];

  if (!signature) {
    logger.warn('Webhook received without signature');
    return res.status(401).json({ error: 'Missing signature' });
  }

  // TODO: Implement proper signature verification
  // For now, just check if secret matches
  if (signature !== config.fathom.webhookSecret) {
    logger.warn('Invalid webhook signature');
    return res.status(401).json({ error: 'Invalid signature' });
  }

  next();
};

// POST /webhook/fathom - Receive Fathom meeting data
router.post('/fathom', verifyWebhook, async (req, res) => {
  try {
    const meetingData = req.body;

    logger.info('Received Fathom webhook', {
      meetingId: meetingData.meeting_id,
      title: meetingData.title,
    });

    // Acknowledge receipt immediately
    res.status(200).json({ status: 'received' });

    // Process asynchronously
    processMeeting(meetingData).catch(err => {
      logger.error('Error processing meeting:', err);
    });

  } catch (error) {
    logger.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Processing failed' });
  }
});

// Process meeting (async)
async function processMeeting(meetingData) {
  logger.info('Processing meeting:', meetingData.meeting_id);

  try {
    // 1. Load OS context (contacts, projects, etc.)
    logger.info('Loading OS context...');
    const context = await contextLoader.loadContext();

    // 2. Process with Claude AI
    logger.info('Processing with Claude AI...');
    const processedData = await claudeService.processMeeting(meetingData, context);

    // 3. Update files in AI Agency OS
    logger.info('Updating files...');
    await fileManager.updateFiles(processedData);

    // 4. Create Gamma presentation
    logger.info('Creating Gamma presentation...');
    const presentation = await gammaService.createPresentation(processedData);

    // Add presentation URL to processed data for notification
    if (presentation) {
      processedData.presentationUrl = presentation.url;
      processedData.presentationId = presentation.id;
    }

    // 5. Send Slack notification
    logger.info('Sending notification...');
    await notifier.notify(processedData);

    logger.info('Meeting processing complete:', meetingData.meeting_id);
  } catch (error) {
    logger.error('Error in meeting processing pipeline:', error);
    throw error;
  }
}

module.exports = router;
