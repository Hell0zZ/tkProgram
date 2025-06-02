import axios, { InternalAxiosRequestConfig } from 'axios';
import { message } from 'antd';

// Create axios instance with basic configuration
const request = axios.create({
  baseURL: '',  // Use relative path
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add token to all requests except login
    if (!config.url?.includes('/api/auth/login')) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.set('Authorization', `Bearer ${token}`);
      } else {
        // If token is required but not found, redirect to login
        message.error('登录已过期，请重新登录');
        window.location.href = '/login';
        return Promise.reject('No token found');
      }
    }

    console.log('Request:', {
      url: config.url,
      method: config.method,
      data: config.data,
      headers: config.headers
    });

    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor
request.interceptors.response.use(
  (response) => {
    const data = response.data;
    
    // Handle successful response
    if (data.Code === 0) {
      return data;  // Return response.data directly
    }
    
    // Handle business logic errors
    if (data.Code === 401 || data.Code === 403) {
      localStorage.removeItem('token');
      message.error('登录已过期，请重新登录');
      window.location.href = '/login';
      return Promise.reject(data);
    }
    
    message.error(data.Message || '请求失败');
    return Promise.reject(data);
  },
  (error) => {
    console.error('Response error:', error);
    
    // Handle HTTP errors
    if (error.response) {
      switch (error.response.status) {
        case 401:
        case 403:
          localStorage.removeItem('token');
          message.error('登录已过期，请重新登录');
          window.location.href = '/login';
          break;
        case 404:
          message.error('请求的资源不存在');
          break;
        case 500:
          message.error('服务器错误');
          break;
        default:
          message.error(error.response.data?.Message || '网络错误');
      }
    } else if (error.request) {
      message.error('网络连接失败，请检查网络');
    } else {
      message.error('请求发送失败');
    }
    
    return Promise.reject(error);
  }
);

export default request; 