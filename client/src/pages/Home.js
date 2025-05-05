import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { getToken } from '../utils/auth';
import { useSocket } from '../context/SocketContext';
import ChatWindow from '../components/ChatWindow';
import LeftSidebar from '../components/LeftSidebar';
import Box from '@mui/material/Box';

export default function Home() {
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [isAITyping, setIsAITyping] = useState(false);
  const navigate = useNavigate();
  const socket = useSocket();

  const fetchConversations = async () => {
    try {
      const res = await api.get('/conversations');
      setConversations(res.data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchMessages = async () => {
    if (!conversationId) {
      setMessages([]);
      return;
    }
    try {
      const res = await api.get(`/messages/${conversationId}`);
      setMessages(res.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      navigate('/login');
    }
  };

  useEffect(() => {
    if (!getToken()) return navigate('/login');
    fetchConversations();
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [conversationId]);

  useEffect(() => {
    if (!socket) return;

    // Join conversation room when conversationId changes
    if (conversationId) {
      socket.emit('join_conversation', conversationId);
    }

    // Listen for new messages
    socket.on('receive_message', (message) => {
      setMessages(prevMessages => [...prevMessages, message]);
    });

    // Listen for AI typing state
    socket.on('ai_typing', (isTyping) => {
      setIsAITyping(isTyping);
    });

    // Listen for errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return () => {
      socket.off('receive_message');
      socket.off('ai_typing');
      socket.off('error');
    };
  }, [socket, conversationId]);

  const handleNewChat = async () => {
    try {
      // Create a new conversation
      const response = await api.post('/conversations', { title: 'New Chat' });
      setConversationId(response.data.conversation._id);
      setMessages([]);
      await fetchConversations(); // Fetch updated conversations list
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  };

  const handleSend = async (text, setIsLoading) => {
    try {
      let currentConversationId = conversationId;
      
      if (!currentConversationId) {
        // Create a new conversation with the first message
        const conversationResponse = await api.post('/conversations', { message: text });
        currentConversationId = conversationResponse.data.conversation._id;
        setConversationId(currentConversationId);
        setConversations(conversationResponse.data.conversations);
      }

      // Emit message through socket
      socket.emit('send_message', {
        text,
        sender: 'user',
        conversationId: currentConversationId
      });

      setIsLoading(true);
      
      return { conversationId: currentConversationId };
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F7F8FA' }}>
      <LeftSidebar 
        conversations={conversations}
        onSelectConversation={setConversationId} 
        onNewChat={handleNewChat}
        selectedConversation={conversationId}
        onFetchConversations={fetchConversations}
      />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, p: 4, maxWidth: 900, mx: 'auto', width: '100%' }}>
        <ChatWindow 
          conversationId={conversationId} 
          messages={messages}
          onNewConversation={setConversationId}
          onSend={handleSend}
          isAITyping={isAITyping}
        />
      </Box>
    </Box>
  );
}
