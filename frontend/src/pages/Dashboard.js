import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Paper,
  Avatar,
  Chip,
} from '@mui/material';
import {
  GitHub as GitHubIcon,
  ShoppingCart as ShopifyIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  Chat as ChatIcon,
  Add as AddIcon,
  Settings as SettingsIcon,
  SmartToy as AgentIcon,
  Forum as ForumIcon,
  Link as LinkIcon,
  HealthAndSafety as HealthIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats } from '../services/api';
import ActivityLog from '../components/ActivityLog';

const HEALTH_COLORS = {
  healthy: 'success',
  degraded: 'warning',
  warning: 'error',
  error: 'error',
};

const TYPE_ICONS = {
  github: <GitHubIcon />,
  shopify: <ShopifyIcon />,
  email: <EmailIcon />,
  calendar: <CalendarIcon />,
  general: <ChatIcon />,
};

const StatCard = ({ title, value, icon, color = 'primary', subtitle }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography color="text.secondary" gutterBottom variant="body2" sx={{ fontWeight: 500 }}>
            {title}
          </Typography>
          <Typography variant="h3" component="div" color={`${color}.main`} sx={{ fontSize: '2rem' }}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        <Avatar sx={{ bgcolor: `rgba(124, 108, 240, 0.15)`, color: `${color}.main`, width: 52, height: 52 }}>
          {icon}
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

const QuickAction = ({ icon, title, description, onClick, color = 'primary' }) => (
  <Card
    onClick={onClick}
    sx={{
      cursor: 'pointer',
      height: '100%',
      transition: 'all 0.25s ease',
      '&:hover': {
        transform: 'translateY(-3px)',
        borderColor: 'rgba(124, 108, 240, 0.4)',
        boxShadow: '0 8px 32px rgba(124, 108, 240, 0.12)',
      },
    }}
  >
    <CardContent sx={{ textAlign: 'center', py: 3 }}>
      <Avatar sx={{ bgcolor: `${color}.main`, mx: 'auto', mb: 2, width: 52, height: 52 }}>
        {icon}
      </Avatar>
      <Typography variant="subtitle1" gutterBottom fontWeight={600}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const fetchDashboardData = useCallback(async () => {
    try {
      const { data } = await getDashboardStats();
      setStats(data);
      setError(false);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const healthColor = HEALTH_COLORS[stats?.systemHealth] || 'default';

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitor your agents, conversations, and system activity in real time.
        </Typography>
      </Box>

      {error && (
        <Chip label="Could not reach backend — showing last known data" color="warning" sx={{ mb: 2 }} />
      )}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Agents"
            value={stats?.activeAgents ?? 0}
            icon={<AgentIcon />}
            color="primary"
            subtitle={`${stats?.totalAgents ?? 0} total`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Conversations"
            value={stats?.totalConversations ?? 0}
            icon={<ForumIcon />}
            color="secondary"
            subtitle={`${stats?.messagesToday ?? 0} messages today`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Configured"
            value={stats?.configuredAgents ?? 0}
            icon={<LinkIcon />}
            color="success"
            subtitle="Agents with credentials"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="System Health"
            value={
              <Chip
                label={(stats?.systemHealth || 'unknown').toUpperCase()}
                color={healthColor}
                size="small"
                sx={{ fontWeight: 600 }}
              />
            }
            icon={<HealthIcon />}
            color={healthColor}
            subtitle={`${stats?.totalMessages ?? 0} total messages`}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
            Quick Actions
          </Typography>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={4}>
              <QuickAction
                icon={<ChatIcon />}
                title="General Chat"
                description="Talk to the AI assistant"
                onClick={() => navigate('/chat/general')}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <QuickAction
                icon={<AddIcon />}
                title="Browse Templates"
                description="Create agents from templates"
                onClick={() => navigate('/templates')}
                color="secondary"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <QuickAction
                icon={<SettingsIcon />}
                title="Settings"
                description="Configure your platform"
                onClick={() => navigate('/settings')}
                color="info"
              />
            </Grid>
          </Grid>

          <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
            Recent Messages
          </Typography>
          <Paper sx={{ p: 1 }}>
            {stats?.recentMessages?.length > 0 ? (
              <List>
                {stats.recentMessages.map((message, index) => (
                  <React.Fragment key={message._id || index}>
                    <ListItem sx={{ py: 1.5 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        {TYPE_ICONS[message.type] || <ChatIcon />}
                      </ListItemIcon>
                      <ListItemText
                        primary={message.content}
                        secondary={`${new Date(message.timestamp).toLocaleString()} · ${message.sender}`}
                        primaryTypographyProps={{
                          sx: {
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          },
                        }}
                      />
                    </ListItem>
                    {index < stats.recentMessages.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 5 }}>
                No messages yet — start a conversation to see activity here.
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <ActivityLog />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
