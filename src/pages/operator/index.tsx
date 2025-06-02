import React from 'react';
import { Card, Row, Col, Typography, Space } from 'antd';
import { 
  DashboardOutlined, 
  UserOutlined, 
  BarChartOutlined 
} from '@ant-design/icons';

const { Title, Paragraph } = Typography;

interface ModuleCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color: string;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ title, description, icon, color }) => {
  return (
    <Card 
      hoverable 
      style={{ 
        height: 200,
        textAlign: 'center',
        cursor: 'pointer',
        borderColor: color,
      }}
    >
      <div style={{ padding: '20px 0' }}>
        <div style={{ fontSize: 48, color, marginBottom: 16 }}>
          {icon}
        </div>
        <Title level={4} style={{ marginBottom: 8 }}>
          {title}
        </Title>
        <Paragraph type="secondary" style={{ fontSize: 14 }}>
          {description}
        </Paragraph>
      </div>
    </Card>
  );
};

const OperatorIndex: React.FC = () => {
  const modules = [
    {
      title: '运营控制台',
      description: '数据概览和快捷操作',
      icon: <DashboardOutlined />,
      path: '/operator/dashboard',
      color: '#1890ff',
    },
    {
      title: 'TikTok账号管理',
      description: '管理TikTok账号和数据',
      icon: <UserOutlined />,
      path: '/operator/accounts',
      color: '#52c41a',
    },
    {
      title: '数据分析',
      description: '查看粉丝和视频数据',
      icon: <BarChartOutlined />,
      path: '/operator/analytics',
      color: '#faad14',
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <Title level={1}>
          TikTok 管理系统 - 运营中心
        </Title>
        <Paragraph style={{ fontSize: 16, color: '#666' }}>
          选择下方模块开始管理您的TikTok账号
        </Paragraph>
      </div>

      <Row gutter={[24, 24]} justify="center">
        {modules.map((module, index) => (
          <Col span={8} key={index}>
            <ModuleCard {...module} />
          </Col>
        ))}
      </Row>

      <div style={{ marginTop: 40, textAlign: 'center' }}>
        <Card style={{ background: '#f5f5f5' }}>
          <Title level={4}>运营人员功能说明</Title>
          <Row gutter={16}>
            <Col span={8}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div><strong>运营控制台:</strong> 查看账号总体数据和健康状况</div>
                <div><strong>账号管理:</strong> 创建、编辑和管理TikTok账号</div>
              </Space>
            </Col>
            <Col span={8}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div><strong>数据统计:</strong> 查看粉丝增长和视频数据</div>
                <div><strong>状态监控:</strong> 实时监控账号状态变化</div>
              </Space>
            </Col>
            <Col span={8}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div><strong>趋势分析:</strong> 分析账号增长趋势</div>
                <div><strong>数据导出:</strong> 导出账号数据进行分析</div>
              </Space>
            </Col>
          </Row>
        </Card>
      </div>

      {/* 工作提醒 */}
      <div style={{ marginTop: 24 }}>
        <Card title="工作提醒" style={{ background: '#fff7e6', borderColor: '#ffa940' }}>
          <Row gutter={16}>
            <Col span={12}>
              <Title level={5} style={{ color: '#d48806' }}>日常任务:</Title>
              <ul style={{ color: '#595959' }}>
                <li>检查账号状态，及时处理异常</li>
                <li>更新账号信息和开窗时间</li>
                <li>关注粉丝增长异常的账号</li>
                <li>记录重要的运营事件</li>
              </ul>
            </Col>
            <Col span={12}>
              <Title level={5} style={{ color: '#d48806' }}>注意事项:</Title>
              <ul style={{ color: '#595959' }}>
                <li>保持账号信息的准确性</li>
                <li>定期备份重要数据</li>
                <li>及时上报重大异常情况</li>
                <li>遵守平台运营规范</li>
              </ul>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  );
};

export default OperatorIndex; 