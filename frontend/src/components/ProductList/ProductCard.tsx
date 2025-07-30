import React from 'react';
import { Card } from 'antd';

interface ProductCardProps {
  product: { _id?: string; id?: number; title: string; price: number };
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => (
  <Card title={product.title} bordered={false} style={{ width: 300 }}>
    <p>价格：¥{product.price}</p>
    {/* 可扩展更多商品信息 */}
  </Card>
);

export default ProductCard;
