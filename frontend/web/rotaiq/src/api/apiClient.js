// src/api/apiClient.js

import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const apiClient = axios.create({
    baseURL: 'http://127.0.0.1:8000/',
});

apiClient.interceptors.request.use(
    async (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        
        // This check is crucial to prevent the TypeError
        if (error.response && error.response.status === 401 && originalRequest.url !== 'api/token/' && originalRequest.url !== 'api/token/refresh/') {
            const refreshToken = localStorage.getItem('refresh');
            if (refreshToken) {
                try {
                    // Use a relative URL here instead of a hardcoded one
                    const response = await apiClient.post('api/token/refresh/', {
                        refresh: refreshToken
                    });
                    const newToken = response.data.access;
                    localStorage.setItem('token', newToken);
                    apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
                    return apiClient(originalRequest);
                } catch (refreshError) {
                    console.error("Token refresh failed:", refreshError);
                    localStorage.clear();
                    window.location.href = '/login';
                    return Promise.reject(refreshError);
                }
            } else {
                localStorage.clear();
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;