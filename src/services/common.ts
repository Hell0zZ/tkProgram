import request from '@/utils/request';
import type { Country, ApiResponse } from '@/types';

// Common APIs
export const getCountries = async (retryCount = 3): Promise<ApiResponse<Country[]>> => {
  console.log('准备调用 /api/countries 接口');
  console.log('当前token:', localStorage.getItem('token'));
  
  for (let i = 0; i < retryCount; i++) {
    try {
      const result: ApiResponse<Country[]> = await request.get('/api/countries');
      console.log(`/api/countries 调用成功 (第${i + 1}次尝试):`, result);
      return result;
    } catch (error: any) {
      console.warn(`/api/countries 调用失败 (第${i + 1}次尝试):`, error);
      
      // 如果是最后一次尝试，或者不是500错误，直接抛出
      if (i === retryCount - 1 || (error.response && error.response.status !== 500)) {
        throw error;
      }
      
      // 等待一段时间后重试
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  
  throw new Error('重试次数已用完');
}; 