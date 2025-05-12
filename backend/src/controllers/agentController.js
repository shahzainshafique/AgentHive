const Agent = require('../models/Agent');
const logger = require('../config/logger');

class AgentController {
  async registerAgent(req, res) {
    try {
      const { name, type, description, configuration, status } = req.body;
      
      // Convert configuration object to Map
      const configMap = new Map();
      if (configuration) {
        Object.entries(configuration).forEach(([key, value]) => {
          if (value) configMap.set(key, value);
        });
      }

      const agent = new Agent({
        name,
        type,
        description,
        configuration: configMap,
        status: status || 'active'
      });

      await agent.save();
      logger.info('Agent registered successfully:', agent);
      res.status(201).json(agent);
    } catch (error) {
      logger.error('Agent registration error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  async getAgents(req, res) {
    try {
      const agents = await Agent.find();
      // Convert Map to object for JSON response
      const formattedAgents = agents.map(agent => {
        const agentObj = agent.toObject();
        agentObj.configuration = Object.fromEntries(agentObj.configuration);
        return agentObj;
      });
      res.json(formattedAgents);
    } catch (error) {
      logger.error('Error fetching agents:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getAgent(req, res) {
    try {
      const agent = await Agent.findById(req.params.id);
      if (!agent) {
        return res.status(404).json({ error: 'Agent not found' });
      }
      // Convert Map to object for JSON response
      const agentObj = agent.toObject();
      agentObj.configuration = Object.fromEntries(agentObj.configuration);
      res.json(agentObj);
    } catch (error) {
      logger.error('Error fetching agent:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async updateAgent(req, res) {
    try {
      const { name, type, description, configuration, status } = req.body;
      
      // Convert configuration object to Map
      const configMap = new Map();
      if (configuration) {
        Object.entries(configuration).forEach(([key, value]) => {
          if (value) configMap.set(key, value);
        });
      }

      const agent = await Agent.findByIdAndUpdate(
        req.params.id,
        {
          name,
          type,
          description,
          configuration: configMap,
          status,
          updatedAt: Date.now()
        },
        { new: true, runValidators: true }
      );

      if (!agent) {
        return res.status(404).json({ error: 'Agent not found' });
      }

      // Convert Map to object for JSON response
      const agentObj = agent.toObject();
      agentObj.configuration = Object.fromEntries(agentObj.configuration);
      res.json(agentObj);
    } catch (error) {
      logger.error('Error updating agent:', error);
      res.status(400).json({ error: error.message });
    }
  }

  async deleteAgent(req, res) {
    try {
      const agent = await Agent.findByIdAndDelete(req.params.id);
      if (!agent) {
        return res.status(404).json({ error: 'Agent not found' });
      }
      logger.info('Agent deleted successfully:', agent);
      res.json({ message: 'Agent deleted successfully' });
    } catch (error) {
      logger.error('Error deleting agent:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new AgentController(); 