import axios from 'axios';
import { useAuthStore } from '@/store/useAuthStore';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor to add JWT Token
apiClient.interceptors.request.use(
  (config) => {
    // Avoid adding token to login and refresh endpoints to prevent loops
    if (config.url?.includes('/auth/login/') || config.url?.includes('/auth/token/refresh/')) {
      return config;
    }

    const token = typeof window !== 'undefined' ? useAuthStore.getState().accessToken : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor to handle 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Don't retry if the request itself was the refresh call
    if (originalRequest.url?.includes('/auth/token/refresh/')) {
      useAuthStore.getState().clearAuth();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = typeof window !== 'undefined' ? useAuthStore.getState().refreshToken : null;
        if (!refreshToken) throw new Error('No refresh token available');

        const response = await axios.post(`${apiClient.defaults.baseURL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });
        
        const { access, refresh } = response.data;
        useAuthStore.getState().setAccessToken(access);
        if (refresh) {
          useAuthStore.getState().setRefreshToken(refresh);
        }
        
        return apiClient(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().clearAuth();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
