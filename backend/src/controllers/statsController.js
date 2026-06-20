const Agent = require('../models/Agent');
const Conversation = require('../models/Conversation');
const ActivityLog = require('../models/ActivityLog');

class StatsController {
  async getDashboardStats(req, res) {
    try {
      const [agents, conversations, errorLogs] = await Promise.all([
        Agent.find(),
        Conversation.find(),
        ActivityLog.countDocuments({ level: 'error', timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } })
      ]);

      const activeAgents = agents.filter(a => a.status === 'active').length;
      const configuredAgents = agents.filter(a => {
        const config = a.configuration instanceof Map
          ? Object.fromEntries(a.configuration)
          : (a.configuration || {});
        return Object.keys(config).length > 0;
      }).length;

      const allMessages = conversations.flatMap(c => c.messages);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const messagesToday = allMessages.filter(m => new Date(m.timestamp) >= today).length;

      const recentMessages = conversations
        .flatMap(conv => conv.messages.map(msg => ({
          ...msg.toObject(),
          type: conv.type,
          agentId: conv.agentId
        })))
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 5);

      const systemHealth = errorLogs > 5 ? 'warning' : errorLogs > 0 ? 'degraded' : 'healthy';

      res.json({
        activeAgents,
        totalAgents: agents.length,
        configuredAgents,
        totalConversations: conversations.length,
        totalMessages: allMessages.length,
        messagesToday,
        systemHealth,
        recentMessages
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getHealth(req, res) {
    res.json({
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = new StatsController();
