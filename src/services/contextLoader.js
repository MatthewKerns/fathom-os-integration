const fs = require('fs').promises;
const path = require('path');
const config = require('../utils/config');
const logger = require('../utils/logger');

// Cache for context data (refresh every 5 minutes)
let contextCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Load OS context for Claude to understand the current state
 * @param {boolean} forceRefresh - Force cache refresh
 * @returns {Object} Context including contacts, projects, coaches, etc.
 */
async function loadContext(forceRefresh = false) {
  // Use cache if valid
  if (!forceRefresh && contextCache && cacheTimestamp &&
      (Date.now() - cacheTimestamp < CACHE_DURATION)) {
    logger.debug('Using cached OS context');
    return contextCache;
  }

  logger.info('Loading OS context from filesystem');

  try {
    const context = {
      contacts: await loadContacts(),
      projects: await loadProjects(),
      coaches: await loadCoaches(),
      partners: await loadPartners(),
      timestamp: new Date().toISOString(),
    };

    // Update cache
    contextCache = context;
    cacheTimestamp = Date.now();

    logger.info(`OS context loaded successfully: ${context.contacts.length} contacts, ${context.projects.length} projects`);
    return context;

  } catch (error) {
    logger.error('Error loading context:', error);
    // Return cached data if available, even if stale
    if (contextCache) {
      logger.warn('Using stale cache due to loading error');
      return contextCache;
    }
    throw error;
  }
}

/**
 * Load contact list from network-contacts
 */
async function loadContacts() {
  const contactsBasePath = path.join(
    config.os.path,
    'claude-code-os-implementation/05-hr-department/network-contacts/by-category'
  );

  const contacts = [];
  const categories = ['clients', 'developers', 'coaches', 'potential-leads'];

  for (const category of categories) {
    const categoryPath = path.join(contactsBasePath, category);

    try {
      const files = await fs.readdir(categoryPath);
      const mdFiles = files.filter(f => f.endsWith('.md'));

      for (const file of mdFiles) {
        const content = await fs.readFile(path.join(categoryPath, file), 'utf-8');
        const contact = parseContactFile(content, file, category);
        if (contact) {
          contacts.push(contact);
        }
      }
    } catch (error) {
      logger.debug(`Category ${category} not found or empty:`, error.message);
      // Continue with other categories
    }
  }

  return contacts;
}

/**
 * Parse a contact markdown file
 */
function parseContactFile(content, filename, category) {
  try {
    // Extract name from filename (remove .md extension)
    const name = filename.replace('.md', '').replace(/-/g, ' ')
      .split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    // Try to extract email from content (look for patterns)
    const emailMatch = content.match(/(?:email|Email|EMAIL):\s*([^\s\n]+@[^\s\n]+)/);
    const email = emailMatch ? emailMatch[1] : null;

    // Try to extract company
    const companyMatch = content.match(/(?:company|Company|COMPANY):\s*([^\n]+)/);
    const company = companyMatch ? companyMatch[1].trim() : null;

    // Try to extract role/title
    const roleMatch = content.match(/(?:role|Role|title|Title|position|Position):\s*([^\n]+)/);
    const role = roleMatch ? roleMatch[1].trim() : null;

    return {
      name,
      email,
      company,
      role,
      category,
      filePath: `by-category/${category}/${filename}`
    };
  } catch (error) {
    logger.debug(`Error parsing contact file ${filename}:`, error.message);
    return null;
  }
}

/**
 * Load active projects
 */
async function loadProjects() {
  const projectsPath = path.join(
    config.os.path,
    'claude-code-os-implementation/02-operations/project-management/active-projects'
  );

  const projects = [];

  try {
    const files = await fs.readdir(projectsPath);
    const mdFiles = files.filter(f => f.endsWith('.md'));

    for (const file of mdFiles) {
      const content = await fs.readFile(path.join(projectsPath, file), 'utf-8');
      const project = parseProjectFile(content, file);
      if (project) {
        projects.push(project);
      }
    }
  } catch (error) {
    logger.debug('Projects directory not found or empty:', error.message);
  }

  return projects;
}

