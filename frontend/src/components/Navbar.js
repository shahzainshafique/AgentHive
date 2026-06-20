import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box, Chip } from '@mui/material';
import {
  Settings as SettingsIcon,
  Hive as HiveIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();

  return (
    <AppBar position="fixed">
      <Toolbar sx={{ gap: 1 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            flexGrow: 1,
            cursor: 'pointer',
          }}
          onClick={() => navigate('/')}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #7c6cf0 0%, #22d3ee 100%)',
            }}
          >
            <HiveIcon sx={{ color: 'white', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h6" noWrap sx={{ lineHeight: 1.2, fontWeight: 700 }}>
              Agenthive
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>
              AI Agent Platform
            </Typography>
          </Box>
        </Box>

        <Chip
          label="Beta"
          size="small"
          sx={{
            bgcolor: 'rgba(124, 108, 240, 0.2)',
            color: 'primary.light',
            border: '1px solid rgba(124, 108, 240, 0.3)',
            fontWeight: 600,
          }}
        />

        <IconButton color="inherit" onClick={() => navigate('/settings')} aria-label="Settings">
          <SettingsIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
