
import React, { useState, useRef } from 'react';
import { Form, Input, Button, message, Select, Space } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const inputStyle: React.CSSProperties = {
  height: 48,
  fontSize: 22,
  border: '3px solid #111',
  borderRadius: 0,
  marginBottom: 32,
  paddingLeft: 12,
  background: 'none',
};
const buttonStyle: React.CSSProperties = {
  width: 180,
  height: 60,
  fontSize: 28,
  borderRadius: 0,
  margin: '40px auto 0',
  display: 'block',
  background: '#003cff',
  color: '#fff',
  fontWeight: 600,
  border: '3px solid #111',
};

const Register: React.FC = () => {
  const [form] = Form.useForm();
  const [checking, setChecking] = useState(false);
  const navigate = useNavigate();

  // 州/领地选项
  const stateOptions = [
    { label: '新南威尔士州', value: 'NSW' },
    { label: '维多利亚州', value: 'VIC' },
    { label: '昆士兰州', value: 'QLD' },
    { label: '西澳大利亚州', value: 'WA' },
    { label: '南澳大利亚州', value: 'SA' },
    { label: '塔斯马尼亚州', value: 'TAS' },
    { label: '澳大利亚首都领地', value: 'ACT' },
    { label: '北领地', value: 'NT' },
    { label: '新西兰', value: 'New Zealand' },
  ];

  // 用户名唯一性校验（失去焦点+防抖）
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const checkUsername = (_: any, value: string) => {
    return new Promise<void>((resolve, reject) => {
      if (!value || value.length < 3) {
        reject('用户名不得少于三个字符');
        return;
      }
      setChecking(true);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        try {
          const res = await axios.get(`/api/users/check-username?username=${encodeURIComponent(value)}`);
          const data = res.data as { exists?: boolean };
          if (data.exists) {
            reject('该用户名已使用');
          } else {
            resolve();
          }
        } catch {
          reject('无法验证用户名');
        } finally {
          setChecking(false);
        }
      }, 400); // 400ms 防抖
    });
  };

  // 禁止粘贴到重复密码框
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    message.warning('请手动输入重复密码');
  };

  // 注册提交
  const onFinish = async (values: any) => {
    try {
      await axios.post('/api/users/register', {
        username: values.username,
        password: values.password,
        email: values.email,
        location: values.suburb && values.state ? {
          city: values.suburb,
          district: values.state
        } : undefined
      });
      message.success('注册完成，请登录');
      setTimeout(() => navigate('/login'), 1000);
    } catch (e: any) {
      message.error(e?.response?.data?.message || '注册失败');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <h1 style={{ textAlign: 'center', marginTop: 60, marginBottom: 40, fontSize: 36 }}>新用户注册</h1>
      <Form
        form={form}
        style={{ maxWidth: 420, margin: '0 auto' }}
        onFinish={onFinish}
        autoComplete="off"
        layout="vertical"
      >
        <Form.Item
          name="username"
          rules={[
            { required: true, message: '请输入用户名' },
            { validator: checkUsername },
          ]}
          validateTrigger="onBlur"
        >
          <Input style={inputStyle} placeholder="用户名" size="large" autoComplete="off" disabled={checking} />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[
            { required: true, message: '请输入密码' },
            { min: 8, message: '密码至少输八位' },
          ]}
        >
          <Input.Password style={inputStyle} placeholder="密码" size="large" autoComplete="new-password" />
        </Form.Item>
        <Form.Item
          name="repeatPassword"
          dependencies={["password"]}
          rules={[
            { required: true, message: '请重复输入密码' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject('两次输入的密码不一致，请修改');
              },
            }),
          ]}
        >
          <Input.Password style={inputStyle} placeholder="重复密码" size="large" autoComplete="new-password" onPaste={handlePaste} />
        </Form.Item>
        <Form.Item
          name="email"
          rules={[
            { required: true, message: '请输入电子邮箱' },
            { type: 'email', message: '请输入正确的电子邮箱格式' },
          ]}
        >
          <Input style={inputStyle} placeholder="电子邮箱" size="large" autoComplete="off" />
        </Form.Item>
        
        {/* 地址信息（可选） */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 16, color: '#333', marginBottom: 16 }}>
            地址信息（可选）
            <span style={{ fontSize: 14, color: '#666', marginLeft: 8 }}>
              💡 用于商品发布时自动填充
            </span>
          </div>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Form.Item name="suburb" style={{ marginBottom: 16 }}>
              <Input 
                style={inputStyle} 
                placeholder="所在城区（如：Bondi, Strathfield等）" 
                size="large" 
              />
            </Form.Item>
            <Form.Item name="state" style={{ marginBottom: 16 }}>
              <Select
                style={{ ...inputStyle, marginBottom: 0 }}
                placeholder="选择州/领地"
                options={stateOptions}
                size="large"
              />
            </Form.Item>
          </Space>
        </div>
        
        <Form.Item>
          <Button type="primary" htmlType="submit" block style={buttonStyle} disabled={checking}>
            注册
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Register;
