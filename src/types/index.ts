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
  Nickname?: string;
  CountryID: number;
  WindowOpen: string; // YYYY-MM-DD format
  RegTime?: string; // 账号注册日期
  Status: string;
  Usage: string;
  Remark?: string;
  Email?: string; // 邮箱
  DeviceNumber?: string; // 设备编号
  CreatedBy: number;
  created_by_username?: string; // 创建人用户名
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
  SpiderLastUpdateAt?: string;
  SpiderLastFailureAt?: string;
  IPStatus?: number; // 更新状态：1=成功，0=失败
  LastProxy?: string; // 代理IP地址
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
  email?: string; // 邮箱
  device_number?: string; // 设备编号
}

export interface UpdateTikTokAccountParams {
  country_id?: number;
  window_open?: string; // YYYY-MM-DD format
  status?: string;
  usage?: string;
  remark?: string;
  email?: string; // 邮箱
  device_number?: string; // 设备编号
}

export interface TikTokAccountQueryParams extends PaginationParams {
  account_name?: string;
  status?: string;
  usage?: string;
  email?: string; // 邮箱搜索
  created_at_start?: string; // YYYY-MM-DD format
  created_at_end?: string; // YYYY-MM-DD format
  sort_by?: string;
  order?: string;
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

// User Info types
export interface UserInfo {
  id: number;
  username: string;
  role: 'admin' | 'operator';
  group_id: number;
  group_name: string;
}

// Dashboard Stats types
export interface DashboardStats {
  total_accounts: number;
  total_fans: number;
  total_videos: number;
  healthy_accounts: number;
  unhealthy_accounts: number;
  health_rate: number;
  status_stats: {
    [status: string]: {
      count: number;
    };
  };
}