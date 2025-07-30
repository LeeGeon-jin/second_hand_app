import React from 'react';
import { Layout } from 'antd';

const { Footer: AntFooter } = Layout;

const Footer: React.FC = () => (
  <AntFooter style={{ textAlign: 'center' }}>
    © 2025 同城二手交易平台
  </AntFooter>
);

export default Footer;
