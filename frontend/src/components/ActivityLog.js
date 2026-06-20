import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Box,
  Divider,
  IconButton,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as SuccessIcon,
  Refresh as RefreshIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import io from 'socket.io-client';

const ActivityLog = () => {
  const [logs, setLogs] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Initialize socket connection for real-time logs
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    // Listen for log events
    newSocket.on('activity_log', (logEntry) => {
      setLogs(prev => [logEntry, ...prev].slice(0, 50)); // Keep only last 50 logs
    });

    // Fetch initial logs
    fetchLogs();

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/logs');
      const data = await response.json();
      setLogs(data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const getLogIcon = (level) => {
    const iconMap = {
      info: <InfoIcon color="info" />,
      warning: <WarningIcon color="warning" />,
      error: <ErrorIcon color="error" />,
      success: <SuccessIcon color="success" />
    };
    return iconMap[level] || <InfoIcon />;
  };

  const getLogColor = (level) => {
    const colorMap = {
      info: 'info',
      warning: 'warning',
      error: 'error',
      success: 'success'
    };
    return colorMap[level] || 'default';
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <Paper sx={{ p: 2, height: '400px', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Activity Log
          <Badge badgeContent={logs.length} color="primary" sx={{ ml: 1 }} />
        </Typography>
        <Box>
          <Tooltip title="Refresh">
            <IconButton size="small" onClick={fetchLogs}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Clear Logs">
            <IconButton size="small" onClick={clearLogs}>
              <ClearIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      <Divider sx={{ mb: 1 }} />
      
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {logs.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
            No activity logs yet
          </Typography>
        ) : (
          <List dense>
            {logs.map((log, index) => (
              <ListItem key={index} sx={{ py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  {getLogIcon(log.level)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ flexGrow: 1 }}>
                        {log.message}
                      </Typography>
                      <Chip 
                        label={log.level.toUpperCase()} 
                        size="small" 
                        color={getLogColor(log.level)}
                        variant="outlined"
                      />
                    </Box>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        {log.source || 'System'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatTimestamp(log.timestamp)}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Paper>
  );
};

export default ActivityLog; 