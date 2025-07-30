import React, { useEffect, useState } from 'react';
import { List, Spin, message } from 'antd';
import axios from 'axios';
import ProductCard from './ProductCard';

interface Product {
  _id: string;
  title: string;
  price: number;
}

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios.get<Product[]>('http://localhost:5000/api/products')
      .then(res => setProducts(res.data))
      .catch(() => message.error('获取商品失败'))
      .then(() => setLoading(false));
  }, []);

  return (
    <Spin spinning={loading}>
      <List
        grid={{ gutter: 16, column: 2 }}
        dataSource={products}
        locale={{ emptyText: '暂无商品，快去发布吧！' }}
        renderItem={item => (
          <List.Item>
            <ProductCard product={item} />
          </List.Item>
        )}
      />
    </Spin>
  );
};

export default ProductList;
