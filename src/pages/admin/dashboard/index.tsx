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
} from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  GlobalOutlined,
  FileTextOutlined,
  SettingOutlined,
  RiseOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { Operator, DashboardStats } from '@/types';
import * as adminService from '@/services/admin';

const { Title, Paragraph } = Typography;

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalOperators: 0,
    totalGroups: 0,
    totalProxies: 0,
    totalAccounts: 0,
    normalAccounts: 0,
    usingAccounts: 0,
    bannedAccounts: 0,
    restrictedAccounts: 0,
    shouChuAccounts: 0,
    totalFans: 0,
    totalVideos: 0,
  });
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [recentOperators, setRecentOperators] = useState<Operator[]>([]);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // 并行获取统计数据
      const [operatorsRes, groupsRes, proxiesRes, dashboardRes] = await Promise.all([
        adminService.getOperators({ page: 1, pageSize: 5 }),
        adminService.getAllGroups(),
        adminService.getProxies({ page: 1, pageSize: 1 }),
        adminService.getDashboardStats(),
      ]);

      if (operatorsRes.Code === 0) {
        setStats(prev => ({ ...prev, totalOperators: operatorsRes.Data.total }));
        setRecentOperators(operatorsRes.Data.items);
      }

      if (groupsRes.Code === 0) {
        setStats(prev => ({ ...prev, totalGroups: groupsRes.Data.length }));
      }

      if (proxiesRes.Code === 0) {
        setStats(prev => ({ ...prev, totalProxies: proxiesRes.Data.total }));
      }

      if (dashboardRes.Code === 0 && dashboardRes.Data) {
        setDashboardStats(dashboardRes.Data);
        setStats(prev => ({
          ...prev,
          totalAccounts: dashboardRes.Data.total_accounts,
          normalAccounts: dashboardRes.Data.status_stats['养号']?.count || 0,
          usingAccounts: dashboardRes.Data.status_stats['使用']?.count || 0,
          bannedAccounts: dashboardRes.Data.status_stats['封禁']?.count || 0,
          restrictedAccounts: dashboardRes.Data.status_stats['异常']?.count || 0,
          shouChuAccounts: dashboardRes.Data.status_stats['售出']?.count || 0,
          totalFans: dashboardRes.Data.total_fans,
          totalVideos: dashboardRes.Data.total_videos,
        }));
        console.log('管理员控制台TikTok统计数据加载成功:', dashboardRes.Data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const quickActions = [
    {
      title: '新建运营人员',
      description: '添加新的运营人员账号',
      icon: <UserOutlined />,
      action: () => navigate('/admin/operators'),
      color: '#1890ff',
    },
    {
      title: '管理分组',
      description: '创建和管理人员分组',
      icon: <TeamOutlined />,
      action: () => navigate('/admin/groups'),
      color: '#52c41a',
    },
    {
      title: '代理IP设置',
      description: '配置和管理代理IP',
      icon: <GlobalOutlined />,
      action: () => navigate('/admin/proxies'),
      color: '#faad14',
    },
    {
      title: '导出数据',
      description: '导出TikTok账号数据',
      icon: <FileTextOutlined />,
      action: async () => {
        try {
          const response = await adminService.exportAccounts();
          const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
          const link = document.createElement('a');
          const url = URL.createObjectURL(blob);
          link.setAttribute('href', url);
          link.setAttribute('download', `tiktok_accounts_${new Date().toISOString().split('T')[0]}.csv`);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } catch (error) {
          console.error('Failed to export:', error);
        }
      },
      color: '#722ed1',
    },
  ];

  const operatorColumns = [
    {
      title: '用户名',
      dataIndex: 'Username',
      key: 'username',
    },
    {
      title: '分组',
      dataIndex: ['Group', 'Name'],
      key: 'groupName',
      render: (name: string) => name || '默认分组',
    },
    {
      title: '创建时间',
      dataIndex: 'CreatedAt',
      key: 'createdAt',
      render: (text: string) => new Date(text).toLocaleDateString(),
    },
    {
      title: '状态',
      key: 'status',
      render: () => <Tag color="green">正常</Tag>,
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>
        <SettingOutlined style={{ marginRight: 8 }} />
        管理员控制台
      </Title>
      <Paragraph type="secondary">
        欢迎使用 TikTok 管理系统，这里是系统的管理中心。
      </Paragraph>

      {/* 数据统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="运营人员总数"
              value={stats.totalOperators}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="分组总数"
              value={stats.totalGroups}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="代理IP总数"
              value={stats.totalProxies}
              prefix={<GlobalOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* TikTok账号统计 */}
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
                percent={dashboardStats ? Math.round(dashboardStats.health_rate * 10) / 10 : 0}
                width={80}
                strokeColor={
                  dashboardStats && dashboardStats.health_rate >= 80 
                    ? '#52c41a' 
                    : dashboardStats && dashboardStats.health_rate >= 60 
                    ? '#faad14' 
                    : '#ff4d4f'
                }
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
      <Row gutter={[12, 0]} style={{ marginBottom: 24 }}>
        <Col flex="1">
          <Card>
            <Statistic
              title="养号账号"
              value={stats.normalAccounts}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col flex="1">
          <Card>
            <Statistic
              title="使用中账号"
              value={stats.usingAccounts}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col flex="1">
          <Card>
            <Statistic
              title="异常账号"
              value={stats.restrictedAccounts}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col flex="1">
          <Card>
            <Statistic
              title="封禁账号"
              value={stats.bannedAccounts}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col flex="1">
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
            <Col span={6} key={index}>
              <Card
                hoverable
                style={{ textAlign: 'center', height: 140 }}
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

      {/* 最近添加的运营人员 */}
      <Card title="最近添加的运营人员" style={{ marginBottom: 24 }}>
        <Table
          columns={operatorColumns}
          dataSource={recentOperators}
          rowKey="ID"
          loading={loading}
          pagination={false}
          size="small"
        />
        <Divider />
        <div style={{ textAlign: 'center' }}>
          <Button type="link" onClick={() => navigate('/admin/operators')}>
            查看全部运营人员 →
          </Button>
        </div>
      </Card>

      {/* 系统信息 */}
      <Row gutter={16}>
        <Col span={12}>
          <Card title="系统功能" size="small">
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li>运营人员账号管理</li>
              <li>人员分组管理</li>
              <li>代理IP配置管理</li>
              <li>TikTok账号数据导出</li>
              <li>权限控制和安全认证</li>
            </ul>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="使用说明" size="small">
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li>管理员可以创建和管理运营人员账号</li>
              <li>通过分组功能可以更好地组织团队</li>
              <li>配置代理IP以支持多地区访问</li>
              <li>定期导出数据进行备份和分析</li>
              <li>所有操作都有详细的日志记录</li>
            </ul>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard; 