/**
 * Parse a project markdown file
 */
function parseProjectFile(content, filename) {
  try {
    // Extract project name from filename or first heading
    const nameMatch = content.match(/^#\s+(.+)/m);
    const name = nameMatch ? nameMatch[1] : filename.replace('.md', '');

    // Try to extract client
    const clientMatch = content.match(/(?:client|Client|CLIENT):\s*([^\n]+)/);
    const client = clientMatch ? clientMatch[1].trim() : 'Unknown';

    // Try to extract status
    const statusMatch = content.match(/(?:status|Status|STATE):\s*([^\n]+)/);
    const status = statusMatch ? statusMatch[1].trim() : 'Active';

    // Try to extract project value
    const valueMatch = content.match(/(?:value|Value|budget|Budget):\s*\$?([\d,]+)/);
    const value = valueMatch ? valueMatch[1].replace(',', '') : null;

    return {
      name,
      client,
      status,
      value,
      filePath: `active-projects/${filename}`
    };
  } catch (error) {
    logger.debug(`Error parsing project file ${filename}:`, error.message);
    return null;
  }
}

/**
 * Load coaches from coaching-call-notes
 */
async function loadCoaches() {
  const coachesPath = path.join(
    config.os.path,
    'claude-code-os-implementation/05-hr-department/network-contacts/coaching-call-notes/by-coach'
  );

  const coaches = [];

  try {
    const files = await fs.readdir(coachesPath);
    const mdFiles = files.filter(f => f.endsWith('.md'));

    for (const file of mdFiles) {
      const content = await fs.readFile(path.join(coachesPath, file), 'utf-8');
      const coach = parseCoachFile(content, file);
      if (coach) {
        coaches.push(coach);
      }
    }
  } catch (error) {
    logger.debug('Coaches directory not found or empty:', error.message);
  }

  return coaches;
}

/**
 * Parse a coach markdown file
 */
function parseCoachFile(content, filename) {
  try {
    // Extract coach name from filename
    const name = filename.replace('.md', '').replace(/-/g, ' ')
      .split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    // Try to extract specialty/focus area
    const specialtyMatch = content.match(/(?:specialty|Specialty|focus|Focus|expertise|Expertise):\s*([^\n]+)/);
    const specialty = specialtyMatch ? specialtyMatch[1].trim() : null;

    // Try to extract email
    const emailMatch = content.match(/(?:email|Email|EMAIL):\s*([^\s\n]+@[^\s\n]+)/);
    const email = emailMatch ? emailMatch[1] : null;

    return {
      name,
      specialty,
      email,
      filePath: `by-coach/${filename}`
    };
  } catch (error) {
    logger.debug(`Error parsing coach file ${filename}:`, error.message);
    return null;
  }
}

/**
 * Load partner information
 */
async function loadPartners() {
  // Equity partner information for the agency
  return {
    matthew: {
      email: 'matthew@example.com',
      role: 'Strong software development, dev systems, company OS development, agency building, prototyping, validation and testing',
      name: 'Matthew Kerns',
      title: 'Architect'
    },
    mekaiel: {
      email: 'mekaiel@example.com',
      alternateEmail: 'mikael@example.com',
      role: 'Systems, onboarding, sales, content systems + video editing connection',
      name: 'Mekaiel'
    },
    chris: {
      email: 'chris@example.com',
      role: 'Systems, onboarding, sales, list of leads management',
      name: 'Chris'
    },
    trent: {
      email: 'trent@example.com',
      role: 'Strong software development, development systems, robotics + physical automation, hiring/assessing/onboarding developers, prototyping, validation and testing',
      name: 'Trent',
      title: 'Architect'
    }
  };
}

module.exports = {
  loadContext,
};
