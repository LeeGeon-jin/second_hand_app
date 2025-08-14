import React, { useState } from 'react';
import { Button, Modal, message } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { startTransaction } from '../../api/transaction';

interface StartTransactionButtonProps {
  product: any;
  currentUser: any;
  onTransactionStart?: (product: any) => void;
}

const StartTransactionButton: React.FC<StartTransactionButtonProps> = ({
  product,
  currentUser,
  onTransactionStart
}) => {
  const [loading, setLoading] = useState(false);

  const isSeller = product.seller._id === currentUser?.id;
  const canPurchase = product.status === 'active' && !isSeller && currentUser;

  const handleStartTransaction = () => {
    Modal.confirm({
      title: '确认购买',
      content: (
        <div>
          <p>您确定要购买这个商品吗？</p>
          <p><strong>商品：</strong>{product.title}</p>
          <p><strong>价格：</strong>${product.price} AUD</p>
          <p style={{ color: '#666', fontSize: '12px' }}>
            点击确认后，您需要与卖家协商具体的交易细节，
            交易完成后双方都需要确认才能完成整个交易流程。
          </p>
        </div>
      ),
      onOk: async () => {
        try {
          setLoading(true);
          const result = await startTransaction(product._id) as any;
          message.success(result.message);
          onTransactionStart?.(result.product);
        } catch (error: any) {
          message.error(error.response?.data?.message || '开始交易失败');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  if (!canPurchase) {
    return null;
  }

  return (
    <Button
      type="primary"
      size="large"
      icon={<ShoppingCartOutlined />}
      onClick={handleStartTransaction}
      loading={loading}
      block
    >
      立即购买
    </Button>
  );
};

export default StartTransactionButton;
