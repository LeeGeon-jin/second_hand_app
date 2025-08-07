import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './components/MobileHome/MobileHome.css';
import MobileHome from './components/MobileHome/MobileHome';
import MessageList from './pages/MessageList';
import ChatWindow from './pages/ChatWindow';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import UserProfile from './components/Profile/UserProfile.tsx';
import ProductFormMobile from './components/ProductForm/ProductFormMobile';
import { Popup } from 'antd-mobile';

const App: React.FC = () => {
  const [showPost, setShowPost] = useState(false);
  useEffect(() => {
    const handler = () => setShowPost(true);
    window.addEventListener('showPostPopup', handler);
    return () => window.removeEventListener('showPostPopup', handler);
  }, []);

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/messages" element={<MessageList />} />
          <Route path="/chat/:chatId" element={<ChatWindow />} />
          <Route path="/*" element={<MobileHome />} />
        </Routes>
      </BrowserRouter>
      <Popup
        visible={showPost}
        onMaskClick={() => setShowPost(false)}
        position="bottom"
        bodyStyle={{ borderTopLeftRadius: 16, borderTopRightRadius: 16, minHeight: '60vh' }}
      >
        <ProductFormMobile />
      </Popup>
    </>
  );
};

export default App;
