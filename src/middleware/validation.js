const crypto = require('crypto');
const { WebhookPayloadSchema, validateWebhookHeaders } = require('../schemas/webhookPayload');
const config = require('../utils/config');
const logger = require('../utils/logger');

/**
 * Middleware to verify webhook signature from Fathom
 */
function validateWebhook(req, res, next) {
  try {
    // Validate headers
    const headers = validateWebhookHeaders(req.headers);

    // Get delivery ID for tracking
    const deliveryId = headers['x-fathom-delivery-id'];
    req.deliveryId = deliveryId;

    // Check webhook secret
    const webhookSecret = config.fathom.webhookSecret;
    if (!webhookSecret) {
      logger.error('FATHOM_WEBHOOK_SECRET not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Verify signature if provided
    if (headers['x-fathom-signature']) {
      const verified = verifySignature(
        req.body,
        headers['x-fathom-signature'],
        webhookSecret
      );

      if (!verified) {
        logger.warn('Invalid webhook signature', { deliveryId });
        return res.status(401).json({ error: 'Invalid signature' });
      }
    }

    // Check authorization header if no signature
    else if (headers['authorization']) {
      const expectedAuth = `Bearer ${webhookSecret}`;
      if (headers['authorization'] !== expectedAuth) {
        logger.warn('Invalid authorization token', { deliveryId });
        return res.status(401).json({ error: 'Invalid authorization' });
      }
    }

    // No authentication method provided
    else {
      logger.warn('No authentication provided', { deliveryId });
      return res.status(401).json({ error: 'Authentication required' });
    }

    logger.debug('Webhook authentication successful', { deliveryId });
    next();

  } catch (error) {
    logger.error('Webhook validation error:', error);
    return res.status(400).json({ error: 'Invalid webhook format' });
  }
}

/**
 * Verify HMAC signature
 */
function verifySignature(payload, signature, secret) {
  try {
    const expectedSignature = 'sha256=' + crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');

    // Timing-safe comparison
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    logger.error('Signature verification error:', error);
    return false;
  }
}

/**
 * Middleware to validate webhook payload structure
 */
function validatePayload(req, res, next) {
  try {
    // Parse and validate payload
    const result = WebhookPayloadSchema.safeParse(req.body);

    if (!result.success) {
      logger.error('Invalid webhook payload', {
        deliveryId: req.deliveryId,
        errors: result.error.errors
      });
      return res.status(400).json({
        error: 'Invalid payload format',
        details: result.error.errors
      });
    }

    // Attach validated data
    req.webhookData = result.data;

    // Log webhook received
    logger.info('Webhook payload validated', {
      deliveryId: req.deliveryId,
      meetingId: result.data.meeting?.id,
      meetingTitle: result.data.meeting?.title,
      attendeeCount: result.data.attendees?.length || 0
    });

    next();

  } catch (error) {
    logger.error('Payload validation error:', error);
    return res.status(400).json({ error: 'Invalid payload' });
  }
}

/**
 * Idempotency check middleware
 */
async function checkIdempotency(req, res, next) {
  const deliveryId = req.deliveryId;

  // Simple in-memory store for processed deliveries
  // In production, use Redis or database
  if (!global.processedDeliveries) {
    global.processedDeliveries = new Set();
  }

  if (global.processedDeliveries.has(deliveryId)) {
    logger.info('Duplicate webhook delivery detected', { deliveryId });
    return res.status(200).json({
      received: true,
      deliveryId,
      duplicate: true
    });
  }

  // Add to processed set (with cleanup after 24 hours)
  global.processedDeliveries.add(deliveryId);
  setTimeout(() => {
    global.processedDeliveries.delete(deliveryId);
  }, 24 * 60 * 60 * 1000);

  next();
}

/**
 * Error handler middleware
 */
function errorHandler(err, req, res, next) {
  logger.error('Unhandled error in webhook processing:', {
    error: err.message,
    stack: err.stack,
    deliveryId: req.deliveryId
  });

  // Don't expose internal errors
  res.status(500).json({
    error: 'Internal server error',
    deliveryId: req.deliveryId
  });
}

module.exports = {
  validateWebhook,
  validatePayload,
  checkIdempotency,
  errorHandler,
  verifySignature
};