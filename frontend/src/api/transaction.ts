// 交易相关API
import api from './index';

// 交易接口类型
export interface TransactionRequest {
  productId: string;
}

export interface RatingRequest {
  productId: string;
  score: number;
  comment?: string;
}

export interface TransactionListResponse {
  products: any[];
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
}

// 开始交易
export const startTransaction = async (productId: string) => {
  const response = await api.post(`/transactions/start/${productId}`);
  return response.data;
};

// 确认交易完成
export const confirmTransaction = async (productId: string) => {
  const response = await api.post(`/transactions/confirm/${productId}`);
  return response.data;
};

// 取消交易
export const cancelTransaction = async (productId: string) => {
  const response = await api.post(`/transactions/cancel/${productId}`);
  return response.data;
};

// 评分
export const rateTransaction = async (data: RatingRequest) => {
  const { productId, ...ratingData } = data;
  const response = await api.post(`/transactions/rate/${productId}`, ratingData);
  return response.data;
};

// 获取交易记录
export const getTransactionList = async (params: {
  status?: string;
  page?: number;
  limit?: number;
} = {}) => {
  const response = await api.get('/transactions/my-transactions', { params });
  return response.data as TransactionListResponse;
};

// 商品管理
export const deactivateProduct = async (productId: string) => {
  const response = await api.put(`/products/${productId}/deactivate`);
  return response.data;
};

export const reactivateProduct = async (productId: string) => {
  const response = await api.put(`/products/${productId}/reactivate`);
  return response.data;
};

export const deleteProduct = async (productId: string) => {
  const response = await api.delete(`/products/${productId}`);
  return response.data;
};
