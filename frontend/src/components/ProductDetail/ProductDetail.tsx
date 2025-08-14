import React, { useState, useEffect } from 'react';
import { Card, Button, Space, Tag, message, Spin } from 'antd';
import { UserOutlined, EnvironmentOutlined } from '@ant-design/icons';
import TransactionButtons from '../Transaction/TransactionButtons';
import StartTransactionButton from '../Transaction/StartTransactionButton';
import api from '../../api';

interface ProductDetailProps {
  productId?: string;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ productId = '1' }) => {
  const [product, setProduct] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProductDetail();
    fetchCurrentUser();
  }, [productId]);

  const fetchProductDetail = async () => {
    try {
      const response = await api.get(`/products/${productId}`);
      setProduct(response.data);
    } catch (error) {
      message.error('获取商品详情失败');
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await api.get('/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCurrentUser(response.data);
      }
    } catch (error) {
      // 未登录或token失效
    } finally {
      setLoading(false);
    }
  };

  const handleTransactionUpdate = (updatedProduct: any) => {
    setProduct(updatedProduct);
  };

  const getStatusTag = (status: string) => {
    const statusMap = {
      'active': { color: 'green', text: '在售' },
      'pending_completion': { color: 'orange', text: '交易中' },
      'sold': { color: 'red', text: '已售出' },
      'inactive': { color: 'gray', text: '已下架' }
    };
    const config = statusMap[status as keyof typeof statusMap] || { color: 'default', text: '未知' };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!product) {
    return (
      <Card style={{ maxWidth: 600, margin: '40px auto', textAlign: 'center' }}>
        <p>商品不存在或已被删除</p>
      </Card>
    );
  }

  return (
    <Card 
      title={
        <Space>
          {product.title}
          {getStatusTag(product.status)}
        </Space>
      } 
      style={{ maxWidth: 600, margin: '40px auto' }}
    >
      {/* 商品图片 */}
      {product.images && product.images.length > 0 && (
        <div style={{ marginBottom: 16, textAlign: 'center' }}>
          <img 
            src={product.images[0]} 
            alt={product.title}
            style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'cover' }}
          />
        </div>
      )}

      {/* 商品信息 */}
      <div style={{ marginBottom: 16 }}>
        <p><strong>价格：</strong>${product.price} AUD</p>
        <p><strong>分类：</strong>{product.category}</p>
        {product.description && (
          <p><strong>描述：</strong>{product.description}</p>
        )}
        
        {/* 位置信息 */}
        {product.location && (
          <p>
            <EnvironmentOutlined /> 
            {product.location.city} {product.location.district}
          </p>
        )}

        {/* 卖家信息 */}
        <p>
          <UserOutlined /> 
          卖家: {product.seller?.username || '未知用户'}
        </p>

        {/* 买家信息（如果有） */}
        {product.buyer && (
          <p>
            <UserOutlined /> 
            买家: {product.buyer.username}
          </p>
        )}

        {/* 交易时间 */}
        {product.transaction?.completedAt && (
          <p>
            <strong>交易完成时间：</strong>
            {new Date(product.transaction.completedAt).toLocaleString()}
          </p>
        )}
      </div>

      {/* 评分展示 */}
      {product.status === 'sold' && (
        <div style={{ marginBottom: 16 }}>
          {product.transaction?.buyerRating?.score && (
            <div style={{ marginBottom: 8 }}>
              <strong>买家评分：</strong>
              {'⭐'.repeat(product.transaction.buyerRating.score)} 
              ({product.transaction.buyerRating.score}/5)
              {product.transaction.buyerRating.comment && (
                <div style={{ color: '#666', fontSize: '12px', marginTop: 4 }}>
                  {product.transaction.buyerRating.comment}
                </div>
              )}
            </div>
          )}
          
          {product.transaction?.sellerRating?.score && (
            <div style={{ marginBottom: 8 }}>
              <strong>卖家评分：</strong>
              {'⭐'.repeat(product.transaction.sellerRating.score)} 
              ({product.transaction.sellerRating.score}/5)
              {product.transaction.sellerRating.comment && (
                <div style={{ color: '#666', fontSize: '12px', marginTop: 4 }}>
                  {product.transaction.sellerRating.comment}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 操作按钮 */}
      <div style={{ marginTop: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          {/* 开始交易按钮 */}
          <StartTransactionButton
            product={product}
            currentUser={currentUser}
            onTransactionStart={handleTransactionUpdate}
          />

          {/* 交易管理按钮 */}
          <TransactionButtons
            product={product}
            currentUser={currentUser}
            onTransactionUpdate={handleTransactionUpdate}
          />

          {/* 其他操作 */}
          {product.status !== 'sold' && (
            <Space>
              <Button type="default">联系{product.seller._id === currentUser?.id ? '买家' : '卖家'}</Button>
              <Button danger>举报</Button>
            </Space>
          )}
        </Space>
      </div>
    </Card>
  );
};

export default ProductDetail;
