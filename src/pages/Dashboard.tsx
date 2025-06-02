import React from 'react';
import { Card, Row, Col, Statistic, Button } from 'antd';
import {
  TeamOutlined,
  UserAddOutlined,
  InteractionOutlined,
  RiseOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { message } from 'antd';
import request from '@/utils/request';

const Dashboard: React.FC = () => {
  const handleExport = async () => {
    try {
      message.info('正在导出数据...');
      const response = await request.get('/api/admin/export/accounts', { responseType: 'blob' });
      
      // 创建下载链接
      const blob = new Blob([response.data], { type: 'text/csv' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'accounts.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      message.success('导出成功');
    } catch (error) {
      message.error('导出失败');
      console.error('Failed to export:', error);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">仪表盘</h2>
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总运营人员"
              value={42}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="本月新增"
              value={8}
              prefix={<UserAddOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="活跃用户"
              value={1234}
              prefix={<InteractionOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="增长率"
              value={15.6}
              precision={2}
              prefix={<RiseOutlined />}
              suffix="%"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
      </Row>
      <Card title="TikTok 账号数据">
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={handleExport}
        >
          导出账号数据
        </Button>
      </Card>
    </div>
  );
};

export default Dashboard; 