import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
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
  Alert,
  Snackbar,
  Fab,
  Fade,
  Skeleton
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AgentCard from '../components/AgentCard';

const AgentList = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
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
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/agents');
      setAgents(response.data);
    } catch (error) {
      console.error('Error fetching agents:', error);
      showSnackbar('Error fetching agents', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
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
        showSnackbar('Agent updated successfully');
      } else {
        await axios.post('http://localhost:5000/api/agents', agentData);
        showSnackbar('Agent created successfully');
      }
      handleClose();
      fetchAgents();
    } catch (error) {
      console.error('Error saving agent:', error);
      showSnackbar('Error saving agent', 'error');
    }
  };

  const handleDelete = async (agentId) => {
    if (window.confirm('Are you sure you want to delete this agent?')) {
      try {
        await axios.delete(`http://localhost:5000/api/agents/${agentId}`);
        showSnackbar('Agent deleted successfully');
        fetchAgents();
      } catch (error) {
        console.error('Error deleting agent:', error);
        showSnackbar('Error deleting agent', 'error');
      }
    }
  };

  const handleAgentClick = (agent) => {
    navigate(`/chat/agent/${agent._id}`);
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
            helperText="Personal access token for GitHub API"
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
              label="Email Address"
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
            helperText="JSON credentials for calendar access"
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            AI Agents
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your MCP-enabled agents for various tasks
          </Typography>
        </Box>
      </Box>

      {loading ? (
        <Grid container spacing={3}>
          {[...Array(6)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={3}>
          {agents.map((agent) => (
            <Grid item xs={12} sm={6} md={4} key={agent._id}>
              <Fade in timeout={300}>
                <div>
                  <AgentCard
                    agent={agent}
                    onEdit={handleOpen}
                    onDelete={handleDelete}
                    onChat={handleAgentClick}
                  />
                </div>
              </Fade>
            </Grid>
          ))}
          {agents.length === 0 && (
            <Grid item xs={12}>
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No agents configured yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Create your first AI agent to get started
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpen()}
                  size="large"
                >
                  Create Agent
                </Button>
              </Box>
            </Grid>
          )}
        </Grid>
      )}

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
        onClick={() => handleOpen()}
      >
        <AddIcon />
      </Fab>

      {/* Agent Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingAgent ? 'Edit Agent' : 'Create New Agent'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Agent Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Agent Type</InputLabel>
              <Select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                label="Agent Type"
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
                label="Status"
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
            {getConfigFields(formData.type)}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingAgent ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AgentList; 