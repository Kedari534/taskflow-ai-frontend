import React, { useState } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown } from 'antd';
import {
  LayoutDashboard,
  CheckSquare,
  Sparkles,
  User,
  LogOut,
  PlusCircle,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const { Sider, Header, Content } = Layout;

const AppLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { key: '/', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { key: '/tasks', icon: <CheckSquare size={18} />, label: 'My Tasks' },
    // FIX: ai-generator and create-task both go to CreateTask, so one entry is enough
    { key: '/create-task', icon: <Sparkles size={18} />, label: 'AI Assistant' },
    // FIX: Removed Analytics - no route exists for it
  ];

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogOut size={16} />,
      label: 'Logout',
      danger: true,
      onClick: logout,
    },
  ];

  // FIX: Highlight AI Assistant when on either /create-task or /ai-generator
  const selectedKey =
    location.pathname === '/ai-generator' ? '/create-task' : location.pathname;

  return (
    <Layout style={{ minHeight: '100vh', background: '#0a0a0c' }}>
      <Sider
        width={260}
        breakpoint="lg"
        collapsedWidth="0"
        onCollapse={(c) => setCollapsed(c)}
        style={{
          background: '#0e0e12',
          borderRight: '1px solid #27272a',
          position: 'fixed',
          height: '100vh',
          left: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            padding: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              background: 'linear-gradient(135deg, #00f2ff, #7000ff)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundImage: 'linear-gradient(135deg, #00f2ff, #7000ff)',
            }}
          >
            <Sparkles size={20} color="white" />
          </div>
          <span style={{ fontSize: '18px', fontWeight: '700', color: 'white' }}>
            TaskFlow AI
          </span>
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ background: 'transparent', border: 'none', padding: '0 12px' }}
          className="custom-menu"
        />

        <div
          style={{ position: 'absolute', bottom: 0, width: '100%', padding: '20px' }}
        >
          <Button
            type="primary"
            icon={<PlusCircle size={18} />}
            block
            style={{
              height: '45px',
              borderRadius: '8px',
              background: 'linear-gradient(90deg, #00f2ff, #7000ff)',
              border: 'none',
              fontWeight: '600',
            }}
            onClick={() => navigate('/create-task')}
          >
            Create Task
          </Button>
        </div>
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 0 : 260, background: 'transparent', transition: 'margin-left 0.2s cubic-bezier(0.2, 0, 0, 1)' }}>
        <Header
          style={{
            background: 'rgba(10, 10, 12, 0.8)',
            backdropFilter: 'blur(10px)',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            borderBottom: '1px solid #27272a',
            position: 'sticky',
            top: 0,
            zIndex: 99,
          }}
        >
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
              }}
            >
              <div style={{ textAlign: 'right', lineHeight: '1.2' }}>
                <div style={{ color: 'white', fontWeight: '600' }}>{user?.username}</div>
                <div style={{ color: '#a1a1aa', fontSize: '12px' }}>Enterprise User</div>
              </div>
              <Avatar
                icon={<User size={18} />}
                style={{ backgroundColor: '#7000ff' }}
              />
            </div>
          </Dropdown>
        </Header>

        <Content style={{ padding: '32px', minHeight: 280 }}>{children}</Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
