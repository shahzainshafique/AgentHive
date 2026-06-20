export const getConfigValue = (configuration, key) => {
  if (!configuration) return '';
  if (typeof configuration.get === 'function') {
    return configuration.get(key) || '';
  }
  return configuration[key] || '';
};

export const isAgentConfigured = (agent) => {
  const config = agent?.configuration || {};
  const keys = typeof config.keys === 'function' ? [...config.keys()] : Object.keys(config);
  return keys.some((key) => Boolean(getConfigValue(config, key)));
};

export const getAgentIconType = (type) => type || 'custom';

export const SUGGESTED_PROMPTS = {
  general: [
    'What can Agenthive help me with?',
    'How do I configure a GitHub agent?',
    'Summarize my workflow options',
  ],
  github: [
    'Summarize PR #42 in facebook/react',
    'What GitHub operations can you perform?',
    'Help me review a pull request',
  ],
  email: [
    'Draft a follow-up email to a client',
    'Help me write a professional out-of-office reply',
    'Suggest an email template for onboarding',
  ],
  calendar: [
    'Help me plan a team standup schedule',
    'Draft a meeting invitation for next week',
    'How should I handle scheduling conflicts?',
  ],
  shopify: [
    'What Shopify metrics should I track daily?',
    'Help me draft a product description',
    'Suggest ways to reduce cart abandonment',
  ],
  custom: [
    'Help me brainstorm ideas',
    'Review and improve this draft',
    'What are the next steps for my project?',
  ],
};

export const getSuggestedPrompts = (type) => SUGGESTED_PROMPTS[type] || SUGGESTED_PROMPTS.custom;
