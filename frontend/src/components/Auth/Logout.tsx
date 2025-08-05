import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'antd';

const Logout: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <Button type="primary" danger onClick={handleLogout} style={{ width: 200, margin: '40px auto', display: 'block' }}>
      退出登录
    </Button>
  );
};

export default Logout;
