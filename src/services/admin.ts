import request from '@/utils/request';
import type {
  Group,
  CreateGroupParams,
  Operator,
  CreateOperatorParams,
  UpdateOperatorParams,
  Proxy,
  CreateProxyParams,
  PaginationParams,
  PaginatedResponse,
  ApiResponse,
  TikTokAccount,
  CreateTikTokAccountParams,
  UpdateTikTokAccountParams,
  TikTokAccountQueryParams,
  AccountMetrics,
  DashboardStats,
} from '@/types';

// Group APIs
export const createGroup = async (params: CreateGroupParams): Promise<ApiResponse<Group>> => {
  return request.post('/api/admin/groups', params);
};

// 分页查询分组列表
export const getGroups = async (params: PaginationParams & { name?: string }): Promise<ApiResponse<PaginatedResponse<Group>>> => {
  const { page, pageSize, ...rest } = params;
  return request.get('/api/admin/groups', {
    params: {
      page,
      page_size: pageSize,
      ...rest
    }
  });
};

// 查询所有分组（无分页）
export const getAllGroups = async (params?: { name?: string }): Promise<ApiResponse<Group[]>> => {
  return request.post('/api/admin/groups/list', params || {});
};

export const updateGroup = async (id: number, params: CreateGroupParams): Promise<ApiResponse<Group>> => {
  return request.put(`/api/admin/groups/${id}`, params);
};

export const deleteGroup = async (id: number): Promise<ApiResponse<null>> => {
  return request.delete(`/api/admin/groups/${id}`);
};

// Operator APIs
export const createOperator = async (params: CreateOperatorParams): Promise<ApiResponse<Operator>> => {
  const { username, password, groupId } = params;
  return request.post('/api/admin/operators', {
    username,
    password,
    group_id: groupId
  });
};

export const getOperators = async (params: PaginationParams): Promise<ApiResponse<PaginatedResponse<Operator>>> => {
  const { page, pageSize, ...rest } = params;
  return request.get('/api/admin/operators', {
    params: {
      page,
      page_size: pageSize,
      ...rest
    }
  });
};

export const updateOperator = async (id: number, params: UpdateOperatorParams): Promise<ApiResponse<Operator>> => {
  const { username, password, groupId } = params;
  
  // 构建请求数据
  const requestData: any = {
    username: username || "",
    group_id: Number(groupId) || 0
  };
  
  // 只有密码不为空时才发送密码字段，避免后端验证错误
  if (password !== undefined && password.trim() !== '') {
    requestData.password = password.trim();
  }
  
  console.log('UpdateOperator request data:', requestData);
  console.log('Request URL:', `/api/admin/operators/${id}`);
  
  return request.put(`/api/admin/operators/${id}`, requestData);
};

export const deleteOperator = async (id: number): Promise<ApiResponse<null>> => {
  return request.delete(`/api/admin/operators/${id}`);
};

// Proxy APIs
export const createProxy = async (params: CreateProxyParams): Promise<ApiResponse<Proxy>> => {
  return request.post('/api/admin/proxies', params);
};

export const getProxies = async (params: PaginationParams): Promise<ApiResponse<PaginatedResponse<Proxy>>> => {
  const { page, pageSize, ...rest } = params;
  return request.get('/api/admin/proxies', {
    params: {
      page,
      page_size: pageSize,
      ...rest
    }
  });
};

export const updateProxy = async (id: number, params: CreateProxyParams): Promise<ApiResponse<Proxy>> => {
  return request.put(`/api/admin/proxies/${id}`, params);
};

export const deleteProxy = async (id: number): Promise<ApiResponse<null>> => {
  return request.delete(`/api/admin/proxies/${id}`);
};

// TikTok Account APIs for Admin
export const createTikTokAccount = async (params: CreateTikTokAccountParams): Promise<ApiResponse<TikTokAccount>> => {
  return request.post('/api/admin/accounts', params);
};

export const getTikTokAccounts = async (params: TikTokAccountQueryParams): Promise<ApiResponse<PaginatedResponse<TikTokAccount>>> => {
  const { page, pageSize, ...rest } = params;
  console.log('Admin getTikTokAccounts API调用:', { page, pageSize, rest });
  return request.get('/api/admin/accounts', {
    params: {
      page,
      page_size: pageSize,
      ...rest
    }
  });
};

export const updateTikTokAccount = async (id: number, params: UpdateTikTokAccountParams): Promise<ApiResponse<TikTokAccount>> => {
  return request.put(`/api/admin/accounts/${id}`, params);
};

export const deleteTikTokAccount = async (id: number): Promise<ApiResponse<{ deleted_id: number }>> => {
  return request.delete(`/api/admin/accounts/${id}`);
};

// Account Metrics APIs for Admin
export const getAccountMetrics = async (accountId: number): Promise<ApiResponse<AccountMetrics>> => {
  return request.get('/api/admin/accounts/metrics', {
    params: {
      account_id: accountId
    }
  });
};

// Export API
export const exportAccounts = async () => {
  return request.get('/api/admin/export/accounts', { responseType: 'blob' });
};

// Dashboard Stats APIs
export const getDashboardStats = async (): Promise<ApiResponse<DashboardStats>> => {
  return request.get('/api/account/dashboard/stats');
}; 