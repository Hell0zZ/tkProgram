import React, { useState, useEffect } from 'react';
import { Layout as AntLayout, Menu, Modal, Form, Input, message } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  TeamOutlined,
  GroupOutlined,
  GlobalOutlined,
  UserOutlined,
  BarChartOutlined,
  LogoutOutlined,
  KeyOutlined,
} from '@ant-design/icons';
import * as operatorService from '@/services/operator';
import * as adminService from '@/services/admin';

const { Header, Content, Sider } = AntLayout;

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userRole, setUserRole] = useState<string>('admin'); // 默认admin，后续从token或API获取
  const [userInfo, setUserInfo] = useState<{
    role: string;
    username?: string;
    groupName?: string;
  }>({ role: 'admin' });
  
  // 密码修改相关状态
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [passwordForm] = Form.useForm();
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    const loadUserInfo = async () => {
      // 首先从localStorage获取基本信息，确保页面能正常显示
      const storedRole = localStorage.getItem('userRole') || 'admin';
      const storedUsername = localStorage.getItem('username') || undefined;
      const storedGroupName = localStorage.getItem('groupName') || undefined;
      
      setUserRole(storedRole);
      setUserInfo({
        role: storedRole,
        username: storedUsername,
        groupName: storedGroupName
      });
      
      console.log('Layout: 使用localStorage数据', { 
        role: storedRole, 
        username: storedUsername, 
        groupName: storedGroupName 
      });
      
      // 然后尝试从API获取最新的用户信息（非阻塞）
      try {
        console.log('Layout: 开始获取用户信息API');
        const response = await operatorService.getCurrentUserInfo();
        console.log('Layout: 用户信息API响应:', response);
        
        if (response.Code === 0 && response.Data) {
          const userData = response.Data;
          const role = userData.role || storedRole;
          const username = userData.username || storedUsername;
          const groupName = userData.group_name || storedGroupName;
          
          // 只有数据发生变化时才更新状态
          if (role !== storedRole || username !== storedUsername || groupName !== storedGroupName) {
            setUserRole(role);
            setUserInfo({
              role,
              username,
              groupName
            });
            
            // 更新localStorage
            localStorage.setItem('userRole', role);
            if (username) localStorage.setItem('username', username);
            if (groupName) localStorage.setItem('groupName', groupName);
            if (userData.group_id) localStorage.setItem('groupId', userData.group_id.toString());
            
            console.log('Layout: 用户信息更新成功', { role, username, groupName });
          }
        } else {
          console.warn('Layout: 用户信息API返回错误:', response.Message);
        }
      } catch (error) {
        console.warn('Layout: 获取用户信息失败，继续使用localStorage数据', error);
        // 不做任何处理，继续使用localStorage的数据
      }
    };
    
    loadUserInfo();
  }, []);

  const getMenuItems = () => {
    if (userRole === 'operator') {
      return [
        {
          key: 'operator/dashboard',
          icon: <BarChartOutlined />,
          label: '运营控制台',
        },
        {
          key: 'operator/accounts',
          icon: <UserOutlined />,
          label: 'TikTok账号管理',
        },
      ];
    } else {
      // admin 角色
      return [
        {
          key: 'admin/dashboard',
          icon: <DashboardOutlined />,
          label: '管理控制台',
        },
        {
          key: 'admin/operators',
          icon: <TeamOutlined />,
          label: '运营人员管理',
        },
        {
          key: 'admin/groups',
          icon: <GroupOutlined />,
          label: '分组管理',
        },
        {
          key: 'admin/proxies',
          icon: <GlobalOutlined />,
          label: '代理IP管理',
        },
        {
          key: 'admin/accounts',
          icon: <UserOutlined />,
          label: 'TikTok账号管理',
        },
      ];
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    localStorage.removeItem('groupName');
    navigate('/login');
  };

  // 密码修改处理函数
  const handlePasswordChange = async () => {
    try {
      const values = await passwordForm.validateFields();
      setPasswordLoading(true);
      
      // 获取当前用户详细信息
      const userInfoResponse = await operatorService.getCurrentUserInfo();
      if (userInfoResponse.Code !== 0) {
        message.error('获取用户信息失败');
        return;
      }
      
      const userData = userInfoResponse.Data;
      const userId = userData.id;
      
      // 构建更新参数，只传递必要字段
      const updateParams = {
        username: userData.username,     // 保持原用户名
        password: values.newPassword     // 新密码
        // 不传递 groupId，让后端保持原有分组
      };
      
      console.log('Password change params:', updateParams);
      
      // 直接调用API，避免使用updateOperator的复杂逻辑
      const response = await fetch(`/api/admin/operators/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          username: userData.username,
          password: values.newPassword
          // 不传递 group_id 字段
        })
      });
      
      const result = await response.json();
      
      if (result.Code === 0) {
        message.success('密码修改成功');
        setPasswordModalVisible(false);
        passwordForm.resetFields();
      } else {
        message.error('密码修改失败：' + result.Message);
      }
    } catch (error) {
      console.error('密码修改失败:', error);
      message.error('密码修改失败，请重试');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handlePasswordModalCancel = () => {
    setPasswordModalVisible(false);
    passwordForm.resetFields();
  };

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(`/${key}`);
  };

  const getSystemTitle = () => {
    return userRole === 'operator' ? 'TikTok 运营系统' : 'TikTok 管理系统';
  };

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        background: '#001529', 
        color: '#fff', 
        padding: '0 24px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between' 
      }}>
        <div style={{ fontSize: 20, fontWeight: 'bold' }}>
          {getSystemTitle()}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 14, color: '#fff' }}>
            {userInfo.role === 'operator' ? '运营人员' : '管理员'} {userInfo.username || '未知用户'}
          </div>
          {/* 仅管理员显示修改密码按钮 */}
          {userInfo.role === 'admin' && (
            <KeyOutlined 
              style={{ fontSize: 18, cursor: 'pointer', color: '#fff' }} 
              onClick={() => setPasswordModalVisible(true)}
              title="修改密码"
            />
          )}
          <LogoutOutlined 
            style={{ fontSize: 18, cursor: 'pointer' }} 
            onClick={handleLogout}
            title="退出登录"
          />
        </div>
      </Header>
      <AntLayout>
        <Sider width={200} style={{ background: '#fff' }}>
          <Menu
            mode="inline"
            selectedKeys={[location.pathname.substring(1)]}
            items={getMenuItems()}
            onClick={handleMenuClick}
            style={{ height: '100%', borderRight: 0 }}
          />
        </Sider>
        <Content style={{ padding: 24, minHeight: 280, background: '#fff' }}>
          <Outlet />
        </Content>
      </AntLayout>
      
      {/* 密码修改Modal */}
      <Modal
        title="修改密码"
        open={passwordModalVisible}
        onOk={handlePasswordChange}
        onCancel={handlePasswordModalCancel}
        confirmLoading={passwordLoading}
        okText="确认修改"
        cancelText="取消"
        destroyOnClose={true}
      >
        <Form
          form={passwordForm}
          layout="vertical"
          autoComplete="off"
        >
          <Form.Item
            name="newPassword"
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码至少6个字符' },
            ]}
          >
            <Input.Password
              placeholder="请输入新密码"
              autoComplete="new-password"
            />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="确认密码"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: '请确认新密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password
              placeholder="请再次输入新密码"
              autoComplete="new-password"
            />
          </Form.Item>
        </Form>
      </Modal>
    </AntLayout>
  );
};

export default Layout; 