const OpenAI = require('openai');
const logger = require('../config/logger');
require('dotenv').config();


class AIService {
  constructor() {
    this.client = new OpenAI({
      baseURL: process.env.HF_API_ENDPOINT,
      apiKey: process.env.HF_API_KEY,
    });
  }

  async callHuggingFace(prompt, systemPrompt) {
    try {
      const chatCompletion = await this.client.chat.completions.create({
        model: "llama-3.3-70b",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 512,
        temperature: 0.7,
      });

      logger.info('Hugging Face API response:', chatCompletion);
      
      if (!chatCompletion.choices?.[0]?.message?.content) {
        throw new Error('Invalid response format from Hugging Face API');
      }

      return chatCompletion.choices[0].message.content.trim();
    } catch (error) {
      logger.error('Hugging Face API error:', error);
      throw error;
    }
  }

  async determineAgent(message) {
    try {
      const response = await this.callHuggingFace(
        message,
        "You are a helpful assistant that determines which agent should handle a user's request. Respond with only the agent name: 'github', 'shopify', 'email', 'calendar', or 'custom'. If the request does not seem like an AI agent request, just respond with 'general'"
      );

      logger.info('Agent determination response:', response);

      const validTypes = ['github', 'shopify', 'email', 'calendar', 'custom'];
      const agentType = response.toLowerCase().trim();
      
      if (!validTypes.includes(agentType)) {
        logger.warn(`Invalid agent type received: ${agentType}, defaulting to custom`);
        return 'custom';
      }

      logger.info('Determined agent type:', agentType);
      return agentType;
    } catch (error) {
      logger.error('Error determining agent:', error);
      return 'custom';
    }
  }
}

module.exports = new AIService(); 