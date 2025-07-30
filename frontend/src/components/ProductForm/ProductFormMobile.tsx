import React, { useState } from 'react';
import { Form, Input, TextArea, Button, Toast, Selector } from 'antd-mobile';
import ProductImageUploader from './ProductImageUploader';
import api from '../../api';

const ProductFormMobile: React.FC = () => {
  const [images, setImages] = useState<string[]>([]);
  const [form] = Form.useForm();

  const handleSubmit = async (values: any) => {
    if (images.length === 0) {
      Toast.show({ content: '请先上传至少一张图片' });
      return;
    }
    try {
      const res = await api.post('/products', {
        ...values,
        images,
        description: values.desc,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = res.data as { auditFailed?: boolean; message?: string };
      if (data.auditFailed) {
        // 审核不通过，保存草稿
        const draft = {
          ...values,
          images,
          description: values.desc,
          savedAt: Date.now(),
        };
        localStorage.setItem('product-draft', JSON.stringify(draft));
        Toast.show({ content: (data.message || '内容未通过AI审核') + '，商品仅本人和管理员可见，已保存为本地草稿' });
      } else {
        Toast.show({ content: '发布成功，已通过AI审核' });
      }
      form.resetFields();
      setImages([]);
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new Event('product-posted'));
      }
    } catch (e: any) {
      // 审核不通过时，保存草稿到本地
      if (e?.response?.data?.message && e.response.data.message.includes('审核')) {
        const draft = {
          ...values,
          images,
          description: values.desc,
          savedAt: Date.now(),
        };
        localStorage.setItem('product-draft', JSON.stringify(draft));
        Toast.show({ content: '内容未通过AI审核，已保存为本地草稿，仅自己可见' });
      } else {
        Toast.show({ content: e?.response?.data?.message || '发布失败' });
      }
    }
  };

  // 分类选项可后端动态获取
  const categoryOptions = [
    { label: '家具', value: '家具' },
    { label: '电器', value: '电器' },
    { label: '电子', value: '电子' },
    { label: '文具', value: '文具' },
    { label: '服饰', value: '服饰' },
    { label: '运动', value: '运动' },
    { label: '母婴', value: '母婴' },
    { label: '美妆', value: '美妆' },
    { label: '乐器', value: '乐器' },
    { label: '图书', value: '图书' },
    { label: '宠物', value: '宠物' },
    { label: '其他', value: '其他' },
  ];
  return (
    <div style={{ padding: 16 }}>
      <ProductImageUploader value={images} onChange={setImages} />
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        footer={
          <div style={{ display: 'flex', gap: 12 }}>
            <Button
              style={{ flex: 1, background: '#f5f5f5', color: '#666', border: 'none' }}
              onClick={async () => {
                const values = await form.validateFields().catch(() => undefined);
                if (!values) return;
                if (images.length === 0) {
                  Toast.show({ content: '请先上传至少一张图片' });
                  return;
                }
                const draft = {
                  ...values,
                  images,
                  description: values.desc,
                  savedAt: Date.now(),
                };
                localStorage.setItem('product-draft', JSON.stringify(draft));
                Toast.show({ content: '已保存为本地草稿，仅自己和管理员可见' });
              }}
            >保存草稿</Button>
            <Button block type="submit" color="primary" style={{ flex: 2 }}>发布商品</Button>
          </div>
        }
      >
        <Form.Item name="title" label="商品标题" rules={[{ required: true, message: '请输入标题' }]}> <Input placeholder="如：九成新小米手机" /> </Form.Item>
        <Form.Item name="category" label="商品类别" rules={[{ required: true, message: '请选择类别' }]}> <Selector options={categoryOptions} columns={6} /> </Form.Item>
        <Form.Item name="price" label="价格" rules={[{ required: true, message: '请输入价格' }]}> <Input type="number" placeholder="请输入价格" /> </Form.Item>
        <Form.Item name="desc" label="商品描述"> <TextArea rows={3} placeholder="可填写成色、交易地点等" /> </Form.Item>
      </Form>
    </div>
  );
};

export default ProductFormMobile;
