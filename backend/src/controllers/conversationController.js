const Conversation = require('../models/Conversation');
const logger = require('../config/logger');

class ConversationController {
  async getGeneralConversation(req, res) {
    try {
      let conversation = await Conversation.findOne({ type: 'general' });
      
      if (!conversation) {
        conversation = new Conversation({
          type: 'general',
          messages: []
        });
        await conversation.save();
      }

      res.json(conversation.messages);
    } catch (error) {
      logger.error('Error fetching general conversation:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getAgentConversation(req, res) {
    try {
      let conversation = await Conversation.findOne({
        type: 'agent',
        agentId: req.params.agentId
      });

      if (!conversation) {
        conversation = new Conversation({
          type: 'agent',
          agentId: req.params.agentId,
          messages: []
        });
        await conversation.save();
      }

      res.json(conversation.messages);
    } catch (error) {
      logger.error('Error fetching agent conversation:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getRecentConversations(req, res) {
    try {
      const conversations = await Conversation.find()
        .sort({ updatedAt: -1 })
        .limit(10)
        .populate('agentId', 'name type');

      const recentMessages = conversations.flatMap(conv => 
        conv.messages.slice(-1).map(msg => ({
          ...msg.toObject(),
          type: conv.type,
          agentName: conv.agentId?.name
        }))
      ).sort((a, b) => b.timestamp - a.timestamp);

      res.json(recentMessages);
    } catch (error) {
      logger.error('Error fetching recent conversations:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async addMessage(req, res) {
    try {
      const { type, agentId, message } = req.body;

      // Validate required message fields based on schema
      if (!message || !message.content || !message.sender) {
        return res.status(400).json({ 
          error: 'Message must include content and sender'
        });
      }

      let conversation = await Conversation.findOne({
        type,
        ...(type === 'agent' && { agentId })
      });

      if (!conversation) {
        conversation = new Conversation({
          type,
          ...(type === 'agent' && { agentId }),
          messages: []
        });
      }
      // Ensure message has all required fields
      const newMessage = {
        content: message.content,
        sender: message.sender,
        timestamp: message.timestamp || new Date()
      };
      await conversation.save();

      res.json(newMessage);
    } catch (error) {
      console.error(error)
      logger.error('Error adding message:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new ConversationController(); 