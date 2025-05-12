import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  IconButton,
  Tooltip
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Chat as ChatIcon } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AgentList = () => {
  const [agents, setAgents] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    description: '',
    configuration: {
      githubToken: '',
      shopifyApiKey: '',
      shopifyApiSecret: '',
      email: '',
      emailPassword: '',
      calendarCredentials: ''
    },
    status: 'active'
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/agents');
      setAgents(response.data);
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };

  const handleOpen = (agent = null) => {
    if (agent) {
      setEditingAgent(agent);
      setFormData({
        name: agent.name,
        type: agent.type,
        description: agent.description || '',
        configuration: {
          githubToken: agent.configuration.get('githubToken') || '',
          shopifyApiKey: agent.configuration.get('shopifyApiKey') || '',
          shopifyApiSecret: agent.configuration.get('shopifyApiSecret') || '',
          email: agent.configuration.get('email') || '',
          emailPassword: agent.configuration.get('emailPassword') || '',
          calendarCredentials: agent.configuration.get('calendarCredentials') || ''
        },
        status: agent.status
      });
    } else {
      setEditingAgent(null);
      setFormData({
        name: '',
        type: '',
        description: '',
        configuration: {
          githubToken: '',
          shopifyApiKey: '',
          shopifyApiSecret: '',
          email: '',
          emailPassword: '',
          calendarCredentials: ''
        },
        status: 'active'
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingAgent(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const configMap = new Map();
      Object.entries(formData.configuration).forEach(([key, value]) => {
        if (value) configMap.set(key, value);
      });

      const agentData = {
        ...formData,
        configuration: configMap
      };

      if (editingAgent) {
        await axios.put(`http://localhost:5000/api/agents/${editingAgent._id}`, agentData);
      } else {
        await axios.post('http://localhost:5000/api/agents', agentData);
      }
      handleClose();
      fetchAgents();
    } catch (error) {
      console.error('Error saving agent:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this agent?')) {
      try {
        await axios.delete(`http://localhost:5000/api/agents/${id}`);
        fetchAgents();
      } catch (error) {
        console.error('Error deleting agent:', error);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('config.')) {
      const configKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        configuration: {
          ...prev.configuration,
          [configKey]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const getConfigFields = (type) => {
    switch (type) {
      case 'github':
        return (
          <TextField
            fullWidth
            label="GitHub Token"
            name="config.githubToken"
            value={formData.configuration.githubToken}
            onChange={handleChange}
            margin="normal"
            type="password"
          />
        );
      case 'shopify':
        return (
          <>
            <TextField
              fullWidth
              label="Shopify API Key"
              name="config.shopifyApiKey"
              value={formData.configuration.shopifyApiKey}
              onChange={handleChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Shopify API Secret"
              name="config.shopifyApiSecret"
              value={formData.configuration.shopifyApiSecret}
              onChange={handleChange}
              margin="normal"
              type="password"
            />
          </>
        );
      case 'email':
        return (
          <>
            <TextField
              fullWidth
              label="Email"
              name="config.email"
              value={formData.configuration.email}
              onChange={handleChange}
              margin="normal"
              type="email"
            />
            <TextField
              fullWidth
              label="Email Password"
              name="config.emailPassword"
              value={formData.configuration.emailPassword}
              onChange={handleChange}
              margin="normal"
              type="password"
            />
          </>
        );
      case 'calendar':
        return (
          <TextField
            fullWidth
            label="Calendar Credentials"
            name="config.calendarCredentials"
            value={formData.configuration.calendarCredentials}
            onChange={handleChange}
            margin="normal"
            type="password"
          />
        );
      default:
        return null;
    }
  };

  const handleAgentClick = (agent) => {
    navigate(`/chat/agent/${agent._id}`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Agents</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Agent
        </Button>
      </Box>

      <Grid container spacing={3}>
        {agents.map((agent) => (
          <Grid item xs={12} sm={6} md={4} key={agent._id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">{agent.name}</Typography>
                  <Box>
                    <Tooltip title="Edit">
                      <IconButton onClick={() => handleOpen(agent)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton onClick={() => handleDelete(agent._id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Chat">
                      <IconButton onClick={() => handleAgentClick(agent)}>
                        <ChatIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
                <Typography color="textSecondary" gutterBottom>
                  Type: {agent.type}
                </Typography>
                <Typography variant="body2">
                  {agent.description}
                </Typography>
                <Typography color="textSecondary" sx={{ mt: 1 }}>
                  Status: {agent.status}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingAgent ? 'Edit Agent' : 'Add New Agent'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Type</InputLabel>
              <Select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                label="Type"
              >
                <MenuItem value="github">GitHub</MenuItem>
                <MenuItem value="shopify">Shopify</MenuItem>
                <MenuItem value="email">Email</MenuItem>
                <MenuItem value="calendar">Calendar</MenuItem>
                <MenuItem value="custom">Custom</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={3}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                label="Status"
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="error">Error</MenuItem>
              </Select>
            </FormControl>
            {formData.type && getConfigFields(formData.type)}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingAgent ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AgentList; 