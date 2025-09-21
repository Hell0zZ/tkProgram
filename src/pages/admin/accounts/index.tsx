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
  Row,
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

const AdminTikTokAccountList: React.FC = () => {
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
  const [sortInfo, setSortInfo] = useState<{
    sort_by?: string;
    order?: string;
  }>({});
  const [currentSearchParams, setCurrentSearchParams] = useState<any>({});
  const [operators, setOperators] = useState<any[]>([]);

  const loadData = async (page = pagination.current, pageSize = pagination.pageSize, searchParams = {}) => {
    try {
      setLoading(true);
      console.log('管理员页面：开始加载账号列表:', { page, pageSize, searchParams });
      
      const response = await operatorService.getTikTokAccounts({ 
        page,
        pageSize,
        ...sortInfo,
        ...searchParams
      });
      
      console.log('管理员页面：账号列表API响应:', response);
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
          CreatedByUsername: account.CreatedByUsername || account.created_by_username,
        }));
        
        setAccounts(normalizedAccounts);
        console.log('管理员页面：账号列表转换后:', normalizedAccounts);
        setPagination({
          ...pagination,
          current: page,
          pageSize,
          total: Data.total || 0,
        });
        console.log('管理员页面：账号列表加载成功:', Data);
      } else {
        console.warn('管理员页面：账号列表API返回错误:', Message);
        // 不显示错误提示，静默处理，设置空数据
        setAccounts([]);
        setPagination({
          ...pagination,
          current: page,
          pageSize,
          total: 0,
        });
      }
    } catch (error) {
      console.error('管理员页面：获取账号列表失败:', error);
      // 静默处理错误，不显示错误提示，避免因权限问题导致退出登录
      setAccounts([]);
      setPagination({
        ...pagination,
        current: page,
        pageSize,
        total: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCountries = async () => {
    try {
      console.log('管理员页面：开始获取countries数据');
      const response = await commonService.getCountries();
      console.log('管理员页面：countries API响应:', response);
      const { Code, Data, Message } = response;
      if (Code === 0) {
        // 兼容后端返回的小写字段名，统一转换为大写
        const normalizedCountries = Data.map((country: any) => ({
          ID: country.ID || country.id,
          Name: country.Name || country.name,
        }));
        setCountries(normalizedCountries);
        console.log('管理员页面：countries数据设置成功:', normalizedCountries);
      } else {
        console.warn('管理员页面：Countries API返回错误:', Message);
        // 使用默认国家数据
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
        console.log('管理员页面：使用默认countries数据');
      }
    } catch (error) {
      console.error('管理员页面：获取countries失败:', error);
      // 使用默认国家数据
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
      console.log('管理员页面：使用默认countries数据（catch块）');
    }
  };

  const fetchOperators = async () => {
    try {
      const response = await fetch('/api/admin/operators?page=1&page_size=1000', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const res = await response.json();
      if (res.Code === 0 && res.Data && res.Data.items) {
        setOperators(res.Data.items);
      }
    } catch (error) {
      console.error('获取运营人员列表失败:', error);
    }
  };

  useEffect(() => {
    loadData();
    loadCountries();
    fetchOperators();
  }, []);

  const handleAdd = () => {
    form.resetFields();
    setEditingId(null);
    setModalVisible(true);
  };

  const handleEdit = (record: TikTokAccount) => {
    console.log('管理员页面：编辑账号数据:', record);
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
        loadData(pagination.current);
      } else {
        message.error('删除失败：' + Message);
      }
    } catch (error) {
      message.error('删除失败');
      console.error('删除账号失败:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      console.log('管理员页面：表单提交数据:', values);
      
      // 清理空值并格式化数据
      const submitData: any = {
        account_name: values.account_name,
        country_id: values.country_id,
      };
      
      // 只有非空字段才加入提交数据
      if (values.nickname && values.nickname.trim() !== '') {
        submitData.nickname = values.nickname.trim();
      }
      if (values.window_open) {
        submitData.window_open = values.window_open.format('YYYY-MM-DD');
      }
      if (values.status && values.status.trim() !== '') {
        submitData.status = values.status.trim();
      }
      if (values.usage && values.usage.trim() !== '') {
        submitData.usage = values.usage.trim();
      }
      if (values.remark && values.remark.trim() !== '') {
        submitData.remark = values.remark.trim();
      }
      
      console.log('管理员页面：清理后的提交数据:', submitData);
      
      let response;
      if (editingId) {
        response = await operatorService.updateTikTokAccount(editingId, submitData);
      } else {
        response = await operatorService.createTikTokAccount(submitData);
      }
      
      console.log('管理员页面：提交API响应:', response);
      const { Code, Message } = response;
      if (Code === 0) {
        message.success(editingId ? '更新成功' : '创建成功');
        setModalVisible(false);
        loadData(pagination.current);
      } else {
        message.error((editingId ? '更新失败：' : '创建失败：') + Message);
      }
    } catch (error) {
      console.error('管理员页面：提交表单失败:', error);
      message.error('操作失败');
    }
  };

  const handleSearch = async () => {
    const values = await searchForm.validateFields();
    const searchParams: any = {};
    
    if (values.account_name) {
      searchParams.account_name = values.account_name;
    }
    if (values.country_id) {
      searchParams.country_id = values.country_id;
    }
    if (values.created_by) {
      searchParams.created_by = values.created_by;
    }
    if (values.status) {
      searchParams.status = values.status;
    }
    if (values.remark) {
      searchParams.remark = values.remark;
    }
    if (values.created_at_range) {
      searchParams.created_at_start = values.created_at_range[0]?.format('YYYY-MM-DD');
      searchParams.created_at_end = values.created_at_range[1]?.format('YYYY-MM-DD');
      delete searchParams.created_at_range;
    }
    
    // 保存当前搜索条件
    setCurrentSearchParams(searchParams);
    loadData(1, pagination.pageSize, searchParams);
  };

  const handleReset = () => {
    searchForm.resetFields();
    setCurrentSearchParams({});
    loadData(1, pagination.pageSize);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '养号': return 'blue';
      case '使用': return 'purple';
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
    if (diff > 0) return '#52c41a'; // 绿色表示增长
    if (diff < 0) return '#ff4d4f'; // 红色表示下降
    return '#8c8c8c'; // 灰色表示无变化
  };

  const formatDiff = (diff: number) => {
    return diff > 0 ? `+${diff}` : diff.toString();
  };

  const getCountryName = (countryId: number) => {
    const country = countries.find(c => c.ID === countryId);
    return country ? country.Name : '未知';
  };

  const columns: ColumnsType<TikTokAccount> = [
    {
      title: '基本信息',
      children: [
        {
          title: '账号名',
          dataIndex: 'AccountName',
          key: 'AccountName',
          width: 120,
          fixed: 'left' as const,
        },
        {
          title: '昵称',
          dataIndex: 'Nickname',
          key: 'Nickname',
          width: 120,
          render: (text) => text || '-',
        },
        {
          title: '国家',
          dataIndex: 'CountryID',
          key: 'CountryID',
          width: 80,
          render: (countryId) => getCountryName(countryId),
        },
        {
          title: '开窗日期',
          dataIndex: 'WindowOpen',
          key: 'WindowOpen',
          width: 100,
          render: (text) => text ? dayjs(text).format('YYYY-MM-DD') : '-',
        },
        {
          title: '注册日期',
          dataIndex: 'RegTime',
          key: 'RegTime',
          width: 120,
          render: (text) => text || '-',
        },
        {
          title: '状态',
          dataIndex: 'Status',
          key: 'Status',
          width: 80,
          render: (status) => (
            <Tag color={getStatusColor(status)}>
              {status || '未知'}
            </Tag>
          ),
        },
        {
          title: '用途',
          dataIndex: 'Usage',
          key: 'Usage',
          width: 100,
          render: (text) => text || '-',
        },
        {
          title: '备注',
          dataIndex: 'Remark',
          key: 'Remark',
          width: 120,
          render: (text) => text || '-',
        },
        {
          title: '邮箱',
          dataIndex: 'Email',
          key: 'Email',
          width: 150,
          render: (text) => text || '-',
        },
        {
          title: '设备编号',
          dataIndex: 'DeviceId',
          key: 'DeviceId',
          width: 120,
          render: (text) => text || '-',
        },
      ],
    },
    {
      title: '粉丝数据',
      children: [
        {
          title: '当前粉丝',
          dataIndex: 'TodayFans',
          key: 'TodayFans',
          width: 120,
          sorter: true,
          sortDirections: ['ascend', 'descend'],
          render: (value) => value?.toLocaleString() || '0',
        },
        {
          title: '昨日对比',
          dataIndex: 'FansDiff1',
          key: 'FansDiff1',
          width: 100,
          render: (diff) => (
            <span style={{ color: getDiffColor(diff) }}>
              {formatDiff(diff)}
            </span>
          ),
        },
        {
          title: '3日对比',
          dataIndex: 'FansDiff3',
          key: 'FansDiff3',
          width: 100,
          render: (diff) => (
            <span style={{ color: getDiffColor(diff) }}>
              {formatDiff(diff)}
            </span>
          ),
        },
        {
          title: '7日对比',
          dataIndex: 'FansDiff7',
          key: 'FansDiff7',
          width: 100,
          render: (diff) => (
            <span style={{ color: getDiffColor(diff) }}>
              {formatDiff(diff)}
            </span>
          ),
        },
        {
          title: '30日对比',
          dataIndex: 'FansDiff30',
          key: 'FansDiff30',
          width: 100,
          render: (diff) => (
            <span style={{ color: getDiffColor(diff) }}>
              {formatDiff(diff)}
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
          key: 'TodayVideos',
          width: 100,
          render: (value) => value?.toLocaleString() || '0',
        },
        {
          title: '昨日对比',
          dataIndex: 'VideosDiff1',
          key: 'VideosDiff1',
          width: 100,
          render: (diff) => (
            <span style={{ color: getDiffColor(diff) }}>
              {formatDiff(diff)}
            </span>
          ),
        },
        {
          title: '3日对比',
          dataIndex: 'VideosDiff3',
          key: 'VideosDiff3',
          width: 100,
          render: (diff) => (
            <span style={{ color: getDiffColor(diff) }}>
              {formatDiff(diff)}
            </span>
          ),
        },
        {
          title: '7日对比',
          dataIndex: 'VideosDiff7',
          key: 'VideosDiff7',
          width: 100,
          render: (diff) => (
            <span style={{ color: getDiffColor(diff) }}>
              {formatDiff(diff)}
            </span>
          ),
        },
        {
          title: '30日对比',
          dataIndex: 'VideosDiff30',
          key: 'VideosDiff30',
          width: 100,
          render: (diff) => (
            <span style={{ color: getDiffColor(diff) }}>
              {formatDiff(diff)}
            </span>
          ),
        },
      ],
    },
    {
      title: '其它信息',
      children: [
        {
          title: '更新时间',
          key: 'updateTime',
          width: 140,
          render: (_, record: TikTokAccount) => {
            const updateTime = record.IPStatus === 1 
              ? record.SpiderLastUpdateAt 
              : record.SpiderLastFailureAt;
            return updateTime ? new Date(updateTime).toLocaleString() : '-';
          },
        },
        {
          title: '更新状态',
          key: 'updateStatus',
          width: 120,
          render: (_, record: TikTokAccount) => {
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
        {
          title: '创建人',
          dataIndex: 'CreatedByUsername',
          key: 'CreatedByUsername',
          width: 100,
        },
        {
          title: '创建时间',
          dataIndex: 'CreatedAt',
          key: 'CreatedAt',
          width: 140,
          render: (text: string) => text ? new Date(text).toLocaleString() : '-',
        },
      ],
    },
    {
      title: '账号编辑',
      children: [
        {
          title: '',
          key: 'action',
          width: 180,
          fixed: 'right' as const,
          render: (_, record) => (
            <Space size="small">
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
                okText="确定"
                cancelText="取消"
              >
                <Button
                  type="link"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                >
                  删除
                </Button>
              </Popconfirm>
            </Space>
          ),
        },
      ],
    },
  ];

  return (
    <div>
      <Card title="搜索条件" style={{ marginBottom: 16 }}>
        <Form
          form={searchForm}
          layout="vertical"
          onFinish={handleSearch}
        >
          <Row gutter={16} align="bottom">
            <Col>
              <Form.Item name="account_name" label="账号名称">
                <Input placeholder="请输入账号名称" allowClear style={{ width: 160 }} />
              </Form.Item>
            </Col>
            <Col>
              <Form.Item name="remark" label="备注">
                <Input placeholder="请输入备注关键词" allowClear style={{ width: 160 }} />
              </Form.Item>
            </Col>
            <Col>
              <Form.Item name="email" label="邮箱">
                <Input placeholder="请输入邮箱" allowClear style={{ width: 160 }} />
              </Form.Item>
            </Col>
            <Col>
              <Form.Item name="country_id" label="国家">
                <Select placeholder="请选择国家" allowClear style={{ width: 120 }}>
                  {countries.map(country => (
                    <Select.Option key={country.ID} value={country.ID}>
                      {country.Name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col>
              <Form.Item name="created_by" label="运营人员">
                <Select
                  placeholder="请选择运营人员"
                  allowClear
                  showSearch
                  style={{ width: 140 }}
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    ((option?.children ?? '') as string).toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {operators.map(op => (
                    <Select.Option key={op.ID} value={op.Username}>
                      {op.Username}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col>
              <Form.Item name="status" label="状态">
                <Select placeholder="请选择状态" allowClear style={{ width: 120 }}>
                  <Select.Option value="养号">养号</Select.Option>
                  <Select.Option value="使用">使用</Select.Option>
                  <Select.Option value="售出">售出</Select.Option>
                  <Select.Option value="异常">异常</Select.Option>
                  <Select.Option value="封禁">封禁</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col>
              <Form.Item name="usage" label="用途">
                <Select placeholder="请选择用途" allowClear style={{ width: 120 }}>
                  <Select.Option value="起号">起号</Select.Option>
                  <Select.Option value="中视频">中视频</Select.Option>
                  <Select.Option value="星图">星图</Select.Option>
                  <Select.Option value="短视频">短视频</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col>
              <Form.Item name="created_at_range" label="创建时间">
                <DatePicker.RangePicker style={{ width: 260 }} />
              </Form.Item>
            </Col>
            <Col>
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
            </Col>
          </Row>
        </Form>
      </Card>

      <Card
        title="TikTok账号管理（管理员视图）"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新建账号
          </Button>
        }
      >
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
            onChange: (page, pageSize) => loadData(page, pageSize, currentSearchParams),
          }}
          onChange={(pagination, _filters, sorter) => {
            if (sorter && !Array.isArray(sorter) && sorter.field === 'TodayFans') {
              // 更新排序信息
              const newSortInfo = {
                sort_by: 'follower_count',
                order: sorter.order === 'ascend' ? 'asc' : 'desc'
              };
              setSortInfo(newSortInfo);
              
              // 获取当前搜索条件
              const formValues = searchForm.getFieldsValue();
              const searchParams = {
                ...formValues,
                ...newSortInfo
              };
              // 处理日期范围
              if (formValues.created_at_range) {
                searchParams.created_at_start = formValues.created_at_range[0]?.format('YYYY-MM-DD');
                searchParams.created_at_end = formValues.created_at_range[1]?.format('YYYY-MM-DD');
                delete searchParams.created_at_range;
              }
              loadData(pagination?.current || 1, pagination?.pageSize || 10, searchParams);
            } else if (!sorter || Array.isArray(sorter) || !sorter.order) {
              // 清除排序
              setSortInfo({});
            }
          }}
        />
      </Card>

      <Modal
        title={editingId ? '编辑账号' : '新建账号'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{}}
        >
          <Form.Item
            name="account_name"
            label="账号名"
            rules={[{ required: true, message: '请输入账号名' }]}
          >
            <Input placeholder="请输入账号名" />
          </Form.Item>
          <Form.Item
            name="nickname"
            label="昵称"
          >
            <Input placeholder="请输入昵称（可选）" />
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
            <DatePicker style={{ width: '100%' }} placeholder="请选择开窗日期（可选）" />
          </Form.Item>
          <Form.Item
            name="status"
            label="状态"
          >
            <Select placeholder="请选择状态（可选）" allowClear>
              <Option value="养号">养号</Option>
              <Option value="使用">使用</Option>
              <Option value="售出">售出</Option>
              <Option value="封禁">封禁</Option>
              <Option value="异常">异常</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="usage"
            label="用途"
          >
            <Select placeholder="请选择用途（可选）" allowClear>
              <Option value="起号">起号</Option>
              <Option value="中视频">中视频</Option>
              <Option value="星图">星图</Option>
              <Option value="短视频">短视频</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              {
                type: 'email',
                message: '请输入有效的邮箱地址',
              },
            ]}
          >
            <Input placeholder="请输入邮箱（可选）" />
          </Form.Item>
          <Form.Item
            name="device_id"
            label="设备编号"
          >
            <Input placeholder="请输入设备编号（可选）" />
          </Form.Item>
          <Form.Item
            name="remark"
            label="备注"
          >
            <Input.TextArea placeholder="请输入备注（可选）" rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminTikTokAccountList;