import React, { useState, useEffect } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Typography,
  Divider,
  Avatar,
  IconButton,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import SearchIcon from '@mui/icons-material/Search';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import { logout } from '../utils/auth';
import api from '../utils/api';

export default function LeftSidebar({ conversations, onSelectConversation, onNewChat, selectedConversation, onFetchConversations }) {
  const [selectedConv, setSelectedConv] = useState(selectedConversation);
  const [openClearAllDialog, setOpenClearAllDialog] = useState(false);
  const userData = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();

  useEffect(() => {
    setSelectedConv(selectedConversation);
  }, [selectedConversation]);

  const handleConversationClick = (conversation) => {
    setSelectedConv(conversation._id);
    if (onSelectConversation) onSelectConversation(conversation._id);
  };

  const handleNewChat = () => {
    setSelectedConv(null);
    if (onNewChat) onNewChat();
  };

  const handleDeleteConversation = async (conversationId) => {
    try {
      await api.delete(`/conversations/${conversationId}`);
      if (selectedConv === conversationId) {
        setSelectedConv(null);
        if (onSelectConversation) onSelectConversation(null);
      }
      if (onFetchConversations) await onFetchConversations();
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const handleClearAll = async () => {
    try {
      await api.delete('/conversations/clear-all');
      setSelectedConv(null);
      if (onSelectConversation) onSelectConversation(null);
      setOpenClearAllDialog(false);
      if (onFetchConversations) await onFetchConversations();
    } catch (error) {
      console.error('Error clearing all conversations:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box
      sx={{
        width: 300,
        bgcolor: '#FFF6F6',
        borderRadius: 4,
        p: 2,
        boxSizing: 'border-box',
        boxShadow: '0 4px 24px 0 rgba(0,0,0,0.08)',
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <Typography variant="h5" fontWeight={700} sx={{ mb: 2, letterSpacing: 2, color: '#5B5BFF' }}>
          SecretEcho
        </Typography>
        {/* New Chat and Search */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
          <Button
            variant="contained"
            onClick={handleNewChat}
            sx={{
              bgcolor: '#5B5BFF',
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1,
              boxShadow: '0 2px 8px 0 rgba(91,91,255,0.10)',
              '&:hover': { bgcolor: '#4747d1' },
            }}
            fullWidth
          >
            + New chat
          </Button>
          <IconButton sx={{ bgcolor: '#fff', color: '#5B5BFF', border: '1px solid #E6E6FF', '&:hover': { bgcolor: '#F3F3FF' } }}>
            <SearchIcon />
          </IconButton>
        </Box>
        {/* Conversations */}
        <Box sx={{ flex: 1, overflowY: 'auto', pr: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Your conversations
            </Typography>
            {
              conversations.length > 0 && (
                <Button 
                  size="small" 
                  sx={{ textTransform: 'none', color: '#5B5BFF', fontWeight: 500, fontSize: 13 }}
                  onClick={() => setOpenClearAllDialog(true)}
                >
                  Clear All
                </Button>
              )
            }
          </Box>
          <List sx={{ p: 0 }}>
            {conversations.map((conversation) => (
              <ListItem
                key={conversation._id}
                onClick={() => handleConversationClick(conversation)}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  bgcolor: selectedConv === conversation._id ? '#E6E6FF' : 'transparent',
                  color: selectedConv === conversation._id ? '#5B5BFF' : 'inherit',
                  '&:hover': { bgcolor: '#F3F3FF', color: '#5B5BFF' },
                  px: 1.5,
                  py: 1,
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'background 0.2s, color 0.2s',
                  cursor: 'pointer',
                }}
                secondaryAction={
                  selectedConv === conversation._id && (
                    <Box>

                      <IconButton 
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteConversation(conversation._id);
                        }}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )
                }
              >
                <ListItemIcon sx={{ minWidth: 32, color: selectedConv === conversation._id ? '#5B5BFF' : '#BDBDBD' }}>
                  <ChatBubbleOutlineIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={conversation.title}
                  primaryTypographyProps={{
                    fontWeight: selectedConv === conversation._id ? 600 : 400,
                    fontSize: 15,
                    noWrap: true,
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Divider sx={{ mb: 2 }} />
          <Stack direction="column" spacing={1}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Button
                startIcon={<Avatar src="https://randomuser.me/api/portraits/men/32.jpg" sx={{ width: 28, height: 28 }} />}
                sx={{
                  justifyContent: 'flex-start',
                  color: '#000',
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 500,
                  px: 2,
                  py: 1,
                }}
                fullWidth
              >
                {userData.username}
              </Button>
              <IconButton 
                onClick={handleLogout}
                sx={{ 
                  color: '#5B5BFF',
                  '&:hover': { 
                    bgcolor: '#E6E6FF',
                    color: '#4747d1'
                  }
                }}
              >
                <LogoutIcon />
              </IconButton>
            </Box>
          </Stack>
        </Box>
      </Box>

      {/* Clear All Dialog */}
      <Dialog
        open={openClearAllDialog}
        onClose={() => setOpenClearAllDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            p: 2,
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, color: '#5B5BFF' }}>Clear All Conversations</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete all conversations? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenClearAllDialog(false)}
            sx={{ 
              color: '#666',
              textTransform: 'none',
              '&:hover': { bgcolor: '#F3F3FF' }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleClearAll}
            sx={{
              bgcolor: '#5B5BFF',
              color: 'white',
              textTransform: 'none',
              '&:hover': { bgcolor: '#4747d1' }
            }}
          >
            Clear All
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
