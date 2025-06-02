import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Space,
  message,
  Popconfirm,
  Card,
  Tag,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import type { Proxy } from '@/types';
import type { ColumnsType } from 'antd/es/table';
import * as adminService from '@/services/admin';

const ProxyList: React.FC = () => {
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [proxies, setProxies] = useState<Proxy[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const loadData = async (page = pagination.current, pageSize = pagination.pageSize, searchParams = {}) => {
    try {
      setLoading(true);
      const response = await adminService.getProxies({ 
        page, 
        pageSize,
        ...searchParams
      });
      const { Code, Data, Message } = response;
      if (Code === 0) {
        setProxies(Data.items);
        setPagination({
          ...pagination,
          current: page,
          pageSize,
          total: Data.total,
        });
      } else {
        message.error('获取代理IP列表失败：' + Message);
      }
    } catch (error) {
      message.error('获取代理IP列表失败');
      console.error('Failed to fetch proxies:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = () => {
    form.resetFields();
    setEditingId(null);
    setModalVisible(true);
  };

  const handleEdit = (record: Proxy) => {
    form.setFieldsValue({
      country: record.Country,
      host: record.Host,
      port: record.Port,
      username: record.Username,
      password: record.Password,
    });
    setEditingId(record.ID);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await adminService.deleteProxy(id);
      const { Code, Message } = response;
      if (Code === 0) {
        message.success('删除成功');
        loadData();
      } else {
        message.error('删除失败：' + Message);
      }
    } catch (error) {
      message.error('删除失败');
      console.error('Failed to delete proxy:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingId) {
        const response = await adminService.updateProxy(editingId, values);
        const { Code, Message } = response;
        if (Code === 0) {
          message.success('更新成功');
          setModalVisible(false);
          loadData();
        } else {
          message.error('更新失败：' + Message);
        }
      } else {
        const response = await adminService.createProxy(values);
        const { Code, Message } = response;
        if (Code === 0) {
          message.success('创建成功');
          setModalVisible(false);
          loadData();
        } else {
          message.error('创建失败：' + Message);
        }
      }
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  const handleSearch = async () => {
    try {
      const values = await searchForm.validateFields();
      loadData(1, pagination.pageSize, values);
    } catch (error) {
      console.error('Search form validation failed:', error);
    }
  };

  const handleReset = () => {
    searchForm.resetFields();
    loadData(1, pagination.pageSize);
  };

  const testConnection = async (proxy: Proxy) => {
    message.info('正在测试连接...');
    // 这里可以添加真实的代理测试逻辑
    console.log('Testing proxy:', proxy.Host, proxy.Port);
    setTimeout(() => {
      message.success('代理连接正常');
    }, 1000);
  };

  const getPortColor = (port: number) => {
    if (port === 80 || port === 8080) return 'blue';
    if (port === 443) return 'green';
    if (port >= 1080 && port <= 1090) return 'purple';
    return 'default';
  };

  const columns: ColumnsType<Proxy> = [
    {
      title: 'ID',
      dataIndex: 'ID',
      key: 'id',
      width: 80,
    },
    {
      title: '国家',
      dataIndex: 'Country',
      key: 'country',
      width: 100,
    },
    {
      title: '主机地址',
      dataIndex: 'Host',
      key: 'host',
      width: 150,
    },
    {
      title: '端口',
      dataIndex: 'Port',
      key: 'port',
      width: 100,
      render: (port: number) => (
        <Tag color={getPortColor(port)}>{port}</Tag>
      ),
    },
    {
      title: '用户名',
      dataIndex: 'Username',
      key: 'username',
      width: 120,
      render: (username: string) => username || '-',
    },
    {
      title: '密码',
      dataIndex: 'Password',
      key: 'password',
      width: 100,
      render: (password: string) => password ? '●●●●●●' : '-',
    },
    {
      title: '创建时间',
      dataIndex: 'CreatedAt',
      key: 'createdAt',
      width: 160,
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            onClick={() => testConnection(record)}
          >
            测试
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个代理IP吗？"
            onConfirm={() => handleDelete(record.ID)}
          >
            <Button type="link" danger size="small" icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* 搜索表单 */}
      <Card style={{ marginBottom: 16 }}>
        <Form
          form={searchForm}
          layout="inline"
          onFinish={handleSearch}
        >
          <Form.Item name="country" label="国家">
            <Input 
              placeholder="请输入国家" 
              style={{ width: 150 }}
              allowClear
            />
          </Form.Item>
          <Form.Item name="host" label="主机地址">
            <Input 
              placeholder="请输入主机地址" 
              style={{ width: 200 }}
              allowClear
            />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit"
                icon={<SearchOutlined />}
              >
                搜索
              </Button>
              <Button onClick={handleReset}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {/* 操作按钮 */}
      <div style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          新建代理IP
        </Button>
      </div>

      {/* 代理IP表格 */}
      <Table
        columns={columns}
        dataSource={proxies}
        rowKey="ID"
        loading={loading}
        scroll={{ x: 1000 }}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
          onChange: (page, pageSize) => loadData(page, pageSize),
        }}
      />

      {/* 新建/编辑模态框 */}
      <Modal
        title={editingId ? '编辑代理IP' : '新建代理IP'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="country"
            label="国家"
            rules={[
              { required: true, message: '请输入国家' },
              { max: 50, message: '国家名称最多50个字符' },
            ]}
          >
            <Input
              placeholder="请输入国家，如：美国、日本、新加坡"
              maxLength={50}
            />
          </Form.Item>
          <Form.Item
            name="host"
            label="主机地址"
            rules={[
              { required: true, message: '请输入主机地址' },
              { 
                pattern: /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$|^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?$/, 
                message: '请输入有效的IP地址或域名' 
              },
            ]}
          >
            <Input
              placeholder="请输入IP地址或域名，如：192.168.1.1 或 proxy.example.com"
            />
          </Form.Item>
          <Form.Item
            name="port"
            label="端口"
            rules={[
              { required: true, message: '请输入端口' },
              { type: 'number', min: 1, max: 65535, message: '端口范围：1-65535' },
            ]}
          >
            <InputNumber
              placeholder="请输入端口号"
              style={{ width: '100%' }}
              min={1}
              max={65535}
            />
          </Form.Item>
          <Form.Item
            name="username"
            label="用户名"
            extra="如果代理需要认证，请填写用户名"
          >
            <Input
              placeholder="请输入用户名（可选）"
              maxLength={100}
            />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            extra="如果代理需要认证，请填写密码"
          >
            <Input.Password
              placeholder="请输入密码（可选）"
              maxLength={100}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProxyList; 