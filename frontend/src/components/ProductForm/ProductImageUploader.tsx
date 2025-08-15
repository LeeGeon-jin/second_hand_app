import React from 'react';
import { ImageUploader, Toast } from 'antd-mobile';

interface ProductImageUploaderProps {
  value?: string[];
  onChange?: (files: string[]) => void;
}

const ProductImageUploader: React.FC<ProductImageUploaderProps> = ({ value = [], onChange }) => {
  // 过滤掉blob URL，只保留有效的服务器URL
  const validImages = value.filter(url => !url.startsWith('blob:'));
  
  console.log('ImageUploader - 接收到的图片:', value);
  console.log('ImageUploader - 过滤后的图片:', validImages);
  
  return (
    <div>
      <div style={{ 
        marginBottom: 12, 
        padding: '12px 16px', 
        background: '#fff7e6', 
        border: '1px solid #ffd591', 
        borderRadius: 8,
        color: '#d46b08',
        fontSize: 14,
        fontWeight: 500
      }}>
        📸 <strong>必须上传商品图片</strong> - 至少上传1张，最多9张
      </div>
      <ImageUploader
        value={validImages.map(url => ({ url }))}
        upload={async (file) => {
          try {
            console.log('开始上传图片:', file.name, file.size, file.type);
            
            // 创建FormData
            const formData = new FormData();
            formData.append('image', file);
            
            console.log('FormData创建完成，准备发送请求');
            
            // 调用后端上传API
            const response = await fetch('https://secondhand-production.up.railway.app/api/upload/image', {
              method: 'POST',
              body: formData,
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            });
            
            console.log('上传响应状态:', response.status, response.statusText);
            
            if (!response.ok) {
              const errorText = await response.text();
              console.error('上传失败，响应内容:', errorText);
              throw new Error(`上传失败: ${response.status} ${response.statusText}`);
            }
            
            const result = await response.json();
            console.log('上传成功，返回结果:', result);
            
            // 强制返回服务器URL，不使用blob URL
            const serverUrl = result.url;
            console.log('返回服务器URL:', serverUrl);
            
            return { 
              url: serverUrl,
              // 添加额外属性确保ImageUploader使用服务器URL
              status: 'done',
              thumbUrl: serverUrl
            };
          } catch (error) {
            console.error('图片上传失败:', error);
            Toast.show({ content: '图片上传失败' });
            throw new Error('上传失败');
          }
        }}
        onChange={items => {
          console.log('ImageUploader onChange 被调用，items:', items);
          const urls = items.map(i => {
            // 优先使用thumbUrl，如果没有则使用url
            const imageUrl = (i as any).thumbUrl || i.url;
            console.log('处理图片项:', i, '使用URL:', imageUrl);
            return imageUrl;
          });
          console.log('最终提取的URLs:', urls);
          onChange?.(urls);
        }}
        multiple
        maxCount={9}
        showUpload={value.length < 9}
        preview
        style={{
          '--cell-size': '80px',
        } as React.CSSProperties}
      />
    </div>
  );
};

export default ProductImageUploader;
