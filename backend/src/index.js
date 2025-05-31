const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const logger = require('./config/logger');
const aiService = require('./services/aiService');
const githubService = require('./services/githubService');
const Agent = require('./models/Agent');
const Conversation = require('./models/Conversation');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info('New client connected');

  socket.on('register_agent', async (data) => {
    try {
      logger.info('Agent registration request:', data);
      // TODO: Implement agent registration logic
    } catch (error) {
      logger.error('Agent registration error:', error);
      socket.emit('error', { message: 'Failed to register agent' });
    }
  });

  socket.on('general_chat', async (data) => {
    try {
      logger.info('General chat message received:', data);

      const agentType = await aiService.determineAgent(data.message);

      // Get response from AI service
      const response = await aiService.callHuggingFace(
        data.message,
        "You are a helpful AI assistant. Provide clear, concise, and accurate responses."
      );

      // Stream the response word by word
      const words = response.split(' ');
      for (let i = 0; i < words.length; i++) {
        socket.emit('chat_message', {
          content: words[i] + ' ',
          sender: 'agent',
          isStreaming: true
        });
        // Add a small delay between words
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // Send end of streaming message
      socket.emit('chat_message', {
        content: response,
        sender: 'agent',
        timestamp: new Date().toISOString(),
        isStreamingEnd: true
      });

      // Save complete message to conversation
      await Conversation.findOneAndUpdate(
        { type: 'general' },
        { $push: { messages: {
          content: response,
          sender: 'agent',
          timestamp: new Date().toISOString()
        }}},
        { upsert: true }
      );
    } catch (error) {
      logger.error('General chat error:', error);
      socket.emit('error', { message: 'Failed to process message' });
    }
  });

  socket.on('chat_message', async (data) => {
    try {
      logger.info('Chat message received:', data);
      
      if (!data.agentId) {
        throw new Error('Agent ID is required for agent chat');
      }

      // Get the agent from the database
      const agent = await Agent.findById(data.agentId);
      
      if (!agent) {
        throw new Error('Agent not found');
      }

      // Determine which agent should handle the message
      const agentType = await aiService.determineAgent(data.message);
      
      // Handle the message based on agent type
      let response;
      switch (agentType) {
        case 'github':
          response = await githubService.handleOperation(data.message, agent);
          break;
        // Add other agent types here
        default:
          response = {
            content: "I'm sorry, I don't know how to handle this request yet.",
            sender: 'agent',
            timestamp: new Date().toISOString()
          };
      }

      if (response) {
        // Stream the response word by word
        const words = response.content.split(' ');
        for (let i = 0; i < words.length; i++) {
          socket.emit('chat_message', {
            content: words[i] + ' ',
            sender: 'agent',
            isStreaming: true
          });
          // Add a small delay between words
          await new Promise(resolve => setTimeout(resolve, 50));
        }

        // Send end of streaming message
        socket.emit('chat_message', {
          content: response.content,
          sender: 'agent',
          timestamp: new Date().toISOString(),
          isStreamingEnd: true
        });

        // Save complete message to conversation
        await Conversation.findOneAndUpdate(
          { type: 'agent', agentId: data.agentId },
          { $push: { messages: response }},
          { upsert: true }
        );
      }
    } catch (error) {
      logger.error('Chat message error:', error);
      socket.emit('error', { message: 'Failed to process message' });
    }
  });

  socket.on('disconnect', () => {
    logger.info('Client disconnected');
  });
});

// Routes
app.use('/api/agents', require('./routes/agents'));
app.use('/api/conversations', require('./routes/conversations'));

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
}); 