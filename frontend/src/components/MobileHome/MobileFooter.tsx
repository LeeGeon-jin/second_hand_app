import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';


const MobileFooter: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');
  return (
    <div className="mh-footer">
      <div
        className={`mh-footer-item${location.pathname === '/' ? ' active' : ''}`}
        onClick={() => navigate('/')}
      >首页</div>
      <div
        className="mh-footer-item mh-footer-add"
        onClick={() => {
          if (!isLoggedIn) navigate('/login');
          else window.dispatchEvent(new CustomEvent('showPostPopup'));
        }}
      >+</div>
      <div
        className={`mh-footer-item${location.pathname === '/messages' ? ' active' : ''}`}
        onClick={() => {
          if (!isLoggedIn) navigate('/login');
          else navigate('/messages');
        }}
      >消息</div>
      <div
        className={`mh-footer-item${location.pathname === '/profile' ? ' active' : ''}`}
        onClick={() => {
          if (!isLoggedIn) navigate('/login');
          else navigate('/profile');
        }}
      >我</div>
    </div>
  );
};

export default MobileFooter;
