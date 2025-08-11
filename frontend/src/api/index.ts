import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://secondhand-production.up.railway.app/api',
  timeout: 10000,
});


// 获取所有会话
export async function getChats() {
  const res = await instance.get('/chat');
  return res.data;
}

// 获取某会话的消息
export async function getMessages(chatId: string) {
  const res = await instance.get(`/chat/${chatId}/messages`);
  return res.data;
}

// 发送消息
export async function sendMessage(chatId: string, content: string) {
  const res = await instance.post(`/chat/${chatId}/messages`, { content });
  return res.data;
}

// 获取所有商品
export async function getProducts() {
  const res = await instance.get('/products');
  return res.data;
}

// 获取单个商品
export async function getProduct(id: string) {
  const res = await instance.get(`/products/${id}`);
  return res.data;
}

// 创建商品
export async function createProduct(productData: any) {
  const res = await instance.post('/products', productData);
  return res.data;
}

// 更新商品
export async function updateProduct(id: string, productData: any) {
  const res = await instance.put(`/products/${id}`, productData);
  return res.data;
}

// 删除商品
export async function deleteProduct(id: string) {
  const res = await instance.delete(`/products/${id}`);
  return res.data;
}

export default instance;
