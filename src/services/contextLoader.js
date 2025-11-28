const fs = require('fs').promises;
const path = require('path');
const config = require('../utils/config');
const logger = require('../utils/logger');

/**
 * Load OS context for Claude to understand the current state
 * @returns {Object} Context including contacts, projects, etc.
 */
async function loadContext() {
  logger.info('Loading OS context');

  try {
    const context = {
      contacts: await loadContacts(),
      projects: await loadProjects(),
      partners: await loadPartners(),
      timestamp: new Date().toISOString(),
    };

    logger.info('OS context loaded successfully');
    return context;

  } catch (error) {
    logger.error('Error loading context:', error);
    throw error;
  }
}

/**
 * Load contact list from network-contacts
 */
async function loadContacts() {
  const contactsPath = path.join(
    config.os.path,
    'claude-code-os-implementation/05-hr-department/network-contacts'
  );

  // TODO: Read and parse contact files
  // For now return empty array
  return [];
}

/**
 * Load active projects
 */
async function loadProjects() {
  const projectsPath = path.join(
    config.os.path,
    'claude-code-os-implementation/02-operations/project-management/active-projects'
  );

  // TODO: Read and parse project files
  return [];
}

/**
 * Load partner information
 */
async function loadPartners() {
  return {
    linh: { email: 'linh@example.com', role: 'Sales & Relationships' },
    mikael: { email: 'mikael@example.com', role: 'Outbound & Biz Dev' },
  };
}

module.exports = {
  loadContext,
};
