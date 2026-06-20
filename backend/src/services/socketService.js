const logger = require('../config/logger');
const logService = require('./logService');
const aiService = require('./aiService');
const githubService = require('./githubService');
const Agent = require('../models/Agent');
const Conversation = require('../models/Conversation');

class SocketService {
    constructor() {
        this.io = null;
    }

    setSocketIO(io) {
        this.io = io;
        this.initialize();
    }

    initialize() {
        if (!this.io) return;

        this.io.on('connection', (socket) => {
            this.handleConnection(socket);

            socket.on('register_agent', (data) => this.handleRegisterAgent(socket, data));
            socket.on('general_chat', (data) => this.handleGeneralChat(socket, data));
            socket.on('chat_message', (data) => this.handleAgentChat(socket, data));
            socket.on('disconnect', () => this.handleDisconnect());
        });
    }

    handleConnection(socket) {
        logger.info('New client connected');
        logService.info('New client connected to real-time services', 'system');
    }

    handleDisconnect() {
        logger.info('Client disconnected');
        logService.info('Client disconnected from real-time services', 'system');
    }

    async handleRegisterAgent(socket, data) {
        try {
            logger.info('Agent registration request:', data);
            await logService.info(`Agent registration requested: ${data.name || 'Unknown'}`, 'system');
            // TODO: Implement agent registration logic if needed via socket
        } catch (error) {
            logger.error('Agent registration error:', error);
            await logService.error(`Agent registration failed: ${error.message}`, 'system');
            socket.emit('error', { message: 'Failed to register agent' });
        }
    }

    async streamResponse(socket, stream, sender, saveToConversationArgs = null) {
        let fullContent = '';

        try {
            for await (const chunk of stream) {
                const content = chunk.choices[0]?.delta?.content || '';
                if (content) {
                    fullContent += content;
                    socket.emit('chat_message', {
                        content: content,
                        sender: sender,
                        isStreaming: true
                    });
                }
            }

            // End of stream
            socket.emit('chat_message', {
                content: fullContent,
                sender: sender,
                timestamp: new Date().toISOString(),
                isStreamingEnd: true
            });

            // Save complete message to conversation if arguments provided
            if (saveToConversationArgs) {
                const { query, update, options } = saveToConversationArgs;
                // In the update, we look for where to push the message
                // This is a bit specific to how Mongoose update works, so we construct the operation
                const messageObj = {
                    content: fullContent,
                    sender: sender,
                    timestamp: new Date().toISOString()
                };

                // Deep merge or update specific field
                // The original code used $push: { messages: ... }
                // We will execute the update using the DB model directly here or pass a callback
                // For simplicity/cleanliness, let's just do it directly here
                if (query.type === 'general') {
                    await Conversation.findOneAndUpdate(query, { $push: { messages: messageObj } }, options);
                } else if (query.agentId) {
                    await Conversation.findOneAndUpdate(query, { $push: { messages: messageObj } }, options);
                }
            }

            return fullContent;

        } catch (error) {
            logger.error('Streaming error:', error);
            socket.emit('error', { message: 'Error during streaming' });
        }
    }

    async handleGeneralChat(socket, data) {
        try {
            logger.info('General chat message received:', data);
            await logService.info('General chat message received', 'user', null, null, { message: data.message });

            // Get streaming response from AI service
            const stream = await aiService.callHuggingFace(
                data.message,
                "You are a helpful AI assistant. Provide clear, concise, and accurate responses.",
                true
            );

            const fullResponse = await this.streamResponse(socket, stream, 'agent', {
                query: { type: 'general' },
                options: { upsert: true }
            });

            await logService.success('General chat response sent successfully', 'agent');
        } catch (error) {
            logger.error('General chat error:', error);
            await logService.error(`General chat error: ${error.message}`, 'system');
            socket.emit('error', { message: 'Failed to process message' });
        }
    }

    async handleAgentChat(socket, data) {
        try {
            logger.info('Chat message received:', data);

            if (!data.agentId) {
                throw new Error('Agent ID is required for agent chat');
            }

            const agent = await Agent.findById(data.agentId);
            if (!agent) {
                throw new Error('Agent not found');
            }

            await logService.info(`Agent chat message received for ${agent.name}`, 'user', agent._id, null, { message: data.message });

            const agentType = agent.type;
            const config = agent.configuration instanceof Map
              ? Object.fromEntries(agent.configuration)
              : (agent.configuration || {});

            if (agentType === 'github') {
              if (!config.githubToken) {
                const msg = {
                  content: 'This GitHub agent is not configured yet. Please add your GitHub personal access token in the agent settings.',
                  sender: 'agent',
                  timestamp: new Date().toISOString()
                };
                socket.emit('chat_message', { ...msg, isStreamingEnd: true });
                await Conversation.findOneAndUpdate(
                  { type: 'agent', agentId: data.agentId },
                  { $push: { messages: msg } },
                  { upsert: true }
                );
                return;
              }

              const response = await githubService.handleOperation(data.message, agent);

              socket.emit('chat_message', {
                content: response.content,
                sender: 'agent',
                timestamp: new Date().toISOString(),
                isStreamingEnd: true
              });

              await Conversation.findOneAndUpdate(
                { type: 'agent', agentId: data.agentId },
                { $push: { messages: response } },
                { upsert: true }
              );
            } else {
                // Default / Custom AI chat -> Stream it
                const stream = await aiService.callHuggingFace(
                    data.message,
                    `You are ${agent.name}. ${agent.description || 'Assist the user.'}`,
                    true
                );

                await this.streamResponse(socket, stream, 'agent', {
                    query: { type: 'agent', agentId: data.agentId },
                    options: { upsert: true }
                });
            }

            await logService.success(`Agent response sent successfully`, 'agent', agent._id);

        } catch (error) {
            logger.error('Chat message error:', error);
            await logService.error(`Chat message error: ${error.message}`, 'system');
            socket.emit('error', { message: 'Failed to process message' });
        }
    }
}

module.exports = new SocketService();
