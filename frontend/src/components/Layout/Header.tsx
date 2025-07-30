import React from 'react';
import { Layout } from 'antd';

const { Header: AntHeader } = Layout;

const Header: React.FC = () => (
  <AntHeader style={{ background: '#1677ff', color: '#fff', fontSize: 20, textAlign: 'center' }}>
    同城二手交易平台
  </AntHeader>
);

export default Header;
