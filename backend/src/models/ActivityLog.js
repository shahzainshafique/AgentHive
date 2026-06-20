const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  level: {
    type: String,
    required: true,
    enum: ['info', 'warning', 'error', 'success'],
    default: 'info'
  },
  message: {
    type: String,
    required: true
  },
  source: {
    type: String,
    required: true,
    enum: ['system', 'agent', 'user', 'api']
  },
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
    required: false
  },
  userId: {
    type: String,
    required: false
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying
activityLogSchema.index({ timestamp: -1 });
activityLogSchema.index({ source: 1, timestamp: -1 });
activityLogSchema.index({ level: 1, timestamp: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema); 