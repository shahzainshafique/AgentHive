import React from 'react';
import { Paper, Typography, Box, Avatar } from '@mui/material';
import {
    SmartToy as AgentIcon,
    Person as UserIcon,
    Info as SystemIcon
} from '@mui/icons-material';
import { keyframes } from '@mui/system';

const blink = keyframes`
  0% { opacity: 0; }
  50% { opacity: 1; }
  100% { opacity: 0; }
`;

const MessageBubble = ({ message, isStreaming }) => {
    const isUser = message.sender === 'user';
    const isSystem = message.sender === 'system' || message.type === 'error';
    const isError = message.type === 'error';

    const getBackgroundColor = () => {
        if (isSystem || isError) return 'rgba(255, 255, 255, 0.05)';
        if (isUser) return 'primary.dark';
        return 'background.paper';
    };

    const getBorderColor = () => {
        if (isSystem) return 'info.main';
        if (isError) return 'error.main';
        if (isUser) return 'primary.main';
        return 'secondary.main';
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: isUser ? 'row-reverse' : 'row',
                alignItems: 'flex-start',
                mb: 2,
                gap: 2,
                width: '100%'
            }}
        >
            <Avatar
                sx={{
                    bgcolor: isUser ? 'primary.main' : isSystem ? 'info.main' : 'secondary.main',
                    width: 32,
                    height: 32
                }}
            >
                {isUser ? <UserIcon fontSize="small" /> : isSystem ? <SystemIcon fontSize="small" /> : <AgentIcon fontSize="small" />}
            </Avatar>

            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    maxWidth: '70%',
                    bgcolor: getBackgroundColor(),
                    color: 'text.primary',
                    borderRadius: 4,
                    borderTopRightRadius: isUser ? 0 : 4,
                    borderTopLeftRadius: !isUser ? 0 : 4,
                    border: 1,
                    borderColor: 'divider'
                }}
            >
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {message.content || message.text}
                    {isStreaming && (
                        <Box
                            component="span"
                            sx={{
                                display: 'inline-block',
                                width: 8,
                                height: 16,
                                ml: 0.5,
                                bgcolor: 'secondary.main',
                                verticalAlign: 'text-bottom',
                                animation: `${blink} 1s infinite`
                            }}
                        />
                    )}
                </Typography>
                <Typography
                    variant="caption"
                    sx={{
                        display: 'block',
                        mt: 1,
                        opacity: 0.7,
                        textAlign: isUser ? 'right' : 'left'
                    }}
                >
                    {message.timestamp ? new Date(message.timestamp).toLocaleTimeString() : ''}
                </Typography>
            </Paper>
        </Box>
    );
};

export default MessageBubble;
