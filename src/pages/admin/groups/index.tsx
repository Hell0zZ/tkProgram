import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  message,
  Popconfirm,
  Card,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import type { Group } from '@/types';
import type { ColumnsType } from 'antd/es/table';
import * as adminService from '@/services/admin';

const GroupList: React.FC = () => {
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [groups, setGroups] = useState<Group[]>([]);
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
      const response = await adminService.getGroups({ 
        page, 
        pageSize,
        ...searchParams
      });
      const { Code, Data, Message } = response;
      if (Code === 0) {
        setGroups(Data.items);
        setPagination({
          ...pagination,
          current: page,
          pageSize,
          total: Data.total,
        });
      } else {
        message.error('获取分组列表失败：' + Message);
      }
    } catch (error) {
      message.error('获取分组列表失败');
      console.error('Failed to fetch groups:', error);
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

  const handleEdit = (record: Group) => {
    form.setFieldsValue({
      name: record.Name,
    });
    setEditingId(record.ID);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await adminService.deleteGroup(id);
      const { Code, Message } = response;
      if (Code === 0) {
        message.success('删除成功');
        loadData();
      } else {
        message.error('删除失败：' + Message);
      }
    } catch (error) {
      message.error('删除失败');
      console.error('Failed to delete group:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingId) {
        const response = await adminService.updateGroup(editingId, values);
        const { Code, Message } = response;
        if (Code === 0) {
          message.success('更新成功');
          setModalVisible(false);
          loadData();
        } else {
          message.error('更新失败：' + Message);
        }
      } else {
        const response = await adminService.createGroup(values);
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

  const columns: ColumnsType<Group> = [
    {
      title: 'ID',
      dataIndex: 'ID',
      key: 'id',
      width: 80,
    },
    {
      title: '分组名称',
      dataIndex: 'Name',
      key: 'name',
    },
    {
      title: '创建时间',
      dataIndex: 'CreatedAt',
      key: 'createdAt',
      width: 180,
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: '更新时间',
      dataIndex: 'UpdatedAt',
      key: 'updatedAt',
      width: 180,
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个分组吗？删除分组后，该分组下的运营人员将被移动到默认分组"
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
          <Form.Item name="name" label="分组名称">
            <Input 
              placeholder="请输入分组名称" 
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
          新建分组
        </Button>
      </div>

      {/* 分组表格 */}
      <Table
        columns={columns}
        dataSource={groups}
        rowKey="ID"
        loading={loading}
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
        title={editingId ? '编辑分组' : '新建分组'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="分组名称"
            rules={[
              { required: true, message: '请输入分组名称' },
              { max: 50, message: '分组名称最多50个字符' },
              { 
                pattern: /^[a-zA-Z0-9\u4e00-\u9fa5_-]+$/, 
                message: '分组名称只能包含字母、数字、中文、下划线和短横线' 
              },
            ]}
          >
            <Input
              placeholder="请输入分组名称"
              maxLength={50}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default GroupList; 