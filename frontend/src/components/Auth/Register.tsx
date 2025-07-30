import React from 'react';
import { Form, Input, Button, message } from 'antd';
import axios from 'axios';

const Register: React.FC = () => {
  const onFinish = async (values: any) => {
    try {
      await axios.post('http://localhost:5000/api/users/register', values);
      message.success('注册成功，请登录');
    } catch (e: any) {
      message.error(e?.response?.data?.message || '注册失败');
    }
  };
  return (
    <Form style={{ maxWidth: 300, margin: '0 auto', marginTop: 60 }} onFinish={onFinish}>
      <Form.Item name="username" label="用户名" rules={[{ required: true }]}> 
        <Input />
      </Form.Item>
      <Form.Item name="email" label="邮箱" rules={[{ required: true, type: 'email' }]}> 
        <Input />
      </Form.Item>
      <Form.Item name="password" label="密码" rules={[{ required: true }]}> 
        <Input.Password />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" block>注册</Button>
      </Form.Item>
    </Form>
  );
};

export default Register;
