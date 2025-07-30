import React from 'react';
import { Card, Input, Button, List } from 'antd';

const messages = [
  { id: 1, sender: '我', content: '你好！' },
  { id: 2, sender: '对方', content: '你好，有什么可以帮您？' },
];

const ChatWindow: React.FC = () => (
  <Card title="聊天窗口" style={{ maxWidth: 600, margin: '40px auto' }}>
    <List
      dataSource={messages}
      renderItem={item => (
        <List.Item>
          <span><b>{item.sender}：</b>{item.content}</span>
        </List.Item>
      )}
      style={{ marginBottom: 16 }}
    />
    <Input.Search enterButton="发送" placeholder="输入消息..." />
  </Card>
);

export default ChatWindow;
