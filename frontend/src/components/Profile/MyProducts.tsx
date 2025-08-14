import React, { useEffect, useState } from 'react';
import { Card, List, Spin, message, Button, Space, Tag, Modal } from 'antd';
import { EditOutlined, DeleteOutlined, EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import api from '../../api';
import { deactivateProduct, reactivateProduct, deleteProduct } from '../../api/transaction';

const MyProducts: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users/me', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setProducts((res.data as any).postedProducts || []);
    } catch {
      message.error('获取我的商品失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (productId: string) => {
    try {
      await deactivateProduct(productId);
      message.success('商品已下架');
      fetchProducts();
    } catch (error: any) {
      message.error(error.response?.data?.message || '下架失败');
    }
  };

  const handleReactivate = async (productId: string) => {
    try {
      await reactivateProduct(productId);
      message.success('商品已重新上架');
      fetchProducts();
    } catch (error: any) {
      message.error(error.response?.data?.message || '上架失败');
    }
  };

  const handleDelete = (productId: string, productTitle: string) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除商品"${productTitle}"吗？此操作不可撤销。`,
      onOk: async () => {
        try {
          await deleteProduct(productId);
          message.success('商品已删除');
          fetchProducts();
        } catch (error: any) {
          message.error(error.response?.data?.message || '删除失败');
        }
      }
    });
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

  const getActionButtons = (product: any) => {
    const buttons: React.ReactNode[] = [];

    if (product.status === 'active') {
      buttons.push(
        <Button
          key="deactivate"
          type="default"
          size="small"
          icon={<EyeInvisibleOutlined />}
          onClick={() => handleDeactivate(product._id)}
        >
          下架
        </Button>
      );
    }

    if (product.status === 'inactive') {
      buttons.push(
        <Button
          key="reactivate"
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleReactivate(product._id)}
        >
          上架
        </Button>
      );
    }

    if (product.status !== 'pending_completion' && product.status !== 'sold') {
      buttons.push(
        <Button
          key="delete"
          type="primary"
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(product._id, product.title)}
        >
          删除
        </Button>
      );
    }

    if (product.status === 'active' || product.status === 'inactive') {
      buttons.push(
        <Button
          key="edit"
          type="default"
          size="small"
          icon={<EditOutlined />}
          onClick={() => {
            // 编辑功能，可以跳转到编辑页面
            message.info('编辑功能待实现');
          }}
        >
          编辑
        </Button>
      );
    }

    return buttons;
  };

  return (
    <Card title="我发布的商品" style={{ maxWidth: 800, margin: '40px auto' }}>
      {loading ? (
        <Spin />
      ) : (
        <List
          dataSource={products}
          renderItem={(product: any) => (
            <List.Item
              key={product._id}
              actions={getActionButtons(product)}
            >
              <List.Item.Meta
                title={
                  <Space>
                    {product.title}
                    {getStatusTag(product.status)}
                  </Space>
                }
                description={
                  <div>
                    <p>价格: ${product.price} AUD</p>
                    {product.buyer && (
                      <p>买家: {product.buyer.username}</p>
                    )}
                    {product.transaction?.completedAt && (
                      <p>完成时间: {new Date(product.transaction.completedAt).toLocaleDateString()}</p>
                    )}
                    <p style={{ color: '#999', fontSize: '12px' }}>
                      发布时间: {new Date(product.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}
      
      {products.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          您还没有发布任何商品
        </div>
      )}
    </Card>
  );
};

export default MyProducts;
