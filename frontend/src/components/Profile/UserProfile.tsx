

import React from 'react';
import { Card, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import MobileFooter from '../MobileHome/MobileFooter';


const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };
  return (
    <>
      <Card title="个人资料" style={{ maxWidth: 400, margin: '40px auto', marginBottom: 80 }}>
        <p>用户名：张三</p>
        <p>邮箱：zhangsan@example.com</p>
        <p>手机号：138****8888</p>
        <p>实名认证：已认证</p>
        <p>信誉分：4.8</p>
        <Button type="primary" danger style={{ marginTop: 32 }} onClick={handleLogout}>
          退出登录
        </Button>
      </Card>
      <MobileFooter />
    </>
  );
};

export default UserProfile;
