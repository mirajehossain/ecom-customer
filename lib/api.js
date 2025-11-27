import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  logout: () => api.post('/auth/logout'),
};

export const productsAPI = {
  getAll: (params) => api.get('/products', { params }).then(res => res.data),
  getById: (id) => api.get(`/products/${id}`).then(res => res.data),
};

export const categoriesAPI = {
  getAll: () => api.get('/categories').then(res => res.data),
  getById: (id) => api.get(`/categories/${id}`).then(res => res.data),
};

export const cartAPI = {
  get: () => api.get('/cart').then(res => res.data),
  add: (data) => api.post('/cart', data).then(res => res.data),
  remove: (id) => api.delete(`/cart/${id}`).then(res => res.data),
  update: (id, data) => api.put(`/cart/${id}`, data).then(res => res.data),
};

export const ordersAPI = {
  create: (data) => api.post('/orders', data).then(res => res.data),
  getAll: () => api.get('/orders').then(res => res.data),
  getById: (id) => api.get(`/orders/${id}`).then(res => res.data),
};

export default api;