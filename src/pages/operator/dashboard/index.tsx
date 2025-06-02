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
  FallOutlined,
  PlusOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { TikTokAccount, Country } from '@/types';
import * as operatorService from '@/services/operator';
import * as commonService from '@/services/common';

const { Title, Paragraph } = Typography;

const OperatorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalAccounts: 0,
    normalAccounts: 0,
    bannedAccounts: 0,
    restrictedAccounts: 0,
    totalFans: 0,
    totalVideos: 0,
  });
  const [recentAccounts, setRecentAccounts] = useState<TikTokAccount[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // 并行获取数据
      const [accountsRes, countriesRes] = await Promise.all([
        operatorService.getTikTokAccounts({ page: 1, pageSize: 10 }),
        commonService.getCountries(),
      ]);

      if (accountsRes.Code === 0) {
        const accounts = accountsRes.Data.items;
        setRecentAccounts(accounts);
        
        // 计算统计数据
        const totalAccounts = accountsRes.Data.total;
        const normalAccounts = accounts.filter(acc => acc.Status === '正常').length;
        const bannedAccounts = accounts.filter(acc => acc.Status === '封禁').length;
        const restrictedAccounts = accounts.filter(acc => acc.Status === '限制').length;
        const totalFans = accounts.reduce((sum, acc) => sum + acc.TodayFans, 0);
        const totalVideos = accounts.reduce((sum, acc) => sum + acc.TodayVideos, 0);

        setStats({
          totalAccounts,
          normalAccounts,
          bannedAccounts,
          restrictedAccounts,
          totalFans,
          totalVideos,
        });
      }

      if (countriesRes.Code === 0) {
        setCountries(countriesRes.Data);
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

  const getCountryName = (countryId: number) => {
    const country = countries.find(c => c.ID === countryId);
    return country?.Name || '未知';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '正常': return 'green';
      case '封禁': return 'red';
      case '限制': return 'orange';
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
      render: (fans: number) => fans.toLocaleString(),
    },
    {
      title: '今日视频',
      dataIndex: 'TodayVideos',
      key: 'todayVideos',
      width: 90,
    },
    {
      title: '粉丝增长',
      dataIndex: 'FansDiff1',
      key: 'fansDiff1',
      width: 100,
      render: (diff: number) => (
        <span style={{ color: diff >= 0 ? '#52c41a' : '#ff4d4f' }}>
          {diff >= 0 ? <RiseOutlined /> : <FallOutlined />}
          {diff >= 0 ? '+' : ''}{diff}
        </span>
      ),
    },
  ];

  const healthScore = Math.round((stats.normalAccounts / Math.max(stats.totalAccounts, 1)) * 100);

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>
        <UserOutlined style={{ marginRight: 8 }} />
        运营控制台
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
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* 账号状态分布 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="正常账号"
              value={stats.normalAccounts}
              valueStyle={{ color: '#52c41a' }}
              suffix={`/ ${stats.totalAccounts}`}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="限制账号"
              value={stats.restrictedAccounts}
              valueStyle={{ color: '#faad14' }}
              suffix={`/ ${stats.totalAccounts}`}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="封禁账号"
              value={stats.bannedAccounts}
              valueStyle={{ color: '#ff4d4f' }}
              suffix={`/ ${stats.totalAccounts}`}
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