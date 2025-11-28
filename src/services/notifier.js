const axios = require('axios');
const config = require('../utils/config');
const logger = require('../utils/logger');

/**
 * Send notification about processed meeting
 * @param {Object} data - Processed meeting data
 */
async function notify(data) {
  logger.info('Sending notification to Slack');

  try {
    if (config.slack.webhookUrl) {
      await sendSlackNotification(data);
    } else {
      logger.info('No Slack webhook configured, skipping notification');
    }
  } catch (error) {
    logger.error('Notification error:', error);
    // Don't throw - notifications are not critical
  }
}

/**
 * Send Slack notification with meeting summary
 */
async function sendSlackNotification(data) {
  // Build summary text
  const summaryText = data.summary || 'No summary available';
  const actionItemsText = data.actionItems?.length > 0
    ? data.actionItems.map(item => `• ${item}`).join('\n')
    : 'No action items';

  const message = {
    text: `✅ Meeting processed: ${data.title}`,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `📝 ${data.title}`,
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Type:*\n${data.meetingType || 'General'}`,
          },
          {
            type: 'mrkdwn',
            text: `*Date:*\n${data.date || 'N/A'}`,
          },
          {
            type: 'mrkdwn',
            text: `*Attendees:*\n${data.attendees?.length || 0}`,
          },
          {
            type: 'mrkdwn',
            text: `*Action Items:*\n${data.actionItems?.length || 0}`,
          },
        ],
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Summary:*\n${summaryText}`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Action Items:*\n${actionItemsText}`,
        },
      },
      {
        type: 'divider',
      },
    ],
  };

  // Add Gamma presentation link if available
  if (data.presentationUrl) {
    message.blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `🎨 *<${data.presentationUrl}|View Gamma Presentation>*`,
      },
    });
    message.blocks.push({
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: 'Auto-generated presentation with meeting insights, action items, and next steps',
        },
      ],
    });
  }

  // Footer
  message.blocks.push({
    type: 'context',
    elements: [
      {
        type: 'mrkdwn',
        text: `Posted to ${config.slack.channel} | Processed by Fathom Integration`,
      },
    ],
  });

  // Send to Slack webhook
  await axios.post(config.slack.webhookUrl, message);
  logger.info(`Slack notification sent to ${config.slack.channel}`);
}

module.exports = {
  notify,
};
