import axios from 'axios';

// 创建axios实例，配置baseURL和withCredentials
export const apiClient = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: true, // 自动携带Cookie
  timeout: 30000, // 30秒超时
});

// 获取用户ID
const getUserId = (): string | null => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      return user.id || null;
    } catch (e) {
      return null;
    }
  }
  return null;
};

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 登录请求不需要携带X-User-Id
    const isLoginRequest = config.url?.includes('/api/v1/auth/login');
    
    if (!isLoginRequest) {
      const userId = getUserId();
      if (userId) {
        config.headers = config.headers || {};
        config.headers['X-User-Id'] = userId;
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
    // 处理响应错误
    if (error.response) {
      // 服务器返回错误状态码
      switch (error.response.status) {
        case 401:
          // 未授权，清除Cookie并重定向到登录页
          clearAuthCookie();
          window.location.href = '/login';
          break;
        case 403:
          // 禁止访问
          console.error('Forbidden:', error.response.data);
          break;
        default:
          console.error('API Error:', error.response.data);
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      console.error('Network Error:', error.request);
    } else {
      // 设置请求时发生的错误
      console.error('Request Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Cookie管理工具函数
export const setAuthCookie = (name: string, value: string, days: number = 7) => {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value}; ${expires}; path=/; secure; SameSite=Strict`;
};

export const getAuthCookie = (name: string): string | null => {
  const cookieName = `${name}=`;
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookieArray = decodedCookie.split(';');
  
  for (let i = 0; i < cookieArray.length; i++) {
    let cookie = cookieArray[i];
    while (cookie.charAt(0) === ' ') {
      cookie = cookie.substring(1);
    }
    if (cookie.indexOf(cookieName) === 0) {
      return cookie.substring(cookieName.length, cookie.length);
    }
  }
  return null;
};

export const clearAuthCookie = () => {
  // 清除所有认证相关的Cookie
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i];
    const eqPos = cookie.indexOf('=');
    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }
};

// 检查是否已登录
export const isLoggedIn = (): boolean => {
  // 检查是否存在认证Cookie（根据后端返回的Cookie名称调整）
  const authCookie = getAuthCookie('session');
  return authCookie !== null;
};

export default apiClient;