import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getChats } from '../api';
import './MessageList.css';

interface User {
  _id: string;
  username: string;
  avatar?: string;
}

interface Chat {
  _id: string;
  participants: User[];
  lastMessageAt: string;
  messages: any[];
}

const MessageList: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    getChats().then(setChats);
  }, []);

  return (
    <div className="message-list-root">
      <h2 className="message-title">消息</h2>
      <div className="message-list">
        {chats.map(chat => {
          // 假设当前用户id存储在localStorage.tokenUserId
          const myId = localStorage.getItem('tokenUserId') || '';
          const other = chat.participants.find(u => u._id !== myId) || chat.participants[0];
          // 取最后一条消息
          const lastMsg = chat.messages && chat.messages.length > 0 ? chat.messages[chat.messages.length - 1] : null;
          // mock未读逻辑：如有lastMsg且lastMsg.read为false则显示红点（实际应由后端返回未读数）
          const hasUnread = lastMsg && !lastMsg.read && lastMsg.sender !== myId;
          return (
            <div
              className="message-item"
              key={chat._id}
              onClick={() => navigate(`/chat/${chat._id}`)}
            >
              <img
                className="avatar"
                src={other.avatar || '/default-avatar.png'}
                alt={other.username}
              />
              <div className="message-info">
                <div className="message-user-row">
                  <span className="username">{other.username}</span>
                  <span className="message-time">
                    {lastMsg ? new Date(lastMsg.createdAt || chat.lastMessageAt).toLocaleDateString() : ''}
                  </span>
                </div>
                <div className="message-preview">
                  {lastMsg ? lastMsg.content : '暂无消息'}
                </div>
              </div>
              {hasUnread && <span className="msg-unread-dot" />} 
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MessageList;
