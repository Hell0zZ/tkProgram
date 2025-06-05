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
  Col,
  Card,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { TikTokAccount, Country } from '@/types';
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
  const [editingId, setEditingId] = useState<number | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const loadData = async (page = pagination.current, pageSize = pagination.pageSize, searchParams = {}) => {
    try {
      setLoading(true);
      console.log('开始加载账号列表:', { page, pageSize, searchParams });
      
      const response = await operatorService.getTikTokAccounts({ 
        page, 
        pageSize,
        ...searchParams
      });
      
      console.log('账号列表API响应:', response);
      const { Code, Data, Message } = response;
      if (Code === 0) {
        // 兼容后端返回的小写字段名，统一转换为大写
        const normalizedAccounts = (Data.items || []).map((account: any) => ({
          ID: account.ID || account.id,
          AccountName: account.AccountName || account.account_name,
          Nickname: account.Nickname || account.nickname,
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
          Remark: account.Remark || account.remark || '',
        }));
        
        setAccounts(normalizedAccounts);
        console.log('账号列表转换后:', normalizedAccounts);
        setPagination({
          ...pagination,
          current: page,
          pageSize,
          total: Data.total || 0,
        });
        console.log('账号列表加载成功:', Data);
      } else {
        console.warn('账号列表API返回错误:', Message);
        message.error('获取账号列表失败：' + Message);
        // 即使失败也保持当前状态，不清空账号列表
      }
    } catch (error) {
      console.error('获取账号列表失败:', error);
      message.error('获取账号列表失败');
      // 设置空数组避免页面崩溃，但不清空pagination
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCountries = async () => {
    try {
      console.log('TikTok账号管理页面：开始获取countries数据');
      const response = await commonService.getCountries();
      console.log('TikTok账号管理页面：countries API响应:', response);
      const { Code, Data, Message } = response;
      if (Code === 0) {
        // 兼容后端返回的小写字段名，统一转换为大写
        const normalizedCountries = Data.map((country: any) => ({
          ID: country.ID || country.id,
          Name: country.Name || country.name,
        }));
        setCountries(normalizedCountries);
        console.log('TikTok账号管理页面：countries数据设置成功:', normalizedCountries);
      } else {
        console.warn('TikTok账号管理页面：Countries API返回错误:', Message);
        // 使用默认国家数据，不显示错误提示
        const defaultCountries = [
          { ID: 1, Name: '美国' },
          { ID: 2, Name: '英国' },
          { ID: 3, Name: '日本' },
          { ID: 4, Name: '韩国' },
          { ID: 5, Name: '德国' },
          { ID: 6, Name: '法国' },
          { ID: 7, Name: '加拿大' },
          { ID: 8, Name: '澳大利亚' },
        ];
        setCountries(defaultCountries);
        console.log('TikTok账号管理页面：使用默认countries数据');
      }
    } catch (error) {
      console.error('TikTok账号管理页面：获取countries失败:', error);
      // 使用默认国家数据，不显示错误提示
      const defaultCountries = [
        { ID: 1, Name: '美国' },
        { ID: 2, Name: '英国' },
        { ID: 3, Name: '日本' },
        { ID: 4, Name: '韩国' },
        { ID: 5, Name: '德国' },
        { ID: 6, Name: '法国' },
        { ID: 7, Name: '加拿大' },
        { ID: 8, Name: '澳大利亚' },
      ];
      setCountries(defaultCountries);
      console.log('TikTok账号管理页面：使用默认countries数据（catch块）');
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
    console.log('编辑账号数据:', record);
    form.setFieldsValue({
      account_name: record.AccountName,
      nickname: record.Nickname || '',
      country_id: record.CountryID,
      window_open: record.WindowOpen && record.WindowOpen.trim() !== '' ? dayjs(record.WindowOpen) : null,
      status: record.Status && record.Status !== '未知' ? record.Status : '',
      usage: record.Usage && record.Usage !== '未知' ? record.Usage : '',
      remark: record.Remark || '',
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

  const handleSubmit = async () => {
    try {
      console.log('开始表单验证...');
      const values = await form.validateFields();
      console.log('表单提交的原始值:', values);
      
      const params: any = {
        account_name: values.account_name,
        country_id: values.country_id,
      };
      
      // 只有当字段有值时才添加到参数中
      if (values.nickname && values.nickname.trim() !== '') {
        params.nickname = values.nickname;
      }
      
      if (values.window_open && values.window_open !== null && values.window_open !== undefined) {
        params.window_open = values.window_open.format('YYYY-MM-DD');
        console.log('开窗日期格式化结果:', params.window_open);
      } else {
        console.log('开窗日期为空，不发送该字段');
      }
      
      if (values.status && values.status.trim() !== '') {
        params.status = values.status;
      }
      
      if (values.usage && values.usage.trim() !== '') {
        params.usage = values.usage;
      }
      
      if (values.remark && values.remark.trim() !== '') {
        params.remark = values.remark;
      }
      
      console.log('最终提交的参数:', params);

      if (editingId) {
        console.log('执行更新操作，账号ID:', editingId);
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
        console.log('执行创建操作');
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
      console.error('表单验证或提交失败:', error);
      message.error('操作失败，请检查表单内容');
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
      case '养号': return 'blue';
      case '售出': return 'green';
      case '封禁': return 'red';
      case '异常': return 'orange';
      default: return 'default';
    }
  };

  const getIPStatusColor = (status: number | undefined) => {
    if (status === 1) return 'green'; // 成功状态，绿色
    if (status === 0) return 'red';   // 失败状态，红色
    return 'default'; // 未知状态
  };

  const getDiffColor = (diff: number) => {
    if (diff > 0) return '#52c41a'; // 绿色，增长
    if (diff < 0) return '#ff4d4f'; // 红色，下降
    return '#666'; // 灰色，无变化
  };

  const formatDiff = (diff: number) => {
    if (diff === 0) return '0';
    return diff > 0 ? `+${diff}` : `${diff}`;
  };

  const getCountryName = (countryId: number) => {
    const country = countries.find(c => c.ID === countryId);
    return country?.Name || '未知';
  };

  const columns: ColumnsType<TikTokAccount> = [
    {
      title: '基本信息',
      children: [
    {
      title: '账号名',
      dataIndex: 'AccountName',
      key: 'accountName',
      width: 120,
          fixed: 'left',
        },
        {
          title: '昵称',
          dataIndex: 'Nickname',
          key: 'nickname',
          width: 100,
          render: (text: string) => text || '-',
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
          width: 120,
          render: (text: string) => text ? dayjs(text).format('YYYY-MM-DD') : '-',
        },
        {
          title: '注册日期',
          dataIndex: 'RegTime',
          key: 'regTime',
          width: 120,
          render: (text: string) => text ? dayjs(text).format('YYYY-MM-DD') : '-',
    },
    {
      title: '状态',
      dataIndex: 'Status',
      key: 'status',
      width: 80,
      render: (status: string) => (
            <Tag color={getStatusColor(status)}>{status || '未知'}</Tag>
      ),
    },
    {
      title: '用途',
      dataIndex: 'Usage',
      key: 'usage',
      width: 80,
          render: (usage: string) => usage || '未知',
        },
        {
          title: '备注',
          dataIndex: 'Remark',
          key: 'remark',
          width: 120,
          ellipsis: true,
          render: (text: string) => text || '-',
        },
      ],
    },
    {
      title: '粉丝数据',
      children: [
        {
          title: '当前粉丝',
      dataIndex: 'TodayFans',
      key: 'todayFans',
          width: 100,
          render: (fans: number) => (fans || 0).toLocaleString(),
        },
        {
          title: '昨天',
          dataIndex: 'FansDiff1',
          key: 'fansDiff1',
          width: 80,
          render: (diff: number) => (
            <span style={{ color: getDiffColor(diff) }}>
              {formatDiff(diff || 0)}
            </span>
          ),
        },
        {
          title: '3天前',
          dataIndex: 'FansDiff3',
          key: 'fansDiff3',
          width: 80,
          render: (diff: number) => (
            <span style={{ color: getDiffColor(diff) }}>
              {formatDiff(diff || 0)}
            </span>
          ),
        },
        {
          title: '7天前',
          dataIndex: 'FansDiff7',
          key: 'fansDiff7',
          width: 80,
          render: (diff: number) => (
            <span style={{ color: getDiffColor(diff) }}>
              {formatDiff(diff || 0)}
            </span>
          ),
        },
        {
          title: '30天前',
          dataIndex: 'FansDiff30',
          key: 'fansDiff30',
      width: 90,
          render: (diff: number) => (
            <span style={{ color: getDiffColor(diff) }}>
              {formatDiff(diff || 0)}
            </span>
          ),
    },
      ],
    },
    {
      title: '视频数据',
      children: [
    {
          title: '当前视频',
      dataIndex: 'TodayVideos',
      key: 'todayVideos',
          width: 100,
          render: (videos: number) => (videos || 0).toLocaleString(),
        },
        {
          title: '昨天',
          dataIndex: 'VideosDiff1',
          key: 'videosDiff1',
          width: 80,
          render: (diff: number) => (
            <span style={{ color: getDiffColor(diff) }}>
              {formatDiff(diff || 0)}
            </span>
          ),
        },
        {
          title: '3天前',
          dataIndex: 'VideosDiff3',
          key: 'videosDiff3',
          width: 80,
          render: (diff: number) => (
            <span style={{ color: getDiffColor(diff) }}>
              {formatDiff(diff || 0)}
            </span>
          ),
        },
        {
          title: '7天前',
          dataIndex: 'VideosDiff7',
          key: 'videosDiff7',
          width: 80,
          render: (diff: number) => (
            <span style={{ color: getDiffColor(diff) }}>
              {formatDiff(diff || 0)}
            </span>
          ),
        },
        {
          title: '30天前',
          dataIndex: 'VideosDiff30',
          key: 'videosDiff30',
      width: 90,
          render: (diff: number) => (
            <span style={{ color: getDiffColor(diff) }}>
              {formatDiff(diff || 0)}
            </span>
          ),
        },
      ],
    },
    {
      title: '爬虫信息',
      children: [
        {
          title: '更新时间',
          key: 'updateTime',
          width: 140,
          render: (text: any, record: TikTokAccount) => {
            const updateTime = record.IPStatus === 1 
              ? record.SpiderLastUpdateAt 
              : record.SpiderLastFailureAt;
            return updateTime ? new Date(updateTime).toLocaleString() : '未更新';
          },
        },
        {
          title: '更新状态',
          key: 'updateStatus',
      width: 120,
          render: (text: any, record: TikTokAccount) => {
            const ipStatus = record.IPStatus;
            const proxy = record.LastProxy || '服务器IP';
            const statusColor = getIPStatusColor(ipStatus);
            const statusText = ipStatus === 1 ? '成功' : ipStatus === 0 ? '失败' : '未知';
            
            return (
              <div>
                <Tag color={statusColor}>{statusText}</Tag>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                  {proxy}
                </div>
              </div>
            );
          },
        },
      ],
    },
    {
      title: '其他信息',
      children: [
    {
      title: '创建时间',
      dataIndex: 'CreatedAt',
      key: 'createdAt',
          width: 140,
          render: (text: string) => text ? new Date(text).toLocaleString() : '-',
        },
      ],
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          {/* 暂时隐藏数据按钮
          <Button
            type="link"
            size="small"
            icon={<LineChartOutlined />}
            onClick={() => handleViewMetrics(record)}
          >
            数据
          </Button>
          */}
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
          <Col span={6}>
          <Form.Item name="status" label="状态">
              <Select placeholder="请选择状态" allowClear>
                <Option value="养号">养号</Option>
                <Option value="售出">售出</Option>
              <Option value="封禁">封禁</Option>
                <Option value="异常">异常</Option>
            </Select>
          </Form.Item>
          </Col>
          <Form.Item name="usage" label="用途">
            <Select placeholder="请选择用途" style={{ width: 120 }}>
              <Option value="起号">起号</Option>
              <Option value="中视频">中视频</Option>
              <Option value="星图">星图</Option>
              <Option value="短视频">短视频</Option>
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
        scroll={{ x: 2000 }}
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
            name="nickname"
            label="昵称"
          >
            <Input
              placeholder="请输入昵称（可选）"
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
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="status"
            label="状态"
          >
            <Select placeholder="请选择状态（可选）" allowClear>
              <Option value="养号">养号</Option>
              <Option value="售出">售出</Option>
              <Option value="封禁">封禁</Option>
              <Option value="异常">异常</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="usage"
            label="用途"
          >
            <Select placeholder="请选择用途">
              <Option value="起号">起号</Option>
              <Option value="中视频">中视频</Option>
              <Option value="星图">星图</Option>
              <Option value="短视频">短视频</Option>
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
    </div>
  );
};

export default TikTokAccountList; 