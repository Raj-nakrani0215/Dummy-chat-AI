import { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

export default function MessageInput({ conversationId, onSend }) {
  const [text, setText] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (text.trim()) {
      try {
        await onSend(text.trim());
        setText('');
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        gap: 1.5,
        mt: 2,
        bgcolor: '#fff',
        borderRadius: 3,
        boxShadow: '0 2px 8px 0 rgba(91,91,255,0.08)',
        p: 1.2,
        alignItems: 'center',
      }}
    >
      <TextField
        fullWidth
        size="small"
        variant="outlined"
        placeholder="Type your message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        sx={{
          bgcolor: '#F7F8FA',
          borderRadius: 2,
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
          },
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            handleSubmit(e);
          }
        }}
      />
      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={!text.trim()}
        sx={{
          px: 3,
          py: 1.2,
          borderRadius: 2,
          fontWeight: 600,
          fontSize: 16,
          boxShadow: '0 2px 8px 0 rgba(91,91,255,0.10)',
        }}
      >
        Send
      </Button>
    </Box>
  );
}
