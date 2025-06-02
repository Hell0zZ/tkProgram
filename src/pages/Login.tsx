import React from 'react';
import { Form, Input, Button, Card, message, Typography, Select, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import request from '../utils/request';
import './Login.less';

const { Title } = Typography;
const { Option } = Select;

interface LoginForm {
  username: string;
  password: string;
  role: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);
  const isMounted = React.useRef(true);

  React.useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleSubmit = async (values: LoginForm) => {
    console.log('Form submission started', values);
    if (!isMounted.current) {
      console.log('Component not mounted, returning');
      return;
    }
    setLoading(true);
    try {
      console.log('Sending request to /api/auth/login');
      const res: any = await request.post('/api/auth/login', values);
      console.log('Received response:', res);
      if (!isMounted.current) return;
      if (res.Data?.token) {
        localStorage.setItem('token', res.Data.token);
        localStorage.setItem('userRole', values.role);
        message.success('登录成功');
        
        // 根据角色跳转到不同的页面
        if (values.role === 'operator') {
          navigate('/operator');
        } else {
          navigate('/admin');
        }
      } else {
        message.error(res.Message || '登录失败');
      }
    } catch (err) {
      console.error('Login error:', err);
      message.error('登录失败，请检查网络连接');
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  const handleQuickLogin = (role: string) => {
    const credentials = {
      admin: { username: 'admin', password: 'admin123', role: 'admin' },
      operator: { username: 'operator', password: 'operator123', role: 'operator' }
    };
    
    form.setFieldsValue(credentials[role as keyof typeof credentials]);
  };

  console.log('Login component rendered');

  return (
    <div className="login-container">
      <div className="login-content">
        <div className="login-header">
          <Title level={2}>TikTok 管理系统</Title>
          <Typography.Text type="secondary">欢迎回来，请选择角色并登录您的账号</Typography.Text>
        </div>
        <Card bordered={false} className="login-card">
          <Form
            form={form}
            onFinish={handleSubmit}
            size="large"
            className="login-form"
            initialValues={{ role: 'admin' }}
            onFinishFailed={(errorInfo) => {
              console.log('Form validation failed:', errorInfo);
            }}
          >
            <Form.Item
              name="role"
              rules={[{ required: true, message: '请选择角色' }]}
            >
              <Select
                placeholder="请选择登录角色"
              >
                <Option value="admin">👨‍💼 管理员</Option>
                <Option value="operator">👩‍💻 运营人员</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="username"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input
                prefix={<UserOutlined className="site-form-item-icon" />}
                placeholder="请输入用户名"
                allowClear
              />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password
                prefix={<LockOutlined className="site-form-item-icon" />}
                placeholder="请输入密码"
                allowClear
              />
            </Form.Item>
            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                className="login-button" 
                loading={loading}
                block
                onClick={() => {
                  console.log('Login button clicked');
                  console.log('Current form values:', form.getFieldsValue());
                }}
              >
                登录
              </Button>
            </Form.Item>
          </Form>
          
          {/* 快速登录演示 */}
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
              演示账号快速登录：
            </Typography.Text>
            <Space>
              <Button 
                size="small" 
                onClick={() => handleQuickLogin('admin')}
              >
                管理员演示
              </Button>
              <Button 
                size="small" 
                onClick={() => handleQuickLogin('operator')}
              >
                运营人员演示
              </Button>
            </Space>
          </div>
        </Card>
        <div className="login-footer">
          <Typography.Text type="secondary">
            © {new Date().getFullYear()} TikTok Admin. All Rights Reserved.
          </Typography.Text>
        </div>
      </div>
    </div>
  );
};

export default Login; 