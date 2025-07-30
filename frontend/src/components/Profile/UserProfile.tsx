import React from 'react';
import { Card } from 'antd';

const UserProfile: React.FC = () => (
  <Card title="个人资料" style={{ maxWidth: 400, margin: '40px auto' }}>
    <p>用户名：张三</p>
    <p>邮箱：zhangsan@example.com</p>
    <p>手机号：138****8888</p>
    <p>实名认证：已认证</p>
    <p>信誉分：4.8</p>
  </Card>
);

export default UserProfile;
