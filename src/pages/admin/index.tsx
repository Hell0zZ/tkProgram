import React from 'react';
import { Card, Row, Col, Typography, Space } from 'antd';
import { 
  DashboardOutlined, 
  UserOutlined, 
  TeamOutlined, 
  GlobalOutlined 
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

const AdminIndex: React.FC = () => {
  const modules = [
    {
      title: '控制台',
      description: '系统概览和快捷操作',
      icon: <DashboardOutlined />,
      path: '/admin/dashboard',
      color: '#1890ff',
    },
    {
      title: '运营人员管理',
      description: '管理运营人员账号和权限',
      icon: <UserOutlined />,
      path: '/admin/operators',
      color: '#52c41a',
    },
    {
      title: '人员分组管理',
      description: '创建和管理人员分组',
      icon: <TeamOutlined />,
      path: '/admin/groups',
      color: '#faad14',
    },
    {
      title: '代理IP管理',
      description: '配置和管理代理服务器',
      icon: <GlobalOutlined />,
      path: '/admin/proxies',
      color: '#722ed1',
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <Title level={1}>
          TikTok 管理系统 - Admin 控制台
        </Title>
        <Paragraph style={{ fontSize: 16, color: '#666' }}>
          选择下方模块开始管理系统功能
        </Paragraph>
      </div>

      <Row gutter={[24, 24]}>
        {modules.map((module, index) => (
          <Col span={6} key={index}>
            <ModuleCard {...module} />
          </Col>
        ))}
      </Row>

      <div style={{ marginTop: 40, textAlign: 'center' }}>
        <Card style={{ background: '#f5f5f5' }}>
          <Title level={4}>Admin 功能说明</Title>
          <Row gutter={16}>
            <Col span={12}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div><strong>运营人员管理:</strong> 创建、编辑、删除运营人员账号</div>
                <div><strong>分组管理:</strong> 组织运营人员到不同的工作组</div>
              </Space>
            </Col>
            <Col span={12}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div><strong>代理IP管理:</strong> 配置代理服务器确保网络访问</div>
                <div><strong>数据导出:</strong> 导出TikTok账号数据进行分析</div>
              </Space>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  );
};

export default AdminIndex; 