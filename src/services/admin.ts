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
  return request.put(`/api/admin/operators/${id}`, {
    username,
    password,
    group_id: groupId
  });
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

// Export API
export const exportAccounts = async () => {
  return request.get('/api/admin/export/accounts', { responseType: 'blob' });
}; 