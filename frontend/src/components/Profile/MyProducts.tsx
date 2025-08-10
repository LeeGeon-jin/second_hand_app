import React, { useEffect, useState } from 'react';
import { Card, List, Spin, message } from 'antd';
import api from '../../api';

const MyProducts: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await api.get('/users/me', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setProducts((res.data as any).postedProducts || []);
      } catch {
        message.error('获取我的商品失败');
      }
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <Card title="我发布的商品" style={{ maxWidth: 600, margin: '40px auto' }}>
      {loading ? <Spin /> : (
        <List
          dataSource={products}
          renderItem={item => (
            <List.Item>
              <span>{item.title} - ¥{item.price}</span>
            </List.Item>
          )}
        />
      )}
    </Card>
  );
};

export default MyProducts;
