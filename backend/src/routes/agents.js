const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agentController');
const { validateAgent } = require('../middleware/validation');

router.post('/', validateAgent, agentController.registerAgent);
router.get('/', agentController.getAgents);
router.get('/:id', agentController.getAgent);
router.put('/:id', validateAgent, agentController.updateAgent);
router.delete('/:id', agentController.deleteAgent);

module.exports = router; 