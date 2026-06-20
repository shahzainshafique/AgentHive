const express = require('express');
const router = express.Router();
const logService = require('../services/logService');

// GET /api/logs - Get recent activity logs
router.get('/', async (req, res) => {
  try {
    const { limit = 50, source, level } = req.query;
    const logs = await logService.getRecentLogs(parseInt(limit), source, level);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/logs - Create a new log entry
router.post('/', async (req, res) => {
  try {
    const { level, message, source, agentId, userId, metadata } = req.body;
    const logEntry = await logService.logActivity(level, message, source, agentId, userId, metadata);
    res.status(201).json(logEntry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/logs - Clear old logs
router.delete('/', async (req, res) => {
  try {
    const { olderThanDays = 30 } = req.query;
    const result = await logService.clearLogs(parseInt(olderThanDays));
    res.json({ message: `Cleared ${result.deletedCount} log entries` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 