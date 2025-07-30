import React from 'react';
import { List, Card } from 'antd';

const chatList = [
  { id: 1, with: '李四', lastMessage: '明天见！' },
  { id: 2, with: '王五', lastMessage: '好的，谢谢！' },
];

const ChatList: React.FC = () => (
  <Card title="聊天列表" style={{ maxWidth: 600, margin: '40px auto' }}>
    <List
      dataSource={chatList}
      renderItem={item => (
        <List.Item>
          <span>与 {item.with}：{item.lastMessage}</span>
        </List.Item>
      )}
    />
  </Card>
);

export default ChatList;
