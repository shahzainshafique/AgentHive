const ActivityLog = require('../models/ActivityLog');
const logger = require('../config/logger');

class LogService {
  constructor() {
    this.io = null;
  }

  setSocketIO(io) {
    this.io = io;
  }

  async logActivity(level, message, source, agentId = null, userId = null, metadata = {}) {
    try {
      const logEntry = new ActivityLog({
        level,
        message,
        source,
        agentId,
        userId,
        metadata,
        timestamp: new Date()
      });

      await logEntry.save();

      // Emit to connected clients for real-time updates
      if (this.io) {
        this.io.emit('activity_log', {
          level,
          message,
          source,
          agentId,
          userId,
          metadata,
          timestamp: logEntry.timestamp
        });
      }

      // Also log to Winston logger
      logger[level] ? logger[level](message, { source, agentId, userId, metadata }) : logger.info(message);

      return logEntry;
    } catch (error) {
      logger.error('Error saving activity log:', error);
      throw error;
    }
  }

  async getRecentLogs(limit = 50, source = null, level = null) {
    try {
      const query = {};
      if (source) query.source = source;
      if (level) query.level = level;

      const logs = await ActivityLog.find(query)
        .sort({ timestamp: -1 })
        .limit(limit)
        .populate('agentId', 'name type');

      return logs;
    } catch (error) {
      logger.error('Error fetching activity logs:', error);
      throw error;
    }
  }

  async clearLogs(olderThanDays = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      const result = await ActivityLog.deleteMany({
        timestamp: { $lt: cutoffDate }
      });

      await this.logActivity('info', `Cleared ${result.deletedCount} old log entries`, 'system');
      return result;
    } catch (error) {
      logger.error('Error clearing activity logs:', error);
      throw error;
    }
  }

  // Convenience methods for different log levels
  async info(message, source = 'system', agentId = null, userId = null, metadata = {}) {
    return this.logActivity('info', message, source, agentId, userId, metadata);
  }

  async warning(message, source = 'system', agentId = null, userId = null, metadata = {}) {
    return this.logActivity('warning', message, source, agentId, userId, metadata);
  }

  async error(message, source = 'system', agentId = null, userId = null, metadata = {}) {
    return this.logActivity('error', message, source, agentId, userId, metadata);
  }

  async success(message, source = 'system', agentId = null, userId = null, metadata = {}) {
    return this.logActivity('success', message, source, agentId, userId, metadata);
  }
}

module.exports = new LogService(); 