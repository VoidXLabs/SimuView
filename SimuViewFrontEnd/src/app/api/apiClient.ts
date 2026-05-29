import axios from 'axios';

// 创建axios实例，配置baseURL
export const apiClient = axios.create({
  baseURL: '',
  timeout: 30000, // 30秒超时
});

// 获取 JWT token
const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 登录和注册请求不需要携带 token
    const isAuthRequest = config.url?.includes('/api/v1/user/login') ||
                          config.url?.includes('/api/v1/user/register');

    if (!isAuthRequest) {
      const token = getToken();
      if (token) {
        // 使用后端配置的 token-name 请求头
        config.headers['token'] = token;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // 未授权，清除 token 并重定向到登录页
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          break;
        case 403:
          console.error('Forbidden:', error.response.data);
          break;
        default:
          console.error('API Error:', error.response.data);
      }
    } else if (error.request) {
      console.error('Network Error:', error.request);
    } else {
      console.error('Request Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
