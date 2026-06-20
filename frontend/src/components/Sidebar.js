import React from 'react';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Box,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  SmartToy as AgentIcon,
  Chat as ChatIcon,
  ViewModule as TemplatesIcon,
  Settings as SettingsIcon,
  History as LogsIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Agents', icon: <AgentIcon />, path: '/agents' },
  { text: 'Templates', icon: <TemplatesIcon />, path: '/templates' },
  { text: 'Chat', icon: <ChatIcon />, path: '/chat/general' },
  { text: 'Activity Logs', icon: <LogsIcon />, path: '/logs' },
];

const bottomMenuItems = [
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isSelected = (path) => {
    if (path === '/chat/general') return location.pathname.startsWith('/chat');
    return location.pathname === path;
  };

  const renderItems = (items) =>
    items.map((item) => (
      <ListItemButton
        key={item.text}
        onClick={() => navigate(item.path)}
        selected={isSelected(item.path)}
      >
        <ListItemIcon sx={{ color: isSelected(item.path) ? 'primary.main' : 'text.secondary', minWidth: 40 }}>
          {item.icon}
        </ListItemIcon>
        <ListItemText
          primary={item.text}
          primaryTypographyProps={{
            fontWeight: isSelected(item.path) ? 600 : 400,
            fontSize: '0.9rem',
          }}
        />
      </ListItemButton>
    ));

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        display: { xs: 'none', sm: 'block' },
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          mt: 8,
        },
      }}
    >
      <Box sx={{ px: 2, py: 2 }}>
        <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: 1.2 }}>
          Navigation
        </Typography>
      </Box>
      <List sx={{ px: 0.5 }}>{renderItems(menuItems)}</List>
      <Divider sx={{ my: 1, mx: 2 }} />
      <List sx={{ px: 0.5 }}>{renderItems(bottomMenuItems)}</List>
    </Drawer>
  );
}

export default Sidebar;
