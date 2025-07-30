
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MobileHome from './components/MobileHome/MobileHome';
import Login from './components/Auth/Login';
import './components/MobileHome/MobileHome.css';

const App: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/*" element={<MobileHome />} />
    </Routes>
  </BrowserRouter>
);

export default App;
