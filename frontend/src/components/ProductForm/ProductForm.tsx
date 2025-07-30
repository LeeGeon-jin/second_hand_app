import React from 'react';
import { Form, Input, Button, InputNumber } from 'antd';

const ProductForm: React.FC = () => (
  <Form style={{ maxWidth: 400, margin: '40px auto' }}>
    <Form.Item name="title" label="商品标题" rules={[{ required: true }]}> <Input /> </Form.Item>
    <Form.Item name="price" label="价格" rules={[{ required: true }]}> <InputNumber min={1} style={{ width: '100%' }} /> </Form.Item>
    <Form.Item name="description" label="描述"> <Input.TextArea rows={3} /> </Form.Item>
    <Form.Item>
      <Button type="primary" htmlType="submit" block>发布商品</Button>
    </Form.Item>
  </Form>
);

export default ProductForm;
