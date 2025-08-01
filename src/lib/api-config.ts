import { getSession } from 'next-auth/react';

// API基础URL - 使用环境变量，支持Vercel部署
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://udb.luocompany.net';

// API端点配置
export const API_ENDPOINTS = {
  USERS: {
    ME: `${API_BASE_URL}/users/me`,
    CHANGE_PASSWORD: `${API_BASE_URL}/users/change-password`,
    LIST: `${API_BASE_URL}/api/admin/users`,
    CREATE: `${API_BASE_URL}/api/admin/users`,
    GET: (id: string) => `${API_BASE_URL}/api/admin/users/${id}`,
    UPDATE: (id: string) => `${API_BASE_URL}/api/admin/users/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/api/admin/users/${id}`,
    PERMISSIONS: (id: string) => `${API_BASE_URL}/api/admin/users/${id}/permissions`,
    BATCH_PERMISSIONS: (id: string) => `${API_BASE_URL}/api/admin/users/${id}/permissions/batch`,
  },
  
  AUTH: {
    SIGNOUT: `${API_BASE_URL}/api/auth/signout`,
  },
  
  // 其他API
  GENERATE: `${API_BASE_URL}/generate`,
};

// 获取NextAuth session
export async function getNextAuthSession() {
  try {
    if (typeof window !== 'undefined') {
      const session = await getSession();
      return session;
    }
    return null;
  } catch (error) {
    return null;
  }
}

// 通用API请求函数
export async function apiRequest(
  url: string, 
  options: RequestInit = {}
): Promise<Response> {
  // 获取NextAuth session
  const session = await getNextAuthSession();

  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // 如果有session，添加认证头
  if (session?.user) {
    // 使用session中的用户信息作为认证
    defaultOptions.headers = {
      ...defaultOptions.headers,
      'X-User-ID': session.user.id || session.user.username || '',
      'X-User-Name': session.user.username || session.user.name || '',
      'X-User-Admin': session.user.isAdmin ? 'true' : 'false',
    };
  }

  return fetch(url, defaultOptions);
}

// 带错误处理的API请求
export async function apiRequestWithError(
  url: string, 
  options: RequestInit = {}
): Promise<any> {
  const response = await apiRequest(url, options);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
} 