const axios = require('axios');
const config = require('../utils/config');
const logger = require('../utils/logger');

const GAMMA_API_URL = 'https://public-api.gamma.app/v1.0';

/**
 * Create a Gamma presentation from processed meeting data
 * @param {Object} meetingData - Processed meeting data from Claude
 * @returns {Object} Gamma presentation details (url, id)
 */
async function createPresentation(meetingData) {
  if (!config.gamma.apiKey) {
    logger.info('No Gamma API key configured, skipping presentation generation');
    return null;
  }

  logger.info('Creating Gamma presentation for meeting');

  try {
    const presentationText = buildPresentationContent(meetingData);

    const response = await axios.post(
      `${GAMMA_API_URL}/generations`,
      {
        inputText: presentationText,
        textMode: 'outline',
        format: 'presentation',
        themeId: config.gamma.themeId,
        numCards: 'auto',
        cardSplit: 'auto',
        additionalInstructions: 'Use clear headings, bullet points, and professional formatting. Include icons where relevant.',
        textOptions: {
          amount: 'detailed',
          tone: 'professional, actionable',
          audience: 'team members, stakeholders',
          language: 'en'
        },
        imageOptions: {
          source: 'aiGenerated',
          model: 'imagen-4-pro',
          style: 'professional'
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': config.gamma.apiKey,
        },
      }
    );

    const presentation = {
      id: response.data.id,
      url: response.data.url || response.data.webUrl,
      status: response.data.status,
    };

    logger.info(`Gamma presentation created: ${presentation.url}`);
    return presentation;

  } catch (error) {
    logger.error('Gamma presentation creation error:', error.response?.data || error.message);
    // Don't throw - presentation generation is not critical
    return null;
  }
}

/**
 * Build comprehensive presentation content from meeting data
 */
function buildPresentationContent(data) {
  const sections = [];

  // Title slide
  sections.push(`# ${data.title || 'Meeting Summary'}`);
  sections.push(`Date: ${data.date || 'N/A'}`);
  sections.push(`Type: ${data.meetingType || 'General Meeting'}`);
  sections.push('');

  // Meeting summary
  sections.push('# Meeting Summary');
  sections.push(data.summary || 'No summary available');
  sections.push('');

  // Key action items
  if (data.actionItems && data.actionItems.length > 0) {
    sections.push('# Key Action Items');
    data.actionItems.forEach(item => {
      sections.push(`- ${item}`);
    });
    sections.push('');
  }

  // Process updates needed
  if (data.processUpdates && data.processUpdates.length > 0) {
    sections.push('# Process & System Updates Required');
    data.processUpdates.forEach(update => {
      sections.push(`- ${update}`);
    });
    sections.push('');
  }

  // People and relationships
  if (data.contacts && data.contacts.length > 0) {
    sections.push('# People & Relationships');

    data.contacts.forEach(contact => {
      sections.push(`## ${contact.name}`);

      if (contact.newInformation) {
        sections.push(`**New Information:**`);
        sections.push(contact.newInformation);
      }

      if (contact.insights && contact.insights.length > 0) {
        sections.push(`**Key Insights:**`);
        contact.insights.forEach(insight => {
          sections.push(`- ${insight}`);
        });
      }

      if (contact.relationshipNotes) {
        sections.push(`**Relationship Notes:**`);
        sections.push(contact.relationshipNotes);
      }

      sections.push('');
    });
  }

  // Additional discoveries
  if (data.discoveries && data.discoveries.length > 0) {
    sections.push('# Additional Discoveries');
    data.discoveries.forEach(discovery => {
      sections.push(`- ${discovery}`);
    });
    sections.push('');
  }

  // What was automated
  sections.push('# Automated Processing Summary');
  sections.push('This meeting was automatically processed by the Fathom Integration:');
  sections.push('');
  sections.push('**Actions Taken:**');

  const automatedActions = [
    'Meeting transcript analyzed by Claude AI',
    'Key information extracted and structured',
    'Contact records updated in CRM',
    'Action items distributed to team members',
    'Project files updated in AI Agency OS',
    'This presentation automatically generated',
    'Slack notification sent to #meeting-summaries'
  ];

  automatedActions.forEach(action => {
    sections.push(`- ${action}`);
  });
  sections.push('');

  // Next steps by person
  if (data.nextSteps && data.nextSteps.length > 0) {
    sections.push('# Next Steps by Person');

    // Group next steps by assignee
    const stepsByPerson = {};
    data.nextSteps.forEach(step => {
      const assignee = step.assignee || 'Unassigned';
      if (!stepsByPerson[assignee]) {
        stepsByPerson[assignee] = [];
      }
      stepsByPerson[assignee].push(step);
    });

    Object.keys(stepsByPerson).forEach(person => {
      sections.push(`## ${person}`);
      stepsByPerson[person].forEach(step => {
        const dueDate = step.dueDate ? ` (Due: ${step.dueDate})` : '';
        const priority = step.priority ? ` [${step.priority}]` : '';
        sections.push(`- ${step.task}${dueDate}${priority}`);
      });
      sections.push('');
    });
  }

  // Attendees
  if (data.attendees && data.attendees.length > 0) {
    sections.push('# Meeting Attendees');
    data.attendees.forEach(attendee => {
      sections.push(`- ${attendee}`);
    });
    sections.push('');
  }

  return sections.join('\n');
}

/**
 * Get presentation status
 * @param {string} presentationId - Gamma presentation ID
 * @returns {Object} Status information
 */
async function getPresentationStatus(presentationId) {
  if (!config.gamma.apiKey) {
    return null;
  }

  try {
    const response = await axios.get(
      `${GAMMA_API_URL}/generations/${presentationId}`,
      {
        headers: {
          'X-API-KEY': config.gamma.apiKey,
        },
      }
    );

    return response.data;
  } catch (error) {
    logger.error('Error fetching presentation status:', error.response?.data || error.message);
    return null;
  }
}

module.exports = {
  createPresentation,
  getPresentationStatus,
};
