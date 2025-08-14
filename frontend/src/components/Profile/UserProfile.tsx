

import React from 'react';
import { Card, Button, List } from 'antd';
import { 
  ShoppingOutlined, 
  StarOutlined, 
  MessageOutlined, 
  HistoryOutlined,
  LogoutOutlined,
  RightOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import MobileFooter from '../MobileHome/MobileFooter';
import '../MobileHome/MobileFooter.css';

const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    {
      title: '我的商品',
      icon: <ShoppingOutlined />,
      description: '管理我发布的商品',
      onClick: () => navigate('/my-products')
    },
    {
      title: '我的评价',
      icon: <StarOutlined />,
      description: '查看收到的评价和评分',
      onClick: () => navigate('/my-ratings')
    },
    {
      title: '消息记录',
      icon: <MessageOutlined />,
      description: '查看所有聊天记录',
      onClick: () => navigate('/my-chats')
    },
    {
      title: '交易记录',
      icon: <HistoryOutlined />,
      description: '查看买卖交易历史',
      onClick: () => navigate('/transaction-history')
    }
  ];

  return (
    <>
      <div style={{ padding: '20px', paddingBottom: '80px' }}>
        {/* 用户信息卡片 */}
        <Card 
          style={{ 
            maxWidth: 400, 
            margin: '0 auto 20px auto',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#1890ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              fontSize: '32px',
              color: 'white'
            }}>
              张
            </div>
            <h3 style={{ margin: '0 0 8px 0' }}>张三</h3>
            <p style={{ margin: '0', color: '#999' }}>zhangsan@example.com</p>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-around', 
              marginTop: '20px',
              padding: '16px 0',
              borderTop: '1px solid #f0f0f0'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1890ff' }}>4.8</div>
                <div style={{ fontSize: '12px', color: '#999' }}>信誉分</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#52c41a' }}>15</div>
                <div style={{ fontSize: '12px', color: '#999' }}>成功交易</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#722ed1' }}>8</div>
                <div style={{ fontSize: '12px', color: '#999' }}>在售商品</div>
              </div>
            </div>
          </div>
        </Card>

        {/* 菜单列表 */}
        <Card 
          style={{ 
            maxWidth: 400, 
            margin: '0 auto 20px auto',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          <List
            dataSource={menuItems}
            split={false}
            renderItem={(item) => (
              <List.Item 
                onClick={item.onClick}
                style={{ 
                  cursor: 'pointer',
                  padding: '16px 0',
                  borderRadius: '8px',
                  margin: '4px 0'
                }}
              >
                <List.Item.Meta
                  avatar={
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: '#f6f6f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      color: '#1890ff'
                    }}>
                      {item.icon}
                    </div>
                  }
                  title={<span style={{ fontSize: '16px', fontWeight: '500' }}>{item.title}</span>}
                  description={<span style={{ color: '#999', fontSize: '14px' }}>{item.description}</span>}
                />
                <RightOutlined style={{ color: '#ccc' }} />
              </List.Item>
            )}
          />
        </Card>

        {/* 退出登录 */}
        <Card 
          style={{ 
            maxWidth: 400, 
            margin: '0 auto',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          <Button 
            type="primary" 
            danger 
            size="large"
            block
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            style={{ 
              borderRadius: '8px',
              height: '48px',
              fontSize: '16px'
            }}
          >
            退出登录
          </Button>
        </Card>
      </div>
      
      <MobileFooter />
    </>
  );
};

export default UserProfile;
