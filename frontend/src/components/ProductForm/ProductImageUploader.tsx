import React from 'react';
import { ImageUploader, Toast } from 'antd-mobile';

interface ProductImageUploaderProps {
  value?: string[];
  onChange?: (files: string[]) => void;
}

const ProductImageUploader: React.FC<ProductImageUploaderProps> = ({ value = [], onChange }) => {
  return (
    <ImageUploader
      value={value.map(url => ({ url }))}
      upload={async (file) => {
        try {
          // 模拟上传，实际应调用后端API
          return { url: URL.createObjectURL(file) };
        } catch {
          Toast.show({ content: '图片上传失败' });
          throw new Error('上传失败');
        }
      }}
      onChange={items => onChange?.(items.map(i => i.url))}
      multiple
      maxCount={9}
      showUpload={value.length < 9}
      preview
    />
  );
};

export default ProductImageUploader;
