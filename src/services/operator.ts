import request from '@/utils/request';
import type {
  TikTokAccount,
  CreateTikTokAccountParams,
  UpdateTikTokAccountParams,
  TikTokAccountQueryParams,
  AccountMetrics,
  PaginatedResponse,
  ApiResponse,
} from '@/types';

// TikTok Account APIs
export const createTikTokAccount = async (params: CreateTikTokAccountParams): Promise<ApiResponse<TikTokAccount>> => {
  return request.post('/api/account', params);
};

export const getTikTokAccounts = async (params: TikTokAccountQueryParams): Promise<ApiResponse<PaginatedResponse<TikTokAccount>>> => {
  const { page, pageSize, ...rest } = params;
  return request.get('/api/account', {
    params: {
      page,
      page_size: pageSize,
      ...rest
    }
  });
};

export const updateTikTokAccount = async (id: number, params: UpdateTikTokAccountParams): Promise<ApiResponse<TikTokAccount>> => {
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