export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

export const API_ENDPOINTS = {
  OPERATORS: `${API_BASE_URL}/api/admin/operators`,
  GROUPS: `${API_BASE_URL}/api/admin/groups`,
}; 