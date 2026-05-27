import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.error || error.message || 'API Error';
    return Promise.reject(new Error(message));
  }
);

// Products API
export const productsApi = {
  getAll: (params = {}) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.patch(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  scan: (count = 10) => api.post('/products/scan', { count }),
};

// AI API
export const aiApi = {
  score: (productId, productData) => api.post('/ai/score', { productId, productData }),
  describe: (productId, platform) => api.post('/ai/describe', { productId, platform }),
  analyze: (productId) => api.post('/ai/analyze', { productId }),
  chat: (messages, message) => api.post('/ai/chat', { messages, message }),
};

// Dashboard API
export const dashboardApi = {
  getStats: () => api.get('/admin/dashboard'),
};

export default api;
