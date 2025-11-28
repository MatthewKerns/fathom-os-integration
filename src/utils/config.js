require('dotenv').config();

module.exports = {
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
  },

  fathom: {
    webhookSecret: process.env.FATHOM_WEBHOOK_SECRET,
  },

  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
  },

  github: {
    token: process.env.GITHUB_TOKEN,
    repo: process.env.GITHUB_REPO,
    author: {
      name: process.env.GIT_AUTHOR_NAME || 'Fathom Bot',
      email: process.env.GIT_AUTHOR_EMAIL || 'bot@example.com',
    },
  },

  os: {
    path: process.env.OS_PATH || '/Users/matthewkerns/workspace/ai-agency-development-os',
  },

  gamma: {
    apiKey: process.env.GAMMA_API_KEY,
    themeId: process.env.GAMMA_THEME_ID || 'Oasis',
  },

  slack: {
    webhookUrl: process.env.SLACK_WEBHOOK_URL,
    channel: process.env.SLACK_CHANNEL || '#meeting-summaries',
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
};
