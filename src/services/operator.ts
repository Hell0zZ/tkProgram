import request from '@/utils/request';
import type {
  TikTokAccount,
  CreateTikTokAccountParams,
  UpdateTikTokAccountParams,
  TikTokAccountQueryParams,
  AccountMetrics,
  PaginatedResponse,
  ApiResponse,
  UserInfo,
  DashboardStats,
} from '@/types';

// TikTok Account APIs
export const createTikTokAccount = async (params: CreateTikTokAccountParams): Promise<ApiResponse<TikTokAccount>> => {
  return request.post('/api/account', params);
};

export const getTikTokAccounts = async (params: TikTokAccountQueryParams): Promise<ApiResponse<PaginatedResponse<TikTokAccount>>> => {
  const { page, pageSize, ...rest } = params;
  console.log('getTikTokAccounts API调用:', { page, pageSize, rest });
  return request.get('/api/account', {
    params: {
      page,
      page_size: pageSize,
      ...rest
    }
  });
};

export const updateTikTokAccount = async (id: number, params: UpdateTikTokAccountParams): Promise<ApiResponse<TikTokAccount>> => {
  console.log('updateTikTokAccount 调用:', {
    id,
    params,
    device_id: params.device_id,
    device_id_type: typeof params.device_id,
    has_device_id: 'device_id' in params,
    params_keys: Object.keys(params)
  });
  return request.put(`/api/account/${id}`, params);
};

export const deleteTikTokAccount = async (id: number): Promise<ApiResponse<{ deleted_id: number }>> => {
  return request.delete(`/api/account/${id}`);
};

// Account Metrics APIs
export const getAccountMetrics = async (accountId: number): Promise<ApiResponse<AccountMetrics>> => {
  return request.get('/api/account/metrics', {
    params: {
      account_id: accountId
    }
  });
};

// User Info APIs
export const getCurrentUserInfo = async (): Promise<ApiResponse<UserInfo>> => {
  return request.get('/api/user/info');
};

// Dashboard Stats APIs
export const getDashboardStats = async (): Promise<ApiResponse<DashboardStats>> => {
  return request.get('/api/account/dashboard/stats');
};