import React from 'react';
import { List, Card, Rate } from 'antd';

const myRatings = [
  { id: 1, to: '李四', score: 5, comment: '交易愉快' },
  { id: 2, to: '王五', score: 4, comment: '准时守信' },
];

const MyRatings: React.FC = () => (
  <Card title="我的评价" style={{ maxWidth: 600, margin: '40px auto' }}>
    <List
      dataSource={myRatings}
      renderItem={item => (
        <List.Item>
          <span>给 {item.to}：<Rate disabled value={item.score} /> {item.comment}</span>
        </List.Item>
      )}
    />
  </Card>
);

export default MyRatings;
