import React, { useState, useEffect } from 'react';
import { Card, List, Button, Tag, Space, Pagination, message, Spin, Select } from 'antd';
import { ShoppingOutlined, DollarOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { getTransactionList } from '../../api/transaction';

const { Option } = Select;

const TransactionHistory: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchTransactions();
  }, [pagination.current, statusFilter]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await getTransactionList({
        status: statusFilter === 'all' ? undefined : statusFilter,
        page: pagination.current,
        limit: pagination.pageSize
      });
      
      setTransactions(response.products);
      setPagination(prev => ({
        ...prev,
        total: response.pagination.total
      }));
    } catch (error: any) {
      message.error('获取交易记录失败');
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (status: string) => {
    const statusMap = {
      'active': { color: 'green', text: '在售' },
      'pending_completion': { color: 'orange', text: '交易中' },
      'sold': { color: 'red', text: '已完成' },
      'inactive': { color: 'gray', text: '已下架' }
    };
    const config = statusMap[status as keyof typeof statusMap] || { color: 'default', text: '未知' };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getRoleTag = (product: any, currentUserId: string) => {
    const isSellerRole = product.seller._id === currentUserId;
    return (
      <Tag color={isSellerRole ? 'blue' : 'green'}>
        {isSellerRole ? '卖家' : '买家'}
      </Tag>
    );
  };

  const getTransactionProgress = (product: any, currentUserId: string) => {
    if (product.status !== 'pending_completion') return null;

    const isBuyer = product.buyer?._id === currentUserId;
    const isSeller = product.seller._id === currentUserId;
    
    const userConfirmed = isBuyer 
      ? product.transaction?.buyerConfirmed 
      : product.transaction?.sellerConfirmed;
    
    const otherUserConfirmed = isBuyer 
      ? product.transaction?.sellerConfirmed 
      : product.transaction?.buyerConfirmed;

    return (
      <div style={{ fontSize: '12px', color: '#666' }}>
        <p>您：{userConfirmed ? '✅ 已确认' : '⏳ 未确认'}</p>
        <p>{isBuyer ? '卖家' : '买家'}：{otherUserConfirmed ? '✅ 已确认' : '⏳ 未确认'}</p>
      </div>
    );
  };

  const getRatingInfo = (product: any, currentUserId: string) => {
    if (product.status !== 'sold') return null;

    const isBuyer = product.buyer?._id === currentUserId;
    const userRating = isBuyer 
      ? product.transaction?.buyerRating 
      : product.transaction?.sellerRating;
    
    const otherRating = isBuyer 
      ? product.transaction?.sellerRating 
      : product.transaction?.buyerRating;

    return (
      <div style={{ fontSize: '12px', color: '#666' }}>
        <p>我的评分：{userRating?.score ? `${userRating.score}⭐` : '未评分'}</p>
        <p>对方评分：{otherRating?.score ? `${otherRating.score}⭐` : '未评分'}</p>
      </div>
    );
  };

  return (
    <Card 
      title="我的交易记录" 
      style={{ maxWidth: 800, margin: '20px auto' }}
      extra={
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 120 }}
        >
          <Option value="all">全部状态</Option>
          <Option value="active">在售</Option>
          <Option value="pending_completion">交易中</Option>
          <Option value="sold">已完成</Option>
          <Option value="inactive">已下架</Option>
        </Select>
      }
    >
      <Spin spinning={loading}>
        <List
          dataSource={transactions}
          renderItem={(product: any) => {
            // 假设当前用户ID，实际使用时需要从context或props获取
            const currentUserId = localStorage.getItem('userId') || '';
            
            return (
              <List.Item
                key={product._id}
                actions={[
                  <Button 
                    type="link" 
                    onClick={() => window.location.href = `/products/${product._id}`}
                  >
                    查看详情
                  </Button>
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <div style={{ textAlign: 'center' }}>
                      {product.status === 'sold' ? 
                        <CheckCircleOutlined style={{ fontSize: 24, color: '#52c41a' }} /> :
                        <ShoppingOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                      }
                    </div>
                  }
                  title={
                    <Space>
                      {product.title}
                      {getStatusTag(product.status)}
                      {getRoleTag(product, currentUserId)}
                    </Space>
                  }
                  description={
                    <div>
                      <p>
                        <DollarOutlined /> ${product.price} AUD
                        {product.buyer && (
                          <span style={{ marginLeft: 16 }}>
                            交易对象: {product.buyer._id === currentUserId ? 
                              product.seller.username : 
                              product.buyer.username
                            }
                          </span>
                        )}
                      </p>
                      
                      {getTransactionProgress(product, currentUserId)}
                      {getRatingInfo(product, currentUserId)}
                      
                      <p style={{ color: '#999', fontSize: '12px' }}>
                        发布时间: {new Date(product.createdAt).toLocaleDateString()}
                        {product.transaction?.completedAt && (
                          <span style={{ marginLeft: 16 }}>
                            完成时间: {new Date(product.transaction.completedAt).toLocaleDateString()}
                          </span>
                        )}
                      </p>
                    </div>
                  }
                />
              </List.Item>
            );
          }}
          pagination={false}
        />
        
        {transactions.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Pagination
              current={pagination.current}
              pageSize={pagination.pageSize}
              total={pagination.total}
              onChange={(page) => setPagination(prev => ({ ...prev, current: page }))}
              showSizeChanger={false}
              showQuickJumper
              showTotal={(total) => `共 ${total} 条记录`}
            />
          </div>
        )}
        
        {transactions.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            暂无交易记录
          </div>
        )}
      </Spin>
    </Card>
  );
};

export default TransactionHistory;
