import React, { useState, useEffect } from 'react';
import { Toast } from 'antd-mobile';
import './ImageViewer.css';

interface ImageViewerProps {
  images: string[];
  initialIndex: number;
  onClose: () => void;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ images, initialIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // 处理键盘事件
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          handlePrev();
          break;
        case 'ArrowRight':
          handleNext();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex]);

  // 重置缩放和位置
  const resetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // 上一张图片
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      resetView();
    }
  };

  // 下一张图片
  const handleNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
      resetView();
    }
  };

  // 处理图片点击（双击放大/缩小）
  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (scale === 1) {
      setScale(2);
    } else {
      resetView();
    }
  };

  // 处理触摸开始
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      });
    }
  };

  // 处理触摸移动
  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging && scale > 1) {
      e.preventDefault();
      const deltaX = e.touches[0].clientX - dragStart.x;
      const deltaY = e.touches[0].clientY - dragStart.y;
      
      setPosition(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      
      setDragStart({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      });
    }
  };

  // 处理触摸结束
  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // 处理滑动切换图片
  const handleSwipe = (direction: 'left' | 'right') => {
    if (scale === 1) {
      if (direction === 'left') {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  // 保存图片
  const handleSaveImage = async () => {
    try {
      const imageUrl = images[currentIndex];
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `image-${currentIndex + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      Toast.show({ content: '图片已保存' });
    } catch (error) {
      console.error('保存图片失败:', error);
      Toast.show({ content: '保存图片失败' });
    }
  };

  // 处理图片加载错误
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = 'https://via.placeholder.com/400x600/f0f0f0/999999?text=图片加载失败';
  };

  return (
    <div className="image-viewer-overlay" onClick={onClose}>
      {/* 顶部工具栏 */}
      <div className="iv-toolbar">
        <button className="iv-close-btn" onClick={onClose}>
          ✕
        </button>
        <div className="iv-counter">
          {currentIndex + 1} / {images.length}
        </div>
        <button className="iv-save-btn" onClick={handleSaveImage}>
          💾
        </button>
      </div>

      {/* 图片容器 */}
      <div className="iv-image-container">
        <img
          className="iv-image"
          src={images[currentIndex]}
          alt={`图片 ${currentIndex + 1}`}
          style={{
            transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
            cursor: scale > 1 ? 'grab' : 'pointer'
          }}
          onClick={handleImageClick}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onError={handleImageError}
          draggable={false}
        />
      </div>

      {/* 左右导航按钮 */}
      {images.length > 1 && (
        <>
          <button 
            className="iv-nav-btn iv-nav-left"
            onClick={handlePrev}
            disabled={currentIndex === 0}
          >
            ‹
          </button>
          <button 
            className="iv-nav-btn iv-nav-right"
            onClick={handleNext}
            disabled={currentIndex === images.length - 1}
          >
            ›
          </button>
        </>
      )}

      {/* 底部指示器 */}
      {images.length > 1 && (
        <div className="iv-indicators">
          {images.map((_, index) => (
            <div
              key={index}
              className={`iv-indicator ${index === currentIndex ? 'active' : ''}`}
              onClick={() => {
                setCurrentIndex(index);
                resetView();
              }}
            />
          ))}
        </div>
      )}

      {/* 操作提示 */}
      <div className="iv-hints">
        <div className="iv-hint">双击放大/缩小</div>
        <div className="iv-hint">拖拽移动图片</div>
        <div className="iv-hint">左右滑动切换</div>
      </div>
    </div>
  );
};

export default ImageViewer;
