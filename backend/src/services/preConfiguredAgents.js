const Agent = require('../models/Agent');
const logService = require('./logService');

class PreConfiguredAgentsService {
  constructor() {
    this.defaultAgents = [
      {
        name: 'GitHub Assistant',
        type: 'github',
        description: 'Manage GitHub repositories, pull requests, issues, and code reviews. Can summarize PRs, create issues, and manage repository workflows.',
        status: 'active',
        isDefault: true,
        capabilities: [
          'Summarize pull requests',
          'Create and manage issues',
          'Review code changes',
          'Manage repository settings',
          'Generate release notes'
        ]
      },
      {
        name: 'Email Manager',
        type: 'email',
        description: 'Send emails, manage inbox, schedule email campaigns, and automate email responses.',
        status: 'active',
        isDefault: true,
        capabilities: [
          'Send automated emails',
          'Manage email templates',
          'Schedule email campaigns',
          'Parse and categorize emails',
          'Generate email reports'
        ]
      },
      {
        name: 'Calendar Coordinator',
        type: 'calendar',
        description: 'Schedule meetings, manage calendar events, send meeting invites, and handle calendar conflicts.',
        status: 'active',
        isDefault: true,
        capabilities: [
          'Schedule meetings',
          'Manage calendar events',
          'Send meeting invitations',
          'Handle scheduling conflicts',
          'Generate meeting summaries'
        ]
      },
      {
        name: 'E-commerce Assistant',
        type: 'shopify',
        description: 'Manage Shopify store operations, handle orders, update inventory, and analyze sales data.',
        status: 'active',
        isDefault: true,
        capabilities: [
          'Manage product inventory',
          'Process orders',
          'Handle customer inquiries',
          'Generate sales reports',
          'Update product information'
        ]
      },
      {
        name: 'Content Creator',
        type: 'custom',
        description: 'Generate blog posts, social media content, marketing copy, and documentation.',
        status: 'active',
        isDefault: true,
        capabilities: [
          'Generate blog posts',
          'Create social media content',
          'Write marketing copy',
          'Generate documentation',
          'Proofread and edit content'
        ]
      },
      {
        name: 'Data Analyst',
        type: 'custom',
        description: 'Analyze data, generate reports, create visualizations, and provide business insights.',
        status: 'active',
        isDefault: true,
        capabilities: [
          'Analyze datasets',
          'Generate reports',
          'Create data visualizations',
          'Provide business insights',
          'Automate data processing'
        ]
      }
    ];
  }

  async initializeDefaultAgents() {
    try {
      await logService.info('Initializing default agents...', 'system');
      
      for (const agentData of this.defaultAgents) {
        const existingAgent = await Agent.findOne({ 
          name: agentData.name, 
          type: agentData.type 
        });

        if (!existingAgent) {
          const agent = new Agent({
            ...agentData,
            configuration: new Map() // Empty configuration - user needs to configure
          });

          await agent.save();
          await logService.success(`Created default agent: ${agentData.name}`, 'system', agent._id);
        }
      }

      await logService.success('Default agents initialization completed', 'system');
    } catch (error) {
      await logService.error(`Error initializing default agents: ${error.message}`, 'system');
      throw error;
    }
  }

  async getAgentTemplates() {
    return this.defaultAgents.map(agent => ({
      ...agent,
      isTemplate: true
    }));
  }

  async createAgentFromTemplate(templateName, customConfig = {}) {
    try {
      const template = this.defaultAgents.find(agent => agent.name === templateName);
      
      if (!template) {
        throw new Error(`Template ${templateName} not found`);
      }

      const configMap = new Map();
      Object.entries(customConfig).forEach(([key, value]) => {
        if (value) configMap.set(key, value);
      });

      const agent = new Agent({
        ...template,
        name: customConfig.name || template.name,
        description: customConfig.description || template.description,
        configuration: configMap,
        isDefault: false
      });

      await agent.save();
      await logService.success(`Created agent from template: ${agent.name}`, 'system', agent._id);
      
      return agent;
    } catch (error) {
      await logService.error(`Error creating agent from template: ${error.message}`, 'system');
      throw error;
    }
  }

  getAgentCapabilities(agentType) {
    const agent = this.defaultAgents.find(a => a.type === agentType);
    return agent ? agent.capabilities : [];
  }

  getConfigurationGuide(agentType) {
    const guides = {
      github: {
        title: 'GitHub Agent Configuration',
        steps: [
          'Go to GitHub Settings > Developer settings > Personal access tokens',
          'Generate a new token with repo, issues, and pull_requests scopes',
          'Copy the token and paste it in the GitHub Token field',
          'Test the connection by asking the agent to summarize a PR'
        ],
        requiredFields: ['githubToken'],
        testCommand: 'Summarize the latest PR in microsoft/vscode'
      },
      email: {
        title: 'Email Agent Configuration',
        steps: [
          'Enable 2-factor authentication on your email account',
          'Generate an app-specific password',
          'Enter your email address and app password',
          'Configure SMTP settings if using custom email provider'
        ],
        requiredFields: ['email', 'emailPassword'],
        testCommand: 'Send a test email to yourself'
      },
      calendar: {
        title: 'Calendar Agent Configuration',
        steps: [
          'Go to Google Cloud Console and create a new project',
          'Enable the Calendar API',
          'Create service account credentials',
          'Download the JSON credentials file',
          'Paste the JSON content in the credentials field'
        ],
        requiredFields: ['calendarCredentials'],
        testCommand: 'List my meetings for today'
      },
      shopify: {
        title: 'Shopify Agent Configuration',
        steps: [
          'Go to your Shopify admin panel',
          'Navigate to Apps > Manage private apps',
          'Create a new private app',
          'Copy the API key and API secret',
          'Enable necessary permissions for your use case'
        ],
        requiredFields: ['shopifyApiKey', 'shopifyApiSecret'],
        testCommand: 'Show me the latest orders'
      }
    };

    return guides[agentType] || null;
  }
}

module.exports = new PreConfiguredAgentsService(); 