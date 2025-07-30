import React from 'react';
import { Input as AntInput } from 'antd';
import type { InputProps } from 'antd';

const Input: React.FC<InputProps> = (props) => <AntInput {...props} />;

export default Input;
