import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert,
  Snackbar,
  Paper
} from '@mui/material';
import {
  GitHub as GitHubIcon,
  ShoppingCart as ShopifyIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  SmartToy as CustomIcon,
  Create as CreateIcon,
  CheckCircle as CheckIcon,
  Info as InfoIcon,
  PlayArrow as TestIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AgentTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [configDialog, setConfigDialog] = useState(false);
  const [guideDialog, setGuideDialog] = useState(false);
  const [formData, setFormData] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  const defaultTemplates = [
    {
      name: 'GitHub Assistant',
      type: 'github',
      description: 'Manage GitHub repositories, pull requests, issues, and code reviews. Can summarize PRs, create issues, and manage repository workflows.',
      icon: <GitHubIcon />,
      color: '#333',
      capabilities: [
        'Summarize pull requests',
        'Create and manage issues',
        'Review code changes',
        'Manage repository settings',
        'Generate release notes'
      ],
      useCases: [
        'Automated PR reviews',
        'Issue management',
        'Release automation',
        'Code quality checks'
      ]
    },
    {
      name: 'Email Manager',
      type: 'email',
      description: 'Send emails, manage inbox, schedule email campaigns, and automate email responses.',
      icon: <EmailIcon />,
      color: '#1976d2',
      capabilities: [
        'Send automated emails',
        'Manage email templates',
        'Schedule email campaigns',
        'Parse and categorize emails',
        'Generate email reports'
      ],
      useCases: [
        'Customer support automation',
        'Marketing campaigns',
        'Newsletter management',
        'Email scheduling'
      ]
    },
    {
      name: 'Calendar Coordinator',
      type: 'calendar',
      description: 'Schedule meetings, manage calendar events, send meeting invites, and handle calendar conflicts.',
      icon: <CalendarIcon />,
      color: '#388e3c',
      capabilities: [
        'Schedule meetings',
        'Manage calendar events',
        'Send meeting invitations',
        'Handle scheduling conflicts',
        'Generate meeting summaries'
      ],
      useCases: [
        'Meeting coordination',
        'Event planning',
        'Schedule optimization',
        'Automated reminders'
      ]
    },
    {
      name: 'E-commerce Assistant',
      type: 'shopify',
      description: 'Manage Shopify store operations, handle orders, update inventory, and analyze sales data.',
      icon: <ShopifyIcon />,
      color: '#7c4dff',
      capabilities: [
        'Manage product inventory',
        'Process orders',
        'Handle customer inquiries',
        'Generate sales reports',
        'Update product information'
      ],
      useCases: [
        'Order management',
        'Inventory tracking',
        'Customer service',
        'Sales analytics'
      ]
    },
    {
      name: 'Content Creator',
      type: 'custom',
      description: 'Generate blog posts, social media content, marketing copy, and documentation.',
      icon: <CustomIcon />,
      color: '#ff5722',
      capabilities: [
        'Generate blog posts',
        'Create social media content',
        'Write marketing copy',
        'Generate documentation',
        'Proofread and edit content'
      ],
      useCases: [
        'Content marketing',
        'Social media management',
        'Documentation writing',
        'Copy editing'
      ]
    },
    {
      name: 'Data Analyst',
      type: 'custom',
      description: 'Analyze data, generate reports, create visualizations, and provide business insights.',
      icon: <CustomIcon />,
      color: '#795548',
      capabilities: [
        'Analyze datasets',
        'Generate reports',
        'Create data visualizations',
        'Provide business insights',
        'Automate data processing'
      ],
      useCases: [
        'Business intelligence',
        'Data reporting',
        'Trend analysis',
        'Performance metrics'
      ]
    }
  ];

  useEffect(() => {
    setTemplates(defaultTemplates);
  }, []);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCreateFromTemplate = (template) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      description: template.description,
      type: template.type
    });
    setConfigDialog(true);
  };

  const handleShowGuide = (template) => {
    setSelectedTemplate(template);
    setGuideDialog(true);
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/agents', {
        name: formData.name,
        type: formData.type,
        description: formData.description,
        configuration: new Map(),
        status: 'active'
      });

      showSnackbar('Agent created successfully! You can now configure it.');
      setConfigDialog(false);
      navigate('/agents');
    } catch (error) {
      console.error('Error creating agent:', error);
      showSnackbar('Error creating agent', 'error');
    }
  };

  const getConfigurationSteps = (type) => {
    const steps = {
      github: [
        'Go to GitHub Settings > Developer settings > Personal access tokens',
        'Generate a new token with repo, issues, and pull_requests scopes',
        'Copy the token and configure it in the agent settings',
        'Test the connection by asking the agent to summarize a PR'
      ],
      email: [
        'Enable 2-factor authentication on your email account',
        'Generate an app-specific password',
        'Configure email settings in the agent',
        'Test by sending a sample email'
      ],
      calendar: [
        'Set up Google Cloud Console project',
        'Enable Calendar API',
        'Create service account credentials',
        'Configure the JSON credentials in the agent'
      ],
      shopify: [
        'Access your Shopify admin panel',
        'Create a private app',
        'Copy API credentials',
        'Configure the agent with your store details'
      ],
      custom: [
        'Define your custom agent requirements',
        'Configure any necessary API keys',
        'Set up custom prompts and behaviors',
        'Test the agent functionality'
      ]
    };
    return steps[type] || [];
  };

  const TemplateCard = ({ template }) => (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar 
            sx={{ 
              bgcolor: template.color, 
              mr: 2,
              width: 56,
              height: 56
            }}
          >
            {template.icon}
          </Avatar>
          <Box>
            <Typography variant="h6" component="h2">
              {template.name}
            </Typography>
            <Chip 
              label={template.type.toUpperCase()} 
              size="small" 
              color="primary" 
              variant="outlined"
            />
          </Box>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {template.description}
        </Typography>

        <Typography variant="subtitle2" gutterBottom>
          Capabilities:
        </Typography>
        <Box sx={{ mb: 2 }}>
          {template.capabilities.slice(0, 3).map((capability, index) => (
            <Chip 
              key={index}
              label={capability} 
              size="small" 
              sx={{ mr: 0.5, mb: 0.5 }}
              variant="outlined"
            />
          ))}
          {template.capabilities.length > 3 && (
            <Chip 
              label={`+${template.capabilities.length - 3} more`} 
              size="small" 
              color="secondary"
              variant="outlined"
            />
          )}
        </Box>

        <Typography variant="subtitle2" gutterBottom>
          Use Cases:
        </Typography>
        <List dense>
          {template.useCases.slice(0, 2).map((useCase, index) => (
            <ListItem key={index} sx={{ py: 0, px: 0 }}>
              <ListItemIcon sx={{ minWidth: 20 }}>
                <CheckIcon sx={{ fontSize: 16, color: 'success.main' }} />
              </ListItemIcon>
              <ListItemText 
                primary={useCase} 
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>

      <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
        <Button
          startIcon={<InfoIcon />}
          onClick={() => handleShowGuide(template)}
          size="small"
        >
          Setup Guide
        </Button>
        <Button
          variant="contained"
          startIcon={<CreateIcon />}
          onClick={() => handleCreateFromTemplate(template)}
        >
          Create Agent
        </Button>
      </CardActions>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Agent Templates
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Get started quickly with pre-configured agents for common tasks
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {templates.map((template, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <TemplateCard template={template} />
          </Grid>
        ))}
      </Grid>

      {/* Configuration Dialog */}
      <Dialog open={configDialog} onClose={() => setConfigDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Agent from Template</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            This will create a new agent based on the selected template. You can configure it after creation.
          </Alert>
          <TextField
            fullWidth
            label="Agent Name"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Description"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            margin="normal"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfigDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">Create Agent</Button>
        </DialogActions>
      </Dialog>

      {/* Setup Guide Dialog */}
      <Dialog open={guideDialog} onClose={() => setGuideDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Setup Guide: {selectedTemplate?.name}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Follow these steps to configure your {selectedTemplate?.name}:
          </Typography>
          
          <Stepper orientation="vertical">
            {getConfigurationSteps(selectedTemplate?.type).map((step, index) => (
              <Step key={index} active>
                <StepLabel>{`Step ${index + 1}`}</StepLabel>
                <StepContent>
                  <Typography variant="body2">{step}</Typography>
                </StepContent>
              </Step>
            ))}
          </Stepper>

          <Paper sx={{ p: 2, mt: 2, bgcolor: 'grey.50' }}>
            <Typography variant="subtitle2" gutterBottom>
              💡 Pro Tip:
            </Typography>
            <Typography variant="body2">
              After creating the agent, you can test it by asking: 
              <em>"{selectedTemplate?.type === 'github' ? 'Summarize the latest PR in microsoft/vscode' : 
                   selectedTemplate?.type === 'email' ? 'Send a test email to myself' :
                   selectedTemplate?.type === 'calendar' ? 'List my meetings for today' :
                   selectedTemplate?.type === 'shopify' ? 'Show me the latest orders' :
                   'Help me get started'}"</em>
            </Typography>
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGuideDialog(false)}>Close</Button>
          <Button 
            variant="contained" 
            onClick={() => {
              setGuideDialog(false);
              handleCreateFromTemplate(selectedTemplate);
            }}
          >
            Create Agent
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
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

export default AgentTemplates; 