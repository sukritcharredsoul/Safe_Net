import api from './axios';

// Auth
export const signup = (data) => api.post('/api/v1/auth/signup', data);
export const login = (data) => api.post('/api/v1/auth/login', data);
export const forgotPassword = (email) => api.post('/api/v1/auth/forgotPassword', { email });
export const verifyEmail = (token) => api.get(`/api/v1/auth/verify-email/${token}`);

// Activity
export const getRecentActivity = () => api.get('/api/v1/recent');

// Breach
export const checkBreach = (email) => api.get('/api/v1/breach', { params: { email } });

// Scans
export const scanFile = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/api/v1/file', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const scanUrl = (url) => api.post('/api/v1/url', { url });
export const getUrlReport = (id) => api.get('/api/v1/url/report', { params: { id } });
export const getDomainReport = (domain) => api.get('/api/v1/domain', { params: { domain } });
export const getIpReport = (ip) => api.get('/api/v1/ip', { params: { ip } });

// Health
export const getHealth = () => api.get('/api/v1/health');
