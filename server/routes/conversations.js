const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/conversationController');
const auth = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(auth);

// Get all conversations
router.get('/', conversationController.getConversations);

// Create a new conversation
router.post('/', conversationController.createConversation);

// Clear all conversations (must come before /:id route)
router.delete('/clear-all', conversationController.clearAllConversations);

// Delete a conversation
router.delete('/:id', conversationController.deleteConversation);

module.exports = router; 