import React from 'react';
import { Button as AntButton } from 'antd';
import type { ButtonProps } from 'antd';

const Button: React.FC<ButtonProps> = (props) => <AntButton {...props} />;

export default Button;
