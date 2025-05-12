import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  CircularProgress,
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';

function AgentChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [agent, setAgent] = useState(null);
  const messagesEndRef = useRef(null);
  const socketRef = useRef();
  const { agentId } = useParams();

  const fetchAgentDetails = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/agents/${agentId}`);
      const data = await response.json();
      setAgent(data);
    } catch (error) {
      console.error('Error fetching agent details:', error);
    }
  }, [agentId]);

  useEffect(() => {
    // Connect to WebSocket server
    socketRef.current = io('http://localhost:5000');

    // Fetch agent details
    fetchAgentDetails();

    // Socket event listeners
    socketRef.current.on('chat_message', (message) => {
      console.log('Received message:', message);
      if (message.text) {
        console.log('text', message.text);
        setMessages((prev) => [...prev, {
          text: message.content || message.text,
          sender: message.sender,
          timestamp: message.timestamp
        }]);
        console.log('messages', messages);
        setIsLoading(false);
      } else {
        console.error('Invalid message format received:', message);
      }
    });

    socketRef.current.on('error', (error) => {
      console.error('Socket error:', error);
      setMessages((prev) => [...prev, {
        text: 'An error occurred. Please try again.',
        sender: 'system',
        timestamp: new Date().toISOString()
      }]);
      setIsLoading(false);
    });

    // Fetch chat history
    const fetchChatHistory = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/conversations/agent/${agentId}`);
        const data = await response.json();
        if (Array.isArray(data)) {
          setMessages(data.map(msg => ({
            text: msg.content || msg.text,
            sender: msg.sender,
            timestamp: msg.timestamp
          })));
        }
      } catch (error) {
        console.error('Error fetching chat history:', error);
      }
    };

    fetchChatHistory();

    return () => {
      socketRef.current.disconnect();
    };
  }, [agentId, fetchAgentDetails]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const message = {
      text: input,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, message]);
    setInput('');
    setIsLoading(true);

    // Send message to server
    socketRef.current.emit('chat_message', {
      agentId,
      message: input,
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box sx={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      <Paper
        elevation={3}
        sx={{
          p: 2,
          mb: 2,
          backgroundColor: 'background.paper',
        }}
      >
        <Typography variant="h6">
          {agent?.name || 'Loading...'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {agent?.description}
        </Typography>
      </Paper>

      <Paper
        elevation={3}
        sx={{
          flex: 1,
          mb: 2,
          p: 2,
          overflow: 'auto',
          backgroundColor: 'background.paper',
        }}
      >
        {messages.map((message, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
              mb: 2,
            }}
          >
            <Paper
              elevation={1}
              sx={{
                p: 2,
                maxWidth: '70%',
                backgroundColor: message.sender === 'user' ? 'primary.main' : 'background.paper',
                color: message.sender === 'user' ? 'white' : 'text.primary',
              }}
            >
              <Typography variant="body1">{message.text}</Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(message.timestamp).toLocaleTimeString()}
              </Typography>
            </Paper>
          </Box>
        ))}
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Paper>

      <Paper
        elevation={3}
        sx={{
          p: 2,
          backgroundColor: 'background.paper',
        }}
      >
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            variant="outlined"
            size="small"
          />
          <IconButton
            color="primary"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );
}

export default AgentChat;