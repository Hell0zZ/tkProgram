import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Card, Select, message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config';

interface OperatorForm {
  username: string;
  password: string;
  role: string;
  groupId: number;
}

interface Group {
  id: number;
  name: string;
}

const OperatorForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);

  const fetchGroups = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.GROUPS, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.data.code === 0) {
        setGroups(response.data.data.items);
      }
    } catch (error) {
      message.error('获取组列表失败');
    }
  };

  const fetchOperator = async () => {
    if (!id) return;
    try {
      const response = await axios.get(`${API_ENDPOINTS.OPERATORS}/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.data.code === 0) {
        form.setFieldsValue(response.data.data);
      }
    } catch (error) {
      message.error('获取运营人员信息失败');
    }
  };

  useEffect(() => {
    fetchGroups();
    if (id) {
      fetchOperator();
    }
  }, [id]);

  const handleSubmit = async (values: OperatorForm) => {
    try {
      setLoading(true);
      const url = id
        ? `${API_ENDPOINTS.OPERATORS}/${id}`
        : API_ENDPOINTS.OPERATORS;
      const method = id ? 'put' : 'post';
      const response = await axios[method](url, values, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.data.code === 0) {
        message.success(id ? '更新成功' : '创建成功');
        navigate('/operator');
      }
    } catch (error) {
      message.error(id ? '更新失败' : '创建失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">{id ? '编辑运营人员' : '新增运营人员'}</h2>
      <Card>
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          className="max-w-lg"
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input />
          </Form.Item>
          {!id && (
            <Form.Item
              name="password"
              label="密码"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password />
            </Form.Item>
          )}
          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select>
              <Select.Option value="operator">运营人员</Select.Option>
              <Select.Option value="admin">管理员</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="groupId"
            label="所属组"
            rules={[{ required: true, message: '请选择所属组' }]}
          >
            <Select>
              {groups.map(group => (
                <Select.Option key={group.id} value={group.id}>
                  {group.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              {id ? '更新' : '创建'}
            </Button>
            <Button className="ml-2" onClick={() => navigate('/operator')}>
              取消
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default OperatorForm; 