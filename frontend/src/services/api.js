import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Request interceptor: attach Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('usj_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('usj_token');
      localStorage.removeItem('usj_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

export const get = (url, params = {}) => api.get(url, { params });
export const post = (url, data) => api.post(url, data);
export const put = (url, data) => api.put(url, data);
export const del = (url) => api.delete(url);
export const postForm = (url, data) => api.post(url, data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const putForm = (url, data) => api.put(url, data, { headers: { 'Content-Type': 'multipart/form-data' } });
