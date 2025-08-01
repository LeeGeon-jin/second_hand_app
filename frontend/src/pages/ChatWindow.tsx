import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import axios from 'axios';

interface Message {
  _id: string;
  sender: string;
  content: string;
  type: 'text' | 'image';
  createdAt: string;
}

interface ChatInfo {
  _id: string;
  participants: {
    _id: string;
    username: string;
    avatar?: string;
  }[];
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f7f7f7;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
`;

const BackButton = styled.button`
  border: none;
  background: none;
  padding: 8px;
  cursor: pointer;
  position: absolute;
  left: 8px;
  
  &:active {
    opacity: 0.7;
  }
`;

const Title = styled.h1`
  font-size: 16px;
  font-weight: 500;
  text-align: center;
  flex: 1;
  margin: 0;
`;

const MessageList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
`;

const MessageBubble = styled.div<{ isMine: boolean }>`
  display: flex;
  flex-direction: ${props => props.isMine ? 'row-reverse' : 'row'};
  margin-bottom: 16px;
`;

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin: ${props => props.isMine ? '0 0 0 8px' : '0 8px 0 0'};
`;

const MessageContent = styled.div<{ isMine: boolean }>`
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 16px;
  background: ${props => props.isMine ? '#ff2442' : '#fff'};
  color: ${props => props.isMine ? '#fff' : '#333'};
  font-size: 14px;
  line-height: 1.4;
`;

const InputArea = styled.div`
  padding: 12px 16px;
  background: #fff;
  border-top: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
`;

const Input = styled.input`
  flex: 1;
  border: 1px solid #e5e5e5;
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 14px;
  margin-right: 12px;
  
  &:focus {
    outline: none;
    border-color: #ff2442;
  }
`;

const SendButton = styled.button<{ active: boolean }>`
  border: none;
  background: ${props => props.active ? '#ff2442' : '#ccc'};
  color: #fff;
  padding: 8px 16px;
  border-radius: 16px;
  font-size: 14px;
  cursor: ${props => props.active ? 'pointer' : 'default'};
  
  &:active {
    opacity: ${props => props.active ? 0.8 : 1};
  }
`;

const ChatWindow: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInfo, setChatInfo] = useState<ChatInfo | null>(null);
  const [input, setInput] = useState('');
  const messageListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatId) {
      fetchMessages();
      fetchChatInfo();
    }
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`/api/chat/${chatId}/messages`);
      setMessages(response.data);
    } catch (error) {
      console.error('获取消息失败:', error);
    }
  };

  const fetchChatInfo = async () => {
    try {
      const response = await axios.get(`/api/chat/${chatId}`);
      setChatInfo(response.data);
    } catch (error) {
      console.error('获取聊天信息失败:', error);
    }
  };

  const scrollToBottom = () => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !chatId) return;

    try {
      const response = await axios.post(`/api/chat/${chatId}/messages`, {
        content: input.trim(),
        type: 'text'
      });
      
      setMessages(prev => [...prev, response.data]);
      setInput('');
    } catch (error) {
      console.error('发送消息失败:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const otherUser = chatInfo?.participants.find(p => p._id !== '当前用户ID');

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate(-1)}>
          &lt;
        </BackButton>
        <Title>{otherUser?.username}</Title>
      </Header>
      
      <MessageList ref={messageListRef}>
        {messages.map(message => (
          <MessageBubble key={message._id} isMine={message.sender === '当前用户ID'}>
            <Avatar 
              src={message.sender === '当前用户ID' 
                ? '/my-avatar.png' 
                : otherUser?.avatar || '/default-avatar.png'
              } 
              alt="avatar"
            />
            <MessageContent isMine={message.sender === '当前用户ID'}>
              {message.content}
            </MessageContent>
          </MessageBubble>
        ))}
      </MessageList>
      
      <InputArea>
        <Input
          type="text"
          placeholder="发送消息..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <SendButton active={!!input.trim()} onClick={handleSend}>
          发送
        </SendButton>
      </InputArea>
    </Container>
  );
};

export default ChatWindow;
