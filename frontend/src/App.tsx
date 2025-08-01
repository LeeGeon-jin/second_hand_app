
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MobileHome from './components/MobileHome/MobileHome';
import MessageList from './pages/MessageList';
import ChatWindow from './pages/ChatWindow';
import Login from './components/Auth/Login';
import './components/MobileHome/MobileHome.css';

const App: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/messages" element={<MessageList />} />
      <Route path="/chat/:chatId" element={<ChatWindow />} />
      <Route path="/*" element={<MobileHome />} />
    </Routes>
  </BrowserRouter>
);

export default App;
