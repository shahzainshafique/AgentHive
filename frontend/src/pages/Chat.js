import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  CircularProgress,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Card,
  CardContent,
  Button
} from '@mui/material';
import {
  Send as SendIcon,
  ArrowBack as ArrowBackIcon,
  SmartToy as AgentIcon,
  Person as UserIcon
} from '@mui/icons-material';
import axios from 'axios';
import io from 'socket.io-client';

const Chat = ({type}) => {
  const { id } = useParams();
  console.log('type', type, '  id:', id);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [agent, setAgent] = useState(null);
  const [socket, setSocket] = useState(null);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const { agentId } = useParams();


useEffect(() => {
  // Initialize socket connection
  const newSocket = io('http://localhost:5000');
  setSocket(newSocket);
     // Fetch agent details
     fetchAgentDetails();
  // Add debug logging
  newSocket.on('connect', () => {
    console.log('Socket connected:', newSocket.id);
  });

  // Set up event listeners
  newSocket.on('chat_message', handleNewMessage);
  newSocket.on('error', handleError);
  fetchChatHistory();
  // Clean up on unmount
  return () => {
    newSocket.disconnect();
  };
}, [agentId]);

// Define handler functions outside useEffect
const handleNewMessage = (message) => {
  console.log('Received message:', message);
  
  if (message.isStreaming) {
    // Handle streaming message
    setStreamingMessage(prev => prev + message.content);
    setIsStreaming(true);
  } else if (message.isStreamingEnd) {
    // End of streaming message
    setMessages(prev => [...prev, {
      content: streamingMessage,
      sender: message.sender,
      timestamp: new Date().toISOString()
    }]);
    setStreamingMessage('');
    setIsStreaming(false);
    setIsLoading(false);
    scrollToBottom();
  } else {
    // Regular message
    setMessages(prev => [...prev, message]);
    setIsLoading(false);
    scrollToBottom();
  }
};

const handleError = (error) => {
  console.error('Socket error:', error);
  setMessages(prev => [...prev, {
    text: 'An error occurred. Please try again.',
    sender: 'system',
    timestamp: new Date().toISOString()
  }]);
  setIsLoading(false);
};

// Update the send function
const handleSend = (e) => {
  // Prevent form submission from reloading the page
  if (e) {
    e.preventDefault();
  }
  
  if (!input.trim()) return;
  
  const message = {
    content: input,
    sender: 'user',
    timestamp: new Date().toISOString(),
  };

  // Save message to database
  saveMessage(message);

  setMessages((prev) => [...prev, message]);
  setInput('');
  setIsLoading(true);

  // Send message to server
  if (type === 'general') {
    socket.emit('general_chat', { message: input });
  } else {
    socket.emit('chat_message', {
      message: input,
      agentId: id
    });
  }
};

const handleKeyPress = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
};

  const fetchAgentDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/agents/${id}`);
      setAgent(response.data);
    } catch (error) {
      console.error('Error fetching agent details:', error);
    }
  };

  const fetchChatHistory = async () => {
    try {
      const endpoint = type === 'general' 
        ? 'http://localhost:5000/api/conversations/general'
        : `http://localhost:5000/api/conversations/agent/${id}`;
      
      const response = await axios.get(endpoint);
      setMessages(response.data);
      scrollToBottom();
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

  const saveMessage = async (message) => {
    try {
      await axios.post('http://localhost:5000/api/conversations/message', {
        type,
        agentId: type === 'agent' ? id : undefined,
        message
      });
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };


  const renderMessage = (message) => {
    const isUser = message.sender === 'user';
    const isError = message.type === 'error';
  
    return (
      <ListItem
        key={message.timestamp}
        sx={{
          flexDirection: isUser ? 'row-reverse' : 'row',
          alignItems: 'flex-start',
          mb: 2
        }}
      >
        <ListItemAvatar>
          <Avatar sx={{ mt:2 , bgcolor: isUser ? 'primary.main' : 'secondary.main' }}>
            {isUser ? <UserIcon /> : <AgentIcon />}
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          sx={{
            // Add this to align the content properly
            '.MuiListItemText-primary': {
              display: 'flex',
              justifyContent: isUser ? 'flex-end' : 'flex-start'
            }
          }}
          primary={
            <Paper
              elevation={1}
              sx={{
                mr: 2,
                p: 2,
                maxWidth: '70%',
                bgcolor: isError ? 'error.light' : isUser ? 'grey.800' : 'grey.900',
                color: isError ? 'error.contrastText' : 'text.primary',
                borderRadius: 2
              }}
            >
              <Typography variant="body1">{message.content || message.text}</Typography>
            </Paper>
          }
          secondary={
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                textAlign: isUser ? 'right' : 'left',
                mt: 0.5
              }}
            >
              {new Date(message.timestamp).toLocaleTimeString()}
            </Typography>
          }
        />
      </ListItem>
    );
  };

  return (
    <Box sx={{ height: '90vh', display: 'flex', flexDirection: 'column' }}>

      {/* Messages */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        <List>
          {messages.map(renderMessage)}
          {isStreaming && (
            <ListItem
              sx={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                mb: 2
              }}
            >
              <ListItemAvatar>
                <Avatar sx={{ mt: 2, bgcolor: 'secondary.main' }}>
                  <AgentIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Paper
                    elevation={1}
                    sx={{
                      mr: 2,
                      p: 2,
                      maxWidth: '70%',
                      bgcolor: 'grey.900',
                      color: 'text.primary',
                      borderRadius: 2
                    }}
                  >
                    <Typography variant="body1">{streamingMessage}</Typography>
                  </Paper>
                }
              />
            </ListItem>
          )}
          <div ref={messagesEndRef} />
        </List>
      </Box>

      <Divider />

      {/* Input */}
      <Box
        component="form"
        onSubmit={handleSend}
        sx={{
          p: 2,
          bgcolor: 'background.paper',
          display: 'flex',
          gap: 1
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
          size="small"
        />
        <IconButton
          type="submit"
          color="primary"
          disabled={isLoading || !input.trim()}
        >
          {isLoading ? <CircularProgress size={24} /> : <SendIcon />}
        </IconButton>
      </Box>
    </Box>
  );
};

export default Chat; 