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
    
    // 兼容大小写字段名格式
    const code = data.Code ?? data.code;
    const msg = data.Message ?? data.message;
    const responseData = data.Data ?? data.data;
    
    // Handle successful response
    if (code === 0) {
      // 统一返回大写格式，保持与TypeScript类型一致
      return {
        Code: code,
        Message: msg || 'success',
        Data: responseData
      } as any;
    }
    
    // Handle business logic errors
    if (code === 401 || code === 403) {
      localStorage.removeItem('token');
      message.error('登录已过期，请重新登录');
      window.location.href = '/login';
      return Promise.reject(data);
    }
    
    message.error(msg || '请求失败');
    return Promise.reject(data);
  },
  (error) => {
    console.error('Response error:', error);
    
    // 如果是countries接口的错误，静默处理，不显示错误提示
    if (error.config && error.config.url && error.config.url.includes('countries')) {
      console.warn('Countries API error (silently handled):', error);
      return Promise.reject(error);
    }
    
    // 如果是管理员访问账号相关API的权限错误，静默处理，不退出登录
    if (error.config && error.config.url && 
        (error.config.url.includes('/api/account') || error.config.url.includes('/api/user/info')) &&
        error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.warn('Admin account API permission error (silently handled):', error);
      return Promise.reject(error);
    }
    
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