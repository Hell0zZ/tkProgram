import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Space,
  message,
  Popconfirm,
  Tag,
  Statistic,
  Row,
  Col,
  Card,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, LineChartOutlined } from '@ant-design/icons';
import type { TikTokAccount, Country, AccountMetrics } from '@/types';
import type { ColumnsType } from 'antd/es/table';
import * as operatorService from '@/services/operator';
import * as commonService from '@/services/common';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

const TikTokAccountList: React.FC = () => {
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [accounts, setAccounts] = useState<TikTokAccount[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [metricsModalVisible, setMetricsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<TikTokAccount | null>(null);
  const [metrics, setMetrics] = useState<AccountMetrics | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const loadData = async (page = pagination.current, pageSize = pagination.pageSize, searchParams = {}) => {
    try {
      setLoading(true);
      const response = await operatorService.getTikTokAccounts({ 
        page, 
        pageSize,
        ...searchParams
      });
      const { Code, Data, Message } = response;
      if (Code === 0) {
        setAccounts(Data.items);
        setPagination({
          ...pagination,
          current: page,
          pageSize,
          total: Data.total,
        });
      } else {
        message.error('获取账号列表失败：' + Message);
      }
    } catch (error) {
      message.error('获取账号列表失败');
      console.error('Failed to fetch accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCountries = async () => {
    try {
      const response = await commonService.getCountries();
      const { Code, Data, Message } = response;
      if (Code === 0) {
        setCountries(Data);
      } else {
        message.error('获取国家列表失败：' + Message);
      }
    } catch (error) {
      message.error('获取国家列表失败');
      console.error('Failed to fetch countries:', error);
    }
  };

  const loadMetrics = async (accountId: number) => {
    try {
      const response = await operatorService.getAccountMetrics(accountId);
      const { Code, Data, Message } = response;
      if (Code === 0) {
        setMetrics(Data);
      } else {
        message.error('获取数据统计失败：' + Message);
      }
    } catch (error) {
      message.error('获取数据统计失败');
      console.error('Failed to fetch metrics:', error);
    }
  };

  useEffect(() => {
    loadData();
    loadCountries();
  }, []);

  const handleAdd = () => {
    form.resetFields();
    setEditingId(null);
    setModalVisible(true);
  };

  const handleEdit = (record: TikTokAccount) => {
    form.setFieldsValue({
      account_name: record.AccountName,
      country_id: record.CountryID,
      window_open: dayjs(record.WindowOpen),
      status: record.Status,
      usage: record.Usage,
      remark: record.Remark,
    });
    setEditingId(record.ID);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await operatorService.deleteTikTokAccount(id);
      const { Code, Message } = response;
      if (Code === 0) {
        message.success('删除成功');
        loadData();
      } else {
        message.error('删除失败：' + Message);
      }
    } catch (error) {
      message.error('删除失败');
      console.error('Failed to delete account:', error);
    }
  };

  const handleViewMetrics = (record: TikTokAccount) => {
    setSelectedAccount(record);
    loadMetrics(record.ID);
    setMetricsModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const params = {
        ...values,
        window_open: values.window_open.format('YYYY-MM-DD'),
      };

      if (editingId) {
        const response = await operatorService.updateTikTokAccount(editingId, params);
        const { Code, Message } = response;
        if (Code === 0) {
          message.success('更新成功');
          setModalVisible(false);
          loadData();
        } else {
          message.error('更新失败：' + Message);
        }
      } else {
        const response = await operatorService.createTikTokAccount(params);
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
      const searchParams = {
        ...values,
        created_at_start: values.created_at_range?.[0]?.format('YYYY-MM-DD'),
        created_at_end: values.created_at_range?.[1]?.format('YYYY-MM-DD'),
      };
      delete searchParams.created_at_range;
      loadData(1, pagination.pageSize, searchParams);
    } catch (error) {
      console.error('Search form validation failed:', error);
    }
  };

  const handleReset = () => {
    searchForm.resetFields();
    loadData(1, pagination.pageSize);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '正常': return 'green';
      case '封禁': return 'red';
      case '限制': return 'orange';
      default: return 'default';
    }
  };

  const getCountryName = (countryId: number) => {
    const country = countries.find(c => c.ID === countryId);
    return country?.Name || '未知';
  };

  const columns: ColumnsType<TikTokAccount> = [
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
      title: '开窗日期',
      dataIndex: 'WindowOpen',
      key: 'windowOpen',
      width: 100,
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
      title: '用途',
      dataIndex: 'Usage',
      key: 'usage',
      width: 80,
    },
    {
      title: '今日粉丝',
      dataIndex: 'TodayFans',
      key: 'todayFans',
      width: 90,
      render: (fans: number) => fans.toLocaleString(),
    },
    {
      title: '今日视频',
      dataIndex: 'TodayVideos',
      key: 'todayVideos',
      width: 90,
    },
    {
      title: '备注',
      dataIndex: 'Remark',
      key: 'remark',
      width: 120,
      ellipsis: true,
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
      width: 160,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<LineChartOutlined />}
            onClick={() => handleViewMetrics(record)}
          >
            数据
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
            title="确定要删除这个账号吗？"
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
          <Form.Item name="account_name" label="账号名">
            <Input placeholder="请输入账号名" style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择状态" style={{ width: 120 }}>
              <Option value="正常">正常</Option>
              <Option value="封禁">封禁</Option>
              <Option value="限制">限制</Option>
            </Select>
          </Form.Item>
          <Form.Item name="usage" label="用途">
            <Select placeholder="请选择用途" style={{ width: 120 }}>
              <Option value="短视频">短视频</Option>
              <Option value="直播">直播</Option>
              <Option value="电商">电商</Option>
            </Select>
          </Form.Item>
          <Form.Item name="created_at_range" label="创建时间">
            <RangePicker style={{ width: 240 }} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
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
          新建账号
        </Button>
      </div>

      {/* 账号表格 */}
      <Table
        columns={columns}
        dataSource={accounts}
        rowKey="ID"
        loading={loading}
        scroll={{ x: 1200 }}
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
        title={editingId ? '编辑账号' : '新建账号'}
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
            name="account_name"
            label="账号名"
            rules={[
              { required: true, message: '请输入账号名' },
              { max: 100, message: '账号名最多100个字符' },
            ]}
          >
            <Input
              placeholder="请输入账号名"
              disabled={!!editingId}
            />
          </Form.Item>
          <Form.Item
            name="country_id"
            label="国家"
            rules={[{ required: true, message: '请选择国家' }]}
          >
            <Select placeholder="请选择国家">
              {countries.map(country => (
                <Option key={country.ID} value={country.ID}>
                  {country.Name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="window_open"
            label="开窗日期"
            rules={[{ required: true, message: '请选择开窗日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="请选择状态">
              <Option value="正常">正常</Option>
              <Option value="封禁">封禁</Option>
              <Option value="限制">限制</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="usage"
            label="用途"
            rules={[{ required: true, message: '请选择用途' }]}
          >
            <Select placeholder="请选择用途">
              <Option value="短视频">短视频</Option>
              <Option value="直播">直播</Option>
              <Option value="电商">电商</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="remark"
            label="备注"
          >
            <Input.TextArea
              placeholder="请输入备注"
              rows={3}
              maxLength={500}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 数据统计模态框 */}
      <Modal
        title={`${selectedAccount?.AccountName} - 数据统计`}
        open={metricsModalVisible}
        onCancel={() => setMetricsModalVisible(false)}
        footer={null}
        width={800}
      >
        {metrics && (
          <>
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={12}>
                <Card>
                  <Statistic
                    title="今日粉丝数"
                    value={metrics.today_fans}
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card>
                  <Statistic
                    title="今日视频数"
                    value={metrics.today_videos}
                    valueStyle={{ color: '#cf1322' }}
                  />
                </Card>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={12}>
                <Card title="粉丝增长">
                  <div style={{ marginBottom: 8 }}>
                    <span>1天: </span>
                    <span style={{ color: metrics.fans_diff_1 >= 0 ? '#3f8600' : '#cf1322' }}>
                      {metrics.fans_diff_1 >= 0 ? '+' : ''}{metrics.fans_diff_1}
                    </span>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <span>3天: </span>
                    <span style={{ color: metrics.fans_diff_3 >= 0 ? '#3f8600' : '#cf1322' }}>
                      {metrics.fans_diff_3 >= 0 ? '+' : ''}{metrics.fans_diff_3}
                    </span>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <span>7天: </span>
                    <span style={{ color: metrics.fans_diff_7 >= 0 ? '#3f8600' : '#cf1322' }}>
                      {metrics.fans_diff_7 >= 0 ? '+' : ''}{metrics.fans_diff_7}
                    </span>
                  </div>
                  <div>
                    <span>30天: </span>
                    <span style={{ color: metrics.fans_diff_30 >= 0 ? '#3f8600' : '#cf1322' }}>
                      {metrics.fans_diff_30 >= 0 ? '+' : ''}{metrics.fans_diff_30}
                    </span>
                  </div>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="视频增长">
                  <div style={{ marginBottom: 8 }}>
                    <span>1天: </span>
                    <span style={{ color: metrics.videos_diff_1 >= 0 ? '#3f8600' : '#cf1322' }}>
                      {metrics.videos_diff_1 >= 0 ? '+' : ''}{metrics.videos_diff_1}
                    </span>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <span>3天: </span>
                    <span style={{ color: metrics.videos_diff_3 >= 0 ? '#3f8600' : '#cf1322' }}>
                      {metrics.videos_diff_3 >= 0 ? '+' : ''}{metrics.videos_diff_3}
                    </span>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <span>7天: </span>
                    <span style={{ color: metrics.videos_diff_7 >= 0 ? '#3f8600' : '#cf1322' }}>
                      {metrics.videos_diff_7 >= 0 ? '+' : ''}{metrics.videos_diff_7}
                    </span>
                  </div>
                  <div>
                    <span>30天: </span>
                    <span style={{ color: metrics.videos_diff_30 >= 0 ? '#3f8600' : '#cf1322' }}>
                      {metrics.videos_diff_30 >= 0 ? '+' : ''}{metrics.videos_diff_30}
                    </span>
                  </div>
                </Card>
              </Col>
            </Row>
          </>
        )}
      </Modal>
    </div>
  );
};

export default TikTokAccountList; 