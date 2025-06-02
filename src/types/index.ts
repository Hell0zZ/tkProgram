// Group types
export interface Group {
  ID: number;
  Name: string;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
}

export interface CreateGroupParams {
  name: string;
}

// Operator types
export interface Operator {
  ID: number;
  Username: string;
  Role: 'operator' | 'admin';
  GroupID: number;
  Group?: Group;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
}

export interface CreateOperatorParams {
  username: string;
  password: string;
  role: 'operator';
  groupId: number;
}

export interface UpdateOperatorParams {
  username?: string;
  password?: string;
  groupId?: number;
}

// Proxy types
export interface Proxy {
  ID: number;
  Country: string;
  Host: string;
  Port: number;
  Username?: string;
  Password?: string;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
}

export interface CreateProxyParams {
  country: string;
  host: string;
  port: number;
  username?: string;
  password?: string;
}

// Country types
export interface Country {
  ID: number;
  Name: string;
}

// TikTok Account types
export interface TikTokAccount {
  ID: number;
  AccountName: string;
  CountryID: number;
  WindowOpen: string; // YYYY-MM-DD format
  Status: string;
  Usage: string;
  Remark?: string;
  CreatedBy: number;
  TodayFans: number;
  TodayVideos: number;
  FansDiff1: number;
  FansDiff3: number;
  FansDiff7: number;
  FansDiff30: number;
  VideosDiff1: number;
  VideosDiff3: number;
  VideosDiff7: number;
  VideosDiff30: number;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface CreateTikTokAccountParams {
  account_name: string;
  country_id: number;
  window_open: string; // YYYY-MM-DD format
  status: string;
  usage: string;
  remark?: string;
}

export interface UpdateTikTokAccountParams {
  country_id?: number;
  window_open?: string; // YYYY-MM-DD format
  status?: string;
  usage?: string;
  remark?: string;
}

export interface TikTokAccountQueryParams extends PaginationParams {
  account_name?: string;
  status?: string;
  usage?: string;
  created_at_start?: string; // YYYY-MM-DD format
  created_at_end?: string; // YYYY-MM-DD format
}

// Account Metrics types
export interface AccountMetrics {
  today_fans: number;
  today_videos: number;
  fans_diff_1: number;
  fans_diff_3: number;
  fans_diff_7: number;
  fans_diff_30: number;
  videos_diff_1: number;
  videos_diff_3: number;
  videos_diff_7: number;
  videos_diff_30: number;
}

// Common types
export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// API Response type
export interface ApiResponse<T = any> {
  Code: number;
  Message: string;
  Data: T;
} 