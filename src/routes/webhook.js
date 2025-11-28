const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const {
  validateWebhook,
  validatePayload,
  checkIdempotency,
  errorHandler
} = require('../middleware/validation');
const { processWebhook, processTestWebhook } = require('../services/processor');

/**
 * POST /webhook/fathom - Receive Fathom meeting data
 *
 * Flow:
 * 1. Validate webhook signature
 * 2. Check idempotency
 * 3. Validate payload structure
 * 4. Acknowledge receipt immediately
 * 5. Process asynchronously
 */
router.post('/fathom',
  validateWebhook,
  checkIdempotency,
  validatePayload,
  async (req, res) => {
    const deliveryId = req.deliveryId;

    try {
      logger.info('Webhook received', {
        deliveryId,
        meetingId: req.webhookData.meeting?.id,
        meetingTitle: req.webhookData.meeting?.title
      });

      // Acknowledge receipt immediately (Fathom expects quick response)
      res.status(200).json({
        received: true,
        deliveryId,
        timestamp: new Date().toISOString()
      });

      // Process asynchronously to avoid timeout
      setImmediate(async () => {
        try {
          await processWebhook(req.webhookData, deliveryId);
        } catch (error) {
          logger.error('Async processing failed', {
            deliveryId,
            error: error.message
          });
          // In production, could trigger retry or alert
        }
      });

    } catch (error) {
      logger.error('Webhook handler error:', error);
      res.status(500).json({
        error: 'Processing failed',
        deliveryId
      });
    }
  }
);

/**
 * GET /webhook/health - Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'fathom-webhook'
  });
});

/**
 * POST /webhook/test - Test endpoint for development
 * Processes a sample webhook without authentication
 */
router.post('/test', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Not found' });
  }

  try {
    logger.info('Processing test webhook');

    const result = await processTestWebhook();

    res.json({
      success: true,
      message: 'Test webhook processed',
      result
    });

  } catch (error) {
    logger.error('Test webhook failed:', error);
    res.status(500).json({
      error: 'Test processing failed',
      message: error.message
    });
  }
});

/**
 * GET /webhook/status/:deliveryId - Check webhook processing status
 * (Optional: implement if you store processing status)
 */
router.get('/status/:deliveryId', (req, res) => {
  const { deliveryId } = req.params;

  // Check if processed (using global store for now)
  const isProcessed = global.processedDeliveries?.has(deliveryId);

  res.json({
    deliveryId,
    processed: isProcessed,
    timestamp: new Date().toISOString()
  });
});

// Error handler middleware (must be last)
router.use(errorHandler);

module.exports = router;