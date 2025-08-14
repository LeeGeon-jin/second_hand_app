import React, { useState } from 'react';
import { Button, Modal, message, Rate, Input, Space } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, StarOutlined } from '@ant-design/icons';
import { confirmTransaction, cancelTransaction, rateTransaction } from '../../api/transaction';

const { TextArea } = Input;

interface TransactionButtonsProps {
  product: any;
  currentUser: any;
  onTransactionUpdate?: (product: any) => void;
}

const TransactionButtons: React.FC<TransactionButtonsProps> = ({
  product,
  currentUser,
  onTransactionUpdate
}) => {
  const [loading, setLoading] = useState(false);
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingComment, setRatingComment] = useState('');

  const isBuyer = product.buyer?._id === currentUser?.id;
  const isSeller = product.seller._id === currentUser?.id;
  const isParticipant = isBuyer || isSeller;

  // 确认交易完成
  const handleConfirmTransaction = async () => {
    try {
      setLoading(true);
      const result = await confirmTransaction(product._id) as any;
      message.success(result.message);
      onTransactionUpdate?.(result.product);
    } catch (error: any) {
      message.error(error.response?.data?.message || '确认交易失败');
    } finally {
      setLoading(false);
    }
  };

  // 取消交易
  const handleCancelTransaction = () => {
    Modal.confirm({
      title: '确认取消交易',
      content: '取消后商品将重新上架，确定要取消这笔交易吗？',
      onOk: async () => {
        try {
          setLoading(true);
          const result = await cancelTransaction(product._id) as any;
          message.success(result.message);
          onTransactionUpdate?.(result.product);
        } catch (error: any) {
          message.error(error.response?.data?.message || '取消交易失败');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // 提交评分
  const handleSubmitRating = async () => {
    try {
      setLoading(true);
      const result = await rateTransaction({
        productId: product._id,
        score: ratingScore,
        comment: ratingComment
      }) as any;
      message.success(result.message);
      setRatingModalVisible(false);
      setRatingComment('');
      onTransactionUpdate?.(result.product);
    } catch (error: any) {
      message.error(error.response?.data?.message || '评分失败');
    } finally {
      setLoading(false);
    }
  };

  if (!isParticipant) {
    return null;
  }

  // 已完成交易的状态
  if (product.status === 'sold') {
    const hasRated = isBuyer 
      ? product.transaction?.buyerRating?.score
      : product.transaction?.sellerRating?.score;

    return (
      <Space>
        <Button type="primary" icon={<CheckCircleOutlined />} disabled>
          交易已完成
        </Button>
        {!hasRated && (
          <Button 
            type="default" 
            icon={<StarOutlined />}
            onClick={() => setRatingModalVisible(true)}
          >
            评分
          </Button>
        )}
        {hasRated && (
          <span style={{ color: '#52c41a' }}>已评分</span>
        )}

        {/* 评分弹窗 */}
        <Modal
          title="商品评分"
          open={ratingModalVisible}
          onCancel={() => setRatingModalVisible(false)}
          onOk={handleSubmitRating}
          confirmLoading={loading}
          okText="提交评分"
        >
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <p>请为这次交易中的商品评分：</p>
            <Rate 
              value={ratingScore} 
              onChange={setRatingScore}
              style={{ fontSize: 24 }}
            />
          </div>
          <TextArea
            rows={3}
            placeholder="分享您对这个商品的体验..."
            value={ratingComment}
            onChange={(e) => setRatingComment(e.target.value)}
            maxLength={200}
            showCount
          />
        </Modal>
      </Space>
    );
  }

  // 等待确认的状态
  if (product.status === 'pending_completion') {
    const userConfirmed = isBuyer 
      ? product.transaction?.buyerConfirmed 
      : product.transaction?.sellerConfirmed;
    
    const otherUserConfirmed = isBuyer 
      ? product.transaction?.sellerConfirmed 
      : product.transaction?.buyerConfirmed;

    return (
      <Space>
        {!userConfirmed ? (
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={handleConfirmTransaction}
            loading={loading}
          >
            确认交易完成
          </Button>
        ) : (
          <Button type="primary" icon={<CheckCircleOutlined />} disabled>
            已确认完成
          </Button>
        )}

        <Button
          danger
          icon={<CloseCircleOutlined />}
          onClick={handleCancelTransaction}
          loading={loading}
        >
          取消交易
        </Button>

        {userConfirmed && !otherUserConfirmed && (
          <span style={{ color: '#1890ff' }}>
            等待{isBuyer ? '卖家' : '买家'}确认...
          </span>
        )}
      </Space>
    );
  }

  return null;
};

export default TransactionButtons;
