import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getMessages, sendMessage } from '../api';
import './ChatWindow.css';

interface Message {
  _id: string;
  sender: { _id: string; username: string; avatar?: string };
  content: string;
  type: string;
  createdAt: string;
}

const ChatWindow: React.FC = () => {
  const { chatId } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatId) {
      getMessages(chatId).then(setMessages);
    }
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !chatId) return;
    const msg = await sendMessage(chatId, input);
    setMessages([...messages, msg.data]);
    setInput('');
  };

  return (
    <div className="chat-window-root">
      <div className="chat-header">聊天</div>
      <div className="chat-messages">
        {messages.map(msg => (
          <div
            className={`chat-message-bubble ${msg.type === 'text' ? '' : 'image'}`}
            key={msg._id}
          >
            <img className="avatar" src={msg.sender.avatar || '/default-avatar.png'} alt={msg.sender.username} />
            <div className="bubble-content">{msg.content}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input-bar">
        <input
          className="chat-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="请输入内容..."
        />
        <button className="send-btn" onClick={handleSend}>发送</button>
      </div>
    </div>
  );
};

export default ChatWindow;
