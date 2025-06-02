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
  SettingOutlined,
  LogoutOutlined,
} from '@ant-design/icons';

const { Header, Content, Sider } = AntLayout;

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userRole, setUserRole] = useState<string>('admin'); // 默认admin，后续从token或API获取

  useEffect(() => {
    // 这里可以从token或API获取用户角色
    // 暂时从localStorage获取或默认为admin
    const role = localStorage.getItem('userRole') || 'admin';
    setUserRole(role);
  }, []);

  const getMenuItems = () => {
    if (userRole === 'operator') {
      return [
        {
          key: 'operator',
          icon: <DashboardOutlined />,
          label: '运营中心',
        },
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
          key: 'admin',
          icon: <SettingOutlined />,
          label: '管理中心',
        },
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
      ];
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
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
          <span style={{ fontSize: 14 }}>
            {userRole === 'operator' ? '运营人员' : '管理员'}
          </span>
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