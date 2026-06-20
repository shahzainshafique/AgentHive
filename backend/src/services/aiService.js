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

  async mockStream(message) {
    const words = message.split(' ');
    const chunks = [];
    for (let i = 0; i < words.length; i++) {
      chunks.push({
        choices: [{ delta: { content: (i === 0 ? '' : ' ') + words[i] } }]
      });
    }
    return (async function* () {
      for (const chunk of chunks) {
        yield chunk;
      }
    })();
  }

  async callHuggingFace(prompt, systemPrompt, stream = false) {
    if (!process.env.HF_API_KEY) {
      const fallback = 'AI is not configured. Please set HF_API_KEY and HF_API_ENDPOINT in your backend environment.';
      return stream ? this.mockStream(fallback) : fallback;
    }

    try {
      const completionConfig = {
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
        stream: stream
      };

      if (stream) {
        const streamResponse = await this.client.chat.completions.create(completionConfig);
        return streamResponse;
      } else {
        const chatCompletion = await this.client.chat.completions.create(completionConfig);

        logger.info('Hugging Face API response:', chatCompletion);

        if (!chatCompletion.choices?.[0]?.message?.content) {
          throw new Error('Invalid response format from Hugging Face API');
        }

        return chatCompletion.choices[0].message.content.trim();
      }
    } catch (error) {
      logger.error('Hugging Face API error:', error);
      throw error;
    }
  }

  async determineAgent(message) {
    try {
      const response = await this.callHuggingFace(
        message,
        "You are a helpful assistant that determines which agent should handle a user's request. Respond with only the agent name: 'github', 'shopify', 'email', 'calendar', or 'custom'. If the request does not seem like an AI agent request, just respond with 'general'",
        false
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