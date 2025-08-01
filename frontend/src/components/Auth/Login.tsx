import React, { useState, useEffect } from 'react';
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
  const [captcha, setCaptcha] = useState({ id: '', svg: '' });
  const [loginType, setLoginType] = useState('password');
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // 获取图形验证码
  const getCaptcha = async () => {
    try {
      const res = await api.get('/users/captcha');
      setCaptcha(res.data);
    } catch (error) {
      message.error('获取验证码失败');
    }
  };

  useEffect(() => {
    getCaptcha();
  }, []);

  interface LoginRes {
    success?: boolean;
    token?: string;
    user?: any;
    redirect?: string;
    error?: string;
  }

  interface CaptchaRes {
    id: string;
    svg: string;
  }

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const endpoint = values.type === 'phone' ? '/users/login/phone' : '/users/login';
      const data = values.type === 'phone' 
        ? {
            phone: values.phone,
            code: values.code,
            remember: values.remember
          }
        : {
            identifier: values.identifier,
            password: values.password,
            captchaId: captcha.id,
            captchaText: values.captcha,
            remember: values.remember
          };

      const res = await api.post(endpoint, data);
      
      // 登录成功，保存用户数据
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      if (values.remember) {
        // 如果选择记住登录，保存30天
        localStorage.setItem('loginExpire', String(Date.now() + 30 * 24 * 60 * 60 * 1000));
      }
      
      message.success('登录成功');
      navigate('/');
    } catch (e: any) {
      // 登录失败，刷新验证码
      getCaptcha();
      message.error(e?.response?.data?.message || '登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <Tabs
        activeKey={loginType}
        onChange={key => setLoginType(key)}
        centered
        items={[
          {
            key: 'password',
            label: '密码登录',
            children: (
              <Form
                form={form}
                style={formStyle}
                onFinish={onFinish}
                autoComplete="off"
              >
                <Form.Item
                  name="identifier"
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
                <Form.Item
                  name="captcha"
                  rules={[{ required: true, message: '请输入验证码' }]}
                >
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Input
                      style={{ ...inputStyle, flex: 1 }}
                      placeholder="验证码"
                      size="large"
                    />
                    <div
                      style={{ cursor: 'pointer' }}
                      dangerouslySetInnerHTML={{ __html: captcha.svg }}
                      onClick={getCaptcha}
                    />
                  </div>
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
            )
          },
          {
            key: 'phone',
            label: '验证码登录',
            children: (
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
                          const res = await api.post('/users/send-code', {
                            phone,
                            captchaId: captcha.id,
                            captchaText: form.getFieldValue('imageCaptcha')
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
                <Form.Item
                  name="imageCaptcha"
                  rules={[{ required: true, message: '请输入图形验证码' }]}
                >
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Input
                      style={{ ...inputStyle, flex: 1 }}
                      placeholder="图形验证码"
                      size="large"
                    />
                    <div
                      style={{ cursor: 'pointer' }}
                      dangerouslySetInnerHTML={{ __html: captcha.svg }}
                      onClick={getCaptcha}
                    />
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
            )
          }
        ]}
      />
      <button
        type="button"
        style={registerStyle}
        onClick={() => navigate('/register')}
      >新用户注册</button>
    </div>
  );
};

export default Login;
