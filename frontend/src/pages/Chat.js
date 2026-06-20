import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  TextField,
  IconButton,
  CircularProgress,
  Typography,
  Chip,
  Avatar,
  Paper,
  Button,
} from '@mui/material';
import {
  Send as SendIcon,
  SmartToy as AgentIcon,
  Circle as CircleIcon,
} from '@mui/icons-material';
import {
  getAgent,
  getGeneralConversation,
  getAgentConversation,
  saveMessage,
} from '../services/api';
import getSocket from '../services/socket';
import { getSuggestedPrompts, isAgentConfigured } from '../utils/agentHelpers';
import MessageBubble from '../components/MessageBubble';

const Chat = ({ type }) => {
  const { id } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [agent, setAgent] = useState(null);
  const [connected, setConnected] = useState(false);
  const [currentStream, setCurrentStream] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleNewMessage = useCallback((message) => {
    if (message.isStreaming) {
      setIsStreaming(true);
      setCurrentStream((prev) => prev + message.content);
      scrollToBottom();
    } else if (message.isStreamingEnd) {
      setIsStreaming(false);
      setMessages((prev) => [...prev, message]);
      setCurrentStream('');
      setIsLoading(false);
      scrollToBottom();
    } else {
      setMessages((prev) => [...prev, message]);
      setIsLoading(false);
      scrollToBottom();
    }
  }, [scrollToBottom]);

  const handleError = useCallback((error) => {
    console.error('Socket error:', error);
    setMessages((prev) => [
      ...prev,
      {
        content: error?.message || 'An error occurred. Please try again.',
        sender: 'system',
        type: 'error',
        timestamp: new Date().toISOString(),
      },
    ]);
    setIsLoading(false);
    setIsStreaming(false);
  }, []);

  const fetchAgentDetails = useCallback(async () => {
    if (type !== 'agent' || !id) return;
    try {
      const { data } = await getAgent(id);
      setAgent(data);
    } catch (error) {
      console.error('Error fetching agent details:', error);
    }
  }, [type, id]);

  const fetchChatHistory = useCallback(async () => {
    try {
      const { data } = type === 'general'
        ? await getGeneralConversation()
        : await getAgentConversation(id);
      setMessages(data);
      scrollToBottom();
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  }, [type, id, scrollToBottom]);

  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('chat_message', handleNewMessage);
    socket.on('error', handleError);

    fetchAgentDetails();
    fetchChatHistory();

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('chat_message', handleNewMessage);
      socket.off('error', handleError);
    };
  }, [id, type, handleNewMessage, handleError, fetchAgentDetails, fetchChatHistory]);

  const persistMessage = async (message) => {
    try {
      await saveMessage({
        type,
        agentId: type === 'agent' ? id : undefined,
        message,
      });
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  const sendMessage = (text) => {
    if (!text.trim() || isLoading) return;

    const message = {
      content: text,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, message]);
    persistMessage(message);
    setInput('');
    setIsLoading(true);

    const socket = socketRef.current;
    if (type === 'general') {
      socket.emit('general_chat', { message: text });
    } else {
      socket.emit('chat_message', { message: text, agentId: id });
    }
  };

  const handleSend = (e) => {
    e?.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const chatTitle = type === 'general' ? 'General Assistant' : agent?.name || 'Agent Chat';
  const chatSubtitle = type === 'general'
    ? 'Ask anything — routes to the best agent when needed'
    : agent?.description;
  const prompts = getSuggestedPrompts(type === 'general' ? 'general' : agent?.type);
  const agentConfigured = agent ? isAgentConfigured(agent) : true;

  return (
    <Box sx={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column', maxWidth: 900, mx: 'auto' }}>
      <Paper
        sx={{
          px: 3,
          py: 2,
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          borderRadius: 3,
        }}
      >
        <Avatar sx={{ bgcolor: 'primary.main', width: 44, height: 44 }}>
          <AgentIcon />
        </Avatar>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography variant="h6" noWrap>{chatTitle}</Typography>
          {chatSubtitle && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }} noWrap>
              {chatSubtitle}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexShrink: 0 }}>
          {type === 'agent' && agent && (
            <Chip
              size="small"
              label={agentConfigured ? 'Configured' : 'Needs setup'}
              color={agentConfigured ? 'success' : 'warning'}
              variant="outlined"
            />
          )}
          <Chip
            size="small"
            icon={<CircleIcon sx={{ fontSize: '10px !important', color: connected ? 'success.main' : 'error.main' }} />}
            label={connected ? 'Connected' : 'Disconnected'}
            variant="outlined"
            color={connected ? 'success' : 'error'}
          />
        </Box>
      </Paper>

      <Paper
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 3,
          mb: 2,
          borderRadius: 3,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {messages.length === 0 && !isStreaming ? (
          <Box sx={{ m: 'auto', textAlign: 'center', maxWidth: 480, py: 4 }}>
            <AgentIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2, opacity: 0.7 }} />
            <Typography variant="h6" gutterBottom>
              Start a conversation
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {type === 'agent' && !agentConfigured
                ? 'This agent needs configuration before it can use integrations. You can still chat with the AI persona.'
                : 'Try one of these prompts or type your own message below.'}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {prompts.map((prompt) => (
                <Button
                  key={prompt}
                  variant="outlined"
                  size="small"
                  onClick={() => sendMessage(prompt)}
                  sx={{ justifyContent: 'flex-start', textAlign: 'left', py: 1 }}
                >
                  {prompt}
                </Button>
              ))}
            </Box>
          </Box>
        ) : (
          <>
            {messages.map((msg, index) => (
              <MessageBubble key={msg._id || `${msg.timestamp}-${index}`} message={msg} />
            ))}
            {isStreaming && (
              <MessageBubble
                message={{
                  content: currentStream,
                  sender: 'agent',
                  timestamp: new Date().toISOString(),
                }}
                isStreaming
              />
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </Paper>

      <Paper
        component="form"
        onSubmit={handleSend}
        sx={{
          p: 2,
          display: 'flex',
          gap: 1.5,
          alignItems: 'flex-end',
          borderRadius: 3,
        }}
      >
        <TextField
          fullWidth
          multiline
          maxRows={4}
          variant="outlined"
          placeholder="Type your message…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading && !isStreaming}
          size="small"
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        />
        <IconButton
          type="submit"
          disabled={isLoading || !input.trim()}
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            width: 44,
            height: 44,
            flexShrink: 0,
            '&:hover': { bgcolor: 'primary.dark' },
            '&.Mui-disabled': { bgcolor: 'action.disabledBackground' },
          }}
        >
          {isLoading && !isStreaming ? <CircularProgress size={22} color="inherit" /> : <SendIcon />}
        </IconButton>
      </Paper>
    </Box>
  );
};

export default Chat;
