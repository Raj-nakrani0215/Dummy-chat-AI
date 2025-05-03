const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

const aiResponses = [
  "I understand what you're saying.",
  "That's interesting! Tell me more.",
  "I'm here to help. What else would you like to discuss?",
  "I'm processing your message...",
  "Could you elaborate on that?",
  "That's a great point!",
  "I see what you mean.",
  "Let me think about that...",
  "Interesting perspective!",
  "I'm analyzing your message..."
];

// Get all messages for a conversation
exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ conversationId: req.params.conversationId })
      .sort({ timestamp: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new message and get AI response
exports.createMessage = async (req, res) => {
  try {
    let { text, sender, conversationId } = req.body;
    
    // If no conversationId is provided, create a new conversation
    if (!conversationId) {
      const conversation = new Conversation({
        title: text.substring(0, 30) + '...',
        userId: req.user?.userId || 'default-user'
      });
      const savedConversation = await conversation.save();
      conversationId = savedConversation._id;
    }

    // Save user message
    const userMessage = new Message({
      text,
      sender: 'user',
      conversationId
    });

    const savedUserMessage = await userMessage.save();
    
    // Update conversation's updatedAt timestamp and title
    await Conversation.findByIdAndUpdate(conversationId, { 
      updatedAt: Date.now(),
      title: text.substring(0, 30) + '...'
    });

    // Generate AI response
    const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
    const aiMessage = new Message({
      text: randomResponse,
      sender: 'AI',
      conversationId
    });

    const savedAiMessage = await aiMessage.save();
    
    res.status(201).json({ 
      userMessage: savedUserMessage,
      aiMessage: savedAiMessage,
      conversationId 
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a message
exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Handle socket.io message
exports.handleSocketMessage = async (message) => {
  try {
    const savedMessage = await Message.create({
      text: message.text,
      sender: message.sender,
      conversationId: message.conversationId
    });

    // Update conversation's updatedAt timestamp
    await Conversation.findByIdAndUpdate(message.conversationId, { 
      updatedAt: Date.now(),
      title: message.text.substring(0, 30) + '...'
    });

    return savedMessage;
  } catch (error) {
    console.error('Error handling socket message:', error);
    throw error;
  }
};
