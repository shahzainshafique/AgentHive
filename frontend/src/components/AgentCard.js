import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  IconButton,
  Box,
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  GitHub as GitHubIcon,
  ShoppingCart as ShopifyIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  SmartToy as CustomIcon,
  Chat as ChatIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Circle as StatusIcon,
} from '@mui/icons-material';
import { isAgentConfigured } from '../utils/agentHelpers';

const TYPE_ICONS = {
  github: GitHubIcon,
  shopify: ShopifyIcon,
  email: EmailIcon,
  calendar: CalendarIcon,
  custom: CustomIcon,
};

const TYPE_COLORS = {
  github: '#e6edf3',
  shopify: '#96bf48',
  email: '#60a5fa',
  calendar: '#34d399',
  custom: '#a59bf5',
};

const AgentCard = ({ agent, onEdit, onDelete, onChat }) => {
  const IconComponent = TYPE_ICONS[agent.type] || CustomIcon;
  const configured = isAgentConfigured(agent);

  const getStatusColor = (status) => {
    if (status === 'active') return 'success';
    if (status === 'error') return 'error';
    return 'default';
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.25s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 40px rgba(124, 108, 240, 0.15)',
          borderColor: 'rgba(124, 108, 240, 0.3)',
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2, gap: 1.5 }}>
          <Avatar
            sx={{
              bgcolor: 'rgba(124, 108, 240, 0.15)',
              color: TYPE_COLORS[agent.type] || 'primary.main',
              width: 48,
              height: 48,
            }}
          >
            <IconComponent />
          </Avatar>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="h6" noWrap sx={{ fontSize: '1rem' }}>
              {agent.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
              <StatusIcon sx={{ fontSize: 10, color: `${getStatusColor(agent.status)}.main` }} />
              <Typography variant="caption" color="text.secondary">
                {agent.status}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: 40,
          }}
        >
          {agent.description || 'No description provided'}
        </Typography>

        <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
          <Chip label={agent.type} size="small" color="primary" variant="outlined" />
          <Chip
            label={configured ? 'Configured' : 'Needs setup'}
            size="small"
            color={configured ? 'success' : 'warning'}
            variant="outlined"
          />
        </Box>
      </CardContent>

      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2, pt: 0 }}>
        <Box>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => onEdit(agent)} color="primary">
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" onClick={() => onDelete(agent._id)} color="error">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        <Tooltip title="Start chat">
          <IconButton
            onClick={() => onChat(agent)}
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              width: 40,
              height: 40,
              '&:hover': { bgcolor: 'primary.dark' },
            }}
          >
            <ChatIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
};

export default AgentCard;
