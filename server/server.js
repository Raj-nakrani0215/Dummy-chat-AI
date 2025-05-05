require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages');
const conversationRoutes = require('./routes/conversations');
const messageController = require('./controllers/messageController');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/conversations', conversationRoutes);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('A user connected');

  // Join a conversation room
  socket.on('join_conversation', (conversationId) => {
    socket.join(conversationId);
    console.log(`User joined conversation: ${conversationId}`);
  });

  // Handle new message
  socket.on('send_message', async (message) => {
    try {
      // Save message to database
      const savedMessage = await messageController.handleSocketMessage(message);
      
      // Broadcast message to all users in the conversation room
      io.to(message.conversationId).emit('receive_message', savedMessage);
      
      // Emit loading state
      io.to(message.conversationId).emit('ai_typing', true);
      
      // Generate and send AI response
      const aiResponse = await messageController.generateAIResponse(message.conversationId);
      
      // Emit AI response and turn off loading state
      io.to(message.conversationId).emit('receive_message', aiResponse);
      io.to(message.conversationId).emit('ai_typing', false);
    } catch (error) {
      console.error('Error handling message:', error);
      socket.emit('error', { message: 'Error sending message' });
      io.to(message.conversationId).emit('ai_typing', false);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
