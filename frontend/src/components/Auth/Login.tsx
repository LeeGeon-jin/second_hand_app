import React, { useState } from 'react';
import { Form, Input, Button, message, Checkbox, Tabs } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../../api';

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
  background: 'none'
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


  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      let res, data: any;
      if (values.type === 'phone') {
        res = await axios.post('/api/users/login/phone', {
          phone: values.phone,
          code: values.code,
          remember: values.remember
        });
        data = res.data;
      } else {
        res = await axios.post('/api/users/login', {
          username: values.username,
          password: values.password,
        });
        data = res.data;
      }
      if (data && data.token) {
        localStorage.setItem('token', data.token || '');
        localStorage.setItem('user', JSON.stringify(data.user));
        if (values.remember) {
          localStorage.setItem('loginExpire', String(Date.now() + 30 * 24 * 60 * 60 * 1000));
        }
        message.success('登录成功');
        navigate(data.redirect || '/');
      } else if (data && data.message === '用户不存在') {
        message.error('该用户不存在');
      } else if (data && data.message === '密码错误') {
        message.error('密码错误');
      } else {
        message.error('登录失败，请重试');
      }
    } catch (e: any) {
      message.error(e?.response?.data?.message || '登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const tabItems = [
    {
      key: 'password',
      label: '密码登录',
      children: (
        <div>
          <Form
            form={form}
            style={formStyle}
            onFinish={onFinish}
            autoComplete="off"
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: '请输入用户名/手机/邮箱' }]}
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
            <Form.Item name="remember" valuePropName="checked">
              <Checkbox>记住登录状态</Checkbox>
            </Form.Item>
            <div style={{ marginBottom: 24 }}>
              <button
                type="button"
                style={linkStyle}
                onClick={() => navigate('/forgot-password')}
              >找回密码</button>
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
        </div>
      )
    },
    {
      key: 'phone',
      label: '验证码登录',
      children: (
        <div>
          <Form
            form={form}
            style={formStyle}
            onFinish={values => onFinish({ ...values, type: 'phone' })}
            autoComplete="off"
          >
            <Form.Item
              name="phone"
              rules={[
                { required: true, message: '请输入手机号' },
                { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
              ]}
            >
              <Input
                style={inputStyle}
                placeholder="手机号"
                size="large"
              />
            </Form.Item>
            <Form.Item
              name="code"
              rules={[{ required: true, message: '请输入验证码' }]}
            >
              <div style={{ display: 'flex', gap: 8 }}>
                <Input
                  style={{ ...inputStyle, flex: 1 }}
                  placeholder="验证码"
                  size="large"
                />
                <Button
                  onClick={async () => {
                    try {
                      const phone = form.getFieldValue('phone');
                      if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
                        message.error('请输入正确的手机号');
                        return;
                      }
                      // 只传手机号，不传图形验证码
                      await api.post('/users/send-code', {
                        phone
                      });
                      message.success('验证码已发送');
                    } catch (error: any) {
                      message.error(error?.response?.data?.message || '发送失败');
                    }
                  }}
                >
                  获取验证码
                </Button>
              </div>
            </Form.Item>
            <Form.Item name="remember" valuePropName="checked">
              <Checkbox>记住登录状态</Checkbox>
            </Form.Item>
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
        </div>
      )
    }
  ];

  return (
    <div>
      <Tabs defaultActiveKey="password" items={tabItems} />
      <button
        type="button"
        style={registerStyle}
        onClick={() => navigate('/register')}
      >新用户注册</button>
    </div>
  );
};

export default Login;
