import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Toast, Button, Input, Popup, List } from 'antd-mobile';
import { HeartOutline, HeartFill, MessageOutline, StarOutline, StarFill } from 'antd-mobile-icons';
import api from '../../api';
import ImageViewer from './ImageViewer';
import './ProductDetail.css';

interface ProductDetailProps {
  onClose?: () => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ onClose }) => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isCollected, setIsCollected] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [collectCount, setCollectCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [comments, setComments] = useState<any[]>([]);
  const [showCommentPopup, setShowCommentPopup] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [showImageViewer, setShowImageViewer] = useState(false);

  // 获取产品详情
  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        if (!productId) return;
        
        const response = await api.get(`/products/${productId}`);
        const productData = response.data;
        setProduct(productData);
        
        // 获取评论
        const commentsResponse = await api.get(`/products/${productId}/comments`);
        setComments(commentsResponse.data || []);
        setCommentCount(commentsResponse.data?.length || 0);
        
        // 获取点赞和收藏状态
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const interactionResponse = await api.get(`/products/${productId}/interaction`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const { isLiked, isCollected, likeCount, collectCount } = interactionResponse.data;
            setIsLiked(isLiked);
            setIsCollected(isCollected);
            setLikeCount(likeCount);
            setCollectCount(collectCount);
          } catch (error) {
            console.log('获取交互状态失败，使用默认值');
          }
        }
      } catch (error) {
        console.error('获取产品详情失败:', error);
        Toast.show({ content: '获取产品详情失败' });
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetail();
  }, [productId]);

  // 处理图片滑动
  const handleImageChange = (direction: 'left' | 'right') => {
    if (!product?.images || product.images.length <= 1) return;
    
    if (direction === 'left') {
      setCurrentImageIndex(prev => 
        prev === 0 ? product.images.length - 1 : prev - 1
      );
    } else {
      setCurrentImageIndex(prev => 
        prev === product.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  // 处理点赞
  const handleLike = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        Toast.show({ content: '请先登录' });
        return;
      }

      const response = await api.post(`/products/${productId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    } catch (error) {
      console.error('点赞失败:', error);
      Toast.show({ content: '点赞失败' });
    }
  };

  // 处理收藏
  const handleCollect = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        Toast.show({ content: '请先登录' });
        return;
      }

      const response = await api.post(`/products/${productId}/collect`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setIsCollected(!isCollected);
      setCollectCount(prev => isCollected ? prev - 1 : prev + 1);
    } catch (error) {
      console.error('收藏失败:', error);
      Toast.show({ content: '收藏失败' });
    }
  };

  // 处理私信
  const handleMessage = () => {
    if (!product?.user?._id) return;
    
    const token = localStorage.getItem('token');
    if (!token) {
      Toast.show({ content: '请先登录' });
      return;
    }

    // 创建或获取聊天会话
    api.post('/chat', {
      participantId: product.user._id,
      productId: productId
    }, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(response => {
      const chatId = response.data._id;
      navigate(`/chat/${chatId}`);
    }).catch(error => {
      console.error('创建聊天失败:', error);
      Toast.show({ content: '创建聊天失败' });
    });
  };

  // 复制链接
  const handleShare = async () => {
    const url = `${window.location.origin}/product/${productId}`;
    try {
      await navigator.clipboard.writeText(url);
      Toast.show({ content: '链接已复制到剪贴板' });
    } catch (error) {
      console.error('复制失败:', error);
      Toast.show({ content: '复制失败' });
    }
  };

  // 打开地图
  const handleOpenMap = () => {
    if (!product?.location) {
      Toast.show({ content: '暂无地址信息' });
      return;
    }

    // 使用Google Maps或Apple Maps
    const mapUrl = `https://maps.google.com/?q=${encodeURIComponent(product.location)}`;
    window.open(mapUrl, '_blank');
  };

  // 提交评论
  const handleSubmitComment = async () => {
    if (!newComment.trim()) {
      Toast.show({ content: '请输入评论内容' });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        Toast.show({ content: '请先登录' });
        return;
      }

      const response = await api.post(`/products/${productId}/comments`, {
        content: newComment
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const newCommentData = response.data;
      setComments(prev => [newCommentData, ...prev]);
      setCommentCount(prev => prev + 1);
      setNewComment('');
      setShowCommentPopup(false);
      Toast.show({ content: '评论成功' });
    } catch (error) {
      console.error('评论失败:', error);
      Toast.show({ content: '评论失败' });
    }
  };

  // 跳转到用户主页
  const handleUserClick = (userId: string) => {
    navigate(`/user/${userId}`);
  };

  // 处理图片URL，确保包含完整的API基础URL
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/')) return `https://secondhand-production.up.railway.app${imagePath}`;
    return `https://secondhand-production.up.railway.app/api/upload/uploads/${imagePath}`;
  };

  // 处理图片加载错误
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = 'https://via.placeholder.com/400x600/f0f0f0/999999?text=No+Image';
  };

  // 打开图片查看器
  const handleImageClick = () => {
    const imageUrls = product.images?.map((img: any) => getImageUrl(img)) || [getImageUrl(product.image)];
    if (imageUrls.length > 0) {
      setShowImageViewer(true);
    }
  };

  // 处理触摸事件，检测放大手势
  const [touchStartDistance, setTouchStartDistance] = useState(0);
  const [touchStartTime, setTouchStartTime] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // 双指触摸，计算初始距离
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setTouchStartDistance(distance);
      setTouchStartTime(Date.now());
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStartDistance > 0) {
      // 双指移动，检测放大手势
      const currentDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      
      const scale = currentDistance / touchStartDistance;
      const timeElapsed = Date.now() - touchStartTime;
      
      // 如果放大比例超过1.2且时间小于500ms，进入图片查看器
      if (scale > 1.2 && timeElapsed < 500) {
        e.preventDefault();
        const imageUrls = product.images?.map((img: any) => getImageUrl(img)) || [getImageUrl(product.image)];
        if (imageUrls.length > 0) {
          setShowImageViewer(true);
        }
        setTouchStartDistance(0);
        setTouchStartTime(0);
      }
    }
  };

  const handleTouchEnd = () => {
    setTouchStartDistance(0);
    setTouchStartTime(0);
  };

  if (loading) {
    return (
      <div className="product-detail-loading">
        <div className="loading-spinner"></div>
        <div>加载中...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail-error">
        <div>产品不存在或已被删除</div>
        <Button onClick={() => navigate('/')}>返回首页</Button>
      </div>
    );
  }

  const currentImage = product.images?.[currentImageIndex] || product.image || '';
  const hasMultipleImages = product.images && product.images.length > 1;

  return (
    <div className="product-detail">
      {/* Header */}
      <div className="pd-header">
        <div className="pd-header-left">
          <button 
            className="pd-back-btn"
            onClick={onClose || (() => navigate('/'))}
          >
            ‹
          </button>
          <div 
            className="pd-user-info"
            onClick={() => handleUserClick(product.user._id)}
          >
            <img 
              className="pd-user-avatar" 
              src={getImageUrl(product.user.avatar) || '/default-avatar.svg'} 
              alt={product.user.name}
              onError={(e) => {
                e.currentTarget.src = '/default-avatar.svg';
              }}
            />
            <span className="pd-user-name">{product.user.name}</span>
          </div>
        </div>
        <div className="pd-header-right">
          <button 
            className="pd-message-btn"
            onClick={handleMessage}
          >
            <MessageOutline />
            私信
          </button>
          <button 
            className="pd-share-btn"
            onClick={handleShare}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* 图片区域 */}
      <div className="pd-image-container" onClick={handleImageClick}>
        <img 
          className="pd-main-image" 
          src={getImageUrl(currentImage)} 
          alt={product.title}
          onError={handleImageError}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
        
        {/* 图片指示器 */}
        {hasMultipleImages && (
          <div className="pd-image-indicators">
            {product.images.map((_: any, index: number) => (
              <div 
                key={index}
                className={`pd-indicator ${index === currentImageIndex ? 'active' : ''}`}
              />
            ))}
          </div>
        )}

        {/* 左右滑动按钮 */}
        {hasMultipleImages && (
          <>
            <button 
              className="pd-nav-btn pd-nav-left"
              onClick={() => handleImageChange('left')}
            >
              ‹
            </button>
            <button 
              className="pd-nav-btn pd-nav-right"
              onClick={() => handleImageChange('right')}
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* 内容区域 */}
      <div className="pd-content">
        {/* 标题和价格 */}
        <div className="pd-title-section">
          <h1 className="pd-title">{product.title}</h1>
          <div className="pd-price">${product.price?.toFixed(2)}</div>
        </div>

        {/* 商品描述 */}
        <div className="pd-description">
          <h3>商品描述</h3>
          <p>{product.description || '暂无描述'}</p>
        </div>

        {/* 地址 */}
        {product.location && (
          <div className="pd-location">
            <h3>交易地点</h3>
            <button 
              className="pd-location-btn"
              onClick={handleOpenMap}
            >
              📍 {product.location}
            </button>
          </div>
        )}

        {/* 评论区 */}
        <div className="pd-comments-section">
          <h3>评论 ({commentCount})</h3>
          <div className="pd-comments-list">
            {comments.length === 0 ? (
              <div className="pd-no-comments">暂无评论</div>
            ) : (
              comments.map(comment => (
                <div key={comment._id} className="pd-comment">
                  <div className="pd-comment-header">
                    <img 
                      className="pd-comment-avatar" 
                      src={comment.user.avatar || '/default-avatar.png'} 
                      alt={comment.user.name}
                    />
                    <span className="pd-comment-username">{comment.user.name}</span>
                    <span className="pd-comment-time">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="pd-comment-content">{comment.content}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pd-footer">
        <button 
          className="pd-comment-btn"
          onClick={() => setShowCommentPopup(true)}
        >
          💬 评论
        </button>
        <div className="pd-stats">
          <button 
            className={`pd-collect-btn ${isCollected ? 'collected' : ''}`}
            onClick={handleCollect}
          >
            {isCollected ? <StarFill /> : <StarOutline />}
            <span>{collectCount}</span>
          </button>
          <button 
            className="pd-comments-count-btn"
            onClick={() => {
              const commentsSection = document.querySelector('.pd-comments-section');
              commentsSection?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            💬 {commentCount}
          </button>
        </div>
      </div>

      {/* 评论弹窗 */}
      <Popup
        visible={showCommentPopup}
        onMaskClick={() => setShowCommentPopup(false)}
        position="bottom"
        bodyStyle={{ borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
      >
        <div className="pd-comment-popup">
          <div className="pd-comment-popup-header">
            <span>发表评论</span>
            <button 
              className="pd-comment-close-btn"
              onClick={() => setShowCommentPopup(false)}
            >
              ✕
            </button>
          </div>
          <div className="pd-comment-input-container">
            <Input
              value={newComment}
              onChange={setNewComment}
              placeholder="写下你的评论..."
              style={{ border: 'none', background: 'transparent' }}
            />
          </div>
          <Button 
            className="pd-comment-submit-btn"
            onClick={handleSubmitComment}
            disabled={!newComment.trim()}
          >
            发表评论
          </Button>
                 </div>
       </Popup>

       {/* 图片查看器 */}
       {showImageViewer && (
         <ImageViewer
           images={product.images?.map((img: any) => getImageUrl(img)) || [getImageUrl(product.image)]}
           initialIndex={currentImageIndex}
           onClose={() => setShowImageViewer(false)}
         />
       )}
     </div>
   );
 };

export default ProductDetail;
