import api from '../api/axiosConfig';

export const aiService = {
  getStatus: async () => {
    const response = await api.get('/ai/status');
    return response.data;
  },

  enhanceTask: async (title, description = '') => {
    const response = await api.post('/ai/enhance', { title, description });
    return response.data;
  },

  breakdownTask: async (title, description = '') => {
    const response = await api.post('/ai/breakdown', { title, description });
    return response.data;
  },

  getDailyBriefing: async () => {
    const response = await api.get('/ai/briefing');
    return response.data;
  },

  chat: async (message) => {
    const response = await api.post('/ai/chat', { message });
    return response.data;
  }
};
