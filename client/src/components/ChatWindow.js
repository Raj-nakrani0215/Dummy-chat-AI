import { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TypingLoader from './TypingLoader';
import MessageInput from './MessageInput';

export default function ChatWindow({ conversationId, messages: initialMessages, onNewConversation, onSend }) {
  const [messages, setMessages] = useState(initialMessages || []);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setMessages(initialMessages || []);
  }, [initialMessages]);

  const handleSendMessage = async (text) => {
    try {

      const response = await onSend(text ,setIsLoading);
      setMessages(prevMessages => [...prevMessages, response.userMessage, response.aiMessage]);
      
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
    }
    finally{
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flex: 1, minHeight: 0, flexDirection: 'column' }}>
      <Paper
        elevation={3}
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 3,
          borderRadius: 3,
          minHeight: 400,
          maxHeight: 'calc(100dvh - 215px)',
          bgcolor: '#F9FAFB',
          boxShadow: '0 2px 12px 0 rgba(91,91,255,0.06)',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': {
            display: 'none', 
          },
        }}
      >
        {messages.map((msg, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              mb: 2,
            }}
          >
            <Box
              sx={{
                bgcolor: msg.sender === 'user' ? '#5B5BFF' : '#E6E6FF',
                color: msg.sender === 'user' ? '#fff' : '#333',
                px: 2,
                py: 1.2,
                borderRadius: 2,
                maxWidth: '70%',
                boxShadow: msg.sender === 'user' ? '0 2px 8px 0 rgba(91,91,255,0.10)' : 'none',
                wordBreak: 'break-word',
              }}
            >
              <Typography variant="subtitle2" color={msg.sender === 'user' ? '#D1D1FF' : 'text.secondary'} component="span" sx={{ fontWeight: 600, fontSize: 13 }}>
                {msg.sender === 'user' ? 'You' : 'Echo-AI'}
              </Typography>{' '}
              <Typography variant="body1" component="span" sx={{ fontSize: 16, ml: 1 }}>
                {msg.text}
              </Typography>
            </Box>
          </Box>
        ))}
        {isLoading && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-start',
              mb: 2,
            }}
          >
            <TypingLoader />
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Paper>
      <MessageInput 
        conversationId={conversationId} 
        onSend={handleSendMessage}
      />
    </Box>
  );
}
