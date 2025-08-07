import axios from 'axios';

const instance = axios.create({
  baseURL: '/api',
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

export default instance;
