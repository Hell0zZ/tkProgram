import request from '@/utils/request';
import type { Country, ApiResponse } from '@/types';

// Common APIs
export const getCountries = async (): Promise<ApiResponse<Country[]>> => {
  return request.get('/api/countries');
}; 