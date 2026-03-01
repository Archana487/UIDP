import axios from 'axios';

// In production, VITE_API_URL environment variable (set on Vercel) takes priority.
// Fallback is the hardcoded Render URL.
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://uidp.onrender.com/api' : 'http://localhost:5000/api');

console.log('[API] Connecting to:', API_BASE_URL);

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000, // 30s timeout to handle Render cold starts
});

export const assetService = {
    getAll: (params) => api.get('/assets', { params }),
    getById: (id) => api.get(`/assets/${id}`),
    create: (data) => api.post('/assets', data),
    update: (id, data) => api.put(`/assets/${id}`, data),
    delete: (id) => api.delete(`/assets/${id}`),
    getStats: () => api.get('/assets/stats'),
};

export const maintenanceService = {
    getAll: () => api.get('/maintenance'),
    add: (data) => api.post('/maintenance', data),
    getHistory: (assetId) => api.get(`/maintenance/${assetId}`),
    updateStatus: (id, status) => api.put(`/maintenance/${id}/status`, { issue_status: status })
};

export const authService = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
};

export default api;
