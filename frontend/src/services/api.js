import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
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
