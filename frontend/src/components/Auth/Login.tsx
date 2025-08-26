import React, { useState } from 'react';
import { Form, Input, Button, Toast, Checkbox, Tabs } from 'antd-mobile';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../../api';

const formStyle: React.CSSProperties = {
  maxWidth: 300,
  margin: '0 auto',
  marginTop: 60,
  padding: '0 16px',
  background: 'none',
  border: 'none',
};

const inputStyle: React.CSSProperties = {
  height: 44,
  fontSize: 16,
  border: '1px solid #d9d9d9',
  borderRadius: 6,
  marginBottom: 16,
  paddingLeft: 12,
  background: '#fff'
};

const buttonStyle: React.CSSProperties = {
  width: '100%',
  height: 44,
  fontSize: 16,
  borderRadius: 6,
  margin: '24px auto 0',
  display: 'block',
  background: '#434de7',
  color: '#fff',
  fontWeight: 500,
  border: 'none',
};

const linkStyle: React.CSSProperties = {
  color: '#111',
  fontSize: 14,
  marginBottom: 8,
  display: 'block',
  textAlign: 'left',
  textDecoration: 'underline',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: 0,
};

const registerStyle: React.CSSProperties = {
  color: '#c98a5b',
  fontSize: 16,
  margin: '24px auto 0',
  display: 'block',
  textAlign: 'center',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: 0,
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
        res = await axios.post('https://secondhand-production.up.railway.app/api/users/login/phone', {
          phone: values.phone,
          code: values.code,
          remember: values.remember
        });
        data = res.data;
      } else {
        res = await axios.post('https://secondhand-production.up.railway.app/api/users/login', {
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
        Toast.show({ content: '登录成功' });
        navigate(data.redirect || '/');
      } else if (data && data.message === '用户不存在') {
        Toast.show({ content: '该用户不存在' });
      } else if (data && data.message === '密码错误') {
        Toast.show({ content: '密码错误' });
      } else {
        Toast.show({ content: '登录失败，请重试' });
      }
    } catch (e: any) {
      Toast.show({ content: e?.response?.data?.message || '登录失败，请重试' });
    } finally {
      setLoading(false);
    }
  };



  return (
    <div style={{ padding: '16px 0' }}>
      <Tabs 
        defaultActiveKey="password" 
        style={{ 
          fontSize: '14px',
          '--adm-font-size-main': '14px'
        } as any}
      >
        <Tabs.Tab title="密码登录" key="password">
          <div>
            <Form
              form={form}
              style={formStyle}
              onFinish={onFinish}
            >
              <Form.Item
                name="username"
                rules={[{ required: true, message: '请输入用户名/手机/邮箱' }]}
              >
                <Input
                  style={inputStyle}
                  placeholder="用户名/手机/邮箱"
                  autoComplete="username"
                />
              </Form.Item>
              <Form.Item
                name="password"
                rules={[{ required: true, message: '请输入密码' }]}
              >
                <Input
                  style={inputStyle}
                  placeholder="密码"
                  type="password"
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
                  type="submit"
                  block
                  style={buttonStyle}
                  loading={loading}
                >
                  登录
                </Button>
              </Form.Item>
            </Form>
          </div>
        </Tabs.Tab>
        <Tabs.Tab title="验证码登录" key="phone">
          <div>
            <Form
              form={form}
              style={formStyle}
              onFinish={values => onFinish({ ...values, type: 'phone' })}
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
                  />
                  <Button
                    onClick={async () => {
                      try {
                        const phone = form.getFieldValue('phone');
                        if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
                          Toast.show({ content: '请输入正确的手机号' });
                          return;
                        }
                        // 只传手机号，不传图形验证码
                        await api.post('/users/send-code', {
                          phone
                        });
                        Toast.show({ content: '验证码已发送' });
                      } catch (error: any) {
                        Toast.show({ content: error?.response?.data?.message || '发送失败' });
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
                  type="submit"
                  block
                  style={buttonStyle}
                  loading={loading}
                >
                  登录
                </Button>
              </Form.Item>
            </Form>
          </div>
        </Tabs.Tab>
      </Tabs>
      <button
        type="button"
        style={registerStyle}
        onClick={() => navigate('/register')}
      >新用户注册</button>
    </div>
  );
};

export default Login;
