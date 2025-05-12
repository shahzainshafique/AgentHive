const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/conversationController');

router.get('/general', conversationController.getGeneralConversation);
router.get('/agent/:agentId', conversationController.getAgentConversation);
router.get('/recent', conversationController.getRecentConversations);
router.post('/message', conversationController.addMessage);

module.exports = router; 