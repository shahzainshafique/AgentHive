const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const logger = require('./config/logger');
const logService = require('./services/logService');
const socketService = require('./services/socketService'); // NEW
const preConfiguredAgents = require('./services/preConfiguredAgents');

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

// Set up log service and socket service with socket.io
logService.setSocketIO(io);
socketService.setSocketIO(io);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/agents', require('./routes/agents'));
app.use('/api/conversations', require('./routes/conversations'));
app.use('/api/logs', require('./routes/logs'));
app.use('/api/stats', require('./routes/stats'));

// Initialize database and start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Initialize default agents
    await preConfiguredAgents.initializeDefaultAgents();

    // Start server
    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logService.success(`Agenthive server started successfully on port ${PORT}`, 'system');
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    logService.error(`Failed to start server: ${error.message}`, 'system');
    process.exit(1);
  }
};

startServer(); 