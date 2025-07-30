import React from 'react';
import { Card, Button } from 'antd';

const ProductDetail: React.FC = () => (
  <Card title="商品详情" style={{ maxWidth: 500, margin: '40px auto' }}>
    <p>商品名称：二手手机</p>
    <p>价格：¥800</p>
    <p>描述：成色九成新，支持同城面交。</p>
    <Button type="primary">联系卖家</Button>
    <Button danger style={{ marginLeft: 8 }}>举报</Button>
  </Card>
);

export default ProductDetail;
