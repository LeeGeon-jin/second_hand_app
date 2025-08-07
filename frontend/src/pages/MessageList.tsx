import React, { useState, useEffect } from 'react';
import MobileFooter from '../components/MobileHome/MobileFooter';
const emptyMessageImg = '/empty-message.png';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import axios from 'axios';

interface Chat {
  _id: string;
  participants: {
    _id: string;
    username: string;
    avatar?: string;
  }[];
  lastMessage?: {
    content: string;
    createdAt: string;
    type: 'text' | 'image';
  };
  unreadCount?: number;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #fff;
  align-items: center;
`;

const Title = styled.h1`
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  margin: 0;
  padding: 24px 0 16px 0;
  border-bottom: 1px solid #f0f0f0;
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 10;
  width: 100vw;
`;

const ChatList = styled.div`
  margin-top: 8px;
`;

const ChatItem = styled.div`
  display: flex;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  
  &:active {
    background: #f9f9f9;
  }
`;

const Avatar = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-right: 12px;
`;

const Info = styled.div`
  flex: 1;
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
`;

const Username = styled.span`
  font-size: 16px;
  font-weight: 500;
  color: #333;
`;

const Time = styled.span`
  font-size: 12px;
  color: #999;
`;

const LastMessage = styled.div`
  font-size: 14px;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UnreadBadge = styled.span`
  display: inline-block;
  padding: 0 6px;
  height: 16px;
  line-height: 16px;
  border-radius: 8px;
  background: #ff2442;
  color: #fff;
  font-size: 12px;
  margin-left: 8px;
`;

const MessageList: React.FC = () => {
  const navigate = useNavigate();
  const [chats, setChats] = useState<Chat[]>([]);

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const response = await axios.get('/api/chat');
      setChats(response.data);
    } catch (error) {
      console.error('获取聊天列表失败:', error);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 24 * 60 * 60 * 1000) {
      // 24小时内
      return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    } else if (diff < 7 * 24 * 60 * 60 * 1000) {
      // 一周内
      const days = ['日', '一', '二', '三', '四', '五', '六'];
      return '星期' + days[date.getDay()];
    } else {
      // 超过一周
      return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
    }
  };

  const handleChatClick = (chatId: string) => {
    navigate(`/chat/${chatId}`);
  };

  return (
    <>
      <Container>
        <Title>消息</Title>
        <ChatList>
          {chats.length === 0 ? (
            <div style={{ flex: 1, width: '100vw', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
              <img src={emptyMessageImg} alt="暂时没有消息" style={{ width: 120, opacity: 0.2, marginBottom: 8, display: 'block', marginLeft: 'auto', marginRight: 'auto' }} />
              <div style={{ fontSize: 18, color: '#bbb', marginTop: 8, textAlign: 'center', width: '100%' }}>暂时没有消息</div>
            </div>
          ) : (
            chats.map(chat => {
              const otherUser = chat.participants.find(p => p._id !== '当前用户ID');
              return (
                <ChatItem key={chat._id} onClick={() => handleChatClick(chat._id)}>
                  <Avatar 
                    src={otherUser?.avatar || '/default-avatar.png'} 
                    alt={otherUser?.username} 
                  />
                  <Info>
                    <Header>
                      <Username>
                        {otherUser?.username}
                        {chat.unreadCount ? <UnreadBadge>{chat.unreadCount}</UnreadBadge> : null}
                      </Username>
                      <Time>{chat.lastMessage && formatTime(chat.lastMessage.createdAt)}</Time>
                    </Header>
                    <LastMessage>
                    {chat.lastMessage?.content || '暂时没有消息'}
                    </LastMessage>
                  </Info>
                </ChatItem>
              );
            })
          )}
        </ChatList>
      </Container>
      <MobileFooter />
    </>
  );
};

export default MessageList;
