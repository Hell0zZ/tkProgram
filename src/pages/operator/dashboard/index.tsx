import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Button,
  Table,
  Tag,
  Typography,
  Divider,
  Progress,
  Space,
} from 'antd';
import {
  UserOutlined,
  VideoCameraOutlined,
  RiseOutlined,
  PlusOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { TikTokAccount, Country, DashboardStats } from '@/types';
import * as operatorService from '@/services/operator';
import * as commonService from '@/services/common';

const { Title, Paragraph } = Typography;

const OperatorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<{
    username: string;
    groupName: string;
  }>({ username: '未知用户', groupName: '未知组' });
  const [stats, setStats] = useState({
    totalAccounts: 0,
    normalAccounts: 0,
    bannedAccounts: 0,
    restrictedAccounts: 0,
    shouChuAccounts: 0,
    totalFans: 0,
    totalVideos: 0,
  });
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [recentAccounts, setRecentAccounts] = useState<TikTokAccount[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);

  const loadUserInfo = async () => {
    try {
      console.log('开始获取用户信息...');
      
      // 尝试从API获取用户信息
      try {
        const response = await operatorService.getCurrentUserInfo();
        console.log('用户信息API响应:', response);
        
        if (response.Code === 0 && response.Data) {
          const userData = response.Data;
          const username = userData.username || '未知用户';
          const groupName = userData.group_name || '未知组';
          
          setUserInfo({
            username,
            groupName
          });
          
          // 同时保存到localStorage以备后用
          localStorage.setItem('username', username);
          localStorage.setItem('groupName', groupName);
          if (userData.group_id) {
            localStorage.setItem('groupId', userData.group_id.toString());
          }
          
          console.log('用户信息设置成功:', { username, groupName, groupId: userData.group_id });
          return;
        } else {
          console.warn('用户信息API返回错误:', response.Message);
        }
      } catch (apiError) {
        console.warn('用户信息API调用失败，使用fallback数据:', apiError);
      }
      
      // API失败时的fallback逻辑
      const username = localStorage.getItem('username') || '未知用户';
      let groupName = localStorage.getItem('groupName');
      
      // 如果没有组信息，基于用户名生成模拟组信息
      if (!groupName) {
        if (username === 'operator') {
          groupName = 'A组';
        } else if (username === 'admin') {
          groupName = '管理组';
        } else {
          // 基于用户名首字母分组的简单逻辑
          const firstChar = username.charAt(0).toUpperCase();
          if (firstChar >= 'A' && firstChar <= 'H') {
            groupName = 'A组';
          } else if (firstChar >= 'I' && firstChar <= 'P') {
            groupName = 'B组';
          } else {
            groupName = 'C组';
          }
        }
      }
      
      setUserInfo({ username, groupName });
      console.log('使用fallback用户信息:', { username, groupName });
      
    } catch (error) {
      console.error('获取用户信息失败:', error);
      setUserInfo({ username: '未知用户', groupName: '未知组' });
    }
  };

  const loadDashboardStats = async () => {
    try {
      console.log('开始获取仪表板统计数据...');
      const response = await operatorService.getDashboardStats();
      console.log('仪表板统计数据API响应:', response);
      
      if (response.Code === 0 && response.Data) {
        setDashboardStats(response.Data);
        
        // 同时更新旧的 stats 结构以保持兼容性
        const newStats = {
          totalAccounts: response.Data.total_accounts,
          normalAccounts: response.Data.status_stats['养号']?.count || 0,
          bannedAccounts: response.Data.status_stats['封禁']?.count || 0,
          restrictedAccounts: response.Data.status_stats['异常']?.count || 0,
          shouChuAccounts: response.Data.status_stats['售出']?.count || 0,
          totalFans: response.Data.total_fans,
          totalVideos: response.Data.total_videos,
        };
        setStats(newStats);
        
        console.log('仪表板统计数据设置成功:', newStats);
      } else {
        console.warn('仪表板统计数据API返回错误:', response.Message);
        // API失败时使用原有的统计逻辑
        await loadStats();
      }
    } catch (error) {
      console.error('获取仪表板统计数据失败:', error);
      // API失败时使用原有的统计逻辑
      await loadStats();
    }
  };

  const loadStats = async () => {
    try {
      setLoading(true);
      
      console.log('开始加载运营控制台数据...');
      
      // 分别处理两个API调用
      let accountsRes;
      let countriesRes;
      
      try {
        console.log('正在调用账号API: /api/account');
        accountsRes = await operatorService.getTikTokAccounts({ page: 1, pageSize: 10 });
        console.log('账号API调用成功:', accountsRes);
      } catch (error) {
        console.error('账号API调用失败:', error);
        accountsRes = { Code: -1, Data: { items: [], total: 0 }, Message: '账号数据加载失败' };
      }
      
      // 尝试获取countries数据，但不让错误影响主功能
      try {
        console.log('正在调用国家API...');
        countriesRes = await commonService.getCountries();
        console.log('国家API调用成功:', countriesRes);
        
        // 兼容后端返回的小写字段名，统一转换为大写
        if (countriesRes.Code === 0 && countriesRes.Data) {
          const normalizedCountries = countriesRes.Data.map((country: any) => ({
            ID: country.ID || country.id,
            Name: country.Name || country.name,
          }));
          countriesRes.Data = normalizedCountries;
        }
      } catch (error) {
        console.warn('国家API调用失败，使用默认国家数据:', error);
        // 提供一些常用的默认国家数据
        countriesRes = {
          Code: 0,
          Data: [
            { ID: 1, Name: '美国' },
            { ID: 2, Name: '英国' },
            { ID: 3, Name: '日本' },
            { ID: 4, Name: '韩国' },
            { ID: 5, Name: '德国' },
            { ID: 6, Name: '法国' },
            { ID: 7, Name: '加拿大' },
            { ID: 8, Name: '澳大利亚' },
          ],
          Message: '使用默认国家数据'
        };
      }

      if (accountsRes.Code === 0) {
        const accounts = accountsRes.Data.items || [];
        
        // 兼容后端返回的小写字段名，统一转换为大写
        const normalizedAccounts = accounts.map((account: any) => ({
          ID: account.ID || account.id,
          AccountName: account.AccountName || account.account_name,
          CountryID: account.CountryID || account.country_id,
          WindowOpen: account.WindowOpen || account.window_open,
          RegTime: account.RegTime || account.reg_time,
          Status: account.Status || account.status || '未知',
          Usage: account.Usage || account.usage || '未知',
          CreatedBy: account.CreatedBy || account.created_by,
          TodayFans: account.TodayFans || account.today_fans || 0,
          TodayVideos: account.TodayVideos || account.today_videos || 0,
          FansDiff1: account.FansDiff1 || account.fans_diff_1 || 0,
          FansDiff3: account.FansDiff3 || account.fans_diff_3 || 0,
          FansDiff7: account.FansDiff7 || account.fans_diff_7 || 0,
          FansDiff30: account.FansDiff30 || account.fans_diff_30 || 0,
          VideosDiff1: account.VideosDiff1 || account.videos_diff_1 || 0,
          VideosDiff3: account.VideosDiff3 || account.videos_diff_3 || 0,
          VideosDiff7: account.VideosDiff7 || account.videos_diff_7 || 0,
          VideosDiff30: account.VideosDiff30 || account.videos_diff_30 || 0,
          SpiderLastUpdateAt: account.SpiderLastUpdateAt || account.spider_last_update_at,
          SpiderLastFailureAt: account.SpiderLastFailureAt || account.spider_last_failure_at,
          IPStatus: account.IPStatus || account.ip_status,
          LastProxy: account.LastProxy || account.last_proxy,
          CreatedAt: account.CreatedAt || account.created_at,
          UpdatedAt: account.UpdatedAt || account.updated_at || account.CreatedAt || account.created_at,
          Remark: account.Remark || account.remark,
        }));
        
        setRecentAccounts(normalizedAccounts);
        console.log('账号数据转换后:', normalizedAccounts);
        
        // 计算统计数据
        const totalAccounts = accountsRes.Data.total || 0;
        const yangHaoAccounts = normalizedAccounts.filter((acc: any) => acc.Status === '养号').length;
        const shouChuAccounts = normalizedAccounts.filter((acc: any) => acc.Status === '售出').length;
        const bannedAccounts = normalizedAccounts.filter((acc: any) => acc.Status === '封禁').length;
        const yiChangAccounts = normalizedAccounts.filter((acc: any) => acc.Status === '异常').length;
        const totalFans = normalizedAccounts.reduce((sum: number, acc: any) => sum + (acc.TodayFans || 0), 0);
        const totalVideos = normalizedAccounts.reduce((sum: number, acc: any) => sum + (acc.TodayVideos || 0), 0);

        setStats({
          totalAccounts,
          normalAccounts: yangHaoAccounts,
          bannedAccounts,
          restrictedAccounts: yiChangAccounts,
          shouChuAccounts,
          totalFans,
          totalVideos,
        });
        console.log('统计数据设置成功:', { totalAccounts, yangHaoAccounts, shouChuAccounts, bannedAccounts, yiChangAccounts, totalFans, totalVideos });
      } else {
        console.warn('Accounts API returned error:', accountsRes.Message);
        // 设置默认值，不显示错误
        setStats({
          totalAccounts: 0,
          normalAccounts: 0,
          bannedAccounts: 0,
          restrictedAccounts: 0,
          shouChuAccounts: 0,
          totalFans: 0,
          totalVideos: 0,
        });
        setRecentAccounts([]);
      }

      if (countriesRes.Code === 0) {
        setCountries(countriesRes.Data);
        console.log('国家数据设置成功:', countriesRes.Data);
      } else {
        console.warn('Countries API returned error:', countriesRes.Message);
        setCountries([]);
      }
      
      console.log('运营控制台数据加载完成');
    } catch (error) {
      console.error('Failed to load stats:', error);
      // 即使出错也设置默认值，不显示错误提示
      setStats({
        totalAccounts: 0,
        normalAccounts: 0,
        bannedAccounts: 0,
        restrictedAccounts: 0,
        shouChuAccounts: 0,
        totalFans: 0,
        totalVideos: 0,
      });
      setRecentAccounts([]);
      setCountries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserInfo();
    loadDashboardStats();
  }, []);

  const getCountryName = (countryId: number) => {
    const country = countries.find(c => c.ID === countryId);
    return country?.Name || '未知';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '养号': return 'blue';
      case '售出': return 'green';
      case '封禁': return 'red';
      case '异常': return 'orange';
      default: return 'default';
    }
  };

  const quickActions = [
    {
      title: '新建账号',
      description: '创建新的TikTok账号',
      icon: <PlusOutlined />,
      action: () => navigate('/operator/accounts'),
      color: '#1890ff',
    },
    {
      title: '账号管理',
      description: '查看和管理所有账号',
      icon: <UserOutlined />,
      action: () => navigate('/operator/accounts'),
      color: '#52c41a',
    },
    {
      title: '数据分析',
      description: '查看账号数据趋势',
      icon: <BarChartOutlined />,
      action: () => navigate('/operator/accounts'),
      color: '#faad14',
    },
  ];

  const accountColumns = [
    {
      title: '账号名',
      dataIndex: 'AccountName',
      key: 'accountName',
      width: 120,
    },
    {
      title: '国家',
      dataIndex: 'CountryID',
      key: 'country',
      width: 80,
      render: (countryId: number) => getCountryName(countryId),
    },
    {
      title: '状态',
      dataIndex: 'Status',
      key: 'status',
      width: 80,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
    },
    {
      title: '今日粉丝',
      dataIndex: 'TodayFans',
      key: 'todayFans',
      width: 100,
      render: (fans: number) => (fans || 0).toLocaleString(),
    },
    {
      title: '今日视频',
      dataIndex: 'TodayVideos',
      key: 'todayVideos',
      width: 90,
      render: (videos: number) => videos || 0,
    },
    {
      title: '创建时间',
      dataIndex: 'CreatedAt',
      key: 'createdAt',
      width: 120,
      render: (text: string) => text ? new Date(text).toLocaleDateString() : '-',
    },
  ];

  const healthScore = dashboardStats 
    ? Math.round(dashboardStats.health_rate * 10) / 10
    : Math.round((stats.normalAccounts / Math.max(stats.totalAccounts, 1)) * 100);
    


  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>
        <UserOutlined style={{ marginRight: 8 }} />
        {userInfo.groupName.includes(userInfo.username)
          ? userInfo.groupName
          : `${userInfo.groupName}-${userInfo.username}`
        }
         的运营控制台
      </Title>
      <Paragraph type="secondary">
        欢迎使用 TikTok 运营管理系统，这里是您的工作中心。
      </Paragraph>

      {/* 核心数据统计 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="账号总数"
              value={stats.totalAccounts}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总粉丝数"
              value={stats.totalFans}
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#52c41a' }}
              formatter={(value) => `${Number(value).toLocaleString()}`}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总视频数"
              value={stats.totalVideos}
              prefix={<VideoCameraOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: 8, fontSize: 14, color: '#666' }}>账号健康度</div>
              <Progress
                type="circle"
                percent={healthScore}
                width={80}
                strokeColor={healthScore >= 80 ? '#52c41a' : healthScore >= 60 ? '#faad14' : '#ff4d4f'}
                format={(percent) => `${percent?.toFixed(1)}%`}
              />
              {dashboardStats && (
                <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
                  健康{dashboardStats.healthy_accounts}，总数：{dashboardStats.total_accounts}
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* 账号状态分布 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="养号账号"
              value={stats.normalAccounts}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="异常账号"
              value={stats.restrictedAccounts}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="封禁账号"
              value={stats.bannedAccounts}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已售出账号"
              value={stats.shouChuAccounts}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 快捷操作 */}
      <Card title="快捷操作" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          {quickActions.map((action, index) => (
            <Col span={8} key={index}>
              <Card
                hoverable
                style={{ textAlign: 'center', height: 120 }}
                onClick={action.action}
              >
                <div
                  style={{
                    fontSize: 24,
                    color: action.color,
                    marginBottom: 8,
                  }}
                >
                  {action.icon}
                </div>
                <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                  {action.title}
                </div>
                <div style={{ fontSize: 12, color: '#666' }}>
                  {action.description}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* 最近账号列表 */}
      <Card title="最近账号" style={{ marginBottom: 24 }}>
        <Table
          columns={accountColumns}
          dataSource={recentAccounts}
          rowKey="ID"
          loading={loading}
          pagination={false}
          size="small"
          scroll={{ x: 800 }}
          locale={{
            emptyText: recentAccounts.length === 0 && !loading ? '暂无账号数据' : undefined
          }}
        />
        <Divider />
        <div style={{ textAlign: 'center' }}>
          <Button type="link" onClick={() => navigate('/operator/accounts')}>
            查看全部账号 →
          </Button>
        </div>
      </Card>

      {/* 操作提示 */}
      <Row gutter={16}>
        <Col span={12}>
          <Card title="今日任务" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>• 检查账号状态，处理异常账号</div>
              <div>• 更新账号信息和备注</div>
              <div>• 分析粉丝增长趋势</div>
              <div>• 优化内容发布策略</div>
            </Space>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="操作提示" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>• 定期备份重要账号数据</div>
              <div>• 及时更新账号状态变化</div>
              <div>• 关注粉丝增长异常的账号</div>
              <div>• 保持账号信息的准确性</div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default OperatorDashboard; 