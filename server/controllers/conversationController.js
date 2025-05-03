const Conversation = require('../models/Conversation');

// Get all conversations for a user
exports.getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ userId: req.user.userId })
      .sort({ updatedAt: -1 });
    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Error fetching conversations', error: error.message });
  }
};

// Create a new conversation
exports.createConversation = async (req, res) => {
  try {
    const { title = 'New Chat', message } = req.body;
    
    // If message is provided, use first 30 characters as title
    const conversationTitle = message ? message.substring(0, 30) + (message.length > 30 ? '...' : '') : title;
    
    const conversation = new Conversation({
      title: conversationTitle,
      userId: req.user.userId
    });

    const savedConversation = await conversation.save();
    
    // Get all conversations after creating new one
    const conversations = await Conversation.find({ userId: req.user.userId })
      .sort({ updatedAt: -1 });
      
    res.status(201).json({
      conversation: savedConversation,
      conversations: conversations
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(400).json({ message: 'Error creating conversation', error: error.message });
  }
};

// Delete a conversation
exports.deleteConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    
    // Get all conversations after deletion
    const conversations = await Conversation.find({ userId: req.user.userId })
      .sort({ updatedAt: -1 });
      
    res.json({ 
      message: 'Conversation deleted successfully',
      conversations: conversations
    });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({ message: 'Error deleting conversation', error: error.message });
  }
};

// Clear all conversations
exports.clearAllConversations = async (req, res) => {
  try {
    const result = await Conversation.deleteMany({ userId: req.user.userId });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'No conversations found to delete' });
    }
    
    res.json({ 
      message: 'All conversations cleared successfully',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error clearing all conversations:', error);
    res.status(500).json({ message: 'Error clearing all conversations', error: error.message });
  }
}; 