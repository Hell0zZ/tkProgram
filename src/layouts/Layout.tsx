import React, { useState, useEffect } from 'react';
import { Layout as AntLayout, Menu } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  TeamOutlined,
  GroupOutlined,
  GlobalOutlined,
  UserOutlined,
  BarChartOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import * as operatorService from '@/services/operator';

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
    </AntLayout>
  );
};

export default Layout; 