import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const formStyle: React.CSSProperties = {
  maxWidth: 340,
  margin: '0 auto',
  marginTop: 120,
  padding: 0,
  background: 'none',
  border: 'none',
};

const inputStyle: React.CSSProperties = {
  height: 60,
  fontSize: 32,
  border: '3px solid #111',
  borderRadius: 0,
  marginBottom: 40,
  paddingLeft: 16,
  background: 'none',
};

const buttonStyle: React.CSSProperties = {
  width: 260,
  height: 80,
  fontSize: 36,
  borderRadius: 30,
  margin: '60px auto 0',
  display: 'block',
  background: '#434de7',
  color: '#fff',
  fontWeight: 600,
  border: 'none',
};

const linkStyle: React.CSSProperties = {
  color: '#111',
  fontSize: 20,
  marginBottom: 8,
  display: 'block',
  textAlign: 'left',
  textDecoration: 'underline',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
};

const registerStyle: React.CSSProperties = {
  color: '#c98a5b',
  fontSize: 28,
  margin: '32px auto 0',
  display: 'block',
  textAlign: 'center',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
};

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  interface LoginRes {
    success?: boolean;
    token?: string;
    user?: any;
    redirect?: string;
    error?: string;
  }

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      // 支持用户名/手机号/邮箱登录
      const res = await axios.post('/api/users/login', {
        username: values.username,
        password: values.password,
      });
      const data = res.data as LoginRes;
      if (data && data.token) {
        // 登录成功，保存用户数据并跳转
        localStorage.setItem('token', data.token || '');
        localStorage.setItem('user', JSON.stringify(data.user));
        message.success('登录成功');
        navigate(data.redirect || '/');
      } else if (data && data.message === '用户不存在') {
        message.error('该用户不存在');
      } else if (data && data.message === '密码错误') {
        message.error('密码错误');
      } else {
        message.error('登录失败，请重试');
      }
    } catch (e) {
      message.error('网络错误，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <Form
        form={form}
        style={formStyle}
        onFinish={onFinish}
        autoComplete="off"
      >
        <Form.Item
          name="username"
          rules={[{ required: true, message: '请输入用户名/手机号/邮箱' }]}
        >
          <Input
            style={inputStyle}
            placeholder="用户名/手机/邮箱"
            size="large"
            autoComplete="username"
          />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: '请输入密码' }]}
        >
          <Input.Password
            style={inputStyle}
            placeholder="密码"
            size="large"
            autoComplete="current-password"
          />
        </Form.Item>
        <div style={{ marginBottom: 24 }}>
          <button
            type="button"
            style={linkStyle}
            onClick={() => navigate('/forgot-password')}
          >找回密码</button>
          <button
            type="button"
            style={linkStyle}
            onClick={() => navigate('/login-sms')}
          >手机验证码登录</button>
        </div>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            style={buttonStyle}
            loading={loading}
          >
            登录
          </Button>
        </Form.Item>
      </Form>
      <button
        type="button"
        style={registerStyle}
        onClick={() => navigate('/register')}
      >新用户注册</button>
    </div>
  );
};

export default Login;
