import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  message,
  Popconfirm,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { Operator, Group } from '@/types';
import type { ColumnsType } from 'antd/es/table';
import * as adminService from '@/services/admin';

const { Option } = Select;

const OperatorList: React.FC = () => {
  const [form] = Form.useForm();
  const [operators, setOperators] = useState<Operator[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const loadData = async (page = pagination.current, pageSize = pagination.pageSize) => {
    try {
      setLoading(true);
      const response = await adminService.getOperators({ page, pageSize });
      const { Code, Data, Message } = response;
      if (Code === 0) {
        setOperators(Data.items);
        setPagination({
          ...pagination,
          current: Data.page,
          pageSize: Data.pageSize,
          total: Data.total,
        });
      } else {
        message.error('获取运营人员列表失败：' + Message);
      }
    } catch (error) {
      message.error('获取运营人员列表失败');
      console.error('Failed to fetch operators:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isSubscribed = true;

    const loadGroups = async () => {
      try {
        const response = await adminService.getAllGroups();
        const { Code, Data, Message } = response;
        if (isSubscribed) {
          if (Code === 0) {
            setGroups(Data || []);
          } else {
            message.error('获取分组列表失败：' + Message);
          }
        }
      } catch (error) {
        if (isSubscribed) {
          message.error('获取分组列表失败');
          console.error('Failed to fetch groups:', error);
        }
      }
    };

    loadData(pagination.current, pagination.pageSize);
    loadGroups();

    return () => {
      isSubscribed = false;
    };
  }, [pagination.current, pagination.pageSize]);

  const handleAdd = () => {
    form.resetFields();
    setEditingId(null);
    setModalVisible(true);
  };

  const handleEdit = (record: Operator) => {
    form.setFieldsValue({
      username: record.Username,
      groupId: record.GroupID,
      password: undefined, // Don't show password in edit mode
    });
    setEditingId(record.ID);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await adminService.deleteOperator(id);
      const { Code, Message } = response;
      if (Code === 0) {
        message.success('删除成功');
        loadData();
      } else {
        message.error('删除失败：' + Message);
      }
    } catch (error) {
      message.error('删除失败');
      console.error('Failed to delete operator:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      console.log('Form values:', values);
      
      if (editingId) {
        // 编辑模式：构建更新参数
        const updateParams: any = {
          username: values.username,
          groupId: values.groupId,
        };
        
        // 只有密码不为空且不为空字符串时才传递密码参数
        if (values.password && typeof values.password === 'string' && values.password.trim() !== '') {
          updateParams.password = values.password.trim();
        }
        
        console.log('Update params:', updateParams);
        
        const response = await adminService.updateOperator(editingId, updateParams);
        const { Code, Message } = response;
        if (Code === 0) {
          message.success('更新成功');
          setModalVisible(false);
          loadData();
        } else {
          message.error('更新失败：' + Message);
        }
      } else {
        const response = await adminService.createOperator({ ...values, role: 'operator' });
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
      // 不再显示通用的"表单验证失败"消息，让具体的验证错误显示
    }
  };

  const columns: ColumnsType<Operator> = [
    {
      title: '用户名',
      dataIndex: 'Username',
      key: 'username',
    },
    {
      title: '角色',
      dataIndex: 'Role',
      key: 'role',
      render: () => '运营人员',
    },
    {
      title: '所属分组',
      dataIndex: ['Group', 'Name'],
      key: 'groupName',
    },
    {
      title: '创建时间',
      dataIndex: 'CreatedAt',
      key: 'createdAt',
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个运营人员吗？"
            onConfirm={() => handleDelete(record.ID)}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            新建运营人员
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={operators}
        rowKey="ID"
        loading={loading}
        pagination={{
          ...pagination,
          onChange: (page, pageSize) => loadData(page, pageSize),
        }}
      />

      <Modal
        title={editingId ? '编辑运营人员' : '新建运营人员'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[
              { required: true, message: '请输入用户名' },
              { max: 50, message: '用户名最多50个字符' },
            ]}
          >
            <Input
              placeholder="请输入用户名"
              disabled={!!editingId}
            />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={[
              { required: !editingId, message: '请输入密码' },
              { 
                validator: (_, value) => {
                  // 编辑模式下，如果密码为空则不验证
                  if (editingId && (!value || value.trim() === '')) {
                    return Promise.resolve();
                  }
                  // 新建模式或编辑模式下有输入密码时，验证长度
                  if (!value || value.length < 6) {
                    return Promise.reject(new Error('密码至少6个字符'));
                  }
                  return Promise.resolve();
                }
              },
            ]}
          >
            <Input.Password
              placeholder={editingId ? '不修改请留空' : '请输入密码'}
            />
          </Form.Item>
          <Form.Item
            name="groupId"
            label="所属分组"
            rules={[{ required: true, message: '请选择所属分组' }]}
          >
            <Select placeholder="请选择所属分组">
              {groups.map(group => (
                <Option key={group.ID} value={group.ID}>
                  {group.Name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default OperatorList; 