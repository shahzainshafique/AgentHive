import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Paper
} from '@mui/material';
import {
  GitHub as GitHubIcon,
  ShoppingCart as ShopifyIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  Chat as ChatIcon,
  Add as AddIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState({
    activeAgents: 0,
    activeConversations: 0,
    connectedTools: 0,
    recentMessages: []
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [agentsRes, conversationsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/agents'),
        axios.get('http://localhost:5000/api/conversations/recent')
      ]);

      const activeAgents = agentsRes.data.filter(agent => agent.status === 'active').length;
      const connectedTools = agentsRes.data.reduce((acc, agent) => {
        if (agent.configuration && agent.configuration.size > 0) acc++;
        return acc;
      }, 0);

      setStats({
        activeAgents,
        activeConversations: conversationsRes.data.length,
        connectedTools,
        recentMessages: conversationsRes.data
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const QuickAction = ({ icon: Icon, title, description, onClick }) => (
    <Card sx={{ height: '100%', cursor: 'pointer' }} onClick={onClick}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Icon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
          <Box>
            <Typography variant="h6">{title}</Typography>
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Active Agents
              </Typography>
              <Typography variant="h4">
                {stats.activeAgents}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Active Conversations
              </Typography>
              <Typography variant="h4">
                {stats.activeConversations}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Connected Tools
              </Typography>
              <Typography variant="h4">
                {stats.connectedTools}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                System Status
              </Typography>
              <Typography variant="h4" color="success.main">
                Online
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Quick Actions
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <QuickAction
            icon={ChatIcon}
            title="General Chat"
            description="Chat with our AI assistant"
            onClick={() => navigate('/chat/general')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <QuickAction
            icon={AddIcon}
            title="New Agent"
            description="Register a new agent"
            onClick={() => navigate('/agents/new')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <QuickAction
            icon={SettingsIcon}
            title="Settings"
            description="Configure system settings"
            onClick={() => navigate('/settings')}
          />
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Recent Activity
      </Typography>
      <Paper sx={{ p: 2 }}>
        <List>
          {stats.recentMessages.map((message, index) => (
            <React.Fragment key={message._id}>
              <ListItem>
                <ListItemIcon>
                  {message.type === 'github' && <GitHubIcon />}
                  {message.type === 'shopify' && <ShopifyIcon />}
                  {message.type === 'email' && <EmailIcon />}
                  {message.type === 'calendar' && <CalendarIcon />}
                  {message.type === 'general' && <ChatIcon />}
                </ListItemIcon>
                <ListItemText
                  primary={message.content}
                  secondary={`${new Date(message.timestamp).toLocaleString()} - ${message.type}`}
                />
              </ListItem>
              {index < stats.recentMessages.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default Dashboard; 