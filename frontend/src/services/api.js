import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

export const getAgents = () => api.get('/agents');
export const getAgent = (id) => api.get(`/agents/${id}`);
export const createAgent = (data) => api.post('/agents', data);
export const updateAgent = (id, data) => api.put(`/agents/${id}`, data);
export const deleteAgent = (id) => api.delete(`/agents/${id}`);

export const getGeneralConversation = () => api.get('/conversations/general');
export const getAgentConversation = (agentId) => api.get(`/conversations/agent/${agentId}`);
export const getRecentConversations = () => api.get('/conversations/recent');
export const saveMessage = (payload) => api.post('/conversations/message', payload);

export const getLogs = (params) => api.get('/logs', { params });
export const clearLogs = (olderThanDays) => api.delete('/logs', { params: { olderThanDays } });

export const getDashboardStats = () => api.get('/stats/dashboard');
export const getHealth = () => api.get('/stats/health');

export default api;
